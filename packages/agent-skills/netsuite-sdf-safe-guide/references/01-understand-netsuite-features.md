# Principle 1: Understand NetSuite Features and Data Schema

> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

As a SuiteApp developer or architect, you must invest time learning about the core NetSuite ERP/CRM features you want to extend. Understanding NetSuite business processes is imperative to identifying SuiteApp integration points. Feature knowledge allows you to focus on building value-added SuiteApps that extend the platform's features without duplicating them.

## Key Concepts

### 1.1 Solutions Must Work With Existing Processes

- Reuse the data schema provided by the NetSuite platform.
- Ensure your SuiteApp works well with built-in NetSuite business logic.
- Honor NetSuite as the system of record by using the platform's transaction and item records as the backbone.

### 1.2 Data and Record Types Considerations

- Use standard NetSuite records when it makes sense; extend them with custom fields when necessary.
- Thoroughly identify records or fields that are already available before creating custom ones.
- Reference the **SuiteScript Records Browser** and **SuiteTalk Schema Browser** in NetSuite Help Center.

#### Overextending Standard Records
Do NOT "stretch" the use of standard NetSuite records. This may cause problems with other SuiteApps or integrations. Create custom records for specific business needs instead.

#### Creating Custom Records
Create and use custom records to represent unique business objects not available with standard objects.

### 1.3 SuiteTalk Web Services: Choosing the Right Technology

| Interface | Best For | Pros | Cons |
|-----------|----------|------|------|
| **REST Web Services** | Modern integrations, mobile platforms | Lightweight, OAuth 2.0 support, SuiteQL support, **required for new SuiteApps** | Legacy tax not supported |
| **SOAP Web Services** | Legacy integrations only | Most mature platform | No OAuth 2.0, higher latency, deprecated — all endpoints disabled 2028.2 |
| **RESTlets** | Custom REST APIs | Built-in HTTPS, can be packaged via SACC | Limited execution time/governance |
| **SuiteQL** | Complex queries | SQL-like syntax, flexible joins | Read-only access |

**SOAP Deprecation:** SOAP will not be permitted for new SuiteApps starting in 2024.2. The last new SOAP endpoint was added in 2025.2. All SOAP endpoints will be permanently disabled in 2028.2 — plan migration well before this deadline.

#### 2026.1 REST API New Features

| Feature | Description | Notes |
|---------|-------------|-------|
| **Attach/Detach** | `POST .../record/v1/{type1}/{id1}/!attach/{type2}/{id2}` — returns HTTP 204 | Contact and File record types only |
| **Batch Operations** | Process multiple records of the same type in one async request (HTTP 202) | Poll job status for completion; consult Oracle REST docs for exact format |
| **create-form** | Retrieve the form structure for a record type | Consult Oracle REST docs for exact request format |
| **selectOptions** | Role-aware metadata for select field options | Respects role-based visibility rules |
| **Support Case records** | 4 support-related record types now accessible via REST | Consult Oracle REST docs for exact record type names |

See [Appendix: SuiteTalk REST API](appendices/appendix-suitetalk-rest.md) for a comprehensive REST reference including OAuth 2.0 quick reference and SOAP migration guidance.

### 1.4 REST API Data Retrieval Methods

1. **REST Record Endpoint** – Simple data fetching by ID or ExternalId.
2. **Query Endpoint (SuiteQL)** – Complex queries with joins.
3. **Query Endpoint (Datasets)** – Execute requests against saved datasets.

#### REST API Limitations
- Concurrency limits based on account tier and SuiteCloud Plus licenses
- Standard Tier: base limit of 5 concurrent requests (15 with SuiteCloud Plus)
- Maximum 1,000 results per page, up to 1,000 pages

### 1.5 Prefer Native Record Type Enums

Always use `record.Type.*` and `search.Type.*` enum constants for standard NetSuite record types instead of string literals. This provides compile-time safety, IDE auto-completion, and protects against typos that would silently fail at runtime.

#### Quick Reference: Common Mappings

| String Literal | `record.Type.*` | `search.Type.*` |
|----------------|-----------------|-----------------|
| `'customer'` | `record.Type.CUSTOMER` | `search.Type.CUSTOMER` |
| `'salesorder'` | `record.Type.SALES_ORDER` | `search.Type.SALES_ORDER` |
| `'invoice'` | `record.Type.INVOICE` | `search.Type.INVOICE` |
| `'vendor'` | `record.Type.VENDOR` | `search.Type.VENDOR` |
| `'purchaseorder'` | `record.Type.PURCHASE_ORDER` | `search.Type.PURCHASE_ORDER` |
| `'transaction'` | — | `search.Type.TRANSACTION` |
| `'inventoryitem'` | `record.Type.INVENTORY_ITEM` | `search.Type.INVENTORY_ITEM` |
| `'employee'` | `record.Type.EMPLOYEE` | `search.Type.EMPLOYEE` |

