# Project Onboarding

Use this reference the first time the skill runs in a new project, or whenever
memory does not contain a valid Project Profile.

The goal of onboarding is to discover the customer's NetSuite environment once,
display the findings as a Profile Card that the customer validates conversationally,
and persist a small set of durable facts to memory. Every subsequent
conversation reads those facts and skips rediscovery.

The customer never edits a file. Onboarding is a 10- to 15-minute conversation,
not a configuration form.

## When to Trigger

Run onboarding when any of the following is true:

- The Project Profile is not present in memory.
- The customer explicitly asks to re-onboard, refresh the profile, or update
  what the skill knows about their environment.
- More than 90 days have passed since the last Profile validation.
- The customer mentions a structural change (new subsidiary, new book, new
  module, materiality reset, controller change).

If none of these are true, skip onboarding and operate from the cached profile.

## Discovery Is Mandatory, Not Advisory

When the trigger conditions above are met, discovery runs BEFORE any
deliverable. This is the single most important rule in this file.

Do:

- Run the discovery probes first, then build the requested deliverable from
  the results. Discovery and the deliverable can run in the same turn — both
  can happen as parallel tool calls.
- Render the Profile Card alongside the first artifact and ask for validation
  in the same turn.
- Probe fiscal calendar, currency, modules, and period status from data.

Do not:

- Skip discovery because the customer asked for a specific deliverable. A
  request for a CFO dashboard is not a license to skip the fiscal calendar
  probe and default to calendar quarters.
- Use phrases like "I'd normally run discovery but let me take a pragmatic
  path" or "since you asked for a specific deliverable I'll skip the probes."
  These are failure modes. The pragmatic path is to run discovery in parallel
  with the deliverable, not to skip it.
- Ask the customer for fiscal year start month, fiscal calendar, base
  currency, module status, period close timing, subsidiary list, or any other
  fact that can be probed from data. Probe it.
- Treat clarifying questions to the customer as a substitute for discovery
  probes. The customer is the validator, not the data source.

Legitimate user-input questions during onboarding are narrow:

- Customer-defined preferences (comparison period choice, materiality
  override, narrative tone, primary user role).
- Genuinely ambiguous scope when multi-sub is detected (single subsidiary vs
  consolidated for this request).

Everything else comes from probes.

## Discovery Probe Sequence

Run these probes in order. Each is a single MCP call. Capture the result for
the Profile Card. If a probe fails, record the failure mode and continue.

### Probe 0: Fiscal Calendar

This probe runs first and determines what "Q1" means for every other probe
and deliverable in this project.

```sql
SELECT periodname, startdate, enddate, isquarter, isyear, closed
FROM accountingperiod
WHERE isyear = 'T'
ORDER BY startdate DESC
FETCH FIRST 3 ROWS ONLY
```

If the `accountingperiod` table is not queryable on the MCP endpoint, fall
back to transaction-density inference:

```sql
SELECT TO_CHAR(trandate, 'YYYY-MM') AS yyyy_mm,
       COUNT(*) AS posted_count
FROM transaction
WHERE posting = 'T'
  AND trandate >= ADD_MONTHS(CURRENT_DATE, -18)
GROUP BY TO_CHAR(trandate, 'YYYY-MM')
ORDER BY yyyy_mm
```

A fiscal year boundary often appears as a noticeable density change between
consecutive months. The first month after a sparse month is a candidate for
fiscal year start.

Extract: fiscal year start month, current quarter date range, period status
(open/closed) for the most recent four periods.

Critical: Do not ask the customer for fiscal year start month. Probe it. If
both the table and the inference fail, surface "fiscal calendar unverified"
honestly in the Profile Card and ask the customer to state the fiscal year
start month directly — that is the only legitimate user-input fallback.

### Probe 1: Entity Structure

```sql
SELECT s.id, s.name AS sub_name, s.country, c.symbol AS currency,
       s.iselimination
FROM subsidiary s
LEFT JOIN currency c ON s.currency = c.id
WHERE s.isinactive = 'F'
ORDER BY s.id
```

Extract: subsidiary count (excluding elimination subs), country mix, currency
mix, multi-sub flag.

### Probe 2: Accounting Books

```sql
SELECT DISTINCT accountingbook
FROM transactionaccountingline
WHERE ROWNUM <= 50
```

The `accountingbook` table is not queryable on the NetSuite MCP endpoint.
Use this inferential probe instead. Extract: distinct book IDs, multi-book flag.

### Probe 3: Module Detection

Three parallel one-line queries:

```sql
-- Rev rec module
SELECT COUNT(*) AS revrec_records
FROM transaction
WHERE recordtype = 'revenuearrangement'

-- Fixed assets module
SELECT COUNT(DISTINCT id) AS fa_accounts
FROM account
WHERE LOWER(fullname) LIKE '%depreciation%'
   OR LOWER(fullname) LIKE '%fixed asset%'
   OR LOWER(fullname) LIKE '%right-of-use%'

-- Approval workflow detection across the six common record types
SELECT recordtype,
       COUNT(*) AS total,
       SUM(CASE WHEN approvalstatus IS NULL THEN 1 ELSE 0 END) AS null_approval
FROM transaction
WHERE recordtype IN ('invoice','vendorbill','journalentry','expensereport',
                     'salesorder','purchaseorder')
  AND trandate >= ADD_MONTHS(CURRENT_DATE, -12)
GROUP BY recordtype
ORDER BY recordtype
```

