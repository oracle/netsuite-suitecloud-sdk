#!/usr/bin/env python3
"""DISCOVERY-1.0.0: structural evidence-led investigation gate, not a risk oracle.
No network, NetSuite writes, permissions grant, or proof of business truth.
The host must preserve the pre-retrieval plan and authenticate source evidence.
Exit 0 passed; 2 incomplete; 1 malformed input.
"""
from __future__ import annotations
import argparse, hashlib, json
from datetime import datetime
from pathlib import Path
from typing import Any

CONTRACT = "PM-4.0.0"
VERSION = "DISCOVERY-1.0.0"
AREAS = {"delivery", "people_time", "financial", "commercial", "governance"}
METHODS = {"temporal", "ownership", "reconciliation", "workflow", "requirement", "relationships"}
TERMINAL = {"Verified", "Not verified", "Not applicable", "Unavailable after alternatives"}
SOURCE_TERMINAL = {"exhausted", "not_applicable", "unavailable"}
ATTEMPT_STATES = {"read_verified","denied","tool_missing","feature_absent_confirmed","incompatible","unknown"}

import sys as _output_sys
from pathlib import Path as _OutputPath
_output_sys.dont_write_bytecode = True
_output_sys.path.insert(0, str(_OutputPath(__file__).resolve().parents[2]))
from safe_output import publish as publish_output

def signature(value: Any) -> str:
    return hashlib.sha256(json.dumps(value,sort_keys=True,ensure_ascii=False,
        separators=(",",":"),allow_nan=False).encode()).hexdigest()

def _text(x): return isinstance(x,str) and bool(x.strip())
def _count(x): return type(x) is int and x >= 0
def _ids(x): return isinstance(x,list) and all(_text(v) for v in x) and len(x)==len(set(x))
def _refs(x): return _ids(x) and bool(x)
def _digest(x): return _text(x) and len(x)==64 and all(c in "0123456789abcdef" for c in x)
def _clock(x):
    try: return _text(x) and datetime.fromisoformat(x.replace("Z","+00:00")).tzinfo is not None
    except (ValueError,TypeError): return False

def context_identity(context: dict) -> dict:
    """Bind the plan to all exact scope/cache dimensions, not to presentation settings."""
    return {k:v for k,v in context.items() if k not in {"risk_plan_sha256"}}

def make_plan(context: dict, searches: list, area_decisions: list, *,
              plan_id: str, mode: str = "broad", revision: int = 1,
              request_signature: str, previous_plan_sha256: str | None = None,
              revision_reason: str | None = None) -> dict:
    """Construct a review plan BEFORE execution; never fill outcomes or approve it."""
    return {"version":VERSION,"id":plan_id,"revision":revision,"mode":mode,
        "request_signature":request_signature,"context_sha256":signature(context_identity(context)),
        "project_ids":list(context.get("project_ids",[])),
        "resource_keys":list(context.get("resource_keys",[])),
        "as_of":context.get("as_of"),"timezone":context.get("timezone"),
        "area_decisions":area_decisions,"searches":searches,
        "previous_plan_sha256":previous_plan_sha256,"revision_reason":revision_reason}

def finding_key(row: dict) -> str:
    """No account values are persisted to package files; keys belong to private run state."""
    return signature({k:row.get(k) for k in ("project_ids","condition_key","affected_keys","window")})

