# Breaking Changes: SuiteScript 1.0 → 2.1
> Author: Oracle NetSuite

> Comprehensive guide to behavioral changes that break SS1.0 code when migrating to SS2.1.
> Each section includes before/after examples and the common migration mistake to avoid.

---

## 1. Module Loading: Global Scope → AMD define()

### What Changed

SuiteScript 1.0 provided all APIs as global functions (`nlapi*`) and objects (`nlobj*`). SuiteScript 2.1 uses AMD (Asynchronous Module Definition) with `define()`; every module must be explicitly loaded.

### SS1.0 — Global Functions

```javascript
// All nlapi functions available globally — no imports needed
function beforeSubmit(type) {
    var rec = nlapiGetNewRecord();
    var name = nlapiLookupField('customer', rec.getFieldValue('entity'), 'companyname');
    nlapiLogExecution('DEBUG', 'Customer', name);
}
```

### SS2.1 — AMD Module Loading

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/log'], (search, log) => {

    const beforeSubmit = (context) => {
        const rec = context.newRecord;
        const fields = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: rec.getValue({ fieldId: 'entity' }),
            columns: ['companyname']
        });
        log.debug({ title: 'Customer', details: fields.companyname });
    };

    return { beforeSubmit };
});
```

### Common Mistake

Forgetting to include a module in the `define()` dependency array but calling it in the function body. This produces a `ReferenceError` at runtime, not a compile-time error.

```javascript
// WRONG — N/record not loaded
define(['N/search'], (search) => {
    const afterSubmit = (context) => {
        record.load({ type: 'salesorder', id: 123 }); // ReferenceError: record is not defined
    };
    return { afterSubmit };
});
```

---

## 2. Options Objects vs Positional Parameters

### What Changed

SS1.0 used positional parameters. SS2.1 uses a single options object with named properties.

### SS1.0 — Positional Parameters

```javascript
// Parameters are positional — order matters, meaning is unclear
nlapiSubmitField('salesorder', 123, 'memo', 'Updated', true);
//                type          id   field   value    doSourcing

var rec = nlapiLoadRecord('customer', 456, { recordmode: 'dynamic' });
nlapiSetFieldValue('companyname', 'Acme Corp', true, false);
//                  field          value       fire   sync
```

### SS2.1 — Options Objects

```javascript
// Named properties — self-documenting, order doesn't matter
record.submitFields({
    type: record.Type.SALES_ORDER,
    id: 123,
    values: { memo: 'Updated' },
    options: { enableSourcing: true }
});

const rec = record.load({
    type: record.Type.CUSTOMER,
    id: 456,
    isDynamic: true
});

rec.setValue({
    fieldId: 'companyname',
    value: 'Acme Corp',
    ignoreFieldChange: false
});
```

### Common Mistake

Passing positional arguments to SS2.1 methods instead of an options object:

```javascript
// WRONG — positional parameters don't work
record.load('customer', 456);

// CORRECT
record.load({ type: record.Type.CUSTOMER, id: 456 });
```

---

## 3. 0-Based vs 1-Based Sublist Indexing

### What Changed

SuiteScript 1.0 uses **1-based** line numbering for sublists. SuiteScript 2.1 uses **0-based** indexing, consistent with JavaScript arrays.

### SS1.0 — 1-Based Indexing

```javascript
var lineCount = nlapiGetLineItemCount('item');  // for example, returns 3
for (var i = 1; i <= lineCount; i++) {          // starts at 1
    var item = nlapiGetLineItemValue('item', 'item', i);
    var qty = nlapiGetLineItemValue('item', 'quantity', i);
    nlapiLogExecution('DEBUG', 'Line ' + i, item + ' x ' + qty);
}

// Select a specific line
nlapiSelectLineItem('item', 2);  // selects 2nd line
```

### SS2.1 — 0-Based Indexing

```javascript
const lineCount = rec.getLineCount({ sublistId: 'item' });  // for example, returns 3
for (let i = 0; i < lineCount; i++) {                        // starts at 0
    const item = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
    const qty = rec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
    log.debug({ title: `Line ${i}`, details: `${item} x ${qty}` });
}

// Select a specific line
rec.selectLine({ sublistId: 'item', line: 1 });  // selects 2nd line (0-based)
```

### Common Mistake

Using 1-based indexing in SS2.1; the first line is `0`, not `1`. Off-by-one errors cause `SSS_INVALID_SUBLIST_OPERATION` or access the wrong line:

```javascript
// WRONG — skips first line, errors on last
for (let i = 1; i <= lineCount; i++) {
    rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
}

