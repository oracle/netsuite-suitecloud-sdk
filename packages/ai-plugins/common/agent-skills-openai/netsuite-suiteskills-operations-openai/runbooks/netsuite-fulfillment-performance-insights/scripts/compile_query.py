#!/usr/bin/env python3
"""Compile a metadata-reviewed SELECT template locally; never calls NetSuite.

Unlike bind_query.prepare, this path is not a publisher-allowlist check. The
calling workflow owns schema review, business meaning and authorization.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import re
import sys

# The compiler imports an installed sibling binder at runtime. Disable cache
# writes before that import so a read-only helper never mutates its package.
sys.dont_write_bytecode = True


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

def compiler():
    path = Path(__file__).with_name('bind_query.py')
    if not path.exists():  # publisher source layout, not a runtime dependency
        path = Path(__file__).parents[2]/'integrated/runtime/bind_query.py'
    spec = importlib.util.spec_from_file_location('typed_query_binder', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.bind


def category_root():
    """Protect the category in both flat and grouped shared layouts."""
    script = Path(__file__).resolve()
    for directory in script.parents:
        if directory.name == 'shared':
            return directory.parent
    return script.parent.parent  # publisher source layout


def compile_request(request):
    if set(request) != {'template', 'parameters', 'pageSize'}:
        raise ValueError('Expected template, parameters, pageSize only')
    template, parameters, size = request['template'], request['parameters'], request['pageSize']
    if not isinstance(template, str) or not 1 <= len(template) <= 20000 or not isinstance(parameters, dict):
        raise ValueError('Expected bounded template text and a parameter object')
    if type(size) is not int or not 5 <= size <= 100:
        raise ValueError('pageSize must be an integer from 5 to 100')
    import hashlib
    registry = json.loads((Path(__file__).parent / 'query-digests.json').read_text())
    if hashlib.sha256(template.encode()).hexdigest() not in registry.values():
        raise ValueError('Only unchanged registered fulfillment templates are supported')
    return {'sqlQuery': compiler()(template, parameters), 'pageSize': size, 'pageIndex': 0}



if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    output = args.output
    if output.is_relative_to(category_root()):
        raise ValueError('Output must be outside installed category files')
    if args.input.stat().st_size > 100000:
        raise ValueError('Input exceeds 100000 bytes')
    result = compile_request(json.loads(args.input.read_text()))
    publish_file(args.output, json.dumps(result, indent=2)+'\n', inputs=(args.input,))
