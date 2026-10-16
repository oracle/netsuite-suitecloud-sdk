#!/usr/bin/env python3
"""Optional DASHBOARD-1.0 normalized views atop VISUAL-2.0.0.
Read-only local arithmetic. Source names/IDs are runtime inputs, never account constants.
Adds public-field-constrained panels before the existing audience projection.
Does not replace the root request/risk gates or authenticate supplied evidence flags.
"""
from __future__ import annotations
from copy import deepcopy
from collections import defaultdict
from datetime import date
import json
import visual_metrics as m

VERSION = "DASHBOARD-1.0.0"
PM_FIELDS = {
    "pm-context": "manager manager_type definition population_state limitation",
    "pm-projects": "project_id project client status plan_state scheduled_start scheduled_end end_basis overdue_tasks oldest_days_late planned_hours hours_logged contract_value estimated_cost actual_cost recognized_revenue committed_revenue currency attention_kind findings limitation measure_definitions",
    "pm-financial": "project_id project currency book period committed_revenue recognized_revenue actual_cost cost_label comparison_basis limitation measure_definitions",
    "pm-timeline": "project_id project status scheduled_start scheduled_end end_basis attention_kind limitation",
    "pm-totals": "measure value known_subtotal currency book period basis evaluated expected unavailable scope_expected unassigned_context definition",
    "insights": "entity headline confirmed interpretation finding_kind risk_severity classification_verified count denominator conditions limitation",
}
MEASURES = {
    "contract_value": {"contract_value"},
    "committed_revenue": {"committed_revenue"},
    "recognized_revenue": {"recognized_revenue"},
    "actual_cost": {"actual_project_cost", "actual_labor_cost"},
    "estimated_cost": {"estimated_cost"},
    "planned_hours": {"plannedwork"},
    "actual_hours": {"actual_hours"},
}

def _refs(row, sources):
    refs=row.get("source_refs", [])
    if not refs or not set(refs) <= set(sources):
        raise ValueError("Dashboard row lacks known source references")
    return sorted(set(refs))

def _lineage(formula, refs, grain="project", ids=()):
    return {"formula":formula,"grain":grain,"input_row_refs":list(ids),"source_refs":refs}

def _panel(d, pid, title, rows, description, chart=None, complete=True):
    known={s["id"] for s in d["sources"]}
    refs=sorted({x for row in rows for x in row.get("source_refs",[])}) or sorted(known)
    records=[]
    for i,row in enumerate(rows):
        row=deepcopy(row);rr=_refs(row,known);row.pop("source_refs",None)
        lineage=row.pop("_lineage",None);prov=row.pop("_provenance","observation")
        records.append({"id":str(i+1),"values":row,"source_refs":rr,"provenance":prov,"lineage":lineage})
    state="complete" if complete and d["coverage"]["state"] in {"Complete","Limited","Plan only"} else "partial"
    if not rows:state="unavailable"
    keys=PM_FIELDS[pid].split()
    p={"id":pid,"title":title,"kind":"comparison" if chart else "table","description":description,
       "state":state,"columns":[{"key":k,"label":k.replace("_"," ").capitalize()} for k in keys],
       "rows":records,"source_refs":refs,"chart":chart,"limitations":[] if complete else ["Dashboard evidence or definitions are incomplete; see row and source limitations."],
       "definition":description,"grain":"One row per declared entity/measure natural key",
       "filters":d["snapshot"].get("filters",[]),"context":d["snapshot"].get("context",{}),
       "window":d["snapshot"]["window"]}
    d["panels"].append(p)
    return p

