#!/usr/bin/env python3
"""Normalize/select supplied native Indicator rows; no SQL, network or native-color calculation.
Input fields are package-normalized keys, NOT claimed NetSuite API columns.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Any
import argparse, json
from pathlib import Path
CONTRACT="PM-3.0.0"
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

def instant(value: str) -> datetime:
    t=datetime.fromisoformat(value.replace("Z","+00:00"))
    if t.tzinfo is None: raise ValueError("Timestamp must include its actual timezone.")
    return t.astimezone(timezone.utc)
def select_results(rows: list[dict[str,Any]], projects: list[str], types: list[str],
                   cutoff: str, historical: bool=False, transport_available: bool=True,
                   type_universe_complete: bool=True) -> dict[str,Any]:
    end=instant(cutoff); project_set=set(map(str,projects))
    if len(projects)!=len(project_set): raise ValueError("Duplicate projects.")
    type_set=set(map(str,types)); unique={}; outside=[]
    for row in rows:
        for key in ("id","project","indicatortype"):
            if key not in row: raise ValueError("Missing native identity "+key)
        key=str(row["id"])
        if key in unique and unique[key]!=row: raise ValueError("Conflicting duplicate native result row "+key)
        unique[key]=row
    for row in unique.values():
        if str(row["project"]) in project_set:type_set.add(str(row["indicatortype"]))
        else: outside.append(str(row["id"]))
    pairs=[]
    for project in sorted(project_set):
        for typ in sorted(type_set):
            raw=[r for r in unique.values() if str(r["project"])==project and str(r["indicatortype"])==typ]
            pair={"project":project,"type_id":typ,"raw_rows":raw,"selected":None,
                  "native_status":None,"state":"missing" if transport_available else "unavailable",
                  "historical_alignment":"unverified","selection_basis":None,"limitations":[]}
            eligible=[]; undated=[]; excluded=[]
            for row in raw:
                ts=row.get("evaluated_at")
                if ts:
                    (eligible if instant(ts)<=end else excluded).append(row)
                else: undated.append(row)
            if eligible:
                latest=max(instant(r["evaluated_at"]) for r in eligible)
                ties=[r for r in eligible if instant(r["evaluated_at"])==latest]
                def tiekey(r):
                    value=str(r["id"])
                    return (0,int(value)) if value.lstrip("-").isdigit() else (1,value)
                pair["selected"]=max(ties,key=tiekey)
                pair["selection_basis"]="evaluated_at_then_stable_id"
                pair["historical_alignment"]="verified_evaluation_cutoff"
                if undated:
                    pair["limitations"].append("Undated rows cannot establish whether they supersede the selected evaluation.")
            elif not historical and undated:
                # Current observation freshness is not evaluation time.
                dated=[r for r in undated if r.get("lastmodifieddate") and instant(r["lastmodifieddate"])<=end]
                if dated:
                    latest=max(instant(r["lastmodifieddate"]) for r in dated)
                    candidates=[r for r in dated if instant(r["lastmodifieddate"])==latest]
                else:
                    candidates=[r for r in undated if not r.get("lastmodifieddate")]
                if len(candidates)==1:
                    pair["selected"]=candidates[0]
                    pair["selection_basis"]="current_observation_freshness_not_evaluation"
                elif candidates:
                    pair["state"]="ambiguous"
                    pair["limitations"].append("No genuine evaluation timestamp tie; preserve all candidates without arbitrary ID recency.")
            if pair["selected"]:
                pair["native_status"]=pair["selected"].get("status")
                pair["state"]="observed" if pair["native_status"] in {"GREEN","YELLOW","RED"} else "unknown_status"
                if not pair["selected"].get("evaluated_at"):
                    pair["limitations"].append("Evaluation time absent; modification/retrieval time retained separately.")
            elif raw and pair["state"]!="ambiguous":
                pair["state"]="historical_unavailable" if historical else "unavailable_at_cutoff"
                pair["limitations"].append("No native result proved eligible at the requested cutoff.")
            if historical and undated:
                pair["limitations"].append("History cannot be reconstructed from lastmodifieddate alone.")
            pair["excluded_post_cutoff_ids"]=[str(r["id"]) for r in excluded]
            pairs.append(pair)
    return {"contract_version":CONTRACT,"pairs":pairs,"projects":len(project_set),
            "discovered_type_ids":sorted(type_set),"expected_known_pairs":len(project_set)*len(type_set),
            "type_universe_complete":type_universe_complete,"outside_scope_ids":outside,
            "native_inventory_complete":type_universe_complete and transport_available and
                    all(p["state"]=="observed" for p in pairs)}
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("input",type=Path);p.add_argument("--output",type=Path);a=p.parse_args()
    try:
        out=select_results(**json.loads(a.input.read_text()));text=json.dumps(out,indent=2,ensure_ascii=False)+"\n"
        if a.output:publish_file(a.output, text, inputs=cli_inputs(a))
        print(text,end="");return 0
    except (OSError,ValueError,TypeError,KeyError) as e:
        print(json.dumps({"input_error":str(e)}));return 1
if __name__=="__main__":raise SystemExit(main())
