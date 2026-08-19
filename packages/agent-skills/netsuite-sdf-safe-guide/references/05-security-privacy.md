# Principle 5: Design for Security and Privacy

> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

SuiteApps must be designed with cloud computing security requirements and SuiteCloud platform security recommendations in mind. NetSuite provides built-in security features including HTTPS transport, role-based access control, and encryption. Security cannot be bolted on after development, it must be designed from the start.

## Key Concepts

### 5.1 Roles and Permissions

A secure enterprise application should allow users to accomplish tasks using the **least possible access** to data and **lowest possible privileges**.

#### Design Principles

1. **What tasks do users need to perform?**
2. **What is the lowest role level for data access?**
3. **What are the minimum privileges needed?**

#### Using Standard Roles

NetSuite provides standard roles (Accountant, Sales Manager, etc.) with appropriate permissions. Reuse these where applicable:

```javascript
// Example: Give Automobile custom record access to sales roles
// In custom record definition, set permissions for:
// - Sales Manager: Full
// - Sales Person: View/Create/Edit
// - Accountant: View only
```

#### Creating Custom Roles

When standard roles are too restrictive or loose:

1. **Customize existing role** — Start from a similar standard role
2. **Create blank role** — Add only required permissions (recommended for security)

```xml
<!-- SDF Custom Role Definition -->
<customrole scriptid="customrole_rental_agent">
    <name>Rental Agent</name>
    <centertype>BASIC</centertype>
    <permissions>
        <permission>
            <permkey>TRAN_SALESORD</permkey>
            <permlevel>EDIT</permlevel>
        </permission>
        <permission>
            <permkey>customrecord_rental_agreement</permkey>
            <permlevel>FULL</permlevel>
        </permission>
    </permissions>
</customrole>
```

> **Permkey Validation:** Validate all `<permkey>` values using the `netsuite-sdf-roles-and-permissions` skill. This skill provides an authoritative reference of 670+ NetSuite permission IDs. See [netsuite-sdf-roles-and-permissions](../../netsuite-sdf-roles-and-permissions/SKILL.md).

### Script Deployment Audience: Internal vs External Roles

The `<allroles>T</allroles>` element in scriptdeployment XML deploys the script to **all internal NetSuite roles only**. This does NOT include external roles such as:
- Customer Center
- Partner Center
- Vendor Center
- Advanced Partner Center
- Any custom external roles

To make a script accessible to external/portal roles, you must add explicit `<audslctrole>` (audience selected role) elements within the `<scriptdeployment>` block:

```xml
<scriptdeployment scriptid="customdeploy_my_script">
  <isdeployed>T</isdeployed>
  <allroles>T</allroles>
  <!-- External roles require explicit audience entries -->
  <audslctrole>CUSTOMROLE_CUSTOMER_CENTER</audslctrole>
  <audslctrole>CUSTOMROLE_PARTNER_CENTER</audslctrole>
</scriptdeployment>
```
**Best Practice:** If external role access is not needed, `<allroles>T</allroles>` alone is sufficient. Document this decision in the script's description or a code comment.

### Suitelet `<isonline>` — Available Without Login (SECURITY CRITICAL)

The `<isonline>` element on Suitelet script deployments controls whether the Suitelet URL is accessible **without authentication**. This is one of the most security sensitive settings in SuiteScript.

| Value | Behavior |
|-------|----------|
| `<isonline>F</isonline>` | **Requires login** — only authenticated users with the appropriate role can access the Suitelet (DEFAULT and RECOMMENDED) |
| `<isonline>T</isonline>` | **No login required** — anyone with the URL can execute the Suitelet. The script runs as the role specified in `<runasrole>` with NO authentication check. |
| Omitted | NetSuite defaults to `F`, but **always include explicitly** to prevent accidental exposure |

**MANDATORY RULE:** Always include `<isonline>F</isonline>` explicitly in every Suitelet deployment. Suitelets that create, modify, query, or delete records must NEVER be available without login. See Pitfall #135.

**Legitimate uses of `<isonline>T</isonline>`** (rare):
- Anonymous customer-facing forms (for example, public feedback submission)
- Public catalog or status pages

**Even for legitimate public Suitelets** you

MUST:
- Validate all input rigorously (type, length, allowlist).
- Never expose internal IDs, record data, or error details.
- If `<runasrole>` is absolutely necessary, use a minimally privileged custom role in `<runasrole>` (NEVER `ADMINISTRATOR`).
- Set Content-Security-Policy headers.
- Log all access for audit.

SHOULD:
- Implement rate limiting or CAPTCHA.

COULD
- Implement IP address filtering using ServerRequest.clientIpAddress.

