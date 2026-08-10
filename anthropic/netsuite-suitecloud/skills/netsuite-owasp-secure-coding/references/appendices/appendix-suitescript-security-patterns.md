# Appendix: SuiteScript Security Patterns
> Author: Oracle NetSuite

## Overview

This appendix provides copy-paste-ready SuiteScript 2.1 security boilerplate modules.
Each template is annotated with inline comments explaining the security rationale for
every decision. These templates are intended as starting points; adapt them to your
specific requirements while preserving the security controls.

---

## 1. Secure RESTlet Template

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 *
 * Secure RESTlet template with input validation, role checking,
 * error handling, and audit logging.
 */
define(['N/log', 'N/runtime', 'N/error', 'N/query'],
    (log, runtime, error, query) => {

    // --- Configuration ---
    const ALLOWED_ROLES = [3, 1032]; // Administrator, Custom Role ID
    const MAX_BODY_SIZE = 50000;     // Maximum request body size in characters

    /**
     * Validate that the current user has an authorized role.
     * SECURITY: Server-side role check prevents unauthorized access
     * even if the deployment audience is misconfigured.
     */
    function assertAuthorizedRole() {
        const currentRole = runtime.getCurrentUser().role;
        if (!ALLOWED_ROLES.includes(currentRole)) {
            log.audit('SECURITY', `Unauthorized role attempt: role=${currentRole}, user=${runtime.getCurrentUser().id}`);
            throw error.create({
                name: 'UNAUTHORIZED',
                message: 'You are not authorized to access this endpoint.',
                notifyOff: true
            });
        }
    }

    /**
     * Validate and sanitize input parameters.
     * SECURITY: Reject unexpected fields, enforce types and lengths.
     */
    function validateInput(body) {
        if (typeof body === 'string' && body.length > MAX_BODY_SIZE) {
            throw error.create({ name: 'INPUT_TOO_LARGE', message: 'Request body exceeds maximum size.' });
        }

        let data;
        try {
            data = typeof body === 'string' ? JSON.parse(body) : (body || {});
        } catch (parseError) {
            throw error.create({ name: 'INVALID_INPUT', message: 'Request body must be valid JSON.' });
        }

        if (!data || Array.isArray(data) || typeof data !== 'object') {
            throw error.create({ name: 'INVALID_INPUT', message: 'Request body must be a JSON object.' });
        }

        // Allowlist of expected fields
        const allowedFields = ['customerId', 'action', 'notes'];
        const receivedFields = Object.keys(data);
        const unexpected = receivedFields.filter(f => !allowedFields.includes(f));
        if (unexpected.length > 0) {
            throw error.create({ name: 'INVALID_INPUT', message: 'Unexpected fields in request.' });
        }

        // Type and range validation
        if (data.customerId === undefined) {
            throw error.create({ name: 'INVALID_INPUT', message: 'customerId is required.' });
        }

        const id = Number(data.customerId);
        if (!Number.isInteger(id) || id <= 0 || id > 999999999) {
            throw error.create({ name: 'INVALID_INPUT', message: 'Invalid customer ID.' });
        }
        data.customerId = id;

        if (data.action !== undefined) {
            const validActions = ['view', 'update', 'archive'];
            if (!validActions.includes(data.action)) {
                throw error.create({ name: 'INVALID_INPUT', message: 'Invalid action.' });
            }
        }

        if (data.notes !== undefined) {
            if (typeof data.notes !== 'string' || data.notes.length > 4000) {
                throw error.create({ name: 'INVALID_INPUT', message: 'Invalid notes field.' });
            }
            // SECURITY: Strip HTML tags to prevent stored XSS
            data.notes = data.notes.replace(/<[^>]*>/g, '');
        }

        return data;
    }

    /**
     * Build a safe error response.
     * SECURITY: Never expose internal error details to the caller.
     */
    function safeErrorResponse(e) {
        const knownErrors = ['UNAUTHORIZED', 'INVALID_INPUT', 'INPUT_TOO_LARGE', 'NOT_FOUND'];
        if (knownErrors.includes(e.name)) {
            return { error: { code: e.name, message: e.message } };
        }
        log.error('UNHANDLED_ERROR', `${e.name}: ${e.message}\n${e.stack || ''}`);
        return { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } };
    }

    function post(body) {
        try {
            assertAuthorizedRole();
            const data = validateInput(body);

            // SECURITY: Use parameterized SuiteQL; never concatenate user input
            const results = query.runSuiteQL({
                query: 'SELECT entityid, companyname FROM customer WHERE id = ?',
                params: [data.customerId]
            }).asMappedResults();

            log.audit('API_ACCESS', `POST by user=${runtime.getCurrentUser().id}, action=${data.action}`);

            return { success: true, data: results };
        } catch (e) {
            return safeErrorResponse(e);
        }
    }

    function get(params) {
        try {
            assertAuthorizedRole();
            // Validate GET parameters similarly
            return { success: true, message: 'GET endpoint operational.' };
        } catch (e) {
            return safeErrorResponse(e);
        }
    }

    return { get, post };
});
```

---

## 2. Secure Suitelet Template

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 *
 * Secure Suitelet template with CSRF protection, output encoding,
 * CSP headers, and role checking.
 */
define(['N/ui/serverWidget', 'N/runtime', 'N/log', 'N/error', 'N/http'],
    (serverWidget, runtime, log, error, http) => {

    const ALLOWED_ROLES = [3, 1032];

    function assertAuthorizedRole() {
        const currentRole = runtime.getCurrentUser().role;
        if (!ALLOWED_ROLES.includes(currentRole)) {
            log.audit('SECURITY', `Suitelet unauthorized role: ${currentRole}`);
            throw error.create({ name: 'UNAUTHORIZED', message: 'Access denied.' });
        }
    }

    /**
     * Set security headers on the response.
     * SECURITY: CSP, X-Content-Type-Options, and X-Frame-Options
     * mitigate XSS, MIME sniffing, and clickjacking.
     */
    function setSecurityHeaders(response) {
        response.setHeader({
            name: 'Content-Security-Policy',
            value: "default-src 'none'; script-src 'self' https://*.netsuite.com; style-src 'self' 'unsafe-inline' https://*.netsuite.com; img-src 'self' https://*.netsuite.com data:; connect-src 'self' https://*.netsuite.com; form-action 'self' https://*.netsuite.com; base-uri 'self'; object-src 'none'; frame-ancestors 'self'"
        });
        response.setHeader({ name: 'X-Content-Type-Options', value: 'nosniff' });
        response.setHeader({ name: 'X-Frame-Options', value: 'SAMEORIGIN' });
        response.setHeader({ name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' });
    }

    function htmlEscape(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    function onRequest(context) {
        try {
            assertAuthorizedRole();
            setSecurityHeaders(context.response);

            if (context.request.method === http.Method.GET) {
                const form = serverWidget.createForm({ title: 'Secure Form' });

                // SECURITY: NetSuite forms include CSRF tokens automatically
                // when using serverWidget. Do not bypass this mechanism.
                form.addField({
                    id: 'custpage_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Customer Name'
                });

                form.addSubmitButton({ label: 'Submit' });
                context.response.writePage(form);

            } else {
                // SECURITY: NetSuite validates the CSRF token on POST automatically.
                const name = context.request.parameters.custpage_name || '';

                // SECURITY: Validate and encode before use
                if (name.length > 200) {
                    throw error.create({ name: 'INVALID_INPUT', message: 'Name too long.' });
                }

                const safeName = htmlEscape(name);
                log.audit('FORM_SUBMIT', `User ${runtime.getCurrentUser().id} submitted name: ${safeName}`);

                context.response.write(`<html><body><p>Received: ${safeName}</p></body></html>`);
            }
        } catch (e) {
            log.error('SUITELET_ERROR', e.message);
            context.response.write('<html><body><p>An error occurred. Please contact support.</p></body></html>');
        }
    }

    return { onRequest };
});
```

