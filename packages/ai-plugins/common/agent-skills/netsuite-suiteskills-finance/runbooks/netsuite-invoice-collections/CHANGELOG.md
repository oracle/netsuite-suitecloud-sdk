## Integration 0.7.2 — 2026-10-14

Integrate current owner and explicit skill-version metadata as release 0.7.2. Keep upstream source versions separate and preserve the approved business procedure. Include the administrative scope corrections where applicable; this is not an upstream source release or runtime qualification.

## 0.7.0 — 2026-10-14

Integrate the reviewed candidate, preserve its source version and narrowed scope, and relocate verified common resources. Host/account qualification remains not_run.

## Prior integrated history

## 0.6.11 — 2026-10-13

Generate category-local shared resources and relocate installation paths. Preserve business procedures and authorized-actions policy; native secondary upload/readback remains not_run. Source version remains unknown.

# Invoice Collections changelog

## Integration history

### 0.6.10 — 2026-10-13

Integrate into the non-read-only secondary edition with canonical identity, shared controls, retained cleanup and source-supported action scope. Source version: unknown; source release date: not_collected. Native and live behavior: not_run.

## Prior cleanup history

Historical read-only candidate decisions below describe that edition and do not override this runbook.

# Invoice collections changelog

## 0.1.0-cleanup.1 — authored cleanup, 2026-10-13

Source declared version: unknown. Observation is not a source release date.

Remove all execution/approval-enabled delivery language; keep outreach and follow-up proposals local; use explicit account policy/materiality and evidence-based ranking, not invented recovery probabilities; validate suppression/payment-link coverage and DSO basis.

Original cumulative source history and exact file differences are preserved outside runtime in the per-skill handoff/history. This candidate is not integrated or approved for distribution; native behavior remains not_run.


## Incoming candidate history

# Change Log

**Runbook:** WF-FIN-011  
**Skill:** `netsuite-invoice-collections`  
**Status:** UPDATED  
**Current version:** 1.0.1  
**Baseline:** original submitted files are preserved separately in external review evidence.

## WF-FIN-011 - Invoice collections
**Skill:** `netsuite-invoice-collections`  
**Evaluation:** Partial  
**Version:** submitted baseline / reviewer-tracked `1.0.0` -> **`1.0.1` (UPDATED)**

| File | Status | Before | After |
| --- | --- | --- | --- |
| `RUNBOOK.md` | **MODIFIED** | Collections logic assumed richer aging/payment evidence than the evaluated connector consistently returned; aging headers, remaining-balance fields, payment linkage, and customer attribution could be incomplete. | Added `AGING_LABELS_UNVERIFIED`, metadata-first remaining-balance logic, payment-link coverage measurement, exclusion of unsupported payment features rather than zero-scoring, `UNATTRIBUTED_AR`, per-item ranking confidence, no-synthetic-record-link behavior, and blocked external delivery. |
| `examples/showcase-prompts.md` | **MODIFIED** | Ten broad collections prompts, including payment-behavior analysis that could imply unsupported evidence. | Replaced with exactly five prompts that explicitly test aging-label uncertainty, sparse payment links, unattributed AR, verified-factor ranking, and draft-only delivery when no mail capability exists. |
| `VERSION_HISTORY.md` | **NEW** | Not present in submitted skill. | Added `1.0.1` remediation entry plus reviewer-tracked `1.0.0` submitted baseline and compatibility/migration notes. |
| `tests/evaluations.md` | **NEW** | Not present in submitted skill. | Added regression cases for aging headers, SuiteQL-field discovery, payment-link sparsity, unattributed AR, and delivery limitations. |


## Unreleased standardization

Preserved submitted version and cumulative behavior history. Added target identity and metadata; separated historical, host and review-only materials from runtime. This is an unreleased revision, not a new release.

## Unreleased content review

Reviewed the standardized candidate against the selected plugin contracts; clarified evidence gates and business calculations. The submitted source version is preserved. Review findings and unexecuted acceptance cases are supplied separately.
