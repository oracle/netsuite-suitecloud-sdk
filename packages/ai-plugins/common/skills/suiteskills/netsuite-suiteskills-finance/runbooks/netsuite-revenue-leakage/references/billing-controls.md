# Billing controls: RL-001 through RL-004

Formula version: **1.0.0**. This module uses Oracle standard tools
`ns_getSuiteQLMetadata` and `ns_runCustomSuiteQL`; discover their actual runtime
schemas before calling them. No customer-developed tool, deployed script,
saved search, or custom record is required.

These are source-reviewed templates, **not account-validated queries**. They
extract complete populations and relationship facts before evaluating exceptions.
Do not describe a control as assessed until its gates and coverage checks pass.
Apply [connector and coverage](connector-and-coverage.md) and
[as-of and report](as-of-and-report.md) alongside this reference.

## Contents

- Shared gates and as-of semantics
- RL-001 unbilled quantities; RL-002 price; RL-003 amount; RL-004 credit review
- Q1 order lines; Q2 invoice links and visibility; Q3 credit lines
- Completion and reporting

## Shared data and interpretation gates

1. Verify `Transaction`, `TransactionLine`, and `NextTransactionLineLink` and
   every referenced column through metadata and a small read-only probe.
   SuiteScript Records Browser names do not establish SuiteQL column availability.
2. Verify the exact join grain: `(Transaction.id, TransactionLine.id)` and
   `previousdoc/previousline -> nextdoc/nextline`. A customer/item match, header
   `createdfrom`, or line sequence number is not a substitute for line lineage.
3. Confirm source and invoice visibility are compatible for the connected role.
   Unknown related-record access prevents treating an empty join as no billing.
4. Resolve native transaction statuses, approval behavior and void semantics.
   Count valid, nonvoid, approved invoices whether paid or unpaid. Keep pending
   approval/draft invoices separate. The repository admits `CustInvc:A`, `B`,
   and `D`; **do not adopt that list as an approval policy**. Verify the meaning
   of each returned status and any separate approval field via metadata/native
   evidence. If status alone is insufficient, fetch that verified field and
   refine the query; otherwise withhold finalized-billing amounts.
5. Retain raw signed quantity, rate and amount. Verify unit of measure, line
   types, currency, tax and discount basis before normalizing. `ABS()` is valid
   only for verified ordinary sale/credit sign conventions, not arbitrary signed
   adjustment, return, discount, subtotal, shipping, or zero-quantity lines.
   Put unclassified lines in the unevaluable count, not a zero-valued result.
6. Determine effective contractual price and obligation at the cutoff. A
   present-day order rate may reflect an amendment; an approved discount is not
   an erroneous price reduction. Report candidates as potential gaps until
   commercial evidence resolves these questions.

Group amounts by source currency and subsidiary. Never add different currencies.
Do not subtract customer payments: these controls assess billing, not collections.
Do not net credit memos into invoice amounts without exact source attribution
and an agreed policy; RL-004 reports credit review value separately.

## Single as-of date

Use `asOfDate`, defaulting to the verified NetSuite business date. There is no
scan period, lower date bound, or implicit age limit. Include old obligations.
All source documents and billing transactions must be dated on/before cutoff.
Future-dated invoices do not settle the cutoff gap; they may be disclosed as
subsequent billing in a separate drilldown.

`quantityshiprecv` and `quantitybilled` are current cumulative fields, not dated
event histories. Use them only for a current-state review after checking whether
future-dated fulfillment/billing activity affects those fields. RL-001 must use
linked, approved invoice quantities through cutoff rather than blindly copying
current `quantitybilled`. Reconcile the latter as a diagnostic.

For a historical cutoff, reconstruct dated fulfillment events, invoices and the
then-applicable order terms/status from accessible native evidence. No dated
fulfillment-event template is asserted here: verify its records, status semantics
and exact line link before using one. Without it, RL-001 is partial/not assessed
for that historical date. Current voids, cancellations, rates, links and quantities
also cannot establish a past state for RL-002/003/004. Label reliable retrospective
results as reconstructed from records visible today; exclude unsupported amounts.

## RL-001 — Fulfilled quantity awaiting billing

