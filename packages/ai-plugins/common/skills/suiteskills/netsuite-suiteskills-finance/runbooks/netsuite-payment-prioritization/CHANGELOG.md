## Integration 0.7.2 — 2026-10-14

Integrate current owner and explicit skill-version metadata as release 0.7.2. Keep upstream source versions separate and preserve the approved business procedure. Include the administrative scope corrections where applicable; this is not an upstream source release or runtime qualification.

## 0.7.0 — 2026-10-14

Integrate the reviewed candidate, preserve its source version and narrowed scope, and relocate verified common resources. Host/account qualification remains not_run.

## Prior integrated history

## 0.6.11 — 2026-10-13

Generate category-local shared resources and relocate installation paths. Preserve business procedures and authorized-actions policy; native secondary upload/readback remains not_run. Source version remains 0.2.8.

# NetSuite Payment Prioritization changelog

## Integration history

### 0.6.9 — 2026-10-13

Create the authorized-actions variant from 0.6.8. Remove blanket external-write/send restrictions and mandatory human execution handoffs; retain business procedures, evidence standards, actual tool limits and action-specific authorization. No new business skills or live write integrations are added. Native host/account execution and security approval remain not_run. Source version remains 0.2.8.

### 0.6.6 — 2026-10-13

Filter GL-derived balances to the verified requested accounting book, defaulting to the established primary book when unspecified. Rank the complete eligible set with a stable final ORDER BY and supported pageSize/pageIndex; do not wrap ordered rows in ROWNUM on connectors that reject that shape. Preserve ties, currency groups and blocked-item reasons. Verify whether an unpaid amount is current or as-of before using it in a dated payment position. Source version remains 0.2.8. Native host/account retesting: not_run.

### 0.6.3 — 2026-10-09

Use source_release_date, integration_release_date and first_included_date consistently in runbook metadata. Preserve source dates, original inclusion dates and not_collected states. Business procedures and source versions are unchanged.

### 0.6.1 — 2026-10-09

Retain the applied metadata/privacy/date standards and read-only procedure. Restore the four testing-eligible workflows at package level; no new live qualification.

### 0.6.0 — 2026-10-09

- Apply customer metadata, naming, date and privacy standards. Move private provenance and evaluation material out of the customer ZIP.
- Restore available cumulative source history. Preserve the business procedure, read-only scope and necessary dependencies.
- Source version remains 0.2.8. Host/account and model behavior qualification: not_run.

### Plugin 0.5.2 — 2026-10-08

Shared response, scope, evidence, navigation and resource-loading guidance updated. Runbook integration version remained 0.5.1.

### NetSuite Payment Prioritization

## 0.5.1 — 2026-10-08

Shared Redwood design alignment. Preserve upstream source version 0.2.8, business rules, verification dependencies and read-only behavior.

### NetSuite Payment Prioritization changelog

## 0.5.0 — 2026-10-08

- Integration version 0.5.0; upstream source version 0.2.8 (SKILL.md frontmatter).
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

## 0.2.8 - 2026-10-07 - Finance evaluation remediation


### Changes
- Added a hard metadata/source gate for payable and offset remaining amounts; failed retrieval is not zero.
- Documented the evaluated remaining-amount query failure in the SuiteQL reference and added a safe fallback contract.
- Made the read-only boundary explicit for Payment Run/payment/credit-application actions.
- Added no-synthetic-link and blocked external-delivery behavior plus regression tests.

### Compatibility and migration notes
- This revision preserves the submitted business purpose while tightening behavior proven unsafe or unverifiable by the evaluation.
- The universal NetSuite connector instruction layer remains the operating contract for tool selection, permissions, subsidiary/currency context, metadata discovery, and write safety.
- Live connector capability/schema evidence takes precedence over stale field, URL, or tool assumptions.
- No custom NetSuite MCP capability was added.
- Existing installations can replace the active skill files in place; no NetSuite data migration is required.

## 0.2.7 submitted baseline


## Incoming candidate history

# Change Log

**Runbook:** WF-FIN-016  
**Skill:** `payment-prioritization`  
**Status:** UPDATED  
**Current version:** 0.2.9  
**Baseline:** `_history/1.0.0-submitted-baseline/`

## 0.2.9 — 2026-10-13 — Ranking and GL-book evidence

| File | Status | Before | After |
| --- | --- | --- | --- |
| `RUNBOOK.md` | **MODIFIED** | Deterministic business priorities and generic book scope. | Requires whole-set reranking before offset/cash allocation and verified primary-book scope for operational GL cash; ID/name labels alone are not primary-setting proof. |
| `references/suiteql-queries.md` | **MODIFIED** | Stable pagination and top-N warning, without an explicit outermost-sort contract. | Uses exposed native paging, outer ORDER BY after wrappers, composite-key/page reconciliation, and verified primary-book filtering before aggregation. |
| `tests/evaluations.md` | **MODIFIED** | FDN evidence/read-only regression cases. | Adds ordering, pagination, scope completeness and accounting-book cases. |
| `VERSION_HISTORY.md` | **MODIFIED** | 0.2.8 remediation history. | Adds this narrowly scoped revision and migration notes. |

