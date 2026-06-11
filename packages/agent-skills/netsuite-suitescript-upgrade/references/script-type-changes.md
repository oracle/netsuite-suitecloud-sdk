# Script Type Changes: SuiteScript 1.0 → 2.1
> Author: Oracle NetSuite

> Complete entry point migration reference for all script types.
> SuiteScript 2.1 uses `@NApiVersion` and `@NScriptType` JSDoc tags with AMD `define()` module loading.

---

## User Event Script

### SS1.0 Pattern

```javascript
/**
 * @param {string} type - Operation type: create, edit, view, copy, print, email
 */
function beforeLoad(type, form, request) {
    if (type !== 'create') return;
    nlapiSetFieldValue('phone', '555-555-5555');
}

/**
 * @param {string} type - Operation type: create, edit, delete, xedit (inline edit)
 */
function beforeSubmit(type) {
    if (type !== 'create') return;
    var rec = nlapiGetNewRecord();
    rec.setFieldValue('comments', 'Follow up required');
}

/**
 * @param {string} type - Operation type: create, edit, delete, xedit
 */
function afterSubmit(type) {
    if (type !== 'create') return;
    var customerId = nlapiGetRecordId();
    nlapiLogExecution('DEBUG', 'Customer created', customerId);
}
```

### SS2.1 Pattern

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log'], (record, log) => {

    const beforeLoad = (context) => {
        // context.type uses context.UserEventType enum
        if (context.type !== context.UserEventType.CREATE) return;

        // context.newRecord is provided by the system
        const rec = context.newRecord;
        rec.setValue({ fieldId: 'phone', value: '555-555-5555' });

        // context.form (Form object) available in beforeLoad only
        // context.request (ServerRequest) available in beforeLoad only
    };

    const beforeSubmit = (context) => {
        if (context.type !== context.UserEventType.CREATE) return;

        const newRec = context.newRecord;
        const oldRec = context.oldRecord; // previous values (null on create)
        newRec.setValue({ fieldId: 'comments', value: 'Follow up required' });
    };

    const afterSubmit = (context) => {
        if (context.type !== context.UserEventType.CREATE) return;

        const newRec = context.newRecord;
        log.debug({ title: 'Customer created', details: newRec.id });
    };

    return { beforeLoad, beforeSubmit, afterSubmit };
});
```

### Key Differences

| Aspect | SS1.0 | SS2.1 |
|--------|-------|-------|
| Operation type | String parameter (`'create'`, `'edit'`) | `context.UserEventType` enum (`CREATE`, `EDIT`, `DELETE`, `XEDIT`, `COPY`, `VIEW`, `APPROVE`, `REJECT`, `CANCEL`, `PACK`, `SHIP`, `DROPSHIP`, `SPECIALORDER`, `PRINT`, `INLINE_EDIT`) |
| Record access | `nlapiGetNewRecord()` / `nlapiGetOldRecord()` | `context.newRecord` / `context.oldRecord` |
| Form access | `form` parameter in beforeLoad | `context.form` in beforeLoad |
| Request access | `request` parameter in beforeLoad | `context.request` in beforeLoad |
| Return value | None required | None required |

### Gotchas

- In SS1.0, `type` was a string; in SS2.1 it's a string from `context.UserEventType` enum; use the enum for comparison
- `context.oldRecord` is only available in `beforeSubmit` and `afterSubmit` (not `beforeLoad`)
- In `afterSubmit`, `context.newRecord` fields may return stale values; reload with `record.load()` for current data
- The `form` and `request` objects are only available in `beforeLoad`

---

## Client Script

### SS1.0 Pattern

```javascript
/**
 * @param {string} type - The access mode: create, copy, edit
 */
function pageInit(type) {
    if (type !== 'create') return;
    nlapiSetFieldValue('entity', '107');
}

function saveRecord() {
    if (!nlapiGetFieldValue('entity')) {
        alert('Please enter a customer.');
        return false;
    }
    return true;
}

function validateField(type, name, linenum) {
    // type = sublist internal ID (or null for body field)
    // name = field internal ID
    // linenum = line number (1-based, or null for body field)
    return true;
}

