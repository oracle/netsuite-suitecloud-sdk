# Principle 4: Understand Your SuiteApp May Be One of Many in an Account

> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

Your SuiteApp will likely coexist with other SuiteApps and customizations in a customer's NetSuite account. User event scripts, client scripts, and other customizations from multiple vendors may all operate on the same records. Understanding this multi-SuiteApp environment is critical for building robust, well-behaved SuiteApps.

## Key Concepts

### 4.1 Order of Script Execution

Multiple user event scripts can be deployed on the same record type and events. When customers install multiple SuiteApps, scripts from different vendors may execute on the same records.

#### Key Considerations

1. **Data concurrency problems** - Multiple scripts updating the same fields without awareness of each other.
2. **Execution order dependency** - Your script may not execute in the expected order.
3. **Performance impact** - Multiple beforeLoad scripts slow down record loading.

```javascript
/**
 * Design scripts to be order-agnostic when possible.
 * Document fields your scripts modify.
 */
define(['N/runtime', 'N/record'], (runtime, record) => {

    const beforeSubmit = (context) => {
        // Check if another script already processed this.
        const alreadyProcessed = context.newRecord.getValue({
            fieldId: 'custbody_myapp_processed'
        });

        if (alreadyProcessed) {
            return; // Skip if already handled.
        }

        // Perform your logic.
        context.newRecord.setValue({
            fieldId: 'custbody_myapp_processed',
            value: true
        });
    };

    return { beforeSubmit };
});
```

#### Changing Script Execution Order

Administrators can reorder script execution:
**Setup > Customization > Scripted Record** > Edit the record > Drag and drop to arrange order.

### 4.2 SuiteApps Must Be SuiteTalk-Aware

Your user event scripts may be triggered by web services requests, not just UI actions.

#### Performance Implications

- **beforeLoad** — No UI to render, executing is wasteful.
- **beforeSubmit** — Validations may not apply to web services.
- **afterSubmit** — Page redirects are meaningless for web services.

#### Determining Script Execution Context

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime', 'N/log'], (runtime, log) => {

    const beforeLoad = (context) => {
        // Only execute for UI context.
        if (runtime.executionContext !== runtime.ContextType.USER_INTERFACE) {
            return;
        }

        // Also check event type.
        if (context.type === context.UserEventType.VIEW ||
            context.type === context.UserEventType.EDIT) {
            // Add UI elements only when needed.
            const form = context.form;
            form.addButton({
                id: 'custpage_mybutton',
                label: 'My Action',
                functionName: 'myClientFunction'
            });
        }
    };

    const beforeSubmit = (context) => {
        // Log context for debugging.
        log.debug({
            title: 'Execution Context',
            details: runtime.executionContext
        });

        // Different logic for different contexts.
        switch (runtime.executionContext) {
            case runtime.ContextType.USER_INTERFACE:
                // UI-specific validations.
                break;
            case runtime.ContextType.WEBSERVICES:
                // Web services specific handling.
                break;
            case runtime.ContextType.CSV_IMPORT:
                // Skip heavy processing for CSV imports.
                return;
        }
    };

    return { beforeLoad, beforeSubmit };
});
```

#### Common Execution Contexts

| Context | Description |
|---------|-------------|
| `USER_INTERFACE` | Browser UI actions |
| `WEBSERVICES` | SuiteTalk SOAP/REST calls |
| `CSVIMPORT` | CSV import operations |
| `SCHEDULED` | Scheduled script execution |
| `SUITELET` | Suitelet execution |
| `USEREVENT` | Triggered by another user event |
| `WEBSTORE` | eCommerce/web store orders |
| `RESTLET` | RESTlet execution |
| `MAPREDUCE` | Map/Reduce script execution |

#### Disabling Scripts for Web Services

Administrators can disable all server-side scripts for web services:
**Setup > Integrations > Manage Integrations > Web Services Preferences**
- Check "Disable Server SuiteScript and Workflow Triggers".

### 4.3 SuiteApps Must Be eCommerce-Aware

User event scripts on transaction records (especially Sales Orders) can be triggered by web store checkouts.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime'], (runtime) => {

    const beforeLoad = (context) => {
        // Only add UI elements for browser interface.
        if (runtime.executionContext === runtime.ContextType.USER_INTERFACE &&
            (context.type === 'edit' || context.type === 'view')) {
            // Add tabs, fields, buttons for UI.
        }
    };

    const beforeSubmit = (context) => {
        if (context.type === context.UserEventType.CREATE) {
            if (runtime.executionContext === runtime.ContextType.USER_INTERFACE) {
                // UI-specific validation and calculations.
                validateUIOrder(context.newRecord);
            }
            else if (runtime.executionContext === runtime.ContextType.WEBSTORE) {
                // Web store specific processing (for example, fraud detection).
                processWebStoreOrder(context.newRecord);
            }
        }
    };

    const validateUIOrder = (record) => {
        // Validation for orders entered through UI.
    };

    const processWebStoreOrder = (record) => {
        // Special handling for web store orders.
        // For example, fraud detection, promotional discounts.
    };

    return { beforeLoad, beforeSubmit };
});
```

