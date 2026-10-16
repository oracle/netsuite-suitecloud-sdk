# Fulfillment evidence and order exceptions

Use this reference for a NetSuite Customer Service Order Triage investigation involving an Item
Fulfillment, fulfillment request, store pickup, shipment/tracking evidence, partial fulfillment,
backorder or commitment, exception, or customer-safe order update. Account features, terminology,
forms, statuses, custom fields, record relationships, carrier data, and connector permissions
vary; validate them during the current investigation rather than applying a generic lifecycle or
status mapping.

## Contents

- [Selected order or fulfillment](#1-selected-order-or-fulfillment)
- [Direct Sales Order field candidates](#direct-sales-order-field-candidates)
- [Direct Item Fulfillment field candidates](#direct-item-fulfillment-field-candidates)
- [Direct Sales Order to Item Fulfillment line matching](#direct-sales-order-to-item-fulfillment-line-matching)
- [SuiteQL fallback for fulfillment and tracking](#suiteql-fallback-for-fulfillment-and-tracking)
- [Line classification and quantity comparison](#1a-line-classification-and-quantity-comparison)
- [Billing and invoicing evidence](#2-billing-and-invoicing-evidence)
- [Feature-aware fulfillment workflow](#3-feature-aware-fulfillment-workflow)
- [Shipment and customer-update questions](#4-shipment-and-customer-update-questions)
- [Operational handoff](#5-operational-handoff)
- [Output shape](#6-output-shape)

## 1. Selected order or fulfillment

Resolve the selected Sales Order, Item Fulfillment, fulfillment request, or other account-confirmed
record narrowly, then read it directly. Retrieve only the fields necessary to establish:

- the record's current accessible status label and status source;
- its customer relationship where needed to avoid cross-customer disclosure;
- accessible item/line quantities and their relationship to the selected record;
- accessible fulfillment, shipment, tracking, location, or carrier fields requested; and
- relevant linked records only after the direct read validates the relationship.

When the user supplies an exact Sales Order number and no internal ID, a metadata-validated
`transaction` resolver can establish the direct-read ID before fulfillment investigation. The
observed source contract uses the `SalesOrd` type value, an exact `tranid`, and the returned `id`;
`status` and `entity` can be returned only as raw resolver fields. Use this tested query pattern,
safely encoding the supplied order number:

```sql
SELECT id, tranid, status, entity
FROM transaction
WHERE type = 'SalesOrd'
  AND tranid = '[ESCAPED_ORDER_NUMBER]'
```

Validate the table and fields for the current account and role, then use the returned `id` for the
direct `salesorder` read. Do not present raw resolver values as a human-readable order status or
customer identity, and do not skip the direct read.

Do not infer that an order is fully fulfilled from one fulfillment record, that all lines share the
same state, or that an order-level status proves a particular line was shipped. For partial or
multiple fulfillment questions, identify the accessible scope and compare only verified order-line
and fulfillment-line relationships. If an item, inventory-detail, location, or tracking field is
unavailable, report that specific limitation instead of filling it from a related record.

### Direct Sales Order field candidates

For a selected `salesorder` direct record, validate the returned field shape before using it. The
following are candidate evidence paths, not universal field guarantees: `orderStatus` or `status`
for a readable order-level state; `actualShipDate` for a returned record date whose business meaning
must be validated before it is described as a shipment or delivery event; and `item.items[]` fields
`line`, `quantity`, `quantityFulfilled`, `quantityBilled`, `quantityBackOrdered`, `quantityCommitted`,
`quantityAllocated`, and `quantityAvailable` for selected-line progress or supply facts.

Classify the line and preserve its returned unit and scope before comparing those quantities. A
returned `quantityFulfilled` or `quantityBilled` value supports only that selected line's recorded
value. In particular, a returned `quantityBilled` value of zero does not prove that no invoice or
cash sale is linked to the order; use the validated, typed billing-document path before making a
related-document absence claim. Conversely, an order-level `orderStatus` or `status` label does not
establish the state of every line.

### Direct Item Fulfillment field candidates

For a selected `itemfulfillment` direct record, validate the returned field shape before using it.
The following are candidate evidence paths, not universal field guarantees: `createdFrom` for the
explicit source Sales Order relationship and `orderId` as a supporting numeric reference; `entity`
for the related customer or job label; `shipStatus` or `status` for the record's visible fulfillment
state; `shipMethod` for the selected Ship Item; `shipCarrier` for an associated or default carrier
setting; `tranDate` for the fulfillment date; and `item.items[]` with line-level quantity and
source-line references such as `quantity`, `orderLine`, and `orderDoc`. Preserve their source scope
and exact returned meaning. In particular, a
visible `Shipped` label is not carrier acceptance, transit, or delivery, `shipMethod` does not prove
the actual carrier service used, `shipCarrier` does not prove a carrier pickup or selected service,
and `tranDate` is not automatically an actual shipment date.

A full direct record can include addresses, email addresses, package/carrier configuration,
inventory detail, custom fields, and internal references. Retain and display only the fields needed
for the authorized question. Do not expose that incidental data merely because the record read
returned it.

### Direct Sales Order to Item Fulfillment line matching

For a line-progress comparison that includes a shipped quantity, directly read the selected Sales
Order and each selected Item Fulfillment. First confirm that the fulfillment's `createdFrom` or
`orderId` identifies the selected Sales Order. Then match the fulfillment line's `orderDoc` to that
selected order and its `orderLine` to the Sales Order line's `line`. Validate the returned fields,
line role, item context, and units before comparing the Sales Order's `quantity`,
`quantityFulfilled`, or `quantityBilled` with the fulfillment line's `quantity`.

Only after that explicit order-and-line relationship is confirmed may the fulfillment quantity be
reported as the selected Sales Order line's recorded fulfillment quantity. A direct fulfillment
`status` or `shipStatus` label of `Shipped` is the fulfillment record's visible state; it does not
by itself establish carrier acceptance, transit, delivery, or a customer commitment. If the source
order, source line, unit, or fulfillment line is unavailable or ambiguous, report the specific
limitation and do not match records merely because their item names, dates, or quantities resemble
each other.

### SuiteQL fallback for fulfillment and tracking

Use these paths only when the selected Sales Order direct record does not expose the needed explicit
relationship and metadata confirms the exact tables and fields for the current account and role.
They discover candidates and package evidence; direct-read each selected candidate before reporting
its document type, status, customer relationship, or included items.

Choose the narrowest accessible candidate path for the question. Use `NextTransactionLink` for a
generic next-document candidate when its metadata has already been validated. Use the
`transactionline` mainline path when the question needs related fulfillment and invoice candidates
and `transactionline.createdFrom`, `transactionline.transaction`, and `transactionline.mainLine`
are validated. Do not begin with `transaction.createdfrom`: the confirmed source relationship is on
`transactionline`. Do not run both paths merely as redundant corroboration; use an alternate path
only when the first accessible path cannot supply the relationship evidence needed for the question.

1. **Sales Order to next-document candidates:** a bounded `NextTransactionLink` query can use
   `previousdoc` for the selected Sales Order and return `nextdoc` plus `linktype`. The record
   browser defines these as the prior related transaction, the next transaction, and the link type.
   Use `DISTINCT` for document candidate discovery, because multiple relationship rows can otherwise
   represent the same next document. A metadata-validated pattern is:

   ```sql
   SELECT DISTINCT nextdoc, linktype
   FROM NextTransactionLink
   WHERE previousdoc = [SALES_ORDER_INTERNAL_ID]
   ```

   `nextdoc` is a linked-transaction candidate, not its final document type, current state, or a
   complete relationship conclusion. Direct-read each reachable candidate and confirm its selected
   order relationship before reporting it as an Item Fulfillment, invoice, cash sale, or another
   document. An empty or inaccessible result means that this path returned no accessible link rows;
   it does not prove that no fulfillment, invoice, payment, return, or other related activity
   exists.
2. **Sales Order to downstream transaction candidates:** a metadata-validated `transactionline`
   mainline query can discover related transaction candidates through the confirmed `createdFrom`
   relationship. The successful query shape is:

   ```sql
   SELECT t.id, t.tranid, t.type, BUILTIN.DF(t.status) AS status_label, t.trandate
   FROM transactionline tl
   JOIN transaction t ON t.id = tl.transaction
   WHERE tl.createdFrom = [SELECTED_SALES_ORDER_INTERNAL_ID]
     AND tl.mainline = 'T'
   ```

   Validate the relationship, fields, and join for the current account and role. This is a
   transaction-candidate path at mainline-constrained transaction grain, not a complete downstream
   lifecycle report. Complete the required page range, deduplicate returned `t.id` values, and
   direct-read each reachable candidate before reporting it as an Item Fulfillment, invoice, cash
   sale, or another document. Treat the returned `BUILTIN.DF(t.status)` and `trandate` as candidate
   record facts until that direct read confirms the document and selected-order relationship. An
   empty or inaccessible result does not prove that no related transaction exists. Do not use a
   failed `transaction.createdfrom` path, an inferred transaction type, or a matching date/amount
   as equivalent relationship evidence.
3. **Fulfillment to package tracking or detail:** a bounded `itemfulfillmentpackage` query can use
   the selected fulfillment through `itemfulfillment` and return `packagetrackingnumber` when
   present. `packagecartonnumber`, `packageweight`, and `packagedescr` are optional package-detail
   candidates when the user asks for them. Its grain is package-level, so retain every accessible
   package separately. Do not expose carton, weight, or description by default, and render a null
   returned value as unavailable rather than filling it from another package or record. A missing or
   inaccessible package result does not prove that no shipment, carrier event, or tracking value
   exists.

For a direct Item Fulfillment, prefer the returned `shipStatus`/`status` label and
`shipMethod` label before attempting a separate status-code or shipping-item lookup. A returned
`Packed` label supports only that record state; a tracking number or shipping method remains an
identifier or configuration fact until independently validated carrier evidence establishes
pickup, transit, delivery, or an exception. Prefer the direct fulfillment's line evidence for
included items. Do not adopt an account-specific filter such as one item type or a positive raw
quantity as a generic shipped-item rule; it can omit valid lines or mask line semantics that need
current-account validation.

If a direct Sales Order or Item Fulfillment read has no readable status label, a
metadata-validated query for that already-confirmed transaction can render its stored status for
presentation:

```sql
SELECT id, tranid, BUILTIN.DF(status) AS status_text
FROM transaction
WHERE id = [SELECTED_TRANSACTION_INTERNAL_ID]
```

Use the returned label exactly as the selected transaction's recorded state. An order-level label
does not establish the state of any individual line, whether a fulfillment exists, or the number
of related fulfillments. Do not use a guessed `transactionStatus` list lookup as a substitute, and
do not convert `Packed` into shipped, carrier-accepted, in-transit, or delivered.

When a Sales Order query returns a raw status code and `BUILTIN.DF(status)` is unavailable, a
metadata-validated `transactionStatus` lookup can provide candidate labels for that transaction
type:

```sql
SELECT id, name, trantype
FROM transactionStatus
WHERE trantype = 'SalesOrd'
```

Match the selected Sales Order's raw status only to a returned `id` from this same, validated
transaction-type scope, then present the corresponding `name` as the recorded status label. Do
not hardcode a code-to-label mapping, apply the Sales Order list to another transaction type, or
present a label when the selected raw value has no matching returned `id`.

If the direct record exposes a `shipMethod` ID but not its label, validate the `shipitem` record
and resolve that explicit ID narrowly:

```sql
SELECT id, itemid
FROM shipitem
WHERE id = [SHIP_METHOD_INTERNAL_ID]
```

Treat `itemid` as the selected shipping-method label, not proof of a carrier event or actual
service use. A shipping line can carry a value that is not an `item` record. Do not look up that
value through `item`; use `shipitem` only when the selected fulfillment's returned relationship or
current-account metadata establishes that it is the shipping-method ID.

For every operational conclusion or customer-safe draft, keep an evidence tuple in view:

1. **Object and scope** — selected order, line, fulfillment request, item fulfillment, or package;
   do not replace one with another.
2. **Observed state or event** — preserve the exact visible label or event meaning and its source.
3. **When and where** — include an accessible timestamp, location, delivery method, or carrier only
   when its field semantics and relevance are verified.
4. **What remains** — identify the unverified line, fulfillment, carrier event, or policy that
   prevents a broader conclusion.

This is an evidence discipline, not a requirement that the connected account expose all four
elements. Omit unavailable elements and state the precise limitation; do not manufacture an event
timeline from status labels, record timestamps, or free text.

When the question concerns a fulfillment request, pick/pack/ship stage, or warehouse workflow,
first confirm that the applicable record type, relationship, and fields are exposed to the current
role. The presence of a general order status does not prove which workflow feature is enabled or
which operational step occurred.

### 1a. Line classification and quantity comparison

Before treating an order line as fulfillment evidence, establish its accessible line role. A
confirmed shipping, tax, discount, subtotal, description, or other non-fulfillable line can remain
visible on an order but is not a product line for fulfillment or backorder analysis. Label such a
line by its verified role and omit it from the product-line fulfillment conclusion. If its role is
not accessible, say that fulfillment applicability is unverified; do not infer it from a blank
quantity, an internal item value, or its position on the order.

For an ordered, fulfilled, shipped, invoiced, or backordered comparison, build the result only from
validated fields at the same selected order-line scope. State ordered, fulfilled, billed, and
backordered quantities separately. State shipped quantity only when a validated item-fulfillment
relationship or a field with confirmed shipment semantics establishes it. A header status, shipping
method, tax line, or current item balance cannot fill a missing comparison cell.

Do not normalize a raw stored sign, unit, or quantity convention into a customer-facing value from
general NetSuite knowledge. If current-account metadata or direct record semantics do not establish
the value, show the raw field only when it is useful and safe, label its meaning unverified, or omit
it. Preserve a visible mismatch as a record inconsistency rather than diagnosing a fulfillment or
billing error.

When the user requests a structured comparison, complete every requested category with a verified
fact or a specific unavailable-evidence statement. Do not stop after order resolution, tool loading,
or a header read. A compact table is appropriate when two or more fulfillable lines or quantity
categories need comparison.

## 2. Billing and invoicing evidence

Before explaining the relationship between fulfillment and billing, establish whether the selected
account exposes evidence that Advanced Shipping applies to this order. In an Advanced Shipping
workflow, fulfillment and billing are separate transactions. Without it, NetSuite's documented
workflow bills the sales order when it is fulfilled. Do not infer the account feature or the
customer's billing state from an order or fulfillment status alone; read the relevant accessible
record or state that the relationship cannot be verified.

For a billing question, read the selected Sales Order first, then retrieve only its validated
linked invoice or cash-sale records. For each accessible billing record, preserve the document
type, current status, transaction date, currency, and only the affected line quantities needed for
the question. Do not call a related billing document an invoice when the direct record identifies
it as a cash sale, and do not expose payment, aging, credit-card, or other financial details unless
the authorized question requires them.

For a selected Sales Order, a bounded `invoice` query using a metadata-validated `createdfrom`
relationship can discover candidate linked invoices. Candidate fields include `id`, `tranid`,
`status`, `trandate`, `total`, `amountremaining`, and `amountpaid`. Use the returned `id` to read
the selected invoice directly before presenting its status label or relationship conclusion. Treat
the amounts as the invoice's recorded values at the returned scope: `amountpaid` and
`amountremaining` can support a narrow balance statement when their current-account semantics are
validated, but do not establish payment method, cash settlement, bank clearance, or the details of
the payment application.

Treat billing and payment as separate evidence questions. An invoice establishes a billed amount,
not that it was paid; for an outstanding or paid conclusion, use the validated payment/application
evidence or an approved invoice report with the required scope. A cash sale records an
immediate-payment sale, but does not by itself establish bank deposit, settlement, or funds
availability. Do not use a payment-date prediction, due date, or payment term as a customer
commitment.

### Payment applications for a selected invoice

After an invoice is selected and directly confirmed, a bounded `customerPaymentApplyLine` query can
discover Customer Payment candidates applied to that invoice. Validate `doc`, `parenttransaction`,
`amount`, `applydate`, and `currency` for the current account and role:

```sql
SELECT parentTransaction, doc, amount, applyDate, currency
FROM customerPaymentApplyLine
WHERE doc = [SELECTED_INVOICE_INTERNAL_ID]
```

The result is payment-application-line grain. Complete the required bounded page range, preserve
each returned application amount and currency separately, and deduplicate `parenttransaction`
values before Customer Payment reads. `amount` is the returned application-line amount, not the
payment's total amount, total applied amount, or unapplied amount. `applydate` is a returned
application-date field; do not relabel it as payment posting, deposit, settlement, carrier, or
bank-clearing date without field semantics that establish that meaning.

Direct-read each reachable `customerpayment` candidate before reporting its status or balance. When
the returned field semantics are validated, candidate header facts include `tranId`, `tranDate`,
`status`, `payment`, `applied`, `unapplied`, and `currency`. A numeric `unapplied` value of zero
supports only that selected payment's returned unapplied amount being zero. It does not establish
that no other customer payment is unapplied, that no duplicate charge exists in the customer's
broader AR population, or that cash has settled. If the direct read has only a raw status, do not
guess a label.

For duplicate-invoice or duplicate-charge questions, first state the exact population: a complete,
validated invoice set explicitly linked to the selected order can support a conclusion about that
linked invoice set only. Do not expand it into a customer-wide duplicate-charge or unapplied-payment
claim without the authorized AR population and application evidence.

Use validated per-line fulfilled and invoiced quantities to explain a partial billing question.
An order-level billing label is not enough to establish that every line is billed, unbilled, or
paid; a `Pending Billing` state can coexist with partial billing. Conversely, an accessible invoice
does not prove that every line shipped: an account can permit invoicing ahead of fulfillment.
Describe only the selected order/line and explicit billing-record relationship, and route invoice
creation, correction, payment application, credit, refund, or collection decisions to the
authorized billing process.

If the selected order exposes a billing schedule or invoice schedule, distinguish each scheduled
billing instance from an issued invoice or cash sale. A schedule can apply to the full order or to
individual lines, and can contain future billing dates or amounts; it is not proof that a bill was
created, sent, received, or paid. Report it only as an accessible schedule and route schedule
changes or billing-timing commitments to the authorized billing process.

Do not substitute a printed invoice, email, or rendered form for the direct billing record and its
validated line evidence. In particular, NetSuite documents that partially fulfilled item groups and
kit/packages can display a zero quantity on printed invoices. Preserve that rendering limitation
instead of treating it as proof of a zero billed or fulfilled quantity.

## 3. Feature-aware fulfillment workflow

A fulfillment request is an intermediate operational step between a sales order and item
fulfillment when that feature is used. It can support location-level workload and inventory
decisions, including an accessible rejection of unfulfillable request lines. Do not call a
fulfillment request a shipment, item fulfillment, cancellation, or customer decision. Treat any
request state, its relationship to an order, and its line-level effect as account-validated
evidence.

### Fulfillment-request status is request-scoped

First confirm that the selected record is a fulfillment request and that its relationship to the
selected order and its lines is exposed. A sales order can legitimately have more than one
fulfillment request when locations, shipping groups, partial quantities, or later quantity changes
differ. Never roll one request's state up to every line or to the whole order without verified
related-record and line evidence.

Do not recommend canceling a selected sales order merely because a fulfillment request has an
exception. NetSuite documents that, once a fulfillment request is created, its associated sales
order cannot be canceled. Preserve the exact accessible record relationship and route any
cancellation decision to the authorized order-management workflow; a missing accessible request
does not establish that cancellation is available.

For a shipping-order fulfillment request, an accessible rejection applies only to an unpicked line
and rejects that line's full requested quantity. An accessible cancellation applies to the whole
request only before any items are picked, while it is `New` or `In Progress`; the canceled request
then becomes read-only. These are request-scoped workflow facts, not evidence that the sales order
was canceled, that another location will fulfill the line, or that the customer has a remedy. Keep
the exact record, status, and line scope in the handoff.

An `In Progress` request establishes only that the fulfillment location accepted or acknowledged
the lines retained in that request. If the request was partially acknowledged, unselected lines can
require a separate request. Do not use `In Progress` to say that every sales-order line is accepted,
allocated, picked, or scheduled.

Use the following documented meanings only as narrow interpretations of a visible, validated
fulfillment-request status:

| Visible request status | Safe support interpretation | Do not conclude |
| --- | --- | --- |
| New | The request was created and is awaiting location acknowledgment. | That inventory is reserved, work has started, or anything shipped. |
| In Progress | The location acknowledged it, or request work is only partially picked, packed, or shipped. Read lines and related fulfillments before saying which. | That the order or request is shipped, packed, or complete. |
| Picked | All items on that request were picked. | That they were packed, shipped, delivered, billed, or that other requests are complete. |
| Packed | In a shipping workflow, all items on that request were packed. | That it is a store-pickup stage, shipped, delivered, billed, or complete at order level. |
| Partially Fulfilled | Some request items have shipped while other request work remains. | That all order lines shipped or that a remaining item will be replaced, canceled, or refunded. |
| Fulfilled | All items on that request shipped. | Carrier acceptance, delivery, billing, email delivery, or completion of other requests/order lines. |
| Fulfilled With Exceptions, Rejected, or Canceled | The request has reached its documented terminal state. Preserve the exact visible label and seek the authorized fulfillment team for the line-level outcome. | Customer cause, inventory cause, refund/replacement, a new request, customer notification, or any action outside the verified record. |

For store pickup, do not describe the item as shipped unless a validated shipment record establishes
that fact. NetSuite documents `Packed` as a shipping-only fulfillment-request state. An accessible
exception reason is an internal operational classification, not proof of a customer-facing root
cause or remedy.

### Store pickup: picked is not collected

Keep the fulfillment request and any validated store-pickup fulfillment separate. A store-pickup
fulfillment marked `Picked` establishes that the selected items were picked, not that the customer
was notified, arrived, collected them, or completed the whole order. Only a validated `Picked Up`
state on the selected store-pickup fulfillment can support the narrow statement that those items
were collected. It does not establish another fulfillment's state, a shipping event, a return
decision, payment/billing, or delivery of a different line.

If an accessible pickup-hold or fulfillment-exception field indicates that customer feedback or
instructions are needed, state that as an internal workflow need. It is not evidence that the
customer was contacted, replied, accepted an option, or received a remedy. This skill can prepare a
fact-grounded draft and handoff, but never enters instructions, resolves an exception, or changes a
store-pickup record.

Pick, Pack, and Ship can expose distinct operational stages. Explain an accessible stage only with
the record and field that establish it; do not collapse picked, packed, or shipped into a single
customer-delivery claim. Optional picking tickets, packing slips, return forms, and configured
fulfillment-confirmation email are workflow artifacts or settings, not evidence that an item was
picked, packed, shipped, delivered, or that a particular customer email was sent.

When the selected record is an item fulfillment in a validated Pick, Pack, and Ship workflow,
`Picked` means it awaits packing and shipment; `Packed` means it awaits shipment; and `Shipped`
means the item fulfillment was marked shipped. One order can have multiple item fulfillments at
different stages. Therefore, compare the accessible fulfillment lines and quantities before
describing an order as partially or fully shipped. Even a visible `Shipped` status is not carrier
acceptance or delivery evidence.

### Commitment and backorder are supply evidence

Do not equate a line's available, committed, allocated, backordered, or expected-supply state with
physical picking, packing, shipment, carrier handoff, or a customer delivery date. Treat each as a
line-scoped supply fact only after validating the field and its relationship to the selected order.
Commitment or allocation can change under account workflow; it is not a customer promise. A visible
backorder can support the narrow statement that the accessible line is backordered, but not a cause,
replenishment date, substitution, split-shipment decision, or remedy.

For a backorder question, keep the evidence at the selected order-line and validated location or
shipping-group scope. Retrieve only the accessible ordered, fulfilled, remaining, committed, and
backordered quantities needed to answer the question, preserving their unit of measure when shown.
Do not substitute an item-level quantity on hand, available, on order, or a report total for the
selected line's state. Such inventory measures can explain the accessible supply context, but do
not establish reservation for this order, an inbound receipt date, the priority of this customer,
or the outcome of a future reallocation.

When a selected order line and a separate current item/location balance expose different values,
do not call either the other's available, committed, or on-hand quantity. Preserve the source,
location/shipping-group, unit, and returned time for each. Resolve a mismatch only with validated
field semantics and direct order-line evidence; otherwise identify it as a source-scope or timing
difference that prevents a stronger commitment or ship-complete conclusion.

If a line has no accessible commitment or backorder value, state that its supply state cannot be
verified. Do not infer "not backordered," availability, or a ship-complete decision from a blank
field, an order-level status, another line, or an item-level aggregate. Route allocation,
reallocation, substitution, split-shipment, and replenishment decisions to the authorized
inventory or order-management workflow.

An assigned fulfillment location is not, by itself, inventory, commitment, or shipment evidence.
When Automatic Location Assignment and its optional backorder rules are configured, NetSuite can
assign a location to a backordered line without inventory at that location. If an account report is
used for a portfolio backorder question, preserve its stated transaction/line scope and verify how
kit or assembly-member quantities are treated before comparing it to a selected record.

For a backorder portfolio, preserve the selected report's grouping and time scope. NetSuite's Sales
Back Order report is transaction-oriented, while its Inventory Back Order report is item-oriented
with transaction detail. Neither a report total nor one report row establishes the selected order
line's current state without a direct order read. The Inventory Back Order report is a current view,
not a reporting-by-period source; do not present it as a historical-period population. Minimize
customer and transaction details in any output to only what the authorized question needs.

When a validated purchase-order receipt and selected line show that previously backordered quantity
is now committed, describe that narrowly as a current line commitment. It does not establish a
fulfillment, warehouse release, carrier handoff, delivery date, customer priority, or authorization
to reallocate stock. A receipt or item-level on-order figure without a validated selected-line
relationship cannot establish that this order received supply.

If the account uses NetSuite WMS and accessible wave, pick-task, or firm-commitment evidence is
material to the selected line, preserve its exact record, status, and line scope. Do not treat a
wave, a released pick task, or a firm commitment as an item fulfillment, shipment, or customer
promise. Creating, re-releasing, changing, or resolving WMS work remains outside this skill.

If a validated item-fulfillment quantity exceeds the original or remaining order-line quantity,
preserve the observed values and do not label the difference an error. An account preference can
permit fulfillment overages. Establish the applicable field meanings and configuration before
explaining the difference, then route any reconciliation or remedy to the authorized team.

## 4. Shipment and customer-update questions

For tracking or shipment questions, identify the selected fulfillment record before describing any
tracking, carrier, or shipment-date field. Confirm field semantics in the connected account. A
stored tracking value, date, or shipment label alone does not establish carrier acceptance,
in-transit location, delivery, or an exception.

In particular, an account can make a tracking number or shipping label available at a pre-shipment
stage. Treat a label or tracking number as an identifier or link until an account-validated carrier
event establishes pickup, transit, delivery, or an exception. If the connector cannot retrieve an
independent carrier event, say that it cannot establish that milestone rather than treating the
tracking number as its substitute. For split shipments, associate each accessible tracking value
with its validated item fulfillment or package; never present one tracking value as the state of
the entire order.

Treat a visible shipping method, `Ship Via` value, route, carrier default, or rate as a selected
record's configuration or preference until the current fulfillment and carrier evidence establish
otherwise. It does not by itself prove the actual carrier/service used, carrier acceptance, transit,
arrival estimate, or delivery. An account can derive a default from setup, an item, or a customer
and override it during fulfillment. Never prescribe a carrier-specific integration, label flow, or
availability merely from a carrier name; validate the connected account and selected fulfillment.

When multiple shipping routes or destinations apply, a sales order can have distinct item
fulfillments. Associate each accessible route, tracking identifier, stage, date, and carrier event
with its validated fulfillment or package. Do not combine route-level evidence into an order-wide
status, and do not expose a shipping address or route detail unless it is necessary for the
authorized question.

For a request to change a shipping address, retrieve only the order and fulfillment facts needed to
explain the current accessible state. Those record facts do not establish whether an address change
is eligible, permitted, or effective under the account's shipping, carrier-reroute, or post-delivery
process. Do not update an address or say that an edit will or will not affect a shipment. State the
verified record scope and route the eligibility decision to the authorized shipping or order
management process.

Likewise, a requested, estimated, automated, or planned ship date is not an actual shipment,
carrier-handoff, or delivery date. Interpret any date only after verifying its field semantics and
the selected record scope. A printed packing slip, return form, picking ticket, or other document
is a workflow artifact: it can support that the artifact exists, but does not prove its contents
were packed, shipped, delivered, received by the customer, or acted upon.

For a customer-facing draft, use only verified, customer-appropriate facts. State what is known,
what remains unverified, and the proposed next owner or check. Do not promise dates, replacement,
refund, shipping method, inventory availability, or service-level outcome. Mark the result as a
draft for the representative to review; do not claim it was sent, logged, or associated with a
case. A configured fulfillment-confirmation email can have different documented trigger points
depending on Advanced Shipping and Pick, Pack, and Ship; configuration or a fulfillment status
does not establish that an individual message was generated, received, or delivered.

## 5. Operational handoff

Give the representative a concise internal handoff containing the selected record reference,
affected line/fulfillment quantity when accessible, verified state or exception, the exact question
needing resolution, next accountable team, and evidence limitation. Include a next verification
point only when it comes from an accessible policy or record; do not invent an SLA or escalation
deadline. Exclude unneeded PII, addresses, payment data, internal free text, and irrelevant item
or inventory details. Do not diagnose a delay, assign fault, or assert a warehouse action without
evidence.

An accessible exception reason or fulfillment-generation failure is an operational signal, not a
customer-facing diagnosis. Preserve its line/stage scope and route resolution to the authorized
fulfillment team. Do not reveal internal comments or turn it into a promised replacement, refund,
reroute, cancellation, or carrier claim.

A customer-level credit hold can restrict new credit sales according to customer data and accounting
preferences. It does not, by itself, establish why an existing order, line, or fulfillment is held
or whether that order can proceed. Report only the validated record relationship and exact visible
state; route credit decisions to the authorized finance or order-management owner.

If the requested remedy requires fulfillment execution, inventory allocation, shipment creation,
bulk processing, cancellation, or a carrier-system action, direct the representative to the
organization's authorized fulfillment workflow. If it is a return, switch to Return Authorization
Assistant; if it concerns a support case or customer-response send/log, switch to NetSuite
Customer Support Assistant.

## 6. Output shape

Use this order unless the user requested a primary artifact:

1. **Verified status:** concise answer with no unsupported operational conclusion.
2. **Evidence and scope:** selected order/fulfillment, source, and relevant line or fulfillment
   scope.
3. **Unknowns or limitations:** specific inaccessible field, unvalidated relationship, permission,
   or missing policy.
4. **Next step:** accountable team or unresolved decision, without save or fulfillment instructions; include a customer-safe draft only on
   request.
