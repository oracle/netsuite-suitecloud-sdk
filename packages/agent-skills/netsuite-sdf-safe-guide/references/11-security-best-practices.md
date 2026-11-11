# Principle 11: Industry Best Practice Security Principles
> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

NetSuite has implemented technical and organizational security measures in line with industry standards and best practices. As a SuiteApp developer, you should advance the maturity of your secure development process over time using resources like OWASP.

## Key Concepts

### OWASP Security Principles

The Open Web Application Security Project (OWASP) provides continuously improving guidance for web developers. OWASP Security Principles help you:

- Make security decisions in new situations
- Derive security requirements
- Make architectural and implementation decisions
- Identify possible weaknesses before deployment

### Core Security Principles

| Principle | Description |
|-----------|-------------|
| Defense in Depth | Multiple layers of security controls |
| Fail Securely | Ensure failures don't compromise security |
| Least Privilege | Grant minimum permissions necessary |
| Separation of Duties | Divide critical functions among people |
| Security by Design | Build security into the architecture |
| Keep Security Simple | Avoid complex security mechanisms |
| Fix Security Issues Correctly | Address root cause, not just symptoms |

## Best Practices

### OWASP Top Ten Awareness

Familiarize yourself with common web application vulnerabilities:

1. **Injection** – SQL, NoSQL, command injection
2. **Broken Authentication** – Session management flaws
3. **Sensitive Data Exposure** – Insufficient data protection
4. **XML External Entities (XXE)** – Poorly configured XML parsers
5. **Broken Access Control** – Improper authorization
6. **Security Misconfiguration** – Default/incomplete configs
7. **Cross-Site Scripting (XSS)** – Untrusted data in web pages
8. **Insecure Deserialization** – Flawed object serialization
9. **Using Components with Known Vulnerabilities** – Outdated libraries
10. **Insufficient Logging & Monitoring** – Inadequate audit trails

### SuiteScript Security Patterns

```javascript
/**
 * Input Validation Pattern
 * @NApiVersion 2.1
 */
define(['N/encode'], (encode) => {

    // Validate and sanitize input using HTML entity encoding.
    // See netsuite-owasp-secure-coding/references/03-xss-output-encoding.md.
    const sanitizeInput = (input) => {
        if (typeof input !== 'string') {
            throw new Error('Invalid input type');
        }
        // HTML entity encoding; preserves data while neutralizing injection.
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };

    // Alternative: for structured input that must be alphanumeric only.
    const validateAlphanumeric = (input) => {
        if (typeof input !== 'string') {
            throw new Error('Invalid input type');
        }
        if (!/^[a-zA-Z0-9_\-\s]+$/.test(input)) {
            throw new Error('Input contains invalid characters');
        }
        return input.trim();
    };

    // Validate numeric input
    const validateNumericId = (id) => {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId) || numericId <= 0) {
            throw new Error('Invalid ID');
        }
        return numericId;
    };

    return { sanitizeInput, validateAlphanumeric, validateNumericId };
});
```

### Parameterized Queries

```javascript
/**
 * Use parameterized queries to prevent SQL injection.
 * @NApiVersion 2.1
 */
define(['N/query'], (query) => {

    // GOOD: Parameterized query
    const getCustomerSafe = (customerId) => {
        return query.runSuiteQL({
            query: `SELECT id, companyname FROM customer WHERE id = ?`,
            params: [customerId]
        }).asMappedResults();
    };

    // BAD: String concatenation (vulnerable to injection)
    const getCustomerUnsafe = (customerId) => {
        // DO NOT DO THIS
        return query.runSuiteQL({
            query: `SELECT id, companyname FROM customer WHERE id = ${customerId}`
        }).asMappedResults();
    };

    return { getCustomerSafe };
});
```

### Role-Based Access Control

