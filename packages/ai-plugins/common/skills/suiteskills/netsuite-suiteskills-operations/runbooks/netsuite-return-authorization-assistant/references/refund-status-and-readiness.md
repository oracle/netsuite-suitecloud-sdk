# RMA-linked refund status and readiness

Read this reference only when the user asks about the downstream credit or refund process,
policy readiness, or recorded financial progress for a selected return authorization. The
core skill owns RMA identity, source selection, permission limits, read-only RMA proposals,
and the financial no-write boundary. This reference authorizes no financial action.

## Three separate conclusions

1. **Recorded state:** What the selected RMA and explicitly linked receipt, credit, and refund
   records show, including their validated status, amounts, currency, applications, quantities,
   and as-of time. An RMA status or received-quantity field is narrower evidence than an inspected
   receipt or financial transaction.
2. **Policy eligibility:** Whether verified current account configuration, applicable company
   policy, required approval, and the selected form/process support the *next proposed step*.
   A configured path or approved RMA is not, by itself, permission or instruction to pay.
3. **Financial action completed:** Whether a directly linked financial record and its validated
   status/application evidence establish the specific NetSuite action claimed. A credit memo,
   customer refund, and cash-sale refund are distinct. Even a recorded refund does not by itself
   prove external processing, bank clearing, delivery, or customer receipt.

Keep these conclusions separate in the response. If a required source, relationship, field,
policy, preference, permission, or processing fact is unavailable, say exactly which conclusion
is **not established**. Do not convert an empty lookup into “no refund,” an approved status into
“eligible,” or a refund record into a promise that funds reached the customer.

## Ordered read-only review

1. Resolve and directly read the selected RMA using the core [selected-RMA evidence path](../RUNBOOK.md#efficient-selected-rma-evidence-path).
   Establish its source-sale or standalone basis, form/process, current status label, approval
   evidence, line-level authorized and recorded received quantities, and the relevant customer,
   subsidiary, currency, and time scope. Read an item-receipt document only through an accessible,
   validated relationship. Keep a recorded RMA quantity distinct from an inspected receipt.
2. Identify the configured credit-oriented or cash-refund-oriented path only from current account
   evidence. Verify whether Advanced Receiving and Refund in Advance of Return apply to this RMA,
   and obtain the smallest relevant approved company policy. Do not infer either preference from
   the RMA's form title, status, zero receipt, or a missing metadata result.
3. Check the applicable financial evidence path even if the RMA has zero recorded receipt or a
   credit-memo lookup is empty. For a credit path, validate the concrete credit memo's link to
   the RMA and directly read its status, amount/currency, and application evidence. For a
   customer refund, narrow candidates to the selected customer and verify an explicit source or
   applied-transaction relationship on the refund record. For a cash-sale path, validate the
   source cash sale and the supported cash-refund record/link path before describing a cash
   refund. Do not infer a relationship from matching customer, amount, or date. Treat denied,
   empty, partial, and failed paths as their specific evidence limits.
4. Compare recorded steps with the account's actual policy and approval requirements. Receipt
   can be a verified prerequisite for the selected path; Refund in Advance of Return can change
   timing. A partial receipt establishes only the recorded quantity, not eligibility for a
   proportional credit or refund. A completed credit application is not a completed cash
   payment. Verify the relevant accounting-period, payment-method, and processing requirements
   only if the user's question needs those conclusions.
5. Report the three conclusions and the next authorized owner or verification step. Financial
   execution stays with the authorized NetSuite workflow or designated finance owner. This skill
   must not prepare, create, apply, issue, or retry a credit memo, cash refund, customer refund,
   payment, or financial adjustment.

## Interpretation and handoff

- When receipt is zero and the advance-refund preference or policy is unknown, say the accessible
  evidence does not establish readiness. Do not assert that receiving must act first; ask the
  authorized receiving/finance owner to verify the configured exception path and the applicable
  direct refund evidence.
- When a verified policy requires receipt and none is recorded, say the RMA is not established as
  ready under that requirement and route to the authorized receiving workflow. Keep any accessible
  financial-record finding separate; do not ignore a contradictory record.
- When a credit memo is recorded, say whether its RMA link and application are verified. Do not
  call the customer refunded solely because a credit memo exists or has a positive amount.
- When a directly linked refund record is accessible, state only its supported NetSuite status
  and relationship. If processing or settlement evidence is unavailable, do not say the money
  was sent, cleared, or received, or that the original payment method was used.
- In the handoff, include only the selected RMA, customer and currency when material, linked sale,
  relevant authorized/received quantities, verified related transaction labels/statuses/amounts,
  and the exact missing evidence. Omit bank details, payment credentials, addresses, full memos,
  and unnecessary personal data. State that the financial owner must verify policy, approval,
  accounting period, payment method, and processing before any action.

Lead with the answer to the user's question, followed by **Recorded state**, **Policy
eligibility**, and **Financial action** only when each distinction matters. Name the specific
unverified or conflicting check beside the affected conclusion; avoid a blanket “ready” or
“refunded” label for the whole RMA.