### 4.4 Namespace Conflicts Between JavaScript Libraries

SuiteScripts using open-source libraries (jQuery, ExtJS) may conflict with NetSuite's internal libraries.

#### Problem Scenario

- Your script uses jQuery 1.7.
- NetSuite uses jQuery 1.11 internally.
- Your script calls methods that behave differently between versions.
- Works in testing, breaks after NetSuite upgrades their library.

#### Solution: Use noConflict()

```javascript
/**
 * Isolate your jQuery version to avoid conflicts.
 */

// In your HTML/Suitelet
<script src="js/jquery-1.7.1.min.js"></script>
<script type="text/javascript">
    // Save reference to your jQuery version
    const myJQuery = $.noConflict(true);
</script>
<script src="js/jquery-1.11.1.min.js"></script>
<script type="text/javascript">
    // Now $ and jQuery refer to 1.11.1
    // Use myJQuery for 1.7.1 specific code
    myJQuery('h1').css('color', 'red');
</script>
```

#### Best Practice

Every library has its own isolation mechanism. Always:
1. Check the library's documentation for namespace isolation.
2. Use unique namespace prefixes for your code.
3. Test with various NetSuite releases.

### 4.5 Considerations Without SuiteCloud Plus

Most accounts have only 2 scheduled script processors. Design defensively.

#### Script Deployment Considerations

- When a scheduled script is invoked, its **deployment record** enters the processor pool.
- A script can have multiple deployment records.
- Once a deployment is executing, re-invoking it fails.
- Different deployments of the same script can run concurrently.

```javascript
/**
 * Check if a scheduled script deployment can be invoked.
 */
define(['N/task', 'N/search', 'N/log'], (task, search, log) => {

    const invokeScheduledScript = (scriptId, deploymentId) => {
        try {
            const scriptTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                scriptId: scriptId,
                deploymentId: deploymentId
            });

            const taskId = scriptTask.submit();

            if (taskId) {
                log.audit('Script Invoked', `Task ID: ${taskId}`);
                return true;
            }
        } catch (e) {
            // Deployment already in queue or executing.
            log.error('Invocation Failed', e.message);
        }

        return false;
    };

    // Try multiple deployments.
    const tryMultipleDeployments = (scriptId, deployments) => {
        for (const deploymentId of deployments) {
            if (invokeScheduledScript(scriptId, deploymentId)) {
                return true;
            }
        }
        return false; // All deployments busy
    };

    return { invokeScheduledScript, tryMultipleDeployments };
});
```

### 4.6 Design Considerations for Using externalId

The `externalId` field stores external system primary keys for synchronization.

#### When to Use externalId

- **Good**: HRMS integration (single source of employee data)
- **Risky**: Lead/Customer records (multiple sources: CRM, marketing, etc.)

#### Avoiding Conflicts

```javascript
// Add namespace prefix for uniqueness.
const externalId = `MYCOMPANY_${externalSystemId}`;
```

#### Using externalId for Data Safety

When importing critical data (sales orders), set externalId to prevent duplicates on retry:

```javascript
/**
 * Scenario: Web service call times out, but order was created.
 * Retry would create duplicate without externalId protection.
 */

// External order ID from shopping cart
const orderExternalId = `SHOPIFY_${shopifyOrderId}`;

// Set on the sales order
salesOrder.externalId = orderExternalId;

// On retry, NetSuite rejects duplicate externalId.
// Preventing duplicate orders.
```

#### Using upsert Operations

```javascript
// upsert requires externalId and handles create/update automatically.
const upsertResult = nlapiUpsertRecord(salesOrder);
```

