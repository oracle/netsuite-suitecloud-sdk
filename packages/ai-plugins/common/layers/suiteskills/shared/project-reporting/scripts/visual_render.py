#!/usr/bin/env python3
"""Render validated VISUAL-2.0.0 datasets to portable offline HTML or evidence-equivalent Markdown.
No business calculation, account reads/writes, refresh, external assets or model calls.
Only geometric scales, escaping, audience projection and display filtering are handled here.
Protected VISUAL input plus a separately trusted disclosure policy are required.
The renderer never serializes the raw evidence object.
"""
from __future__ import annotations
from pathlib import Path
from datetime import date
from decimal import Decimal
import argparse, base64, hashlib, html, json, re
import sys
sys.dont_write_bytecode = True
import visual_dataset as vd
import presentation_disclosure as disclosure

ASSETS=Path(__file__).resolve().parents[1]/"assets/visual"
import sys as _output_sys
from pathlib import Path as _OutputPath
_output_sys.dont_write_bytecode = True
_output_sys.path.insert(0, str(_OutputPath(__file__).resolve().parents[2]))
from safe_output import publish as publish_output

def text(value):
    if value is None:return "Not measurable / unavailable"
    if isinstance(value,(list,dict)):return json.dumps(value,ensure_ascii=False,sort_keys=True)
    if isinstance(value,bool):return "Yes" if value else "No"
    return str(value)
def esc(value):return html.escape(text(value),quote=True)
def anchor(value):return "v-"+hashlib.sha256(str(value).encode()).hexdigest()[:14]
def pretty(value):return esc(json.dumps(value,ensure_ascii=False,indent=2,sort_keys=True))
def md(value):
    value=text(value).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\\","\\\\")
    for token in ("|","`","[","]","(",")","*","_","#","!"):
        value=value.replace(token,"\\"+token)
    return value.replace("\n","<br>")
def definition(obj):
    return {k:obj.get(k) for k in ("definition","lineage","provenance","population_basis","source_refs","denominator","as_of","period","unit","limitations") if k in obj}

def coverage_text(d):
    c=d["coverage"];r=c.get("risk_gate") or {}
    desc=f'{c["state"]} · {len(d["snapshot"]["scope"]["project_ids"])} scoped projects'
    if r:desc+=f' · {r.get("completed",0)} / {r.get("expected","unknown")} investigation searches completed · {r.get("unavailable_evaluations",0)} unavailable evaluations'
    return desc

