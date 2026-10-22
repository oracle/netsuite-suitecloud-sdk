# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Incoming supply from open purchase orders

Read this reference only when the user explicitly asks when more of a prospective item may arrive,
asks whether more is on order or planned for replenishment, asks for open Purchase Order lines, or
asks for recorded expected receipt dates. Do not load it for ordinary current-stock, availability,
quantity, location, or “in stock” requests. This is a read-only incoming-supply view, not a
replenishment forecast, customer commitment, or purchase-order action.

## Contents

1. [Decision and scope](#decision-and-scope)
2. [Source selection](#source-selection)
3. [Line and date semantics](#line-and-date-semantics)
4. [Response and handoff](#response-and-handoff)
5. [Validation questions](#validation-questions)

## Decision and scope

Establish the selected item first. Ask only for a location, subsidiary, unit, time window, or
whether to include all accessible vendors when that information would materially change the
returned lines. The result answers a narrow question: which accessible, open PO lines for the
selected item have a recorded remaining quantity and expected-receipt-date field. It does not
establish that every open PO is regular replenishment for the selected location.

Do not infer this request from an ordinary question about stock. For example, “How much do we have?”
and “Is this item in stock?” require current inventory evidence only. “When will we get more in?”
or “Do we have more on order?” activates this reference. If the user asks for both, answer the
current balance and incoming-supply evidence in clearly separate sections.

Keep this result separate from a current inventory balance and label each source and scope. Do not
add incoming quantity to current available quantity, offset it against demand, calculate a future
available balance, assign a customer order, or say when an item will be available, received,
fulfilled, or delivered.

## Source selection

For a selected item, prefer an accessible governed Purchase Order line report or saved search when
it can return the selected item, open remaining quantity, unit, location when applicable, exact
receipt-date field, PO reference, and result filters in one compatible line-grain result. Verify
that the result excludes closed, cancelled, and fully received lines according to the account's
returned status and remaining-quantity behavior. For location-scoped supply, preserve the returned
subsidiary and location scope. Do not assume a central or multi-subsidiary PO supplies every
location.

Do not assume the standard Purchase Order History report is suitable for this question. It is useful
for ordered, received, and billed history, but use it only when the accessible result also proves
the required PO-line remaining quantity, open state, scope, and returned date field.

If a suitable report or saved search is unavailable, resolve only the selected item, then use a
focused Purchase Order record read or a narrow, metadata-confirmed query. Before using a
transaction or transaction-line path, validate the exact PO-type discriminator, selected item
relationship, remaining-quantity field, returned date field, line-closure/receipt state, unit,
location, subsidiary when material, fulfilment or destination type when exposed, and row cap. Do
not infer a line's remaining quantity from the PO header, original ordered quantity, receipt
document count, or a general item `on order` total.

Do not include a drop-shipment line as general incoming inventory: NetSuite documents that the
vendor sends it directly to the customer and it is not processed in inventory. Treat a special
order as customer-specific until the returned source proves it is regular replenishment to the
requested inventory location. For an existing sales order linked to either type, route shipment,
commitment, or fulfillment questions to Customer Service Order Triage.

Use one bounded result for the selected item and defined scope. Do not enumerate every open PO,
vendor, location, or transaction merely because the user asks when stock will arrive. If a cap or
permission limit prevents a complete result for the requested scope, state that it is a partial
accessible PO-line view rather than claiming all incoming supply.

## Line and date semantics

Use a returned quantity only when it is explicitly established as the open or remaining quantity
for that PO line. Preserve the returned unit and do not compare it with current stock or a requested
quantity without a verified item-specific conversion.

Display the returned date with its exact source label. An **Expected Receipt Date** is the date
recorded on the PO as anticipated receipt timing; it is not proof that a vendor confirmed it, that
the item was received, or that it will be available in a particular location. A different returned
field, such as a header-level **Receive By** date, due date, or ship date, must retain that label
and cannot be substituted for an expected receipt date. A defaulted date is still only the recorded
PO value, not an independently verified estimate.

Do not treat an open PO as a receipt. A partially received or closed line can change the remaining
quantity and its relevance. A closed line represents quantity not intended to be received, while a
partially received line requires the remaining line quantity rather than the original ordered
quantity. When the accessible source cannot establish line-level closure or remaining quantity,
report the narrower PO fact or state that incoming supply cannot be established for the requested
scope. A completed item receipt is evidence of a receipt already processed, so use current inventory
evidence for stock now rather than reporting it as future supply.

Warehouse Management and Advanced Receiving are account configurations, not generic incoming-supply
sources. If they are enabled, validate their accessible receipt and location semantics in that
account. Do not infer an unreceived PO line's future availability from warehouse-task activity.

## Response and handoff

Lead with the recorded incoming-supply conclusion. For several material lines, use this shape:

```markdown
| PO reference | Remaining quantity | Unit | Location | Expected receipt date |
| --- | ---: | --- | --- | --- |
```

Use the actual returned date-field label in the final header if it differs. Omit vendor names,
costs, internal IDs, and PO references unless they are requested or necessary to distinguish the
returned lines. Render an unavailable date as `—` and say that it was not returned for that line;
never fill it from another PO field or infer it from historical lead time.

End with a factual boundary when necessary: the listed dates are recorded open-PO evidence, not a
promise of receipt or customer delivery. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions. Route existing sales-order shipment, commitment, or fulfillment
questions to Customer Service Order Triage.

## Validation questions

Before treating this workflow as supported for a connected account and role, validate:

- the accessible Purchase Order record, report, saved-search, or query path and its PO-line grain;
- item, remaining-quantity, unit, location, and date-field meanings and accessibility;
- open, closed, cancelled, partially received, and fully received line behavior;
- standard, drop-shipment, and special-order behavior, including whether the returned destination
  is the requested inventory location;
- Expected Receipt Date versus `Receive By`, due, and ship-date behavior;
- date, subsidiary, location, vendor, and result-cap filters;
- direct, paraphrased, and adjacent existing-sales-order activation prompts; and
- the limitation response when a date, line state, quantity, or complete accessible population is
  unavailable.
