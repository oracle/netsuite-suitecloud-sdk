## Integration 0.7.2 — 2026-10-14

Integrate current owner and explicit skill-version metadata as release 0.7.2. Keep upstream source versions separate and preserve the approved business procedure. Include the administrative scope corrections where applicable; this is not an upstream source release or runtime qualification.

## 0.7.0 — 2026-10-14

Integrate the reviewed candidate, preserve its source version and narrowed scope, and relocate verified common resources. Host/account qualification remains not_run.

## Prior integrated history

## 0.6.11 — 2026-10-13

Generate category-local shared resources and relocate installation paths. Preserve business procedures and authorized-actions policy; native secondary upload/readback remains not_run. Source version remains 1.0.1.

# Match Vendor Credits to Bills changelog

## Integration history

### 0.6.9 — 2026-10-13

Create the authorized-actions variant from 0.6.8. Remove blanket external-write/send restrictions and mandatory human execution handoffs; retain business procedures, evidence standards, actual tool limits and action-specific authorization. No new business skills or live write integrations are added. Native host/account execution and security approval remain not_run. Source version remains 1.0.1.

### 0.6.8 — 2026-10-13

Add optional reproducible evidence and scoped local calculation checks while preserving the existing business procedure, ranking, analytical dependencies and specialized outputs. Source version remains 1.0.1. Native host/account retesting: not_run.

### 0.6.6 — 2026-10-13

Verify the available vendor-credit amount before proposing allocations. Use an authoritative AP aging/open-credit source or schema-qualified application links, including NextTransactionLineLink only when its direction, link types, currency and completeness are established. Reconcile original credit less all relevant applications to a supported current unused amount. For historical scope use applications through that cutoff. A candidate credit with unknown unused balance may be listed but must not be allocated. Apply the root shared link contract consistently with Vendor Spend Analysis. Source version remains 1.0.1. Native host/account retesting: not_run.

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

### Match Vendor Credits to Bills

## 0.5.1 — 2026-10-08

Shared Redwood design alignment. Preserve upstream source version 1.0.1, business rules, verification dependencies and read-only behavior.

### Match Vendor Credits to Bills changelog

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
- Added metadata-first remaining-balance verification and `REMAINING_AMOUNT_NOT_VERIFIED` when open credit/bill amounts cannot be established.
- Made missing canonical record URLs an explicit `RECORD_LINK_UNAVAILABLE` compatibility outcome rather than synthesizing NetSuite links.
- Made the read-only boundary explicit: write requests are declined in this runbook and handed off to an authorized write-capable workflow.
- Added blocked external-delivery behavior and evaluation regression tests.

### Compatibility and migration notes
- This revision preserves the submitted business purpose while tightening behavior proven unsafe or unverifiable by the evaluation.
- The universal NetSuite connector instruction layer remains the operating contract for tool selection, permissions, subsidiary/currency context, metadata discovery, and write safety.
- Live connector capability/schema evidence takes precedence over stale field, URL, or tool assumptions.
- No custom NetSuite MCP capability was added.
- Existing installations can replace the active skill files in place; no NetSuite data migration is required.

## submitted baseline / reviewer-tracked 1.0.0


## Incoming candidate history

# Change Log

**Runbook:** WF-FIN-003  
**Skill:** `netsuite-match-vendor-credits-to-bills`  
**Status:** UPDATED  
**Current version:** 1.0.2  
**Baseline:** `_history/1.0.0-submitted-baseline/`

## 1.0.2 - October 14 feedback update

| File | Status | Change |
| --- | --- | --- |
| `RUNBOOK.md` | MODIFIED | Carries the reviewed current runbook behavior in the existing standalone entrypoint; verifies remaining balances before allocation and permits necessary qualified balance-source reads within bounds. |
| `references/credit-balance-sources.md` | NEW | Specifies A/P aging/record/link source verification, sign/currency/date checks, duplicate handling and disputed/unknown balances. |
| `references/matching-rules.md` | MODIFIED | Reconciles to opening unapplied capacity; excludes rejected/pending records and payment-in-transit bills. |
| `references/operating-contract.md` | NEW | Makes current metadata, permissions, call/paging limits, script/action boundaries and record-link rules self-contained. |
| `tests/evaluations.md` | MODIFIED | Adds expected regressions for verified remaining balances, conflicts and application-link gaps. |
| `VERSION_HISTORY.md` | MODIFIED | Records source mapping, local checks, pending live rerun and the outgoing-version snapshot. |

