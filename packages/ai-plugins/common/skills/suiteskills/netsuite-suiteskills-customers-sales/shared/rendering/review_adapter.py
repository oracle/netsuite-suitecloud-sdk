"""Optional fixed local review view; existing analytical and export gates still apply."""
import argparse
import copy
import re
import html
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('result_evidence',HERE.parent/'tools/result_evidence.py')
evidence=importlib.util.module_from_spec(spec);spec.loader.exec_module(evidence)


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

def render_review(result,receipt,config,output):
    errors=evidence.validate_result(result)
    if errors:raise ValueError('; '.join(errors))
    if receipt is not None and evidence.verify_receipt(result,receipt):raise ValueError('receipt does not match the result')
    if not isinstance(config,dict) or set(config)!={'title','columns'} or not isinstance(config['title'],str) or not config['title'].strip():raise ValueError('title and columns required')
    columns=config['columns']
    if not isinstance(columns,list) or not 1<=len(columns)<=30:raise ValueError('1 to 30 columns required')
    fields=set()
    for c in columns:
        if not isinstance(c,dict) or set(c)!={'field','label','type'} or c['type'] not in ('text','decimal') or not all(isinstance(c[k],str) and c[k] for k in ('field','label')):raise ValueError('invalid column')
        if c['field'] in fields:raise ValueError('duplicate column')
        fields.add(c['field'])
        if result['rows'] and not any(c['field'] in r for r in result['rows']):raise ValueError('unknown column')
        if c['type']=='decimal':
            for row in result['rows']:
                value=row.get(c['field'])
                if value is not None and not isinstance(value,dict):evidence.number(value)
    output=Path(output).absolute()
    if any(p.is_symlink() for p in [output,*output.parents]):raise ValueError('symlink output paths are unsupported')
    if not output.parent.is_dir():raise ValueError('output parent must already exist')
    if output.suffix.lower()!='.html':raise ValueError('HTML destination required')
    # Browser projection is display-only; receipts bind the original result bytes.
    def browser_value(value):
        if type(value) is int:return str(value)
        if isinstance(value,list):return [browser_value(v) for v in value]
        if isinstance(value,dict):return {k:browser_value(v) for k,v in value.items()}
        return value
    projected=browser_value(copy.deepcopy(result))
    for c in columns:
        if c['type']=='decimal':
            for row in projected['rows']:
                value=row.get(c['field'])
                if value is not None and not isinstance(value,dict):row[c['field']]=format(evidence.number(value),'f')
    # Canonical serialization escapes HTML delimiters before embedding inert JSON.
    payload=evidence.canonical({'result':projected,'config':config,'receipt':browser_value(receipt),'result_digest':evidence.digest_result(result)}).decode().replace('&','\\u0026').replace('<','\\u003c').replace('>','\\u003e')
    status='No mechanical receipt supplied' if receipt is None else 'Mechanical checks: '+receipt['status']
    css=(HERE.parent/'design/redwood-tokens.css').read_text()
    template=(HERE/'review_view.html').read_text()
    replacements={'@@TITLE@@':html.escape(config['title']),'@@STATUS@@':html.escape(status),'@@TOKENS@@':css,'@@DATA@@':payload,'@@SCRIPT@@':(HERE/'review_view.js').read_text()}
    template=re.sub(r'@@[A-Z]+@@',lambda m:replacements[m[0]],template)
    publish_file(output, template)


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('result',type=Path);p.add_argument('config',type=Path);p.add_argument('output',type=Path);p.add_argument('--receipt',type=Path)
    a=p.parse_args();render_review(json.loads(a.result.read_text()),json.loads(a.receipt.read_text()) if a.receipt else None,json.loads(a.config.read_text()),a.output)
