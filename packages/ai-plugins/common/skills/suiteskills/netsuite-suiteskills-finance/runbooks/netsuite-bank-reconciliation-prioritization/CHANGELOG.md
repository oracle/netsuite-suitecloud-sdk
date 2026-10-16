## Integration 0.7.2 — 2026-10-14

Integrate current owner and explicit skill-version metadata as release 0.7.2. Keep upstream source versions separate and preserve the approved business procedure. Include the administrative scope corrections where applicable; this is not an upstream source release or runtime qualification.

## 0.7.0 — 2026-10-14

Integrate the reviewed candidate, preserve its source version and narrowed scope, and relocate verified common resources. Host/account qualification remains not_run.

## Incoming candidate history

# Change Log

## 2.0.1 — 2026-10-11 — Renamed submission with regression tests

**Skill:** `netsuite-bank-reconciliation-prioritization`  
**Current version:** 2.0.1  
**Previous release:** 2.0.0  
**Behavioral evaluation:** NOT RUN.

- Distinguishes this final submission from the previously shared 2.0.0 package.
- Uses the renamed skill identifier and display title; replaces the shared package's test placeholder with 8 concise regression tests and release gates.
- Updates release and review documentation. Workflow instructions, reference content and the five example prompts are unchanged.
- A review copy of the local package immediately before this version increment is retained in `_history/2.0.0-before-version-update/`. Earlier snapshots retain their original names and bytes.
- WF-FIN-014 is the historical placeholder identifier; its mapping to the changed scope has not been independently confirmed. This release is identified by skill name and version.

## Historical package records — through 2.0.0

## 2026-10-11 — Evaluation specification update (skill 2.0.0)

Replaced the evaluations placeholder with 12 regression tests (five showcase prompts and seven additional cases) and brief release gates. Execution remains **NOT RUN**. Skill instructions, references, prompts and archived versions are unchanged; this is a documentation update with no skill version increment. The dated release record below describes the prior package.

**Runbook:** WF-FIN-014  
**Catalog folder and skill name:** `netsuite-bank-reconciliation-prioritization`  
**Display title:** NetSuite bank reconciliation prioritization — read-only  
**Current version:** 2.0.0  
**Previous catalog version:** 1.0.1  
**Package date:** 2026-10-08  
**Status:** UPDATED - replacement evaluation pending.

## 1.0.1 to 2.0.0 - Native bank reconciliation replacement

Release 2.0.0 replaces the v1.0.1 placeholder with native bank and credit-card reconciliation analysis. The major version marks a change in scope: the workflow is read-only, can assess work without a pre-existing exception set, and excludes action execution and investigation-owner assignment. The current catalog identifier is `netsuite-bank-reconciliation-prioritization`. The previous v1.0.1 placeholder identifier was `netsuite-reconciliation-prioritization-and-action`; archived files retain that historical name.

This is a comparison of file contents and documented scope. It is not a claim that the replacement passed the earlier evaluation or remedied each earlier finding.

| File | Status | Before | After |
| --- | --- | --- | --- |
| `RUNBOOK.md` | REPLACED | v1.0.1 placeholder focused on prioritization and follow-through after an existing exception set, with owner identification and conditional consequential actions. | v2.0.0 read-only native bank/credit-card assessment, status, prioritization, investigation, differences, and completion analysis under the current `netsuite-bank-reconciliation-prioritization` identifier. |
| `references/data-model.md` | ADDED | No dedicated data-model reference in the placeholder. | Supplied schema verification, bank/posted-GL populations, signed-net aggregation, investigation, difference, completion, coverage, and history rules. |
| `references/report-sources.md` | ADDED | No dedicated report-source reference in the placeholder. | Supplied report selection and scope rules; completion, coverage, and calculation rules now live in the data model. |
| `references/status-format.md` | ADDED | No dedicated status-format reference in the placeholder. | Supplied account-card presentation, separate bank/GL panels, older/uncertain work, decision-specific modules, rendering, and visual style. |
| `examples/showcase-prompts.md` | REPLACED | Five prompts for the earlier exception-set/action workflow. | Five read-only prompts covering priorities, account status, unmatched bank items, suggested matches and older unmatched items. |
| `tests/evaluations.md` | REPLACED WITH PLACEHOLDER | Six regression targets for the earlier placeholder; these were not recorded execution results. | Intentional placeholder for the product team to add tests and results later; replacement evaluation marked pending. |
| `VERSION_HISTORY.md` | UPDATED | v1.0.0 baseline and v1.0.1 remediation history. | Records release 2.0.0, its current skill name, scope changes, and pending evaluation status; retains the original placeholder history. |
| `_history/README.md` | UPDATED | Explained the submitted baseline snapshot. | Identifies the two preserved placeholder versions and distinguishes historical results from the current replacement. |
| `_history/1.0.0-submitted-baseline/` | PRESERVED | Exact submitted files supplied with the placeholder. | Same paths and file bytes. |
| `_history/1.0.1-placeholder-before-replacement/` | ADDED | The previous active placeholder files were at the folder root. | Exact snapshot of the five outgoing active files, including their previous examples, regression targets, changelog, and version history. |

## Scope and compatibility

