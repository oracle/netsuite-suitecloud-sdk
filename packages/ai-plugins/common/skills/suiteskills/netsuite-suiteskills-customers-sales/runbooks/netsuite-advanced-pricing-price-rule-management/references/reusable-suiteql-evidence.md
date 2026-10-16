# Reusable SuiteQL evidence patterns

Use this catalog only after selecting the owning workflow and authoritative source. These patterns
reduce repeated discovery; they do not override a skill's report-first rule, direct-record
preference, data-minimization limit, or account/role metadata validation.

## Contents

- [Display labels with `BUILTIN.DF`](#display-labels-with-builtindf)
- [Omitted values from focused record reads](#omitted-values-from-focused-record-reads)
- [Sales Order raw-status labels](#sales-order-raw-status-labels)
- [Next transaction candidates](#next-transaction-candidates)
- [Customer identity fields](#customer-identity-fields)
- [Customer credit-state facts](#customer-credit-state-facts)
- [Customer payment applications](#customer-payment-applications)
- [Adoption rules](#adoption-rules)

## Display labels with `BUILTIN.DF`

When a metadata-confirmed reference or list field needs a human-readable label, use
`BUILTIN.DF(field)` in the query on the source record when the connected account supports it:

```sql
SELECT BUILTIN.DF([REFERENCE_OR_LIST_FIELD]) AS display_value
FROM [VALIDATED_SOURCE]
```

It returns the display value of the referenced field without an explicit target-record join. Use
the returned label only as the display value for that selected field. It does not establish a
business event, lifecycle meaning, customer commitment, or relationship outside the selected
record's scope. Do not use it as a filter unless current metadata and the owning workflow establish
that path as necessary and safe. If it is unavailable, do not guess a label from a raw ID or code.

## Omitted values from focused record reads

If a focused direct-record read omits a requested boolean, numeric, reference, or status field,
treat the value as unavailable from that response. Do not read omission as `false`, zero, blank, or
nonexistence, and do not retry the same request merely to obtain the desired value. When the field
is material, use a metadata-validated alternate source with the required scope or state the precise
source limitation. A single observed omission does not establish a platform-wide connector defect.

## Sales Order raw-status labels

For an already-selected Sales Order whose source exposes only a raw status code and cannot return a
readable label through `BUILTIN.DF(status)`, validate `transactionStatus` and its `id`, `name`, and
`trantype` fields. Then retrieve the status candidates for the Sales Order transaction type:

```sql
SELECT id, name, trantype
FROM transactionStatus
WHERE trantype = 'SalesOrd'
```

Match the selected order's raw status only to a returned `id` within that same `SalesOrd` scope,
then present the corresponding `name` as the order's recorded status label. Do not hardcode a
code-to-label map, reuse this list for another transaction type, or infer fulfillment, shipment,
billing, or line state from the resulting order-level label.

## Next transaction candidates

For a selected transaction whose direct read lacks an explicit downstream relationship, validate
`NextTransactionLink` and `previousdoc`, `nextdoc`, and `linktype`. A bounded candidate-discovery
query is:

```sql
SELECT DISTINCT nextdoc, linktype
FROM NextTransactionLink
WHERE previousdoc = [SELECTED_TRANSACTION_INTERNAL_ID]
```

The result is a related-transaction candidate set. Preserve its relationship grain, deduplicate
candidate document IDs, and direct-read each reachable document before reporting its type, status,
or relationship. Empty or inaccessible results mean this path returned no accessible link rows;
they do not prove that no fulfillment, invoice, payment, return, or other related activity exists.

## Customer identity fields

For a user-supplied customer code or name, `customer.entityid`, `customer.companyname`, and
`customer.entitynumber` are candidate identity fields when current metadata exposes them. A
displayed Customer ID or code is a business identifier candidate, not the record's internal ID.
Validate the supplied identifier and name/display evidence together, obtain the selected record's
internal ID, and read the selected record before dependent retrieval. Do not assume these fields
are interchangeable, universally available, or equivalent for individual and company customers.

## Customer credit-state facts

When an authorized workflow needs the current credit state of a customer explicitly related to a
selected transaction, validate `customer.oncredithold`, `customer.overduebalancesearch`, and
`customer.balancesearch`. Retrieve the minimum current facts:

```sql
SELECT id, oncredithold, overduebalancesearch, balancesearch
FROM customer
WHERE id = [SELECTED_TRANSACTION_CUSTOMER_INTERNAL_ID]
```

`oncredithold = 'F'` supports only that the returned customer credit-hold flag is currently off.
The balance fields are recorded customer balance facts at the returned scope. Neither result rules
out approval, inventory, fulfillment, fraud, address, or another transaction-level blocker, and
neither is a customer commitment. Do not retrieve credit-limit or override configuration unless the
user specifically asks about that configuration. If a focused direct record read omits the material
flag or a zero balance, treat it as unavailable from that response and use this validated alternate
path or state the limitation.

## Customer payment applications

For an already-selected and directly confirmed invoice, validate `customerPaymentApplyLine` and
its `doc`, `parenttransaction`, `amount`, `applydate`, and `currency` fields. A bounded payment
candidate query is:

```sql
SELECT parentTransaction, doc, amount, applyDate, currency
FROM customerPaymentApplyLine
WHERE doc = [SELECTED_INVOICE_INTERNAL_ID]
```

The result is application-line grain. Complete the bounded pages, retain each application amount
and currency, deduplicate `parenttransaction`, and direct-read each reachable `customerpayment`
before reporting its header status or balances. The application `amount` is not the payment total,
total applied, or unapplied amount. A returned `customerpayment.unapplied` value of zero can support
only that selected payment's current unapplied amount being zero; it does not rule out other
unapplied payments, duplicate charges, or settlement activity elsewhere.

## Adoption rules

1. Use an entry only if it fits the selected skill's scope and source hierarchy.
2. Validate the named source, fields, relationship, and result grain for the current account and
   role before relying on it.
3. Keep query values bounded and scoped to the selected record or requested population.
4. Preserve the entry's stated evidence limit in the user-facing result.
5. Place specialized interpretation, write controls, and feature-specific source paths in the
   owning package, not in this catalog.
