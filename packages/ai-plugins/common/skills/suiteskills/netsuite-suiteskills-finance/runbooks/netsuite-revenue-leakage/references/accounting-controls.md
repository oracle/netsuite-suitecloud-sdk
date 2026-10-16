# Accounting controls: RL-005 and RL-008

These controls identify ARM planning and processing exceptions. Place their results
in **Accounting gaps**, separate from **Billing gaps**. They do not establish
understated posted revenue, lost cash, or recoverable billing. Never add the two
sections together. Financial formula definitions remain version **1.0.0**.

## Contents

- Execution contract and typed substitutions
- RL-005 queries A–D and B1–B4 evaluation
- RL-008 queries E–F and absence checks
- Evidence and coverage

## Execution contract

- Use only Oracle Standard Connector read-only tools. Discover capabilities using
  [connector and coverage](connector-and-coverage.md) before these queries.
- These are repository-derived SuiteQL recipes, **not live-validated queries**.
  Validate every table, column, enum value, join, and amount basis against the
  connected account's metadata and small read-only probes. SuiteScript Records
  Browser fields alone do not prove SuiteQL availability. Do not guess replacements.
- Supported scope: ARM elements originating from Sales Orders; RL-008 uses Sales
  Order item lines. Other source types remain outside this module's coverage.
- Version 1 supports verified **single-book accounting**. If Multi-Book is enabled
  or the book/currency basis is unknown, mark both controls Not assessed. Selecting
  a book name alone does not validate book-specific relationships and amounts.
- Include all eligible older Sales Orders through the as-of date; no start date or
  hidden lookback. Keep current closed orders in scope when otherwise eligible.
- Retain native currencies. RL-005 uses subsidiary base currency; RL-008 uses SO
  transaction currency. Preserve the book identifier/context with every finding.
- Use [as-of and report](as-of-and-report.md) for the complete date/output contract.
  Current quantities, statuses, links, allocations, holds, plan amounts and
  `totalrecognized` do **not** reconstruct a historical position.
- The SELECTs below retrieve current state. Use their findings as of the current
  NetSuite business date only after verifying their time basis. For a historical
  date, obtain reliable dated state/versions and recognition through that date;
  otherwise the affected subcheck is Partial or Not assessed. Filtering SO dates
  alone does not make these historical queries.
- Keep the full horizon of Actual plans that existed at the cutoff, including
  future planned lines. Do not filter their scheduled dates to `<= asOfDate`.
- Treat null or invalid amounts as missing evidence. Zero is allowed for a missing
  related population only after complete retrieval and compatible role visibility
  establish that no related records exist.

### Typed substitutions

`{{AS_OF_DATE}}`: validated real ISO calendar date `YYYY-MM-DD`; substitute only
those ten characters inside the quoted `TO_DATE` literal. Use native parameter
binding instead if the discovered standard tool explicitly supports it.

`{{SCOPE_PREDICATE}}`: generated from verified positive integer IDs, never user SQL.
In query A, allowed columns are `so.entity`, `soHeader.subsidiary`, `so.id`, and
`re.id`; in query E, they are `so.entity`, `sol.subsidiary`, `so.id`, and `sol.id`.
Use `IN (id,...)`, joined with `AND`. Preserve every supplied customer, subsidiary,
SO, and line restriction; use `1 = 1` only for intentionally selected complete
role-visible scope. Resolve a document number to its actual record ID first.

`TransactionLine.id` is scoped to its transaction: a selected line means the
pair `(so.id, sol.id)`. Group supplied pairs by SO and run disjoint parent-specific
batches, each containing one `so.id` and only that SO's selected `sol.id` values.
Never compile independent multi-SO and multi-line `IN` lists that admit unselected
cross-pairs. Query E and its independent count use the identical predicates.

Query A has no exact SO-line relationship. For a line-specific RL-005 request,
first verify a native element-to-line mapping and its cardinality, then restrict
`so.id` and `re.id` to the selected parent's verified elements **before** querying
or counting the population. Item, amount, customer, and the SO-level `referenceid`
are insufficient. If the mapping cannot support the requested line scope, mark
only RL-005 Partial/Not assessed as appropriate; continue independently supported
RL-008 and billing checks. Do not expand to all elements on the order or attribute
an element spanning unselected sources entirely to the requested line.

