#!/usr/bin/env python3
"""Read-only artifact handoff, destination check and delivery readback CLI."""
import argparse,json,pathlib,sys
sys.dont_write_bytecode=True
from visualize import read_json
from delivery import artifact_identity,precheck_destination,verify


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('spec',nargs='?',type=pathlib.Path)
    parser.add_argument('--artifact',type=pathlib.Path)
    parser.add_argument('--format',choices=('html','pdf','pptx'),default='html')
    parser.add_argument('--binding',type=pathlib.Path)
    parser.add_argument('--handoff',type=pathlib.Path)
    parser.add_argument('--create-handoff',action='store_true')
    parser.add_argument('--precheck-destination',type=pathlib.Path)
    args=parser.parse_args()
    try:
        if args.precheck_destination:
            if not args.handoff or args.spec or args.artifact or args.binding or args.create_handoff:raise ValueError('Precheck accepts only destination and handoff')
            result=precheck_destination(read_json(args.handoff),args.precheck_destination)
        else:
            if not args.spec or not args.artifact or args.create_handoff==bool(args.handoff):raise ValueError('Select create-handoff or verification with one handoff')
            model=read_json(args.spec);binding=read_json(args.binding) if args.binding else None
            result=(artifact_identity(args.artifact,model,binding,args.format) if args.create_handoff else
                    verify(read_json(args.handoff),args.artifact,model,binding,args.format))
        print(json.dumps(result,sort_keys=True));return 0
    except (ValueError,OSError,KeyError,TypeError) as exc:
        # Values from a malformed handoff/session payload are never echoed.
        print('REFUSED [delivery_validation_failed]: artifact or destination check failed',file=sys.stderr);return 2

if __name__=='__main__':sys.exit(main())
