'use strict';
// Private bridge. exports.browser validates byte-exact canonical HTML before launch.
// No business-controlled destination, download, navigation, package install or network.
const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');
(async()=>{
 const mode=process.argv[2];
 if(!['pdf','panels','proof','probe'].includes(mode))throw Error('Unsupported export mode');
 const input=fs.readFileSync(0);
 if(input.length>32*1024*1024)throw Error('Bridge input too large');
 if(!process.env.DV_EXPORT_PYTHON)throw Error('Use the canonical exports.browser entry point');
 const checked=spawnSync(process.env.DV_EXPORT_PYTHON,[path.join(__dirname,'export_gate.py')],{input,timeout:30000,maxBuffer:1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
 if(checked.error||checked.status!==0)throw Error('Canonical HTML gate refused: '+(checked.stderr||'').toString().slice(0,1000));
 const html=JSON.parse(input.toString('utf8')).document;
 if(!process.env.DV_NODE_MODULES)throw Error('DV_NODE_MODULES must select the reviewed host dependency directory');
 const {chromium}=require(path.join(process.env.DV_NODE_MODULES,'playwright'));
 const browser=await chromium.launch({headless:true,...(process.env.DV_CHROMIUM?{executablePath:process.env.DV_CHROMIUM}:{})});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,serviceWorkers:'block',acceptDownloads:false});
  const requests=[];await context.route('**/*',route=>{requests.push(route.request().url());return route.abort();});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setContent(html,{waitUntil:'load'});await page.waitForSelector('html[data-ready="true"]');
  await page.evaluate(()=>document.fonts.ready);
  if(errors.length||requests.length)throw Error('Unexpected code error or network attempt');
  if(mode==='pdf'){
   // Apple system CJK fallback aliases 日 to the Kangxi radical in ToUnicode.
   // The host's existing Arial Unicode MS maps tested CJK code points exactly.
   // No font binary is copied into this package or requested from a network.
   await page.evaluate(()=>{for(const node of document.querySelectorAll('*'))node.style.fontFamily='Arial Unicode MS';});
   await page.evaluate(()=>document.fonts.ready);
   const pdf=await page.pdf({printBackground:true,preferCSSPageSize:true});process.stdout.write(JSON.stringify({pdf:pdf.toString('base64')}));
  }else if(mode==='panels'){
   const panels=[];const count=await page.locator('.panel').count();
   if(count<1||count>6)throw Error('Unexpected panel count');
   for(let i=0;i<count;i++){
    const panel=page.locator('.panel').nth(i);const box=await panel.boundingBox();
    if(!box||box.width>4096||box.height>32768||box.width*box.height>32*1024*1024)throw Error('Panel exceeds raster bounds');
    panels.push({png:(await panel.screenshot({animations:'disabled',caret:'hide'})).toString('base64')});
   }
   process.stdout.write(JSON.stringify({panels}));
  }else if(mode==='proof'){
   const image=await page.screenshot({fullPage:true,animations:'disabled',caret:'hide'});process.stdout.write(JSON.stringify({png:image.toString('base64')}));
  }else{process.stdout.write(JSON.stringify({ready:true,errors,requests,counts:await page.locator('#counts').textContent(),browser:browser.version()}));}
  if(errors.length||requests.length)throw Error('Unexpected code error or network attempt');
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{process.stderr.write(e.stack+'\n');process.exitCode=1;});