`{{ELEMENT_IDS}}`, `{{PLAN_IDS}}`, `{{SOURCE_UNIQUE_KEYS}}`: nonempty comma-separated
verified integer IDs returned by the preceding scoped query, at most 500 per batch.
Only verified source unique keys from scoped query E feed F; only scoped elements
from A feed B, and only their Actual plans feed C. Preserve the same ID batches in
independent counts and child retrievals. Exhaust disjoint batches. Never accept
free text, SQL fragments or names as IDs.
Do not execute a query containing unresolved placeholders or an empty `IN ()`.
All queries are SELECTs; no scripts, custom records, saved-search creation, or writes.

## RL-005 — ARM planning and recognition exposure

**Grain:** one Revenue Element. Build its population independently of whether a
plan is failed, held or missing. Preserve elements with no Actual plans.

Native gates:

| Purpose | Required native fields/relationships |
|---|---|
| Source population | `Transaction`: `id`, `tranid`, `type`, `trandate`, `entity`, `voided`; `TransactionLine`: `transaction`, `mainline`, `subsidiary`; `Subsidiary`: `id`, `currency` |
| Element | `RevenueElement`: `id`, `item`, `referenceid`, `sourcerecordtype`, `revenuearrangement`, `baseallocationamount`, `revenueplanstatus`, `revrecstartdate`, `revrecenddate` |
| Actual plans | `RevenuePlan`: `id`, `createdfrom`, `revenueplantype`, `holdrevenuerecognition`, `totalrecognized`, `amount` |
| Planned lines | `RevenuePlanPlannedRevenue`: `revenueplan`, `plannedperiod`, `amount` |
| Period resolution | `AccountingPeriod`: `id`, `startdate`, `enddate`, `isposting`, `isadjust`, `isyear`, `isquarter` |

The repository maps `re.referenceid = 'SalesOrd_' || TO_CHAR(so.id)` with
`re.sourcerecordtype = 'SALESORDER'`. Verify this representation and its completeness
in the account before using it. It identifies an SO, not an exact SO line. Retain
the element ID and source SO; add a line only when a verified native link resolves
it. Never infer a line from matching item, amount, or customer.

### A. Retrieve the element population

Verify one mainline header per SO and one row per element. Resolve duplicated or
orphaned source mappings before claiming complete coverage. `so.voided = 'F'` is
current-state eligibility; historical void state needs separate reconstruction.

```sql
SELECT so.id AS so_id, so.tranid AS so_number, so.trandate AS so_date,
       so.entity AS customer_id, soHeader.subsidiary AS subsidiary_id,
       sub.currency AS base_currency_id, re.id AS element_id,
       re.item AS item_id, re.revenuearrangement AS arrangement_id,
       re.baseallocationamount AS allocation_amount,
       re.revenueplanstatus AS element_plan_status,
       re.revrecstartdate AS element_start_date,
       re.revrecenddate AS element_end_date
FROM Transaction so
JOIN TransactionLine soHeader
  ON soHeader.transaction = so.id AND soHeader.mainline = 'T'
JOIN Subsidiary sub ON sub.id = soHeader.subsidiary
JOIN RevenueElement re
  ON re.referenceid = 'SalesOrd_' || TO_CHAR(so.id)
 AND re.sourcerecordtype = 'SALESORDER'
WHERE so.type = 'SalesOrd'
  AND so.voided = 'F'
  AND so.trandate < TO_DATE('{{AS_OF_DATE}}', 'YYYY-MM-DD') + 1
  AND ({{SCOPE_PREDICATE}})
ORDER BY so.id, re.id
```

Obtain a server-side `COUNT(DISTINCT re.id)` with the same FROM/WHERE, including
every selected SO/verified element restriction, before retrieval; reconcile it
to distinct retrieved elements. Count duplicate rows
separately rather than letting `DISTINCT` hide a mapping defect. Check scoped SOs
and source links independently when verifying the `referenceid` representation;
this element count cannot prove that an incomplete source mapping is complete.

