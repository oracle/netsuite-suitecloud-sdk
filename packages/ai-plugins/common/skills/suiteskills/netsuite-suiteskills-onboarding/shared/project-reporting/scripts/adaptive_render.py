#!/usr/bin/env python3
"""Adaptive rendering of audience-approved presentation objects.
No account access, business-rule substitution, arbitrary templates, or execution controls.
"""
from __future__ import annotations
from copy import deepcopy
from datetime import date
from pathlib import Path
import base64, hashlib
import presentation_disclosure as disclosure
import adaptive_layout
import visual_render as legacy
ASSETS=Path(__file__).resolve().parents[1]/"assets/visual"
esc=legacy.esc
md=legacy.md
pretty=legacy.pretty
anchor=legacy.anchor

def source_line(d,refs):
    sources={r["id"]:r for r in d["sources"]}
    parts=[]
    for ref in dict.fromkeys(refs):
        r=sources.get(ref,{})
        parts.append(f'{ref}: {r.get("reference","Source details unavailable")} · retrieved {r.get("retrieved_at","unavailable")} · evaluated {r.get("evaluated_at") or "not exposed"}')
    return "Sources: "+"; ".join(parts)

def panel_sources(d,p):
    return source_line(d,p["source_refs"]+[x for r in p["rows"] for x in r["source_refs"]])

def severity_class(v):
    if v.get("classification_verified") is True and v.get("finding_kind")=="classified_exposure":
        return {"High":"severity-high","Medium":"severity-medium"}.get(v.get("risk_severity"),"")
    return ""

def insights_html(d,p):
    out=['<div class="insight-grid">']
    for r in p["rows"]:
        v=r["values"];cl=severity_class(v)
        out.append('<article class="insight '+cl+'"><h3>'+esc(v.get("headline"))+'</h3>')
        if cl:out.append('<p class="badge">'+esc(v.get("risk_severity"))+' — Risk-classified exposure</p>')
        out.append('<p><strong>Confirmed: </strong>'+esc(v.get("confirmed"))+'</p>')
        if v.get("interpretation"):out.append('<p><strong>Interpretation: </strong>'+esc(v["interpretation"])+'</p>')
        if v.get("limitation"):out.append('<p class="muted">'+esc(v["limitation"])+'</p>')
        out.append('<p class="source-line">'+esc(source_line(d,r["source_refs"]))+'</p></article>')
    out.append('</div>')
    return "".join(out)

def pm_financial_html(d,p):
    options=[];body=[]
    for i,r in enumerate(p["rows"]):
        v=r["values"];key="project-"+str(i)
        options.append('<option value="'+key+'">'+esc(v.get("project"))+'</option>')
        body.append('<article data-pm-financial="'+key+'" class="pm-comparison"><h3>'+esc(v.get("project"))+'</h3>')
        panel={"title":"Project financial comparison","kind":"comparison","rows":[r],"chart":{
            "label":"project","series":[
                {"key":"committed_revenue","label":"Committed revenue","unit":v.get("currency") or "unavailable currency"},
                {"key":"recognized_revenue","label":"Actual recognized revenue","unit":v.get("currency") or "unavailable currency"},
                {"key":"actual_cost","label":v.get("cost_label") or "Actual cost","unit":v.get("currency") or "unavailable currency"}]}}
        body.append('<p class="legend">Committed revenue · Actual recognized revenue · '+esc(v.get("cost_label"))+'</p>')
        if any(v.get(k) is not None and v.get(k)!=disclosure.WITHHELD for k in ("committed_revenue","recognized_revenue","actual_cost")):
            # Audience withholding disables geometry, never a zero bar.
            if any(v.get(k)==disclosure.WITHHELD for k in ("committed_revenue","recognized_revenue","actual_cost")):
                body.append('<p>Comparison withheld for this audience; permitted exact values remain below.</p>')
            else:body.append(legacy.chart_html(panel))
        else:body.append('<p>No comparable values available; no zero bars invented.</p>')
        projects=next((x for x in d["panels"] if x["id"]=="pm-projects"),None)
        match=next((x["values"] for x in projects["rows"] if x["values"].get("project_id")==v.get("project_id")),None) if projects else None
        if match and match.get("findings"):
            body.append('<p class="badge">Review findings — not an overall severity score</p><p>'+esc(" ".join(str(x) for x in match["findings"]))+'</p>')
        body.append('<p>Basis: '+esc(v.get("comparison_basis"))+' · '+esc(v.get("book"))+' · '+esc(v.get("period"))+'</p>')
        if v.get("limitation"):body.append('<p class="gap-callout">'+esc(v["limitation"])+'</p>')
        body.append('<p class="source-line">'+esc(source_line(d,r["source_refs"]))+'</p></article>')
    return ('<div class="pm-controls"><label for="pm-project-picker">Project financial detail</label> '
            '<select id="pm-project-picker"><option value="all">All scoped projects</option>'+"".join(options)+
            '</select><p>Local selection only. Portfolio totals and coverage do not change; another PM requires a new scoped review.</p></div>'+
            "".join(body))

