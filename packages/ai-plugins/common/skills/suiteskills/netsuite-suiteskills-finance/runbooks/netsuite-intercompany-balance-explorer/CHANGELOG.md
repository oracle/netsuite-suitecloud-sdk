## Integration 0.7.2 — 2026-10-14

Integrate current owner and explicit skill-version metadata as release 0.7.2. Keep upstream source versions separate and preserve the approved business procedure. Include the administrative scope corrections where applicable; this is not an upstream source release or runtime qualification.

## 0.7.0 — 2026-10-14

Integrate the reviewed candidate, preserve its source version and narrowed scope, and relocate verified common resources. Host/account qualification remains not_run.

## Prior integrated history

## 0.6.11 — 2026-10-13

Generate category-local shared resources and relocate installation paths. Preserve business procedures and authorized-actions policy; native secondary upload/readback remains not_run. Source version remains 1.1.3.

# Intercompany Balance Explorer changelog

## Integration history

### 0.6.9 — 2026-10-13

Create the authorized-actions variant from 0.6.8. Remove blanket external-write/send restrictions and mandatory human execution handoffs; retain business procedures, evidence standards, actual tool limits and action-specific authorization. No new business skills or live write integrations are added. Native host/account execution and security approval remain not_run. Source version remains 1.1.3.

### 0.6.3 — 2026-10-09

Use source_release_date, integration_release_date and first_included_date consistently in runbook metadata. Preserve source dates, original inclusion dates and not_collected states. Business procedures and source versions are unchanged.

### 0.6.1 — 2026-10-09

Retain the applied metadata/privacy/date standards and read-only procedure. Restore the four testing-eligible workflows at package level; no new live qualification.

### 0.6.0 — 2026-10-09

- Apply customer metadata, naming, date and privacy standards. Move private provenance and evaluation material out of the customer ZIP.
- Restore available cumulative source history. Preserve the business procedure, read-only scope and necessary dependencies.
- Source version remains 1.1.3. Host/account and model behavior qualification: not_run.

### Plugin 0.5.2 — 2026-10-08

Shared response, scope, evidence, navigation and resource-loading guidance updated. Runbook integration version remained 0.5.1.

### Intercompany Balance Explorer

## 0.5.1 — 2026-10-08

Shared Redwood design alignment. Preserve upstream source version 1.1.3, business rules, verification dependencies and read-only behavior.

### Intercompany Balance Explorer changelog

## 0.5.0 — 2026-10-08

- Integration version 0.5.0; upstream source version 1.1.3 (SKILL.md frontmatter).
- integrate october 8 submission.
- Read-only retrieval, analysis and unsaved drafts; no confirmation-to-write path.
- Latest shared guidance plus metadata-interface routing and safe conventional CSV.
- Host/account qualification remains not_run.

### Source comparison and release adaptation

Moves from prior intercompany 1.1.0 to ns-intercompany 1.1.3. Adds non-overlapping hierarchy resolution, relevant native-statement evidence, current-period cutoff and future-date exclusion, cautious pair/journal attribution, empty-report limits and no unsupported pre-range history. Source history claims intermediate 1.1.1 and 1.1.2.


### Inventory selection

Retained by exact Yes (account) classification in the October 7 capability inventory, filtered October 8. Latest selected source version is retained separately from inventory membership.

### Runbook metadata

Add date-added-to-plugin: 2026-10-08 for inclusion in plugin version 0.5.0. Earlier historical first-inclusion dates are not inferred.

Earlier integration change notes before 0.5.0 are not present in the retained per-runbook changelog. Prior membership alone is not a change record.

## Source history

The following entries were supplied with the selected source. They record source changes, not execution results for this plugin. Historical instructions do not override the current runbook or read-only edition.

### Version History

## 1.1.3 — 2026-10-07

### Changes
- Strengthened conservative language for unverified account mappings, counterparties, and memo/date journal groupings.
- Added a no-pre-range-history inference guard.
- Updated the five showcase prompts using the completed connected testing results.

### Compatibility
- Preserves the text-first, read-only output and existing `ns-intercompany-balance-explorer` identity.

## 1.1.2 — 2026-10-07

### Changes
- Added the current-open-period as-of-date guard and future-dated-activity exclusion.
- Enforced candidate terminology until account mapping and counterparty compatibility are verified.
- Made relevant native statement views mandatory despite full-chart report responses.
- Restricted empty Reconciliation and Elimination results to “no rows returned,” and required evidence before pre-range-activity claims.

### Compatibility
- Maintains the read-only, text-first Markdown review and non-overlapping hierarchy rules from prior versions.

## 1.1.1 — 2026-10-07

### Changes
- Requires hierarchy resolution before financial-statement retrieval and pair calculation.
- Uses non-overlapping analysis units and excludes parent/child or roll-up/descendant combinations from tie-outs.
- Bounds date-only reviews to verified active units and mapped intercompany account rows; full-estate coverage remains available only when explicitly requested.
- Requires one normal response rather than fresh-chat continuation caused by irrelevant full-chart report rows.
- Makes bounded SuiteQL a supplement for journal detail, mapping, counterparties, and movement explanation after native reports.

