#!/usr/bin/env python3
"""VISUAL-2.0.0: build an evidence-backed presentation dataset, without account calls.
Reuse PM-4.0.0 gates/helpers. This is a local structural check, not authenticated evidence.
"""
from __future__ import annotations
from copy import deepcopy
from datetime import date, datetime
from pathlib import Path
import argparse, hashlib, json
import completion_gate as request_gate
import risk_gate
import indicator_tools
import coverage_detail
import capacity_tools
import project_plan_calculations as sow_tools
import visual_metrics as m
import review_depth
import review_metrics

VISUAL = "VISUAL-2.0.0"
RUNTIME = "PM-4.0.0"
OWNERS = {
    "portfolio-health":"project-portfolio-health-assistant",
    "operations":"project-operations-assistant",
    "operations-sow":"project-operations-assistant",
    "risk":"project-risk-assistant",
    "financial":"project-financial-assistant",
}
OWNERS={key:value for key,value in OWNERS.items() if key in {"financial","risk"}}
HERE=Path(__file__).resolve().parent
SHARED=HERE.parent/"references/shared"
# One reviewed publisher serves flat, category-mounted and runbook copies.
import importlib.util as _publication_import
import sys as _publication_sys
_publication_sys.dont_write_bytecode = True
_publication_candidates = [p / 'publication.py' if p.name == 'shared' else p / 'shared' / 'publication.py'
                           for p in Path(__file__).resolve().parents]
_publication_path = next((p for p in _publication_candidates if p.is_file()), None)
if _publication_path is None:
    raise ImportError('Required shared/publication.py is unavailable')
_publication_spec = _publication_import.spec_from_file_location('suiteskills_safe_publication', _publication_path)
_publication_module = _publication_import.module_from_spec(_publication_spec)
_publication_spec.loader.exec_module(_publication_module)
publish_file = _publication_module.publish_file
cli_inputs = _publication_module.cli_inputs

def digest(obj):
    return hashlib.sha256(json.dumps(obj,sort_keys=True,ensure_ascii=False,separators=(",",":"),allow_nan=False).encode()).hexdigest()

def select_mode(*, broad=False, explicit_visual=False, renderer_available=False, render_only=False,
                inline_available=False, artifact_available=False, text_requested=False,
                misrepresents=False, reason=None, has_findings=True,
                presence_only=False, single_sentence=False, single_fact=False, single_row=False,
                answer_complete=True, data_point_count=None, structured_detail=False,
                coverage_gap=False, is_list=False, comparison=False):
    """v12 HTML-first. A one-row flag is never evidence that there is only one fact.
    Trusted normalization supplies answer characteristics; helpers perform no account access.
    A later explicit user format instruction outranks this default, not privacy/evidence controls.
    """
    flags=(broad,explicit_visual,renderer_available,render_only,inline_available,artifact_available,
        text_requested,misrepresents,has_findings,presence_only,single_sentence,single_fact,single_row,
        answer_complete,structured_detail,coverage_gap,is_list,comparison)
    if any(type(x) is not bool for x in flags):raise ValueError("Explicit boolean visual flags required.")
    if data_point_count is not None and (type(data_point_count) is not int or data_point_count<0):
        raise ValueError("Invalid answer data-point count")
    if misrepresents and not reason:raise ValueError("A specific data-representation limitation is required.")
    if text_requested:
        return {"mode":"markdown","retrieve_again":False,"reason":"Explicit current-user text-only override, not a default downgrade.",
                "note":"Retain identical audience/evidence safeguards."}
    simple=(single_sentence and answer_complete and (single_fact or presence_only) and
            data_point_count==1 and not any((broad,explicit_visual,render_only,structured_detail,
                                            coverage_gap,is_list,comparison)))
    if simple:
        return {"mode":"concise","retrieve_again":False,"reason":"One complete fact in one sentence; no further structured detail.",
                "note":"Neutral wording with essential source context; not a generic one-row exception."}
    note=("Use a truthful table-led HTML view; do not draw the unsuitable chart." if misrepresents
          else "HTML is required for structured details; do not infer a renderer exists.")
    if inline_available:
        return {"mode":"inline","retrieve_again":False,"reason":reason if misrepresents else None,"note":note}
    if artifact_available or renderer_available:
        return {"mode":"html","retrieve_again":False,"reason":reason if misrepresents else None,"note":note}
    return {"mode":"unavailable","retrieve_again":False,
            "reason":"HTML delivery unavailable: no supported inline renderer or deliverable HTML artifact channel.",
            "note":"State the delivery limitation. Do not claim a dashboard or silently substitute a data table."}

def snapshot_compatible(old,new):
    """Layout-only changes are outside this envelope; any envelope change revalidates."""
    return digest(old)==digest(new)

def all_refs(rows):
    return sorted({ref for r in rows for ref in r.get("source_refs",[])})

