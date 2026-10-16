# Sales performance evidence

Use this reference for authorized sales users' pipeline, forecast, quota, opportunity, estimate,
sales-activity, team-selling, or historical-metric questions. It supports evidence review and
decision making; it does not authorize sales-administration, forecast override, territory,
reassignment, quota, commission, report, KPI, or configuration changes.

## Contents

- [Select the right performance source](#select-the-right-performance-source)
- [Interpret forecast, pipeline, quota, and actuals](#interpret-forecast-pipeline-quota-and-actuals)
- [Feature-dependent evidence](#feature-dependent-evidence)
- [Standard report catalog](#standard-report-catalog)
- [Delivery and handoffs](#delivery-and-handoffs)

## Select the right performance source

For a selected Opportunity, Estimate, customer, activity, or employee/team context, resolve the
record and read it before retrieving a broader report. For a portfolio, period, quota, forecast,
trend, performance, or complete historical request, first list and run the accessible standard
report whose grain matches the question. Preserve its filters, period, fiscal configuration,
currency, subsidiary, team/rep scope, and result grain.

Use a report or saved search rather than reconstructing a governed forecast, pipeline, quota,
actuals, team contribution, or KPI from raw transactions. A dashboard KPI, report snapshot, or
Last Sales Activity SuiteApp value may be useful context only when the connector can retrieve its
underlying authorized source; do not claim the UI value was retrieved otherwise.

## Interpret forecast, pipeline, quota, and actuals

Establish the requested measure before answering:

- **Pipeline** is the accessible report's population/value of open deal evidence; it is not a
  forecast, quota, actual sales result, or probability of attainment.
- **Forecast** is the account-configured forecast calculation or approved seller/manager forecast
  value for its defined period and category. Do not replace it with an informal sum of opportunities.
- **Quota** is a configured goal. Compare it only with a compatible forecast or actual measure that
  shares period, subsidiary, class/department/location, rep/team, and currency scope.
- **Actuals** are reported completed sales evidence, not expected revenue or pipeline. Verify the
  report's transaction/date basis before comparison.

Standard Forecasting and Advanced Forecasting have different inclusion and category behavior. A
selected estimate or opportunity can affect a forecast based on current-account forecast settings,
expected-close-date treatment, inclusion settings, probability/category, related-estimate state,
and the report period. Do not infer eligibility from one visible date or field. When an estimate
and opportunity are related, validate which record and close date the governing report used before
explaining a discrepancy.

If Advanced Forecasting is enabled, categories and projected amounts are account-configured. Treat
labels such as worst case, most likely, upside, low, middle, or high as current-account terms—not
universal mappings. Do not create, edit, or override forecasts in this skill.

## Feature-dependent evidence

Only apply these branches after verifying the feature and relevant record/report scope in the
current account:

- **Team Selling:** a customer or transaction can use a sales team rather than a single sales-rep
  field. A contributor's forecast amount can reflect their contribution percentage. Never equate a
  team total with one rep's credit or commission without the applicable source.
- **Historical Metrics:** stored monthly/quarterly KPI snapshots retain historical amounts, not the
  later recalculated underlying transaction logic. State whether the requested comparison uses a
  snapshot or current report and do not call a historical variance a current-data correction.
- **Last Sales Activity SuiteApp:** when installed and accessible, it can surface latest sales
  activity and last marketing campaign context. It does not establish the full activity history,
  buyer intent, outreach quality, or campaign response semantics.

Sales rules, territory priority, automatic routing, mass reassignment, team setup, quota setup,
forecast configuration, and commissions are configuration or administration. The Sales Assistant
may report verified current context and requested-change implications without administration steps.
Do not treat territory assignment as proof of
ownership, and do not perform a mass reassignment.

## Standard report catalog

Oracle documents the following standard reports. Availability, permissions, customizations,
filters, fiscal treatment, and columns must be verified from the connected account. Use a summary
report for a governed portfolio answer and its detail counterpart only for a bounded drilldown.

### Forecast and quota

- Sales Forecast vs. Quota; Alt. Sales and Billings Forecast vs. Quota; Alt. Sales Forecast vs.
  Quota; and Billings Forecast vs. Quota.
- Forecast by Status Summary; Calculated Forecast by Sales Rep; Forecast by Sales Rep Summary and
  Detail; Alt. Sales Forecast by Sales Rep Summary and Detail.
- Forecast by Customer Summary and Detail; Forecast (Outstanding) by Customer Summary and Detail;
  Forecast by Item Summary and Detail.
- Forecast Accuracy; Forecast Accuracy (Alt. Sales); Calculated Forecast Accuracy; Calculated
  Forecast Accuracy (Alt. Sales).
- Forecast vs. Quota by Class, Department, and Location; plus Alt. Sales Forecast vs. Quota by
  Class, Department, and Location.

Use these for compatible forecast/quota, forecast-category, rep, customer, item, accuracy, or
organizational-segment questions. Do not convert forecast accuracy into an individual performance
judgment without approved company criteria.

### Opportunity and pipeline

- Opportunities to Close Detail; Opportunities Won; Opportunities Lost.
- Total Open Opportunities Summary and Detail.
- Pipeline by Customer Summary and Detail; Pipeline by Sales Rep Summary and Detail; Pipeline by
  Status Summary; Total Pipeline by Customer Summary and Detail; Total Pipeline by Sales Rep
  Summary; and Total Pipeline by Statuses Summary.
- Alt. Sales Pipeline by Sales Rep Summary and Detail; Alt. Sales Total Pipeline by Sales Rep
  Summary and Detail.

Use these for defined open/won/lost or pipeline populations. Confirm whether estimates, converted
opportunities, probability thresholds, related-record dates, or forecast configuration change the
population before comparing totals.

### Estimates and sales activity

- Estimates to Close; Total Open Estimates; Estimates Register; Open Estimates by Lines; and Open
  Estimates by Lines Detail.
- Sales Activity Summary and Detail; Sales Activity by Customer Summary and Detail; Sales Activity
  by Sales Rep Summary and Detail.

Use estimate reports for quote portfolio/expiry and open-estimate review, not as proof an estimate
was accepted or converted. Activity reports count recorded activities over their scope; they do not
prove customer engagement, quality of outreach, or a relationship to a selected opportunity unless
that relationship is retrieved.

### Customer, sales, team, and promotion context

- Customers by Sales Rep Summary and Customer by Sales Rep Detail; Customers by Territory Summary
  and Detail; Prospect Analysis Summary and Detail.
- Sales by Customer Summary and Detail; Sales by Item Summary and Detail; Sales by Sales Rep
  Summary and Detail; Sales by Sales Team Summary and Detail; Sales by Historical Team Summary and
  Detail; and Sales by Historical Team (Transaction Date) Summary and Detail.
- Sales Orders by Customer Summary and Detail; Sales Orders by Item Summary and Detail; Sales
  Orders by Sales Rep Detail; Sales Orders by Sales Team Summary; Sales Orders by Historical Team
  Summary and Detail; Sales Orders by Historical Team (Transaction Date) Summary and Detail; and
  Sales Orders by Promotion Code Summary and Detail.
- New Customer Sales Summary; New Customer Sales Orders Summary and Detail; Cost by Customer;
  Customer Profitability Summary and Detail; Customer Aging History; Sales by Promotion Code
  Detail; and Sales Orders by Partner Summary.

Use these only when their commercial/financial scope fits the question and the invoking role is
authorized. Do not substitute customer profitability, aging, cost, or promotion-code reports for a
finance decision, pricing approval, campaign-causality claim, or customer commitment.

## Delivery and handoffs

Lead with the verified measure and its source, then state population, period, fiscal/currency and
organizational scope, result grain, material exclusions, and the next safe decision. For a small
complete category set, pair an exact table with a compact chart when available. Do not chart an
inferred forecast, individual-performance judgment, or incomplete trend.

Route campaign attribution and campaign performance analysis to **NetSuite Marketing Campaign
Assistant**. Route pricing interpretation to **Pricing Policy and Exception Review** and finance
reporting, profitability, commissions, or accounting decisions to the authorized finance workflow.
Route sales-rule, territory, team, quota, forecast, or commission configuration to the authorized
sales-operations/administrator workflow.