// CORRECT
for (let i = 0; i < lineCount; i++) {
    rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
}
```

---

## 4. Parameter Name Changes

### What Changed

Many parameter names were renamed for consistency. The most common renames are:

| SS1.0 Parameter | SS2.1 Parameter |
|-----------------|-----------------|
| `name` / `fldnam` / `fldname` | `fieldId` |
| `type` (sublist context) | `sublistId` |
| `linenum` | `line` |
| `group` | `sublistId` |
| `type` (in pageInit) | `mode` |
| `toversion` | `version` |
| `rec_type` / `rec_id` | `params.type` / `params.id` |
| `id` (workflow) | `workflowId` |
| `just` (alignment) | `align` |
| `name` (portlet column) | `id` |

### SS1.0

```javascript
nlapiGetLineItemValue('item', 'quantity', 3);
//                     type    fldnam     linenum
```

### SS2.1

```javascript
rec.getSublistValue({
    sublistId: 'item',     // was "type"
    fieldId: 'quantity',   // was "fldnam"
    line: 2                // was "linenum" (also 0-based now)
});
```

### Common Mistake

Using the old parameter names in options objects; they silently fail or produce `undefined`:

```javascript
// WRONG — 'name' is the SS1.0 parameter name
rec.getSublistValue({ type: 'item', name: 'quantity', linenum: 2 });

// CORRECT
rec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: 2 });
```

---

## 5. Date Handling

### What Changed

SS1.0 had dedicated date functions (`nlapiAddDays`, `nlapiAddMonths`, `nlapiDateToString`, `nlapiStringToDate`). SS2.1 uses the **N/format** module and native JavaScript Date methods.

### SS1.0 — Dedicated Date Functions

```javascript
var today = new Date();
var futureDate = nlapiAddDays(today, 30);
var dateStr = nlapiDateToString(futureDate, 'date');
nlapiSetFieldValue('custbody_due_date', dateStr);

// Parse a date string
var parsed = nlapiStringToDate('1/15/2025', 'date');
```

### SS2.1 — N/format Module + Native JS

```javascript
define(['N/format'], (format) => {
    const today = new Date();
    today.setDate(today.getDate() + 30);  // native JS — replaces nlapiAddDays

    const dateStr = format.format({
        value: today,
        type: format.Type.DATE
    });
    rec.setValue({ fieldId: 'custbody_due_date', value: dateStr });

    // Parse a date string
    const parsed = format.parse({
        value: '1/15/2025',
        type: format.Type.DATE
    });
});
```

### DateTime with Timezone (No Direct SS2.1 Equivalent)

SS1.0 had timezone-aware functions like `nlapiGetDateTimeValue(fieldId, timeZone)`. In SS2.1, use the `N/format` module with `format.Timezone`:

```javascript
const dateTime = format.format({
    value: new Date(),
    type: format.Type.DATETIMETZ,
    timezone: format.Timezone.AMERICA_LOS_ANGELES
});
```

### Common Mistake

Using `nlapiAddDays` or `nlapiAddMonths`; these have no SS2.1 equivalent. Use native JavaScript Date manipulation:

```javascript
// WRONG — no SS2.1 equivalent
const future = nlapiAddMonths(new Date(), 3);

// CORRECT — native JavaScript
const future = new Date();
future.setMonth(future.getMonth() + 3);
```

---

## 6. Error Handling

### What Changed

SS1.0 used `nlobjError` objects with `getCode()`, `getDetails()`, `getId()`. SS2.1 uses `error.SuiteScriptError` with different property names and the `N/error` module for creating errors.

### SS1.0 — nlobjError

```javascript
try {
    var rec = nlapiLoadRecord('salesorder', 99999);
} catch (e) {
    if (e instanceof nlobjError) {
        nlapiLogExecution('ERROR', 'NS Error', e.getCode() + ': ' + e.getDetails());
        var internalId = e.getId();
    } else {
        nlapiLogExecution('ERROR', 'JS Error', e.toString());
    }
}

