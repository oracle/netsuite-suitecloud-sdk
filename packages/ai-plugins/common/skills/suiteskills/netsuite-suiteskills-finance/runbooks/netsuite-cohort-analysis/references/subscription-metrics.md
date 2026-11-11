# Cohort metric acquisition and reconciliation

Use the package-local [SaaS metrics reference](saas-metrics.md) for definitions, live-data discipline, driver cuts, and interpretation. This file adds the cohort-specific NetSuite evidence path. Neither file requires another skill at runtime.

## Define the acquisition-month cohort

An acquisition-month cohort contains customers first acquired in the same calendar month under the verified customer-level SaaS metric definition. Establish one stable acquisition month per customer or consistently defined parent and preserve it across observation months, product changes, and renewals. Verify whether `acquisitionmonthenddate` is customer-level or resets for a product, contract, or subscription. If it is not customer-level, derive the customer's first acquisition month only from complete authorized history; otherwise mark membership unavailable. Do not infer first acquisition from the earliest visible row of a partial extract.

NetSuite's Customer Acquisition Date can be entered manually, assigned from the first transaction if blank, or populated from the earliest start date of imported analytical impacts; changing it updates related reporting records. Thus a stable populated acquisition month is not independent proof of true first acquisition. Across the complete accessible actual recurring history, find customers with nonzero recurring balance or impact before their assigned acquisition month. Inspect those rows' actual status, source start date, first-transaction/import evidence, and customer/parent identity. Zero or non-actual pre-date rows alone do not invalidate membership. Meaningful actual pre-date activity is an unresolved membership conflict until an authoritative source rule explains it. Do not assume a migration or metric-enablement cause from timing alone.

Count and quantify conflicted members by affected month, then exclude them from **verified** cohort rates and ranks until resolved. Recompute on verified members with explicit coverage, or withhold the affected cohort if recomputation is not possible; do not present the original full-cohort amount with a footnote. Never move customers to a new month merely because the earliest visible row is earlier—partial extracts do not establish first acquisition. Keep validated customer-level loss/concentration and portfolio totals separately labeled when cohort attribution fails.

Product, item, plan, pricing model, segment, and renewal date may filter or explain acquisition-month cohorts; they do not define new cohorts. For a product question, retain acquisition month as the primary grouping and declare an as-of basis for changing attributes. For a renewal question, select validated in-window terms and attribute their customers and exposure back to acquisition month.

## Acquire the governed figure first

1. Inspect the connected account's dedicated Subscription Metrics or SaaS Metric Reporting tool definition and accessible surface. Establish its formula, period filter, acquisition-month membership, reporting level, currency/FX convention, refresh date, and Current or Committed view. Read GRR/NRR directly only when the rates use verified acquisition-month cohorts; a portfolio-only, product-only, or renewal-window rate is not a cohort rate. A native acquisition-cohort MRR heatmap is an acquisition-baseline MRR percentage, and previous-month logo retention is not GRR/NRR. Do not substitute a generic report catalog merely because it is callable.
2. If only underlying SaaS Metric records are exposed, inspect metadata and a bounded sample before depending on fields or joins. Candidate fields are `SaaSMetric.id`, `revenuemonthenddate`, `acquisitionmonthenddate`, `entity`, `subsidiary`, `beginningmrrbalance`, `endingmrrbalance`, `beginningarrbalance`, `endingarrbalance`, `linkedanalyticalimpact`; `SaaSMetricImpact.saasmetric`, `linkedanalyticalimpactevent`, `impactcategory`, `mrr`, `arr`; and `AnalyticalImpactEvent.id`, `impactlevel`. These are candidates, not a universal schema. An empty metadata `properties` object alone does not prove unavailability.
3. Resolve category and level values against account tables before filtering. Join impacts to the metric line and linked event in the same revenue month. Establish grain, distinct customers/sources, limits, and complete pagination. Reconcile a selected customer/period to the reported metric. Do not sum Customer and Contract impact events; the same commercial movement can appear at both levels with different classifications. Label a verified customer-level view separately if it does not match the governed KPI.

### Unverified acquisition-month fallback

Use the current SuiteQL metadata capability to verify acquisition-month fields and required relationships. A REST-only failure does not deny an independently supported query interface; an underlying data denial remains binding. If essential query schema is unavailable, stop the dependent query and report membership as unverified; do not probe guessed fields. Continue only independently supported governed-source work. After validated retrieval, check population coverage, stable customer membership and pre-acquisition actual activity before declaring any month assessable.
## Derive only when evidence supports it

