#!/usr/bin/env python3
"""Compile packaged read-only templates locally; no account or network calls."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
IMPACT = {'transactionId', 'transactionLineScope', 'transactionLineIds'}
INPUTS = {
    'resolve_typed_reference': {'transactionTypeCode', 'transactionReference'},
    'resolve_exact_reference': {'transactionReference'},
    'resolve_internal_id': {'transactionId'},
    'classify_inventory_impact': IMPACT,
    'inventory_impact_lines': IMPACT,
}
TYPE_CODES = {
    'ItemRcpt', 'ItemShip', 'InvAdjst', 'InvTrnfr', 'TrnfrOrd', 'CustInvc',
    'CustCred', 'CashSale', 'SalesOrd', 'PurchOrd', 'VendBill', 'VendCred',
    'VendRtnAuth', 'RtnAuth', 'WorkOrd', 'WorkOrdCompl', 'WorkOrdIssue',
    'Build', 'Unbuild',
}

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
    pass

def pairs(values):
    result = {}
    for key, value in values:
        if key in result:
            raise QueryError('Duplicate JSON key')
        result[key] = value
    return result

def reject_constant(value):
    raise QueryError('Nonfinite value is not supported')

def integer(value, minimum=1):
    if type(value) is not int or not minimum <= value <= 10**24:
        raise QueryError('Expected a bounded integer identifier')
    return str(value)

def literal(value):
    if not isinstance(value, str) or not value.strip() or len(value) > 512:
        raise QueryError('Expected a nonempty bounded string')
    if any(ord(char) < 32 for char in value):
        raise QueryError('Control characters are not supported')
    return "'" + value.replace("'", "''") + "'"

def compile_query(query_id, parameters):
    if query_id not in INPUTS or not isinstance(parameters, dict) or set(parameters) != INPUTS[query_id]:
        raise QueryError('Supply exactly the declared inputs for a packaged query')
    values = {}
    for key, value in parameters.items():
        if key == 'transactionId':
            values[key] = integer(value)
        elif key == 'transactionReference':
            values[key] = literal(value)
        elif key == 'transactionTypeCode':
            if not isinstance(value, str) or value not in TYPE_CODES:
                raise QueryError('Use a packaged transaction type code')
            values[key] = literal(value)
        elif key == 'transactionLineScope':
            if not isinstance(value, str) or value not in ('ALL', 'SELECTED'):
                raise QueryError('Line scope must be ALL or SELECTED')
            values[key] = literal(value)
        elif key == 'transactionLineIds':
            if not isinstance(value, list) or len(value) > 400:
                raise QueryError('Line IDs must be an array of at most 400 identifiers')
            values[key] = ', '.join(integer(x, minimum=0) for x in value) or 'NULL'
    if set(parameters) == IMPACT:
        scope, ids = parameters['transactionLineScope'], parameters['transactionLineIds']
        if (scope == 'ALL' and ids) or (scope == 'SELECTED' and not ids):
            raise QueryError('ALL requires []; SELECTED requires resolved line IDs')
        if len(ids) != len(set(ids)):
            raise QueryError('Duplicate line IDs are not supported')
    content = (ROOT / (query_id + '.sql')).read_bytes()
    digests = json.loads((ROOT / 'template-digests.json').read_text())
    if hashlib.sha256(content).hexdigest() != digests.get(query_id):
        raise QueryError('Packaged template integrity check failed')
    template = content.decode('utf-8')
    if not re.match(r'^\s*SELECT\b', template, re.I):
        raise QueryError('Only packaged SELECT statements are supported')
    # Match SQL string tokens first so quoted colons are not treated as binds.
    token = re.compile(r"'(?:''|[^'])*'|:([A-Za-z_][A-Za-z0-9_]*)")
    used = set()
    def replace(match):
        name = match.group(1)
        if name is None:
            return match.group(0)
        if name not in values:
            raise QueryError('Unknown template bind')
        used.add(name)
        return values[name]
    result = token.sub(replace, template)
    if used != set(values):
        raise QueryError('Declared inputs and template binds differ')
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('query_id', choices=sorted(INPUTS))
    parser.add_argument('input_json', type=Path)
    parser.add_argument('output_sql', type=Path)
    args = parser.parse_args()
    try:
        raw = args.input_json.read_bytes()
        if len(raw) > 100_000:
            raise QueryError('Input exceeds 100 KB')
        parameters = json.loads(raw, object_pairs_hook=pairs, parse_constant=reject_constant)
        target = args.output_sql.absolute()
        if any(p.is_symlink() for p in (target, *target.parents)):
            raise QueryError('Output paths cannot be symlinks')
        if target.resolve().is_relative_to(ROOT.parent.resolve()):
            raise QueryError('Write output outside the skill directory')
        sql = compile_query(args.query_id, parameters)
        publish_file(args.output_sql, sql, inputs=(args.input_json,))
    except (ValueError, OSError, TypeError) as exc:
        print('Query compilation failed: ' + str(exc), file=sys.stderr)
        return 2
    print('Compiled local SQL. Live account compatibility is not established by compilation.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
