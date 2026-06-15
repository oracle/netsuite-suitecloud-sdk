# Principle 3: Optimize Your SuiteApps

> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

Performance optimization is critical for SuiteApps running in a multi-tenant cloud environment. Poorly optimized code can impact not only your SuiteApp's users but also other customers on shared infrastructure. This principle covers SuiteScript performance, SuiteTalk optimization, search optimization, caching strategies, and the N/llm module for AI integration.

## Key Concepts

### 3.1 SuiteScript Performance Optimizations

#### 3.1.1 Efficient Record Operations

```javascript
// INEFFICIENT: Loading full record for single field.
const rec = record.load({ type: record.Type.CUSTOMER, id: custId });
const name = rec.getValue({ fieldId: 'companyname' });

// EFFICIENT: Use lookupFields (1 unit vs 10 units).
const values = search.lookupFields({
    type: search.Type.CUSTOMER,
    id: custId,
    columns: ['companyname']
});

// INEFFICIENT: Load + modify + save (30 units).
const rec = record.load({ type: record.Type.CUSTOMER, id: custId });
rec.setValue({ fieldId: 'comments', value: 'Updated' });
rec.save();

// EFFICIENT: submitFields (4 units).
record.submitFields({
    type: record.Type.CUSTOMER,
    id: custId,
    values: { comments: 'Updated' }
});
```

#### 3.1.2 Avoid Operations in Loops

```javascript
// INEFFICIENT: Loading records in a loop.
results.forEach((result) => {
    const rec = record.load({ type: record.Type.SALES_ORDER, id: result.id });
    // Process record...
});

// EFFICIENT: Use search to get all needed data.
const searchResults = search.create({
    type: search.Type.SALES_ORDER,
    filters: [...],
    columns: ['entity', 'total', 'status', 'trandate']
}).run();

searchResults.each((result) => {
    // Process without loading; data available from search.
    const entity = result.getValue({ name: 'entity' });
    const total = result.getValue({ name: 'total' });
    return true;
});
```

### 3.1.3 Using the N/cache Module

The N/cache module provides a caching mechanism for frequently accessed data, reducing API calls and improving performance.

#### Cache Basics

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/cache', 'N/search'], (cache, search) => {

    const onRequest = (context) => {
        // Get or create cache.
        const myCache = cache.getCache({
            name: 'CustomerDataCache',
            scope: cache.Scope.PRIVATE // PRIVATE, PROTECTED, or PUBLIC
        });

        const customerId = context.request.parameters.custid;

        // Try to get from cache first.
        let customerData = myCache.get({
            key: `customer_${customerId}`,
            loader: loadCustomerData // Called if key not in cache.
        });

        // Use cached data...
    };

    const loadCustomerData = (context) => {
        // This function is called only when cache miss occurs.
        const custId = context.key.replace('customer_', '');

        const values = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: custId,
            columns: ['companyname', 'email', 'phone']
        });

        return JSON.stringify(values); // Cache stores strings.
    };

    return { onRequest };
});
```

#### Cache Scopes

| Scope | Description | Use Case |
|-------|-------------|----------|
| `PRIVATE` | Only accessible by the same SuiteApp | SuiteApp-specific data |
| `PROTECTED` | Accessible by SuiteApps from the same publisher | Shared publisher data |
| `PUBLIC` | Accessible by all scripts in the account | Shared configuration |

#### Cache Considerations

- **Server-side only** - N/cache is not available in Client Scripts.
- **500KB limit per value** - Cache data is limited in size.
- **Not persistent** - No guarantee cached values persist for full TTL.
- **Auto JSON conversion** - Non-string values are automatically JSON.stringify'd.
- **Use loader functions** - More efficient pattern for cache population.

```javascript
// Cache with TTL (time to live).
const appCache = cache.getCache({
    name: 'ConfigCache',
    scope: cache.Scope.PRIVATE
});

// Put value with TTL.
appCache.put({
    key: 'config_data',
    value: JSON.stringify(configObject),
    ttl: 3600 // 1 hour in seconds
});