---

## 3. Secure User Event Template

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 *
 * Secure User Event template with role checking, input validation,
 * and audit logging.
 */
define(['N/runtime', 'N/log', 'N/record'],
    (runtime, log, record) => {

    const SENSITIVE_FIELDS = ['custbody_ssn', 'custbody_credit_card', 'custbody_bank_account'];

    /**
     * Log changes to sensitive fields for audit trail.
     * SECURITY: Track who changed what and when for compliance.
     */
    function auditSensitiveChanges(context) {
        const currentRecord = context.newRecord;
        const oldRecord = context.oldRecord;

        SENSITIVE_FIELDS.forEach(fieldId => {
            const newVal = currentRecord.getValue({ fieldId });
            const oldVal = oldRecord ? oldRecord.getValue({ fieldId }) : null;

            if (newVal !== oldVal) {
                log.audit('SENSITIVE_FIELD_CHANGE', JSON.stringify({
                    field: fieldId,
                    recordType: currentRecord.type,
                    recordId: currentRecord.id,
                    userId: runtime.getCurrentUser().id,
                    role: runtime.getCurrentUser().role,
                    timestamp: new Date().toISOString(),
                    // SECURITY: Never log the actual sensitive values
                    changed: true
                }));
            }
        });
    }

    /**
     * Validate field values before save.
     * SECURITY: Server-side validation cannot be bypassed by client scripts.
     */
    function validateBeforeSave(context) {
        const rec = context.newRecord;

        // Example: Validate a custom email field
        const email = rec.getValue({ fieldId: 'custbody_contact_email' });
        if (email) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email) || email.length > 254) {
                throw new Error('Invalid email address format.');
            }
        }

        // Example: Validate a custom amount field
        const amount = rec.getValue({ fieldId: 'custbody_approved_amount' });
        if (amount !== null && amount !== '') {
            const num = Number(amount);
            if (isNaN(num) || num < 0 || num > 10000000) {
                throw new Error('Amount must be between 0 and 10,000,000.');
            }
        }
    }

    function beforeSubmit(context) {
        try {
            if (context.type === context.UserEventType.CREATE ||
                context.type === context.UserEventType.EDIT) {
                validateBeforeSave(context);
            }
        } catch (e) {
            log.error('VALIDATION_FAILURE', `Record ${context.newRecord.type} validation: ${e.message}`);
            throw e; // Re-throw to prevent save
        }
    }

    function afterSubmit(context) {
        try {
            if (context.type === context.UserEventType.EDIT) {
                auditSensitiveChanges(context);
            }
            if (context.type === context.UserEventType.CREATE) {
                log.audit('RECORD_CREATED', JSON.stringify({
                    recordType: context.newRecord.type,
                    recordId: context.newRecord.id,
                    userId: runtime.getCurrentUser().id,
                    timestamp: new Date().toISOString()
                }));
            }
        } catch (e) {
            // SECURITY: After-submit errors should not prevent the transaction
            // but must be logged for investigation.
            log.error('AFTER_SUBMIT_ERROR', e.message);
        }
    }

    return { beforeSubmit, afterSubmit };
});
```

---

## 4. Input Validation Module

```javascript
/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 * Shared input validation module for SuiteScript projects.
 * Import: define(['./InputValidator'], (InputValidator) => { ... })
 */
