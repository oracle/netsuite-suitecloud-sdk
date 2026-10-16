#!/usr/bin/env python3
"""SuiteSkills shared static response renderer. Python standard library only."""
import base64
import html
import json
import re
import sys
from decimal import Decimal, DecimalException, localcontext
from pathlib import Path

MAX_BYTES = 512_000
REQUIRED = {'title', 'summary', 'state', 'scope', 'as_of', 'evidence', 'metrics', 'table', 'notes'}


import sys as _output_sys
from pathlib import Path as _OutputPath
_output_sys.dont_write_bytecode = True
_output_sys.path.insert(0, str(_OutputPath(__file__).resolve().parents[2]))
from safe_output import publish as publish_output

def require(condition, message):
    if not condition:
        raise ValueError(message)


def keys(value, required, optional=frozenset()):
    require(isinstance(value, dict), 'Expected an object')
    require(required <= value.keys() and value.keys() <= required | optional, 'Missing or unknown fields')


def text(value, limit=2000, allow_empty=False):
    require(isinstance(value, str) and len(value) <= limit and (allow_empty or value.strip()),
            'Invalid or oversized text')
    require(not any(ord(c) < 32 and c not in '\n\t\r' for c in value), 'Control characters are unsupported')


def numeric(value):
    return isinstance(value, (Decimal, int)) and not isinstance(value, bool)


def scalar(value):
    if value is None:
        return
    if numeric(value):
        number = Decimal(value)
        require(number.is_finite() and number.copy_abs() <= Decimal('1e24')
                and number.as_tuple().exponent >= -12, 'Number outside supported range or precision')
    elif isinstance(value, str):
        text(value, allow_empty=True)
    else:
        raise ValueError('Cells must be strings, finite numbers, or null; booleans are unsupported')


def bounded_list(value, limit):
    require(isinstance(value, list) and len(value) <= limit, 'Expected bounded array')


def validate(data):
    keys(data, REQUIRED, {'chart'})
    for name in ('title', 'summary', 'scope'):
        text(data[name])
    require(data['state'] in ('complete', 'partial', 'empty', 'failed'), 'Unsupported state')
    require(data['evidence'] in ('synthetic', 'observed'), 'Evidence must be synthetic or observed')
    if data['as_of'] is not None:
        text(data['as_of'], 200)
    bounded_list(data['metrics'], 12)
    for metric in data['metrics']:
        keys(metric, {'label', 'value', 'unit'})
        text(metric['label'], 200)
        text(metric['unit'], 100, allow_empty=True)
        scalar(metric['value'])
        if data['state'] == 'failed':
            require(metric['value'] is None, 'Failed responses may only contain null metrics')
    table = data['table']
    keys(table, {'columns', 'rows'})
    bounded_list(table['columns'], 12)
    require(len(table['columns']) > 0, 'Table needs at least one column')
    for column in table['columns']:
        text(column, 200)
    require(len(set(table['columns'])) == len(table['columns']), 'Duplicate column labels')
    bounded_list(table['rows'], 200)
    for row in table['rows']:
        bounded_list(row, 12)
        require(len(row) == len(table['columns']), 'Row width differs from columns')
        for cell in row:
            scalar(cell)
    if data['state'] in ('empty', 'failed'):
        require(not table['rows'], 'Empty or failed responses cannot contain result rows')
    if 'chart' in data:
        chart = data['chart']
        keys(chart, {'title', 'unit', 'points'})
        text(chart['title'], 200)
        text(chart['unit'], 100, allow_empty=True)
        bounded_list(chart['points'], 50)
        if data['state'] in ('empty', 'failed'):
            require(not chart['points'], 'Empty or failed responses cannot contain chart points')
        for point in chart['points']:
            keys(point, {'label', 'value'})
            text(point['label'], 200)
            scalar(point['value'])
            require(point['value'] is None or (numeric(point['value']) and point['value'] >= 0),
                    'Chart values must be nonnegative numbers or null, all using the chart unit')
    bounded_list(data['notes'], 30)
    for note in data['notes']:
        text(note)
    return data


def display(value):
    if value is None:
        return 'Not observed'
    if numeric(value):
        result = format(Decimal(value), 'f')
        return result.rstrip('0').rstrip('.') if '.' in result else result
    return value


