#!/usr/bin/env python3
"""Offline, bounded SuiteSkills response delivery. Python 3.9+ standard library."""
import argparse
import csv
import html
import importlib.util
import io
import json
from decimal import Decimal, DecimalException, localcontext
from pathlib import Path
import re
import sys

# Loading the shared helper must not write __pycache__ into an installed package.
sys.dont_write_bytecode = True
DIRECTORY = Path(__file__).resolve().parent
VERSION = '0.6.1'
STATUS = {
    'complete': 'Complete within the stated scope.',
    'partial': 'Partial results; known values are not complete totals.',
    'empty': 'No matching results within the stated scope.',
    'failed': 'No result established; no totals or empty-result conclusion can be drawn.',
}
try:
    _spec = importlib.util.spec_from_file_location('suiteskills_legacy_renderer', DIRECTORY / 'render_response.py')
    legacy = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(legacy)
except (ImportError, OSError) as error:
    raise SystemExit('Delivery refused: required sibling render_response.py is unavailable: ' + str(error))


import sys as _output_sys
from pathlib import Path as _OutputPath
_output_sys.dont_write_bytecode = True
_output_sys.path.insert(0, str(_OutputPath(__file__).resolve().parents[2]))
from safe_output import publish as publish_output

def validate(data):
    """Apply the unchanged envelope contract and narrowly extend chart.type."""
    legacy.keys(data, legacy.REQUIRED, {'chart'})
    base = dict(data)
    chart = base.pop('chart', None)
    legacy.validate(base)
    if 'chart' not in data:
        return data
    legacy.keys(chart, {'title', 'unit', 'points'}, {'type'})
    kind = chart.get('type', 'bar')
    legacy.require(kind in ('bar', 'line'), 'Chart type must be bar or line')
    legacy.text(chart['title'], 200)
    legacy.text(chart['unit'], 100, allow_empty=True)
    legacy.bounded_list(chart['points'], 50)
    if data['state'] in ('empty', 'failed'):
        legacy.require(not chart['points'], 'Empty or failed responses cannot contain chart points')
    for point in chart['points']:
        legacy.keys(point, {'label', 'value'})
        legacy.text(point['label'], 200)
        legacy.scalar(point['value'])
        legacy.require(point['value'] is None or legacy.numeric(point['value']),
                       'Chart values must be finite numbers or null')
        if kind == 'bar':
            legacy.require(point['value'] is None or point['value'] >= 0,
                           'Bar values must be nonnegative')
    return data


def exact_json(value):
    """Encode bounded validated values without ever converting Decimal to float."""
    if value is None:
        return 'null'
    if legacy.numeric(value):
        return format(Decimal(value), 'f')
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, list):
        return '[' + ', '.join(exact_json(item) for item in value) + ']'
    if isinstance(value, dict):
        return '{' + ', '.join(exact_json(key) + ': ' + exact_json(item) for key, item in value.items()) + '}'
    raise ValueError('Unsupported JSON value')


def display_quantity(value, unit):
    """Display a measured value; a missing-value label is never a quantity."""
    shown = legacy.display(value)
    return shown if value is None or not unit else shown + ' ' + unit


def display_metric(metric):
    shown = display_quantity(metric['value'], metric['unit'])
    if metric['value'] is None and metric['unit']:
        return shown + ' (unit: ' + metric['unit'] + ')'
    return shown


def text_lines(data):
    """One readable equivalent shared by HTML and native Markdown delivery."""
    d = legacy.display
    lines = [data['title'], data['summary'], 'State: ' + data['state'],
             'Scope: ' + data['scope'],
             'As of: ' + (data['as_of'] if data['as_of'] is not None else 'Not supplied'),
             'Evidence: ' + data['evidence'], STATUS[data['state']], 'Metrics:']
    for metric in data['metrics']:
        lines.append(metric['label'] + ': ' + display_metric(metric))
    lines.extend(['Result details:', 'Columns: ' + '; '.join(data['table']['columns'])])
    for row in data['table']['rows']:
        lines.append('; '.join(column + ': ' + d(value) for column, value in zip(data['table']['columns'], row)))
    if 'chart' in data:
        chart = data['chart']
        lines.extend([chart['title'] + ' (' + chart['unit'] + '):', 'Chart type: ' + chart.get('type', 'bar')])
        lines.extend(point['label'] + ': ' + display_quantity(point['value'], chart['unit'])
                     for point in chart['points'])
    lines.extend(['Notes and next steps:', *data['notes']])
    return lines


