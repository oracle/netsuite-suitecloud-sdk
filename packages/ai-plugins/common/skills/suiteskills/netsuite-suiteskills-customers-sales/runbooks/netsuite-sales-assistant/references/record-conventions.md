# Record Conventions

Read this reference for record reads, financial rollups, metadata failures, status resolution, or REST/SuiteQL naming.

## Scoped and full record reads

Use `ns_getRecord` with `fields` for read-only questions that need only top-level scalar fields. For example:

```text
ns_getRecord(recordType: "salesorder", recordId: [id], fields: "tranId,tranDate,status,total")
```

Sublist fields do not reliably return in scoped reads. Use a full record only when the seller needs line-item detail, quantities, products, customer pricing sublists, or a proposed human change that needs review.

Do not use `transactionline` as a substitute for the item sublist. Its quantities and amounts can use an inverted sign convention, and Kit items can return component rows that inflate the apparent line count.

## Financial rollups

For balance, overdue balance, unbilled orders, and deposit balance, prefer a scoped `customer` record read for `balance`, `overdueBalance`, `unbilledOrders`, and `depositBalance`. Do not assume these rollups are available as flat SuiteQL columns.

## Broken metadata

If `ns_getSuiteQLMetadata` explicitly identifies a corrupted or deprecated custom field, do not retry it. Stop any query whose required schema cannot be established. Use an independently supported record read or verified saved search and note the limitation; a standard-field example is not schema evidence.

## Transaction status

Never hardcode a transaction status-code mapping. Resolve `status.refName` live through `ns_getRecord`; raw SuiteQL `status` values are not safe seller-facing labels.

`status.id` behavior is being standardized in NetSuite 2026.2. Do not compare it to text labels. Use `status.refName` for a human-readable label before and after the upgrade.

## REST record types and SuiteQL transaction types

REST record types and SuiteQL `transaction.type` values are different conventions. Confirm accessible REST record types through `ns_getRecordTypeMetadata` before use.

| Purpose | REST record type | SuiteQL type, if applicable |
|---|---|---|
| Customer / Prospect / Lead | `customer` | — |
| Contact | `contact` | — |
| Phone Call | `phonecall` | — |
| Task | `task` | — |
| Opportunity | `opportunity` | `Opprtnty` |
| Estimate / Quote | `estimate` | `Estimate` |
| Sales Order | `salesorder` | `SalesOrd` |
| Invoice | `invoice` | `CustInvc` |
| Cash Sale | `cashsale` | `CashSale` |
| Support Case | `supportcase` | — |
| Project | `job` | — |
| Credit Memo | Verify live | `CustCred` |
| Customer Payment | Verify live | `CustPymt` |

## Opportunity and forecast context

An Opportunity records a potential deal with a prospect or customer. It can appear in open-
opportunity and sales-forecast reporting. When an estimate is created from an opportunity, an
account's forecast can use the estimate rather than the opportunity; when multiple estimates
exist, the account can designate which one it includes. Use the selected account report or saved
search to establish what is actually included. Do not assume every opportunity, estimate, or
related order is counted the same way in every account or report.