def pm_timeline_html(d,p):
    rows=[];today=legacy.vd.m.local_day(d["snapshot"]["as_of"],d["snapshot"]["timezone"])
    valid=[today.toordinal()]
    for row in p["rows"]:
        v=row["values"];start=v.get("scheduled_start");end=v.get("scheduled_end")
        try:
            a=date.fromisoformat(start);b=date.fromisoformat(end)
        except (ValueError,TypeError):continue
        if a>b:continue
        valid.extend([a.toordinal(),b.toordinal()]);rows.append((row,a.toordinal(),b.toordinal()))
    lo=min(valid);hi=max(valid);span=max(hi-lo,1);pos=100*(today.toordinal()-lo)/span
    out=['<div class="chart" aria-label="Recorded project start and end dates"><p>Recorded dates only — not a forecast. As-of local day: '+str(today)+'.</p>']
    for row,a,b in rows:
        v=row["values"];left=100*(a-lo)/span;width=100*(b-a)/span
        out.append('<div class="chart-row"><div class="chart-label">'+esc(v["project"])+'</div><div>')
        out.append(f'<div class="timeline-band"><span class="project-band" style="left:{left:.4f}%;width:{max(width,0.1):.4f}%"></span><span class="today-line" style="left:{pos:.4f}%"></span></div>')
        out.append('<p class="series-label">'+esc(v.get("scheduled_start"))+' → '+esc(v.get("scheduled_end"))+' · '+esc(v.get("end_basis"))+' · '+esc(v.get("attention_kind"))+'</p></div></div>')
    out.append('<p class="muted">No project is excluded merely because its recorded end is past. '
               +str(len(p["rows"])-len(rows))+' row(s) lack a usable start/end pair; they remain in the exact-value table.</p>')
    out.append('<div class="axis"><span>'+str(date.fromordinal(lo))+'</span><span>'+str(date.fromordinal(hi))+'</span></div></div>')
    return "".join(out)

