# Visuals for bill lifecycle analysis

Use the visualization capability actually available in the host. Read its own
instructions before using it. Inline widgets are preferred when supported;
otherwise use a native chart, a self-contained artifact, or a readable Markdown
table. Do not assume a particular widget tool, chart API, or `sendPrompt` hook.

Keep the metric definition, period/date basis, as-of date, coverage, sample count
and key numeric results in response text. Visual-only results are harder to
verify and may not be visible to evaluators or accessible clients.

| Question | Useful visual |
|---|---|
| Typical days-to-pay | Median/mean/count plus a day-count distribution |
| Trend | Mean or median by the stated bill/payment month; count on each point |
| Vendor or approver outliers | Ordered horizontal bars with bill counts and a disclosed sample threshold |
| Terms compliance | Within-terms/late counts or signed days versus due date |
| Aging | Amount by age bucket, one currency per series/view |
| Lifecycle stages | Stage durations only where corresponding event dates exist |

Controls may filter a retrieved snapshot, change a benchmark, or switch between
first and final payment **only when both datasets and cohort definitions exist**.
Compute each mean from bill-level days or full sums/counts, never from displayed
rounded averages. A threshold slider labels an analytical benchmark, not policy.

Show sample sizes, units, date basis, missing data and coverage. Never produce a
mixed-currency amount tile; split by currency or omit the amount. Distinguish an
empty cohort from unavailable data. Use words with colors and readable labels.

Drill-down buttons must preserve metric, date basis, scope and as-of assumptions.
If the host has no supported follow-up hook, offer copyable prompt text. State
that a widget uses the retrieved snapshot; it does not query NetSuite, change
records or keep itself fresh. A live-refresh dashboard is a separate request,
not an excuse to embed credentials or invoke external APIs from the artifact.
