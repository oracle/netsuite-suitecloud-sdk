---
name: netsuite-journal-entry-review
description: "Use to screen posted and unposted journals for evidenced review criteria, explain each flagged entry and report assessment coverage. Prepare requested correcting-entry drafts; post only through a supported authorized workflow after validating the exact entry and accounting impact."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.0"
  source-version: "unknown"
  integration-version: "0.7.4"
  runbook-id: RB-FIN-012
  category: finance
  access-mode: operation_dependent
---

# Journal entry review


## Audience and use cases

**User roles:** Accountant, Accounting Manager, Controller, Internal Auditor

**Use cases:** Review manual journal entries before period lock; check accrual and reversal completeness; verify approval state and preparer-approver separation; identify entries posted to suspense or reopened periods; recommend disposition with a named owner.



# Journal Entry Review

## Task

Screen journal activity for the entries a controller would want to look at, and say why each one
surfaced.

## Trigger boundary

Reviews entries. Does not run the close (`netsuite-period-close-status`), does not reconcile the account
the entry hits (the unavailable broad account-reconciliation specialist (not packaged; Bank Reconciliation Prioritization is not an equivalent)), and does not itself conclude a control
deficiency (`netsuite-finance-controls-review`).

## Screening criteria

Surface an entry when any of these apply:

- Value above the materiality floor
- Large round-number amount with thin or absent support
- Manual entry to an account normally driven by a subledger
- Posted to a suspense or clearing account
- Missing or incomplete dimensional coding
- Accrual with no scheduled reversal, or a reversal that never landed
- Reclass with no visible offset
- Posted outside normal hours or by a user outside the expected preparer set
- Entry to a closed or reopened period

## Procedure

1. Resolve scope and period.
2. Pull posted and unposted entries for the period; note approval state on each.
3. Apply the screen above. Report distinct journal counts for flagged, fully assessed with no triggered criterion, and not fully assessed; show total scoped population and incomplete coverage. Never call missing support or approval evidence clean.
4. For each surfaced entry: amount, accounts, preparer, approver, support status, and the specific
   reason it surfaced.
5. Recommend disposition — accept, obtain support, reverse, or investigate. Name an owner.

## Write discipline

If the user requests a correcting entry, prepare its accounts, balanced debit/credit lines, amounts, currency, period/date, subsidiary, accounting book and required dimensions, with its accounting impact and reversal terms where relevant. Validate account eligibility, open-period status, current record metadata, required fields and effective permissions. Posting requires explicit approval of the exact entry and its impact, an actually supported posting/create workflow, and the shared action contract. Reuse authorization already given for that exact scope; a drafting request alone does not authorize posting. Read back the resulting entry and distinguish saved/unapproved from posted. If no supported write capability or necessary input exists, return the completed draft and name the gap; never invent a write interface.


## Plugin contracts

Apply the pinned plugin context and shared baseline, retrieval, evidence, outputs and action contracts supplied with this package. Domain-specific retrieval instructions above take precedence over the shared default within common safeguards. Verify current callable tool schemas, metadata, scope and access; no guessed schema or access-denial bypass. Preserve unknown and partial evidence. Requested analysis does not authorize external changes. Reuse authorization for an exact supported action and verify the result under the action contract.

## Screening evidence

Resolve the materiality threshold, expected preparer set, normal hours/time zone, support requirements, required dimensions, subledger account policy and reversal due dates from applicable evidence. Missing policy makes that criterion not assessed; do not guess thresholds. A reversal is overdue only after its evidenced due date and a complete relevant search; absent visibility is unknown. Current closed/reopened period state alone does not establish the state at posting time. Use posting/audit evidence for that historical claim. Count journal headers once even when multiple lines trigger; define the tested value basis and avoid netting a balanced journal to zero or summing both debit and credit sides as its value. Describe all flags as review candidates, never proof of error or misconduct.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
