# Source and SuiteQL patterns for AP lifecycle analysis

## Relationship-coverage gate

Before using transaction-link relationships for lifecycle timing, compute and disclose coverage for the requested cohort.

If only a small or incomplete subset has verified payment/application links, do not generalize first-payment, last-payment, or final-settlement timing to the full cohort. Keep linked-subset metrics separate and label the broader result `PAYMENT_LINK_COVERAGE_INCOMPLETE`. Missing links are missing evidence, not zero-time or unpaid evidence.

These query shapes require adaptation to the account's exposed metadata and
connector contract. Do not copy prior account IDs, vendors, tool prefixes or
sample results. Follow the installed connector rules and use read-only SELECTs.

## Choose and verify the source

Look for a configured payment-history KPI/report/search with bill and payment
dates, linked application records, remaining balance and a documented grain.
An aging report alone cannot supply paid-bill lifecycle dates. A source named
“Payment History” is not sufficient without checking the fields and semantics.

Possible capabilities: list/run reports, list/run saved searches, record reads,
record/SuiteQL metadata and custom SuiteQL. Discover the actual schema and tool
prefixes in the session. Do not assume unexposed capabilities are available through the current connector.

Before relying on fields, inspect metadata and records for:

| Concept | Candidate source | Verification needed |
|---|---|---|
| Bill header | `transaction`, `type='VendBill'` | One record per ID; actual type/status labels |
| Bill/entry/due dates | `trandate`, `createddate`, `duedate` | Date basis/timezone; historical due-date limits |
| Remaining | `foreignamountunpaid` | Currency and sign; NULL is not zero |
| Bill Payment | `transaction`, `type='VendPymt'` | Date, void/reversal/status and current valid application |
| Vendor Prepayment Application | exposed application record/report or verified transaction type | Application transaction date, Bill ID, valid amount/application; not original prepayment cash date |
| Bill/payment relation | `nexttransactionlinelink` | Direction, link type, duplicate lines and active application semantics |
| Credit/adjustment closure | application history | Whether cash or noncash activity closed the bill, and when |
| Approval history | workflow record or `systemnote` | Record type + ID, event names, route starts, rejections/resubmissions |
| Receipt | configured field/intake source | Real receipt semantics, not inferred from entry/bill date |
| Dimensions | vendor/subsidiary or line metadata | No header multiplication from line joins |

Resolve status labels through metadata/display functions or a type-specific
status lookup. Do not treat status-code guesses as account-independent policy.
Check sign conventions rather than assuming all vendor amounts are negative.

## Complete payment-history groups

If the connector exposes A/P Payment History by Bill or an equivalent configured
source, verify the Bill row, Amount Due and qualifying settlement rows within each
complete group. Use verified bill IDs even when document/reference text is blank.
For zero-due eligible groups, derive bill date and latest qualifying Bill Payment
or Vendor Prepayment Application transaction date directly. Compute one signed
calendar-day interval per bill; retain verified negatives and aggregate sums/counts.
Do not require a document-number join to a separate bill list. Reconcile that list
only with verified equivalent filters, including actual returned date boundaries,
subsidiary, status and eligibility. Otherwise label the source-scoped coverage.

Search only tools actually exposed through the supported connector. A report-catalog miss
alone does not exhaust configured metrics, saved searches or application records.
For unmatched fully paid IDs, inspect both settlement types and complete groups
before assigning a reason. Never infer missing settlement data from a count gap.

## Cash-payment relationship (not the full settlement population)

A common path has bill ID in `previousdoc` and applying payment ID in `nextdoc`.
Verify it against at least two record pairs and, where possible, a multipayment
bill. Verify qualifying `linktype`, payment status and application validity before
using this relationship. These are not guaranteed by table names alone.

```sql
SELECT rel.bill_id,
       MIN(p.trandate) AS first_cash_payment_date,
       MAX(p.trandate) AS last_cash_payment_date,
       COUNT(p.id) AS distinct_payment_count
FROM (
  SELECT DISTINCT l.previousdoc AS bill_id, l.nextdoc AS payment_id
  FROM nexttransactionlinelink l
  /* Restrict to verified qualifying application link types where required. */
) rel
JOIN transaction p ON p.id = rel.payment_id
WHERE p.type = 'VendPymt'
/* Add verified payment validity, reversal, and as-of predicates here. */
GROUP BY rel.bill_id
```