**Population:** all ordinary sales-order lines through cutoff; classify each by
fulfillability, order state, billing model and available delivery evidence.
Do not remove ARM-linked lines. Schedule/subscription lines remain in the
population and may be routed to their more appropriate obligation control.

For a fulfillable line with validated quantities in the same unit:

`unbilledQty = max(fulfilledQtyThroughCutoff - approvedInvoiceQtyThroughCutoff, 0)`

`potentialGap = unbilledQty * approvedEffectiveNetUnitPrice`

If only quantity is verified, report unbilled quantity and amount unknown.
Current `quantityshiprecv` is a permitted fulfillment fallback only after the
current-state gate above passes. An order's closed status alone does not settle
unbilled deliveries. Verify cancellations/returns and whether they reverse the
obligation rather than suppressing every closed line.

**Non-fulfillable items:** ordered quantity is not evidence of delivery. Require
verified service completion, an earned milestone, or contractual billable date.
Otherwise mark that segment unevaluable for RL-001 and assess RL-009 or RL-006
when appropriate. An independent RL-002 price check can still run for its invoices.

**Evidence:** exact order line, fulfillment basis/date, approved invoiced quantity,
pending quantity, units, price basis, currency, and outstanding quantity. Review
billing timing, accepted returns, disputes, and valid hold reasons before recovery.

## RL-002 — Price reduction on quantities already invoiced

**Population:** ordinary sales-order lines with approved invoice-line links through
cutoff, including equal/higher-rate healthy lines. Verify exact lineage and matching
currency/UOM. Unlinked invoices and ambiguous many-source allocations are coverage
limitations; do not match them by amount, customer or item.

For each eligible invoice line `j`:

`priceGap_j = billedQty_j * max(expectedNetUnitPrice_j - actualNetUnitPrice_j, 0)`

`priceGap = sum(priceGap_j)`

This measures lower pricing on billed units only. It does not multiply the entire
ordered quantity or include units still awaiting billing. Effective prices must
incorporate attributable approved discounts consistently. Use native `rate` only
when validated as that basis; otherwise derive net unit price from normalized net
line amount / quantity after allocating legitimate adjustments. Zero-quantity
amount-only lines require separate review and have no inferred unit rate.

Show above-contract invoice amounts separately; do not use overbilling of another
invoice to erase a below-price finding. Multiple equal-value invoice lines remain
separate facts. Never use `SUM(DISTINCT amount)` for de-duplication.

**Evidence:** order and invoice line identities, invoice date/state, quantity/UOM,
expected and actual price, approved discount/amendment evidence, calculated delta.

## RL-003 — Billed-order amount reconciliation

**Population:** ordinary sales-order lines represented as fully billed at cutoff,
with validated complete expected line value and invoice relationships. Verify the
native fully-billed state; the repository uses `SalesOrd:G`, which must be checked
in the connected account. Do not infer fulfillment from that header status.

`grossAmountGap = max(approvedExpectedLineNetAmount - linkedApprovedInvoiceNetAmount, 0)`

This is a reconciliation exception, not proof the full order was billable. Confirm
final obligation, cancellations, proration, amendments, discounts, tax basis and
currency before assigning a recovery amount. `foreignamount` is a raw input; its
absolute value is not automatically the approved final line net amount.

Retain findings even if no equal-rate invoice exists. The original code's
equal-rate-invoice gate is not retained: it can hide an amount discrepancy.
Separate quantities billed, price variances and other amount adjustments.

**Overlap:** RL-003's gross gap may already contain RL-001 and RL-002 components.
Only when complete evidence decomposes the same obligation on the same net basis,
report `residual = max(grossAmountGap - coveredDisjointComponents, 0)` as additional.
Otherwise show RL-003 as a linked, non-additive reconciliation flag.

## RL-004 — Credits requiring source review

**Population:** all credit memos through cutoff and all their commercial lines.
Evaluate current valid/void/approval state and historical limitations explicitly.
Inspect `TransactionLine.createdfrom` on **every** relevant line; one arbitrary
line cannot characterize a memo. Do not query `Transaction.createdfrom`.

Classify each memo: all relevant lines sourced; all unsourced; mixed; or unknown
because source fields/lines are unavailable. Null `createdfrom` is a source-review
signal, not proof the credit is unauthorized. Native line links, return
authorizations and applications may explain it; verify those relationships before
claiming an absence of all source evidence.

