# Transaction Type Codes

Use this table to convert a concrete user-supplied or returned-and-verified transaction type to the `transactionTypeCode` input for `scripts/resolve_typed_reference.sql`. Match a name or listed alias exactly after normalizing case and surrounding whitespace. Do not infer a type from a document-number prefix. If the user supplies a type not listed here, ask for a supported concrete type or use a verified record-link path; do not guess a code.

| User-facing transaction type | Accepted aliases | SuiteQL type code |
| --- | --- | --- |
| Item Receipt | ItemRcpt | `ItemRcpt` |
| Item Fulfillment | ItemShip | `ItemShip` |
| Inventory Adjustment | InvAdjst | `InvAdjst` |
| Inventory Transfer | InvTrnfr | `InvTrnfr` |
| Transfer Order | TrnfrOrd | `TrnfrOrd` |
| Invoice | Customer Invoice, CustInvc | `CustInvc` |
| Credit Memo | Customer Credit Memo, CustCred | `CustCred` |
| Cash Sale | CashSale | `CashSale` |
| Sales Order | SalesOrd | `SalesOrd` |
| Purchase Order | PurchOrd | `PurchOrd` |
| Vendor Bill | VendBill | `VendBill` |
| Vendor Credit | VendCred | `VendCred` |
| Vendor Return Authorization | VendRtnAuth | `VendRtnAuth` |
| Return Authorization | RtnAuth | `RtnAuth` |
| Work Order | WorkOrd | `WorkOrd` |
| Work Order Completion | WorkOrdCompl | `WorkOrdCompl` |
| Work Order Issue | WorkOrdIssue | `WorkOrdIssue` |
| Assembly Build | Build | `Build` |
| Assembly Unbuild | Unbuild | `Unbuild` |

Treat the type code as a fixed value from this table, not as user-provided SQL. Pass both inputs through the local compiler or documented safe parameter binding. Never concatenate raw user text into SQL.
