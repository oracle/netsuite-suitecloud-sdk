# Financial input contract — correctness/security patch, 14 October 2026

The builder consumes reconciled evidence, never retrieves NetSuite data or proves
host authorization. Use the JSON structure in ../examples/financial-input-synthetic.json
as a synthetic schema example, never live evidence. Legacy inputs require migration.

Required envelope: scope, sources, currency (verified three-letter code),
accountingBook, period, revenueBasis, coverage, projects, unbilled and aging.
Supply actual source revenue meaning; never infer billing/recognition from a label.
Render a separate artifact for each compatible currency/book/period group.

coverage.profitability and coverage.unbilled each contain state
(complete|partial|unavailable), a nonempty note and sourceRefs. Notes must disclose
actual population/pagination/permission limitations. Unavailable stages have no
factual rows. Complete is permitted only for a verified exhausted declared source
population. Partial may display observed rows/subtotals but cannot certify completeness.

Projects: distinct stable id, name, customer, grain=project, revenue, hasCost,
cost (finite number if known, otherwise null), currency/accountingBook/period
matching the envelope and nonempty sourceRefs from the profitability stage.
Do not use a name prefix as proof of project identity. Duplicate IDs and customer-
grain project rows are rejected; joins and project identity must be verified upstream.

Unbilled: distinct stable id, name, grain=project|customer, finite amount,
matching currency/accountingBook/period and stage sourceRefs. Preserve actual
reported grain. Amounts are source observations, not severity classifications.

Aging: state, nonempty note, ISO date asOf, sourceRefs and rows. Each row has
id, name, grain=project|customer, finite overdue, currency matching the envelope,
and sourceRefs from the aging stage. Its cutoff is separate from the profit period.
No rows on an unavailable stage. Only complete coverage with no positive overdue
rows supports a no-overdue statement; partial/unavailable empty sources remain unknown.

Optional unbilledThreshold: amount (finite, nonnegative), currency matching the
envelope and nonempty reviewed basis. Without it no severity threshold is inferred.

No raw HTML or JavaScript input. All names/notes are text nodes; JSON is embedded
inertly with markup delimiters escaped. Numbers/Boolean cost flags and arithmetic
must remain finite. The CSP authorizes only the trusted fixed renderer. Use the
builder, not manual template edits. Output creation remains exclusive in a private
existing directory. All external-system mutations remain prohibited.

## Population non-overlap

The producer must establish a disjoint unbilled population before using a subtotal. A customer total and its constituent project balances are not additive; unique row IDs or one declared grain do not prove disjointness.

Optional `unbilledAggregation` has `state: verified_disjoint|unavailable` and a nonempty `note`. Missing aggregation evidence defaults to unavailable. For `verified_disjoint`, also supply a nonempty `populationNamespace` and nonempty `sourceRefs` drawn from the unbilled stage. Every unbilled row then requires nonempty `populationKeys`: source-backed identifiers for **all underlying atomic members** in that row, under the same verified namespace and compatible snapshot/scope. The renderer rejects repeated keys inside a row and overlap between rows.

Keys must come from an established underlying source relationship, with complete membership for each row. A project ID, customer ID, row ID, label, invented key or model-written proof flag is not a substitute for atomic membership. Retain the real source mapping/receipt outside the renderer input. If source summaries cannot supply the mapping, use unavailable aggregation and show separate observations. The renderer checks supplied consistency, not truth, source completeness or permissions.

Signed amounts are retained. A disjoint partial set may have an **observed subtotal**, never a complete total. An empty partial source stays unavailable; zero is permitted only for a declared complete empty population with verified aggregation evidence. Keep null/missing source evidence unknown.

`unbilledSummary` is renderer-owned output (`state`, numeric-or-null `value`, `note`). It is recomputed and cannot be supplied to override the gate. The browser uses only this calculated value and displays all individual observations, including zero and negative amounts. No unchecked sum is rendered.
