Before tool use, load and apply [category SafeWords](../../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Review and improve FSM configuration

Use [effective configuration](../references/configuration.md#effective-configuration) to distinguish stored JSON, merged settings and Preview. The other sections of that reference cover access, mappings and Mobile form behavior. Consult the [Oracle configuration index](../references/configuration-index.md) only when you need detailed source guidance, choosing the topic for the affected setting.

## Review configuration evidence

1. Establish the intended outcome, affected role and workflow, and current behavior. When Mobile is slow, ask which user is affected, the account and role they use, and what action is slow. Ask for a representative job or date range. Identify the user by name, email or employee ID; never ask for credentials or session data. Establish a reproducible symptom or performance baseline. One affected user is enough to start; ask about others only if a comparison would help.
2. Locate the relevant setting and execution path through available MCP records and metadata. For a slow Mobile request, use the connector to find the affected user's employee ID when possible. Inspect relevant configuration and search definitions. Apply filters that depend on the user to connector reads, or run an identifiable saved search when supported. Compare result sets for another user only if that helps explain the symptom. For a routine Mobile tab review, inspect explicit `routes/mobile` overrides and the first matching resource rules. For Schedule Board issues, inspect its event, resource and filter configuration.
3. Compare the configuration evidence with the intended behavior. Recommend the smallest relevant change and explain its tradeoffs. Follow the [configuration advice](../references/configuration.md#correct-unsupported-or-ineffective-configuration) for unsupported, outdated, or ineffective settings revealed by the task. Check search scope, expression dependencies and cached data before attributing a delay to a setting. Connector reads can check the data criteria. They cannot replay Mobile or Schedule Board requests or measure request time. Ask for sanitized runtime evidence only if the user explicitly requests browser diagnostics and the remaining question depends on a request's response or timing.
4. Inspect all active overrides. Report Preview as enabled, disabled or unverified using the [effective configuration rules](../references/configuration.md#effective-configuration). Use customer-account configuration evidence for the current setting; no external monitor source is provided by this package.

   Explain the active overrides and report only established effective behavior. State any unknown default tabs or technician-specific visibility as limits. Do not ask for Preview or developer-tool captures during a routine read-only review or conceptual design. Do not retrieve or describe inactive configuration bodies unless the user asks for a comparison or a specific inactive record matters to the requested change or rollback.
5. First establish the affected static settings from documented defaults and all active overrides read through MCP, following [effective configuration](../references/configuration.md#effective-configuration) and the [Mobile rule defaults](../references/configuration.md#mobile-resource-selection). Verify the installed release and the applicability of documented defaults to that account; unresolved version-dependent settings block only the affected change. Preserve complete replacement arrays and resolve relevant parent-object changes, nulls and conflicting precedence; do not infer an empty array from an incomplete read.

   Reuse adequate current evidence for the same account and configuration, including a supplied Preview excerpt. An established empty rule array is a valid result. A request to preserve existing tabs means preserving the established entries; it does not require the user to name tabs, confirm that none exist, or supply Preview when the array is already resolved. Continue from that baseline without inventing entries. Ask for path clarification only when the surrounding context cannot identify the setting.

   Investigate an actual observation of additional resource tabs that contradicts the configuration evidence. Do not make a hypothetical "if technicians see other tabs" question a prerequisite. Display names can help identify a discrepancy, but preserving tabs requires their resource IDs, rule conditions, ordering and fallback branches; names alone cannot reconstruct them. Distinguish the [Task view from resource tabs](../references/configuration.md#mobile-resource-selection), and limit screenshot observations to the displayed Task and view.

   Request a sanitized user-provided Preview excerpt only when a specific value essential to the proposed change remains unresolved after these checks. Do not request a disabled Preview. Request role evidence only when an access setting is essential to make the specific proposal apply-ready and no available connector capability establishes it.

   An absent Preview does not by itself prohibit a change. When Preview is absent, establish effective behavior by another reliable account-specific means before applying a change that depends on it. Do not enable Preview or other optional diagnostics without the user's request.

   If this evidence blocks an authorized change, finish the record, field and stored-override checks that remain possible. Explain the exact decision the missing effective setting prevents. Give the user or administrator a concrete way to find it on the active Field Service Configuration record's Edit form, and request only the relevant Preview paths. Ask for referenced resource definitions only where they are needed to identify an existing resource or understand a rule. If Preview is disabled or inaccessible, say so and offer the supported administrator or alternative account-specific evidence path. Do not imply that inability to read Preview means the connector cannot read stored configuration.

## Prepare an authorized change

1. Inspect every active configuration record and retain the baseline's exact JSON and identity. When no override is active, first activation needs a rollback plan that restores that state. If none or multiple are active, or the complete active set cannot be inspected, establish an appropriate activation and rollback plan with the administrator before applying a change. Do not select an arbitrary baseline or deactivate other overrides implicitly.
2. Verify the target record, field metadata, supported write operation, relevant access evidence and intended delta. Apply the [bounded Mobile presentation checks](#bounded-mobile-presentation-changes) when eligible. Merge the requested delta into the stored custom JSON, preserving unrelated settings, including the [annotation properties](../references/configuration.md#effective-configuration). Validate the complete candidate and account for whole-array replacement in the runtime merge using the settings established above. Preview is optional when those settings are already determined. For changes outside the bounded Mobile path, test in a sandbox before production use. Keep end-to-end behavior unverified until tested.
3. Apply configuration JSON changes through a [new inactive copy](#establish-and-use-mcp-activation-for-a-versioned-change), including bounded Mobile presentation changes and Preview-only changes. Preserve the previous record's JSON for comparison and rollback. A request to update the current configuration changes its settings through this replacement procedure. Do not overwrite an existing configuration's JSON or fall back to an in-place edit when creation or activation is unavailable. If the requested settings already match, report that no change is needed without creating a duplicate.

   Under the [request and authorization rules](../RUNBOOK.md#start-from-the-request), an explicit request for this exact replacement may authorize creating and activating the replacement and inactivating the identified baseline; explain this method without requiring another confirmation. A draft request authorizes no writes, and a request only to stage an inactive copy does not authorize activation. Preserve any separate publication and activation stages required by the requested workflow.

   For a custom-record tab, also follow the [custom-record Mobile workflow](custom-record-mobile.md) for definition, rule, label, and action checks. Connected MCP record tools can create configuration record instances and update their active state when current metadata and permissions support those operations. Do not assume a generic write runs the editor's client validation or provides an atomic compare-and-swap.

### Bounded Mobile presentation changes

This path covers an authorized tab, label or layout change to a sole identified active configuration, using existing record definitions and fields, a verified Task population and parent relationship, and fully established affected configuration rules. It must preserve existing tabs and unrelated settings, add no record create/edit/delete actions, and change no record permissions or execution roles. Loading must stay within the explicitly requested records, fields and Task scope. A requested view-only tab needs explicit `create: false`, `edit: false` and `delete: false`.

When the request clearly targets the current NetSuite connection and only one connection is applicable, use that connection and its freshly read configuration baseline as the target. Record any account or acting-role attributes the connector does not expose as unverified. Missing identity metadata alone does not require another account or block this path. If the user names a different account, multiple connections are plausible, or identity evidence conflicts, resolve that target before writing.

Check available record and field access evidence. Stop for a known denial relevant to the change, an unresolved security or execution-context decision that affects the candidate, or data exposure outside the authorized scope. Unavailable technician permission metadata alone can remain a post-change check; connector reads do not prove technician access. With supported create and status-update operations, the authorized configuration replacement can be attempted without a separate write-permission probe. Respect any returned denial and inspect an uncertain result before further action; do not elevate permissions or silently switch connections.

A replacement meeting these conditions does not require a connected sandbox. Retain the exact baseline, validate the complete candidate, and follow the activation procedure's immediate rereads, switch and recovery checks. Report configuration persistence separately from pending technician visibility, loading and action checks. This exception does not waive requirements of other workflows.

## Enable Configuration Preview alone

Treat an explicit request to enable `config.preview` as a narrow setting change. The [Configuration Preview procedure](../references/configuration-index.md#foundations-and-changes) sets `"config": {"preview": true}` in the configuration JSON. A merged preview cannot be required before enabling it.

Use the replacement procedure above. A Preview-only change does not require merged Mobile arrays.

Readback of the saved JSON does not prove the Preview UI works. If that result matters, ask the user to check the display and report it as pending until supplied. If the connector cannot write the field, report the gap and the documented UI path for the user or administrator.

## Establish and use MCP activation for a versioned change

Follow [configuration preparation](#prepare-an-authorized-change) for scope and authorization. Perform only the authorized stage below.

### Create and verify an inactive candidate

1. Confirm one active `customrecord_nx_configuration` baseline and its complete JSON. Establish affected Mobile arrays through the [configuration evidence procedure](#review-configuration-evidence), using documented defaults and complete active overrides when sufficient. A user-provided Preview or a connector capability that returns effective configuration can resolve remaining gaps. Generic record reads and field metadata do not supply core defaults.

   Build a complete candidate that preserves unchanged settings and every entry in any replaced array. Validate its JSON and supported fields against the FSM specification applicable to the verified installed release. Record the baseline identity and JSON for rollback.
2. Confirm the connector can create an inactive configuration record. Immediately before creation, reread the complete active set and baseline JSON; stop if either changed since review. Create the candidate inactive, then read back its identity, inactive state and complete JSON. If creation has an uncertain result, inspect existing records before retrying; never blindly repeat the create. Keep the baseline active and its JSON unchanged while preparing the replacement. Stop here when only staging is authorized.

### Activate and verify the candidate

1. Identify the verified inactive candidate and its retained baseline. If staging is incomplete, complete it only when authorized. Confirm the connector can update `isinactive` on both records. For changes outside the bounded Mobile path, rehearse the switch and rollback in a representative sandbox before production use. Use a coordinated window without other configuration writers. Reread the complete active set, baseline and candidate immediately before activation. Stop if any differs from the reviewed state.
2. For an MCP switch, activate the candidate first, then inactivate the old record by updating only `isinactive`. This avoids a deliberate gap with no active override but temporarily leaves two active records. FSM may merge both during that interval. Reread the active set and both records after each write; stop on an unexpected result. Separate reads and writes are not atomic.

   If either write fails or has an uncertain result, inspect the complete active set and both records before doing anything else. When the old record is still active and unchanged and no unexpected override is active, restore the candidate to inactive only after confirming its identity and JSON. Otherwise, stop for coordinated recovery. Never blindly retry a create or update.

   Confirm exactly the intended record is active and verify the affected behavior with available evidence.
3. Verify the replacement's full JSON and that the previous record is inactive with its original JSON intact. Report both records' names and IDs and the changed settings so the user can compare versions. Retain the previous record for rollback; reread the current active set and both records before an authorized rollback to account for intervening edits.

   Recheck affected static settings from the saved active JSON and applicable defaults. Use an MCP-accessible runtime source or user-provided Preview for any remaining merged-setting gap; mark only that unresolved check pending. For a Mobile change, the user performs the live technician check after activation. Record tab visibility and loading as pending until their results are known. If the temporary two-active state or recovery risk is unacceptable, give the user or administrator the documented Configuration UI procedure or use a dedicated atomic activation mechanism instead.

| Workflow | Material checks |
| --- | --- |
| Work and history | Record and field visibility, subsidiary scope, enabled project tasks, supported relationship joins |
| Schedule and assignment | Primary versus team, skills, calendars, timezone, recurrence scope, notifications and operation semantics |
| Completion and time | CRM versus project task, task type and service item, time tracking, actual activities, pending generation |
| Consumables | CRM applicability, item, location, quantity, serial/lot/bin requirements, billing and fulfillment settings and links |
| Closure and invoice | Current status references, close formulas, project and program effects, transaction and time/expense application |
| Recurrence and program | Enabled rules, copied fields, exemptions, generation bounds, child creation and deletion scope |

Report the confirmed effective behavior, recommended or verified change, permission or feature limits, and material settings that could not be inspected. Follow [SafeWords](../RUNBOOK.md#safewords) for retrieved content and authorization.
