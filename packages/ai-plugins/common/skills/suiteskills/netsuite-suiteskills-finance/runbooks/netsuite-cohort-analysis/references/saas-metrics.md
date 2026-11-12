# SaaS metrics for acquisition-month cohorts

Use this package-local reference for recurring-revenue definitions, movement interpretation, driver cuts, and data-quality checks in CFO acquisition-month cohort analysis. A cohort always groups customers by verified acquisition month; product, plan, pricing model, segment, and renewal window are cuts **within** those cohorts, not alternative cohort definitions.

## Metric definitions

| Metric | Definition | Interpretation |
|---|---|---|
| MRR | Monthly recurring subscription run-rate at the stated period end and source view | Excludes one-time services unless the governed metric explicitly includes them. |
| ARR | Ending MRR × 12 on the same scope, currency, and view | Annualized run-rate, not annual recognized revenue or a forecast. |
| New MRR | Recurring revenue outside the fixed beginning-customer base under the source definition | Excluded from GRR and NRR; classify a new subscription to an existing customer by the governed source and fixed-base rule. |
| Expansion / upsell | Increased recurring revenue from the fixed beginning-customer base | May reflect added seats, upgrades, cross-sell, price uplift, or higher committed usage; the cause requires evidence. |
| Downsell / contraction | Reduced recurring revenue from the fixed beginning base, as classified by the source | May reflect fewer seats, downgrade, discount, or lower committed usage; distinguish source classifications from inferred causes. |
| Churn | Recurring revenue lost through cancellation under the source definition | Verify the reporting unit and impact category; losing one subscription is not necessarily customer-logo churn. |
| GRR | (Beginning recurring base − downsell − churn) ÷ beginning recurring base | Retention before expansion; normally capped at 100%. |
| NRR | (Beginning recurring base + expansion − downsell − churn) ÷ beginning recurring base | Existing-base retention including expansion; can exceed 100%. |

Use MRR throughout a rate calculation or ARR throughout; multiplying all recurring amounts by 12 changes dollar presentation, not GRR or NRR. A zero or unverified beginning base makes the rate unavailable, not zero. Use a fixed beginning-customer population for each period, and never average monthly percentages to claim a quarter-length rate. The [cohort metric acquisition guide](subscription-metrics.md) supplies the NetSuite evidence path and period/weighted-rate methods.

## Live-data discipline

- Prefer the connected account's dedicated Subscription Metrics or SaaS Metric surface. Do not silently reconstruct MRR from invoices, bookings, or GL revenue; distinguish recurring run-rate from billings and recognized revenue.
- Establish completed period, source refresh, actual versus committed view, reporting level, organizational scope, currency, and FX method before comparing amounts. Do not convert already-converted tool output again or combine unlike currency bases.
- Do not hardcode account-specific subsidiary, item, customer, or currency assumptions. Treat incomplete current-month or forward-dated metric rows separately from completed actuals.
- Reconcile beginning balance plus classified movements, including New and documented adjustments, to ending balance for the whole population; use only fixed-base movements for GRR/NRR. Check duplicate Customer/Contract impact levels, source-line joins, and FX or period mismatch before accepting a derived rate.
- Label a directly governed rate separately from a derived rate. An unexplained balance gap, missing category, or partial cohort membership can prevent a defensible cohort rate or ranking.

## Interpretation and driver cuts

- High NRR with weak GRR means expansion offsets erosion of the starting base; stable GRR with falling NRR points first to weaker expansion. Neither pattern proves its commercial cause.
- Rank the absolute downsell and churn dollars as well as rates. A large beginning base or one customer can dominate portfolio loss even when the median cohort rate is steady; quantify the top customer's share before describing a broad cohort pattern.
- Investigate customer or parent account, product/item/plan, pricing model, segment, subsidiary/currency, contract term, renewal month, and movement reason **inside each acquisition-month cohort**. Use a declared as-of basis for attributes that can change over time.
- For customer churn or downsell, distinguish cancellation, seat or plan reduction, price change, usage change, and missing usage/import data when supported by source records. Do not assign a reason from the metric amount alone.

## Quality flags

Flag missing or conflicting acquisition month, pre-acquisition actual recurring activity, unlabeled or duplicate impacts, equal-and-opposite movements, missing item or plan attribution, zero churn despite known cancellations, stale or partial usage imports, FX-only movement, and material unexplained differences between recurring balances and impact totals. Report coverage and withhold unsupported cohort rankings instead of treating missing data as zero.
