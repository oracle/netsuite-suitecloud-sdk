#!/usr/bin/env python3
"""Compile an allowlisted, packaged query locally; never connect to NetSuite.

Usage: python compile_query.py QUERY_ID INPUT_PARAMS.json OUTPUT_REQUEST.json
       [--page-size 5..100]

Schema and semantic checks belong to pre-release account testing. Compilation
checks input and template integrity only; it does not prove live compatibility.
"""

from __future__ import annotations

import argparse
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
import hashlib
import json
from pathlib import Path
import re
import sys


QUERY_IDS = frozenset({
    "negative_inventory_quantity", "negative_inventory_transactions",
    "inbound_po_overdue", "inbound_transfer_order_overdue",
    "inbound_po_linked_sales_orders", "transaction_refs",
    "sales_order_ship_date_risk", "sales_order_fulfillment_status",
    "failed_pick_tasks", "expired_lots", "putaway_aging", "putaway_balances",
    "putaway_aging_no_bin", "putaway_balances_no_bin",
})
QUERY_DIR = Path(__file__).resolve().parent.parent / "queries"
MAX_NUMBER = Decimal("1e24")
_NAME = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")


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

class QueryError(ValueError):
    """Invalid input or an altered/unsupported template."""


def _reject_constant(value: str):
    raise QueryError("Non-finite JSON numbers are not allowed")


def _object_pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise QueryError("Duplicate JSON property: " + key)
        result[key] = value
    return result


def read_parameters(path: str | Path) -> dict:
    """Read strict JSON without silent duplicate keys or floating-point rounding."""
    try:
        with Path(path).open("rb") as handle:
            content = handle.read(100_001)
        if len(content) > 100_000:
            raise QueryError("Parameter JSON file must not exceed 100 KB")
        result = json.loads(
            content.decode("utf-8"), parse_float=Decimal,
            parse_constant=_reject_constant, object_pairs_hook=_object_pairs,
        )
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise QueryError("Cannot read a valid parameter JSON file: " + str(exc)) from exc
    if not isinstance(result, dict):
        raise QueryError("Parameters must be a JSON object")
    return result


def _load_query(query_id: str, query_dir: Path):
    if query_id not in QUERY_IDS:
        raise QueryError("Unknown query ID; only packaged query IDs are accepted")
    try:
        catalog = json.loads((query_dir / "catalog.json").read_text(encoding="utf-8"))
        if catalog["format_version"] != 1:
            raise QueryError("Unsupported query catalog version")
        spec = catalog["queries"][query_id]
        if spec["file"] != query_id + ".sql":
            raise QueryError("Unexpected query template path")
        content = (query_dir / spec["file"]).read_bytes()
        expected = spec["template_sha256"]
        if not isinstance(expected, str) or not re.fullmatch(r"[0-9a-f]{64}", expected):
            raise QueryError("Invalid template digest in catalog")
        if hashlib.sha256(content).hexdigest() != expected:
            raise QueryError("Query template digest mismatch; use the unmodified package")
        template = content.decode("utf-8")
    except (OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError) as exc:
        raise QueryError("Cannot load the packaged query catalog/template") from exc
    return spec, template


def _number(name: str, value, maximum: Decimal = MAX_NUMBER) -> Decimal:
    if isinstance(value, bool) or not isinstance(value, (int, float, Decimal)):
        raise QueryError(name + " must be a JSON number")
    try:
        number = Decimal(str(value))
    except InvalidOperation as exc:
        raise QueryError(name + " must be a finite number") from exc
    if not number.is_finite() or number < 0 or number > maximum:
        raise QueryError(name + " must be finite and between 0 and " + str(maximum))
    if not -12 <= number.as_tuple().exponent <= 25 or len(number.as_tuple().digits) > 37:
        raise QueryError(name + " supports at most 12 fractional places and bounded decimal precision")
    if number.is_zero():
        return Decimal(0)
    return number


def _date_string(name: str, value: str, date_time: bool = False) -> str:
    pattern = r"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}" if date_time else r"\d{4}-\d{2}-\d{2}"
    if not re.fullmatch(pattern, value):
        raise QueryError(name + " must use " + ("YYYY-MM-DD HH24:MI:SS" if date_time else "YYYY-MM-DD"))
    try:
        if date_time:
            datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        else:
            date.fromisoformat(value)
    except ValueError as exc:
        raise QueryError(name + " is not a valid calendar date/time") from exc
    return value


