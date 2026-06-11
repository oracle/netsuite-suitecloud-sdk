# Conversion Guide: SuiteScript 1.0/2.0/2.x → 2.1
> Author: Oracle NetSuite

> Step-by-step guide for converting SuiteScript 1.0, 2.0, and 2.x scripts to SuiteScript 2.1.
> Includes assessment, systematic conversion approach, and a complete before/after example.

---

## Step 1: Assessment

Before converting, evaluate the script's migration complexity.

### Complexity Scoring

| Factor | Low (1 pt) | Medium (2 pts) | High (3 pts) |
|--------|-----------|----------------|--------------|
| **Line count** | < 100 lines | 100-500 lines | 500+ lines |
| **nlapi calls** | < 10 unique | 10-30 unique | 30+ unique |
| **Subrecord usage** | None | Read-only | Create/edit subrecords |
| **Date/time with TZ** | None | Body fields | Sublist date fields |
| **Recovery points** | None | nlapiSetRecoveryPoint | Recovery + Yield pattern |
| **Custom modules** | None | 1-2 includes | 3+ includes |
| **Sublist operations** | None | Read-only | Dynamic line manipulation |

**Score interpretation:**
- **7-10**: Simple — straightforward conversion, estimate 1-2 hours
- **11-15**: Moderate — plan for careful testing, some architectural decisions
- **16-21**: Complex — plan a staged full conversion to SuiteScript 2.1

### Pre-Conversion Checklist

- [ ] Identify all `nlapi*` function calls in the script
- [ ] Identify all `nlobj*` object usage
- [ ] List all script parameters (script record deployments)
- [ ] Document any `nlapiSetRecoveryPoint` / `nlapiYieldScript` usage
- [ ] Check for reserved word conflicts (`log`, `util` as variable names)
- [ ] Check for sublist operations and note 1-based indexing patterns
- [ ] Check for date/time operations with timezone handling
- [ ] Identify any `nlapiIncludeScript` or custom library dependencies
- [ ] Review error handling patterns (`nlobjError` vs try/catch)
- [ ] Note the script type and all deployed entry point functions

---

## Step 2: Preparation — Setting Up the SS2.1 File Structure

SuiteScript 2.1 is the only valid target for this skill. Existing SuiteScript 2.0 or ambiguous 2.x scripts must be upgraded to `@NApiVersion 2.1`; SuiteScript 1.0 scripts must be fully converted to 2.1 APIs and structure.

### 2a. Create the File Header

Every SS2.1 script requires two JSDoc tags:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
```

Valid `@NScriptType` values: `UserEventScript`, `ClientScript`, `ScheduledScript`, `Suitelet`, `Restlet`, `MapReduceScript`, `Portlet`, `MassUpdateScript`, `BundleInstallationScript`, `WorkflowActionScript`, `SDFInstallationScript`

### 2b. Set Up the define() Wrapper

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/log'], (record, search, log) => {

    // Entry point functions go here

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});
```

### 2c. Target 2.1 Only

Use `@NApiVersion 2.1` (not 2.0 or 2.x) to enable modern JavaScript features:

| Feature | 2.0 | 2.1 |
|---------|-----|-----|
| `const` / `let` | No | Yes |
| Arrow functions | No | Yes |
| Template literals | No | Yes |
| Destructuring | No | Yes |
| `for...of` loops | No | Yes |
| Promises | No | Yes |
| `async` / `await` | No | Yes |

---

## Step 3: Module Identification

Map every `nlapi*` function to its required `N/*` module.

### Common Module Mappings

