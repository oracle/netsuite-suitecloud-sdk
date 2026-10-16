#!/usr/bin/env python3
"""Prepare the packaged fulfillment SELECT locally; never calls NetSuite.

Source: fulfillment-performance-insights converted skill,
queries/fulfillment_performance.sql (SHA-256 pinned below).
The query returns the four evidence timestamps as text and durations in seconds.
compile_query.py and bind_query.py are unchanged copies from SuiteSkills Skill
Builder, references/team-kit/reference/plugin/skills/finance/shared/tools.
This wrapper is a fulfillment integration extension, not a stock shared skill.
It uses stock compile_request after adapting only the original filter block;
it does not invoke the binder's publisher registry or certify server schema.

Usage: python prepare_fulfillment_query.py INPUT.json NEW_OUTPUT.json
Supply the original nine input keys and optionally pageSize (default 100).
Write outputs outside this skill directory. Python 3.9 or newer is required.
"""

import argparse
from datetime import date
import hashlib
import json
from pathlib import Path
import re
import sys

sys.dont_write_bytecode = True
from compile_query import compile_request


SOURCE_SHA256 = "68f06dfb74ceef8b4520a12354a9c6e060eaf7c28589a3c0b2bb9c3441555276"
REQUIRED_KEYS = {
    "filterByItemFulfillments", "itemFulfillmentIds", "filterByLocations",
    "locationIds", "filterByDate", "startDate", "endDate", "shippedOnly",
    "salesAndTransferOnly",
}
FLAG_KEYS = {
    "filterByItemFulfillments", "filterByLocations", "filterByDate",
    "shippedOnly", "salesAndTransferOnly",
}
INDENT = "\t" * 7
ORIGINAL_FILTER_BLOCK = (
    "WHERE (:filterByItemFulfillments = 'F'\n"
    + "\t" * 8 + "OR candidate.id IN BUILTIN.V_ARRAY('NUMBER_LIST_TYPE', :itemFulfillmentIds))\n"
    + INDENT + "AND (:filterByLocations = 'F'\n"
    + "\t" * 8 + "OR candidate.location IN BUILTIN.V_ARRAY('NUMBER_LIST_TYPE', :locationIds))\n"
    + INDENT + "AND (:filterByDate = 'F'\n"
    + "\t" * 8 + "OR (candidate.createdDate >= TO_DATE(:startDate, 'YYYY-MM-DD')\n"
    + "\t" * 9 + "AND candidate.createdDate < TO_DATE(:endDate, 'YYYY-MM-DD') + 1))\n"
    + INDENT + "AND (:shippedOnly = 'F' OR candidate.status = 'C')\n"
    + INDENT + "AND (:salesAndTransferOnly = 'F' OR candidate.orderType IN ('SalesOrd', 'TrnfrOrd'))\n"
    + INDENT + "AND ROWNUM <= 50001"
)


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

def validate(request):
    """Accept a bounded selection, never user SQL or implicit type coercions."""
    if type(request) is not dict:
        raise ValueError("Input must be a JSON object")
    missing = REQUIRED_KEYS - set(request)
    extra = set(request) - REQUIRED_KEYS - {"pageSize"}
    if missing or extra:
        raise ValueError("Supply exactly the nine documented selection keys and optional pageSize")
    for key in FLAG_KEYS:
        if type(request[key]) is not bool:
            raise ValueError(key + " must be a JSON boolean")
    for flag, key in (("filterByItemFulfillments", "itemFulfillmentIds"),
                      ("filterByLocations", "locationIds")):
        ids = request[key]
        if type(ids) is not list or any(type(value) is not int or value < 1 for value in ids):
            raise ValueError(key + " must be a list of positive JSON integers")
        if request[flag] and not 1 <= len(ids) <= 50:
            raise ValueError(key + " requires 1 to 50 IDs when enabled; narrow the selection")
        if not request[flag] and ids:
            raise ValueError(key + " must be empty when its filter is disabled")
    if request["filterByItemFulfillments"] and (
        request["filterByLocations"] or request["filterByDate"]
    ):
        raise ValueError("Selected-ID mode cannot also apply date or location filters")
    for key in ("startDate", "endDate"):
        value = request[key]
        if type(value) is not str:
            raise ValueError(key + " must be a string")
        if request["filterByDate"]:
            if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", value):
                raise ValueError(key + " must use YYYY-MM-DD")
            date.fromisoformat(value)
        elif value != "":
            raise ValueError(key + " must be empty when date filtering is disabled")
    if request["filterByDate"] and request["startDate"] > request["endDate"]:
        raise ValueError("Date range is reversed")
    size = request.get("pageSize", 100)
    if type(size) is not int or not 5 <= size <= 100:
        raise ValueError("pageSize must be a JSON integer from 5 to 100")
    return size