def _validate_parameters(query_id: str, parameters: dict, spec: dict) -> dict[str, str]:
    if not isinstance(parameters, dict):
        raise QueryError("Parameters must be a JSON object")
    definitions = spec["parameters"]
    required = {entry["name"] for entry in definitions}
    if set(parameters) != required:
        missing, extra = sorted(required - set(parameters)), sorted(set(parameters) - required)
        raise QueryError("Supply every declared parameter and no others; missing=" + repr(missing) + "; extra=" + repr(extra))
    literals = {}
    for entry in definitions:
        name, value = entry["name"], parameters[entry["name"]]
        if entry["cardinality"] == "ARRAY":
            if not isinstance(value, list):
                raise QueryError(name + " must be an array of positive integer IDs")
            if len(value) > 625:
                raise QueryError(name + " cannot contain more than 625 IDs")
            if any(type(item) is not int or not 0 < item <= 10**24 for item in value):
                raise QueryError(name + " must contain only positive integer IDs no greater than 1e24")
            scope_name = name[:-3] + "Scope"
            if scope_name in required:
                scope = parameters[scope_name]
                if scope == "ALL" and value:
                    raise QueryError(scope_name + "=ALL requires an empty " + name)
                if scope == "SELECTED" and not value:
                    raise QueryError(scope_name + "=SELECTED requires at least one ID")
            elif not value:
                raise QueryError(name + " cannot be empty for an enrichment query")
            literals[name] = ", ".join(str(item) for item in value) if value else "NULL"
        elif entry["type"] == "STRING":
            if not isinstance(value, str):
                raise QueryError(name + " must be a JSON string")
            if "enum" in entry:
                if value not in entry["enum"]:
                    raise QueryError(name + " must be one of " + ", ".join(entry["enum"]))
            elif name in ("asOfDate", "expirationDateFrom", "expirationDateTo"):
                _date_string(name, value)
            elif name == "asOfDateTime":
                _date_string(name, value, date_time=True)
            else:
                raise QueryError("Unsupported packaged string parameter: " + name)
            literals[name] = "'" + value.replace("'", "''") + "'"
        elif entry["type"] == "NUMBER":
            number = _number(name, value)
            if name == "maxRows":
                maximum = 625 if query_id == "negative_inventory_transactions" else 100
                if number != number.to_integral_value() or not 1 <= number <= maximum:
                    raise QueryError("maxRows must be a positive integer no greater than " + str(maximum))
            literals[name] = format(number, "f")
        else:
            raise QueryError("Unsupported packaged parameter type")
    if parameters.get("expirationDateScope") == "RANGE":
        if parameters["expirationDateFrom"] > parameters["expirationDateTo"]:
            raise QueryError("expirationDateFrom must not be after expirationDateTo")
    if parameters.get("quantityOnHandScope") == "RANGE":
        if _number("minimumQuantityOnHand", parameters["minimumQuantityOnHand"]) > _number("maximumQuantityOnHand", parameters["maximumQuantityOnHand"]):
            raise QueryError("minimumQuantityOnHand must not exceed maximumQuantityOnHand")
    return literals


def _substitute(template: str, literals: dict[str, str]) -> str:
    """Tokenize binds outside string literals (HH24:MI:SS is not a bind)."""
    if not re.match(r"\s*SELECT\b", template, re.IGNORECASE):
        raise QueryError("Only a single SELECT statement is permitted")
    output, consumed = [], set()
    position = 0
    while position < len(template):
        char = template[position]
        if char == "'":
            start = position
            position += 1
            while position < len(template):
                if template[position] == "'":
                    if position + 1 < len(template) and template[position + 1] == "'":
                        position += 2
                        continue
                    position += 1
                    break
                position += 1
            else:
                raise QueryError("Unterminated SQL string in packaged template")
            output.append(template[start:position])
            continue
        if char == ";" or template.startswith(("--", "/*", "*/"), position):
            raise QueryError("SQL comments and extra statements are not permitted")
        if char == ":":
            match = _NAME.match(template, position + 1)
            if match is None or match.group() not in literals:
                raise QueryError("Unrecognized or unexpanded parameter in packaged template")
            name = match.group()
            output.append(literals[name])
            consumed.add(name)
            position = match.end()
            continue
        output.append(char)
        position += 1
    if consumed != set(literals):
        raise QueryError("Packaged parameter declarations do not match SQL binds")
    return "".join(output).strip()


def compile_request(query_id: str, parameters: dict, page_size: int = 100,
                    *, query_dir: Path | None = None) -> dict:
    """Return exactly the request fields accepted by the documented query tool.

    A request starts and ends at pageIndex 0. Do not fetch subsequent pages.
    """
    if type(page_size) is not int or not 5 <= page_size <= 100:
        raise QueryError("pageSize must be an integer from 5 through 100")
    spec, template = _load_query(query_id, QUERY_DIR if query_dir is None else Path(query_dir))
    literals = _validate_parameters(query_id, parameters, spec)
    return {"sqlQuery": _substitute(template, literals), "pageSize": page_size, "pageIndex": 0}


def _output_path(path: str | Path, input_path: str | Path) -> Path:
    target = Path(path).absolute()
    if any(part.is_symlink() for part in (target, *target.parents)):
        raise QueryError("Output and its parent paths must not be symbolic links")
    resolved = target.resolve()
    if resolved == Path(input_path).resolve():
        raise QueryError("Output must differ from the input parameter file")
    if resolved.is_relative_to(QUERY_DIR.parent.resolve()):
        raise QueryError("Output must be outside the installed skill directory")
    if target.exists():
        raise QueryError("Output already exists; choose a new task-local request filename")
    return target


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("query_id", choices=sorted(QUERY_IDS))
    parser.add_argument("input_parameters", help="JSON object containing every declared parameter")
    parser.add_argument("output_request", help="Local JSON request file; nothing is sent to NetSuite")
    parser.add_argument("--page-size", type=int, default=100)
    args = parser.parse_args(argv)
    try:
        output = Path(args.output_request)
        request = compile_request(args.query_id, read_parameters(args.input_parameters), args.page_size)
        publish_file(output, json.dumps(request, indent=2) + "\n", inputs=(args.input_parameters,))
    except (QueryError, OSError, ValueError) as exc:
        print("Query compilation failed: " + str(exc), file=sys.stderr)
        return 2
    print("Created local request JSON. Local compilation does not establish live account compatibility.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