| SS1.0 Function Pattern | Required Module | Variable Name |
|------------------------|-----------------|---------------|
| `nlapiCreateRecord`, `nlapiLoadRecord`, `nlapiSubmitRecord`, `nlapiDeleteRecord`, `nlapiCopyRecord`, `nlapiTransformRecord`, `nlapiSubmitField`, `nlapiAttachRecord`, `nlapiDetachRecord` | `N/record` | `record` |
| `nlapiSearchRecord`, `nlapiCreateSearch`, `nlapiLoadSearch`, `nlapiLookupField`, `nlapiSearchDuplicate`, `nlapiSearchGlobal` | `N/search` | `search` |
| `nlapiLogExecution` | `N/log` | `log` |
| `nlapiSendEmail`, `nlapiSendCampaignEmail` | `N/email` | `email` |
| `nlapiRequestURL`, `nlapiRequestURLWithCredentials` | `N/http` or `N/https` | `http` / `https` |
| `nlapiResolveURL` | `N/url` | `url` |
| `nlapiSetRedirectURL` | `N/redirect` | `redirect` |
| `nlapiCreateFile`, `nlapiLoadFile`, `nlapiDeleteFile`, `nlapiSubmitFile` | `N/file` | `file` |
| `nlapiCreateForm`, `nlapiCreateList`, `nlapiCreateAssistant` | `N/ui/serverWidget` | `serverWidget` |
| `nlapiCreateError` | `N/error` | `error` |
| `nlapiGetContext` | `N/runtime` | `runtime` |
| `nlapiDateToString`, `nlapiStringToDate`, `nlapiFormatCurrency` | `N/format` | `format` |
| `nlapiCreateTemplateRenderer`, `nlapiXMLToPDF`, `nlapiPrintRecord`, `nlapiCreateEmailMerger` | `N/render` | `render` |
| `nlapiScheduleScript`, `nlapiCreateCSVImport` | `N/task` | `task` |
| `nlapiEscapeXML`, `nlapiStringToXML`, `nlapiXMLToString`, `nlapiSelectNode`, `nlapiSelectNodes`, `nlapiValidateXML` | `N/xml` | `xml` |
| `nlapiExchangeRate` | `N/currency` | `currency` |
| `nlapiEncrypt` | `N/crypto` + `N/encode` | `crypto`, `encode` |
| `nlapiLoadConfiguration` | `N/config` | `config` |
| `nlapiGetLogin` | `N/auth` | `auth` |
| `nlapiInitiateWorkflow`, `nlapiTriggerWorkflow` | `N/workflow` | `workflow` |
| `nlapiVoidTransaction` | `N/transaction` | `transaction` |
| `nlapiOutboundSSO` | `N/sso` | `sso` |

### Building Your define() Array

Scan your SS1.0 script for all `nlapi*` calls, then construct:

```javascript
define(['N/record', 'N/search', 'N/log', 'N/email'], (record, search, log, email) => {
    // Only include modules you actually use
});
```

**Tip:** `log` and `util` are global objects in SS2.1; you can use them without adding to define(). However, explicitly including `N/log` makes dependencies clearer.

---

## Step 4: Function Conversion

Systematically convert each `nlapi*` function call to its SS2.1 equivalent.

Do not preserve SuiteScript 1.0 APIs behind compatibility helpers. Avoid compatibility shims, adapter layers, helper wrappers, facades, or polyfills that keep `nlapi*` or `nlobj*` calling semantics alive. Replace each SuiteScript 1.0 API directly with a SuiteScript 2.1 API, native JavaScript, or a documented SuiteScript 2.1 architecture change.

### Record Operations

