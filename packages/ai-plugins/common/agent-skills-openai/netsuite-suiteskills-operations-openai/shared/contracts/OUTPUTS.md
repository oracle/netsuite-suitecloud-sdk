# Shared response delivery

Use this reference when using the bundled response renderer or interpreting its exports. For other supported output methods, preserve the same privacy, accuracy, presentation and evidence requirements. Apply the owning category's SafeWords, as described in [BASELINE](BASELINE.md): minimize and redact sensitive data before composing any envelope or preview. A requested report or export authorizes its local output and necessary staging files; explain destination, scope and material overwrite effects when relevant. Conversational text drafts need no file. Renderer validation does not establish confidentiality or authorization. The schema and limits below apply to this helper, not every skill or output. When using it, create the envelope from actual evidence, then invoke:

```sh
python3 /installed/plugin/shared/rendering/deliver_response.py --output-dir /absolute/existing/output-directory /work/input.json /work/output.html --format html
```

Replace the illustrated paths with actual absolute paths. Supported formats: html, markdown, csv and json. The helper runs locally and makes no account calls. Its evidence label is supplied by the runbook, not independently verified by rendering.

## Result envelope

Required top-level fields are exactly `title`, `summary`, `state`, `scope`, `as_of`, `evidence`, `metrics`, `table`, and `notes`. The optional top-level field is `chart`; `table.row_links` is also supported inside the table object. Unknown fields at every object level, duplicate JSON keys, booleans, nonfinite numbers, malformed JSON, and oversized inputs are refused before output creation.

| Field | Accepted content |
| --- | --- |
| `title`, `summary`, `scope` | Nonblank text, at most 2,000 characters each |
| `state` | `complete`, `partial`, `empty`, `blocked`, or `failed`; complete is only within stated scope |
| `as_of` | Nonblank text at most 200 characters, or JSON null; supplied time is not independently verified |
| `evidence` | `synthetic` or `observed`; synthetic remains visible in every format |
| `metrics` | Up to 12 objects, each with exactly `label` (nonblank text, 200), `value` (scalar), and `unit` (text, 100, may be empty) |
| `table` | `columns` (1–12 unique nonblank text labels, 200 each) and `rows` (up to 200 arrays matching column count), with optional aligned `row_links` |
| `notes` | Up to 30 nonblank strings, at most 2,000 characters each |
| `chart` | Exactly `title` (nonblank text, 200), `unit` (text, 100, may be empty), `points` (up to 50), and optionally `type` |
| chart point | Exactly `label` (nonblank text, 200) and `value` (finite number or null) |
| `chart.type` | `bar`, `line`, or `variance`; omitted means `bar` |

Scalars are strings up to 2,000 characters (including empty), JSON null, or finite JSON numbers of absolute value at most `1e24` and decimal exponent no smaller than `-12`. JSON numeric tokens are parsed as `Decimal`; no binary floating-point conversion occurs. Scientific notation is accepted within those bounds. Numerical value precision survives all formats. JSON may normalize numeric notation, and text/CSV presentation may remove insignificant trailing fractional zeroes; this is not byte-for-byte source serialization. Null is unknown/not observed, distinct from observed zero and from an empty string. Text control characters other than tab, newline, and carriage return are refused.

An `empty`, `blocked` or `failed` envelope must contain no table rows or chart points. Blocked and failed metrics must be null. Blocked means a required evidence/input gate is unmet; failed means retrieval/execution did not establish a result. `partial` must never be described as a complete total. Bar points must be nonnegative. Line and variance points may be signed. Chart numeric strings such as `"123"`, formula strings, nonfinite values, and booleans are refused. Chart titles and labels are ordinary escaped text; markup never becomes active HTML.

## Format choice

Follow the user's explicit format choice and use the runbook's default when helpful. Other supported formats and renderers are available choices; this helper's four formats are not an exclusive list. Preserve shared style, accessibility, privacy and meaning in any alternative. Conversational Markdown needs no helper or envelope. HTML is a static artifact with equivalent text; Markdown, CSV and JSON contain no rendered graph. Text/data-only requests override a runbook's chart default without changing facts or scope.

- **HTML:** shared styling, scope/state/evidence, metrics, table, notes and optional bar/line/variance chart. No external assets or scripts.
- **Markdown:** escaped detail table, metrics and chart values. Metadata and chart context use separate list items. Host display must be checked separately.
- **CSV:** this helper emits a typed response export, not a conventional rectangular table. Read [CSV format](../rendering/CSV-FORMAT.md) when using this helper; use an appropriate safe exporter for a conventional business-data CSV.
- **JSON:** validated envelope preserving numeric precision, ordering, nulls and optional fields. No inserted provenance claims.

Line points retain input order with equal bucket spacing; do not imply elapsed-time spacing or infer missing periods. Nulls create gaps; zero is a known value. Charts require a meaningful verified population and units. Preserve signed values in lines; bars require nonnegative values. Do not invent totals, periods or a scale from all-null data. Provide exact values and equivalent text. Missing numeric values display as Not observed, with units in their metric/column context.

## Delivery and failure

