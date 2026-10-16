#!/usr/bin/env python3
"""Offline SOW plan, approval-snapshot and reconciliation helpers. No network calls.
Inputs must come from trusted runtime checks where specified. Passing does not
authenticate approvals, enforce server permissions, or make writes exactly-once.
"""
from __future__ import annotations
import argparse, copy, hashlib, json, re
from collections import Counter
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

SCHEMA = "SOW-1.0"
OPS = {"Create","Link existing","Update","Defer","Exclude"}
KINDS = {"record","sublist","line","decision"}
ORIGINS = {"SOW evidence","Existing NetSuite value","Template default","User edit","Inference"}
ALLOWED_OBJECTS = {"project","task","dependency","assignment","document_reference","governance"}
OUTCOMES = {
 "Created and verified","Updated and verified","Linked to existing record",
 "Excluded by reviewer","Deferred for information or approval","Blocked by prerequisite or policy",
 "Failed with an actionable error","Outcome unknown; reconciliation required",
 "Pending asynchronous completion","Intent recorded","Reconciled absent"
}
SUCCESS = {"Created and verified","Updated and verified","Linked to existing record"}
MUTATING = {"Create","Update"}
CONTEXT_KEYS = ("schema_version","plan_id","project_kind","target","sources","creation_route",
                "capability_fingerprint","configuration_fingerprint","policy_version",
                "commercial_components","totals_by_currency","source_obligations","decisions")
ACTION_KEYS = ("action_id","operation_id","business_object","record_type","existing_id","item_kind","operation",
               "selected","proposed_values","before_values","relationships","dependencies",
               "field_evidence","assumptions","validation_issues","side_effects","approval_scope",
               "disposition_reason","supersedes")
REQUIRED_ACTION = ACTION_KEYS[:-1]

def load(path):
    def reject(v): raise ValueError("Non-finite JSON number: "+v)
    return json.loads(Path(path).read_text(encoding="utf-8"), parse_constant=reject)

def canonical(obj):
    return json.dumps(obj, sort_keys=True, separators=(",",":"), ensure_ascii=False, allow_nan=False)

def digest(obj):
    return hashlib.sha256(canonical(obj).encode("utf-8")).hexdigest()

def context_hash(plan):
    return digest({k:plan.get(k) for k in CONTEXT_KEYS})

def action_hash(action):
    return digest({k:action.get(k) for k in ACTION_KEYS})

def index_actions(plan):
    return {a["action_id"]:a for a in plan.get("actions",[])}

def order(plan):
    actions=index_actions(plan); result=[]; active=set(); seen=set()
    def visit(aid):
        if aid in active: raise ValueError("Dependency cycle at "+aid)
        if aid in seen: return
        if aid not in actions: raise ValueError("Missing dependency "+aid)
        active.add(aid)
        for dep in actions[aid].get("dependencies",[]): visit(dep)
        active.remove(aid);seen.add(aid);result.append(aid)
    for aid in actions: visit(aid)
    return result

def closure(plan, aid):
    actions=index_actions(plan);seen=set()
    def visit(key):
        if key in seen:return
        if key not in actions:raise ValueError("Missing dependency "+key)
        seen.add(key)
        for dep in actions[key].get("dependencies",[]):visit(dep)
    visit(aid)
    return sorted(seen)

def approval_hash(plan, aid):
    actions=index_actions(plan)
    return digest({"context_hash":context_hash(plan),
                   "actions":[action_hash(actions[k]) for k in closure(plan,aid)]})

def timestamp(value):
    dt=datetime.fromisoformat(value.replace("Z","+00:00"))
    if dt.tzinfo is None:raise ValueError("Timestamp must have timezone")
    return dt

def money(value):
    if not isinstance(value,str):raise ValueError("Use decimal strings for money")
    try: out=Decimal(value)
    except InvalidOperation as e:raise ValueError("Invalid money") from e
    if not out.is_finite():raise ValueError("Non-finite money")
    return out