```javascript
// CREATE
// SS1.0: nlapiCreateRecord(type, initValues)
// SS2.1:
const rec = record.create({
    type: record.Type.SALES_ORDER,  // or string: 'salesorder'
    isDynamic: true,                // optional, default false
    defaultValues: { entity: 123 }  // optional initialization
});

// LOAD
// SS1.0: nlapiLoadRecord(type, id, initValues)
// SS2.1:
const rec = record.load({
    type: record.Type.SALES_ORDER,
    id: 123,
    isDynamic: false
});

// SAVE
// SS1.0: nlapiSubmitRecord(rec, doSourcing, ignoreMandatory)
// SS2.1:
const id = rec.save({
    enableSourcing: true,
    ignoreMandatoryFields: false
});

// DELETE
// SS1.0: nlapiDeleteRecord(type, id)
// SS2.1:
record.delete({ type: record.Type.SALES_ORDER, id: 123 });

// SUBMIT FIELDS (inline edit)
// SS1.0: nlapiSubmitField(type, id, fields, values, doSourcing)
// SS2.1:
record.submitFields({
    type: record.Type.SALES_ORDER,
    id: 123,
    values: { memo: 'Updated', custbody_status: 'Processed' },
    options: { enableSourcing: false }
});

// COPY
// SS1.0: nlapiCopyRecord(type, id, initValues)
// SS2.1:
const copy = record.copy({ type: record.Type.SALES_ORDER, id: 123 });

// TRANSFORM
// SS1.0: nlapiTransformRecord(type, id, transformType, initValues)
// SS2.1:
const invoice = record.transform({
    fromType: record.Type.SALES_ORDER,
    fromId: 123,
    toType: record.Type.INVOICE,
    isDynamic: true
});

// ATTACH / DETACH
// SS1.0: nlapiAttachRecord(type, id, type2, id2, attributes)
// SS2.1:
record.attach({
    record: { type: 'file', id: 456 },
    to: { type: 'salesorder', id: 123 }
});
```

### Field Operations

```javascript
// GET VALUE
// SS1.0: nlapiGetFieldValue('entity')
// SS2.1:
rec.getValue({ fieldId: 'entity' });

// SET VALUE
// SS1.0: nlapiSetFieldValue('memo', 'test', true, false)
// SS2.1:
rec.setValue({
    fieldId: 'memo',
    value: 'test',
    ignoreFieldChange: false  // was firefieldchanged (inverted logic!)
});

// GET TEXT (display value for select fields)
// SS1.0: nlapiGetFieldText('entity')
// SS2.1:
rec.getText({ fieldId: 'entity' });

// SET TEXT
// SS1.0: nlapiSetFieldText('salesrep', 'John Smith')
// SS2.1:
rec.setText({ fieldId: 'salesrep', text: 'John Smith' });

// LOOKUP FIELDS
// SS1.0: nlapiLookupField('customer', id, ['companyname', 'email'])
// SS2.1:
const fields = search.lookupFields({
    type: search.Type.CUSTOMER,
    id: 123,
    columns: ['companyname', 'email']
});
// Note: returns {companyname: 'Acme', email: 'x@y.com'}
// Select fields return: [{value: '123', text: 'Name'}]

// DISABLE FIELD
// SS1.0: nlapiDisableField('entity', true)
// SS2.1:
const field = rec.getField({ fieldId: 'entity' });
field.isDisabled = true;
```

### Sublist Operations

```javascript
// GET LINE COUNT
// SS1.0: nlapiGetLineItemCount('item')
// SS2.1:
const count = rec.getLineCount({ sublistId: 'item' });

// GET SUBLIST VALUE
// SS1.0: nlapiGetLineItemValue('item', 'quantity', 3)   // 1-based
// SS2.1:
rec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: 2 }); // 0-based

// SET SUBLIST VALUE (standard mode)
// SS1.0: nlapiSetLineItemValue('item', 'quantity', 3, '5')   // 1-based
// SS2.1:
rec.setSublistValue({ sublistId: 'item', fieldId: 'quantity', line: 2, value: '5' }); // 0-based

// CURRENT LINE (dynamic mode)
// SS1.0: nlapiGetCurrentLineItemValue('item', 'item')
// SS2.1:
rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'item' });

// SS1.0: nlapiSetCurrentLineItemValue('item', 'quantity', '5', true, false)
// SS2.1:
rec.setCurrentSublistValue({
    sublistId: 'item',
    fieldId: 'quantity',
    value: '5',
    ignoreFieldChange: false
});

// SELECT / COMMIT / INSERT / REMOVE LINES
// SS1.0: nlapiSelectLineItem('item', 3)            // 1-based
// SS2.1:
rec.selectLine({ sublistId: 'item', line: 2 });     // 0-based

// SS1.0: nlapiSelectNewLineItem('item')
rec.selectNewLine({ sublistId: 'item' });

// SS1.0: nlapiCommitLineItem('item')
rec.commitLine({ sublistId: 'item' });

// SS1.0: nlapiInsertLineItem('item', 3)            // 1-based
rec.insertLine({ sublistId: 'item', line: 2 });     // 0-based

// SS1.0: nlapiRemoveLineItem('item', 3)            // 1-based
rec.removeLine({ sublistId: 'item', line: 2 });     // 0-based

// FIND LINE
// SS1.0: nlapiFindLineItemValue('item', 'item', '456')
// SS2.1:
const line = rec.findSublistLineWithValue({
    sublistId: 'item',
    fieldId: 'item',
    value: '456'
});
// Returns 0-based line index, or -1 if not found
```

