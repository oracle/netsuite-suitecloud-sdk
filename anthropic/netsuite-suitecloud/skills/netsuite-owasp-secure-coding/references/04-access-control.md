Copyright (c) 2026 Oracle and/or its affiliates.
Licensed under the Universal Permissive License v1.0 as shown at
[The Universal Permissive License (UPL), Version 1.0](https://oss.oracle.com/licenses/upl).

# Access Control (A01:2021)
> Author: Oracle NetSuite

## Overview

Access control enforces policy such that users cannot act outside of their intended
permissions. Failures typically lead to unauthorized information disclosure, modification,
or destruction of data, or performing a business function outside the user's intended limits.
Access control is the **#1 risk** in the OWASP Top 10 (2021).

In NetSuite, access control involves role-based permissions, script execution contexts,
record-level security, and deployment configurations.

**OWASP Reference:** [A01:2021 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/).

---

## 1. Role-Based Access Control (RBAC) in NetSuite

NetSuite's RBAC system assigns permissions through roles. Scripts must validate
the executing user's role before performing sensitive operations.

### Example 1: Missing Role Check

```javascript
// ===== BAD: No role verification; any authenticated user can execute =====
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record'], (record) => {
    const onRequest = (context) => {
        const employeeId = context.request.parameters.empId;

        // VULNERABLE: Any user with access to this Suitelet URL can view
        // any employee's salary; no role check performed
        const emp = record.load({ type: record.Type.EMPLOYEE, id: employeeId });
        const salary = emp.getValue({ fieldId: 'custrecord_salary' });

        context.response.write(JSON.stringify({ salary }));
    };

    return { onRequest };
});
```

```javascript
// ===== GOOD: Verify role before granting access =====
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/runtime', 'N/log'], (record, runtime, log) => {

    // Roles authorized to view salary data
    const AUTHORIZED_ROLES = [
        3,  // Administrator
        17, // HR Manager (custom)
        22  // Payroll Manager (custom)
    ];

    const onRequest = (context) => {
        const currentUser = runtime.getCurrentUser();

        // Check if the user's role is authorized
        if (!AUTHORIZED_ROLES.includes(currentUser.role)) {
            log.audit('Access Denied', {
                user: currentUser.id,
                role: currentUser.role,
                action: 'view_salary',
                ip: context.request.clientIpAddress
            });

            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json; charset=utf-8'
            });
            context.response.write(JSON.stringify({
                error: 'You do not have permission to access this resource.'
            }));
            return;
        }

        const employeeId = context.request.parameters.empId;
        const emp = record.load({ type: record.Type.EMPLOYEE, id: employeeId });
        const salary = emp.getValue({ fieldId: 'custrecord_salary' });

        log.audit('Salary Viewed', {
            user: currentUser.id,
            employee: employeeId
        });

        context.response.write(JSON.stringify({ salary }));
    };

    return { onRequest };
});
```

---

## 2. Insecure Direct Object References (IDOR)

IDOR occurs when an application exposes internal object references (like database IDs)
and does not verify that the requesting user is authorized to access that specific object.

### Example 2: IDOR in a RESTlet

```javascript
// ===== BAD: No ownership verification; any user can access any order =====
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record'], (record) => {
    const get = (requestParams) => {
        const orderId = requestParams.orderId;

        // VULNERABLE: User A can view User B's order by changing the orderId parameter
        // No check that the requesting user owns or is authorized for this order
        const order = record.load({ type: record.Type.SALES_ORDER, id: orderId });

        return {
            id: order.id,
            total: order.getValue({ fieldId: 'total' }),
            items: order.getLineCount({ sublistId: 'item' })
        };
    };

    return { get };
});
```

```javascript
// ===== GOOD: Verify the requesting user is authorized for the specific record =====
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/runtime', 'N/log'], (record, runtime, log) => {

    // Roles that can view any order (for example, admin, sales manager)
    const GLOBAL_ACCESS_ROLES = [3, 15];

    const get = (requestParams) => {
        const orderId = requestParams.orderId;
        const currentUser = runtime.getCurrentUser();

        // Validate the orderId is a number to prevent manipulation
        if (!orderId || isNaN(Number(orderId))) {
            return { error: 'Invalid order ID.' };
        }

        let order;
        try {
            order = record.load({ type: record.Type.SALES_ORDER, id: orderId });
        } catch (e) {
            log.error('Record Load Failed', e.message);
            return { error: 'Order not found.' };
        }

        const orderEntity = order.getValue({ fieldId: 'entity' });

        // IDOR prevention: verify the current user owns this order
        // OR has a global access role
        if (String(orderEntity) !== String(currentUser.id)
            && !GLOBAL_ACCESS_ROLES.includes(currentUser.role)) {

            log.audit('IDOR Attempt', {
                user: currentUser.id,
                role: currentUser.role,
                orderId: orderId,
                orderOwner: orderEntity
            });

            return { error: 'You do not have permission to view this order.' };
        }

        return {
            id: order.id,
            total: order.getValue({ fieldId: 'total' }),
            items: order.getLineCount({ sublistId: 'item' })
        };
    };

    return { get };
});
```

---

## 3. Function-Level Access Control

Every server-side function (especially in Suitelets and RESTlets) that performs a
sensitive action needs its own access check. Do not rely solely on URL obscurity.

### Example 3: Missing Function-Level Checks

```javascript
// ===== BAD: Admin actions without role verification =====
define(['N/record', 'N/runtime'], (record, runtime) => {
    const onRequest = (context) => {
        const action = context.request.parameters.action;

        // VULNERABLE: Anyone who discovers the URL can perform admin actions
        if (action === 'delete_customer') {
            const custId = context.request.parameters.custId;
            record.delete({ type: record.Type.CUSTOMER, id: custId });
            context.response.write('Customer deleted.');
        }

        if (action === 'update_price') {
            const itemId = context.request.parameters.itemId;
            const newPrice = context.request.parameters.price;
            record.submitFields({
                type: record.Type.INVENTORY_ITEM,
                id: itemId,
                values: { rate: newPrice }
            });
            context.response.write('Price updated.');
        }
    };

    return { onRequest };
});
```

```javascript
// ===== GOOD: Per-action authorization checks =====
define(['N/record', 'N/runtime', 'N/log'], (record, runtime, log) => {

    // Define which roles can perform which actions
    const ACTION_PERMISSIONS = {
        delete_customer: [3],           // Administrator only
        update_price:    [3, 15, 20],   // Admin, Sales Manager, Pricing Manager
        view_report:     [3, 15, 20, 25] // Above + Analyst
    };

    const isAuthorized = (action, roleId) => {
        const allowedRoles = ACTION_PERMISSIONS[action];
        if (!allowedRoles) return false;
        return allowedRoles.includes(roleId);
    };

    const onRequest = (context) => {
        const action = context.request.parameters.action;
        const currentUser = runtime.getCurrentUser();

        // Validate action exists
        if (!ACTION_PERMISSIONS[action]) {
            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json; charset=utf-8'
            });
            context.response.write(JSON.stringify({ error: 'Unknown action.' }));
            return;
        }

        // Check authorization for the specific action
        if (!isAuthorized(action, currentUser.role)) {
            log.audit('Unauthorized Action', {
                user: currentUser.id,
                role: currentUser.role,
                action: action
            });

            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json; charset=utf-8'
            });
            context.response.write(JSON.stringify({
                error: 'You are not authorized to perform this action.'
            }));
            return;
        }

        if (action === 'delete_customer') {
            const custId = context.request.parameters.custId;
            record.delete({ type: record.Type.CUSTOMER, id: custId });
            log.audit('Customer Deleted', { by: currentUser.id, custId });
            context.response.write(JSON.stringify({ success: true }));
        }

        if (action === 'update_price') {
            const itemId = context.request.parameters.itemId;
            const newPrice = parseFloat(context.request.parameters.price);

            if (isNaN(newPrice) || newPrice < 0) {
                context.response.write(JSON.stringify({ error: 'Invalid price.' }));
                return;
            }

            record.submitFields({
                type: record.Type.INVENTORY_ITEM,
                id: itemId,
                values: { rate: newPrice }
            });
            log.audit('Price Updated', { by: currentUser.id, itemId, newPrice });
            context.response.write(JSON.stringify({ success: true }));
        }
    };

    return { onRequest };
});
```

---

## 4. The runasrole Danger: Never Use Administrator

Script deployments can be configured to run as a specific role. Running as Administrator
bypasses all permission checks and is extremely dangerous.

### Example 4: Dangerous runasrole Configuration

```xml
<!-- ===== BAD: Script deployment running as Administrator ===== -->
<!-- File: Objects/customscript_data_export.xml -->
<suitelet scriptid="customscript_data_export">
    <scriptdeployments>
        <scriptdeployment scriptid="customdeploy_data_export">
            <status>RELEASED</status>
            <!-- VULNERABLE: Runs with full Administrator privileges -->
            <!-- Any user accessing this Suitelet executes with admin permissions -->
            <runasrole>ADMINISTRATOR</runasrole>
            <allroles>T</allroles>
        </scriptdeployment>
    </scriptdeployments>
</suitelet>
```

```xml
<!-- ===== GOOD: Use a purpose-built role with minimum permissions ===== -->
<!-- File: Objects/customscript_data_export.xml -->
<suitelet scriptid="customscript_data_export">
    <scriptdeployments>
        <scriptdeployment scriptid="customdeploy_data_export">
            <status>RELEASED</status>
            <!-- SAFE: Custom role with only the specific permissions needed -->
            <runasrole>customrole_data_export</runasrole>
            <!-- Restrict which roles can access this deployment -->
            <allroles>F</allroles>
            <roles>
                <role>customrole_sales_manager</role>
                <role>customrole_finance</role>
            </roles>
        </scriptdeployment>
    </scriptdeployments>
</suitelet>
```

### Example 5: Programmatic Role Elevation Guard

```javascript
// ===== GOOD: Guard against unintended role elevation =====
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/runtime', 'N/log'], (runtime, log) => {

    const ADMINISTRATOR_ROLE = 3;

    const onRequest = (context) => {
        const currentUser = runtime.getCurrentUser();

        // Safety check: refuse to run if executing as Administrator
        // This guards against misconfigured deployments
        if (currentUser.role === ADMINISTRATOR_ROLE) {
            log.error('Security Configuration Error',
                'This script should not run as Administrator. Check deployment runasrole.');

            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json; charset=utf-8'
            });
            context.response.write(JSON.stringify({
                error: 'Script configuration error. Contact your administrator.'
            }));
            return;
        }

        // Normal processing...
    };

    return { onRequest };
});
```

---

## 5. Horizontal Privilege Escalation Prevention

Horizontal escalation occurs when a user accesses another user's data at the same
privilege level (for example, Customer A viewing Customer B's orders).

### Example 6: Horizontal Escalation in Customer Portal

```javascript
// ===== BAD: Customer portal without entity filtering =====
define(['N/search', 'N/runtime'], (search, runtime) => {
    const onRequest = (context) => {
        // VULNERABLE: Returns ALL invoices, not just the current customer's
        const invoices = search.create({
            type: search.Type.INVOICE,
            filters: [
                ['mainline', 'is', 'T']
            ],
            columns: ['tranid', 'total', 'entity']
        }).run().getRange({ start: 0, end: 100 });

        context.response.write(JSON.stringify(invoices));
    };
});
```

```javascript
// ===== GOOD: Filter by current user's entity =====
define(['N/search', 'N/runtime', 'N/log'], (search, runtime, log) => {
    const onRequest = (context) => {
        const currentUser = runtime.getCurrentUser();

        // Restrict results to the current user's records only
        const invoices = search.create({
            type: search.Type.INVOICE,
            filters: [
                ['mainline', 'is', 'T'],
                'AND',
                ['entity', 'is', currentUser.id]  // Entity filter prevents horizontal escalation
            ],
            columns: ['tranid', 'total', 'duedate']
        }).run().getRange({ start: 0, end: 100 });

        // Secondary validation: verify each result belongs to the user
        const safeResults = invoices
            .map(r => ({
                tranId: r.getValue('tranid'),
                total: r.getValue('total'),
                dueDate: r.getValue('duedate')
            }));

        log.audit('Invoice List', {
            user: currentUser.id,
            count: safeResults.length
        });

        context.response.write(JSON.stringify(safeResults));
    };
});
```

---

## 6. Vertical Privilege Escalation Prevention

Vertical escalation occurs when a lower-privileged user performs actions reserved
for higher-privileged roles (for example, a Sales Rep modifying system configuration).

### Example 7: Preventing Vertical Escalation in Multi-Step Workflows

```javascript
// ===== BAD: Role checked only at first step, not at submission =====
define(['N/record', 'N/runtime', 'N/cache'], (record, runtime, cache) => {
    const onRequest = (context) => {
        if (context.request.method === 'GET') {
            // Role check on form display
            if (runtime.getCurrentUser().role !== 3) {
                context.response.write('Access denied.');
                return;
            }
            // Display the form...
        }

        if (context.request.method === 'POST') {
            // VULNERABLE: No role check on submission!
            // An attacker can craft a POST request directly, bypassing the GET check
            const newConfig = context.request.parameters.config;
            record.submitFields({
                type: 'customrecord_system_config',
                id: 1,
                values: { custrecord_config_value: newConfig }
            });
        }
    };
});
```

```javascript
// ===== GOOD: Authorization check on EVERY request, especially state-changing ones =====
define(['N/record', 'N/runtime', 'N/log'], (record, runtime, log) => {

    const ADMIN_ROLES = [3];

    const assertAdmin = (context) => {
        const user = runtime.getCurrentUser();
        if (!ADMIN_ROLES.includes(user.role)) {
            log.audit('Vertical Escalation Attempt', {
                user: user.id,
                role: user.role,
                method: context.request.method,
                url: context.request.url
            });

            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json; charset=utf-8'
            });
            context.response.write(JSON.stringify({
                error: 'Insufficient privileges.'
            }));
            return false;
        }
        return true;
    };

    const onRequest = (context) => {
        // Authorization check on EVERY request method
        if (!assertAdmin(context)) return;

        if (context.request.method === 'GET') {
            // Display configuration form...
        }

        if (context.request.method === 'POST') {
            const newConfig = context.request.parameters.config;

            // Additional validation on the submitted data
            if (!newConfig || typeof newConfig !== 'string') {
                context.response.write(JSON.stringify({ error: 'Invalid configuration.' }));
                return;
            }

            record.submitFields({
                type: 'customrecord_system_config',
                id: 1,
                values: { custrecord_config_value: newConfig }
            });

            log.audit('Config Updated', {
                by: runtime.getCurrentUser().id,
                newValue: newConfig
            });
        }
    };

    return { onRequest };
});
```

---

## 7. Record-Level Permissions

NetSuite allows configuring permissions at the record type level. Scripts should
respect and supplement these permissions.

### Example 8: Checking Record Permissions Programmatically

```javascript
// ===== GOOD: Check permissions before attempting operations =====
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/runtime', 'N/log', 'N/error'], (record, runtime, log, error) => {

    const onRequest = (context) => {
        const currentUser = runtime.getCurrentUser();
        const action = context.request.parameters.action;
        const recordType = context.request.parameters.recordType;
        const recordId = context.request.parameters.recordId;

        // Check if user has permission for the record type
        const permission = currentUser.getPermission({
            name: recordType
        });

        // Permission levels: 0=None, 1=View, 2=Create, 3=Edit, 4=Full
        const requiredPermission = {
            view: 1,
            create: 2,
            edit: 3,
            delete: 4
        };

        const required = requiredPermission[action];

        if (!required) {
            context.response.write(JSON.stringify({ error: 'Unknown action.' }));
            return;
        }

        if (permission < required) {
            log.audit('Permission Denied', {
                user: currentUser.id,
                action: action,
                recordType: recordType,
                userPermission: permission,
                requiredPermission: required
            });

            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json; charset=utf-8'
            });
            context.response.write(JSON.stringify({
                error: `Insufficient permissions. You have level ${permission}, need level ${required}.`
            }));
            return;
        }

        // Proceed with the authorized action
        try {
            if (action === 'view') {
                const rec = record.load({ type: recordType, id: recordId });
                context.response.write(JSON.stringify({ id: rec.id }));
            }
            // ... other actions
        } catch (e) {
            log.error('Operation Failed', e.message);
            context.response.write(JSON.stringify({ error: 'Operation failed.' }));
        }
    };

    return { onRequest };
});
```

---

## 8. Script Deployment Access Configuration

Properly configuring which roles can access a script deployment is critical for
access control.

### Example 9: Deployment Configuration Best Practices

```xml
<!-- ===== BAD: All roles can access, no audience restriction ===== -->
<scriptdeployment scriptid="customdeploy_sensitive_report">
    <status>RELEASED</status>
    <allroles>T</allroles>
    <!-- Everyone in the system can access this sensitive report -->
</scriptdeployment>
```

```xml
<!-- ===== GOOD: Explicitly list authorized roles ===== -->
<scriptdeployment scriptid="customdeploy_sensitive_report">
    <status>RELEASED</status>
    <allroles>F</allroles>
    <roles>
        <role>customrole_finance_director</role>
        <role>customrole_cfo</role>
    </roles>
    <loglevel>AUDIT</loglevel>
    <!-- Only Finance Director and CFO can access this deployment -->
</scriptdeployment>
```

---

## 9. Least Privilege Principle: Practical Application

### Example 10: Integration User with Minimum Permissions

```javascript
// ===== BAD: Integration script running as Administrator role =====
// This gives the integration access to ALL record types, ALL transactions,
// ALL configuration settings. If compromised, the attacker has full system access.

// ===== GOOD: Create a purpose-built integration role =====
/**
 * Role: "Vendor Sync Integration" (customrole_vendor_sync)
 *
 * Permissions configured via Setup > Users/Roles > Manage Roles:
 *   - Vendor record:        View + Edit (NO Delete, NO Create)
 *   - Vendor Bill record:   View only
 *   - Item record:          View only
 *   - Saved Searches:       Run only (not edit/create)
 *   - SuiteScript:          Full (required for script execution)
 *   - Log levels:           Audit (required for security logging)
 *   - All other permissions: None
 *
 * Script deployment configured with:
 *   - runasrole: customrole_vendor_sync
 *   - allroles: F
 *   - Audience: Only the scheduled script execution context
 */
```

```javascript
// ===== GOOD: Validate script context matches expected execution model =====
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/log'], (runtime, log) => {
    const execute = (context) => {
        const executionContext = runtime.executionContext;
        const currentUser = runtime.getCurrentUser();

        // Verify this script is running in the expected context
        const EXPECTED_CONTEXTS = [
            runtime.ContextType.SCHEDULED,
            runtime.ContextType.MAP_REDUCE
        ];

        if (!EXPECTED_CONTEXTS.includes(executionContext)) {
            log.error('Unexpected Execution Context', {
                expected: EXPECTED_CONTEXTS,
                actual: executionContext
            });
            return;
        }

        // Verify the role is the expected integration role
        const INTEGRATION_ROLE = 1050; // customrole_vendor_sync
        if (currentUser.role !== INTEGRATION_ROLE) {
            log.error('Unexpected Role', {
                expected: INTEGRATION_ROLE,
                actual: currentUser.role
            });
            return;
        }

        log.audit('Vendor Sync Started', {
            user: currentUser.id,
            role: currentUser.role,
            context: executionContext
        });

        // Proceed with sync logic...
    };

    return { execute };
});
```

---

## Prevention Checklist

- [ ] **Every Suitelet and RESTlet** checks the user's role before processing.
- [ ] **IDOR is prevented** by verifying record ownership or role-based access.
- [ ] **Authorization is checked on every request** (GET, POST, PUT, DELETE), not just form display.
- [ ] **runasrole never uses ADMINISTRATOR** (purpose-built roles with minimum permissions).
- [ ] **Script deployments restrict `allroles`** to `F` with explicit role lists.
- [ ] **Horizontal escalation** is prevented by filtering queries by the current user's entity.
- [ ] **Vertical escalation** is prevented by role checks on state-changing operations.
- [ ] **Record-level permissions** are checked programmatically for dynamic operations.
- [ ] **Integration roles** follow least privilege with only the specific permissions needed.
- [ ] **Sensitive actions are audit-logged** with user ID, role, and action details.
- [ ] **Error messages** do not reveal authorization logic or role structures.
- [ ] **Security-critical decisions** are made server-side, never in client scripts.

---

## Related OWASP Resources

- [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html)
- [OWASP Authorization Testing Guide](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/)
- [OWASP IDOR Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
- [CWE-284: Improper Access Control](https://cwe.mitre.org/data/definitions/284.html)
- [CWE-639: Authorization Bypass Through User-Controlled Key](https://cwe.mitre.org/data/definitions/639.html)
- [CWE-862: Missing Authorization](https://cwe.mitre.org/data/definitions/862.html)
