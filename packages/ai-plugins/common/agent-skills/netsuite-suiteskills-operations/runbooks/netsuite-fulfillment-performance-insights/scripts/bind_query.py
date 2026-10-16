#!/usr/bin/env python3
"""Bind the hash-registered fulfillment query locally; no account calls."""
import argparse
from datetime import date
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
BOOLS = {'filterByItemFulfillments', 'filterByLocations', 'filterByDate', 'shippedOnly', 'salesAndTransferOnly'}
LISTS = {'itemFulfillmentIds', 'locationIds'}
DATES = {'startDate', 'endDate'}
TOKEN = re.compile(r"'(?:''|[^'])*'|:([A-Za-z_][A-Za-z0-9_]*)")


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

def pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise ValueError('Duplicate JSON key')
        result[key] = value
    return result


def bind(query, params):
    if not isinstance(params, dict) or set(params) != BOOLS | LISTS | DATES:
        raise ValueError('Supply exactly the declared fulfillment parameters')
    values = {}
    for key in BOOLS:
        if type(params[key]) is not bool:
            raise ValueError('Boolean parameter must be true or false')
        values[key] = "'T'" if params[key] else "'F'"
    for key, flag in [('itemFulfillmentIds','filterByItemFulfillments'),('locationIds','filterByLocations')]:
        ids = params[key]
        if not isinstance(ids,list) or len(ids)>1000 or any(type(x) is not int or not 1<=x<=10**24 for x in ids):
            raise ValueError('Expected at most 1000 positive integer identifiers')
        if len(ids)!=len(set(ids)) or bool(ids)!=params[flag]:
            raise ValueError('Enabled filter needs unique IDs; disabled filter needs []')
        values[key] = ','.join(map(str,ids)) or 'NULL'
    for key in DATES:
        value = params[key]
        if params['filterByDate']:
            if not isinstance(value,str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}',value):
                raise ValueError('Date must be YYYY-MM-DD')
            date.fromisoformat(value)
            values[key] = "'"+value+"'"
        else:
            if value != '':
                raise ValueError('Disabled date filter needs empty dates')
            values[key] = 'NULL'
    if params['filterByDate'] and params['startDate']>params['endDate']:
        raise ValueError('Date range is reversed')
    used = set()
    def replace(match):
        name = match.group(1)
        if name is None:
            return match.group(0)
        if name not in values:
            raise ValueError('Unknown query parameter: '+name)
        used.add(name)
        return values[name]
    result = TOKEN.sub(replace,query)
    if used != set(values):
        raise ValueError('Declared and used query parameters differ')
    return result


def prepare(query_path, params):
    path = Path(query_path).resolve()
    if path.parent != (ROOT/'queries').resolve():
        raise ValueError('Query must be a registered local template')
    registry = json.loads((ROOT/'scripts/query-digests.json').read_text())
    raw = path.read_bytes()
    if registry.get(path.name) != hashlib.sha256(raw).hexdigest():
        raise ValueError('Packaged template integrity check failed')
    return bind(raw.decode(),params)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('query',type=Path); parser.add_argument('parameters',type=Path); parser.add_argument('output',type=Path)
    parser.add_argument('--request',action='store_true')
    args=parser.parse_args()
    if args.parameters.stat().st_size>100000:
        raise ValueError('Parameters exceed size limit')
    output=args.output
    package=next((p for p in ROOT.parents if (p/'.claude-plugin/plugin.json').exists()),ROOT)
    if output.is_relative_to(package):
        raise ValueError('Write outputs outside the installed plugin')
    result=prepare(args.query,json.loads(args.parameters.read_text(),object_pairs_hook=pairs))
    if args.request:result=json.dumps({'sqlQuery':result,'pageSize':100,'pageIndex':0},indent=2)
    publish_file(args.output, result+'\n', inputs=(args.query, args.parameters))
