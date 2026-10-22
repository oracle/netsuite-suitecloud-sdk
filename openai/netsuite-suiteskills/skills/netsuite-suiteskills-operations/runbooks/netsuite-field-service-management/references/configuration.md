# FSM configuration, access and form behavior

FSM behavior depends on effective account configuration, deployed components and execution context. Settings can change mappings, defaults, validation, views, notifications and automation. A field definition or saved configuration record alone does not establish how Mobile or the Schedule Board behaves. Use the [Oracle configuration index](configuration-index.md) for details about a setting or symptom.

## Diagnostic scope

Use the [scope and unavailable diagnostics](../RUNBOOK.md#scope-and-unavailable-diagnostics) boundary for internal administration or synchronization-monitor requests. The customer configuration evidence below does not establish monitor status, synchronization health or a supported reset operation. Keep those results unavailable while continuing the independently supported configuration checks.

## Effective configuration

FSM combines core settings with account JSON in `customrecord_nx_configuration`. One custom configuration should be active. Object properties merge, and custom arrays replace whole base arrays. Keys match case-insensitively. A null override deletes a matching property during a merge. With multiple active overrides, this can remove an earlier override and allow a route default to apply. JSON properties whose names begin with `//` are annotations. FSM omits annotation properties from Preview. Literal `//` comments outside JSON strings are not valid editor input.

The stored record excludes core defaults. A relevant static setting can be established by combining its documented default with all active overrides under the merge rules. This establishes that setting, not the entire runtime result or technician behavior. Resolve conflicting override precedence, changes to parent objects, and custom route behavior before relying on that calculation. If a material value remains unresolved, identify that specific gap.

Configuration Preview is an optional read-only view of merged settings on the configuration record's edit form. It defaults to `false`; enabling it requires `config.preview: true` in the effective configuration. With one active override, determine whether Preview is enabled from that record, using `false` when the setting is omitted. With multiple active overrides, establish merge precedence before resolving conflicting values. If precedence is unknown, the state is unverified.

MCP record and SuiteQL reads return stored JSON, not the computed Preview, so checking the setting does not retrieve the Preview. A sanitized Preview excerpt can establish merged settings; it is unnecessary when documented defaults and complete active overrides already determine the relevant setting.

With no active override, defaults can load. Multiple active overrides can contribute to runtime configuration, so a preview of one record may not represent the complete state. Use the [configuration workflow](../workflows/configuration.md#review-configuration-evidence) for evidence requirements and authorized write paths.

Mobile routes control events, tabs/resources, shared inventory and users. Scheduler routes control Schedule Board events, resources and filters. Models control sourcing, defaults and validation; views govern the NetSuite record UI and do not govern Mobile or the board. Notifications, programs, recurrence and billing have separate settings.

For service-report template and data changes, use the [template builder](../workflows/service-reports/template.md). [Report publication](../workflows/service-reports/publication.md) uses the configuration evidence and write procedures for its template-reference changes.

## Correct unsupported or ineffective configuration

When task evidence establishes unsupported, outdated, or ineffective configuration or setup, explain the observed setting and its actual effect. State the applicable current FSM rule and the smallest supported correction, including its expected result. Distinguish rejected values from values that FSM ignores, normalizes, or overrides. If configuration alone cannot address the problem, explain the limitation and the administrator or product change needed. Do not invent a setting.

For example, a Number element's `step: "any"` is normalized to `null`, so it applies no increment. Recommend omitting `step` when no increment is intended, or using a positive numeric increment that matches the intended behavior.

Supported aliases, template properties, intentional annotation keys, and disabled optional features are not errors merely because they look unusual. Missing access or incomplete evidence does not establish unsupported configuration. Keep recommendations within the requested task; they do not initiate a broader account audit or authorize applying changes.

## FSM types and Asset inheritance

Asset, Project, Case and CRM Task types are separate FSM custom-record classifications. Customers can adapt their starter values into their own taxonomy. The starter values are neither an account inventory nor an exhaustive whitelist.

| FSM type record | Starter values |
| --- | --- |
| `customrecord_nx_asset_type` | Site, Machine, Component |
| `customrecord_nx_project_type` | Billable, Non Billable, PM Annual, PM 6 Monthly, PM Quarterly, PM Monthly, PM Weekly, Installation, Warranty |
| `customrecord_nx_case_type` | Install, Maintenance, Repair, Uninstall |
| `customrecord_nx_task_type` | Service, Admin, Training |

Populated type fields can identify FSM records without a particular starter label. Match active account type IDs and business meanings to the effective rules that use them. Adding or renaming a type does not update rule conditions, Mobile resources, checklists, scheduling, Program or billing logic, or historical reports. Rule order, fallback behavior and custom classification fields can matter.

Similar labels across FSM types are not interchangeable with each other or with native NetSuite types or statuses. A blank core Asset Type can coexist with a custom classification field. A customer's taxonomy need not match the starter values.

Asset configuration distinguishes `asset.inheritFields` from `asset.parentFields`. The child model sources configured inherited values from its parent and clears configured parent-only values; the editable Asset form disables both sets when a parent is selected. See [Assets](assets.md) for default fields, background propagation and the resulting work relationships.

## Searches, mapping and request diagnosis

Use the Mobile resource reference for [permission precedence](fsm-mobile-resource-properties-reference.md#permission-precedence), [dependencies](fsm-mobile-resource-properties-reference.md#resource-dependencies), [article mappings and parent relationships](fsm-mobile-resource-properties-reference.md#article-properties), and [custom-form loading](fsm-mobile-resource-properties-reference.md#form-properties).

A configuration search uses `record`, `filters` and `map`. Mappings distinguish raw IDs (`=`), labels (`#`), multiselect arrays (`[]`) and read/write sides (`|`). A trailing pipe makes a mapping read-only. Multiselect ID and label arrays can have different ordering, so resolve labels by ID.

Nested searches need bounded criteria and safe empty results. Broad results and poorly arranged nested searches can slow requests. Verify effective search behavior before relying on `all: true` to bypass a 1,000-result limit or claiming a search is complete.

Long search formula text and regex can exceed platform limits; result text may truncate at byte limits, especially with multibyte characters. Treat formula manipulation around 4,000 characters, regex around 512 characters and result text around 4,000 bytes as limits to verify for the specific search operation.

### Mobile event and article mappings

Mobile event maps supply current-task context, and each tab's `article.map` loads and saves its own record. CRM and project-task mappings differ. Server templates resolve before client expressions. For automatic element mappings, explicit overrides and form defaults, use [automap](fsm-mobile-resource-properties-reference.md#automap). Invalid mappings can prevent task loading.

In the default Mobile event map, `event.project`, `event.case` and `event.task` are FSM type hooks. The fields `event.job`, `event.supportcase`, `event.crmtask` and `event.projecttask` carry record IDs. Type-hook values are not record identities.

### Mobile resource selection

For the documented source snapshot, Mobile configuration defaults both `event.article.task.resources` and `event.article.projecttask.resources` to `[]`. Built-in resource definitions do not automatically populate these arrays. If all active overrides omit the relevant array and do not replace or remove its containing objects, the configured rule array is empty. Other object properties can still be overridden. A complete explicit array replaces that default. Missing settings in one record alone do not establish the result when other active overrides remain unread. Verify the installed release and applicable defaults before using this rule; it does not establish a different release or customized route implementation.

The Task summary, map and Start/Complete controls belong to the event view and can appear without resource tabs. Their presence does not establish entries in a resource-rule array. Action availability still depends on task state, permissions and configuration, including resource completion requirements.

Mobile event models select resources from the first matching resource rule. Later matches do not contribute tabs. Under `routes/mobile`, CRM Task rules are in `event.article.task.resources` and Project Task rules are in `event.article.projecttask.resources`. Additional event definitions use their own resource rules under `event.article`. The `user.employee.resources` setting loads supporting resources for the user; inclusion there does not establish a visible tab or page.

A more specific rule placed earlier needs the complete intended resource list, including existing tabs. Rule properties are AND conditions, and an array of values for one property is OR. In the supported matcher, missing or falsey values compare as `"false"`, while `"true"` can match a truthy value. Verify effective mapped values and the first-match result on representative records before relying on a condition.

A resource absent from the selected rule is hidden. Selected resources use [dependencies](fsm-mobile-resource-properties-reference.md#resource-dependencies) for enablement; these conditions do not establish NetSuite authorization.

Use the [article parent relationship](fsm-mobile-resource-properties-reference.md#parent-relationship) to link both loaded and newly created records to the intended parent.

### Runtime requests and connector evidence

For Mobile, `routes/mobile/event` searches load jobs, `inventory` supplies shared choices, and a job's `resource` request loads its tab data. Schedule Board events, resources and filtering are defined in `routes/scheduler`. For slow requests, find the affected user's employee ID and check the relevant searches and data with the NetSuite connector. Filters that use the employee ID can show which records should be returned. The connector runs under its own identity and cannot replay these runtime requests. Mobile requests also use effective configuration and the user's execution context. Do not treat connector query time as Mobile request time.

When narrowing search criteria or results, retain the records the workflow needs. A remote Select option source can fetch matching choices on demand when a large local list causes the delay. Large configured order or quote catalogs can also impair performance, so keep their scope bounded.

## Mobile form values and validation

Read only the relevant sections of the [Mobile element reference](fsm-mobile-blocks-reference.md):

- [Values and defaults](fsm-mobile-blocks-reference.md#element-configuration-conventions), [table structure](fsm-mobile-blocks-reference.md#table-element-structure), and [validation rules](fsm-mobile-blocks-reference.md#property-validation-rules).
- [Expressions and value updates](fsm-mobile-blocks-reference.md#mobile-expressions-and-value-updates), including dynamic Select `multiple`.
- [Select options](fsm-mobile-blocks-reference.md#configuring-the-select-options-property), [Number precision and steps](fsm-mobile-blocks-reference.md#number-precision-and-steps), and [temporal values and steps](fsm-mobile-blocks-reference.md#temporal-values-and-steps).
- [File and Image behavior](fsm-mobile-blocks-reference.md#file-and-image-accept-behavior), including picker filters, downsampling, size limits, and WebP.

## Imports, access and security

Mobile caches administrator-controlled JS, JSON and CSS imports offline. When deploying revised files, update the corresponding import identifiers or references. A device can keep an older file until that reference changes. Imported expression functions must be synchronous and pure.

UI customization must not modify FSM internals, login, navigation, data stores or endpoints. Sanitized HTML needs a mapping for existing-record content. Hiding controls is not access control. When expression logging is already enabled, bind, parse and runtime messages can help isolate failures. Enabling optional logging is a separate setting change.

Account features and configuration determine which record relationships are enforced and which records are present. Projects are the normal FSM prerequisite. Project Management is optional for many FSM workflows and can permit customerless Projects, although Customer → Project is the expected FSM hierarchy. Project Management affects resource calendars, native project tasks and transaction Project mapping.

Time tracking depends on feature settings and a task-type service item. Posting depends on the relevant subsidiary, currencies, tax configuration, accounting accounts and open periods.

See [Mobile](mobile.md) for technician access and [scheduling](scheduling.md) for Schedule Board licensing, permissions and roster eligibility.

Configuration and error records can contain sensitive operational or authentication details. Server expressions run with deployment privileges, with their reach governed by the actual Execute As Role and relevant settings. Diagnostic output and client imports must not expose secrets.

Receipt uploads can fail with Enhanced File Security; changing security is not an implicit remedy. Time Tracking for CRM, Inventory Status, Enhanced File Security, Advanced Employee Permissions, partial fulfillment and authentication support require feature, configuration and workflow checks. Preview or beta availability does not establish production authentication support.

## Bundle updates and account configuration

Translation availability depends on account features and configured translations and is separate from locale formatting. Bundle upgrades can affect report-template references, permissions, navigation audiences and labels. Bundled objects can be locked; compare effective configuration after an upgrade instead of copying older settings. See [Mobile](mobile.md) for actions, status handling, idempotency and client support.

For the affected business behavior, see [work management](work-management.md), [Assets](assets.md), [scheduling](scheduling.md), [Mobile](mobile.md), [recurrence and programs](recurrence-and-programs.md), [time](time.md), [materials and inventory](materials-and-inventory.md) and [billing](billing.md). Use the [configuration workflow](../workflows/configuration.md) for review and authorized changes.
