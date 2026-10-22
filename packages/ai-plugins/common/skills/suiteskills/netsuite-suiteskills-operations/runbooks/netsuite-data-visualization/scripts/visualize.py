#!/usr/bin/env python3
"""One CLI and one publication path for all supported artifact formats."""
import sys
sys.dont_write_bytecode = True
import argparse
import pathlib
import json
from capabilities import inspect
from runtime import RuntimeUnavailable
from contract import loads, validate, export_name, validate_binding
from renderer import render, validate_html
from publication import Publisher
from exports import make, validate_pptx, validate_pdf


def read_json(path):
    with path.open('rb') as handle:
        raw = handle.read(16 * 1024 * 1024 + 1)
    if len(raw) > 16 * 1024 * 1024: raise ValueError('Input exceeds 16 MiB')
    return loads(raw.decode('utf-8'))


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('spec',type=pathlib.Path,nargs='?')
    parser.add_argument('--capabilities',action='store_true',help='Explicit synthetic storage probe; no business artifact')
    parser.add_argument('--output-dir',type=pathlib.Path)
    parser.add_argument('--name')
    parser.add_argument('--managed-delivery',action='store_true',help='Choose a random delivery basename before source publication')
    parser.add_argument('--suffix',help='Literal basename suffix; validated before composition')
    parser.add_argument('--format',choices=['html','pdf','pptx'],default='html',help='Exports only on explicit user request')
    parser.add_argument('--binding',type=pathlib.Path,help='Externally verified connector evidence handoff, selected separately from business input')
    parser.add_argument('--validate-html',type=pathlib.Path,help='Validate an existing HTML artifact; write nothing')
    args=parser.parse_args()
    try:
        if args.capabilities:
            if args.spec or args.validate_html or args.binding or args.name or args.suffix or args.managed_delivery:
                raise ValueError('Capability mode accepts only output directory and format')
            result=inspect(args.output_dir,args.format,probe=True)
            print(json.dumps(result,sort_keys=True))
            return 0 if result['publication_available'] else 2
        if not args.spec:raise ValueError('Selected input snapshot required')
        model=validate(read_json(args.spec));binding=None
        if args.binding:
            try: binding=validate_binding(read_json(args.binding))
            except (ValueError,OSError,KeyError,TypeError) as exc:
                raise RuntimeUnavailable('binding_mismatch','Selected binding is invalid or unavailable') from exc
        if args.validate_html:
            from delivery import read_artifact
            checked=validate_html(read_artifact(args.validate_html).decode('utf-8'),binding)
            if checked!=model:raise ValueError('Artifact does not contain the selected input snapshot')
            print('DELIVERY GATE: PASS (canonical bytes and structural binding only)');return 0
        name=export_name(args.name,model['export_name'],args.spec.stem,args.suffix)+'.'+args.format
        if args.output_dir is None:raise ValueError('Generation requires an existing output directory')
        capabilities=inspect(args.output_dir,args.format)
        if not capabilities['publication_available']:
            raise RuntimeUnavailable(capabilities['code'],'Requested file generation is unavailable in this environment')
        if args.managed_delivery:
            from delivery import delivery_name
            name=delivery_name(export_name(args.name,model['export_name'],args.spec.stem,args.suffix),args.format)
        inputs=[args.spec]+([args.binding] if args.binding else [])
        # Check output boundary before expensive export. No final file exists until validated.
        with Publisher(args.output_dir,inputs=inputs) as pub:
            if args.format=='html':
                data=render(model,binding).encode('utf-8')
                validator=lambda raw:validate_html(raw.decode('utf-8'),binding)
            else:
                data=make(model,args.format,args.name,binding,args.suffix,args.spec.stem)
                validator=(lambda raw:validate_pptx(raw,model,binding)) if args.format=='pptx' else (lambda raw:validate_pdf(raw,model,binding))
            pub.publish(name,data,validator)
        print(str(args.output_dir/name));return 0
    except (ValueError,OSError,KeyError,TypeError) as exc:
        code=getattr(exc,'code',None) or ('target_exists' if isinstance(exc,FileExistsError) else 'unsafe_output' if isinstance(exc,OSError) else 'invalid_spec')
        message='Selected output already exists; no replacement occurred' if code=='target_exists' else str(exc)
        print('REFUSED ['+code+']: '+message,file=sys.stderr);return 2


if __name__=='__main__':sys.exit(main())