function fieldChanged(type, name, linenum) {
    if (type === 'item' && name === 'item') {
        var itemId = nlapiGetCurrentLineItemValue('item', 'item');
        nlapiSetFieldValue('memo', 'Selected item: ' + itemId);
    }
}

function postSourcing(type, name) {
    // Fires after sourcing completes (for example, after item selection populates price)
}

/**
 * Called when a sublist is recalculated (1.0 name: recalc)
 */
function recalc(type) {
    // Fires when sublist totals change
}

function lineInit(type) {
    // Fires when a new or existing line is selected in a sublist
}

function validateLine(type) {
    return true; // return false to reject line commit
}

function validateInsert(type) {
    return true; // return false to reject new line insertion
}

function validateDelete(type) {
    return true; // return false to prevent line deletion
}
```

### SS2.1 Pattern

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/error'], (error) => {

    const pageInit = (context) => {
        // context.mode replaces type: 'create' | 'copy' | 'edit'
        if (context.mode !== 'create') return;

        // context.currentRecord replaces nlapiGetFieldValue/nlapiSetFieldValue
        context.currentRecord.setValue({ fieldId: 'entity', value: '107' });
    };

    const saveRecord = (context) => {
        const rec = context.currentRecord;
        if (!rec.getValue({ fieldId: 'entity' })) {
            // Use N/error or alert — do NOT use nlapiLogExecution
            throw error.create({
                name: 'MISSING_REQ_ARG',
                message: 'Please enter a customer.'
            });
        }
        return true; // return true to allow save, false to block
    };

    const validateField = (context) => {
        // context.sublistId (null for body fields)
        // context.fieldId (field internal ID)
        // context.line (0-based line number, null for body fields)
        // context.column (for matrix fields)
        return true; // return true to accept, false to reject
    };

    const fieldChanged = (context) => {
        const rec = context.currentRecord;
        if (context.sublistId === 'item' && context.fieldId === 'item') {
            const itemId = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item'
            });
            rec.setValue({ fieldId: 'memo', value: `Selected item: ${itemId}` });
        }
    };

    const postSourcing = (context) => {
        // context.sublistId, context.fieldId
        // Fires after field sourcing completes
    };

    // SS1.0 "recalc" is renamed to "sublistChanged" in SS2.1
    const sublistChanged = (context) => {
        // context.sublistId
        // context.operation — 'commit' | 'remove' | 'insert'
        const rec = context.currentRecord;
        rec.setValue({
            fieldId: 'memo',
            value: `Total changed to ${rec.getValue({ fieldId: 'total' })}`
        });
    };

    const lineInit = (context) => {
        // context.sublistId
        const rec = context.currentRecord;
        if (context.sublistId === 'partners') {
            rec.setCurrentSublistValue({
                sublistId: 'partners',
                fieldId: 'partner',
                value: '55'
            });
        }
    };

    const validateLine = (context) => {
        // context.sublistId
        return true;
    };

    const validateInsert = (context) => {
        // context.sublistId
        return true;
    };

    const validateDelete = (context) => {
        // context.sublistId
        // context.lineCount — total lines before deletion (new in 2.1)
        return true;
    };

    return {
        pageInit,
        saveRecord,
        validateField,
        fieldChanged,
        postSourcing,
        sublistChanged,  // was "recalc" in SS1.0
        lineInit,
        validateLine,
        validateInsert,
        validateDelete
    };
});
```

### Key Differences

| Aspect | SS1.0 | SS2.1 |
|--------|-------|-------|
| Page mode parameter | `type` string in `pageInit(type)` | `context.mode` |
| Sublist recalc | `recalc(type)` | `sublistChanged(context)` |
| Record access | `nlapiGetFieldValue()` / `nlapiSetFieldValue()` | `context.currentRecord.getValue()` / `.setValue()` |
| Line numbers | 1-based `linenum` parameter | 0-based `context.line` |
| Field reference | `name` parameter | `context.fieldId` |
| Sublist reference | `type` parameter | `context.sublistId` |
| New entry points | N/A | `localizationContextEnter`, `localizationContextExit` |
| New context properties | N/A | `context.column` (validateField, fieldChanged), `context.lineCount` (validateDelete) |

### Gotchas