## Previous remediation - 1.0.1

| File | Status | Before | After |
| --- | --- | --- | --- |
| `RUNBOOK.md` | **MODIFIED** | Read-only matching relied on the connector to supply open remaining amounts and expected linked-record output, but did not make the evaluated remaining-field failure and no-URL condition explicit. | Requires metadata/source-verified remaining amounts, returns `REMAINING_AMOUNT_NOT_VERIFIED` when unavailable, treats missing URLs as `RECORD_LINK_UNAVAILABLE`, and explicitly declines writes. |
| `examples/showcase-prompts.md` | **NEW/REPLACED** | No evaluation-specific five-prompt showcase contract. | Exactly five showcase prompts exercising the remediated behavior. |
| `tests/evaluations.md` | **NEW** | No remediation regression suite. | Added regression tests tied directly to the evaluation findings. |
| `VERSION_HISTORY.md` | **NEW** | No reviewer-oriented remediation history. | Added current remediation version, evaluation mapping, compatibility notes, and baseline pointer. |

For release chronology and migration notes, see the source release chronology below.

## Source release chronology

The following source history is retained as historical evidence, not current installation instructions. Historical paths name the immutable source archive; those files are external to this runtime package.

# Version History

## 1.0.2 - 2026-10-14 - Remaining-credit source remediation

**Evaluation mapping:** RB-FIN-003, Partial in the October 13 SuiteSkills Runbook Evaluation.

### Changes

- Added an ordered balance-source plan: transaction-level A/P aging or governed search, record Unapplied, metadata-verified SuiteQL fields, then validated application-link reconstruction.
- Replaced the rigid two-call cap with two logical datasets inside the existing read/paging limits.
- Kept unknown/conflicting balances outside numerical allocations and reconciled proposed amounts to verified opening unused capacity.
- Preserved October 7 remediation statuses, oldest-overdue ordering, shared capacity, read-only behavior and source-returned record links.
- Included all operating requirements as package-local references so the standalone skill has no plugin-relative dependencies.

### Compatibility and validation

- This is the standalone SharePoint form of the reviewed SuiteSkills runbook revision; folder names and SKILL.md entrypoints remain unchanged.
- Query templates/field candidates still require current connector metadata and role access. No remaining amount is verified merely by reading this package.
- Local authoring/scenario checks were performed; live NetSuite rerun remains pending. This release does not claim a new live evaluation pass.
- Outgoing active files are preserved exactly under `_history/1.0.1-pre-2026-10-14-feedback/`. The existing submitted baseline remains untouched.

## 1.0.1 - 2026-10-07 - Finance evaluation remediation

**Evaluation mapping:** WF-FIN-003 was graded Partial in the Oct. 5-6, 2026 SuiteSkills finance evaluation.

### Changes
- Added metadata-first remaining-balance verification and `REMAINING_AMOUNT_NOT_VERIFIED` when open credit/bill amounts cannot be established.
- Made missing canonical record URLs an explicit `RECORD_LINK_UNAVAILABLE` compatibility outcome rather than synthesizing NetSuite links.
- Made the read-only boundary explicit: write requests are declined in this runbook and handed off to an authorized write-capable workflow.
- Added blocked external-delivery behavior and evaluation regression tests.

### Compatibility and migration notes
- This revision preserves the submitted business purpose while tightening behavior proven unsafe or unverifiable by the evaluation.
- The universal NetSuite connector instruction layer remains the operating contract for tool selection, permissions, subsidiary/currency context, metadata discovery, and write safety.
- Live connector capability/schema evidence takes precedence over stale field, URL, or tool assumptions.
- No custom NetSuite MCP capability was added.
- Existing installations can replace the active skill files in place; no NetSuite data migration is required.

## submitted baseline / reviewer-tracked 1.0.0

- Exact submitted files are preserved under `_history/1.0.0-submitted-baseline/`.