### B. Retrieve Actual plan headers in element batches

```sql
SELECT rp.createdfrom AS element_id, rp.id AS plan_id,
       rp.holdrevenuerecognition AS hold_flag,
       rp.totalrecognized AS recognized_amount, rp.amount AS plan_amount
FROM RevenuePlan rp
WHERE rp.createdfrom IN ({{ELEMENT_IDS}})
  AND rp.revenueplantype = 'ACTUAL'
ORDER BY rp.createdfrom, rp.id
```

Get aggregate controls in the same batches:

```sql
SELECT rp.createdfrom AS element_id, COUNT(*) AS actual_plan_count,
       COUNT(rp.amount) AS valid_plan_amount_count,
       COUNT(rp.totalrecognized) AS valid_recognized_amount_count,
       SUM(rp.amount) AS total_plan_amount,
       SUM(rp.totalrecognized) AS total_recognized_amount,
       MAX(CASE WHEN rp.holdrevenuerecognition = 'T' THEN 1 ELSE 0 END)
         AS any_held
FROM RevenuePlan rp
WHERE rp.createdfrom IN ({{ELEMENT_IDS}})
  AND rp.revenueplantype = 'ACTUAL'
GROUP BY rp.createdfrom
ORDER BY rp.createdfrom
```

Reconcile plan IDs/counts to these aggregates. Reject duplicate plan IDs and
unknown hold flags. A count mismatch, permission limit or truncated batch blocks
absence conclusions. Null recognized values are not silently zero; verify their
documented semantics or make B2 unavailable. `SUM` ignores nulls, so B4 is available
only when `valid_plan_amount_count = actual_plan_count`. Apply equivalent checks
to B2 recognized amounts. Join these aggregates to A, never raw headers and raw
planned lines in the same amount sum.

For B2, establish that cumulative `totalrecognized` equals recognition through
the cutoff, including exclusion of any later-dated recognition already recorded.
If it does not, reconstruct the dated recognized amount through verified native
relationships. If that path is unavailable, B2 measurement is Not assessed even
when a hold/failure can be reported as an unquantified current-state issue.

### C. Retrieve full planned-period data

Run for the complete Actual plan ID population from B. Do not remove repeated
rows merely because their period and amount are equal; distinct planned lines
can legitimately have identical values.

```sql
SELECT planned.revenueplan AS plan_id, planned.plannedperiod AS period_id,
       COUNT(*) AS planned_line_count,
       COUNT(planned.amount) AS valid_amount_count,
       SUM(planned.amount) AS planned_amount,
       ap.id AS resolved_period_id,
       ap.startdate AS period_start, ap.enddate AS period_end
FROM RevenuePlanPlannedRevenue planned
LEFT JOIN AccountingPeriod ap ON ap.id = planned.plannedperiod
WHERE planned.revenueplan IN ({{PLAN_IDS}})
GROUP BY planned.revenueplan, planned.plannedperiod,
         ap.id, ap.startdate, ap.enddate
ORDER BY planned.revenueplan, planned.plannedperiod
```

Reconcile grouped `planned_line_count` to an independent `COUNT(*)` on the same
plan-ID batches. Aggregate results preserve line counts; page using their unique
plan/period grouping or disjoint plan-ID batches. No planned lines is different
from an inaccessible planned-line table.

### D. Resolve element boundary periods

```sql
SELECT ap.id AS period_id, ap.startdate AS period_start,
       ap.enddate AS period_end
FROM AccountingPeriod ap
WHERE ap.isposting = 'T' AND ap.isadjust = 'F'
  AND ap.isyear = 'F' AND ap.isquarter = 'F'
ORDER BY ap.startdate, ap.enddate, ap.id
```

Retrieve all required periods, including future years. For each element:

1. Both element dates must be present, valid, and start <= end.
2. Find posting periods containing the start date and the end date inclusively.
   Each boundary must resolve to exactly one period in the source subsidiary's
   applicable fiscal calendar. Overlapping calendars must not be collapsed with
   MIN/MAX. Add only metadata-verified fiscal-calendar constraints; if unavailable
   and boundaries are ambiguous, mark B3 unavailable for that element.