- The `recalc` event type was **renamed** to `sublistChanged`; the function name in the return object must use the new name
- `context.currentRecord` uses the `N/currentRecord` module (not `N/record`); they have different capabilities
- `context.line` is **0-based** in SS2.1 vs **1-based** `linenum` in SS1.0
- `context.mode` replaces `type` in `pageInit`; values remain `'create'`, `'copy'`, `'edit'`
- Client scripts cannot use `record.load()` or `record.save()`; use `currentRecord` module methods

---

## Scheduled Script

### SS1.0 Pattern

```javascript
/**
 * Scheduled script entry point (no formal entry point structure)
 * @param {string} type - Context type: scheduled, ondemand, userinterface, aborted, skipped
 */
function scheduledScript(type) {
    // Check remaining governance
    var remaining = nlapiGetContext().getRemainingUsage();

    var search = nlapiSearchRecord('salesorder', null, [
        new nlobjSearchFilter('status', null, 'is', 'SalesOrd:B')
    ]);

    if (search) {
        for (var i = 0; i < search.length; i++) {
            nlapiSubmitField('salesorder', search[i].getId(), 'memo', 'Processed');

            // Check governance and yield if needed
            if (nlapiGetContext().getRemainingUsage() < 100) {
                nlapiSetRecoveryPoint();
                nlapiYieldScript();
            }
        }
    }
}
```

### SS2.1 Pattern

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/record', 'N/runtime', 'N/log'], (search, record, runtime, log) => {

    const execute = (context) => {
        // context.type uses runtime.ContextType enum:
        //   SCHEDULED, ON_DEMAND, USER_INTERFACE, ABORTED, SKIPPED
        log.debug({ title: 'Invocation type', details: context.type });

        const script = runtime.getCurrentScript();

        const soSearch = search.create({
            type: search.Type.SALES_ORDER,
            filters: [['status', 'is', 'SalesOrd:B']],
            columns: ['entity', 'total']
        });

        soSearch.run().each((result) => {
            record.submitFields({
                type: record.Type.SALES_ORDER,
                id: result.id,
                values: { memo: 'Processed' }
            });

            // Check governance — no need for recovery points or yield
            const remaining = script.getRemainingUsage();
            log.debug({ title: 'Remaining usage', details: remaining });

            return remaining > 100; // return false to stop iteration
        });
    };

    return { execute };
});
```

### Key Differences

| Aspect | SS1.0 | SS2.1 |
|--------|-------|-------|
| Entry point | Any function name (set in script record) | `execute` (required name) |
| Context type | String parameter | `context.type` using `runtime.ContextType` enum |
| Governance | `nlapiSetRecoveryPoint()` + `nlapiYieldScript()` | Not needed; use Map/Reduce for large jobs |
| Rescheduling | `nlapiScheduleScript(scriptId, deployId, params)` | `task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT })` |
| Governance cost | 10,000 units | 10,000 units (unchanged) |

### Gotchas

- `nlapiSetRecoveryPoint()` and `nlapiYieldScript()` have **no equivalent** in SS2.1; use Map/Reduce for large data processing.
- The `execute` entry point name is mandatory — you cannot choose a custom function name.
- For processing large datasets, prefer **Map/Reduce** over Scheduled Script.

---

## Suitelet

### SS1.0 Pattern

```javascript
/**
 * @param {nlobjRequest} request
 * @param {nlobjResponse} response
 */
function suitelet(request, response) {
    if (request.getMethod() === 'GET') {
        var form = nlapiCreateForm('My Custom Form');
        form.addField('custfield', 'text', 'Custom Field');
        form.addSubmitButton('Submit');
        response.writePage(form);
    } else {
        var value = request.getParameter('custfield');
        nlapiLogExecution('DEBUG', 'Submitted value', value);
        response.write('Value received: ' + value);
    }
}
```

### SS2.1 Pattern

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/log'], (serverWidget, log) => {

    const onRequest = (context) => {
        // context.request = http.ServerRequest
        // context.response = http.ServerResponse

        if (context.request.method === 'GET') {
            const form = serverWidget.createForm({ title: 'My Custom Form' });
            form.addField({
                id: 'custfield',
                type: serverWidget.FieldType.TEXT,
                label: 'Custom Field'
            });
            form.addSubmitButton({ label: 'Submit' });
            context.response.writePage({ pageObject: form });
        } else {
            const value = context.request.parameters.custfield;
            log.debug({ title: 'Submitted value', details: value });
            context.response.write({ output: `Value received: ${value}` });
        }
    };

    return { onRequest };
});
```