def pm_table(p):
    fields=[("project","Project"),("client","Client"),("status","Status"),("scheduled_end","Scheduled end"),
            ("overdue_tasks","Overdue tasks"),("hours_logged","Hours logged"),("contract_value","Contract value"),
            ("estimated_cost","Estimated cost"),("currency","Currency"),("attention_kind","Review state")]
    rows=p["rows"]
    counts={"all":len(rows),"active":sum(r["values"].get("status")=="active" for r in rows),
            "upcoming":sum(r["values"].get("status")=="upcoming" for r in rows),
            "no-plan":sum(r["values"].get("plan_state")=="absent" for r in rows)}
    out=['<div class="pm-controls"><div class="chips" aria-label="Local project filters">']
    for k,label in (("all","All"),("active","Active"),("upcoming","Upcoming"),("no-plan","No plan yet")):
        out.append('<button type="button" data-pm-filter="'+k+'" aria-pressed="'+("true" if k=="all" else "false")+'">'+label+' ('+str(counts[k])+')</button>')
    out.append('</div><p>No-plan status is separate from lifecycle; these filter counts can overlap. Unknown states remain in All.</p><p data-pm-count aria-live="polite">All scoped project detail rows displayed; totals and coverage unchanged.</p></div>')
    out.append('<div class="table-wrap"><table data-pm-table><caption>Project directory — exact values; sort/filter affects this table only</caption><thead><tr>')
    for index,(key,label) in enumerate(fields):
        out.append('<th scope="col" aria-sort="none"><button type="button" data-pm-sort="'+str(index)+'">'+label+'</button></th>')
    out.append('<th scope="col">Evidence</th></tr></thead><tbody>')
    for r in rows:
        v=r["values"]
        life=v.get("status");status=life if life in {"active","upcoming","closed","other","unknown"} else "unknown"
        planstate="absent" if v.get("plan_state")=="absent" else "other"
        out.append('<tr data-pm-row data-status="'+status+'" data-plan="'+planstate+'">')
        for key,label in fields:
            value=v.get(key)
            out.append('<td>')
            if key=="overdue_tasks" and isinstance(value,int) and value>0:
                out.append('<a class="count-chip" href="#'+anchor("schedule")+'">'+esc(value)+' — task evidence</a>')
            else:out.append(esc(value))
            out.append('</td>')
        out.append('<td><details><summary>Show evidence</summary><pre>'+pretty(r)+'</pre></details></td></tr>')
    out.append('</tbody></table></div><p class="muted">Contract value and estimated cost retain their verified definitions in each row. Zero is not missing and does not prove a loss. Fields are runtime mappings, not universal account assumptions.</p>')
    return "".join(out)

def panel_html(d,p,plan,*,expanded=True):
    # Keep the portable panel structure for legacy keyboard/detail components.
    out=['<section class="panel" id="'+anchor(p["id"])+'"><div class="panel-header"><h2>'+esc(p["title"])+'</h2><span class="badge">'+esc(p["state"])+'</span></div><p>'+esc(p["description"])+'</p>']
    for issue in p["limitations"]:out.append('<p class="muted">'+esc(issue)+'</p>')
    if p["id"]=="insights":
        out.append(insights_html(d,p))
    elif p["id"]=="pm-financial" and plan["show_charts"]:
        out.append(pm_financial_html(d,p))
    elif p["id"]=="pm-timeline" and plan["show_charts"]:
        out.append(pm_timeline_html(d,p))
        out.append('<p class="source-line">'+esc(panel_sources(d,p))+'</p>')
    elif p.get("chart") and plan["show_charts"]:
        out.append(legacy.chart_html(p))
        out.append('<p class="source-line">'+esc(panel_sources(d,p))+'</p>')
    if p["id"]=="pm-projects":
        out.append(pm_table(p))
    elif p["id"] in {"insights","pm-financial","pm-timeline"}:
        out.append('<details><summary>Supporting exact values and evidence</summary>'+legacy.table_html(p)+'</details>')
    else:out.append(legacy.table_html(p))
    out.append('<p class="source-line">'+esc(panel_sources(d,p))+'</p>')
    out.append('<details><summary>View definition and scope</summary><pre>'+pretty({k:v for k,v in p.items() if k!="rows"})+'</pre></details></section>')
    return "".join(out)

def coverage_html(d):
    out=['<section class="banner" aria-label="Coverage and notes"><strong>'+esc(legacy.coverage_text(d))+'</strong>']
    out.append('<p>Native status, classified exposure, calculation, and proposals remain distinct. Missing and withheld are not zero.</p>')
    out.extend('<p>'+esc(x)+'</p>' for x in d["coverage"].get("errors",[])+d["limitations"])
    for src in d["sources"]:
        if src.get("state")!="read_verified" or not src.get("pages_complete") or not src.get("periods_complete"):
            state=src.get("state")
            action={"denied":"Ask the authorized NetSuite administrator to review the required source/field access; do not assume permission can be granted.",
                    "tool_missing":"Ask the connector owner to expose or reconnect a compatible authorized capability.",
                    "incompatible":"Ask the source/report owner to verify the required fields, grain and definitions."}.get(state,
                    "Ask the source owner to resolve the recorded limitation and verify remaining channels/pages/periods.")
            out.append('<div class="gap-callout"><strong>⚠ Source limitation: '+esc(src.get("reference"))+'</strong><p>State: '+esc(state)+'</p><p>'+esc(src.get("limitations"))+'</p><p>'+esc(action)+'</p></div>')
    out.append('<p>'+esc(d["disclosure"]["note"])+'</p></section>')
    return "".join(out)