// Remove from cache.
appCache.remove({ key: 'config_data' });
```

### 3.1.4 Monitor Performance with APM

NetSuite Application Performance Management (APM) provides real-time visibility into script execution times, governance usage, and error rates. Use the **Script Performance Monitor SuiteApp** to test and monitor script performance deployed on specific record types — before bottlenecks reach production users.

**Key APM capabilities:**
- Real-time script execution time per deployment
- Governance unit consumption tracking
- Error rate visibility across script types
- Identify slow or over-governed scripts proactively

**When to use APM:**
- After deploying a new User Event Script or Scheduled Script to production
- When users report slowness or timeout errors on specific record types
- During periodic performance audits of high-volume deployments
- Before and after optimization work to measure improvement

> **Source:** "You can use the Script Performance Monitor SuiteApp to test the performance of your scripts deployed on a specific record type. See Application Performance Management (APM)." — Oracle Customization Leading Practices

### 3.1.5 Using the N/llm Module for AI-Powered SuiteApps

The N/llm module provides native AI capabilities through Large Language Model integration.

#### Available Models

| Model Family | Description |
|--------------|-------------|
| `ModelFamily.COHERE_COMMAND_R` | Default model (Cohere Command R 08-2024) |
| `ModelFamily.COHERE_COMMAND_R_PLUS` | Enhanced model (Cohere Command R+ 08-2024) |
| `ModelFamily.META_LLAMA` | Meta Llama 3.3 70b |
| `ModelFamily.META_LLAMA_VISION` | Meta Llama 3.2 90B (supports images) |

#### Basic Usage

```javascript
define(['N/llm', 'N/runtime'], (llm, runtime) => {

    const generateResponse = (prompt) => {
        const response = llm.generateText({
            prompt: prompt,
            modelFamily: llm.ModelFamily.COHERE_COMMAND_R,
            modelParameters: {
                maxTokens: 500,      // Limit token consumption
                temperature: 0.3     // Lower = more consistent
            }
        });

        return response.text;
    };

    // Chat history for context
    const chatHistory = [];

    const chat = (userMessage) => {
        const message = llm.createChatMessage({
            role: llm.ChatRole.USER,
            text: userMessage
        });
        chatHistory.push(message);

        const response = llm.generateText({
            prompt: userMessage,
            chatHistory: chatHistory,
            modelParameters: {
                maxTokens: 500,
                temperature: 0.3
            }
        });

        return response.text;
    };

    return { generateResponse, chat };
});
```

#### Prompt Studio Integration

Use NetSuite's Prompt Studio (Setup > Company > AI > Prompt Studio) for prompt management:

```javascript
const response = llm.evaluatePrompt({
    id: 12, // Prompt Studio ID
    variables: {
        itemid: runtime.getCurrentScript().getParameter({
            name: 'custscript_item_id'
        }),
        vendorname: runtime.getCurrentScript().getParameter({
            name: 'custscript_vendor'
        })
    }
});
```

#### LLM Best Practices

- **Check remaining usage** before expensive operations
- **Cache frequent responses** using N/cache to reduce token consumption
- **Implement error handling** for timeouts and token limits
- **Use OCI integration** for production deployments
- **Store OCI credentials** as NetSuite secrets, never in code

```javascript
const remainingUsage = llm.getRemainingFreeUsage();
if (remainingUsage < MINIMUM_THRESHOLD) {
    // Implement fallback logic
}
```

## 3.2 SuiteTalk Performance Optimizations

### 3.2.1 Synchronous vs Asynchronous Web Services

#### When to Use Asynchronous

- **Mass imports** — Historical data loads
- **Nightly batch synchronization** — No user interaction needed
- **High volume operations** — Reduces server load

#### When to Use Synchronous

- **Learning/experimenting** — Real-time feedback
- **Quick response needed** — User-facing operations
- **Low data volume** — Minimal server impact
- **Synchronous-only operations** — getSelectValue, attach, etc.

### 3.2.2 Integration Records

**IMPORTANT**: Distribute Integration records with your SuiteApp. Do NOT ask customers to create Integration records manually.

```xml
<!-- Integration record in SDF -->
<integration scriptid="custinteg_myapp">
    <name>My Integration App</name>
    <description>Integration for My SuiteApp</description>
    <state>ENABLED</state>
    <tokenbased>T</tokenbased>