def _measure(raw, key, source_ids):
    """Normalize only explicitly verified, definition-bearing amounts. Never fill a missing value with zero."""
    if raw is None:return None,None,"Measure not supplied"
    _refs(raw,source_ids)
    if isinstance(source_ids,dict) and any(source_ids[x].get("state")!="read_verified" for x in raw["source_refs"]):
        return None,raw,"Measure source is unavailable or unverified"
    if raw.get("semantic") not in MEASURES[key]:
        raise ValueError("Measure semantic differs from its display slot")
    if key=="actual_cost" and raw.get("rate_kind")=="billing":
        raise ValueError("Billing rates cannot be treated as cost rates")
    required=("verified","population_complete","grain_verified")
    if raw.get("value") is None:return None,raw,"Measure unavailable; zero not inferred"
    if not all(raw.get(k) is True for k in required) or not raw.get("definition"):
        return None,raw,"Measure definition, grain, or source population not verified"
    if key not in {"planned_hours","actual_hours"} and not all(raw.get(k) for k in ("currency","book","period","basis")):
        return None,raw,"Monetary context incomplete"
    return m.decimal_text(m.number(raw["value"])),raw,None

def _compatible(a,b):
    return a and b and all(a.get(k)==b.get(k) and a.get(k) for k in ("currency","book","period"))

def _native_by_project(d):
    result=defaultdict(list)
    for p in d["panels"]:
        if p["id"]=="native":
            for row in p["rows"]:
                v=row["values"]
                if v.get("native_status") in {"YELLOW","RED"}:
                    project=(v.get("native_result") or {}).get("project")
                    if project is None:continue  # Never join display names to internal project IDs.
                    result[project].append((v.get("indicator_type"),v["native_status"],row["source_refs"]))
    return result

def enrich(d,payload):
    evidence=payload.get("evidence",{})
    if d["profile"] in {"portfolio-health","risk","operations"}:
        build_insights(d,evidence)
    build_domain_insights(d)
    pm=evidence.get("pm_portfolio")
    if pm is not None:
        if d["profile"]!="portfolio-health":raise ValueError("PM portfolio is owned by Portfolio Health")
        build_pm(d,evidence,pm)
    return d

