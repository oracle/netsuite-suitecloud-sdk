#!/usr/bin/env python3
"""Bind packaged SELECT templates locally. Does not connect to or execute in NetSuite."""
import argparse
from datetime import date
import hashlib
import json
from pathlib import Path
import re

TOKEN = re.compile(r"'(?:(?:'')|[^'])*'|:([a-z_]+)")
PARAM = re.compile(r':([a-z_]+)')
TEXT = {'name', 'title', 'department', 'tranid', 'email'}
DATES = {'from', 'to'}
IDS = {'campaign_id', 'customer_id', 'employee_id', 'item_id', 'je_id', 'location_id', 'period_id', 'record_id', 'rep_id', 'vendor_id', 'case_id', 'case_number'}


def integer(value, minimum=1):
    if isinstance(value, bool) or not re.fullmatch(r'[0-9]+', str(value)) or int(value) < minimum:
        raise ValueError('Expected a validated integer')
    return str(int(value))


def bind(query, params):
    """Single-pass typed substitution; callers own schema and authorization checks."""
    query = '\n'.join(line for line in query.splitlines() if not line.lstrip().startswith('--')).strip()
    if not re.match(r'^SELECT\b', query, re.I):
        raise ValueError('Only packaged SELECT templates are supported')
    names = set(PARAM.findall(query))
    if set(params) != names:
        raise ValueError('Supply exactly the template parameters: ' + ', '.join(sorted(names)))
    for key in DATES & names:
        value = params[key]
        if not isinstance(value, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
            raise ValueError('Date must be YYYY-MM-DD')
        date.fromisoformat(value)
    if DATES <= names and params['from'] > params['to']:
        raise ValueError('Date range is reversed')

    escaped_literals = set()

    def replacement(match):
        token = match.group(0)
        quoted = token.startswith("'")
        def value_for(m):
            key = m.group(1)
            value = params[key]
            if key in TEXT:
                if not quoted or not isinstance(value, str) or not value.strip() or len(value) > 500 or any(ord(c) < 32 for c in value):
                    raise ValueError('Expected nonempty bounded literal text in a quoted template')
                if '%' in token:
                    value = value.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
                return value.replace("'", "''")
            if key in DATES:
                if not quoted:
                    raise ValueError('Date template must be quoted')
                return value
            if quoted:
                raise ValueError('Numeric placeholders must not be quoted')
            if key in IDS:
                if value is None and re.search(r'\(:' + key + r' IS NULL OR ', query):
                    return 'NULL'
                return integer(value)
            if key in {'min_days', 'stale_days'}:
                n = integer(value, 0)
                if int(n) > 36500:
                    raise ValueError('Day interval exceeds supported bound')
                return n
            if key == 'doc_ids':
                if not isinstance(value, list) or not 1 <= len(value) <= 50:
                    raise ValueError('Document IDs require 1 to 50 integers')
                return ','.join(integer(v) for v in value)
            raise ValueError('Unregistered parameter type: ' + key)
        result = PARAM.sub(value_for, token)
        if quoted and '%' in token and PARAM.search(token):
            escaped_literals.add(result)
        return result
    result = TOKEN.sub(replacement, query)
    for literal in escaped_literals:
        # Match the entire operand first; a negative lookahead after an optional
        # parenthesis can backtrack into UPPER and insert invalid SQL.
        operand = r"(?:UPPER\(\s*" + re.escape(literal) + r"\s*\)|" + re.escape(literal) + r")"
        pattern = r"\bLIKE\s+" + operand + r"(?P<escape>\s+ESCAPE\s+'(?:''|[^'])*')?"
        def add_escape(match):
            clause = match.group('escape')
            if clause and not re.fullmatch(r"\s+ESCAPE\s+'\\'", clause, re.I):
                raise ValueError('LIKE template must use backslash as its escape character')
            return match.group(0) if clause else match.group(0) + " ESCAPE '\\'"
        result = re.sub(pattern, add_escape, result, flags=re.I)
    return result


if __name__ == "__main__":
    raise SystemExit("Library only; use compile_query.py with a metadata-reviewed request.")