def cards_html(d,selected):
    out=['<section class="cards" aria-label="Summary measures">']
    for c in d["cards"]:
        if c["id"] not in selected:continue
        severity=c.get("risk_severity") if c.get("state")=="complete" else None
        cl={"High":"severity-high","Medium":"severity-medium"}.get(severity,"")
        out.append('<article class="card '+cl+'"><h2>'+esc(c["title"])+'</h2><div class="value">'+
            esc(disclosure.WITHHELD if c.get("disclosure_state")=="withheld" else c["value"])+'</div><p>'+esc(c["unit"])+'</p>')
        out.append('<p class="muted">Basis: '+esc(c.get("definition"))+(' · denominator '+esc(c["denominator"]) if c.get("denominator") is not None else "")+'</p>')
        out.append('<p class="badge">'+esc(c["state"])+' · '+esc(c["provenance"])+((' · '+esc(severity)+' classified exposure') if severity else '')+'</p>')
        out.append('<p class="muted">'+esc(c.get("scope"))+' · '+esc(c.get("period"))+'</p>')
        if c.get("native_status"):out.append('<p>Native status: '+esc(c["native_status"])+' — not a calculated risk severity.</p>')
        for limitation in c.get("limitations",[]):out.append('<p class="muted">'+esc(limitation)+'</p>')
        out.append('<p class="source-line">'+esc(source_line(d,c["source_refs"]))+'</p><details><summary>Definition and evidence</summary><pre>'+pretty(legacy.definition(c))+'</pre></details></article>')
    out.append('</section>')
    return "".join(out)


def compact_html(d,plan):
    """Minimal visible answer with all permitted audit material retained, not discarded."""
    lookup={p["id"]:p for p in d["panels"]}
    out=['<section class="compact-answer" aria-label="Answer">',cards_html(d,plan["card_ids"])]
    for pid in plan["overview_panels"]:
        out.append(panel_html(d,lookup[pid],plan))
    if not plan["card_ids"] and not plan["overview_panels"]:
        # Never synthesize a number when no metric/fact was supplied.
        out.append('<p>No validated scalar value was supplied. The requested findings and limitations are in the supporting detail below.</p>')
    out.append('</section><details class="supporting-view"><summary>Sources and supporting detail</summary>')
    remaining=[c["id"] for c in d["cards"] if c["id"] not in plan["card_ids"]]
    if remaining:out.append(cards_html(d,remaining))
    ids=plan["insight_panels"]+plan["detail_panels"]
    ids=sorted(ids,key=lambda x:0 if x=="obligations" else 1)
    for pid in ids:out.append(panel_html(d,lookup[pid],plan))
    for action in d["actions"]:
        out.append('<section class="proposed"><h2>'+esc(action.get("title"))+
                   '</h2><p>Proposed action only · '+esc(action.get("execution_state"))+
                   '</p><pre>'+pretty(action)+'</pre></section>')
    for src in d["sources"]:
        out.append('<details><summary>'+esc(src["id"])+' · '+esc(src["reference"])+
                   '</summary><pre>'+pretty(src)+'</pre></details>')
    out.append('<details><summary>Audience-approved snapshot</summary><pre>'+
               pretty(d["snapshot"])+'</pre></details></details>')
    return "".join(out)