### Search Operations

```javascript
// CREATE SEARCH
// SS1.0: nlapiSearchRecord(type, id, filters, columns)
// SS2.1:
const results = search.create({
    type: search.Type.SALES_ORDER,
    filters: [
        ['status', 'is', 'SalesOrd:B'],
        'AND',
        ['mainline', 'is', 'T']
    ],
    columns: [
        search.createColumn({ name: 'entity' }),
        search.createColumn({ name: 'total', sort: search.Sort.DESC })
    ]
}).run();

results.each((result) => {
    const entity = result.getValue({ name: 'entity' });
    const entityText = result.getText({ name: 'entity' });
    return true; // continue iteration
});

// LOAD SAVED SEARCH
// SS1.0: nlapiLoadSearch(type, id)
// SS2.1:
const savedSearch = search.load({ id: 'customsearch_my_search' });

// SEARCH GLOBAL
// SS1.0: nlapiSearchGlobal(keywords)
// SS2.1:
const globalResults = search.global({ keywords: 'Acme Corp' });
```

### Context and Runtime

```javascript
// GET CONTEXT
// SS1.0: nlapiGetContext()
// SS2.1:
const script = runtime.getCurrentScript();
const user = runtime.getCurrentUser();
const session = runtime.getCurrentSession();

// REMAINING USAGE
// SS1.0: nlapiGetContext().getRemainingUsage()
// SS2.1:
script.getRemainingUsage();

// SCRIPT PARAMETERS
// SS1.0: nlapiGetContext().getSetting('SCRIPT', 'custscript_param')
// SS2.1:
script.getParameter({ name: 'custscript_param' });

// USER INFO
// SS1.0: nlapiGetUser(), nlapiGetRole(), nlapiGetDepartment()
// SS2.1:
user.id;          // was nlapiGetUser()
user.role;        // was nlapiGetRole()
user.department;  // was nlapiGetDepartment()
user.subsidiary;  // was nlapiGetSubsidiary()
user.location;    // was nlapiGetLocation()
user.email;       // was nlapiGetContext().getEmail()
user.name;        // was nlapiGetContext().getName()
```

---

## Step 5: Object Conversion

Convert `nlobj*` object usage to SS2.1 classes.

### Quick Reference

| SS1.0 Object | SS2.1 Class | Module |
|-------------|-------------|--------|
| `nlobjRecord` | `record.Record` / `currentRecord.CurrentRecord` | `N/record` / `N/currentRecord` |
| `nlobjSearch` | `search.Search` | `N/search` |
| `nlobjSearchFilter` | `search.Filter` or filter expression array | `N/search` |
| `nlobjSearchColumn` | `search.Column` | `N/search` |
| `nlobjSearchResult` | `search.Result` | `N/search` |
| `nlobjSearchResultSet` | `search.ResultSet` | `N/search` |
| `nlobjError` | `error.SuiteScriptError` | `N/error` |
| `nlobjFile` | `file.File` | `N/file` |
| `nlobjForm` | `serverWidget.Form` | `N/ui/serverWidget` |
| `nlobjField` | `serverWidget.Field` / `record.Field` | `N/ui/serverWidget` / `N/record` |
| `nlobjSublist` | `serverWidget.Sublist` | `N/ui/serverWidget` |
| `nlobjButton` | `serverWidget.Button` | `N/ui/serverWidget` |
| `nlobjTab` | `serverWidget.Tab` | `N/ui/serverWidget` |
| `nlobjList` | `serverWidget.List` | `N/ui/serverWidget` |
| `nlobjAssistant` | `serverWidget.Assistant` | `N/ui/serverWidget` |
| `nlobjPortlet` | `Portlet` | `N/ui/serverWidget` |
| `nlobjContext` | `runtime.Script` / `runtime.Session` / `runtime.User` | `N/runtime` |
| `nlobjRequest` | `http.ServerRequest` | `N/http` |
| `nlobjResponse` | `http.ServerResponse` / `http.ClientResponse` | `N/http` |
| `nlobjTemplateRenderer` | `render.TemplateRenderer` | `N/render` |
| `nlobjCSVImport` | `task.CsvImportTask` | `N/task` |