def coverage(payload):
    errors=[]
    evidence=payload.get("evidence",{})
    if payload["profile"] in {"operations-sow","financial"} and evidence.get("plan") and not payload["snapshot"]["scope"]["project_ids"]:
        plan=evidence.get("plan")
        if not plan:
            return {"state":"Incomplete","errors":["No source-only plan supplied"],"request_gate":None,
                    "risk_gate":None,"source_checks":[],"obligations":[],"risk_rows":[]}
        val=sow_tools.validate(plan)
        return {"state":"Plan only" if val["valid"] else "Incomplete",
                "errors":val.get("errors",[]),
                "request_gate":None,"risk_gate":None,"source_checks":[],
                "obligations":deepcopy(plan.get("source_obligations",[])),"risk_rows":[],
                "plan_validation":val,"note":"No existing project population; native status is not invented."}
    req,res=payload.get("request"),payload.get("result")
    if not req or not res:
        return {"state":"Incomplete","errors":["Frozen request and result ledgers not supplied"],
                "request_gate":None,"risk_gate":None,"source_checks":[],"obligations":[],"risk_rows":[]}
    try:
        # Rendering a focused lookup must not initiate broad review-depth retrieval.
        # The ORIGINAL signed request (not a display flag) determines the applicable gate.
        focused=(req.get("context",{}).get("completeness_mode")=="focused"
                 and len(req.get("obligations",[]))==1
                 and "review_plan" not in req and "review_depth" not in res)
        if focused:
            gate=request_gate.evaluate(req,res)
            gate["depth"]={"version":review_depth.VERSION,"complete":gate.get("gate_passed") is True,
                "limited":False,"rows":[],"basis":"Focused request/source/native/discovery gates; no broad depth claim."}
        else:
            gate=review_depth.evaluate(req,res,profile=payload["profile"],evidence=evidence,sources=payload["sources"])
    except (ValueError,KeyError,TypeError) as exc:
        gate={"gate_passed":False,"errors":[str(exc)],"risk_gate":None}
    context=req.get("context",{})
    snap=payload["snapshot"]
    if set(context.get("project_ids",[]))!=set(snap["scope"]["project_ids"]):
        errors.append("Visual project population differs from the gated root.")
    if set(context.get("resource_keys",[]))!=set(snap["scope"].get("resource_keys",[])):
        errors.append("Visual resource population differs from gated root.")
    for k in ("as_of","timezone"):
        if context.get(k)!=snap.get(k):errors.append("Visual clock differs from gated "+k)
    if snap.get("context_fingerprint")!=request_gate.signature(context):
        errors.append("Snapshot fingerprint differs from gated context.")
    if snap.get("request_signature")!=request_gate.signature(req):
        errors.append("Snapshot request signature differs from frozen obligations.")
    errors += gate.get("errors",[])
    rg=gate.get("risk_gate")
    if not rg and res.get("risk_review"):
        try:rg=risk_gate.evaluate(res["risk_review"])
        except (ValueError,KeyError,TypeError) as exc:
            rg={"gate_passed":False,"errors":[str(exc)]}
    limited=bool(rg and rg.get("unavailable_evaluations",0)) or bool(gate.get("depth",{}).get("limited"))
    if any(r.get("terminal_state")=="Unavailable after alternatives" for r in res.get("rows",[])):limited=True
    state="Incomplete" if errors or not gate.get("gate_passed") else ("Limited" if limited else "Complete")
    return {"state":state,"errors":errors,"request_gate":gate,"risk_gate":rg,
            "source_checks":deepcopy(res.get("risk_review",{}).get("searches",[])),
            "obligations":deepcopy(res.get("rows",[])),
            "risk_rows":deepcopy((rg or {}).get("coverage_rows",[])),
            "note":"Execution complete is not assurance that unavailable evidence is clear."}

