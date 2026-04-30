Copyright (c) 2026 Oracle and/or its affiliates.
Licensed under the Universal Permissive License v1.0 as shown at
[The Universal Permissive License (UPL), Version 1.0](https://oss.oracle.com/licenses/upl).

# API & RESTlet Security
> Author: Oracle NetSuite

> Applies to: SuiteScript 2.x RESTlets, Suitelets acting as APIs
> Related OWASP Categories: A01:2021 (Broken Access Control), A07:2021 (Identification
> and Authentication Failures), A10:2021 (Server-Side Request Forgery)

RESTlets are NetSuite's mechanism for creating custom RESTful endpoints. Because they
expose functionality over HTTP, they are a primary attack surface. Every RESTlet must
enforce authentication, validate inputs, and sanitize outputs.

---

## Table of Contents

1. [RESTlet Authentication Enforcement](#restlet-authentication-enforcement)
2. [Request Schema Validation](#request-schema-validation)
3. [Rate Limiting Patterns](#rate-limiting-patterns)
4. [CORS Configuration](#cors-configuration)
5. [Input Size Limits](#input-size-limits)
6. [Response Data Filtering](#response-data-filtering)
7. [API Versioning Security](#api-versioning-security)
8. [Error Response Sanitization](#error-response-sanitization)
9. [SSRF Prevention (A10:2021)](#ssrf-prevention-a102021)
10. [Webhook Signature Verification](#webhook-signature-verification)

---

## RESTlet Authentication Enforcement

RESTlets support three authentication methods: NLAuth, Token-Based Authentication (TBA),
and OAuth 2.0. Always enforce the strongest available method and verify the caller's
identity within the script.

```javascript
// BAD: RESTlet with no additional authorization checks
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record'], (record) => {
    function get(requestParams) {
        // No check on WHO is calling - any authenticated user can access
        const customerId = requestParams.id;
        const rec = record.load({ type: 'customer', id: customerId });
        return {
            name: rec.getValue('companyname'),
            creditLimit: rec.getValue('creditlimit'),
            taxId: rec.getValue('custentity_tax_id') // Exposing sensitive data
        };
    }
    return { get };
});
```

```javascript
// GOOD: RESTlet with layered authentication and authorization
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/runtime', 'N/error', 'N/log'], (record, runtime, error, log) => {

    // Role-based access control map
    const ROLE_PERMISSIONS = Object.freeze({
        3: ['read', 'write', 'delete'],     // Administrator
        1032: ['read', 'write'],             // Custom API Role
        1045: ['read']                       // Read-Only API Role
    });

    function authorizeRequest(requiredPermission) {
        const currentUser = runtime.getCurrentUser();
        const userRole = currentUser.role;
        const permissions = ROLE_PERMISSIONS[userRole];

        if (!permissions || !permissions.includes(requiredPermission)) {
            log.audit('AUTH_FAILURE', {
                userId: currentUser.id,
                role: userRole,
                requiredPermission: requiredPermission,
                ip: 'N/A' // Logged at infrastructure level
            });
            throw error.create({
                name: 'AUTHORIZATION_FAILED',
                message: 'Insufficient permissions for this operation.',
                notifyOff: true
            });
        }

        return currentUser;
    }

    function get(requestParams) {
        const user = authorizeRequest('read');

        // Validate input
        const customerId = parseInt(requestParams.id, 10);
        if (!customerId || customerId <= 0) {
            throw error.create({
                name: 'INVALID_INPUT',
                message: 'A valid customer ID is required.'
            });
        }

        log.audit('API_ACCESS', {
            action: 'GET_CUSTOMER',
            customerId: customerId,
            userId: user.id
        });

        const rec = record.load({ type: 'customer', id: customerId });
        return {
            id: customerId,
            name: rec.getValue('companyname')
            // No sensitive fields exposed
        };
    }

    return { get };
});
```

---

## Request Schema Validation

Validate every field in incoming requests against a strict schema. Never trust
client-provided data.

```javascript
// BAD: No schema validation - accepts anything
function post(requestBody) {
    const rec = record.create({ type: 'customrecord_order' });
    // Blindly setting values from unvalidated input
    Object.keys(requestBody).forEach(key => {
        rec.setValue({ fieldId: key, value: requestBody[key] });
    });
    return { id: rec.save() };
}
```

```javascript
// GOOD: Strict schema validation with type checking
const SCHEMAS = {
    createOrder: {
        customerId: { type: 'integer', required: true, min: 1 },
        items: {
            type: 'array', required: true, minLength: 1, maxLength: 100,
            itemSchema: {
                itemId: { type: 'integer', required: true, min: 1 },
                quantity: { type: 'integer', required: true, min: 1, max: 10000 },
                notes: { type: 'string', required: false, maxLength: 500 }
            }
        },
        shippingMethod: {
            type: 'string', required: true,
            allowedValues: ['standard', 'express', 'overnight']
        },
        poNumber: { type: 'string', required: false, maxLength: 50, pattern: /^[A-Z0-9-]+$/ }
    }
};

function validateField(value, fieldName, rules) {
    const errors = [];

    if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`"${fieldName}" is required.`);
        return errors;
    }

    if (value === undefined || value === null) return errors;

    switch (rules.type) {
        case 'integer':
            if (!Number.isInteger(value)) {
                errors.push(`"${fieldName}" must be an integer.`);
            } else {
                if (rules.min !== undefined && value < rules.min)
                    errors.push(`"${fieldName}" must be >= ${rules.min}.`);
                if (rules.max !== undefined && value > rules.max)
                    errors.push(`"${fieldName}" must be <= ${rules.max}.`);
            }
            break;

        case 'string':
            if (typeof value !== 'string') {
                errors.push(`"${fieldName}" must be a string.`);
            } else {
                if (rules.maxLength && value.length > rules.maxLength)
                    errors.push(`"${fieldName}" exceeds max length of ${rules.maxLength}.`);
                if (rules.pattern && !rules.pattern.test(value))
                    errors.push(`"${fieldName}" contains invalid characters.`);
                if (rules.allowedValues && !rules.allowedValues.includes(value))
                    errors.push(`"${fieldName}" must be one of: ${rules.allowedValues.join(', ')}.`);
            }
            break;

        case 'array':
            if (!Array.isArray(value)) {
                errors.push(`"${fieldName}" must be an array.`);
            } else {
                if (rules.minLength && value.length < rules.minLength)
                    errors.push(`"${fieldName}" must have at least ${rules.minLength} items.`);
                if (rules.maxLength && value.length > rules.maxLength)
                    errors.push(`"${fieldName}" must have at most ${rules.maxLength} items.`);
                if (rules.itemSchema) {
                    value.forEach((item, index) => {
                        errors.push(...validateSchema(item, rules.itemSchema, `${fieldName}[${index}]`));
                    });
                }
            }
            break;
    }
    return errors;
}

function validateSchema(data, schema, prefix) {
    const errors = [];
    const p = prefix ? prefix + '.' : '';

    // Check for unexpected fields
    const allowedKeys = new Set(Object.keys(schema));
    Object.keys(data).forEach(key => {
        if (!allowedKeys.has(key)) {
            errors.push(`Unexpected field: "${p}${key}".`);
        }
    });

    // Validate each defined field
    for (const [fieldName, rules] of Object.entries(schema)) {
        errors.push(...validateField(data[fieldName], `${p}${fieldName}`, rules));
    }

    return errors;
}

function post(requestBody) {
    const validationErrors = validateSchema(requestBody, SCHEMAS.createOrder, '');
    if (validationErrors.length > 0) {
        throw error.create({
            name: 'VALIDATION_ERROR',
            message: JSON.stringify({ errors: validationErrors })
        });
    }

    // Process validated data using only allowlisted fields
    const rec = record.create({ type: 'customrecord_order' });
    rec.setValue({ fieldId: 'custrecord_customer', value: requestBody.customerId });
    rec.setValue({ fieldId: 'custrecord_shipping', value: requestBody.shippingMethod });
    return { id: rec.save() };
}
```

---

## Rate Limiting Patterns

Implement rate limiting to prevent abuse and denial-of-service attacks against
RESTlet endpoints.

```javascript
// BAD: No rate limiting at all
function get(requestParams) {
    // Any caller can make unlimited requests
    return search.create({ type: 'customer', /* ... */ })
        .run().getRange({ start: 0, end: 1000 });
}
```

```javascript
// GOOD: Token bucket rate limiting using a custom record
function checkRateLimit(clientId, maxRequests, windowMinutes) {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (windowMinutes * 60 * 1000));

    // Count recent requests from this client
    const results = search.create({
        type: 'customrecord_api_rate_limit',
        filters: [
            ['custrecord_rl_client_id', 'is', clientId],
            'AND',
            ['custrecord_rl_timestamp', 'onorafter',
                format.format({ value: windowStart, type: format.Type.DATETIME })]
        ],
        columns: [
            search.createColumn({
                name: 'internalid',
                summary: search.Summary.COUNT
            })
        ]
    }).run().getRange({ start: 0, end: 1 });

    const requestCount = parseInt(results[0].getValue({
        name: 'internalid',
        summary: search.Summary.COUNT
    }), 10) || 0;

    if (requestCount >= maxRequests) {
        log.audit('RATE_LIMIT_EXCEEDED', { clientId, requestCount, maxRequests });
        throw error.create({
            name: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit of ${maxRequests} requests per ${windowMinutes} minutes exceeded. Retry later.`
        });
    }

    // Log this request
    const logRec = record.create({ type: 'customrecord_api_rate_limit' });
    logRec.setValue({ fieldId: 'custrecord_rl_client_id', value: clientId });
    logRec.setValue({ fieldId: 'custrecord_rl_timestamp', value: now });
    logRec.save();

    return {
        remaining: maxRequests - requestCount - 1,
        resetAt: new Date(windowStart.getTime() + (windowMinutes * 60 * 1000))
    };
}

function get(requestParams) {
    const user = runtime.getCurrentUser();
    const rateInfo = checkRateLimit(String(user.id), 100, 15);
    // Include rate limit headers in response metadata
    return {
        data: performSearch(requestParams),
        _rateLimit: { remaining: rateInfo.remaining }
    };
}
```

---

## CORS Configuration

Never use wildcard (`*`) for CORS origins on browser-facing endpoints. If a
RESTlet is called from a browser, enforce CORS at the browser-facing boundary
(typically a Suitelet or API gateway) instead of treating the RESTlet itself
like a Suitelet with `context.response`.

```javascript
// BAD: Wildcard CORS on a browser-facing Suitelet or proxy
function onRequest(context) {
    context.response.setHeader({
        name: 'Access-Control-Allow-Origin',
        value: '*' // DANGEROUS: allows any website
    });
    context.response.setHeader({
        name: 'Access-Control-Allow-Credentials',
        value: 'true' // Combined with *, this is extremely dangerous
    });
}

// BAD: Reflecting the Origin header without validation
function onRequest(context) {
    const origin = context.request.headers.origin || context.request.headers.Origin;
    context.response.setHeader({
        name: 'Access-Control-Allow-Origin',
        value: origin // Reflects any origin - same as wildcard
    });
}
```

```javascript
// GOOD: Strict CORS at the browser-facing boundary (Suitelet or edge gateway)
define(['N/log'], (log) => {
    const ALLOWED_ORIGINS = Object.freeze([
        'https://app.company.com',
        'https://portal.company.com',
        'https://admin.company.com'
    ]);

    function setCorsHeaders(request, response) {
        const origin = request.headers.origin || request.headers.Origin;

        if (!origin) return; // Not a CORS request

        if (!ALLOWED_ORIGINS.includes(origin)) {
            log.audit('CORS_REJECTED', { origin: origin });
            return; // Do not set CORS headers - browser will block
        }

        response.setHeader({
            name: 'Access-Control-Allow-Origin',
            value: origin // Only the validated origin
        });
        response.setHeader({
            name: 'Access-Control-Allow-Methods',
            value: 'GET, POST' // Only methods you actually support
        });
        response.setHeader({
            name: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
        });
        response.setHeader({
            name: 'Access-Control-Max-Age',
            value: '3600'
        });
        // Only set Allow-Credentials if absolutely needed
        response.setHeader({
            name: 'Access-Control-Allow-Credentials',
            value: 'true'
        });
    }

    function onRequest(context) {
        setCorsHeaders(context.request, context.response);

        // Handle preflight
        if (context.request.method === 'OPTIONS') {
            context.response.write('');
            return;
        }

        // Process actual request...
    }

    return { onRequest };
});
```

---

## Input Size Limits

Enforce maximum input sizes to prevent memory exhaustion and denial-of-service.

```javascript
// BAD: No input size validation
function post(requestBody) {
    // requestBody could be megabytes of data
    const data = JSON.stringify(requestBody);
    processData(data);
}
```

```javascript
// GOOD: Enforce input size limits
const INPUT_LIMITS = Object.freeze({
    MAX_BODY_SIZE: 1024 * 1024,   // 1 MB
    MAX_STRING_FIELD: 10000,       // 10K characters per field
    MAX_ARRAY_ITEMS: 500,          // 500 items per array
    MAX_NESTING_DEPTH: 5           // 5 levels of nesting
});

function checkPayloadSize(requestBody) {
    const serialized = JSON.stringify(requestBody);
    if (serialized.length > INPUT_LIMITS.MAX_BODY_SIZE) {
        throw error.create({
            name: 'PAYLOAD_TOO_LARGE',
            message: `Request body exceeds maximum size of ${INPUT_LIMITS.MAX_BODY_SIZE} bytes.`
        });
    }
}

function checkNestingDepth(obj, currentDepth) {
    if (currentDepth > INPUT_LIMITS.MAX_NESTING_DEPTH) {
        throw error.create({
            name: 'NESTING_TOO_DEEP',
            message: `Object nesting exceeds maximum depth of ${INPUT_LIMITS.MAX_NESTING_DEPTH}.`
        });
    }
    if (obj && typeof obj === 'object') {
        for (const value of Object.values(obj)) {
            checkNestingDepth(value, currentDepth + 1);
        }
    }
}

function post(requestBody) {
    checkPayloadSize(requestBody);
    checkNestingDepth(requestBody, 0);

    // Proceed with validated input
    const errors = validateSchema(requestBody, SCHEMAS.createOrder, '');
    if (errors.length > 0) {
        throw error.create({
            name: 'VALIDATION_ERROR',
            message: JSON.stringify({ errors })
        });
    }

    return processOrder(requestBody);
}
```

---

## Response Data Filtering

Never return raw database records. Always filter responses to include only the
fields the caller needs and is authorized to see.

```javascript
// BAD: Returning entire records
function get(requestParams) {
    const rec = record.load({ type: 'customer', id: requestParams.id });
    return JSON.parse(JSON.stringify(rec)); // Exposes ALL fields including internal ones
}

// BAD: Returning search results without filtering
function get(requestParams) {
    return search.create({
        type: 'customer',
        columns: ['*'] // All columns
    }).run().getRange({ start: 0, end: 100 });
}
```

```javascript
// GOOD: Explicit field allowlisting per endpoint and role
const RESPONSE_FIELDS = Object.freeze({
    customer: {
        public: ['id', 'companyname', 'email', 'phone'],
        internal: ['id', 'companyname', 'email', 'phone', 'creditlimit', 'balance'],
        admin: ['id', 'companyname', 'email', 'phone', 'creditlimit', 'balance',
                'custentity_account_manager']
    }
});

function filterResponse(recordObj, recordType, accessLevel) {
    const allowedFields = RESPONSE_FIELDS[recordType]?.[accessLevel];
    if (!allowedFields) {
        throw error.create({
            name: 'CONFIG_ERROR',
            message: 'No field mapping for this record type and access level.'
        });
    }

    const filtered = {};
    for (const fieldId of allowedFields) {
        if (fieldId === 'id') {
            filtered.id = recordObj.id;
        } else {
            filtered[fieldId] = recordObj.getValue({ fieldId });
        }
    }
    return filtered;
}

function getAccessLevel(userRole) {
    if (userRole === 3) return 'admin';
    if ([1032, 1045].includes(userRole)) return 'internal';
    return 'public';
}

function get(requestParams) {
    const user = authorizeRequest('read');
    const accessLevel = getAccessLevel(user.role);

    const customerId = parseInt(requestParams.id, 10);
    const rec = record.load({ type: 'customer', id: customerId });

    return filterResponse(rec, 'customer', accessLevel);
}
```

---

## API Versioning Security

Maintain API versions to prevent breaking changes and ensure deprecated endpoints
are properly retired.

```javascript
// BAD: No versioning - breaking changes affect all consumers
function get(requestParams) {
    return getCustomerData(requestParams.id);
}
```

```javascript
// GOOD: Versioned API with deprecation lifecycle
const API_VERSIONS = Object.freeze({
    'v1': { status: 'deprecated', sunsetDate: '2025-06-01', handler: handleV1 },
    'v2': { status: 'active', handler: handleV2 },
    'v3': { status: 'beta', handler: handleV3 }
});

function get(requestParams) {
    const version = requestParams.version || 'v2'; // Default to stable version

    const versionConfig = API_VERSIONS[version];
    if (!versionConfig) {
        throw error.create({
            name: 'INVALID_VERSION',
            message: `API version "${version}" is not supported. Available: ${Object.keys(API_VERSIONS).join(', ')}`
        });
    }

    if (versionConfig.status === 'deprecated') {
        log.audit('DEPRECATED_API_USAGE', {
            version: version,
            sunsetDate: versionConfig.sunsetDate,
            userId: runtime.getCurrentUser().id
        });
        // Include deprecation warning in response
        const result = versionConfig.handler(requestParams);
        result._deprecation = {
            message: `API ${version} is deprecated and will be removed on ${versionConfig.sunsetDate}.`,
            migration: `Use ${getLatestStableVersion()} instead.`
        };
        return result;
    }

    if (versionConfig.status === 'sunset') {
        throw error.create({
            name: 'API_VERSION_SUNSET',
            message: `API ${version} has been retired. Use ${getLatestStableVersion()}.`
        });
    }

    return versionConfig.handler(requestParams);
}

function getLatestStableVersion() {
    const active = Object.entries(API_VERSIONS)
        .filter(([, config]) => config.status === 'active')
        .map(([version]) => version);
    return active[active.length - 1] || 'v2';
}
```

---

## Error Response Sanitization

Never expose internal implementation details, stack traces, or system information
in API error responses.

```javascript
// BAD: Exposing internal details in error responses
function get(requestParams) {
    try {
        return loadCustomerData(requestParams.id);
    } catch (e) {
        return {
            error: true,
            message: e.message,         // May contain SQL or system details
            stack: e.stack,             // Full stack trace
            scriptId: runtime.getCurrentScript().id,
            details: JSON.stringify(e)  // Complete error object
        };
    }
}
```

```javascript
// GOOD: Sanitized error responses with internal logging
function createSafeError(code, publicMessage, internalDetails) {
    // Log full details internally
    log.error('API_ERROR', {
        code: code,
        publicMessage: publicMessage,
        internalDetails: typeof internalDetails === 'object'
            ? JSON.stringify(internalDetails)
            : String(internalDetails),
        userId: runtime.getCurrentUser().id,
        timestamp: new Date().toISOString()
    });

    // Return only safe information to the caller
    return {
        success: false,
        error: {
            code: code,
            message: publicMessage
            // No stack trace, no internal IDs, no system paths
        }
    };
}

const ERROR_MAP = Object.freeze({
    'RCRD_DSNT_EXIST': { code: 'NOT_FOUND', message: 'The requested resource was not found.' },
    'SSS_MISSING_REQD_ARGUMENT': { code: 'BAD_REQUEST', message: 'A required field is missing.' },
    'INSUFFICIENT_PERMISSION': { code: 'FORBIDDEN', message: 'Access denied.' }
});

function get(requestParams) {
    try {
        const user = authorizeRequest('read');
        const id = parseInt(requestParams.id, 10);
        if (!id || id <= 0) {
            return createSafeError('BAD_REQUEST', 'A valid resource ID is required.', requestParams);
        }
        const rec = record.load({ type: 'customer', id: id });
        return { success: true, data: filterResponse(rec, 'customer', getAccessLevel(user.role)) };
    } catch (e) {
        const mapped = ERROR_MAP[e.name];
        if (mapped) {
            return createSafeError(mapped.code, mapped.message, e);
        }
        // Unknown error - generic message only
        return createSafeError('INTERNAL_ERROR', 'An unexpected error occurred.', e);
    }
}
```

---

## SSRF Prevention (A10:2021)

Server-Side Request Forgery (SSRF) occurs when an attacker can make the server
send requests to unintended locations, potentially accessing internal services.

```javascript
// BAD: Using user-supplied URLs directly in server-side HTTP calls
function get(requestParams) {
    const url = requestParams.url; // Attacker sends: http://169.254.169.254/metadata
    const response = https.get({ url: url });
    return JSON.parse(response.body);
}

// BAD: Incomplete URL validation
function fetchUrl(url) {
    if (url.startsWith('https://')) {
        return https.get({ url: url }); // https://evil.com redirects to an internal service
    }
}
```

```javascript
// GOOD: Strict URL validation with allowlist
const ALLOWED_HOSTS = Object.freeze([
    'api.trusted-partner.com',
    'data.approved-vendor.com',
    'services.company.com'
]);

const BLOCKED_IP_RANGES = [
    /^127\./,              // Loopback
    /^10\./,               // Private Class A
    /^172\.(1[6-9]|2\d|3[01])\./, // Private Class B
    /^192\.168\./,         // Private Class C
    /^169\.254\./,         // Link-local / cloud metadata
    /^0\./,                // Current network
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // Carrier-grade NAT
    /^::1$/,               // IPv6 loopback
    /^fc00:/i,             // IPv6 ULA
    /^fe80:/i              // IPv6 link-local
];

function validateExternalUrl(url) {
    if (!url || typeof url !== 'string') {
        throw error.create({ name: 'INVALID_URL', message: 'URL is required.' });
    }

    let parsed;
    try {
        parsed = new URL(url);
    } catch (e) {
        throw error.create({ name: 'INVALID_URL', message: 'Malformed URL.' });
    }

    // Enforce HTTPS
    if (parsed.protocol !== 'https:') {
        throw error.create({
            name: 'INSECURE_PROTOCOL',
            message: 'Only HTTPS URLs are allowed.'
        });
    }

    // Check against allowlist
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
        log.audit('SSRF_BLOCKED', { url: url, hostname: parsed.hostname });
        throw error.create({
            name: 'HOST_NOT_ALLOWED',
            message: 'The target host is not in the approved list.'
        });
    }

    // Block IP addresses in URLs (prevent DNS rebinding)
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(parsed.hostname)) {
        throw error.create({
            name: 'IP_NOT_ALLOWED',
            message: 'Direct IP addresses are not allowed in URLs.'
        });
    }

    // Block special ports
    if (parsed.port && !['443', ''].includes(parsed.port)) {
        throw error.create({
            name: 'PORT_NOT_ALLOWED',
            message: 'Non-standard ports are not allowed.'
        });
    }

    return parsed.href;
}

function fetchExternalData(requestParams) {
    const safeUrl = validateExternalUrl(requestParams.url);
    const response = https.get({
        url: safeUrl,
        headers: { 'User-Agent': 'NetSuite-Integration/1.0' }
    });
    // Never follow redirects to internal hosts (N/https handles this)
    return JSON.parse(response.body);
}
```

---

## Webhook Signature Verification

Always verify webhook signatures to ensure payloads originate from the expected
sender and have not been tampered with.

```javascript
// BAD: Processing webhooks without signature verification
function post(requestBody) {
    // Any attacker can send fake webhook events
    processPaymentEvent(requestBody);
    return { received: true };
}
```

```javascript
// GOOD: Verify webhook signatures using HMAC
function post(requestBody, requestHeaders) {
    // Step 1: Extract the signature from the header
    const signature = requestHeaders['X-Webhook-Signature']
                   || requestHeaders['x-webhook-signature'];

    if (!signature) {
        log.audit('WEBHOOK_NO_SIGNATURE', { headers: Object.keys(requestHeaders) });
        throw error.create({
            name: 'UNAUTHORIZED',
            message: 'Missing webhook signature.'
        });
    }

    // Step 2: Compute expected signature using the shared secret
    const webhookSecret = runtime.getCurrentScript()
        .getParameter({ name: 'custscript_webhook_secret' });

    const secretKey = crypto.createSecretKey({
        guid: webhookSecret,
        encoding: encode.Encoding.UTF_8
    });

    const hmac = crypto.createHmac({
        algorithm: crypto.HashAlg.SHA256,
        key: secretKey
    });

    const payload = typeof requestBody === 'string'
        ? requestBody
        : JSON.stringify(requestBody);

    hmac.update({ input: payload, inputEncoding: encode.Encoding.UTF_8 });
    const expectedSignature = hmac.digest({ outputEncoding: encode.Encoding.HEX });

    // Step 3: Constant-time comparison to prevent timing attacks
    if (!constantTimeCompare(signature, expectedSignature)) {
        log.audit('WEBHOOK_INVALID_SIGNATURE', {
            expected: expectedSignature.substring(0, 8) + '...',
            received: signature.substring(0, 8) + '...'
        });
        throw error.create({
            name: 'UNAUTHORIZED',
            message: 'Invalid webhook signature.'
        });
    }

    // Step 4: Check timestamp to prevent replay attacks
    const timestamp = requestHeaders['X-Webhook-Timestamp'];
    if (timestamp) {
        const eventAge = Date.now() - parseInt(timestamp, 10);
        const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
        if (Math.abs(eventAge) > MAX_AGE_MS) {
            throw error.create({
                name: 'WEBHOOK_EXPIRED',
                message: 'Webhook event is too old or has a future timestamp.'
            });
        }
    }

    log.audit('WEBHOOK_VERIFIED', { eventType: requestBody.type });
    return processWebhookEvent(requestBody);
}

// Constant-time string comparison to prevent timing side-channel attacks
function constantTimeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}
```

---

## Quick Reference Checklist

| Practice | Status |
|---|---|
| Enforce authentication on all RESTlets | Required |
| Implement role-based authorization checks | Required |
| Validate all input against a strict schema | Required |
| Implement rate limiting | Required |
| Use explicit CORS origin allowlist (never `*`) | Required |
| Enforce request payload size limits | Required |
| Filter response fields by access level | Required |
| Sanitize error responses (no stack traces) | Required |
| Validate and allowlist URLs for outbound calls | Required |
| Verify webhook signatures with HMAC | Required |
| Use constant-time comparison for signatures | Required |
| Version APIs and sunset deprecated versions | Recommended |
| Log all API access with user context | Recommended |
| Implement request idempotency keys | Recommended |

---

## See Also

- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [OWASP A10:2021 - SSRF](https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/)
- [NetSuite RESTlet Documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4618456517.html)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