### Method-to-Property Conversions

Many SS1.0 getter/setter methods become properties in SS2.1:

```javascript
// SS1.0 — getter/setter methods
form.setTitle('My Form');
var title = form.getTitle();
field.setDisabled(true);
button.setVisible(false);

// SS2.1 — properties
form.title = 'My Form';
const title = form.title;
field.isDisabled = true;
button.isHidden = true;  // Note: inverted from setVisible
```

---

## Step 6: Entry Point Migration

Rewire the script type entry points to the SS2.1 pattern.

### Key Changes

1. **Function names become standardized**: No more custom function names in the script record
2. **All entry points receive a context object**: Not individual parameters
3. **Return object maps entry point names to functions**

See [script-type-changes.md](script-type-changes.md) for complete entry point reference for all script types.

### Script Record Deployment

After converting, update the Script record in NetSuite:
- Change the script file to point to the new SS2.1 file
- Entry point function fields are no longer needed (SS2.1 uses the return object)
- Script parameters remain the same; no changes needed
- Deployment records can be reused

---

## Step 7: Error Handling Conversion

### Pattern Conversion

```javascript
// SS1.0
try {
    var rec = nlapiLoadRecord('salesorder', 99999);
} catch (e) {
    if (e instanceof nlobjError) {
        nlapiLogExecution('ERROR', e.getCode(), e.getDetails());
    } else {
        nlapiLogExecution('ERROR', 'Unexpected', e.toString());
    }
}

// SS2.1
try {
    const rec = record.load({ type: record.Type.SALES_ORDER, id: 99999 });
} catch (e) {
    if (e.type === 'error.SuiteScriptError') {
        log.error({ title: e.name, details: e.message });
    } else {
        log.error({ title: 'Unexpected', details: e.toString() });
    }
}
```

### Property Mapping

| SS1.0 | SS2.1 |
|-------|-------|
| `e instanceof nlobjError` | `e.type === 'error.SuiteScriptError'` or check for `e.name` |
| `e.getCode()` | `e.name` |
| `e.getDetails()` | `e.message` |
| `e.getId()` | `e.id` |
| `e.getStackTrace()` | `e.stack` |
| `nlapiCreateError(code, details, suppress)` | `error.create({ name, message, notifyOff })` |

---

## Step 8: Testing Strategy

### Pre-Deployment Testing

1. **Syntax validation**: Ensure JSDoc tags are correct (`@NApiVersion 2.1`, `@NScriptType`)
2. **Module dependency check**: Verify all required modules are in the `define()` array
3. **Reserved word scan**: Search for `log` and `util` used as variable names
4. **Index audit**: Confirm all sublist operations use 0-based indexing

### Functional Testing

1. **Deploy to Sandbox**: Never test SS2.1 conversions in production first
2. **Test each entry point**: Create, edit, view, delete, copy operations
3. **Sublist operations**: Verify line operations work correctly (especially first/last line)
4. **Error paths**: Trigger error conditions to verify catch blocks
5. **Governance**: Monitor execution log for governance usage
6. **Regression comparison**: Compare the converted SS2.1 script against captured expected behavior, logs, and test data from the original script

### Regression Checklist

