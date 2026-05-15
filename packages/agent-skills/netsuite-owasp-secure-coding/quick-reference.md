# NetSuite OWASP Secure Coding - Quick Reference
> Author: Oracle NetSuite

A fast lookup cheat sheet for common security patterns. For full details, see [SKILL.md](SKILL.md) and the reference files.

---

## 1. Input Validation Cheat Sheet

**Rule:** Validate all input on the server-side. Client-side validation is a UX convenience, not a security control.

| Input Type | Validation Approach | SuiteScript Example |
|------------|--------------------|--------------------|
| Numeric ID | Parse to integer, reject NaN, enforce range | `const id = parseInt(val, 10); if (isNaN(id) \|\| id < 1) throw error.create(...)` |
| String (name) | Trim, max length, reject control chars | `if (typeof val !== 'string' \|\| val.length > 200 \|\| /[\x00-\x1F]/.test(val)) throw ...` |
| Email | Regex + max length | `if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) \|\| val.length > 254) throw ...` |
| URL | Protocol allowlist (https only), no javascript: | `if (!/^https:\/\//.test(val)) throw ...` |
| Date | Parse with Date object, reject invalid | `const d = new Date(val); if (isNaN(d.getTime())) throw ...` |
| Enum / Select | Allowlist permitted values | `if (!['ACTIVE', 'INACTIVE'].includes(val)) throw ...` |
| JSON payload | Validate against a schema before processing | Parse first, then check required keys and types |
| File name | Strip path separators, allowlist extensions | `val.replace(/[\/\\:]/g, ''); if (!/\.(pdf\|csv)$/i.test(val)) throw ...` |

### Standard Validation Error Pattern

```javascript
// N/error — consistent validation error pattern
define(['N/error'], function (error) {
    function validatePositiveInt(val, fieldName) {
        const n = parseInt(val, 10);
        if (isNaN(n) || n < 1) {
            throw error.create({
                name: 'INVALID_INPUT',
                message: fieldName + ' must be a positive integer. Received: ' + typeof val,
                notifyOff: true
            });
        }
        return n;
    }

    function validateEnum(val, allowed, fieldName) {
        if (!allowed.includes(val)) {
            throw error.create({
                name: 'INVALID_INPUT',
                message: fieldName + ' must be one of: ' + allowed.join(', '),
                notifyOff: true
            });
        }
        return val;
    }

    return { validatePositiveInt, validateEnum };
});
```

---

## 2. Output Encoding Quick Reference

**Rule:** Encode output for the context in which it will be rendered. Never insert raw user data into HTML, JS, or SQL.

| Context | Encoding Method | Example |
|---------|----------------|---------|
| HTML body | XML/HTML entity encode | `N/xml.escape({xmlText: val})` or replace `< > & " '` |
| HTML attribute | Attribute encode (quote + entity) | Wrap in quotes, encode `" ' & < >` |
| JavaScript string | JS string encode (escape `\ ' " /`) | `val.replace(/\\/g,'\\\\').replace(/'/g,"\\'")` |
| URL parameter | Percent-encode | `encodeURIComponent(val)` |
| CSS value | Strip non-alphanumeric or allowlist | Reject values containing `expression(`, `url(`, `\\` |
| SuiteQL value | Parameterized query (never concat) | `query.runSuiteQL({ query: q, params: [val] })` or `query.runSuiteQLPaged({ query: q, params: [val], pageSize: PAGE_SIZE })`; page size range is `5-1000` |

### HTML Encoding Helper

For larger Suitelet HTML fragments, prefer an inline FTL template rendered with
`N/render` and `<#ftl output_format="HTML" auto_esc=true>`. Keep custom helpers
as fallback/shared-library patterns for raw output boundaries.

```javascript
function encodeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Usage in Suitelet HTML output
form.addField({
    id: 'custpage_msg',
    type: serverWidget.FieldType.INLINEHTML,
    label: 'Message'
}).defaultValue = '<p>' + encodeHTML(userInput) + '</p>';
```

