"""Closed input contract. No connector, expression evaluator, HTML or arbitrary URLs."""
import copy
import datetime as dt
import json
import math
import re
import unicodedata
from chart_contract import validate_chart

MAX_ROWS = 2000
ROUTES = {
    'inventoryitem': ('/app/common/item/item.nl', 'id'),
    'assemblyitem': ('/app/common/item/item.nl', 'id'),
    'customer': ('/app/common/entity/custjob.nl', 'id'),
    'vendor': ('/app/common/entity/vendor.nl', 'id'),
    'salesorder': ('/app/accounting/transactions/salesord.nl', 'id'),
    'itemfulfillment': ('/app/accounting/transactions/itemship.nl', 'id'),
    'savedsearch': ('/app/common/search/searchresults.nl', 'searchid'),
}


def loads(text):
    def pairs(items):
        result = {}
        for k, v in items:
            if k in result or k in ('__proto__', 'prototype', 'constructor'):
                raise ValueError('Duplicate or prohibited JSON key')
            result[k] = v
        return result
    return json.loads(text, object_pairs_hook=pairs,
                      parse_constant=lambda x: (_ for _ in ()).throw(ValueError('Nonfinite number')))


def shape(obj, required, optional=()):
    if not isinstance(obj, dict): raise ValueError('Expected an object')
    unknown=set(obj)-set(required)-set(optional);missing=set(required)-set(obj)
    if unknown or missing:
        def names(keys):
            ordered=sorted(str(k) for k in keys)
            result=', '.join(json.dumps(k[:80],ensure_ascii=True) for k in ordered[:8])
            return result+(' (and '+str(len(ordered)-8)+' more)' if len(ordered)>8 else '')
        raise ValueError('; '.join(label+names(keys) for label,keys in (('Unknown fields: ',unknown),('Missing fields: ',missing)) if keys))


def text(value, maximum=2000):
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise ValueError('Expected nonempty bounded literal text')
    if any((ord(c) < 32 and c not in '\n\t') or 0xD800 <= ord(c) <= 0xDFFF for c in value):
        raise ValueError('Unsupported control character')
    return value


def basename(value):
    text(value, 96)
    if value != unicodedata.normalize('NFC', value) or value != value.strip() or value.endswith('.'):
        raise ValueError('Use NFC Unicode basename without surrounding whitespace')
    if '..' in value or any(c in value for c in '/\\:'):
        raise ValueError('Export name must be a basename')
    if not all(c.isalnum() or c in ' _-.' for c in value):
        raise ValueError('Only Unicode letters/numbers, spaces, underscore, hyphen and dot')
    if len(value.encode('utf-8')) > 160 or any(unicodedata.category(c).startswith('C') for c in value):
        raise ValueError('Invalid or excessive basename')
    if re.fullmatch(r'(?i)(CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])', value.split('.')[0]):
        raise ValueError('Platform-reserved basename')
    return value


def export_name(cli, configured, fallback='visualization', suffix=None):
    # Validate every provided source, even a lower-precedence one, before composition.
    for value in (cli, configured, fallback, suffix):
        if value is not None:
            basename(value)
    return basename((cli if cli is not None else configured if configured is not None else fallback)
                    + ('-' + suffix if suffix is not None else ''))