### Key Differences

| Aspect | SS1.0 | SS2.1 |
|--------|-------|-------|
| Entry point | Any function name (set in script record) | `onRequest` (required name) |
| Parameters | `(request, response)` | `(context)` with `.request` and `.response` |
| HTTP method | `request.getMethod()` | `context.request.method` (property) |
| Query params | `request.getParameter('name')` | `context.request.parameters.name` (property) |
| Form creation | `nlapiCreateForm(title)` | `serverWidget.createForm({ title })` |
| Field creation | `form.addField(name, type, label)` | `form.addField({ id, type, label })` |
| Write page | `response.writePage(form)` | `context.response.writePage({ pageObject: form })` |
| Governance | 1,000 units | 1,000 units (unchanged) |

### Gotchas

- `onRequest` receives a single `context` object, not separate `request` and `response`
- Field types use `serverWidget.FieldType` enum instead of strings
- `context.request.parameters` is a plain object; access parameters as properties, not via `getParameter()`
- Form/List creation moved from global `nlapi*` functions to the `N/ui/serverWidget` module

---

## RESTlet

### SS1.0 Pattern

```javascript
/**
 * @param {Object} datain - Request body (parsed JSON)
 * @returns {Object} Response body
 */
function getRESTlet(datain) {
    var rec = nlapiLoadRecord('customer', datain.id);
    return {
        name: rec.getFieldValue('companyname'),
        email: rec.getFieldValue('email')
    };
}

function postRESTlet(datain) {
    var rec = nlapiCreateRecord('customer');
    rec.setFieldValue('companyname', datain.name);
    rec.setFieldValue('email', datain.email);
    var id = nlapiSubmitRecord(rec);
    return { id: id };
}

function putRESTlet(datain) {
    var id = datain.id;
    nlapiSubmitField('customer', id, 'email', datain.email);
    return { status: 'updated' };
}

function deleteRESTlet(datain) {
    nlapiDeleteRecord('customer', datain.id);
    return { status: 'deleted' };
}
```

