#!/usr/bin/env python3
"""Descriptive visual aggregations of already normalized evidence. No network or writes.
Does not infer native status, risk severity, approval, critical path, cause or acceptance.
"""
from __future__ import annotations
from copy import deepcopy
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from zoneinfo import ZoneInfo
from collections import Counter, defaultdict
import capacity_tools as capacity
import project_plan_calculations as sow

BANDS = ("1–15", "16–30", "31–60", "61–100", "101+")
MONEY_KINDS = (
    "approved_budget", "posted_actual_cost", "recognized_revenue",
    "commitment", "received_amount", "billed_amount", "cash_deposit",
    "cash_application", "credit_application", "invoice_balance", "unapplied_funds",
)
REPORT_OUTCOMES = sorted(sow.OUTCOMES - {"Intent recorded", "Reconciled absent"})

def number(value):
    if value is None or isinstance(value, bool):
        raise ValueError("Missing or invalid number; do not substitute zero.")
    try:
        result = Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError("Invalid decimal") from exc
    if not result.is_finite():
        raise ValueError("Nonfinite numbers cannot be rendered.")
    return result

def decimal_text(value):
    return format(value, "f") if value is not None else None

def unique(rows, keys, ignored=("source_refs",)):
    """Deduplicate natural-grain rows and merge lineage; reject conflicting duplicates."""
    seen = {}
    for original in rows:
        row = deepcopy(original)
        if any(row.get(k) is None for k in keys):
            raise ValueError("Missing natural-grain key: " + ", ".join(keys))
        key = tuple(str(row[k]) for k in keys)
        if key in seen:
            left = {k:v for k,v in seen[key].items() if k not in ignored}
            right = {k:v for k,v in row.items() if k not in ignored}
            if left != right:
                raise ValueError("Conflicting duplicate evidence at " + str(key))
            seen[key]["source_refs"] = sorted(set(seen[key].get("source_refs",[])) |
                                             set(row.get("source_refs",[])))
        else:
            seen[key] = row
    return list(seen.values())

def overdue_band(days):
    if not isinstance(days, int) or isinstance(days, bool) or days < 1:
        return None
    for maximum, label in ((15,BANDS[0]), (30,BANDS[1]), (60,BANDS[2]), (100,BANDS[3])):
        if days <= maximum:
            return label
    return BANDS[4]

def local_day(as_of, zone):
    instant = datetime.fromisoformat(as_of.replace("Z","+00:00"))
    if instant.tzinfo is None:
        raise ValueError("An aware as-of instant is required.")
    return instant.astimezone(ZoneInfo(zone)).date()

def task_metrics(tasks, as_of, zone):
    """Task totals require normalized task grain. Assignment joins belong in a separate list."""
    today = local_day(as_of, zone)
    rows, excluded, unresolved = [], [], []
    for task in unique(tasks, ("project_id","task_id")):
        row = deepcopy(task)
        if row.get("leaf") is not True or row.get("executable") is not True:
            excluded.append({**row,"exclusion":"not a verified executable leaf task"})
            continue
        if row.get("status_verified") is not True or row.get("complete") not in (True,False):
            unresolved.append({**row,"limitation":"Completion semantics unavailable"})
            continue
        if row["complete"] is True:
            excluded.append({**row,"exclusion":"completed task; acceptance not inferred"})
            continue
        if row.get("due_rule_verified") is not True:
            unresolved.append({**row,"limitation":"Effective due-date rule unverified"})
            continue
        dates = [date.fromisoformat(row[k]) for k in ("end_date","finish_no_later_than") if row.get(k)]
        if not dates:
            unresolved.append({**row,"limitation":"Effective due date missing"})
            continue
        due = min(dates)
        days = (today-due).days
        effort = None
        if row.get("effort_comparable") is True and row.get("planned_hours") is not None and row.get("actual_hours") is not None:
            effort = number(row["actual_hours"])-number(row["planned_hours"])
        row.update(effective_due=due.isoformat(), days_overdue=max(days,0),
                   aging_band=overdue_band(days),
                   due_state="overdue" if days>0 else ("due_today" if days==0 else "future"),
                   effort_variance_hours=decimal_text(effort),
                   effort_overrun=effort is not None and effort>0)
        rows.append(row)
    overdue = [r for r in rows if r["due_state"]=="overdue"]
    by_project = Counter(r["project_id"] for r in overdue)
    return {"rows":rows, "excluded":excluded, "unresolved":unresolved,
            "overdue":overdue, "due_today":[r for r in rows if r["due_state"]=="due_today"],
            "aging":{band:sum(r["aging_band"]==band for r in overdue) for band in BANDS},
            "by_project":dict(by_project),
            "late_and_over_hours":[r for r in overdue if r["effort_overrun"]],
            "note":"Counts and overlaps are descriptive, not severity, money, blockers or cause."}

