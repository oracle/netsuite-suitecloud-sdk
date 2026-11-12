# Pipeline insights and forecast workflows

Read only the section that matches the seller's request. For every portfolio-level request, first list and select from NetSuite's standard reports. All subsequent retrieval follows the main skill's report → saved-search → record → confirmed-SuiteQL order. Dashboard KPIs and report snapshots can be mentioned as NetSuite UI sources of additional context, but the current connector does not retrieve them. For a seller-requested custom calculation or view, follow the main skill's warning, validation recommendation, and assembled-custom labeling rules.

## Standard report selection

The report list is the discovery step; the examples below are NetSuite default reports, not an exhaustive catalog or a substitute for `ns_listAllReports`. When an accessible customer-specific custom report is purpose-built for the requested scope and its definition is clear, use it instead of a default report.

| Seller or manager question | Standard-report family to look for first |
|---|---|
| Open pipeline by owner | Pipeline by Sales Rep Summary or Detail |
| Open pipeline by account | Pipeline by Customer Summary or Detail |
| Opportunities currently expected to close | Opportunities to Close Summary or Detail |
| Won, lost, or still-open opportunity analysis | Opportunities Won, Opportunities Lost, or Total Open Opportunities reports |
| Estimate pipeline or quote activity | Estimates to Close, Total Open Estimates, Estimates Register, or Open Estimates by Lines reports |
| Forecast, quota, actuals, or attainment | Sales Forecast vs. Quota; use an Alternate Sales Amount or Billings variant only when that account feature is enabled |
| Forecast accuracy over prior periods | Forecast Accuracy or Calculated Forecast Accuracy; use an Alternate Sales Amount variant only when enabled |
| Why a forecast includes particular transactions, or why it differs from pipeline | Forecast by Sales Rep Detail; use the returned transaction detail and report definition rather than reconstructing its calculation |
| Forecast contribution by customer, item, or status | Forecast by Customer, Forecast by Item, or Forecast by Status reports |

Tell the seller that dashboard KPIs and report snapshots may offer a concise account-configured view in the NetSuite UI when more context is needed; do not claim the assistant retrieved them. Use a saved search when the report list does not provide the needed slice, such as a custom win/loss-reason or competitor analysis. Use the returned report/search fields and definitions, rather than reproducing the example filters or grouping logic in this skill.

## Daily prioritization

Confirm that “my” means the invoking seller's accessible scope. List standard reports first and use an appropriate daily-activity, opportunity, or pipeline report if available; otherwise use a saved search. Prioritize only from retrieved evidence, such as overdue activity, a past expected close date, a close date within the agreed horizon, an upcoming activity, or an explicit source alert.

Return a short ordered list with the evidence supporting each priority, overdue/time-sensitive follow-ups, and seller choices. Do not label a deal “at risk” unless that measure is returned by an approved source; otherwise describe the observable condition.

## Pipeline review

Use this mode for a portfolio-level view of health, coverage, stage movement, and exceptions. It is not a substitute for a deal-by-deal inspection or a forecast review. Establish whether the requester is a sales representative reviewing their own scope or an authorized sales manager reviewing a team; then establish owner/team, review horizon or fiscal period, and subsidiary/currency scope. Use the selected source's fiscal-period definitions; do not substitute calendar assumptions.

Start by listing NetSuite reports and run the suitable pipeline or forecast report. Use another approved NetSuite source only when the report does not answer the question. Use scoped record reads only to clarify a small number of opportunities returned by that source. Show only returned measures, such as stage/status label, amount, expected close date, owner, probability, source aggregates, and report-defined conversion/velocity/coverage measures. Resolve stage/status labels live; do not hardcode codes, stage order, probability mappings, conversion calculations, or coverage targets.

Separate verified pipeline facts, objective attention items, and questions for the seller. A past close date, missing retrieved future activity, or report flag is not proof that a deal is lost or poorly managed.

### Decision-support outputs

Generate the requested artifact when the seller asks for it and the host environment supports that artifact type:

- **Pipeline Performance Workbook** — organize the selected NetSuite report and any necessary approved supporting results; include scope, refresh/as-of date, and a data-source note. Use tables for full values; do not manufacture or reimplement stage conversion, velocity, risk, quota, coverage, forecast, or KPI calculations.
- **Interactive Dashboard** — an interactive sales-pipeline view that helps a seller or manager understand current performance, where deals are slowing, and what requires attention. Clearly show scope, fiscal period, currency, data source, and whether each visualization is source-reported or a display of returned values. When it includes forecast information, label calculated versus override values and the reported forecast category. It is a presentation of governed NetSuite data, not a replacement for NetSuite governance.

Before generating any artifact, confirm or state the owner/team, time horizon or fiscal period, subsidiary/currency scope, data source, and as-of date. Label every artifact as either **report-backed presentation** (it presents one governed NetSuite result without altering its calculation) or **assembled custom view** (it combines, groups, or calculates source data beyond a native report). For an assembled custom view, state the source reports/searches and calculation logic, warn that it can differ from governed NetSuite reporting, recommend validation against the relevant NetSuite report, KPI, or saved search, and do not describe it as a NetSuite dashboard, KPI, or report. Never include placeholder, dummy, sample, synthetic, or invented account data; omit unavailable sections or identify their specific data gap. Never include unrestricted source exports or unnecessary PII. If an artifact type is unavailable in the current assistant environment, provide the verified data in a clearly structured response and identify the unavailable format.

