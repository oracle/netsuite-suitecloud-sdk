# NetSuite record links

Read this reference when a response names an accessible NetSuite record and a direct UI link
would help the user open it. A link is navigation, not evidence of record contents or access.

Prefer a human-facing record URL returned by an authorized NetSuite tool. If one is absent and
the current account ID is not already known, use the authorized session-context tool once to
obtain it when that tool is available; reuse a current-session result. Build a view link when the
current session establishes the account ID, the selected record's type, and its internal ID. For
a production account, use the documented NetSuite UI pattern below with the
account ID in lowercase. For sandbox and Release Preview IDs, use the exact UI host from NetSuite
when available; their `_SB` and `_RP` suffixes appear with a hyphen and lowercase letters in the
host. Never use the SuiteTalk REST host or the connector's server label as the UI host.

```text
https://<accountid>.app.netsuite.com<view-path>?id=<selected-record-internal-id>
```

Here, `<accountid>` means the account-specific UI host prefix for the current session, including
any sandbox or Release Preview suffix in its URL form. Use the internal ID from the selected,
accessible record, not a document number, displayed entity
ID, or related record. Keep the URL in view mode. Link the human-readable record name/number;
the internal ID need not appear separately in prose. If the host, type, ID, or path is uncertain,
show the record label without a constructed link. Never link a result that has not been resolved
to a specific accessible record. The recipient's NetSuite permissions still govern access.

The paths below come from Oracle examples or user-provided view URLs from a NetSuite account.
Treat them as generic patterns, and verify a path in the current account when its UI behavior is
uncertain. Record type names are Connector/REST identifiers where documented or used by the
owning skill; validate current-account metadata where that skill requires it.

| Record | Record type | View path |
| --- | --- | --- |
| Lead, prospect, customer | `customer` | `/app/common/entity/custjob.nl` |
| Sales order | `salesorder` | `/app/accounting/transactions/salesord.nl` |
| Employee | `employee` | `/app/common/entity/employee.nl` |
| Return authorization | `returnauthorization` | `/app/accounting/transactions/rtnauth.nl` |
| Item receipt | `itemreceipt` | `/app/accounting/transactions/itemrcpt.nl` |
| Item fulfillment | `itemfulfillment` | `/app/accounting/transactions/itemship.nl` |
| Support case | `supportcase` | `/app/crm/support/supportcase.nl` |
| Contact | `contact` | `/app/common/entity/contact.nl` |
| Estimate / quote | `estimate` | `/app/accounting/transactions/estimate.nl` |
| Invoice | `invoice` | `/app/accounting/transactions/custinvc.nl` |
| Sales Price Rule | `salespricerule` | `/app/pricing/pricerule.nl` |
| Marketing campaign | `campaign` | `/app/crm/marketing/campaign.nl` |
| Item | `item` | `/app/common/item/item.nl` |
| Opportunity | `opportunity` | `/app/accounting/transactions/opprtnty.nl` |
| Cash sale | `cashsale` | `/app/accounting/transactions/cashsale.nl` |
| Credit memo | `creditmemo` | `/app/accounting/transactions/custcred.nl` |
| Customer refund | `customerrefund` | `/app/accounting/transactions/custrfnd.nl` |
| Cash refund | `cashrefund` | `/app/accounting/transactions/cashrfnd.nl` |
| Task | `task` | `/app/crm/calendar/task.nl` |
| Phone call | `phonecall` | `/app/crm/calendar/call.nl` |
| Customer payment | `customerpayment` | `/app/accounting/transactions/custpymt.nl` |
| Purchase order | `purchaseorder` | `/app/accounting/transactions/purchord.nl` |
| Price level | `pricelevel` | `/app/pricing/pricelevel.nl` |
| Customer Group (CRM group) | `entitygroup` | `/app/crm/common/crmgroup.nl` |
| Item Collection | `itemcollection` | `/app/common/itemcollection/itemcollection.nl` |

Do not extrapolate a path for an unlisted type or subtype. For a different type, use a URL
returned by NetSuite or validate its view path in the UI or with `N/url.resolveRecord` before
adding it to this catalog. Confirm an `entitygroup` is a customer group before using the CRM
group path; do not confuse it with a Pricing Group. A REST `links.self.href` is an API URL and is
not a UI record link.