// Create custom error
throw nlapiCreateError('MY_ERROR', 'Something went wrong', true);
```

### SS2.1 — N/error Module

```javascript
define(['N/record', 'N/error', 'N/log'], (record, error, log) => {
    try {
        const rec = record.load({ type: record.Type.SALES_ORDER, id: 99999 });
    } catch (e) {
        if (e.name) {
            // SuiteScript error — properties differ from 1.0
            log.error({
                title: 'NS Error',
                details: `${e.name}: ${e.message}`  // was getCode() / getDetails()
            });
            const errorId = e.id;  // was getId()
            const stack = e.stack; // was getStackTrace()
        } else {
            log.error({ title: 'JS Error', details: e.toString() });
        }
    }

    // Create custom error
    throw error.create({
        name: 'MY_ERROR',           // was code parameter
        message: 'Something went wrong',  // was details parameter
        notifyOff: true              // was suppressNotification parameter
    });
});
```

### Property Mapping

| SS1.0 (`nlobjError`) | SS2.1 (`error.SuiteScriptError`) |
|----------------------|----------------------------------|
| `e.getCode()` | `e.name` |
| `e.getDetails()` | `e.message` |
| `e.getId()` | `e.id` |
| `e.getInternalId()` | `e.id` |
| `e.getStackTrace()` | `e.stack` |
| `e.getUserEvent()` | No equivalent |

### Common Mistake

Using `e.getCode()` on a SS2.1 error; it's not a function, it's a property:

```javascript
// WRONG — getCode() is a SS1.0 method
catch (e) { log.error('Error', e.getCode()); }

// CORRECT — use property access
catch (e) { log.error({ title: 'Error', details: e.name }); }
```

---

## 7. Return Values and Changed Types

### What Changed

Several APIs return different types in SS2.1 compared to SS1.0.

### Record Save

```javascript
// SS1.0 — returns internal ID as number
var id = nlapiSubmitRecord(rec);  // returns 123

// SS2.1 — also returns internal ID as number
const id = rec.save();  // returns 123
// But save() accepts options:
const id = rec.save({
    enableSourcing: true,
    ignoreMandatoryFields: false
});
```

### Search Results

```javascript
// SS1.0 — returns array of nlobjSearchResult or null
var results = nlapiSearchRecord('customer', null, filters, columns);
if (results) {  // must check for null
    for (var i = 0; i < results.length; i++) { /*...*/ }
}

// SS2.1 — returns ResultSet with .each() iterator (never null)
const results = search.create({
    type: search.Type.CUSTOMER,
    filters: filters,
    columns: columns
}).run();

results.each((result) => {
    // process result
    return true;  // return true to continue, false to stop
});
// Or use getRange() for paged results
const page = results.getRange({ start: 0, end: 100 });
```

### Lookup Fields

```javascript
// SS1.0 — returns string or array of strings
var name = nlapiLookupField('customer', 123, 'companyname');
// Returns: 'Acme Corp'

var fields = nlapiLookupField('customer', 123, ['companyname', 'email']);
// Returns: {companyname: 'Acme Corp', email: 'info@acme.com'}

// SS2.1 — always returns object (even for single field)
const fields = search.lookupFields({
    type: search.Type.CUSTOMER,
    id: 123,
    columns: ['companyname', 'email']
});
// Returns: {companyname: 'Acme Corp', email: 'info@acme.com'}
// Note: select fields return [{value: '123', text: 'Name'}]
```

### Common Mistake

Assuming `search.create()` returns null for no results (like `nlapiSearchRecord` did). In SS2.1, use `.run().each()`; it simply doesn't iterate if no results:

```javascript
// WRONG — checking for null like SS1.0
const results = search.create({...}).run();
if (results !== null) { /*...*/ }  // results is never null

// CORRECT
search.create({...}).run().each((result) => {
    // This body simply doesn't execute if no results
    return true;
});
```

---

## 8. Dynamic vs Standard Record Mode

### What Changed

SS2.1 introduces explicit record modes. **Dynamic mode** mirrors the UI experience (sourcing, field changes fire automatically). **Standard mode** is faster but has no sourcing or validation.

### SS1.0 — Implicit Mode

```javascript
// 1.0 had optional recordmode parameter but usually just loaded/created records
var rec = nlapiCreateRecord('salesorder');
rec.setFieldValue('entity', 123);         // sourcing fires automatically
rec.selectNewLineItem('item');
rec.setCurrentLineItemValue('item', 'item', 456);
rec.setCurrentLineItemValue('item', 'quantity', 5);
rec.commitLineItem('item');
```

### SS2.1 — Explicit Modes

```javascript
// DYNAMIC MODE — mirrors UI, sourcing fires automatically
const rec = record.create({
    type: record.Type.SALES_ORDER,
    isDynamic: true                    // explicit mode selection
});
rec.setValue({ fieldId: 'entity', value: 123 });
rec.selectNewLine({ sublistId: 'item' });
rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: 456 });
rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: 5 });
rec.commitLine({ sublistId: 'item' });

