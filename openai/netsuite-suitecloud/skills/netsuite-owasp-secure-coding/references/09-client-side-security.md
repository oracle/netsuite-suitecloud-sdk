Copyright (c) 2026 Oracle and/or its affiliates.
Licensed under the Universal Permissive License v1.0 as shown at [The Universal Permissive License (UPL), Version 1.0](https://oss.oracle.com/licenses/upl).

# Client-Side Security
> Author: Oracle NetSuite

> Applies to: SuiteScript 2.x Client Scripts, Suitelets rendering HTML, Single-Page Applications
> Related OWASP Categories: A03:2021 (Injection), A05:2021 (Security Misconfiguration),
> A07:2021 (Identification and Authentication Failures)

Client-side security addresses vulnerabilities in code that runs in the browser.
Even though server-side validation is the primary defense, client-side security
controls are essential for defense in depth, protecting users from cross-site
scripting, clickjacking, and data theft.

---

## Table of Contents

1. [Content Security Policy (CSP) Headers](#content-security-policy-csp-headers)
2. [CSP for Suitelets and SPAs](#csp-for-suitelets-and-spas)
3. [CSRF Prevention Tokens](#csrf-prevention-tokens)
4. [Subresource Integrity (SRI)](#subresource-integrity-sri)
5. [postMessage Security](#postmessage-security)
6. [DOM-Based XSS Prevention](#dom-based-xss-prevention)
7. [Clickjacking Prevention](#clickjacking-prevention)
8. [Local Storage Security](#local-storage-security)
9. [Third-Party Script Risks](#third-party-script-risks)
10. [Service Worker Security](#service-worker-security)

---

## Content Security Policy (CSP) Headers

Content Security Policy is the most effective defense against XSS. It tells the
browser which sources of content are allowed, blocking injected scripts.

```javascript
// BAD: No CSP headers - browser executes any injected script
function onRequest(context) {
    context.response.write('<html><body>Hello</body></html>');
    // No CSP header means inline scripts, eval(), and external scripts all work
}

// BAD: Overly permissive CSP that defeats the purpose
function onRequest(context) {
    context.response.setHeader({
        name: 'Content-Security-Policy',
        value: "default-src *; script-src * 'unsafe-inline' 'unsafe-eval';"
        // This allows everything - completely useless
    });
}
```

```javascript
// GOOD: Strict CSP that blocks unauthorized script execution
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/https'], (https) => {

    function generateNonce() {
        const response = https.get({
            url: 'https://internal-crypto-service.company.com/csp-nonce',
            headers: { 'Authorization': 'Bearer ' + getServiceToken() }
        });
        const payload = JSON.parse(response.body);
        if (!payload.nonce || !/^[A-Za-z0-9+/=_-]+$/.test(payload.nonce)) {
            throw new Error('Nonce service returned an invalid payload.');
        }
        return payload.nonce;
    }

    function onRequest(context) {
        const nonce = generateNonce();

        // Strict CSP with nonce-based script allowlisting
        const csp = [
            "default-src 'none'",
            `script-src 'nonce-${nonce}' 'strict-dynamic'`,
            "style-src 'self' https://cdn.company.com",
            "img-src 'self' data: https://cdn.company.com",
            "font-src 'self' https://cdn.company.com",
            "connect-src 'self' https://api.company.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests"
        ].join('; ');

        context.response.setHeader({
            name: 'Content-Security-Policy',
            value: csp
        });

        // Only scripts with matching nonce will execute
        context.response.write(`
            <html>
            <head>
                <script nonce="${nonce}">
                    // This script runs because it has the correct nonce
                    console.log('Authorized script');
                </script>
            </head>
            <body>
                <h1>Secure Page</h1>
            </body>
            </html>
        `);
    }

    return { onRequest };
});
```

---

## CSP for Suitelets and SPAs

When building single-page applications (SPAs) within Suitelets, CSP must be
carefully configured to allow the application framework while blocking injection.

```javascript
// BAD: Disabling CSP for "convenience" with a SPA framework
function onRequest(context) {
    context.response.setHeader({
        name: 'Content-Security-Policy',
        value: "script-src 'unsafe-inline' 'unsafe-eval';"
        // Required by some frameworks but defeats XSS protection entirely
    });
}
```

```javascript
// GOOD: CSP for a Suitelet-hosted SPA using nonces and strict-dynamic
function buildSpaResponse(context) {
    const nonce = generateNonce();

    const csp = [
        "default-src 'none'",
        // strict-dynamic allows nonce-approved scripts to load additional scripts
        `script-src 'nonce-${nonce}' 'strict-dynamic' https:`,
        "style-src 'self' 'nonce-" + nonce + "'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self' https://api.company.com",
        "frame-src 'none'",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'"
    ].join('; ');

    context.response.setHeader({ name: 'Content-Security-Policy', value: csp });
    context.response.setHeader({ name: 'X-Content-Type-Options', value: 'nosniff' });
    context.response.setHeader({ name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' });

    // The SPA bootstrap script uses the nonce
    context.response.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script nonce="${nonce}">
                // Bootstrap script that loads the SPA bundle
                var appConfig = {
                    apiBase: '/app/site/hosting/restlet.nl?script=123&deploy=1',
                    csrfToken: '${generateCsrfToken()}'
                };
            </script>
            <script nonce="${nonce}" src="/SuiteScripts/spa/bundle.min.js"></script>
        </head>
        <body>
            <div id="app"></div>
        </body>
        </html>
    `);
}
```

---

## CSRF Prevention Tokens

Cross-Site Request Forgery (CSRF) attacks trick authenticated users into making
unintended requests. Use anti-CSRF tokens on all state-changing operations.

```javascript
// BAD: No CSRF protection on state-changing form
function onRequest(context) {
    if (context.request.method === 'GET') {
        context.response.write(`
            <form method="POST" action="/app/site/hosting/scriptlet.nl?script=1&deploy=1">
                <input name="amount" value="1000">
                <button type="submit">Transfer</button>
            </form>
        `);
    }
    if (context.request.method === 'POST') {
        // No CSRF token check - attacker can forge this request
        processTransfer(context.request.parameters.amount);
    }
}
```

```javascript
// GOOD: CSRF token generation and validation
define(['N/crypto', 'N/encode', 'N/runtime', 'N/cache', 'N/log'], (crypto, encode, runtime, cache, log) => {

    const CSRF_CACHE = cache.getCache({ name: 'csrfTokens', scope: cache.Scope.PRIVATE });

    function generateCsrfToken(sessionId) {
        const keyGuid = runtime.getCurrentScript()
            .getParameter({ name: 'custscript_csrf_secret' });
        const secretKey = crypto.createSecretKey({
            guid: keyGuid,
            encoding: encode.Encoding.UTF_8
        });

        const timestamp = Date.now().toString();
        const hmac = crypto.createHmac({ algorithm: crypto.HashAlg.SHA256, key: secretKey });
        hmac.update({
            input: sessionId + '|' + timestamp,
            inputEncoding: encode.Encoding.UTF_8
        });
        const token = timestamp + '.' + hmac.digest({ outputEncoding: encode.Encoding.HEX });

        // Store token in cache for validation
        CSRF_CACHE.put({ key: token, value: 'valid', ttl: 3600 }); // 1 hour TTL
        return token;
    }

    function validateCsrfToken(token, sessionId) {
        if (!token || typeof token !== 'string') return false;

        // Check cache
        const cached = CSRF_CACHE.get({ key: token });
        if (cached !== 'valid') return false;

        // Verify HMAC
        const parts = token.split('.');
        if (parts.length !== 2) return false;

        const [timestamp, signature] = parts;

        // Check token age (max 1 hour)
        const age = Date.now() - parseInt(timestamp, 10);
        if (age > 3600000 || age < 0) return false;

        const keyGuid = runtime.getCurrentScript()
            .getParameter({ name: 'custscript_csrf_secret' });
        const secretKey = crypto.createSecretKey({
            guid: keyGuid,
            encoding: encode.Encoding.UTF_8
        });

        const hmac = crypto.createHmac({ algorithm: crypto.HashAlg.SHA256, key: secretKey });
        hmac.update({
            input: sessionId + '|' + timestamp,
            inputEncoding: encode.Encoding.UTF_8
        });
        const expected = hmac.digest({ outputEncoding: encode.Encoding.HEX });

        // Invalidate token after use (one-time use)
        CSRF_CACHE.remove({ key: token });

        return constantTimeCompare(signature, expected);
    }

    function onRequest(context) {
        const sessionId = runtime.getCurrentUser().id.toString();

        if (context.request.method === 'GET') {
            const csrfToken = generateCsrfToken(sessionId);
            context.response.write(`
                <form method="POST">
                    <input type="hidden" name="csrf_token" value="${csrfToken}">
                    <input name="amount" value="">
                    <button type="submit">Transfer</button>
                </form>
            `);
            return;
        }

        if (context.request.method === 'POST') {
            const csrfToken = context.request.parameters.csrf_token;
            if (!validateCsrfToken(csrfToken, sessionId)) {
                log.audit('CSRF_VIOLATION', { userId: sessionId });
                context.response.write('Invalid or expired security token. Please reload the page.');
                return;
            }
            processTransfer(context.request.parameters.amount);
        }
    }

    return { onRequest };
});
```

---

## Subresource Integrity (SRI)

SRI ensures that external scripts and stylesheets have not been tampered with
by verifying their content against a cryptographic hash.

```javascript
// BAD: Loading external scripts without integrity verification
function onRequest(context) {
    context.response.write(`
        <html>
        <head>
            <!-- If the CDN is compromised, malicious code runs in your context -->
            <script src="https://cdn.example.com/library.min.js"></script>
            <link rel="stylesheet" href="https://cdn.example.com/styles.css">
        </head>
        <body></body>
        </html>
    `);
}
```

```javascript
// GOOD: SRI hashes verify external resource integrity
function onRequest(context) {
    const nonce = generateNonce();

    context.response.setHeader({
        name: 'Content-Security-Policy',
        value: `script-src 'nonce-${nonce}'; style-src 'self'; require-sri-for script style`
    });

    context.response.write(`
        <html>
        <head>
            <!-- SRI hash ensures the file matches expected content -->
            <script
                src="https://cdn.example.com/library.min.js"
                integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8w"
                crossorigin="anonymous"
                nonce="${nonce}">
            </script>
            <link
                rel="stylesheet"
                href="https://cdn.example.com/styles.css"
                integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2H"
                crossorigin="anonymous">
        </head>
        <body></body>
        </html>
    `);
}

// GOOD: Generate SRI hashes for your own hosted resources
// Run this in a build script, not at runtime
// Command: openssl dgst -sha384 -binary library.min.js | openssl base64 -A
```

---

## postMessage Security

The `postMessage` API enables cross-origin communication between windows. Without
proper origin validation, attackers can inject malicious messages.

```javascript
// BAD: No origin check - accepts messages from any source
window.addEventListener('message', function(event) {
    // Any website can send messages here
    var data = JSON.parse(event.data);
    document.getElementById('output').innerHTML = data.content; // XSS!
    eval(data.code); // Remote code execution!
});

// BAD: Weak origin check with indexOf (bypassable)
window.addEventListener('message', function(event) {
    if (event.origin.indexOf('company.com') !== -1) {
        // Bypassed by: "evil-company.com" or "company.com.evil.com"
        processMessage(event.data);
    }
});

// BAD: Unanchored regex for origin check
window.addEventListener('message', function(event) {
    if (/company\.com/.test(event.origin)) {
        // Bypassed by: "https://evil-company.com" or "https://company.com.evil.net"
        processMessage(event.data);
    }
});
```

```javascript
// GOOD: Strict origin validation with anchored regex and data validation
(function() {
    'use strict';

    // Anchored regex: matches exactly the allowed origins
    var ALLOWED_ORIGIN_PATTERN = /^https:\/\/(app|portal|admin)\.company\.com$/;

    // Alternatively, use an explicit set
    var ALLOWED_ORIGINS = Object.freeze({
        'https://app.company.com': true,
        'https://portal.company.com': true,
        'https://admin.company.com': true
    });

    window.addEventListener('message', function(event) {
        // Method 1: Exact match against set
        if (!ALLOWED_ORIGINS[event.origin]) {
            console.warn('Rejected message from unauthorized origin:', event.origin);
            return;
        }

        // Method 2: Anchored regex (alternative)
        // if (!ALLOWED_ORIGIN_PATTERN.test(event.origin)) {
        //     return;
        // }

        // Validate message structure before processing
        var data;
        try {
            data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        } catch (e) {
            console.warn('Invalid message format');
            return;
        }

        // Validate message schema
        if (!data || typeof data.action !== 'string') {
            return;
        }

        var allowedActions = ['updateStatus', 'refreshData', 'closeDialog'];
        if (allowedActions.indexOf(data.action) === -1) {
            console.warn('Unknown action:', data.action);
            return;
        }

        // Process validated message safely
        handleMessage(data);
    });

    function handleMessage(data) {
        switch (data.action) {
            case 'updateStatus':
                // Use textContent, never innerHTML
                document.getElementById('status').textContent = String(data.value || '');
                break;
            case 'refreshData':
                loadData();
                break;
            case 'closeDialog':
                closeCurrentDialog();
                break;
        }
    }

    // GOOD: When sending messages, always specify the target origin
    function sendMessageToParent(action, value) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                JSON.stringify({ action: action, value: value }),
                'https://app.company.com' // Explicit target origin, never '*'
            );
        }
    }
})();
```

---

## DOM-Based XSS Prevention

DOM-based XSS occurs when JavaScript reads data from an attacker-controllable
source and writes it to a dangerous sink without sanitization.

```javascript
// BAD: Dangerous sinks with user-controlled data
function displayResults(params) {
    // innerHTML is the most common XSS sink
    document.getElementById('name').innerHTML = params.name;
    // <img src=x onerror=alert(document.cookie)>

    // Other dangerous sinks:
    document.write(params.content);
    element.outerHTML = params.html;
    element.insertAdjacentHTML('beforeend', params.data);
    eval(params.code);
    setTimeout(params.callback, 0);
    new Function(params.expression);
    element.setAttribute('onclick', params.handler);
    window.location = params.redirect;
}

// BAD: Reading from URL hash/search without sanitization
var searchTerm = window.location.hash.substring(1);
document.getElementById('search').innerHTML = 'Results for: ' + searchTerm;
```

```javascript
// GOOD: Use safe DOM manipulation methods
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/ui/message'], (message) => {

    function safeSetText(elementId, text) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // textContent is safe - it never interprets HTML
        element.textContent = String(text);
    }

    function safeCreateElement(tag, text, attributes) {
        const allowedTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'li', 'ul', 'table',
                             'tr', 'td', 'th', 'a', 'img', 'button', 'input', 'label'];

        if (!allowedTags.includes(tag.toLowerCase())) {
            throw new Error('Element type not allowed: ' + tag);
        }

        const element = document.createElement(tag);
        if (text) {
            element.textContent = String(text); // Safe text insertion
        }

        // Allowlist allowed attributes
        const safeAttributes = ['id', 'class', 'name', 'type', 'value',
                                'placeholder', 'disabled', 'readonly'];

        if (attributes) {
            for (const [key, value] of Object.entries(attributes)) {
                if (safeAttributes.includes(key.toLowerCase())) {
                    element.setAttribute(key, String(value));
                }
                // Special handling for href - validate URL
                if (key === 'href') {
                    const safeUrl = sanitizeUrl(value);
                    if (safeUrl) element.setAttribute('href', safeUrl);
                }
            }
        }
        return element;
    }

    function sanitizeUrl(url) {
        if (!url || typeof url !== 'string') return null;
        try {
            const parsed = new URL(url, window.location.origin);
            // Only allow http, https, and relative URLs
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return null; // Blocks javascript:, data:, vbscript:, etc.
            }
            return parsed.href;
        } catch (e) {
            return null;
        }
    }

    // GOOD: Safe URL parameter reading
    function getSafeUrlParam(name) {
        const params = new URLSearchParams(window.location.search);
        const value = params.get(name);
        return value ? String(value) : null;
    }

    function pageInit(scriptContext) {
        const searchTerm = getSafeUrlParam('q');
        if (searchTerm) {
            safeSetText('search-display', 'Results for: ' + searchTerm);
        }
    }

    return { pageInit };
});
```

---

## Clickjacking Prevention

Clickjacking tricks users into clicking on invisible elements overlaid on a
legitimate page, potentially triggering unintended actions.

```javascript
// BAD: No frame protection - page can be embedded in any iframe
function onRequest(context) {
    // An attacker can overlay this page with a transparent iframe
    context.response.write('<html><body><button>Delete Account</button></body></html>');
}
```

```javascript
// GOOD: Multiple layers of clickjacking prevention
function onRequest(context) {
    // Layer 1: X-Frame-Options (legacy browsers)
    context.response.setHeader({
        name: 'X-Frame-Options',
        value: 'DENY' // Or 'SAMEORIGIN' if same-origin framing is needed
    });

    // Layer 2: CSP frame-ancestors (modern browsers, more flexible)
    context.response.setHeader({
        name: 'Content-Security-Policy',
        value: "frame-ancestors 'none'" // Or "'self'" for same-origin
    });

    const nonce = generateNonce();

    // Layer 3: JavaScript frame-buster (defense-in-depth)
    context.response.write(`
        <html>
        <head>
            <style>body { display: none; }</style>
            <script nonce="${nonce}">
                // If we are in an iframe, break out or hide content
                if (window.self !== window.top) {
                    // Option A: Break out of the frame
                    // window.top.location = window.self.location;

                    // Option B: Refuse to display (safer)
                    document.documentElement.innerHTML =
                        '<h1>This page cannot be displayed in a frame.</h1>';
                } else {
                    // Not in a frame - show the page
                    document.body.style.display = 'block';
                }
            </script>
        </head>
        <body>
            <h1>Protected Content</h1>
        </body>
        </html>
    `);
}
```

---

## Local Storage Security

Browser local storage (`localStorage` and `sessionStorage`) is accessible to any
JavaScript running on the same origin, making it unsuitable for sensitive data.

```javascript
// BAD: Storing sensitive data in localStorage
function afterLogin(authToken, userData) {
    localStorage.setItem('authToken', authToken);         // Stolen via XSS
    localStorage.setItem('refreshToken', refreshToken);   // Stolen via XSS
    localStorage.setItem('userSSN', userData.ssn);        // PII in cleartext
    localStorage.setItem('apiKey', userData.apiKey);      // Credentials exposed
    sessionStorage.setItem('creditCard', userData.card);  // Still vulnerable
}

// BAD: Using localStorage for session management
function checkAuth() {
    var token = localStorage.getItem('authToken');
    if (token) {
        // XSS can read this token and send it to an attacker
        fetch('/api/data', { headers: { 'Authorization': 'Bearer ' + token } });
    }
}
```

```javascript
// GOOD: Use HttpOnly cookies for tokens (set by server)
// In a Suitelet that handles authentication:
function setSecureSession(context, sessionData) {
    // HttpOnly cookies cannot be accessed by JavaScript
    // Secure flag ensures HTTPS-only transmission
    // SameSite prevents CSRF
    context.response.setHeader({
        name: 'Set-Cookie',
        value: [
            `sessionId=${sessionData.id}`,
            'HttpOnly',
            'Secure',
            'SameSite=Strict',
            'Path=/',
            `Max-Age=${3600}` // 1 hour
        ].join('; ')
    });
}

// GOOD: If you must use localStorage, only store non-sensitive preferences
function saveUserPreferences(preferences) {
    // Only store UI preferences - never tokens or PII
    var safePrefs = {
        theme: ['light', 'dark'].includes(preferences.theme)
            ? preferences.theme : 'light',
        language: /^[a-z]{2}(-[A-Z]{2})?$/.test(preferences.language)
            ? preferences.language : 'en',
        pageSize: Math.min(Math.max(parseInt(preferences.pageSize) || 25, 10), 100)
    };

    try {
        localStorage.setItem('userPrefs', JSON.stringify(safePrefs));
    } catch (e) {
        // Storage full or disabled - gracefully degrade
        console.warn('Unable to save preferences to localStorage');
    }
}

// GOOD: Always validate data read from localStorage (it can be tampered with)
function loadUserPreferences() {
    try {
        var stored = localStorage.getItem('userPrefs');
        if (!stored) return getDefaultPreferences();

        var parsed = JSON.parse(stored);

        // Validate every field - treat localStorage as untrusted input
        return {
            theme: ['light', 'dark'].includes(parsed.theme) ? parsed.theme : 'light',
            language: /^[a-z]{2}(-[A-Z]{2})?$/.test(parsed.language) ? parsed.language : 'en',
            pageSize: Math.min(Math.max(parseInt(parsed.pageSize) || 25, 10), 100)
        };
    } catch (e) {
        return getDefaultPreferences();
    }
}
```

---

## Third-Party Script Risks

Every third-party script loaded on your page has full access to the DOM, cookies
(unless HttpOnly), localStorage, and can make network requests in your context.

```javascript
// BAD: Loading unvetted third-party scripts
function onRequest(context) {
    context.response.write(`
        <html>
        <head>
            <!-- Unknown analytics script - could do anything -->
            <script src="https://random-analytics.com/tracker.js"></script>
            <!-- Vulnerable version of a library -->
            <script src="https://cdn.example.com/jquery-1.6.0.min.js"></script>
            <!-- Loading from a domain you do not control -->
            <script src="https://free-widgets.xyz/carousel.js"></script>
        </head>
        </html>
    `);
}
```

```javascript
// GOOD: Minimize, verify, and isolate third-party scripts
function onRequest(context) {
    const nonce = generateNonce();

    const csp = [
        "default-src 'none'",
        `script-src 'nonce-${nonce}' https://cdn.company.com`,
        "style-src 'self'",
        "connect-src 'self'",
        "frame-src 'none'",
        "object-src 'none'"
    ].join('; ');

    context.response.setHeader({ name: 'Content-Security-Policy', value: csp });

    context.response.write(`
        <html>
        <head>
            <!-- Self-hosted copy of vetted library with SRI -->
            <script
                nonce="${nonce}"
                src="https://cdn.company.com/vendor/jquery-3.7.1.min.js"
                integrity="sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeF"
                crossorigin="anonymous">
            </script>

            <!-- If third-party analytics is required, load it in a sandboxed iframe -->
            <script nonce="${nonce}">
                // Load analytics in an isolated iframe with minimal permissions
                (function() {
                    var frame = document.createElement('iframe');
                    frame.sandbox = 'allow-scripts'; // No access to parent DOM
                    frame.style.display = 'none';
                    frame.src = 'https://cdn.company.com/analytics-sandbox.html';
                    document.body.appendChild(frame);
                })();
            </script>
        </head>
        </html>
    `);
}
```

---

## Service Worker Security

Service workers can intercept all network requests for a scope. A compromised
or poorly configured service worker can steal data or serve malicious content.

```javascript
// BAD: Overly broad service worker scope
// Registering at root scope captures ALL requests
navigator.serviceWorker.register('/sw.js', { scope: '/' });

// BAD: Caching sensitive responses in service worker
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open('app-cache').then(function(cache) {
            return cache.match(event.request).then(function(response) {
                // Caches authentication responses, tokens, PII
                var fetchPromise = fetch(event.request).then(function(networkResponse) {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
                return response || fetchPromise;
            });
        })
    );
});
```

```javascript
// GOOD: Scoped service worker with selective, safe caching
// Register only for the specific path that needs offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/SuiteScripts/app/sw.js', {
        scope: '/SuiteScripts/app/' // Narrow scope
    }).then(function(registration) {
        console.log('SW registered for scope:', registration.scope);
    }).catch(function(err) {
        console.warn('SW registration failed:', err);
    });
}