This yields cash-payment dates, not proof of final settlement for credit-only or
mixed cash/noncash closures. For final settlement, extend the
verified relation with Vendor Prepayment Applications using discovered metadata
and tested bill/application pairs; do not guess its type code, join direction or
cash-date meaning. Retain prepayment-only bills. Inspect other closure activity
separately. Never use
zero current remaining amount to erase that distinction. A reversed or obsolete
link must not supply the endpoint.

## Complete per-bill dataset

Build a derived relation for both qualifying settlement types, or use complete
verified report groups. The cash-only SQL example above is insufficient by itself
for all-method settlement. Join once by verified bill ID to each bill header when
needed; do not join on document text.
Project explicit fields including bill/vendor IDs, bill date, first/last cash
date, remaining, status/hold, currency, subsidiary, and supported closure basis.
Use the requested metric's date field for period filters. Preserve unclassifiable
rows separately instead of silently losing them through an inner join.

For a fully paid final-payment cohort, require verified qualifying bill state,
zero known remaining, a verified final settlement endpoint, and the supported settlement
basis. Exclude/partition holds, future dates, invalid states and mixed closure
uncertainty using the same rules for overall, vendor, trend and percentile views.

Never use `MAX(trandate)` across all vendor payments without the bill relation.
Never use a bill apply-line date as a payment date without semantic validation.

## Limits, pagination and aggregation

Use supported connector pagination with unique stable ordering, or verified
row-number windows/nonoverlapping partitions when a query cap is mandatory.
`ROWNUM <= 1000` in a base-row WHERE filters the **input** to aggregation. It is
not a harmless output limit and cannot support whole-population KPIs.

If a cap is required, a grouped/aggregate result can be capped outside:

```sql
SELECT q.bill_count, q.day_sum
FROM (
  SELECT COUNT(b.id) AS bill_count,
         SUM(TRUNC(pay.final_settlement_date) - TRUNC(b.trandate)) AS day_sum
  FROM transaction b
  JOIN ( /* complete verified payment + prepayment application relation */ ) pay ON pay.bill_id = b.id
  WHERE b.type = 'VendBill'
    AND b.foreignamountunpaid = 0
    /* verified cohort, eligibility, settlement-basis and date predicates */
) q
WHERE ROWNUM <= 1
```

This is a shape requiring the stated predicates, not executable finished SQL.
For grouped results, paginate all groups too. Check the connector permits this
shape; otherwise use complete per-bill pages and calculate locally.

For row-number pagination, order by a unique bill ID, keep lower/upper bounds
nonoverlapping, and reconcile deduplicated IDs to a complete scoped count. A
short page alone is not enough when errors or server caps may truncate a result.
Keep the snapshot consistent; if records changed mid-extraction, disclose it.

Compute mean from unrounded sum/count. Medians and percentiles can be computed
client-side from complete per-bill values. Use supported database functions only
after metadata/tool validation; do not assume blanket dialect prohibitions based
on one connector's earlier errors. Never sum amounts across currencies.

## Terms, aging and approval details

- Terms compliance uses the qualifying endpoint and the bill's due date. Null
  due dates stay outside the denominator and are counted separately.
- Open aging uses the requested as-of date and date basis. Current unpaid amount
  cannot reconstruct a historical open balance without application history.
- Entry lag uses creation minus bill date. Negative values may be forward dating;
  neither sign proves AP team effort or real receipt time.
- Approval events must belong to the correct transaction **record type** as well
  as ID. Avoid matching system-note IDs across unrelated record types. Confirm
  localized/workflow-specific field and value meanings. Retrieve ordered events,
  pair starts/completions by cycle, and keep incomplete cycles separate.
- An empty permission-limited history query proves only that the queried source
  supplied no accessible events. It does not prove that approval never happened.

## Validation and evidence ledger

Preserve full filters, source/account identity, extraction date, pagination,
eligible count, bill-level sums, group counts, dates and verified exclusion reasons.
Record which requested filters were proven in returned evidence. Distinguish
source-scoped completeness from unverified wider population coverage; unresolved
bill IDs must not acquire an inferred exclusion cause.
Check count conservation at bill grain and manually verify representative date
pairs. All-zero durations need verification, not automatic rejection. Amount
precision and currency labels must remain intact. Keep runtime/test evidence
outside the reusable skill package.
