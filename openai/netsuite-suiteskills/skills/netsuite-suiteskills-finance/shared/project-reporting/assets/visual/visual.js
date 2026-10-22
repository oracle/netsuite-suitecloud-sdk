/* Local display filters only. No remote calls, dynamic markup, forms, execution or refresh. */
"use strict";
document.documentElement.classList.add("enhanced");
document.querySelectorAll("[data-table-filter]").forEach(function(input){
  input.addEventListener("input", function(){
    const panel=input.closest(".panel");
    const q=input.value.toLocaleLowerCase().trim();
    let shown=0, total=0;
    panel.querySelectorAll("tr[data-filter-row]").forEach(function(row){
      total++;
      const visible=row.textContent.toLocaleLowerCase().includes(q);
      row.hidden=!visible;
      if(visible) shown++;
    });
    panel.querySelector("[data-filter-count]").textContent=
      shown+" of "+total+" detail rows displayed. Chart, cards and root coverage remain unchanged.";
  });
});

function openSection(){const target=document.getElementById(location.hash.slice(1));if(target && target.tagName==="DETAILS"){target.open=true;}}
window.addEventListener("hashchange",openSection);openSection();


/* Adaptive component layer; same runtime semantics. */

/* Progressive, local-only controls. No API calls, arbitrary scripting, or execution buttons. */
(function(){
  "use strict";
  const links=Array.from(document.querySelectorAll("[data-dashboard-tab]"));
  const nav=document.querySelector(".dashboard-nav");
  function activate(tab,focus){
    const key=tab.dataset.dashboardTab;
    links.forEach(function(x){const active=x===tab;x.setAttribute("aria-selected",String(active));x.tabIndex=active?0:-1;});
    document.querySelectorAll(".dashboard-view").forEach(function(v){v.hidden=v.id!=="view-"+key;});
    if(focus)tab.focus();
  }
  if(nav && links.length){
    nav.setAttribute("role","tablist");
    links.forEach(function(tab,index){
      const panel=document.getElementById("view-"+tab.dataset.dashboardTab);
      tab.setAttribute("role","tab");tab.setAttribute("aria-controls",panel.id);
      panel.setAttribute("role","tabpanel");panel.tabIndex=0;
      tab.addEventListener("click",function(e){e.preventDefault();activate(tab,false);});
      tab.addEventListener("keydown",function(e){
        let n=index;
        if(e.key==="ArrowRight")n=(index+1)%links.length;
        else if(e.key==="ArrowLeft")n=(index-1+links.length)%links.length;
        else if(e.key==="Home")n=0;
        else if(e.key==="End")n=links.length-1;
        else return;
        e.preventDefault();activate(links[n],true);
      });
    });
    activate(links[0],false);
  }
  // A chart/table deep link can reveal its panel even when it lies in another view.
  document.querySelectorAll("a[href^='#']").forEach(function(a){
    if(a.hasAttribute("data-dashboard-tab"))return;
    a.addEventListener("click",function(){
      const target=document.getElementById(a.getAttribute("href").slice(1));
      if(!target)return;
      let ancestor=target.parentElement;
      while(ancestor){if(ancestor.tagName==="DETAILS")ancestor.open=true;ancestor=ancestor.parentElement;}
      const view=target.closest(".dashboard-view");
      if(view){const tab=links.find(x=>"view-"+x.dataset.dashboardTab===view.id);if(tab)activate(tab,false);}
    });
  });
  const picker=document.getElementById("pm-project-picker");
  if(picker)picker.addEventListener("change",function(){
    document.querySelectorAll("[data-pm-financial]").forEach(function(row){row.hidden=picker.value!=="all" && row.dataset.pmFinancial!==picker.value;});
  });
  document.querySelectorAll("[data-pm-filter]").forEach(function(button){
    button.addEventListener("click",function(){
      const panel=button.closest(".panel");const filter=button.dataset.pmFilter;
      let count=0;const rows=panel.querySelectorAll("[data-pm-row]");
      rows.forEach(function(row){
        const keep=filter==="all"||(filter==="no-plan"?row.dataset.plan==="absent":row.dataset.status===filter);
        row.hidden=!keep;if(keep)count++;
      });
      panel.querySelectorAll("[data-pm-filter]").forEach(function(x){x.setAttribute("aria-pressed",String(x===button));});
      panel.querySelector("[data-pm-count]").textContent=count+" of "+rows.length+" project detail rows displayed. Cards, charts and root coverage remain unchanged.";
    });
  });
  document.querySelectorAll("[data-pm-sort]").forEach(function(button){
    button.addEventListener("click",function(){
      const table=button.closest("table"),body=table.tBodies[0],col=Number(button.dataset.pmSort);
      const direction=button.parentElement.getAttribute("aria-sort")==="ascending"?-1:1;
      const rows=Array.from(body.rows);
      rows.sort(function(a,b){
        const x=a.cells[col].textContent.trim(),y=b.cells[col].textContent.trim();
        const number=/^-?\d+(?:\.\d+)?$/;
        return direction*(number.test(x)&&number.test(y)?Number(x)-Number(y):x.localeCompare(y));
      });
      rows.forEach(function(row){body.appendChild(row);});
      table.querySelectorAll("th").forEach(function(th){th.setAttribute("aria-sort","none");});
      button.parentElement.setAttribute("aria-sort",direction===1?"ascending":"descending");
    });
  });
}());