// GOOD: Service worker that only caches safe, static resources
var SAFE_CACHE_NAME = 'static-assets-v1';
var CACHEABLE_PATHS = [
    '/SuiteScripts/app/styles.css',
    '/SuiteScripts/app/bundle.js',
    '/SuiteScripts/app/logo.png'
];

// URLs that must NEVER be cached
var NEVER_CACHE_PATTERNS = [
    /\/api\//,
    /\/restlet\./,
    /token/i,
    /auth/i,
    /login/i,
    /session/i,
    /password/i
];

self.addEventListener('fetch', function(event) {
    var url = new URL(event.request.url);

    // Never cache API calls, auth endpoints, or POST requests
    if (event.request.method !== 'GET') return;
    if (NEVER_CACHE_PATTERNS.some(function(pattern) { return pattern.test(url.pathname); })) return;

    // Only cache explicitly approved static resources
    if (!CACHEABLE_PATHS.includes(url.pathname)) return;

    event.respondWith(
        caches.open(SAFE_CACHE_NAME).then(function(cache) {
            return cache.match(event.request).then(function(cachedResponse) {
                if (cachedResponse) return cachedResponse;

                return fetch(event.request).then(function(networkResponse) {
                    if (networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        })
    );
});
```

---

## Quick Reference Checklist

| Practice | Status |
|---|---|
| Set Content-Security-Policy headers on all Suitelets | Required |
| Use nonce-based CSP for inline scripts | Required |
| Include CSRF tokens on all state-changing forms | Required |
| Use SRI hashes for external scripts and styles | Required |
| Validate origin in postMessage handlers (anchored regex) | Required |
| Use textContent instead of innerHTML | Required |
| Set X-Frame-Options and frame-ancestors | Required |
| Never store tokens or PII in localStorage | Required |
| Self-host vetted copies of third-party libraries | Recommended |
| Sandbox third-party scripts in iframes | Recommended |
| Scope service workers narrowly | Recommended |
| Never cache API responses in service workers | Required |

---

## See Also

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Clickjacking Defense Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html)
- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
