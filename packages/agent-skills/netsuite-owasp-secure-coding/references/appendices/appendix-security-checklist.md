# Appendix: Security Checklist
> Author: Oracle NetSuite

## Overview

This checklist provides a comprehensive, phase-organized set of security verification
items for NetSuite SuiteScript and SDF development projects. Each item includes a
category tag and severity indicator to support prioritization.

**Severity Indicators:**
- **[CRITICAL]** - Must be addressed before any deployment. Failure creates immediate exploitable risk.
- **[HIGH]** - Must be addressed before production deployment. Represents significant risk.
- **[MEDIUM]** - Should be addressed within the current development cycle.
- **[LOW]** - Should be addressed as part of ongoing improvement.

---

## Design Phase

### Threat Modeling

- [ ] 1. **[CRITICAL][THREAT-MODEL]** Threat model completed for all new features and integrations.
- [ ] 2. **[HIGH][THREAT-MODEL]** Data flow diagrams created showing all trust boundaries.
- [ ] 3. **[HIGH][THREAT-MODEL]** STRIDE analysis performed for each component (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).
- [ ] 4. **[MEDIUM][THREAT-MODEL]** Third-party integration risks documented and reviewed.
- [ ] 5. **[MEDIUM][THREAT-MODEL]** Attack surface inventory maintained and updated.

### Authentication Design

- [ ] 6. **[CRITICAL][AUTH-DESIGN]** Authentication mechanism selected and documented (OAuth 2.0, Token-Based Authentication, NetSuite Role-Based).
- [ ] 7. **[CRITICAL][AUTH-DESIGN]** Multi-factor authentication required for administrative access.
- [ ] 8. **[HIGH][AUTH-DESIGN]** Session management strategy defined (timeout, renewal, invalidation).
- [ ] 9. **[HIGH][AUTH-DESIGN]** Credential storage approach uses platform-managed secrets (not hardcoded).

### Authorization Model

- [ ] 10. **[CRITICAL][AUTHZ-DESIGN]** Role-based access control (RBAC) matrix defined for all operations.
- [ ] 11. **[HIGH][AUTHZ-DESIGN]** Principle of least privilege applied to all roles and script deployments.
- [ ] 12. **[HIGH][AUTHZ-DESIGN]** Authorization checks enforced server-side, never client-side only.

### Data Classification and Encryption

- [ ] 13. **[CRITICAL][DATA-DESIGN]** Data classification completed (public, internal, confidential, restricted).
- [ ] 14. **[HIGH][DATA-DESIGN]** Encryption requirements defined for data at rest and in transit.
- [ ] 15. **[HIGH][DATA-DESIGN]** PII and sensitive data fields identified and protection strategy documented.

---

## Implementation Phase

### Input Validation

- [ ] 16. **[CRITICAL][INPUT-VAL]** All RESTlet parameters validated against an allowlist of expected types and formats.
- [ ] 17. **[CRITICAL][INPUT-VAL]** All Suitelet GET/POST parameters validated and sanitized.
- [ ] 18. **[CRITICAL][INPUT-VAL]** Input length limits enforced on all string parameters.
- [ ] 19. **[HIGH][INPUT-VAL]** Numeric inputs validated for type, range, and precision.
- [ ] 20. **[HIGH][INPUT-VAL]** Email addresses validated using a well-tested regex or library.
- [ ] 21. **[HIGH][INPUT-VAL]** URL inputs validated for protocol (HTTPS only) and domain allowlist.
- [ ] 22. **[HIGH][INPUT-VAL]** Date and time inputs validated for format and logical range.
- [ ] 23. **[MEDIUM][INPUT-VAL]** Validation is applied on the server side even if client-side validation exists.
- [ ] 24. **[MEDIUM][INPUT-VAL]** Rejection responses do not reveal internal validation logic or data structures.

### Output Encoding

- [ ] 25. **[CRITICAL][OUTPUT-ENC]** All dynamic content rendered in HTML is encoded using `N/encode` or equivalent.
- [ ] 26. **[CRITICAL][OUTPUT-ENC]** JavaScript context output is properly escaped (JSON.stringify for data).
- [ ] 27. **[HIGH][OUTPUT-ENC]** URL parameters are encoded with `encodeURIComponent()`.
- [ ] 28. **[HIGH][OUTPUT-ENC]** CSS context values are validated against an allowlist (no expression() or url()).
- [ ] 29. **[MEDIUM][OUTPUT-ENC]** Content-Type headers explicitly set on all responses (application/json, text/html).

### SQL/SuiteQL Parameterization

- [ ] 30. **[CRITICAL][SQL-PARAM]** All SuiteQL queries use parameterized inputs (`query.runSuiteQL` with params array).
- [ ] 31. **[CRITICAL][SQL-PARAM]** No string concatenation used to build SuiteQL query conditions.
- [ ] 32. **[HIGH][SQL-PARAM]** Dynamic column or table names validated against a strict allowlist.
- [ ] 33. **[HIGH][SQL-PARAM]** Saved search filters use typed filter expressions, not raw strings.

