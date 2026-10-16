# Order status and exception evidence

Use this reference for one selected Sales Order's current status, scheduled/requested ship date,
backorder, commitment, approval-state, hold, or fulfillment-blocker question. It does not establish
shipment, carrier activity, billing, credit disposition, or a customer commitment. For linked
documents, shipment/tracking, billing, fulfillment requests, or line-progress analysis beyond the
requested blocker, read [Fulfillment evidence and order exceptions](fulfillment-evidence-and-order-exceptions.md).

## Contents

- [Selected order and date scope](#selected-order-and-date-scope)
- [Approval-state evidence](#approval-state-evidence)
- [Customer credit-state evidence](#customer-credit-state-evidence)
- [Line supply and blocker evidence](#line-supply-and-blocker-evidence)
- [Holds and negative conclusions](#holds-and-negative-conclusions)
- [Delivery and handoff](#delivery-and-handoff)

## Selected order and date scope

Resolve and directly read the selected Sales Order before evaluating a blocker. Use the returned
order-level status only as its recorded order state. A status does not establish the state of every
line, the existence or count of fulfillments, shipment, billing, delivery, or the cause of a delay.

Report a returned `shipDate` as a scheduled/requested ship date unless the connected account
explicitly validates it as another field meaning. A blank or omitted due date is only unavailable
due-date evidence. Do not label an order late, overdue, promised, or exception-free from dates
alone.

## Approval-state evidence

When an approval-based blocker is material and the selected order's direct read does not expose a
readable approval state, validate `transaction.approvalstatus` for the current account and role.
For the already-confirmed selected Sales Order, this bounded query can retrieve the raw value and
display label:

```sql
SELECT id, tranid, status, approvalstatus,
       BUILTIN.DF(approvalstatus) AS approvalstatus_label
FROM transaction
WHERE id = [SELECTED_SALES_ORDER_INTERNAL_ID]
```

Use a non-null returned label only as the selected order's recorded approval state. It does not
establish a credit hold, fraud hold, inventory block, fulfillment exception, or the customer-facing
reason for the state. If both `approvalstatus` and its display label are null or omitted, state that
an approval-based blocker cannot be verified from this source. Do not call the order free of an
approval hold or infer that no approval workflow applies.

## Customer credit-state evidence

When a credit blocker is material, first confirm the selected Sales Order's explicit customer
relationship and use that returned internal ID. Validate the customer source and the required
fields, then retrieve only the current credit-state facts needed for the question:

```sql
SELECT id, oncredithold, overduebalancesearch, balancesearch
FROM customer
WHERE id = [SELECTED_ORDER_CUSTOMER_INTERNAL_ID]
```

`oncredithold = 'F'` supports the narrow statement that the selected customer's currently returned
credit-hold flag is off. `overduebalancesearch` and `balancesearch` are recorded customer balance
facts at the returned scope. Do not use them to rule out an approval, inventory, fulfillment,
fraud, address, or other order-level blocker. Do not add `creditHoldOverride` or `creditLimit`
unless the user specifically asks about credit configuration rather than current credit state.

If a focused customer record read omits the credit-hold flag or a zero balance value, treat those
fields as unavailable from that response. Use the validated SuiteQL path when the credit-state fact
is material; do not infer false or zero from the omission.

## Line supply and blocker evidence

Classify each affected line from validated line semantics before using it as blocker evidence. A
shipping, tax, discount, subtotal, description, or other non-fulfillable line is not a product
line and must not be called unfulfilled, backordered, clear to ship, or the order's blocker.

For a validated fulfillable line, preserve ordered, committed, backordered, fulfilled, and any
allocation quantity separately, with their returned unit and source scope. A visible backordered
quantity can support the narrow statement that the selected line is currently recorded as
backordered. Commitment, allocation, or a zero backordered quantity are supply facts only; none
establishes picking, packing, shipment, carrier handoff, delivery, a cause, a future allocation, or
a customer promise.

Do not substitute a current item/location on-hand or available balance for the selected order
line's commitment or backorder state. If those sources differ, preserve the mismatch and route the
allocation explanation to warehouse or order management rather than guessing at reservation,
timing, priority, or allocation strategy.

## Holds and negative conclusions

Check each requested hold or exception through its applicable, validated source. An order status,
approval state, date, line commitment, zero backordered quantity, current inventory balance, or
empty related-document lookup cannot establish that every other hold or exception is absent.

If a focused record read omits a requested boolean, numeric, or status field, treat that field as
unavailable. Do not interpret the omission as false, zero, blank, or nonexistence. When the fact is
material, use a metadata-validated alternate source or state the precise source limitation.

## Delivery and handoff

Lead with the narrowest verified blocker, or state which blocker category cannot be verified. Then
list only material facts, such as the recorded order state, scheduled/requested date, and selected
line's backorder/commitment values. Distinguish a visible supply mismatch from an explanation of
why it occurred.

When an accessible line is backordered or uncommitted without a verified cause, route allocation,
reallocation, substitution, split shipment, or replenishment decisions to warehouse or order
management. Do not make a customer delivery, resolution, or inventory commitment.
