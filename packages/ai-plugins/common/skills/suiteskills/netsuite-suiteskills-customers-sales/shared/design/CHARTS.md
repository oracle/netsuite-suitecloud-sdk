# Shared Redwood Chart Notes

Use with the shared design guide and domain-specific evidence requirements.

## Palette and panel anatomy

Use the `--ns-series-*` tokens in order. The light palette is:

| Series | Color | Series | Color |
|---|---|---|---|
| 1 | #245D63 | 7 | #83401E |
| 2 | #D7790F | 8 | #9E7FCC |
| 3 | #31A09C | 9 | #A88E00 |
| 4 | #4E4137 | 10 | #58316E |
| 5 | #699E61 | 11 | #5999B5 |
| 6 | #B47282 | 12 | #317A45 |

Use series 1 for a single measure and series 2 for a deliberate highlight. Map a series consistently across the whole artifact. Never reorder colors for decoration. The dark theme supplies a separate mapping; read tokens at draw time. Additional categories need an explicit, disclosed grouping or a different chart; do not silently replace records with an Other bucket.

Use a bold panel title and a short description stating measure, unit/currency and scope. Use flat chart marks on the portlet surface, fine `--ns-grid` gridlines, neutral `--ns-chart-label` labels, and a visible baseline. Bars have square corners, start at zero for magnitude comparisons and retain exact values. Line charts may use a stated range; never imply missing periods were observed.

Use small square legend swatches with neutral text; place the legend below by default. Omit a redundant single-series legend when the description names the measure. Three or more line series should have labels, markers or distinct dashes. Never use a series color for small text. Select inside-fill text by measured contrast; the source suggests white on light-theme series 1, 4, 7, 10 and 12 and dark ink otherwise, but verify the actual combination and font size. Retain text/table equivalents and adequate boundaries for low-contrast marks.

## Select a chart by the question

| Question | Preferred treatment |
|---|---|
| Ordered time | Line; preserve order and null gaps |
| Compare or rank categories | Bar; horizontal for long names, sorted for ranking |
| Composition | Bar or donut for five or fewer meaningful parts |
| Composition over time | Stacked bar/area with explicit denominator |
| Actual versus target | KPI/delta, bullet or paired bar |
| Reconciled variance bridge | Waterfall with verified start, movements and end |
| Independent signed drivers | Diverging bars around zero; do not imply a reconciling bridge |
| Distribution | Histogram or box plot |
| Relationship | Scatter/bubble; bubble area represents magnitude |
| Retention | Cohort heatmap with labeled denominator |
| Genuine sequential stages | Funnel |
| Verified flow between states | Sankey with labeled nodes and values |
| Meaningful geographic comparison | Map with scope and units |

Avoid 3D, misleading dual axes, decorative charts and excessive donut slices. Distinct units need separate labeled axes or separate charts. Layout must not recalculate finance figures, risk classifications or business scope. Unknown is not zero; incompatible currencies/books/periods must not be silently combined.

## Implementation

Use CSS token references for SVG and read computed tokens for canvas. Draw canvas at 2x or greater when exporting, retaining its aspect ratio. Re-render on an actual theme change. Scope chart styles to the component; do not recolor labels with mark colors. Use DOM text nodes or context-appropriate escaping for every record-derived label; never copy unescaped HTML interpolation from an example.

The basic shared helper supports bar, line and variance; this list is not the capability limit of the plugin. More advanced renderers must preserve the same design, disclosure and data contracts. Verify chart/table totals and filter scope before delivery.

## Zero and missing values

When all available measures are zero or unknown, prefer a compact evidence matrix or labeled values over a decorative chart. If an applicable runbook requires HTML/export delivery, the matrix still belongs in that required artifact; this recommendation does not waive its gate or format. Do not manufacture an arbitrary numeric range to fill space. Missing values must not receive a bar length, area or position implying quantity; show a non-quantitative label outside the scale. Explicit zero remains a known zero. Preserve source links and scope using [links](../contracts/LINKS.md) and [evidence](../contracts/EVIDENCE.md).

Derive axes, labels and all filter-dependent takeaways from the displayed verified dataset. Do not leave a fixed narrative describing hidden areas after filtering. Preserve any intentionally fixed root-scope totals or limitations, clearly identified as such.
