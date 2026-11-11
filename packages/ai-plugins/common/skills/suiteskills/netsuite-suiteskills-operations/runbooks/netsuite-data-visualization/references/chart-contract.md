# Deterministic supplied-data chart contract

The renderer implements bar, line, area, scatter, bubble, pie, donut, funnel, waterfall, stacked, combination, table, and KPI views. All charts use the same locally filtered row population as the exact-value table. Table cells retain source row indices when controls sort/filter; record references remain aligned to their original source cells.

The base closed contract validates source coverage, row grain, measure units, numeric/date types, references, bounded literal text and currency consistency first. `chart_contract.validate_chart(chart, columns_mapping, rows, source)` then validates each chart. No query, expression, formatter, callback, HTML, URL, arbitrary style, arbitrary color, conversion, grouping or aggregation options are accepted. Unknown fields and explicitly null optional fields fail validation. Supplied strings render through `textContent`; SVG paths and coordinates are deterministic renderer geometry.

Every chart requires exactly `type`, `title`, `x`, and `y`, plus only the optional/required fields listed below. `x`, `y`, size and interval coordinates name validated supplied columns. `y` is numeric. Numeric source columns use the kind/unit/currency contract from the base contract. There are 1–6 charts per model, at most 80 row-series marks per graphical chart, and at most four explicit series. Table charts retain the base 2,000-row bound.

| Type | Fields beyond the common four | Source constraints and behavior |
| --- | --- | --- |
| `bar` | Optional `series: [{"key":"qty","label":"Primary"}, ...]` | One bar per visible supplied row/series; grouped series share kind/unit/currency. |
| `line` | Same optional series shape as bar | Unique verified calendar dates in `x`; sorts plotted dates. Lines connect visible observed points without inferring missing dates. |
| `area` | Same optional series shape as bar | Same date/series constraints as line; translucent area extends to zero. Multiple series overlap rather than stack. |
| `scatter` | None | Unique numeric `x`; plots exact supplied coordinates. |
| `bubble` | Required `size: "size"` | Unique numeric `x`; supplied size must be a positive numeric count/quantity/number, not a ratio. Circle area is proportional to supplied size; filtering retains the original snapshot size scale. |
| `pie`, `donut` | None | Complete source population only, unique `x` labels, supplied `y` must be `kind: "ratio"` with `unit: "ratio"` totaling 1 or `unit: "percent"` totaling 100. No local shares are computed from counts. Filtering leaves omitted arcs blank in their original positions; it never renormalizes remaining shares. Zero supplied shares remain zero geometry and visible exact legend values. |
| `funnel` | None | Supplied source-order stages must be nonnegative and descending, with at least one positive value. Widths use the largest original supplied stage. Sorting the detail table does not change stage order. No conversion rates are inferred. |
| `waterfall` | Required `start: "start", end: "end"` | Supplied endpoints must use the same kind/unit/currency as `y`; `end - start` must match supplied `y`. Each source row starts at the preceding source row's supplied end. No running totals are calculated. Filtering does not recompute endpoints or reconnect omitted stages. Zero deltas with nonzero endpoints remain plotted. |
| `stacked` | Required `series: [{"key":"qty","label":"Primary","start":"start","end":"end"}, ...]` | Nonnegative supplied measures and supplied contiguous interval bounds, first start zero. Every interval and measure shares kind/unit/currency; `end - start` must match that supplied measure. Renderer plots these supplied bounds; it does not calculate series totals. |
| `combination` | Required `series: [{"key":"qty","label":"Primary","render":"bar"}, {"key":"other","label":"Secondary","render":"line"}, ...]` | Unique verified calendar dates in `x`, both bar and line series, one shared compatible unit axis. No dual axes. Bar widths account for uneven observed date intervals. |
| `table` | None | Points to the synchronized exact-value detail table; no separate row population. |
| `kpi` | None | Exactly one row from a complete supplied source aggregate. No local totals. |

For any explicit series, the first series key must equal the common `y`; keys must be distinct, all measure kinds/units/currencies identical, and labels are bounded literal text. No string-to-number coercion or missing-to-zero conversion is performed. Optional fields are type-specific; for example `size` is rejected on a bar, `render` is rejected on ordinary line series, and `start`/`end` are rejected on ordinary charts.

Validation compares supplied shares and interval relationships with Python `math.isclose(rel_tol=1e-12, abs_tol=1e-9)` to accommodate decimal floating point representation. This tolerance is a validation allowance; values in the exact table and tooltip are the original supplied values. Complete source coverage is mandatory for pie/donut and KPI. Other chart types may describe a partial/unknown population only when the base source contract marks it limited and includes limitations.

Magnitude charts whose plotted quantities are all zero show `All supplied values are zero; see the exact-value table.` and retain exact table rows. Scatter/bubble include numeric x/size when deciding whether positions carry information. An empty local filter displays an explicit no-rows message in every chart panel.

## Copy-ready chart definitions

These snippets replace a chart entry in an otherwise valid model whose named source columns are present; complete synthetic money and KPI models are in `examples/supplied-revenue.json` and `examples/supplied-kpis.json`.

```json
{"type":"area","title":"Observed movement by day","x":"day","y":"qty","series":[{"key":"qty","label":"Primary"},{"key":"other","label":"Secondary"}]}
```

```json
{"type":"bubble","title":"Observed movement and volume","x":"other","y":"qty","size":"size"}
```

```json
{"type":"waterfall","title":"Supplied movement intervals","x":"label","y":"qty","start":"start","end":"end"}
```

```json
{"type":"pie","title":"Supplied complete shares","x":"label","y":"share"}
```

```json
{"type":"stacked","title":"Supplied contiguous intervals","x":"label","y":"qty","series":[{"key":"qty","label":"Primary","start":"start","end":"end"},{"key":"other","label":"Secondary","start":"other_start","end":"other_end"}]}
```

```json
{"type":"combination","title":"Observed daily quantities","x":"day","y":"qty","series":[{"key":"qty","label":"Primary","render":"bar"},{"key":"other","label":"Secondary","render":"line"}]}
```

Axis/legend truncation for long labels is visual only; full literal text is retained in SVG titles and the exact-value detail table. Distinct fixed palette colors identify series; the legend also names source keys. Large horizontal/radial panels expand their viewBox to fit the allowed marks/legend rows. Color repetition in long radial lists does not remove exact legend labels. 