def totals(components):
    result={}; unknown=[]
    for c in components:
        if not c.get("include_in_totals"):continue
        currency=c.get("currency");kind=c.get("amount_kind")
        if not isinstance(currency,str) or not re.fullmatch(r"[A-Z]{3}",currency):
            unknown.append(c.get("component_id"));continue
        if not kind:unknown.append(c.get("component_id"));continue
        bucket=result.setdefault(currency,{})
        value=c.get("amount")
        if value is None:
            bucket[kind]=None;unknown.append(c.get("component_id"));continue
        amount=money(value)
        if kind not in bucket:bucket[kind]=Decimal("0")
        if bucket[kind] is not None:bucket[kind]+=amount
    return {"totals_by_currency":{cur:{k:None if v is None else format(v,"f") for k,v in bucket.items()}
                                for cur,bucket in result.items()},
            "unknown_component_ids":unknown}

def validate(plan):
    errors=[]
    if not isinstance(plan,dict):return {"valid":False,"errors":["Plan must be an object"]}
    required=(*CONTEXT_KEYS,"version","state","actions","approvals","decisions","revision_log")
    for key in required:
        if key not in plan:errors.append("Missing plan field: "+key)
    if plan.get("schema_version")!=SCHEMA:errors.append("Unsupported schema_version")
    if not isinstance(plan.get("plan_id"),str) or not plan.get("plan_id"):errors.append("Missing stable plan_id")
    if type(plan.get("version")) is not int or plan.get("version",0)<1:errors.append("Positive integer version required")
    if plan.get("project_kind") not in {"customer","internal"}:errors.append("Resolve project_kind")
    if plan.get("creation_route") not in {"direct","template","sales_linked","unresolved"}:errors.append("Invalid creation_route")
    target=plan.get("target")
    if not isinstance(target,dict) or not {"account","environment"}<=target.keys():errors.append("Target shape missing")
    if not isinstance(plan.get("actions"),list):return {"valid":False,"errors":errors+["Actions must be an array"]}
    ids=[]; opids=[]
    for action in plan["actions"]:
        if not isinstance(action,dict):errors.append("Action must be object");continue
        aid=action.get("action_id","?")
        for key in REQUIRED_ACTION:
            if key not in action:errors.append(f"{aid}: missing {key}")
        if not isinstance(aid,str) or not aid:errors.append("Invalid action ID")
        ids.append(aid);opids.append(action.get("operation_id"))
        if action.get("operation") not in OPS:errors.append(f"{aid}: invalid operation")
        if action.get("item_kind") not in KINDS:errors.append(f"{aid}: invalid item_kind")
        if type(action.get("selected")) is not bool:errors.append(f"{aid}: selected must be boolean")
        if action.get("operation") in {"Defer","Exclude"} and not action.get("disposition_reason"):
            errors.append(f"{aid}: disposition needs reason")
        if action.get("operation") in {"Update","Link existing"} and not action.get("existing_id"):
            errors.append(f"{aid}: existing_id required")
        if action.get("operation")=="Create" and action.get("existing_id") is not None:
            errors.append(f"{aid}: Create must not carry existing_id")
        values=action.get("proposed_values",{});ev=action.get("field_evidence",{})
        if not isinstance(values,dict) or not isinstance(ev,dict):
            errors.append(f"{aid}: values/evidence must be objects");continue
        for key in values:
            e=ev.get(key,{})
            if not isinstance(e,dict) or e.get("origin") not in ORIGINS or not e.get("source_ref"):
                errors.append(f"{aid}: provenance missing for {key}")
        if action.get("operation")=="Update":
            before=action.get("before_values",{})
            if not isinstance(before,dict) or not set(values)<=set(before):
                errors.append(f"{aid}: before-values incomplete")
        for rel in action.get("relationships",[]):
            if not isinstance(rel,dict) or not rel.get("field") or not rel.get("source_ref"):
                errors.append(f"{aid}: relationship needs field/provenance");continue
            targets=[bool(rel.get("target_action_id")),bool(rel.get("target_id"))]
            if sum(targets)!=1:errors.append(f"{aid}: relationship needs exactly one target")
            if rel.get("target_action_id") and rel["target_action_id"] not in action.get("dependencies",[]):
                errors.append(f"{aid}: relationship target missing dependency")
        if not isinstance(action.get("side_effects"),dict):errors.append(f"{aid}: side-effect review missing")
        if action.get("item_kind")=="decision" and action.get("operation") in MUTATING:
            errors.append(f"{aid}: decision cannot be a mutation")
    if len(set(ids))!=len(ids):errors.append("Duplicate action ID")
    if None in opids or "" in opids or len(set(opids))!=len(opids):errors.append("Missing/duplicate operation identity")
    try: order(plan)
    except (ValueError,KeyError,TypeError) as e:errors.append(str(e))
    srcids=[]
    for s in plan.get("sources",[]):
        if not isinstance(s,dict) or not all(s.get(k) for k in ("source_id","version","fingerprint")):
            errors.append("Source identity/version/fingerprint missing")
        else:srcids.append(s["source_id"])
    if len(set(srcids))!=len(srcids):errors.append("Duplicate source ID")
    if not srcids:errors.append("At least one source required")
    obids=[]
    for ob in plan.get("source_obligations",[]):
        obids.append(ob.get("obligation_id"))
        if not ob.get("source_ref") or not ob.get("text"):errors.append("Obligation text/source missing")
        if not ob.get("action_ids") and not ob.get("disposition_reason"):errors.append("Unmapped source obligation")
        if not set(ob.get("action_ids",[]))<=set(ids):errors.append("Obligation references missing action")
    if not obids or len(set(obids))!=len(obids) or None in obids:errors.append("Missing/duplicate source obligations")
    try:
        computed=totals(plan.get("commercial_components",[]))["totals_by_currency"]
        def normalize(t):
            return {c:{k:None if v is None else money(v) for k,v in x.items()} for c,x in t.items()}
        if normalize(computed)!=normalize(plan.get("totals_by_currency",{})):errors.append("Currency/kind totals do not reconcile")
    except (ValueError,TypeError,AttributeError) as e:errors.append("Invalid commercial totals: "+str(e))
    return {"valid":not errors,"errors":errors,"plan_hash":digest(plan),
            "context_hash":context_hash(plan),"actions":len(plan["actions"]),
            "execution_authorized":False}

