# Appendix: N/dataset Record Types, Fields, and Join Patterns
> Author: Oracle NetSuite

> Essential reference for avoiding trial-and-error failures with N/dataset workbooks

## Overview

The N/dataset module has **strict record type requirements** that differ from N/search. This appendix documents:
1. Valid record types for N/dataset
2. Common record type mistakes and auto-corrections
3. Field location reference (which fields live where)
4. Join path patterns for multi-level relationships

## Critical: N/dataset Record Types

### Valid Generic Types

N/dataset only accepts **generic record types**, not specific transaction types:

| Valid Type | Description |
|------------|-------------|
| `transaction` | ALL transaction types (sales orders, invoices, etc.) |
| `customer` | Customer records |
| `vendor` | Vendor records |
| `employee` | Employee records |
| `item` | All item types |
| `contact` | Contact records |
| `lead` | Lead records |
| `opportunity` | Opportunity records |
| `case` | Support case records |
| `message` | Message records |
| `file` | File cabinet files |
| `folder` | File cabinet folders |
| `note` | Note records |
| `customrecord_xxx` | Custom record types |

### Transaction Type Mapping

When you need a specific transaction type, use `transaction` with a type filter:

| Specific Type | N/dataset Type | Type Filter Value |
|---------------|----------------|-------------------|
| `salesorder` | `transaction` | `SalesOrd` |
| `invoice` | `transaction` | `CustInvc` |
| `purchaseorder` | `transaction` | `PurchOrd` |
| `vendorbill` | `transaction` | `VendBill` |
| `cashsale` | `transaction` | `CashSale` |
| `estimate` | `transaction` | `Estimate` |
| `creditmemo` | `transaction` | `CustCred` |
| `vendorcredit` | `transaction` | `VendCred` |
| `journalentry` | `transaction` | `Journal` |
| `itemfulfillment` | `transaction` | `ItemShip` |
| `itemreceipt` | `transaction` | `ItemRcpt` |
| `returnauthorization` | `transaction` | `RtnAuth` |
| `expensereport` | `transaction` | `ExpRept` |
| `inventoryadjustment` | `transaction` | `InvAdjst` |
| `transferorder` | `transaction` | `TrnfrOrd` |
| `workorder` | `transaction` | `WorkOrd` |

### Auto-Correction Example

The workbook tool automatically corrects specific transaction types:

**Input:**
```javascript
{
  "type": "salesorder",
  "columns": [...]
}
```

**Auto-Corrected To:**
```javascript
{
  "type": "transaction",
  "columns": [...],
  "condition": {"column": "type", "operator": "EQUAL", "values": ["SalesOrd"]}
}
```

**Response includes:**
```json
{
  "recordTypeAutoCorrection": {
    "message": "Auto-corrected: Using 'transaction' with type='SalesOrd' filter for Sales Order",
    "originalType": "salesorder",
    "correctedType": "transaction",
    "addedFilter": {"column": "type", "operator": "EQUAL", "values": ["SalesOrd"]}
  }
}
```

## Field Location Reference

### Fields That Are NOT Where You Think

| Field | NOT on | Actually on | How to Access |
|-------|--------|-------------|---------------|
| `salesrep` | transaction | customer | Join `entity` → access `salesrep` |
| `companyname` | transaction | customer | Join `entity` → access `companyname` |
| `email` (customer) | transaction | customer | Join `entity` → access `email` |
| `phone` (customer) | transaction | customer | Join `entity` → access `phone` |
| `custentity_*` | transaction | customer/vendor/employee | Join `entity` → access custom field |
| `department` | transaction (directly) | employee | Join via salesrep → employee |
| `supervisor` | transaction, customer | employee | Join to employee record |
| `category` | transaction | customer | Join `entity` → access `category` |
| `baseprice` | transaction | item | Join `item` → access `baseprice` |
| `quantityavailable` | transaction | item | Join `item` → access field |

### Common Transaction Fields

These fields ARE directly on the `transaction` record:

| Field | Type | Description |
|-------|------|-------------|
| `tranid` | TEXT | Transaction number (SO001234) |
| `trandate` | DATE | Transaction date |
| `type` | TEXT | Transaction type (SalesOrd, CustInvc, etc.) |
| `status` | TEXT | Transaction status |
| `entity` | REFERENCE | Link to customer/vendor (use for joins) |
| `total` | CURRENCY | Transaction total (header level) |
| `memo` | TEXT | Transaction memo |
| `subsidiary` | REFERENCE | Subsidiary reference |
| `department` | REFERENCE | Department reference |
| `location` | REFERENCE | Location reference |
| `amount` | CURRENCY | Amount field |
| `netamount` | CURRENCY | Net amount (line level) |

### Common Customer Fields

| Field | Type | Description |
|-------|------|-------------|
| `companyname` | TEXT | Company name |
| `entityid` | TEXT | Customer ID |
| `email` | EMAIL | Primary email |
| `phone` | PHONE | Primary phone |
| `salesrep` | REFERENCE | Sales rep (→ employee) |
| `category` | REFERENCE | Customer category |
| `balance` | CURRENCY | Account balance |
| `creditlimit` | CURRENCY | Credit limit |
| `parent` | REFERENCE | Parent customer |
| `custentity_*` | VARIES | Custom entity fields |

### Common Item Fields

| Field | Type | Description |
|-------|------|-------------|
| `itemid` | TEXT | Item name/number |
| `displayname` | TEXT | Display name |
| `baseprice` | CURRENCY | Base price |
| `cost` | CURRENCY | Item cost |
| `quantityavailable` | INTEGER | Available quantity |
| `type` | TEXT | Item type |
| `description` | TEXT | Item description |