Extract: rev rec on/off (revrec_records > 0), fixed assets on/off
(fa_accounts > 0), and a per-record-type approval workflow flag (workflow is
ON for a record type only if more than 80% of recent transactions have a
non-null approvalstatus).

### Probe 4: TTM Revenue and Tier

```sql
SELECT SUM(t.foreigntotal) AS ttm_revenue,
       COUNT(DISTINCT t.entity) AS active_customers
FROM transaction t
WHERE t.recordtype = 'invoice'
  AND t.posting = 'T'
  AND t.trandate >= ADD_MONTHS(CURRENT_DATE, -12)
  AND t.trandate <= CURRENT_DATE
```

Extract: TTM revenue, active customer count. Derive the materiality tier:

- TTM revenue under 25M USD: small tier, materiality floor 10K, scale 2 percent
- TTM revenue 25M to 500M USD: midsize tier, floor 25K, scale 1 percent
- TTM revenue over 500M USD: enterprise tier, floor 250K, scale 0.5 percent

The materiality dollar threshold is the larger of the floor and the scale
applied to TTM revenue. The customer can override this in conversation.

### Probe 5: Top Counterparty Concentration

```sql
SELECT c.companyname AS customer,
       SUM(t.foreigntotal) AS ttm_revenue
FROM transaction t
JOIN customer c ON t.entity = c.id
WHERE t.recordtype = 'invoice'
  AND t.posting = 'T'
  AND t.trandate >= ADD_MONTHS(CURRENT_DATE, -12)
GROUP BY c.companyname
ORDER BY ttm_revenue DESC
FETCH FIRST 5 ROWS ONLY
```

Extract: top 5 customers, top 3 concentration as a percentage of TTM. Capture
this as a baseline so subsequent conversations can flag drift.

### Probe 6: Saved Search Inventory

Call `ns_listSavedSearches` once per relevant keyword cluster. Standard
clusters to probe:

- `aging` — for AR and AP aging operational views
- `close` — for period close task lists, days-to-close metrics
- `profitability` — for customer or project margin views
- `budget` — for budget vs actual operational views
- `reconciliation` — for subledger and bank reconciliation views
- `top customers` and `top vendors` — for concentration tracking

Map each returned search to its functional role in the saved-search registry.
If a cluster returns no results, record that fact so subsequent SuiteQL
fallbacks are used without re-probing.

### Probe 7: Period Maturity

```sql
SELECT TO_CHAR(trandate, 'YYYY-MM') AS period,
       COUNT(*) AS posted_txns,
       MAX(trandate) AS latest_in_period
FROM transaction
WHERE posting = 'T'
  AND trandate >= ADD_MONTHS(CURRENT_DATE, -6)
GROUP BY TO_CHAR(trandate, 'YYYY-MM')
ORDER BY period DESC
```

The `accountingperiod` table is not queryable on the NetSuite MCP endpoint.
Use posted-transaction activity to infer the most recent closed period (the
month before the current calendar month, with full posting activity) and the
current open period (the calendar month with partial activity).

### Probe 8: Chart of Accounts Character

```sql
SELECT accttype, COUNT(*) AS account_count
FROM account
WHERE isinactive = 'F'
GROUP BY accttype
```

Extract: total account count, depth signal (flat versus deep). For midsize
and enterprise tiers, also probe top-level account hierarchy.

Note: this MCP endpoint rejects `ORDER BY` on computed aggregate columns
within a `GROUP BY` query. Sort in post-processing instead of in the query.

### Probe 9: Sign Convention Check

The NetSuite report API consistently returns balance sheet detail-line
amounts with inverted signs versus subtotals. SuiteQL on
`transactionaccountingline` does not reconcile to the balance sheet report
for cash positions because of FX translation entries that post outside the
bank account hierarchy.

This is a universal NetSuite quirk, not an account-specific one. Capture as
a fixed rule in the profile rather than re-probing:

- For financial statement positions (cash, AR, AP, equity, deferred revenue):
  Use the standard reports and read from `summaryLineValues`, not detail lines.
- For operational and transactional analysis (top customers, aging, variance
  drivers, unposted activity): Use SuiteQL or saved searches.
- Never mix the two sources in a single tie-out without an explicit
  reconciliation step.

### Probe 10: Customer-Stated Context

Ask the customer four short questions in plain English:

1. Who is the primary user of this AI assistant: controller, CFO, FP&A lead,
   or other?
2. What does your typical close calendar look like: days to soft close, days
   to hard close?
3. Are there any account or process quirks I should know about that aren't
   obvious from the data?
4. Any standing analyses you want me to run by default at month end?