def _source_errors(row: dict) -> list[str]:
    errors=[]
    def need(ok,msg):
        if not ok: errors.append(msg)
    state=row.get("state")
    need(state in SOURCE_TERMINAL,"source state pending/incomplete")
    need(_refs(row.get("evidence_refs")),"source evidence references missing")
    if state=="exhausted":
        for f in ("pages_exhausted","periods_complete","scope_reconciled"):
            need(row.get(f) is True,f+" unverified")
        for f in ("pending_pages","pending_periods"):
            need(row.get(f)==[],f+" unfinished/unknown")
    elif state=="not_applicable":
        need(_text(row.get("reason")) and row.get("nonapplicability_verified") is True,
             "nonapplicability requires positive evidence")
    elif state=="unavailable":
        need(_text(row.get("reason")) and _text(row.get("limitation")),
             "unavailability lacks reason/limitation")
        need(row.get("alternatives_accounted_for") is True,"alternatives unaccounted")
        need(row.get("remaining_usable_channels")==[],"usable alternatives remain/unknown")
        need(row.get("authorization_pending") is False,"authorization still pending")
        attempts=row.get("attempts")
        need(isinstance(attempts,list) and bool(attempts),"attempt history missing")
        if isinstance(attempts,list):
            for a in attempts:
                need(isinstance(a,dict) and a.get("state") in ATTEMPT_STATES
                     and _text(a.get("channel")) and _text(a.get("reason")),
                     "attempt not exhausted or unspecified")
    return errors

def _plan_errors(plan: dict) -> list[str]:
    errors=[]
    def need(ok,msg):
        if not ok: errors.append(msg)
    need(plan.get("version")==VERSION,"discovery plan version mismatch")
    need(_text(plan.get("id")) and type(plan.get("revision")) is int and plan["revision"]>=1,
         "plan identity/revision missing")
    need(plan.get("mode") in {"broad","focused"},"plan mode unknown")
    need(_clock(plan.get("as_of")) and _text(plan.get("timezone")),"plan clock missing")
    for f in ("request_signature","context_sha256"):
        need(_text(plan.get(f)) and len(plan[f])==64,"plan "+f+" missing")
    for f in ("project_ids","resource_keys"):
        need(_ids(plan.get(f)),"plan "+f+" invalid")
    if plan.get("revision",1)>1:
        need(_text(plan.get("previous_plan_sha256")) and _text(plan.get("revision_reason")),
             "revision lineage/reason missing")
    decisions=plan.get("area_decisions",[])
    searches=plan.get("searches",[])
    need(isinstance(decisions,list) and bool(decisions),"area decisions missing")
    need(isinstance(searches,list),"search plan missing")
    if not isinstance(decisions,list) or not isinstance(searches,list): return errors
    if not all(isinstance(d,dict) for d in decisions) or not all(isinstance(x,dict) for x in searches):
        errors.append("Plan decisions/searches must be objects"); return errors
    areas=[d.get("area") for d in decisions if isinstance(d,dict)]
    need(len(areas)==len(decisions) and len(areas)==len(set(areas)) and set(areas)<=AREAS,
         "invalid/duplicate investigation areas")
    if plan.get("mode")=="broad":need(set(areas)==AREAS,"broad plan omits a business area")
    search_ids=[s.get("id") for s in searches if isinstance(s,dict)]
    need(len(search_ids)==len(searches) and _ids(search_ids),"invalid/duplicate search IDs")
    for s in searches:
        if not isinstance(s,dict):continue
        need(s.get("area") in areas,"search has no area decision")
        need(s.get("method") in METHODS,"unsupported search method")
        for f in ("definition","grain","source_definition_ref"):
            need(_text(s.get(f)),"search "+f+" missing")
        need(_refs(s.get("fields")),"search required fields missing")
        need(isinstance(s.get("window"),dict) and bool(s["window"]),"search window missing")
        for f in ("project_ids","resource_keys"):
            need(_ids(s.get(f)) and set(s.get(f,[]))<=set(plan.get(f,[])),
                 "search population out of scope/duplicate")
        need(s.get("population_unit") in {"projects","resources"},"search population unit missing")
        expected=s.get("expected_members")
        source_scope=s.get("project_ids",[]) if s.get("population_unit")=="projects" else s.get("resource_keys",[])
        need(_ids(expected) and set(expected)==set(source_scope),"search member inventory differs")
    for d in decisions:
        if not isinstance(d,dict):continue
        state=d.get("applicability")
        need(state in {"applicable","not_applicable","unknown"},"unknown area decision")
        need(_text(d.get("basis")),"area decision needs an applicability basis")
        linked=[s for s in searches if isinstance(s,dict) and s.get("area")==d.get("area")]
        if state=="not_applicable":
            need(_refs(d.get("evidence_refs")),"nonapplicable area lacks evidence")
            need(not linked,"nonapplicable area also has active searches")
        else:
            need(bool(linked),"applicable/unknown area lacks a planned investigation")
            # Exact union membership, not a verbose project x checklist matrix.
            projects=set().union(*(set(s.get("project_ids",[])) for s in linked)) if linked else set()
            need(projects==set(plan.get("project_ids",[])),"area search scope omits projects")
            if d.get("area")=="people_time":
                resources=set().union(*(set(s.get("resource_keys",[])) for s in linked)) if linked else set()
                need(resources==set(plan.get("resource_keys",[])),
                     "people/time search scope omits resources, including zero-work resources")
    return errors

