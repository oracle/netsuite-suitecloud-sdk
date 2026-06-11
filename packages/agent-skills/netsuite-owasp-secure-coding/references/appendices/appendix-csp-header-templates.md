# Appendix: CSP Header Templates
> Author: Oracle NetSuite

## Overview

Content Security Policy (CSP) is a critical defense-in-depth mechanism against Cross-Site
Scripting (XSS), clickjacking, and other code injection attacks. CSP instructs the browser
to only load resources from approved sources, dramatically reducing the impact of XSS
vulnerabilities even when input validation or output encoding fails.

This appendix provides ready-to-use CSP templates for NetSuite Suitelets and SuiteCommerce
applications, a directive reference table, common mistakes, and NetSuite-specific
considerations.

---

## 1. Strict CSP for Suitelets (No Inline Scripts)

This is the most secure configuration. All JavaScript must be in external files.

**CSP Header String:**

```
default-src 'none'; script-src 'self' https://*.netsuite.com https://*.oracle.com; style-src 'self' https://*.netsuite.com; img-src 'self' https://*.netsuite.com data:; connect-src 'self' https://*.netsuite.com https://*.oracle.com; font-src 'self' https://*.netsuite.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://*.netsuite.com; object-src 'none'
```

**SuiteScript Implementation:**

```javascript
function setStrictCSP(response) {
    const csp = [
        "default-src 'none'",
        "script-src 'self' https://*.netsuite.com https://*.oracle.com",
        "style-src 'self' https://*.netsuite.com",
        "img-src 'self' https://*.netsuite.com data:",
        "connect-src 'self' https://*.netsuite.com https://*.oracle.com",
        "font-src 'self' https://*.netsuite.com",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self' https://*.netsuite.com",
        "object-src 'none'"
    ].join('; ');

    response.setHeader({ name: 'Content-Security-Policy', value: csp });
}
```

---

## 2. Moderate CSP for Suitelets (Nonce-Based Inline Scripts)

When inline scripts are necessary, use a cryptographic nonce to allow only specific
inline script blocks. Each page load must generate a unique nonce.

**SuiteScript Implementation:**

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/crypto/random'], (random) => {

    /**
     * Generate a cryptographically secure nonce for CSP.
     * SECURITY: Use the platform CSPRNG; never use Math.random() for nonces.
     */
    function generateNonce() {
        return random.generateUUID().replace(/-/g, '').substring(0, 32);
    }

    function onRequest(context) {
        const nonce = generateNonce();

        const csp = [
            "default-src 'none'",
            `script-src 'self' 'nonce-${nonce}' https://*.netsuite.com`,
            "style-src 'self' 'unsafe-inline' https://*.netsuite.com",
            "img-src 'self' https://*.netsuite.com data:",
            "connect-src 'self' https://*.netsuite.com",
            "font-src 'self' https://*.netsuite.com",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'"
        ].join('; ');

        context.response.setHeader({ name: 'Content-Security-Policy', value: csp });

        // Use the nonce on inline script tags
        const html = `<!DOCTYPE html>
<html>
<head><title>Secure Page</title></head>
<body>
    <h1>Nonce-Protected Page</h1>
    <script nonce="${nonce}">
        // This inline script is allowed because it has the matching nonce
        console.log('This script is authorized by CSP nonce.');
    </script>
</body>
</html>`;

        context.response.write(html);
    }

    return { onRequest };
});
```

---

## 3. CSP for Single Page Applications (Hash-Based)

For SPAs where inline scripts are static and known at build time, use hash-based
allowlisting. The browser computes a SHA-256 hash of the inline script and compares
it to the CSP directive.

**Generating a Hash:**

```bash
echo -n "console.log('hello');" | openssl dgst -sha256 -binary | openssl base64
# Output: example hash, use actual output.
```

**CSP Header String:**

```
script-src 'self' 'sha256-<base64-hash-of-your-inline-script>' https://*.netsuite.com
```

**SuiteScript Implementation:**

```javascript
function setHashBasedCSP(response) {
    // Pre-computed SHA-256 hash of the known inline script content
    const scriptHash = 'sha256-AbCdEf1234567890abcdef1234567890abcdef12345=';

    const csp = [
        "default-src 'none'",
        `script-src 'self' '${scriptHash}' https://*.netsuite.com`,
        "style-src 'self' https://*.netsuite.com",
        "img-src 'self' https://*.netsuite.com data:",
        "connect-src 'self' https://*.netsuite.com",
        "font-src 'self' https://*.netsuite.com",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "object-src 'none'"
    ].join('; ');

    response.setHeader({ name: 'Content-Security-Policy', value: csp });
}
```

---

## 4. Report-Only CSP (Testing Before Enforcement)

Use `Content-Security-Policy-Report-Only` to test your policy without blocking
resources. Violations are logged but not enforced, allowing you to refine the policy
before deployment.

**SuiteScript Implementation:**

```javascript
function setReportOnlyCSP(response) {
    const csp = [
        "default-src 'none'",
        "script-src 'self' https://*.netsuite.com",
        "style-src 'self' https://*.netsuite.com",
        "img-src 'self' https://*.netsuite.com data:",
        "connect-src 'self' https://*.netsuite.com",
        "font-src 'self' https://*.netsuite.com",
        "frame-ancestors 'self'",
        "object-src 'none'",
        "report-uri /app/site/hosting/scriptlet.nl?script=customscript_csp_report&deploy=1"
    ].join('; ');

    // SECURITY: Report-Only mode. Violations are reported but not blocked.
    // Switch to Content-Security-Policy once the policy is validated.
    response.setHeader({ name: 'Content-Security-Policy-Report-Only', value: csp });
}

