#!/usr/bin/env python3
"""Deterministic request-completion gate. No network or business writes.
Validates structure/provenance declarations, not the truth of submitted evidence.
Exit: 0 passed; 2 blocked; 1 malformed input. Python 3.10+.
"""
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path
from typing import Any
import risk_gate

CONTRACT = "PM-4.0.0"
OWNERS = {"project-portfolio-health-assistant", "project-operations-assistant",
          "project-risk-assistant", "project-financial-assistant"}
TERMINAL = {"Answered", "Not applicable", "Unavailable after alternatives"}
ATTEMPT_STATES = {"not_probed", "listed", "schema_verified", "read_verified",
                  "denied", "tool_missing", "feature_absent_confirmed", "incompatible", "unknown"}
CONTEXT_FIELDS = {"normalized_goal", "intent", "project_ids", "resource_keys", "subsidiary_ids",
    "exact_user", "as_of", "local_today", "timezone", "windows", "project_ends",
    "required_evidence_fields", "completeness_mode", "currency_accounting",
    "placement_price_requirement", "candidate_policy", "capability_fingerprint",
    "evidence_modes", "plannedwork_definition", "type_map_version", "native_results",
    "discovery_version", "source_snapshot"}
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

def signature(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False,
                                   separators=(",", ":"), allow_nan=False).encode()).hexdigest()
def _require(condition: Any, text: str, errors: list[str]) -> None:
    if not condition: errors.append(text)