def build(payload):
    profile=payload["profile"]
    if profile not in OWNERS:raise ValueError("Unknown visual profile")
    s=deepcopy(payload["snapshot"]);sources=deepcopy(payload["sources"]);e=payload.get("evidence",{})
    if not sources:raise ValueError("At least a source or an explicit unavailable-source record is required.")
    if len({r["id"] for r in sources})!=len(sources):raise ValueError("Duplicate source identity")
    refs=[r["id"] for r in sources];refset=set(refs)
    cov=coverage(payload)
    incomplete_sources=[r["id"] for r in sources if r.get("pages_complete") is not True or r.get("periods_complete") is not True]
    if incomplete_sources:
        cov["state"]="Incomplete"
        cov["errors"].append("Incomplete visual source pages/periods: "+", ".join(incomplete_sources))
    out={"visual_version":VISUAL,"runtime_contract":RUNTIME,"profile":profile,"owner":OWNERS[profile],
         "title":payload.get("title",profile.replace("-"," ").title()),
         "snapshot":s,"sources":sources,"coverage":cov,"cards":[],"panels":[],
         "actions":[],"limitations":list(payload.get("limitations",[])),
         "selection":{"kind":"display_subset_only","root_population_unchanged":True},
         "requested_recipe":payload.get("recipe")}
    unavailable_visual_sources=[r for r in sources if r.get("state")!="read_verified"]
    if unavailable_visual_sources:
        out["limitations"].append("Some supplied visual sources are unavailable or unverified; inspect attempts.")
        exhausted=all(r.get("alternatives_accounted_for") is True and r.get("attempts") and r.get("limitations")
                      and r.get("remaining_usable_channels")==[] for r in unavailable_visual_sources)
        if cov["state"] in {"Complete","Limited"}:
            cov["state"]="Limited" if exhausted else "Incomplete"
        if not exhausted:
            cov["errors"].append("Visual source alternatives or definition remain unresolved.")
    rootcomplete=cov["state"] in {"Complete","Limited","Plan only"} and not incomplete_sources
    projects=s["scope"]["project_ids"]
    names={p["id"]:p.get("name",p["id"]) for p in e.get("projects",[])}
    def source_complete(rr):
        return bool(rr) and all(x in refset and next(z for z in sources if z["id"]==x).get("state")=="read_verified" for x in rr)
    def card(cid,title,value,unit,definition,rr=None,inputs=None,provenance="calculation",denom=None,complete=True,context=None,scope_label=None):
        rr=rr or refs
        known=rootcomplete and complete and source_complete(rr)
        state=("complete" if known else "partial") if value is not None else "unavailable"
        out["cards"].append({
            "kind":"kpi","id":cid,"title":title,"value":value,"unit":unit,"scope":scope_label or s["scope"]["label"],
            "as_of":s["as_of"],"timezone":s["timezone"],"period":(context or {}).get("period",s["window"]["label"]),
            "source_refs":rr,"state":state,"limitations":[] if known else ["Known subset or unavailable inputs; inspect source coverage."],
            "denominator":denom,"definition":definition,"provenance":provenance,
            "population_basis":"scoped_evaluated" if known else "known_subset",
            "lineage":{"formula":definition,"grain":unit,"filters":s.get("filters",[]),
                       "input_row_refs":inputs or [],"context":context or s.get("context",{}),"source_refs":rr},
            "native_status":None,"risk_severity":None})
    def panel(pid,title,kind,rows,columns=None,description="",chart=None,complete=True,rr=None,confirmed_empty=False):
        rows=deepcopy(rows)
        rr=rr or all_refs(rows) or refs
        records=[]
        for i,row in enumerate(rows):
            sources_row=row.pop("source_refs",None) or rr
            records.append({"id":str(row.get("id",row.get("task_id",row.get("action_id",i+1)))),
                "values":row,"source_refs":sources_row,
                 "provenance":row.pop("_provenance","observation") if "_provenance" in row else "observation",
                "lineage":row.pop("_lineage",None)})
        if columns is None:
            keys=list(dict.fromkeys(k for r in records for k in r["values"] if not k.startswith("_")))
            columns=[{"key":k,"label":k.replace("_"," ").title()} for k in keys]
        state="complete" if rootcomplete and complete and source_complete(rr) else "partial"
        p={"id":pid,"title":title,"kind":kind,"description":description,"state":state,"columns":columns,
           "rows":records,"source_refs":rr,"chart":chart,
           "limitations":[] if state=="complete" else ["Partial or unavailable evidence; not an exact complete-population total."],
           "definition":description or title,"grain":"one row per displayed natural-grain key",
           "filters":s.get("filters",[]),"context":s.get("context",{}),
           "window":s["window"]}
        if not rows:
            if confirmed_empty and rootcomplete and complete and source_complete(rr):
                p["state"]="complete";p["limitations"]=["Confirmed empty for this supplied, evaluated scope; no matching rows."]
            else:
                p["state"]="unavailable";p["limitations"]=["Required normalized evidence is missing or incomplete; no empty-result conclusion inferred."]
        out["panels"].append(p)
    def cols(*pairs):return [{"key":k,"label":v} for k,v in pairs]
    # Separate required depth proof from optional presentation selection.
    depth=(cov.get("request_gate") or {}).get("depth",{})
    if depth.get("rows"):
        for gap in depth["rows"]:
            if gap["state"]=="unavailable":
                out["limitations"].append(
                    gap["stage"]+": "+gap["missing_evidence"]+". "+gap["limitation"]+
                    " Next step: "+str(gap["remediation"])+" Owner: "+str(gap["remediation_owner"])+".")
        panel("review-depth","Required record-level evidence coverage","table",depth["rows"],
            description="Intent-derived stages with exact source populations. Missing stages cannot be completed by rendering.",
            complete=depth.get("complete") is True)
    tasks=None;assignments=None;native=None;cap=None
    if "tasks" in e:
        tasks=m.task_metrics(e["tasks"],s["as_of"],s["timezone"])
        if tasks["unresolved"]:out["limitations"].append(f'{len(tasks["unresolved"])} tasks lack verified due/status evidence.')
    if all(k in e for k in ("tasks","assignments","resources")):
        assignments=m.assignment_metrics(e["tasks"],e["assignments"],e["resources"])
    if "native_input" in e and profile in {"portfolio-health","risk","operations"}:
        native=indicator_tools.select_results(**e["native_input"])
        if set(e["native_input"]["projects"])!=set(projects):raise ValueError("Native intake population differs from snapshot")
        if e["native_input"]["cutoff"]!=s["as_of"]:raise ValueError("Native intake clock differs from snapshot")
    if profile in {"portfolio-health","risk"}:
        card("projects","Projects in scope",len(set(projects)),"projects","Count distinct resolved authorized project IDs",denom=len(set(projects)))
        findings=e.get("risk_findings",[])
        affected={r["project_id"] for r in findings if r.get("classification_verified") is True and r.get("risk_severity") in {"High","Medium","Low"}}
        if "risk_findings" in e:
            card("exposure","Projects with supported exposure",len(affected),"projects","Distinct projects with Risk-classified current exposure; Unrated excluded",inputs=sorted(affected),denom=len(set(projects)))
            panel("exposure","Supported exposure — not native status","table",findings,
                  description="Classification is supplied by Risk; counts do not manufacture severity.")
        if tasks:
            card("overdue","Overdue leaf tasks",len(tasks["overdue"]),"tasks","Count unique incomplete executable leaf tasks past effective local due date",
                 inputs=[r["task_id"] for r in tasks["overdue"]],complete=not tasks["unresolved"])
            card("longest-delay","Longest overdue task delay",
                 max((r["days_overdue"] for r in tasks["overdue"]),default=0),"days",
                 "Maximum local days overdue among evaluated incomplete executable leaf tasks; not severity",
                 complete=not tasks["unresolved"])
            aging=[{"band":band,"tasks":count,"_provenance":"calculation",
                "_lineage":{"formula":"Count distinct incomplete executable leaf tasks in nonoverlapping local-day age band",
                "input_row_refs":[r["task_id"] for r in tasks["overdue"] if r["aging_band"]==band]}}
                for band,count in tasks["aging"].items()]
            panel("aging","Overdue aging","bar",aging,description="Count distinct overdue executable leaf tasks by local-day band. Due today is separate. Counts are not severity.",
                  chart={"label":"band","series":[{"key":"tasks","label":"Tasks","unit":"tasks"}]},complete=not tasks["unresolved"])
            project_rows=[{"project":names.get(p,p),"overdue_tasks":tasks["by_project"].get(p,0),"_provenance":"calculation",
                "_lineage":{"formula":"Count distinct overdue executable leaf task IDs in this project",
                "input_row_refs":[r["task_id"] for r in tasks["overdue"] if r["project_id"]==p]}} for p in projects]
            project_rows.sort(key=lambda row:(-row["overdue_tasks"],row["project"]))
            panel("attention","Project attention — overdue work","bar",project_rows,
                  chart={"label":"project","series":[{"key":"overdue_tasks","label":"Overdue leaf tasks","unit":"tasks"}]},
                  complete=not tasks["unresolved"])
            panel("combined","Late and above planned hours","table",tasks["late_and_over_hours"],
                  description="Observed overlap only; no inferred financial overrun, blocker, severity, critical path or cause.",
                  complete=not tasks["unresolved"],confirmed_empty=True)
            panel("schedule","Effective due dates and task evidence","table",tasks["rows"]+tasks["unresolved"],
                  cols(("title","Task"),("effective_due","Effective due date"),("due_state","State"),("days_overdue","Days overdue"),("effort_variance_hours","Effort variance · hours"),("limitation","Limitation")),
                  description="Raw dates and normalized rules remain in row evidence.")
        if assignments is not None:
            missing=[r for r in assignments if "no_assignment" in r["categories"] or "generic" in r["categories"]]
            card("unstaffed-tasks","Tasks needing assignment review",len(missing),"tasks",
                 "Distinct task rows with no assignment or generic-placeholder evidence, including mixed assignments; not total capacity shortage",
                 complete=all("unknown_assignment_population" not in r["categories"] for r in assignments),
                 inputs=[r["task_id"] for r in missing])
            panel("assignments","Assignment gaps and identities","table",assignments,
                  description="Mixed, unknown and ineligible states retained; named assignment is not capacity.")
        if e.get("project_customers") is not None and "risk_findings" in e:
            group={}
            for mapping in e["project_customers"]:
                if mapping.get("verified") is True and mapping.get("project_id") in affected:
                    group.setdefault(mapping["customer_id"],{"customer":mapping.get("customer_name",mapping["customer_id"]),"ids":set(),"source_refs":[]})
                    group[mapping["customer_id"]]["ids"].add(mapping["project_id"])
                    group[mapping["customer_id"]]["source_refs"]+=mapping.get("source_refs",[])
            panel("clients","Clients with supported project exposure","bar",
                [{"customer":r["customer"],"affected_projects":len(r["ids"]),"project_ids":sorted(r["ids"]),"source_refs":sorted(set(r["source_refs"])),"_provenance":"calculation",
                    "_lineage":{"formula":"Count distinct affected project IDs with verified customer links","input_row_refs":sorted(r["ids"])}} for r in group.values()],
                description="Distinct verified project/customer links; not a strategic ranking.",
                chart={"label":"customer","series":[{"key":"affected_projects","label":"Distinct affected projects","unit":"projects"}]})
        if profile=="portfolio-health":
            date_rows=[]
            for r in e.get("recorded_dates",[]):
                t=deepcopy(r)
                if not r.get("baseline_version") or r.get("dates_verified") is not True:
                    t["limitation"]="Recorded date/baseline not verified";t["baseline_date"]=t["current_date"]=None
                date_rows.append(t)
            panel("timeline","Recorded baseline and current dates","timeline",date_rows,
                cols(("label","Milestone / project"),("baseline_date","Baseline date"),("current_date","Recorded current date"),("baseline_version","Baseline version")),
                description="Recorded dates, not a new finish forecast.",
                chart={"label":"label","series":[{"key":"baseline_date","label":"Baseline","unit":"date"},{"key":"current_date","label":"Current recorded","unit":"date"}]})
            milestones=[]
            for r in e.get("milestones",[]):
                x=deepcopy(r)
                if r.get("acceptance_verified") is not True:
                    x["acceptance_state"]="not verified — task/effort completion is not acceptance"
                milestones.append(x)
            panel("milestones","Milestones and acceptance","table",milestones,
                description="Acceptance needs its own recorded requirement/state; completed effort is not acceptance.")
            deps=[]
            for r in e.get("dependencies",[]):
                if r.get("edge_verified") is True:deps.append(r)
                else:out["limitations"].append("Unverified dependency was not drawn; relation retained only as an unresolved source.")
            panel("dependencies","Verified dependencies","table",deps,description="Only explicit verified edges; no inferred critical path.")
            change=e.get("changes")
            if change:
                result=m.matched_changes(change["previous"],change["current"])
                panel("changes","Matched-snapshot changes","table",result["rows"],description="Reconciled snapshot comparison",complete=result["comparable"])
                out["limitations"]+=result["limitations"]
    if profile=="operations":
        if "capacity_input" in e:
            cap=m.daily_capacity(e["capacity_input"])
            ledger=cap["ledger"]
            if set(r["key"] for r in e["capacity_input"]["resources"])!=set(s["scope"]["resource_keys"]):
                raise ValueError("Daily resource population differs from snapshot")
            for key in ("start","end"):
                if ledger[key]!=s["window"][key]:raise ValueError("Capacity window differs from snapshot")
            card("shortage","Daily excess demand",cap["known_shortage_hours"],"hours",
                 "Sum max(plannedwork minus net calendar capacity, 0) over complete resource/day cells",complete=ledger["complete"])
            card("spare","Recorded spare hours — all scoped resources",cap["known_spare_hours"],"hours",
                 "Sum max(net capacity minus plannedwork, 0) over complete cells; does not offset a different day's shortage",complete=ledger["complete"])
            card("unknown-cells","Unknown capacity cells",cap["unknown_cells"],"resource-days",
                 "Count resource/day cells without complete demand and net capacity",denom=ledger["expected_resource_days"])
            directory={r["key"]:r for r in e["capacity_input"]["resources"]}
            capacity_rows=[{**r,"resource_kind":directory[r["resource_key"]].get("kind"),
                "resource_eligible":directory[r["resource_key"]].get("eligible"),
                "display_resource":directory[r["resource_key"]].get("name",r["resource_key"]),
                "_provenance":"calculation","_lineage":{
                "formula":"capacity_tools.daily_ledger: sum validated plannedwork; net compatible calendar after nonduplicated leave; ratio only if denominator > 0",
                "input_row_refs":[p["id"] for p in e["capacity_input"]["planned_rows"] if p["resource_key"]==r["resource_key"] and p["date"]==r["date"]]}} for r in ledger["rows"]]
            panel("capacity","Daily plannedwork and net capacity","matrix",capacity_rows,
                cols(("display_resource","Resource"),("resource_kind","Kind"),("resource_eligible","Eligible"),("date","Local workday"),("known_planned_hours","Planned hours"),("net_capacity_hours","Net capacity · hours"),("utilization_pct","Utilization %"),("capacity_balance_hours","Balance · hours"),("state","Evidence state")),
                description="Negative daily balance is not repaired by positive weekly net time; null is not zero.",
                chart={"label":"display_resource","day":"date","demand":"known_planned_hours","capacity":"net_capacity_hours","state":"state"},complete=ledger["complete"])
            if e.get("candidate_request"):
                c=capacity_tools.candidates(ledger=ledger,**e["candidate_request"])
                panel("candidates","Role and date-matched candidate comparison","table",c["eligible"]+c["excluded"],description=c["order_basis"])
            if e.get("placements"):
                scenario=m.placement_scenario(ledger,e["placements"])
                panel("placements","Proposed placements — scenario only","table",[{**r,"_provenance":"proposed"} for r in scenario["rows"]],description=scenario["basis"])
        queues=[]
        identity=s["scope"].get("exact_user",{})
        for r in e.get("queues",[]):
            x=deepcopy(r)
            if r.get("queue_kind") in {"my_tasks","my_approvals"}:
                exact=r.get("entity_type")==identity.get("entity_type") and str(r.get("entity_id"))==str(identity.get("entity_id"))
                if identity.get("verified") is not True or not exact or r.get("routing_verified") is not True:
                    x["queue_kind"]="unresolved personal routing"
            queues.append(x)
        panel("work","Work queues and responsibilities","table",queues,
            description="Personal assignments, manager responsibilities, routed approvals and follow-ups remain separate.")
        panel("approvals","Exact-user routed approvals","table",[r for r in queues if r.get("queue_kind")=="my_approvals"],
            description="Only verified current workflow routing; supervisor labels are insufficient.")
        if assignments is not None:panel("staffing","Staffing exceptions","table",assignments)
    if native is not None and profile in {"risk","operations","portfolio-health"}:
        native_rows=[]
        for p in native["pairs"]:
            selected=p.get("selected") or {}
            native_rows.append({"project":names.get(p.get("project"),p.get("project")),"indicator_type":p.get("type_id"),
                "native_status":p.get("native_status"),"native_severity":selected.get("severity"),
                "message":selected.get("message"),"selection_state":p["state"],
                "evaluated_at":selected.get("evaluated_at"),"modified_at":selected.get("lastmodifieddate"),
                "historical_alignment":p.get("historical_alignment"),"limitations":p.get("limitations",[]),
                "native_result":selected,"_provenance":"native"})
        panel("native","Native Project Indicators — separate from calculated exposure","table",native_rows,
            cols(("project","Project"),("indicator_type","Indicator type"),("native_status","Native status"),("native_severity","Native severity"),("message","Native message"),("selection_state","Evidence state")),
            description="Preserves Green, Yellow, Red, missing, unavailable and fresh/evaluated distinctions; no recoloring.",
            complete=native["native_inventory_complete"])
    if native is None and profile in {"risk","operations","portfolio-health"}:
        panel("native","Native Project Indicators — presentation inputs unavailable","table",[],
              description="Use root native-first investigation and alternatives; rendering cannot infer a status from missing inputs.",complete=False)
    if e.get("coverage_detail_input") and profile in {"risk","operations","portfolio-health"}:
        detail=coverage_detail.normalize(**e["coverage_detail_input"])
        panel("native-gap","Native remaining-work coverage detail","table",detail["rows"],description=detail["note"])
    if profile=="financial":
        if e.get("money") is not None:
            money=m.money_metrics(e["money"])
            missing_money_projects=set(projects)-{g["project_id"] for g in money}
            if missing_money_projects:
                out["limitations"].append("Financial evidence missing for scoped projects: "+", ".join(sorted(missing_money_projects)))
                panel("financial-gaps","Scoped projects without financial evidence","table",
                      [{"project":names.get(p,p),"state":"unavailable monetary context"} for p in sorted(missing_money_projects)],
                      description="These projects remain in scope; no zero amounts invented.",complete=False)
            rows=[]
            for g in money:
                r={k:g[k] for k in ("project_id","currency","book","period","basis","cost_variance","actual_margin","margin_pct")}
                r["project"]=names.get(g["project_id"],g["project_id"])
                r.update({kind:val["value"] for kind,val in g["measures"].items()})
                r.update(source_refs=g["source_refs"],measure_evidence=g["measures"],_provenance="calculation",
                    _lineage={"formula":"Sum nonoverlapping same-kind lines in identical project/currency/book/period/basis; variance=posted_cost-approved_budget; margin=recognized_revenue-posted_cost; margin_pct=100*margin/positive_recognized_revenue",
                    "input_row_refs":[x for val in g["measures"].values() for x in val["rows"]]})
                rows.append(r)
            # A panel per accounting context; all groups share scale only inside their own panel.
            groups={}
            for r in rows:groups.setdefault(tuple(r[k] for k in ("currency","book","period","basis")),[]).append(r)
            for n,(context,rr) in enumerate(groups.items()):
                ccy,book,period,basis=context
                panel("performance-"+str(n+1),f"Approved budget / posted cost · {ccy} · {book} · {period}","comparison",rr,
                    cols(("project","Project"),("approved_budget","Approved budget"),("posted_actual_cost","Posted actual cost"),("cost_variance","Actual minus budget"),("recognized_revenue","Recognized revenue"),("actual_margin","Actual margin"),("margin_pct","Margin %")),
                    description=f"{basis}. Commitments, receipts, invoices and cash are not added to posted cost.",
                    chart={"label":"project","series":[{"key":"approved_budget","label":"Approved budget","unit":ccy},{"key":"posted_actual_cost","label":"Posted cost","unit":ccy}]})
            if len(rows)==1:
                r=rows[0]
                for key,label in (("approved_budget","Approved budget"),("posted_actual_cost","Posted actual cost"),("actual_margin","Actual margin")):
                    card(key,label,r.get(key),r["currency"],"Compatible Financial measure: "+key,r["source_refs"],context={k:r[k] for k in ("currency","book","period","basis")},
                         scope_label=names.get(r["project_id"],r["project_id"]))
        for key,title in (("billing","Billing eligibility and holds"),("cash","Cash applications and invoice balances"),
                          ("procurement","Commitments, receipts and posted costs"),("revenue","Revenue reconciliation")):
            rows=m.financial_detail(e.get(key,[]),key)
            panel(key,title,"table",rows,description="Keep amount kinds, verified links, currencies, books and periods separate; no inferred totals or leakage.")
        panel("policy","Expense-policy evidence","table",m.policy_rows(e.get("policy",[])),
              description="Native-confirmed, complete rule-computed, candidate and not-determinable outcomes remain distinct from approval.")
        if e.get("plan"):
            review=sow_tools.commercial_review(e["plan"])
            panel("commercial","SOW commercial mapping — proposed setup, not actuals","table",review["components"] if isinstance(review,dict) else review,
                  description="Linked plan version and source terms; financial setup execution remains excluded.")
    if profile=="operations-sow":
        plan=e["plan"];valid=sow_tools.validate(plan)
        card("plan-version","Plan version",plan["version"],"version","Exact supplied SOW plan version",provenance="observation")
        empty_ledger={"plan_id":plan["plan_id"],"target":plan["target"],"events":[],"approved_action_ids":[]}
        report=sow_tools.report(plan,e.get("ledger",empty_ledger))
        card("plan-items","Plan items",report["plan_items"],"items","Count all actions, including excluded and deferred obligations")
        card("unverified","Unverified approved actions",len(report["unverified_approved_actions"]),"actions",
             "Approved subset actions lacking matching verified readback")
        sections=[
            ("source","1. Source and interpretation",plan.get("sources",[])+plan.get("source_obligations",[])),
            ("setup","2. Project setup and matches",[{"project_kind":plan["project_kind"],"target":plan["target"],"creation_route":plan["creation_route"],"plan_id":plan["plan_id"]}]),
            ("delivery","3. Delivery structure",[a for a in plan["actions"] if a["business_object"] in {"project","task","dependency"}]),
            ("people","4. People and capacity",[a for a in plan["actions"] if a["business_object"]=="assignment"]),
            ("commercial","5. Budgets and commercial setup",plan.get("commercial_components",[])),
            ("decisions","6. Decisions, exclusions and deferrals",plan.get("decisions",[])+[a for a in plan["actions"] if a["operation"] in {"Exclude","Defer"}]),
            ("preview","7. Exact execution preview",plan["actions"]),
        ]
        sow_columns={
            "source":cols(("obligation_id","Obligation"),("text","Source requirement"),("source_ref","Source reference"),("action_ids","Plan actions")),
            "setup":cols(("project_kind","Project branch"),("creation_route","Creation route"),("target","Account / environment"),("plan_id","Plan identity")),
            "delivery":cols(("action_id","Action"),("business_object","Work type"),("proposed_values","Proposed delivery values"),("dependencies","Dependencies"),("field_evidence","Value provenance")),
            "people":cols(("action_id","Action"),("proposed_values","Proposed staffing"),("dependencies","Prerequisites"),("validation_issues","Open checks")),
            "commercial":cols(("component_id","Component"),("model","Pricing model"),("amount_kind","Amount kind"),("amount","Amount"),("currency","Currency"),("source_ref","Source")),
            "decisions":cols(("decision_id","Decision"),("action_id","Action"),("operation","Disposition"),("disposition_reason","Reason"),("validation_issues","Open checks")),
            "preview":cols(("action_id","Action"),("operation","Proposed operation"),("business_object","Object"),("item_kind","Item kind"),("proposed_values","Exact proposed values"),("approval_scope","Approval scope"),("side_effects","Side effects")),
        }
        for pid,title,rows in sections:
            panel(pid,title,"table",[{**r,"_provenance":"proposed"} for r in rows],sow_columns[pid],
                  description="Versioned proposal; no approval or execution implied.",confirmed_empty=True)
        panel("readiness","Separate readiness judgments","table",[{
            "plan_validation":"valid" if valid["valid"] else "invalid",
            "account_validation":e.get("account_validation","not evaluated"),
            "exact_version_approval":e.get("approval_state","authority not independently verified"),
            "approved_subset_execution":report["approved_subset_execution"],
            "whole_plan_disposition":"all items reported",
            "delivery_readiness":report["delivery_readiness"],"billing_readiness":report["billing_readiness"],
            "live_risk":"no existing project population" if not projects else cov["state"]}])
        panel("reconciliation","Full SOW run reconciliation","table",report["rows"],
            cols(("action_id","Action"),("proposed_action","Operation"),("outcome","Actual outcome"),("target_id","Returned reference"),("reason_or_verification","Verification / reason"),("variance","Variance"),("next_action","Next action"),("owner","Owner")),
            description="A returned ID alone is not verified success; resolve unknown outcomes before retry.")
        counts=[{"outcome":o,"items":report["counts_by_outcome"].get(o,0),"_provenance":"calculation",
            "_lineage":{"formula":"Count all plan action IDs by sow_tools.report disposition; do not sum unlike item kinds as record counts",
                        "input_row_refs":[r["action_id"] for r in report["rows"] if r["outcome"]==o]}} for o in m.REPORT_OUTCOMES]
        panel("outcomes","All nine plan/run dispositions","bar",counts,
            chart={"label":"outcome","series":[{"key":"items","label":"Items","unit":"items"}]},
            description="Reporting every row is not execution success.")
        if e.get("prior_plan"):
            diff=sow_tools.diff(e["prior_plan"],plan)
            panel("changes","Prior / current plan differences","table",[{"comparison":diff}],
                description="Source provenance and confirmed edits retained; affected approval invalidated by the SOW lifecycle, not the renderer.")
    if cov.get("risk_rows"):
        riskrows=[{**r,"source_refs":refs} for r in cov["risk_rows"]]
        panel("discovery-coverage","Evidence-led investigation coverage","table",riskrows,
            cols(("search_id","Search"),("area","Business area"),("method","Method"),("state","State"),
                 ("expected","Scope members"),("evaluated","Evaluated"),("unavailable","Unavailable"),
                 ("candidate_count","Candidates"),("limitation","Limitation")),
            description="One row per planned search/partition, not project-by-check combinations. Completed searches do not establish that all possible risks are absent.",
            complete=bool(cov.get("risk_gate",{}).get("gate_passed")))
    if cov.get("obligations"):
        panel("obligations","Requested outputs — original order","table",
            [{"requested_part":r.get("obligation",{}).get("original_text",r.get("text","Source obligation")),
              "terminal_state":r.get("terminal_state","plan obligation"),
              "answer":r.get("answer",r),"limitations":r.get("limitations",[])} for r in cov["obligations"]],
            description="Preserved obligations; formatting cannot mark a pending analysis complete.")
    if cov.get("source_checks"):
        panel("source-coverage","Source pages, periods and alternatives","table",cov["source_checks"],
            description="Channel failure is not proof of feature absence; attempts and limitations are retained.")
    for original in e.get("actions",[]):
        action=deepcopy(original)
        if action.get("kind")!="action":raise ValueError("Action cards must use the existing card contract")
        action["control"]="display_only"
        out["actions"].append(action)
    if not out["panels"]:
        panel("missing","Required evidence not supplied","table",[])
    # Cards are deliberately few. Complete metric/detail evidence remains in panels.
    out["cards"]=out["cards"][:5]
    if not out["requested_recipe"]:
        priority={"portfolio-health":["attention","exposure","timeline"],"operations":["work","capacity","native"],
                  "operations-sow":["source","setup","delivery","people","commercial","decisions","preview"],
                  "risk":["exposure","native","aging"],"financial":["performance-1","financial-gaps"]}[profile]
        out["panels"].sort(key=lambda p:priority.index(p["id"]) if p["id"] in priority else len(priority))
    if out["requested_recipe"]:
        recipes=json.loads((HERE.parent/"references/shared/visual-config/recipes.json").read_text())["profiles"][profile]
        if out["requested_recipe"] not in {r["id"] for r in recipes}:raise ValueError("Unknown recipe for selected profile")
        # A recipe is a presentation preference, not a new source scope or reduced risk sweep.
        aliases={"plan":"source","preview":"preview","performance":"performance-1"}
        first=aliases.get(out["requested_recipe"],out["requested_recipe"])
        if not any(p["id"]==first for p in out["panels"]):
            selected=next(r for r in recipes if r["id"]==out["requested_recipe"])
            panel(first,selected["title"],"table",[],
                  description="Requested view lacks its required evidence: "+selected["input_requirement"],
                  complete=False)
            out["limitations"].append("Requested view "+out["requested_recipe"]+" is unavailable; no substitute result implied.")
        out["panels"].sort(key=lambda p:0 if p["id"]==first else 1)
    if "tasks" in e and profile in {"portfolio-health","risk"}:
        stage=next((x for x in depth.get("rows",[]) if x["stage"]=="task-effort"),{})
        if cov["state"]=="Incomplete" and any(t.get("project_id") not in projects for t in e["tasks"]):
            effort={"tasks":[],"projects":[],"definition":"Effort comparison unavailable: supplied task population differs from the frozen/displayed project scope."}
            out["limitations"].append(effort["definition"]+" No rows were silently filtered to claim a narrower complete answer.")
        else:
            effort=review_metrics.effort(e["tasks"],projects,population_complete=stage.get("state")=="exhausted" and depth.get("complete") is True)
        panel("effort-tasks","Whole-scope task effort — including completed work","table",effort["tasks"],
              description=effort["definition"],complete=stage.get("state")=="exhausted")
        panel("effort-projects","Project effort comparison","comparison",effort["projects"],
              description="Whole-scope plannedwork versus compatible actual recorded time. No allocation substitution; no causal/severity inference.",
              chart={"label":"project_id","series":[{"key":"planned_hours","label":"Planned hours","unit":"hours"},
                                                     {"key":"actual_hours","label":"Actual recorded hours","unit":"hours"}]},
              complete=stage.get("state")=="exhausted")
    import dashboard_views
    dashboard_views.enrich(out, payload)
    import fact_tiles
    answer_cards=fact_tiles.build_cards(payload, cov)
    if answer_cards is not None:out["cards"]=answer_cards
    out["content_sha256"]=digest(out)
    validate(out)
    return out