### SS2.1 Pattern

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/log'], (record, log) => {

    const get = (requestParams) => {
        // requestParams = URL query parameters as object
        const rec = record.load({
            type: record.Type.CUSTOMER,
            id: requestParams.id
        });
        return {
            name: rec.getValue({ fieldId: 'companyname' }),
            email: rec.getValue({ fieldId: 'email' })
        };
    };

    const post = (requestBody) => {
        // requestBody = parsed JSON body
        const rec = record.create({
            type: record.Type.CUSTOMER,
            isDynamic: false
        });
        rec.setValue({ fieldId: 'companyname', value: requestBody.name });
        rec.setValue({ fieldId: 'email', value: requestBody.email });
        const id = rec.save();
        return { id };
    };

    const put = (requestBody) => {
        record.submitFields({
            type: record.Type.CUSTOMER,
            id: requestBody.id,
            values: { email: requestBody.email }
        });
        return { status: 'updated' };
    };

    // Note: "delete" is a JS reserved word — use a string key in the return object
    const doDelete = (requestParams) => {
        record.delete({
            type: record.Type.CUSTOMER,
            id: requestParams.id
        });
        return { status: 'deleted' };
    };

    return { get, post, put, 'delete': doDelete };
});
```

### Key Differences

| Aspect | SS1.0 | SS2.1 |
|--------|-------|-------|
| Entry points | Custom function names (set in script record) | `get`, `post`, `put`, `delete` (required names) |
| Input format | All receive `datain` | GET/DELETE receive URL params; POST/PUT receive parsed body |
| Error handling | `nlobjError` | `error.SuiteScriptError` with structured error codes |
| Content types | JSON only | JSON and plain text |
| Governance | 5,000 units | 5,000 units (unchanged) |

### Gotchas

- `delete` is a JavaScript reserved word; use `'delete': functionRef` syntax in the return object
- GET and DELETE receive URL query parameters; POST and PUT receive the parsed request body
- RESTlets return JSON by default; return a string for plain text responses
- Error responses in SS2.1 return structured JSON: `{ "error": { "code": "...", "message": "..." } }`

---

## Map/Reduce Script (NEW in SS2.1)

Map/Reduce is a new script type in SuiteScript 2.1 with **no SS1.0 equivalent**. It replaces heavy Scheduled Scripts that required `nlapiSetRecoveryPoint()` and `nlapiYieldScript()`.

### SS2.1 Pattern

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/log', 'N/runtime'], (search, record, log, runtime) => {

    const getInputData = (context) => {
        // Return: search.Search | Object[] | search.ResultSet | file.File
        return search.create({
            type: search.Type.SALES_ORDER,
            filters: [['status', 'is', 'SalesOrd:B']],
            columns: ['entity', 'total']
        });
    };

    const map = (context) => {
        // context.key = result key (internal ID by default)
        // context.value = serialized search result (JSON string)
        const searchResult = JSON.parse(context.value);
        log.debug({ title: 'Map', details: `Processing SO ${context.key}` });

        // Write key-value pairs for reduce stage
        context.write({
            key: searchResult.values.entity.value,
            value: context.key
        });
    };

    const reduce = (context) => {
        // context.key = key from map stage
        // context.values = array of values for this key
        log.debug({
            title: 'Reduce',
            details: `Customer ${context.key}: ${context.values.length} orders`
        });

        context.values.forEach((soId) => {
            record.submitFields({
                type: record.Type.SALES_ORDER,
                id: soId,
                values: { memo: 'Batch processed' }
            });
        });
    };

    const summarize = (context) => {
        // context.inputSummary — input stage stats
        // context.mapSummary — map stage stats and errors
        // context.reduceSummary — reduce stage stats and errors
        // context.output — iterator of all output key-value pairs

        log.audit({
            title: 'Summary',
            details: `Concurrency: ${context.concurrency}, Yields: ${context.yields}`
        });

        // Log any errors
        context.mapSummary.errors.iterator().each((key, error) => {
            log.error({ title: `Map error: ${key}`, details: error });
            return true;
        });
    };

    return { getInputData, map, reduce, summarize };
});
```

### When to Use Instead of Scheduled Script

- Processing more than a few hundred records
- Need automatic parallelization (NetSuite runs map/reduce stages concurrently)
- Need automatic recovery from errors (each key-value pair is independent)
- Need built-in yield handling (no governance management needed)
- Governance: 10,000 units per stage invocation

---

## Portlet Script

### SS1.0 Pattern

```javascript
/**
 * @param {nlobjPortlet} portlet - The portlet object
 * @param {number} column - The portlet column (1, 2, or 3)
 */
function portletScript(portlet, column) {
    portlet.setTitle('My Portlet');
    portlet.addColumn('name', 'text', 'Name', 'left');
    portlet.addColumn('total', 'currency', 'Total', 'right');

    var search = nlapiSearchRecord('salesorder', null, null,
        [new nlobjSearchColumn('entity'), new nlobjSearchColumn('total')]);

    if (search) {
        for (var i = 0; i < search.length; i++) {
            portlet.addRow({
                name: search[i].getText('entity'),
                total: search[i].getValue('total')
            });
        }
    }
}
```