def diff(old,new):
    a=validate(old);b=validate(new)
    if not a["valid"] or not b["valid"]:raise ValueError("Validate both plans before diff")
    if old["plan_id"]!=new["plan_id"]:raise ValueError("Different plan identities")
    left=index_actions(old);right=index_actions(new)
    removed=sorted(set(left)-set(right))
    if removed:raise ValueError("Retain removed work as Exclude: "+", ".join(removed))
    removedobs={x["obligation_id"] for x in old["source_obligations"]}-{x["obligation_id"] for x in new["source_obligations"]}
    if removedobs:raise ValueError("Do not delete source obligations")
    changed=[k for k in right if k not in left or action_hash(left[k])!=action_hash(right[k])]
    context_changed=context_hash(old)!=context_hash(new)
    affected=set(right) if context_changed else {k for k in right if set(closure(new,k)) & set(changed)}
    meaningful=context_changed or bool(changed)
    if meaningful and new["version"]<=old["version"]:raise ValueError("Material edit requires incremented version")
    locked=[]
    for key in set(left)&set(right):
        for field,ev in left[key].get("field_evidence",{}).items():
            if ev.get("origin")=="User edit" and ev.get("confirmed") and \
               left[key]["proposed_values"].get(field)!=right[key]["proposed_values"].get(field):
                newev=right[key].get("field_evidence",{}).get(field,{})
                if newev.get("origin")!="User edit" or not newev.get("confirmed"):
                    locked.append(key+"."+field)
    if locked:raise ValueError("Confirmed user edit overwritten without a new confirmed edit: "+", ".join(locked))
    return {"added":sorted(set(right)-set(left)),"changed":changed,"removed":removed,
            "context_changed":context_changed,"affected_approval_actions":sorted(affected),
            "all_prior_version_approvals_stale":old["version"]!=new["version"],
            "requires_external_carry_forward_or_new_approval":True}