def escaped(value):
    return html.escape(display(value), quote=True)


def load_json(path):
    def unique_pairs(pairs):
        obj = {}
        for key, value in pairs:
            require(key not in obj, 'Duplicate JSON field')
            obj[key] = value
        return obj
    def bad_constant(_):
        raise ValueError('Nonfinite numbers are unsupported')
    with Path(path).open('rb') as handle:
        raw = handle.read(MAX_BYTES + 1)
    require(len(raw) <= MAX_BYTES, 'JSON exceeds 512000 bytes')
    return json.loads(raw.decode('utf-8'), parse_float=Decimal, parse_int=Decimal,
                      parse_constant=bad_constant, object_pairs_hook=unique_pairs)


def stylesheet(directory):
    tokens = load_json(directory / 'design-tokens.json')
    colors = tokens['referenceColors']
    proposed = tokens['proposedUI']
    mapping = {'bg': colors['darkSurface'], 'ink': colors['textOnDark'], 'panel': colors['tableSurface'],
               'border': colors['tableBorder'], 'muted': proposed['secondaryTextOnDark'],
               'link': colors['linkOnDark'], 'bar': colors['tableHighlight'], 'track': colors['themeDarkInk'],
               'light-bg': colors['lightSurface'], 'light-ink': colors['themeDarkInk'],
               'light-link': proposed['lightLink']}
    require(all(isinstance(v, str) and re.fullmatch(r'#[0-9a-fA-F]{6}', v) for v in mapping.values()),
            'Invalid design token color')
    fonts = proposed['fontStack']
    require(isinstance(fonts, list) and 1 <= len(fonts) <= 8 and
            all(isinstance(f, str) and re.fullmatch(r'[A-Za-z0-9 -]{1,60}', f) for f in fonts),
            'Invalid font tokens')
    for key in ('bodyPx', 'smallPx', 'maxWidthPx', 'bodyLineHeight'):
        require(numeric(proposed[key]) and 0 < proposed[key] <= 2000, 'Invalid size token')
    declarations = ''.join('--' + k + ':' + v + ';' for k, v in mapping.items())
    declarations += '--font:' + ','.join(f if f == 'sans-serif' else '"' + f + '"' for f in fonts) + ';'
    for name, key, suffix in [('body', 'bodyPx', 'px'), ('small', 'smallPx', 'px'),
                              ('max', 'maxWidthPx', 'px'), ('line', 'bodyLineHeight', '')]:
        declarations += '--' + name + ':' + display(proposed[key]) + suffix + ';'
    styles = [':root{' + declarations + '}']
    redwood = directory / 'redwood-tokens.css'
    if redwood.exists():
        styles.append(redwood.read_text(encoding='utf-8'))
        styles.append(':root{--ns-brand-strip:linear-gradient(90deg,#13212C,#36677D,#94BFCE);}')
    styles.append((directory / 'visual.css').read_text(encoding='utf-8'))
    return '\n'.join(styles)


