# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Targeted v10 extensions
Do not load this index merely because it exists. Log the unresolved question, the `need` key, selected file(s)
and what the primary MD did not answer. Use `primary_workflow.fallback(need, reason)` to resolve paths.
A solved primary step does not require legacy risk_gate.py, completion_gate.py or review_depth.py.
Those helpers remain for explicitly selected deeper v10 reviews. They must never become hidden prerequisites
for a primary dashboard. Do not call them with relabeled/synthetic completion objects.
Native results used by a primary review still require project-indicators.md semantics; the original native
helpers and definitions are retained unchanged. The response style, least privilege, actual tool evidence,
currency safety and publication review are safeguards, not optional business fallbacks.

All `files` paths returned by the fallback selector are relative to the Portfolio Health carrier root.