def revise(plan, patch):
    if not validate(plan)["valid"]:raise ValueError("Input plan invalid")
    if patch.get("base_plan_hash")!=digest(plan):raise ValueError("Patch is based on stale plan")
    out=copy.deepcopy(plan);acts=index_actions(out)
    allowed={"operation","selected","existing_id","proposed_values","relationships","dependencies",
             "disposition_reason","record_type","business_object","validation_issues","side_effects","approval_scope","supersedes"}
    for edit in patch.get("edits",[]):
        aid=edit.get("action_id")
        if aid not in acts:raise ValueError("Unknown action in edit")
        key=edit.get("field")
        if key not in allowed:raise ValueError("Unsupported edit field")
        a=acts[aid]
        if key=="proposed_values":
            if not isinstance(edit.get("value"),dict):raise ValueError("Values edit requires object")
            for field,val in edit["value"].items():
                evidence=edit.get("evidence",{}).get(field,{})
                if evidence.get("origin")!="User edit" or not evidence.get("confirmed") or not evidence.get("source_ref"):
                    raise ValueError("Value edit requires confirmed user provenance")
                a["proposed_values"][field]=val;a["field_evidence"][field]=evidence
        else:
            if not edit.get("source_ref"):raise ValueError("Edit source reference required")
            a[key]=edit.get("value")
    for action in patch.get("add_actions",[]):
        if action.get("action_id") in acts:raise ValueError("Duplicate added ID")
        out["actions"].append(copy.deepcopy(action));acts[action["action_id"]]=out["actions"][-1]
    out["version"]+=1;out["state"]="draft"
    for app in out.get("approvals",[]):app["validity"]="stale"
    out["revision_log"].append({"from_version":plan["version"],"to_version":out["version"],
                               "patch":copy.deepcopy(patch),"requires_revalidation":True})
    # Do not silently recalculate schedules, assign missing data, or mutate prior source.
    valid=validate(out)
    if not valid["valid"]:raise ValueError("; ".join(valid["errors"]))
    delta=diff(plan,out)
    return {"plan":out,"diff":delta}

def latest_events(plan,ledger):
    if ledger.get("plan_id")!=plan["plan_id"] or ledger.get("target")!=plan["target"]:
        raise ValueError("Ledger target/plan mismatch")
    acts=index_actions(plan);latest={};seqs=[];seen_attempts={}
    for ev in ledger.get("events",[]):
        aid=ev.get("action_id");seq=ev.get("sequence")
        if type(seq) is not int or seq<=0 or (seqs and seq<=seqs[-1]):raise ValueError("Ledger sequence is not strictly increasing")
        seqs.append(seq)
        if aid not in acts or ev.get("operation_id")!=acts[aid]["operation_id"]:raise ValueError("Ledger action/operation mismatch")
        if ev.get("outcome") not in OUTCOMES:raise ValueError("Unknown ledger outcome")
        if type(ev.get("attempt")) is not int or ev["attempt"]<1:raise ValueError("Invalid attempt")
        if ev["attempt"]<seen_attempts.get(aid,0):raise ValueError("Attempt order reversed")
        seen_attempts[aid]=ev["attempt"]
        if not ev.get("reason"):raise ValueError("Ledger reason is required")
        timestamp(ev.get("timestamp",""))
        latest[aid]=ev
    return latest

def verified_event(plan,action,event,latest):
    if not event or event.get("outcome") not in SUCCESS:return False
    expected={"Create":"Created and verified","Update":"Updated and verified","Link existing":"Linked to existing record"}
    if event["outcome"]!=expected.get(action["operation"]):return False
    if event.get("action_hash")!=action_hash(action) or not event.get("target_id") or not event.get("verification_refs"):
        return False
    if action["operation"] in {"Update","Link existing"} and event["target_id"]!=action.get("existing_id"):
        return False
    actual=event.get("observed_values",{})
    if any(k not in actual or actual[k]!=v for k,v in action.get("proposed_values",{}).items()):return False
    for rel in action.get("relationships",[]):
        target=rel.get("target_id")
        if rel.get("target_action_id"):
            parent=latest.get(rel["target_action_id"])
            parent_action=index_actions(plan).get(rel["target_action_id"])
            if not parent_action or not verified_event(plan,parent_action,parent,latest):return False
            target=parent.get("target_id")
        if event.get("observed_relationships",{}).get(rel["field"])!=target:return False
    return event.get("side_effects_verified") is True