def render_html(d,plan):
    adaptive_layout.validate(d,plan)
    css=(ASSETS/"visual.css").read_text()
    js=(ASSETS/"visual.js").read_text()
    sig=base64.b64encode(hashlib.sha256(js.encode()).digest()).decode()
    s=d["snapshot"]
    out=[f'<!doctype html><html lang="en" data-theme="{plan["theme"]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'sha256-{sig}\'; style-src \'unsafe-inline\'; img-src data:; font-src data:; base-uri \'none\'; form-action \'none\'; connect-src \'none\'"><title>{esc(d["title"])}</title><style>{css}</style></head><body class="density-{plan["density"]} arrangement-{plan["arrangement"]}"><a class="skip" href="#main">Skip to results</a><main id="main">']
    out.append('<header><div class="eyebrow">'+esc(d["profile"])+' · '+esc(plan["preset"])+'</div><h1>'+esc(d["title"])+'</h1>')
    opening="The available evidence supports a limited assessment. Findings and coverage details follow." if d["coverage"]["state"] in {"Incomplete","Limited"} else "The available evidence is summarized below, with findings, definitions and coverage details."
    out.append('<p>'+opening+'</p>')
    out.append('<p>'+esc(s["scope"]["label"])+' · As of '+esc(s["as_of"])+' · '+esc(s["timezone"])+' · '+esc(s["window"]["label"])+'</p>')
    out.append('<p class="muted">'+("SYNTHETIC EXAMPLE — not live NetSuite data." if s["synthetic"] else "Authorized NetSuite evidence snapshot; retrieval and evaluation timestamps are listed per source.")+'</p></header>')
    out.append(coverage_html(d))
    if plan["missing_preset_inputs"]:out.append('<aside class="gap-callout"><strong>PM portfolio input unavailable.</strong> Exact manager binding and a complete project directory were not supplied. Remaining permitted evidence is shown without inventing a manager portfolio.</aside>')
    if plan["preset"]=="compact":
        out.append(compact_html(d,plan))
        out.append('<footer>Values retain their original scope, source dates and coverage. This rendering does not refresh data or authorize actions.</footer></main><script>'+js+'</script></body></html>')
        return "".join(out)
    out.append('<nav class="dashboard-nav" aria-label="Dashboard views">')
    for key,label in (("overview","Overview"),("insights","Insights"),("sourcing","Sourcing")):
        out.append('<a id="tab-'+key+'" href="#view-'+key+'" data-dashboard-tab="'+key+'">'+label+'</a>')
    out.append('</nav>')
    lookup={p["id"]:p for p in d["panels"]}
    for key,ids in (("overview",plan["overview_panels"]),("insights",plan["insight_panels"]),("sourcing",plan["detail_panels"])):
        out.append('<div class="dashboard-view" id="view-'+key+'" aria-labelledby="tab-'+key+'">')
        if key=="overview":out.append(cards_html(d,plan["card_ids"]))
        if key=="insights" and not ids:out.append('<p>No additional synthesized finding is established by the supplied evidence. See the evaluated detail and limitations.</p>')
        if key=="sourcing":
            out.append('<h2>Notes, coverage, definitions and requested answers</h2><p>Every figure is linked to a named or audience-permitted source reference. Detailed requested answers retain their original order; display changes do not change coverage.</p>')
            # Do not remove unselected measures; they are available as detail, not forced overview cards.
            remaining=[x["id"] for x in d["cards"] if x["id"] not in plan["card_ids"]]
            if remaining:out.append('<details><summary>Additional validated measures</summary>'+cards_html(d,remaining)+'</details>')
            if "obligations" in ids:ids=["obligations"]+[x for x in ids if x!="obligations"]
        for pid in ids:
            content=panel_html(d,lookup[pid],plan)
            if key=="insights" and pid!="insights" and pid!=d.get("requested_recipe"):
                out.append('<details class="supporting-view"><summary>'+esc(lookup[pid]["title"])+' — supporting detail</summary>'+content+'</details>')
            else:out.append(content)
        if key=="sourcing":
            for a in d["actions"]:
                out.append('<section class="proposed"><h2>'+esc(a.get("title"))+'</h2><p>Proposed action only · '+esc(a.get("execution_state"))+'</p><pre>'+pretty(a)+'</pre></section>')
            out.append('<section class="panel"><h2>Source inventory and snapshot</h2><p>No automatic refresh. A different PM, source, role or window requires a new scoped review.</p>')
            for src in d["sources"]:
                out.append('<details><summary>'+esc(src["id"])+' · '+esc(src["reference"])+'</summary><pre>'+pretty(src)+'</pre></details>')
            out.append('<details><summary>Audience-approved snapshot context</summary><pre>'+pretty(s)+'</pre></details></section>')
        out.append('</div>')
    out.append('<footer>Figures above trace to the dated sources and calculation definitions shown with their views. Recorded estimates, withheld values, missing inputs and coverage limitations remain identified. Read-only presentation controls do not authorize actions.</footer></main><script>'+js+'</script></body></html>')
    return "".join(out)