### Pipeline Performance Workbook request-family coverage

Design the workbook to support seller request families, not merely a fixed list of prompts or metrics. Its default sheets should support daily prioritization and overdue follow-ups; pipeline health and review preparation; bottleneck, exception, and hygiene review; source-supported coverage/performance review; and approved forecast interpretation distinct from pipeline facts.

Include coverage, quota/actual, stage conversion, velocity, forecast confidence, or source-defined risk only when the selected report/search provides that measure or the account has approved its calculation and definition. When the workbook cannot answer a question because the relevant source or scope is unavailable, state that limitation rather than supplying an inferred answer.

For a quota-versus-actual view, use an approved report/search that provides both measures. Do not estimate quota, attainment, or coverage from opportunity amounts.

## Deal inspection and coaching

Use this mode for a small, seller- or manager-selected set of opportunities. It examines the evidence and the help needed on each deal; it does not replace the portfolio pipeline review or make a forecast commitment.

Resolve the opportunity and retrieve the minimum metadata-confirmed facts needed for the review. Apply the account's stage-exit criteria only when a current accessible NetSuite report, saved search, or record field supplies them, or when the seller provides the applicable account policy in the current conversation. State the source and criterion. If no accessible account-specific criterion exists, say it cannot be verified; do not substitute a generic sales methodology, downgrade the stage, or block a seller action.

Classify the next-step record using only retrieved evidence:

- **No recorded future activity** — no retrieved future task, event, or other agreed activity under the review definition.
- **Dated internal next action** — a retrieved future activity with an owner and date, without evidence that the customer has confirmed it.
- **Customer-confirmed next step** — only when a distinct account field reports confirmation or the current seller explicitly confirms it. Do not infer customer commitment from the existence of a task, a proposed date, or free-text activity alone.

Use the selected report/search and the exception rules below to identify attention conditions. Discuss stage evidence, next-step quality, and missing information with questions for the seller; do not convert a missing criterion or a recorded activity into proof of customer intent or deal outcome.

### Deal Risk & Coaching Plan

Generate this plan for a small, seller- or manager-agreed number of selected opportunities. For each deal, include:

- verified attention condition and supporting source evidence;
- current deal facts relevant to the review;
- applicable account-defined stage criterion, or the statement that it cannot be verified;
- next-step classification and any missing evidence to confirm;
- seller questions and suggested 1:1 talk tracks; and
- seller- or manager-supplied support requested and a potential owner, without assigning work or inventing a blocker.

Include the review scope, source, and as-of date. Do not infer customer intent, criticize seller performance, promise outcomes, generate placeholder data, or create follow-up work through this skill; provide a human follow-up proposal instead.

## Exception review

Confirm owner/team, review horizon, subsidiary/currency scope, and what “no next step” means for this review. For a portfolio-level exception review, list reports first and then use an existing exception/pipeline/activity report or focused opportunity/task saved search. For a named opportunity, start with the scoped record or activity lookup. Use metadata-confirmed scoped reads only when needed to clarify selected results.

Classify only objective conditions: a past expected close date on a retrieved non-terminal opportunity; no retrieved future task/activity under the agreed definition; a source-reported change to expected close date; report-defined time in stage or age beyond an account-defined threshold; or an explicit source alert. Present the source, condition, and relevant dates/activity. Do not calculate stage aging, infer why a date changed, decide a deal is stale, or close it automatically.

## Forecast explanation

Establish whether the requester is a sales representative or authorized sales manager, then establish the approved forecast/report source, owner/team, fiscal period, subsidiary, and currency scope. Start by listing and selecting a standard forecast report. Determine from the source or accessible configuration whether the view is calculated or overridden; uses Standard or Advanced Forecasting; includes weighted amounts, estimates, or multiple projected amounts; and applies Team Selling allocation where relevant. Run the report that supplies the requested measure. Use a saved search only when no suitable report answers it. Compare periods or revisions only if the source supplies both values. For contributor detail, use report detail/drilldown where available; otherwise retrieve only the few records required to explain the returned result.

State the source and scope. Separate reported forecast facts, reported pipeline facts, and interpretation limits. Do not calculate a forecast, commit, confidence judgment, or deal-close likelihood from activity, stage, probability, or seller commentary by default. If the seller explicitly requests a custom forecast or other custom calculation after the NetSuite report and saved-search paths, warn that the result can differ from governed NetSuite forecasting; identify its sources and logic; recommend validation against the relevant NetSuite reports, KPIs, or saved searches; and label it an **assembled custom view** or **custom calculation**. Do not create or override a forecast through this skill. If the reporting source or accessible account configuration does not establish how opportunities/estimates are included, weighted, categorized, or allocated, say that the treatment cannot be verified.

When a report supplies **Historical Metrics**, it can support a change-over-time explanation. Identify it as a saved monthly or quarterly KPI snapshot, not a retroactively recalculated historical result. Do not infer a period change when the report does not supply comparable values.

For manager views, explain only source-returned behavior: a manager's override can supersede a rep's displayed forecast, team-level overrides may not be visible to individual reps, and scope may be separated by subsidiary. A newly created opportunity can appear in the sales-rep forecast before it appears in a manager forecast. Do not treat this timing difference as a missing deal or modify a forecast to resolve it.