// STANDARD MODE — faster, no sourcing, direct line access
const rec2 = record.create({
    type: record.Type.SALES_ORDER,
    isDynamic: false                   // default
});
rec2.setValue({ fieldId: 'entity', value: 123 });
// Direct line access by index — no selectLine/commitLine
rec2.setSublistValue({ sublistId: 'item', fieldId: 'item', line: 0, value: 456 });
rec2.setSublistValue({ sublistId: 'item', fieldId: 'quantity', line: 0, value: 5 });
```

### Common Mistake

Mixing dynamic and standard mode methods on the same record:

```javascript
// WRONG — setSublistValue() is for standard mode only
const rec = record.create({ type: record.Type.SALES_ORDER, isDynamic: true });
rec.setSublistValue({ sublistId: 'item', fieldId: 'item', line: 0, value: 456 });
// Throws: SSS_INVALID_API_USAGE

// CORRECT for dynamic mode — use selectNewLine/setCurrentSublistValue/commitLine
rec.selectNewLine({ sublistId: 'item' });
rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: 456 });
rec.commitLine({ sublistId: 'item' });
```

---

## 9. Context Restrictions

### What Changed

SS2.1 enforces stricter context restrictions on which APIs can be called from which script types.

### Key Restrictions

| Module/Method | Available In |
|---------------|-------------|
| `N/currentRecord` | Client scripts only |
| `N/record` (load/save) | Server-side scripts only (not client scripts) |
| `N/ui/serverWidget` | Suitelets, User Events (beforeLoad), Portlets |
| `N/https` (with credentials) | Server-side scripts only |
| `N/task` (create/submit) | Server-side scripts only |
| `N/redirect` | Suitelets, User Events |

### SS1.0

```javascript
// In SS1.0, many APIs were available everywhere
function clientPageInit(type) {
    // This worked in client scripts in SS1.0
    var rec = nlapiLoadRecord('customer', 123);  // server-side call from client
}
```

### SS2.1

```javascript
// SS2.1 enforces strict context boundaries
const pageInit = (context) => {
    // WRONG — N/record.load() is NOT available in client scripts
    const rec = record.load({ type: 'customer', id: 123 });
    // Throws: SSS_MISSING_REQD_ARGUMENT or MODULE_DOES_NOT_EXIST

    // CORRECT — use N/currentRecord in client scripts
    const currentRec = context.currentRecord;
    // Move server-side record access into an appropriate SS2.1 server script.
};
```

### Common Mistake

Using `N/record` in client scripts is a common mistake. Client scripts use `N/currentRecord` for the record being edited. If the original script needs server-side record access, convert that logic into an appropriate SS2.1 server script instead of preserving a 1.0 bridge.

---

## 10. Reserved Words: `log` and `util`

### What Changed

SuiteScript 2.1 introduces `log` and `util` as global objects. If SS1.0 scripts use these as variable names, rename them during conversion.

### SS1.0 — Using `log` as Variable Name

```javascript
function afterSubmit(type) {
    var log = 'Transaction completed';  // legal in SS1.0
    nlapiLogExecution('DEBUG', 'Status', log);
}
```

### SS2.1 — `log` is Reserved

```javascript
const afterSubmit = (context) => {
    const logMessage = 'Transaction completed';  // renamed to avoid conflict
    log.debug({ title: 'Status', details: logMessage });
};
```

### All Reserved Globals in SS2.1

- `log`: Logging module (log.debug, log.audit, log.error, log.emergency)
- `util`: Utility module (util.isArray, util.isObject, util.each, etc.)
- All ECMAScript reserved words (var, let, const, class, function, etc.)

### Common Mistake

Not renaming `log` or `util` variables during conversion. This shadows SS2.1 globals and can break logging or utility calls.

---

## 11. Governance Changes

### What Changed

Most governance costs remain the same between SS1.0 and SS2.1, but Map/Reduce scripts have their own governance model. Key costs:

| Operation | SS1.0 Cost | SS2.1 Cost |
|-----------|-----------|-----------|
| `nlapiLoadRecord` / `record.load` | 10 units | 10 units |
| `nlapiSubmitRecord` / `record.save` | 20 units | 20 units |
| `nlapiSearchRecord` / `search.create` | 10 units | 10 units |
| `nlapiSubmitField` / `record.submitFields` | 10 units | 10 units |
| `nlapiLookupField` / `search.lookupFields` | 5 units | 5 units |
| `nlapiRequestURL` / `http.get/post` | 10 units | 10 units |
| `nlapiSendEmail` / `email.send` | 20 units | 20 units |
| `nlapiSetRecoveryPoint` | 100 units | **Removed** |
| `nlapiYieldScript` | 100 units | **Removed** |

### Governance Limits by Script Type

| Script Type | Limit |
|-------------|-------|
| Client Script | 1,000 units |
| User Event | 1,000 units |
| Suitelet | 1,000 units |
| RESTlet | 5,000 units |
| Scheduled Script | 10,000 units |
| Map/Reduce | 10,000 units per stage |
| Mass Update | 1,000 units per record |
| Portlet | 1,000 units |
| Workflow Action | 1,000 units |
| Bundle Installation | 10,000 units |

### Key Difference

`nlapiSetRecoveryPoint()` (100 units) and `nlapiYieldScript()` (100 units) were removed. Map/Reduce scripts handle yielding automatically, so there's no governance overhead for script continuity.

---

## 12. N/currentRecord vs N/record

### What Changed

SS2.1 splits record access into two modules:
- **N/record** — Server-side record operations (load, create, save, delete, copy, transform)
- **N/currentRecord** — Client-side access to the record currently being edited in the UI

### SS1.0 — Single Set of APIs

```javascript
// Client script — same nlapi functions work everywhere
function pageInit(type) {
    nlapiSetFieldValue('memo', 'Initialized');  // works in client
}