- [ ] All entry points fire correctly
- [ ] Field values are set/get correctly
- [ ] Sublist line operations work (add, edit, remove, reorder)
- [ ] Search results match SS1.0 behavior
- [ ] Email sending works
- [ ] URL resolution returns correct URLs
- [ ] Error handling catches and logs correctly
- [ ] Governance usage is within limits
- [ ] Script parameters are read correctly
- [ ] Redirects work after form submission

---

## Step 9: SDF Deployment Considerations

### Script Record XML Changes

When deploying via SDF, the script record XML needs updating:

```xml
<!-- SS1.0 script record -->
<scriptcustomization scriptid="customscript_my_ue">
    <name>My User Event</name>
    <scripttype>USEREVENT</scripttype>
    <scriptfile>[/SuiteScripts/my_ue_ss1.js]</scriptfile>
    <notifyadmins>F</notifyadmins>
    <beforeloadfunction>beforeLoad</beforeloadfunction>
    <beforesubmitfunction>beforeSubmit</beforesubmitfunction>
    <aftersubmitfunction>afterSubmit</aftersubmitfunction>
</scriptcustomization>

<!-- SS2.1 script record — entry point functions not needed -->
<scriptcustomization scriptid="customscript_my_ue">
    <name>My User Event</name>
    <scripttype>USEREVENT</scripttype>
    <scriptfile>[/SuiteScripts/my_ue_ss21.js]</scriptfile>
    <notifyadmins>F</notifyadmins>
    <!-- Entry point function fields can be removed -->
    <!-- SS2.1 reads entry points from the return object -->
</scriptcustomization>
```

### File Cabinet Structure

Recommended structure for migration:

```
/SuiteScripts/
  /ss1/                    # Original SS1.0 scripts (keep as backup)
    my_ue_ss1.js
  /ss2/                    # Converted SS2.1 scripts
    my_ue.js
  /modules/                # Shared custom modules (SS2.1 only)
    my_helper.js
```

### Deployment Checklist

- [ ] Update `scriptfile` path in script record XML
- [ ] Remove entry point function name fields (SS2.1 uses return object)
- [ ] Verify script parameters are compatible
- [ ] Test in Sandbox before deploying to Production
- [ ] Keep SS1.0 files as backup until conversion is validated
- [ ] Update any SuiteApp manifest references

---

## Complete Before/After Example

### SS1.0: User Event Script — End of Month Sales Order Promotions

```javascript
/**
 * User Event Script: End of Month Sales Order Promotions
 * Applies a 10% discount to sales orders created in the last 5 days of the month.
 * Sets a custom memo and sends a notification email to the sales rep.
 *
 * @param {string} type - Operation type
 */
function beforeSubmit(type) {
    if (type !== 'create' && type !== 'edit') return;

    var rec = nlapiGetNewRecord();
    var tranDate = nlapiStringToDate(rec.getFieldValue('trandate'));
    var lastDayOfMonth = nlapiAddMonths(new Date(tranDate.getFullYear(), tranDate.getMonth(), 1), 1);
    lastDayOfMonth = nlapiAddDays(lastDayOfMonth, -1);
    var daysUntilEnd = lastDayOfMonth.getDate() - tranDate.getDate();

    if (daysUntilEnd > 5) return;

    // Apply 10% discount to each line item
    var lineCount = rec.getLineItemCount('item');
    for (var i = 1; i <= lineCount; i++) {                         // 1-based
        var currentRate = parseFloat(rec.getLineItemValue('item', 'rate', i));
        if (currentRate > 0) {
            var discountedRate = (currentRate * 0.90).toFixed(2);
            rec.setLineItemValue('item', 'rate', i, discountedRate);
        }
    }

    // Set promo memo
    rec.setFieldValue('memo', 'End-of-month promo applied (' + daysUntilEnd + ' days left)');

    // Log the action
    nlapiLogExecution('AUDIT', 'Promo Applied',
        'SO ' + rec.getFieldValue('tranid') + ' - ' + lineCount + ' lines discounted');
}

function afterSubmit(type) {
    if (type !== 'create' && type !== 'edit') return;

    var rec = nlapiGetNewRecord();
    var memo = rec.getFieldValue('memo');

    if (memo && memo.indexOf('End-of-month promo') !== -1) {
        var salesRep = rec.getFieldValue('salesrep');
        if (salesRep) {
            try {
                nlapiSendEmail(
                    nlapiGetUser(),                   // author
                    salesRep,                          // recipient
                    'Promo Applied: ' + rec.getFieldValue('tranid'),  // subject
                    'An end-of-month promotion discount was applied to Sales Order '
                        + rec.getFieldValue('tranid') + '.\n\n'
                        + 'Customer: ' + nlapiLookupField('customer', rec.getFieldValue('entity'), 'companyname')
                        + '\nTotal: ' + rec.getFieldValue('total'),
                    null,                              // cc
                    null,                              // bcc
                    { transaction: nlapiGetRecordId() } // records
                );
            } catch (e) {
                if (e instanceof nlobjError) {
                    nlapiLogExecution('ERROR', 'Email failed', e.getCode() + ': ' + e.getDetails());
                } else {
                    nlapiLogExecution('ERROR', 'Email failed', e.toString());
                }
            }
        }
    }
}
```

