#!/usr/bin/env python3
"""ANSWER-FACTS-1.0: normalize 1–2 sourced scalar facts to existing visual cards.
No queries, guesses, authorization, or changes to the evidence/request/approval objects.
"""
from __future__ import annotations
from copy import deepcopy
from datetime import date, datetime
import math, re
from decimal import Decimal

VERSION = "ANSWER-FACTS-1.0"
REQUIRED = {"id","obligation_id","label","value_type","evidence_path","source_refs","definition","unit"}
OPTIONAL = {"provenance","denominator","limitations"}
KINDS = {"number","decimal","count","date","status","presence"}

def read_pointer(evidence, pointer):
    """Strict JSON Pointer within supplied normalized evidence, never a file or URL."""
    if not isinstance(pointer,str) or not pointer.startswith("/") or pointer.startswith("/answer_facts"):
        raise ValueError("Fact needs a source-evidence JSON pointer, not a reference to itself.")
    current=evidence
    for part in pointer[1:].split("/"):
        if "~" in part and any(x not in "01" for x in [part[i+1:i+2] for i,c in enumerate(part) if c=="~"]):
            raise ValueError("Invalid evidence pointer escape.")
        part=part.replace("~1","/").replace("~0","~")
        if isinstance(current,list):
            if not part.isdecimal() or str(int(part))!=part or int(part)>=len(current):
                raise ValueError("Evidence pointer index unavailable.")
            current=current[int(part)]
        elif isinstance(current,dict) and part in current:
            current=current[part]
        else:
            raise ValueError("Evidence field unavailable: normalize missing input explicitly to null.")
    return current

def scalar(value, kind):
    if value is None:return None
    if kind in {"number","count"}:
        if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value):
            raise ValueError("Numeric facts need finite numeric evidence; do not silently parse identifiers or text.")
        if kind=="count" and (value<0 or int(value)!=value):
            raise ValueError("A count must be a nonnegative integer.")
        return value
    if kind=="decimal":
        if not isinstance(value,str) or not re.fullmatch(r"-?\d+(?:\.\d+)?",value) or not Decimal(value).is_finite():
            raise ValueError("Decimal facts require an exact plain decimal string, with explicit unit and source definition.")
        return value
    if kind=="presence":
        if type(value) is not bool:raise ValueError("Presence requires an evidenced boolean, not a missing row.")
        return "Present" if value else "Absent"
    if not isinstance(value,str) or not value.strip():
        raise ValueError("Date and status facts need explicit nonempty strings.")
    if kind=="date":
        try:
            if "T" in value:
                stamp=datetime.fromisoformat(value.replace("Z","+00:00"))
                if stamp.tzinfo is None:raise ValueError("Timestamp needs its timezone.")
            else:date.fromisoformat(value)
        except ValueError as exc:raise ValueError("Date fact must be an ISO date or aware timestamp.") from exc
    return value

def build_cards(payload, coverage):
    """Select values from source evidence. String/identifier disclosure is still mandatory."""
    facts=payload.get("evidence",{}).get("answer_facts")
    if facts is None:return None
    if not isinstance(facts,list) or not 1<=len(facts)<=2:
        raise ValueError("Scalar answer mode requires one or two facts; use the domain table for larger answers.")
    e=payload["evidence"];s=payload["snapshot"]
    sources={x["id"]:x for x in payload["sources"]}
    rows=(payload.get("result") or {}).get("rows",[])
    obligations={r["obligation"]["id"]:r for r in rows}
    seen=set();out=[]
    for fact in facts:
        if not isinstance(fact,dict) or not REQUIRED<=set(fact) or set(fact)-REQUIRED-OPTIONAL:
            raise ValueError("Invalid scalar-answer fact shape.")
        for key in ("id","obligation_id","label","definition","evidence_path","unit"):
            if not isinstance(fact[key],str) or not fact[key].strip():raise ValueError("Fact text fields must be explicit.")
        if fact["id"] in seen:raise ValueError("Duplicate answer fact identity.")
        seen.add(fact["id"])
        if fact["value_type"] not in KINDS:raise ValueError("Unsupported answer fact type.")
        refs=fact["source_refs"]
        if (not isinstance(refs,list) or not refs or any(not isinstance(r,str) for r in refs)
            or len(refs)!=len(set(refs)) or not set(refs)<=set(sources)):
            raise ValueError("Fact source references missing, duplicated or unknown.")
        obligation=obligations.get(fact["obligation_id"])
        if not obligation or not set(refs)<=set(obligation.get("source_refs",[])):
            raise ValueError("Fact must bind to a declared answer obligation and its actual sources.")
        provenance=fact.get("provenance","observation")
        if provenance not in {"observation","calculation","native","proposed"}:
            raise ValueError("Unsupported fact provenance.")
        limitations=fact.get("limitations",[])
        if not isinstance(limitations,list) or any(not isinstance(x,str) for x in limitations):
            raise ValueError("Fact limitations must be text.")
        denominator=fact.get("denominator")
        if denominator is not None and (type(denominator) not in (int,float) or not math.isfinite(denominator) or denominator<0):
            raise ValueError("Invalid fact denominator.")
        raw=read_pointer(e,fact["evidence_path"])
        value=scalar(raw,fact["value_type"])
        known=(coverage["state"] in {"Complete","Limited"} and obligation.get("terminal_state")=="Answered"
            and all(sources[r].get("state")=="read_verified" and sources[r].get("pages_complete") is True
                    and sources[r].get("periods_complete") is True for r in refs))
        state="unavailable" if value is None else ("complete" if known else "partial")
        notes=deepcopy(limitations)
        if state!="complete":notes.append("Missing or partial source evidence; no zero or clear-state inference.")
        out.append({"kind":"kpi","id":"answer-"+fact["id"],"title":fact["label"],
            "value":value,"unit":"presence" if fact["value_type"]=="presence" else fact["unit"],
            "scope":s["scope"]["label"],"as_of":s["as_of"],"timezone":s["timezone"],"period":s["window"]["label"],
            "source_refs":deepcopy(refs),"state":state,"limitations":notes,
            "denominator":denominator,"definition":fact["definition"],"provenance":provenance,
            "population_basis":"scoped_evaluated" if known else "known_subset",
            "lineage":{"formula":fact["definition"],"grain":"one requested scalar fact",
                "filters":deepcopy(s.get("filters",[])),"input_row_refs":[fact["evidence_path"]],
                "context":deepcopy(s.get("context",{})),"source_refs":deepcopy(refs)},
            "native_status":value if provenance=="native" and value in {"GREEN","YELLOW","RED"} else None,
            "risk_severity":None})
    return out

def presence_only(data):
    """Strict optional exception, never inferred from a short prompt or one-row count."""
    cards=data.get("cards",[])
    if data.get("coverage",{}).get("state")!="Complete" or len(cards)!=1 or data.get("actions"):
        return False
    card=cards[0]
    if (card.get("unit")!="presence" or card.get("value") not in {"Present","Absent"}
        or card.get("state")!="complete" or card.get("provenance")!="observation"
        or card.get("limitations") or card.get("native_status") or card.get("risk_severity")):
        return False
    audit={"obligations","source-coverage","discovery-coverage","review-depth"}
    return not any(p.get("rows") for p in data.get("panels",[]) if p.get("id") not in audit)