```xml
<!-- GOOD: explicit isonline=F with security comment -->
<scriptdeployment scriptid="customdeploy_my_suitelet">
  <isdeployed>T</isdeployed>
  <!-- SECURITY: Requires login. NEVER set to T for data-modifying Suitelets. -->
  <isonline>F</isonline>
  <runasrole>[CUSTOM_ROLE]</runasrole>
  <status>RELEASED</status>
  <allroles>T</allroles>
</scriptdeployment>

<!-- BAD: isonline=T on a Suitelet that creates saved searches -->
```
```xml
<scriptdeployment scriptid="customdeploy_create_saved_search">
  <isdeployed>T</isdeployed>
  <!-- PROHIBITED: Allows unauthenticated access to Administrator-level operations -->
  <isonline>T</isonline>
  <runasrole>ADMINISTRATOR</runasrole>
  <status>RELEASED</status>
  <allroles>T</allroles>
</scriptdeployment>
```

### 5.1.1 Bundle Installation Scripts

Bundle installation scripts execute with **administrator privileges** even on accounts without SuiteScript enabled.

**Security Requirements:**
- Do NOT edit/delete records outside the bundle.
- Do NOT alter account settings or features.
- Do NOT enable/disable features.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType BundleInstallationScript
 */
define(['N/record', 'N/runtime'], (record, runtime) => {

    const afterInstall = (context) => {
        // GOOD: Initialize SuiteApp data.
        initializeCustomRecords();
    };

    const afterUpdate = (context) => {
        // GOOD: Migrate data for new version.
        migrateData(context.fromVersion, context.toVersion);
    };

    // BAD: Never do this.
    const badPractice = () => {
        // Don't modify unrelated records.
        // Don't change company settings.
        // Don't enable/disable features.
    };

    return { afterInstall, afterUpdate };
});
```

### 5.2 Secure SuiteScript Designs

SuiteScript should enforce **business logic** and **data integrity**, NOT data access security.

#### Good Design

```javascript
// Use custom roles to control access.
// Scripts enforce business rules, not security.

const beforeSubmit = (context) => {
    // Validate business rules.
    validateRentalAgreement(context.newRecord);

    // Calculate derived values.
    calculateTotalCost(context.newRecord);
};
```

#### Bad Design – Avoid

```javascript
// DON'T use Execute as Admin unless absolutely necessary.
// DON'T check user roles to control data access.

const badDesign = (context) => {
    // BAD: Role checking for security.
    const role = runtime.getCurrentUser().role;
    if (role !== 'administrator') {
        throw new Error('Access denied');
    }
};
```

**Important:** Test with intended custom roles, NOT administrator role.

### 5.3 Validate Input Data

All data input to Suitelets and RESTlets must be sanitized. Adopt **zero-tolerance** for unsanitized data.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/error'], (record, error) => {

    const validateInput = (data) => {
        // Check required fields.
        if (!data.customerId || typeof data.customerId !== 'number') {
            throw error.create({
                name: 'INVALID_INPUT',
                message: 'customerId must be a number'
            });
        }

        // Validate ranges.
        if (data.quantity < 1 || data.quantity > 1000) {
            throw error.create({
                name: 'INVALID_RANGE',
                message: 'quantity must be between 1 and 1000'
            });
        }

        // Validate selections.
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(data.status)) {
            throw error.create({
                name: 'INVALID_SELECTION',
                message: 'Invalid status value'
            });
        }

        // Sanitize strings.
        data.notes = sanitizeString(data.notes);

        return data;
    };

    const sanitizeString = (str) => {
        if (!str) return '';
        // HTML entity encoding; preserves data while neutralizing injection.
        // See netsuite-owasp-secure-coding/references/03-xss-output-encoding.md.
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .trim();
    };

    // Alternative: for structured input that must be alphanumeric only.
    const validateAlphanumeric = (str) => {
        if (!str) return '';
        if (!/^[a-zA-Z0-9_\-\s]+$/.test(str)) {
            throw error.create({ name: 'INVALID_INPUT', message: 'Input contains invalid characters' });
        }
        return str.trim();
    };

    const post = (requestBody) => {
        // Validate ALL input before processing.
        const validatedData = validateInput(requestBody);

        // Now safe to process.
        return processRequest(validatedData);
    };

    return { post };
});
```

### 5.4 Password Security

#### NetSuite Passwords

- **Cannot be accessed** via UI, SuiteScript, or SuiteTalk.
- Password field is **only settable** during create/update.
- **Never store** NetSuite passwords outside NetSuite.

#### External System Credentials

**Never store unencrypted credentials** in custom records or fields.

##### Option 1: Secrets Management (Recommended)