def build_insights(d,e):
    """Co-occurrence is a deterministic join, not statistical correlation or severity escalation."""
    projects=set(d["snapshot"]["scope"]["project_ids"]);source_ids={x["id"] for x in d["sources"]}
    names={p["id"]:p.get("name",p["id"]) for p in e.get("projects",[])}
    by=defaultdict(list);seen={}
    for r in e.get("risk_findings",[]):
        if r.get("project_id") not in projects:raise ValueError("Finding outside root scope")
        key=r.get("id")
        if not key:raise ValueError("Stable finding ID required")
        if key in seen:
            if seen[key]!=r:raise ValueError("Conflicting duplicate finding")
            continue
        seen[key]=deepcopy(r)
        refs=_refs(r,source_ids)
        if any(next(x for x in d["sources"] if x["id"]==ref).get("state")!="read_verified" for ref in refs):
            d["limitations"].append("An insight source is unavailable/unverified; no confirmed synthesis was produced from it.")
            continue
        if r.get("classification_verified") is True and r.get("risk_severity") in {"High","Medium","Low"}:
            by[r["project_id"]].append(r)
    rows=[]
    for pid,findings in sorted(by.items()):
        refs=sorted({x for r in findings for x in r["source_refs"]})
        label=names.get(pid,pid)
        # A synthesis from separate findings has no newly manufactured severity.
        combined=len(findings)>1
        titles=[r.get("title","Classified finding") for r in findings]
        rows.append({"entity":label,"headline":label+" — "+("combined findings" if combined else "supported exposure"),
            "confirmed":"; ".join(titles)+f". {len(findings)} separately classified finding(s).",
            "interpretation":"Review the conditions together. Co-occurrence does not establish shared cause or increased severity." if combined else None,
            "finding_kind":"co_occurrence" if combined else "classified_exposure",
            "risk_severity":None if combined else findings[0]["risk_severity"],
            "classification_verified":not combined,"count":len(findings),"denominator":None,
            "conditions":titles,"limitation":"Current snapshot only; each condition retains its own source and definition.",
            "source_refs":refs,"_provenance":"calculation",
            "_lineage":_lineage("Join distinct Risk-classified finding IDs by exact project identity; do not escalate severity",refs,ids=[r["id"] for r in findings])})
    affected=set(by);mapping={};groups=defaultdict(set)
    for link in e.get("project_customers",[]):
        if not link.get("verified") or link.get("project_id") not in projects:continue
        _refs(link,source_ids)
        if any(next(x for x in d["sources"] if x["id"]==ref).get("state")!="read_verified" for ref in link["source_refs"]):
            continue
        pid=link["project_id"]
        if pid in mapping and mapping[pid]["customer_id"]!=link["customer_id"]:
            raise ValueError("Conflicting project/customer membership")
        mapping[pid]=link
    for pid in affected:
        if pid in mapping:groups[mapping[pid]["customer_id"]].add(pid)
    for customer,ids in sorted(groups.items()):
        members=[mapping[p] for p in sorted(ids)]
        refs=sorted({x for r in members for x in r["source_refs"]}|{x for p in ids for r in by[p] for x in r["source_refs"]})
        label=members[0].get("customer_name",customer)
        rows.append({"entity":label,"headline":label+" — concentration of affected projects",
            "confirmed":f"{len(ids)} of {len(affected)} projects with supported exposure have a verified link to this client.",
            "interpretation":None,"finding_kind":"concentration","risk_severity":None,"classification_verified":False,
            "count":len(ids),"denominator":len(affected),"conditions":[],
            "limitation":f"{len(affected-set(mapping))} affected project(s) have no verified client link. Descriptive share only; no disproportionality or causation claim.",
            "source_refs":refs,"_provenance":"calculation",
            "_lineage":_lineage("Distinct affected project IDs grouped by verified customer; denominator is distinct affected projects, not finding rows",refs,ids=sorted(ids))})
    if rows:
        _panel(d,"insights","Synthesized findings",rows,
            "Confirmed findings and separately labeled interpretation. Native status, classified exposure, co-occurrence and concentration are not interchangeable.")