**Validation:** Initial candidate A: 94 evaluations, 89 PASS and 5 PARTIAL. Final runtime candidate B: 9 focused evaluations, 9 PASS. The full 94-case matrix was not rerun after the explicit primary-name clarification. Earlier findings remain attached to their original runs.

The controlled live wrapper comparison returned the same 16 records out of order; an outermost sort with native paging restored their complete order. Primary-book duplication was not reproduced on the visible account. Live evidence and permission limits remain explicit.

## 0.2.8 — Finance evaluation remediation (preserved)

| File | Status | Before | After |
| --- | --- | --- | --- |
| `RUNBOOK.md` | **MODIFIED** | Read-only payment proposal logic required remaining payable/offset balances but did not explicitly convert a failed remaining-field path into a hard verification boundary. | Requires live metadata/source verification for remaining amounts, blocks fully verified feasibility when balances are unavailable, declines writes, and never synthesizes record URLs. |
| `references/suiteql-queries.md` | **MODIFIED** | Reference did not contain the evaluated connector-specific coverage/failure boundary. | Added explicit remediation guidance tied to the evaluated connector limitation. |
| `examples/showcase-prompts.md` | **NEW/REPLACED** | No evaluation-specific five-prompt showcase contract. | Exactly five showcase prompts exercising the remediated behavior. |
| `tests/evaluations.md` | **NEW** | No remediation regression suite. | Added regression tests tied directly to the evaluation findings. |
| `VERSION_HISTORY.md` | **NEW** | No reviewer-oriented remediation history. | Added current remediation version, evaluation mapping, compatibility notes, and baseline pointer. |

For release chronology and migration notes, see the source release chronology below.

## Source release chronology

The following source history is retained as historical evidence, not current installation instructions. Historical paths name the immutable source archive; those files are external to this runtime package.

# Version History

## 0.2.9 - 2026-10-13 - Ranking and GL-book evidence

**Evaluation mapping:** Anthropic follow-up: ROWNUM wrapping disturbed ranking; primary-book GL filtering and native pagination recommended.

### Changes
- Require an outermost unique ORDER BY, exposed connector pagination, complete-page reconciliation and a final whole-set business sort before allocation.
- Verify primary-book context and filter GL input before aggregation; unknown books block GL feasibility, and secondary-book views remain separate. A name-only book list is not primary-setting evidence unless its tool contract guarantees that meaning.
- Preserve all 0.2.8 read-only, remaining-balance, source, link and delivery boundaries. No eligibility, priority, offset or cash policy was changed.

### Validation
Initial candidate A: 94 evaluations, 89 PASS and 5 PARTIAL. Final runtime candidate B: 9 focused evaluations, 9 PASS. The full 94-case matrix was not rerun after the explicit primary-name clarification. Earlier findings remain attached to their original runs.

Live reservation, historical-date and other source qualifications remain open; the revision is not universal cash-feasibility certification.

### Compatibility and migration notes
- Tool arguments, fields, book IDs and page limits remain capability-driven. No new MCP capability or NetSuite data migration is required.
- An outer ORDER BY does not repair a truncated candidate set. A primary-book filter does not prove available bank funds or native currency.
- Exact previous release files are preserved in `_history/0.2.8-fdn/`; omit `_history` from runtime uploads.
- Regression evidence and live-account limitations are documented on the Payment Prioritization project page, separately from earlier-version findings.

## 0.2.8 - 2026-10-07 - Finance evaluation remediation

**Evaluation mapping:** WF-FIN-016 was graded Partial in the Oct. 5-6, 2026 SuiteSkills finance evaluation.

### Changes
- Added a hard metadata/source gate for payable and offset remaining amounts; failed retrieval is not zero.
- Documented the evaluated remaining-amount query failure in the SuiteQL reference and added a safe fallback contract.
- Made the read-only boundary explicit for Payment Run/payment/credit-application actions.
- Added no-synthetic-link and blocked external-delivery behavior plus regression tests.

### Compatibility and migration notes
- This revision preserves the submitted business purpose while tightening behavior proven unsafe or unverifiable by the evaluation.
- The universal NetSuite connector instruction layer remains the operating contract for tool selection, permissions, subsidiary/currency context, metadata discovery, and write safety.
- Live connector capability/schema evidence takes precedence over stale field, URL, or tool assumptions.
- No custom NetSuite MCP capability was added.
- Existing installations can replace the active skill files in place; no NetSuite data migration is required.

## 0.2.7 submitted baseline

- Exact submitted files are preserved under `_history/1.0.0-submitted-baseline/`.