### Compatibility
- Maintains the text-first Markdown output and read-only authority model introduced in 1.1.0.

## 1.1.0 — 2026-10-07

### Changes
- Converted the skill from an interactive visual dashboard workflow to a text-first, Markdown-only review workflow.
- Removed dashboard, HTML/CSS/JS, chart, tab, filter, and NetSuite artifact-brand requirements.
- Aligned the package with the reusable Agent Skills structure used by the companion NetSuite skills.
- Preserved the baseline connector principles: NetSuite-first evidence, standard capabilities before custom fallbacks, source verification, subsidiary/currency/book awareness, least privilege, SuiteQL safeguards, read/write separation, prompt-injection resistance, and post-operation validation.
- Added five showcase prompts and retained sanitized generic QA cases.

### Compatibility
- Intended for Agent Skills-style clients with access to the NetSuite AI Connector Service and exposed NetSuite MCP capabilities.
- The business workflow is portable; provider-specific metadata remains a thin wrapper.

### Migration Notes
- Requests that previously produced the Intercompany Activity Dashboard now return a structured Markdown Intercompany Review.
- Visual dashboard sections, charts, interactive filters, tabs, and HTML artifact generation are no longer part of the skill.
- Re-test source coverage, tie-out calculations, and any client-specific link rendering in the target account after installation.

## 1.0.0 — 2026-10-01

- Initial packaged intercompany balance explorer centered on a read-only interactive dashboard.


## Incoming candidate history

# Changelog

## File-by-file change record — 1.1.3

| File | Status | Before | After |
| --- | --- | --- | --- |
| `RUNBOOK.md` | Updated | Candidate language was limited to pair-status guidance. | Extends the guard to verdicts, findings, journal attribution, and next steps; prevents unsupported pre-range-history claims. |
| `references/pairing-and-exceptions.md` | Updated | Unverified pair handling covered classification. | Requires candidate attribution for memo/date journal groupings and forbids definitive mismatch/tie language before compatibility is verified. |
| `references/runtime-contract.md` | Updated | Report and source-coverage rules were present. | Adds tested open-period, relevant-statement, full-chart, empty-report, and pre-range-evidence safeguards. |
| `examples/showcase-prompts.md` | Updated | Five generic showcase prompts. | Keeps exactly five prompts and makes the tested hierarchy, current-period, and candidate-conclusion expectations explicit. |
| `tests/CASES.md` | Updated | Generic behavior and earlier regression cases. | Adds regression cases for open periods, required Balance Sheet evidence, empty reports, candidate wording, journal attribution, and pre-range inference. |
| `tests/DATASET-PLAN.md` | Updated | Core hierarchy and report-volume coverage. | Adds open-period, empty-report, and ending-balance/period-movement test data requirements. |
| `tests/evaluations.md` | Added | No evaluation record in the active package. | Records the supplied connected showcase evaluation outcomes and what was remediated, without storing live account data. |
| `_history/` | Added | Prior package versions were outside the active package. | Preserves the supplied 1.0.0 and 1.1.0 baselines without modifying their files. |
| `VERSION_HISTORY.md` | Updated | Version history through 1.1.2. | Adds 1.1.3. |
| `CHANGELOG.md` | Updated | Narrative version bullets. | Adds this file-by-file Before → After record. |

## 1.1.3 — 2026-10-07

- Extends the candidate-versus-confirmed guard to verdicts, journal attribution, and action-item wording; an inferred memo/date grouping cannot be presented as a proven cause.
- Prevents historical-activity claims based only on a match between selected-period movement and an ending balance.
- Updates the showcase prompts to distinguish confirmed mismatches from candidate differences and to request conservative specific-pair conclusions.

## 1.1.2 — 2026-10-07

- Requires open-period reviews to end on the actual run date and exclude future-dated activity unless the user explicitly requests otherwise.
- Makes candidate-versus-confirmed language mandatory across findings, tables, rankings, and actions whenever account mapping or counterparty evidence is unverified.
- Requires the Balance Sheet for receivable/payable-exposure reviews and the Income Statement when the review presents revenue, cost, or expense flow; a full-chart response is not a reason to omit a relevant statement.
- Limits empty Reconciliation and Elimination results to the fact that no rows were returned, and prohibits unsupported claims about expected, posted, missing, or failed eliminations.
- Prohibits unsupported claims that an account had no pre-range activity.

## 1.1.1 — 2026-10-07