```javascript
var renderer = render.create();
renderer.templateContent = [
    '<#ftl output_format="HTML" auto_esc=true>',
    '<p>${data.message}</p>'
].join('\n');
renderer.addCustomDataSource({
    format: render.DataSource.OBJECT,
    alias: 'data',
    data: { message: userInput || '' }
});
var html = renderer.renderAsString(); // response.write(html) or INLINEHTML.defaultValue
```

Use `N/xml.escape({ xmlText: val })` only for simple XML/HTML markup escaping;
do not use it as a JavaScript, URL, CSS, DOM, or trusted-HTML sanitizer.

---

## 3. SQL / SuiteQL Safety

### BAD - String Concatenation (SQL Injection)

```javascript
// NEVER DO THIS -- attacker controls customerName
const sql = "SELECT id, companyname FROM customer WHERE companyname = '" + customerName + "'";
query.runSuiteQL({ query: sql });
```

### GOOD - Parameterized Query

```javascript
// ALWAYS use ? placeholders + params array
const sql = "SELECT id, companyname FROM customer WHERE companyname = ?";
const results = query.runSuiteQL({ query: sql, params: [customerName] });
```

The same `?` placeholders and `params` rule applies to `runSuiteQLPaged` and to
promise variants.

### Multi-Parameter Example

```javascript
const sql = [
    "SELECT t.tranid, t.total",
    "FROM transaction t",
    "WHERE t.type = ?",
    "AND t.trandate >= ?",
    "AND t.entity = ?"
].join(' ');

const results = query.runSuiteQL({
    query: sql,
    params: ['SalesOrd', startDate, customerId]
});
```

### IN-Clause Pattern (Dynamic List)

```javascript
// Build placeholders dynamically, pass values as params
const ids = [101, 202, 303];
const placeholders = ids.map(function () { return '?'; }).join(', ');
const sql = "SELECT id, companyname FROM customer WHERE id IN (" + placeholders + ")";
const results = query.runSuiteQL({ query: sql, params: ids });
```

### Paged IN-Clause Pattern

```javascript
const ids = [101, 202, 303];
const placeholders = ids.map(function () { return '?'; }).join(', ');
const sql = [
    "SELECT id, companyname",
    "FROM customer",
    "WHERE id IN (" + placeholders + ")",
    "ORDER BY id"
].join(' ');

const PAGE_SIZE = 100; // NetSuite runSuiteQLPaged pageSize range: 5-1000.
const pagedResults = query.runSuiteQLPaged({
    query: sql,
    params: ids,
    pageSize: PAGE_SIZE
});
```

---

## 4. XSS Prevention Patterns

### 4a. Inline Script Injection

```html
<!-- BAD: raw user data in script block -->
<script>var name = '<?= userName ?>';</script>

<!-- GOOD: encode for JS context -->
<script>var name = '<?= jsEncode(userName) ?>';</script>
```

In SuiteScript Suitelets, build HTML safely:

```javascript
// BAD
html += '<div>' + request.parameters.name + '</div>';

// GOOD
html += '<div>' + encodeHTML(request.parameters.name) + '</div>';
```

### 4b. DOM-Based XSS

```javascript
// BAD: direct innerHTML from URL parameter
document.getElementById('output').innerHTML = window.location.hash.slice(1);

// GOOD: use textContent for untrusted data
document.getElementById('output').textContent = window.location.hash.slice(1);
```

### 4c. Stored XSS in Record Fields

```javascript
// When displaying record field values that users can edit:
const notes = record.getValue({ fieldId: 'custbody_notes' });

// BAD
html += '<td>' + notes + '</td>';

// GOOD
html += '<td>' + encodeHTML(notes) + '</td>';
```

### 4d. postMessage Origin Validation

