## Integration 0.7.2 — 2026-10-14

Integrate current owner and explicit skill-version metadata as release 0.7.2. Keep upstream source versions separate and preserve the approved business procedure. Include the administrative scope corrections where applicable; this is not an upstream source release or runtime qualification.

## 0.7.0 — 2026-10-14

Integrate the reviewed candidate, preserve its source version and narrowed scope, and relocate verified common resources. Host/account qualification remains not_run.

## Prior integrated history

## 0.6.11 — 2026-10-13

Generate category-local shared resources and relocate installation paths. Preserve business procedures and authorized-actions policy; native secondary upload/readback remains not_run. Source version remains 0.2.5.

# Vendor Bill Processing Time changelog

## Integration history

### 0.6.9 — 2026-10-13

Create the authorized-actions variant from 0.6.8. Remove blanket external-write/send restrictions and mandatory human execution handoffs; retain business procedures, evidence standards, actual tool limits and action-specific authorization. No new business skills or live write integrations are added. Native host/account execution and security approval remain not_run. Source version remains 0.2.5.

### 0.6.3 — 2026-10-09

Use source_release_date, integration_release_date and first_included_date consistently in runbook metadata. Preserve source dates, original inclusion dates and not_collected states. Business procedures and source versions are unchanged.

### 0.6.1 — 2026-10-09

Retain the applied metadata/privacy/date standards and read-only procedure. Restore the four testing-eligible workflows at package level; no new live qualification.

### 0.6.0 — 2026-10-09

- Apply customer metadata, naming, date and privacy standards. Move private provenance and evaluation material out of the customer ZIP.
- Restore available cumulative source history. Preserve the business procedure, read-only scope and necessary dependencies.
- Source version remains 0.2.5. Host/account and model behavior qualification: not_run.

### Plugin 0.5.2 — 2026-10-08

Shared response, scope, evidence, navigation and resource-loading guidance updated. Runbook integration version remained 0.5.1.

### Vendor Bill Processing Time

## 0.5.1 — 2026-10-08

Shared Redwood design alignment. Preserve upstream source version 0.2.5, business rules, verification dependencies and read-only behavior.

### Vendor Bill Processing Time changelog

## 0.5.0 — 2026-10-08

- Integration version 0.5.0; upstream source version 0.2.5 (SKILL.md frontmatter).
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

## 0.2.5 - 2026-10-07 - Finance evaluation remediation


### Changes
- Added an explicit payment-link coverage gate before calculating first-payment/final-settlement timing.
- Sparse relationship evidence now produces `PAYMENT_LINK_COVERAGE_INCOMPLETE` and linked-subset metrics rather than account-wide conclusions.
- Added reference guidance that missing links are missing evidence, not zero-time or unpaid evidence.
- Made the read-only action boundary and blocked external-delivery behavior explicit.

### Compatibility and migration notes
- This revision preserves the submitted business purpose while tightening behavior proven unsafe or unverifiable by the evaluation.
- The universal NetSuite connector instruction layer remains the operating contract for tool selection, permissions, subsidiary/currency context, metadata discovery, and write safety.
- Live connector capability/schema evidence takes precedence over stale field, URL, or tool assumptions.
- No custom NetSuite MCP capability was added.
- Existing installations can replace the active skill files in place; no NetSuite data migration is required.

## 0.2.4 submitted baseline


## Incoming candidate history

# Change Log

**Runbook:** WF-FIN-017  
**Skill:** `netsuite-vendor-bill-processing-time`  
**Status:** UPDATED  
**Current version:** 0.2.5  
**Baseline:** `_history/1.0.0-submitted-baseline/`

| File | Status | Before | After |
| --- | --- | --- | --- |
| `RUNBOOK.md` | **MODIFIED** | Lifecycle logic allowed first/final payment metrics from linked evidence but did not require a cohort-level coverage gate before generalizing the result. | Requires payment-link coverage measurement, limits timing metrics to the verified linked subset when coverage is incomplete, and declines writes. |
| `references/suiteql-patterns.md` | **MODIFIED** | Reference did not contain the evaluated connector-specific coverage/failure boundary. | Added explicit remediation guidance tied to the evaluated connector limitation. |
| `examples/showcase-prompts.md` | **NEW/REPLACED** | No evaluation-specific five-prompt showcase contract. | Exactly five showcase prompts exercising the remediated behavior. |
| `tests/evaluations.md` | **NEW** | No remediation regression suite. | Added regression tests tied directly to the evaluation findings. |
| `VERSION_HISTORY.md` | **NEW** | No reviewer-oriented remediation history. | Added current remediation version, evaluation mapping, compatibility notes, and baseline pointer. |

For release chronology and migration notes, see the source release chronology below.

## Source release chronology

The following source history is retained as historical evidence, not current installation instructions. Historical paths name the immutable source archive; those files are external to this runtime package.

# Version History

## 0.2.5 - 2026-10-07 - Finance evaluation remediation

**Evaluation mapping:** WF-FIN-017 was graded Partial in the Oct. 5-6, 2026 SuiteSkills finance evaluation.

### Changes
- Added an explicit payment-link coverage gate before calculating first-payment/final-settlement timing.
- Sparse relationship evidence now produces `PAYMENT_LINK_COVERAGE_INCOMPLETE` and linked-subset metrics rather than account-wide conclusions.
- Added reference guidance that missing links are missing evidence, not zero-time or unpaid evidence.
- Made the read-only action boundary and blocked external-delivery behavior explicit.

### Compatibility and migration notes
- This revision preserves the submitted business purpose while tightening behavior proven unsafe or unverifiable by the evaluation.
- The universal NetSuite connector instruction layer remains the operating contract for tool selection, permissions, subsidiary/currency context, metadata discovery, and write safety.
- Live connector capability/schema evidence takes precedence over stale field, URL, or tool assumptions.
- No custom NetSuite MCP capability was added.
- Existing installations can replace the active skill files in place; no NetSuite data migration is required.

## 0.2.4 submitted baseline

- Exact submitted files are preserved under `_history/1.0.0-submitted-baseline/`.
