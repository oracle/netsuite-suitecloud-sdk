# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Primary implementation and input
## Runtime sequence
1. Read the active source-derived SKILL.md, the short authority contract and scope-and-output.md. The two v12 overrides take precedence.
2. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions. Reuse the one root
   connector selection, permissions and TASK-1.0.0 receipt validation. Do not issue invented tool names.
3. Normalize returned values to PRIMARY-2.0.0; normalization keys below are local adapter fields, not NetSuite schema assertions.
   Every source and row must retain actual source references. No model-written receipt proves a real tool call.
4. Complete the primary required coverage stages, or record exhausted alternatives and their limitation.
   This is not the old 132-rule matrix or a mandatory all-domain discovery gate.
5. Use `primary_workflow.py build input.json --context context.json --trace trace.json --output protected.json`.
   The host binds the trace to the input using the retained task_execution digest. The script does not discover tools.
6. Obtain the host-authenticated audience/content review for the resulting protected artifact. Use the retained
   PRESENTATION-2.0.0 policy format bound to its exact digest and reviewed string paths.
7. Run `primary_workflow.py render protected.json --policy policy.json --output dashboard.html`.
   This must not mutate protected evidence/protected source data. Deliver through an actual host-supported artifact operation.
8. Only an unanswered requirement permits a logged `fallback(need, reason)` reference selection. Do not bulk-load old rules.

## Local normalized input
Required envelope: `version: PRIMARY-2.0.0`, `domain: risk|financial`,
`scope` (description, timezone, timezone-aware as_of), `sources`, `coverage`.
Source: id, label, kind, state, retrieved_at, optional evaluated_at, limitation for unread sources.
Coverage: stage, state (`complete|unavailable|not_applicable`), source_refs; complete requires expected/evaluated,
pages_complete and periods_complete. Unavailable requires limitation, actual attempts and an empty remaining_usable_channels list.
An in-progress or pending stage blocks the final artifact; do not claim exhausted alternatives prematurely.
Population counts refer to the declared source scope, not unseen permission-restricted records.
Required stages:
- health: projects, tasks, hours, estimated-cost, revenue-cost.
- operations: resources, allocations, tasks, status, titles.
- risk: deadline, schedule, overage, staffing.
- financial: profitability, unbilled, aging.

Rows require stable id and source_refs. Use these local field groups only:
- projects: name, customer, manager_id/name, start/end, lifecycle, task_count, contract/contract_verified,
  revenue/cost/estimated_cost, allocated_hours/hours, currency/book/period, needs_staffing, template, risk_flag.
- tasks: project, title, start/end, complete, leaf, owner/owner_kind, hours/planned_hours, estimated_cost,
  percent_complete, priority, currency.
- time_entries: project, resource, day, hours, labor_rate (effective compatible cost rate only).
- resources: name, title, entity_type (employee/vendor/generic/unknown), eligible.
- allocations: resource, project, task, start/end, percent/hours, unit, base, additive.
- unbilled: project/name/customer, amount, currency/book/period.
- aging: project/name/customer, overdue, currency/book/period.
- overages: project/name, hours_gap, amount_gap, unit.
- staffing: project, task, owner_kind (unassigned/generic/named/unknown), name.
- native: project, type, status, severity, message, evaluated_at; apply the unchanged native reference before normalizing.

`options`: required_titles (verified project requirement -> title),
unbilled_threshold {amount,currency}. Data defaults are not inferred from null input.
The field allowlist drops unrelated raw fields before computation. Publication separately reviews calculated/prose output.
Use complete pagination; all source joins, periods, currencies and identities are resolved upstream from current metadata.
SOURCE-DERIVED NORMALIZATION ASSUMPTIONS MUST BE RECORDED by the host, especially revenue definitions, effective cost rates,
leaf-task grain, template state, additive allocation base and intended resource universe.

## Limits
Helpers validate structure/arithmetic, not actual permissions or authenticity. Host-provided booleans/hashes are not authority.
No custom MCP API, background worker, framework or connector is shipped. HTML has no network dependencies.
Allocation candidates are not guaranteed free capacity. Source-profile flags are not native severity. Descriptive date categories
are not lifecycle statuses. Report-empty is not permission-denied. Documentation details appear in authority.md.
All examples used during validation are independently synthetic, not account-derived records.

## Required v12 PM scope envelope
`pm_scope`: version PM-SCOPE-1.0.0; mode all_accessible|named|authenticated; requested_keys; resolved;
unresolved; directory; explicit_filters. The resolver is `scripts/pm_scope.py`.
Resolved entries require request_key, id, entity_type (employee/vendor), match_basis
(exact_reference|verified_directory_match|authenticated_reference), and source_refs.
Unresolved entries require a request_key, reason, actual attempts, exhausted remaining_usable_channels,
and source_refs. Do not treat an unfinished lookup as an exhausted one.
Authenticated mode uses request key authenticated-user and a source-backed session_entity with typed ID;
the resolved entity must match. Personal tasks/priorities optionally use personal_work with kind,
project_resource_id, linked entity and source_refs. These are assignment-based, not manager-based requests.
All-accessible mode has no named or authenticated selection. Legacy manager_id/all_managers options are rejected.
Directory state complete requires expected=evaluated=len(projects), unavailable=0, pages_complete=true,
periods_complete=true and successful source_refs. This is the source directory after declared explicit filters,
not a directory inferred from tasks, profitability rows or time entries.
Unavailable directory requires actual attempts, limitation, no remaining usable channels, and known or
explicitly unknown expected/unavailable counts; never invent an inaccessible population size.
The explicit_filters ledger names each request restriction and its request_basis; applied must be true.
A projects filter includes exact ids. Other filters are verified in the upstream source query; the helper
does not guess a record field from the filter name. Resource filters require an explicit resources restriction.
Project rows with manager_id require manager_entity_type. Manager state distinguishes assigned,
unassigned and unknown. Preserve inactive and lifecycle as observed facts without default exclusions.
Operational rows marked scope_role=supporting_commitment may retain necessary authorized external work
for real capacity context; it never expands the target project directory or staffing recommendations.
No unresolved identity may be mapped by popularity, email similarity or a guessed role.
Publishing adds exact-manager grouping, scope limitations and directory reconciliation to the artifact.
The primary render CLI remains HTML-only. A host may use the genuine one-fact exception without
starting unrelated primary stages; all structured/narrow detail uses primary or selected compact HTML.
The legacy visual delivery helper no longer treats single_row as a text waiver and does not silently
return a data table when no HTML delivery channel exists.