def gate(plan,context,ledger):
    base=validate(plan);global_errors=list(base["errors"])
    try:latest=latest_events(plan,ledger)
    except (ValueError,TypeError,KeyError) as e:latest={};global_errors.append(str(e))
    if context.get("target")!=plan.get("target"):global_errors.append("Runtime account/environment mismatch")
    if not all(plan.get("target",{}).get(k) for k in ("account","environment")):global_errors.append("Account/environment unresolved")
    if context.get("context_hash")!=context_hash(plan):global_errors.append("Material runtime/plan context mismatch")
    if not context.get("evidence_refs"):global_errors.append("Runtime evidence references required")
    for name in ("authenticated_approval","durable_ledger","exclusive_execution","reliable_readback"):
        if context.get("runtime_guarantees",{}).get(name) is not True:global_errors.append("Runtime guarantee missing: "+name)
    if not context.get("policy_evidence_ref"):global_errors.append("Policy identity not independently attested")
    acts=index_actions(plan);requested=context.get("requested_action_ids",[])
    if not requested or len(set(requested))!=len(requested) or not set(requested)<=set(acts):
        global_errors.append("Dispatch subset missing/duplicate/unknown")
    if plan.get("creation_route") in {"unresolved","sales_linked"}:
        global_errors.append("Resolve supported operational creation route; new sales-linked execution excluded")
    rows=[]
    for aid in requested:
        if aid not in acts:continue
        a=acts[aid];errors=[];event=latest.get(aid)
        if not a.get("selected") or a["operation"] in {"Defer","Exclude"}:errors.append("Action not selected executable work")
        if a.get("item_kind")=="decision":errors.append("Non-executable decision")
        if a["operation"] in MUTATING and a["business_object"] not in ALLOWED_OBJECTS:
            errors.append("Outside shipped operational policy")
        if not a.get("record_type"):errors.append("Record metadata unresolved")
        check=context.get("action_checks",{}).get(aid,{})
        if check.get("business_object")!=a.get("business_object") or check.get("record_type")!=a.get("record_type") or \
           check.get("operation")!=a.get("operation"):errors.append("Independent action classification mismatch")
        fields=set(a["proposed_values"])
        if fields!=set(check.get("validated_fields",[])):errors.append("Writable/readable field set not verified")
        required_checks=("permitted","metadata_verified","required_fields_complete","current_state_matches",
                         "configuration_matches","duplicates_checked","side_effects_verified","readback_available")
        for name in required_checks:
            if check.get(name) is not True:errors.append("Preflight check failed/missing: "+name)
        if not check.get("evidence_refs"):errors.append("Per-action preflight evidence missing")
        if a["operation"]=="Update" and check.get("observed_before")!=a.get("before_values"):
            errors.append("Concurrent target change")
        for field,value in a["proposed_values"].items():
            if value is None and field not in check.get("nullable_fields",[]):errors.append("Unresolved required value: "+field)
        side=a.get("side_effects",{})
        if side.get("review")!="clear" or side.get("financial_activation")!="none" or not side.get("evidence_refs"):
            errors.append("Unknown/active financial or unreviewed side effects")
        if check.get("financial_activation")!="none":errors.append("Live financial activation not cleared")
        if a.get("validation_issues"):errors.append("Unresolved action validation issues")
        for dec in plan.get("decisions",[]):
            if dec.get("state")=="unresolved" and (not dec.get("action_ids") or aid in dec["action_ids"]):
                errors.append("Unresolved prerequisite decision: "+str(dec.get("decision_id")))
        rights=set(a.get("approval_scope",[]))
        if not rights:errors.append("Required decision rights unspecified")
        granted=set()
        for approval in plan.get("approvals",[]):
            if aid not in approval.get("action_ids",[]):continue
            proof=context.get("approval_checks",{}).get(approval.get("approval_id"),{})
            valid=approval.get("validity")=="valid" and approval.get("plan_id")==plan["plan_id"] and \
                approval.get("plan_version")==plan["version"] and approval.get("target")==plan["target"] and \
                approval.get("context_hash")==context_hash(plan) and \
                approval.get("action_hashes",{}).get(aid)==approval_hash(plan,aid)
            if not valid:continue
            exceptions={item for key in closure(plan,aid) for item in acts[key].get("assumptions",[])}
            if not exceptions<=set(approval.get("acknowledged_exceptions",[])):continue
            try:timestamp(approval.get("timestamp",""))
            except (ValueError,TypeError,AttributeError):continue
            if not approval.get("approver_id") or not approval.get("evidence_refs"):continue
            if proof.get("valid") is not True or not proof.get("authority_evidence_ref"):continue
            # Runtime independently attests which rights this approver actually has.
            granted|=set(approval.get("authority_rights",[])) & set(proof.get("authority_rights",[]))
        if not rights<=granted:errors.append("Exact current-version approval/authority missing")
        for dep in a.get("dependencies",[]):
            if dep not in acts or not verified_event(plan,acts[dep],latest.get(dep),latest):
                errors.append("Dependency not verified: "+dep)
        is_verified=verified_event(plan,a,event,latest)
        if event and not is_verified:
            outcome=event["outcome"]
            if outcome=="Reconciled absent":
                if not event.get("verification_refs") or not event.get("retry_eligible") or check.get("retry_authorized") is not True:
                    errors.append("Retry lacks documented absence and exact authorization")
            elif outcome=="Failed with an actionable error":
                # No retry based only on error: separate Reconciled absent event is required.
                errors.append("Failure needs reconciliation before retry")
            else:errors.append("Prior attempt unresolved/changed; do not duplicate")
        state="blocked" if errors or global_errors else ("already_verified" if is_verified else "ready")
        rows.append({"action_id":aid,"state":state,"errors":errors})
    return {"gate_passed":not global_errors and bool(rows) and all(x["state"]!="blocked" for x in rows),
            "global_errors":global_errors,"actions":rows,
            "dispatch_ready_action_ids":[], "edition":"read_only", "execution_authorized":False,
            "already_verified_action_ids":[r["action_id"] for r in rows if r["state"]=="already_verified"],
            "performs_writes":False,"authenticates_input_evidence":False}

