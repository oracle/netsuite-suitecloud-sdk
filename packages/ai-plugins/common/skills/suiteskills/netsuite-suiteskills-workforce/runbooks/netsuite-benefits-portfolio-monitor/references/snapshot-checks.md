# Snapshot checks

Use [response checks](checks.md) for every answer. For a broad snapshot, also reconcile each requested workspace below. If a workspace fails, mark the snapshot Partial and name the blocked check.

## Population

- Check that current employees equal covered employees plus employees without matching assignments. If they differ, rerun the related reads together. Block the affected coverage workspace if they still differ.
- Check that covered employees do not exceed the agreed population. Check that employees with exactly one distinct Benefit do not exceed covered employees. Block the coverage workspace if either comparison fails after a related retry.

## Complete workspaces

- Require the complete count of distinct assignment rows to equal `review_records` under the same scope and finding predicates. Require a flag on every review row. Require the complete count of distinct gap employees to equal its matching actual gap aggregate. If a count differs, rerun the related reads together and block the affected workspace if it still differs.
- Compare descriptive blank rows with `incomplete_records`, amount blank rows with `missing_amount_records`, and mismatch rows with `mismatch_records`. Check any zero and any negative counts. Check the six zero and negative counts for the three amount fields, Medium and Low priority counts, and distinct review employees. Medium plus Low must equal distinct review assignments. Keep High gap employees separate. Resolve a disagreement before publishing that workspace.
- Treat a zero total with components as a mismatch subset. Other patterns can overlap. Do not add Information counts to review records. Follow [response checks](checks.md) to count each assignment once.
- Use a checked corresponding zero aggregate to establish an empty workspace only when scope and predicates match. One zero issue category cannot establish an empty combined review list. Use scoped SQL verification when a manual rollup would be substantial.

## Monetary and failure checks

- Treat flagged review rows as a subset of monetary assignments. Do not reconcile their amount sums to full monthly cost totals. A zero net difference does not prove agreement on each record.
- If counts or categories disagree, rerun related scoped reads together. Block the affected workspace and mark the snapshot Partial if the disagreement persists. Keep missing detail visible as a limitation instead of substituting examples or zeros.