define([], () => {

    const MAX_STRING_LENGTH = 4000;
    const MAX_URL_LENGTH = 2048;

    function isNonEmptyString(value, maxLength) {
        maxLength = maxLength || MAX_STRING_LENGTH;
        return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
    }

    function isValidInteger(value, min, max) {
        const num = Number(value);
        if (!Number.isInteger(num)) return false;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        return true;
    }

    function isValidDecimal(value, min, max, maxDecimals) {
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) return false;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        if (maxDecimals !== undefined) {
            const parts = String(value).split('.');
            if (parts[1] && parts[1].length > maxDecimals) return false;
        }
        return true;
    }

    function isValidEmail(value) {
        if (typeof value !== 'string' || value.length > 254) return false;
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    }

    function isValidUrl(value, allowedProtocols) {
        if (typeof value !== 'string' || value.length > MAX_URL_LENGTH) return false;
        allowedProtocols = allowedProtocols || ['https:'];
        try {
            const url = new URL(value);
            return allowedProtocols.includes(url.protocol);
        } catch (e) {
            return false;
        }
    }

    function isValidDate(value) {
        if (typeof value !== 'string') return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
    }

    function isValidInternalId(value) {
        return isValidInteger(value, 1, 999999999);
    }

    /**
     * Sanitize a string for safe use in HTML output.
     */
    function sanitizeHtml(value) {
        if (typeof value !== 'string') return '';
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    /**
     * Remove all characters except alphanumerics, spaces, and basic punctuation.
     */
    function sanitizePlainText(value) {
        if (typeof value !== 'string') return '';
        return value.replace(/[^\w\s.,;:!?@#$%&*()\-+=[\]{}|/\\'"]/g, '').substring(0, MAX_STRING_LENGTH);
    }

    /**
     * Validate an object against a schema definition.
     * Schema format: { fieldName: { type: 'string', required: true, maxLength: 200 }, ... }
     */
    function validateObject(obj, schema) {
        const errors = [];
        const allowedKeys = Object.keys(schema);
        const receivedKeys = Object.keys(obj);

        // Check for unexpected keys
        receivedKeys.forEach(key => {
            if (!allowedKeys.includes(key)) {
                errors.push(`Unexpected field: ${key}`);
            }
        });

        // Validate each field
        allowedKeys.forEach(key => {
            const rule = schema[key];
            const value = obj[key];

            if (rule.required && (value === undefined || value === null || value === '')) {
                errors.push(`Missing required field: ${key}`);
                return;
            }

            if (value === undefined || value === null) return;

            if (rule.type === 'string' && !isNonEmptyString(value, rule.maxLength)) {
                errors.push(`Invalid string field: ${key}`);
            }
            if (rule.type === 'integer' && !isValidInteger(value, rule.min, rule.max)) {
                errors.push(`Invalid integer field: ${key}`);
            }
            if (rule.type === 'email' && !isValidEmail(value)) {
                errors.push(`Invalid email field: ${key}`);
            }
            if (rule.type === 'url' && !isValidUrl(value)) {
                errors.push(`Invalid URL field: ${key}`);
            }
        });

        return { valid: errors.length === 0, errors };
    }

    return {
        isNonEmptyString,
        isValidInteger,
        isValidDecimal,
        isValidEmail,
        isValidUrl,
        isValidDate,
        isValidInternalId,
        sanitizeHtml,
        sanitizePlainText,
        validateObject
    };
});
```

---

## 5. Audit Logger Module

```javascript
/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 * Shared audit logging module for security events.
 * Import: define(['./AuditLogger'], (AuditLogger) => { ... })
 */
define(['N/log', 'N/runtime', 'N/record'], (log, runtime, record) => {

    const LOG_RECORD_TYPE = 'customrecord_security_audit_log'; // Create this custom record

    /**
     * Get current user context for audit entries.
     * SECURITY: Capture identity details at the time of the event.
     */
    function getUserContext() {
        const user = runtime.getCurrentUser();
        return {
            userId: user.id,
            role: user.role,
            roleCenter: user.roleCenter
        };
    }

    function redactSensitiveValues(value) {
        const sensitiveKeyPattern = /pass(word)?|secret|token|api[_-]?key|authorization|cookie|session/i;

        if (value == null) {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(redactSensitiveValues);
        }
        if (typeof value === 'object') {
            return Object.keys(value).reduce((result, key) => {
                result[key] = sensitiveKeyPattern.test(key)
                    ? '[REDACTED]'
                    : redactSensitiveValues(value[key]);
                return result;
            }, {});
        }
        if (typeof value === 'string') {
            return value.length > 1000 ? value.substring(0, 1000) + '...[truncated]' : value;
        }

        return value;
    }

    /**
     * Log a security event to both N/log and a custom audit record.
     * SECURITY: Dual logging ensures events survive log rotation.
     */
    function logEvent(eventType, details, severity) {
        severity = severity || 'INFO';
        const userCtx = getUserContext();

        const entry = {
            eventType: eventType,
            severity: severity,
            timestamp: new Date().toISOString(),
            user: userCtx,
            details: redactSensitiveValues(details),
            scriptId: runtime.getCurrentScript().id,
            deploymentId: runtime.getCurrentScript().deploymentId
        };

        // Always write to N/log
        const logMessage = JSON.stringify(entry);
        if (severity === 'CRITICAL' || severity === 'HIGH') {
            log.error('SECURITY_EVENT', logMessage);
        } else {
            log.audit('SECURITY_EVENT', logMessage);
        }

        // Write to custom audit record for persistent storage
        try {
            const auditRec = record.create({ type: LOG_RECORD_TYPE });
            auditRec.setValue({ fieldId: 'custrecord_sal_event_type', value: eventType });
            auditRec.setValue({ fieldId: 'custrecord_sal_severity', value: severity });
            auditRec.setValue({ fieldId: 'custrecord_sal_user_id', value: String(userCtx.userId) });
            auditRec.setValue({ fieldId: 'custrecord_sal_details', value: logMessage.substring(0, 4000) });
            auditRec.setValue({ fieldId: 'custrecord_sal_timestamp', value: new Date() });
            auditRec.save();
        } catch (e) {
            log.error('AUDIT_LOG_FAILURE', `Failed to write audit record: ${e.message}`);
        }

        return entry;
    }

    // Convenience methods for common security events
    function logAuthSuccess(details) { return logEvent('AUTH_SUCCESS', details, 'INFO'); }
    function logAuthFailure(details) { return logEvent('AUTH_FAILURE', details, 'HIGH'); }
    function logAuthzFailure(details) { return logEvent('AUTHZ_FAILURE', details, 'HIGH'); }
    function logInputViolation(details) { return logEvent('INPUT_VIOLATION', details, 'MEDIUM'); }
    function logDataAccess(details) { return logEvent('DATA_ACCESS', details, 'INFO'); }
    function logConfigChange(details) { return logEvent('CONFIG_CHANGE', details, 'HIGH'); }
    function logSuspiciousActivity(details) { return logEvent('SUSPICIOUS_ACTIVITY', details, 'CRITICAL'); }

    return {
        logEvent,
        logAuthSuccess,
        logAuthFailure,
        logAuthzFailure,
        logInputViolation,
        logDataAccess,
        logConfigChange,
        logSuspiciousActivity
    };
});
```

---

## 6. Secure File Handler

```javascript
/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 * Secure file upload/download handler with type, size, and content validation.
 * Import: define(['./SecureFileHandler'], (SecureFileHandler) => { ... })
 */
define(['N/file', 'N/error', 'N/log', 'N/runtime'], (file, error, log, runtime) => {

    // --- Configuration ---
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const ALLOWED_FILE_TYPES = Object.freeze({
        '.pdf': file.Type.PDF,
        '.csv': file.Type.CSV,
        '.xlsx': file.Type.EXCEL,
        '.xls': file.Type.EXCEL,
        '.txt': file.Type.PLAINTEXT,
        '.png': file.Type.PNGIMAGE,
        '.jpg': file.Type.JPGIMAGE,
        '.jpeg': file.Type.JPGIMAGE
    });
    const TARGET_FOLDER_ID = 12345; // Set to your designated upload folder
    const ALLOWED_FOLDER_IDS = [TARGET_FOLDER_ID];

    /**
     * Validate a file name for safety.
     * SECURITY: Prevent path traversal, null bytes, and prohibited characters.
     */
    function getFileExtension(name) {
        return '.' + name.split('.').pop().toLowerCase();
    }

    function validateFileName(name) {
        if (!name || typeof name !== 'string') {
            throw error.create({ name: 'INVALID_FILE', message: 'File name is required.' });
        }

        // SECURITY: Remove path traversal sequences
        if (name.includes('..') || name.includes('/') || name.includes('\\')) {
            throw error.create({ name: 'INVALID_FILE', message: 'File name contains prohibited characters.' });
        }

        // SECURITY: Remove null bytes
        if (name.includes('\0')) {
            throw error.create({ name: 'INVALID_FILE', message: 'File name contains null bytes.' });
        }

        // SECURITY: Check extension against allowlist
        const ext = getFileExtension(name);
        if (!Object.prototype.hasOwnProperty.call(ALLOWED_FILE_TYPES, ext)) {
            throw error.create({
                name: 'INVALID_FILE_TYPE',
                message: `File type ${ext} is not allowed. Permitted: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`
            });
        }

        // SECURITY: Limit file name length
        if (name.length > 200) {
            throw error.create({ name: 'INVALID_FILE', message: 'File name too long.' });
        }

        return name;
    }

    function validateDeclaredFileType(fileObj, safeName) {
        const ext = getFileExtension(safeName);
        const expectedType = ALLOWED_FILE_TYPES[ext];
        if (fileObj.fileType !== expectedType) {
            throw error.create({
                name: 'INVALID_FILE_TYPE',
                message: `File type does not match extension ${ext}.`
            });
        }
        return ext;
    }

    function validateFileContents(fileObj, ext) {
        const contents = typeof fileObj.getContents === 'function' ? fileObj.getContents() : '';

        // SECURITY: Validate cheap, high-signal signatures where SuiteScript exposes contents safely.
        if (ext === '.pdf' && contents && !contents.startsWith('%PDF-')) {
            throw error.create({ name: 'INVALID_FILE', message: 'PDF signature check failed.' });
        }
        if ((ext === '.csv' || ext === '.txt') && /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(contents)) {
            throw error.create({ name: 'INVALID_FILE', message: 'Text file contains unexpected control characters.' });
        }
    }

    function resolveTargetFolder(customFolderId) {
        if (customFolderId === undefined || customFolderId === null || customFolderId === '') {
            return TARGET_FOLDER_ID;
        }

        const folderId = Number(customFolderId);
        if (!Number.isInteger(folderId) || !ALLOWED_FOLDER_IDS.includes(folderId)) {
            throw error.create({ name: 'INVALID_FOLDER', message: 'Upload folder is not permitted.' });
        }

        return folderId;
    }

    /**
     * Validate file size.
     * SECURITY: Prevent denial-of-service through oversized uploads.
     */
    function validateFileSize(fileObj) {
        if (fileObj.size > MAX_FILE_SIZE) {
            throw error.create({
                name: 'FILE_TOO_LARGE',
                message: `File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)} MB.`
            });
        }
    }

    /**
     * Upload a file securely.
     * Validates name, size, type, then saves to the designated folder.
     */
    function secureUpload(fileObj, customFolderId) {
        const safeName = validateFileName(fileObj.name);
        validateFileSize(fileObj);
        const extension = validateDeclaredFileType(fileObj, safeName);
        validateFileContents(fileObj, extension);

        // Set folder. Always resolve through a server-side allowlist.
        fileObj.folder = resolveTargetFolder(customFolderId);
        fileObj.name = safeName;

        const fileId = fileObj.save();

        log.audit('FILE_UPLOADED', JSON.stringify({
            fileId: fileId,
            fileName: safeName,
            fileSize: fileObj.size,
            fileType: fileObj.fileType,
            userId: runtime.getCurrentUser().id,
            timestamp: new Date().toISOString()
        }));

        return fileId;
    }

    /**
     * Download a file securely.
     * Validates that the file exists and the user has permission.
     */
    function secureDownload(fileId) {
        if (!fileId || !Number.isInteger(Number(fileId)) || Number(fileId) <= 0) {
            throw error.create({ name: 'INVALID_INPUT', message: 'Invalid file ID.' });
        }

        try {
            const fileObj = file.load({ id: Number(fileId) });

            log.audit('FILE_DOWNLOADED', JSON.stringify({
                fileId: fileId,
                fileName: fileObj.name,
                userId: runtime.getCurrentUser().id,
                timestamp: new Date().toISOString()
            }));

            return fileObj;
        } catch (e) {
            log.error('FILE_DOWNLOAD_FAILURE', `File ${fileId}: ${e.message}`);
            throw error.create({ name: 'FILE_NOT_FOUND', message: 'The requested file could not be found.' });
        }
    }

    return {
        secureUpload,
        secureDownload,
        validateFileName,
        validateFileSize,
        ALLOWED_FILE_TYPES,
        MAX_FILE_SIZE
    };
});
```

---

## References

- OWASP Secure Coding Practices: Input Validation and File Upload
- NetSuite SuiteScript 2.1 API: N/file, N/query, N/runtime, N/record
- CWE-22: Path Traversal
- CWE-434: Unrestricted Upload of File with Dangerous Type
