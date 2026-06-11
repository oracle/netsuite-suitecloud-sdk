Copyright (c) 2026 Oracle and/or its affiliates.
Licensed under the Universal Permissive License v1.0 as shown at [The Universal Permissive License (UPL), Version 1.0](https://oss.oracle.com/licenses/upl).

# Logging & Monitoring (A09:2021 - Security Logging and Monitoring Failures)
> Author: Oracle NetSuite

> OWASP Top 10 Reference: A09:2021 - Security Logging and Monitoring Failures
> Applies to: SuiteScript 2.x (Server-Side and Client-Side)

Without adequate logging and monitoring, breaches go undetected, incident response
is impossible, and forensic analysis fails. Conversely, logging too much or logging
the wrong data creates its own security and compliance risks. This guide covers
what to log, what not to log, and how to do it safely in NetSuite.

---

## Table of Contents

1. [What to Log (Security Events)](#what-to-log-security-events)
2. [What NOT to Log](#what-not-to-log)
3. [N/log Module Best Practices](#nlog-module-best-practices)
4. [Log Injection Prevention](#log-injection-prevention)
5. [Audit Trail Requirements](#audit-trail-requirements)
6. [Log Levels in Production vs Development](#log-levels-in-production-vs-development)
7. [Security Event Monitoring](#security-event-monitoring)
8. [Alerting on Suspicious Patterns](#alerting-on-suspicious-patterns)
9. [Log Retention and Compliance](#log-retention-and-compliance)
10. [SuiteScript Execution Log Patterns](#suitescript-execution-log-patterns)

---

## What to Log (Security Events)

Log events that support intrusion detection, incident response, and compliance
auditing. Each log entry should answer who, what, when, where, and whether the
action succeeded or failed.

```javascript
// BAD: Minimal or no security logging
function processPayment(customerId, amount) {
    try {
        chargeCustomer(customerId, amount);
    } catch (e) {
        // No logging at all - failures go unnoticed
    }
}

// BAD: Logging only success, not failures
function loginAttempt(username) {
    const user = authenticate(username);
    if (user) {
        log.debug('Login', 'User logged in'); // No context, no failure logging
    }
}
```

```javascript
// GOOD: Comprehensive security event logging
const SecurityLogger = {

    /**
     * Log authentication events (login, logout, failures)
     */
    authEvent(eventType, details) {
        const entry = {
            eventType: eventType,
            userId: details.userId || 'unknown',
            role: details.role || 'N/A',
            timestamp: new Date().toISOString(),
            success: details.success,
            reason: details.reason || null,
            source: details.source || 'internal'
        };

        if (details.success) {
            log.audit('AUTH_EVENT', JSON.stringify(entry));
        } else {
            // Failed auth attempts are always audit-level
            log.audit('AUTH_FAILURE', JSON.stringify(entry));
        }
    },

    /**
     * Log access control decisions (authorization checks)
     */
    accessEvent(resource, action, granted, details) {
        log.audit('ACCESS_CONTROL', JSON.stringify({
            resource: resource,
            action: action,
            granted: granted,
            userId: details.userId,
            role: details.role,
            timestamp: new Date().toISOString(),
            reason: details.reason || null
        }));
    },

    /**
     * Log data modification events (create, update, delete)
     */
    dataChange(recordType, recordId, action, details) {
        log.audit('DATA_CHANGE', JSON.stringify({
            recordType: recordType,
            recordId: recordId,
            action: action, // 'create', 'update', 'delete'
            userId: details.userId,
            timestamp: new Date().toISOString(),
            fieldsChanged: details.fieldsChanged || [],
            // Never log the actual values of sensitive fields
            oldValues: sanitizeForLogging(details.oldValues || {}),
            newValues: sanitizeForLogging(details.newValues || {})
        }));
    },

    /**
     * Log security-relevant configuration changes
     */
    configChange(setting, details) {
        log.audit('CONFIG_CHANGE', JSON.stringify({
            setting: setting,
            userId: details.userId,
            role: details.role,
            timestamp: new Date().toISOString(),
            description: details.description
        }));
    },

    /**
     * Log API access for external integrations
     */
    apiAccess(endpoint, method, details) {
        log.audit('API_ACCESS', JSON.stringify({
            endpoint: endpoint,
            method: method,
            userId: details.userId,
            statusCode: details.statusCode,
            timestamp: new Date().toISOString(),
            durationMs: details.durationMs,
            requestSize: details.requestSize
        }));
    }
};

// GOOD: Usage example
function processPayment(customerId, amount) {
    const user = runtime.getCurrentUser();

    SecurityLogger.accessEvent('payment', 'create', true, {
        userId: user.id, role: user.role
    });

    try {
        const result = chargeCustomer(customerId, amount);

        SecurityLogger.dataChange('payment', result.id, 'create', {
            userId: user.id,
            fieldsChanged: ['amount', 'status', 'customerId']
            // Note: amount value is NOT logged for PCI compliance
        });

        return result;
    } catch (e) {
        SecurityLogger.dataChange('payment', null, 'create_failed', {
            userId: user.id,
            fieldsChanged: [],
            description: 'Payment processing failed'
        });
        throw e;
    }
}
```

---

## What Not to Log

Certain data types must never appear in logs due to regulatory requirements
(PCI-DSS, GDPR, HIPAA) and security risks.

```javascript
// BAD: Logging sensitive data
function authenticateUser(credentials) {
    log.debug('Auth attempt', JSON.stringify(credentials));
    // Logs: {"username":"john","password":"MyS3cr3t!","mfaToken":"482910"}

    log.debug('Customer data', JSON.stringify(customer));
    // Logs: {"name":"John","ssn":"123-45-6789","creditCard":"4111111111111111"}
}

// BAD: Logging tokens and secrets
function callExternalApi(apiKey, payload) {
    log.debug('API call', `Key: ${apiKey}, Payload: ${JSON.stringify(payload)}`);
    // Logs the API key in plaintext

    const response = https.post({ url: endpoint, body: payload });
    log.debug('API response', JSON.stringify(response));
    // Response may contain tokens or sensitive data
}

// BAD: Logging request headers (may contain Authorization tokens)
function handleRequest(request) {
    log.debug('Request headers', JSON.stringify(request.headers));
    // Logs: {"Authorization":"Bearer eyJhbGciOi...","Cookie":"session=abc123..."}
}
```

```javascript
// GOOD: Strict rules about what never to log
const NEVER_LOG_FIELDS = new Set([
    'password', 'passwd', 'pass', 'pwd',
    'secret', 'secretkey', 'secret_key',
    'token', 'accesstoken', 'access_token', 'refreshtoken', 'refresh_token',
    'apikey', 'api_key', 'apiSecret', 'api_secret',
    'ssn', 'socialsecuritynumber', 'social_security',
    'creditcard', 'credit_card', 'cardnumber', 'card_number',
    'cvv', 'cvc', 'securitycode', 'security_code',
    'pin', 'taxid', 'tax_id', 'ein',
    'authorization', 'cookie', 'set-cookie',
    'x-api-key', 'x-auth-token',
    'mfatoken', 'mfa_token', 'otp', 'totp'
]);

function sanitizeForLogging(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
        const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');

        if (NEVER_LOG_FIELDS.has(normalizedKey)) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeForLogging(value); // Recursive
        } else if (typeof value === 'string' && value.length > 500) {
            sanitized[key] = value.substring(0, 50) + '...[TRUNCATED]';
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

// GOOD: Safe request logging
function logRequest(request) {
    const safeHeaders = {};
    const allowedHeaders = ['content-type', 'accept', 'user-agent', 'content-length'];

    for (const [key, value] of Object.entries(request.headers || {})) {
        if (allowedHeaders.includes(key.toLowerCase())) {
            safeHeaders[key] = value;
        }
    }

    log.audit('REQUEST', JSON.stringify({
        method: request.method,
        url: request.url,
        headers: safeHeaders, // Only safe headers
        bodySize: request.body ? request.body.length : 0 // Size only, never content
    }));
}

// GOOD: Safe response logging
function logResponse(endpoint, statusCode, durationMs) {
    log.audit('RESPONSE', JSON.stringify({
        endpoint: endpoint,
        statusCode: statusCode,
        durationMs: durationMs
        // Never log response body - it may contain sensitive data
    }));
}
```

---

## N/log Module Best Practices

The NetSuite `N/log` module provides four log levels. Use them correctly to ensure
the right information is available when needed.

```javascript
// BAD: Using log.debug for everything
function processOrder(order) {
    log.debug('Processing', 'Started processing');
    log.debug('Data', JSON.stringify(order));     // Excessive in production
    log.debug('Step 1', 'Validating...');
    log.debug('Step 2', 'Saving...');
    log.debug('Step 3', 'Complete');
    // Fills up the execution log, obscures real issues
}

// BAD: Using log.error for non-errors
function findCustomer(id) {
    const results = search.create({ /* ... */ }).run().getRange({ start: 0, end: 1 });
    if (!results.length) {
        log.error('Not found', `Customer ${id} not found`); // Not an error, expected case
    }
}
```

```javascript
// GOOD: Appropriate use of log levels
/**
 * Log Level Guide:
 *
 * log.debug()    - Detailed diagnostic info for development and debugging
 *                  Examples: variable values, flow tracing, timing measurements
 *                  Production: disabled via Log Level setting on deployment
 *
 * log.audit()    - Business and security events that should always be recorded
 *                  Examples: data changes, access decisions, API calls, user actions
 *                  Production: always enabled
 *
 * log.error()    - Errors that need investigation but the script can recover from
 *                  Examples: failed API calls (will retry), validation failures,
 *                  missing optional data
 *                  Production: always enabled
 *
 * log.emergency() - Critical failures that require immediate attention
 *                   Examples: data corruption detected, security breach indicators,
 *                   system integration complete failure
 *                   Production: always enabled, should trigger alerts
 */

function processOrderSecure(orderId) {
    const startTime = Date.now();
    log.debug('ORDER_PROCESSING_START', `Order ${orderId} - beginning processing`);

    try {
        const order = record.load({ type: 'salesorder', id: orderId });
        log.debug('ORDER_LOADED', `Order ${orderId} loaded successfully`);

        // Business event - always log
        log.audit('ORDER_PROCESSED', JSON.stringify({
            orderId: orderId,
            customerId: order.getValue('entity'),
            total: order.getValue('total'),
            status: order.getValue('status'),
            userId: runtime.getCurrentUser().id,
            durationMs: Date.now() - startTime
        }));

    } catch (e) {
        if (e.name === 'RCRD_DSNT_EXIST') {
            // Expected error - order not found
            log.error('ORDER_NOT_FOUND', `Order ${orderId} does not exist.`);
        } else if (isDataIntegrityIssue(e)) {
            // Critical - possible data corruption
            log.emergency('DATA_INTEGRITY_ALERT', JSON.stringify({
                orderId: orderId,
                error: e.name,
                message: e.message
            }));
        } else {
            log.error('ORDER_PROCESSING_ERROR', JSON.stringify({
                orderId: orderId,
                error: e.name,
                message: e.message
                // Never log e.stack in production
            }));
        }
        throw e;
    }
}
```

---

## Log Injection Prevention

Attackers can inject false log entries or corrupt log formatting by including
special characters in user-controllable input that ends up in logs.

```javascript
// BAD: Logging user input without sanitization
function searchHandler(request) {
    const searchTerm = request.parameters.q;
    log.audit('SEARCH', `User searched for: ${searchTerm}`);
    // Attacker sends: q=test%0A[AUDIT]%20Admin%20logged%20in%20successfully
    // Log shows: "User searched for: test"
    //            "[AUDIT] Admin logged in successfully"
    // This creates a fake log entry
}

// BAD: Logging unsanitized error messages from external systems
function processApiResponse(response) {
    log.error('API Error', response.body);
    // Response body could contain crafted log injection payloads
}
```

```javascript
// GOOD: Sanitize all user-controlled data before logging
function sanitizeLogInput(input) {
    if (input === null || input === undefined) return '[null]';
    if (typeof input !== 'string') return String(input);

    return input
        // Remove newlines (prevents log line injection)
        .replace(/[\r\n]/g, ' ')
        // Remove control characters
        .replace(/[\x00-\x1F\x7F]/g, '')
        // Limit length to prevent log flooding
        .substring(0, 1000);
}

function sanitizeLogObject(obj) {
    if (!obj || typeof obj !== 'object') return sanitizeLogInput(String(obj));

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        const safeKey = sanitizeLogInput(key).substring(0, 100);

        if (typeof value === 'object' && value !== null) {
            sanitized[safeKey] = sanitizeLogObject(value);
        } else {
            sanitized[safeKey] = sanitizeLogInput(String(value));
        }
    }
    return sanitized;
}

// GOOD: Structured logging prevents injection
function searchHandler(request) {
    const searchTerm = request.parameters.q;

    // Structured JSON log - injection-resistant
    log.audit('SEARCH', JSON.stringify({
        action: 'search',
        query: sanitizeLogInput(searchTerm),
        userId: runtime.getCurrentUser().id,
        timestamp: new Date().toISOString()
    }));
}

// GOOD: Safe external error logging
function processApiResponse(endpoint, response) {
    if (response.code >= 400) {
        log.error('API_ERROR', JSON.stringify({
            endpoint: sanitizeLogInput(endpoint),
            statusCode: response.code,
            // Truncate and sanitize response body
            bodyPreview: sanitizeLogInput(
                typeof response.body === 'string'
                    ? response.body.substring(0, 200)
                    : '[non-string body]'
            )
        }));
    }
}
```

---

## Audit Trail Requirements

Maintain complete audit trails for compliance-critical operations and data changes.

```javascript
// BAD: No audit trail for sensitive data changes
function updateCustomerCredit(customerId, newLimit) {
    const rec = record.load({ type: 'customer', id: customerId });
    rec.setValue({ fieldId: 'creditlimit', value: newLimit });
    rec.save();
    // No record of who changed it, what the old value was, or why
}
```

```javascript
// GOOD: Complete audit trail with before/after snapshots
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/runtime', 'N/record'], (log, runtime, record) => {

    // Fields requiring audit trail
    const AUDITED_FIELDS = Object.freeze({
        customer: ['creditlimit', 'terms', 'custentity_risk_rating', 'isinactive'],
        salesorder: ['status', 'total', 'entity', 'custbody_approval_status'],
        employee: ['role', 'isinactive', 'supervisor', 'custentity_access_level']
    });

    function beforeSubmit(context) {
        if (context.type === context.UserEventType.EDIT) {
            const auditedFields = AUDITED_FIELDS[context.newRecord.type];
            if (!auditedFields) return;

            const changes = [];
            for (const fieldId of auditedFields) {
                const oldVal = context.oldRecord.getValue({ fieldId });
                const newVal = context.newRecord.getValue({ fieldId });

                if (String(oldVal) !== String(newVal)) {
                    changes.push({
                        field: fieldId,
                        oldValue: maskIfSensitive(fieldId, String(oldVal)),
                        newValue: maskIfSensitive(fieldId, String(newVal))
                    });
                }
            }

            if (changes.length > 0) {
                const user = runtime.getCurrentUser();

                log.audit('AUDIT_TRAIL', JSON.stringify({
                    recordType: context.newRecord.type,
                    recordId: context.newRecord.id,
                    userId: user.id,
                    userName: user.name,
                    role: user.role,
                    action: 'update',
                    timestamp: new Date().toISOString(),
                    changes: changes
                }));

                // Optionally persist to a custom audit record for long-term retention
                createAuditRecord(context.newRecord.type, context.newRecord.id,
                    user.id, changes);
            }
        }
    }

    function maskIfSensitive(fieldId, value) {
        const sensitiveFields = ['custentity_tax_id', 'custentity_ssn'];
        if (sensitiveFields.includes(fieldId)) {
            return value ? '***' + value.slice(-4) : '[empty]';
        }
        return value;
    }

    function createAuditRecord(recordType, recordId, userId, changes) {
        try {
            const auditRec = record.create({ type: 'customrecord_audit_trail' });
            auditRec.setValue({ fieldId: 'custrecord_audit_record_type', value: recordType });
            auditRec.setValue({ fieldId: 'custrecord_audit_record_id', value: String(recordId) });
            auditRec.setValue({ fieldId: 'custrecord_audit_user', value: userId });
            auditRec.setValue({ fieldId: 'custrecord_audit_changes',
                value: JSON.stringify(changes) });
            auditRec.setValue({ fieldId: 'custrecord_audit_timestamp', value: new Date() });
            auditRec.save();
        } catch (e) {
            log.emergency('AUDIT_RECORD_FAILED', JSON.stringify({
                error: e.name,
                message: e.message,
                recordType: recordType,
                recordId: recordId
            }));
        }
    }

    return { beforeSubmit };
});
```

---

## Log Levels in Production vs Development

Configure log levels per environment to balance visibility with performance and
noise reduction.

```javascript
// BAD: Same verbose logging in all environments
function processData(data) {
    log.debug('Input', JSON.stringify(data));        // Excessive in production
    log.debug('Step 1', 'Starting validation...');
    log.debug('Validation result', 'passed');
    log.debug('Step 2', 'Starting transformation...');
    log.debug('Transform result', JSON.stringify(transformedData));
    log.debug('Step 3', 'Starting save...');
    log.debug('Save result', recordId);
    // 7 debug entries per execution - 10,000 governance units burned quickly
}
```

```javascript
// GOOD: Environment-aware logging with governance budgeting
const LogLevel = Object.freeze({
    NONE: 0,
    EMERGENCY: 1,
    ERROR: 2,
    AUDIT: 3,
    DEBUG: 4
});

function getEffectiveLogLevel() {
    // Read from Script Parameter - configurable per deployment
    const configuredLevel = runtime.getCurrentScript()
        .getParameter({ name: 'custscript_log_level' });

    if (configuredLevel) return parseInt(configuredLevel, 10);

    // Default based on environment detection
    const isProduction = runtime.envType === runtime.EnvType.PRODUCTION;
    return isProduction ? LogLevel.AUDIT : LogLevel.DEBUG;
}

const SecureLog = {
    _level: null,
    _count: 0,
    _maxEntries: 500, // Budget per execution

    _getLevel() {
        if (this._level === null) {
            this._level = getEffectiveLogLevel();
        }
        return this._level;
    },

    _canLog(level) {
        if (this._count >= this._maxEntries) {
            if (this._count === this._maxEntries) {
                log.emergency('LOG_BUDGET_EXCEEDED',
                    `Log entry limit (${this._maxEntries}) reached. Further logging suppressed.`);
                this._count++;
            }
            return false;
        }
        return level <= this._getLevel();
    },

    debug(title, details) {
        if (this._canLog(LogLevel.DEBUG)) {
            this._count++;
            log.debug(sanitizeLogInput(title), typeof details === 'object'
                ? JSON.stringify(sanitizeLogObject(details))
                : sanitizeLogInput(String(details)));
        }
    },

    audit(title, details) {
        if (this._canLog(LogLevel.AUDIT)) {
            this._count++;
            log.audit(sanitizeLogInput(title), typeof details === 'object'
                ? JSON.stringify(sanitizeLogObject(details))
                : sanitizeLogInput(String(details)));
        }
    },

    error(title, details) {
        if (this._canLog(LogLevel.ERROR)) {
            this._count++;
            log.error(sanitizeLogInput(title), typeof details === 'object'
                ? JSON.stringify(sanitizeLogObject(details))
                : sanitizeLogInput(String(details)));
        }
    },

    emergency(title, details) {
        if (this._canLog(LogLevel.EMERGENCY)) {
            this._count++;
            log.emergency(sanitizeLogInput(title), typeof details === 'object'
                ? JSON.stringify(sanitizeLogObject(details))
                : sanitizeLogInput(String(details)));
        }
    }
};

// GOOD: Usage with environment-aware logging
function processData(data) {
    SecureLog.debug('PROCESS_START', { itemCount: data.items.length });

    const result = transform(data);
    SecureLog.debug('TRANSFORM_COMPLETE', { outputCount: result.length });

    const recordId = saveResult(result);
    SecureLog.audit('DATA_PROCESSED', {
        recordId: recordId,
        itemCount: data.items.length,
        userId: runtime.getCurrentUser().id
    });
}
```

---

## Security Event Monitoring

Define patterns that indicate potential security incidents and ensure they trigger
appropriate alerting.

```javascript
// BAD: No monitoring for security patterns
function handleLogin(credentials) {
    const result = authenticate(credentials);
    if (!result.success) {
        // Silent failure - no one is watching
        return { error: 'Login failed' };
    }
}
```

```javascript
// GOOD: Security event detection and monitoring
const SecurityMonitor = {

    THRESHOLDS: Object.freeze({
        FAILED_LOGINS_PER_USER: 5,     // Per 15 minutes
        FAILED_LOGINS_GLOBAL: 50,       // Per 15 minutes
        ACCESS_DENIED_PER_USER: 10,     // Per hour
        UNUSUAL_HOUR_START: 0,          // Midnight
        UNUSUAL_HOUR_END: 5,            // 5 AM
        LARGE_DATA_EXPORT_ROWS: 10000
    }),

    /**
     * Track failed authentication attempts for brute force detection
     */
    trackAuthFailure(userId, reason) {
        log.audit('AUTH_FAILURE_TRACKED', JSON.stringify({
            userId: userId,
            reason: reason,
            timestamp: new Date().toISOString()
        }));

        // Check for brute force pattern
        const recentFailures = this._countRecentEvents(
            'customrecord_security_events',
            'auth_failure',
            userId,
            15 // minutes
        );

        if (recentFailures >= this.THRESHOLDS.FAILED_LOGINS_PER_USER) {
            this.raiseAlert('BRUTE_FORCE_SUSPECTED', {
                userId: userId,
                failureCount: recentFailures,
                windowMinutes: 15
            });
        }
    },

    /**
     * Detect unusual access patterns
     */
    checkAccessPattern(userId, action) {
        const now = new Date();
        const hour = now.getHours();

        // Check for activity during unusual hours
        if (hour >= this.THRESHOLDS.UNUSUAL_HOUR_START &&
            hour < this.THRESHOLDS.UNUSUAL_HOUR_END) {
            log.audit('UNUSUAL_HOUR_ACCESS', JSON.stringify({
                userId: userId,
                action: action,
                hour: hour,
                timestamp: now.toISOString()
            }));
        }
    },

    /**
     * Detect large data exports (data exfiltration indicator)
     */
    trackDataExport(userId, recordType, rowCount) {
        if (rowCount >= this.THRESHOLDS.LARGE_DATA_EXPORT_ROWS) {
            this.raiseAlert('LARGE_DATA_EXPORT', {
                userId: userId,
                recordType: recordType,
                rowCount: rowCount
            });
        }
    },

    /**
     * Raise a security alert
     */
    raiseAlert(alertType, details) {
        // Log at emergency level for immediate visibility
        log.emergency('SECURITY_ALERT', JSON.stringify({
            alertType: alertType,
            details: details,
            timestamp: new Date().toISOString()
        }));

        // Create an alert record for the security team
        try {
            const alertRec = record.create({ type: 'customrecord_security_alert' });
            alertRec.setValue({ fieldId: 'custrecord_alert_type', value: alertType });
            alertRec.setValue({ fieldId: 'custrecord_alert_details',
                value: JSON.stringify(details) });
            alertRec.setValue({ fieldId: 'custrecord_alert_status', value: 'open' });
            alertRec.setValue({ fieldId: 'custrecord_alert_timestamp', value: new Date() });
            alertRec.save();
        } catch (e) {
            log.emergency('ALERT_CREATION_FAILED', JSON.stringify({
                alertType: alertType,
                error: e.message
            }));
        }
    },

    _countRecentEvents(recordType, eventType, userId, windowMinutes) {
        const windowStart = new Date();
        windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

        const results = search.create({
            type: recordType,
            filters: [
                ['custrecord_event_type', 'is', eventType],
                'AND',
                ['custrecord_event_user', 'is', userId],
                'AND',
                ['custrecord_event_timestamp', 'onorafter',
                    format.format({ value: windowStart, type: format.Type.DATETIME })]
            ],
            columns: [search.createColumn({
                name: 'internalid', summary: search.Summary.COUNT
            })]
        }).run().getRange({ start: 0, end: 1 });

        return parseInt(results[0]?.getValue({
            name: 'internalid', summary: search.Summary.COUNT
        }) || '0', 10);
    }
};
```

---

## Alerting on Suspicious Patterns

Configure automated alerts for security-critical patterns that require human review.

```javascript
// GOOD: Scheduled script for security pattern detection
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/log', 'N/email', 'N/runtime', 'N/format'],
    (search, log, email, runtime, format) => {

    const ALERT_PATTERNS = [
        {
            name: 'EXCESSIVE_RECORD_DELETIONS',
            description: 'User deleted more than 50 records in the past hour',
            check: function(windowStart) {
                return search.create({
                    type: 'customrecord_audit_trail',
                    filters: [
                        ['custrecord_audit_action', 'is', 'delete'],
                        'AND',
                        ['custrecord_audit_timestamp', 'onorafter',
                            format.format({ value: windowStart, type: format.Type.DATETIME })]
                    ],
                    columns: [
                        'custrecord_audit_user',
                        search.createColumn({
                            name: 'internalid',
                            summary: search.Summary.COUNT
                        })
                    ]
                }).run().getRange({ start: 0, end: 100 })
                .filter(r => parseInt(r.getValue({
                    name: 'internalid', summary: search.Summary.COUNT
                })) > 50);
            }
        },
        {
            name: 'PRIVILEGE_ESCALATION_ATTEMPT',
            description: 'Multiple access denied events for the same user',
            check: function(windowStart) {
                return search.create({
                    type: 'customrecord_security_events',
                    filters: [
                        ['custrecord_event_type', 'is', 'access_denied'],
                        'AND',
                        ['custrecord_event_timestamp', 'onorafter',
                            format.format({ value: windowStart, type: format.Type.DATETIME })]
                    ],
                    columns: [
                        'custrecord_event_user',
                        search.createColumn({
                            name: 'internalid',
                            summary: search.Summary.COUNT
                        })
                    ]
                }).run().getRange({ start: 0, end: 100 })
                .filter(r => parseInt(r.getValue({
                    name: 'internalid', summary: search.Summary.COUNT
                })) > 10);
            }
        }
    ];

    function execute(context) {
        const windowStart = new Date();
        windowStart.setHours(windowStart.getHours() - 1);

        for (const pattern of ALERT_PATTERNS) {
            try {
                const matches = pattern.check(windowStart);
                if (matches.length > 0) {
                    log.emergency('SECURITY_PATTERN_DETECTED', JSON.stringify({
                        pattern: pattern.name,
                        description: pattern.description,
                        matchCount: matches.length
                    }));

                    // Notify security team
                    const securityTeamEmail = runtime.getCurrentScript()
                        .getParameter({ name: 'custscript_security_team_email' });

                    email.send({
                        author: runtime.getCurrentUser().id,
                        recipients: securityTeamEmail,
                        subject: `[SECURITY ALERT] ${pattern.name}`,
                        body: `Pattern: ${pattern.description}\n` +
                              `Matches: ${matches.length}\n` +
                              `Detection window: Past 1 hour\n` +
                              `Timestamp: ${new Date().toISOString()}`
                    });
                }
            } catch (e) {
                log.error('PATTERN_CHECK_FAILED', JSON.stringify({
                    pattern: pattern.name,
                    error: e.message
                }));
            }
        }
    }

    return { execute };
});
```

---

## Log Retention and Compliance

Different data types have different retention requirements. Configure retention
policies that meet compliance obligations without accumulating unnecessary data.

```javascript
// GOOD: Log retention management
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @description Weekly cleanup of aged log records per retention policy
 */
define(['N/search', 'N/record', 'N/log', 'N/format'], (search, record, log, format) => {

    // Retention policies in days
    const RETENTION_POLICIES = Object.freeze({
        'customrecord_debug_log': 30,          // Debug logs: 30 days
        'customrecord_api_rate_limit': 7,      // Rate limit counters: 7 days
        'customrecord_security_events': 365,   // Security events: 1 year
        'customrecord_audit_trail': 2555,      // Audit trail: 7 years (SOX/PCI)
        'customrecord_security_alert': 365     // Security alerts: 1 year
    });

    function execute(context) {
        for (const [recordType, retentionDays] of Object.entries(RETENTION_POLICIES)) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - retentionDays);

            log.audit('RETENTION_CLEANUP_START', JSON.stringify({
                recordType: recordType,
                retentionDays: retentionDays,
                cutoffDate: cutoff.toISOString()
            }));

            let deletedCount = 0;
            try {
                while (true) {
                    const results = search.create({
                        type: recordType,
                        filters: [
                            ['created', 'before',
                                format.format({ value: cutoff, type: format.Type.DATE })]
                        ],
                        columns: ['internalid']
                    }).run().getRange({ start: 0, end: 1000 });

                    if (!results.length) {
                        break;
                    }

                    for (const result of results) {
                        record.delete({ type: recordType, id: result.id });
                        deletedCount++;
                    }
                }
            } catch (e) {
                log.error('RETENTION_CLEANUP_ERROR', JSON.stringify({
                    recordType: recordType,
                    error: e.message,
                    deletedBeforeError: deletedCount
                }));
            }

            log.audit('RETENTION_CLEANUP_COMPLETE', JSON.stringify({
                recordType: recordType,
                deletedCount: deletedCount
            }));
        }
    }

    return { execute };
});
```

---

## SuiteScript Execution Log Patterns

Patterns for effective logging within the constraints of SuiteScript execution
log limits and governance.

```javascript
// BAD: Logging inside loops - burns governance and fills logs
function processItems(items) {
    items.forEach((item, index) => {
        log.debug(`Processing item ${index}`, JSON.stringify(item));
        // 1000 items = 1000 log entries = governance exhaustion
    });
}

// BAD: Not tracking governance usage
function longRunningProcess() {
    while (hasMoreWork()) {
        doWork();
        log.debug('Progress', 'Did some work'); // No governance awareness
    }
}
```

```javascript
// GOOD: Batched logging to conserve governance
function processItemsEfficient(items) {
    const batchSize = 100;
    const errors = [];
    let processedCount = 0;

    for (let i = 0; i < items.length; i++) {
        try {
            processItem(items[i]);
            processedCount++;
        } catch (e) {
            errors.push({ index: i, id: items[i].id, error: e.name });
        }

        // Log progress in batches, not per-item
        if ((i + 1) % batchSize === 0 || i === items.length - 1) {
            log.debug('BATCH_PROGRESS', JSON.stringify({
                processed: processedCount,
                errors: errors.length,
                total: items.length,
                percentComplete: Math.round(((i + 1) / items.length) * 100)
            }));
        }
    }

    // Summary log at the end
    log.audit('PROCESSING_COMPLETE', JSON.stringify({
        totalItems: items.length,
        successCount: processedCount,
        errorCount: errors.length,
        errors: errors.slice(0, 20) // Only first 20 errors to conserve space
    }));

    return { processedCount, errors };
}

// GOOD: Governance-aware logging
function governanceAwareProcess() {
    const script = runtime.getCurrentScript();
    const GOVERNANCE_THRESHOLD = 200; // Leave buffer for cleanup

    while (hasMoreWork()) {
        const remaining = script.getRemainingUsage();

        if (remaining < GOVERNANCE_THRESHOLD) {
            log.audit('GOVERNANCE_LIMIT', JSON.stringify({
                remainingUsage: remaining,
                threshold: GOVERNANCE_THRESHOLD,
                action: 'yielding'
            }));
            // Yield or reschedule
            break;
        }

        doWork();
    }
}

// GOOD: Structured execution context logging
function createExecutionContext(scriptType, operation) {
    const script = runtime.getCurrentScript();
    const user = runtime.getCurrentUser();
    const startTime = Date.now();

    const context = {
        scriptId: script.id,
        deploymentId: script.deploymentId,
        scriptType: scriptType,
        operation: operation,
        userId: user.id,
        role: user.role,
        startTime: new Date().toISOString(),
        startUsage: script.getRemainingUsage()
    };

    log.audit('EXECUTION_START', JSON.stringify(context));

    return {
        complete(result) {
            log.audit('EXECUTION_COMPLETE', JSON.stringify({
                ...context,
                endTime: new Date().toISOString(),
                durationMs: Date.now() - startTime,
                endUsage: script.getRemainingUsage(),
                governanceUsed: context.startUsage - script.getRemainingUsage(),
                result: typeof result === 'object'
                    ? sanitizeForLogging(result)
                    : String(result)
            }));
        },

        fail(err) {
            log.error('EXECUTION_FAILED', JSON.stringify({
                ...context,
                endTime: new Date().toISOString(),
                durationMs: Date.now() - startTime,
                error: err.name,
                message: err.message
            }));
        }
    };
}

// Usage:
function execute(context) {
    const execCtx = createExecutionContext('ScheduledScript', 'syncCustomers');
    try {
        const result = syncCustomers();
        execCtx.complete(result);
    } catch (e) {
        execCtx.fail(e);
        throw e;
    }
}
```

---

## Quick Reference Checklist

| Practice | Status |
|---|---|
| Log all authentication events (success and failure) | Required |
| Log all authorization decisions | Required |
| Log data modifications with before/after values | Required |
| Never log passwords, tokens, or API keys | Required |
| Never log PII (SSN, credit cards, full names in some contexts) | Required |
| Sanitize user input before logging (prevent injection) | Required |
| Use structured JSON log format | Required |
| Use appropriate log levels per environment | Required |
| Monitor for brute force and privilege escalation patterns | Required |
| Configure alerting for security anomalies | Required |
| Define and enforce log retention policies | Required |
| Batch log entries to conserve governance | Recommended |
| Track governance usage and log when yielding | Recommended |
| Create execution context logs (start/complete/fail) | Recommended |

---

## See Also

- [OWASP A09:2021 - Security Logging and Monitoring Failures](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [NetSuite N/log Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4574548135.html)
- [PCI DSS Requirement 10 - Track and Monitor All Access](https://www.pcisecuritystandards.org/)
- [CWE-778: Insufficient Logging](https://cwe.mitre.org/data/definitions/778.html)
