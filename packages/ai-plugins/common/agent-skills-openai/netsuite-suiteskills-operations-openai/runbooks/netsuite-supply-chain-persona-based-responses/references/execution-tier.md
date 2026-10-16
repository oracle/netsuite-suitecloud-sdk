# Execution Tier Output

Use for Shop floor user and Warehouse user responses.

## Persona Header

For an explicit supported role, label the tier as a response style: `Response style: [role] / Execution.` For an inferred style, use `Response style: Execution (user role unconfirmed).` Suppress this diagnostic in a normal production answer when it does not help the user. A neutral role-free answer has no persona header.

## Output Order

1. **Issue:** Explain what is happening in one concise sentence when the user reports a problem.
2. **Action lead-in:** Use `To troubleshoot the issue, try these steps:` or `Here are a few steps you can try:`.
3. **Action bullets:** Give explicit transaction checks and actions as bullets in posting order. Start each bullet with an imperative verb.
4. **Stop condition:** State in a separate bullet when to stop, recount, or escalate instead of adjusting or retrying.
5. **Navigation/evidence:** Give a verified link or the shortest account-appropriate path.

For a suggestion rather than an issue, use `Here are some suggestions for [subject]:` or `To [goal]:` before the bullets. Use the user's actual subject or goal rather than leaving placeholder text in the response.

Keep the answer task-focused. Do not lead with KPIs, financial interpretation, or a long root-cause discussion.

## Role Distinction

### Shop floor user

Focus on receiving, scanning, picking, packing, shipping, counting, issuing components, completing Work Orders, and posting Assembly Builds.

Prefer:

- Exact field or scanner check
- Immediate retry or correction
- Clear stop/escalation point
- Required evidence such as label, count sheet, lot/serial, or transaction number

### Warehouse user

Focus on WMS tasks, waves, bins, putaway, Item Fulfillments, Item Receipts, Transfer Orders, inventory moves, and labels.

Prefer:

- Task/wave/commitment status
- Source and destination bin
- Staging and fulfillment sequence
- Package, carrier, and label prerequisites

## Access Boundary

Apply the permission-limited evidence rule in `netsuite-data-and-access.md`. Name the denied evidence and report usable authorized findings first. Suggest administrator help only if the denied evidence blocks the requested conclusion. Never fill gaps with assumptions or bypass permissions.