def assignment_metrics(tasks, assignments, resources):
    directory = {r["key"]:r for r in unique(resources,("key",))}
    grouped = defaultdict(list)
    for a in unique(assignments, ("assignment_id",)):
        grouped[(a["project_id"],a["task_id"])].append(a)
    results=[]
    for t in unique(tasks,("project_id","task_id")):
        if t.get("leaf") is not True or t.get("executable") is not True or t.get("complete") is True:
            continue
        refs=set(t.get("source_refs",[]))
        cats=set()
        values=grouped[(t["project_id"],t["task_id"])]
        if t.get("assignments_complete") is not True:
            cats.add("unknown_assignment_population")
        if not values and t.get("assignments_complete") is True:
            cats.add("no_assignment")
        named=generic=False
        for a in values:
            refs.update(a.get("source_refs",[]))
            r=directory.get(a.get("resource_key"))
            if a.get("identity_verified") is not True or not r or r.get("identity_verified") is not True:
                cats.add("unknown_identity");continue
            if r.get("generic") is True:
                generic=True;cats.add("generic")
            elif r.get("generic") is False:
                named=True
            else:
                cats.add("unknown_identity")
            if r.get("active") is False or r.get("eligible") is False:
                cats.add("inactive_or_ineligible")
            elif r.get("active") is not True or r.get("eligible") is not True:
                cats.add("eligibility_unknown")
            if a.get("missing_hours") is not None and a.get("gap_grain_verified") is True and number(a["missing_hours"])>0:
                cats.add("assignment_missing_hours")
            if a.get("end_date") and t.get("required_through") and a.get("end_semantics_verified") is True:
                if date.fromisoformat(a["end_date"])<date.fromisoformat(t["required_through"]):
                    cats.add("ends_before_required_window")
        label = "mixed named/generic" if named and generic else ("named" if named else ("generic" if generic else "unresolved / unassigned"))
        results.append({"project_id":t["project_id"],"task_id":t["task_id"],"title":t.get("title",t["task_id"]),
            "assignment_state":label,"categories":sorted(cats),"source_refs":sorted(refs),
            "limitation":"Named assignment is not verified capacity; categories can overlap."})
    return results

def money_metrics(rows):
    """Compatible money groups only. Different kinds remain separate, never a grand total."""
    buckets=defaultdict(list)
    for r in unique(rows,("source_id","row_id")):
        if r.get("kind") not in MONEY_KINDS:
            raise ValueError("Unknown monetary measure kind")
        if r.get("grain_verified") is not True or r.get("additive_verified") is not True:
            raise ValueError("Money must have verified nonoverlapping additive grain")
        required=("project_id","currency","book","period","basis")
        if any(not r.get(k) for k in required):
            raise ValueError("Money context missing")
        if r["kind"]=="approved_budget" and r.get("approved") is not True:
            raise ValueError("Budget is not verified approved")
        if r["kind"] in {"posted_actual_cost","recognized_revenue"} and r.get("posted") is not True:
            raise ValueError("Actual money is not verified posted")
        buckets[tuple(r[k] for k in required)+(r["kind"],)].append(r)
    amounts={}
    for key,group in buckets.items():
        known=sum((number(r["amount"]) for r in group if r.get("amount") is not None),Decimal(0))
        complete=all(r.get("amount") is not None and r.get("population_complete") is True for r in group)
        amounts[key]={"value":decimal_text(known) if complete else None,"known_subtotal":decimal_text(known),
                      "complete":complete, "rows":[r["row_id"] for r in group],
                      "source_refs":sorted({s for r in group for s in r.get("source_refs",[])})}
    out=[]
    for ctx in sorted({k[:-1] for k in amounts}):
        measures={kind:amounts[ctx+(kind,)] for kind in MONEY_KINDS if ctx+(kind,) in amounts}
        def calc(a,b,ratio=False):
            x,y=measures.get(a,{}).get("value"),measures.get(b,{}).get("value")
            if x is None or y is None:return None
            if ratio:
                return decimal_text((number(x)-number(y))*100/number(x)) if number(x)>0 else None
            return decimal_text(number(x)-number(y))
        out.append({"project_id":ctx[0],"currency":ctx[1],"book":ctx[2],"period":ctx[3],"basis":ctx[4],
            "measures":measures,"cost_variance":calc("posted_actual_cost","approved_budget"),
            "actual_margin":calc("recognized_revenue","posted_actual_cost"),
            "margin_pct":calc("recognized_revenue","posted_actual_cost",True),
            "margin_pct_reason":"Requires compatible recognized revenue greater than zero",
            "source_refs":sorted({s for m in measures.values() for s in m["source_refs"]})})
    return out