def render(data, directory=None):
    validate(data)
    css = stylesheet(directory or Path(__file__).resolve().parent.parent / 'design')
    e = escaped
    state = data['state']
    status_note = {'complete': 'Complete within the stated scope.',
                   'partial': 'Partial results; known values are not complete totals.',
                   'empty': 'No matching results within the stated scope.',
                   'failed': 'No result established; no totals or empty-result conclusion can be drawn.'}[state]
    meta = [f'State: {state}', f'Scope: {data["scope"]}',
            f'As of: {data["as_of"] if data["as_of"] is not None else "Not supplied"}',
            f'Evidence: {data["evidence"]}']
    equivalent = [data['title'], data['summary'], *meta, status_note, 'Metrics:']
    parts = ['<!doctype html><html lang="en"><head><meta charset="utf-8">',
             '<meta name="viewport" content="width=device-width, initial-scale=1">',
             '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; font-src data:; img-src data:; base-uri \'none\'; form-action \'none\'">',
             '<title>' + e(data['title']) + '</title><style>' + css + '</style></head><body><main>',
             '<header><p class="eyebrow">SuiteSkills · Shared response</p><h1>' + e(data['title']) + '</h1>',
             '<p>' + e(data['summary']) + '</p>',
             '<p class="scope">' + '<br>'.join(e(m) for m in meta) + '</p>',
             '<p class="state">' + e(status_note) + '</p>',
             '<a href="#text-equivalent">Read equivalent text</a></header>',
             '<section class="cards" aria-label="Summary metrics">']
    for metric in data['metrics']:
        parts.append('<article class="card"><h2>' + e(metric['label']) + '</h2><div class="value">' +
                     e(metric['value']) + '</div><div class="unit">' + e(metric['unit']) + '</div></article>')
        equivalent.append(f'{metric["label"]}: {display(metric["value"])} {metric["unit"]}'.rstrip())
    parts.append('</section>')
    if 'chart' in data:
        chart = data['chart']
        known_values = [p['value'] for p in chart['points'] if p['value'] is not None]
        maximum = max(known_values, default=Decimal(0))
        scale_note = ('Linear scale from 0 to ' + display(maximum) +
                      '. Exact values appear beside each bar. Missing values have no bar.'
                      if known_values else 'No chart values supplied; no scale is established.')
        parts.append('<section class="panel"><h2>' + e(chart['title']) + '</h2><figure><figcaption>' +
                     e(chart['unit']) + ' · ' + e(scale_note) + '</figcaption><ul class="chart">')
        equivalent.append(chart['title'] + ' (' + chart['unit'] + '):')
        if not known_values:
            equivalent.append(scale_note)
        for point in chart['points']:
            parts.append('<li><div class="bar-label"><span>' + e(point['label']) + '</span><span>' +
                         e(point['value']) + ' ' + e(chart['unit']) + '</span></div>')
            if point['value'] is not None:
                with localcontext() as ctx:
                    ctx.prec = 50
                    width = Decimal(point['value']) / Decimal(maximum) * 100 if maximum else Decimal(0)
                parts.append('<div class="track" aria-hidden="true"><div class="bar" style="width:' +
                             format(width, '.6f') + '%"></div></div>')
            parts.append('</li>')
            equivalent.append(point['label'] + ': ' + display(point['value']) + ' ' + chart['unit'])
        parts.append('</ul></figure></section>')
    parts.append('<section class="panel"><h2>Result details</h2>')
    table = data['table']
    if table['rows']:
        parts.append('<div class="table-scroll" tabindex="0" role="region" aria-label="Result table"><table><caption>' +
                     e(data['scope']) + '</caption><thead><tr>' +
                     ''.join('<th scope="col">' + e(c) + '</th>' for c in table['columns']) + '</tr></thead><tbody>')
        for row in table['rows']:
            parts.append('<tr>' + ''.join(('<td class="number">' if numeric(c) else '<td>') +
                                          e(c) + '</td>' for c in row) + '</tr>')
        parts.append('</tbody></table></div>')
    else:
        parts.append('<p>' + e(status_note if state in ('empty', 'failed') else 'No detail rows supplied.') + '</p>')
    equivalent.append('Result details:')
    for row in table['rows']:
        equivalent.append('; '.join(f'{column}: {display(cell)}' for column, cell in zip(table['columns'], row)))
    parts.append('</section>')
    parts.append('<section class="panel"><h2>Notes and next steps</h2><ul>' +
                 ''.join('<li>' + e(n) + '</li>' for n in data['notes']) + '</ul></section>')
    equivalent.extend(['Notes and next steps:', *data['notes']])
    parts.append('<section class="panel" id="text-equivalent"><h2>Equivalent text response</h2><pre>' +
                 e('\n'.join(equivalent)) + '</pre></section>')
    parts.append('<footer>SuiteSkills alpha.6 · Shared layout · No external resources. Evidence labels describe the supplied input; the renderer does not verify its source.</footer></main></body></html>')
    return '\n'.join(parts)


def main():
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--output-dir', required=True, type=Path)
    args = parser.parse_args()
    try:
        rendered = render(load_json(args.input))
        publish_output(rendered, args.output, output_dir=args.output_dir, inputs=[args.input])
    except (ValueError, TypeError, KeyError, OSError, RecursionError, DecimalException) as error:
        print('Render refused: ' + str(error), file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