### SS2.1: Converted Script with Annotations

```javascript
/**
 * @NApiVersion 2.1                                     // [1] JSDoc tags required
 * @NScriptType UserEventScript                         // [2] Declares script type
 * @NModuleScope SameAccount                            // [3] Optional: restricts module scope
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime', 'N/format', 'N/log'],
                                                         // [4] AMD module loading — all nlapi*
                                                         //     calls mapped to specific modules
    (record, search, email, runtime, format, log) => {   // [5] Arrow function (2.1 feature)

    /**
     * Applies end-of-month 10% discount to sales order line items.
     * @param {Object} context - User Event context
     */
    const beforeSubmit = (context) => {
        // [6] context.type replaces string 'type' parameter
        //     Uses UserEventType enum instead of raw strings
        if (context.type !== context.UserEventType.CREATE
            && context.type !== context.UserEventType.EDIT) return;

        // [7] context.newRecord replaces nlapiGetNewRecord()
        const rec = context.newRecord;

        // [8] N/format replaces nlapiStringToDate
        const tranDate = format.parse({
            value: rec.getValue({ fieldId: 'trandate' }),  // [9] getValue({fieldId}) replaces getFieldValue(name)
            type: format.Type.DATE
        });

        // [10] Native JS Date methods replace nlapiAddMonths/nlapiAddDays
        const lastDay = new Date(tranDate.getFullYear(), tranDate.getMonth() + 1, 0);
        const daysUntilEnd = lastDay.getDate() - tranDate.getDate();

        if (daysUntilEnd > 5) return;

        // [11] getLineCount({sublistId}) replaces getLineItemCount(type)
        const lineCount = rec.getLineCount({ sublistId: 'item' });

        // [12] 0-based indexing replaces 1-based
        for (let i = 0; i < lineCount; i++) {              // was: i = 1; i <= lineCount; i++
            // [13] getSublistValue({sublistId, fieldId, line}) replaces
            //      getLineItemValue(type, fldnam, linenum)
            const currentRate = parseFloat(
                rec.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i })
            );

            if (currentRate > 0) {
                const discountedRate = (currentRate * 0.90).toFixed(2);
                // [14] setSublistValue replaces setLineItemValue
                rec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    line: i,                                // 0-based
                    value: discountedRate
                });
            }
        }

        // [15] setValue({fieldId, value}) replaces setFieldValue(name, value)
        rec.setValue({
            fieldId: 'memo',
            value: `End-of-month promo applied (${daysUntilEnd} days left)` // [16] Template literal (2.1)
        });

        // [17] log.audit() replaces nlapiLogExecution('AUDIT', ...)
        //      Options object instead of positional params
        log.audit({
            title: 'Promo Applied',
            details: `SO ${rec.getValue({ fieldId: 'tranid' })} - ${lineCount} lines discounted`
        });
    };

    /**
     * Sends notification email to sales rep after promo is applied.
     * @param {Object} context - User Event context
     */
    const afterSubmit = (context) => {
        if (context.type !== context.UserEventType.CREATE
            && context.type !== context.UserEventType.EDIT) return;

        const rec = context.newRecord;
        const memo = rec.getValue({ fieldId: 'memo' });

        if (memo && memo.includes('End-of-month promo')) {  // [18] includes() (2.1) replaces indexOf !== -1
            const salesRep = rec.getValue({ fieldId: 'salesrep' });

            if (salesRep) {
                try {
                    // [19] search.lookupFields replaces nlapiLookupField
                    const custFields = search.lookupFields({
                        type: search.Type.CUSTOMER,
                        id: rec.getValue({ fieldId: 'entity' }),
                        columns: ['companyname']
                    });

                    // [20] email.send({options}) replaces nlapiSendEmail(author, recip, subj, ...)
                    email.send({
                        author: runtime.getCurrentUser().id,       // [21] runtime replaces nlapiGetUser()
                        recipients: salesRep,
                        subject: `Promo Applied: ${rec.getValue({ fieldId: 'tranid' })}`,
                        body: `An end-of-month promotion discount was applied to Sales Order `
                            + `${rec.getValue({ fieldId: 'tranid' })}.\n\n`
                            + `Customer: ${custFields.companyname}\n`
                            + `Total: ${rec.getValue({ fieldId: 'total' })}`,
                        relatedRecords: {                          // [22] 'records' param renamed
                            transactionId: rec.id                  // [23] rec.id replaces nlapiGetRecordId()
                        }
                    });
                } catch (e) {
                    // [24] Error property access replaces getter methods
                    if (e.name) {
                        log.error({
                            title: 'Email failed',
                            details: `${e.name}: ${e.message}`    // [25] .name/.message replaces
                        });                                        //      getCode()/getDetails()
                    } else {
                        log.error({
                            title: 'Email failed',
                            details: e.toString()
                        });
                    }
                }
            }
        }
    };

    // [26] Return object maps entry point names to functions
    //      No need to specify function names in Script record
    return { beforeSubmit, afterSubmit };
});
```