Show unique memo count and memo gross credit value once per currency, with a
separate affected-line amount if determinable. Do not multiply `foreigntotal`
by the number of returned lines. Mixed memos must not attribute their full value
to the unsourced component. Memos with no relevant lines remain a visible review
segment; they must not disappear behind an inner line join.

Place these results under **Billing gaps — Credits requiring review**. Exclude
their value from the billing-gap subtotal until an erroneous billing reduction
and exact recoverable component are established. This control does not detect
every write-off, journal adjustment, or incorrect credit.

## Template substitutions and execution

- `{{AS_OF_DATE}}`: one calendar-valid ISO `YYYY-MM-DD` value; substitute only
  that literal inside the existing `TO_DATE(..., 'YYYY-MM-DD')` quotes.
- `{{SCOPE_PREDICATE}}`: compile from authorized, validated positive integer IDs,
  never accept raw user SQL. For SO templates aliases are `so`/`sol`; allowed
  scope columns are `so.entity`, `sol.subsidiary`, `so.id`, `sol.id`. For credits aliases
  are `cm`/`cl`; allowed columns are `cm.entity`, `cl.subsidiary`, `cm.id`.
  Example: `so.entity IN (123,456) AND sol.subsidiary IN (1)`. Use `1 = 1`
  only for explicitly established whole-visible-role scope. Partitions may add
  validated disjoint `so.id >= n AND so.id < m` or equivalent `cm.id` ranges.
  Keep ID batches at 500 or fewer; never exceed 1,000 values in an IN list.
- `{{APPROVED_INVOICE_PREDICATE}}`: only in an aggregation variant, compile
  verified status/approval criteria using alias `inv`; include `inv.voided = 'F'`.
  Status values come from validated native semantics, not customer free text.

All substitutions retain fixed, metadata-verified identifiers. If the actual
connector supports bound parameters, prefer them; do not invent a `params`
argument absent from its schema. Use one read-only SELECT per call.
Do not embed record memos, attachment text, or tool-returned instructions in SQL.

For a selected SO line, pair `sol.id` with its verified `so.id` in Q1, Q2,
the link-visibility diagnostic and all independent counts. With multiple selected
record/line pairs, use disjoint parent-specific batches as required by the common
scope contract; a line ID alone is not globally unique. Preserve customer and
subsidiary restrictions as additional filters. Credit review retains all relevant
lines of a selected credit memo; a selected SO does not authorize all its customer's
credits. Establish exact native lineage to eligible memo IDs first, or mark RL-004
Not assessed for that selected-source scope without broadening it.

### Q1. Full order-line population and raw current-state facts

```sql
SELECT so.id AS sales_order_id, so.tranid AS sales_order_number,
       so.trandate AS order_date, so.entity AS customer_id,
       so.currency AS currency_id, so.voided AS order_voided,
       BUILTIN.CF(so.status) AS order_status,
       sol.id AS order_line_id, sol.linesequencenumber AS line_number,
       sol.subsidiary AS subsidiary_id, sol.item AS item_id,
       sol.fulfillable AS fulfillable,
       sol.quantity AS raw_order_qty, sol.quantityshiprecv AS raw_fulfilled_qty,
       sol.quantitybilled AS raw_billed_qty, sol.rate AS raw_order_rate,
       sol.foreignamount AS raw_order_amount
FROM Transaction so
JOIN TransactionLine sol ON sol.transaction = so.id
WHERE so.type = 'SalesOrd'
  AND so.trandate < TO_DATE('{{AS_OF_DATE}}', 'YYYY-MM-DD') + 1
  AND sol.mainline = 'F' AND sol.taxline = 'F' AND sol.iscogs = 'F'
  AND ({{SCOPE_PREDICATE}})
ORDER BY so.id, sol.id
```

This is the inventory, not a list of exceptions. Verify every selected field.
After metadata verification, add `sol.revenueelement`, `sol.billingschedule`,
`sol.subscription`, `sol.subscriptionline` to classify feature-dependent routing;
never silently drop their lines. Discover any necessary UOM/line-type columns
through metadata. Missing optional fields do not imply their features are absent.