- Adds a mandatory subsidiary-hierarchy gate before statement retrieval and pair calculations.
- Prevents parent/child, consolidated/descendant, and other roll-up overlap from being added or compared in a tie-out.
- Replaces all-entity, full-chart retrieval with a bounded review of verified active, non-overlapping analysis units and mapped intercompany account rows, unless full-estate coverage is explicitly requested.
- Requires a normal review to complete in one response; irrelevant report-row volume is not a reason to require fresh chats.
- Clarifies that bounded SuiteQL supplements native financial-statement evidence for mapping and journal activity; it does not replace statement evidence.
- Adds regression cases for hierarchy overlap, high-row-count reports, and unverified candidate differences.

## 1.1.0 — 2026-10-07

- Replaces the interactive HTML/JS dashboard contract with a text-first Markdown intercompany review.
- Removes all artifact-specific HTML/CSS/JS, chart, tab, filter, dashboard, and visual-brand requirements from the installable skill.
- Aligns package structure with the current Agent Skills pattern with host metadata retained separately in review evidence and removing `README.md`, `SUBMISSION.md`, fixed query files, and visual artifact references.
- Preserves read-only NetSuite authority boundaries, source coverage, pairing/comparability rules, SuiteQL safeguards, untrusted-data handling, and evidence-based exception classification.
- Keeps generic behavior tests but removes account-specific connected-QA evidence from the installable package.
- Adds exactly five showcase prompts.

## 1.0.0 — 2026-10-01

- Prior revision centered on a self-contained interactive HTML/JS intercompany activity dashboard.
- Added source-coverage gates, subsidiary-pair analysis, transaction links, and financial-statement context.

## Unreleased standardization

Preserved submitted version and cumulative behavior history. Added target identity and metadata; separated historical, host and review-only materials from runtime. This is an unreleased revision, not a new release.

## Unreleased content review

Reviewed the standardized candidate against the selected plugin contracts; clarified evidence gates and business calculations. The submitted source version is preserved. Review findings and unexecuted acceptance cases are supplied separately.

## Earlier submitted history (retired behavior)

The following supplied draft entries are historical only. Active 1.1.3 is text-first; these entries do not restore the retired dashboard or its host assumptions.

## 0.9.0-draft — 2026-10-01

- Adds a full source-coverage gate before JSX generation: Trial Balance, Balance Sheet, Income Statement, journal detail, Intercompany Reconciliation, and Intercompany Elimination must each be returned or attempted and disclosed.
- Requires every confirmed subsidiary to be covered when a report cannot provide a subsidiary breakout; prohibits a sampled entity set from standing in for consolidated scope.
- Restores posted and pending journal-detail retrieval as a required dashboard source and makes source-link capture part of retrieval.
- Requires validated financial source/report links when an account-detail drill-down is unavailable, rather than silently dropping account links.

## 0.8.0-draft — 2026-10-01

- Makes dashboard filters functional shared React state and defines the minimum-mismatch control.
- Adds required account/report and transaction drill-down links.
- Removes the prior-period JEs tab and avoids unnecessary report runs for faster generation.

## 0.7.1-draft — 2026-10-01

- Adds the supplied NetSuite Ocean brand system for all JSX dashboard artifacts.

## 0.7.0-draft — 2026-10-01

- Makes Trial Balance, Balance Sheet, Income Statement, and journal detail the required controller dashboard source set.
- Clarifies that saved searches supplement journal detail and cannot be the dashboard's sole source.

## 0.6.1-draft — 2026-10-01

- Removes the redundant prose confirmation step before the bounded read-only SuiteQL fallback.
- Uses the runtime's built-in permission dialog as the required query approval step.

## 0.6.0-draft — 2026-10-01

- Adds a pending-approval intercompany-JE queue to the dashboard.
- Keeps pending entries explicitly outside posted balance and tie-out calculations.

## 0.5.0-draft — 2026-10-01

- Requires one standalone interactive React/JSX artifact as the default output.
- Adds dashboard tabs, filters, drill-down, data-coverage, and empty-state specifications.

## 0.4.0-draft — 2026-10-01

- Makes the interactive Intercompany Activity Dashboard the default deliverable.
- Supports a minimal date-only prompt, with consolidated scope and zero materiality as declared defaults.

## 0.3.1-draft — 2026-10-01

- Requires saved-search discovery and an explicit SuiteQL-permission request when expected posted intercompany JEs are absent from a native report population.

## 0.3.0-draft — 2026-10-01

- Separates sales/purchase matching, posted elimination, mapped-account balance, and intercompany-JE source populations.
- Adds seeded-intercompany-JE and zero-result coverage QA cases.
- Prevents unsupported account-wide “no intercompany activity” conclusions.

## 0.2.0-draft — 2026-10-01

- Adds month-to-date, quarter-to-date, and arbitrary date-range support.
- Adds an in-progress review boundary and prior-period intercompany-JE context panel.
- Requires explicit returned evidence before linking a prior-period JE to a current exception.

## 0.1.0-draft — 2026-10-01

- Initial read-only intercompany balance explorer.
- Adds subsidiary-pair tie-out rules, dashboard guidance, and QA cases.
