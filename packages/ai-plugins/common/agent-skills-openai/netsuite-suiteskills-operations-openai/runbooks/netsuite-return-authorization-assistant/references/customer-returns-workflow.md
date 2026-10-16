# Customer Returns Workflow Context

Read this reference only when preparing an RMA, explaining return-process configuration, or
interpreting approval, receipt, credit, refund, or reporting context. Verify the connected
account's enabled features, forms, preferences, fields, and role permissions before treating any
behavior here as available or applicable.

## Contents

- [Process model](#process-model)
- [Setup and preferences](#setup-and-preferences)
- [Issuing an authorization](#issuing-an-authorization)
- [Approval, receipt, and status](#approval-receipt-and-status)
- [Review and reporting context](#review-and-reporting-context)
- [Credits and refunds](#credits-and-refunds)
- [Scope boundaries](#scope-boundaries)

## Process model

Customer returns have two connected processes:

1. **Customer return management** — issue and, when required, approve a return authorization;
   receive the returned item; then complete the associated credit/refund and closeout work.
2. **Customer credits and refunds** — issue a credit memo or a customer refund after the return
   reaches the applicable stage.

A return authorization is a non-posting record of an expected return. It tracks expected items,
quantities, prices, workflow status, and the amount to credit or refund. Creating it does not by
itself receive inventory or create a financial transaction.

Return authorizations are also the cross-functional review record: receiving can verify expected
items and quantities, accounting can see credit/refund progress, and management can use return
reports. When reviewing one, use the authorization together with accessible item receipts and
credit/refund records; do not treat the authorization status by itself as proof of every completed
operational or financial step.

## Setup and preferences

- Return Authorizations must be enabled. The Default Return Authorization Status preference sets a
  default initial status; it does not by itself establish that every authorization must go through
  approval, because users may be able to choose another available status during entry. Verify the
  selected authorization's actual initial status, available values, workflow, form, and role
  permissions in the connected account rather than assuming a status value.
- Refund in Advance of Return can allow a credit or refund before receipt. Without it, receipt
  timing can control whether an item is eligible for credit/refund.
- Advanced Receiving changes the process and statuses. It also supports a received inventory item
  being restocked or written off; the account can configure a default.
- The account can enforce an item's minimum order quantity on return authorizations. Do not assume
  the preference or calculate a minimum unless the account configuration and item data verify it.

## Issuing an authorization

- A **linked** authorization is created from a sales order, cash sale, or invoice. It carries
  forward sale information such as items, quantities, and prices, and is linked to the sale.
- A **standalone** authorization is not linked to a sale. It requires the necessary customer,
  item, quantity, price, currency, and other required information to be entered independently.
- The selected custom form affects whether the return is credit-oriented or cash-refund-oriented.
  Standard credit forms generate a credit memo; standard cash forms generate a refund. Custom
  forms and account settings can change what is actually available, so verify before selecting a
  form or describing a financial result.
- For serialized items, the account may require the appropriate serial-number context. For
  OneWorld, multiple currencies, multi-location inventory, and custom classifications, confirm
  the applicable subsidiary, currency, location, and fields rather than assuming defaults.

## Approval, receipt, and status

- A return in **Pending Approval** is not yet authorized and cannot be received, credited, or
  refunded until an authorized user approves it. Approval gives the operational teams permission
  to process that return; it is not a customer-policy decision the assistant may make.
- Receiving a return creates an item receipt against the authorization, updates the receipt and
  inventory context, and may update the return status. With Advanced Receiving, the receiver
  chooses received quantities and restock versus write-off treatment.
- In the standard workflow, returned items are marked received before the associated credit memo
  is issued. If the customer requests a refund of that credit, the authorization reaches
  **Refunded** only after all authorized items have been received. When items remain outstanding,
  it remains **Partially Received** and returns to the receiving workflow for the remaining
  quantity. Verify the account's actual status labels and configured exception process.
- With Advanced Receiving, documented statuses include Pending Approval, Pending Receipt,
  Partially Received, Pending Refund, Refunded, Canceled, and Closed. Without Advanced Receiving,
  the documented statuses include Pending Approval, Pending Refund, Partially Refunded, Refunded,
  Canceled, and Closed. Treat labels and transitions as account-specific until verified.
- Related Records can show item receipts and financial records. A status or history row alone does
  not prove an item was physically received, a refund was paid, or a credit was applied.

## Review and reporting context

- Review a selected authorization by confirming its return number, customer, source-sale link (if
  any), status, item lines, authorized quantities, received quantities, and accessible related
  item receipts, credit memos, or refunds.
- The standard Return Authorizations Register can show transaction date, return number, customer
  or project, status, and order total. Open Return Authorizations can show expected credit/refund
  amounts, and Return Authorizations Pending Receipt can show authorized and returned quantities.
- Use those reports only for a requested operational view, not to rank workload, assign ownership,
  or decide which returns need attention. Report output is operational evidence, not authority to
  approve, receive, credit, refund, close, or change a return. State the report/filter, period,
  record count, and visibility limitations.

## Credits and refunds

- A **credit memo** records customer credit and can be applied to an open or future invoice. It
  may later be refunded where the account's process permits it. An RMA-created credit memo is
  distinct from a standalone credit memo; do not substitute one for the other.
- A **customer refund** records funds paid back to a customer. It is distinct from a cash refund
  for an immediately paid cash sale. Its presence does not by itself prove a separate payment or
  payment-processing step completed.
- With Advanced Receiving, credit is created before a refund. Without it, a refund can be created
  directly from an authorization. Refund in Advance of Return can alter timing.
- For a partial return, received quantity is a receipt fact, not financial eligibility. Do not
  infer that the matching line, a calculated amount, or a partial credit/refund is currently
  allowed from quantity or status alone. Verify the account's preference, form/process, policy,
  and direct financial-record evidence before describing a partial financial outcome.
- Do not create, apply, or refund a credit memo, or create a customer refund, from this skill.

## Scope boundaries

- Do not approve a return, receive it, choose restock/write-off treatment, close lines, print
  forms, or configure return preferences. Those actions affect inventory, accounting, operations,
  or customer communications.
- Use return-authorization reports only for a requested operational view. Standard reports can
  show authorization status, open expected credit/refund amounts, and expected receipt quantities;
  do not reconstruct governed measures from raw records when an accessible report answers the
  question. Requests to prioritize, rank, assign, or manage a return queue are out of scope.
