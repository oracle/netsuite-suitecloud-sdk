'use strict';
(() => {
  const payload = JSON.parse(document.getElementById('snapshot').textContent);
  const m = payload.model, original = m.rows.map((r,i)=>({r,i}));
  const col = Object.fromEntries(m.columns.map(c=>[c.key,c]));
  const root = document.getElementById('view');
  function node(tag, value, parent, cls) {
    const e=document.createElement(tag); if(value!==null)e.textContent=String(value);
    if(cls)e.className=cls; if(parent)parent.appendChild(e); return e;
  }
  function svg(tag, attributes, parent, value) {
    const e=document.createElementNS('http://www.w3.org/2000/svg',tag);
    for(const [k,v] of Object.entries(attributes)) e.setAttribute(k,String(v));
    if(value!==undefined)e.textContent=String(value); if(parent)parent.appendChild(e); return e;
  }
  function linked(parent, value, i, key) {
    const j=m.references.findIndex(r=>r.row===i&&r.column===key);
    if(j>=0 && payload.links[j]) {
      const a=node('a',value,parent); a.setAttribute('href',payload.links[j]);
      a.setAttribute('target','_blank');a.setAttribute('rel','noopener noreferrer');
    } else node('span',value,parent);
  }
  const header=node('header',null,root);node('p','Data Visualization · Supplied snapshot',header,'eyebrow');
  node('h1',m.title,header);node('p',m.question,header);
  const meta=node('section',null,root,'scope');
  node('h2','Scope and evidence',meta);
  const s=m.source;
  node('p',`${s.status.toUpperCase()} · ${s.completeness} population · ${m.rows.length} retrieved rows` ,meta,'status');
  node('p',`${s.label} · Retrieved ${s.retrieved_at} · ${s.scope}`,meta);
  node('p',`Source filters: ${s.filters.join('; ')||'None stated'} · Grain: ${s.grain.map(k=>col[k].label).join(' + ')}`,meta);
  node('p','Local controls reuse this snapshot. Fresh data requires a new supported connector retrieval.',meta);
  node('p','Values are plotted at their supplied row grain. No local summation, currency conversion or unit conversion.',meta);
  for(const c of m.columns.filter(c=>c.type==='number'))node('p',`${c.label}: ${c.unit}${c.currency?' · '+c.currency:''}`,meta);
  for(const v of s.limitations)node('p',v,meta,'limitation');
  if(payload.links.some(x=>!x)||!m.references.length)node('p','Some or all references are plain text: trustworthy account binding or a supported route is unavailable.',meta,'limitation');
  if(payload.links.some(Boolean))node('p','Links were checked for structure and source binding. Account permissions and successful navigation were not tested.',meta);
  const controls=node('section',null,root,'controls');node('label','Search supplied rows ',controls).setAttribute('for','search');
  const search=node('input',null,controls);search.id='search';search.type='search';
  node('label','Filter first grain field ',controls).setAttribute('for','filter');
  const filter=node('select',null,controls);filter.id='filter';node('option','All supplied rows',filter).value='';
  [...new Set(original.map(x=>String(x.r[s.grain[0]])))].sort().forEach(v=>{node('option',v,filter).value=v;});
  const sort=node('button','Sort measure: descending',controls);sort.type='button';sort.id='sort';
  const count=node('p','',root);count.id='counts';count.setAttribute('aria-live','polite');
  const panels=node('main',null,root);const detail=node('section',null,root);node('h2','Snapshot detail',detail);
  const table=node('table',null,detail);node('caption','Exact supplied values; same local filters as charts',table);
  const tr=node('tr',null,node('thead',null,table));m.columns.forEach(c=>node('th',c.label,tr).scope='col');node('th','Drill-down',tr).scope='col';
  const tbody=node('tbody',null,table);let descending=true;
  const number=v=>Number.isInteger(v)?new Intl.NumberFormat('en-US').format(v):String(v);
  const palette=['#245D63','#A55326','#645487','#477236','#AA3F51','#356AA0','#8B671E','#665751'];
  const rowLabel=o=>s.grain.map(k=>String(o.r[k])).join(' / ');
  function paintMark(tag, attributes, parent, row, key, label, color){
    const mark=svg(tag,{...attributes,class:'mark',fill:color,'data-row-index':row.i,'data-series-key':key},parent);
    svg('title',{},mark,`${rowLabel(row)} · ${label}: ${row.r[key]} ${col[key].unit}`);return mark;
  }
  function drawChart(c,rows,section){
    const series=c.series||[{key:c.y,label:col[c.y].label}], measures=series.map(e=>e.key);
    node('p',`${measures.map(k=>col[k].label).join(', ')} (${col[c.y].unit}) by ${col[c.x].label} · marks retain supplied row values`,section);
    if(!rows.length){node('p','No rows match the local filters.',section);return;}
    if(c.type==='table'){node('p','See the synchronized exact-value table below.',section);return;}
    if(c.type==='kpi'){node('p',number(rows[0].r[c.y])+' '+col[c.y].unit,section,'kpi');return;}
    if(series.length>1)node('p',series.map((e,j)=>`${j+1}. ${e.label} [${e.key}]`).join(' · '),section);
    const sourceOrder=['pie','donut','funnel','waterfall'].includes(c.type);
    const dateAxis=['line','area','combination'].includes(c.type);
    const rr=sourceOrder?[...rows].sort((a,b)=>a.i-b.i):dateAxis?[...rows].sort((a,b)=>a.r[c.x].localeCompare(b.r[c.x])):rows;
    const positionKeys=['scatter','bubble'].includes(c.type)?[c.x]:[];
    if(c.type==='bubble')positionKeys.push(c.size);
    if(!['pie','donut','waterfall'].includes(c.type)&&rr.every(o=>[...measures,...positionKeys].every(k=>o.r[k]===0))){
      node('p','All supplied values are zero; see the exact-value table.',section);return;
    }
    const horizontal=['bar','funnel','waterfall','stacked'].includes(c.type);
    const radial=c.type==='pie'||c.type==='donut';
    const height=horizontal?Math.max(230,rr.length*(c.type==='bar'?Math.max(38,series.length*23+12):40)+80):radial?Math.max(380,rr.length*22+55):380;
    const chart=svg('svg',{viewBox:`0 0 850 ${height}`,role:'img','aria-label':c.title},section);
    svg('title',{},chart,c.title+'; exact supplied values in the synchronized table');
    const left=225,right=775,top=series.length>1?65:35,bottom=height-65;
    if(series.length>1)series.forEach((e,j)=>{
      const x=left+j*136;svg('rect',{x,y:32,width:11,height:11,fill:palette[j]},chart);
      const t=svg('text',{x:x+16,y:42,class:'axis'},chart,e.label.length>14?e.label.slice(0,11)+'…':e.label);svg('title',{},t,e.label+' ['+e.key+']');
    });
    const values=rr.flatMap(o=>measures.map(k=>o.r[k]));
    if(c.type==='waterfall')values.push(...rr.flatMap(o=>[o.r[c.start],o.r[c.end]]));
    if(c.type==='stacked')values.push(...rr.flatMap(o=>series.flatMap(e=>[o.r[e.start],o.r[e.end]])));
    const min=Math.min(0,...values),max=Math.max(0,...values),span=max-min||1;
    const xp=v=>left+(v-min)/span*(right-left),yp=v=>bottom-(v-min)/span*(bottom-top);
    function axis(orientation){
      for(let i=0;i<=4;i++){
        const value=min+i*span/4, pos=orientation==='horizontal'?xp(value):yp(value);
        svg('line',orientation==='horizontal'?{x1:pos,y1:top,x2:pos,y2:bottom,class:'grid'}:{x1:left,y1:pos,x2:right,y2:pos,class:'grid'},chart);
        svg('text',orientation==='horizontal'?{x:pos,y:height-35,'text-anchor':'middle',class:'axis'}:{x:left-12,y:pos+4,'text-anchor':'end',class:'axis'},chart,number(value));
      }
      if(orientation==='horizontal')svg('text',{x:(left+right)/2,y:height-9,'text-anchor':'middle',class:'axis'},chart,col[c.y].label+' ('+col[c.y].unit+')');
      else svg('text',{x:left,y:16,class:'axis'},chart,col[c.y].label+' ('+col[c.y].unit+')');
    }
    function rowText(o,y){
      const label=String(o.r[c.x]),t=svg('text',{x:8,y:y+18,class:'axis'},chart,label.length>28?label.slice(0,25)+'…':label);
      svg('title',{},t,rowLabel(o));
    }
    if(c.type==='pie'||c.type==='donut'){
      node('p','Supplied complete shares; local filters leave omitted segments blank. Shares are not renormalized.',section);
      const denominator=col[c.y].unit==='percent'?100:1,visible=new Set(rr.map(o=>o.i));
      const cx=280,cy=190,radius=145,inner=c.type==='donut'?75:0;
      let angle=-Math.PI/2,legendY=40;
      // Angles are layout of source shares against a fixed 1/100 denominator, never local totals.
      for(const o of original){
        const sweep=o.r[c.y]/denominator*Math.PI*2,end=angle+sweep;
        if(visible.has(o.i)){
          const color=palette[o.i%palette.length],point=(a,r)=>`${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`;
          const mid=angle+sweep/2;
          let d;
          if(sweep>=Math.PI*2-1e-10){
            d=`M ${point(angle,radius)} A ${radius},${radius} 0 1 1 ${point(mid,radius)} A ${radius},${radius} 0 1 1 ${point(end,radius)}`;
            if(inner)d+=` L ${point(end,inner)} A ${inner},${inner} 0 1 0 ${point(mid,inner)} A ${inner},${inner} 0 1 0 ${point(angle,inner)} Z`;
            else d+=` L ${cx},${cy} Z`;
          }else{
            const arc=`A ${radius},${radius} 0 ${sweep>Math.PI?1:0} 1 ${point(end,radius)}`;
            d=inner?`M ${point(angle,radius)} ${arc} L ${point(end,inner)} A ${inner},${inner} 0 ${sweep>Math.PI?1:0} 0 ${point(angle,inner)} Z`:`M ${cx},${cy} L ${point(angle,radius)} ${arc} Z`;
          }
          paintMark('path',{d,'fill-rule':'evenodd'},chart,o,c.y,col[c.y].label,color);
          svg('rect',{x:475,y:legendY-12,width:12,height:12,fill:color},chart);
          const label=String(o.r[c.x]),t=svg('text',{x:495,y:legendY,class:'axis'},chart,`${label.length>24?label.slice(0,21)+'…':label}: ${o.r[c.y]} ${col[c.y].unit}`);
          svg('title',{},t,label);legendY+=22;
        }
        angle=end;
      }
      return;
    }
    if(c.type==='funnel'){
      node('p','Stages retain supplied source order; widths use the largest supplied stage. No conversion rates are inferred.',section);
      const sourceMax=Math.max(...original.map(o=>o.r[c.y])),center=(left+right)/2;
      rr.forEach((o,j)=>{
        const width=o.r[c.y]/sourceMax*(right-left),y=top+j*40;
        rowText(o,y);paintMark('rect',{x:center-width/2,y,width,height:28},chart,o,c.y,col[c.y].label,palette[0]);
        svg('text',{x:right+10,y:y+20,class:'axis'},chart,number(o.r[c.y]));
      });return;
    }
    if(horizontal){
      axis('horizontal');
      const stride=c.type==='bar'?Math.max(38,series.length*23+12):40;
      if(c.type==='waterfall')node('p','Step positions and endpoints are supplied source values. Omitted steps are not reconnected; no running total is computed.',section);
      if(c.type==='stacked')node('p','Stack positions use supplied contiguous start/end values. No local series total is computed.',section);
      rr.forEach((o,j)=>{
        const y=top+j*stride;rowText(o,y);
        series.forEach((entry,k)=>{
          const start=c.type==='waterfall'?o.r[c.start]:c.type==='stacked'?o.r[entry.start]:0;
          const end=c.type==='waterfall'?o.r[c.end]:c.type==='stacked'?o.r[entry.end]:o.r[entry.key];
          const markY=y+(c.type==='bar'?k*23:0),a=xp(start),b=xp(end);
          const mark=paintMark('rect',{x:Math.min(a,b),y:markY,width:Math.max(0,Math.abs(b-a)),height:c.type==='bar'?19:27},chart,o,entry.key,entry.label,palette[k]);
          if(c.type==='bar'||c.type==='waterfall')svg('text',{x:b+(end<start?-6:6),y:markY+15,'text-anchor':end<start?'end':'start',class:'axis'},chart,number(o.r[entry.key]));
          if(c.type==='waterfall'){
            mark.firstChild.textContent+=` · supplied start ${start}; supplied end ${end}`;
            if(j<rr.length-1&&rr[j+1].i===o.i+1)svg('line',{x1:b,y1:markY+27,x2:b,y2:markY+stride,class:'grid'},chart);
          }
        });
      });return;
    }
    axis('vertical');
    const xs=rr.map(o=>dateAxis?Date.parse(o.r[c.x]+'T00:00:00Z'):o.r[c.x]);
    const xmin=Math.min(...xs),xmax=Math.max(...xs),pad=c.type==='combination'?35:12;
    const xx=v=>left+pad+(xmax===xmin?.5:(v-xmin)/(xmax-xmin))*(right-left-2*pad);
    const xpositions=xs.map(xx);
    if(dateAxis)node('p','Lines and filled areas connect visible observed points; intervening dates and missing observations are not inferred.',section);
    const barSeries=series.filter(e=>e.render==='bar');
    const sortedPositions=[...xpositions].sort((a,b)=>a-b);
    const gaps=sortedPositions.slice(1).map((v,i)=>v-sortedPositions[i]);
    const minGap=gaps.length?Math.min(...gaps):right-left;
    const barWidth=Math.min(38,minGap*.7)/(barSeries.length||1);
    series.forEach((entry,k)=>{
      const color=palette[k],points=rr.map((o,i)=>`${xpositions[i]},${yp(o.r[entry.key])}`),render=entry.render||c.type;
      if(render==='area'){
        const baseline=yp(0),d=`M ${xpositions[0]},${baseline} L ${points.join(' L ')} L ${xpositions.at(-1)},${baseline} Z`;
        svg('path',{d,fill:color,'fill-opacity':.16,stroke:'none'},chart);
      }
      if(['line','area'].includes(render))svg('polyline',{points:points.join(' '),fill:'none',stroke:color,'stroke-width':2},chart);
      rr.forEach((o,i)=>{
        if(render==='bar'){
          const x=xpositions[i]+(barSeries.indexOf(entry)-barSeries.length/2)*barWidth;
          paintMark('rect',{x,y:Math.min(yp(o.r[entry.key]),yp(0)),width:barWidth*.9,height:Math.abs(yp(o.r[entry.key])-yp(0))},chart,o,entry.key,entry.label,color);
        }else{
          const radius=c.type==='bubble'?Math.sqrt(o.r[c.size]/Math.max(...original.map(o=>o.r[c.size])))*27:5;
          const mark=paintMark('circle',{cx:xpositions[i],cy:yp(o.r[entry.key]),r:radius,'fill-opacity':c.type==='bubble'?.65:1,stroke:color},chart,o,entry.key,entry.label,color);
          if(c.type==='bubble')mark.firstChild.textContent+=` · ${col[c.size].label}: ${o.r[c.size]} ${col[c.size].unit} (circle area)`;
        }
      });
    });
    // Axis ticks are unique, numerically ordered positions even when table sorting differs.
    const sorted=[...new Set(xs)].sort((a,b)=>a-b),ticks=sorted.length<=4?sorted:[sorted[0],sorted.at(-1)];
    ticks.forEach(v=>svg('text',{x:xx(v),y:height-35,'text-anchor':'middle',class:'axis'},chart,dateAxis?new Date(v).toISOString().slice(0,10):number(v)));
    svg('text',{x:(left+right)/2,y:height-9,'text-anchor':'middle',class:'axis'},chart,col[c.x].label+(col[c.x].unit?' ('+col[c.x].unit+')':''));
  }
  function draw(rows){
    panels.replaceChildren();tbody.replaceChildren();count.textContent=`${rows.length} visible / ${m.rows.length} retrieved rows · local snapshot`;
    for(const c of m.charts){
      const section=node('section',null,panels,'panel');section.dataset.chartType=c.type;node('h2',c.title,section);drawChart(c,rows,section);
    }
    for(const {r,i} of rows){const tr=node('tr',null,tbody);for(const c of m.columns)linked(node('td',null,tr),r[c.key],i,c.key);
      const d=node('details',null,node('td',null,tr));node('summary','Inspect row',d);for(const c of m.columns)node('p',c.label+': '+r[c.key],d);
    }
  }
  function update(){const term=search.value.toLocaleLowerCase();let rows=original.filter(({r})=>(!filter.value||String(r[s.grain[0]])===filter.value)&&Object.values(r).some(v=>String(v).toLocaleLowerCase().includes(term)));
    const measure=m.charts[0].y;rows.sort((a,b)=>(a.r[measure]-b.r[measure])*(descending?-1:1));draw(rows);}
  search.addEventListener('input',update);filter.addEventListener('change',update);sort.addEventListener('click',()=>{descending=!descending;sort.textContent='Sort measure: '+(descending?'descending':'ascending');update();});
  update();document.documentElement.dataset.ready='true';
})();
