#!/usr/bin/env python3
"""Validate supplied native-type mappings against runtime scope. No discovery or network.
Returned IDs are account data; keep the private profile outside distributable skills.
"""
from __future__ import annotations
from typing import Any

CONTRACT="INDICATOR-DISCOVERY-1.0"

def resolve(concept_key: str, observed_types: list[dict[str,Any]], context: dict[str,Any],
            profile: dict[str,Any] | None = None) -> dict[str,Any]:
    """Return a unique exact mapping or honest unknown/conflict; never invent IDs or color."""
    base={"concept_key":concept_key,"type_id":None,"state":"unknown","limitations":[]}
    if not all(context.get(k) for k in ("account_id","environment","enabled_release","capability_fingerprint")):
        return {**base,"limitations":["Exact runtime deployment context is unavailable."]}
    verified=[r for r in observed_types if r.get("concept_key")==concept_key and
              r.get("definition_verified") is True and r.get("type_id") is not None and
              r.get("evidence_ref") and r.get("binding")==context]
    ids={str(r["type_id"]) for r in verified}
    if len(ids)>1:
        return {**base,"state":"conflict","limitations":["Multiple exact runtime mappings require reconciliation."]}
    if ids:
        return {**base,"state":"read_verified","type_id":next(iter(ids)),
                "evidence_refs":[r["evidence_ref"] for r in verified]}
    if profile is None:
        return {**base,"limitations":["No verified runtime mapping or approved private deployment profile. Preserve raw types."]}
    if profile.get("binding")!=context or profile.get("version")!=CONTRACT:
        return {**base,"state":"incompatible","limitations":["Private mapping does not match the current deployment context."]}
    matches=[r for r in profile.get("mappings",[]) if r.get("concept_key")==concept_key]
    if len(matches)!=1 or not matches[0].get("validation_evidence_ref") or matches[0].get("type_id") is None:
        return {**base,"limitations":["Private profile lacks a unique evidence-backed type mapping."]}
    item=matches[0]
    # Profiles cannot override a contradictory observed exact type label/definition.
    conflicting=[r for r in observed_types if str(r.get("type_id"))==str(item["type_id"]) and
                 r.get("definition_verified") is True and r.get("concept_key")!=concept_key]
    if conflicting:
        return {**base,"state":"conflict","limitations":["Current type definition conflicts with private mapping."]}
    return {**base,"state":"schema_verified","type_id":str(item["type_id"]),
            "evidence_refs":[item["validation_evidence_ref"]],
            "limitations":["Profile binding is checked; permissions and evidence authenticity require the host."]}