```javascript
// BAD: no origin check
window.addEventListener('message', function (e) {
    processData(e.data);
});

// BAD: unanchored regex -- attacker can use evil.com?netsuite.com
window.addEventListener('message', function (e) {
    if (/netsuite\.com/.test(e.origin)) processData(e.data);
});

// GOOD: anchored regex with protocol
window.addEventListener('message', function (e) {
    if (/^https:\/\/[a-z0-9\-]+\.netsuite\.com$/.test(e.origin)) {
        processData(e.data);
    }
});

// GOOD: exact origin match
window.addEventListener('message', function (e) {
    if (e.origin === 'https://1234567.app.netsuite.com') {
        processData(e.data);
    }
});
```

---

## 5. File Upload / Download Safety

### Allowed Extensions Allowlist

```javascript
const ALLOWED_EXTENSIONS = ['.pdf', '.csv', '.xlsx', '.xls', '.txt', '.png', '.jpg', '.jpeg'];

function validateFileExtension(fileName) {
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        throw new Error('File type not allowed: ' + ext);
    }
    return ext;
}
```

### MIME Type Validation

```javascript
const ALLOWED_MIMES = {
    '.pdf': 'application/pdf',
    '.csv': 'text/csv',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
};

function validateMimeType(fileObj) {
    const ext = validateFileExtension(fileObj.name);
    const expectedMime = ALLOWED_MIMES[ext];
    // Compare only if your upload handler exposes a MIME type
    if (expectedMime && fileObj.mimeType !== expectedMime) {
        throw new Error('MIME type does not match extension');
    }
}
```

### File Size Limits

```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function validateFileSize(fileObj) {
    if (fileObj.size > MAX_FILE_SIZE) {
        throw new Error('File exceeds maximum size of 10 MB');
    }
}
```

### Path Traversal Prevention

```javascript
function sanitizeFileName(name) {
    // Remove directory traversal sequences and path separators
    let safe = name.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');
    safe = safe.replace(/[\/\\:*?"<>|]/g, '_');
    // Reject if still contains suspicious patterns
    if (safe.includes('..') || safe.startsWith('.')) {
        throw new Error('Filename contains disallowed characters');
    }
    return safe;
}
```

---

## 6. Authentication & Session

### TBA Nonce Generation (CSPRNG)

```javascript
// Use N/crypto for cryptographically secure random values
define(['N/crypto/random'], function (random) {
    function generateNonce() {
        return random.generateUUID().replace(/-/g, '');
    }

    // For TBA OAuth 1.0 headers, the nonce must be unique per request
    function generateTBANonce() {
        return random.generateUUID().replace(/-/g, '');
    }

    return { generateNonce, generateTBANonce };
});
```

### Session Token Requirements

| Requirement | Implementation |
|------------|---------------|
| Unique per session | Generate new token on each login/session start |
| Sufficient entropy | Minimum 128 bits (32 hex chars) |
| Transmitted securely | HTTPS only (NetSuite enforces this) |
| HttpOnly cookie flag | Set via response headers where possible |
| Expire on logout | Invalidate server-side on session end |
| Rotate after privilege change | Re-issue token after role switch |

### Role Validation Pattern

```javascript
// Check role before granting access
define(['N/runtime', 'N/error'], function (runtime, error) {
    var ALLOWED_ROLES = [3, 1032]; // Administrator, Custom Role ID

    function requireRole() {
        var currentRole = runtime.getCurrentUser().role;
        if (ALLOWED_ROLES.indexOf(currentRole) === -1) {
            throw error.create({
                name: 'ACCESS_DENIED',
                message: 'Insufficient privileges. Role ' + currentRole + ' is not authorized.'
            });
        }
    }

    function requirePermission(permId) {
        var user = runtime.getCurrentUser();
        var level = user.getPermission({ name: permId });
        if (level < 1) { // 0 = NONE
            throw error.create({
                name: 'ACCESS_DENIED',
                message: 'Missing required permission: ' + permId
            });
        }
    }

    return { requireRole, requirePermission };
});
```

---

## 7. HTTP Security Headers

### CSP Template for Suitelets

