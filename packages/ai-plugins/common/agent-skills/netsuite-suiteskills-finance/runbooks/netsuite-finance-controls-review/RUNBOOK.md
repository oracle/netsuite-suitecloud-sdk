---
name: netsuite-finance-controls-review
description: "Use to review finance control exceptions across periods, document evidence coverage and recurrence, and propose remediation. Distinguish isolated observations from potential deficiencies; the control owner makes the deficiency determination."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.1"
  source-version: "1.0.1"
  integration-version: "0.7.4"
  runbook-id: RB-FIN-008
  category: finance
  access-mode: operation_dependent
---

# Finance Controls Review


## Audience and use cases

**User roles:** Controller, Internal Auditor, Compliance Manager, CFO

**Use cases:** Assess audit readiness ahead of fieldwork; identify recurring control exceptions across periods; review access and segregation-of-duties conflicts; check suspense and clearing balances at period end; prepare remediation items with owners.



# Finance Control Check

## Task

Identify control exceptions and distinguish isolated cleanup observations from recurring or systemic candidates for control-owner assessment.

## Trigger boundary

Owns the cross-period controls review; the control owner owns the deficiency determination. The underlying detail comes from
`netsuite-journal-entry-review` and the unavailable broad account-reconciliation specialist (not packaged; Bank Reconciliation Prioritization is not an equivalent); this skill reads across
periods and decides what the pattern means.

## Materiality

When a formal materiality memo or an auditor-stated threshold exists, it supersedes every default.
Reuse an applicable supplied memo or threshold; ask only when it is missing. Without it, continue non-threshold-dependent observations and mark materiality-dependent conclusions not verified. Do not apply generic defaults in an audit context.

## Check catalog

| Check | Exception when |
| --- | --- |
| Access review | Inactive users retain system access; preparer and approver are the same user |
| Journal support | Large or round-number entries with weak or absent support |
| Reconciling items | Items stale beyond policy, or open across consecutive periods |
| Suspense and clearing | Non-zero balance at period end |
| Transaction coding | Uncategorized or incompletely coded transactions |
| Close discipline | Period tasks not completed before lock; entries posted to a reopened period |

## Procedure

1. Resolve scope and the period range. A single period cannot establish a pattern — look back at
   least three where data allows.
2. Run each check and record exceptions with counts and values.
3. For every exception, determine whether it appeared in prior periods.
4. Classify:
   - **Isolated exception** — one occurrence, explainable, remediable.
   - **Potential control deficiency** — recurring across periods, or systemic in cause.
5. For potential deficiencies, state the control objective at risk and proposed remediation, with an evidenced owner role or owner not assigned.

## Language discipline

Do not assert a control deficiency as a conclusion of fact. State the observation, the recurrence
evidence, and that it warrants assessment as a potential deficiency by the control owner. The
determination is theirs, not the model's.

## Evaluation hardening

1. Build a **coverage matrix** before concluding on controls: `check | required evidence | available? | source | conclusion status`.
2. If a source is inaccessible or absent from the connector surface, mark the affected check `NOT_VERIFIED`. Do not convert missing evidence into a pass, a zero-exception count, or a statement that the control/process does not exist.
3. For report-derived suspense, clearing, or balance checks, guard against inverted detail-row signs. Use authoritative report totals and validate any sign normalization against those totals before interpreting detail.
4. Separate **observation**, **recurrence evidence**, and **control-owner determination**. Incomplete evidence can support an observation but cannot support a definitive deficiency conclusion.
5. When a requested review spans three periods but fewer are available, perform the bounded review and state the reduced recurrence confidence rather than fabricating history.



## Requested delivery

If the user asks to send or post the review, use an actually supported delivery capability within exact destination/content authorization and the shared action contract. If unavailable, return the completed analysis with delivery marked `BLOCKED_EXTERNAL_DELIVERY`; never claim it was sent.

## Plugin contracts

Apply the pinned plugin context and shared baseline, retrieval, evidence, outputs and action contracts supplied with this package. Domain-specific retrieval instructions above take precedence over the shared default within common safeguards. Verify current callable tool schemas, metadata, scope and access; no guessed schema or access-denial bypass. Preserve unknown and partial evidence. Requested analysis does not authorize external changes. Reuse authorization for an exact supported action and verify the result under the action contract.

## Evidence semantics

Use documented policies for support, coding, aging and expected access. An inactive employee flag alone does not establish effective system access; verify applicable login/role evidence. Count unique exceptions at a stated grain and distinguish unknown from zero. Reopened-period findings need event-time evidence; current period status alone does not prove the state when an entry posted. Track each recurring item by stable source identity or documented matching rule across comparable periods.

## Vocabulary

CFO means chief financial officer.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