def build_pm(d,e,pm):
    if pm.get("version")!=VERSION:raise ValueError("Unsupported dashboard input contract")
    src={s["id"]:s for s in d["sources"]};project_ids=list(d["snapshot"]["scope"]["project_ids"])
    mgr=pm.get("manager",{})
    if mgr.get("reference_verified") is not True or not mgr.get("id") or mgr.get("entity_type") not in {"employee","vendor"}:
        raise ValueError("Exact authorized PM entity reference must be resolved upstream")
    mgrrefs=_refs(mgr,src)
    by={}
    for r in pm.get("projects",[]):
        pid=r.get("project_id")
        if pid not in project_ids or pid in by:raise ValueError("Duplicate/out-of-scope PM project")
        if r.get("membership_verified") is not True or r.get("manager_id")!=mgr["id"] or r.get("manager_type")!=mgr["entity_type"]:
            raise ValueError("Project manager membership is not exact")
        _refs(r,src);by[pid]=r
    population_complete=pm.get("population_complete") is True and set(by)==set(project_ids)
    _panel(d,"pm-context","Project manager portfolio context",[{
        "manager":mgr.get("display_name",mgr["id"]),"manager_type":mgr["entity_type"],
        "definition":pm.get("population_definition","Permission-visible projects in frozen request scope"),
        "population_state":"complete" if population_complete else "incomplete",
        "limitation":None if population_complete else "Directory enumeration/membership incomplete; expected projects are retained.",
        "source_refs":mgrrefs}], "Exact resolved PM binding. Directory inactivity and lifecycle status are separate.",complete=population_complete)
    tasks=m.task_metrics(e.get("tasks",[]),d["snapshot"]["as_of"],d["snapshot"]["timezone"])
    # task count is zero only with an independently asserted exhaustive task population.
    tasks_complete=pm.get("task_population_complete") is True and not tasks["unresolved"]
    overdue=defaultdict(list)
    for task in tasks["overdue"]:overdue[task["project_id"]].append(task)
    if any(p not in project_ids for p in overdue):raise ValueError("Task outside PM scope")
    risks=defaultdict(list)
    for r in e.get("risk_findings",[]):
        if r.get("classification_verified") is True:risks[r["project_id"]].append(r.get("title","Classified risk"))
    native=_native_by_project(d)
    project_rows=[];financial_rows=[];timeline=[];totals=defaultdict(list);insight_rows=[]
    for pid in project_ids:
        r=by.get(pid,{});refs=r.get("source_refs",mgrrefs)
        label=r.get("project_name",pid);life=r.get("lifecycle",{})
        status=life.get("value") if life.get("verified") is True else "unknown"
        if status not in {"active","upcoming","closed","other","unknown"}:raise ValueError("Unknown normalized lifecycle")
        sched=r.get("schedule",{})
        dates={}
        for k in ("start","end"):
            value=sched.get(k) if sched.get(k+"_verified") is True else None
            if value is not None:date.fromisoformat(value)
            dates[k]=value
        if dates["end"] and sched.get("end_basis") not in {"calculated_project_end","scheduled_project_end","latest_effective_task_due"}:
            raise ValueError("Unverified timeline endpoint meaning")
        limitation=[];vals={};raws={};defs={}
        for key in MEASURES:
            val,raw,issue=_measure(r.get("measures",{}).get(key),key,src)
            vals[key]=val;raws[key]=raw
            if raw:
                refs=sorted(set(refs)|set(raw["source_refs"]))
                defs[key]=raw.get("definition","Unverified definition")
            if issue:limitation.append(key+": "+issue)
        financial_valid=r.get("financial_comparison_verified") is True and bool(r.get("financial_comparison_basis"))
        contexts=[raws[x] for x in ("committed_revenue","recognized_revenue","actual_cost")]
        financial_valid=financial_valid and all(contexts) and all(_compatible(contexts[0],x) for x in contexts[1:])
        cur=raws["contract_value"].get("currency") if raws["contract_value"] else None
        labels=[]
        cv,ec=vals["contract_value"],vals["estimated_cost"]
        gapok=r.get("estimate_contract_comparison_verified") is True and _compatible(raws["contract_value"],raws["estimated_cost"])
        if cv is not None and m.number(cv)==0 and (
            (ec is not None and m.number(ec)>0) or
            (vals["actual_hours"] is not None and m.number(vals["actual_hours"])>0)):
            labels.append("Zero recorded contract measure with cost/time evidence; cause not established, not a confirmed loss.")
        if gapok and cv is not None and ec is not None and m.number(ec)>m.number(cv):
            labels.append("Estimated cost exceeds the verified contract measure by "+m.decimal_text(m.number(ec)-m.number(cv))+" "+str(cur)+".")
        ph,ah=vals["planned_hours"],vals["actual_hours"]
        if r.get("hours_comparison_verified") is True and ph is not None and ah is not None and m.number(ah)>m.number(ph):
            delta=m.number(ah)-m.number(ph)
            pct=m.decimal_text(delta*100/m.number(ph)) if m.number(ph)>0 else "undefined (zero planned hours)"
            labels.append("Actual hours exceed comparable planned hours by "+m.decimal_text(delta)+" h; percentage "+pct+".")
        num=len(overdue[pid]) if tasks_complete else None
        oldest=max((t["days_overdue"] for t in overdue[pid]),default=0) if tasks_complete else None
        if num:labels.append(f"{num} overdue executable leaf tasks; oldest {oldest} local days late.")
        labels+=["Risk finding: "+x for x in risks[pid]]
        labels+=["Native "+str(t)+": "+s+"; not a calculated severity." for t,s,_ in native[pid]]
        refs=sorted(set(refs)|{x for _,_,rr in native[pid] for x in rr}|{x for q in e.get("risk_findings",[]) if q.get("project_id")==pid for x in q.get("source_refs",[])}
                    |{x for q in e.get("tasks",[]) if q.get("project_id")==pid for x in q.get("source_refs",[])})
        attention="review findings" if labels else ("none found in evaluated inputs" if population_complete and tasks_complete and d["coverage"]["state"]=="Complete" else "coverage limited")
        planstate=r.get("plan_state") if r.get("plan_state_verified") is True else "unknown"
        if planstate not in {"present","absent","unknown"}:raise ValueError("Unknown plan state")
        project_rows.append({"project_id":pid,"project":label,"client":r.get("client"),
            "status":status,"plan_state":planstate,"scheduled_start":dates["start"],"scheduled_end":dates["end"],
            "end_basis":sched.get("end_basis"),"overdue_tasks":num,"oldest_days_late":oldest,
            "planned_hours":ph,"hours_logged":ah,"contract_value":cv,"estimated_cost":ec,
            "actual_cost":vals["actual_cost"],"recognized_revenue":vals["recognized_revenue"],
            "committed_revenue":vals["committed_revenue"],"currency":cur,"attention_kind":attention,
            "findings":labels,"limitation":limitation+([] if tasks_complete else ["Task population/definitions incomplete; counts unavailable."]),
            "measure_definitions":defs,"source_refs":refs,"_provenance":"calculation",
            "_lineage":_lineage("Verified per-project measurements; task counts reuse task_metrics. Numeric differences are not automatic risk severity.",refs,ids=[pid])})
        actual=raws["actual_cost"] or {}
        financial_rows.append({"project_id":pid,"project":label,
            "currency":contexts[0].get("currency") if contexts[0] else None,
            "book":contexts[0].get("book") if contexts[0] else None,
            "period":contexts[0].get("period") if contexts[0] else None,
            "committed_revenue":vals["committed_revenue"] if financial_valid else None,
            "recognized_revenue":vals["recognized_revenue"] if financial_valid else None,
            "actual_cost":vals["actual_cost"] if financial_valid else None,
            "cost_label":"Actual labor cost only" if actual.get("semantic")=="actual_labor_cost" else "Actual project cost",
            "comparison_basis":r.get("financial_comparison_basis") if financial_valid else None,
            "limitation":None if financial_valid else "Financial comparison definitions/currency/book/period not aligned; inspect separate measures.",
            "measure_definitions":defs,"source_refs":refs})
        timeline.append({"project_id":pid,"project":label,"status":status,"scheduled_start":dates["start"],"scheduled_end":dates["end"],
            "end_basis":sched.get("end_basis"),"attention_kind":attention,
            "limitation":None if all(dates.values()) else "Recorded schedule incomplete; no dates invented.","source_refs":refs})
        for key,raw in raws.items():
            if not raw:continue
            ctx=tuple(raw.get(k,"hours" if k=="currency" and key.endswith("hours") else None) for k in ("currency","book","period","basis"))
            totals[(key,*ctx)].append((pid,vals[key],raw))
        if labels:
            insight_rows.append({"entity":label,"headline":label+" — review findings","confirmed":" ".join(labels),
                "interpretation":None,"finding_kind":"mixed_labeled_observations","risk_severity":None,"classification_verified":False,
                "count":None,"denominator":None,"conditions":labels,"limitation":"Numeric mismatches, native statuses and Risk conclusions retain distinct meanings.",
                "source_refs":refs,"_provenance":"calculation","_lineage":_lineage("Present sourced project-level observations and compatible numerical differences without invented severity",refs,ids=[pid])})
    _panel(d,"pm-projects","Projects — complete scoped directory",project_rows,
        "All projects remain present, including zero-task and incomplete records. Filters affect display only.",complete=population_complete and tasks_complete)
    _panel(d,"pm-financial","Financial overview — per-project measures",financial_rows,
        "Committed revenue, recognized revenue and actual cost are different measures. Select one compatible project, not mixed currencies.")
    _panel(d,"pm-timeline","Recorded project timeline",timeline,
        "Recorded start/end basis per project. Retain unfinished past-end projects; no schedule forecasts.")
    rows=[]
    for (key,cur,book,period,basis),items in sorted(totals.items(),key=lambda x:str(x[0])):
        values=[m.number(v) for _,v,_ in items if v is not None];expected=len(items)
        mapped={pid for group_key,group_items in totals.items() if group_key[0]==key for pid,_,raw in group_items}
        unassigned=len(set(project_ids)-mapped)
        known=m.decimal_text(sum(values,m.number(0))) if values else None
        complete=population_complete and len(values)==expected
        rr=sorted({x for _,_,raw in items for x in raw["source_refs"]})
        rows.append({"measure":key,"value":known if complete else None,"known_subtotal":known,
            "currency":cur,"book":book,"period":period,"basis":basis,
             "evaluated":len(values),"expected":expected,"unavailable":expected-len(values),
            "scope_expected":len(project_ids),"unassigned_context":unassigned,
            "definition":"Complete compatible-context group total only when its values are verified; known subtotal and unassigned-context projects are separate.",
            "source_refs":rr,"_provenance":"calculation","_lineage":_lineage("Sum compatible project-level values once; never aggregate currencies or sum parent/child rollups",rr,ids=[x[0] for x in items])})
    if rows:_panel(d,"pm-totals","Compatible totals and known subtotals",rows,"No cross-currency grand totals; each denominator remains explicit.")

    # Relevant PM measures become optional overview cards; all remain in supplemental evidence.
    pmcards=[]
    def add_card(cid,title,value,unit,definition,denominator=None,period=None,refs=None,complete=True):
        rr=refs or sorted(src);known=complete and d["coverage"]["state"] in {"Complete","Limited"}
        pmcards.append({"kind":"kpi","id":cid,"title":title,"value":value,"unit":unit,
            "scope":d["snapshot"]["scope"]["label"],"as_of":d["snapshot"]["as_of"],
            "timezone":d["snapshot"]["timezone"],"period":period or d["snapshot"]["window"]["label"],
            "state":"unavailable" if value is None else ("complete" if known else "partial"),
            "limitations":[] if known else ["Known subset or unverified inputs; see denominator and evidence."],
            "denominator":denominator,"definition":definition,"provenance":"calculation",
            "population_basis":"scoped_evaluated" if known else "known_subset",
            "source_refs":rr,"lineage":_lineage(definition,rr,unit,project_ids),
            "native_status":None,"risk_severity":None})
    add_card("pm-total","Projects in scope",len(project_ids),"projects","Count unique projects in the frozen authorized directory",len(project_ids),complete=population_complete)
    status_complete=population_complete and all(r["status"]!="unknown" for r in project_rows)
    for state,title in (("active","Active right now"),("upcoming","Upcoming")):
        add_card("pm-"+state,title,sum(r["status"]==state for r in project_rows) if status_complete else None,"projects",
                 "Count projects with verified "+state+" lifecycle, not directory inactivity",len(project_ids),complete=status_complete)
    add_card("pm-overdue","Overdue tasks",len(tasks["overdue"]) if tasks_complete else None,"tasks",
             "Distinct incomplete executable leaf tasks past their effective local due date",complete=tasks_complete)
    for key,title,unit in (("actual_hours","Hours logged","hours"),("contract_value","Contract value","currency"),("estimated_cost","Estimated cost","currency")):
        groups=[r for r in rows if r["measure"]==key]
        if len(groups)==1:
            g=groups[0]
            add_card("pm-"+key,title,g["value"],unit if unit!="currency" else g["currency"],
                     g["definition"],g["expected"],g["period"],g["source_refs"],
                     complete=population_complete and g["unassigned_context"]==0 and g["unavailable"]==0)
        else:
            add_card("pm-"+key,title,None,unit,"No single compatible complete-context total; separate currencies/periods remain in the totals table.",len(project_ids),complete=False)
    d["cards"]=pmcards+d["cards"]

    if insight_rows:
        existing=next((p for p in d["panels"] if p["id"]=="insights"),None)
        if existing:
            d["panels"].remove(existing)
            # PM synthesis includes exact domain facts; retain preceding cross-cutting insights.
            for row in existing["rows"]:
                insight_rows.append({**row["values"],"source_refs":row["source_refs"],"_provenance":row["provenance"],"_lineage":row["lineage"]})
        _panel(d,"insights","Synthesized findings",insight_rows,
            "Confirmed observations and optional interpretation. No subjective severity escalation.")
    if not population_complete:
        d["limitations"].append("PM directory population incomplete; requested project placeholders retained.")
        d["coverage"]["state"]="Incomplete"
        d["coverage"]["errors"].append("PM directory not reconciled with frozen project population.")
        for card in d["cards"]:
            if card["state"]=="complete":card["state"]="partial"


