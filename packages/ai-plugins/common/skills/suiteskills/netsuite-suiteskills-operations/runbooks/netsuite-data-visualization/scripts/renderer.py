"""Deterministic renderer and byte-exact final delivery validator."""
import base64
import hashlib
import html
import json
import pathlib
import re
from contract import validate, links, loads
ASSETS=pathlib.Path(__file__).resolve().parent.parent/'assets'
# Pinned reviewed asset digests, not hashes of scripts discovered in generated output.
TRUST = {'view.js': '77625ef53dcf05b7837a128be5abf77a04b47e26020770c2f1ece12e43fc7255', 'view.css': 'd790e14a1a4afa53e616f3b5ddf05c0d192cb812909139a23cf38a47625f435f'}  # populated at authoring, never inferred from delivered HTML


def asset(name):
    raw=(ASSETS/name).read_bytes()
    if hashlib.sha256(raw).hexdigest()!=TRUST[name]: raise ValueError('Reviewed renderer asset changed')
    return raw.decode('utf-8')


def json_in_html(data):
    return json.dumps(data, ensure_ascii=False, allow_nan=False, sort_keys=True,separators=(',',':')).replace('&','\\u0026').replace('<','\\u003c').replace('>','\\u003e').replace('\u2028','\\u2028').replace('\u2029','\\u2029')


def render(model,binding=None):
    model=validate(model)
    script=asset('view.js');style=asset('view.css')
    sh=base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
    ch=base64.b64encode(hashlib.sha256(style.encode()).digest()).decode()
    csp="default-src 'none'; script-src 'sha256-"+sh+"'; style-src 'sha256-"+ch+"'; connect-src 'none'; img-src 'none'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; worker-src 'none'; media-src 'none'"
    data=json_in_html({'model':model,'links':links(model,binding)})
    return ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
            '<meta http-equiv="Content-Security-Policy" content="'+html.escape(csp,quote=True)+'">'
            '<meta name="viewport" content="width=device-width, initial-scale=1">'
            '<meta name="referrer" content="no-referrer"><title>'+html.escape(model['title'])+'</title>'
            '<style>'+style+'</style></head><body><div id="view"></div>'
            '<noscript>JavaScript is required for this local snapshot view.</noscript>'
            '<script id="snapshot" type="application/json">'+data+'</script>'
            '<script>'+script+'</script></body></html>\n')


def validate_html(document,binding=None):
    if not isinstance(document,str) or len(document.encode('utf-8'))>16*1024*1024: raise ValueError('Artifact size/type')
    matches=re.findall(r'<script id="snapshot" type="application/json">(.*?)</script>',document,re.S)
    if len(matches)!=1: raise ValueError('Missing/ambiguous inert snapshot')
    envelope=loads(matches[0])
    if not isinstance(envelope,dict) or set(envelope)!={'model','links'}: raise ValueError('Unexpected snapshot envelope')
    model=validate(envelope['model'])
    if document!=render(model,binding):
        raise ValueError('Noncanonical artifact: unexpected markup, scripts, CSP, links or attributes')
    return model