def matched_changes(previous,current):
    """No new/cleared labels when scope or source definitions differ."""
    required=("project_ids","role_fingerprint","source_definition_fingerprint","window_basis","account")
    mismatches=[k for k in required if k not in previous or k not in current or previous[k]!=current[k]]
    if mismatches:
        return {"comparable":False,"limitations":["Reconcile snapshot context: "+", ".join(mismatches)],"rows":[]}
    old={r["key"]:r for r in unique(previous.get("findings",[]),("key",))}
    new={r["key"]:r for r in unique(current.get("findings",[]),("key",))}
    rows=[]
    for key in sorted(set(old)|set(new)):
        a,b=old.get(key),new.get(key)
        state="new" if a is None else ("cleared" if b is None else ("persisting" if a.get("value")==b.get("value") else "changed"))
        rows.append({"key":key,"state":state,"previous":a,"current":b,
                     "source_refs":sorted(set((a or {}).get("source_refs",[]))|set((b or {}).get("source_refs",[])))})
    return {"comparable":True,"limitations":[],"rows":rows}

def daily_capacity(inputs):
    ledger=capacity.daily_ledger(**inputs)
    shortage=Decimal(0);spare=Decimal(0);affected=unknown=0
    for r in ledger["rows"]:
        if r["capacity_balance_hours"] is None:
            unknown+=1;continue
        balance=number(r["capacity_balance_hours"])
        shortage+=max(-balance,Decimal(0));spare+=max(balance,Decimal(0))
        affected+=int(balance<0)
    return {"ledger":ledger,"known_shortage_hours":decimal_text(shortage),
            "known_spare_hours":decimal_text(spare),"shortage_cells":affected,"unknown_cells":unknown}

def placement_scenario(ledger,placements):
    """Local, proposed consumption only; never updates recorded plannedwork."""
    cells={(r["resource_key"],r["date"]):deepcopy(r) for r in ledger["rows"]}
    used=defaultdict(Decimal);rows=[]
    for p in unique(placements,("placement_id",)):
        key=(p["resource_key"],p["date"]);cell=cells.get(key)
        hours=number(p["hours"])
        if hours<0:raise ValueError("Negative proposed consumption")
        known=cell is not None and cell.get("complete") is True and cell.get("spare_hours") is not None
        before=number(cell["spare_hours"])-used[key] if known else None
        supported=p.get("role_match_verified") is True and p.get("eligibility_verified") is True
        fits=known and supported and before>=hours
        if fits:used[key]+=hours
        rows.append({**p,"proposal_state":"fits proposed scenario" if fits else "not established / insufficient",
            "available_before":decimal_text(before),
            "available_after":decimal_text(before-hours) if fits else decimal_text(before),
            "recorded_work_changed":False})
    return {"rows":rows,"reserved":[{"resource_key":k[0],"date":k[1],"hours":str(v)} for k,v in used.items()],
            "basis":"proposed scenario; not recorded work or an authorized assignment"}

def policy_rows(rows):
    out=[]
    for row in unique(rows,("id",)):
        r=deepcopy(row)
        if r.get("classification")=="rule_computed_breach" and not all(
            r.get(k) is True for k in ("population_complete","rule_effective_verified","inputs_complete")):
            r["classification"]="candidate / not determinable"
            r["limitation"]="Cumulative policy proof needs complete applicable population, effective rule and inputs."
        out.append(r)
    return out

def financial_detail(rows,mode):
    """Display normalized domain findings; do not infer eligibility/debt from a waiting state."""
    results=[]
    for row in unique(rows,("id",)):
        r=deepcopy(row)
        if mode=="billing":
            if r.get("classification") in {"leakage","overdue_debt"}:
                if not all(r.get(k) is True for k in ("eligibility_verified","trigger_verified","holds_checked","overdue_basis_verified")):
                    r["classification"]="eligibility or overdue basis unverified"
        if mode=="cash":
            if r.get("project_link_verified") is not True or r.get("application_link_verified") is not True:
                r["classification"]="unattributed / application link unverified"
        results.append(r)
    return results