```javascript
// In Suitelet onRequest, set headers before writing response
response.setHeader({
    name: 'Content-Security-Policy',
    value: [
        "default-src 'self'",
        "script-src 'self' https://*.netsuite.com",
        "style-src 'self' 'unsafe-inline' https://*.netsuite.com",
        "img-src 'self' data: https://*.netsuite.com",
        "frame-ancestors 'self' https://*.netsuite.com",
        "form-action 'self'"
    ].join('; ')
});
```

### Recommended Headers

```javascript
function setSecurityHeaders(response) {
    // Prevent MIME-type sniffing
    response.setHeader({
        name: 'X-Content-Type-Options',
        value: 'nosniff'
    });

    // Prevent clickjacking
    response.setHeader({
        name: 'X-Frame-Options',
        value: 'SAMEORIGIN'
    });

    // Enforce HTTPS (NetSuite already does this, but defense in depth)
    response.setHeader({
        name: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains'
    });

    // Prevent caching of sensitive pages
    response.setHeader({
        name: 'Cache-Control',
        value: 'no-store, no-cache, must-revalidate, private'
    });

    response.setHeader({
        name: 'Pragma',
        value: 'no-cache'
    });
}
```

---

## 8. API / RESTlet Security

### Rate Limiting Pattern

```javascript
// Use N/cache to track request counts per caller
define(['N/cache', 'N/runtime', 'N/error'], function (cache, runtime, error) {
    var RATE_LIMIT = 100;   // max requests
    var WINDOW_SEC = 3600;  // per hour

    var rateLimitCache = cache.getCache({
        name: 'rate_limit',
        scope: cache.Scope.PUBLIC
    });

    function checkRateLimit() {
        var userId = String(runtime.getCurrentUser().id);
        var count = parseInt(rateLimitCache.get({ key: userId }) || '0', 10);
        if (count >= RATE_LIMIT) {
            throw error.create({
                name: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Limit: ' + RATE_LIMIT + ' per hour.'
            });
        }
        rateLimitCache.put({
            key: userId,
            value: String(count + 1),
            ttl: WINDOW_SEC
        });
    }

    return { checkRateLimit };
});
```

### Request Schema Validation

```javascript
define(['N/error'], function (error) {
    function validateRequestBody(body, schema) {
        // schema = { field: { type: 'string', required: true, maxLength: 200 }, ... }
        var errors = [];
        Object.keys(schema).forEach(function (field) {
            var rule = schema[field];
            var val = body[field];

            if (rule.required && (val === undefined || val === null || val === '')) {
                errors.push(field + ' is required');
                return;
            }
            if (val !== undefined && val !== null) {
                if (rule.type === 'string' && typeof val !== 'string') {
                    errors.push(field + ' must be a string');
                }
                if (rule.type === 'number' && typeof val !== 'number') {
                    errors.push(field + ' must be a number');
                }
                if (rule.maxLength && String(val).length > rule.maxLength) {
                    errors.push(field + ' exceeds max length ' + rule.maxLength);
                }
            }
        });
        if (errors.length > 0) {
            throw error.create({
                name: 'VALIDATION_ERROR',
                message: errors.join('; ')
            });
        }
    }

    return { validateRequestBody };
});
```

### CORS Configuration

```javascript
// RESTlet CORS — set on GET/POST/PUT/DELETE responses
function setCORSHeaders(request, response) {
    // Restrict to known origins
    var ALLOWED_ORIGINS = [
        'https://yourdomain.com',
        'https://app.yourdomain.com'
    ];
    var requestOrigin = request.headers.origin || request.headers.Origin || '';
    if (ALLOWED_ORIGINS.indexOf(requestOrigin) !== -1) {
        response.setHeader({ name: 'Access-Control-Allow-Origin', value: requestOrigin });
    }
    response.setHeader({ name: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE' });
    response.setHeader({ name: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' });
    response.setHeader({ name: 'Access-Control-Max-Age', value: '3600' });
}
```

### Authentication Check (RESTlet Entry Point)

