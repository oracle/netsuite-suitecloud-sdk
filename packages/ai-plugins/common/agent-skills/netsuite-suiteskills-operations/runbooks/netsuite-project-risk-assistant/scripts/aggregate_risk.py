#!/usr/bin/env python3
"""Aggregate normalized NetSuite risk evidence without network access.

Run: python aggregate_risk.py normalized.json --output metrics.json
Only the caller can verify source authenticity and account-specific field mapping.
See ../references/data-contract.md. Python 3.10+; standard library only.
"""
from __future__ import annotations

import argparse
from safe_output import write_new_text
from collections import Counter
from copy import deepcopy
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
import json
import math
from pathlib import Path
import sys
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

CATEGORIES = (
    "deadline_projects", "overdue_tasks", "hour_overages", "no_allocation",
    "native_risks", "native_issues", "native_summary", "supporting",
)
RISK_CATEGORY = {
    "deadline": "deadline_projects", "no_allocation": "no_allocation",
    "native_risk": "native_risks", "native_issue": "native_issues",
}
STATUSES = {"complete", "partial", "permission_denied", "unavailable", "not_requested"}
AVAILABLE = {"complete", "partial"}
BUCKETS = ("1–15", "16–30", "31–60", "61–100", "101+")
STAFFING = ("unowned", "placeholder_only", "named_owner_present", "unknown")
Json = dict[str, Any]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def text(value: Any, field: str) -> str:
    require(isinstance(value, str) and bool(value.strip()), f"{field} must be nonempty text")
    return value


def iso_date(value: Any, field: str) -> date:
    text(value, field)
    try:
        parsed = date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(f"{field} must be an ISO date (YYYY-MM-DD)") from exc
    require(parsed.isoformat() == value, f"{field} must use YYYY-MM-DD")
    return parsed


def number(value: Any, field: str) -> Decimal:
    require(not isinstance(value, bool), f"{field} cannot be a boolean")
    require(isinstance(value, (str, int, float)), f"{field} must be a normalized number")
    try:
        result = Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError(f"{field} is not a normalized decimal number") from exc
    require(result.is_finite() and result >= 0, f"{field} must be finite and nonnegative")
    return result


def json_number(value: Decimal) -> float:
    result = float(value)
    require(math.isfinite(result), "Hours exceed the supported JSON numeric range")
    return result


def classify_staffing(resources: Any) -> tuple[str, bool]:
    """Classify only pre-verified resource kinds; never infer from a name."""
    if resources is None:
        return "unknown", False
    require(isinstance(resources, list), "resources must be null or a complete list")
    if not resources:
        return "unowned", False
    kinds = set()
    for item in resources:
        require(isinstance(item, dict), "Each resource must be an object")
        kind = item.get("kind")
        require(kind in {"named", "placeholder", "unknown"}, "Invalid resource kind")
        if kind in {"named", "placeholder"}:
            require(bool(item.get("id") or item.get("name")),
                    "A named/placeholder resource needs an evidenced ID or name")
        kinds.add(kind)
    if "named" in kinds:
        return "named_owner_present", len(kinds) > 1
    if kinds == {"placeholder"}:
        return "placeholder_only", False
    return "unknown", False


def age_bucket(days: int) -> str:
    require(isinstance(days, int) and not isinstance(days, bool) and days > 0,
            "An overdue age must be a positive integer")
    for upper, label in zip((15, 30, 60, 100), BUCKETS):
        if days <= upper:
            return label
    return BUCKETS[-1]


