# Appendix: SuiteTalk REST Web Services Reference

> Author: Oracle NetSuite
> Related: [Principle 1 — SuiteTalk](../01-understand-netsuite-features.md) · [Principle 3 — Performance](../03-performance-optimization.md) · [Principle 5 — Security](../05-security-privacy.md) · [SAFE Guide Index](../safe-guide-index.md)

---

## SOAP Deprecation Timeline

| Milestone | Date | Details |
|-----------|------|---------|
| SOAP not permitted for new SuiteApps | **2024.2** | All new SuiteApp integrations must use REST |
| Last new SOAP endpoint added | **2025.2** | No future SOAP endpoints will be added |
| All SOAP endpoints permanently disabled | **2028.2** | Hard deadline — existing SOAP integrations must be migrated |

**Action required:** If your SuiteApp or integration uses SOAP Web Services, plan migration to REST + OAuth 2.0 well before 2028.2.

---

## REST API Fundamentals

### Base URL Pattern

> **Note:** Consult Oracle REST Web Services documentation for exact base URL format, as it varies by account region and configuration.

Standard REST patterns:
- **GET** — Retrieve record(s)
- **POST** — Create record
- **PUT** / **PATCH** — Update record (full / partial)
- **DELETE** — Delete record

### Common HTTP Response Codes

| Code | Meaning | Notes |
|------|---------|-------|
| 200 | OK | Successful GET or PATCH |
| 201 | Created | Successful POST (synchronous create) |
| 202 | Accepted | Async operation queued (for example, Batch) — poll job status |
| 204 | No Content | Successful DELETE or Attach/Detach |
| 400 | Bad Request | Validation or format error |
| 401 | Unauthorized | Invalid or expired OAuth token |
| 403 | Forbidden | Insufficient permissions for this record/operation |
| 404 | Not Found | Record ID not found |
| 429 | Too Many Requests | Concurrency limit exceeded — back off and retry |

---

## 2026.1 REST API New Features

### Attach/Detach Endpoint

Introduced in NetSuite 2026.1. Allows attaching or detaching records via a dedicated endpoint.

**Endpoint pattern:**
```
POST .../record/v1/{recordType1}/{id1}/!attach/{recordType2}/{id2}
POST .../record/v1/{recordType1}/{id1}/!detach/{recordType2}/{id2}
```

**Returns:** HTTP 204 (No Content) on success.

**Supported record types (2026.1):** Contact and File only. Attempting other record types returns an error.

**Workaround for unsupported types:** Use SuiteScript `N/record` module's `attach()` API inside a RESTlet or Suitelet:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record'], (record) => {
    const post = (body) => {
        record.attach({
            record: { type: body.type1, id: body.id1 },
            to:     { type: body.type2, id: body.id2 }
        });
        return { success: true };
    };
    return { post };
});
```

---

### Batch Operations

Introduced in NetSuite 2026.1. Allows processing multiple records of the same type in a single request.

**Why use Batch:**
- Reduces total request count for bulk operations.
- Frees concurrency slots faster than serial calls.
- Suited for nightly syncs and bulk imports.

**Async pattern:**
1. Submit batch request → receive HTTP 202 with job reference.
2. Poll the job status endpoint periodically.
3. When all tasks report COMPLETE or FAILED, process results.

> **Important:** Do NOT treat the HTTP 202 response as operation completion. The work is still in progress. Polling is mandatory.

> **Consult Oracle REST Web Services documentation** for exact request format, required headers, batch size limits, and job polling URL pattern. These details are subject to change between releases.

---

### create-form

Introduced in NetSuite 2026.1. Returns the field schema and form structure for a record type, enabling dynamic form construction in external applications.

> **Consult Oracle REST Web Services documentation** for exact endpoint path and Accept header requirements.

---

### selectOptions Endpoint

Introduced in NetSuite 2026.1. Returns the available options for a select (list/record) field, taking the current user's role into account.

**Key behavior:** Response is role-aware — options visible to the requesting user's role are returned. This avoids hardcoding list values in external integrations.

> Consult Oracle REST Web Services documentation for the exact endpoint path and query parameters.

---

### Support Case Records (2026.1)

NetSuite 2026.1 added REST access to support-related record types. Four support case record types are now accessible via the REST record endpoint.

> Consult Oracle REST Web Services documentation for the exact record type identifiers.

---

## OAuth 2.0 Quick Reference

For the full OAuth 2.0 security decision guide, see [Principle 5, Section 5.9](../05-security-privacy.md#59-oauth-20-authentication).

### Grant Type Summary

| Grant Type | Use Case |
|------------|----------|
| **Client Credentials** | Machine-to-machine, batch processes, no user interaction |
| **Authorization Code** | User-delegated access, web applications |

### Key Requirements

- Use **RSA-PSS** (minimum 2048-bit) or **EC keys** (256, 384, or 521 bits)
- RSA PKCS#1 v1.5 is **deprecated** — integrations using it will fail token requests
- Store private keys using NetSuite API Secrets management — never in SuiteScript code
- Authorization Code grant tokens expire in 7 days

### Integration Record SDF XML

```xml
<!-- OAuth 2.0 Integration Record for SuiteApp bundle -->
<integration scriptid="custinteg_myapp_oauth">
    <name>My App OAuth Integration</name>
    <description>OAuth 2.0 Integration for My SuiteApp</description>
    <state>ENABLED</state>
    <oauthauthorizationcodegrantenabled>T</oauthauthorizationcodegrantenabled>
    <oauthclientcredentialsgrantenabled>T</oauthclientcredentialsgrantenabled>
</integration>
```

**Note:** Distribute Integration records with your SuiteApp bundle (see Principle 3, Section 3.2.2). Do NOT ask customers to create them manually.

---

## Concurrency Limits

REST Web Services concurrency is governed at the account level. Standard tiers and SuiteCloud Plus licenses affect available slots.

| Tier | Base Concurrent Requests | With SuiteCloud Plus |
|------|-------------------------|----------------------|
| Standard | 5 | 15 |

- **HTTP 429** indicates concurrency limit exceeded — implement exponential back-off and retry.
- Batch Operations (2026.1) reduce total concurrent slot consumption for bulk workloads.
- Maximum 1,000 results per page; maximum 1,000 pages.

---

## MCP Execution Log (2026.1+)

When using CustomTool (ToolSet) scripts via the AI Connector integration, NetSuite 2026.1 adds an **Execution Log** subtab on the Custom Tools Management page. This provides visibility into tool invocations from AI Connectors (MCP-based integrations).

See [Appendix: CustomTool Runtime](appendix-customtool-runtime.md) for full CustomTool development reference.

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| SOAP deprecation + REST selection | [Principle 1 §1.3](../01-understand-netsuite-features.md) |
| REST Batch performance | [Principle 3 §3.2.4](../03-performance-optimization.md) |
| OAuth 2.0 security decision guide | [Principle 5 §5.9](../05-security-privacy.md) |
| Legacy TBA exception policy | [Principle 5 §5.8](../05-security-privacy.md) |
| Concurrency cheat sheet | [Appendix: Concurrency](appendix-concurrency-cheatsheet.md) |
| CustomTool / AI Connector runtime | [Appendix: CustomTool Runtime](appendix-customtool-runtime.md) |
| Integration Record (TBA) | [Principle 3 §3.2.2](../03-performance-optimization.md) |
| SOAP to REST migration strategy | [Appendix: SOAP to REST Migration](appendix-soap-rest-migration.md) |