</integration>
```

### 3.2.3 OAuth 2.0 Considerations

- OAuth 2.0 Authorization Code Grant expires in 7 days.
- For machine-to-machine: use OAuth 2.0 Client Credentials Flow.
- Use RSA-PSS or EC keys (RSA PKCSv1.5 is deprecated).
- EC key lengths: 256, 384, or 521 bits.

### 3.2.4 REST Batch Operations (2026.1+)

NetSuite 2026.1 introduced REST Batch Operations, allowing multiple records of the same type to be processed in a single request. This is significantly more efficient than serial REST calls for bulk create, update, or delete scenarios.

**Why it matters:**
- Serial REST calls for 50 records = 50 concurrency slots consumed sequentially
- Batch operation for 50 records = 1 request, processed asynchronously

**Async pattern:** Batch requests return HTTP 202 (Accepted). You must poll the returned job status endpoint until all tasks report COMPLETE or FAILED. Do not assume the operation is complete when the request returns.

**When to use:**
- Bulk record creation from external data sync
- Mass field updates across many records
- High-volume nightly import jobs

> **Note:** Consult Oracle REST Web Services documentation for exact request format, required headers, and batch size limits. See [Appendix: SuiteTalk REST API](appendices/appendix-suitetalk-rest.md) for additional context.

## 3.3 Search Optimizations

### 3.3.1 Benefits of Saved Searches

- **Reusable** — Define once, use many times
- **Indexed** — UI-created saved searches are indexed for better performance
- **Distributable** — Can be included in SuiteApps
- **Extendable** — Add filters programmatically at runtime

```javascript
// Reference existing saved search and add filters.
const mySearch = search.load({ id: 'customsearch_myorders' });

// Add additional filters at runtime.
mySearch.filters.push(
    search.createFilter({
        name: 'trandate',
        operator: search.Operator.WITHIN,
        values: ['lastmonth']
    })
);

const results = mySearch.run();
```

### 3.3.2 Search Operators and Performance

**Best operators** (precise, use indexes):
- `is`, `anyof`, `between`, `within`

**Avoid when possible** (slower, full scans):
- `contains`, `haskeywords`, `startswith`

```javascript
// SLOWER: contains operator.
filters: [['name', 'contains', 'Corp']]

// FASTER: is operator with exact value.
filters: [['name', 'is', 'Acme Corp']]

// FASTER: between for ranges (instead of greaterthan).
filters: [['cost', 'between', 100, 500]]
```

### 3.3.3 Using N/query and SuiteQL

N/query runs on the SuiteAnalytics Workbook engine with:
- Up to 5,000 results (non-paged)
- Multi-level joins
- Better performance for complex queries

#### N/search vs N/query Comparison

```javascript
// N/search approach
const mySearch = search.create({
    type: search.Type.INVENTORY_ITEM,
    columns: ['itemid', search.createColumn({
        name: 'cost',
        sort: search.Sort.DESC
    })],
    filters: [
        ['isinactive', 'is', 'F'],
        'AND',
        ['cost', 'between', 100, 500]
    ]
});

// N/query – SuiteQL approach (often faster)
const results = query.runSuiteQL({
    query: `
        SELECT ItemId AS itemid, Cost AS cost
        FROM Item
        WHERE (ItemType = 'InvtPart')
        AND (Cost BETWEEN 100 AND 500)
        AND (NVL(isinactive, 'F') = 'F')
        ORDER BY cost DESC
    `
});
```

### 3.3.4 Avoiding the 'noneof' Operator

The `noneof` operator becomes inefficient with more than ~50 IDs:

```javascript
// INEFFICIENT with large arrays
const excludeIDs = [/* 100+ IDs */];
const mySearch = search.create({
    type: search.Type.SALES_ORDER,
    filters: [['internalid', 'noneof', excludeIDs]]
});

// BETTER: Use a custom record to track processed records.
// Or use a hash table for in-memory exclusion checks.
```

### 3.3.5 runPaged for Better Performance

For results under 1,000 records, `runPaged` is significantly faster:

| Method | Avg Time (ms) |
|--------|---------------|
| search.run | 304 |
| query.run | 375 |
| query.runSuiteQL | 192 |
| **search.runPaged** | **68** |
| query.runPaged | 284 |
| query.runSuiteQLPaged | 175 |

### 3.3.6 SuiteQL Best Practices

#### Avoid SELECT *
```javascript
// BAD: Retrieves all columns.
query.runSuiteQL({ query: `SELECT * FROM Customer` });