def markdown(data):
    """Render a host-native response with a real, safely escaped Markdown table."""
    def escape(value, table_cell=False):
        value = html.escape(legacy.display(value), quote=False)
        value = value.replace('\r\n', '\n').replace('\r', '\n')
        value = re.sub(r'([\\`*_{}\[\]()#+!|>~=])', r'\\\1', value)
        value = re.sub(r'(?m)^(\s*)(-)(?=\s|$)', r'\1\\\2', value)
        value = re.sub(r'(?m)^([ \t]*)(-{2,})([ \t]*)$', r'\1\\\2\3', value)
        value = re.sub(r'(?m)^(\s*\d+)\.(?=\s)', r'\1\\.', value)
        return value.replace('\n', '<br>' if table_cell else '  \n')

    lines = [
        '# ' + escape(data['title']), '', escape(data['summary']), '',
        '- **State:** ' + escape(data['state']),
        '- **Scope:** ' + escape(data['scope']),
        '- **As of:** ' + escape(data['as_of'] if data['as_of'] is not None else 'Not supplied'),
        '- **Evidence:** ' + escape(data['evidence']), '', escape(STATUS[data['state']]), '',
        '## Metrics', '',
    ]
    lines.extend('- ' + escape(metric['label']) + ': ' + escape(display_metric(metric))
                 for metric in data['metrics'])
    lines.extend(['', '## Result details', ''])
    columns = data['table']['columns']
    lines.append('| ' + ' | '.join(escape(column, True) for column in columns) + ' |')
    lines.append('| ' + ' | '.join('---' for _ in columns) + ' |')
    for row in data['table']['rows']:
        lines.append('| ' + ' | '.join(escape(value, True) for value in row) + ' |')
    if not data['table']['rows']:
        lines.extend(['', escape(STATUS[data['state']] if data['state'] in ('empty', 'failed')
                                 else 'No detail rows supplied.')])
    if 'chart' in data:
        chart = data['chart']
        lines.extend(['', '## ' + escape(chart['title']), '',
                      '- **Unit:** ' + escape(chart['unit']),
                      '- **Chart type:** ' + escape(chart.get('type', 'bar')), ''])
        lines.extend('- ' + escape(point['label']) + ': ' +
                     escape(display_quantity(point['value'], chart['unit']))
                     for point in chart['points'])
        if not chart['points']:
            lines.append(escape('No chart values supplied; no scale is established.'))
    lines.extend(['', '## Notes and next steps', ''])
    lines.extend('- ' + escape(note) for note in data['notes'])
    return '\n'.join(lines) + '\n'


def csv_response(data):
    """Typed long-form CSV, with a metadata preamble before metric/result records."""
    stream = io.StringIO(newline='')
    writer = csv.writer(stream, lineterminator='\n')
    writer.writerow(['section', 'index', 'field', 'type', 'value', 'unit'])

    def safe(value):
        if not isinstance(value, str):
            return value
        if value and (value[0] in '\t\r\n' or value.lstrip().startswith(('=', '+', '-', '@'))):
            return "'" + value
        return value

    def row(section, index, field, value, unit=''):
        kind = 'null' if value is None else 'number' if legacy.numeric(value) else 'string'
        cell = '' if value is None else legacy.display(value)
        writer.writerow([safe(section), index, safe(field), kind,
                         cell if kind == 'number' else safe(cell), safe(unit)])

    row('metadata', '', 'format', 'SuiteSkills typed response CSV v1')
    for name in ('title', 'summary', 'state', 'scope', 'as_of', 'evidence'):
        row('metadata', '', name, data[name])
    row('metadata', '', 'state_explanation', STATUS[data['state']])
    for index, metric in enumerate(data['metrics']):
        row('metric', index, 'label', metric['label'])
        row('metric', index, 'value', metric['value'], metric['unit'])
    for index, column in enumerate(data['table']['columns']):
        row('table-column', index, 'label', column)
    for index, values in enumerate(data['table']['rows']):
        for column, value in zip(data['table']['columns'], values):
            row('table-cell', index, column, value)
    if 'chart' in data:
        chart = data['chart']
        for field in ('title', 'unit'):
            row('chart', '', field, chart[field])
        row('chart', '', 'type', chart.get('type', 'bar'))
        for index, point in enumerate(chart['points']):
            row('chart-point', index, 'label', point['label'])
            row('chart-point', index, 'value', point['value'], chart['unit'])
    for index, note in enumerate(data['notes']):
        row('note', index, 'text', note)
    return stream.getvalue()