def evaluate(state: dict, expected_plan: dict | None = None) -> dict:
    if not isinstance(state,dict):raise ValueError("Review state must be an object")
    errors=[]
    def need(ok,msg):
        if not ok:errors.append(msg)
    need(state.get("contract_version")==CONTRACT,"contract version mismatch; do not relabel legacy register output")
    plan=state.get("plan",{})
    if not isinstance(plan,dict):raise ValueError("Plan must be an object")
    errors.extend(_plan_errors(plan))
    if expected_plan is not None:
        need(plan==expected_plan,"executed plan differs from the frozen requested plan")
    need(state.get("plan_sha256")==signature(plan),"plan changed after preparation")
    scope=state.get("scope",{})
    need(isinstance(scope,dict),"scope missing")
    if not isinstance(scope,dict):scope={}
    for f in ("project_ids","resource_keys"):
        need(scope.get(f)==plan.get(f),"scope differs from plan: "+f)
    need(scope.get("reconciled") is True and scope.get("population_mismatches")==[],
         "population unreconciled")
    need(_refs(scope.get("evidence_refs")),"population directory evidence missing")
    if not plan.get("project_ids"):need(scope.get("confirmed_empty") is True,"empty project population unconfirmed")
    need(state.get("as_of")==plan.get("as_of") and state.get("timezone")==plan.get("timezone"),"changed review clock")
    phase=state.get("indicator_phase",{})
    if not isinstance(phase,dict):
        need(False,"native first-stage object missing")
        phase={}
    for f in ("attempted","accounted_for","before_derived_analysis","coverage_prioritized"):
        need(isinstance(phase,dict) and phase.get(f) is True,"native first-stage "+f+" missing")
    need(phase.get("remaining_usable_channels")==[],"native usable alternatives remain/unknown")
    need(_refs(phase.get("evidence_refs")),"native coverage evidence missing")
    end=phase.get("completed_sequence")
    need(_count(end),"native completion sequence missing")
    rows=state.get("searches",[])
    candidates=state.get("candidates",[])
    if not isinstance(rows,list) or not isinstance(candidates,list):raise ValueError("Searches/candidates must be arrays")
    specs=plan.get("searches",[])
    need(len(rows)==len(specs),"missing/extra search results")
    candidate_ids=[]; candidate_searches={}
    completed=0; unavailable=0; summaries=[]
    for i,spec in enumerate(specs):
        row=rows[i] if i<len(rows) and isinstance(rows[i],dict) else {}
        label=spec.get("id","unknown")
        need(row.get("definition")==spec,label+": search changed or reordered")
        local_errors=_source_errors(row)
        errors.extend(label+": "+e for e in local_errors)
        need(_count(row.get("started_sequence")) and _count(end) and row.get("started_sequence",0)>end,
             label+": detail investigation preceded native intake")
        need(_count(row.get("completed_sequence")) and
             row.get("completed_sequence",-1)>=row.get("started_sequence",0),label+": source work unfinished")
        d=row.get("partitions",{})
        parts=[];counts={}
        for key in ("evaluated","unavailable","not_applicable","unresolved"):
            vals=d.get(key,[]) if isinstance(d,dict) else []
            need(_ids(vals),label+": invalid "+key+" partition")
            if not _ids(vals):vals=[]
            parts.extend(vals);counts[key]=len(vals)
        expected=spec.get("expected_members",[])
        need(len(parts)==len(set(parts)) and set(parts)==set(expected),label+": member partitions do not reconcile")
        need(counts["unresolved"]==0,label+": unresolved population")
        state_name=row.get("state")
        corresponding={"exhausted":"evaluated","unavailable":"unavailable","not_applicable":"not_applicable"}.get(state_name)
        if corresponding:need(counts[corresponding]==len(expected),label+": source state/member mismatch")
        need(isinstance(row.get("limitations"),list),label+": limitation ledger missing")
        cids=row.get("candidate_ids",[])
        need(_ids(cids),label+": invalid/duplicate candidate IDs")
        cids=cids if _ids(cids) else []
        for cid in cids:candidate_searches.setdefault(cid,set()).add(label)
        candidate_ids.extend(cids)
        if state_name=="exhausted":
            proof=row.get("detail_proof",{})
            if not isinstance(proof,dict):proof={}
            need(proof.get("mode") in {"normalized_rows","source_evaluated"},label+": no detail-backed proof")
            for f in ("fields_verified","population_complete","reconciled_to_summary","operation_verified"):
                need(proof.get(f) is True,label+": "+f+" unverified")
            need(proof.get("grain")==spec.get("grain"),label+": header-only or incompatible grain")
            for f in ("definition_ref","definition_sha256","result_ref","result_sha256"):
                need(_digest(proof.get(f)) if f.endswith("sha256") else _text(proof.get(f)),
                     label+": detail proof "+f+" missing")
            for f in ("evaluated_rows","candidate_count"):
                need(_count(proof.get(f)),label+": invalid "+f)
            need(proof.get("candidate_count")==len(cids),label+": candidate count differs")
            need(row.get("candidate_inventory_complete") is True,label+": truncated candidate inventory")
            if proof.get("mode")=="normalized_rows":
                detail=row.get("detail_rows")
                need(isinstance(detail,list) and signature(detail)==proof.get("result_sha256"),
                     label+": detail rows missing or changed")
                need(isinstance(detail,list) and len(detail)==proof.get("evaluated_rows"),label+": detail row count differs")
            else:
                for f in ("predicate_validated","server_evaluation_complete","counts_reconciled"):
                    need(proof.get(f) is True,label+": "+f+" unverified")
                need(_text(proof.get("ordering")) and _text(proof.get("consistency")),
                     label+": source ordering/snapshot limitation missing")
        elif state_name=="unavailable":
            unavailable+=1
            need(not cids,label+": unavailable source cannot assert a verified candidate inventory")
            need(bool(row.get("limitations")),label+": unavailable detail lacks limitations")
        elif state_name=="not_applicable":need(not cids,label+": nonapplicable source has candidates")
        if not local_errors:completed+=1
        summaries.append({"search_id":label,"area":spec.get("area"),"method":spec.get("method"),
            "state":state_name,"expected":len(expected),"evaluated":counts["evaluated"],
            "unavailable":counts["unavailable"],"not_applicable":counts["not_applicable"],
            "unresolved":counts["unresolved"],"candidate_count":len(cids),"window":spec.get("window"),
            "source_refs":row.get("evidence_refs",[]),"limitation":"; ".join(row.get("limitations",[]))})
    seen=set(); keys=set(); counts=dict.fromkeys(sorted(TERMINAL),0)
    for c in candidates:
        if not isinstance(c,dict):need(False,"invalid candidate");continue
        cid=c.get("id")
        need(_text(cid) and cid not in seen,"candidate identity missing/duplicate");seen.add(cid)
        need(cid in candidate_searches,"candidate not in a completed source inventory")
        attributed=[x for x in specs if x.get("id") in candidate_searches.get(cid,set())]
        allowed_projects=set().union(*(set(x.get("project_ids",[])) for x in attributed)) if attributed else set()
        allowed_resources=set().union(*(set(x.get("resource_keys",[])) for x in attributed)) if attributed else set()
        need(set(c.get("project_ids",[]))<=allowed_projects and set(c.get("resource_keys",[]))<=allowed_resources,
             "candidate outside its source search scope")
        need(set(c.get("search_ids",[]))==candidate_searches.get(cid,set()),"candidate source attribution differs")
        need(c.get("execution_state")=="Terminal" and c.get("conclusion") in TERMINAL,
             "candidate investigation unfinished")
        for f in ("project_ids","resource_keys"):
            need(_ids(c.get(f)) and set(c.get(f,[]))<=set(plan.get(f,[])),"candidate population invalid")
        for f in ("condition_key","statement","applicability_basis"):
            need(_text(c.get(f)),"candidate "+f+" missing")
        need(_refs(c.get("affected_keys")) and _refs(c.get("evidence_refs")),"candidate identity/evidence missing")
        need(bool(c.get("window")) and c.get("as_of")==state.get("as_of") and c.get("timezone")==state.get("timezone"),
             "candidate time scope differs")
        key=finding_key(c)
        need(c.get("finding_key")==key and key not in keys,"candidate deduplication key differs/duplicated")
        keys.add(key)
        conclusion=c.get("conclusion")
        if conclusion in counts:counts[conclusion]+=1
        if conclusion=="Verified":
            need(_text(c.get("trigger")) and _text(c.get("objective")),"verified finding lacks trigger/objective")
            need(c.get("kind") in {"Risk","Issue","Dependency","Control gap"},"finding lifecycle missing")
            severity=c.get("severity")
            need(severity in {"High","Medium","Low","Unrated"},"invalid calculated exposure")
            need(_text(c.get("severity_basis")),"severity requires basis or missing-definition reason")
            if severity!="Unrated":need(_refs(c.get("severity_evidence_refs")),"severity lacks impact/criticality evidence")
            need(c.get("native_status_used_as_severity") is False,"native color cannot assign exposure")
        if conclusion=="Not verified":need(c.get("inputs_complete") is True,"negative finding lacks complete evidence")
        if conclusion=="Unavailable after alternatives":
            unavailable+=1
            errors.extend("candidate: "+e for e in _source_errors({**c,"state":"unavailable"}))
        need(isinstance(c.get("limitations"),list),"candidate limitation ledger missing")
    need(seen==set(candidate_ids),"candidate queue missing/extra investigations")
    for f in ("pending_pages","pending_periods","pending_batches","unresolved_queue"):
        need(state.get(f)==[],"unfinished "+f)
    passed=not errors
    return {"contract_version":CONTRACT,"discovery_version":VERSION,"gate_passed":passed,
        "execution_state":"Complete" if passed else "Blocked","projects":len(plan.get("project_ids",[])),
        "expected":len(specs),"completed":completed,"unresolved":len(specs)-completed,
        "candidate_count":len(set(candidate_ids)),"candidates_resolved":sum(counts.values()),
        "conclusion_counts":counts,"unavailable_evaluations":unavailable,
        "coverage_unit":"planned investigation searches","coverage_rows":summaries,
        "plan_sha256":signature(plan),"errors":errors,
        "assurance":"Completed declared searches are not an exhaustive audit or proof that all possible risks are absent. Unavailable evidence remains a limitation."}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("state",type=Path)
    p.add_argument("--plan",type=Path,help="Independent frozen plan for CLI verification")
    p.add_argument("--output",type=Path);p.add_argument("--output-dir",type=Path);a=p.parse_args()
    try:
        out=evaluate(json.loads(a.state.read_text()),json.loads(a.plan.read_text()) if a.plan else None)
        text=json.dumps(out,indent=2,ensure_ascii=False)+"\n"
        if a.output:publish_output(text,a.output,output_dir=a.output_dir,inputs=[a.state]+([a.plan] if a.plan else []))
        else:print(text,end="")
        return 0 if out["gate_passed"] else 2
    except (ValueError,TypeError,KeyError,OSError):
        print('{"input_error":"Invalid private discovery state; inspect it locally."}');return 1
if __name__=="__main__":raise SystemExit(main())