def validate(data):
    """Stdlib structural/lineage checks; optional JSON Schema is a separate validation."""
    for key in ("visual_version","runtime_contract","profile","owner","title","snapshot","sources","coverage","cards","panels","actions","limitations","selection"):
        if key not in data:raise ValueError("Missing visual field: "+key)
    if data["visual_version"]!=VISUAL or data["runtime_contract"]!=RUNTIME:raise ValueError("Visual/runtime version mismatch")
    if OWNERS.get(data["profile"])!=data["owner"]:raise ValueError("Visual ownership differs")
    s=data["snapshot"]
    for k in ("id","synthetic","as_of","timezone","scope","window","request_signature","context_fingerprint","source_identity","evaluation_times"):
        if k not in s:raise ValueError("Snapshot field missing: "+k)
    m.local_day(s["as_of"],s["timezone"])
    if len(s["scope"]["project_ids"])!=len(set(s["scope"]["project_ids"])):raise ValueError("Duplicate root projects")
    ids={r["id"] for r in data["sources"]}
    for src in data["sources"]:
        for k in ("id","kind","reference","fields","grain","filters","retrieved_at","evaluated_at","pages_complete","periods_complete","state","limitations"):
            if k not in src:raise ValueError("Source field missing: "+k)
    cov=data["coverage"]
    if cov["state"] not in {"Complete","Limited","Incomplete","Plan only"}:raise ValueError("Invalid coverage state")
    if cov["state"] in {"Complete","Limited"}:
        if not cov.get("request_gate",{}).get("gate_passed"):raise ValueError("Complete visual without passed request gate")
        if cov.get("errors"):raise ValueError("Complete visual with gate errors")
        if not (cov.get("request_gate") or {}).get("depth",{}).get("complete"):
            raise ValueError("v7 requires completed intent-derived evidence depth; rebuild legacy dataset from verified source inputs")
    if cov["state"]=="Complete" and cov.get("risk_gate",{}).get("unavailable_evaluations",0):
        raise ValueError("Unavailable risk evaluations cannot be full assurance")
    for obj in data["cards"]+data["panels"]+data["actions"]:
        if not obj.get("source_refs") or not set(obj["source_refs"])<=ids:raise ValueError("Unknown/missing lineage source reference")
    for card in data["cards"]:
        for k in ("kind","title","scope","as_of","state","limitations","value","unit","period","definition","lineage","provenance","population_basis"):
            if k not in card:raise ValueError("KPI field missing: "+k)
        if card["value"] is None and card["state"]!="unavailable":raise ValueError("Missing KPI value must stay unavailable")
        if card["state"]=="complete" and cov["state"]=="Incomplete":raise ValueError("Incomplete root cannot advertise a complete scoped KPI")
        if card["provenance"]=="calculation" and not card["lineage"].get("formula"):raise ValueError("Missing calculation definition")
        if card.get("risk_severity") not in (None,"High","Medium","Low","Unrated"):raise ValueError("Invalid supplied exposure")
    panelids=set()
    for p in data["panels"]:
        if p["id"] in panelids:raise ValueError("Duplicate panel ID")
        panelids.add(p["id"])
        if p["kind"] not in {"table","bar","comparison","timeline","matrix"}:raise ValueError("Unsupported presentation component")
        if p["chart"] and p["kind"] in {"bar","comparison"}:
            units={x["unit"] for x in p["chart"]["series"]}
            if len(units)!=1:raise ValueError("Mixed units on a shared comparison scale")
        for r in p["rows"]:
            if not r["source_refs"] or not set(r["source_refs"])<=ids:raise ValueError("Row source reference missing")
            if r["provenance"] not in {"observation","calculation","native","proposed"}:raise ValueError("Invalid provenance")
            if r["provenance"]=="calculation" and not (r.get("lineage") or {}).get("formula"):
                raise ValueError("Calculated row lacks its formula")
    for a in data["actions"]:
        if a.get("control")!="display_only":raise ValueError("Renderer cannot provide an execution control")
        if not a.get("execution_state") or not a.get("recheck"):raise ValueError("Action state/recheck missing")
    frozen=deepcopy(data);checksum=frozen.pop("content_sha256",None)
    if checksum and digest(frozen)!=checksum:raise ValueError("Presentation snapshot modified; rebuild/validate from source")
    return {"valid":True,"visual_version":VISUAL,"note":"Structural validation is not evidence authentication."}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("operation",choices=["build","validate"]);p.add_argument("input",type=Path);p.add_argument("--output",type=Path)
    a=p.parse_args()
    try:
        data=json.loads(a.input.read_text(encoding="utf-8"),parse_constant=lambda v:(_ for _ in ()).throw(ValueError(v)))
        out=build(data) if a.operation=="build" else validate(data)
        text=json.dumps(out,indent=2,ensure_ascii=False,allow_nan=False)+"\n"
        if a.output:publish_file(a.output, text, inputs=cli_inputs(a))
        else:print(text,end="")
        return 0
    except (ValueError,TypeError,KeyError,OSError) as exc:
        print(json.dumps({"input_error":str(exc)}));return 1
if __name__=="__main__":raise SystemExit(main())
