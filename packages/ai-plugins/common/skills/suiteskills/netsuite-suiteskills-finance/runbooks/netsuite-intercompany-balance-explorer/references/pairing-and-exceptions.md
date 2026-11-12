# Intercompany pairing and exception rules

Read this before calculating or presenting a subsidiary-pair tie-out.

## Hierarchy prerequisite

Verify that the two sides are non-overlapping analysis units before applying the comparability rules below. A parent, consolidated, or roll-up entity cannot be paired with its own descendant. If the hierarchy is missing or the sides overlap, classify the relationship as **Unavailable** for pair calculation and show only the returned source facts; do not add balances across the overlap.

## Comparable balance requirements

Two sides are comparable only when returned data supports all applicable dimensions:

| Dimension | Requirement |
| --- | --- |
| Relationship | Each side identifies the same two counterparties, or an explicitly supported intercompany entity relationship. |
| Time basis | Same as-of date or same accounting period. Do not compare a period movement with an ending balance. |
| Currency | Same returned currency or an explicitly returned common reporting/consolidation currency. |
| Book | Same accounting book when books are applicable and returned. |
| Account relationship | The accounts are a returned, known due-to/due-from or otherwise mapped pair. Do not infer from similar account names. |
| Amount state | Both values use comparable posted/approved and eliminations-included or eliminations-excluded treatment. |

If any required item is not returned, classify the relationship as **incomplete evidence** or **not comparable** and name the missing dimension.

## Tie-out calculation

Use the source's own sign convention. When the two comparably scoped sides should offset, calculate:

`pair difference = side A amount + side B amount`

Call the relationship **tied** only when its compatible posted difference is exactly zero. Call any nonzero compatible difference a **mismatch**. Do not automatically treat rounding, FX, or timing as acceptable; label a potential explanation as unconfirmed until the source proves it.

Use posted entries only for ledger-balance and pair tie-out calculations. A pending-approval journal may appear in the activity or approval queue, but it must never be included in a posted balance, elimination, or tied/mismatch calculation.

## Exception classifications

| Classification | Meaning |
| --- | --- |
| Tied | Both compatible sides are present and difference is exactly zero. |
| Mismatch | Both compatible sides are present and difference is nonzero. |
| Incomplete evidence | A counterpart, required scope dimension, status, or amount is missing. |
| Not comparable | Returned sides have conflicting currencies, books, time basis, or unmapped accounts. |
| Unavailable | The requested source or relationship could not be retrieved. |

If the account relationship or counterparty link is not verified, the status is **Incomplete evidence** regardless of whether the arithmetic result is zero or nonzero. Call the amount a **candidate difference** or **candidate tie**. Do not label it a mismatch, tied, out of balance, “does not tie,” or an exception until the compatibility table is fully satisfied. Do not say that an inferred journal grouping “caused” or “explains” the candidate difference; say it is a candidate attribution based on the returned matching evidence. This rule applies to summaries, headings, tables, ranked lists, journal context, and next-step wording.

## Investigation guidance

Rank only by observable criteria: absolute difference, oldest source date, number of unmatched entries, or the user-selected **minimum mismatch to show**. That control filters mismatch rows and the investigation queue; it does not turn a nonzero mismatch into a tie. Possible causes—cutoff timing, missing/duplicate posting, FX translation, mapping, elimination, or account classification—are hypotheses, not conclusions.

Do not claim that a journal is missing, an elimination failed, or a subsidiary is at fault without direct returned evidence.
