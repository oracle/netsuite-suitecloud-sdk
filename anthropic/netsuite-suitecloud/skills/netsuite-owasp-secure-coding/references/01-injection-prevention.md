Copyright (c) 2026 Oracle and/or its affiliates.
Licensed under the Universal Permissive License v1.0 as shown at [The Universal Permissive License (UPL), Version 1.0](https://oss.oracle.com/licenses/upl).

# Injection Prevention (A03:2021)
> Author: Oracle NetSuite

## Overview

Injection flaws occur when untrusted data is sent to an interpreter as part of a command
or query. The attacker's hostile data can trick the interpreter into executing unintended
commands or accessing data without proper authorization. In NetSuite/SuiteScript contexts,
the most common injection vectors are SuiteQL queries, HTTP header manipulation, and
template rendering.

**OWASP Reference:** [A03:2021 - Injection](https://owasp.org/Top10/A03_2021-Injection/).

---

## 1. SQL Injection in SuiteQL

SuiteQL is NetSuite's SQL-like query language. When queries are built using string
concatenation with user input, they become vulnerable to SQL injection. Use `?`
placeholders plus `params` for `query.runSuiteQL`, `query.runSuiteQLPaged`, and
their promise variants.

### Example 1: Basic SuiteQL Injection

```javascript
// ===== BAD: String concatenation in SuiteQL =====
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/query'], (query) => {
    const onRequest = (context) => {
        const customerId = context.request.parameters.customerId;

        // VULNERABLE: User input directly concatenated into query
        const sql = `SELECT companyname, email FROM customer WHERE id = ${customerId}`;
        const results = query.runSuiteQL({ query: sql });

        // An attacker could pass: customerId = "1 OR 1=1"
        // Or worse: customerId = "1; DROP TABLE customer--"
    };

    return { onRequest };
});
```

```javascript
// ===== GOOD: Parameterized SuiteQL query =====
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/query'], (query) => {
    const onRequest = (context) => {
        const customerId = context.request.parameters.customerId;

        // SAFE: Using parameterized query with positional placeholders
        const sql = `SELECT companyname, email FROM customer WHERE id = ?`;
        const results = query.runSuiteQL({
            query: sql,
            params: [customerId]
        });

        // The params array binds values separately from the query structure.
        // Even if customerId is "1 OR 1=1", it is treated as a literal string.
    };

    return { onRequest };
});
```

### Example 2: Multiple Parameters and IN Clauses

```javascript
// ===== BAD: Building IN clause with concatenation =====
define(['N/query'], (query) => {
    const getCustomersByStatus = (statusList) => {
        // VULNERABLE: Array values injected directly
        const sql = `SELECT id, companyname FROM customer
                     WHERE entitystatus IN (${statusList.join(',')})`;
        return query.runSuiteQL({ query: sql });
    };
});
```

```javascript
// ===== GOOD: Building IN clause with parameter placeholders =====
define(['N/query'], (query) => {
    const getCustomersByStatus = (statusList) => {
        // SAFE: Generate one placeholder per value, then pass all as params
        const placeholders = statusList.map(() => '?').join(',');
        const sql = `SELECT id, companyname FROM customer
                     WHERE entitystatus IN (${placeholders})`;
        return query.runSuiteQL({
            query: sql,
            params: statusList
        });
    };
});
```

```javascript
// ===== GOOD: Paged dynamic list query with parameter placeholders =====
define(['N/query'], (query) => {
    const getCustomerPagesByIds = (ids) => {
        const PAGE_SIZE = 100; // NetSuite runSuiteQLPaged pageSize range: 5-1000.
        // SAFE: Use one placeholder per value and pass values through params.
        const placeholders = ids.map(() => '?').join(', ');
        const sql = `SELECT id, companyname, email
                     FROM customer
                     WHERE id IN (${placeholders})
                     ORDER BY id`;

        return query.runSuiteQLPaged({
            query: sql,
            params: ids,
            pageSize: PAGE_SIZE
        });
    };
});
```

### Example 3: Dynamic Column/Table Names

```javascript
// ===== BAD: User-controlled column name =====
define(['N/query'], (query) => {
    const searchRecords = (sortColumn) => {
        // VULNERABLE: Column name from user input
        const sql = `SELECT id, companyname FROM customer ORDER BY ${sortColumn}`;
        return query.runSuiteQL({ query: sql });
    };
});
```

```javascript
// ===== GOOD: Allowlist for dynamic identifiers =====
define(['N/query'], (query) => {
    const ALLOWED_SORT_COLUMNS = ['id', 'companyname', 'datecreated', 'email'];

    const searchRecords = (sortColumn) => {
        // SAFE: Validate against an allowlist of known-safe column names
        if (!ALLOWED_SORT_COLUMNS.includes(sortColumn)) {
            throw new Error(`Invalid sort column: ${sortColumn}`);
        }

        const sql = `SELECT id, companyname FROM customer ORDER BY ${sortColumn}`;
        return query.runSuiteQL({ query: sql });
    };
});
```

> **Key Rule:** Parameterized queries protect *values* only. Identifiers (column names,
> table names) cannot be parameterized; use an allowlist instead.

---

## 2. Command Injection

Command injection occurs when user input is passed to system shell commands. While
less common in SuiteScript (which runs in a sandboxed environment), it can occur in
auxiliary Node.js tooling, SDF build scripts, or custom middleware.

### Example 4: Command Injection in Build Scripts

```javascript
// ===== BAD: Executing shell commands with user input =====
const { exec } = require('child_process');

function deployProject(projectName) {
    // VULNERABLE: projectName could contain shell metacharacters
    // for example, projectName = "myproject; rm -rf /"
    exec(`sdfcli deploy -project ${projectName}`, (error, stdout) => {
        console.log(stdout);
    });
}
```

```javascript
// ===== GOOD: Use execFile with argument arrays (no shell interpretation) =====
const { execFile } = require('child_process');

function deployProject(projectName) {
    // SAFE: execFile does not spawn a shell; arguments are passed directly
    // to the executable, so shell metacharacters are not interpreted.
    const sanitizedName = projectName.replace(/[^a-zA-Z0-9_-]/g, '');

    execFile('sdfcli', ['deploy', '-project', sanitizedName], (error, stdout) => {
        if (error) {
            console.error('Deployment failed:', error.message);
            return;
        }
        console.log(stdout);
    });
}
```

```javascript
// ===== GOOD (alternative): Use a library with built-in escaping =====
const { execFile } = require('child_process');

function deployProject(projectName) {
    // Validate input against an allowlist pattern
    if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
        throw new Error('Invalid project name. Only alphanumeric, hyphens, and underscores allowed.');
    }

    execFile('sdfcli', ['deploy', '-project', projectName], (error, stdout) => {
        console.log(stdout);
    });
}
```

---

## 3. HTTP Header Injection (CRLF Injection)

CRLF (Carriage Return Line Feed) injection occurs when an attacker can inject `\r\n`
characters into HTTP headers, potentially creating new headers or splitting the response.

### Example 5: CRLF Injection in Suitelet Response Headers

```javascript
// ===== BAD: Unsanitized user input in HTTP headers =====
define(['N/http'], (http) => {
    const onRequest = (context) => {
        const redirectUrl = context.request.parameters.redirect;

        // VULNERABLE: Attacker could inject:
        //   redirect = "https://example.com\r\nSet-Cookie: admin=true"
        // This would inject a new Set-Cookie header into the response.
        context.response.setHeader({
            name: 'Location',
            value: redirectUrl
        });
        context.response.write('Redirect prepared using an unvalidated Location header.');
    };

    return { onRequest };
});
```

```javascript
// ===== GOOD: Strip CRLF characters and validate URL =====
define(['N/http', 'N/url'], (http, url) => {

    const ALLOWED_REDIRECT_HOSTS = ['system.netsuite.com', 'mycompany.com'];

    const sanitizeHeaderValue = (value) => {
        // Remove all carriage return and line feed characters
        return String(value).replace(/[\r\n\x00]/g, '');
    };

    const isAllowedRedirect = (redirectUrl) => {
        try {
            const parsed = new URL(redirectUrl);
            return ALLOWED_REDIRECT_HOSTS.includes(parsed.hostname);
        } catch (e) {
            return false;
        }
    };

    const onRequest = (context) => {
        const redirectUrl = context.request.parameters.redirect;
        const sanitized = sanitizeHeaderValue(redirectUrl);

        if (!isAllowedRedirect(sanitized)) {
            context.response.write('Invalid redirect destination.');
            return;
        }

        context.response.setHeader({
            name: 'Location',
            value: sanitized
        });
        context.response.write('Redirect prepared after validation.');
    };

    return { onRequest };
});
```

---

## 4. LDAP Injection

LDAP injection occurs when user input is incorporated into LDAP queries without
proper escaping. This is relevant when NetSuite integrations authenticate against
or query external LDAP/Active Directory services.

### Example 6: LDAP Filter Injection

```javascript
// ===== BAD: Unsanitized input in LDAP filter =====
define(['N/https'], (https) => {
    const lookupUser = (username) => {
        // VULNERABLE: username = "admin)(|(password=*))" could expose all passwords
        const ldapFilter = `(&(uid=${username})(objectClass=person))`;

        // Sending to an LDAP-proxying API
        const response = https.post({
            url: 'https://ldap-proxy.internal/search',
            body: JSON.stringify({ filter: ldapFilter }),
            headers: { 'Content-Type': 'application/json' }
        });
    };
});
```

```javascript
// ===== GOOD: Escape LDAP special characters =====
define(['N/https'], (https) => {

    /**
     * Escapes LDAP special characters per RFC 4515.
     * Characters: \ * ( ) NUL
     */
    const escapeLdapFilter = (input) => {
        return String(input)
            .replace(/\\/g, '\\5c')
            .replace(/\*/g, '\\2a')
            .replace(/\(/g, '\\28')
            .replace(/\)/g, '\\29')
            .replace(/\x00/g, '\\00');
    };

    const lookupUser = (username) => {
        const safeUsername = escapeLdapFilter(username);
        const ldapFilter = `(&(uid=${safeUsername})(objectClass=person))`;

        const response = https.post({
            url: 'https://ldap-proxy.internal/search',
            body: JSON.stringify({ filter: ldapFilter }),
            headers: { 'Content-Type': 'application/json' }
        });
    };
});
```

---

## 5. Template Literal Injection

JavaScript template literals can become injection vectors when used to build
structured content (HTML, SQL, XML) with untrusted data.

### Example 7: Template Literal in HTML Generation

```javascript
// ===== BAD: Template literal with unsanitized data in HTML =====
define(['N/record'], (record) => {
    const generateReport = (context) => {
        const custName = context.request.parameters.name;

        // VULNERABLE: custName could contain <script>alert('xss')</script>
        const html = `<html><body><h1>Report for ${custName}</h1></body></html>`;
        context.response.write(html);
    };
});
```

```javascript
// ===== GOOD: Escape HTML entities before embedding =====
define(['N/record'], (record) => {

    const escapeHtml = (str) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return String(str).replace(/[&<>"'/]/g, (char) => map[char]);
    };

    const generateReport = (context) => {
        const custName = context.request.parameters.name;
        const safeName = escapeHtml(custName);

        const html = `<html><body><h1>Report for ${safeName}</h1></body></html>`;
        context.response.write(html);
    };
});
```

---

## 6. Stored Procedure and Saved Search Injection

While NetSuite does not expose raw stored procedures, saved searches built dynamically
can be vulnerable to filter injection.

### Example 8: Dynamic Saved Search Filters

```javascript
// ===== BAD: Unvalidated filter operator from user input =====
define(['N/search'], (search) => {
    const dynamicSearch = (fieldId, operator, value) => {
        // VULNERABLE: operator and fieldId come from user -- could manipulate search logic
        const results = search.create({
            type: search.Type.CUSTOMER,
            filters: [[fieldId, operator, value]]
        }).run().getRange({ start: 0, end: 100 });

        return results;
    };
});
```

```javascript
// ===== GOOD: Allowlisted fields and operators =====
define(['N/search'], (search) => {

    const ALLOWED_FIELDS = ['companyname', 'email', 'entitystatus'];
    const ALLOWED_OPERATORS = ['is', 'contains', 'startswith', 'isnotempty'];

    const dynamicSearch = (fieldId, operator, value) => {
        if (!ALLOWED_FIELDS.includes(fieldId)) {
            throw new Error(`Field not allowed for search: ${fieldId}`);
        }
        if (!ALLOWED_OPERATORS.includes(operator)) {
            throw new Error(`Operator not allowed: ${operator}`);
        }

        // Sanitize value: strip control characters
        const safeValue = String(value).replace(/[\x00-\x1f]/g, '');

        const results = search.create({
            type: search.Type.CUSTOMER,
            filters: [[fieldId, operator, safeValue]]
        }).run().getRange({ start: 0, end: 100 });

        return results;
    };
});
```

---

## Prevention Checklist

Use this checklist when reviewing SuiteScript code for injection vulnerabilities:

- [ ] **SuiteQL queries use parameterized placeholders (`?`)** with `params` for `runSuiteQL`, `runSuiteQLPaged`, and promise variants.
- [ ] **No string concatenation or template literals** build SQL with user input.
- [ ] **Dynamic identifiers** (column/table names) are validated against an allowlist.
- [ ] **HTTP header values** are stripped of `\r`, `\n`, and `\x00` characters.
- [ ] **Redirect URLs** are validated against an allowlist of permitted hosts.
- [ ] **Shell commands** use `execFile` (not `exec`) with argument arrays.
- [ ] **LDAP filters** escape special characters per RFC 4515.
- [ ] **Saved search filters** validate field names and operators against allowlists.
- [ ] **Template literals** that produce HTML, XML, or SQL properly escape interpolated values.
- [ ] **All user input** from `context.request.parameters`, `context.request.body`, and
      `context.request.headers` is treated as untrusted.
- [ ] **Input validation** uses allowlists (what is permitted) rather than denylists (what is not).
- [ ] **Type coercion** is applied where possible (for example, `parseInt()` for numeric IDs).

---

## Quick Reference: SuiteQL Parameterized Query Syntax

```javascript
// Single parameter
query.runSuiteQL({
    query: 'SELECT id, companyname FROM customer WHERE id = ?',
    params: [customerId]
});

// Multiple parameters
query.runSuiteQL({
    query: 'SELECT id, companyname FROM customer WHERE entitystatus = ? AND datecreated > ?',
    params: [statusId, startDate]
});

// IN clause with dynamic number of parameters
const placeholders = ids.map(() => '?').join(', ');
query.runSuiteQL({
    query: `SELECT id, companyname FROM customer WHERE id IN (${placeholders})`,
    params: ids
});

// Paged SuiteQL uses the same placeholders and params pattern
const PAGE_SIZE = 100; // NetSuite runSuiteQLPaged pageSize range: 5-1000.
query.runSuiteQLPaged({
    query: `SELECT id, companyname
            FROM customer
            WHERE id IN (${placeholders})
            ORDER BY id`,
    params: ids,
    pageSize: PAGE_SIZE
});

// LIKE with parameter (the % is part of the value, not the query)
query.runSuiteQL({
    query: 'SELECT id, companyname FROM customer WHERE companyname LIKE ?',
    params: [`%${searchTerm}%`]
});
```

The promise variants use the same query text and `params` rules; only the call
style changes.

---

## Related OWASP Resources

- [OWASP Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html)
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP Query Parameterization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html)
- [OWASP LDAP Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html)
- [CWE-89: SQL Injection](https://cwe.mitre.org/data/definitions/89.html)
- [CWE-78: OS Command Injection](https://cwe.mitre.org/data/definitions/78.html)