```javascript
function onRequest(context) {
    // NetSuite enforces TBA/session auth for RESTlets automatically.
    // Add application-level checks:
    var user = runtime.getCurrentUser();

    // 1. Verify role
    if (ALLOWED_ROLES.indexOf(user.role) === -1) {
        return JSON.stringify({ error: 'Forbidden', code: 403 });
    }

    // 2. Rate limit
    checkRateLimit();

    // 3. Validate input
    var body = JSON.parse(context.requestBody);
    validateRequestBody(body, REQUEST_SCHEMA);

    // 4. Process request
    return processRequest(body);
}
```

---

## 9. Logging Safety

### What to Log

| Field | Example | Why |
|-------|---------|-----|
| Action | `RECORD_CREATED`, `LOGIN_ATTEMPT` | Audit trail |
| User ID | `runtime.getCurrentUser().id` | Attribution |
| Timestamp | `new Date().toISOString()` | Timeline reconstruction |
| Result | `SUCCESS`, `FAILURE`, `DENIED` | Outcome tracking |
| Record type + ID | `customer:12345` | What was affected |
| Source IP (if available) | `request.clientIpAddress` | Forensics |

### What Not to Log

| Data | Risk |
|------|------|
| Passwords or hashes | Credential theft from logs |
| Auth tokens / API keys | Session hijacking |
| Credit card numbers | PCI-DSS violation |
| SSN / national ID | PII breach |
| Full request bodies with sensitive fields | Data leak via log access |
| Medical / health data | HIPAA violation |

### Log Injection Prevention

```javascript
// BAD: raw user input in log message
log.audit('Search', 'User searched for: ' + userInput);
// Attacker sends: "test\nlog.audit('Admin','Fake admin action')"

// GOOD: sanitize before logging
function safeLogValue(val) {
    return String(val)
        .replace(/[\r\n]/g, ' ')    // strip newlines (log injection)
        .replace(/[\x00-\x1F]/g, '') // strip control characters
        .substring(0, 500);           // truncate long values
}

log.audit('Search', 'User searched for: ' + safeLogValue(userInput));
```

### Structured Logging Pattern

```javascript
function auditLog(action, details) {
    var user = runtime.getCurrentUser();
    var entry = {
        action: action,
        userId: user.id,
        role: user.role,
        timestamp: new Date().toISOString(),
        details: details
    };
    log.audit(action, JSON.stringify(entry));
}

// Usage
auditLog('RECORD_UPDATE', { recordType: 'customer', recordId: 5432, result: 'SUCCESS' });
```

---

## 10. Pitfall Quick Index

All 48 OWASP Secure Coding Practices (OSCP) pitfalls in a single lookup table.