#### When String Literals Are Acceptable

String literals should **only** be used for custom record types (`customrecord_*`) since they are not part of the standard enum:

```javascript
// GOOD: Custom record; string literal required.
record.load({ type: 'customrecord_batch_controller', id: controllerId });

// GOOD: Standard record; use enum.
record.load({ type: record.Type.CUSTOMER, id: custId });

// BAD: Standard record; avoid string literal.
record.load({ type: 'customer', id: custId });
```

## Best Practices

### JavaScript Best Practices (ES6/SuiteScript 2.1)

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ...
 */

// Use const and let instead of var.
const immutableValue = 'fixed';
let mutableValue = 10;

// Use arrow functions for lambda expressions.
const numbers = [1, 4, 9, 16];
const doubled = numbers.map(x => x * 2);

// Use string interpolation.
const name = "John";
console.log(`Hello ${name}`);

// Prefer declarative over imperative.
const sumNumbers = (n) => n.reduce((acc, current) => acc + current);
```

### Immutability
```javascript
// Don't mutate objects directly.
const car = { model: 'AAAA', year: 2020 };

// Do this instead:
const newCar = Object.assign({}, car, { model: 'BBBB' });

// Or use spread operator:
const arr = [1, 2, 3];
const arr2 = [...arr, 4, 5];
```

### OneWorld Considerations

- Build a common SuiteApp for both NetSuite OneWorld and single-instance accounts.
- The Subsidiary field is mandatory for most standard records in OneWorld.
- Some records are unique to OneWorld (for example, Intercompany Journal Entry).

### SuiteTax Considerations

- SuiteTax is the default framework for most new accounts as of 2024.2.
- Tax-related fields moved to the Tax Details sublist.
- Use `runtime.isFeatureInEffect({ feature: 'tax_overhauling' })` to detect SuiteTax.

```javascript
define(['N/runtime'], function(runtime) {
    const isSuiteTaxEnabled = () => {
        return runtime.isFeatureInEffect({
            feature: 'tax_overhauling'
        });
    };
    return { isSuiteTaxEnabled };
});
```

### Sandbox-Aware Scripts

NetSuite sandbox accounts have account IDs with a `_SB` suffix (for example, `1234567_SB1`, `1234567_SB2`). Use `runtime.accountId` to detect the environment and adjust behavior — this prevents sandbox tests from triggering real-world side effects like external API calls, production emails, or payment gateway transactions.

**Pattern: Detect Sandbox**

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/https', 'N/email', 'N/log'], (runtime, https, email, log) => {

    const execute = () => {
        const isSandbox = runtime.accountId.includes('_SB');

        if (isSandbox) {
            log.audit('Environment', 'Running in sandbox — skipping external calls');
        }

        // GOOD: Skip production payment gateway in sandbox.
        if (!isSandbox) {
            https.post({
                url: 'https://api.paymentgateway.com/charge',
                body: JSON.stringify(chargeData)
            });
        } else {
            // Use sandbox/test endpoint instead.
            https.post({
                url: 'https://sandbox.paymentgateway.com/charge',
                body: JSON.stringify(chargeData)
            });
        }

        // GOOD: Route emails to a test address in sandbox.
        const emailRecipient = isSandbox
            ? 'dev-test@mycompany.com'
            : 'orders@mycompany.com';

        email.send({
            author: runtime.getCurrentUser().id,
            recipients: [emailRecipient],
            subject: 'Order Processed',
            body: 'Your order has been processed.'
        });
    };

    return { execute };
});
```

**Common Sandbox Guard Use Cases:**

| Scenario | Sandbox Behavior |
|----------|-----------------|
| External HTTP calls | Route to test/sandbox endpoint, or skip entirely |
| Email sends | Redirect to dev team address |
| Payment/ERP integrations | Use test credentials or no-op |
| Webhooks / outbound triggers | Skip or log-only |
| SMS / push notifications | Suppress |

### No DOM Manipulation in SuiteScript

SuiteScript must **never** directly access or manipulate the browser DOM. NetSuite's internal DOM structure changes without notice between releases; any direct DOM manipulation will break unpredictably after upgrades.

**Prohibited DOM APIs (never use in SuiteScript):**