// GOOD: Specify only needed columns.
query.runSuiteQL({
    query: `SELECT Id, CompanyName, Email FROM Customer`
});
```

#### Use BUILTIN.DF for Display Values
```javascript
// Instead of joining just for display value.
SELECT
    Id AS id,
    Entity AS vendor,
    BUILTIN.DF(Entity) AS vendorName
FROM Transaction
WHERE (Type = 'VendBill')
```

#### Avoid Resource-Intensive Functions
- `REGEXP_INSTR`, `REGEXP_REPLACE`, `REGEXP_SUBSTR`; slow with large strings.
- `DECODE`, `INSTR` — Require full scans.

#### Use Explicit Joins
```javascript
// Explicit join (preferred)
SELECT Account.Id, Department.Id
FROM Account
INNER JOIN Department ON (Account.Department = Department.Id)

// Instead of implicit (harder to read)
SELECT Account.Id, Department.Id
FROM Account, Department
WHERE Account.Department = Department.Id
```

#### Avoid Joining System Notes Tables

`SystemNote` is an extremely high-volume table — every field change on every record creates a row. Joining it in SuiteQL queries causes severe performance degradation and frequent query timeouts.

```javascript
// BAD: Joining SystemNote causes massive full-table scans.
const results = query.runSuiteQL({
    query: `
        SELECT t.id, t.tranid, sn.name, sn.date
        FROM Transaction t
        INNER JOIN SystemNote sn ON sn.recordid = t.id
        WHERE t.type = 'SalesOrd'
        AND sn.field = 'status'
    `
});

// GOOD: Query Transaction data without SystemNote join.
const results = query.runSuiteQL({
    query: `
        SELECT id, tranid, status
        FROM Transaction
        WHERE type = 'SalesOrd'
        AND NVL(isinactive, 'F') = 'F'
    `,
    customScriptId: 'my_open_salesorders_v1'
});
```

If you must query System Notes (for example, for dedicated audit reporting), run it as a standalone query with **tight filters** on `recordid`, `field`, and a narrow date range — never as a JOIN against a large dataset.

#### Use Parameterized Queries for Fingerprint Optimization

When NetSuite executes a SuiteQL query, it generates a "fingerprint" based on the query structure. Parameterized queries using `?` placeholders produce a **stable fingerprint** that NetSuite can cache and reuse (query plan caching). Dynamic queries with concatenated/interpolated values generate a **unique fingerprint on every call**, preventing plan reuse and degrading performance at scale.

Additionally, assign a `customScriptId` to each query — treat it as a version identifier. When you modify a query, update its `customScriptId`. Reusing the same ID for a changed query confuses the internal optimizer.

```javascript
// BAD: Interpolated value; new fingerprint every execution, no plan caching.
const custId = context.request.parameters.custid;
const results = query.runSuiteQL({
    query: `SELECT id, companyname FROM Customer WHERE id = ${custId}`
});

// GOOD: Parameterized; stable fingerprint, plan cache reused across calls.
const results = query.runSuiteQL({
    query: `SELECT id, companyname FROM Customer WHERE id = ?`,
    params: [custId],
    customScriptId: 'my_customer_lookup_v1'
});

// BAD: Inline list of IDs; new fingerprint for every unique set.
const orderIds = [101, 102, 103];
query.runSuiteQL({
    query: `SELECT id, tranid FROM Transaction WHERE id IN (${orderIds.join(',')})`
});

