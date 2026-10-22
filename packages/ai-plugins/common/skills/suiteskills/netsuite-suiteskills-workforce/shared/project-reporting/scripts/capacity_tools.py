#!/usr/bin/env python3
"""Offline arithmetic/shape verification of normalized, authorized plannedwork evidence.
Not a NetSuite native risk engine; no input discovery or write capabilities.
"""
from __future__ import annotations
from datetime import datetime,date,timedelta,timezone
from decimal import Decimal,InvalidOperation
from zoneinfo import ZoneInfo
from typing import Any
import argparse,json
from pathlib import Path
CONTRACT="PM-3.0.0"
def amount(x: Any) -> Decimal:
    if x is None or isinstance(x,bool): raise ValueError("Missing/invalid hours.")
    try:v=Decimal(str(x))
    except InvalidOperation as e:raise ValueError("Invalid numeric value.") from e
    if not v.is_finite() or v<0:raise ValueError("Hours must be finite and nonnegative.")
    return v
def local_today(zone: str, now: str | None=None) -> str:
    t=datetime.now(timezone.utc) if now is None else datetime.fromisoformat(now.replace("Z","+00:00"))
    if t.tzinfo is None:raise ValueError("Clock requires an aware instant.")
    return t.astimezone(ZoneInfo(zone)).date().isoformat()
def horizon(project_ids: list[str], end_evidence: list[dict], today: str) -> dict:
    date.fromisoformat(today); selected={}; unresolved=[]; past=[]
    for project in project_ids:
        candidates=[r for r in end_evidence if r.get("project_id")==project and r.get("verified") is True
            and r.get("cutoff_eligible") is True and r.get("value_semantics")=="project_calculated_end"
            and r.get("source_kind") in {"indicator","project_record","validated_schedule"}]
        pick=None
        for kind in ("indicator","project_record","validated_schedule"):
            available=[r for r in candidates if r["source_kind"]==kind]
            if not available:continue
            dates={date.fromisoformat(r["date"]).isoformat() for r in available}
            if len(dates)!=1:unresolved.append(project);break
            pick=available[0];selected[project]=pick
            if pick["date"]<today:past.append(project)
            break
        if pick is None and project not in unresolved:unresolved.append(project)
    end=max((r["date"] for r in selected.values()),default=None)
    return {"start":today,"end":end,"projects":selected,"unknown_end_projects":unresolved,
            "past_end_projects":past,"complete":not unresolved and bool(project_ids),
            "positive_future_window":end is not None and end>=today}
def resolve_person(session: dict, mappings: list[dict]) -> dict:
    if session.get("verified") is not True or not session.get("entity_type") or not session.get("entity_id"):
        raise ValueError("Authenticated exact entity identity is unavailable.")
    matches=[m for m in mappings if m.get("session_type")==session["entity_type"] and
             str(m.get("session_id"))==str(session["entity_id"]) and m.get("verified") is True]
    keys={(m.get("resource_type"),str(m.get("resource_id"))) for m in matches}
    if len(keys)!=1:raise ValueError("No unique verified employee/vendor Project Resource mapping.")
    out=matches[0]
    if out.get("resource_type") not in {"employee","vendor"}:raise ValueError("Personal scope is not a mapped employee/vendor.")
    return out
