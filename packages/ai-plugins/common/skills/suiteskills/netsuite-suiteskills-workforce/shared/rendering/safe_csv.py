"""Conventional business CSV serialization; local output only, no network/account operations."""
import argparse,csv,io,json,math
from decimal import Decimal
from pathlib import Path

VERSION='1.0.0'
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

def safe_text(value):
    if not isinstance(value,str):raise TypeError('Expected string')
    if value and (value[0] in '\t\r\n' or value.lstrip().startswith(('=','+','-','@','＝','＋','－','＠'))):return "'"+value
    return value

def cell(value):
    if value is None:return ''
    if isinstance(value,bool):raise ValueError('Boolean business cells require an explicit text representation')
    if isinstance(value,(int,float,Decimal)):
        if not Decimal(str(value)).is_finite():raise ValueError('Nonfinite number')
        return str(value)
    if isinstance(value,str):return safe_text(value)
    raise TypeError('Only text, finite numbers and null are supported')

def serialize(columns,rows):
    if not columns or any(not isinstance(c,str) or not c for c in columns):raise ValueError('Nonempty text column labels required')
    if len(set(columns))!=len(columns):raise ValueError('Duplicate columns')
    stream=io.StringIO(newline='');writer=csv.writer(stream,lineterminator='\r\n')
    writer.writerow([safe_text(c) for c in columns])
    for row in rows:
        if len(row)!=len(columns):raise ValueError('Row width mismatch')
        writer.writerow([cell(v) for v in row])
    return stream.getvalue()

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('input',type=Path);p.add_argument('output',type=Path);args=p.parse_args()
    data=json.loads(args.input.read_text(),parse_float=Decimal)
    if set(data)!={'columns','rows'}:raise ValueError('Expected columns and rows only')
    out=serialize(data['columns'],data['rows'])
    publish_file(args.output, out, inputs=(args.input,))
if __name__=='__main__':main()
