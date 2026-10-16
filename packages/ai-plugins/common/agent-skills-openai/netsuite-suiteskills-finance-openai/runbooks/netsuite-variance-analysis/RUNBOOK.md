---
name: netsuite-variance-analysis
description: "Use to explain material differences from a verified budget, forecast, prior period or prior year. Reconcile evidence-backed drivers to the total variance, distinguish recurring and timing effects, and disclose unexplained residuals; do not silently substitute a missing comparison basis."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.1"
  source-version: "1.0.1"
  integration-version: "0.7.5"
  runbook-id: RB-FIN-015
  category: finance
  access-mode: operation_dependent
---

# Variance and Flux Analysis


## Audience and use cases

**User roles:** Financial Analyst, FP&A Manager, Accounting Manager, Controller, CFO

**Use cases:** Run month-end or quarter-end flux analysis; explain a budget miss by driver; produce management commentary on variances; determine whether a movement is recurring or timing; identify deterioration repeating across periods even when individually below threshold.



# Variance Analysis

## Task

Take a gap between two figures and decompose it into named, quantified drivers. Stop when the drivers
explain the gap, not when the list looks long enough.

## Trigger boundary

Owns the "why". Retrieval of the statements themselves belongs to
`netsuite-financial-statement-review`; the board-facing write-up belongs to
`netsuite-executive-finance-reporting`.

## Procedure

1. Resolve period, subsidiary/entity scope, currency/book context, and the comparison basis.
2. Verify that the comparison source exists before calculating:
   - **Actual vs budget** - require an accessible budget source.
   - **Actual vs forecast** - require an accessible forecast source.
   - **Actual vs prior period** - retrieve comparable actuals for both periods.
   - **Actual vs prior year** - retrieve comparable actuals for both periods.
3. Apply the materiality threshold and report both the screened-in items and the count/value of screened-out items.
4. Classify direction correctly: favorable when revenue is above the comparison basis or expense is below it; unfavorable for the reverse, subject to the account's economic meaning.
5. Decompose the top variances only where evidence supports the split:

   | Line | Split into |
   | --- | --- |
   | Revenue / COGS | Price effect and volume effect |
   | Compensation | Headcount, rate, mix, timing, attrition |
   | Operating expense | Headcount-driven, volume-driven, discretionary, contractual, one-time, timing or phasing |

6. Separate recurring movement from timing, one-time items, and reclassification.
7. Reconcile quantified drivers to the total variance. State any residual explicitly.
8. Escalate a below-threshold item only when verified evidence shows a repeating deterioration, control break, churn, or pricing-pressure pattern.

## Output

Quantify verified drivers in the resolved reporting currency and in percentages with an explicit denominator, and make the drivers sum to the total variance or
explain the residual. An unexplained remainder is stated, not absorbed.

## Evaluation hardening

1. **Missing budget/forecast is a hard evidence boundary.** If the requested comparison basis is unavailable, return `COMPARISON_SOURCE_NOT_AVAILABLE` and identify what could still be analyzed. Do not silently substitute prior-period or prior-year actuals for budget/forecast.
2. If the user accepts an alternate comparison, treat it as a new stated basis and label it clearly.
3. For financial-report detail, do not infer variance direction from inverted child-row signs. Validate the sign orientation against authoritative parent totals before normalizing detail. If orientation cannot be validated, keep the variance at the verified summary level.
4. Never claim a driver (price, volume, headcount, rate, vendor, timing, etc.) unless the supporting NetSuite evidence was retrieved. "Possible driver" is not a verified explanation.
5. Open-period comparisons are preliminary and must identify incomplete-source risk.



## Requested delivery

If the user asks to send or post the review, use an actually supported delivery capability within exact destination/content authorization and the shared action contract. If unavailable, return the completed analysis with delivery marked `BLOCKED_EXTERNAL_DELIVERY`; never claim it was sent.

## Plugin contracts

Apply the pinned plugin context and shared baseline, retrieval, evidence, outputs and action contracts supplied with this package. Domain-specific retrieval instructions above take precedence over the shared default within common safeguards. Verify current callable tool schemas, metadata, scope and access; no guessed schema or access-denial bypass. Preserve unknown and partial evidence. Requested analysis does not authorize external changes. Reuse authorization for an exact supported action and verify the result under the action contract.

## Calculation discipline

Use actual minus comparison as the signed monetary variance after verifying comparable scope and account sign orientation. Show the applicable materiality policy; if missing, ask for the required threshold or return unscreened observations with that limitation rather than inventing a cutoff. Percent change requires a named nonzero comparison denominator; when the basis is zero, missing or changes sign, retain the monetary variance and label the percentage not meaningful unless an agreed convention is stated. Distinguish percent change from percentage-point margin changes and from a driver share of total variance.

Use one declared price-volume decomposition with compatible units and product scope. For comparable units, one exact bridge is volume effect = (actual quantity minus comparison quantity) × comparison price and price effect = actual quantity × (actual price minus comparison price); this assigns the interaction to price and must be disclosed. Mixed products require compatible grouped/mix evidence; otherwise leave the unsupported split in the residual. Apply the analogous cost basis only with verified quantities/unit costs. Drivers must be non-overlapping; do not count a headcount effect again as volume or timing. Residual = total variance minus the sum of verified drivers. Missing driver data remains unexplained, never a balancing plug.

## Vocabulary

COGS means cost of goods sold; FP&A means financial planning and analysis; CFO means chief financial officer. Flux means period-to-period movement.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