def daily_ledger(resources: list[dict], planned_rows: list[dict], capacity_rows: list[dict],
                 start: str,end: str, work_complete: bool, capacities_complete: bool) -> dict:
    lo=date.fromisoformat(start);hi=date.fromisoformat(end)
    if hi<lo:raise ValueError("No supported positive window; do not manufacture an end.")
    keys=[r["key"] for r in resources]
    if len(keys)!=len(set(keys)):raise ValueError("Duplicate resource directory entries.")
    universe=set(keys); unique={}; totals={}
    for row in planned_rows:
        if row.get("basis")!="plannedwork":raise ValueError("Only plannedwork is permitted as ordinary demand.")
        if row.get("lineage_verified") is not True or row.get("distribution_verified") is not True or row.get("leaf") is not True:
            raise ValueError("Unverified decomposition or summary input cannot establish daily demand.")
        for field in ("id","resource_key","project_id","task_id","date"):
            if not row.get(field):raise ValueError("Missing planned row identity/grain.")
        if row["resource_key"] not in universe:raise ValueError("Planned row outside resource scope.")
        rid=str(row["id"])
        if rid in unique:
            if unique[rid]!=row:raise ValueError("Conflicting duplicate planned row.")
            continue
        unique[rid]=row;day=date.fromisoformat(row["date"]);hours=amount(row.get("hours"))
        if lo<=day<=hi:
            key=(row["resource_key"],day.isoformat());totals[key]=totals.get(key,Decimal(0))+hours
    capacity={}
    for row in capacity_rows:
        if row.get("basis")!="net_calendar_after_nonduplicated_leave" or row.get("verified") is not True or not row.get("evidence_refs"):
            raise ValueError("Capacity must prove calendar/leave normalization.")
        key=(row["resource_key"],date.fromisoformat(row["date"]).isoformat())
        if key[0] not in universe:raise ValueError("Capacity outside resource scope.")
        if key in capacity and capacity[key]!=row:raise ValueError("Conflicting resource-day capacity rows.")
        amount(row["net_hours"]);capacity[key]=row
    days=[(lo+timedelta(days=i)).isoformat() for i in range((hi-lo).days+1)]
    out=[];missing=[]
    for key in keys:
        for day in days:
            cell=(key,day);plan=totals.get(cell,Decimal(0));caprow=capacity.get(cell)
            if caprow is None:missing.append({"resource_key":key,"date":day})
            cap=amount(caprow["net_hours"]) if caprow else None
            complete=work_complete is True and capacities_complete is True and cap is not None
            balance=cap-plan if complete else None
            pct=plan*100/cap if complete and cap>0 else None
            state="incomplete"
            if complete:
                state="zero_capacity_conflict" if cap==0 and plan>0 else (
                    "verified_planned_overutilization" if cap is not None and plan>cap else "evaluated")
            elif cap is not None and plan>cap:state="known_demand_conflict_incomplete_total"
            out.append({"resource_key":key,"date":day,"known_planned_hours":str(plan),
                        "net_capacity_hours":str(cap) if cap is not None else None,
                        "utilization_pct":str(pct) if pct is not None else None,
                        "capacity_balance_hours":str(balance) if balance is not None else None,
                        "spare_hours":str(max(balance,Decimal(0))) if balance is not None else None,
                        "state":state,"complete":complete})
    return {"contract_version":CONTRACT,"basis":"plannedwork","start":start,"end":end,
            "expected_resource_days":len(keys)*len(days),"rows":out,"missing_capacity":missing,
            "complete":work_complete is True and capacities_complete is True and not missing}
def candidates(resources: list[dict], role_id: str, requirements: list[dict], ledger: dict,
               allowed_kinds: list[str] | None=None, allowed_roles: list[str] | None=None,
               price_rank: bool=False, price_cap: str | None=None, price_context: str | None=None) -> dict:
    kinds=set(allowed_kinds if allowed_kinds is not None else ["employee"])
    roles=set(allowed_roles if allowed_roles is not None else [role_id])
    if not role_id or not requirements:raise ValueError("Exact role and supported dated requirements are required.")
    index={(r["resource_key"],r["date"]):r for r in ledger["rows"]};eligible=[];excluded=[]
    demand={}
    for req in requirements:
        day=date.fromisoformat(req["date"]).isoformat();demand[day]=demand.get(day,Decimal(0))+amount(req["hours"])
    for person in resources:
        reason=[]
        if person.get("kind") not in kinds:reason.append("outside requested resource kind")
        if not roles.intersection(set(person.get("role_ids",[]))):reason.append("no exact permitted role")
        if person.get("active") is not True or person.get("eligible") is not True or person.get("generic") is not False:
            reason.append("inactive/generic/eligibility unknown")
        for day,hours in demand.items():
            cell=index.get((person["key"],day))
            if not cell or cell.get("complete") is not True or cell.get("spare_hours") is None:
                reason.append("date-matched capacity unverified");break
            if amount(cell["spare_hours"])<hours:reason.append("insufficient date-matched capacity");break
        price=person.get("price")
        if price_rank or price_cap is not None:
            if price is None or not price_context or person.get("price_context")!=price_context:reason.append("comparable price unknown")
            elif price_cap is not None and amount(price)>amount(price_cap):reason.append("price exceeds requested cap")
        item={"resource_key":person["key"],"role_ids":person.get("role_ids",[]),
              "price":price,"price_context":person.get("price_context"),"exclusion_reasons":reason}
        (excluded if reason else eligible).append(item)
    eligible.sort(key=(lambda r:(amount(r["price"]),r["resource_key"])) if price_rank else (lambda r:r["resource_key"]))
    return {"eligible":eligible,"excluded":excluded,"order_basis":"requested_comparable_price" if price_rank else "neutral_stable_resource_key",
            "price_used":price_rank or price_cap is not None}
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("input",type=Path);a=p.parse_args()
    try:
        payload=json.loads(a.input.read_text());operation=payload.pop("operation")
        funcs={"today":local_today,"horizon":horizon,"identity":resolve_person,"ledger":daily_ledger,"candidates":candidates}
        if operation not in funcs:raise ValueError("Unknown operation.")
        print(json.dumps(funcs[operation](**payload),indent=2,ensure_ascii=False));return 0
    except (ValueError,TypeError,KeyError,OSError) as e:
        print(json.dumps({"input_error":str(e)}));return 1
if __name__=="__main__":raise SystemExit(main())