### 4.7 SuiteApp Designs and Concurrency Issues

#### Resource Starvation

NetSuite's governance model generally prevents resource starvation. If a scheduled script appears "stuck," contact NetSuite support.

#### Race Conditions

Race conditions occur when multiple processes modify the same record simultaneously:

```
1. Custom record has value = 1
2. Script A loads record, reads 1
3. Script B loads record, reads 1
4. Script A increments to 2, saves
5. Script B increments to 2, saves (overwrites A's change!)
Result: Value is 2 instead of expected 3
```

#### Optimistic Locking for Custom Records

Enable optimistic locking on custom record types to prevent race conditions:

```javascript
/**
 * With optimistic locking enabled:
 * - First save succeeds
 * - Second save throws CUSTOM_RECORD_COLLISION error
 */

const updateWithRetry = (recordType, recordId, fieldUpdates, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const rec = record.load({
                type: recordType,
                id: recordId
            });

            for (const [field, value] of Object.entries(fieldUpdates)) {
                rec.setValue({ fieldId: field, value: value });
            }

            return rec.save();

        } catch (e) {
            if (e.name === 'CUSTOM_RECORD_COLLISION' && attempt < maxRetries) {
                log.audit('Retry', `Attempt ${attempt} failed, retrying...`);
                continue;
            }
            throw e;
        }
    }
};
```

