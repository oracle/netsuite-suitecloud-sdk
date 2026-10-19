Before tool use, load and apply [category SafeWords](../../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Configure a custom record in FSM Mobile

Use this procedure to show, localize, or control the visibility, enablement, or editing of a custom record on CRM Tasks, Project Tasks, or another configured Mobile event. Account configuration, metadata, and permissions determine what is available. Use [effective configuration](../references/configuration.md#effective-configuration) for merge and Preview behavior and [Mobile capture tabs](../references/mobile.md#capture-tabs) for what technicians see and do. Consult the [Oracle configuration index](../references/configuration-index.md) only when the relevant local section does not answer the question.

## Choose the requested change

| Request | Relevant work |
| --- | --- |
| New resource or a requested layout redesign | Establish the task context and Mobile field plan below. Resolve the definition, then design the resource. A conceptual draft can use provisional identifiers without account evidence; mark account-dependent behavior unverified. |
| Narrow change to an existing resource | Identify the resource, affected setting and intended delta. Reuse the established task context and field layout. A label or action change does not require reopening unchanged field choices. Read only the relevant design steps and property sections. |
| Localization | Resolve the requested labels and locales in [record definition and labels](#resolve-the-record-definition-and-labels). Then review the affected translation and configuration changes. |
| Missing, dimmed, empty or failing tab | Start with [diagnosis](#diagnose-an-existing-resource) and inspect evidence for that symptom. |

## Establish the request and account state

1. For account-specific work, establish the affected record type or resource, intended users, and a representative Task. Ask "CRM Task, Project Task, or both?" only when the task context is unknown and needed to choose a relationship, rule, or tab design. Until the user answers, keep that design context-neutral. Do not infer CRM or Project Task context from account features.

   A CRM Task tab can be planned when Project Management is disabled. Check that feature only for a requested Project Task branch. If both are requested while Project Management is disabled, continue the CRM Task design and mark the Project Task branch pending. Do not enable the feature or silently drop that branch.
2. For a new resource or requested layout change, clarify whether users should view one record, create one, or list several related entries. Establish a Mobile field plan for the affected fields: whether each appears in the list, record form, both, or neither; its order and label; and whether its form control is required, editable, or read-only.

   A record's field inventory does not establish the desired Mobile presentation. Mark missing choices as `TBD` and ask which named fields should appear, in what order and with which controls. Leave the layout unchosen until the user answers or asks for recommendations. Preserve unchanged field choices for a narrow edit.
3. When visibility, enablement or action access is in scope, distinguish hidden tabs, visible but disabled tabs, and read-only entries. For visibility, collect the intended Task populations and verified mapped values. For enablement, collect commenced/completed or prerequisite-resource conditions. Establish the intended create, edit and delete actions. A Mobile action control is separate from NetSuite authorization.
4. Follow the [configuration evidence procedure](configuration.md#review-configuration-evidence) for the active set, Preview limits and conditional requests for effective settings or role evidence. Inspect existing resources, record and field metadata, available technician and execution-role access evidence, and representative records relevant to the requested change. Distinguish unavailable permission metadata from a known denial; apply the [bounded Mobile presentation checks](configuration.md#bounded-mobile-presentation-changes) to decide what must be resolved before saving and what remains for technician validation. Use the [dictionary guide](../references/dictionary-guide.md) for known FSM identifiers, then confirm them in the account.

   A failed read does not prove a type or field is absent. A conceptual draft may proceed without account evidence; keep it provisional when a material prerequisite remains unverified.

## Resolve the record definition and labels

### Define the record and fields

When a new resource or definition change needs this work, distinguish a custom-record type or field definition from an entry of that type. Reuse a suitable type and fields when available. For a missing definition, prepare a handoff with the business name and provisional script IDs, field types and option sources, requiredness, direct parent relationship, owner or maintainer, entry permissions, and definition authority.

Check whether a bundled type is locked and which extension path the account permits. A visible New Field control does not prove a save will succeed. Generic record-entry create/update capabilities do not create definitions.

Use a definition-management capability only after verifying its schema and authorization for the requested definition change. Otherwise, give an authorized administrator the exact UI or SDF handoff. If the current user lacks authority, identify a suitable employee only from verified role assignments and organizational context. Without that evidence, refer them to their NetSuite administrator without guessing a name. Re-read the completed definition and access before making an apply-ready Mobile mapping.

### Confirm the parent relationship

CRM Tasks need a verified List/Record field targeting `task`; Project Tasks need a separate verified field targeting `projecttask`. Use the [parent relationship rules](../references/fsm-mobile-resource-properties-reference.md#parent-relationship) to align the definition with loading and creation.

### Localize native and Mobile labels

When labels need localization, collect the source language, requested locales, representative users' language preferences, and approved wording in one matrix. Give each label in scope its own row: native record-type name, native field labels, Mobile tab/page label, and selected Mobile field labels.

Native definition translations and Mobile Translation Collection keys are separate; neither layer inherits the other's labels. Check Multi-Language, enabled locales, a customer-owned editable collection, key meaning and lock state, and every approved locale value. Reuse a key only when its meaning and values match. A renamed shared tab may need a dedicated key. Literal Mobile labels remain literal. These translations cover static labels, not stored values, list choices, search results, or record names.

Apply and read back authorized translation changes before activating configuration that references them. If the connection lacks a supported write, hand the exact collection/key/locale changes to an administrator and verify their completion.

## Design the Mobile resource

Use only the steps and reference sections affected by the request. Read [resource properties](../references/fsm-mobile-resource-properties-reference.md#resource-properties) for a tab definition, [article properties](../references/fsm-mobile-resource-properties-reference.md#article-properties) for record mappings, and [Form Properties](../references/fsm-mobile-resource-properties-reference.md#form-properties) only when custom-form loading is involved. For fields, route to [element types](../references/fsm-mobile-blocks-reference.md#element-types), [Select options](../references/fsm-mobile-blocks-reference.md#configuring-the-select-options-property), [Number precision and steps](../references/fsm-mobile-blocks-reference.md#number-precision-and-steps), [dynamic expressions](../references/fsm-mobile-blocks-reference.md#mobile-expressions-and-value-updates), or [File and Image behavior](../references/fsm-mobile-blocks-reference.md#file-and-image-accept-behavior).

1. Start with effective `routes/mobile` configuration. CRM Task rules are at `event.article.task.resources` and Project Task rules at `event.article.projecttask.resources`. For another configured event, verify its definition and resource rules under `event.article`.

   Check the first matching rule for each intended population. When inserting a more specific earlier rule, preserve all existing tabs, ordering, and fallback rules. A later match does not add a tab, and a custom array replaces the whole base array. Reuse a matching resource instead of adding a duplicate. Use separate definitions when the parent relationship differs.
2. Build the resource from verified metadata and available connector operations. Map the confirmed Mobile field plan into list columns and form elements. Keep technical parent and identity mappings distinct from displayed fields. Specify `article.record`, `article.map`, bounded search `record`/`filters`/`map`, selected `element` blocks, required fields and option values, deliberate `min`/`max` for a collection, and explicit `create`, `edit`, and `delete` booleans.

   For Select elements, read the current option source through MCP and verify active option IDs and labels. If unavailable, keep the mapping provisional; do not infer IDs from labels. Use all three `false` for a view-only UI. Validate [`readonly` precedence](../references/fsm-mobile-resource-properties-reference.md#permission-precedence) and article mappings. Check actual role/field permissions separately, recording unavailable technician checks as pending where the bounded Mobile path permits.

   Use [`automap`](../references/fsm-mobile-resource-properties-reference.md#automap) only when it is enabled and element IDs match fields on the article record. Prefer explicit selected elements over form introspection that can create a deployment. Do not infer that a built-in tab's special logic transfers to a custom tab.
3. Link both loading and creation to the verified parent relationship. Filtering does not enforce ownership security. Verify record permissions against direct access when evidence is available; retain an unavailable check as pending only where the bounded Mobile path permits. Never claim the parent filter proves security. Resolve a known denial or an unresolved access-control requirement before applying a dependent change.
4. For conditional visibility, verify the effective event mapping and actual values on representative Tasks before choosing a predicate. A missing scalar mapping may be added only from a verified simple source. Check every reachable first-match branch when the tab should appear for all Tasks.

   For a visible but disabled tab, use verified [`enable`/`disable` dependencies](../references/fsm-mobile-resource-properties-reference.md#resource-dependencies). A prerequisite resource must be selected in the same population and have a positive effective `min`. A disabled tab can still be opened. Treat action restrictions while disabled as unverified until tested with the intended Mobile role. Use NetSuite permissions when a server-enforced restriction is required. A CRM Task completion edit lock may use a verified `article.map.readonly` mapping, which is distinct from enablement and server-side permissions.

## Review, apply, and verify

Prepare the candidate from the complete current account override and verified effective branches, preserving unrelated settings. Show the result users will see, affected people and Task populations, verified record and relation identifiers, resource IDs, baseline record identity, and only changed configuration paths with before/after values.

When layout is in scope, include the selected list columns and form fields with order and access. When labels or actions are in scope, include the label matrix or intended action access respectively. Include any copied whole rule array and all existing tabs it preserves. Identify unsupported or unverified behavior, definition or translation handoffs, and Mobile checks that remain for a user. Review the complete candidate JSON and resulting merged behavior where evidence permits. If the baseline changes, rebuild the candidate.

For an authorized change, follow the shared [configuration workflow](configuration.md#prepare-an-authorized-change) for access checks, application, readback and rollback. Recheck translations and Mobile metadata material to the write. Do not create live records merely to test the skill.

After the configuration change, have the user or a designated tester check representative authorized and restricted technicians in Mobile, each requested locale, hidden and visible Task cases, enabled and disabled states, empty and populated collections, prior tabs, and each allowed or denied action.

For an approved non-production save test, confirm submission through the tester and check persisted values, including the parent link, through MCP when available. Check native labels in NetSuite and Mobile labels in Mobile separately. Record checks that the connection cannot perform as pending with the account, role, example Task, tab, and expected result. A saved JSON body or translation token does not prove displayed behavior.

If the request also includes these fields in a technician-facing service report, use the [service-report workflow](service-reports/index.md) for that separate outcome. A Mobile resource change alone does not authorize a template change.

## Diagnose an existing resource

- For a missing tab, inspect the Task's first matching rule, mapped values, resource ID, and role access.
- For a dimmed tab, inspect dependencies and prerequisite `min`.
- For an empty list, inspect the parent link and read permission.
- For missing fields or edit actions, inspect element IDs, available configuration, action flags, `readonly`, dependencies, role/field permissions, and validation errors.

Use MCP configuration and record evidence to narrow the cause. If necessary, ask the technician whether the tab is absent, empty, or showing an error. Request sanitized, user-provided browser diagnostics only under the [configuration evidence condition](configuration.md#review-configuration-evidence). Do not automate the UI. For a proved unsupported or ineffective setting, follow [configuration correction guidance](../references/configuration.md#correct-unsupported-or-ineffective-configuration). Correct the smallest supported cause. Do not add a duplicate resource or broad catchall simply to make a tab appear.

Report the confirmed definition and metadata, proposed or applied change, authorization and role boundaries, actual Mobile tests, pending checks, and next supported administrator action. Follow [SafeWords](../RUNBOOK.md#safewords) for retrieved content and authorization.