```javascript
// BAD: All of these are prohibited.
document.getElementById('custbody_myfield_fs_lbl');
document.querySelector('.uir-field');
jQuery('#some_element').hide();
document.getElementById('myfield').innerHTML = 'value';
window.document.forms[0].elements['custbody_myfield'].value = 'x';
```

**Use SuiteScript APIs instead:**

```javascript
// GOOD: Server-side: use N/ui/serverWidget for forms.
define(['N/ui/serverWidget'], (serverWidget) => {
    const onRequest = (context) => {
        const form = serverWidget.createForm({ title: 'My Form' });
        const field = form.addField({ id: 'custpage_status', type: serverWidget.FieldType.TEXT, label: 'Status' });
        field.defaultValue = 'Active';
    };
});

// GOOD: client-side: Use currentRecord API for field access.
define(['N/currentRecord', 'N/ui/dialog', 'N/ui/message'], (currentRecord, dialog, message) => {
    const saveRecord = (context) => {
        const rec = context.currentRecord;
        const status = rec.getValue({ fieldId: 'custbody_status' });

        if (!status) {
            // GOOD: Use N/ui/dialog — NOT alert() or DOM manipulation.
            dialog.alert({ title: 'Validation Error', message: 'Status is required.' });
            return false;
        }
        return true;
    };

    const pageInit = (context) => {
        // GOOD: use N/ui/message for banner notifications
        message.create({
            title: 'Notice',
            message: 'Please review all fields before saving.',
            type: message.Type.INFORMATION
        }).show({ duration: 5000 });
    };

    return { saveRecord, pageInit };
});
```

**Rule Summary:**

| Need | Wrong Approach | Correct Approach |
|------|----------------|-----------------|
| Add a field to a form | `document.createElement(...)` | `form.addField()` (N/ui/serverWidget) |
| Show a popup | `alert()` / `jQuery.dialog()` | `dialog.alert()` (N/ui/dialog) |
| Read a field value | `document.getElementById('field_fs').value` | `currentRecord.getValue({ fieldId: '...' })` |
| Show a status banner | `$('#msg').show()` | `message.create(...).show()` (N/ui/message) |
| Advanced UI | jQuery widgets / vanilla DOM | UIF SPA (see `12-uif-spa-best-practices.md`) |

### Timezone Handling

NetSuite stores dates internally in Pacific Time (PT). Constructing raw date strings or comparing Date objects built in different timezones produces off-by-one-day errors that are notoriously difficult to diagnose.

**Always use the N/format module for date handling:**

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/format', 'N/runtime', 'N/record', 'N/log'], (format, runtime, record, log) => {

    const onRequest = (context) => {

        // GOOD: Parse a user-supplied date string safely.
        const rawDateStr = context.request.parameters.trandate; // for example, "01/15/2024"
        const parsedDate = format.parse({
            value: rawDateStr,
            type: format.Type.DATE
        });

        // GOOD: Format a Date object for display.
        const displayDate = format.format({
            value: parsedDate,
            type: format.Type.DATE
        });

        // GOOD: Get the current user's configured timezone.
        const userTimezone = runtime.getCurrentUser().getPreference({ name: 'TIMEZONE' });
        log.debug('User TZ', userTimezone); // for example, "America/New_York"

        // GOOD: Set a date field on a record using parsed Date object.
        const rec = record.load({ type: record.Type.SALES_ORDER, id: 123, isDynamic: true });
        rec.setValue({ fieldId: 'trandate', value: parsedDate });
        rec.save();
    };

    return { onRequest };
});
```

**Pitfall patterns to avoid:**

```javascript
// BAD: Constructing a date string directly — timezone-dependent, breaks at DST boundaries.
const today = new Date().toISOString().split('T')[0]; // "2024-01-15" may be wrong day in PT.

// BAD: Comparing raw Date objects built in different ways.
const d1 = new Date('2024-01-15');         // Parsed as UTC midnight
const d2 = new Date(2024, 0, 15);           // Parsed as local midnight
// d1 !== d2 in Pacific Time (-8h offset)