def report(plan,ledger):
    base=validate(plan)
    if not base["valid"]:raise ValueError("Invalid plan: "+"; ".join(base["errors"]))
    latest=latest_events(plan,ledger);rows=[];unknown=[];approved=set(ledger.get("approved_action_ids",[]))
    acts=index_actions(plan)
    if not approved<=set(acts):raise ValueError("Approved subset references missing action")
    for a in plan["actions"]:
        aid=a["action_id"];ev=latest.get(aid);reason=a.get("disposition_reason") or "No execution recorded"
        verified=verified_event(plan,a,ev,latest)
        if ev:
            outcome=ev["outcome"];reason=ev["reason"]
            if outcome in SUCCESS and not verified:
                outcome="Outcome unknown; reconciliation required";reason+="; verification evidence or values do not match"
            elif outcome in {"Intent recorded","Reconciled absent"}:
                outcome="Outcome unknown; reconciliation required" if outcome=="Intent recorded" else "Deferred for information or approval"
        elif a["operation"]=="Exclude":outcome="Excluded by reviewer"
        elif a["operation"]=="Defer" or not a["selected"] or aid not in approved:outcome="Deferred for information or approval"
        else:outcome="Blocked by prerequisite or policy"
        expected=a["proposed_values"];actual=ev.get("observed_values",{}) if ev else {}
        variance={k:{"requested":v,"observed":actual.get(k),"observed_present":k in actual} for k,v in expected.items() if k not in actual or actual[k]!=v}
        if aid in approved and not verified:unknown.append(aid)
        rows.append({"action_id":aid,"item_kind":a["item_kind"],"proposed_action":a["operation"],
            "approval_state":"in ledger approved subset; authority validated separately" if aid in approved else "not in approved execution subset",
            "record_type":a.get("record_type"),"outcome":outcome,"target_id":ev.get("target_id") if ev else None,
            "target_url":ev.get("target_url") if ev else None,"reason_or_verification":reason,
            "variance":variance if ev else {},"next_action":ev.get("next_action") if ev else "Review disposition or approve eligible work",
            "owner":ev.get("owner") if ev else None,"attempts":len([e for e in ledger.get("events",[]) if e["action_id"]==aid])})
    return {"schema_version":SCHEMA,"plan_id":plan["plan_id"],"plan_version":plan["version"],
            "target":plan["target"],"run_id":ledger.get("run_id"),"rows":rows,
            "plan_items":len(rows),"counts_by_kind":dict(Counter(r["item_kind"] for r in rows)),
            "counts_by_outcome":dict(Counter(r["outcome"] for r in rows)),
            "totals_by_currency":plan["totals_by_currency"],"approved_action_ids":sorted(approved),
            "approved_subset_execution":"complete_verified" if approved and not unknown else ("not_requested" if not approved else "incomplete"),
            "unverified_approved_actions":unknown,"all_items_reported":True,
            "delivery_readiness":"requires separate evidence review","billing_readiness":"not activated by this package",
            "unapproved_execution_action_ids":[r["action_id"] for r in rows if r["action_id"] in latest and r["action_id"] not in approved],
            "indirect_results":ledger.get("indirect_results",[])}