Use absolute paths and an existing output directory outside the installed plugin. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions. Invalid input, unsafe values or missing dependencies fail without creating an output. Do not bypass validation or manufacture fixture data after a failed account call. If files or visuals cannot be produced on the host, give an equivalent factual text answer and identify the unavailable format.

## Verified row links and signed drivers

Before supplying links, follow [LINKS](LINKS.md). `table.row_links` has exactly one item per row, either null (plain text) or exactly `{label, url, source}`. The source reference must already occur as an exact string cell in the corresponding row. Label is nonblank text up to 200 characters; source up to 500; URL up to 2,000. Only absolute HTTPS URLs with a valid host, no credentials, no nonstandard port, no whitespace, backslashes or encoded control characters pass syntax validation. Unsupported fields including `verified` are refused. Producer evidence establishes the link, never a boolean or renderer success. HTML/Markdown make validated supplied destinations clickable; text, CSV and JSON preserve the URL and source. Absent destinations stay plain text.

Use `variance` for independent signed driver bars around zero, with exact values and null labels. Use `line` only for an ordered trend. Values retain their sign; a missing value never acquires a bar. Negative values are not permitted in legacy `bar` charts.

At most 200 rows and 50 chart points fit one envelope. If the qualified dataset is larger, use another suitable supported export/renderer, split it into labeled parts, or agree a narrower scope when appropriate. Preserve the requested complete data when available; do not silently narrow the request to fit this helper. Display omitted row counts and the effect on totals; do not silently truncate or claim the subset is complete. Summary figures must explain whether they cover all qualified data or only displayed rows.

## Artifact security

Treat every record-derived label as untrusted text. HTML output must escape text and attribute contexts or use DOM text nodes, and safely serialize any data embedded inside script elements. Do not use unescaped innerHTML interpolation. Use the packaged local project renderer for its dashboards; do not restore older source templates or external chart/font dependencies. Alternative renderers must preserve these protections. No account-action buttons or callbacks may be generated. A local interactive sort/filter is allowed.

## Conventional CSV export safety

For a requested business-table CSV, use the shared `safe_csv.py` serializer with a JSON object containing `columns` (nonempty unique strings) and `rows` (arrays of text, finite numbers or null). Resolve the helper through the root shared folder; run locally, saving a new file outside the installed plugin. All record-derived strings stay strings, including numeric-looking names. The serializer prefixes dangerous formula-leading text, including whitespace/control and full-width variants; trusted calculated numeric values stay numeric. Include scope, time, units and coverage in columns or an accompanying note. Null is not zero; use an explicit display label if blank would be ambiguous.

An equivalent exporter must preserve these protections; ordinary CSV quoting alone is insufficient. Never strip safety prefixes before spreadsheet use. Spreadsheet interpretation, locale and save/reopen behavior need separate client testing; no universal safety claim is made. The typed response CSV remains a separate supported format.

## Shared Redwood presentation

All product-owned output uses the [shared Redwood design](../design/DESIGN-GUIDE.md): light page, flat portlets, Ocean header, system fonts, consistent chart series and explicit evidence states. The static HTML helper uses system fonts and a CSS accent; its restrictive CSP denies scripts and network resources. Charts precede supporting detail. Native conversation remains host-styled. The supported output formats and evidence schema above are unchanged; PDF/PPT export belongs to a renderer that actually implements and tests it.

## Evidence, navigation and concise delivery

Apply [evidence and scope](EVIDENCE.md) and [links](LINKS.md) when composing the output. Keep source identity, scope, time and link provenance with working evidence without adding unsupported envelope keys. This schema describes `shared/rendering/deliver_response.py`; the inherited account-context helper is a different interface and does not support row_links. Inspect its actual capabilities before use. The legacy render_response.py is not the complete delivery interface.

For an empty result, preserve the empty state and zero detail rows. A supported report/search link can accompany the artifact as an actual Markdown hyperlink or appear in a suitable separately rendered evidence section. Do not inject HTML into escaped notes or fabricate rows. A supporting-evidence table in another valid response is permissible only when explicitly identified as evidence metadata, not transaction results.

Before delivery, inspect actual hyperlinks, their row/source association, fragment targets and control behavior. Check output and filters against the same qualified data. Confirm safe escaping and meaningful plain-text fallbacks. Distinguish local mechanics from live destination access; do not claim links were opened if they were not. Apply [dashboard checks](../design/DASHBOARDS.md) to interactive output and exports. Deliver the file link with a short statement of what it answers and any material limitation; detailed QA belongs in requested review material.

## Domain presentation precedence

Use the user's requested format and the domain's required facts and verification gates. Common chart, artifact and renderer preferences are defaults, not a requirement to generate a file for every answer. A concise native text/Markdown result needs no helper envelope. If a renderer/widget is unavailable, provide equivalent supported facts in text and disclose the missing presentation capability. Do not substitute invented data to complete a visual. Preserve required Finance Analyst handoffs and final/preliminary status for financial visuals. Suggested follow-ups never imply execution before a user selects them.

## Optional review detail

Use the [fixed review view](../rendering/REVIEW-VIEW.md) only when it serves the requested output. Preserve existing graphics, verified links, specialized exports and permitted fallbacks; the new detail view does not replace them.