def validate(model):
    shape(model, ('schema_version', 'title', 'question', 'domain', 'export_name', 'source', 'columns', 'rows', 'charts', 'references'))
    if type(model['schema_version']) is not int or model['schema_version'] != 1:
        raise ValueError('Unsupported schema version')
    text(model['title'], 160); text(model['question'], 300); basename(model['export_name'])
    if model['domain'] not in ('operations', 'financial'):
        raise ValueError('Unsupported domain')
    s = model['source']
    shape(s, ('kind', 'label', 'retrieved_at', 'scope', 'filters', 'status', 'completeness', 'expected_rows', 'grain', 'limitations'))
    if s['kind'] not in ('supplied', 'netsuite') or s['status'] not in ('preliminary', 'final', 'limited'):
        raise ValueError('Source kind or status unsupported')
    for k in ('label', 'scope'):
        text(s[k])
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z', s['retrieved_at']):
        raise ValueError('Explicit UTC retrieval time required')
    dt.datetime.strptime(s['retrieved_at'], '%Y-%m-%dT%H:%M:%SZ')
    for k in ('filters', 'limitations', 'grain'):
        if not isinstance(s[k], list) or len(s[k]) > 32:
            raise ValueError('Expected bounded list')
        for v in s[k]: text(v)
    if s['completeness'] not in ('complete', 'partial', 'unknown'):
        raise ValueError('Denied/failed retrieval cannot be rendered as data')
    if s['completeness'] != 'complete' and (s['status'] != 'limited' or not s['limitations']):
        raise ValueError('Incomplete population requires LIMITED DATA and limitations')
    rows = model['rows']; cols = model['columns']
    if not isinstance(rows, list) or len(rows) > MAX_ROWS or not isinstance(cols, list) or not 1 <= len(cols) <= 12:
        raise ValueError('Row/column bounds exceeded')
    expected = s['expected_rows']
    if expected is not None and (type(expected) is not int or expected < len(rows)):
        raise ValueError('Expected row count contradicts snapshot')
    if s['completeness'] == 'complete' and expected != len(rows):
        raise ValueError('Complete population requires exact expected count')
    keys = set(); cm = {}
    for col in cols:
        if col.get('type') == 'number':
            shape(col, ('key', 'label', 'type', 'kind', 'unit', 'currency'))
            if col['kind'] not in ('number', 'quantity', 'count', 'ratio', 'money'):
                raise ValueError('Unknown measure kind')
            text(col['unit'], 80)
            if col['kind'] == 'money':
                if not isinstance(col['currency'], str) or not re.fullmatch(r'[A-Z]{3}', col['currency']) or col['unit'] != col['currency']:
                    raise ValueError('Money requires an explicit three-letter currency code and matching unscaled unit')
            else:
                if col['currency'] is not None:
                    raise ValueError('Only money columns may specify currency')
                units={'number':{'dimensionless'},'count':{'records','orders','items','units','events','people','cases','transactions'},'quantity':{'each','units','kg','g','lb','oz','l','ml','m','cm','mm','hours','days','minutes','seconds','boxes','cases','pallets','board_feet'},'ratio':{'ratio','percent'}}
                if col['unit'] not in units[col['kind']]:raise ValueError('Unsupported measure unit; use a reviewed contract extension')
        else:
            shape(col, ('key', 'label', 'type'))
            if col['type'] not in ('text', 'date'): raise ValueError('Unknown column type')
        if not re.fullmatch(r'[a-z][a-z0-9_]{0,39}', col['key']) or col['key'] in keys or col['key'] in ('constructor','prototype','__proto__'):
            raise ValueError('Invalid/duplicate column key')
        text(col['label'], 100); keys.add(col['key']); cm[col['key']] = col
    if not s['grain'] or len(set(s['grain'])) != len(s['grain']) or not set(s['grain']) <= keys:
        raise ValueError('Unique explicit grain required')
    seen = set()
    for row in rows:
        shape(row, keys)
        for key, value in row.items():
            typ = cm[key]['type']
            if typ == 'number':
                if type(value) not in (int, float) or not math.isfinite(value) or abs(value) > 1e12:
                    raise ValueError('Finite numeric values required; missing is not zero')
            elif typ == 'date':
                text(value, 10)
                if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',value):raise ValueError('ISO calendar date required')
                dt.date.fromisoformat(value)
                if len(value) != 10: raise ValueError('ISO calendar date required')
            else:
                text(value)
        grain = tuple(row[k] for k in s['grain'])
        if grain in seen: raise ValueError('Duplicate aggregation grain')
        seen.add(grain)
    charts = model['charts']
    if not isinstance(charts, list) or not 1 <= len(charts) <= 6: raise ValueError('1–6 charts required')
    for chart in charts:
        validate_chart(chart, cm, rows, s)
    refs = model['references']
    if not isinstance(refs, list) or len(refs) > len(rows) * len(cols): raise ValueError('Invalid references')
    positions = set()
    for ref in refs:
        shape(ref, ('row','column','record_type','internal_id','label','account_id','environment','session_id','evidence_id','evidence_sha256'), ('url',))
        if type(ref['row']) is not int or not 0 <= ref['row'] < len(rows) or ref['column'] not in keys:
            raise ValueError('Reference does not align to row')
        if ref['label'] != str(rows[ref['row']][ref['column']]): raise ValueError('Reference label/row mismatch')
        for key in set(ref) - {'row'}: text(ref[key])
        pos = (ref['row'], ref['column'])
        if pos in positions: raise ValueError('Ambiguous reference')
        positions.add(pos)
    return copy.deepcopy(model)


def validate_binding(binding):
    shape(binding, ('account_id','environment','origin','session_id','evidence_id','evidence_sha256','synthetic'))
    for k in set(binding) - {'synthetic'}: text(binding[k])
    if type(binding['synthetic']) is not bool or binding['environment'] not in ('production','sandbox','releasepreview'):
        raise ValueError('Invalid account context')
    # Never derive a domain from an account name. Exact origin is external evidence.
    if not re.fullmatch(r'https://[a-z0-9]+(?:-[a-z0-9]+)*\.app\.netsuite\.com', binding['origin']):
        raise ValueError('Account-specific origin required; ports/credentials forbidden')
    if binding['origin'].split('//')[1].split('.')[0] in {'system','www','netsuite','login','rest','webservices','app'}:raise ValueError('Generic origin forbidden')
    if not re.fullmatch(r'[0-9a-f]{64}', binding['evidence_sha256']): raise ValueError('Evidence digest required')
    return binding


def resolve(ref, binding, model):
    if binding is None: return None
    try:
        validate_binding(binding)
        if binding['synthetic'] and model['source']['kind']=='netsuite':return None
        for k in ('account_id','environment','session_id','evidence_id','evidence_sha256'):
            if ref[k] != binding[k]: return None
        if type(ref['row']) is not int or ref['label'] != str(model['rows'][ref['row']][ref['column']]): return None
        if not re.fullmatch(r'[1-9][0-9]{0,11}', ref['internal_id']): return None
        path, parameter = ROUTES[ref['record_type']]
        url = binding['origin'] + path + '?' + parameter + '=' + ref['internal_id']
        if 'url' in ref and ref['url'] != url: return None
        return url
    except (ValueError, KeyError, IndexError, TypeError):
        return None


def links(model, binding=None):
    return [resolve(ref, binding, model) for ref in model['references']]