def chart_html(panel):
    chart=panel.get("chart")
    if not chart or not panel["rows"]:return ""
    kind=panel["kind"];rows=panel["rows"]
    if kind=="matrix":
        days=sorted({r["values"].get(chart["day"]) for r in rows if r["values"].get(chart["day"])})
        people=list(dict.fromkeys(r["values"][chart["label"]] for r in rows))
        indexed={(r["values"][chart["label"]],r["values"].get(chart["day"])):r for r in rows}
        out=['<div class="table-wrap" role="region" aria-label="Daily capacity matrix" tabindex="0"><table class="matrix"><caption>Daily planned hours / net capacity — shortage and unknown states are explicit</caption><thead><tr><th scope="col">Resource</th>']
        out += ['<th scope="col">'+esc(day)+'</th>' for day in days]
        out.append('</tr></thead><tbody>')
        for person in people:
            out.append('<tr><th scope="row">'+esc(person)+'</th>')
            for day in days:
                entry=indexed.get((person,day));v=entry["values"] if entry else {}
                state=v.get(chart["state"],"unavailable")
                css="exception" if state in {"verified_planned_overutilization","zero_capacity_conflict","known_demand_conflict_incomplete_total"} else ("unknown" if state=="incomplete" else "")
                out.append(f'<td class="{css}"><strong>{esc(v.get(chart["demand"]))} / {esc(v.get(chart["capacity"]))} h</strong><small>{esc(state)}</small></td>')
            out.append('</tr>')
        out.append('</tbody></table></div>');return "".join(out)
    series=chart.get("series",[])
    if kind=="timeline":
        valid=[]
        for r in rows:
            for s in series:
                x=r["values"].get(s["key"])
                if x:
                    try:valid.append(date.fromisoformat(x).toordinal())
                    except (TypeError,ValueError):pass
        if not valid:return '<p>Recorded dates unavailable; see the exact-value table.</p>'
        lo,hi=min(valid),max(valid);span=max(hi-lo,1)
        out=[f'<div class="chart" role="img" aria-label="{esc(panel["title"])}. Exact dates follow in the table."><p>Recorded dates only — not a forecast.</p>']
        for r in rows:
            v=r["values"];marks=[]
            out.append('<div class="chart-row"><div class="chart-label">'+esc(v.get(chart["label"]))+'</div><div>')
            for i,s in enumerate(series):
                x=v.get(s["key"])
                if x:
                    try:position=100*(date.fromisoformat(x).toordinal()-lo)/span
                    except (ValueError,TypeError):continue
                    marks.append((position,i,x,s["label"]))
            out.append('<div class="timeline-track" style="margin-left:6px;margin-right:6px">')
            if len(marks)==2:
                a,b=sorted([p[0] for p in marks])
                out.append(f'<span class="line" style="left:{a:.4f}%;width:{b-a:.4f}%"></span>')
            for pos,i,x,label in marks:
                out.append(f'<span class="dot {"second" if i else ""}" style="left:{pos:.4f}%"></span>')
            out.append('</div><p class="series-label">'+esc("; ".join(label+": "+x for _,_,x,label in marks))+'</p></div></div>')
        out.append(f'<div class="axis"><span>{date.fromordinal(lo)}</span><span>{date.fromordinal(hi)}</span></div></div>')
        return "".join(out)
    nums=[]
    for r in rows:
        for s in series:
            val=r["values"].get(s["key"])
            if val is not None:
                try:n=vd.m.number(val);nums.append(n)
                except (ValueError,TypeError):raise ValueError("Chart numeric value has no validated decimal")
    if not nums:return '<p>Comparison values unavailable; no zero bars invented.</p>'
    lo=min(Decimal(0),min(nums));hi=max(Decimal(0),max(nums));span=hi-lo or Decimal(1)
    zero=(Decimal(0)-lo)*100/span
    out=['<div class="chart" role="img" aria-label="'+esc(panel["title"])+'. Exact values and evidence follow.">']
    for r in rows:
        v=r["values"];out.append('<div class="chart-row"><div class="chart-label">'+esc(v.get(chart["label"]))+'</div><div>')
        for i,s in enumerate(series):
            val=v.get(s["key"])
            out.append('<div class="series-label">'+esc(s["label"])+': <strong>'+esc(val)+'</strong> '+esc(s["unit"])+'</div>')
            if val is not None:
                n=vd.m.number(val);endpoint=(n-lo)*100/span;left=min(zero,endpoint);width=abs(endpoint-zero)
                out.append(f'<div class="track"><span class="bar {"second" if i else ""}" style="left:{left:.4f}%;width:{width:.4f}%"></span></div>')
        out.append('</div></div>')
    out.append(f'<div class="axis"><span>{esc(lo)} {esc(series[0]["unit"])}</span><span>{esc(hi)} {esc(series[0]["unit"])}</span></div></div>')
    return "".join(out)

def table_html(panel):
    columns=panel["columns"]
    if not panel["rows"]:
        return '<p class="muted">'+("Confirmed empty for this evaluated scope." if panel["state"]=="complete" else "Evidence missing or incomplete; no empty-result conclusion inferred.")+'</p>' 
    out=['<div class="filters"><label for="'+anchor(panel["id"]+"filter")+'">Filter detail rows</label><input id="'+anchor(panel["id"]+"filter")+'" data-table-filter type="search" placeholder="Search this table"><p data-filter-count aria-live="polite">Detail filter only; chart, cards and root coverage are unchanged.</p></div>']
    out.append('<div class="table-wrap" role="region" aria-label="'+esc(panel["title"])+' exact values" tabindex="0"><table><caption>Exact values and evidence · '+esc(panel["title"])+'</caption><thead><tr>')
    out += ['<th scope="col">'+esc(c["label"])+'</th>' for c in columns]
    out.append('<th scope="col">Evidence</th></tr></thead><tbody>')
    for r in panel["rows"]:
        v=r["values"];out.append('<tr data-filter-row>')
        for c in columns:
            value=v.get(c["key"])
            # Large structured data remain fully available in row evidence without flooding the table.
            label="See row evidence" if isinstance(value,(list,dict)) and len(text(value))>160 else value
            out.append('<td>'+esc(label)+'</td>')
        out.append('<td><details class="row-evidence"><summary>Show evidence</summary><p>Provenance: '+esc(r["provenance"])+'</p><pre>'+pretty(r)+'</pre></details></td></tr>')
    out.append('</tbody></table></div>');return "".join(out)

def render_classic_html(data, disclosure_policy=None):
    d=disclosure.project(data, disclosure_policy)
    css=(ASSETS/"visual.css").read_text(encoding="utf-8")
    js=(ASSETS/"visual.js").read_text(encoding="utf-8")
    script_hash=base64.b64encode(hashlib.sha256(js.encode()).digest()).decode()
    s=d["snapshot"]
    head=f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-{script_hash}'; style-src 'unsafe-inline'; img-src data:; font-src data:; base-uri 'none'; form-action 'none'; connect-src 'none'">
