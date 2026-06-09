Copyright (c) 2026 Oracle and/or its affiliates.
Licensed under the Universal Permissive License v1.0 as shown at [The Universal Permissive License (UPL), Version 1.0](https://oss.oracle.com/licenses/upl).

# Authentication & Session Management (A07:2021)
> Author: Oracle NetSuite

## Overview

Authentication and session management flaws allow attackers to compromise passwords,
keys, or session tokens, or to exploit other implementation flaws to assume other
users' identities. In NetSuite, this may include secure handling of legacy
Token-Based Authentication (TBA) exceptions, session state, credential storage,
and OAuth 2.0 flows for new integrations.

**OWASP Reference:** [A07:2021 - Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/).

---

## 1. Credential Storage: Never Hardcode Secrets

A critical authentication mistake is embedding credentials directly in source code.
Source code is stored in the File Cabinet, version control, deployed across environments, and visible to
developers; none of these are appropriate places for secrets.

### Example 1: Hardcoded Credentials

```javascript
// ===== BAD: Credentials hardcoded in script =====
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/https'], (https) => {
    const execute = (context) => {
        // VULNERABLE: Credentials visible in source code, version control, and logs
        const API_KEY = 'xx-prod-a8f3k29d5e7b1c4f6';
        const API_SECRET = 'secret_xK9mP2nQ7rT4wY6z';

        const response = https.post({
            url: 'https://api.vendor.com/data',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'X-API-Secret': API_SECRET
            },
            body: JSON.stringify({ action: 'fetch' })
        });
    };

    return { execute };
});
```

### Example 2: Script Parameters Are Not a Secret Store

Script parameters are for configurable script behavior, not for confidential values.
Always flag API keys, client secrets, refresh tokens, and TBA token material stored in
script parameters as a security issue.

```javascript
// ===== BAD: Credentials stored in Script Parameters =====
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/https', 'N/runtime'], (https, runtime) => {
    const execute = () => {
        const script = runtime.getCurrentScript();

        // ANTIPATTERN: Script parameters are not a secret store and should be flagged.
        // Oracle warns confidential information in script parameters can be indexed
        // by search engines and become publicly visible.
        const apiKey = script.getParameter({ name: 'custscript_vendor_api_key' });
        const apiSecret = script.getParameter({ name: 'custscript_vendor_api_secret' });

        const response = https.post({
            url: 'https://api.vendor.com/data',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'X-API-Secret': apiSecret
            },
            body: JSON.stringify({ action: 'fetch' })
        });
    };

    return { execute };
});
```

```javascript
// ===== GOOD: Credentials referenced from API Secrets =====
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/https', 'N/log'], (https, log) => {
    const execute = () => {
        const response = https.post({
            url: 'https://api.vendor.com/data',
            headers: {
                'Authorization': https.createSecureString({
                    input: 'Bearer {custsecret_vendor_api_token}'
                }),
                'X-API-Secret': https.createSecureString({
                    input: '{custsecret_vendor_api_secret}'
                })
            },
            body: JSON.stringify({ action: 'fetch' })
        });

        if (response.code >= 400) {
            log.error('Vendor API Error', `${response.code} ${response.body}`);
        }
    };

    return { execute };
});
```

> **Oracle NetSuite Help:** [Creating Script Parameters Overview](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N2999300.html),
> [Secrets Management](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_160216486846.html),
> and [Secrets as XML Definitions](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_162072306524.html)
> document that script parameters must not contain confidential information and that
> API Secrets plus `custsecret_*.xml` references are the supported secret-management pattern.

**SDF form of the same rule:**

```xml
<!-- ===== BAD: Secrets in SDF deploy.xml or manifest.xml ===== -->
<!-- These files are committed to version control -->
<scriptdeployment scriptid="customdeploy_integration">
    <scriptparametervalue scriptid="custscript_api_key">sk-prod-a8f3k29d</scriptparametervalue>
</scriptdeployment>
```

```xml
<!-- ===== GOOD: Import a secret object reference into the SDF project ===== -->
<!-- Create the secret in NetSuite UI first, then import the custsecret_* object -->
<secret scriptid="custsecret_vendor_api_key"/>
```

> **Best Practice:** Create secrets in NetSuite UI first, then import the resulting
> `custsecret_*.xml` object into the SDF project. Treat the XML as a reference to an
> API Secret, not as the place where the secret value is authored. Do not include
> confidential information in script parameters; Oracle warns that script parameter
> values can be indexed by search engines and become publicly visible. Reserve script
> parameters for non-confidential configuration such as URLs, IDs, and feature toggles.

---

## 2. Legacy Token-Based Authentication (TBA) Security

NetSuite TBA uses OAuth 1.0 with consumer key/secret and token key/secret pairs.
Treat it as a legacy compatibility path for existing RESTlet and SOAP integrations, not the default for new external interfaces. When the implementation is changing, suggest updating the authentication to use OAuth 2.0 per NetSuite best practices. These four values must be protected with the same rigor as passwords.

Credential storage guidance from Example 2 applies equally to TBA token material.
Do not store consumer keys, consumer secrets, token IDs, or token secrets in script
parameters. Use API Secrets for confidential TBA material and, when SDF needs to
carry the reference, import the matching `custsecret_*.xml` object into the project.

**Oracle NetSuite Help:** [Creating Script Parameters Overview](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N2999300.html),
[Secrets Management](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_160216486846.html),
and [Secrets as XML Definitions](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_162072306524.html).

> **TBA Security Rules:**
> - Do not choose TBA for new or to-be-enhanced external integrations; prefer OAuth 2.0 where supported.
> - Rotate tokens on a regular schedule (at least annually).
> - Use the minimum permission role necessary for each integration.
> - Never share tokens across environments (sandbox vs. production).
> - Immediately revoke tokens when an integration is decommissioned.

---

## 3. Session State Management

When you have a requirement to store state associated with a user session, use the provided SuiteScript APIs, do not
implement custom session state management. Doing so exposes users to major security risks.

### Example 3: Session Handling in Suitelets

```javascript
// ===== BAD: Roll-your-own session management with N/cache =====
define(['N/cache', 'N/crypto', 'N/runtime', 'N/encode'], (cache, crypto, runtime, encode) => {
    const onRequest = (context) => {
        const sessionCache = cache.getCache({ name: 'USER_SESSIONS' });

        if (context.request.method === 'GET') {
            const sid = crypto.createSecretKey({
                encoding: encode.Encoding.HEX,
                guid: true
            }).guid;

            sessionCache.put({
                key: sid,
                value: String(runtime.getCurrentUser().id),
                ttl: 1800
            });

            context.response.write(`<form method="POST"><input type="hidden" name="sid" value="${sid}"></form>`);
            return;
        }

        const ownerId = sessionCache.get({ key: context.request.parameters.sid });
        if (ownerId !== String(runtime.getCurrentUser().id)) {
            context.response.write('Invalid session.');
        }
    };

    return { onRequest };
});
```

```javascript
// ===== GOOD: Use runtime.Session for per-user Suitelet state =====
define(['N/runtime', 'N/ui/serverWidget'], (runtime, serverWidget) => {
    const SESSION_KEYS = {
        FLOW_OWNER: 'custsession_flow_owner',
        FLOW_STARTED: 'custsession_flow_started'
    };

    const onRequest = (context) => {
        const currentUser = runtime.getCurrentUser();
        const session = runtime.getCurrentSession();

        if (context.request.method === 'GET') {
            session.set({
                name: SESSION_KEYS.FLOW_OWNER,
                value: String(currentUser.id)
            });
            session.set({
                name: SESSION_KEYS.FLOW_STARTED,
                value: new Date().toISOString()
            });

            const form = serverWidget.createForm({
                title: 'Secure Session Flow'
            });
            form.addSubmitButton({
                label: 'Continue'
            });
            context.response.writePage(form);
            return;
        }

        if (session.get({ name: SESSION_KEYS.FLOW_OWNER }) !== String(currentUser.id)) {
            context.response.write('Session expired. Please start over.');
            return;
        }

        context.response.write(
            `Continuing flow started at ${session.get({ name: SESSION_KEYS.FLOW_STARTED })}.`
        );
    };

    return { onRequest };
});
```

> **Oracle NetSuite Help:** [runtime.Session](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4296528369.html#bridgehead_4439975143),
> [runtime.getCurrentSession()](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4296529736.html),
> [Session.set(options)](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4296667139.html),
> [Session.get(options)](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4296666278.html),
> and [Create a Custom Form with a Submit Button, Fields, and an Inline Editor Sublist](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_0111015914.html)
> define the supported API for user-defined session state and the standard Suitelet form pattern.
> Prefer these APIs plus `serverWidget.createForm()` / `response.writePage(form)` over custom session tokens carried through ad hoc HTML and stored in `N/cache`.

---

## 4. Cookie Security Attributes

When Suitelets set cookies (via response headers), they must include security attributes.

### Example 4: Secure Cookie Configuration

```javascript
// ===== BAD: Cookies without security attributes =====
define([], () => {
    const onRequest = (context) => {
        // VULNERABLE: Missing HttpOnly, Secure, and SameSite attributes
        context.response.setHeader({
            name: 'Set-Cookie',
            value: 'userPref=theme-dark'
        });
    };
});
```

```javascript
// ===== GOOD: Cookies with full security attributes =====
define([], () => {
    const onRequest = (context) => {
        // SAFE: All security attributes set
        context.response.setHeader({
            name: 'Set-Cookie',
            value: [
                'userPref=theme-dark',
                'HttpOnly',          // Prevents JavaScript access (mitigates XSS)
                'Secure',            // Only sent over HTTPS
                'SameSite=Strict',   // Prevents CSRF via cross-site requests
                'Path=/',            // Scope to entire site
                'Max-Age=3600'       // 1 hour expiration
            ].join('; ')
        });
    };
});
```

> **Cookie Attribute Reference:**
> | Attribute    | Purpose                                          |
> |--------------|--------------------------------------------------|
> | `HttpOnly`   | Prevents client-side JS from reading the cookie  |
> | `Secure`     | Cookie only sent over HTTPS                      |
> | `SameSite`   | Controls cross-origin cookie sending             |
> | `Path`       | Restricts cookie to a URL path                   |
> | `Max-Age`    | Sets expiration in seconds                       |

---

## 5. OAuth 2.0 for External Integrations

When integrating NetSuite with external services using OAuth 2.0, follow secure patterns
for token storage and refresh.

### Example 5: OAuth 2.0 Token Refresh

```javascript
// ===== BAD: OAuth secrets stored in plain text custom record fields =====
define(['N/record', 'N/https'], (record, https) => {
    const refreshToken = () => {
        const tokenRec = record.load({
            type: 'customrecord_oauth_tokens',
            id: 1
        });

        // VULNERABLE: Secret material stored directly in record fields.
        const refreshTkn = tokenRec.getValue({ fieldId: 'custrecord_refresh_token' });
        const clientId = tokenRec.getValue({ fieldId: 'custrecord_client_id' });
        const clientSecret = tokenRec.getValue({ fieldId: 'custrecord_client_secret' });

        const response = https.post({
            url: 'https://oauth.vendor.com/token',
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshTkn,
                client_id: clientId,
                client_secret: clientSecret
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    };

    return { refreshToken };
});
```

```javascript
// ===== GOOD: Restricted token record plus API Secrets for client auth =====
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/https', 'N/log'], (record, https, log) => {
    const execute = () => {
        let tokenRec;
        try {
            tokenRec = record.load({
                type: 'customrecord_oauth_tokens',
                id: 1
            });
        } catch (e) {
            log.error('Access Denied', 'Cannot load token record; check role permissions.');
            return;
        }

        const refreshTkn = tokenRec.getValue({ fieldId: 'custrecord_refresh_token' });

        const response = https.post({
            url: 'https://oauth.vendor.com/token',
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshTkn
            }).toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': https.createSecureString({
                    input: 'Basic {custsecret_vendor_oauth_basic_auth}'
                })
            }
        });

        if (response.code === 200) {
            const tokens = JSON.parse(response.body);

            // Update stored tokens
            tokenRec.setValue({ fieldId: 'custrecord_access_token', value: tokens.access_token });
            if (tokens.refresh_token) {
                tokenRec.setValue({ fieldId: 'custrecord_refresh_token', value: tokens.refresh_token });
            }
            tokenRec.setValue({
                fieldId: 'custrecord_token_expiry',
                value: new Date(Date.now() + tokens.expires_in * 1000)
            });
            tokenRec.save();

            log.audit('OAuth', 'Tokens refreshed successfully.');
        } else {
            log.error('OAuth Error', `Token refresh failed: ${response.code} ${response.body}`);
        }
    };

    return { execute };
});
```

> **Oracle NetSuite Help:** [Secrets Management](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_160216486846.html)
> and [Secrets as XML Definitions](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_162072306524.html)
> align this pattern with the rest of the file: client-secret material belongs in API Secrets,
> and any SuiteCloud project reference should use an imported `custsecret_*.xml` object rather than
> script parameters.

---

## 6. Multi-Factor Authentication Considerations

NetSuite supports MFA natively. Scripts should never attempt to bypass or weaken MFA.

### Example 6: Respecting MFA in RESTlet Authentication

```javascript
// ===== BAD: Disabling 2FA requirement for convenience =====
// Do NOT configure integration roles with "Web Services Only" to bypass MFA.
// Do NOT create a dedicated "no-MFA" role with elevated permissions.

// ===== GOOD: Enforce MFA through proper role configuration =====
// - All interactive user roles should require MFA.
// - Integration roles should use OAuth 2.0 where supported; if a legacy
//   RESTlet or SOAP integration still requires TBA, use TBA instead of password-based auth.
// - Audit integration roles to ensure they have minimum required permissions.
// - Review Setup > Company > Two-Factor Authentication Roles regularly.
```

---

## 7. Prohibit Custom Password Authentication

Do not implement custom username/password authentication, password storage, password
reset flows, password policy logic, or failed-login handling in Suitelets, RESTlets,
custom records, or custom portals. Treat any request to collect or validate passwords
in SuiteScript as a security and architecture issue that must be redesigned.

Use supported NetSuite authentication surfaces instead:

- NetSuite UI authentication plus native MFA for interactive access.
- OpenID Connect (OIDC) or SAML Single Sign-on for inbound SSO to NetSuite.
- OAuth 2.0 for API integrations, with TBA reserved for legacy exceptions only.
- NetSuite as OIDC Provider when NetSuite must act as the identity provider for an
  outbound SSO or integration scenario.

Available Without Login Suitelets are not a substitute for a real authentication
system. Using public Suitelets for authentication is prohibited.

> **Oracle NetSuite Help:** [Authentication Overview](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_4369651411.html),
> [Setting Available Without Login](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N2997713.html),
> [OpenID Connect (OIDC) Single Sign-on](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156399873235.html),
> [SAML Single Sign-on](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N3825119.html),
> and [NetSuite as OIDC Provider](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_160077062690.html)
> describe the supported authentication surfaces and security boundaries.

---

## Prevention Checklist

- [ ] **No credentials in source code**. Confidential values come from API Secrets or another supported secret store, never from code or script parameters.
- [ ] **No secret values in SDF configuration files** committed to version control; only imported `custsecret_*.xml` references are allowed.
- [ ] **Script parameters** are used only for non-confidential configuration such as URLs, IDs, and feature flags.
- [ ] **Legacy TBA token material** uses API Secrets and is rotated regularly.
- [ ] **No custom session mechanism** uses `N/cache`, URL parameters, hidden fields, or ad hoc cookies to track authenticated state.
- [ ] **Per-user Suitelet state** uses `runtime.getCurrentSession()` / `runtime.Session`.
- [ ] **Cookies** include `HttpOnly`, `Secure`, and `SameSite` attributes.
- [ ] **OAuth tokens** are stored in access-restricted records, not plain text fields.
- [ ] **Client secrets** come from API Secrets, not code or script parameters.
- [ ] **MFA is enforced** for all interactive roles; integration roles use OAuth 2.0 where supported and TBA only for legacy exceptions.
- [ ] **Custom username/password authentication** in Suitelets, RESTlets, and custom portals is prohibited and must be flagged.
- [ ] **"Available Without Login" Suitelet authentication** is prohibited.
- [ ] **Integration roles** follow the principle of least privilege.

---

## Related OWASP Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Credential Stuffing Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html)
- [CWE-287: Improper Authentication](https://cwe.mitre.org/data/definitions/287.html)
- [CWE-384: Session Fixation](https://cwe.mitre.org/data/definitions/384.html)