// GOOD: Use a parameterized array.
query.runSuiteQL({
    query: `SELECT id, tranid FROM Transaction WHERE id IN (?, ?, ?)`,
    params: orderIds,
    customScriptId: 'my_transaction_lookup_v1'
});
```

> **Note:** `customScriptId` follows the same character restrictions as SDF scriptids. Update the version suffix (for example, `_v2`) whenever you change the query structure.

### 3.3.7 SuiteQL vs N/search Field and Type Reference

#### Type ID vs SuiteQL Abbreviation Mismatch

`search.create({ type: ... })` requires lowercase type IDs. SuiteQL's `transaction.type` column uses different abbreviations. These are **not interchangeable**; using a SuiteQL abbreviation in `search.create()` throws: `The record type [PURCHORD] is invalid.`

| Record | N/search Type ID (`search.create`) | SuiteQL `transaction.type` |
|---|---|---|
| Purchase Order | `purchaseorder` | `PurchOrd` |
| Sales Order | `salesorder` | `SalesOrd` |
| Invoice | `invoice` | `CustInvc` |
| Item Receipt | `itemreceipt` | `ItemRcpt` |
| Item Fulfillment | `itemfulfillment` | `ItemShip` |
| Vendor Bill | `vendorbill` | `VendBill` |
| Vendor Payment | `vendorpayment` | `VendPymt` |
| Customer Payment | `customerpayment` | `CustPymt` |
| Journal Entry | `journalentry` | `Journal` |
| Credit Memo | `creditmemo` | `CustCred` |
| Estimate | `estimate` | `Estimate` |
| Return Authorization | `returnauthorization` | `RtnAuth` |
| Transfer Order | `transferorder` | `TrnfrOrd` |
| Work Order | `workorder` | `WorkOrd` |
| Expense Report | `expensereport` | `ExpRept` |

```javascript
// WRONG: SuiteQL abbreviation used in search.create; runtime error.
search.create({ type: 'PurchOrd', filters: [...] });

// CORRECT: lowercase type ID for N/search.
search.create({ type: 'purchaseorder', filters: [...] });
// or using the enum:
search.create({ type: search.Type.PURCHASE_ORDER, filters: [...] });

// CORRECT: SuiteQL abbreviation belongs in SuiteQL only.
query.runSuiteQL({ query: `SELECT id FROM Transaction WHERE type = 'PurchOrd'` });
```

#### `createdfrom` Field Location Difference

In N/search, `createdfrom` is a direct field on the transaction record and can be used in join filters:

```javascript
// N/search: createdfrom is a direct field; works on the transaction.
search.create({
    type: 'itemreceipt',
    filters: [['createdfrom.type', 'anyof', ['PurchOrd']]]
});
```

In SuiteQL, `createdfrom` does **not** exist on the `transaction` table; it is a column on `transactionline`. You must join through `transactionline` to access it:

```sql
-- WRONG: createdfrom does not exist on transaction.
SELECT t.id, t.tranid
FROM transaction t
WHERE t.createdfrom = 123  -- Unknown identifier error

-- CORRECT: createdfrom lives on transactionline.
SELECT t.id, t.tranid
FROM transactionline tl
INNER JOIN transaction t ON t.id = tl.transaction
WHERE tl.createdfrom = 123
AND tl.mainline = 'T'
AND t.type = 'ItemRcpt'
```

#### Standard PO Lifecycle in NetSuite

The standard Purchase Order lifecycle is a **direct link** from PO to each downstream transaction — not a chain. Both Item Receipts and Vendor Bills are created directly from the PO:

```
PO (purchaseorder)
 ├── Item Receipt (itemreceipt)  — created from PO via transactionline.createdfrom
 └── Vendor Bill (vendorbill)    — created from PO via transactionline.createdfrom
```

It is **NOT** `PO → IR → VB`. Vendor Bills link back to the PO, not to the Item Receipt. When querying Vendor Bills related to a PO in SuiteQL, join through the VB's `transactionline.createdfrom` back to the PO id directly:

```sql
-- Find Vendor Bills linked to a specific PO.
SELECT t.id AS vbId, t.tranid AS vbNumber
FROM transactionline tl
INNER JOIN transaction t ON t.id = tl.transaction
WHERE tl.createdfrom = :poId      -- The PO's internal ID
AND tl.mainline = 'T'
AND t.type = 'VendBill'
AND NVL(t.voided, 'F') = 'F'
```

### 3.3.8 Handling Large Datasets

1. **Minimize stored data** - Set up cleanup processes for obsolete records.
2. **Use driving conditions** - One filter should significantly reduce results.
3. **Avoid compound filters** - They're often not indexed.
4. **Handle timeouts** - Split large queries into smaller chunks.
5. **Check for actual data** - Timeouts may return 0 results with Success status.

```javascript
// For large result sets, verify data exists.
const testSearch = search.create({
    type: search.Type.TRANSACTION,
    filters: [...],
    columns: ['internalid'] // Minimal columns first
});

