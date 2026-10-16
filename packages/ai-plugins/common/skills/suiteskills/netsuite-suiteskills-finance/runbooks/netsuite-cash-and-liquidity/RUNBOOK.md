---
name: netsuite-cash-and-liquidity
description: "Assess cash position, accessible versus restricted cash, near-term funding pressure and runway for a specified entity and period. Use for liquidity and payroll-coverage questions; state verified inputs and scenario assumptions. The formal cash flow statement and invoice collections belong to their respective workflows."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.1"
  source-version: "1.0.1"
  integration-version: "0.7.4"
  runbook-id: RB-FIN-006
  category: finance
  access-mode: operation_dependent
---

# Cash and Liquidity



# Cash and Liquidity

## Task

Answer the liquidity question actually being asked, which is almost never "what is the balance" —
it is "for how long, and what breaks first".

## Trigger boundary

Owns the position and its implications. The GAAP cash flow statement belongs to
`netsuite-financial-statement-review`. Chasing specific overdue invoices belongs to the AR
collections skills.

## Procedure

1. Resolve scope. Cash questions are usually entity-specific — do not default to consolidated
   without saying so, since consolidated cash is frequently not accessible cash.
2. Establish the position, separating unrestricted from restricted cash. Never blend them.
3. Compute the metrics that match the question:
   - Burn rate — monthly net cash outflow
   - Cash coverage — cash / monthly operating expense
   - Runway — months at current burn, and at trailing three-month average burn
   - Free cash flow — operating cash flow minus capex
4. Layer near-term timing: AR expected to land, AP due, payroll dates, known one-time outflows.
5. Where covenants are known, compute headroom and state the test date.
6. State the assumption set explicitly. A runway figure without its assumptions is not usable.

## Rules

- Give runway as a range driven by burn basis, not a single number presented as fact.
- Restricted, escrowed, and subsidiary-trapped cash are called out separately every time.
- If the period is open, the position is preliminary — say what is still outstanding.
- Liquidity stress is a `CRITICAL:` label, not a soft observation.

## Output

Position by entity, restricted versus unrestricted, burn and runway with basis, near-term timing
pressure, covenant headroom where applicable, and the assumptions behind all of it.

## Evaluation hardening

1. **Do not infer liquidity from inverted detail signs.** When a financial report returns a parent cash total and child accounts with the opposite sign orientation, use the parent total as the authoritative report balance. Normalize child presentation only when the children reconcile to that parent after a consistent sign flip; otherwise label the detail orientation unverified.
2. **Restricted/reserved cash is an evidence question.** If a source for restricted, escrowed, reserved, or subsidiary-trapped cash is not exposed, report those components as `NOT_VERIFIED` rather than zero. Do not calculate "available cash" as unrestricted cash unless the restriction evidence is actually available.
3. **Runway and coverage calculations require verified components.** If burn, payroll, AP timing, AR timing, covenant, or restriction inputs are missing, show the computable metric plus the missing-input caveat; do not backfill with assumptions unless the user explicitly supplies them.
4. **Open-period cash is preliminary.** Future-dated or unposted transactions can distort near-term views; distinguish booked position from projected timing and never silently mix the two.

## Shared plugin context

Apply the category entrypoint and pinned shared guidance for current capabilities, retrieval, actions, evidence, output and links. Applicable domain retrieval below takes precedence over shared defaults; retain schema and access safeguards. This analytical skill does not acquire additional business actions merely from the target edition.

## Calculation and comparison basis

Keep each entity and currency separate unless an authoritative comparable consolidation basis and accessible-transfer evidence exist. Reconcile reported position to the authoritative financial source; a booked bank balance does not itself establish unrestricted cash. Do not assume access to cash held by another subsidiary.

Use verified unrestricted cash for accessible runway and coverage. Define current monthly burn as net cash outflow for an explicitly identified comparable monthly window; identify operating, investing and financing inclusion. Compute trailing three-month average only from three complete comparable months. Do not extrapolate a partial month without an explicit labeled scenario. Runway is accessible cash divided by positive monthly burn. When burn is zero or negative, report no depletion under that measured basis, not infinite runway or a guaranteed funding horizon. When accessible cash is negative, report the shortfall rather than negative months of runway. Coverage uses a positive monthly operating-expense denominator on the same scope; otherwise withhold it. Free cash flow is verified operating cash flow less capital expenditure, with source signs normalized and shown.

Give the min/max of valid current and trailing-burn scenarios as a labeled range. If only one valid basis is available, report that one scenario and state that a range cannot be supported. Do not invent a second endpoint. Keep projected receipts distinct from booked cash; document timing and uncertainty without counting an invoice receipt twice. Covenant headroom requires the actual covenant definition, numerator/denominator, threshold direction and test date. Missing terms remain unverified. Use CRITICAL only for supported funding shortfall or covenant breach and state the evidence, amount and timing.

## Terms

AR means accounts receivable; AP means accounts payable; capex means capital expenditure; GAAP means generally accepted accounting principles.

## Requested delivery

If the user explicitly requests sending or posting this analysis, verify the supported delivery capability, exact destination and content under the pinned action contract. Reuse applicable authorization, send only the authorized analysis, and verify delivery status. If no capability exists, provide the prepared analysis and mark external delivery blocked. This delivery branch does not authorize cash transfers or accounting changes.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