/**
 * CSP Violation Report Collector (separate RESTlet).
 * Deploy this to receive and log CSP violation reports.
 *
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
// define(['N/log'], (log) => {
//     function post(body) {
//         log.audit('CSP_VIOLATION', JSON.stringify(body));
//         return { status: 'received' };
//     }
//     return { post };
// });
```

---

## 5. CSP Directives Reference Table

| Directive | Purpose | Recommended Value |
|-----------|---------|-------------------|
| `default-src` | Fallback for all resource types not explicitly defined | `'none'` (then explicitly allow what you need) |
| `script-src` | Controls JavaScript sources | `'self'` with nonce or hash; never `'unsafe-inline'` |
| `style-src` | Controls CSS sources | `'self'`; `'unsafe-inline'` only if strictly necessary |
| `img-src` | Controls image sources | `'self' data:` (data: for inline images) |
| `connect-src` | Controls XHR, fetch, WebSocket destinations | `'self'` plus required API domains |
| `font-src` | Controls web font sources | `'self'` plus CDN if used |
| `frame-src` | Controls iframe sources | `'none'` unless iframes are required |
| `frame-ancestors` | Controls what can embed this page (replaces X-Frame-Options) | `'self'` or `'none'` |
| `base-uri` | Controls `<base>` tag URLs | `'self'` |
| `form-action` | Controls form submission targets | `'self'` plus required endpoints |
| `object-src` | Controls `<object>`, `<embed>`, `<applet>` | `'none'` (Flash/plugins are deprecated) |
| `media-src` | Controls audio and video sources | `'self'` or `'none'` |
| `worker-src` | Controls Web Worker and Service Worker sources | `'self'` or `'none'` |
| `report-uri` | URL to send CSP violation reports (deprecated, use report-to) | Your violation collector endpoint |
| `report-to` | Group name for Reporting API violation reports | JSON reporting endpoint group |

---

## 6. Common CSP Mistakes

### Using `'unsafe-inline'` in `script-src`

```
WRONG: script-src 'self' 'unsafe-inline'
```

This **completely defeats XSS protection** because any injected inline script will
execute. If an attacker can inject `<script>alert(1)</script>` into your page, the
CSP will not block it. Use nonce-based or hash-based policies instead.

### Using `'unsafe-eval'` in `script-src`

```
WRONG: script-src 'self' 'unsafe-eval'
```

This allows `eval()`, `new Function()`, `setTimeout('string')`, and similar dynamic
code execution. These are primary XSS exploitation vectors. Refactor code to avoid
`eval()` patterns entirely.

### Using Wildcard Sources

```
WRONG: script-src *
WRONG: script-src 'self' https:
WRONG: connect-src *
```

Wildcards and overly broad schemes allow attackers to load scripts from any HTTPS
domain, including attacker-controlled ones. Always specify exact domains or use
`*.netsuite.com` scoped wildcards.

### Missing `default-src 'none'`

Without `default-src 'none'`, any directive you forget to specify will fall back to
the browser default (allow all). Always start with `default-src 'none'` and
explicitly add only what you need.

### Forgetting `object-src 'none'`

Legacy plugins (Flash, Java applets) can bypass CSP protections. Always set
`object-src 'none'` unless you have a specific requirement for plugin content.

### Ignoring `frame-ancestors`

Without `frame-ancestors`, your page can be embedded in an iframe on any site,
enabling clickjacking attacks. Set `frame-ancestors 'self'` or `'none'`.

---

## 7. NetSuite-Specific CSP Considerations

### Domains to Whitelist for NetSuite Functionality

NetSuite applications require access to several Oracle-owned domains. The following
domains are commonly needed for full functionality:

```
https://*.netsuite.com - Core NetSuite application and SuiteScript file cabinet resources
https://*.oracle.com - Oracle CDN and services
https://*.oraclecloud.com - Oracle Cloud services
```

**Determine your exact account URL pattern:**

Your account-specific domain (for example, `https://1234567.app.netsuite.com`) should be
the primary allowed origin. Use browser developer tools in Report-Only mode to
identify all required domains.

### SuiteCommerce Advanced CSP Patterns

SuiteCommerce Advanced (SCA) applications have additional requirements because they
load templates, modules, and resources dynamically.

```javascript
function setSuiteCommerceCSP(response) {
    const csp = [
        "default-src 'none'",
        "script-src 'self' https://*.netsuite.com https://*.oracle.com 'unsafe-eval'",
        // NOTE: SCA requires 'unsafe-eval' for Backbone/Handlebars template
        // compilation. This is a known limitation. Mitigate with strict
        // input validation and output encoding at the application layer.
        "style-src 'self' 'unsafe-inline' https://*.netsuite.com https://fonts.googleapis.com",
        "img-src 'self' https://*.netsuite.com https://*.oracle.com data: blob:",
        "connect-src 'self' https://*.netsuite.com https://*.oracle.com",
        "font-src 'self' https://*.netsuite.com https://fonts.gstatic.com",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self' https://*.netsuite.com",
        "object-src 'none'"
    ].join('; ');

    response.setHeader({ name: 'Content-Security-Policy', value: csp });
}
```

**Important:** The `'unsafe-eval'` directive is required for SuiteCommerce Advanced
due to its template compilation engine. This is a trade-off: document this risk in
your threat model and compensate with strict server-side input validation and output
encoding.

### Setting CSP Headers in a Suitelet Helper Function

```javascript
/**
 * Reusable CSP header helper for all Suitelets in the project.
 * Import and call from each Suitelet's onRequest function.
 *
 * @param {Object} response - The Suitelet response object
 * @param {Object} [options] - Configuration options
 * @param {string} [options.nonce] - Nonce for inline scripts
 * @param {boolean} [options.reportOnly] - Use Report-Only mode
 * @param {string[]} [options.extraScriptSrc] - Additional script sources
 * @param {string[]} [options.extraConnectSrc] - Additional connect sources
 */