For an independent raw denominator, replace the SELECT list with
`so.currency AS currency_id, COUNT(*) AS source_lines`, retain identical FROM/WHERE,
remove ORDER BY and append `GROUP BY so.currency`. Also count each eligibility/
unevaluable category after its validated predicates are known. Do not count only
positive gaps; retain the full inventory reconciliation.

### Q2. Complete invoice link facts through cutoff

```sql
SELECT so.id AS sales_order_id, sol.id AS order_line_id,
       so.currency AS order_currency_id,
       inv.id AS invoice_id, inv.tranid AS invoice_number,
       inv.trandate AS invoice_date, inv.currency AS invoice_currency_id,
       inv.voided AS invoice_voided, BUILTIN.CF(inv.status) AS invoice_status,
       il.id AS invoice_line_id, il.quantity AS raw_invoice_qty,
       il.rate AS raw_invoice_rate, il.foreignamount AS raw_invoice_amount,
       sol.rate AS raw_order_rate, sol.foreignamount AS raw_order_amount
FROM Transaction so
JOIN TransactionLine sol ON sol.transaction = so.id
JOIN (
  SELECT DISTINCT previousdoc, previousline, nextdoc, nextline
  FROM NextTransactionLineLink
  WHERE previoustype = 'SalesOrd' AND nexttype = 'CustInvc'
) lk ON lk.previousdoc = so.id AND lk.previousline = sol.id
JOIN Transaction inv ON inv.id = lk.nextdoc
JOIN TransactionLine il ON il.transaction = inv.id AND il.id = lk.nextline
WHERE so.type = 'SalesOrd' AND inv.type = 'CustInvc'
  AND so.trandate < TO_DATE('{{AS_OF_DATE}}', 'YYYY-MM-DD') + 1
  AND inv.trandate < TO_DATE('{{AS_OF_DATE}}', 'YYYY-MM-DD') + 1
  AND sol.mainline = 'F' AND sol.taxline = 'F' AND sol.iscogs = 'F'
  AND il.mainline = 'F' AND il.taxline = 'F' AND il.iscogs = 'F'
  AND ({{SCOPE_PREDICATE}})
ORDER BY so.id, sol.id, inv.id, il.id
```

Keep pending and voided facts in the diagnostic extraction. For billed amounts,
retain only the independently verified approved/nonvoid subset. Left-associate
those results to **all Q1 lines**, including lines with no Q2 rows. Absence is a
zero only after access/link-completeness gates pass. Compare distinct invoice-line
identities to link identities: a line mapped to multiple source lines cannot have
its full quantity or amount charged to each. Require a verified allocation or
mark the affected sources partial. The DISTINCT above removes duplicate links;
it does not resolve genuine many-source allocations.

Check relationship visibility separately using this diagnostic. It intentionally
retains linked invoices of all dates, including future-dated targets; none of those
future amounts enters the cutoff billed balance. Reconcile its unique link tuples
to Q2, accounting for dates and technical line exclusions. A missing target is a
visibility/broken-link limitation, never a zero invoice amount.

```sql
SELECT DISTINCT so.id AS sales_order_id, sol.id AS order_line_id,
       lk.nextdoc AS linked_invoice_id, lk.nextline AS linked_invoice_line_id,
       inv.id AS visible_invoice_id, inv.trandate AS invoice_date,
       il.id AS visible_invoice_line_id,
       il.mainline AS mainline, il.taxline AS taxline, il.iscogs AS iscogs
FROM Transaction so
JOIN TransactionLine sol ON sol.transaction = so.id
JOIN NextTransactionLineLink lk ON lk.previousdoc = so.id
  AND lk.previousline = sol.id
  AND lk.previoustype = 'SalesOrd' AND lk.nexttype = 'CustInvc'
LEFT JOIN Transaction inv ON inv.id = lk.nextdoc
LEFT JOIN TransactionLine il ON il.transaction = lk.nextdoc AND il.id = lk.nextline
WHERE so.type = 'SalesOrd'
  AND so.trandate < TO_DATE('{{AS_OF_DATE}}', 'YYYY-MM-DD') + 1
  AND sol.mainline = 'F' AND sol.taxline = 'F' AND sol.iscogs = 'F'
  AND ({{SCOPE_PREDICATE}})
ORDER BY so.id, sol.id, lk.nextdoc, lk.nextline
```

