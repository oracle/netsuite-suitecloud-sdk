# Renewal-window population and coverage

Read this only for a requested forward renewal window or a signal that depends on renewal timing. The window filters customers or terms inside customer-acquisition-month cohorts; it never defines a new cohort. Metric rows supply recurring-value evidence; current source terms establish who is in the window. A metric balance and end date alone do not prove an active renewal.

## Detect mechanisms before counting exposure

1. Inventory accessible recurring-source mechanisms and counts once for the requested scope. Where exposed, group analytical-impact sources by source-record type, status, and end-date presence; then check source records. Subscriptions, sales-order terms, renewal automation, memorized templates, imported history, and account-specific mechanisms may coexist. Zero in one mechanism is not zero for the book.
2. Enumerate current status values for each concrete source type before choosing active terms. Verify that its end date is the requested term-end date; a notice deadline is a different population. Validate active status, in-window end date, customer/scope, and unique term identity on current records. Draft, pending, expired, or inactive terms do not become open exposure from old positive metrics.
3. Identify renewal evidence for each mechanism. Inspect supported auto-renewal and next-start fields for subscriptions, renewal-chain or automation fields for orders, and current template scheduling for memorized orders when accessible. Verify predecessor/successor link direction from field definitions or source records: a backward link proves history, not a future successor. No match is not proof of nonrenewal.
4. Inspect metadata and permissions before relying on fields/joins. Use bounded, complete pagination with known grain: distinct customers, terms, subscriptions/orders, and source lines are different counts. If a mechanism is inaccessible, label coverage partial rather than silently substituting the ones that returned rows.

## Value and coverage reconciliation

- Join each validated active term to the dedicated SaaS metric source by a verified relationship and same period, basis, currency, and scope. Active term determines membership; metric source determines comparable recurring amount. Check item type and source-line duplication. If only contractual rate is known, show it separately as a candidate, not validated metric ARR or an additive component.
- Reconcile counts by mechanism: active in-window terms, distinct customers, metric-matched terms, unmatched active terms, and metric candidates without verified active sources. Identify imported/stale rows separately. Ensure pagination is complete and each term counted once despite multiple items or impact rows.
- Attribute validated exposure to each customer's verified acquisition month; sum only one recurring unit, basis, and currency with validated membership. If acquisition month, conversion, de-duplication, or cross-mechanism join is unresolved, report separate candidate subtotals and affected counts, not ranked exposure or a full portfolio total. Near-identical terms on one billing account require source/line uniqueness checks.
- Keep open exposure separate from observed churn/downsell and actual expansion. Auto-renewal or known successor is scheduling state, not proof of retained revenue; end date without successor is a planning exception, not churn probability.

Report mechanisms, coverage counts, data-through date, and exact limitation behind omissions. Empty metrics, metadata failure, or denied access does not prove that a mechanism has no customers.