// GOOD: Always round-trip through N/format.
const safeDate = format.parse({ value: '01/15/2024', type: format.Type.DATE });
const safeStr  = format.format({ value: safeDate,    type: format.Type.DATE });
```

**Key rules:**
1. Use `format.parse()` to convert any incoming date string to a JS `Date` object.
2. Use `format.format()` to convert a `Date` object back to a display string.
3. Never manually construct date strings for storage or comparison.
4. When passing dates to `record.setValue`, always pass a JS `Date` object (not a string).
5. Use `runtime.getCurrentUser().getPreference({ name: 'TIMEZONE' })` when timezone-aware display is needed.

## Common Pitfalls

1. **Duplicating built-in functionality** — Always extend, never duplicate NetSuite features.
2. **Using external Suitelets** — Strictly prohibited for public endpoints (DDoS vulnerability).
3. **Ignoring feature combinations** — Test with various feature combinations enabled.
4. **Data structure mismatches** — Ensure field sizes/types match between external apps and NetSuite.
5. **Relying on deprecated technologies** — Use REST over SOAP, SuiteScript 2.1 over 1.0.
6. **Passing strings to DATE fields via `record.setValue`** — DATE fields require a JS `Date` object, not a string. Raw strings like `"1/22/2026"` cause "Invalid date value (must be MM/DD/YYYY)" errors on `record.save()`. Always parse date strings to `new Date()` objects before calling `setValue`. Applies to all script types (Suitelet, Map/Reduce, User Event, etc.).
7. **Passing label text to SELECT fields via `record.setValue`** — SELECT (list/record) fields require the internal numeric ID, not the display label. Passing `"2 - Proficient"` to a SELECT field fails. Pre-load list values with SuiteQL (`SELECT id, name FROM customlist_...`) and resolve text to ID before calling `setValue`.
8. **Passing strings to TIMEOFDAY fields via `record.setValue`** — TIMEOFDAY fields require a JS `Date` object, not a string. Passing `"10:00 AM"` causes "Invalid Field Value" errors on `record.save()`. Parse to a Date object with epoch date: `new Date(1970, 0, 1, hours, minutes, 0)`. NetSuite ignores the date portion; using 1970-01-01 avoids DST edge cases. Same applies to TIME fields.

### SDF Custom Record Field Type Pitfalls

9. **FREEFORMTEXT is not a valid SDF fieldtype** — Using `<fieldtype>FREEFORMTEXT</fieldtype>` in any Object XML (custom record fields, transaction body fields, entity fields) causes validation error: `Invalid "fieldtype" reference key "FREEFORMTEXT"`. Despite appearing in some NetSuite documentation, `FREEFORMTEXT` is not a valid SDF enum value. Use `TEXT` (single-line) or `TEXTAREA` (multi-line) for all custom field types.
10. **Cannot change deployed field types** — Once a field is deployed (for example, as SELECT), changing its type in XML (for example, to TEXT) will fail with "The fieldtype field must not be [newtype]". Instead, create a new field with the desired type and migrate data.
11. **Using string literals for standard record types** — Passing `'customer'` or `'salesorder'` as the `type` parameter instead of `record.Type.CUSTOMER` or `search.Type.SALES_ORDER`. String literals bypass IDE validation and are prone to silent typo failures. Use `record.Type.*` / `search.Type.*` enums for all standard record types; reserve string literals for custom records (`customrecord_*`).
12. **`bodytransactiontypes` element unsupported in SDF Object XML** — Adding `<bodytransactiontypes><bodytransactiontype>WORKORDER</bodytransactiontype></bodytransactiontypes>` to a `transactionbodycustomfield` Object XML causes validation warning: `The object field "bodytransactiontypes" is invalid or not supported`. Transaction body field type filtering cannot be set via SDF Object XML — the field deploys to ALL transaction types. To restrict which transactions show the field, configure it manually in the UI after deployment (Customization > Transaction Body Fields > edit field > Applies To subtab).

### Record Creation Pitfalls

13. **Item subsidiary sublist is static — use body-level `subsidiary` field** — Creating items (Service, Inventory, Non-Inventory, etc.) and attempting to manipulate the `subsidiary` sublist with `selectNewLine`/`setCurrentSublistValue`/`commitLine` throws: `You have attempted an invalid sublist or line item operation. You are either trying to access a field on a non-existent line or you are trying to add or remove lines from a static sublist`. The subsidiary sublist on item records is **static** and cannot be modified via sublist APIs. **Fix**: set `subsidiary` as a body-level field using `setValue`. Set it before `rate` or other subsidiary-dependent fields so sourcing works correctly.

```javascript
// BAD: Subsidiary sublist is static, sublist APIs fail.
const itemRec = record.create({ type: 'serviceitem', isDynamic: true });
itemRec.selectNewLine({ sublistId: 'subsidiary' });         // ERROR
itemRec.setCurrentSublistValue({ sublistId: 'subsidiary',
    fieldId: 'subsidiary', value: subsidiaryId });
itemRec.commitLine({ sublistId: 'subsidiary' });