function applyCSP(response, options) {
    options = options || {};

    const scriptSrc = ["'self'", 'https://*.netsuite.com'];
    if (options.nonce) {
        scriptSrc.push(`'nonce-${options.nonce}'`);
    }
    if (options.extraScriptSrc) {
        scriptSrc.push(...options.extraScriptSrc);
    }

    const connectSrc = ["'self'", 'https://*.netsuite.com'];
    if (options.extraConnectSrc) {
        connectSrc.push(...options.extraConnectSrc);
    }

    const directives = [
        "default-src 'none'",
        'script-src ' + scriptSrc.join(' '),
        "style-src 'self' https://*.netsuite.com",
        "img-src 'self' https://*.netsuite.com data:",
        'connect-src ' + connectSrc.join(' '),
        "font-src 'self' https://*.netsuite.com",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self' https://*.netsuite.com",
        "object-src 'none'"
    ];

    const headerName = options.reportOnly
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';

    response.setHeader({ name: headerName, value: directives.join('; ') });
}
```

---

## References

- MDN Web Docs: Content Security Policy (CSP)
- OWASP Content Security Policy Cheat Sheet
- W3C Content Security Policy Level 3 Specification
- NetSuite SuiteScript 2.1 API: N/http, N/crypto, N/encode
- CWE-79: Improper Neutralization of Input During Web Page Generation (XSS)
