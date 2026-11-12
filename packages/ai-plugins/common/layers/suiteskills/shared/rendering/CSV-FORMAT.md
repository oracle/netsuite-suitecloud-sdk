# CSV response export

Read when producing or interpreting this bundled helper's CSV format. Its typed response export is one format, not the required format for every CSV request. A conventional rectangular business-data CSV can use another supported exporter with correct escaping, formula-injection protection, and clear null/zero/currency semantics. The helper applies the encoding; do not hand-assemble or strip safety prefixes.

## CSV v1 schema and safety

Every record has six columns: `section,index,field,type,value,unit`. The initial `metadata` records are the preamble: format identifier, title, summary, state, scope, as_of, evidence, and state explanation. Indices are zero-based. Subsequent sections are:

| Section | Meaning |
| --- | --- |
| `metric` | Two records per metric index: label and value; the value record carries the unit |
| `table-column` | One label record per column index, retained even when the table has no rows |
| `table-cell` | One record per cell; index is the row index and field is its column label |
| `chart` | Title, unit, and effective type (`bar` when omitted in the input) |
| `chart-point` | Label and value records per point index; value record carries the chart unit |
| `note` | One text record per note index |

`type` is `string`, `number`, or `null`. A null has an empty value cell with type `null`; an empty string has an empty cell with type `string`; zero is `number,0`. Literal text `null` remains type `string`. Consumers must use the type column, rather than treating every empty CSV cell as missing. Numeric cells use exact decimal text without formula prefixes. Spreadsheet software may reformat or round numeric text on import; JSON or a Decimal-aware CSV consumer is the precision-preserving downstream choice.

All text cells, including labels, metadata, notes, and units, receive a leading apostrophe if they begin with tab/CR/LF or if their first non-whitespace character is `=`, `+`, `-`, or `@`. Standard CSV quoting handles embedded quotes, commas, and newlines. The apostrophe is a deliberate safety transformation to the stored text. Remove it only in a controlled text importer after interpreting this documented rule; do not strip it before opening the file in a spreadsheet. A legitimate negative numeric cell remains numeric and is not prefixed. The CSV is not claimed to be a lossless byte-for-byte text round trip; JSON is the authoritative envelope export.

## Linked detail rows

Optional `table-link` records use the same zero-based index as `table-cell`. Their fields are `label`, `url`, and `source`; absent row links emit typed null values. These records preserve supplied link provenance without certifying access or authenticity. The `blocked` state retains null metrics and no result rows. Signed `variance` chart points preserve negative, zero and null values.

## Conventional CSV export safety

For a requested business-table CSV, use the shared `safe_csv.py` serializer with a JSON object containing `columns` (nonempty unique strings) and `rows` (arrays of text, finite numbers or null). Resolve the helper through the root shared folder; run locally, saving a new file outside the installed plugin. All record-derived strings stay strings, including numeric-looking names. The serializer prefixes dangerous formula-leading text, including whitespace/control and full-width variants; trusted calculated numeric values stay numeric. Include scope, time, units and coverage in columns or an accompanying note. Null is not zero; use an explicit display label if blank would be ambiguous.

An equivalent exporter must preserve these protections; ordinary CSV quoting alone is insufficient. Never strip safety prefixes before spreadsheet use. Spreadsheet interpretation, locale and save/reopen behavior need separate client testing; no universal safety claim is made. The typed response CSV remains a separate supported format.