// GOOD: Set subsidiary as a body-level field.
const itemRec = record.create({ type: 'serviceitem', isDynamic: true });
itemRec.setValue({ fieldId: 'subsidiary', value: subsidiaryId });
itemRec.setValue({ fieldId: 'rate', value: 350 });  // Set after subsidiary.
```

### AMD Module Loading Pitfalls

11. **Mixing `var` and `const`/`let` for the same identifier in overlapping scopes crashes the AMD loader** — `var` declarations hoist to function scope, passing through `try`/`if`/`for` blocks. If a `const` or `let` with the same name exists in an enclosing block (for example, the `try` block), JavaScript throws a `SyntaxError` at parse time. In NetSuite, this prevents the AMD module from loading at all, resulting in an **HTTP 500 with no execution log entries** — the script never reaches `onRequest`/`execute`/etc. This is extremely difficult to diagnose because there is no error message in the UI or logs; only the browser console shows a generic 500. **Fix**: use `const` or `let` consistently for block-scoped variables; never change a `const` to `var` without checking all other declarations of the same name in the enclosing function. Run `node --check <file>` locally before deploying to catch this class of error.

```javascript
// BAD. SyntaxError: 'date' has already been declared.
function parseDate(str) {
    try {
        if (/pattern1/.test(str)) {
            var date = new Date(str);    // var hoists to function scope, through try block.
            return date;
        }
        const date = new Date(str);      // const in try block conflicts with hoisted var.
        return date;
    } catch (e) { return null; }
}

// GOOD: Each const is block-scoped, no conflicts.
function parseDate(str) {
    try {
        if (/pattern1/.test(str)) {
            const date = new Date(str);  // block-scoped to if block.
            return date;
        }
        const date = new Date(str);      // block-scoped to try block; no conflict.
        return date;
    } catch (e) { return null; }
}
```

12. **Calling N/ API modules at `define()` callback scope causes `SUITESCRIPT_API_UNAVAILABLE_IN_DEFINE`** — All SuiteScript API modules (`N/runtime`, `N/record`, `N/query`, etc.) are injected into the `define()` callback but are **not available for use during callback execution**. They only become available when an entry point function (`execute`, `onRequest`, `beforeSubmit`, etc.) is invoked by the platform. Calling `runtime.getCurrentScript()`, `record.load()`, or any N/ API at module scope causes deployment failure with error: `SUITESCRIPT_API_UNAVAILABLE_IN_DEFINE: All SuiteScript API Modules are unavailable while executing your define callback`. **Fix**: use lazy initialization — declare variables as `null` at module scope and initialize them on first access inside a getter function that's only called from entry points.

```javascript
// BAD . Runtime API called at define() time.
define(['N/runtime', 'N/log'], (runtime, log) => {
    const script = runtime.getCurrentScript();  // FAILS at deploy time
    const PERF_ENABLED = script.getParameter({ name: 'custscript_perf' });
    const execute = (context) => { /* ... */ };
    return { execute };
});

// GOOD. Lazy initialization, API called only from entry points.
define(['N/runtime', 'N/log'], (runtime, log) => {
    let _script = null;
    const _getScript = () => {
        if (!_script) { _script = runtime.getCurrentScript(); }
        return _script;
    };
    const execute = (context) => {
        const perfEnabled = _getScript().getParameter({ name: 'custscript_perf' });
        /* ... */
    };
    return { execute };
});
```

## Building Fault Tolerant SuiteApps

### Potential Failure Points
1. Network Connection
2. Third-party Connector SuiteApps
3. Web Services Endpoint
4. NetSuite Backend
5. Server Side SuiteScript
6. External Cloud Systems

### Handling External System Failures
```javascript
// Handle N/http and N/https errors gracefully.
try {
    const response = https.get({ url: externalUrl });
} catch (e) {
    if (e.name === 'SSS_CONNECTION_CLOSED' ||
        e.name === 'SSS_CONNECTION_TIME_OUT') {
        // Handle gracefully (log, retry, notify).
    }
}
```

## SuiteSuccess Considerations

- SuiteSuccess accounts come pre-configured with 20+ SuiteBundles.
- **Do NOT** add, change, delete, or reference objects in pre-existing SuiteSuccess bundles.
- Develop SuiteApps in non-SuiteSuccess accounts.
- Test in SuiteSuccess accounts to uncover potential conflicts.

## Further Reading

Search in NetSuite Help Center or SuiteAnswers:
- NetSuite Documentation Overview
- Understanding Accounting-Related Features
- Understanding General Ledger Impact of Transactions
- Inventory Management
- Understanding NetSuite OneWorld
- Understanding NetSuite Features in Web Services