- Native bank and credit-card reconciliation analysis includes Match Bank Data and Reconcile Account Statement evidence, within the eligibility and connector rules in the supplied skill.
- The replacement can assess status, priorities, and differences without a previously completed exception set. The earlier post-tie-out-only trigger boundary is not the current workflow.
- The replacement does not execute record changes, accept or reject suggestions, create matches, identify or assign investigation owners, or send results to another app. The current name reflects prioritization within the read-only workflow.
- General GL-to-subledger, intercompany, and roll-forward reconciliation are not added to this replacement. Account Reconciliation/EPM and payment-processor settlement remain excluded as stated in the supplied skill.
- WF-FIN-004 (`netsuite-account-reconciliation-review`) is a different catalog folder and is not included in this replacement.
- The earlier `Partial` evaluation belongs to the submitted placeholder. No new behavioral evaluation is claimed for v2.0.0.

## Related review documents

The sibling `00-REVIEW-DOCUMENTATION/` files add the current replacement and its evaluation status above the preserved historical records. Exact copies of the original four review documents are retained in that folder's `_history/2026-10-07-before-wf-fin-014-replacement/` directory.

## Retained source chronology

Historical paths below refer to immutable source evidence held outside runtime; they are not current installation instructions.

# Version History

## 2.0.1 — 2026-10-11 — Renamed submission with regression tests

**Skill:** `netsuite-bank-reconciliation-prioritization`  
**Current version:** 2.0.1  
**Previous release:** 2.0.0  
**Behavioral evaluation:** NOT RUN.

- Distinguishes this final submission from the previously shared 2.0.0 package.
- Uses the renamed skill identifier and display title; replaces the shared package's test placeholder with 8 concise regression tests and release gates.
- Updates release and review documentation. Workflow instructions, reference content and the five example prompts are unchanged.
- A review copy of the local package immediately before this version increment is retained in `_history/2.0.0-before-version-update/`. Earlier snapshots retain their original names and bytes.
- WF-FIN-014 is the historical placeholder identifier; its mapping to the changed scope has not been independently confirmed. This release is identified by skill name and version.

## Historical package records — through 2.0.0

## 2026-10-11 — Evaluation specification update (skill 2.0.0)

Replaced the evaluations placeholder with 12 regression tests (five showcase prompts and seven additional cases) and brief release gates. Execution remains **NOT RUN**. Skill instructions, references, prompts and archived versions are unchanged; this is a documentation update with no skill version increment. The dated release record below describes the prior package.

## 2.0.0 - 2026-10-08 - Native bank reconciliation replacement

**Runbook:** WF-FIN-014  
**Catalog folder and name:** `netsuite-bank-reconciliation-prioritization`  
**Display title:** NetSuite bank reconciliation prioritization — read-only  
**Previous release:** 1.0.1  
**Evaluation:** PENDING - tests and results remain to be added.  
**Status:** Submission package.

### Changes from 1.0.1

- Replaces the placeholder with read-only native bank and credit-card reconciliation analysis for account status, prioritization, unmatched items, suggested-match investigation, differences, and supported completion conclusions.
- Supports these requests without a pre-existing completed exception set. Action execution and identifying or assigning investigation owners are outside this release's scope.
- Includes reference guidance for verified data and calculations, report selection and scope, and status/priority presentation.
- Includes five showcase prompts and an evaluations placeholder.
- Uses `netsuite-bank-reconciliation-prioritization` for the current skill and folder. The previous placeholder used `netsuite-reconciliation-prioritization-and-action`; original v1.0.0 and v1.0.1 files under `_history/` retain their names and bytes.
- Updates the review documents with the current release and pending evaluation status, while retaining the original finance evaluation records.

### Version numbering and evaluation

The release sequence is `1.0.0` submitted baseline -> `1.0.1` placeholder remediation -> `2.0.0` native bank reconciliation replacement. The major version reflects the changed workflow scope and action boundary.

The historical `Partial` result and remediation notes below belong to the placeholder. Local package checks for the current release are recorded separately in `00-REVIEW-DOCUMENTATION/VALIDATION_RESULTS.md`; behavioral evaluation remains pending.

## 1.0.1 - 2026-10-07 - Finance evaluation remediation

**Evaluation mapping:** WF-FIN-014 was graded Partial in the Oct. 5-6, 2026 SuiteSkills finance evaluation.

### Changes
- Separated WF-FIN-014 from WF-FIN-004: this skill now owns prioritization/action after a completed reconciliation, not the initial tie-out.
- Removed the assumption that a generic Record Action Tool exists; live capability discovery now governs execution.
- Added bank-reconciliation evidence, report-sign, confirmation/read-back, and no-synthetic-link guardrails.
- Added regression tests and exactly five showcase prompts.

### Compatibility and migration notes
- This revision preserves the submitted business workflow unless the evaluation exposed an evidence, routing, or connector-compatibility problem.
- It continues to rely on the universal NetSuite AI Connector instruction layer for tool selection, permissions, SuiteQL metadata discovery, subsidiary/currency context, safety, and consequential-write validation.
- The live connector capability/schema takes precedence over stale assumptions. In particular, no canonical record URL is synthesized when the connector does not provide one.
- No custom MCP capability was added. Standard NetSuite MCP capabilities remain preferred.
- Existing installations can replace the prior skill folder in place; no data migration is required.

## 1.0.0 - Submitted baseline - date not encoded in source package

- Baseline version reconstructed from the unversioned submitted archive solely to provide reviewer-friendly history.
- See the 1.0.1 entry for every intentional change made in this remediation.
