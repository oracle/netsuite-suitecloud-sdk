#!/usr/bin/env python3
"""Bind hash-registered movement templates with the shared typed binder."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parent.parent


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

def package_root():
    # Category-isolated and portable exports carry their own pinned shared tree.
    for parent in ROOT.parents:
        if ((parent / 'shared/tools/bind_query.py').is_file() and
            any((parent / marker).exists() for marker in
                ('SKILL.md', 'CATALOG.json', '.claude-plugin/plugin.json',
                 '.codex-plugin/plugin.json', 'plugin.json'))):
            return parent
    raise ValueError('Required packaged shared typed binder is unavailable')


def bind(query,params):
    path=package_root()/'shared/tools/bind_query.py'
    spec=importlib.util.spec_from_file_location('shared_typed_binder',path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module.bind(query,params)


def prepare(query_path,params):
    path=Path(query_path).resolve()
    if path.parent!=(ROOT/'queries').resolve():raise ValueError('Query must be a registered local template')
    raw=path.read_bytes()
    registry=json.loads((ROOT/'scripts/query-digests.json').read_text())
    if registry.get(path.name)!=hashlib.sha256(raw).hexdigest():raise ValueError('Packaged template integrity check failed')
    return bind(raw.decode(),params)


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('query',type=Path);parser.add_argument('parameters',type=Path);parser.add_argument('output',type=Path)
    parser.add_argument('--request',action='store_true');args=parser.parse_args()
    if args.parameters.stat().st_size>100000:raise ValueError('Parameters exceed size limit')
    if args.output.resolve().is_relative_to(package_root()):raise ValueError('Write outputs outside the installed plugin')
    result=prepare(args.query,json.loads(args.parameters.read_text()))
    if args.request:result=json.dumps({'sqlQuery':result,'pageSize':100,'pageIndex':0},indent=2)
    publish_file(args.output, result+'\n', inputs=(args.query, args.parameters))
