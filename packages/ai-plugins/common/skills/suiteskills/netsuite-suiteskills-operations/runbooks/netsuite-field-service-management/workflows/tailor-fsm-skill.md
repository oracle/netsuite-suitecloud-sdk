# Tailor an FSM skill

Use this recipe when the user asks to create or adapt a reusable skill for their FSM practices. It can cover any FSM topic or a process spanning several topics. An ordinary request to adjust a schedule, explain billing, configure Mobile or work on a report stays with that task's procedure.

A companion skill holds customer practices and reads the available `netsuite-field-service-management` skill for product knowledge and procedures. Verify that the base and companion are discoverable in the supported host; a named dependency is not proof of availability. The companion refers to this skill's entry point and then to the relevant reference. This skill does not find or invoke companions automatically.

The base skill and companion must be discoverable in the supported host. This recipe does not install or enable either.

## Identify the intended assistance

Establish who will use the skill, the recurring outcome, the FSM topics involved, typical requests and the desired output. Determine whether the user wants a draft or actual skill creation. Reuse what they have already supplied.

Choose the relevant topics through the [FSM topic routes](../RUNBOOK.md#start-from-the-request). Read enough product knowledge to distinguish a customer practice from an FSM feature, default or account setting. A narrow skill needs only the topics that affect its task.

General authoring can use the user's process descriptions and sanitized examples. Inspect a live account only when the requested work calls for account evidence. An interview answer about a setting describes the customer's understanding; it does not establish the effective account configuration.

## Interview about actual practices

Ask about unresolved decisions that would change how the skill acts or what it produces. For each material practice, establish when it applies, the rule, whether it is a requirement or preference, exceptions, and how competing priorities are resolved. Use an ordinary example and an exception to clarify ambiguous terms.

Choose questions from the relevant topics; do not make the user complete every row.

| Topic | Practices to understand |
| --- | --- |
| Work management | What the team means by a job, how work arrives, priorities, follow-up and useful reports. |
| Assets | Hierarchy conventions, service-history expectations and evidence needed for a service decision. |
| Scheduling | Fixed and flexible appointments, qualifications, regions, travel, capacity and replacement practices. |
| Mobile and completion | Technician capture, service outcomes, sign-off and handover. |
| Time | Recording conventions, reconciliation and billability. |
| Materials and billing | Usage, replenishment, fulfillment, reconciliation and review. |
| Reports | Analytical search or report practices versus technician-facing service-report template design, preview, XML, publication and activation. |
| Configuration | Ownership, review and change practices. |
| Recurrence and programs | Repeated work, occurrence exceptions and program changes. |

Establish what the assistant should explain, inspect, propose or apply for the intended task. A customer's description of who usually performs a change does not grant permission to perform it. Keep the current request's scope and the shared skill's authorization requirements intact.

Summarize the practices in plain language so the user can correct their meaning. Separate requirements from preferences and examples. If two practices conflict in a way that changes the result, resolve that choice before putting either into operative instructions. Keep unanswered questions separate; do not turn missing answers into defaults.

## Draft the companion

Use the selected SuiteSkills Builder for plugin-targeted authoring when available. A plugin-targeted candidate needs SKILL.md, companion metadata, preserved source history, explicit dependencies and the selected pinned foundation through the Builder workflow. A conceptual draft must be labeled incomplete until those integration requirements are met; add domain resources only when concretely needed.

The draft contains:

1. Shared `name` and `description` frontmatter with a distinct lowercase, hyphenated name and a description of at most 200 characters identifying the intended NetSuite FSM tasks and customer practice scope. Do not name it `netsuite-field-service-management`.
2. A short purpose, audience and task boundary.
3. Plain-language instructions to read the available `netsuite-field-service-management` entry point and relevant references for FSM knowledge and procedures. Express this relationship in the skill body; record this dependency in metadata and verify actual base availability.
4. Customer-confirmed practices grouped by the tasks they affect, including their applicability, exceptions and priority where those matter.
5. A concise mapping from those tasks to the necessary base knowledge and procedures.
6. Preferred outputs and representative usage examples derived from the interview.

Instruct the companion to locate `netsuite-field-service-management` through the host's available-skill discovery, read its entry point, and resolve the selected reference paths relative to that skill's discovered root. For example, `references/billing.md` and `workflows/service-work.md#reconcile-consumables-and-billing` are paths within the resolved base skill. They are not links relative to the companion's own directory. Do not assume the two skills are siblings, embed this machine's paths, or require a platform-specific invocation syntax.

The companion then follows the underlying FSM request with the relevant customer practices in context. Reading the base skill does not enter this authoring recipe. A request spanning scheduling and billing can load both sets of guidance without copying them into the companion.

For each task, state the customer's decisions and point to the shared procedure. For example, a billing companion can say: "Use the base consumable-reconciliation procedure. Show disputed usage separately for a coordinator decision." An analytical reporting practice can point to [existing searches and reports](work-records.md#run-an-existing-search-or-report); a service-report template practice can point to the [service-report workflow](service-reports/index.md). Keep explanations of FSM processing stages, unbilled-value calculations, transaction relationships and report mechanics in the base references, even when they informed the interview. Do not turn the draft into another copy of those procedures.

Keep FSM facts and field mappings in the shared skill, and do not copy its SafeWords section. The companion must follow the shared authorization and evidence requirements; its customer practices cannot grant permissions, change product behavior or replace the current user's requested scope. A one-time request can change the work being proposed without silently rewriting the reusable skill.

Include only practices the user has confirmed. Keep unresolved choices outside operative instructions. Exclude live account snapshots, credentials and customer record IDs. Use sanitized examples that explain a decision without preserving account data.

For a draft request, return the draft for review. For an explicit file-creation request, use the requested destination and scope. Drafting does not authorize installation, publication or NetSuite changes.

## Review representative requests

Walk through an ordinary request and an exception for each selected domain. Include a request crossing domains when the companion supports that kind of work. Check whether its practices lead to the intended questions, choices and output, and whether it reaches the relevant base references without starting another authoring interview.

Use the user's examples or supplied synthetic evidence. Distinguish what the walkthrough demonstrates from any account behavior that remains unverified. Correct the draft based on the user's answers, and report material unanswered choices separately from the usable draft.