Capture answers verbatim in the profile.

## Standing Checks Catalog

Discovery determines which standing checks apply for this customer. Add them
to the profile, run them on every dashboard, and disclose materiality on
every flag.

| Check | Runs When | Surfaces | Materiality Basis |
| --- | --- | --- | --- |
| 6360 catch-all threshold | Always | Miscellaneous expense exceeding floor | 1% of TTM revenue |
| AR / AP balance vs operational view | Always | Balance sheet net balance vs SuiteQL open invoices / bills; aging buckets surfaced | BS-to-operational ratio > 5x, or any aging bucket above floor |
| Deferred revenue waterfall | Rev rec module detected (Probe 3) | Deferred-to-AR ratio, scheduled releases vs actual recognition | Deferred balance > 30 days of revenue |
| Customer concentration drift | Always | Top-3 percent of revenue, current quarter vs TTM baseline | Drift > 5 points from baseline |
| FX exposure | Multi-currency detected (Probe 1) | CTA balance, unposted revaluation, natural hedge ratio | Any unposted FX entries or CTA = 0 with material foreign cash |
| Intercompany reconciliation | Multi-subsidiary detected (Probe 1) | IC AR vs IC AP elimination tie-out | Net non-zero balance |
| Undeposited funds | Always | Open balance approaching close | Operational floor ($25K) |

The AR / AP balance vs operational view check is critical and easy to miss.
NetSuite balance sheet reports net payments against invoices; SuiteQL on
`transactionline` does not. When the two views diverge materially, the cause
is one of: payments not applied, historical invoices that should have been
written off, or a real reconciliation issue. The dashboard must surface the
gap, not paper over it.

## The Profile Card

Render the discovery results inline as a single card with these sections:

- Entity: subsidiary count, currencies, fiscal year start month
- Modules detected: rev rec, fixed assets, approval workflow scope
- Materiality scale: tier, floor, percent, derived dollar threshold
- Saved searches mapped: count by functional role
- Concentration baseline: top three customers and their combined percent
- Period maturity: most recent closed, current open
- Standing checks: the list of monthly hygiene checks the skill will run
  unprompted based on the modules detected
- Customer-stated context: the four answers from Probe 10

End the card with a validation prompt:

> Does this match your understanding? Say "looks good" to lock it in, or
> tell me what to change in plain English.

## Memory Write Protocol

After the customer validates the profile, write the following facts to memory
using the available memory tool. Keep entries concise and each under 500
characters.

Required entries:

1. Entity shape: sub count, books, currencies, fiscal calendar
2. Module flags: rev rec, fixed assets, approval workflow per record type
3. Materiality tier and threshold
4. Saved search registry: a mapping from functional role to saved search ID
5. Concentration baseline: top 3 customer percent at onboarding date
6. Standing checks list
7. Customer-stated context: role, close calendar, quirks, standing analyses
8. Quirk rules: report-versus-SuiteQL rule, sign inversion rule

Do not write transactional or volatile data to memory. Those are re-derived
every session.

## Session-Start Refresh Protocol

At the start of every subsequent conversation, run a lightweight refresh
before responding to the customer:

1. Read all profile entries from memory.
2. Re-run Probe 7 (period maturity) to update the current open period.
3. Re-run Probe 4 if the last TTM check is more than 30 days old, to update
   materiality.
4. Re-run Probe 5 if the customer is asking about revenue, concentration, or
   anything customer-related, to update the concentration baseline.
5. Do not re-run the structural probes (1, 2, 3, 6, 8, 9, 10). Those are
   stable and live in memory until the customer triggers re-onboarding.

The refresh should add no more than two MCP calls to the start of a typical
conversation.

## Conversational Update Protocol

When the customer says something that contradicts or extends the profile,
update memory in place rather than re-onboarding. Examples:

- "Our materiality is actually 100K." Update the materiality entry. Confirm
  in chat with a single sentence acknowledgement.
- "We don't use rev rec." Update the module flag and remove deferred revenue
  from standing checks. Confirm.
- "We just opened a new sub in France." Re-run Probe 1 to capture the new
  subsidiary, update the entity-shape entry, ask whether to add French
  reporting to the standing checks.

Always confirm an update in one short sentence so the customer knows the
change took effect. Never silently update memory without acknowledgement.

## Failure Handling

If any probe fails:

- Record the failure mode in the profile under a quirks section.
- Continue with the remaining probes.
- In the Profile Card, surface failed probes honestly under a "couldn't
  verify" section so the customer knows what the skill does not know.
- Suggest a manual override path for any failure that materially affects
  analysis (for example, if Probe 4 fails, ask the customer to state TTM
  revenue directly).

Do not silently fall back to a generic default when a probe fails. Honesty
about what the skill does and does not know is the basis of audit defensible
output.

## Output of Onboarding

When onboarding completes, the project is in operational mode. The skill
should produce a one-line confirmation:

> Profile saved. I'll use this context in every future conversation in this
> project until you tell me something changes.

Then return control to the customer for their first real question.
