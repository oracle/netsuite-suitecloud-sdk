# Principle 2: Manage SuiteScript Usage Unit Consumption

> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

Server-side SuiteScript executes on NetSuite servers and consumes resources that affect all account users. NetSuite uses a governance model to ensure fair resource allocation across all customers. Understanding and managing usage unit consumption is critical for building efficient SuiteApps.

## Key Concepts

### 2.1 Governance Model

NetSuite tracks server-side resource consumption using **usage units**. Each API operation consumes a specific number of units, and scripts have governance limits that vary by script type.

#### Script Type Governance Limits

| Script Type | Usage Unit Limit | Notes |
|-------------|------------------|-------|
| Client Script | N/A | Runs in browser, no server governance |
| User Event Script | 1,000 units | Per event (beforeLoad, beforeSubmit, afterSubmit) |
| Suitelet | 1,000 units | Per execution |
| RESTlet | 5,000 units | Per request |
| Scheduled Script | 10,000 units | Per execution (can yield and resume) |
| Map/Reduce Script | 10,000 units | Per phase (getInputData, map, reduce, summarize) |
| Workflow Action Script | 1,000 units | Per execution |
| Mass Update Script | 1,000 units | Per record |
| Portlet Script | 1,000 units | Per render |

### 2.2 High-Cost API Operations

Some operations consume significantly more units than others:

| Operation | Usage Units |
|-----------|-------------|
| `record.load()` | 10 |
| `record.save()` | 20 |
| `record.create()` | 10 |
| `search.create().run()` | 10 |
| `search.lookupFields()` | 1 |
| `email.send()` | 10 |
| `https.request()` | 10 |
| `render.xmlToPdf()` | 10 |

### 2.3 User Event Script Considerations

User Event Scripts fire on record operations and can significantly impact performance:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search'], (record, search) => {

    const beforeLoad = (context) => {
        // Runs when record is loaded for viewing/editing.
        // Avoid heavy operations here, this affects UI responsiveness.
        if (context.type === context.UserEventType.VIEW) {
            // Lightweight operations only
        }
    };

    const beforeSubmit = (context) => {
        // Runs before record is saved to database.
        // Good for validation and field manipulation.
        // Changes here are included in the same transaction.
    };

    const afterSubmit = (context) => {
        // Runs after record is committed to database.
        // Good for creating related records, notifications.
        // Runs in separate transaction.
    };

    return { beforeLoad, beforeSubmit, afterSubmit };
});
```

#### Best Practices for User Event Scripts

1. **Check execution context** - Don't run on CSV imports if not needed.
2. **Check user event type** - Only run on CREATE, EDIT, or DELETE as appropriate.
3. **Avoid loading the current record** - Use `context.newRecord` instead.
4. **Minimize beforeLoad operations** - They affect page load time.

```javascript
const beforeSubmit = (context) => {
    // Check if we need to run.
    if (context.type !== context.UserEventType.CREATE &&
        context.type !== context.UserEventType.EDIT) {
        return;
    }

    // Check execution context.
    const execContext = runtime.executionContext;
    if (execContext === runtime.ContextType.CSV_IMPORT) {
        return; // Skip for CSV imports.
    }

    // Use context.newRecord instead of loading.
    const currentRecord = context.newRecord;
    const customerId = currentRecord.getValue({ fieldId: 'entity' });
};
```

### 2.4 Scheduled Scripts vs Map/Reduce Scripts

#### When to Use Scheduled Scripts

- Simple sequential processing
- Single-threaded operations
- Processing that needs precise control over execution order
- Legacy script migration

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/record', 'N/runtime'], (search, record, runtime) => {

    const execute = (context) => {
        const script = runtime.getCurrentScript();

        const searchResults = search.create({
            type: search.Type.SALES_ORDER,
            filters: [['status', 'is', 'pendingApproval']],
            columns: ['internalid']
        }).run();

        searchResults.each((result) => {
            // Check remaining governance
            if (script.getRemainingUsage() < 500) {
                // Reschedule and exit
                return false;
            }

            // Process record
            record.submitFields({
                type: record.Type.SALES_ORDER,
                id: result.id,
                values: { orderstatus: 'B' } // Pending Fulfillment
            });

            return true; // Continue iteration
        });
    };

    return { execute };
});
```

#### When to Use Map/Reduce Scripts

