# Appendix: SOAP to REST Migration Strategy
> Source: Oracle NetSuite SAFE Guide + REST Web Services documentation
> Author: Oracle NetSuite

## Overview

NetSuite is permanently disabling all SOAP Web Services endpoints in **2028.2** (see Pitfall #90). The last new SOAP endpoint was added in 2025.2, and new SuiteApp integrations have been prohibited from using SOAP since 2024.2. Any organization with existing SOAP integrations must plan and execute migration to REST Web Services with OAuth 2.0 well before this hard deadline.

This appendix provides a structured, risk-tiered migration strategy suitable for organizations with multiple SOAP integrations. The approach prioritizes low-risk migrations first to build reusable patterns, then progresses to complex high-volume integrations.

**Key constraints from the SAFE Guide:**
- OAuth 2.0 must use **RSA-PSS** (min 2048-bit) or **EC keys** (256, 384, or 521 bits) — PKCS#1 v1.5 is deprecated (Pitfall #93)
- REST Batch API (2026.1+) available for high-volume scenarios (Pitfall #91)
- Async batch responses return HTTP 202 — must poll for completion (Pitfall #92)
- REST Attach/Detach limited to Contact and File records in 2026.1 (Pitfall #94)
- REST Web Services concurrency limits: Standard = 5, with SuiteCloud Plus = 15
- Store private keys using NetSuite API Secrets management — never in SuiteScript code (Principle 5 §5.4)

---

## Approach: Risk-Tiered Phased Migration

Inventory all integrations, classify by risk tier, and migrate in waves — simple first to establish reusable patterns, complex last. Run SOAP and REST in parallel per integration until data parity is validated, then cut over.

**Migration phases:**

| Phase | Purpose |
|-------|---------|
| Phase 0: Discovery | Full inventory with risk classification |
| Phase 1: Foundation | Shared OAuth 2.0 infrastructure and REST client library |
| Wave 1 | Low-risk integrations (validate patterns) |
| Wave 2 | Medium-risk integrations (bidirectional syncs) |
| Wave 3 | High-risk / high-volume integrations |
| Decommission | Revoke SOAP credentials and archive |

---

## Phase 0: Discovery

**Goal:** Full inventory with enough detail to classify risk and plan migration order.

### Migration Registry Template

Create one row per integration:

| Field | Purpose |
|-------|---------|
| Integration name | Human identifier |
| Direction | Inbound / Outbound / Bidirectional |
| Record types touched | SO, Invoice, Customer, Item, etc. |
| SOAP operations used | get, add, update, search, initialize |
| Auth method | NLAuth, TBA, or unknown |
| Volume | Records/day estimate |
| Business criticality | Critical / Important / Low |
| Risk tier | Low / Medium / High |
| Status | Not started / In progress / Complete |

### Risk Tier Classification

| Tier | Criteria |
|------|----------|
| **Low** | Read-heavy or simple writes, <1K records/day, non-critical process |
| **Medium** | Bidirectional sync, moderate volume, standard record types (Customer, Item, Vendor) |
| **High** | Transaction records (SO, Invoice, PO), >1K records/day, real-time SLAs, complex transforms |

### Discovery Actions

1. **Audit all running integration processes** — locate every SOAP endpoint call.
2. **Document current auth method** per integration (NLAuth, TBA, or unknown).
3. **Check REST Record API coverage** for all record types used — not all SOAP types have REST equivalents.
4. **Flag record types requiring RESTlet fallback** — build adapters in Phase 1 for unsupported types (see [Appendix: SuiteTalk REST](appendix-suitetalk-rest.md) for Attach/Detach limitations).
5. **Identify field coverage gaps** — SOAP fields not exposed in the REST API.

> **Important:** No Wave 1 migration starts until Discovery is complete and the Migration Registry is populated.

---

## Phase 1: Foundation

**Goal:** Shared infrastructure and patterns used by all subsequent migrations.

### OAuth 2.0 M2M Setup

1. Create Integration record in NetSuite (Setup > Integration) — include in SuiteApp bundle if applicable (see Principle 3 §3.2.2).
2. Generate **RSA-PSS** key pair (2048-bit minimum) or **EC key** (256, 384, or 521 bits) — do NOT use PKCS#1 v1.5 (Pitfall #93).
3. Configure **Client Credentials** flow for machine-to-machine integrations (no user interaction).
4. Assign minimum required role permissions per integration — **least privilege** (see Principle 5 §5.1).
5. Test token acquisition and rotation; store private keys using **API Secrets management** (Principle 5 §5.4).

```xml
<!-- OAuth 2.0 Integration Record SDF XML -->
<integration scriptid="custinteg_myapp_oauth">
    <name>My App OAuth Integration</name>
    <description>OAuth 2.0 M2M Integration</description>
    <state>ENABLED</state>
    <oauthclientcredentialsgrantenabled>T</oauthclientcredentialsgrantenabled>
</integration>
```

> For the full OAuth 2.0 decision guide (Client Credentials vs Authorization Code), see [Principle 5 §5.9](../05-security-privacy.md#59-oauth-20-authentication).

### Shared REST Client Library

Build once, reuse across all wave migrations:

- **OAuth 2.0 token acquisition** and automatic refresh.
- **Base URL + versioned endpoint construction**: use `url.resolveScript()` patterns where applicable.
- **Standard error handling:** 401 (re-auth), 429 (exponential backoff + retry), 500 (log + alert).
- **Rate limiting / concurrency guard**: respect account-level limits (Standard = 5, SuiteCloud Plus = 15).
- **Async job polling** for Batch API responses (HTTP 202) — see Pitfall #92.
- **Request/response logging** for audit trail.

### SOAP to REST Endpoint Mapping

| SOAP Operation | REST Equivalent | Notes |
|----------------|-----------------|-------|
| `get` / `getList` | `GET /record/v1/{type}/{id}` | Single record retrieval |
| `search` | `POST /query/v1/suiteql` | SuiteQL preferred for flexibility and joins |
| `add` | `POST /record/v1/{type}` | Synchronous create (HTTP 201) |
| `addList` (bulk) | REST Batch API (2026.1+) | Async — poll for completion (HTTP 202) |
| `update` / `updateList` | `PATCH /record/v1/{type}/{id}` | Partial update; use Batch for bulk |
| `delete` | `DELETE /record/v1/{type}/{id}` | Returns HTTP 204 |
| `initialize` (transform) | `POST /record/v1/{type}/{id}/!transform/{targetType}` | Record transformation |
| `attach` / `detach` | `POST .../!attach/...` or `!detach/...` | 2026.1+ only; Contact and File types only (Pitfall #94) |

> For complete REST API reference including 2026.1 features, see [Appendix: SuiteTalk REST](appendix-suitetalk-rest.md).

### Developer Runbook

Document before Wave 1 begins:

- [ ] OAuth 2.0 credential setup instructions (local dev and production)
- [ ] Shared client library usage guide with code examples
- [ ] REST endpoint reference with field mapping examples per record type
- [ ] Error handling patterns (401, 404, 429, 500)
- [ ] How to update the Migration Registry

---

## Wave Execution Pattern

Apply this 10-step pattern to each integration, regardless of risk tier:

```
 1. Map SOAP operations to REST endpoints using the mapping reference above.
 2. Identify field gaps; design RESTlet adapter if record type is unsupported in REST.
 3. Implement REST version using the shared client library.
 4. Sandbox test: all endpoints, error cases, token expiry, inactive record filtering.
 5. Enable parallel run in production (SOAP + REST running simultaneously).
 6. Compare outputs field-by-field for minimum 1 full business cycle.
 7. Review parallel run logs — zero discrepancies required.
 8. Cutover: switch traffic to REST, disable SOAP credential for this integration.
 9. Keep SOAP credential active (unused) for 30-day rollback window.
10. After 30 days: deactivate SOAP credential, mark COMPLETE in Migration Registry.
```

---

## Wave 1: Low-Risk Integrations

**Criteria:** Read-heavy, low volume, non-critical

**Examples:** Reference data syncs, report extracts, catalog lookups

**Primary goal beyond migration:** Validate the shared client library and developer runbook in production. Issues found here are low-stakes. Patterns established here become templates for Wave 2 and 3.

**Key considerations:**
- Focus on `GET` and SuiteQL query endpoints
- Validate OAuth 2.0 token lifecycle end-to-end
- Confirm logging and monitoring produces actionable data

---

## Wave 2: Medium-Risk Integrations

**Criteria:** Bidirectional syncs, moderate volume, standard record types

**Examples:** Customer master sync, item catalog push, vendor updates

**Additional focus:**
- Test bidirectional **conflict resolution** (both systems update same record simultaneously).
- Validate `PATCH` partial update behavior vs. full replace.
- Confirm `isinactive = 'F'` filtering in all SuiteQL queries — inactive records are returned by default (Pitfall #95).
- For SuiteQL: use `WHERE NVL(isinactive, 'F') = 'F'`.
- For N/search: include `['isinactive', 'is', 'F']` filter.

---

## Wave 3: High-Risk / High-Volume Integrations

**Criteria:** Transaction records, >1K records/day, real-time SLAs

**Examples:** Order creation, invoice posting, payment processing, fulfillment sync

**Additional focus:**
- Use **REST Batch API** (2026.1+) for bulk inbound creates/updates (Pitfall #91).
- **Poll batch job status** endpoint until COMPLETE or FAILED — do NOT treat HTTP 202 as completion (Pitfall #92).
- Monitor **concurrency limits** closely — high-volume operations can exhaust Web Services concurrent user slots.
- Extended parallel run: minimum **2 full billing/fulfillment cycles**.
- **Rollback must be fully tested** (not just documented) before cutover.
- Consider record type limitations: Attach/Detach only supports Contact and File in 2026.1 (Pitfall #94) — use RESTlet adapters for other types.

---

## Phase 5: Decommission

After all 30-day rollback windows close:

1. **Revoke all SOAP NLAuth credentials** and TBA tokens.
2. **Archive SOAP integration code** — do not delete (compliance reference).
3. **Remove SOAP from all monitoring** and alerting.
4. **Final Migration Registry update** — all rows = COMPLETE.
5. **Publish post-migration lessons learned** document.

---

## Validation Gates

### Gate 1: Sandbox Unit Testing

- [ ] All REST endpoints return expected HTTP status codes
- [ ] Payload schema matches SOAP field-for-field
- [ ] Error cases tested: 401 (re-auth), 404, 429 (backoff), 500 (log + alert)
- [ ] OAuth 2.0 token expiry and refresh cycle tested
- [ ] Inactive record filtering verified (`isinactive = 'F'`)

### Gate 2: Parallel Run (Production)

- [ ] SOAP and REST running simultaneously against same records
- [ ] Field-by-field comparison logged to Migration Registry
- [ ] Zero discrepancies for minimum 1 full business cycle
- [ ] Volume matches expected throughput
- [ ] Concurrency limits not exceeded under production load

### Gate 3: Cutover Readiness

- [ ] All Gate 2 criteria met
- [ ] Monitoring updated to REST endpoint metrics
- [ ] On-call runbook updated with REST-specific error scenarios
- [ ] SOAP rollback credential documented and tested
- [ ] Stakeholder sign-off for high-risk integrations

---

## Key Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Record type not in REST Record API | Identify in Phase 0; build RESTlet adapter in Phase 1 |
| PKCS#1 v1.5 key usage | Enforce RSA-PSS or EC keys in Phase 1 auth setup (Pitfall #93) |
| Async batch HTTP 202 treated as complete | Polling logic built into shared client library (Pitfall #92) |
| Concurrency limit exhaustion | Rate limiting in shared library; monitor Wave 3 closely |
| Field gaps between SOAP and REST | Document in Phase 0; RESTlet adapters for gaps |
| Auth method undocumented | Phase 0 discovery is non-optional; no Wave 1 starts before complete |
| Attach/Detach unsupported record types | Use N/record `attach()` via RESTlet for non-Contact/File types (Pitfall #94) |

---

## Rough Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Phase 0: Discovery | 2–3 weeks | Gates everything else |
| Phase 1: Foundation | 2–3 weeks | Overlaps late Phase 0 |
| Wave 1: Low-risk | 4–6 weeks | Includes parallel run |
| Wave 2: Medium-risk | 6–10 weeks | Scales with integration count |
| Wave 3: High-risk | 8–12 weeks | Extended parallel run + load testing |
| Phase 5: Decommission | 2 weeks | After all rollback windows close |
| **Total** | **~6–9 months** | Well within 2028.2 deadline |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| SOAP deprecation timeline | Pitfall #90 |
| REST Batch API for bulk ops | Pitfall #91, [Principle 3 §3.2.4](../03-performance-optimization.md) |
| Async job polling | Pitfall #92 |
| RSA-PSS / EC key requirements | Pitfall #93 |
| REST Attach/Detach limits | Pitfall #94 |
| Inactive record filtering | Pitfall #95 |
| REST API fundamentals | [Appendix: SuiteTalk REST](appendix-suitetalk-rest.md) |
| OAuth 2.0 security guide | [Principle 5 §5.9](../05-security-privacy.md) |
| API Secrets management | [Principle 5 §5.4](../05-security-privacy.md) |
| Legacy TBA exception policy | [Principle 5 §5.8](../05-security-privacy.md) |
| Web services decision matrix | [Principle 1 §1.3](../01-understand-netsuite-features.md) |