// User Event — same functions
function beforeSubmit(type) {
    nlapiGetNewRecord().setFieldValue('memo', 'Submitted');  // works on server
}
```

### SS2.1 — Separate Modules

```javascript
// Client Script — must use N/currentRecord
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], () => {
    const pageInit = (context) => {
        // context.currentRecord is a CurrentRecord object
        context.currentRecord.setValue({ fieldId: 'memo', value: 'Initialized' });
    };
    return { pageInit };
});

// User Event — must use N/record (via context)
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'], (record) => {
    const beforeSubmit = (context) => {
        // context.newRecord is a Record object
        context.newRecord.setValue({ fieldId: 'memo', value: 'Submitted' });
    };
    return { beforeSubmit };
});
```

### API Differences

| Capability | N/record (Record) | N/currentRecord (CurrentRecord) |
|------------|-------------------|--------------------------------|
| Load records | Yes | No |
| Save records | Yes | No |
| Delete records | Yes | No |
| Copy records | Yes | No |
| Transform records | Yes | No |
| Get/set field values | Yes | Yes |
| Sublist operations | Yes | Yes |
| Get field metadata | Yes | Yes |
| Fires field change events | No (standard mode) | Yes (always) |

### Common Mistake

Trying to use `record.load()` in a client script:

```javascript
// WRONG — N/record.load() not available in client scripts
define(['N/record'], (record) => {
    const pageInit = (context) => {
        const otherRec = record.load({ type: 'customer', id: 123 });
    };
    return { pageInit };
});

// CORRECT — move server-side record access into an appropriate SS2.1 server script
```

---

## 13. Subrecord Scripting

### What Changed

Subrecord handling is fundamentally different in SS2.1:
- No separate create/edit/view methods; single method for all operations
- No explicit save; subrecords save automatically with parent
- No cancel/commit; subrecords are managed through the parent record

### SS1.0

```javascript
// Create a subrecord
var subrecord = rec.createCurrentLineItemSubrecord('item', 'inventorydetail');
subrecord.setFieldValue('quantity', 10);
subrecord.commit();  // explicit commit required

// Edit a subrecord
var subrecord = rec.editSubrecord('addressbook');
subrecord.setFieldValue('city', 'San Francisco');
subrecord.commit();

// Cancel changes
subrecord.cancel();
```

### SS2.1

```javascript
// Get a subrecord (replaces create/edit/view — single method)
const subrecord = rec.getCurrentSublistSubrecord({
    sublistId: 'item',
    fieldId: 'inventorydetail'
});
subrecord.setValue({ fieldId: 'quantity', value: 10 });
// No commit needed — saves automatically with parent record