- Processing large datasets (1000+ records)
- Operations that can be parallelized
- Complex transformations with multiple stages
- Built-in error handling and restart capability

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

    const getInputData = (context) => {
        // Returns data to be processed.
        // Can return: Array, Search, Object, or File reference.
        return search.create({
            type: search.Type.SALES_ORDER,
            filters: [['status', 'is', 'pendingApproval']],
            columns: ['internalid', 'entity', 'total']
        });
    };

    const map = (context) => {
        // Process each input item.
        // Can write key-value pairs to reduce stage.
        const searchResult = JSON.parse(context.value);

        context.write({
            key: searchResult.values.entity.value,
            value: searchResult.values.total
        });
    };

    const reduce = (context) => {
        // Process grouped data from map stage.
        const customerId = context.key;
        const totals = context.values;

        const sum = totals.reduce((acc, val) => acc + parseFloat(val), 0);

        // Update customer record with total.
        record.submitFields({
            type: record.Type.CUSTOMER,
            id: customerId,
            values: { custentity_total_pending: sum }
        });
    };

    const summarize = (context) => {
        // Handle errors and log results.
        context.mapSummary.errors.iterator().each((key, error) => {
            log.error({ title: 'Map Error: ' + key, details: error });
            return true;
        });

        log.audit({
            title: 'Processing Complete',
            details: `Processed ${context.inputSummary.totalSize} records`
        });
    };

    return { getInputData, map, reduce, summarize };
});
```

### 2.5 Parent-Child Record Pattern for Mass Operations

When updating many child records, load the parent once and iterate through sublists:

```javascript
/**
 * Efficient pattern for updating child records.
 */
const updateOrderLines = (orderId, lineUpdates) => {
    const salesOrder = record.load({
        type: record.Type.SALES_ORDER,
        id: orderId,
        isDynamic: true
    });

    const lineCount = salesOrder.getLineCount({ sublistId: 'item' });

    for (let i = 0; i < lineCount; i++) {
        const lineId = salesOrder.getSublistValue({
            sublistId: 'item',
            fieldId: 'line',
            line: i
        });

        if (lineUpdates[lineId]) {
            salesOrder.selectLine({ sublistId: 'item', line: i });
            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_status',
                value: lineUpdates[lineId].status
            });
            salesOrder.commitLine({ sublistId: 'item' });
        }
    }

    salesOrder.save(); // Single save for all line updates.
};
```

### 2.6 Transient Record Controller Pattern

For complex operations across multiple records, use a custom record to coordinate:

```javascript
/**
 * Transient Record Controller Pattern
 * Use a custom record to track batch processing state.
 */

// Custom Record: customrecord_batch_controller
// Fields: custrecord_batch_status, custrecord_batch_progress,
//         custrecord_batch_total, custrecord_batch_errors

const processBatch = (controllerId) => {
    const controller = record.load({
        type: 'customrecord_batch_controller',
        id: controllerId
    });

    const status = controller.getValue({ fieldId: 'custrecord_batch_status' });
    const progress = controller.getValue({ fieldId: 'custrecord_batch_progress' });

    if (status === 'PROCESSING') {
        // Continue from where we left off.
        const items = getItemsToProcess(progress);

        items.forEach((item, index) => {
            processItem(item);

            // Update progress periodically.
            if (index % 100 === 0) {
                record.submitFields({
                    type: 'customrecord_batch_controller',
                    id: controllerId,
                    values: { custrecord_batch_progress: progress + index }
                });
            }
        });

        // Mark complete.
        record.submitFields({
            type: 'customrecord_batch_controller',
            id: controllerId,
            values: { custrecord_batch_status: 'COMPLETE' }
        });
    }
};
```

## Best Practices

### Governance Management

1. **Monitor usage** - Use `runtime.getCurrentScript().getRemainingUsage()` frequently.
2. **Set thresholds** - Stop processing before hitting limits.
3. **Use yielding** - Scheduled scripts can yield and reschedule.
4. **Batch operations** - Group similar operations together.

### Efficient API Usage

1. **Use `submitFields()`** instead of `load()` + `save()` when possible.
2. **Use `lookupFields()`** instead of `load()` for read-only access.
3. **Cache frequently accessed data** using N/cache module.
4. **Minimize search columns** - Only request fields you need.

```javascript
// Inefficient: 30 units (load + save)
const rec = record.load({ type: record.Type.CUSTOMER, id: custId });
rec.setValue({ fieldId: 'comments', value: 'Updated' });
rec.save();

// Efficient: 4 units
record.submitFields({
    type: record.Type.CUSTOMER,
    id: custId,
    values: { comments: 'Updated' }
});

// Read-only: 1 unit
const values = search.lookupFields({
    type: search.Type.CUSTOMER,
    id: custId,
    columns: ['companyname', 'email']
});
```

## Common Pitfalls

1. **Loading records in loops** — Use searches or bulk operations instead.
2. **Ignoring context checks** — Always check execution context and event type.
3. **Not checking remaining governance** — Scripts can fail mid-execution.
4. **Using afterSubmit for validation** — Use beforeSubmit for validation logic.
5. **Heavy beforeLoad operations** — Impacts user experience significantly.
6. **Not using Map/Reduce for large datasets** — Scheduled scripts are limited.

## Further Reading

Search in NetSuite Help Center or SuiteAnswers:
- SuiteScript 2.x API Governance
- Map/Reduce Script Type
- User Event Script Type
- Scheduled Script Type
- Script Governance Monitoring