## Join Path Patterns

### You Cannot Skip Levels

N/dataset requires following the exact relationship path. You cannot join directly to a record that's 2+ levels away.

### Transaction Join Tree

```
transaction
├── entity ──────────→ customer
│                        ├── salesrep ────→ employee
│                        │                    └── supervisor → employee
│                        ├── parent ──────→ customer
│                        └── category ────→ category
├── item ────────────→ item
│                        └── class ───────→ classification
├── department ──────→ department
├── subsidiary ──────→ subsidiary
├── location ────────→ location
├── createdfrom ─────→ transaction (source transaction)
└── nextstep ────────→ transaction (linked transaction)
```

### Multi-Level Join Examples

#### Example 1: Get Sales Rep Email from Transaction

```json
{
  "type": "transaction",
  "joins": [
    {"fieldId": "entity", "alias": "customer"},
    {"fieldId": "salesrep", "alias": "salesrep", "join": "customer"}
  ],
  "columns": [
    {"fieldId": "tranid", "alias": "tranid"},
    {"fieldId": "companyname", "alias": "customer_name", "join": "customer"},
    {"fieldId": "email", "alias": "salesrep_email", "join": "salesrep"}
  ]
}
```

#### Example 2: Get Sales Rep's Department from Transaction

```json
{
  "type": "transaction",
  "joins": [
    {"fieldId": "entity", "alias": "customer"},
    {"fieldId": "salesrep", "alias": "salesrep", "join": "customer"},
    {"fieldId": "department", "alias": "rep_dept", "join": "salesrep"}
  ],
  "columns": [
    {"fieldId": "tranid", "alias": "tranid"},
    {"fieldId": "name", "alias": "department_name", "join": "rep_dept"}
  ]
}
```

#### Example 3: Get Item Class from Transaction

```json
{
  "type": "transaction",
  "joins": [
    {"fieldId": "item", "alias": "item"},
    {"fieldId": "class", "alias": "item_class", "join": "item"}
  ],
  "columns": [
    {"fieldId": "tranid", "alias": "tranid"},
    {"fieldId": "itemid", "alias": "item_name", "join": "item"},
    {"fieldId": "name", "alias": "class_name", "join": "item_class"}
  ]
}
```

### WRONG: Skipping Levels

```javascript
// WRONG; salesrep is NOT directly on transaction.
{
  "type": "transaction",
  "joins": [
    {"fieldId": "salesrep", "alias": "rep"}  // ERROR: field not found
  ]
}

// CORRECT; must go through entity (customer) first.
{
  "type": "transaction",
  "joins": [
    {"fieldId": "entity", "alias": "customer"},
    {"fieldId": "salesrep", "alias": "rep", "join": "customer"}
  ]
}
```

## Common Pitfalls Reference

| # | Problem | Cause | Solution |
|---|---------|-------|----------|
| 62 | `N/dataset type 'salesorder' not found` | Using N/search type names | Use `transaction` and filter by type=`SalesOrd` |
| 63 | `Cannot find 'total' on TransactionLine` | Field lives on header | Join to Transaction or use `netamount` for lines |
| 64 | `Cannot access salesrep from Transaction` | salesrep is on Customer | Join Transaction→entity(customer)→salesrep |
| 65 | `N/search cannot get salesrep email` | 2-level join limit in N/search | Use N/dataset for 3+ level joins |
| 66 | `Field 'companyname' not found` | Accessing customer field directly | Join `entity` first, then access field |
| 67 | `Invalid join field 'customer'` | Using wrong relationship field name | Use `entity` not `customer` for join |
| 68 | `Custom field not found` | Custom entity field on transaction | `custentity_*` fields require entity join |
| 69 | `Record type 'invoice' unknown` | Using specific transaction type | Use `transaction` with type filter |
| 70 | `Cannot chain joins` | Missing intermediate join | Add all intermediate joins in order |

## Best Practices

### 1. Always Use Generic Transaction Type
```javascript
// Good
{"type": "transaction", "condition": {"column": "type", "operator": "EQUAL", "values": ["SalesOrd"]}}

// Bad; will fail
{"type": "salesorder"}
```

### 2. Define Joins in Order
```javascript
// Good; intermediate joins defined first
{
  "joins": [
    {"fieldId": "entity", "alias": "cust"},           // Level 1
    {"fieldId": "salesrep", "alias": "rep", "join": "cust"}  // Level 2
  ]
}

// Bad; referencing undefined join
{
  "joins": [
    {"fieldId": "salesrep", "alias": "rep", "join": "cust"}  // Error: 'cust' not defined
  ]
}
```

### 3. Use Correct Relationship Field Names
```javascript
// Good; correct field name
{"fieldId": "entity", "alias": "customer"}

// Bad; this field doesn't exist
{"fieldId": "customer", "alias": "cust"}
```

### 4. Reference Joined Fields with Alias
```javascript
{
  "joins": [{"fieldId": "entity", "alias": "cust"}],
  "columns": [
    {"fieldId": "companyname", "alias": "customer_name", "join": "cust"}  // Good
  ]
}
```

## When to Use N/search Instead

Use N/search (saved search) instead of N/dataset when:

1. **You need specific transaction types** without filtering (simpler syntax).
2. **Join depth is ≤2 levels** (N/search handles this fine).
3. **You need full Oracle SQL** formula support.
4. **You need window functions** or complex aggregations.
5. **You want to use existing saved searches** as a base.

## References

- [N/dataset Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4675023796.html)
- [N/dataset.Join](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4675027374.html)
- [N/workbook Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4675054696.html)
- [SuiteAnalytics Transaction Types](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N3169036.html)