// Body-level subrecord
const addressSubrecord = rec.getSubrecord({ fieldId: 'addressbook' });
addressSubrecord.setValue({ fieldId: 'city', value: 'San Francisco' });
// No commit needed

// cancel() and commit() have NO SS2.1 equivalents
```

### Common Mistake

Calling `.commit()` or `.save()` on a subrecord in SS2.1; these methods don't exist. Subrecords save automatically when the parent record is saved.

---

## 14. Logging

### What Changed

SS1.0 had a single `nlapiLogExecution(type, title, details)` function. SS2.1 has four level-specific methods in the `N/log` module.

### SS1.0

```javascript
nlapiLogExecution('DEBUG', 'Processing', 'Order 123');
nlapiLogExecution('AUDIT', 'Completed', 'Success');
nlapiLogExecution('ERROR', 'Failed', 'Invalid record');
nlapiLogExecution('EMERGENCY', 'Critical', 'System failure');
```

### SS2.1

```javascript
log.debug({ title: 'Processing', details: 'Order 123' });
log.audit({ title: 'Completed', details: 'Success' });
log.error({ title: 'Failed', details: 'Invalid record' });
log.emergency({ title: 'Critical', details: 'System failure' });

// log is a global object — no need to load N/log module
// (but you can: define(['N/log'], (log) => { ... }))
```

### Log Level Visibility

| Script Log Level | debug | audit | error | emergency |
|-----------------|-------|-------|-------|-----------|
| DEBUG | Shows | Shows | Shows | Shows |
| AUDIT | Hidden | Shows | Shows | Shows |
| ERROR | Hidden | Hidden | Shows | Shows |
| EMERGENCY | Hidden | Hidden | Hidden | Shows |

### Common Mistake

Using string type parameter instead of calling the correct method:

```javascript
// WRONG — no type parameter in SS2.1
log.debug('DEBUG', 'Title', 'Details');

// CORRECT — options object
log.debug({ title: 'Title', details: 'Details' });
```

---

## 15. URL Resolution

### What Changed

SS1.0 had a single `nlapiResolveURL(type, identifier, id, displayMode)` function. SS2.1 splits this into four specific methods in the `N/url` module.

### SS1.0

```javascript
var recordUrl = nlapiResolveURL('RECORD', 'salesorder', 123, 'VIEW');
var scriptUrl = nlapiResolveURL('SUITELET', 'customscript_sl', 'customdeploy_sl');
var taskUrl = nlapiResolveURL('TASKLINK', 'CARD_-29');
```

### SS2.1

```javascript
define(['N/url'], (url) => {
    const recordUrl = url.resolveRecord({
        recordType: 'salesorder',
        recordId: 123,
        isEditMode: false
    });

    const scriptUrl = url.resolveScript({
        scriptId: 'customscript_sl',
        deploymentId: 'customdeploy_sl',
        returnExternalUrl: false
    });

    const taskUrl = url.resolveTaskLink({
        id: 'CARD_-29'
    });

    const domain = url.resolveDomain({
        hostType: url.HostType.APPLICATION
    });
});
```

### Common Mistake

Using `nlapiResolveURL` type strings with SS2.1; the type parameter doesn't exist. Use the specific method for each URL type.

---

## 16. Redirect

### What Changed

SS1.0 used `nlapiSetRedirectURL(type, identifier, id, editmode, parameters)`. SS2.1 provides specific methods in the `N/redirect` module.

### SS1.0

```javascript
nlapiSetRedirectURL('RECORD', 'salesorder', 123, true);
nlapiSetRedirectURL('SUITELET', 'customscript_sl', 'customdeploy_sl');
nlapiSetRedirectURL('TASKLINK', 'CARD_-29');
```

### SS2.1

```javascript
define(['N/redirect'], (redirect) => {
    redirect.toRecord({
        type: 'salesorder',
        id: 123,
        isEditMode: true
    });

    redirect.toSuitelet({
        scriptId: 'customscript_sl',
        deploymentId: 'customdeploy_sl'
    });

    redirect.toTaskLink({ id: 'CARD_-29' });

    // New in SS2.1:
    redirect.toSearch({ id: 123 });
    redirect.toSavedSearch({ id: 123 });
    redirect.toSavedSearchResult({ id: 123 });
    redirect.toSearchResult({ id: 123 });
});
```

### Common Mistake

Calling `redirect` methods in contexts where they're not available (for example, Scheduled Scripts). Redirects are only valid in Suitelets and User Event scripts.
