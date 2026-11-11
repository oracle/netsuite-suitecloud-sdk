# Inventory Count Sequencing Guardrail

Use this read-only guardrail whenever an Inventory Count overlaps an Item Receipt, Item Fulfillment, Transfer Order fulfillment, Inventory Transfer, Inventory Adjustment, WMS move, pick, or staging task. Follow the `SKILL.md` Core Guardrails and present record-changing steps only as recommendations for an authorized user.

## Pre-Count Gate

Check the item, location, bin, and inventory status for pending physical activity.

- Treat physical movement under an unposted transaction as a stop condition; recommend waiting to begin the count.
- Recommend that an authorized user pause movement, post or resolve the legitimate transaction, and then begin a fresh count.
- A pending transaction with no physical movement does not create a discrepancy by itself.
- Physical movement under a pending transaction is a timing exception, not shrinkage.
- If the count already started, identify a stop-and-escalate condition. Recommend that an authorized user post the legitimate transaction and follow the account-supported reject/restart, recalculate, or recreate process.

## Required Reconciliation

Keep the same item, location, bin, inventory status, applicable lot/serial scope, and compatible unit basis throughout the reconciliation. Use only inventory-changing activity that affects that exact count scope; do not combine quantities across items or count the same posted movement twice. Distinguish a posted inventory change from a task or physical movement that has not posted. If timing, scope, units, or transaction completeness are uncertain, state the gap before asserting an adjustment recommendation.


Capture:

1. Count snapshot quantity and time
2. Inventory-changing transactions posted after the snapshot
3. Current NetSuite on-hand
4. Physical count

Calculate:

`expected after transactions = snapshot + posted transaction changes`

`signed count adjustment variance = physical count - expected after transactions`

`shortage quantity = max(expected after transactions - physical count, 0)`

`overage quantity = max(physical count - expected after transactions, 0)`

Compare current NetSuite on-hand with the calculated expected quantity. If they disagree, identify the unreconciled difference and investigate the missing or mismatched evidence before presenting a residual as ready for approval. Do not silently replace the expected quantity or infer shrinkage. For supplied illustrative numbers, show the calculation as conditional on those inputs.

Interpret the signed adjustment and the physical condition separately:

- A negative signed adjustment is a shortage and decreases inventory by its absolute value.
- A positive signed adjustment is an overage and increases inventory by that value.
- A zero signed adjustment means no count adjustment is required.

Treat a stale snapshot as ineligible for approval. Calculate the residual signed adjustment, then recommend that an authorized user refresh and verify the count basis before approving only that residual adjustment.

## Sequence Example

- Snapshot: `52`
- Transfer Order fulfillment posted after snapshot: `-8`
- Expected current on-hand: `44`
- Physical count: `40`
- Signed count adjustment variance: `40 - 44 = -4`
- Shortage quantity: `4`
- Overage quantity: `0`

For this example, recommend that an authorized user refresh or restart the count with a basis of `44` and approve only the signed adjustment of `-4`. Explain that combining the posted `-8` fulfillment with approval of a `-12` variance against the original snapshot would duplicate the inventory impact.

## Persona Emphasis

- Warehouse user: transaction order, bin, recount, and stop point
- Warehouse manager: ownership, reconciliation, and duplicate-impact prevention
- Inventory manager: count integrity, signed residual adjustment, shortage or overage classification, reason, and approval control
- COO/CEO/Board: reliability implication, confirmed exposure, owner, and prevention

Keep detailed cutoff, COGS, valuation, or audit treatment outside this SCM guardrail.
