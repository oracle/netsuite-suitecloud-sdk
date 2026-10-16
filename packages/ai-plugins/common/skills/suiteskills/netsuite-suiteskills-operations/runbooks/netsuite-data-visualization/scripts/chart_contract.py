"""Closed deterministic chart geometry, after the base row/column/source contract.

No expressions, renderer hooks, URLs, transformations, inferred totals, or styles.
Optional coordinates must already be supplied source columns. This module must
only be called after all source rows and typed columns have passed base validation.
"""
import math

TYPES = ('bar', 'line', 'scatter', 'table', 'kpi', 'area', 'pie', 'donut',
         'funnel', 'waterfall', 'bubble', 'stacked', 'combination')


def _shape(value, required, optional=()):
    if not isinstance(value, dict) or set(value) - set(required) - set(optional) or set(required) - set(value):
        raise ValueError('Unsupported or missing chart fields')


def _text(value, finance_pattern):
    if not isinstance(value, str) or not value.strip() or len(value) > 160 or any(
            (ord(c) < 32 and c not in '\n\t') or 0xD800 <= ord(c) <= 0xDFFF for c in value):
        raise ValueError('Expected bounded literal chart text')
    if finance_pattern.search(value):
        raise ValueError('Actual verified Finance Analyst handoff unavailable; no financial output')


def _close(a, b):
    return math.isclose(a, b, rel_tol=1e-12, abs_tol=1e-9)


def validate_chart(chart, columns, rows, source, finance_pattern):
    """Validate one chart against already validated columns/rows; never mutate."""
    _shape(chart, ('type', 'title', 'x', 'y'), ('series', 'size', 'start', 'end'))
    kind = chart['type']
    if not isinstance(kind, str) or kind not in TYPES:
        raise ValueError('Unsupported chart type')
    _text(chart['title'], finance_pattern)
    allowed = {'bar': {'series'}, 'line': {'series'}, 'area': {'series'},
               'combination': {'series'}, 'stacked': {'series'}, 'bubble': {'size'},
               'waterfall': {'start', 'end'}}.get(kind, set())
    if set(chart) - {'type', 'title', 'x', 'y'} - allowed:
        raise ValueError('Optional field does not apply to this chart type')

    def column(key, numeric=False, compatible=None):
        if not isinstance(key, str) or key not in columns:
            raise ValueError('Unknown chart column')
        c = columns[key]
        if numeric and c['type'] != 'number':
            raise ValueError('Numeric chart column required')
        if compatible is not None and any(c.get(k) != compatible.get(k) for k in ('kind', 'unit', 'currency')):
            raise ValueError('Series and intervals must share measure kind, unit and currency')
        return c

    xc = column(chart['x']); yc = column(chart['y'], numeric=True)
    if kind in ('line', 'area', 'combination') and xc['type'] != 'date':
        raise ValueError('Line/area/combination x-axis requires verified calendar dates')
    if kind in ('scatter', 'bubble') and xc['type'] != 'number':
        raise ValueError('Scatter/bubble x-axis must be numeric')
    if kind in ('line', 'area', 'combination', 'scatter', 'bubble', 'pie', 'donut'):
        if len({r[chart['x']] for r in rows}) != len(rows):
            raise ValueError('Duplicate x positions require separate source series or explicit unique labels')
    if kind == 'kpi' and (len(rows) != 1 or source['completeness'] != 'complete'):
        raise ValueError('KPI requires one verified complete source aggregate; no local totals')

    series = chart.get('series')
    if 'series' in chart:
        if not isinstance(series, list) or not 1 <= len(series) <= 4:
            raise ValueError('One to four explicit series required')
        seen = set()
        for entry in series:
            required = ('key', 'label', 'start', 'end') if kind == 'stacked' else ('key', 'label', 'render') if kind == 'combination' else ('key', 'label')
            _shape(entry, required)
            column(entry['key'], numeric=True, compatible=yc)
            if entry['key'] in seen: raise ValueError('Duplicate series key')
            seen.add(entry['key']); _text(entry['label'], finance_pattern)
            if kind == 'combination' and entry['render'] not in ('bar', 'line'):
                raise ValueError('Combination series render must be bar or line')
            if kind == 'stacked':
                for k in ('start', 'end'): column(entry[k], numeric=True, compatible=yc)
        if series[0]['key'] != chart['y']:
            raise ValueError('Primary y must be the first explicit series')
        if kind == 'combination' and {e['render'] for e in series} != {'bar', 'line'}:
            raise ValueError('Combination requires both bar and line series on the same unit axis')
    elif kind in ('stacked', 'combination'):
        raise ValueError('Explicit series required')
    mark_count = len(rows) * (len(series) if series else 1)
    if kind != 'table' and mark_count > 80:
        raise ValueError('Use a table or smaller explicit snapshot above 80 chart marks')

    if kind in ('pie', 'donut'):
        if yc['kind'] != 'ratio' or yc['unit'] not in ('ratio', 'percent') or source['completeness'] != 'complete':
            raise ValueError('Pie/donut requires complete supplied shares, never locally calculated shares')
        denominator = 100 if yc['unit'] == 'percent' else 1
        values = [r[chart['y']] for r in rows]
        if not values or any(v < 0 or v > denominator for v in values) or not _close(math.fsum(values), denominator):
            raise ValueError('Complete supplied shares must equal 1 ratio or 100 percent')
    if kind == 'bubble':
        if 'size' not in chart: raise ValueError('Bubble requires supplied positive size column')
        sc = column(chart['size'], numeric=True)
        if sc['kind'] == 'ratio' or any(r[chart['size']] <= 0 for r in rows):
            raise ValueError('Bubble size must be positive non-ratio quantities or counts')
    if kind == 'funnel':
        values = [r[chart['y']] for r in rows]
        if not values or not any(v > 0 for v in values) or any(v < 0 for v in values) or any(a < b for a, b in zip(values, values[1:])):
            raise ValueError('Funnel requires supplied nonnegative descending source-order stages')
    if kind == 'waterfall':
        if 'start' not in chart or 'end' not in chart:
            raise ValueError('Waterfall requires supplied start/end columns; no inferred running total')
        for k in ('start', 'end'): column(chart[k], numeric=True, compatible=yc)
        for i, r in enumerate(rows):
            if not _close(r[chart['end']] - r[chart['start']], r[chart['y']]):
                raise ValueError('Waterfall start/end difference must match supplied measure')
            if i and not _close(rows[i-1][chart['end']], r[chart['start']]):
                raise ValueError('Waterfall steps must be contiguous in source order')
    if kind == 'stacked':
        for r in rows:
            previous_end = 0
            for entry in series:
                start, end, value = r[entry['start']], r[entry['end']], r[entry['key']]
                if value < 0 or not _close(start, previous_end) or not _close(end-start, value):
                    raise ValueError('Stacked intervals require nonnegative supplied contiguous bounds from zero')
                previous_end = end