```javascript
/**
 * Implement permission checks
 * @NApiVersion 2.1
 */
define(['N/runtime'], (runtime) => {

    const checkPermission = (permissionName) => {
        const currentUser = runtime.getCurrentUser();
        const permission = currentUser.getPermission({ name: permissionName });

        // Permission levels: 0=None, 1=View, 2=Create, 3=Edit, 4=Full
        if (permission < 2) {
            throw new Error('Insufficient permissions');
        }
        return true;
    };

    const validateRole = (allowedRoles) => {
        const currentRole = runtime.getCurrentUser().role;
        if (!allowedRoles.includes(currentRole)) {
            throw new Error('Role not authorized for this operation');
        }
        return true;
    };

    return { checkPermission, validateRole };
});
```

### Secure Error Handling

```javascript
/**
 * Secure error handling pattern
 * @NApiVersion 2.1
 */
define(['N/log'], (log) => {

    const handleError = (error, context) => {
        // Log detailed error internally
        log.error({
            title: 'Error in ' + context,
            details: {
                message: error.message,
                stack: error.stack,
                name: error.name
            }
        });

        // Return generic message to user (don't expose internal details).
        return {
            success: false,
            message: 'An error occurred. Please contact support.',
            errorCode: 'ERR_' + Date.now()
        };
    };

    return { handleError };
});
```

### Data Encryption

```javascript
/**
 * Encryption patterns for sensitive data
 * @NApiVersion 2.1
 */
define(['N/crypto', 'N/encode'], (crypto, encode) => {

    const hashSensitiveData = (data) => {
        const hash = crypto.createHash({
            algorithm: crypto.HashAlg.SHA256
        });
        hash.update({ input: data });
        return hash.digest({ outputEncoding: encode.Encoding.HEX });
    };

    const encryptData = (data, secretKey) => {
        const cipher = crypto.createCipher({
            algorithm: crypto.EncryptionAlg.AES,
            key: secretKey
        });
        cipher.update({ input: data });
        return cipher.final({ outputEncoding: encode.Encoding.BASE_64 });
    };

    return { hashSensitiveData, encryptData };
});
```

## Security Checklist

### Development Phase
- [ ] Input validation implemented for all user inputs
- [ ] Parameterized queries used for all database operations
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Error messages don't expose internal details
- [ ] Logging captures security-relevant events

### Code Review
- [ ] No hardcoded credentials or secrets
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Proper access control checks
- [ ] Secure session management

### Deployment
- [ ] Latest security patches applied
- [ ] Unnecessary features disabled
- [ ] Proper role-based permissions configured
- [ ] Audit logging enabled
- [ ] Third-party libraries reviewed for vulnerabilities

## Common Pitfalls

1. **Trusting user input** – Always validate and sanitize.
2. **Exposing error details** – Use generic error messages for users.
3. **Hardcoding secrets** – Use secure credential management.
4. **Insufficient logging** – Log security events for audit trails.
5. **Ignoring OWASP guidelines** – Regularly review and apply recommendations.

## Further Reading

- [OWASP Security Principles](https://www.owasp.org/index.php/Category:Principle)
- [OWASP Top Ten Project](https://www.owasp.org/index.php/Category:OWASP_Top_Ten_Project)
- [OWASP Guide Project](https://www.owasp.org/index.php/Category:OWASP_Guide_Project)
- BFN Questionnaire security requirements

---

## Cross-Reference: OWASP Secure Coding Practices

This principle provides awareness-level OWASP coverage. For full implementation depth including 48+ security pitfalls with BAD/GOOD code patterns, see the **`netsuite-owasp-secure-coding`** skill:

- [OWASP SKILL.md](../../netsuite-owasp-secure-coding/SKILL.md) — Main skill with pitfalls OSCP-001 through OSCP-048
- [Quick Reference](../../netsuite-owasp-secure-coding/quick-reference.md) — Fast-lookup cheat sheet
- [SuiteScript Security Patterns](../../netsuite-owasp-secure-coding/references/appendices/appendix-suitescript-security-patterns.md) — Copy-paste boilerplates
- [Security Checklist (80+ items)](../../netsuite-owasp-secure-coding/references/appendices/appendix-security-checklist.md)