def render_markdown(d,plan):
    adaptive_layout.validate(d,plan);s=d["snapshot"]
    opening='The available evidence supports a limited assessment; findings and coverage details follow.' if d["coverage"]["state"] in {"Incomplete","Limited"} else 'The available evidence is summarized below; supporting detail and coverage limitations follow.'
    out=['# '+md(d["title"]),opening,
         md(s["scope"]["label"])+' · As of '+md(s["as_of"])+' · '+md(s["timezone"])+' · '+md(s["window"]["label"]),
         '**Coverage: '+md(legacy.coverage_text(d))+'**',
         '**SYNTHETIC EXAMPLE — not account data.**' if s["synthetic"] else 'Authorized evidence snapshot; source retrieval and evaluation dates are listed separately.',
         md(d["disclosure"]["note"])]
    out += [md(x) for x in d["coverage"].get("errors",[])+d["limitations"]]
    if plan["missing_preset_inputs"]:out.append("**PM portfolio input unavailable:** exact binding/directory not supplied. No manager or scope invented.")
    for key,ids in (("Overview",plan["overview_panels"]),("Insights",plan["insight_panels"]),("Sourcing",plan["detail_panels"])):
        out.append("## "+key)
        if key=="Overview":
            for card in d["cards"]:
                if card["id"] in plan["card_ids"]:
                    out += ["### "+md(card["title"]),"**"+md(card["value"] if card.get("disclosure_state")!="withheld" else disclosure.WITHHELD)+" "+md(card["unit"])+"**",
                            md(legacy.definition(card)),md(source_line(d,card["source_refs"]))]
        if key=="Sourcing":
            ids=sorted(ids,key=lambda x:0 if x=="obligations" else 1)
            for card in d["cards"]:
                if card["id"] not in plan["card_ids"]:out+=["### "+md(card["title"]),md(card)]
        for pid in ids:
            p=next(x for x in d["panels"] if x["id"]==pid)
            out += ["### "+md(p["title"]),md(p["description"]),md(p["state"])]
            if pid=="insights":
                for row in p["rows"]:
                    v=row["values"];out+=["#### "+md(v.get("headline")),"**Confirmed:** "+md(v.get("confirmed"))]
                    if v.get("interpretation"):out+=["**Interpretation:** "+md(v["interpretation"])]
                    out += [md(v.get("limitation")),md(source_line(d,row["source_refs"]))]
            if p["rows"]:
                out+=["| "+" | ".join(md(x["label"]) for x in p["columns"])+" | Sources |",
                      "| "+" | ".join("---" for x in p["columns"])+" | --- |"]
                for row in p["rows"]:out.append("| "+" | ".join(md(row["values"].get(x["key"])) for x in p["columns"])+" | "+md(row["source_refs"])+" |")
                out.append("#### Full row evidence permitted for this audience")
                out += [md(row) for row in p["rows"]]
            else:out.append("Confirmed empty for this evaluated scope." if p["state"]=="complete" else "Required evidence unavailable; not an empty-result conclusion.")
            out += [md(x) for x in p["limitations"]]+[md(panel_sources(d,p)),md({k:v for k,v in p.items() if k!="rows"})]
    out += ["## Proposed actions — no execution controls"]+[md(x) for x in d["actions"]]
    out += ["## Sources and snapshot",md(s)]+[md(x) for x in d["sources"]]
    out.append("Figures trace to the dated sources and calculation definitions above. Recorded estimates, withheld values and coverage gaps remain explicit. Layout-only reuse does not authorize actions or refresh data.")
    return "\n\n".join(out)+"\n"
