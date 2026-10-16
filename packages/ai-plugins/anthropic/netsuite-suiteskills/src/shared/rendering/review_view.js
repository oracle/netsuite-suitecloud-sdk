/* Local snapshot controls. No retrieval, account actions, or persistent storage. */
(function(root){
'use strict';
function display(v){return v==null?'unknown':typeof v==='object'?v.state:String(v);}
function parts(v){const m=String(v).match(/^([+-]?)(\d+)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/);if(!m)throw Error('Invalid decimal');let n=BigInt(m[2]+(m[3]||''));if(m[1]==='-')n=-n;return [n,(m[3]||'').length-Number(m[4]||0)];}
function compareDecimal(a,b){const [an,as]=parts(a),[bn,bs]=parts(b),scale=Math.max(as,bs);const x=an*10n**BigInt(scale-as),y=bn*10n**BigInt(scale-bs);return x<y?-1:x>y?1:0;}
function select(rows,query,field,type,descending,page,size){
 const q=query.toLocaleLowerCase();let selected=rows.map((row,i)=>({row,i})).filter(x=>Object.values(x.row).some(v=>display(v).toLocaleLowerCase().includes(q)));
 selected.sort((a,b)=>{const x=a.row[field],y=b.row[field],xm=x==null||typeof x==='object',ym=y==null||typeof y==='object';if(xm!==ym)return xm?1:-1;if(xm&&ym)return a.i-b.i;const order=type==='decimal'?compareDecimal(x,y):String(x).localeCompare(String(y));return (descending?-order:order)||a.i-b.i;});
 const pages=Math.max(1,Math.ceil(selected.length/size)),current=Math.max(0,Math.min(page,pages-1));return {rows:selected.slice(current*size,(current+1)*size).map(x=>x.row),count:selected.length,page:current,pages};
}
const api={display,compareDecimal,select};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}root.ReviewView=api;
const data=JSON.parse(document.getElementById('review-data').textContent),r=data.result,c=data.config,$=id=>document.getElementById(id);
let page=0;const size=25;
$('scope').textContent='Source coverage: '+r.coverage+' · Observed: '+r.observed_at+' · Scope: '+JSON.stringify(r.scope);
$('details').textContent=JSON.stringify({result_digest:data.result_digest,mechanical_receipt:data.receipt,producer:r.producer,grain:r.grain,sources:r.sources,lineage:r.lineage,domain_review:r.domain_review},null,2);
for(const column of c.columns){const option=document.createElement('option');option.value=column.field;option.textContent=column.label;$('sort').append(option);const th=document.createElement('th');th.scope='col';th.textContent=column.label;$('head').append(th);}
function draw(){const column=c.columns.find(x=>x.field===$('sort').value),s=select(r.rows,$('filter').value,column.field,column.type,$('direction').value==='descending',page,size);page=s.page;$('body').replaceChildren();for(const row of s.rows){const tr=document.createElement('tr');for(const column of c.columns){const td=document.createElement('td');td.textContent=display(row[column.field]);tr.append(td);}$('body').append(tr);}
 $('count').textContent=s.count+' visible of '+r.rows.length+' retrieved rows · page '+(page+1)+' of '+s.pages+'. Filtered rows do not establish full-population totals.';$('previous').disabled=page===0;$('next').disabled=page+1>=s.pages;
}
for(const id of ['filter','sort','direction'])$(id).addEventListener(id==='filter'?'input':'change',()=>{page=0;draw();});$('previous').addEventListener('click',()=>{page--;draw();});$('next').addEventListener('click',()=>{page++;draw();});draw();
})(typeof window!=='undefined'?window:globalThis);
