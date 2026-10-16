## Integration 0.7.2 — 2026-10-14

Integrate current owner and explicit skill-version metadata as release 0.7.2. Keep upstream source versions separate and preserve the approved business procedure. Include the administrative scope corrections where applicable; this is not an upstream source release or runtime qualification.

## 0.7.0 — 2026-10-14

Integrate the reviewed candidate, preserve its source version and narrowed scope, and relocate verified common resources. Host/account qualification remains not_run.

## Prior integrated history

## 0.6.11 — 2026-10-13

Generate category-local shared resources and relocate installation paths. Preserve business procedures and authorized-actions policy; native secondary upload/readback remains not_run. Source version remains 1.0.1.

# Finance Controls Review changelog

## Integration history

### 0.6.9 — 2026-10-13

Create the authorized-actions variant from 0.6.8. Remove blanket external-write/send restrictions and mandatory human execution handoffs; retain business procedures, evidence standards, actual tool limits and action-specific authorization. No new business skills or live write integrations are added. Native host/account execution and security approval remain not_run. Source version remains 1.0.1.

### 0.6.6 — 2026-10-13

For an ordinary operational review, proceed with the stated defaults when no supplied policy supersedes them and label the basis; do not block unrelated checks on a materiality question. In an audit context, threshold-dependent conclusions need the applicable policy; return independent observations while that input is unavailable. To test preparer/approver overlap, obtain actual creator/preparer and approval-event actor IDs for the same transaction using verified record/audit evidence. Compare IDs after validating event meaning; lastModifiedBy is not an approver. Missing approval evidence means not verified, not no overlap. Source version remains 1.0.1. Native host/account retesting: not_run.

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

### Finance Controls Review

## 0.5.1 — 2026-10-08

Shared Redwood design alignment. Preserve upstream source version 1.0.1, business rules, verification dependencies and read-only behavior.

### Finance Controls Review changelog

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
- Added a control-evidence coverage matrix and explicit `NOT_VERIFIED` handling so missing evidence cannot become a false pass.
- Added safe report sign handling for balance-based control checks and bounded recurrence logic when fewer periods are accessible.
- Added delivery-blocked behavior, regression tests, and five showcase prompts.

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

# Cumulative source history

Source version is 1.0.1. This is an unreleased standardized revision; no new release number is assigned. Historical evaluation claims below are supplied history, not validation of this candidate. Original history and tests are retained outside runtime.

# Change Log

**Runbook:** WF-FIN-008  
**Skill:** `netsuite-finance-controls-review`  
**Status:** UPDATED  
**Current version:** 1.0.1  
**Baseline:** original submitted files are preserved in the externally retained submitted baseline.

## WF-FIN-008 - Finance controls review
**Skill:** `netsuite-finance-controls-review`  
**Evaluation:** Partial  
**Version:** submitted baseline / reviewer-tracked `1.0.0` -> **`1.0.1` (UPDATED)**

| File | Status | Before | After |
| --- | --- | --- | --- |
| `RUNBOOK.md` | **MODIFIED** | Missing evidence did not have a dedicated control-coverage state, report-detail sign issues were not explicitly normalized against authoritative totals, and reduced period history could overstate recurrence confidence. | Added a control-evidence coverage matrix, `NOT_VERIFIED` handling, report-sign validation, separation of observation/recurrence/control-owner conclusions, and bounded-review behavior when fewer periods are available; also added connector link/delivery exceptions. |
| `examples/showcase-prompts.md` | **MODIFIED** | Broad controls-review showcase set. | Replaced with exactly five prompts focused on evidence coverage, missing sources, recurrence confidence, sign-safe control checks, and defensible conclusions. |
| the cumulative version history below | **NEW** | Not present in submitted skill. | Added `1.0.1` remediation entry plus reviewer-tracked `1.0.0` submitted baseline and compatibility/migration notes. |
| external evaluation cases | **NEW** | Not present in submitted skill. | Added regression cases for missing evidence, report-sign behavior, recurrence limits, and connector delivery boundaries. |



# Version History

## 1.0.1 - 2026-10-07 - Finance evaluation remediation

**Evaluation mapping:** WF-FIN-008 was graded Partial in the Oct. 5-6, 2026 SuiteSkills finance evaluation.

### Changes
- Added a control-evidence coverage matrix and explicit `NOT_VERIFIED` handling so missing evidence cannot become a false pass.
- Added safe report sign handling for balance-based control checks and bounded recurrence logic when fewer periods are accessible.
- Added delivery-blocked behavior, regression tests, and five showcase prompts.

### Compatibility and migration notes
- This revision preserves the submitted business workflow unless the evaluation exposed an evidence, routing, or connector-compatibility problem.
- It continues to rely on the universal NetSuite AI Connector instruction layer for tool selection, permissions, SuiteQL metadata discovery, subsidiary/currency context, safety, and consequential-write validation.
- The live connector capability/schema takes precedence over stale assumptions. In particular, no canonical record URL is synthesized when the connector does not provide one.
- No custom MCP capability was added. Standard NetSuite MCP capabilities remain preferred.
- Existing installations can replace the prior skill folder in place; no data migration is required.

## 1.0.0 - Submitted baseline - date not encoded in source package

- Baseline version reconstructed from the unversioned submitted archive solely to provide reviewer-friendly history.
- See the 1.0.1 entry for every intentional change made in this remediation.