### File Handling

- [ ] 34. **[CRITICAL][FILE]** Uploaded file types validated against an allowlist of permitted MIME types.
- [ ] 35. **[CRITICAL][FILE]** Uploaded file sizes enforced with maximum limits.
- [ ] 36. **[HIGH][FILE]** File names sanitized to remove path traversal characters (`..`, `/`, `\`).
- [ ] 37. **[HIGH][FILE]** File storage locations restricted to designated cabinet folders.
- [ ] 38. **[MEDIUM][FILE]** File content scanned or validated beyond extension checking (magic bytes).

### Error Handling

- [ ] 39. **[CRITICAL][ERROR]** No stack traces, internal paths, or system details exposed to end users.
- [ ] 40. **[CRITICAL][ERROR]** Generic error messages returned to clients; details logged server-side.
- [ ] 41. **[HIGH][ERROR]** All try-catch blocks handle errors explicitly (no empty catch blocks).
- [ ] 42. **[HIGH][ERROR]** Error responses use consistent format and appropriate HTTP status codes.
- [ ] 43. **[MEDIUM][ERROR]** Unexpected errors trigger alerts for the security team's review.

### Session Management

- [ ] 44. **[CRITICAL][SESSION]** Session tokens are not exposed in URLs or logs.
- [ ] 45. **[HIGH][SESSION]** Session timeout configured appropriately for the application context.
- [ ] 46. **[HIGH][SESSION]** Session invalidated on logout and after password change.
- [ ] 47. **[MEDIUM][SESSION]** Concurrent session limits enforced where appropriate.

### Cryptography

- [ ] 48. **[CRITICAL][CRYPTO]** No custom cryptographic algorithms; only established libraries used (`N/crypto`).
- [ ] 49. **[CRITICAL][CRYPTO]** Encryption keys are not hardcoded in scripts; use NetSuite key management.
- [ ] 50. **[HIGH][CRYPTO]** Hash algorithms use SHA-256 or stronger (never MD5 or SHA-1 for security).

### API Security

- [ ] 51. **[CRITICAL][API]** All RESTlet endpoints require authentication.
- [ ] 52. **[CRITICAL][API]** Rate limiting configured on externally exposed endpoints.
- [ ] 53. **[HIGH][API]** API responses include only necessary data (no over-fetching).
- [ ] 54. **[HIGH][API]** CORS configuration restricts allowed origins to known domains.
- [ ] 55. **[HIGH][API]** API versioning strategy implemented to manage deprecation securely.
- [ ] 56. **[MEDIUM][API]** Request and response payloads validated against JSON schemas.

### Logging

- [ ] 57. **[CRITICAL][LOGGING]** No sensitive data (passwords, tokens, PII) written to logs.
- [ ] 58. **[HIGH][LOGGING]** All authentication events logged (success and failure).
- [ ] 59. **[HIGH][LOGGING]** All authorization failures logged with request context.
- [ ] 60. **[HIGH][LOGGING]** Log entries include timestamp, user identity, action, and outcome.
- [ ] 61. **[MEDIUM][LOGGING]** Log injection prevented by sanitizing user-supplied data in log messages.
- [ ] 62. **[MEDIUM][LOGGING]** Audit logs are tamper-resistant (write-only access for the application).

---

## Testing Phase

### Static Analysis

- [ ] 63. **[CRITICAL][SAST]** ESLint with security plugins runs on all SuiteScript files.
- [ ] 64. **[HIGH][SAST]** Custom ESLint rules enforce parameterized SuiteQL and input validation.
- [ ] 65. **[HIGH][SAST]** No TODO/FIXME comments related to security bypass remain in code.
- [ ] 66. **[MEDIUM][SAST]** Code complexity metrics reviewed for overly complex security-critical functions.

### Dynamic Testing

- [ ] 67. **[CRITICAL][DAST]** All RESTlet endpoints tested with malformed, oversized, and injection payloads.
- [ ] 68. **[CRITICAL][DAST]** All Suitelet forms tested for XSS and CSRF vulnerabilities.
- [ ] 69. **[HIGH][DAST]** Authentication bypass attempts tested (missing tokens, expired tokens, role escalation).
- [ ] 70. **[HIGH][DAST]** File upload endpoints tested with prohibited file types and oversized files.

### Penetration Testing

- [ ] 71. **[HIGH][PENTEST]** An annual penetration test covers all custom SuiteScript endpoints.
- [ ] 72. **[HIGH][PENTEST]** Penetration test scope includes third-party integrations.
- [ ] 73. **[MEDIUM][PENTEST]** Findings from previous penetration tests verified as resolved.

### Dependency Scanning

- [ ] 74. **[CRITICAL][DEPS]** All third-party libraries scanned for known vulnerabilities (CVEs).
- [ ] 75. **[HIGH][DEPS]** Dependency versions pinned to avoid unexpected updates.
- [ ] 76. **[HIGH][DEPS]** Automated alerts configured for new vulnerabilities in dependencies.
- [ ] 77. **[MEDIUM][DEPS]** Unused dependencies removed from the project.

### Configuration Review

- [ ] 78. **[HIGH][CONFIG]** SDF deployment configurations reviewed for overly permissive settings.
- [ ] 79. **[HIGH][CONFIG]** Script deployment audience restricted to required roles only.
- [ ] 80. **[MEDIUM][CONFIG]** Environment-specific settings (sandbox vs. production) validated.

---

## Deployment Phase

### Security Headers

- [ ] 81. **[CRITICAL][HEADERS]** Content-Security-Policy header set on all Suitelet responses.
- [ ] 82. **[HIGH][HEADERS]** X-Content-Type-Options: nosniff is set on all responses.
- [ ] 83. **[HIGH][HEADERS]** X-Frame-Options set to DENY or SAMEORIGIN as appropriate.
- [ ] 84. **[HIGH][HEADERS]** Strict-Transport-Security header configured (HSTS).
- [ ] 85. **[MEDIUM][HEADERS]** Referrer-Policy header set to strict-origin-when-cross-origin or stricter.
- [ ] 86. **[MEDIUM][HEADERS]** Permissions-Policy header restricts unnecessary browser features.

### Error Page Configuration

- [ ] 87. **[CRITICAL][ERROR-PAGE]** Custom error pages configured for 4xx and 5xx responses.
- [ ] 88. **[HIGH][ERROR-PAGE]** Error pages do not reveal server version, stack traces, or internal paths.
- [ ] 89. **[MEDIUM][ERROR-PAGE]** Error pages provide a user-friendly message and support contact.

### Logging Configuration

- [ ] 90. **[CRITICAL][LOG-CONFIG]** Production logging level set appropriately (no debug-level logging).
- [ ] 91. **[HIGH][LOG-CONFIG]** Log retention policy configured per compliance requirements.
- [ ] 92. **[HIGH][LOG-CONFIG]** Log access restricted to authorized personnel only.
- [ ] 93. **[MEDIUM][LOG-CONFIG]** Centralized log aggregation configured for security event correlation.

### Monitoring Setup

- [ ] 94. **[CRITICAL][MONITOR]** Alerts configured for repeated authentication failures.
- [ ] 95. **[HIGH][MONITOR]** Alerts configured for unusual API usage patterns (volume spikes, off-hours).
- [ ] 96. **[HIGH][MONITOR]** Alerts configured for authorization failures and privilege escalation attempts.
- [ ] 97. **[MEDIUM][MONITOR]** Baseline metrics established for normal traffic and error rates.
- [ ] 98. **[MEDIUM][MONITOR]** Dashboard created for real-time security event visibility.

### Incident Response

- [ ] 99. **[CRITICAL][IR]** Incident response plan documented and accessible to the team.
- [ ] 100. **[CRITICAL][IR]** Contact list for security incidents maintained and current.
- [ ] 101. **[HIGH][IR]** Rollback procedure tested and documented for each deployment.
- [ ] 102. **[HIGH][IR]** Data breach notification process defined per regulatory requirements.
- [ ] 103. **[MEDIUM][IR]** Post-incident review process defined and enforced.
- [ ] 104. **[MEDIUM][IR]** Incident response drill conducted at least annually.

---

## Usage Guide

### Applying This Checklist

1. **New Feature Development** -- Complete all Design Phase items before implementation begins.
2. **Sprint Review** -- Verify all Implementation Phase items for code produced in the sprint.
3. **Pre-Release Gate** -- All Testing Phase items must pass before release approval.
4. **Deployment Approval** -- All Deployment Phase items verified before production push.

### Tracking Format

Use a tracking spreadsheet or issue tracker with the following columns:

| Item # | Category | Severity | Status | Owner | Date Completed | Notes |
|--------|----------|----------|--------|-------|----------------|-------|
| 1 | THREAT-MODEL | CRITICAL | Done | J.Smith | 2025-03-15 | Reviewed in design meeting |

### Exceptions

Any item marked as an exception must include:
- Justification for the exception.
- Compensating controls implemented.
- Approval from the security lead.
- Scheduled review date for reassessment.

---

## References

- OWASP Secure Coding Practices Quick Reference Guide
- OWASP Application Security Verification Standard (ASVS) v4.0
- NetSuite SuiteScript 2.1 Security Best Practices
- NIST SP 800-53 Security and Privacy Controls