| ID | Title | Severity | One-Line Fix |
|----|-------|----------|-------------|
| P01 | SQL injection via string concatenation | Critical | Use `?` placeholders with `params`, including for paged and promise SuiteQL calls. |
| P02 | Unvalidated input passed to record operations | High | Validate type, range, and format before use. |
| P03 | Missing output encoding in Suitelet HTML | High | Encode all dynamic values for the output context. |
| P04 | Raw user input in inline script blocks | High | JS-encode values inserted into script contexts. |
| P05 | No origin check on postMessage listeners | High | Validate `e.origin` with anchored regex or exact match. |
| P06 | Unanchored regex for origin validation | High | Anchor with `^https://` and `$` end boundary. |
| P07 | innerHTML assignment with untrusted data | Medium | Use `textContent` or encode before inserting. |
| P08 | Stored XSS from record field values | High | Encode record field values before HTML rendering. |
| P09 | Missing role check on Suitelet/RESTlet entry | High | Verify `runtime.getCurrentUser().role` on entry. |
| P10 | Overly permissive allroles=T deployment | Medium | Restrict to specific roles via audience element. |
| P11 | No rate limiting on RESTlets | Medium | Use `N/cache` to track and limit per-caller requests. |
| P12 | Accepting arbitrary file types on upload | High | Allowlist allowed extensions, reject all others. |
| P13 | No MIME type validation on uploads | Medium | Compare MIME type against expected type for extension. |
| P14 | Missing file size check | Medium | Enforce max size before processing. |
| P15 | Path traversal in file names | High | Strip `../`, `/`, `\` and reject suspicious names. |
| P16 | Logging passwords or tokens | Critical | Never log credentials; redact sensitive fields. |
| P17 | Log injection via newlines | Medium | Strip `\r\n` and control chars from log values. |
| P18 | Logging PII (SSN, credit cards) | High | Mask or omit PII from all log output. |
| P19 | No CSP header on Suitelet responses | Medium | Set `Content-Security-Policy` restricting sources. |
| P20 | Missing X-Content-Type-Options header | Low | Set `X-Content-Type-Options: nosniff`. |
| P21 | Missing X-Frame-Options header | Medium | Set `X-Frame-Options: SAMEORIGIN` |
| P22 | No Cache-Control on sensitive pages | Medium | Set `Cache-Control: no-store, private`. |
| P23 | Wildcard CORS origin | High | Allowlist specific allowed origins, never use `*` |
| P24 | CORS allows credentials with wildcard | Critical | Never combine `Access-Control-Allow-Credentials` with `*`. |
| P25 | No request body schema validation | Medium | Validate required fields, types, and lengths. |
| P26 | Trusting client-side validation alone | High | Always re-validate on the server side. |
| P27 | Hardcoded credentials in scripts | Critical | Use `N/runtime` script parameters or config records. |
| P28 | API keys in URL query strings | High | Pass keys in headers, never in URLs. |
| P29 | Weak nonce generation (Math.random only) | Medium | Use `N/crypto/random` for nonce generation. |
| P30 | No session rotation after privilege change | Medium | Re-issue session tokens after role changes. |
| P31 | Verbose error messages exposing internals | Medium | Return generic messages; log details server-side. |
| P32 | Stack traces returned to client | High | Catch errors, return safe error response. |
| P33 | Unrestricted redirect URL | High | Allowlist redirect targets, reject external URLs. |
| P34 | Open redirect via user-supplied parameter | High | Validate redirect starts with `/` (relative) only. |
| P35 | Missing HTTPS enforcement | High | NetSuite enforces HTTPS; add HSTS header for depth. |
| P36 | Insecure direct object reference (IDOR) | High | Verify caller has permission to access the record. |
| P37 | Mass assignment from request body | Medium | Pick only expected fields; ignore unexpected keys. |
| P38 | No governance check before loops | Medium | Check `getRemainingUsage()` before expensive operations. |
| P39 | Unbounded search results processing | Medium | Use `maxResults` or paging; avoid loading all results. |
| P40 | eval() or Function() with user input | Critical | Never use `eval`; parse JSON with `JSON.parse`. |
| P41 | Dynamic require() with user-controlled path | High | Hardcode module paths; never build from input. |
| P42 | Prototype pollution via object merge | Medium | Use `Object.create(null)` or validate keys. |
| P43 | Missing error handling in async callbacks | Medium | Wrap all callback bodies in try/catch. |
| P44 | Timing attacks on string comparison | Low | Use constant-time comparison for secrets. |
| P45 | Unvalidated webhook/callback source | High | Verify HMAC signature or shared secret. |
| P46 | Sensitive data in GET parameters | Medium | Use POST for sensitive data; GET params appear in logs. |
| P47 | No audit trail for destructive operations | Medium | Log all delete/update operations with before/after. |
| P48 | Relying on client-side feature flags | Medium | Enforce feature flags server-side via config records. |

---

## Quick Lookup: Which Section Do I Need?

| I need to... | Go to |
|-------------|-------|
| Validate user input | Section 1 |
| Render dynamic HTML safely | Section 2 |
| Write a SuiteQL query | Section 3 |
| Prevent XSS in a Suitelet | Section 4 |
| Handle file uploads | Section 5 |
| Check user roles/permissions | Section 6 |
| Set HTTP headers on responses | Section 7 |
| Secure a RESTlet endpoint | Section 8 |
| Log events without leaking data | Section 9 |
| Look up a specific pitfall | Section 10 |