const testResults = testSearch.run().getRange({ start: 0, end: 1 });
if (testResults.length > 0) {
    // Data exists, safe to run full query.
}
```

## Common Pitfalls

1. **Using SELECT *** — Always specify needed columns.
2. **Loading records in loops** — Use searches or bulk operations.
3. **Ignoring cache** — Repeatedly fetching same data.
4. **Not checking governance** — Scripts fail mid-execution.
5. **Using 'contains' operator** — Poor performance on large datasets.
6. **Too many joined records** — Each join adds query time.
7. **Not using Prompt Studio** — Hard-coding prompts in N/llm code.
8. **SuiteQL aliases are always lowercase** — SuiteQL returns all column aliases in lowercase regardless of how you write them. `SELECT id AS managerName` returns `managername` in the result object. Always use lowercase aliases in queries and access results with lowercase keys.
9. **NULL propagation with `||` and string literals in SuiteQL** — In Oracle/SuiteQL, `NULL || ' ' || NULL` evaluates to `' '` (a space), not NULL, because the literal space defeats NULL propagation. This means `COALESCE(a.firstname || ' ' || a.lastname, fallback)` never falls through to the fallback when a LEFT JOIN doesn't match. Fix: use `CASE WHEN a.id IS NOT NULL THEN a.firstname || ' ' || a.lastname ELSE fallback END`.
10. **BUILTIN.DF() incompatible with DISTINCT and GROUP BY** — `SELECT DISTINCT` or `GROUP BY` with `BUILTIN.DF()` columns throws "Invalid or unsupported search". For DISTINCT deduplication, remove DISTINCT and instead fix the root cause (for example, limit JOINs to one row using a `MIN(id)` subquery in the JOIN condition). For GROUP BY aggregation, use `SUM(CASE WHEN BUILTIN.DF(field) = 'Label' THEN 1 ELSE 0 END)` pattern instead.
11. **Joining System Notes in SuiteQL** — `SystemNote` is a massive high-volume table. Joining it against transaction or record datasets causes severe query timeouts. Query it standalone with tight `recordid` and date filters only.
12. **Dynamic SuiteQL queries with interpolated values** — String-concatenated queries generate a unique fingerprint on every call, preventing NetSuite's query plan caching. Use `?` parameters and the `params` array instead. Assign a `customScriptId` to enable plan tracking and versioning.
13. **Not all SuiteQL tables have `id` or `isinactive` columns** — Assuming every table supports `WHERE isinactive = 'F'` or `SELECT id` causes `Unknown identifier` errors. Notable example: `entitystatus` uses `key` (not `id`), `inactive` (not `isinactive`), and has `entitytype` for filtering (for example, `'JOB'`, `'CUSTOMER'`). Always verify column names with a `SELECT * FROM <table> WHERE ROWNUM <= 1` probe query before writing filters.

```sql
-- BAD: assumes standard column names.
SELECT id, name FROM entitystatus WHERE isinactive = 'F'

-- GOOD: uses actual entitystatus columns.
SELECT key, name FROM entitystatus WHERE entitytype = 'JOB' AND inactive = 'F'
```

## Performance Checklist

- [ ] Use `lookupFields()` instead of `load()` for read-only access.
- [ ] Use `submitFields()` instead of `load()` + `save()` for updates.
- [ ] Cache frequently accessed data with N/cache.
- [ ] Use indexed saved searches when possible.
- [ ] Specify only needed columns in searches.
- [ ] Use precise search operators (is, anyof, between).
- [ ] Consider N/query for complex multi-join scenarios.
- [ ] Use `runPaged` for results under 1,000 records.
- [ ] Set `maxTokens` when using N/llm.
- [ ] Implement cleanup processes for custom records.
- [ ] Use APM (Script Performance Monitor SuiteApp) to identify bottlenecks in production.
- [ ] Parameterize SuiteQL queries with `?` placeholders and `params` array (fingerprint optimization).
- [ ] Assign `customScriptId` to SuiteQL queries and update version when query changes.
- [ ] Avoid joining System Notes (`SystemNote`) tables in SuiteQL queries.

## Further Reading

Search in NetSuite Help Center or SuiteAnswers:
- N/cache Module
- N/llm Module
- N/query Module
- SuiteQL Reference
- Search Operators
- SuiteAnalytics Workbook
- Performance Best Practices