3. Allowed dates are the start of its start period through the end of its end
   period. Use dates, not numerical ordering of period IDs.
4. Every planned period from C must resolve to valid period start/end dates. One
   unresolved period blocks a complete B3 conclusion for that element.
5. A line is out of range when its period starts before allowed start **or** ends
   after allowed end. Compare accounting periods, not raw recognition dates.
6. Sum the signed planned amounts in out-of-range groups and their line counts.
   Missing amounts in those groups block B3 measurement; do not apply ABS per row.

### Evaluate B1–B4

Use `A` = base allocation; `N` = Actual plan count; `R` = total recognized through
the cutoff; `P` = total Actual plan amount over its full horizon; `O` = signed sum
of out-of-range planned amounts; `K` = out-of-range planned-line count.

Normalize the **element** planning status by removing spaces, hyphens and
underscores and comparing case-insensitively to `PLANFAILED`, after checking
the account's status representation. Do not confuse a plan-header status with
the element's planning-failure status.
An unknown/null status cannot be treated as “not failed” without verified semantics;
withhold that failure-dependent conclusion. Independently verified held-plan,
period-boundary or amount findings can still be reported with the limitation.

| Branch | Trigger | Associated amount and interpretation |
|---|---|---|
| B1 | `N = 0` and element Plan Failed | `MAX(A, 0)`; allocation associated with failed planning without an Actual plan |
| B2 | `N > 0` and any Actual plan held or element Plan Failed | `MAX(A - R, 0)`; unrecognized allocation associated with a hold/failure |
| B3 | `N > 0`, B3 available and `K > 0` | `MAX(O, 0)`; planned revenue outside allowed accounting periods |
| B4 | `N > 0` and `A - P > 0.01` | `A - P`; full-plan allocation shortfall in subsidiary base-currency units |

Keep repository precedence **B1 → B2 → B3 → B4** for the primary monetary finding
on each element. Evaluate available subchecks separately for coverage and retain
additional issue labels as nonadditive evidence. If B3 is unavailable, B4 may still
be reported when its own inputs pass; label B3's limitation. No Actual plan without
Plan Failed does not trigger B1 or B4: creation may depend on a later event.

B4 tolerance is strictly greater than **0.01**, not greater than or equal. Use
decimal arithmetic and unrounded input values; round only for display. Do not turn
`0.010000000000000009` binary floating-point noise into a finding. A zero associated
amount can accompany a planning issue but contributes no monetary amount. Negative
or reversal allocations require interpretation; do not recast them with ABS.

For B3, show `P`, `O`, `K`, boundary period IDs/dates and affected plan IDs. `P - O`
is a presentation comparison, not evidence of booked or recognized revenue.
For B2, a held plan may be intentional; review hold reason/approval before calling
it an error. These controls do not reconcile revenue to posted GL accounting lines.

## RL-008 — Billed SO line without a revenue element

**Grain:** `(SO ID, transaction-line ID)`, retaining `uniquekey` for ARM linkage.
Eligibility: item lines through the cutoff, billed quantity positive, and item
`directrevenueposting = 'F'`. The direct field and generated-element linkage must
both be checked. Retain unknown item configuration as unevaluable, not excluded.

Native gates in addition to the transaction fields above:
`TransactionLine.id`, `uniquekey`, `item`, `mainline`, `taxline`, `iscogs`,
`subsidiary`, `quantitybilled`, `foreignamount`, `revenueelement`;
`Transaction.currency`; `Item.id`, `directrevenueposting`;
`sourceDetails.sourceID`, `sourceType`, `revenueElement`; `RevenueElement.id`.

### E. Retrieve the independent SO item-line population

