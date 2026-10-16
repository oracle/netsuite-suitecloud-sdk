#!/usr/bin/env python3
"""Validate source-backed native remaining-work detail. Does not calculate native color."""
from __future__ import annotations
from decimal import Decimal
from datetime import date
import argparse,json
from pathlib import Path
def normalize(rows: list[dict], assignment_map: dict[str,str]) -> dict:
    seen={};out=[]
    for row in rows:
        if row.get("grain_verified") is not True or not row.get("dataset_row_key"):
            raise ValueError("Actual row/natural grain must be verified before deduplication.")
        key=row["dataset_row_key"]
        if key in seen:
            if seen[key]!=row:raise ValueError("Conflicting native coverage row.")
            continue
        seen[key]=row
        for field in ("project","projecttask","scoringstartdate","scoringenddate","missinghours"):
            if row.get(field) is None:raise ValueError("Missing native coverage field "+field)
        start=date.fromisoformat(row["scoringstartdate"]);end=date.fromisoformat(row["scoringenddate"])
        if end<start:raise ValueError("Invalid coverage scoring window.")
        gap=Decimal(str(row["missinghours"]))
        if not gap.is_finite() or gap<0:raise ValueError("Invalid gap.")
        assignment=row.get("projecttaskassignment")
        resource=assignment_map.get(str(assignment)) if assignment is not None else None
        # Preserve input amounts. Available already calculated by the source may include blocked/leave time.
        out.append({**row,"gap_hours":str(gap),"resource_key":resource,
            "attribution":"assignment_verified" if resource else "task_or_assignment_unresolved",
            "native_color":None,
            "basis":"observed_native_detail_missinghours_not_total_plannedwork"})
    return {"rows":out,"deduplicated_rows":len(out),
            "note":"No cross-window sum, task-wide assignee duplication, extra leave deduction, or native color reconstruction."}

def allocation_conflicts(records: list[dict], start: str, end: str) -> list[dict]:
    """Native-risk diagnostic ONLY. Surface overlaps without an assumed additive formula."""
    lo=date.fromisoformat(start);hi=date.fromisoformat(end)
    if hi<lo:raise ValueError("Invalid explicit diagnostic window.")
    out=[]
    for i,a in enumerate(records):
        for b in records[i+1:]:
            if str(a.get("allocationresource"))!=str(b.get("allocationresource")):continue
            if not a.get("id") or not b.get("id") or str(a["id"])==str(b["id"]):continue
            overlap_start=max(lo,date.fromisoformat(a["startdate"]),date.fromisoformat(b["startdate"]))
            overlap_end=min(hi,date.fromisoformat(a["enddate"]),date.fromisoformat(b["enddate"]))
            if overlap_start<=overlap_end:
                out.append({"records":[a,b],"start":overlap_start.isoformat(),"end":overlap_end.isoformat(),
                   "classification":"Recorded allocation conflict / candidate overutilization",
                   "utilization_pct":None,"native_color":None,
                   "interpretations":["May be additive only if the account definition proves independent demand.",
                                      "May be parent/child or alternative views of the same commitment."],
                   "basis":"native-risk diagnostic, excluded from ordinary plannedwork calculation"})
    return out

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("input",type=Path);a=p.parse_args()
    try:
        payload=json.loads(a.input.read_text());operation=payload.pop("operation","normalize")
        if operation not in {"normalize","allocation_conflicts"}:raise ValueError("Unknown native-detail operation.")
        function=normalize if operation=="normalize" else allocation_conflicts
        print(json.dumps(function(**payload),indent=2));return 0
    except (ValueError,TypeError,KeyError,OSError) as e:print(json.dumps({"input_error":str(e)}));return 1
if __name__=="__main__":raise SystemExit(main())
