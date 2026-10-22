# Account Brief Workflows

Read this reference for customer, prospect, or lead resolution; activity, transaction, support-case, or Project context.

## Contents

- [Customer, prospect, and lead resolution](#customer-prospect-and-lead-resolution)
- [Activity and phone-call context](#activity-and-phone-call-context)
- [Open transactions](#open-transactions)
- [Support cases](#support-cases)
- [Projects](#projects)

## Customer, prospect, and lead resolution

Leads, prospects, and customers use the `customer` entity record type. They can be companies or people (`isPerson: true`). When metadata confirms it is available, use `altname` as the display name for either type. Do not treat `companyname` as a universal person name: for an individual, it can identify an employer instead. A number or code shown with a customer name can be an auto-generated Customer ID/entity identifier; it is not an internal ID. Search the complete supplied reference through validated identifier and name fields, confirm the selected record, and only then retain its internal ID for the next read.

Search all relevant name fields together. Add an email predicate only when the seller supplied an email; never leave an empty email placeholder in a `LIKE` clause. Retrieve phone or email only when the supplied identity requires those fields for disambiguation. Use the query-construction safeguards in `SKILL.md` for every seller-supplied value.

```sql
SELECT id, entityid, altname, firstname, lastname
FROM customer
WHERE (
  UPPER(altname) LIKE '%[ESCAPED_NAME]%'
  OR UPPER(entityid) LIKE '%[ESCAPED_NAME]%'
  OR UPPER(lastname) LIKE '%[ESCAPED_NAME]%'
  OR UPPER(firstname) LIKE '%[ESCAPED_NAME]%'
  /* Add only when supplied: OR UPPER(email) LIKE '%[ESCAPED_EMAIL]%' */
)
  AND ROWNUM <= 20
```

If this returns zero rows, do not try spelling guesses, use fuzzy matching, or list a broad customer directory. Say that the record cannot be confidently identified and ask for an email address, phone number, NetSuite customer ID, exact or partial legal/company name, known alias, or location.

## Activity and phone-call context

Use an accessible saved search first. Use SuiteQL only if no suitable saved search exists. For a default brief, retrieve pending activity rather than full history; retrieve broader history only when the seller asks and state the cap.

```sql
SELECT id, title, status, startdate
FROM activity
WHERE company = [customerId]
  AND status IN ('SCHEDULED', 'NOTSTART')
  AND ROWNUM <= 20
```

For a seller-requested history pass, remove the status filter, use `ROWNUM <= 50`, and state the scope. Some accounts include auto-generated integration activity; filter it only after observing that pattern in the returned data.

For past phone-call detail, use the same report/saved-search-first approach. Do not describe a SuiteQL result as “most recent” unless the ordering-and-limit pattern has been validated; otherwise use a saved search or report that guarantees the required sort order.

## Open transactions

An account brief should focus on sales-cycle documents, not the entire accounting trail. Start with this candidate scope, then resolve each record's human-readable status label live:

```sql
SELECT id, tranid, trandate, type, status
FROM transaction
WHERE entity = [customerId]
  AND type IN ('Opprtnty','Estimate','SalesOrd','CustInvc','CustPymt','CustCred','CashSale')
  AND ROWNUM <= 20
```

Add sales-cycle types only when the seller's line of business uses them. Use `ns_getRecord` with scoped fields such as `tranId,tranDate,status,total` to resolve `status.refName`.

Show labels that clearly read as unresolved or in progress, such as “Pending,” “Open,” “Partially,” or “In Progress.” Hold back labels that clearly read as terminal or historical, such as “Closed,” “Cancelled,” “Voided,” “Rejected,” “Paid In Full,” “Fully Billed,” “Billed,” or “Applied.” State the held-back count. If a label is ambiguous, include it and let the seller judge.

This is a heuristic, not a universal status taxonomy. Do not filter by raw status code. For complete history, use a report or saved search; use capped SuiteQL only when the seller explicitly requests it.

`CustCred` and `CustPymt` are SuiteQL transaction type codes, not guaranteed REST record-type names. If a scoped record read for one fails, keep the available query fields and say that full detail was unavailable for that transaction; do not let it block the rest of the brief.

Use a full transaction record only when the seller asks for line items, quantities, or products. Do not substitute a `transactionline` query for the item sublist; see [Record conventions](record-conventions.md).

## Support cases

For a selected support case named by displayed case number, resolve that number in one
narrow case lookup to obtain the internal ID, then read the case directly. Do not attempt a
record read using the displayed number or list reports/saved searches to resolve it.

```sql
SELECT id, caseNumber
FROM supportcase
WHERE caseNumber = [VALIDATED_CASE_NUMBER]
  AND ROWNUM <= 5
```

Use a validated numeric case number, not an interpolated raw value. If exactly one candidate
is returned, use its internal `id` for the scoped support-case read. If multiple candidates are
returned, show a minimal distinguishing list and ask the seller to choose. If no candidate is
returned, state that no matching accessible case was returned for that displayed number; do not
broaden into customer history or infer that the case does not exist.

For a seller-requested full account brief, look for an accessible support-case saved search first. If no suitable search exists, confirm `supportcase` metadata before querying. If it is unavailable because of a feature or role restriction, say support-case context is unavailable; do not say that the customer has no cases.

```sql
SELECT id, title, status, dateCreated
FROM supportcase
WHERE company = [customerId]
  AND ROWNUM <= 20
```

Verify field names against metadata: `dateCreated` is camelCase and `status` is a numeric code. Resolve the human-readable status with `ns_getRecord` on the individual case. Summarize only accessible unresolved cases and those within a seller-provided review horizon; do not call a case “recent” without a stated horizon.

A case-header message timestamp establishes only a last case message/update, not a customer
message. Use “last customer message” only when a retrieved Message record verifies customer
authorship. On a direct selected-case read, inspect `incomingMessage` when the account returns
it. Treat that value as **case-record incoming-message content** unless its field semantics and
the case-creation context establish that it is the original customer message. Never treat the
case title as message text or infer a named author from a contact field, reply salutation, or
other indirect clue.

Account briefs may use only the minimum reported-issue context needed for the call; they do not
retrieve or summarize case-message history by default. When the seller asks to show, read, list,
summarize, or interpret messages for a selected case, switch to the selected-case investigation
mode in **NetSuite Customer Support Assistant**. Do not duplicate its Message-table discovery or thread-reconstruction workflow here,
and do not imply that a case's available `incomingMessage` or any case header is a complete thread.

## Projects

Projects are `job` entity records, not transactions. Retrieve them only when the seller asks.

```sql
SELECT id, entityid, companyname, parent, entitystatus
FROM job
WHERE parent = [customerId]
  AND ROWNUM <= 20
```

Use `parent`, not `entity` or `company`, to link a Project to a customer. The REST record type is `job`, not `project`. Missing Project permission can surface as an explicit record-read permission error or as a generic SuiteQL “not found” error; do not treat the latter as proof the record type does not exist.
