Copyright (c) 2026 Oracle and/or its affiliates.
Licensed under the Universal Permissive License v1.0 as shown at
[The Universal Permissive License (UPL), Version 1.0](https://oss.oracle.com/licenses/upl).

# Security Misconfiguration (A05:2021)
> Author: Oracle NetSuite

## Overview

Security misconfiguration is the most commonly seen issue in the OWASP Top 10. It occurs
when security settings are defined, implemented, or maintained incorrectly. This includes
overly verbose error messages, debug mode left enabled, missing security headers, default
credentials, unnecessary features, and improper deployment configurations.

In NetSuite/SuiteScript, misconfiguration risks span script deployments, SDF project
settings, logging levels, error handling, and environment-specific values.

**OWASP Reference:** [A05:2021 - Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/).

---

## 1. Verbose Error Messages Exposing Internals

Detailed error messages help developers debug but provide attackers with valuable
information about the system's internals, stack structure, module versions, and data schemas.

### Example 1: Stack Traces in Responses

```javascript
// ===== BAD: Exposing full error details to the client =====
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record'], (record) => {
    const onRequest = (context) => {
        try {
            const rec = record.load({
                type: record.Type.SALES_ORDER,
                id: context.request.parameters.id
            });
            context.response.write(JSON.stringify({ success: true }));
        } catch (e) {
            // VULNERABLE: Exposes internal error details to the end user
            // This reveals: script file paths, line numbers, record structure,
            // NetSuite internal error codes, and stack traces
            context.response.write(JSON.stringify({
                error: e.message,
                stack: e.stack,
                name: e.name,
                type: e.type,
                id: e.id,
                code: e.code
            }));
        }
    };

    return { onRequest };
});
```

```javascript
// ===== GOOD: Generic client message, detailed server-side logging =====
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/log'], (record, log) => {

    /**
     * Generate a unique error reference ID for correlation between
     * the client-visible message and the server log entry.
     */
    const generateErrorRef = () => {
        return 'ERR-' + Date.now().toString(36).toUpperCase();
    };

    const onRequest = (context) => {
        try {
            const rec = record.load({
                type: record.Type.SALES_ORDER,
                id: context.request.parameters.id
            });
            context.response.write(JSON.stringify({ success: true }));
        } catch (e) {
            const errorRef = generateErrorRef();

            // Log full details server-side for debugging
            log.error({
                title: `Error [${errorRef}]`,
                details: {
                    message: e.message,
                    code: e.code,
                    stack: e.stack,
                    requestParams: context.request.parameters
                }
            });

            // Return only a generic message and reference ID to the client
            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json; charset=utf-8'
            });
            context.response.write(JSON.stringify({
                error: 'An unexpected error occurred.',
                reference: errorRef,
                support: 'Please contact support with this reference ID.'
            }));
        }
    };

    return { onRequest };
});
```

---

## 2. Debug Mode Left Enabled in Production

Debug logging and development features must be disabled before production deployment.

### Example 2: Debug Logging Exposure

```javascript
// ===== BAD: Debug logging that exposes sensitive data in production =====
define(['N/log', 'N/https', 'N/runtime'], (log, https, runtime) => {
    const execute = (context) => {
        const script = runtime.getCurrentScript();
        const apiKey = script.getParameter({ name: 'custscript_api_key' });

        // VULNERABLE: Logging credentials and full request/response bodies
        // in production. Execution logs are visible to anyone with script access.
        log.debug('API Key', apiKey);

        const payload = { customerId: 123, ssn: '123-45-6789', salary: 85000 };
        log.debug('Request Payload', JSON.stringify(payload));

        const response = https.post({
            url: 'https://api.vendor.com/sync',
            body: JSON.stringify(payload),
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        log.debug('Full Response', response.body);
        log.debug('Response Headers', JSON.stringify(response.headers));
    };
});
```

```javascript
// ===== GOOD: Environment-aware logging with data masking =====
define(['N/log', 'N/https', 'N/runtime'], (log, https, runtime) => {

    /**
     * Masks sensitive fields in objects before logging.
     */
    const maskSensitiveData = (obj) => {
        const sensitiveFields = ['ssn', 'password', 'apiKey', 'token', 'secret', 'salary'];
        const masked = { ...obj };
        for (const key of Object.keys(masked)) {
            if (sensitiveFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
                masked[key] = '***REDACTED***';
            }
        }
        return masked;
    };

    const execute = (context) => {
        const script = runtime.getCurrentScript();
        const apiKey = script.getParameter({ name: 'custscript_api_key' });
        const environment = runtime.envType;

        // NEVER log credentials, even in development
        log.audit('Integration Started', {
            environment: environment,
            hasApiKey: !!apiKey  // Log existence, not value
        });

        const payload = { customerId: 123, ssn: '123-45-6789', salary: 85000 };

        // Only log detailed payloads in sandbox, and always mask sensitive fields
        if (environment === runtime.EnvType.SANDBOX) {
            log.debug('Request Payload (masked)', JSON.stringify(maskSensitiveData(payload)));
        }

        const response = https.post({
            url: 'https://api.vendor.com/sync',
            body: JSON.stringify(payload),
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        // Log response status, not full body
        log.audit('Integration Response', {
            statusCode: response.code,
            contentLength: response.body ? response.body.length : 0
        });
    };

    return { execute };
});
```

---

## 3. SuiteScript Log Levels in Production

NetSuite script deployments have a configurable log level. Using DEBUG in production
generates excessive logs and may expose sensitive information.

### Example 3: Deployment Log Level Configuration

```xml
<!-- ===== BAD: DEBUG log level in production deployment ===== -->
<scriptdeployment scriptid="customdeploy_payment_processor">
    <status>RELEASED</status>
    <loglevel>DEBUG</loglevel>
    <!-- DEBUG captures ALL log.debug() calls, which may contain sensitive data -->
    <!-- Also increases governance usage and fills execution logs -->
</scriptdeployment>
```

```xml
<!-- ===== GOOD: AUDIT or ERROR log level in production ===== -->
<scriptdeployment scriptid="customdeploy_payment_processor">
    <status>RELEASED</status>
    <loglevel>AUDIT</loglevel>
    <!-- AUDIT captures log.audit() and log.error() only -->
    <!-- Provides security-relevant events without debug noise -->
    <!-- Use ERROR for maximum restriction in stable scripts -->
</scriptdeployment>
```

```javascript
// ===== GOOD: Use appropriate log levels in code =====
define(['N/log', 'N/runtime'], (log, runtime) => {
    const execute = (context) => {
        // DEBUG: Developer information, filtered out in production
        log.debug('Processing', 'Starting batch process');

        // AUDIT: Security-relevant events, always captured in production
        log.audit('Payment Processed', {
            transactionId: 'TXN-12345',
            amount: 150.00,
            user: runtime.getCurrentUser().id
        });

        // ERROR: Failures that need attention
        log.error('Payment Failed', {
            transactionId: 'TXN-12346',
            errorCode: 'INSUFFICIENT_FUNDS'
        });

        // EMERGENCY: Critical system failures
        log.emergency('System Failure', 'Payment gateway unreachable');
    };
});
```

> **Log Level Hierarchy (most to least verbose):**
> `DEBUG` > `AUDIT` > `ERROR` > `EMERGENCY`
>
> | Level       | Production Use Case                                  |
> |-------------|------------------------------------------------------|
> | DEBUG       | Never in production. Development/sandbox only.       |
> | AUDIT       | Default for production. Security events, milestones. |
> | ERROR       | Stable scripts. Only failures logged.                |
> | EMERGENCY   | Critical alerts requiring immediate attention.       |

---

## 4. Missing Security Headers

HTTP responses from Suitelets should include security headers that instruct the browser
to enable protections.

### Example 4: Security Header Configuration

```javascript
// ===== BAD: No security headers =====
define([], () => {
    const onRequest = (context) => {
        // Response sent with no security headers
        // Browser applies default (minimal) protections
        context.response.write('<html><body>Dashboard</body></html>');
    };
});
```

```javascript
// ===== GOOD: Comprehensive security headers =====
define([], () => {

    const setSecurityHeaders = (response) => {
        // Prevent MIME type sniffing
        response.setHeader({
            name: 'X-Content-Type-Options',
            value: 'nosniff'
        });

        // Prevent clickjacking via framing
        response.setHeader({
            name: 'X-Frame-Options',
            value: 'SAMEORIGIN'
        });

        // Control referrer information leakage
        response.setHeader({
            name: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
        });

        // Content Security Policy
        response.setHeader({
            name: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'self'"
        });

        // Prevent caching of sensitive pages
        response.setHeader({
            name: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, private'
        });

        // Enforce HTTPS
        response.setHeader({
            name: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
        });

        // Opt out of FLoC/Topics tracking
        response.setHeader({
            name: 'Permissions-Policy',
            value: 'interest-cohort=()'
        });
    };

    const onRequest = (context) => {
        setSecurityHeaders(context.response);
        context.response.write('<html><body>Dashboard</body></html>');
    };

    return { onRequest };
});
```

> **Security Header Reference:**
> | Header                        | Purpose                                           |
> |-------------------------------|---------------------------------------------------|
> | `X-Content-Type-Options`      | Prevents MIME type sniffing attacks                |
> | `X-Frame-Options`             | Prevents clickjacking via iframe embedding         |
> | `Content-Security-Policy`     | Controls allowed resource sources                  |
> | `Strict-Transport-Security`   | Enforces HTTPS connections                         |
> | `Referrer-Policy`             | Controls referrer header information               |
> | `Cache-Control`               | Prevents caching of sensitive data                 |
> | `Permissions-Policy`          | Controls browser feature access                    |

---

## 5. Default Credentials and Configurations

Default or placeholder credentials left in deployed code are a common entry point
for attackers.

### Example 5: Default Credentials

```javascript
// ===== BAD: Default/fallback credentials in code =====
define(['N/https', 'N/runtime'], (https, runtime) => {
    const execute = () => {
        const script = runtime.getCurrentScript();
        const apiKey = script.getParameter({ name: 'custscript_api_key' });

        // VULNERABLE: Falls back to a real API key if parameter is not set
        // This key will be committed to version control and visible to all developers
        const effectiveKey = apiKey || 'sk-default-dev-key-abc123';

        https.post({
            url: 'https://api.vendor.com/data',
            headers: { 'Authorization': `Bearer ${effectiveKey}` },
            body: '{}'
        });
    };
});
```

```javascript
// ===== GOOD: Fail fast if credentials are not configured =====
define(['N/https', 'N/runtime', 'N/log', 'N/error'], (https, runtime, log, error) => {
    const execute = () => {
        const script = runtime.getCurrentScript();
        const apiKey = script.getParameter({ name: 'custscript_api_key' });

        // SAFE: Refuse to proceed without proper configuration
        if (!apiKey) {
            const errMsg = 'API key not configured. Set custscript_api_key in script deployment.';
            log.error('Configuration Error', errMsg);
            throw error.create({
                name: 'MISSING_CONFIGURATION',
                message: errMsg,
                notifyOff: false  // Trigger email notification to admins
            });
        }

        // Additional validation: check key format matches expected pattern
        if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
            log.error('Configuration Error', 'API key does not match expected format.');
            throw error.create({
                name: 'INVALID_CONFIGURATION',
                message: 'API key format is invalid. Verify the configured value.'
            });
        }

        https.post({
            url: 'https://api.vendor.com/data',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            body: '{}'
        });
    };

    return { execute };
});
```

---

## 6. Unnecessary Features Enabled

Scripts should not include development utilities, test endpoints, or diagnostic
functions in production deployments.

### Example 6: Test/Debug Endpoints in Production

```javascript
// ===== BAD: Debug and test endpoints left in production Suitelet =====
define(['N/record', 'N/query', 'N/runtime'], (record, query, runtime) => {
    const onRequest = (context) => {
        const action = context.request.parameters.action;

        if (action === 'run_query') {
            // EXTREMELY VULNERABLE: Arbitrary SuiteQL execution from URL parameter
            const sql = context.request.parameters.sql;
            const results = query.runSuiteQL({ query: sql });
            context.response.write(JSON.stringify(results.asMappedResults()));
            return;
        }

        if (action === 'debug_env') {
            // VULNERABLE: Exposes system internals
            context.response.write(JSON.stringify({
                user: runtime.getCurrentUser(),
                envType: runtime.envType,
                accountId: runtime.accountId,
                version: runtime.version
            }));
            return;
        }

        if (action === 'test_email') {
            // Left over from development; sends emails from production.
        }

        // ... normal application logic
    };
});
```

```javascript
// ===== GOOD: Clean production code without debug endpoints =====
define(['N/record', 'N/runtime', 'N/log'], (record, runtime, log) => {

    const VALID_ACTIONS = ['view', 'list', 'export'];

    const onRequest = (context) => {
        const action = context.request.parameters.action;

        // Only allow explicitly defined production actions
        if (!VALID_ACTIONS.includes(action)) {
            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json; charset=utf-8'
            });
            context.response.write(JSON.stringify({ error: 'Invalid action.' }));
            return;
        }

        if (action === 'view') {
            // ... view logic
        }

        if (action === 'list') {
            // ... list logic
        }

        if (action === 'export') {
            // ... export logic
        }
    };

    return { onRequest };
});
```

---

## 7. Script Deployment Status Management

Script deployments have lifecycle states. Improper status management can leave
test scripts active in production.

### Example 7: Deployment Status

```xml
<!-- ===== BAD: Test deployment released in production ===== -->
<scriptdeployment scriptid="customdeploy_test_data_generator">
    <status>RELEASED</status>
    <title>TEST - Data Generator (DO NOT USE IN PROD)</title>
    <!-- Despite the title warning, this is active and accessible -->
    <allroles>T</allroles>
</scriptdeployment>
```

```xml
<!-- ===== GOOD: Test deployments set to TESTING, production properly managed ===== -->

<!-- Test deployment: status TESTING, restricted access -->
<scriptdeployment scriptid="customdeploy_test_data_generator">
    <status>TESTING</status>
    <title>TEST - Data Generator</title>
    <allroles>F</allroles>
    <roles>
        <role>customrole_developer</role>
    </roles>
</scriptdeployment>

<!-- Production deployment: reviewed, documented, restricted -->
<scriptdeployment scriptid="customdeploy_order_processor">
    <status>RELEASED</status>
    <title>Order Processor</title>
    <loglevel>AUDIT</loglevel>
    <allroles>F</allroles>
    <roles>
        <role>customrole_order_management</role>
    </roles>
</scriptdeployment>
```

---

## 8. SDF manifest.xml Security Settings

The SDF manifest controls which objects are included in a project and how they
are deployed. Misconfiguration can lead to unintended changes in production.

### Example 8: Manifest Security

```xml
<!-- ===== BAD: Overly broad manifest that deploys everything ===== -->
<!-- File: manifest.xml -->
<manifest projecttype="ACCOUNTCUSTOMIZATION">
    <projectname>MyProject</projectname>
    <frameworkversion>1.0</frameworkversion>
    <dependencies>
        <features>
            <feature required="true">CUSTOMCODE</feature>
            <feature required="true">SERVERSIDESCRIPTING</feature>
            <!-- Including features that are not needed increases attack surface -->
            <feature required="true">ADVANCEDPRINTING</feature>
            <feature required="true">WEBSERVICES</feature>
            <feature required="true">OAUTH2</feature>
        </features>
    </dependencies>
</manifest>
```

```xml
<!-- ===== GOOD: Minimal manifest with only required features ===== -->
<!-- File: manifest.xml -->
<manifest projecttype="ACCOUNTCUSTOMIZATION">
    <projectname>MyProject</projectname>
    <frameworkversion>1.0</frameworkversion>
    <dependencies>
        <features>
            <!-- Only include features actually used by the project -->
            <feature required="true">CUSTOMCODE</feature>
            <feature required="true">SERVERSIDESCRIPTING</feature>
        </features>
    </dependencies>
    <!-- Explicitly list objects to deploy; no wildcards or catch-alls -->
    <objects>
        <object>customscript_order_processor</object>
        <object>customdeploy_order_processor</object>
        <object>customrecord_order_config</object>
    </objects>
</manifest>
```

---

## 9. Hardcoded URLs and Environment-Specific Values

URLs, account IDs, and environment-specific values hardcoded in scripts can break
deployments when moving between sandbox and production and may expose internal
infrastructure.

### Example 9: Hardcoded Environment Values

```javascript
// ===== BAD: Hardcoded URLs and account-specific values =====
define(['N/https'], (https) => {
    const execute = () => {
        // VULNERABLE: Hardcoded production URL will fail in sandbox
        // Also exposes internal service endpoints in source code
        const response = https.post({
            url: 'https://prod-internal.mycompany.com:8443/api/v2/sync',
            body: '{}',
            headers: {
                'X-Account-Id': '1234567_SB1',  // Hardcoded account ID
                'Host': 'prod-internal.mycompany.com'
            }
        });
    };
});
```

```javascript
// ===== GOOD: Environment-aware configuration =====
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/https', 'N/runtime', 'N/log'], (https, runtime, log) => {

    const execute = (context) => {
        const script = runtime.getCurrentScript();

        // URLs from script parameters (configured per-deployment)
        const apiEndpoint = script.getParameter({ name: 'custscript_api_endpoint' });
        const accountId = runtime.accountId;  // Use NetSuite's runtime for account info

        if (!apiEndpoint) {
            log.error('Configuration Error', 'API endpoint not configured.');
            return;
        }

        // Validate the URL is HTTPS
        if (!apiEndpoint.startsWith('https://')) {
            log.error('Configuration Error', 'API endpoint must use HTTPS.');
            return;
        }

        // Use runtime to detect environment
        const envType = runtime.envType;
        log.audit('Sync Started', {
            environment: envType,
            account: accountId
        });

        const response = https.post({
            url: apiEndpoint,
            body: JSON.stringify({ accountId: accountId }),
            headers: { 'Content-Type': 'application/json' }
        });

        log.audit('Sync Complete', { statusCode: response.code });
    };

    return { execute };
});
```

---

## 10. Error Handling That Reveals Configuration

### Example 10: Configuration Information Leakage

```javascript
// ===== BAD: Error handling that reveals system configuration =====
define(['N/https', 'N/log'], (https, log) => {
    const onRequest = (context) => {
        try {
            const response = https.get({ url: 'https://api.vendor.com/status' });
            context.response.write(response.body);
        } catch (e) {
            // VULNERABLE: Reveals the internal URL, connection details, and NetSuite internals
            context.response.write(`
                <h1>Error</h1>
                <p>Failed to connect to https://api.vendor.com/status</p>
                <p>Error: ${e.message}</p>
                <p>Script: customscript_status_check (deploy: customdeploy_status_check)</p>
                <p>Account: 1234567</p>
                <p>Stack: ${e.stack}</p>
            `);
        }
    };
});
```

```javascript
// ===== GOOD: Sanitized error output with server-side diagnostics =====
define(['N/https', 'N/log', 'N/runtime'], (https, log, runtime) => {

    const generateErrorRef = () => 'ERR-' + Date.now().toString(36).toUpperCase();

    const onRequest = (context) => {
        try {
            const script = runtime.getCurrentScript();
            const statusUrl = script.getParameter({ name: 'custscript_status_url' });

            if (!statusUrl) {
                throw new Error('Status URL not configured.');
            }

            const response = https.get({ url: statusUrl });
            context.response.write(response.body);
        } catch (e) {
            const errorRef = generateErrorRef();

            // Full details in server log only
            log.error({
                title: `Status Check Failed [${errorRef}]`,
                details: {
                    message: e.message,
                    stack: e.stack,
                    code: e.code
                }
            });

            // Generic message to client
            context.response.setHeader({
                name: 'Content-Type',
                value: 'text/html; charset=utf-8'
            });
            context.response.write(`
                <h1>Service Temporarily Unavailable</h1>
                <p>Please try again later.</p>
                <p>Reference: ${errorRef}</p>
            `);
        }
    };

    return { onRequest };
});
```

---

## 11. Secure SDF Project Structure

### Example 11: Project Organization for Security

```
MyProject/
  src/
    FileCabinet/
      SuiteScripts/
        lib/
          encoding.js         # Shared encoding utilities
          auth.js              # Shared authorization checks
          config.js            # Environment-aware configuration loader
        scripts/
          order_processor.js   # Business logic scripts
          customer_portal.js
    Objects/
      customscript_order_processor.xml
      customdeploy_order_processor.xml
      customrole_order_management.xml
  manifest.xml                 # Minimal required features
  deploy.xml                   # Deployment targets

  # Files that MUST NOT be in version control:
  # .env                       # Environment variables with secrets
  # credentials.json           # API keys, tokens
  # *.pem, *.key               # Private keys
```

```gitignore
# .gitignore: Prevent secrets from being committed
.env
.env.*
credentials.json
*.pem
*.key
*.p12
secrets/
config/local.json
node_modules/
```

---

## Prevention Checklist

- [ ] **Error messages** returned to clients are generic with reference IDs.
- [ ] **Full error details** are logged server-side only (log.error).
- [ ] **Debug logging** is disabled in production (deployment loglevel is AUDIT or ERROR).
- [ ] **Sensitive data** is never written to log.debug() even in development.
- [ ] **Security headers** are set on all Suitelet HTTP responses.
- [ ] **No default/fallback credentials** exist in source code.
- [ ] **Scripts fail fast** when required configuration is missing.
- [ ] **Test/debug endpoints** are removed before production deployment.
- [ ] **Script deployment status** is TESTING for non-production deployments.
- [ ] **Deployment access** is restricted to specific roles (allroles=F).
- [ ] **manifest.xml** includes only the minimum required features.
- [ ] **manifest.xml** explicitly lists objects (no catch-all patterns).
- [ ] **URLs and environment values** come from script parameters, not hardcoded strings.
- [ ] **HTTPS is enforced** for all external API calls.
- [ ] **.gitignore** excludes credentials, keys, and environment files.
- [ ] **Unused features and endpoints** are removed, not just commented out.
- [ ] **Stack traces** are never exposed in client-facing responses.
- [ ] **Log masking** redacts sensitive fields (SSN, passwords, tokens) before logging.

---

## Related OWASP Resources

- [OWASP Security Misconfiguration Guide](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/)
- [OWASP Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [OWASP HTTP Security Response Headers](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [CWE-209: Generation of Error Message Containing Sensitive Information](https://cwe.mitre.org/data/definitions/209.html)
- [CWE-1004: Sensitive Cookie Without HttpOnly Flag](https://cwe.mitre.org/data/definitions/1004.html)
- [CWE-16: Configuration](https://cwe.mitre.org/data/definitions/16.html)
