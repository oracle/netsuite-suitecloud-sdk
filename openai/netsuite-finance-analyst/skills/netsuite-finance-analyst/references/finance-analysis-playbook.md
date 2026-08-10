# Finance Analysis Playbook

Use this reference when the request is about financial statements, KPIs, variance analysis,
cash interpretation, or executive finance narrative.

## Statement Priority

- Income statement: revenue, COGS, gross profit, operating expenses, EBITDA, net income
- Balance sheet: assets, liabilities, equity, working capital, liquidity
- Cash flow: operating, investing, financing, free cash flow
- Budget versus actual: variance dollars, variance percent, favorable or unfavorable
- AR or AP aging: aging buckets, DSO, DPO, overdue exposure

## Report Selection Logic

- P&L, revenue, expenses, or margins:
  Use an Income Statement variant first.
- Assets, liabilities, equity, or working capital:
  Use a Balance Sheet variant first.
- Cash, burn, liquidity, or runway:
  Use a Cash Flow report first, then balance sheet cash detail.
- Budget, forecast, or plan versus actual:
  Use a Budget versus Actual or Budget Overview report first.
- Overdue invoices, collections, or DSO:
  Use AR Aging and look for saved searches with custom aging views.
- Open bills, vendor exposure, or payment timing:
  Use AP Aging.

## GAAP Presentation Reminders

### Income Statement

- Present revenue, cost of revenue, gross profit, operating expenses, operating income,
  other income or expense, tax, and net income.
- Clearly label non-GAAP measures and reconcile them to GAAP.
- Do not treat extraordinary items as a valid GAAP category.

### Balance Sheet

- Present AR net of allowance where applicable.
- Present PP&E net of accumulated depreciation.
- Separate current and non-current debt, leases, and deferred revenue.
- Keep equity components distinct when material.

### Cash Flow

- Use the indirect method unless the source clearly provides another basis.
- Tie net income to operating cash flow.
- Tie ending cash to the balance sheet before presenting board-ready output.

## KPI Defaults

### Income Statement KPIs

- Gross margin percent = gross profit / revenue
- Operating margin percent = operating income / revenue
- EBITDA margin percent = EBITDA / revenue
- Revenue growth percent = current period change / prior period
- R&D percent of revenue = R&D / revenue
- Sales and marketing percent of revenue = S and M / revenue

### Balance Sheet KPIs

- Current ratio = current assets / current liabilities
- Quick ratio = cash plus AR / current liabilities
- Working capital = current assets minus current liabilities
- DSO = gross AR / trailing 3-month average revenue per day
- DPO = gross AP / trailing 3-month average COGS per day

### Cash Flow KPIs

- Free cash flow = operating cash flow minus capex
- Burn rate = monthly net cash outflow
- Cash coverage = cash / monthly operating expense
- Rule of 40 = revenue growth percent plus free cash flow margin percent

## Variance Analysis Method

### Classification

- Favorable for revenue when actual is above plan.
- Favorable for expense when actual is below plan.
- Material when the variance exceeds the configured percentage or dollar threshold.
- Escalate even below thresholds if a pattern indicates churn, pricing pressure,
  a control break, or repeated deterioration across periods.

### Driver Decomposition

- Revenue or COGS:
  Separate price effect and volume effect when the data supports it.
- Compensation:
  Separate headcount, rate, mix, timing, and attrition effects.
- Operating expenses:
  Separate headcount-driven, volume-driven, discretionary, contractual, one-time,
  and timing or phasing effects.

## Narrative Template

Use this when the user asks for a summary, analysis, commentary, or report:

```text
Headline: [line item or company result] with the key variance or KPI
Performance: 2-3 sentences on what went well with numbers
Risks: 1-2 sentences on what needs attention now
Outlook: one sentence on the next visible trend
Action: what should happen next | owner | by when
```

## Preliminary Data Rules

- If the period is open, say the result is preliminary.
- State what is still missing if known, such as payroll, revenue recognition, accruals,
  or FX revaluation.
- Lower confidence when major close tasks are not complete.
- Include a confidence level when data may be incomplete:
  - High: closed period, reconciled data.
  - Medium: open period with known gaps.
  - Low: missing, inconsistent, or partial data.
- State what is driving the confidence level.

## Anomaly Rules

Before escalating an anomaly, check whether it is explained by:

- known seasonality
- a documented one-time item
- a reclassification with an offset elsewhere

Escalate when you find:

- revenue contraction beyond normal seasonality
- gross margin compression
- unusual expense spikes
- a worsening aging profile
- low runway or liquidity stress
- unbalanced intercompany activity
- stale reconciling items
- large undocumented journal entries
- suspense balances or missing dimensional coding
