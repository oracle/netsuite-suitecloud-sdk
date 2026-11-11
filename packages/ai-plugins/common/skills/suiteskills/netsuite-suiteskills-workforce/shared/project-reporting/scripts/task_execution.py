#!/usr/bin/env python3
"""TASK-1.0.0: offline validation of host-supplied task decisions and source receipts.
No connector discovery, account calls, approvals, credentials, or LLM execution here.
The trusted host MUST authenticate the ledger; hashes and booleans are not authorization.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from datetime import datetime
from pathlib import Path

VERSION = "TASK-1.0.0"
NO_CONNECTOR = "No active connector relevant to this request is available. No account-backed report was produced."
AMBIGUOUS = "Multiple active connectors could return materially different data. Which account or environment should this review use?"
DOMAINS = {"health", "operations", "risk", "financial"}
TERMINAL = {"completed", "unavailable_after_alternatives", "not_applicable"}
READ_KINDS = {"data_read", "readback", "document_read"}
def digest(obj):
    return hashlib.sha256(json.dumps(obj,sort_keys=True,separators=(",",":"),
                                    ensure_ascii=False,allow_nan=False).encode()).hexdigest()

def select_connector(context):
    """One completed availability check per root task. Reuse for all supporting skills.
    Equivalent routes must have identical host-verified data AND visibility bindings.
    Unknown bindings never prove equivalence. Later loss/error is not success or absence.
    """
    if not isinstance(context,dict) or context.get("policy_version") != VERSION:
        raise ValueError("Trusted task context required")
    for key in ("task_id","conversation_id"):
        if not isinstance(context.get(key),str) or not context[key]:
            raise ValueError("Task and conversation identities required")
    checks=context.get("connector_checks")
    if not isinstance(checks,list) or len(checks)!=1:
        raise ValueError("Exactly one root availability check required")
    check=checks[0]
    if check.get("complete") is not True or check.get("task_id")!=context["task_id"]:
        raise ValueError("Completed root connector check required")
    candidates=check.get("candidates")
    if not isinstance(candidates,list):raise ValueError("Connector candidates required")
    if len({c.get("id") for c in candidates})!=len(candidates):
        raise ValueError("Duplicate connector identity")
    active=[]
    for c in candidates:
        if not isinstance(c.get("id"),str) or not c["id"]:
            raise ValueError("Connector identity required")
        if type(c.get("active")) is not bool or type(c.get("relevant")) is not bool:
            raise ValueError("Actual connector state required")
        if c["active"] and c["relevant"]:active.append(c)
    explicit=context.get("user_selected_connector")
    if explicit:
        active=[c for c in active if c["id"]==explicit]
    if not active:
        return {"state":"unavailable","selected":None,"message":NO_CONNECTOR,"ask":False}
    if len(active)==1:
        return {"state":"selected","selected":active[0]["id"],"message":None,"ask":False}
    bindings={(c.get("data_binding"),c.get("visibility_binding")) for c in active}
    if len(bindings)==1 and all(all(x) for x in bindings):
        chosen=sorted(active,key=lambda c:c["id"])[0]["id"]
        return {"state":"selected","selected":chosen,"message":None,"ask":False}
    return {"state":"ambiguous","selected":None,"message":AMBIGUOUS,"ask":True}

def followup_decision(item):
    """Classify next steps; this never grants permission or performs a mutation."""
    if item.get("domain") not in DOMAINS:raise ValueError("Unsupported supporting domain")
    if item.get("operation")!="read":
        return {"decision":"existing_action_approval_required","automatic":False}
    scope=item.get("scope")
    if scope=="material_choice":
        return {"decision":"user_scope_choice_required","automatic":False}
    if scope not in {"same","entailed"}:
        return {"decision":"outside_requested_scope","automatic":False}
    if item.get("required") is True:
        return {"decision":"perform","automatic":True}
    if item.get("cheap") is True and item.get("relevant") is True:
        return {"decision":"perform","automatic":True}
    return {"decision":"record_deferred_cost_or_irrelevance","automatic":False}

def validate_followups(context):
    """Required/cheap relevant reads cannot be deferred just to ask 'shall I drill down?'."""
    if context.get("followups_reviewed") is not True:
        raise ValueError("Cross-domain follow-through review required")
    items=context.get("followups",[])
    if not isinstance(items,list):raise ValueError("Follow-up ledger required")
    seen=set();deferred=[]
    for item in items:
        if not item.get("id") or item["id"] in seen:raise ValueError("Stable unique follow-up ID required")
        seen.add(item["id"]);decision=followup_decision(item)
        state=item.get("state")
        if decision["automatic"]:
            if state not in TERMINAL:raise ValueError("Required or cheap relevant follow-up unfinished")
            if state=="completed" and not item.get("source_refs"):
                raise ValueError("Completed follow-up needs actual source references")
            if state=="unavailable_after_alternatives":
                if not item.get("attempts") or not item.get("limitation") or item.get("remaining_usable_channels")!=[]:
                    raise ValueError("Unavailable follow-up alternatives not exhausted")
            if state=="not_applicable" and not item.get("applicability_evidence"):
                raise ValueError("Nonapplicability requires evidence")
        else:
            if state=="completed":
                raise ValueError("Unsupported/approval-bound action is not automatic follow-through")
            if not item.get("reason"):raise ValueError("Deferred work requires an explicit reason")
            # A required unresolved choice/write cannot become completed analysis by this helper.
            if item.get("required") is True:raise ValueError("Required item remains blocked pending its existing gate")
            deferred.append({"id":item["id"],"reason":item["reason"]})
    return deferred

def validate_trace(data,context,trace,selected):
    """Bind all dataset sources to actual calls in the current trusted conversation ledger.
    A source receipt is a reference to a tool result, not proof on its own.
    Host integrity/authentication and arithmetic validation remain separate requirements.
    """
    if not isinstance(trace,dict) or trace.get("conversation_id")!=context["conversation_id"]:
        raise ValueError("Current-conversation tool ledger required")
    if trace.get("task_id")!=context["task_id"] or trace.get("dataset_sha256")!=digest(
            {k:v for k,v in data.items() if k!="content_sha256"}):
        raise ValueError("Tool ledger is not bound to this dataset and task")
    calls=trace.get("calls");receipts=trace.get("sources")
    if not isinstance(calls,list) or not isinstance(receipts,list):
        raise ValueError("Actual call and source receipt lists required")
    if len({c.get("id") for c in calls})!=len(calls):raise ValueError("Duplicate call ID")
    callmap={c.get("id"):c for c in calls}
    if any(not k for k in callmap):raise ValueError("Stable host tool-call IDs required")
    for c in calls:
        if c.get("conversation_id")!=context["conversation_id"]:raise ValueError("Prior-conversation call rejected")
        if c.get("kind")!="document_read" and c.get("connector_id")!=selected:
            raise ValueError("Call belongs to another connector")
        try:
            stamp=datetime.fromisoformat(c["completed_at"].replace("Z","+00:00"))
            if stamp.tzinfo is None:raise ValueError()
        except (ValueError,KeyError,AttributeError):
            raise ValueError("Tool-call timestamp must be timezone-aware") from None
        h=c.get("response_sha256")
        if not isinstance(h,str) or len(h)!=64 or any(x not in "0123456789abcdef" for x in h):
            raise ValueError("Tool response fingerprint required")
    receiptmap={s.get("source_id"):s for s in receipts}
    if len(receiptmap)!=len(receipts):raise ValueError("Duplicate source receipt")
    expected={s["id"] for s in data["sources"]}
    if set(receiptmap)!=expected:raise ValueError("Unmatched source receipts")
    for source in data["sources"]:
        ids=receiptmap[source["id"]].get("call_ids")
        if not isinstance(ids,list) or not ids or len(ids)!=len(set(ids)) or not set(ids)<=set(callmap):
            raise ValueError("Every source needs actual distinct call references")
        bound=[callmap[i] for i in ids]
        if source["state"]=="read_verified":
            valid_kinds={"data_read","readback"}
            if str(source.get("kind","")).lower() in {"document","source_document","uploaded_file","sow"}:
                valid_kinds.add("document_read")
            if not any(c.get("status")=="success" and c.get("kind") in valid_kinds for c in bound):
                raise ValueError("A listed tool, metadata result, or unrelated document cannot back an account figure")
        elif not any(c.get("kind") in READ_KINDS|{"capability_discovery","metadata_read"} for c in bound):
            raise ValueError("Unavailable source requires its real attempted/discovery evidence")
    for f in context.get("followups",[]):
        if f.get("state")=="completed" and not set(f.get("source_refs",[]))<=expected:
            raise ValueError("Follow-up sources missing from report provenance")
    return {"valid":True,"policy_version":VERSION,
            "note":"Structural trace validation; trusted host must authenticate every actual call and calculation."}

def gate(data,context,trace):
    selected=select_connector(context)
    if selected["state"]!="selected":
        return {"proceed":False,**selected}
    deferred=validate_followups(context)
    validate_trace(data,context,trace,selected["selected"])
    # Deferral explanations must already be included in the protected presentation data,
    # so audience review covers them. Do not append arbitrary context after projection.
    safe_text=json.dumps(data,ensure_ascii=False,sort_keys=True)
    if any(d["reason"] not in safe_text for d in deferred):
        raise ValueError("Deferred-detail limitations must be in the artifact before publication review")
    return {"proceed":True,"state":"ready","selected":selected["selected"],"ask":False,
            "note":"No writes or connector calls are performed by this helper."}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("context",type=Path)
    p.add_argument("--dataset",type=Path);p.add_argument("--trace",type=Path)
    args=p.parse_args()
    try:
        ctx=json.loads(args.context.read_text())
        if args.dataset and args.trace:
            result=gate(json.loads(args.dataset.read_text()),ctx,json.loads(args.trace.read_text()))
        elif args.dataset or args.trace:raise ValueError("Supply both dataset and trace")
        else:result=select_connector(ctx)
        # Never print the host's connector bindings, trace, account data, or private identifiers.
        public={k:v for k,v in result.items() if k!="selected"}
        print(json.dumps(public,indent=2))
        return 0 if result.get("proceed",result.get("state")=="selected") else 2
    except (ValueError,TypeError,KeyError,OSError):
        print('{"passed":false,"error":"Task validation failed; inspect protected context and trace through the authorized host."}')
        return 1
if __name__=="__main__":raise SystemExit(main())
