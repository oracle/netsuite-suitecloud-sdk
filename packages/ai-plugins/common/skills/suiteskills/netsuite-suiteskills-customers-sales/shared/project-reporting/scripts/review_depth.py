#!/usr/bin/env python3
"""REVIEW-2.0.0: deterministic evidence-depth extension to the PM-4.0.0 gate.
No account access or permissions grant. A host must authenticate the request and source trace.
A declared request family is not inferred from substrings of a user's question.
"""
from __future__ import annotations
from copy import deepcopy
from pathlib import Path
import argparse, json
import completion_gate as cg

VERSION = "REVIEW-2.0.0"
DOMAINS = {"delivery","effort","work","staffing","financial","risk","sow"}
DEFAULTS = {
    "portfolio-health":["delivery","effort","risk"],
    "operations":["work","staffing","risk"],
    "financial":["financial","risk"],
    "risk":["delivery","effort","risk"],
    "operations-sow":["sow"],
}
# IDs describe generic evidence families, never a catalogue of user questions.
DEFINITIONS = {
    "native-indicators":("risk","native_result_rows",["native_input"],"projects",
        ["project","indicator_type","native_status","evaluation_or_freshness","missing_pairs"]),
    "project-directory":("delivery","record_rows",["projects"],"projects",["project_identity","lifecycle","source_scope"]),
    "task-schedule":("delivery","record_rows",["tasks"],"projects",
        ["task_identity","hierarchy","status","effective_due_rule","end_date"]),
    "task-effort":("effort","record_rows",["tasks"],"projects",
        ["task_identity","plannedwork","actual_recorded_hours","comparison_basis","completed_and_incomplete_work"]),
    "resource-directory":("staffing","record_rows",["resources"],"resources",
        ["typed_resource_identity","active","eligible","generic","zero_work_resources"]),
    "task-assignments":("staffing","record_rows",["assignments"],"projects",
        ["task_identity","resource_identity","assignment_identity","missing_or_unknown_assignments"]),
    "dated-capacity":("staffing","resource_day_rows",["capacity_input"],"resources",
        ["dated_plannedwork","calendar","approved_leave","competing_work","date_distribution"]),
    "work-queues":("work","record_rows",["queues"],"projects",
        ["work_identity","routing","status","owner","dates"]),
    "financial-detail":("financial","transaction_or_detail_report_rows",
        ["money","billing","cash","procurement","revenue","policy"],"projects",
        ["project_attribution","row_identity","accounting_context","comparable_measure","parent_total_reconciliation"]),
    "domain-rules":("financial","rule_evaluation_rows",["domain_rules"],"projects",
        ["applicable_rules","rule_version_or_effective_date","inputs","conclusion"]),
    "risk-discovery":("risk","search_and_candidate_rows",["$risk_review"],"projects",
        ["frozen_investigation_plan","applicability","evidence","candidate_resolution","source_completion"]),
}
ORDER = list(DEFINITIONS)
ALLOWED={"exhausted","unavailable","not_applicable"}

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

def h(value):
    return cg.signature(value)

def requirements(profile,context,domains=None):
    if profile not in DEFAULTS:
        raise ValueError("Unknown review profile")
    domains=sorted(set(domains or DEFAULTS[profile]))
    if not domains or not set(domains)<=DOMAINS:
        raise ValueError("Unknown or empty review domains")
    # Core domain work cannot be removed by claiming an unrelated review domain.
    essential={"portfolio-health":{"delivery","effort"},"risk":{"delivery","effort","risk"},
               "financial":{"financial"},"operations":set(),"operations-sow":{"sow"}}[profile]
    if not essential<=set(domains) or (profile=="operations" and not set(domains)&{"work","staffing"}):
        raise ValueError("Review domains omit the owning domain's evidence")
    if context.get("project_ids") and "risk" not in domains:
        domains=sorted(set(domains)|{"risk"})
    needed={"project-directory"} if context.get("project_ids") else set()
    if context.get("project_ids"):needed |= {"native-indicators","risk-discovery"}
    if set(domains)&{"delivery","effort"}:needed |= {"task-schedule","task-effort"}
    if "staffing" in domains:needed |= {"resource-directory","task-assignments","dated-capacity"}
    if "work" in domains:needed.add("work-queues")
    if "financial" in domains:needed |= {"financial-detail","domain-rules"}
    out=[]
    for key in ORDER:
        if key not in needed:continue
        domain,grain,paths,population,fields=DEFINITIONS[key]
        members=list(context.get("project_ids" if population=="projects" else "resource_keys",[]))
        if len(set(members))!=len(members):raise ValueError("Duplicate review population")
        out.append({"id":key,"order":len(out)+1,"domain":domain,"grain":grain,
            "population_unit":population,"members":members,"evidence_paths":paths,"required_fields":fields})
    return domains,out