### SS2.1 Pattern

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */
define(['N/search', 'N/log'], (search, log) => {

    const render = (context) => {
        // context.portlet = Portlet object
        // context.column = column position (1, 2, or 3)
        // context.entityId = entity ID if portlet is on entity dashboard

        const portlet = context.portlet;
        portlet.title = 'My Portlet';  // property, not setTitle()

        portlet.addColumn({
            id: 'name',
            type: 'text',
            label: 'Name',
            align: 'LEFT'
        });
        portlet.addColumn({
            id: 'total',
            type: 'currency',
            label: 'Total',
            align: 'RIGHT'
        });

        const soSearch = search.create({
            type: search.Type.SALES_ORDER,
            columns: ['entity', 'total']
        });

        soSearch.run().each((result) => {
            portlet.addRow({
                name: result.getText({ name: 'entity' }),
                total: result.getValue({ name: 'total' })
            });
            return true; // continue iteration
        });
    };

    return { render };
});
```

### Key Differences

| Aspect | SS1.0 | SS2.1 |
|--------|-------|-------|
| Entry point | Custom function name | `render` (required name) |
| Parameters | `(portlet, column)` | `(context)` with `.portlet`, `.column`, `.entityId` |
| Title | `portlet.setTitle(title)` | `portlet.title = title` (property) |
| HTML content | `portlet.setHtml(html)` | `portlet.html = html` (property) |
| Refresh | `portlet.setRefreshInterval(n)` | **Removed**; no equivalent |
| Client script | `portlet.setScript(scriptId)` | `portlet.clientScriptFileId` or `portlet.clientScriptModulePath` |
| Column params | `(name, type, label, just)` | `({ id, type, label, align })` |
| New capability | N/A | Can be used in SuiteApps |

### Gotchas

- `setRefreshInterval()` has no SS2.1 equivalent
- `setScript()` is replaced by two properties: `clientScriptFileId` (internal ID) or `clientScriptModulePath` (file path)
- `portlet.title` and `portlet.html` are now **properties**, not setter methods
- Column alignment values changed: `'left'` → `'LEFT'`

---

## Mass Update Script

### SS1.0 Pattern

```javascript
/**
 * @param {string} rec_type - Record type internal ID
 * @param {number} rec_id - Record internal ID
 */
function massUpdate(rec_type, rec_id) {
    var rec = nlapiLoadRecord(rec_type, rec_id);
    rec.setFieldValue('memo', 'Mass updated');
    nlapiSubmitRecord(rec);
}
```

### SS2.1 Pattern

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */
define(['N/record', 'N/log'], (record, log) => {

    const each = (params) => {
        // params.type = record type internal ID
        // params.id = record internal ID (number)
        record.submitFields({
            type: params.type,
            id: params.id,
            values: { memo: 'Mass updated' }
        });
        log.debug({ title: 'Updated', details: `${params.type} ${params.id}` });
    };

    return { each };
});
```

### Key Differences

| Aspect | SS1.0 | SS2.1 |
|--------|-------|-------|
| Entry point | Custom function name | `each` (required name) |
| Parameters | `(rec_type, rec_id)` positional | `(params)` object with `.type` and `.id` |
| Governance | 1,000 units per record | 1,000 units per record (unchanged) |

---

## Bundle Installation Script

### SS1.0 Pattern

```javascript
function beforeInstall(toversion) {
    nlapiLogExecution('AUDIT', 'Installing', 'Version: ' + toversion);
}

function afterInstall(toversion) {
    // Create initial configuration records
    var config = nlapiCreateRecord('customrecord_config');
    config.setFieldValue('name', 'default');
    nlapiSubmitRecord(config);
}

function beforeUpdate(fromversion, toversion) {
    nlapiLogExecution('AUDIT', 'Updating', fromversion + ' -> ' + toversion);
}

function afterUpdate(fromversion, toversion) {
    // Run migration logic
}

function beforeUninstall(toversion) {
    // Cleanup before uninstall
    nlapiLogExecution('AUDIT', 'Uninstalling', 'Version: ' + toversion);
}
```

### SS2.1 Pattern

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType BundleInstallationScript
 */
define(['N/record', 'N/log'], (record, log) => {

    const beforeInstall = (context) => {
        // context.version replaces toversion
        log.audit({ title: 'Installing', details: `Version: ${context.version}` });
    };

    const afterInstall = (context) => {
        const config = record.create({
            type: 'customrecord_config',
            isDynamic: false
        });
        config.setValue({ fieldId: 'name', value: 'default' });
        config.save();
    };

    const beforeUpdate = (context) => {
        // context.fromVersion and context.version (was toversion)
        log.audit({
            title: 'Updating',
            details: `${context.fromVersion} -> ${context.version}`
        });
    };

    const afterUpdate = (context) => {
        // Run migration logic
    };

    const beforeUninstall = (context) => {
        log.audit({ title: 'Uninstalling', details: `Version: ${context.version}` });
    };

    return { beforeInstall, afterInstall, beforeUpdate, afterUpdate, beforeUninstall };
});
```

### Key Differences

| Aspect | SS1.0 | SS2.1 |
|--------|-------|-------|
| Version parameter | `toversion` positional | `context.version` |
| From version | `fromversion` positional | `context.fromVersion` |
| Entry point names | Same: beforeInstall, afterInstall, beforeUpdate, afterUpdate, beforeUninstall | Same names, wrapped in context |

---

## Workflow Action Script

### SS1.0 Pattern

```javascript
/**
 * @param {string} type - always 'workflowaction'
 * @param {Object} form - The form object (if applicable)
 * @param {number} id - The workflow ID
 */