```sql
SELECT so.id AS so_id, so.tranid AS so_number, so.trandate AS so_date,
       so.entity AS customer_id, so.currency AS transaction_currency_id,
       sol.id AS line_id, sol.uniquekey AS source_unique_key,
       sol.subsidiary AS subsidiary_id, sol.item AS item_id,
       item.directrevenueposting AS direct_posting_flag,
       sol.quantitybilled AS current_billed_quantity,
       sol.foreignamount AS source_line_amount,
       sol.revenueelement AS direct_element_id
FROM Transaction so
JOIN TransactionLine sol ON sol.transaction = so.id
LEFT JOIN Item item ON item.id = sol.item
WHERE so.type = 'SalesOrd' AND so.voided = 'F'
  AND so.trandate < TO_DATE('{{AS_OF_DATE}}', 'YYYY-MM-DD') + 1
  AND sol.mainline = 'F' AND sol.taxline = 'F' AND sol.iscogs = 'F'
  AND sol.item IS NOT NULL
  AND ({{SCOPE_PREDICATE}})
ORDER BY so.id, sol.id
```

Obtain/reconcile the corresponding source-line count with the identical selected
SO/line, customer and subsidiary restrictions before applying exception predicates.
Do not fetch other order lines and discard them after counting. Classify
direct-posting items, unknown flags, unbilled lines and billed
eligible lines explicitly. Use `ABS(quantitybilled)` and `ABS(foreignamount)` only
after verifying sales-line sign conventions; preserve original values as evidence.
Null quantities or amounts are not zero. Reference exposure requires a positive
source-line amount, but zero-valued eligible lines remain in coverage.

Reconcile positive billed quantity to valid, nonvoid approved invoices through
the as-of date using exact SO-line/invoice-line links from
[billing controls](billing-controls.md). Current billed quantity may include
future or pending invoices; it is a candidate signal, not sufficient cutoff proof.
For historical dates reconstruct both billing and element existence as of the
cutoff; the current direct field cannot prove historical presence or absence.

### F. Check generated-element relationships

For all eligible billed line unique keys, including healthy direct matches:

```sql
SELECT sd.sourceID AS source_unique_key,
       sd.revenueElement AS linked_element_id,
       re.id AS resolved_element_id, COUNT(*) AS source_link_count
FROM sourceDetails sd
LEFT JOIN RevenueElement re ON re.id = sd.revenueElement
WHERE sd.sourceType = 'TRANSACTION_LINE'
  AND sd.sourceID IN ({{SOURCE_UNIQUE_KEYS}})
GROUP BY sd.sourceID, sd.revenueElement, re.id
ORDER BY sd.sourceID, sd.revenueElement
```

Reconcile the sum of `source_link_count` to independent sourceDetails counts per
batch and preserve one-to-many links. The grouped ordering is unique even when
duplicate sourceDetails links exist; those duplicates must not multiply the
source-line amount. A nonnull
direct element ID prevents a missing-element conclusion; verify its referenced
element when possible. Any resolved indirect element also prevents that conclusion.
An unresolved nonnull link is a visibility/integrity issue needing review, not
proof of absence. Missing table/field access is **Not assessed**, never “all lines
missing elements.” A zero-link result supports absence only with verified complete
retrieval and compatible source/element role visibility.

Trigger RL-008 only when billed eligibility is established, direct element is
blank, no indirect element exists, and absence can be established at the cutoff.
Report the **full positive SO line value as reference exposure**, even for partial
billing; show billed quantity and source amount beside it. Do not call that value
booked revenue understatement, billing shortfall or recoverable revenue. Approved
ARM timing and routine processing lag can explain a candidate; show aging without
silently imposing a processing grace period or dropping recent candidates.

## Evidence and coverage

Each finding: control/subcheck and version, as-of/time basis, customer/subsidiary,
currency/book, source SO and exact element or line ID, related plan/link IDs,
expected/observed inputs, formula, associated amount label, evidence links, coverage
limitations and next review action. Use verified record URLs only; do not invent
account domains. Cross-reference billing findings on the same source without adding
their amounts. Keep RL-008 reference exposure separate from RL-005 plan exposure.

Report **RL-005 B1, B2, B3, B4 and RL-008 individually** as Assessed, Partial, Not
assessed or Not applicable, with eligible/evaluated counts and reasons. Missing
ARM access is not evidence that ARM is disabled. Do not issue an aggregate clean
result when only some subchecks ran. Preserve exact-query evidence and page/batch
completion; a detail display limit must not hide an analytical retrieval limit.