```javascript
/**
 * Use API Secrets Management:
 * Setup > Company > Preferences > API Secrets.
 */
define(['N/https', 'N/runtime'], (https, runtime) => {

    const callExternalApi = () => {
        // Reference secret by script ID, not actual value.
        const response = https.post({
            url: 'https://api.external.com/endpoint',
            headers: {
                'Authorization': https.createSecureString({
                    input: 'Bearer {custscript_api_secret}'
                })
            },
            body: JSON.stringify({ data: 'payload' })
        });

        return response;
    };

    return { callExternalApi };
});
```

##### Option 2: NetSuite as OIDC Provider

Use OpenID Connect for external system authentication instead of storing credentials.

#### Credential Security Summary

| Not Allowed | Allowed |
|-------------|---------|
| Exposed credentials | API Secrets module |
| HTTP protocol | Masked/obfuscated fields |
| Plain text storage | Role-protected permissions |
| | Tokenized URL parameters |
| | HTTPS only |

### 5.5 Credit Card Security

#### Valid Storage Location

Only store credit card numbers in the **Credit Cards subtab** on Customer and transaction records. This field is:
- Encrypted in the database
- Masked when displayed
- PCI-DSS compliant

#### Prohibited Practices

- **Never** store credit card numbers in custom fields
- **Never** store CVV/security codes post-authorization
- **Never** store in custom records

#### PCI-DSS Compliance

If your SuiteApp handles credit cards, you must comply with PCI-DSS:
- https://www.pcisecuritystandards.org

### 5.6 SuitePayments API

For payment gateway integrations:

1. **Accountability** — Provider must be identifiable by legal name in UI.
2. **Traceability** — Payment gateway URLs are allowlisted by NetSuite.
3. **Reference codes** — Must write P/N Ref back to transactions.

### 5.7 Privacy Considerations

#### Requirements

- Describe privacy commitments to customers.
- Document data collection and usage.
- Provide link to privacy policy.
- Consider Safe Harbor certification for EU data.
- Comply with GDPR requirements.

### 5.8 Legacy Token-Based Authentication (TBA)

TBA is a legacy OAuth 1.0 pattern that should be used only to maintain existing RESTlet or SOAP integrations that do not yet have an approved replacement. Do not introduce TBA for new external integrations; prefer OAuth 2.0 and REST Web Services by default.

Use this section only when a documented migration plan or explicit compatibility exception requires TBA.

This guide intentionally omits setup, signing, header-construction, and provisioning
instructions for TBA. If a team is still maintaining a legacy TBA integration, treat
it as compatibility-only work and plan migration away from it.

#### Legacy Exception Guardrails

- Require a documented exception, owner, and migration target before retaining TBA.
- Restrict each legacy integration to a dedicated role, dedicated user, and least-privilege access.
- Do not store consumer keys, consumer secrets, token IDs, or token secrets in source code,
  script parameters, or custom fields.
- Use API Secrets for any retained confidential TBA material.
- Never share TBA credentials across integrations or environments.
- Rotate and revoke TBA material whenever users, roles, or integrations change.
- Prefer OAuth 2.0 and REST Web Services for all replacement or significant enhancement work.

### 5.9 OAuth 2.0 Authentication

OAuth 2.0 is required for new SuiteApp integrations (since 2024.2) and is the recommended auth mechanism for all new REST Web Services integrations. See Section 3.2.3 for key technical details on grant types and key requirements.

#### When to Use OAuth 2.0 vs TBA

| Scenario | Recommended Auth | Reason |
|----------|-----------------|--------|
| New REST Web Services integration | **OAuth 2.0** | Required for new SuiteApps; modern standard |
| Machine-to-machine (no user interaction) | **OAuth 2.0 Client Credentials** | Long-lived, no user consent flow |
| User-delegated access (web app) | **OAuth 2.0 Authorization Code** | Scoped to individual user |
| Existing SOAP integration under migration | **TBA (temporary legacy exception)** | SOAP does not support OAuth 2.0; plan migration away from SOAP |
| Existing RESTlet called from external system | **TBA (legacy RESTlet exception)** | RESTlets still rely on OAuth 1.0/TBA; prefer REST Web Services for new external integrations |
| New SuiteApp requiring REST | **OAuth 2.0** | SOAP not permitted for new SuiteApps |

#### Grant Types

| Grant Type | Use Case | Token Lifetime |
|------------|----------|---------------|
| **Client Credentials** | M2M, batch processes, server-to-server | Configurable; no refresh token |
| **Authorization Code** | User-facing apps, user-delegated access | Authorization code expires in 7 days |

#### Key Requirements

- Use **RSA-PSS** (min 2048-bit) or **EC keys** (256, 384, or 521 bits) — RSA PKCS#1 v1.5 is deprecated and will fail token requests.
- Store private keys securely — never in SuiteScript code; use API Secrets management.
- Include the Integration Record in your SuiteApp bundle (see 3.2.2).

#### Integration Record SDF XML for OAuth 2.0

