# Case counts and retrieval failures

## Scope and source selection

This domain path answers factual case counts. Preserve pinned shared access, schema, scope, and output safeguards. Reuse verified session evidence; resolve current-user identity for “my” counts and establish required feature/access context. Company triage guidance is needed only when interpreting priority, service commitments, or action order, or when it defines the requested metric.

Use the smallest supported source whose measure, filters, time window, ownership, and coverage match the request. Prefer an applicable governed report for a governed measure. A verified aggregate saved search can answer a simple count without retrieving message bodies or every case. A search title such as “Cases” does not establish an open-case filter. Inspect its definition or obtain sufficient equivalent evidence; if the measure cannot be verified, report that limitation or use a suitable row-level search.

For a row-level result, verify case grain, scope, and documented pagination before claiming completeness. Deduplicate by a stable case internal ID; use a displayed case number only if uniqueness within the requested scope is established. Joined message rows are not additional cases. Do not retrieve message text merely to count cases. A short page establishes completion only when the current interface guarantees it; otherwise follow supported continuation or state coverage unknown.

## Status meaning and reconciliation

Resolve labels and open/closed lifecycle meaning from current account evidence or approved company definitions. Include reopened cases when their verified lifecycle is open. Do not hard-code numeric status mappings or assume every status other than a literal “Closed” is open. Keep unknown lifecycle values separate and disclose their effect on the count.

For a multi-status row-level count, report verified open subtotals, closed cases, and unknown cases as applicable; reconcile these with the distinct retrieved total. Status-specific searches support a combined count only when scope and overlap are reconciled and all applicable statuses are covered. Deduplicate overlapping populations before summing.

Cross-check another total only when available and useful to resolve uncertainty; do not retrieve a second source solely to confirm an already verified count. Compare totals only after aligning filters, time, permissions, grain, and coverage. Equal totals alone do not prove equal populations. Explain unresolved discrepancies and report bounded counts with their limits rather than selecting an unsupported total.

Case numbers need not be contiguous. A sequence gap is not evidence that a case exists or was omitted. If the user identifies a particular missing case, use the authorized narrow selected-case lookup; do not enumerate guessed IDs. Inaccessibility or an empty result does not establish deletion or absence.

## Labels and actionability

Resolve only labels needed in the answer using returned display fields or a narrow, schema-validated supported lookup. Never apply another account's status-code mapping. If unresolved, label the status or assignment unknown; an unresolved assignee is not unassigned. Establish unassigned status from verified blank/unassigned semantics.

An open count includes all cases matching its definition, including feedback. Do not exclude compliments or thank-you messages by title alone. Only when triage or an actionable-only view is requested, assess the minimum relevant accessible evidence using the user's or approved company's action criteria. Separate actionable, feedback-only/no action identified, and uncertain cases. Identify this as an analytical classification, preserve the total open denominator, and state incomplete evidence. Do not infer customer intent, close cases, or alter lifecycle status from that classification.

## Retrieval failures and retries

- Missing query metadata or an unavailable source: stop dependent SQL and do not probe guessed alternatives. A metadata 404 is a path limitation, not proof of a permission denial or absent feature. For counts, use an independently supported report/saved-search path if its access and scope are established. If denial scope is unclear, stop dependent reads until resolved.
- Actual access denial: stop the affected population across interfaces; do not try another transport around it. Report the permission named by the error when available, the sources actually attempted, and the portion not retrieved. Do not infer an exact missing permission from a generic error or estimate cases from message/issue records.
- Retry: explain that an authorized role or access change may allow a retry. After the user reports that change and requests a retry, refresh relevant session/capability evidence and retry the original bounded read. A repeated denial stops the branch again. Do not assume the change succeeded or make permission changes yourself.
- Empty result: distinguish no accessible rows from a verified zero for a defined, completely retrieved population. A verified aggregate zero can be reported as zero within its scope.

## Response

State the count, definition, source, and coverage limitation if any. Include status subtotals when derived from a multi-status row-level population. Keep simple answers concise; disclose uncertainty instead of exposing raw IDs or debug output.