- Fix the beginning-customer population for GRR/NRR; exclude New. For a multi-month rate use the governed period definition or a correctly scoped beginning base and changes through period end, not the average of monthly rates.
- Keep New, Upsell, Downsell, Churn, and No Impact separate. Reconcile the **whole-population balance** using beginning balance, all classified movements including New, and documented adjustments against ending balance; the **fixed-base retention bridge** excludes New. If totals appear to be a constant multiple of balance movement, investigate Customer versus Contract impact levels, duplicate joins/lines, adjustments, and FX/period basis. Never force a tie by scaling all impacts. An unexplained gap makes a derived rate unavailable, not zero.
- Compare derived rates and components with the governed figure at the matching period, level, scope, currency, and view. If they disagree, show the narrower supported facts and unresolved difference. State when a rate is derived rather than read directly.
- Before calling a metric balance exposure, verify recurring item type, source-line uniqueness, and current active contracted status. A committed-basis field alone does not establish activity. Future metric rows are not completed actuals.

## Logo retention and quarter-length rates

Use a governed logo rate only when customer identity, period, and cohort match. Otherwise, with a complete verified starting set of `L0` active customers or consistently defined parents, `logo retention = 100 × (starting logos still active at period end) / L0`. Count each once and exclude new logos. A customer losing one subscription while retaining another is not logo churn. State reactivation treatment if known; zero/incomplete starting population makes the rate unavailable.

To detect high logo retention with weak revenue retention, compare logo retention and GRR on the same fixed starting-customer cohort, period, scope, and view; show starting logos, lost logos, beginning ARR, customer downsell, and customer churn. Use approved materiality or rank absolute downsell and its share of beginning ARR; do not infer pricing as the cause.

For a quarter or other multi-month period, use a governed full-period rate when its basis is known. Otherwise fix the customer and logo population at the **start of the full period**, use their beginning recurring base and classified changes through period end, and reconcile. Do not average monthly retention rates or sum monthly churn counts.

## Monthly cohort trend and comparable pool

For a requested trend or lookback, use the requested completed month ends (up to the latest 12 when no length is specified). An ordinary retrospective question with no period uses the most recent complete period; inspect earlier months only as needed to support a comparison. Two comparable months establish a change, not persistence. Keep membership, reporting level, recurring unit, Current/Committed view, organizational scope, source currency, and FX treatment consistent. Calendar-month comparisons between cohorts of different ages are not age-normalized.

For each reconciled cohort-month with positive beginning base `B`, downsell `D`, churn `C`, and expansion `E`, `GRR = 100 × (B − D − C) / B` and `NRR = 100 × (B + E − D − C) / B`. New is excluded. Missing, zero-base, or unreconciled rates are unavailable, not zero; disclose excluded count and beginning-base amount where known.

Within one comparable currency/view/scope and month, `weighted GRR = 100 × (ΣB − ΣD − ΣC) / ΣB` and `weighted NRR = 100 × (ΣB + ΣE − ΣD − ΣC) / ΣB`. Do not average cohort percentages. Report median eligible cohort rates, eligible count, beginning base, gross loss `Σ(D + C)`, and expansion `ΣE` beside weighted rates.

For a same-cohort month-over-month claim, compare only cohorts with valid rates in both months; recompute each month's weighted rate and median on that matched set, with matched count, excluded count, and any coverage shift. Label an all-eligible monthly series as a changing population. Count cohorts with declining GRR/NRR and material customer concentration. Where enough history exists, compare acquisition cohorts at the same month-since-acquisition in a separate age-aligned view.

## Retention what-if versus forecast impact

Identify cohort, fixed-base metric (GRR, NRR, or logo), beginning ARR, baseline rate, horizon, currency, and whether “5% improvement” means five percentage points or 5% relative. If that changes a requested single figure, ask once or show both. A logo-rate increase cannot become ARR from average ARR per logo without verified customer-level assumptions.

For GRR, a `p` percentage-point gain gives `target = min(100%, baseline + p)`; a relative `r`% gain gives `target = min(100%, baseline × (1 + r/100))`. Incremental retained ARR is `beginning ARR × (target − baseline) / 100`. Cap historical illustration at verified gross loss; use an approved forward model's avoidable loss for a future horizon. For NRR, identify whether lift comes from lower loss or more expansion; do not call expansion retained ARR. Keep currencies separate and use no unsupported recovery probability.

These are illustrative recurring run-rate changes, not forecast or promised recovery. Report forecast impact only when an accessible approved forecast can be bridged or rerun with matching cohort, period, currency, timing, and assumptions; otherwise say it couldn't be checked.

## Separate renewal exposure from retention

Historical GRR/NRR and forward renewal-window ARR answer different questions. Use the package-local [renewal population guide](renewal-population.md): active source terms establish in-window eligibility, while the dedicated metric source supplies comparable recurring amounts through verified joins. Attribute validated exposure to acquisition month and keep unvalidated term clusters outside ranked totals. Draft, pending, stale-date, imported, or unmatched rows are candidates, not validated active renewal ARR.
