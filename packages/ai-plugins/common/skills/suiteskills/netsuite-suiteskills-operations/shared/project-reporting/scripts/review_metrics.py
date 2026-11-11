#!/usr/bin/env python3
"""Whole-scope effort summaries; independent from overdue-only task metrics.
No forecast, financial inference, native color, or inferred root cause.
"""
from collections import defaultdict
from decimal import Decimal
from copy import deepcopy
import visual_metrics as m

def effort(tasks, project_ids, *, population_complete=False):
    grouped=defaultdict(list);rows=[];excluded=[]
    for task in m.unique(tasks,("project_id","task_id")):
        if task["project_id"] not in project_ids:raise ValueError("Effort task outside scoped projects")
        if task.get("leaf") is False or task.get("executable") is False:
            excluded.append({**task,"reason":"Verified rollup/nonexecutable task excluded from additive effort"});continue
        row=deepcopy(task)
        comparable=(task.get("leaf") is True and task.get("executable") is True
                    and task.get("effort_comparable") is True and task.get("planned_basis")=="plannedwork"
                    and task.get("actual_basis") in {"actualwork","recorded_time"}
                    and task.get("planned_hours") is not None and task.get("actual_hours") is not None)
        planned=m.number(task["planned_hours"]) if comparable else None
        actual=m.number(task["actual_hours"]) if comparable else None
        if comparable and (planned<0 or actual<0):raise ValueError("Negative effort requires a separately validated adjustment rule")
        gap=actual-planned if comparable else None
        row.update(comparison_state="verified" if comparable else "not determinable",
                   variance_hours=m.decimal_text(gap),
                   overrun_pct=m.decimal_text(gap*100/planned) if comparable and planned>0 else None,
                   limitation=None if comparable else "Missing comparable plannedwork/actual-time inputs or executable leaf grain")
        rows.append(row);grouped[task["project_id"]].append(row)
    projects=[]
    for pid in project_ids:
        group=grouped[pid];known=[r for r in group if r["comparison_state"]=="verified"]
        exact=population_complete and len(known)==len(group)
        p=sum((m.number(r["planned_hours"]) for r in known),Decimal(0))
        a=sum((m.number(r["actual_hours"]) for r in known),Decimal(0))
        projects.append({"project_id":pid,"planned_hours":m.decimal_text(p) if exact else None,
            "actual_hours":m.decimal_text(a) if exact else None,"variance_hours":m.decimal_text(a-p) if exact else None,
            "overrun_pct":m.decimal_text((a-p)*100/p) if exact and p>0 else None,
            "known_planned_hours":m.decimal_text(p),"known_actual_hours":m.decimal_text(a),
            "expected_tasks":len(group),"evaluated_tasks":len(known),"unavailable_tasks":len(group)-len(known),
            "population_complete":population_complete,"comparison_state":"verified" if exact else "known subset / not determinable",
            "limitation":"No severity or scope cause inferred; completed work included. Zero planned denominator leaves percentage undefined.",
            "source_refs":m.all_refs(known) if hasattr(m,"all_refs") else sorted({s for r in group for s in r.get("source_refs",[])})})
    return {"tasks":rows,"projects":projects,"excluded":excluded,
            "definition":"Sum nonoverlapping executable leaf plannedwork and compatible actual recorded effort, including completed tasks."}