```xml
<!-- Integration record with OAuth 2.0 enabled -->
<integration scriptid="custinteg_myapp_oauth">
    <name>My App OAuth Integration</name>
    <description>OAuth 2.0 Integration for My SuiteApp</description>
    <state>ENABLED</state>
    <oauthauthorizationcodegrantenabled>T</oauthauthorizationcodegrantenabled>
    <oauthclientcredentialsgrantenabled>T</oauthclientcredentialsgrantenabled>
</integration>
```

> **Note:** Avoid duplicating the OAuth 2.0 technical details from Section 3.2.3 (grant types, key lengths). This section focuses on the security decision of when to use OAuth 2.0. For concurrency and rate limit context, see [Appendix: SuiteTalk REST API](appendices/appendix-suitetalk-rest.md).

### 5.10 Cryptographic Functions

#### N/crypto Module

```javascript
define(['N/crypto', 'N/encode'], (crypto, encode) => {

    // Hashing
    const hashData = (data) => {
        const hash = crypto.createHash({
            algorithm: crypto.HashAlg.SHA256
        });
        hash.update({ input: data });
        return hash.digest({ outputEncoding: encode.Encoding.HEX });
    };

    // HMAC
    const createHmac = (data, secretKey) => {
        const hmac = crypto.createHmac({
            algorithm: crypto.HashAlg.SHA256,
            key: secretKey
        });
        hmac.update({ input: data });
        return hmac.digest({ outputEncoding: encode.Encoding.BASE_64 });
    };

    // Encryption
    const encryptData = (data, secretKey) => {
        const cipher = crypto.createCipher({
            algorithm: crypto.EncryptionAlg.AES,
            key: secretKey
        });
        cipher.update({ input: data });
        return cipher.final({ outputEncoding: encode.Encoding.HEX });
    };

    return { hashData, createHmac, encryptData };
});
```

#### Secure Random Numbers

**Don't use** `Math.random()` for cryptographic purposes. Use `N/crypto/random`:

```javascript
define(['N/crypto/random', 'N/encode'], (random, encode) => {

    const generateNonce = () => {
        const randomBytes = random.generateBytes({ size: 16 });

        let output = '';
        for (let i = 0; i < randomBytes.length; i++) {
            output += String.fromCharCode(randomBytes[i]);
        }

        return encode.convert({
            string: output,
            inputEncoding: encode.Encoding.UTF_8,
            outputEncoding: encode.Encoding.BASE_64_URL_SAFE
        });
    };

    return { generateNonce };
});
```

#### Algorithm Recommendations

| Purpose | Recommended | Deprecated |
|---------|-------------|------------|
| Hashing | SHA-256, SHA-512 | MD5, SHA-1 |
| HMAC | HMAC-SHA256 | HMAC-MD5, HMAC-SHA1 |
| Encryption | AES | DES, 3DES |

## Best Practices Summary

1. **Use least privilege** — Minimum permissions for each role.
2. **Validate all input** — Zero tolerance for unsanitized data.
3. **Never store credentials** unencrypted.
4. **Use OAuth 2.0** for new integrations; reserve TBA for documented legacy RESTlet/SOAP exceptions.
5. **Test with actual roles** — Not administrator.
6. **Use N/crypto** for cryptographic operations.
7. **HTTPS only** — Never HTTP.
8. **Document privacy practices** — Be transparent with users.

## Common Pitfalls

1. **Using Execute as Admin** unnecessarily.
2. **Storing passwords** in custom fields.
3. **Skipping input validation** on Suitelets/RESTlets.
4. **Using Math.random()** for security purposes.
5. **Testing only with admin role**.
6. **Hard-coding or using script parameters to store credentials** for scripts.
7. **Using deprecated algorithms** (MD5, SHA-1).

## Further Reading

Search in NetSuite Help Center or SuiteAnswers:
- Roles and Permissions
- N/crypto Module
- API Secrets
- PCI-DSS Compliance
- OAuth 2.0 Authentication
- NetSuite as OIDC Provider

---

## Cross-Reference: OWASP Secure Coding Practices

For implementation-depth coverage of OWASP security patterns (injection prevention, XSS output encoding, CSP headers, file security, API hardening, and 48+ pitfalls with code examples), see the **`netsuite-owasp-secure-coding`** skill:

- [Injection Prevention](../../netsuite-owasp-secure-coding/references/01-injection-prevention.md)
- [XSS & Output Encoding](../../netsuite-owasp-secure-coding/references/03-xss-output-encoding.md)
- [Access Control](../../netsuite-owasp-secure-coding/references/04-access-control.md)
- [Cryptography & Data Protection](../../netsuite-owasp-secure-coding/references/06-cryptography-data-protection.md)
- [Security Checklist (80+ items)](../../netsuite-owasp-secure-coding/references/appendices/appendix-security-checklist.md)
