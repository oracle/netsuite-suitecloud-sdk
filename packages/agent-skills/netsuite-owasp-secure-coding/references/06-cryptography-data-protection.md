Copyright (c) 2026 Oracle and/or its affiliates.
Licensed under the Universal Permissive License v1.0 as shown at
[The Universal Permissive License (UPL), Version 1.0](https://oss.oracle.com/licenses/upl).

# Cryptography & Data Protection (A02:2021 - Cryptographic Failures)
> Author: Oracle NetSuite

> OWASP Top 10 Reference: A02:2021 - Cryptographic Failures
> Applies to: SuiteScript 2.x (Server-Side and Client-Side)

Cryptographic failures occur when sensitive data is not adequately protected through
encryption, hashing, or proper key management. In NetSuite, this includes mishandling
PII, credentials, payment data, and inter-system authentication secrets.

---

## Table of Contents

1. [N/crypto Module Overview](#ncrypto-module-overview)
2. [Secure Hashing](#secure-hashing)
3. [Password Hashing](#password-hashing)
4. [Symmetric Encryption (AES-256)](#symmetric-encryption-aes-256)
5. [Key Management](#key-management)
6. [Data at Rest Encryption](#data-at-rest-encryption)
7. [Data in Transit (HTTPS Enforcement)](#data-in-transit-https-enforcement)
8. [PII Handling and Masking](#pii-handling-and-masking)
9. [Secure Random Number Generation](#secure-random-number-generation)
10. [Certificate Management](#certificate-management)

---

## N/crypto Module Overview

The `N/crypto` module provides cryptographic operations within SuiteScript. Always
use this module rather than attempting custom cryptographic implementations.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/crypto', 'N/encode', 'N/runtime'], (crypto, encode, runtime) => {
    // N/crypto provides:
    // - crypto.createHash()      - One-way hashing
    // - crypto.createHmac()      - HMAC for message authentication
    // - crypto.createCipher()    - Symmetric encryption
    // - crypto.createDecipher()  - Symmetric decryption
    // - crypto.createSecretKey() - Key creation from secrets
});
```

---

## Secure Hashing

Use SHA-256 as the minimum hashing algorithm. MD5 and SHA-1 are broken and must
never be used for security-sensitive operations.

```javascript
// BAD: Using MD5 - cryptographically broken
function hashDataInsecure(data) {
    const hashObj = crypto.createHash({
        algorithm: crypto.HashAlg.MD5
    });
    hashObj.update({ input: data });
    return hashObj.digest({ outputEncoding: encode.Encoding.HEX });
}

// BAD: Using SHA-1 - deprecated and vulnerable to collision attacks
function hashDataWeak(data) {
    const hashObj = crypto.createHash({
        algorithm: crypto.HashAlg.SHA1
    });
    hashObj.update({ input: data });
    return hashObj.digest({ outputEncoding: encode.Encoding.HEX });
}
```

```javascript
// GOOD: Using SHA-256 or higher
function hashDataSecure(data) {
    const hashObj = crypto.createHash({
        algorithm: crypto.HashAlg.SHA256
    });
    hashObj.update({
        input: data,
        inputEncoding: encode.Encoding.UTF_8
    });
    return hashObj.digest({ outputEncoding: encode.Encoding.HEX });
}

// GOOD: Using SHA-512 for maximum security
function hashDataStrong(data) {
    const hashObj = crypto.createHash({
        algorithm: crypto.HashAlg.SHA512
    });
    hashObj.update({
        input: data,
        inputEncoding: encode.Encoding.UTF_8
    });
    return hashObj.digest({ outputEncoding: encode.Encoding.HEX });
}
```

---

## Password Hashing

Passwords require specialized hashing algorithms designed to be computationally
expensive. Never use plain SHA-256 for password storage.

```javascript
// BAD: Storing passwords with simple hash - vulnerable to rainbow tables
function storePasswordInsecure(password) {
    const hashObj = crypto.createHash({ algorithm: crypto.HashAlg.SHA256 });
    hashObj.update({ input: password });
    return hashObj.digest({ outputEncoding: encode.Encoding.HEX });
}

// BAD: Hardcoded salt - all users share the same salt
function storePasswordWeakSalt(password) {
    const salt = 'mysecretfixedsalt123';
    const hashObj = crypto.createHash({ algorithm: crypto.HashAlg.SHA256 });
    hashObj.update({ input: salt + password });
    return hashObj.digest({ outputEncoding: encode.Encoding.HEX });
}
```

```javascript
// GOOD: Use HMAC with a per-user secret key and unique salt
// For true bcrypt/scrypt, delegate to an external service via N/https
function storePasswordSecure(password, userId) {
    // Generate a unique salt per user stored alongside the hash
    const salt = generateSecureRandom(32);

    // Use HMAC-SHA512 with a secret key from Script Parameter
    const secretKeyGuid = runtime.getCurrentScript()
        .getParameter({ name: 'custscript_password_hmac_key' });

    const secretKey = crypto.createSecretKey({
        guid: secretKeyGuid,
        encoding: encode.Encoding.UTF_8
    });

    const hmacObj = crypto.createHmac({
        algorithm: crypto.HashAlg.SHA512,
        key: secretKey
    });
    hmacObj.update({ input: salt + password + userId });
    const hash = hmacObj.digest({ outputEncoding: encode.Encoding.HEX });

    return { salt: salt, hash: hash };
}

// GOOD: For bcrypt, delegate to an external microservice
function hashPasswordWithBcrypt(password) {
    const response = https.post({
        url: 'https://internal-auth-service.company.com/hash',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password }),
        credentials: { username: 'netsuite', password: getApiSecret() }
    });
    return JSON.parse(response.body).hash;
}
```

---

## Symmetric Encryption (AES-256)

Use AES-256 for encrypting sensitive data fields stored in NetSuite records.

```javascript
// BAD: Using a weak cipher or hardcoded key
function encryptInsecure(plaintext) {
    const key = 'my-secret-key-12345'; // NEVER hardcode keys
    const cipher = crypto.createCipher({
        algorithm: crypto.EncryptionAlg.AES, // Unspecified key size
        key: key // String keys are insecure
    });
    cipher.update({ input: plaintext });
    return cipher.final({ outputEncoding: encode.Encoding.HEX });
}
```

```javascript
// GOOD: AES encryption using managed secret keys
function encryptSecure(plaintext) {
    // Retrieve secret key GUID from Script Parameter (set in deployment)
    const keyGuid = runtime.getCurrentScript()
        .getParameter({ name: 'custscript_aes_encryption_key' });

    const secretKey = crypto.createSecretKey({
        guid: keyGuid,
        encoding: encode.Encoding.UTF_8
    });

    const cipher = crypto.createCipher({
        algorithm: crypto.EncryptionAlg.AES,
        key: secretKey,
        padding: crypto.Padding.PKCS5Padding
    });

    cipher.update({
        input: plaintext,
        inputEncoding: encode.Encoding.UTF_8
    });

    return cipher.final({
        outputEncoding: encode.Encoding.HEX
    }).toString();
}

function decryptSecure(ciphertext) {
    const keyGuid = runtime.getCurrentScript()
        .getParameter({ name: 'custscript_aes_encryption_key' });

    const secretKey = crypto.createSecretKey({
        guid: keyGuid,
        encoding: encode.Encoding.UTF_8
    });

    const decipher = crypto.createDecipher({
        algorithm: crypto.EncryptionAlg.AES,
        key: secretKey,
        padding: crypto.Padding.PKCS5Padding
    });

    decipher.update({
        input: ciphertext,
        inputEncoding: encode.Encoding.HEX
    });

    return decipher.final({
        outputEncoding: encode.Encoding.UTF_8
    }).toString();
}
```

---

## Key Management

Never hardcode cryptographic keys, API secrets, or credentials in source code.

```javascript
// BAD: Hardcoded secrets in source code
const API_KEY = 'sk-live-abc123def456';
const ENCRYPTION_KEY = 'SuperSecretKey2024!';
const DB_PASSWORD = 'admin123';

// BAD: Secrets in configuration objects
const config = {
    apiKey: 'pk_live_51234567890',
    secretKey: 'sk_live_09876543210',
    webhookSecret: 'whsec_abcdefghijklmnop'
};

// BAD: Base64-encoded secrets (obscured, not secured)
const SECRET = encode.convert({
    string: 'bXlfc2VjcmV0X2tleQ==',
    inputEncoding: encode.Encoding.BASE_64,
    outputEncoding: encode.Encoding.UTF_8
});
```

```javascript
// GOOD: Retrieve secrets from Script Parameters (set in Script Deployment)
function getSecrets() {
    const script = runtime.getCurrentScript();
    return {
        apiKey: script.getParameter({ name: 'custscript_api_key' }),
        encryptionKeyGuid: script.getParameter({ name: 'custscript_enc_key_guid' }),
        webhookSecret: script.getParameter({ name: 'custscript_webhook_secret' })
    };
}

// GOOD: Use NetSuite's credential storage for HTTPS calls
function callExternalApi(endpoint, payload) {
    // Credentials configured in Setup > Company > Credentials
    return https.post({
        url: endpoint,
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        credentials: {
            type: https.CredentialType.TOKEN,
            id: 'custcredential_external_api_token'
        }
    });
}

// GOOD: Create secret keys from managed GUIDs
function getEncryptionKey() {
    const keyGuid = runtime.getCurrentScript()
        .getParameter({ name: 'custscript_enc_key_guid' });

    if (!keyGuid) {
        throw error.create({
            name: 'MISSING_ENCRYPTION_KEY',
            message: 'Encryption key GUID not configured in script deployment.'
        });
    }

    return crypto.createSecretKey({
        guid: keyGuid,
        encoding: encode.Encoding.UTF_8
    });
}
```

---

## Data at Rest Encryption

Encrypt sensitive fields before storing them in custom records or fields.

```javascript
// BAD: Storing sensitive data in plain text
function saveCreditCardInsecure(customerId, cardNumber, cvv) {
    const rec = record.load({ type: 'customer', id: customerId });
    rec.setValue({ fieldId: 'custentity_card_number', value: cardNumber });
    rec.setValue({ fieldId: 'custentity_cvv', value: cvv }); // NEVER store CVV
    rec.save();
}
```

```javascript
// GOOD: Encrypt sensitive data before storage; never store CVV
function saveSensitiveData(customerId, taxId) {
    const encrypted = encryptSecure(taxId);

    const rec = record.load({ type: 'customer', id: customerId });
    rec.setValue({
        fieldId: 'custentity_encrypted_tax_id',
        value: encrypted
    });
    // Store a masked version for display purposes
    rec.setValue({
        fieldId: 'custentity_masked_tax_id',
        value: maskTaxId(taxId) // "***-**-6789"
    });
    rec.save();
}

// GOOD: Only decrypt when absolutely needed, with access control
function retrieveSensitiveData(customerId) {
    const currentRole = runtime.getCurrentUser().role;
    const allowedRoles = [3, 1032]; // Administrator, Custom Finance Role

    if (!allowedRoles.includes(currentRole)) {
        throw error.create({
            name: 'ACCESS_DENIED',
            message: 'Insufficient privileges to view sensitive data.'
        });
    }

    const rec = record.load({ type: 'customer', id: customerId });
    const encrypted = rec.getValue({ fieldId: 'custentity_encrypted_tax_id' });
    return decryptSecure(encrypted);
}
```

---

## Data in Transit (HTTPS Enforcement)

All external communications must use HTTPS. NetSuite enforces TLS for its own
endpoints, but outbound calls must be validated.

```javascript
// BAD: HTTP endpoint (data sent in cleartext)
function sendDataInsecure(payload) {
    return https.post({
        url: 'http://api.partner.com/data', // HTTP - unencrypted!
        body: JSON.stringify(payload)
    });
}
```

```javascript
// GOOD: Always use HTTPS with proper validation
function sendDataSecure(payload) {
    const url = 'https://api.partner.com/data';

    // Validate URL scheme before sending
    if (!url.startsWith('https://')) {
        throw error.create({
            name: 'INSECURE_TRANSPORT',
            message: 'All external calls must use HTTPS.'
        });
    }

    return https.post({
        url: url,
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        }
    });
}

// GOOD: URL validation helper
function validateSecureUrl(url) {
    if (typeof url !== 'string') {
        throw error.create({ name: 'INVALID_URL', message: 'URL must be a string.' });
    }
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
        throw error.create({
            name: 'INSECURE_PROTOCOL',
            message: `Protocol "${parsed.protocol}" is not allowed. Use HTTPS.`
        });
    }
    return parsed.href;
}
```

---

## PII Handling and Masking

Personally Identifiable Information (PII) must be masked in logs, error messages,
and any non-essential display contexts.

```javascript
// BAD: Logging PII in plain text
function processCustomer(customer) {
    log.debug('Processing customer', JSON.stringify(customer));
    // Logs: {"name":"John Doe","ssn":"123-45-6789","email":"john@example.com"}
}

// BAD: Exposing PII in error messages
function lookupCustomer(ssn) {
    const results = search.create({ /* ... */ }).run().getRange({ start: 0, end: 1 });
    if (!results.length) {
        throw error.create({
            name: 'NOT_FOUND',
            message: `Customer with SSN ${ssn} not found.` // Leaks SSN
        });
    }
}
```

```javascript
// GOOD: Mask all PII before logging or displaying
const PiiMasker = {
    ssn(value) {
        if (!value || typeof value !== 'string') return '***';
        return `***-**-${value.slice(-4)}`;
    },

    email(value) {
        if (!value || typeof value !== 'string') return '***';
        const [local, domain] = value.split('@');
        if (!domain) return '***';
        return `${local.charAt(0)}***@${domain}`;
    },

    creditCard(value) {
        if (!value || typeof value !== 'string') return '***';
        const digits = value.replace(/\D/g, '');
        return `****-****-****-${digits.slice(-4)}`;
    },

    phone(value) {
        if (!value || typeof value !== 'string') return '***';
        return `***-***-${value.replace(/\D/g, '').slice(-4)}`;
    },

    // Generic masker: keep first and last char, mask middle
    generic(value) {
        if (!value || value.length <= 2) return '***';
        return value.charAt(0) + '*'.repeat(value.length - 2) + value.charAt(value.length - 1);
    }
};

// GOOD: Sanitize objects before logging
function sanitizeForLogging(obj) {
    const sensitiveKeys = ['ssn', 'taxid', 'password', 'creditcard', 'cvv',
                           'token', 'secret', 'authorization'];
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase().replace(/[_-]/g, '');
        if (sensitiveKeys.some(s => lowerKey.includes(s))) {
            sanitized[key] = '[REDACTED]';
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

function processCustomerSecure(customer) {
    log.debug('Processing customer', JSON.stringify(sanitizeForLogging(customer)));
    // Logs: {"name":"John Doe","ssn":"[REDACTED]","email":"john@example.com"}
}
```

---

## Secure Random Number Generation

Never use `Math.random()` for security-sensitive values such as tokens, nonces,
or session identifiers.

```javascript
// BAD: Math.random() is not cryptographically secure
function generateTokenInsecure() {
    return Math.random().toString(36).substring(2);
    // Predictable, low entropy, easily guessable
}

// BAD: Timestamp-based tokens
function generateTokenTimestamp() {
    return 'token_' + Date.now().toString(36);
    // Completely predictable
}
```

```javascript
// GOOD: Use a dedicated cryptographic random source
function generateSecureRandom(byteLength) {
    const response = https.get({
        url: 'https://internal-crypto-service.company.com/random?bytes=' + byteLength,
        headers: { 'Authorization': 'Bearer ' + getServiceToken() }
    });
    const payload = JSON.parse(response.body);
    if (!payload.bytesHex || payload.bytesHex.length !== byteLength * 2) {
        throw new Error('Random service returned an invalid payload.');
    }
    return payload.bytesHex;
}

// GOOD: Generate a CSRF token using HMAC with a managed key
function generateCsrfToken(sessionId) {
    const keyGuid = runtime.getCurrentScript()
        .getParameter({ name: 'custscript_csrf_key_guid' });
    const key = crypto.createSecretKey({ guid: keyGuid, encoding: encode.Encoding.UTF_8 });

    const hmac = crypto.createHmac({ algorithm: crypto.HashAlg.SHA256, key: key });
    hmac.update({
        input: sessionId + '|' + new Date().toISOString(),
        inputEncoding: encode.Encoding.UTF_8
    });
    return hmac.digest({ outputEncoding: encode.Encoding.HEX });
}

// GOOD: Use external crypto service for high-entropy randomness
function generateSecureToken(length) {
    const response = https.get({
        url: 'https://internal-crypto-service.company.com/random?bytes=' + length,
        headers: { 'Authorization': 'Bearer ' + getServiceToken() }
    });
    return JSON.parse(response.body).token;
}
```

---

## Certificate Management

Manage TLS certificates and authentication certificates securely within NetSuite.

```javascript
// BAD: Ignoring certificate errors or disabling validation
function callApiInsecure(url) {
    // Some environments allow disabling TLS verification - never do this
    return https.get({
        url: url,
        // certVerification: false  // NEVER disable certificate verification
    });
}

// BAD: Embedding certificate data in code
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/yGaF...
-----END RSA PRIVATE KEY-----`;
```

```javascript
// GOOD: Use NetSuite Certificate Management
// Upload certificates via Setup > Company > Certificates
function callApiWithCert(url, payload) {
    return https.post({
        url: url,
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        credentials: {
            type: https.CredentialType.CERTIFICATE,
            id: 'custcertificate_partner_mtls'
        }
    });
}

// GOOD: Validate certificate expiration proactively
function checkCertificateExpiry() {
    const certRecord = record.load({
        type: 'certificate',
        id: 'custcertificate_partner_mtls'
    });
    const expiryDate = certRecord.getValue({ fieldId: 'expirationdate' });
    const daysUntilExpiry = Math.floor(
        (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 30) {
        log.audit('CERT_EXPIRY_WARNING',
            `Certificate expires in ${daysUntilExpiry} days. Renew immediately.`);
        // Trigger notification workflow
    }
}
```

---

## Quick Reference Checklist

| Practice | Status |
|---|---|
| Use SHA-256+ for hashing (never MD5/SHA-1) | Required |
| Use bcrypt/scrypt for password hashing | Required |
| Use AES-256 for symmetric encryption | Required |
| Store keys in Script Parameters / Credentials | Required |
| Never hardcode secrets in source code | Required |
| Encrypt PII at rest | Required |
| Enforce HTTPS for all external calls | Required |
| Mask PII in logs and error messages | Required |
| Use cryptographic random for tokens | Required |
| Manage certificates through NetSuite UI | Required |
| Rotate encryption keys periodically | Recommended |
| Monitor certificate expiration dates | Recommended |

---

## See Also

- [OWASP A02:2021 - Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)
- [NetSuite N/crypto Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4418041599.html)
- [NetSuite Credential Management](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4424498498.html)
- [NIST SP 800-132 Password-Based Key Derivation](https://csrc.nist.gov/publications/detail/sp/800-132/final)