function onAction(type, form, id) {
    var rec = nlapiGetNewRecord();
    var salesRep = rec.getFieldValue('salesrep');
    if (!salesRep) {
        rec.setFieldValue('salesrep', nlapiGetUser());
    }
    return salesRep || nlapiGetUser();
}
```

### SS2.1 Pattern

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/runtime', 'N/log'], (runtime, log) => {

    const onAction = (context) => {
        // context.newRecord — the record being processed
        // context.oldRecord — previous record values
        // context.workflowId — replaces id parameter
        // context.type — user event type
        // context.form — form object (if applicable)

        const rec = context.newRecord;
        let salesRep = rec.getValue({ fieldId: 'salesrep' });

        if (!salesRep) {
            salesRep = runtime.getCurrentUser().id;
            rec.setValue({ fieldId: 'salesrep', value: salesRep });
        }

        return salesRep; // Return value can be used in workflow
    };

    return { onAction };
});
```

### Key Differences

| Aspect | SS1.0 | SS2.1 |
|--------|-------|-------|
| Entry point | Custom function name | `onAction` (required name) |
| Record access | `nlapiGetNewRecord()` | `context.newRecord` |
| Old record | Not available | `context.oldRecord` (new in 2.1) |
| Workflow ID | `id` parameter | `context.workflowId` |
| Current user | `nlapiGetUser()` | `runtime.getCurrentUser().id` |

---

## SDF Installation Script (NEW in SS2.1)

SDF Installation Scripts are new in SuiteScript 2.1; used for deployment tasks during SuiteApp deployment via SDF. They have no SS1.0 equivalent.

### SS2.1 Pattern

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType SDFInstallationScript
 */
define(['N/record', 'N/log', 'N/runtime'], (record, log, runtime) => {

    const run = (context) => {
        // context.fromVersion — version being upgraded from (null on fresh install)
        // context.toVersion — version being installed

        if (!context.fromVersion) {
            log.audit({ title: 'Fresh Install', details: `Version ${context.toVersion}` });
            // Create initial data
        } else {
            log.audit({
                title: 'Upgrade',
                details: `${context.fromVersion} -> ${context.toVersion}`
            });
            // Run migration logic
        }
    };

    return { run };
});
```

---

## Quick Reference: Entry Point Names

| Script Type | SS1.0 Entry Point | SS2.1 Entry Point | @NScriptType Value |
|-------------|-------------------|--------------------|--------------------|
| User Event | Custom function names | `beforeLoad`, `beforeSubmit`, `afterSubmit` | `UserEventScript` |
| Client Script | `pageInit`, `fieldChanged`, etc. + `recalc` | `pageInit`, `fieldChanged`, etc. + `sublistChanged` | `ClientScript` |
| Scheduled | Custom function name | `execute` | `ScheduledScript` |
| Suitelet | Custom function name | `onRequest` | `Suitelet` |
| RESTlet | Custom function names | `get`, `post`, `put`, `delete` | `Restlet` |
| Map/Reduce | N/A (new) | `getInputData`, `map`, `reduce`, `summarize` | `MapReduceScript` |
| Portlet | Custom function name | `render` | `Portlet` |
| Mass Update | Custom function name | `each` | `MassUpdateScript` |
| Bundle Install | `beforeInstall`, `afterInstall`, etc. | Same names, context wrapper | `BundleInstallationScript` |
| Workflow Action | Custom function name | `onAction` | `WorkflowActionScript` |
| SDF Install | N/A (new) | `run` | `SDFInstallationScript` |