### Conversion Annotation Key

| # | Change Category | SS1.0 | SS2.1 |
|---|----------------|-------|-------|
| 1-2 | JSDoc tags | None required | `@NApiVersion 2.1`, `@NScriptType` |
| 4-5 | Module loading | Global `nlapi*` | AMD `define()` with explicit modules |
| 6 | Event type | String `'create'` | `context.UserEventType.CREATE` enum |
| 7 | Record access | `nlapiGetNewRecord()` | `context.newRecord` |
| 8 | Date parsing | `nlapiStringToDate()` | `format.parse()` |
| 9,15 | Field access | `getFieldValue(name)` | `getValue({ fieldId })` |
| 10 | Date math | `nlapiAddMonths/Days()` | Native JS `Date` methods |
| 11 | Line count | `getLineItemCount(type)` | `getLineCount({ sublistId })` |
| 12 | Line indexing | 1-based | 0-based |
| 13-14 | Sublist access | `getLineItemValue(type, fld, line)` | `getSublistValue({ sublistId, fieldId, line })` |
| 16,18 | JS features | ES3 (var, indexOf) | ES6+ (template literals, includes) |
| 17 | Logging | `nlapiLogExecution(type, ...)` | `log.audit({ title, details })` |
| 19 | Lookup | `nlapiLookupField()` | `search.lookupFields()` |
| 20 | Email | `nlapiSendEmail(author, recip, ...)` | `email.send({ options })` |
| 21 | Current user | `nlapiGetUser()` | `runtime.getCurrentUser().id` |
| 23 | Record ID | `nlapiGetRecordId()` | `rec.id` |
| 24-25 | Errors | `e.getCode()` / `e.getDetails()` | `e.name` / `e.message` |
| 26 | Entry points | Function names in Script record | Return object in define() |
