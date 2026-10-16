# Showcase Prompts - Payment prioritization

1. Prioritize eligible payables for [payment date] under a [cash cap/reserve], but exclude any obligation whose remaining balance cannot be verified.
2. Build a read-only payment proposal and show which obligations are `REMAINING_AMOUNT_NOT_VERIFIED` rather than treating them as zero.
3. Rank overdue and due-soon payables using verified remaining balances and compatible offsets, keeping currencies and application groups separate.
4. Show a cap-only simulation when the payment account balance is unavailable, clearly distinguishing it from a fully bank-feasible proposal.
5. If I ask you to create the Payment Run from this proposal, decline the write in this read-only skill and offer the appropriate authorized handoff.