def aggregate(document: Json) -> Json:
    require(isinstance(document, dict), "Input must be a JSON object")
    require(type(document.get("schema_version")) is int and document["schema_version"] == 1,
            "schema_version must be integer 1")
    require(document.get("data_origin") in {"live_connector", "synthetic_test"},
            "data_origin must be live_connector or synthetic_test")
    as_of = iso_date(document.get("as_of"), "as_of")
    timezone = text(document.get("timezone"), "timezone")
    try:
        ZoneInfo(timezone)
    except (ZoneInfoNotFoundError, ValueError) as exc:
        raise ValueError("timezone must be a valid IANA timezone") from exc
    scope = text(document.get("scope"), "scope")
    sources = deepcopy(document.get("sources"))
    require(isinstance(sources, dict) and bool(sources), "Provide a nonempty source manifest")

    for sid, source in sources.items():
        text(sid, "source key")
        require(isinstance(source, dict), f"Source {sid} must be an object")
        require(source.get("category") in CATEGORIES, f"Unknown source category: {sid}")
        status = source.get("status")
        require(status in STATUSES, f"Unknown source status: {sid}")
        if status in AVAILABLE | {"permission_denied"}:
            for field in ("tool", "locator", "retrieved_at"):
                text(source.get(field), f"{sid}.{field}")
            refs = source.get("call_refs")
            require(isinstance(refs, list) and bool(refs), f"{sid} needs real call_refs")
            for ref in refs:
                text(ref, f"{sid}.call_refs")
            try:
                stamp = datetime.fromisoformat(source["retrieved_at"].replace("Z", "+00:00"))
            except ValueError as exc:
                raise ValueError(f"{sid}.retrieved_at must be an ISO timestamp") from exc
            require(stamp.tzinfo is not None, f"{sid}.retrieved_at needs a UTC offset")
        if status != "complete":
            text(source.get("notes"), f"{sid}.notes")

    def source_keys(categories: list[str]) -> list[str]:
        return sorted(sid for sid, s in sources.items() if s["category"] in categories)

    def coverage(category: str) -> Json:
        keys = source_keys([category])
        states = [sources[sid]["status"] for sid in keys]
        if not states:
            state = "not_requested"
        elif all(s == "complete" for s in states):
            state = "complete"
        elif any(s in AVAILABLE for s in states):
            state = "partial"
        elif "permission_denied" in states:
            state = "permission_denied"
        elif "unavailable" in states:
            state = "unavailable"
        else:
            state = "not_requested"
        return {"status": state, "source_ids": keys}

    coverage_map = {category: coverage(category) for category in CATEGORIES}

    def has_data(category: str) -> bool:
        return any(s["category"] == category and s["status"] in AVAILABLE
                   for s in sources.values())

    def metric(value: Any, categories: list[str], formula: str, note: str = "") -> Json:
        any_available = any(has_data(c) for c in categories)
        all_complete = all(coverage_map[c]["status"] == "complete" for c in categories)
        return {
            "value": value if any_available else None,
            "coverage": "complete" if all_complete else ("partial" if any_available else "unavailable"),
            "source_ids": source_keys(categories),
            "formula": formula,
            "note": note,
        }

    def validate_sources(row: Json, category: str, label: str) -> None:
        ids = row.get("source_ids")
        require(isinstance(ids, list) and bool(ids), f"{label} needs source_ids")
        for sid in ids:
            require(isinstance(sid, str) and sid in sources, f"{label}: unknown source {sid!r}")
            require(sources[sid]["status"] in AVAILABLE,
                    f"{label}: row cannot be supported by unavailable/denied source {sid}")
        require(any(sources[sid]["category"] == category for sid in ids),
                f"{label} needs an available {category} source")

    def unique_rows(key: str, keys: tuple[str, ...], category_fn: Any) -> list[Json]:
        raw = document.get(key, [])
        require(isinstance(raw, list), f"{key} must be a list")
        seen: dict[tuple[str, ...], Json] = {}
        for index, original in enumerate(raw):
            require(isinstance(original, dict), f"{key}[{index}] must be an object")
            row = deepcopy(original)
            for field in keys:
                text(row.get(field), f"{key}[{index}].{field}")
            label = f"{key}[{index}]"
            category = category_fn(row)
            validate_sources(row, category, label)
            for field in ("project_name", "client_id", "client_name", "task_name"):
                if row.get(field) is not None:
                    text(row[field], f"{label}.{field}")
            identity = tuple(row[k] for k in keys)
            row["source_ids"] = sorted(set(row["source_ids"]))
            if isinstance(row.get("resources"), list):
                # Resource order is not semantically relevant; assignment content is.
                row["resources"] = sorted(row["resources"], key=lambda x: json.dumps(x, sort_keys=True))
            if identity in seen:
                prior = seen[identity]
                left = {k: v for k, v in prior.items() if k != "source_ids"}
                right = {k: v for k, v in row.items() if k != "source_ids"}
                require(left == right,
                        f"Conflicting duplicate {key} {identity}; reconcile the source rows first")
                prior["source_ids"] = sorted(set(prior["source_ids"]) | set(row["source_ids"]))
            else:
                seen[identity] = row
        return list(seen.values())

    def risk_category(row: Json) -> str:
        kind = row.get("risk_type")
        require(kind in RISK_CATEGORY, f"Unknown project risk_type: {kind!r}")
        return RISK_CATEGORY[kind]

    project_risks = unique_rows("project_risks", ("project_id", "risk_type"), risk_category)
    task_rows = unique_rows("overdue_tasks", ("project_id", "task_id"), lambda r: "overdue_tasks")

    # Require a stable grain key so repeated project summaries cannot be summed.
    raw_hours = document.get("hour_overages", [])
    require(isinstance(raw_hours, list), "hour_overages must be a list")
    prepared = deepcopy(document)
    prepared["hour_overages"] = []
    for row in raw_hours:
        require(isinstance(row, dict), "Each hour_overages row must be an object")
        row = deepcopy(row)
        grain = row.get("grain")
        require(grain in {"project", "task"}, "Hours grain must be project or task")
        if grain == "task":
            text(row.get("task_id"), "hour_overages.task_id")
            row["_grain_id"] = "task:" + row["task_id"]
        else:
            require(row.get("task_id") is None, "Project-grain hours must not include task_id")
            row["_grain_id"] = "project"
        prepared["hour_overages"].append(row)
    original_document = document
    document = prepared
    hours = unique_rows("hour_overages", ("project_id", "_grain_id"), lambda r: "hour_overages")
    document = original_document

    warnings: list[str] = []
    if document["data_origin"] == "synthetic_test":
        warnings.append("Synthetic test data only; not live NetSuite account results.")
    for category, info in coverage_map.items():
        if info["status"] not in {"complete", "not_requested"}:
            warnings.append(f"{category}: {info['status']}; see source manifest.")

    projects: dict[str, Json] = {}

    def register(row: Json, flag: str) -> None:
        pid = row["project_id"]
        if pid not in projects:
            projects[pid] = {
                "project_id": pid, "project_name": None, "client_id": None,
                "client_name": None, "calculated_end_date": None,
                "flags": set(), "source_ids": set(),
            }
        project = projects[pid]
        for field in ("project_name", "client_id", "client_name", "calculated_end_date"):
            incoming = row.get(field)
            if incoming is not None:
                if field == "calculated_end_date":
                    iso_date(incoming, field)
                require(project[field] is None or project[field] == incoming,
                        f"Conflicting {field} for project {pid}; reconcile before publishing")
                project[field] = incoming
        project["flags"].add(flag)
        project["source_ids"].update(row["source_ids"])

    for row in project_risks:
        register(row, row["risk_type"])

    tasks: list[Json] = []
    excluded = Counter({"closed": 0, "not_overdue": 0})
    ages = Counter({bucket: 0 for bucket in BUCKETS})
    staffing = Counter({kind: 0 for kind in STAFFING})
    project_task_counts: Counter[str] = Counter()
    task_project_sources: dict[str, set[str]] = {}
    unknown_age = mixed_assignments = unknown_closed_status = 0
    for row in task_rows:
        require(row.get("is_closed") is None or isinstance(row["is_closed"], bool),
                "is_closed must be true, false, or null")
        resources = row.get("resources")
        kind, mixed = classify_staffing(resources)
        due = iso_date(row["due_date"], "due_date") if row.get("due_date") is not None else None
        supplied_age = row.get("days_overdue")
        if supplied_age is not None:
            require(isinstance(supplied_age, int) and not isinstance(supplied_age, bool),
                    "days_overdue must be an integer or null")
        if row.get("is_closed") is True:
            excluded["closed"] += 1
            continue
        age = (as_of - due).days if due else supplied_age
        if due is not None and supplied_age is not None:
            require(age == supplied_age,
                    f"Overdue age/date conflict for task {row['task_id']}; reconcile date semantics")
        if age is not None and age <= 0:
            excluded["not_overdue"] += 1
            continue
        if age is None:
            unknown_age += 1
        else:
            ages[age_bucket(age)] += 1
        unknown_closed_status += row.get("is_closed") is None
        staffing[kind] += 1
        mixed_assignments += mixed
        row["calculated_days_overdue"] = age
        row["staffing_class"] = kind
        row["mixed_named_assignments"] = mixed
        tasks.append(row)
        project_task_counts[row["project_id"]] += 1
        task_project_sources.setdefault(row["project_id"], set()).update(row["source_ids"])
        register(row, "overdue_task")

    if sum(excluded.values()):
        warnings.append(f"Excluded {excluded['closed']} closed tasks and "
                        f"{excluded['not_overdue']} tasks not overdue at the snapshot.")
    if unknown_age:
        warnings.append(f"{unknown_age} overdue-source tasks have unknown age; worst delay covers known ages only.")
    if unknown_closed_status:
        warnings.append(f"{unknown_closed_status} tasks have unknown terminal status; "
                        "retained based on authoritative overdue-search membership.")
    if staffing["unknown"]:
        warnings.append(f"{staffing['unknown']} overdue tasks have unknown assignment classification.")

    by_project_hours: dict[str, Json] = {}
    grain_seen: dict[str, str] = {}
    skipped_nonpositive_hours = 0
    for row in hours:
        pid, grain = row["project_id"], row["grain"]
        require(pid not in grain_seen or grain_seen[pid] == grain,
                f"Mixed project/task hours grain for project {pid}; select one basis")
        grain_seen[pid] = grain
        planned = number(row.get("planned_hours"), "planned_hours")
        actual = number(row.get("actual_hours"), "actual_hours")
        delta = actual - planned
        if delta <= 0:
            skipped_nonpositive_hours += 1
            continue
        basis = "positive_task_hour_overage" if grain == "task" else "net_project_hour_overage"
        if pid not in by_project_hours:
            by_project_hours[pid] = {
                "project_id": pid, "basis": basis, "unit": "hours",
                "hours_overage": Decimal(0), "source_ids": set(), "record_keys": [],
            }
        value = by_project_hours[pid]
        value["hours_overage"] += delta
        value["source_ids"].update(row["source_ids"])
        value["record_keys"].append(row["_grain_id"])
        register(row, "hours_overage")

    if skipped_nonpositive_hours:
        warnings.append(f"Excluded {skipped_nonpositive_hours} zero/negative-overage hour records; "
                        "task-hour chart sums positive overages, not a full-project net.")
    hour_chart = []
    for pid, value in by_project_hours.items():
        value["hours_overage"] = json_number(value["hours_overage"])
        value["source_ids"] = sorted(value["source_ids"])
        value["record_keys"] = sorted(value["record_keys"])
        value["project_name"] = projects[pid]["project_name"]
        hour_chart.append(value)
    hour_chart.sort(key=lambda x: (-x["hours_overage"], x["project_id"]))

    for project in projects.values():
        project["flags"] = sorted(project["flags"])
        project["source_ids"] = sorted(project["source_ids"])
        project["overdue_task_count"] = project_task_counts[project["project_id"]] if has_data("overdue_tasks") else None
    project_list = sorted(projects.values(), key=lambda p: p["project_id"])
    deadline_ids = {r["project_id"] for r in project_risks if r["risk_type"] == "deadline"}
    no_allocation_ids = {r["project_id"] for r in project_risks if r["risk_type"] == "no_allocation"}
    late_ids = deadline_ids | set(project_task_counts)
    overlap_ids = late_ids & set(by_project_hours)

    clients: dict[str, Json] = {}
    unmapped_client_count = 0
    for project in project_list:
        cid = project["client_id"]
        if cid is None:
            unmapped_client_count += 1
            continue
        if cid not in clients:
            clients[cid] = {"client_id": cid, "client_name": project["client_name"],
                           "project_ids": [], "source_ids": set()}
        client = clients[cid]
        if project["client_name"] is not None:
            require(client["client_name"] is None or client["client_name"] == project["client_name"],
                    f"Conflicting client_name for client {cid}")
            client["client_name"] = project["client_name"]
        client["project_ids"].append(project["project_id"])
        client["source_ids"].update(project["source_ids"])
    multiple_clients = []
    for client in clients.values():
        if len(client["project_ids"]) >= 2:
            client["project_count"] = len(client["project_ids"])
            client["project_ids"].sort()
            client["source_ids"] = sorted(client["source_ids"])
            multiple_clients.append(client)
    multiple_clients.sort(key=lambda c: (-c["project_count"], c["client_id"]))
    if unmapped_client_count:
        warnings.append(f"{unmapped_client_count} flagged projects lack stable client IDs; "
                        "excluded from client grouping, not from project counts.")

    count = len(tasks)
    known_ages = [t["calculated_days_overdue"] for t in tasks if t["calculated_days_overdue"] is not None]
    union_categories = list(RISK_CATEGORY.values()) + ["overdue_tasks", "hour_overages"]
    metrics = {
        "deadline_flagged_projects": metric(len(deadline_ids), ["deadline_projects"],
            "COUNT(DISTINCT project_id) in project_risks where risk_type=deadline"),
        "observed_flagged_projects": metric(len(projects), union_categories,
            "Distinct union of supported project flags, eligible overdue tasks, and positive hours overage",
            "Observed flagged union only; not an account-wide project-health denominator."),
        "overdue_tasks": metric(count, ["overdue_tasks"],
            "COUNT(DISTINCT (project_id, task_id)) after closed/non-overdue exclusions",
            "Source-defined overdue membership retained when age or terminal status is unavailable."),
        "worst_known_delay_days": metric(max(known_ages) if known_ages else None, ["overdue_tasks"],
            "MAX(known positive days overdue among eligible retrieved tasks)",
            f"Unknown-age tasks: {unknown_age}. Not a portfolio-wide maximum when coverage is partial."),
        "unknown_age_tasks": metric(unknown_age, ["overdue_tasks"], "Count eligible overdue tasks with unknown age"),
        "mixed_named_assignments": metric(mixed_assignments, ["overdue_tasks"],
            "Count tasks with a named owner plus placeholder/unknown assignments; subset of named-owner-present"),
        "projects_without_allocation": metric(len(no_allocation_ids), ["no_allocation"],
            "COUNT(DISTINCT project_id) explicitly flagged no_allocation; separate from task ownership"),
    }
    for key, category in (
        ("unowned_tasks", "unowned"), ("placeholder_only_tasks", "placeholder_only"),
        ("named_owner_tasks", "named_owner_present"), ("unknown_staffing_tasks", "unknown"),
    ):
        metrics[key] = metric(staffing[category], ["overdue_tasks"],
            f"Count eligible overdue tasks with staffing_class={category}",
            f"Denominator: {count} retrieved eligible overdue tasks. Named ownership does not imply full staffing.")

    # Include supplemental resource-classification lookups in staffing provenance.
    task_evidence_ids = {sid for row in tasks for sid in row["source_ids"]}
    for key in ("unowned_tasks", "placeholder_only_tasks", "named_owner_tasks",
                "unknown_staffing_tasks", "mixed_named_assignments"):
        metrics[key]["source_ids"] = sorted(set(metrics[key]["source_ids"]) | task_evidence_ids)

    top_projects = [
        {"project_id": pid, "project_name": projects[pid]["project_name"],
         "overdue_task_count": n, "source_ids": sorted(task_project_sources[pid])}
        for pid, n in sorted(project_task_counts.items(), key=lambda x: (-x[1], x[0]))
    ]
    require(sum(ages.values()) + unknown_age == count, "Age reconciliation failed")
    require(sum(staffing.values()) == count, "Staffing reconciliation failed")
    require(sum(project_task_counts.values()) == count, "Project/task reconciliation failed")

    return {
        "schema_version": 1, "data_origin": document["data_origin"],
        "as_of": as_of.isoformat(), "timezone": timezone, "scope": scope,
        "sources": sources, "coverage": coverage_map, "metrics": metrics,
        "charts": {
            "overdue_age": [{"bucket": b, "count": ages[b]} for b in BUCKETS] if has_data("overdue_tasks") else None,
            "top_projects": top_projects if has_data("overdue_tasks") else None,
            "hours_overage": hour_chart if has_data("hour_overages") else None,
        },
        "staffing": dict(staffing) if has_data("overdue_tasks") else None,
        "projects": project_list, "overdue_tasks": tasks,
        "late_plus_hours_overage": [projects[pid] for pid in sorted(overlap_ids)],
        "multi_project_clients": multiple_clients,
        "warnings": warnings,
        "reconciliation": {
            "passed": True, "eligible_overdue_tasks": count,
            "age_bucket_sum_plus_unknown": sum(ages.values()) + unknown_age,
            "staffing_sum": sum(staffing.values()),
            "per_project_task_sum": sum(project_task_counts.values()),
            "raw_task_rows": len(document.get("overdue_tasks", [])),
            "distinct_task_rows_before_exclusions": len(task_rows),
            "excluded_tasks": dict(excluded),
            "unknown_terminal_status_tasks": unknown_closed_status,
            "projects_excluded_from_client_grouping": unmapped_client_count,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Normalized evidence JSON")
    parser.add_argument("--output", type=Path, required=True, help="Metrics JSON to create")
    args = parser.parse_args()
    try:
        data = json.loads(args.input.read_text(encoding="utf-8"))
        result = aggregate(data)
        encoded = json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
        require(args.output.resolve() != args.input.resolve(), "Input and output paths must differ")
        write_new_text(args.output, encoded)
    except (OSError, UnicodeError, ValueError, TypeError, KeyError) as exc:
        print(f"Risk aggregation failed: {exc}", file=sys.stderr)
        return 2
    print(f"Wrote validated metrics to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