<title>{esc(d["title"])}</title><style>{css}</style></head><body><a class="skip" href="#main">Skip to results</a><main id="main">
<header><div class="eyebrow">{esc(d["profile"])} · Evidence-backed project review</div><h1>{esc(d["title"])}</h1>
<p>{esc(s["scope"]["label"])}</p><div class="meta"><span>As of {esc(s["as_of"])}</span><span>{esc(s["timezone"])}</span><span>Window: {esc(s["window"]["label"])}</span></div>
<p class="muted">Snapshot {esc(s["id"])} · {"SYNTHETIC EXAMPLE — not account data" if s["synthetic"] else "Supplied authorized evidence — verify source lineage"}</p></header>"""
    out=[head,'<section class="banner" aria-label="Coverage"><strong>'+esc(coverage_text(d))+'</strong><p>Observation, calculation, native status, classified exposure and proposals are separate. Missing is not zero.</p>']
    out.append('<p>'+esc(d["disclosure"]["note"])+'</p>')
    for issue in d["coverage"].get("errors",[])+d["limitations"]:
        out.append('<p>'+esc(issue)+'</p>')
    out.append('</section><section class="cards" aria-label="Summary measures">')
    for c in d["cards"]:
        value=esc(disclosure.WITHHELD if c.get("disclosure_state")=="withheld" else c["value"]);denom=c.get("denominator")
        out.append('<article class="card"><h2>'+esc(c["title"])+'</h2><span class="badge">'+esc(c["state"])+' · '+esc(c["provenance"])+'</span><div class="value">'+value+(' / '+esc(denom) if denom is not None else '')+'</div><div class="unit">'+esc(c["unit"])+'</div><p class="muted">'+esc(c["scope"])+' · '+esc(c["period"])+'</p><details><summary>Definition and evidence</summary><pre>'+pretty(definition(c))+'</pre></details></article>')
    out.append('</section><nav aria-label="Review sections">')
    for p in d["panels"]:out.append('<a href="#'+anchor(p["id"])+'">'+esc(p["title"])+'</a>')
    out.append('</nav>')
    for p in d["panels"]:
        collapsed=p["id"] in {"discovery-coverage","source-coverage"} and p["id"]!=d.get("requested_recipe")
        if collapsed:
            out.append('<details class="panel" id="'+anchor(p["id"])+'"><summary>'+esc(p["title"])+' · '+esc(p["state"])+'</summary><p>'+esc(p["description"])+'</p>')
        else:
            out.append('<section class="panel" id="'+anchor(p["id"])+'"><div class="panel-header"><h2>'+esc(p["title"])+'</h2><span class="badge">'+esc(p["state"])+'</span></div><p>'+esc(p["description"])+'</p>')
        for issue in p["limitations"]:out.append('<p class="muted">'+esc(issue)+'</p>')
        out.append(chart_html(p));out.append(table_html(p))
        out.append('<details><summary>View definition and scope</summary><pre>'+pretty({k:v for k,v in p.items() if k!="rows"})+'</pre></details>'+('</details>' if collapsed else '</section>'))
    for a in d["actions"]:
        out.append('<section class="proposed"><h2>'+esc(a["title"])+'</h2><p>Proposed action only · '+esc(a["execution_state"])+'</p><p>'+esc(a["proposed_action"])+'</p><details><summary>Authority, evidence and recheck</summary><pre>'+pretty(a)+'</pre></details></section>')
    out.append('<section class="panel"><h2>Source inventory and snapshot</h2><p>No automatic refresh. A new scope, role, date or source requires revalidation.</p>')
    for src in d["sources"]:out.append('<details><summary>'+esc(src["id"])+' · '+esc(src["reference"])+'</summary><pre>'+pretty(src)+'</pre></details>')
    out.append('<details><summary>Audience-approved snapshot context</summary><pre>'+pretty(s)+'</pre></details></section><footer>Read-only presentation. Evidence disclosure and local filters do not authorize actions. A complete structural gate is not proof of unavailable evidence.</footer></main><script>'+js+'</script></body></html>')
    return "".join(out)

def render_classic_markdown(data, disclosure_policy=None):
    d=disclosure.project(data, disclosure_policy);s=d["snapshot"]
    out=[f'# {md(d["title"])}',f'{md(s["scope"]["label"])} · As of {md(s["as_of"])} · {md(s["timezone"])} · {md(s["window"]["label"])}',
         f'**Coverage: {md(coverage_text(d))}**',
         "**Synthetic example, not account data.**" if s["synthetic"] else "Supplied authorized evidence; no automatic refresh."]
    out.append(md(d["disclosure"]["note"]))
    out+= [md(x) for x in d["coverage"].get("errors",[])+d["limitations"]]
    for c in d["cards"]:
        out += [f'## {md(c["title"])}',f'**{md(disclosure.WITHHELD if c.get("disclosure_state")=="withheld" else c["value"])} {md(c["unit"])}** · {md(c["state"])} · {md(c["provenance"])}',
                "Definition/evidence: "+md(definition(c))]
    for p in d["panels"]:
        out += [f'## {md(p["title"])}',f'{md(p["state"])} · {md(p["description"])}']
        if p["chart"]:out.append("Chart replaced by the exact-value table below.")
        out += [md(x) for x in p["limitations"]]
        columns=p["columns"]
        if p["rows"]:
            out += ["| "+" | ".join(md(c["label"]) for c in columns)+" | Source refs |",
                    "| "+" | ".join("---" for _ in columns)+" | --- |"]
            for r in p["rows"]:
                out.append("| "+" | ".join(md(r["values"].get(c["key"])) for c in columns)+" | "+md(r["source_refs"])+" |")
            out.append("### Full row evidence permitted for this audience and calculation lineage")
            # Untrusted data are escaped text, not executable code or generated links.
            for r in p["rows"]:out.append(md(r))
        else:out.append("Confirmed empty for the evaluated scope." if p["state"]=="complete" else "Evidence missing or incomplete; no empty-result or zero conclusion inferred.")
        out.append("View definition/scope: "+md({k:v for k,v in p.items() if k!="rows"}))
    if d["actions"]:
        out.append("## Proposed actions — no execution controls")
        out.extend(md(a) for a in d["actions"])
    out+=["## Sources and snapshot",md(s)]+[md(src) for src in d["sources"]]
    out.append("Layout-only reuse preserves this snapshot; source/scope/time/role changes require revalidation.")
    return "\n\n".join(out)+"\n"


def _adaptive(data,policy,fmt,preset="auto",layout=None,**options):
    if preset=="classic" and layout is None:
        return render_classic_html(data,policy) if fmt=="html" else render_classic_markdown(data,policy)
    import adaptive_layout,adaptive_render
    public=disclosure.project(data,policy)
    plan=layout or adaptive_layout.build(public,preset=preset,**options)
    return adaptive_render.render_html(public,plan) if fmt=="html" else adaptive_render.render_markdown(public,plan)

def render_html(data,disclosure_policy=None,*,preset="auto",layout=None,**options):
    return _adaptive(data,disclosure_policy,"html",preset,layout,**options)

def render_markdown(data,disclosure_policy=None,*,preset="auto",layout=None,**options):
    return _adaptive(data,disclosure_policy,"markdown",preset,layout,**options)

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("input",type=Path);p.add_argument("--format",choices=["html","markdown"],default="markdown");p.add_argument("--output",required=True,type=Path);p.add_argument("--policy",required=True,type=Path);p.add_argument("--preset",choices=["auto","classic","compact","narrative-review","pm-portfolio"],default="auto");p.add_argument("--layout",type=Path);p.add_argument("--density",choices=["comfortable","compact","spacious"],default="comfortable");p.add_argument("--theme",choices=["auto","light","dark"],default="auto");p.add_argument("--arrangement",choices=["balanced","table-led","chart-led"],default="balanced");p.add_argument("--narrow",action="store_true");p.add_argument("--execution-context",type=Path);p.add_argument("--tool-trace",type=Path);p.add_argument("--output-dir",required=True,type=Path);a=p.parse_args()
    try:
        data=json.loads(a.input.read_text(encoding="utf-8"))
        if data.get("snapshot",{}).get("synthetic") is not True:
            import task_execution
            if a.execution_context is None or a.tool_trace is None:
                raise ValueError("Live rendering needs trusted context and tool trace")
            result=task_execution.gate(data,json.loads(a.execution_context.read_text()),json.loads(a.tool_trace.read_text()))
            if not result["proceed"]:
                print(result["message"]);return 2
        policy=json.loads(a.policy.read_text(encoding="utf-8"))
        layout=json.loads(a.layout.read_text(encoding="utf-8")) if a.layout else None
        options={"preset":a.preset,"layout":layout,"density":a.density,"theme":a.theme,"arrangement":a.arrangement,"broad":not a.narrow}
        result=render_html(data,policy,**options) if a.format=="html" else render_markdown(data,policy,**options)
        publish_output(result,a.output,output_dir=a.output_dir,inputs=[a.input,a.policy]+([a.layout] if a.layout else [])+([a.execution_context] if a.execution_context else [])+([a.tool_trace] if a.tool_trace else []));print(str(a.output));return 0
    except (OSError,ValueError,TypeError,KeyError):print(json.dumps({"input_error":"Rendering rejected; verify protected data and audience policy."}));return 1
if __name__=="__main__":raise SystemExit(main())