def plan(request,profile,domains=None):
    """Compile BEFORE retrieval and include in the frozen request. Does not approve or execute."""
    context=request["context"]
    domains,stages=requirements(profile,context,domains)
    return {"version":VERSION,"profile":profile,"domains":domains,
        "context_sha256":h(context),"request_text_sha256":h(request["request_text"]),
        "ordered_obligations_sha256":h(request["obligations"]),"stages":stages}

def inputs(spec,evidence,result):
    selected={}
    for key in spec["evidence_paths"]:
        value=result.get("risk_review") if key=="$risk_review" else evidence.get(key)
        if value is not None:selected[key]=value
    return selected

def input_row_count(selected):
    total=0
    for key,value in selected.items():
        if isinstance(value,list):total+=len(value)
        elif isinstance(value,dict):
            if key=="capacity_input":total+=len(value.get("planned_rows",[]))+len(value.get("capacity_rows",[]))
            elif key=="$risk_review":total+=len(value.get("searches",[]))+len(value.get("candidates",[]))
            else:total+=len(value.get("rows",[]))
    return total

def evaluate(request,result,*,profile,evidence,sources):
    """Wrap the inherited gate, checking frozen intent-derived stages as well as original obligations."""
    original=cg.evaluate(request,result)
    errors=list(original["errors"])
    def require(ok,message):
        if not ok:errors.append("review-depth: "+message)
    given=request.get("review_plan")
    report=result.get("review_depth",{})
    summaries=[]
    if not isinstance(given,dict):
        return {**original,"gate_passed":False,"execution_state":"Incomplete",
            "errors":errors+["review-depth: frozen evidence-depth plan missing"],
            "depth":{"version":VERSION,"complete":False,"limited":False,"rows":[]}}
    try:
        expected=plan(request,profile,given.get("domains"))
    except (KeyError,TypeError,ValueError) as exc:
        return {**original,"gate_passed":False,"execution_state":"Incomplete",
            "errors":errors+["review-depth: invalid domain evidence plan"],
            "depth":{"version":VERSION,"complete":False,"limited":False,"rows":[]}}
    require(given==expected,"stage plan changed or omits required domain detail")
    require(isinstance(report,dict),"result report is not an object")
    if not isinstance(report,dict):report={}
    require(report.get("version")==VERSION,"result version missing/mismatched")
    require(report.get("plan_sha256")==h(given),"report bound to another plan")
    actual=report.get("rows",[])
    if not isinstance(actual,list):actual=[];require(False,"result rows must be an array")
    require(len(actual)==len(expected["stages"]),"missing or extra evidence-depth stage")
    require(report.get("remaining_stages")==[],"unprocessed stages remain or are unknown")
    src={s["id"]:s for s in sources}
    previous_end=-1
    limited=False
    for n,spec in enumerate(expected["stages"]):
        label=spec["id"]
        row=actual[n] if n<len(actual) and isinstance(actual[n],dict) else {}
        require(row.get("requirement")==spec,label+": changed/reordered requirement")
        state=row.get("state","incomplete")
        require(state in ALLOWED,label+": unfinished detail or alternatives")
        start,end=row.get("started_sequence"),row.get("completed_sequence")
        ordered=type(start) is int and type(end) is int and start>previous_end and end>=start
        require(ordered,label+": phase order unproven; native intake must precede derived review")
        if ordered:previous_end=end
        refs=row.get("source_refs",[])
        require(isinstance(refs,list) and bool(refs) and set(refs)<=set(src),label+": unknown/missing source references")
        refs=refs if isinstance(refs,list) else []
        checks=row.get("source_check",{})
        require(isinstance(checks,dict) and checks.get("state")==state,label+": source state differs")
        if isinstance(checks,dict):
            for msg in cg.source_errors(checks):require(False,label+": "+msg)
        else:checks={}
        partitions=row.get("partitions",{})
        all_members=[];counts={}
        for category in ("evaluated","unavailable","not_applicable","unresolved"):
            members=partitions.get(category,[]) if isinstance(partitions,dict) else []
            require(isinstance(members,list),label+": invalid "+category+" partition")
            if not isinstance(members,list):members=[]
            all_members.extend(members);counts[category]=len(members)
        require(len(all_members)==len(set(all_members)) and set(all_members)==set(spec["members"]),
                label+": detail population does not reconcile")
        require(counts["unresolved"]==0,label+": unresolved member population")
        require(isinstance(row.get("limitations"),list),label+": missing limitation ledger")
        selected=inputs(spec,evidence,result)
        if state=="exhausted":
            proof=row.get("detail_proof",{})
            external=proof.get("mode")=="source_evaluated" if isinstance(proof,dict) else False
            require(bool(selected) or external,label+": detail-backed evidence missing")
            require(isinstance(proof,dict),label+": detail proof missing")
            if not isinstance(proof,dict):proof={}
            if external:
                # This is a host-authenticated source proof, not a substitute header total.
                for key in ("operation_verified","server_evaluation_complete","predicate_validated","counts_reconciled"):
                    require(proof.get(key) is True,label+": "+key+" unverified")
                for key in ("definition_ref","definition_sha256","result_ref","result_sha256","ordering","consistency"):
                    require(isinstance(proof.get(key),str) and bool(proof[key]),label+": source proof "+key+" missing")
                require(type(proof.get("evaluated_rows")) is int and proof["evaluated_rows"]>=0,
                        label+": evaluated detail count missing")
                require(proof.get("returned_sha256")==h(selected),label+": returned exception/detail payload changed")
                require(proof.get("candidate_inventory_complete") is True,label+": candidate queue incomplete")
                require(proof.get("mode")=="source_evaluated" and label not in {"native-indicators","dated-capacity","risk-discovery"},
                        label+": this stage requires its protected native/daily/investigation payload")
                if label=="financial-detail":
                    require(proof.get("accounting_context_verified") is True,label+": financial context unverified")
            else:
                require(proof.get("inputs_sha256")==h(selected),label+": detail payload changed after source verification")
                require(proof.get("row_count")==input_row_count(selected),label+": record count mismatch")
            require(proof.get("grain")==spec["grain"],label+": header/aggregate is not the required detail grain")
            for key in ("fields_verified","population_complete","reconciled_to_summary"):
                require(proof.get(key) is True,label+": "+key+" unverified")
            require(all(src.get(r,{}).get("state")=="read_verified" for r in refs),
                    label+": exhausted detail references unread/denied evidence")
            require(counts["evaluated"]==len(spec["members"]),label+": exhausted detail has unevaluated members")
            if label=="native-indicators":
                require(selected.get("native_input",{}).get("transport_available") is True,
                        label+": native transport is not available")
            if label=="dated-capacity":
                cap=selected.get("capacity_input",{})
                require(cap.get("work_complete") is True and cap.get("capacities_complete") is True,
                        label+": dated demand/calendar coverage incomplete")
            if label=="task-effort":
                require(proof.get("includes_completed_work") is True,
                        label+": overdue-only tasks cannot prove whole-scope effort variance")
        elif state=="unavailable":
            limited=True
            require(counts["unavailable"]==len(spec["members"]),label+": unavailable members not reconciled")
            require(bool(row.get("missing_evidence")) and bool(row.get("limitations")),
                    label+": unavailability needs specific missing evidence and limitations")
            require(bool(row.get("remediation")) and bool(row.get("remediation_owner")),
                    label+": no next action/owner for the specific failure")
        elif state=="not_applicable":
            require(counts["not_applicable"]==len(spec["members"]),label+": nonapplicable population differs")
            require(row.get("nonapplicability_verified") is True,label+": positive applicability evidence required")
        # Summaries are protected data; publication later allowlists fields and reviews free text.
        summaries.append({"stage":label,"domain":spec["domain"],"state":state,
            "required_evidence":", ".join(spec["required_fields"]),"population_unit":spec["population_unit"],
            "expected":len(spec["members"]),"evaluated":counts["evaluated"],"unavailable":counts["unavailable"],
            "not_applicable":counts["not_applicable"],"unresolved":counts["unresolved"],
            "detail_rows":input_row_count(selected) if state=="exhausted" else None,
            "missing_evidence":"; ".join(row.get("missing_evidence",[])),
            "limitation":"; ".join(row.get("limitations",[])),
            "remediation":row.get("remediation"),"remediation_owner":row.get("remediation_owner"),
            "source_refs":refs or sorted(src)})
    return {**original,"gate_passed":not errors,
        "execution_state":"Complete" if not errors else "Incomplete","errors":errors,
        "depth":{"version":VERSION,"complete":not errors,"limited":limited,"rows":summaries,
                 "note":"Structural source trace validation; the host must authenticate evidence and chronology."}}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input",type=Path)
    parser.add_argument("--operation",choices=["plan","evaluate"],default="evaluate")
    parser.add_argument("--output",type=Path)
    args=parser.parse_args()
    try:
        value=json.loads(args.input.read_text())
        out=plan(value["request"],value["profile"],value.get("domains")) if args.operation=="plan" else evaluate(
            value["request"],value["result"],profile=value["profile"],evidence=value["evidence"],sources=value["sources"])
        text=json.dumps(out,indent=2,ensure_ascii=False)+"\n"
        if args.output:publish_file(args.output, text, inputs=cli_inputs(args))
        else:print(text,end="")
        return 0 if args.operation=="plan" or out["gate_passed"] else 2
    except (ValueError,KeyError,TypeError,OSError):
        print('{"input_error":"Review-depth input invalid; inspect protected evidence locally."}')
        return 1
if __name__=="__main__":raise SystemExit(main())