Server-side aggregate recipe, executable by fixed edits to Q2 after sign, UOM,
currency, discount, allocation and state gates pass:

1. Replace Q2's SELECT list with the following list.
2. Add `AND ({{APPROVED_INVOICE_PREDICATE}})` and
   `AND inv.currency = so.currency` to WHERE. Separately count excluded currency
   mismatches; they remain unevaluable and cannot silently disappear.
3. Replace ORDER BY with `GROUP BY so.id, sol.id`.

```sql
so.id AS sales_order_id, sol.id AS order_line_id,
COUNT(*) AS invoice_link_count,
SUM(ABS(il.quantity)) AS invoiced_quantity,
SUM(ABS(il.foreignamount)) AS invoiced_amount,
SUM(CASE WHEN il.quantity <> 0 AND sol.rate > il.rate
         THEN ABS(il.quantity) * (sol.rate - il.rate) ELSE 0 END) AS rate_gap
```

This direct-rate variant is valid only where the rates already share the verified
net price basis. Restrict it to verified ordinary positive commercial lines using
metadata-verified predicates or a validated ID subset; reconcile all other Q1/Q2
lines as excluded/unevaluable. Replace the rate expression with validated net-price
arithmetic where discounts require it. Never normalize negative business returns
with ABS. Obtain `COUNT(*)` over the same raw Q2 joins separately and reconcile
the returned distinct links before relying on aggregates.

### Q3. All credit memo lines, retaining memos without commercial lines

```sql
SELECT cm.id AS credit_id, cm.tranid AS credit_number,
       cm.trandate AS credit_date, cm.entity AS customer_id,
       cm.currency AS currency_id, cm.voided AS credit_voided,
       BUILTIN.CF(cm.status) AS credit_status,
       cm.foreigntotal AS raw_memo_total,
       cl.id AS credit_line_id, cl.subsidiary AS subsidiary_id,
       cl.createdfrom AS source_document_id,
       cl.quantity AS raw_line_qty, cl.foreignamount AS raw_line_amount
FROM Transaction cm
LEFT JOIN TransactionLine cl ON cl.transaction = cm.id
  AND cl.mainline = 'F' AND cl.taxline = 'F' AND cl.iscogs = 'F'
WHERE cm.type = 'CustCred'
  AND cm.trandate < TO_DATE('{{AS_OF_DATE}}', 'YYYY-MM-DD') + 1
  AND ({{SCOPE_PREDICATE}})
ORDER BY cm.id, cl.id
```

A `cl.subsidiary` predicate removes no-commercial-line memos from this result.
When subsidiary scope applies, first establish scoped memo IDs using a verified
native subsidiary relationship, then filter Q3 with `cm.id IN (...)` and inspect
all their lines. If that relationship cannot be verified, disclose the unknown
segment rather than assigning those memos to a subsidiary. Do not broaden scope.
For a denominator, replace SELECT with `COUNT(DISTINCT cm.id) AS credit_memos,
COUNT(cl.id) AS commercial_lines`, retain FROM/WHERE, and remove ORDER BY.
Count memo values from a one-row-per-memo result, never from this line extraction.

## Completion, deduplication and reporting

Reconcile the independently counted population with evaluated, excluded and
unevaluable identities. Exhaust connector pagination or disjoint ID partitions
with the same cutoff and deterministic ordering. Query limits or unexplained
count changes produce partial coverage. Sampling verifies joins; it cannot
establish that the full population was assessed. Avoid account-wide totals when
their contributing populations are incomplete.

Identify each economic component by source document/line, obligation, invoice
line where relevant, currency and time basis. RL-001 and RL-002 can add only when
the first covers unbilled units and the second covers different, already billed
units. RL-003 is non-additive unless its residual is proven. Schedule/subscription
findings can duplicate the same obligation: show linked explanations and count
that component once. If allocation remains uncertain, withhold an additive
subtotal for those findings. ARM flags on the same order remain in Accounting
gaps and are never added to billing amounts.

For each finding show control, customer/subsidiary, document/line, cutoff,
expected versus observed inputs, formula/version, source currency, evidence,
commercial uncertainty and next review action. Coverage rows must show RL-001,
RL-002, RL-003 and RL-004 even when not assessed. Distinguish a complete zero
exception result from a missing dataset or an unevaluated segment.
