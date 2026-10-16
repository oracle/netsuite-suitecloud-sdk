## Integration 0.7.2 — 2026-10-14

Integrate current owner and explicit skill-version metadata as release 0.7.2. Keep upstream source versions separate and preserve the approved business procedure. Include the administrative scope corrections where applicable; this is not an upstream source release or runtime qualification.

## 0.7.0 — 2026-10-14

Integrate the reviewed candidate, preserve its source version and narrowed scope, and relocate verified common resources. Host/account qualification remains not_run.

## Prior integrated history

## 0.6.11 — 2026-10-13

Generate category-local shared resources and relocate installation paths. Preserve business procedures and authorized-actions policy; native secondary upload/readback remains not_run. Source version remains 1.0.1.

# Cash and Liquidity changelog

## Integration history

### 0.6.9 — 2026-10-13

Create the authorized-actions variant from 0.6.8. Remove blanket external-write/send restrictions and mandatory human execution handoffs; retain business procedures, evidence standards, actual tool limits and action-specific authorization. No new business skills or live write integrations are added. Native host/account execution and security approval remain not_run. Source version remains 1.0.1.

### 0.6.8 — 2026-10-13

Add optional reproducible evidence and scoped local calculation checks while preserving the existing business procedure, ranking, analytical dependencies and specialized outputs. Source version remains 1.0.1. Native host/account retesting: not_run.

### 0.6.6 — 2026-10-13

When net cash flow is positive or zero, report that burn-based runway is not applicable rather than calculating negative or infinite runway. If verified inputs exist, report unrestricted cash divided by comparable monthly operating expense as coverage, with its period and limitations; zero or unknown expense makes this ratio unavailable. For receivable/payable timing, amountunpaid is a candidate field only after metadata and currency/sign/grain verification. Use an authoritative aging source when available. Separate current unpaid balances from historical as-of positions; do not substitute a familiar remaining-balance field after an error. Source version remains 1.0.1. Native host/account retesting: not_run.

### 0.6.3 — 2026-10-09

Use source_release_date, integration_release_date and first_included_date consistently in runbook metadata. Preserve source dates, original inclusion dates and not_collected states. Business procedures and source versions are unchanged.

### 0.6.1 — 2026-10-09

Retain the applied metadata/privacy/date standards and read-only procedure. Restore the four testing-eligible workflows at package level; no new live qualification.

### 0.6.0 — 2026-10-09

- Apply customer metadata, naming, date and privacy standards. Move private provenance and evaluation material out of the customer ZIP.
- Restore available cumulative source history. Preserve the business procedure, read-only scope and necessary dependencies.
- Source version remains 1.0.1. Host/account and model behavior qualification: not_run.

### Plugin 0.5.2 — 2026-10-08

Shared response, scope, evidence, navigation and resource-loading guidance updated. Runbook integration version remained 0.5.1.

### Cash and Liquidity

## 0.5.1 — 2026-10-08

Shared Redwood design alignment. Preserve upstream source version 1.0.1, business rules, verification dependencies and read-only behavior.

### Cash and Liquidity changelog

## 0.5.0 — 2026-10-08

- Integration version 0.5.0; upstream source version 1.0.1 (VERSION_HISTORY.md first heading (source claim)).
- integrate october 8 submission.
- Read-only retrieval, analysis and unsaved drafts; no confirmation-to-write path.
- Latest shared guidance plus metadata-interface routing and safe conventional CSV.
- Host/account qualification remains not_run.

### Source comparison and release adaptation

No active-source byte changes against the verified comparison baseline. Historical release claims remain source-authored evidence.


### Inventory selection

Retained by exact Yes (account) classification in the October 7 capability inventory, filtered October 8. Latest selected source version is retained separately from inventory membership.

### Runbook metadata

Add date-added-to-plugin: 2026-10-08 for inclusion in plugin version 0.5.0. Earlier historical first-inclusion dates are not inferred.

Earlier integration change notes before 0.5.0 are not present in the retained per-runbook changelog. Prior membership alone is not a change record.

## Source history

The following entries were supplied with the selected source. They record source changes, not execution results for this plugin. Historical instructions do not override the current runbook or read-only edition.

### Version History

## 1.0.1 - 2026-10-07 - Finance evaluation remediation


### Changes
- Added sign-orientation validation so opposite-sign financial-report detail cannot create false overdraft/liquidity conclusions.
- Changed unavailable restricted/reserved cash from implicit zero to `NOT_VERIFIED`.
- Separated booked cash from projected/future-dated timing and tightened runway input validation.
- Documented no-synthetic-link and blocked external-delivery behavior; added regression tests and five showcase prompts.

### Compatibility and migration notes
- This revision preserves the submitted business workflow unless the evaluation exposed an evidence, routing, or connector-compatibility problem.
- It continues to rely on the universal NetSuite AI Connector instruction layer for tool selection, permissions, SuiteQL metadata discovery, subsidiary/currency context, safety, and consequential-write validation.
- The live connector capability/schema takes precedence over stale assumptions. In particular, no canonical record URL is synthesized when the connector does not provide one.
- No custom MCP capability was added. Standard NetSuite MCP capabilities remain preferred.
- Existing installations can replace the prior skill folder in place; no data migration is required.

## 1.0.0 - Submitted baseline - date not encoded in source package

- Baseline version reconstructed from the unversioned submitted archive solely to provide reviewer-friendly history.
- See the 1.0.1 entry for every intentional change made in this remediation.


## Incoming candidate history

# Change Log

**Runbook:** WF-FIN-006  
**Skill:** `netsuite-cash-and-liquidity`  
**Status:** UPDATED  
**Current version:** 1.0.1  
**Baseline:** original submitted files are preserved separately in external review evidence.

## WF-FIN-006 - Cash and liquidity
**Skill:** `netsuite-cash-and-liquidity`  
**Evaluation:** Partial  
**Version:** submitted baseline / reviewer-tracked `1.0.0` -> **`1.0.1` (UPDATED)**

| File | Status | Before | After |
| --- | --- | --- | --- |
| `RUNBOOK.md` | **MODIFIED** | Cash analysis could rely on report detail without an explicit opposite-sign reconciliation rule and did not make missing restricted/reserved cash an explicit evidence state. | Added parent-total anchoring, child-sign validation, `NOT_VERIFIED` treatment for restricted/reserved cash, verified-input requirements for runway/coverage, separation of booked cash from projected/future-dated timing, no-synthetic-link behavior, and blocked external-delivery handling. |
| `examples/showcase-prompts.md` | **MODIFIED** | Broad cash/liquidity showcase set. | Replaced with exactly five prompts that exercise sign-orientation, restrictions evidence, booked-vs-projected cash, missing inputs, and safe delivery boundaries. |
| `VERSION_HISTORY.md` | **NEW** | Not present in submitted skill. | Added `1.0.1` remediation entry plus reviewer-tracked `1.0.0` submitted baseline and compatibility/migration notes. |
| `tests/evaluations.md` | **NEW** | Not present in submitted skill. | Added regression cases for report-sign, liquidity-evidence, timing, and connector-compatibility findings. |


## Unreleased standardization

Preserved submitted version and cumulative behavior history. Added target identity and metadata; separated historical, host and review-only materials from runtime. This is an unreleased revision, not a new release.

## Unreleased content review

Reviewed the standardized candidate against the selected plugin contracts; clarified evidence gates and business calculations. The submitted source version is preserved. Review findings and unexecuted acceptance cases are supplied separately.