def build_domain_insights(d):
    """Narrative from already calculated domain panels. No new source reads or causal labels."""
    added=[]
    for panel in d["panels"]:
        if d["profile"]=="operations" and panel["id"]=="capacity":
            for row in panel["rows"]:
                v=row["values"]
                if v.get("state")!="verified_planned_overutilization" or v.get("complete") is not True:continue
                added.append({"entity":v.get("display_resource",v["resource_key"]),
                   "headline":"Dated planned work exceeds verified daily capacity",
                   "confirmed":f'{v["known_planned_hours"]} planned hours versus {v["net_capacity_hours"]} net capacity hours on {v["date"]}; utilization {v["utilization_pct"]}%.',
                   "interpretation":"Review the work scheduled for this date; this finding does not establish a shortage on every project day.",
                   "finding_kind":"calculated_variance","risk_severity":None,"classification_verified":False,
                   "count":None,"denominator":None,"conditions":["dated planned capacity exceedance"],
                   "limitation":"Not a native coverage color, automatic assignment, or severity escalation.",
                   "source_refs":row["source_refs"],"_provenance":"calculation","_lineage":row.get("lineage")})
        if d["profile"]=="financial" and panel["id"].startswith("performance-"):
            for row in panel["rows"]:
                v=row["values"];gap=v.get("cost_variance")
                if gap is None or m.number(gap)<=0:continue
                added.append({"entity":v.get("project",v["project_id"]),
                   "headline":"Recorded actual cost exceeds the compatible approved budget",
                   "confirmed":f'{v.get("posted_actual_cost")} actual cost versus {v.get("approved_budget")} approved budget; difference {gap} {v["currency"]}, period {v["period"]}, book {v["book"]}.',
                   "interpretation":"Review the supported cost detail against the approved baseline; the variance alone does not establish a scope change.",
                   "finding_kind":"calculated_variance","risk_severity":None,"classification_verified":False,
                   "count":None,"denominator":None,"conditions":["compatible cost/budget variance"],
                   "limitation":"Not a forecast, cash position, or independently classified risk.",
                   "source_refs":row["source_refs"],"_provenance":"calculation","_lineage":row.get("lineage")})
    if not added:return
    existing=next((p for p in d["panels"] if p["id"]=="insights"),None)
    if existing:
        d["panels"].remove(existing)
        added=[{**r["values"],"source_refs":r["source_refs"],"_provenance":r["provenance"],"_lineage":r.get("lineage")}
               for r in existing["rows"]]+added
    _panel(d,"insights","Synthesized findings",added,
        "Confirmed domain calculations with explicit, optional interpretation. Source dates and limitations remain separate.")
