# Response checks

Apply these checks in conversation context. Avoid unnecessary response persistence; approved local validation of minimized task-local artifact data is permitted. Publish only when every required check succeeds.

## Tool result and fields

- Reject tool errors, explicit failures, permission warnings, truncated content, and missing data arrays. A successful SuiteQL result can use `method: custom_suiteql` with `data` instead of a `success` field.
- Compare `queryExecuted`, when present, with the intended SQL. A changed query blocks the affected result.
- Follow required connector metadata checks. Verify unfamiliar required fields and joins. Reuse schema only after checking it under the same account and access. If a required field is denied, block the affected answer instead of dropping the field.
- Require the selected aliases and types. Counts must be nonnegative integers. Keep employee, assignment, Benefit, and output row counts distinct.
- Use rounded money, totals, distinct counts, and ratios returned by SQL. Treat null differently from zero. Connector totals count output rows, not employees in aggregates or a null Benefit as a distinct Benefit.
- Keep exact IDs internally, including signed NetSuite IDs. An unusual ID on an unrelated record does not block a scoped answer. If a populated ID lacks a label, show "Name unavailable" while keeping its identity distinct, or resolve the label when the question needs it. Hide numeric IDs by default.

## Scope and necessity

- Check resolved IDs and country, the unchanged current employee criteria, employee and assignment predicates, requested grouping, and denominator.
- Inspect every projection and join, including subqueries. Keep only fields used for requested output, scope, calculations, identity, ordering, provenance, or verification. Reject wildcard column projections. Use `COUNT(*)` only for verification.
- Omit extra organization labels, optional calculations, and report reads from focused answers. Do not run them to fill dashboard cards or statuses.
- Include complete review assignment and employee gap detail in a broad portfolio snapshot unless the requester explicitly asks for summary only. A chat only request changes the format, not the detail requirement.
- Apply the same scope to correlated counts, related totals, and detail queries. Reconcile actual gaps from `NOT EXISTS` across every assignment with the actual gap aggregate. A count of employees without matching filtered assignments is a different measure.
- Clarify subsidiary versus country and ambiguous coverage denominators before affected answer queries. Use ID or code tuples for compound groups. For assignment dimension percentages, use the agreed employee population for each requested organization tuple. Do not use only employees in that assignment group. A standalone employee count needs no denominator read.
- Complete the [currency check](currency.md) before publishing money.

## Retrieval and completeness

- Follow the active connector's retrieval requirements. Check completion evidence, stable totals, consistent result counts, and unique internal identities. The received rows must match the declared total.
- Distinguish a successful empty list from one aggregate row with a zero count.
- Report a partial result when a platform cap, missing/repeated pages, changing totals, or unreadable or truncated content leaves completeness unresolved.
- If pagination/completeness metadata is absent or insufficient, and required SuiteQL schema is already verified with no access denial, run `SELECT COUNT(*) AS row_count FROM (<the exact selected query without its outer ORDER BY>) q`. This counts output rows, including grouped rows, rather than employees represented by an aggregate.
- Require every selected row and no duplicate internal identity. If metadata conflicts, retry the affected read and resolve the discrepancy. A matching count alone does not excuse contradictory page totals. Run the same scoped count when the requester asks for verification.
- Count/detail disagreement blocks the affected answer. If data changed between reads, rerun related queries together. Keep the answer blocked if the disagreement persists.

## Grouped reconciliation

- Reconcile counts for requested disjoint organization groups with the corresponding headline count. Reconcile assignments, component and recorded sums, and review counts across complete disjoint assignment groups.
- Use totals returned by SQL or request scoped SQL reconciliation when the arithmetic is substantial. Check only requested metrics and necessary verification.
- Employee counts across Benefit, Type, Carrier, Coverage, or compound assignment groups can overlap. Never sum them into an overall employee total.

## Date and reuse

- Retain each answer read's `query_date`, observed call time, exact selection, account and access, grouping, units, and check and completeness outcomes. Check dates across related reads and pages.
- If the NetSuite date or relevant population changed, rerun affected reads together. Keep the affected result blocked if the disagreement persists.
- Use the observed call time for a successful empty list. Do not invent an account date. Give each fresh follow up its own date.
- Reuse retained results only when they are sufficient and account, access, and freshness still match. State the original date. Requery refresh requests and changes in selection, grouping, population, context, or access.

## Claims and classification

- Check every stated count, name, ID, example, and finding against returned evidence. Label possible explanations as possibilities.
- Tie each workspace reason, evidence item, and verification action to returned flags or amounts, or to the successful actual gap predicate. Count an assignment with several reasons as one row. Keep employee gaps separate.
- Do not infer missing entries from zero, real person status from names, catalog items from ID gaps, authoritative costs from mismatches, or plan or application failures from patterns. State only supported findings.
- Classify findings as Review item or Information by default. Classify check outcomes separately as Checked, Could not check, or positively evidenced Not configured. Use No review items found only after completing requested issue checks with no Review items or proven Exceptions, and state the checked scope.
- Omit unrequested checks. Treat missing data or access as Could not check, not missing configuration. Do not add configuration reads merely for badges.
- If required identity or detail access is denied, a page is incomplete, or reconciliation fails, block that workspace. Keep independently checked summaries only in an explicitly partial snapshot. Name the missing detail and the access or retry needed. Illustrative rows cannot replace required complete detail.
- Name blocked checks in a Partial report. Do not claim an overall clean result. Use Exception only for a checked applicable hard rule approved by the owner. Do not import Time Approval rules. Use High, Medium, and Low only to order review items, following priority and precedence returned by SQL.

An unresolved entity, denied field, missing page, unavailable currency for money, or contradiction cannot support an empty or complete result claim. Explain the affected limitation and the needed access, clarification, or retry. A successful empty query supports "No matching current records" under its checked scope. These checks do not provide independent automatic enforcement.
