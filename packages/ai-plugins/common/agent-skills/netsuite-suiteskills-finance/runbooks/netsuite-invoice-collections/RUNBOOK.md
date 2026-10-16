---
name: netsuite-invoice-collections
description: "Build an evidence-based collections queue for open receivables, separating contact blockers before ranking verified recovery factors. Use for invoice follow-up priorities and outreach drafts; sending messages or creating follow-up tasks requires the specific authorized scope and a supported capability. General ledger reconciliation and standalone days-sales-outstanding trends belong to other workflows."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.1"
  source-version: "1.0.1"
  integration-version: "0.7.4"
  runbook-id: RB-FIN-011
  category: finance
  access-mode: operation_dependent
---

# Invoice collections



# Invoice Collections

## Task

Produce a work queue short enough to actually work, ranked by what is likely to be collected, not
by what is oldest.

## Trigger boundary

| Request | Owner |
| --- | --- |
| "Who should we chase today" | This skill |
| "Does AR tie to the GL" | the unavailable broad account-reconciliation specialist (not packaged; Bank Reconciliation Prioritization is not an equivalent) |
| "What is our DSO trend" | `netsuite-financial-statement-review` |
| "Will collections cover payroll" | `netsuite-cash-and-liquidity` |

## Suppression before ranking

Run the suppression pass first. Chasing an invoice that should not be chased costs more than
missing one, because it damages a relationship and wastes the collector's day.

Suppress and report separately as `NOT_YET_COLLECTABLE` with the reason stated:

- Terms have not yet elapsed
- Open support case on the account
- Pending return, RMA, or credit memo
- Fulfillment incomplete or short-shipped
- Active dispute with a recorded owner
- Unapplied payment or credit that may already cover the balance

## Ranking

Rank the remainder by expected recoverability, combining:

- Days past due and the trend in days-to-pay for this customer
- Payment history, including partial payment behaviour
- Promise-to-pay history and any broken promises, which outrank age
- Total exposure across all open invoices, not the single invoice
- Customer status, credit hold, and order activity still flowing

Apply the operating materiality gate. A queue containing everything is a queue nobody works.

## Procedure

1. Resolve scope. Collections is usually entity-specific — confirm subsidiary before ranking.
2. Pull open receivables with payment and promise history.
3. Run suppression. Report the suppressed set with reasons and total value.
4. Rank the collectable set. Apply the materiality gate.
5. Recommend a next action per invoice: call, email, escalate to credit hold, escalate to the
   account owner, or write-off review. Name an owner and a date for each.
6. Report aging buckets, total overdue exposure, and DSO alongside the queue.
7. Draft outreach where requested, matched to the relationship — gentle for a good payer, firm for
   a repeat late payer.

## Write discipline

Draft outreach and proposed follow-up tasks remain proposals until the user authorizes their exact target and content. Reuse authorization already given for that scope. Before an authorized send or task creation, verify the current supported interface, recipient or assignee, content, current suppression evidence and business prerequisites; follow the pinned action contract and verify the resulting record or delivery status. If an outcome is ambiguous, reconcile it before retrying. When the capability is absent, return the prepared draft and name the blocked action. Credit holds and write-offs are escalation recommendations, not automatic outcomes of ranking.

## Output

Suppressed set with reasons, ranked work queue with action, owner and date, aging and overdue
exposure, DSO, and drafted outreach held for approval.

## Evaluation hardening

Apply these evidence rules before ranking or reporting aging:

1. **Aging-bucket labels.** The connector can return aging columns without reliable headers. If bucket labels are not explicitly present in trusted output, do not call them `Current`, `1-30`, `31-60`, etc. Present `Bucket 1`, `Bucket 2`, ... with `AGING_LABELS_UNVERIFIED`, or use a second authoritative source only if it actually verifies the mapping.
2. **Remaining balance.** Prefer the official AR aging/open-receivable source for open balance. Do not guess a `remainingamount`/`foreignamountremaining` field or depend on an unverified SuiteQL field. If SuiteQL is needed, discover metadata first and stop if the field/join is unavailable.
3. **Payment-link coverage.** Before using payment history, quantify how much of the candidate population has verified invoice-to-payment linkage. Sparse links cannot support conclusions about first payment, final settlement, partial-payment pattern, or days-to-pay for the uncovered population. Exclude unavailable features from the ranking rather than scoring them as zero.
4. **Unattributed receivables.** Receivables without a verified customer/entity stay in a separate `UNATTRIBUTED_AR` bucket. Do not assign them to a customer or use them in customer-level exposure/risk scoring.
5. **Queue confidence.** Show which ranking factors were actually available for each invoice/customer. A short queue based on fewer verified factors is preferable to a richer queue built from invented evidence.

## Shared plugin context

Apply the category entrypoint and pinned shared guidance for current capabilities, retrieval, actions, evidence, output and links. Applicable domain retrieval below takes precedence over shared defaults; retain schema and access safeguards. This analytical skill does not acquire additional business actions merely from the target edition.

## Evidence needed for prioritization

Mark every suppression factor as verified clear, verified blocker, or unknown for each invoice. Missing dispute, return, support-case or fulfillment evidence does not prove clearance. Keep invoices with a material unknown contact blocker in a review-needed group; do not recommend immediate outreach as if cleared. Show suppressed, review-needed and eligible totals separately in each currency, with coverage denominators.

Use an applicable customer policy or an explicitly selected materiality threshold. If neither is available, show an unfiltered ranked subset and disclose the displayed count versus the full eligible population; do not invent a monetary policy. Explain the observed ordering factors and tie handling. Recoverability is a qualitative priority, not a calibrated probability. A broken promise may raise follow-up urgency without proving higher recovery likelihood. Propose owner/date when not verified, label them proposed, and never invent assignment.

Days sales outstanding (DSO) requires a named method, comparable receivable balance, verified net credit sales and period day count in the same currency/entity basis. Use the applicable policy method; if no method is specified, label any explicit illustrative method and its assumptions. With unavailable or nonpositive sales denominator, withhold DSO. Do not infer it from age alone or silently substitute total sales for credit sales.

## Terms

AR or A/R means accounts receivable; GL means general ledger; RMA means return merchandise authorization. DSO means days sales outstanding.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