def _nonempty(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())
def _count(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value >= 0
def source_errors(source: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    state = source.get("state")
    if state == "exhausted":
        for field in ("pages_exhausted", "periods_complete", "scope_reconciled"):
            _require(source.get(field) is True, f"source {field} false/missing", errors)
        for field in ("pending_pages", "pending_periods"):
            _require(field in source and source[field] == [], f"source {field} pending/missing", errors)
        _require(bool(source.get("evidence_refs")), "exhausted source lacks evidence", errors)
    elif state == "not_applicable":
        _require(bool(source.get("evidence_refs")) and _nonempty(source.get("reason")),
                 "source nonapplicability lacks positive evidence", errors)
    elif state == "unavailable":
        _require(_nonempty(source.get("reason")) and _nonempty(source.get("limitation")),
                 "unavailable source lacks reason/limitation", errors)
        _require(source.get("alternatives_accounted_for") is True, "alternatives unaccounted", errors)
        _require("remaining_usable_channels" in source and source["remaining_usable_channels"] == [],
                 "usable alternatives remain/unknown", errors)
        attempts = source.get("attempts", [])
        _require(isinstance(attempts,list) and bool(attempts), "unavailable source lacks attempts", errors)
        if isinstance(attempts, list):
            for attempt in attempts:
                _require(isinstance(attempt,dict), "invalid attempt", errors)
                if not isinstance(attempt,dict): continue
                _require(attempt.get("state") in ATTEMPT_STATES and
                         attempt.get("state") not in {"not_probed","listed","schema_verified"},
                         "attempt is not exhausted", errors)
                _require(_nonempty(attempt.get("channel")) and _nonempty(attempt.get("reason")),
                         "attempt lacks channel/reason", errors)
        _require(source.get("authorization_pending") is False, "pending authorization is unfinished", errors)
    else:
        errors.append("source pending/incomplete or unknown state")
    return errors

def risk_request_signature(request: dict[str, Any]) -> str:
    return signature({k: request.get(k) for k in ("request_id","request_text","mode","context","obligations")})

def evaluate(request: dict[str, Any], result: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    if not isinstance(request,dict) or not isinstance(result,dict):
        raise ValueError("request and result must be JSON objects")
    _require(request.get("contract_version") == CONTRACT, "request contract mismatch", errors)
    _require(result.get("contract_version") == CONTRACT, "result contract mismatch", errors)
    _require(_nonempty(request.get("request_id")) and _nonempty(request.get("request_text")),
             "missing request identity/text", errors)
    _require(request.get("primary_owner") in OWNERS, "invalid primary owner", errors)
    ctx = request.get("context",{})
    _require(isinstance(ctx,dict) and CONTEXT_FIELDS <= set(ctx), "incomplete context/cache dimensions", errors)
    expected_signature = signature(request)
    _require(result.get("request_signature") == expected_signature, "changed request signature", errors)
    _require(result.get("context_fingerprint") == signature(ctx), "changed cache context", errors)
    for k in ("project_ids","resource_keys","subsidiary_ids"):
        values=ctx.get(k,[]) if isinstance(ctx,dict) else []
        _require(isinstance(values,list) and len(values)==len(set(values)), f"invalid {k}", errors)
    obligations = request.get("obligations", [])
    actual_rows = result.get("rows", [])
    _require(isinstance(obligations,list) and bool(obligations), "no request obligations", errors)
    if not isinstance(obligations,list) or not isinstance(actual_rows,list):
        raise ValueError("obligations/rows must be arrays")
    _require(len(obligations)==len(actual_rows), "missing or extra question rows", errors)
    ids=[ob.get("id") for ob in obligations]
    _require(all(_nonempty(v) for v in ids) and len(ids)==len(set(ids)), "invalid/duplicate question IDs", errors)
    for index, obligation in enumerate(obligations):
        label=str(obligation.get("id",index))
        _require(obligation.get("order")==index+1, f"{label}: invalid requested order", errors)
        for key in ("original_text","intent"):
            _require(_nonempty(obligation.get(key)), f"{label}: missing {key}", errors)
        _require(obligation.get("owner") in OWNERS, f"{label}: invalid owner", errors)
        _require(bool(obligation.get("scope")) and bool(obligation.get("window")),f"{label}: missing scope/window",errors)
        if index >= len(actual_rows): continue
        row=actual_rows[index]
        _require(row.get("obligation")==obligation, f"{label}: changed/reordered obligation", errors)
        state=row.get("terminal_state")
        _require(state in TERMINAL, f"{label}: nonterminal state {state!r}", errors)
        _require(_nonempty(row.get("answer")), f"{label}: answer/reason missing", errors)
        _require(isinstance(row.get("limitations"),list), f"{label}: limitation ledger missing", errors)
        _require(bool(row.get("source_refs")),f"{label}: source/provenance references missing",errors)
        if state=="Not applicable":
            _require(_nonempty(row.get("applicability_basis")), f"{label}: no nonapplicability basis", errors)
        required=obligation.get("required_sources",[])
        _require(bool(required),f"{label}: source plan empty",errors)
        checks=row.get("source_checks",[])
        _require(len(required)==len(checks),f"{label}: missing/extra source checks",errors)
        required_ids=[s["id"] for s in required]
        _require(len(required_ids)==len(set(required_ids)),f"{label}: duplicate planned source",errors)
        check_map={s.get("covers",{}).get("id"):s for s in checks}
        _require(len(check_map)==len(checks),f"{label}: duplicate source result",errors)
        for spec in required:
            source=check_map.get(spec["id"],{})
            _require(source.get("covers")==spec,f"{label}: source scope/window/fields changed",errors)
            errors.extend(f"{label}/{spec['id']}: {err}" for err in source_errors(source))
        expected=obligation.get("expected_populations",[])
        denoms=row.get("denominators",[])
        _require(bool(expected) and len(expected)==len(denoms),f"{label}: missing/extra populations",errors)
        dmap={d.get("unit"):d for d in denoms}
        _require(len(dmap)==len(denoms),f"{label}: duplicate denominator unit",errors)
        unknown_total=0
        for pop in expected:
            unit=pop["unit"]; members=pop.get("members")
            if not isinstance(members,list):
                d=dmap.get(unit,{})
                source=check_map.get(pop.get("unavailability_source_id"),{})
                allowed=unit in {"native_indicator_types","native_indicator_pairs"} and pop.get("allow_unknown_after_alternatives") is True
                _require(allowed and d.get("expected") is None and d.get("unavailable") is None
                         and d.get("count_state")=="unknown_after_alternatives"
                         and source.get("state")=="unavailable" and not source_errors(source)
                         and bool(row.get("limitations")),
                         f"{label}: unknown population not exhausted or cannot prove all-population scope", errors)
                continue
            _require(len(members)==len(set(members)), f"{label}: duplicate expected member", errors)
            d=dmap.get(unit,{})
            _require(_count(d.get("expected")) and d["expected"]==len(members),f"{label}: expected denominator mismatch",errors)
            counts=[]
            parts=[]
            for category in ("evaluated","unavailable","not_applicable","unresolved"):
                number=d.get(category); values=d.get("partitions",{}).get(category)
                _require(_count(number),f"{label}: invalid {category} count",errors)
                _require(isinstance(values,list),f"{label}: missing {category} partition",errors)
                if isinstance(values,list):
                    _require(number==len(values),f"{label}: {category} count/keys mismatch",errors)
                    parts.extend(values)
                counts.append(number if _count(number) else 0)
            _require(sum(counts)==len(members),f"{label}: denominator does not reconcile",errors)
            _require(len(parts)==len(set(parts)) and set(parts)==set(members),
                     f"{label}: partitions overlap or omit members",errors)
            _require(d.get("unresolved")==0,f"{label}: unresolved population",errors)
            unknown_total += d.get("unavailable",0) if _count(d.get("unavailable")) else 0
        if unknown_total:
            _require(bool(row.get("limitations")),f"{label}: unavailable population lacks limitation",errors)
        if state=="Unavailable after alternatives":
            _require(bool(row.get("limitations")) and _nonempty(row.get("missing_evidence")),
                     f"{label}: not determinable lacks missing evidence/limits",errors)
            _require(row.get("remaining_usable_channels")==[] and "remaining_usable_channels" in row,
                     f"{label}: alternatives still available/unknown",errors)
            _require(any(c.get("state")=="unavailable" for c in checks),
                     f"{label}: unavailable answer lacks unavailable-source proof",errors)
        _require(row.get("pages_complete") is True and row.get("periods_complete") is True,
                 f"{label}: incomplete pages/periods",errors)
    for field in ("pending_pages","pending_periods","pending_batches","unresolved_queue"):
        _require(field in result and result[field]==[],f"global {field} pending/missing",errors)
    _require(result.get("population_reconciled") is True, "population not reconciled", errors)
    risk_result=None
    mode=request.get("mode","substantive")
    if mode in {"substantive","render_only"}:
        if not isinstance(result.get("risk_review"),dict):
            errors.append("missing complete risk review; a passed-flag alone is insufficient")
        else:
            frozen=request.get("risk_plan")
            _require(isinstance(frozen,dict),"missing frozen evidence-led investigation plan",errors)
            if isinstance(frozen,dict):
                _require(frozen.get("request_signature")==risk_request_signature(request),
                         "risk plan bound to another request/obligation order",errors)
                _require(frozen.get("context_sha256")==signature(risk_gate.context_identity(ctx)),
                         "risk plan bound to another account/role/window context",errors)
                wanted=ctx.get("completeness_mode")
                _require(wanted in {"broad","focused"} and frozen.get("mode")==wanted,
                         "risk breadth differs from frozen request",errors)
            risk_result=risk_gate.evaluate(result["risk_review"],frozen if isinstance(frozen,dict) else {})
            errors.extend("risk: "+e for e in risk_result["errors"])
            _require(set(result["risk_review"].get("scope",{}).get("project_ids",[]))==set(ctx.get("project_ids",[])),
                     "risk and request project scope differ",errors)
            _require(result["risk_review"].get("as_of")==ctx.get("as_of") and
                     result["risk_review"].get("timezone")==ctx.get("timezone"),
                     "risk and request clock differ",errors)
    elif mode=="document_draft":
        _require(ctx.get("project_ids")==[] and bool(request.get("document_scope_reason")),
                 "document-only exemption must not hide an existing project review",errors)
    else: errors.append("unknown root mode")
    return {"contract_version":CONTRACT,"gate_passed":not errors,
        "execution_state":"Complete" if not errors else "Incomplete","request_signature":expected_signature,
        "questions_expected":len(obligations),"questions_received":len(actual_rows),
        "risk_gate":risk_result,"errors":errors,
        "assurance":"Structural validation only; complete execution may retain unavailable evidence."}
def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("request",type=Path);parser.add_argument("result",type=Path)
    parser.add_argument("--output",type=Path)
    args=parser.parse_args()
    try:
        out=evaluate(json.loads(args.request.read_text()),json.loads(args.result.read_text()))
        text=json.dumps(out,indent=2,ensure_ascii=False)+"\n"
        if args.output: publish_file(args.output, text, inputs=cli_inputs(args))
        print(text,end="")
        return 0 if out["gate_passed"] else 2
    except (ValueError,TypeError,KeyError,OSError) as e:
        print(json.dumps({"input_error":str(e)}));return 1
if __name__=="__main__": raise SystemExit(main())
