#!/usr/bin/env python3
"""Compile a metadata-reviewed SELECT template locally; never calls NetSuite.

The calling runbook owns schema review, business meaning and authorization.
Local compilation does not establish account schema compatibility.
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


import sys as _output_sys
from pathlib import Path as _OutputPath
_output_sys.dont_write_bytecode = True
_output_sys.path.insert(0, str(_OutputPath(__file__).resolve().parents[1]))
from safe_output import publish as publish_output

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
    # Ignore SQL literals while checking statement structure. This conservative
    # lexical screen is not a SQL parser or a server authorization boundary.
    tokens = re.findall(r"'(?:''|[^'])*'|[^']+", template)
    if ''.join(tokens) != template:
        raise ValueError('Unbalanced SQL literals')
    code = ''.join(' ' if token.startswith("'") else token for token in tokens)
    if not re.match(r'^\s*SELECT\b', code, re.I):
        raise ValueError('Expected a SELECT template')
    if re.search(r';|--|/\*|\*/|\b(?:INSERT|UPDATE|DELETE|MERGE|DROP|ALTER|CREATE|GRANT|EXECUTE)\b', code, re.I):
        raise ValueError('Only a single uncommented SELECT template is supported')
    return {'sqlQuery': compiler()(template, parameters), 'pageSize': size, 'pageIndex': 0}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--output-dir', required=True, type=Path)
    args = parser.parse_args()
    if args.input.stat().st_size > 100000:
        raise ValueError('Input exceeds 100000 bytes')
    result = compile_request(json.loads(args.input.read_text()))
    publish_output(json.dumps(result, indent=2)+'\n', args.output, output_dir=args.output_dir, inputs=[args.input])
