---
name: netsuite-executive-finance-reporting
description: "Use to assemble an executive or board finance package from named upstream finance-skill results. Preserve metric provenance and tie-outs, surface incomplete evidence, and prepare a scoped narrative and proposed actions; route missing analysis to its owning skill."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.1"
  source-version: "1.0.1"
  integration-version: "0.7.4"
  runbook-id: RB-FIN-007
  category: finance
  access-mode: operation_dependent
---

# Executive financial reporting


## Audience and use cases

**User roles:** Controller, FP&A Manager, CFO, Investor Relations

**Use cases:** Produce a monthly or quarterly board reporting package; write the CFO summary narrative; build an executive finance dashboard; run tie-out checks before distribution; convert completed analysis into an audience-ready deliverable.



# Executive Finance Pack

## Task

Turn completed analysis into something an executive audience can act on in one read.

## Trigger boundary

Assembly only. If the underlying numbers have not been produced yet, call the analysis skills first
and say so — do not generate figures here. This is the single hardest rule in the skill, because a
narrative shell will happily accept invented numbers.

## Prerequisites

Every figure entering the pack must arrive from a named upstream skill run with a stated scope.
A figure without provenance does not go in the pack.

## Narrative shell

```text
Headline:    one sentence with the key financial signal
Scope:       period | entity scope | currency | preliminary or final
Performance: 2-3 sentences with quantified positives
Risks:       1-2 sentences with quantified concerns
Outlook:     one sentence on the next visible trend
Action:      what should happen next | owner | by when
```

## Board package checks

Run before presenting anything board-oriented:

- For an indirect cash flow statement, its starting net income agrees with the income statement for the same period, entity, currency and accounting book; adjustments bridge net income to operating cash flow.
- Ending cash and cash equivalents reconcile to the corresponding balance sheet components on the same basis, with restricted-cash or presentation differences explained in a documented bridge.
- Reconciliation failures are flagged before distribution, not after.
- Unrestricted cash is distinguished from restricted.
- Recurring trends are separated from one-time items.

A failed tie-out blocks distribution. Report it as `CRITICAL:` rather than footnoting it.

## Dashboard and artifact guidance

- Period and entity scope in the header, always.
- Names, never internal IDs.
- Rounded headlines; precise supporting tables.
- Short key-takeaway footer on dashboard-style output.
- `FLAG:` and `CRITICAL:` for escalation.

## Visual styling

Apply the pinned shared presentation guidance; preserve all domain verification gates and requested output.

## Action discipline

Every action names a task, an owner (a role unless a person is supplied), and a date. Mark recommendations as proposed; label an unprovided owner or date as not agreed and identify the decision needed. Never invent a commitment. "Monitor this"
and "look into this" are not actions and do not ship.

## Upstream provenance contract

This skill is an **assembly layer**, not a direct finance-retrieval layer.

Before accepting any figure, require an upstream result object or equivalent evidence containing:
- upstream skill name;
- period/date scope;
- subsidiary or consolidated scope;
- currency and accounting book when relevant;
- evidence source used by that skill;
- whether the result is final, preliminary, or partially verified;
- the metric/value being handed off.

If a required upstream result is missing, invoke or route to the owning finance skill only when available in the active catalog; otherwise name the missing analysis and retain a clearly incomplete draft. Wait for verified results before including its figures. **Do not bypass the provenance contract by pulling a report directly inside this skill.** A direct report result without an owning upstream skill run is not eligible for the executive pack.

Maintain a small provenance table in the working result:
`metric | value | upstream skill | scope | evidence | status`.

If any critical figure is `UNVERIFIED`, `PARTIAL`, or fails a tie-out, keep it out of headline conclusions and surface the limitation explicitly.



## Plugin contracts

Apply the pinned plugin context and shared baseline, retrieval, evidence, outputs and action contracts supplied with this package. Domain-specific retrieval instructions above take precedence over the shared default within common safeguards. Verify current callable tool schemas, metadata, scope and access; no guessed schema or access-denial bypass. Preserve unknown and partial evidence. Requested analysis does not authorize external changes. Reuse authorization for an exact supported action and verify the result under the action contract.

## Requested delivery

If the user requests sending or posting the prepared package, verify destination, exact content, authorization, the actual supported delivery interface and successful tie-outs before delivery. Reuse exact-scope authorization under the shared action contract. If the capability is unavailable, return the package with `BLOCKED_EXTERNAL_DELIVERY`. An unresolved tie-out blocks distribution, while a clearly labeled review draft may still be prepared. Never claim delivery from preparation alone.

## Vocabulary

CFO means chief financial officer; FP&A means financial planning and analysis.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