**Important**: Optimistic locking does NOT work with:
- `record.submitFields()` (doesn't load record into memory).
- Inline editable sublists.

#### Virtual Semaphores Using externalId

Create a lock mechanism using a custom record's externalId uniqueness:

```javascript
/**
 * Virtual semaphore pattern using externalId
 */

const acquireLock = (lockName) => {
    try {
        const lockRecord = record.create({
            type: 'customrecord_semaphore'
        });
        lockRecord.setValue({ fieldId: 'name', value: lockName });
        lockRecord.setValue({ fieldId: 'externalid', value: lockName });
        lockRecord.setValue({ fieldId: 'custrecord_lock_time', value: new Date() });
        lockRecord.save();
        return true; // Lock acquired
    } catch (e) {
        if (e.name === 'DUP_EXTID') {
            return false; // Lock already held.
        }
        throw e;
    }
};

const releaseLock = (lockName) => {
    // Search for lock record and delete it.
    const lockSearch = search.create({
        type: 'customrecord_semaphore',
        filters: [['externalid', 'is', lockName]]
    });

    lockSearch.run().each((result) => {
        record.delete({
            type: 'customrecord_semaphore',
            id: result.id
        });
        return false;
    });
};

// Usage
if (acquireLock('PROCESS_ORDERS')) {
    try {
        // Critical section — only one process at a time.
        processOrders();
    } finally {
        releaseLock('PROCESS_ORDERS');
    }
} else {
    log.audit('Skipped', 'Another process is running');
}
```

### Deployment Timing and System Contention

SDF deployments acquire platform-level locks on records and custom objects. If another operation is running concurrently (saved search rebuilds, mass custom field updates, other SDF deployments, etc.), the deployment may fail with:

> *This operation cannot be completed at this time due to system contention caused by operations on other objects. These objects may include search, custom fields, etc. Please try again during off-peak hours.*

This is a **transient infrastructure error**, not a code defect. No code changes will fix it.

**Best practices:**
- Schedule SDF deployments during off-peak hours (early morning, evenings, weekends relative to the account's primary timezone).
- Avoid deploying while saved searches are being rebuilt or mass updates are running.
- If contention occurs, wait 5-15 minutes and retry — do not modify code.
- For accounts with heavy concurrent usage, coordinate deployment windows with the NetSuite admin team.
- Consider deploying in smaller batches (fewer objects per deployment) to reduce lock contention.

### 4.7 User Event Script Consolidation

NetSuite allows multiple User Event Scripts deployed to the same record type and event, but this creates risks — no guaranteed execution order, harder debugging, and potential field-value conflicts.

**Best practice: Consolidate to one UE script per record type per event within your SuiteApp** using a dispatcher pattern.

#### Why Consolidate

| Problem | Impact |
|---------|--------|
| No guaranteed execution order | Script A may depend on Script B's output, but B may run second |
| Multiple `beforeLoad` scripts | Each adds latency to every record page load |
| Field value conflicts | Two scripts writing the same field produce unpredictable results |
| Debugging complexity | Must correlate logs across multiple script execution logs |

#### Dispatcher Pattern

```javascript
/**
 * ue_sales_order_dispatcher.js
 * Single UE dispatcher for all Sales Order logic — calls modular functions.
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    './modules/so_validation',
    './modules/so_fulfillment',
    './modules/so_audit'
], (soValidation, soFulfillment, soAudit) => {

    const beforeLoad = (context) => {
        soAudit.beforeLoad(context);
        soFulfillment.beforeLoad(context);
    };

    const beforeSubmit = (context) => {
        soValidation.beforeSubmit(context);
        soAudit.beforeSubmit(context);
    };

    const afterSubmit = (context) => {
        soFulfillment.afterSubmit(context);
        soAudit.afterSubmit(context);
    };

    return { beforeLoad, beforeSubmit, afterSubmit };
});
```

Each module (`so_validation.js`, `so_fulfillment.js`, `so_audit.js`) exports its event handler functions independently and can be unit-tested without NetSuite. The dispatcher wires them together in a predictable, documented order.

#### When Multiple UE Scripts Are Unavoidable

If your SuiteApp must coexist alongside UE scripts from other vendors or account customizations:

```javascript
/**
 * Guard patterns for coexisting with external UE scripts.
 */
define(['N/runtime', 'N/log'], (runtime, log) => {

    const beforeSubmit = (context) => {
        // 1. Always check context type; don't run blindly in all contexts.
        if (context.type === context.UserEventType.DELETE) {
            return; // Skip delete events if not relevant
        }

        // 2. Check execution context; skip web services if not needed.
        if (runtime.executionContext === runtime.ContextType.WEBSERVICES) {
            log.debug('UE Skip', 'Skipping web services context');
            return;
        }

        // 3. Check flag fields to avoid double-processing.
        const alreadyProcessed = context.newRecord.getValue({
            fieldId: 'custbody_myapp_ue_processed'
        });
        if (alreadyProcessed) {
            log.debug('UE Skip', 'Already processed by this script');
            return;
        }

        // 4. Read-before-write; don't blindly overwrite another script's value.
        const existingStatus = context.newRecord.getValue({
            fieldId: 'custbody_approval_status'
        });
        if (!existingStatus) {
            context.newRecord.setValue({
                fieldId: 'custbody_approval_status',
                value: 'PENDING'
            });
        }

        // 5. Set processed flag so other deployments of this script don't re-run.
        context.newRecord.setValue({
            fieldId: 'custbody_myapp_ue_processed',
            value: true
        });
    };

    return { beforeSubmit };
});
```

#### Viewing and Reordering UE Scripts

Administrators can inspect and reorder all UE scripts on a record type:
**Setup > Customization > Scripted Record** → select the record type → drag-and-drop to reorder.

**Note:** This is a best practice recommendation — NetSuite does permit multiple UE scripts on the same record. The dispatcher pattern is the recommended approach within a single SuiteApp. When scripts from multiple SuiteApps are present, use defensive coding (read-before-write, flag fields, context checks) rather than relying on order.

## Best Practices

1. **Check execution context** — Always determine where your script is being triggered from.
2. **Document field modifications** — List which fields your scripts update.
3. **Design for order independence** — Scripts should work regardless of execution order.
4. **Use optimistic locking** — Enable for custom records prone to concurrent access.
5. **Namespace your libraries** — Avoid conflicts with NetSuite's internal libraries.
6. **Use externalId wisely** — Add prefixes to avoid conflicts with other integrations.
7. **Handle concurrency** — Implement retry logic for collision errors.
8. **Consolidate UE scripts** — Use one UE dispatcher per record type per event within your SuiteApp.

## Common Pitfalls

1. **Assuming UI-only execution** — Scripts can be triggered by web services, CSV imports, etc.
2. **Heavy beforeLoad logic** — Slows down record loading for all users.
3. **Library version conflicts** — Using same libraries as NetSuite without isolation.
4. **Ignoring race conditions** — Not using optimistic locking on custom records.
5. **Single deployment** — Not creating multiple deployments for frequently invoked scripts.
6. **Multiple UE scripts without dispatcher** — Unpredictable execution order and field conflicts.

## Further Reading

Search in NetSuite Help Center or SuiteAnswers:
- runtime.executionContext
- Scripted Records
- Optimistic Locking
- SuiteCloud Plus
- Web Services Preferences
- Custom Record Collision