def line_chart(chart):
    """Static SVG with ordered equal-spaced buckets and no line across nulls."""
    e = legacy.escaped
    known = [Decimal(point['value']) for point in chart['points'] if point['value'] is not None]
    description = 'Ordered buckets; equal spacing does not imply equal elapsed time. Nulls are gaps, not zero. Exact values follow the graph.'
    parts = ['<section class="panel"><h2>' + e(chart['title']) + '</h2><figure><figcaption>' +
             e(chart['unit']) + ' · ' + e(description) + '</figcaption>']
    if known:
        with localcontext() as context:
            context.prec = 60
            low, high = min(known), max(known)
            if low == high:
                padding = max(abs(low) / 10, Decimal(1))
                low, high = low - padding, high + padding
            parts.extend(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240" role="img" aria-labelledby="line-title line-description" style="display:block;width:100%;max-width:100%;height:auto">',
                          '<title id="line-title">' + e(chart['title']) + '</title>',
                          '<desc id="line-description">' + e(description + ' Range: ' + legacy.display(low) + ' to ' + legacy.display(high) + ' ' + chart['unit']) + '</desc>'])
            def y(value):
                return Decimal(216) - (value - low) / (high - low) * 192
            if low <= 0 <= high:
                zero_y = format(y(Decimal(0)), '.6f')
                parts.append('<line x1="24" x2="616" y1="' + zero_y + '" y2="' + zero_y + '" style="stroke:var(--muted);stroke-dasharray:4 4"/>')
            runs, current, circles = [], [], []
            count = len(chart['points'])
            for index, point in enumerate(chart['points']):
                if point['value'] is None:
                    if current:
                        runs.append(current)
                    current = []
                    continue
                x = Decimal(320) if count == 1 else Decimal(24) + Decimal(index) / (count - 1) * 592
                coords = (format(x, '.6f'), format(y(Decimal(point['value'])), '.6f'))
                current.append(','.join(coords))
                circles.append('<circle cx="' + coords[0] + '" cy="' + coords[1] + '" r="4" style="fill:var(--bar)"><title>' +
                               e(point['label'] + ': ' + legacy.display(point['value']) + ' ' + chart['unit']) + '</title></circle>')
            if current:
                runs.append(current)
            for run in runs:
                if len(run) >= 2:
                    parts.append('<polyline points="' + ' '.join(run) + '" fill="none" style="stroke:var(--bar);stroke-width:2"/>')
            parts.extend(circles)
            parts.append('</svg>')
        parts.append('<p>Linear value range: ' + e(low) + ' to ' + e(high) + ' ' + e(chart['unit']) + '.</p>')
    else:
        parts.append('<p>No chart values supplied; no scale is established.</p>')
    parts.append('<ul class="chart">')
    for point in chart['points']:
        parts.append('<li>' + e(point['label']) + ': ' + e(display_quantity(point['value'], chart['unit'])) + '</li>')
    parts.append('</ul></figure></section>')
    return '\n'.join(parts)


def html_response(data, directory):
    base = dict(data)
    chart = data.get('chart')
    if chart is not None:
        if chart.get('type', 'bar') == 'line':
            del base['chart']
        else:
            base['chart'] = {key: value for key, value in chart.items() if key != 'type'}
    rendered = legacy.render(base, directory)
    if chart is not None and chart.get('type', 'bar') == 'bar':
        for point in chart['points']:
            if point['value'] is None:
                old = ('<span>' + legacy.escaped(point['label']) + '</span><span>Not observed ' +
                       legacy.escaped(chart['unit']) + '</span>')
                new = '<span>' + legacy.escaped(point['label']) + '</span><span>Not observed</span>'
                rendered = rendered.replace(old, new, 1)
    if chart is not None and chart.get('type') == 'line':
        marker = '<section class="panel"><h2>Result details</h2>'
        rendered = rendered.replace(marker, line_chart(chart) + '\n' + marker, 1)
    start, tail = rendered.split('<pre>', 1)
    _, tail = tail.split('</pre>', 1)
    rendered = start + '<pre>' + html.escape('\n'.join(text_lines(data)), quote=True) + '</pre>' + tail
    # Match the renderer-owned footer only, never a user-supplied version string.
    rendered = rendered.replace('<footer>SuiteSkills alpha.6 ·', '<footer>SuiteSkills ' + VERSION + ' ·', 1)
    return rendered


def deliver(data, format_name, directory=None):
    validate(data)
    if format_name == 'html':
        return html_response(data, Path(directory) if directory else DIRECTORY.parent / 'design')
    if format_name == 'markdown':
        return markdown(data)
    if format_name == 'csv':
        return csv_response(data)
    if format_name == 'json':
        return exact_json(data) + '\n'
    raise ValueError('Unsupported output format')


def package_root():
    # Installed category helpers live deeper than the package itself. Protect all
    # categories by locating the manifest rather than guessing from folder depth.
    for ancestor in DIRECTORY.parents:
        if any((ancestor / marker / 'plugin.json').is_file() for marker in ('.claude-plugin', '.codex-plugin')):
            return ancestor
    return DIRECTORY.parent.parent


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--format', required=True, choices=('html', 'markdown', 'csv', 'json'))
    parser.add_argument('--output-dir', type=Path, required=True)
    args = parser.parse_args(argv)
    try:
        rendered = deliver(legacy.load_json(args.input), args.format).encode('utf-8')
        publish_output(rendered, args.output, output_dir=args.output_dir, inputs=[args.input])
    except (ValueError, TypeError, KeyError, OSError, RecursionError, DecimalException) as error:
        print('Delivery refused: ' + str(error), file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