def commercial_review(plan):
    rows=[]
    supported={"fixed_fee","interval","milestone","time_materials","progress","recurring","mixed","expenses","cap","advance","retainer"}
    for c in plan.get("commercial_components",[]):
        model=c.get("model");details=c.get("details",{});issues=[]
        if model not in supported:issues.append("Unrecognized terms require a reviewed mapping")
        if not c.get("source_ref"):issues.append("Missing contractual source")
        if plan.get("project_kind")=="internal" and c.get("amount_kind")=="contract_price":
            issues.append("Internal supplier value must not be labeled customer revenue/contract sales price")
        if model=="interval" and details.get("completion_based_in_arrears_matches") is not True:
            issues.append("Interval mechanics not confirmed; do not assume equal installments")
        if model=="milestone":
            try:
                parts=details.get("milestone_percentages");initial=details.get("initial_percent")
                if not isinstance(parts,list) or not parts or initial is None:
                    issues.append("Explicit milestone percentages and initial amount basis required")
                else:
                    nums=[money(x) for x in parts]+[money(initial)]
                    if any(x<0 or x>100 for x in nums) or sum(nums)!=Decimal("100"):
                        issues.append("Initial plus milestone percentages must reconcile to 100")
            except (TypeError,ValueError):
                issues.append("Invalid milestone percentages")
            if details.get("acceptance_mapping_verified") is not True:
                issues.append("Task completion versus customer acceptance unresolved")
        if model=="time_materials":
            for key in ("rates_verified","rounding_defined","billable_approval_defined"):
                if details.get(key) is not True:issues.append("T&M prerequisite missing: "+key)
        if model=="progress" and details.get("native_progress_matches_contract") is not True:
            issues.append("Contractual and native completion measure not reconciled")
        if model=="recurring" and not all(details.get(k) for k in ("start","end","frequency")):
            issues.append("Recurrence dates/frequency incomplete")
        if model=="mixed" and details.get("component_coverage_nonoverlap_verified") is not True:
            issues.append("Rule/component overlap unresolved")
        if model=="expenses" and details.get("automatic_inclusion") is True and details.get("expense_rule_verified") is not True:
            issues.append("Automatic expense inclusion requires a verified expense rule")
        if model=="cap" and details.get("scope_verified") is not True:
            issues.append("Rule cap versus contract-wide coverage unresolved")
        if model in {"advance","retainer"} and details.get("consumption_and_double_billing_reviewed") is not True:
            issues.append("Advance consumption, refunds and double-billing control unresolved")
        rows.append({"component_id":c.get("component_id"),"model":model,"recognized":model in supported,
                     "review_issues":issues,"execution":"deferred_financial_setup",
                     "can_execute":False})
    return {"components":rows,"all_components_reported":True,"generates_forecast":False,"performs_writes":False}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest="command",required=True)
    for command,names in {"validate":["plan"],"commercial":["plan"],"diff":["old","new"],"revise":["plan","patch"],
                          "gate":["plan","context","ledger"],"report":["plan","ledger"],"totals":["components"]}.items():
        p=sub.add_parser(command)
        for name in names:p.add_argument(name,type=Path)
    args=parser.parse_args()
    try:
        fn={"validate":validate,"commercial":commercial_review,"diff":diff,"revise":revise,"gate":gate,"report":report,"totals":totals}[args.command]
        order_names={"validate":["plan"],"commercial":["plan"],"diff":["old","new"],"revise":["plan","patch"],
                     "gate":["plan","context","ledger"],"report":["plan","ledger"],"totals":["components"]}[args.command]
        out=fn(*[load(getattr(args,n)) for n in order_names])
        print(json.dumps(out,ensure_ascii=False,indent=2,allow_nan=False))
        return 2 if out.get("valid") is False or out.get("gate_passed") is False else 0
    except (ValueError,TypeError,KeyError,OSError,AttributeError) as exc:
        print(json.dumps({"input_error":str(exc),"performs_writes":False}));return 1
if __name__=="__main__":raise SystemExit(main())
