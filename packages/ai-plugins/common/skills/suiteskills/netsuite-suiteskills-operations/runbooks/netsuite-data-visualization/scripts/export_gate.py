"""Private browser bridge preflight: reject arbitrary HTML before Chromium starts."""
import sys
sys.dont_write_bytecode = True
from contract import loads
from renderer import validate_html


def main():
    try:
        raw=sys.stdin.buffer.read(32*1024*1024+1)
        if len(raw)>32*1024*1024:raise ValueError('Bridge input size')
        envelope=loads(raw.decode('utf-8'))
        if not isinstance(envelope,dict) or set(envelope)!={'document','binding'}:raise ValueError('Bridge envelope')
        validate_html(envelope['document'],envelope['binding'])
        return 0
    except (ValueError,OSError,KeyError,TypeError) as exc:
        print('Canonical HTML gate refused: '+str(exc),file=sys.stderr)
        return 2


if __name__=='__main__':sys.exit(main())