def packaged_template():
    """Only this reviewed immutable source can become a query template."""
    content = (Path(__file__).resolve().parents[1] / "queries" / "fulfillment_performance.sql").read_bytes()
    if hashlib.sha256(content).hexdigest() != SOURCE_SHA256:
        raise ValueError("Packaged SQL differs from the reviewed source; restore the matching packaged query")
    sql = content.decode("utf-8")
    metadata = re.match(r"\A/\* @suiteql-metadata\n.*?\*/\n", sql, re.S)
    if metadata is None:
        raise ValueError("Expected packaged SuiteQL metadata")
    sql = sql[metadata.end():]
    # The pinned source has whole-line comments only; preserve all other text.
    sql = "".join(line for line in sql.splitlines(keepends=True)
                  if not line.lstrip().startswith("--"))
    if sql.count(ORIGINAL_FILTER_BLOCK) != 1:
        raise ValueError("Expected exactly one original selection filter block")
    return sql


def prepare_request(request):
    """Return stock sqlQuery/pageSize/pageIndex payload; do not execute it."""
    size = validate(request)
    sql = packaged_template()
    clauses, parameters = [], {}
    if request["filterByItemFulfillments"]:
        clauses.append("candidate.id IN (:doc_ids)")
        parameters["doc_ids"] = request["itemFulfillmentIds"]
    elif request["filterByLocations"]:
        clauses.append("candidate.location IN (:doc_ids)")
        parameters["doc_ids"] = request["locationIds"]
    if request["filterByDate"]:
        clauses.extend([
            "candidate.createdDate >= TO_DATE(':from', 'YYYY-MM-DD')",
            "candidate.createdDate < TO_DATE(':to', 'YYYY-MM-DD') + 1",
        ])
        parameters.update({"from": request["startDate"], "to": request["endDate"]})
    if request["shippedOnly"]:
        clauses.append("candidate.status = 'C'")
    if request["salesAndTransferOnly"]:
        clauses.append("candidate.orderType IN ('SalesOrd', 'TrnfrOrd')")
    clauses.append("ROWNUM <= 50001")
    replacement = "WHERE " + ("\n" + INDENT + "AND ").join(clauses)
    template = sql.replace(ORIGINAL_FILTER_BLOCK, replacement, 1)
    return compile_request({"template": template, "parameters": parameters, "pageSize": size})


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate JSON key: " + key)
        result[key] = value
    return result


def reject_constant(value):
    raise ValueError("Nonstandard JSON constant: " + value)


def read_request(path):
    if path.stat().st_size > 100000:
        raise ValueError("Input exceeds 100000 bytes")
    return json.loads(path.read_text(encoding="utf-8"),
                      object_pairs_hook=unique_object, parse_constant=reject_constant)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    try:
        output = args.output
        skill_root = Path(__file__).resolve().parent.parent
        if output.is_relative_to(skill_root):
            raise ValueError("Output must be outside this skill directory")
        result = prepare_request(read_request(args.input))
        publish_file(args.output, json.dumps(result, indent=2) + "\n", inputs=(args.input,))
    except (ValueError, OSError) as error:
        parser.exit(2, "Error: " + str(error) + "\n")


if __name__ == "__main__":
    main()
