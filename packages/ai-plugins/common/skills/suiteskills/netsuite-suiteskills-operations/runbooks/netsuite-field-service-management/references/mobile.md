# Mobile technician work

Mobile is a technician PWA whose tabs, fields, job types and permissions depend on account configuration. Wait for initial loading before interpreting an empty view. Use [scheduling](scheduling.md) for assignment and dates, [work management](work-management.md) for completion and Case effects, and [time](time.md) for generated Time Bills.

## Access, task visibility and state

Mobile access needs an individual employee email and an available FSM license. Existing NetSuite users use their credentials; keep Give Access clear for mobile-only access. Email Mobile Login sends an invitation. Operations, finance and coordinator roles need not receive Mobile access.

Mobile User is an identity criterion and does not prove login, role access or Schedule Board visibility. The default Mobile user lookup requires an active Employee with Mobile User checked. Full Field Service Employee eligibility also requires Region.

The default CRM Task list includes a typed task when the current user is its primary assignee or a team member and its native Start Date is within five days before or after today. Configured overrides can differ. This filter requires neither a Case nor a Project. Visibility is separate from task ownership and access.

In the default Mobile CRM Task view, a task team member can Start a visible task when Start is otherwise available. Start does not require primary assignment. Complete is available only to the primary `assigned` employee when the task is started and required resource entries are complete. Effective permissions and configuration can change action availability; verify the saved result. The selected task is not necessarily the only In Progress task. Task start/end fields can determine Mobile status independently of native status. Times display in technician timezone, and built-in route estimates omit live traffic.

With Project Management enabled, the default Mobile Project Task list includes a task when the current user is in `projecttaskassignment.resource`, FSM Task Type is populated, and its date range overlaps the window from five days ago through five days ahead (`enddate` on or after the window start and `startdate` on or before the window end). The CRM Task list instead uses its assignee/team and Start Date filter.

The Project Task event carries the task's own record ID in `projecttask`. Its `cancomplete: true` mapping controls the default UI value; it does not establish record access or permission to complete. Unset or non-Boolean action-permission expressions can allow an action. Evaluate effective permissions when diagnosing custom tabs.

Mobile is installed through a supported browser. Remote fields and tabs need connectivity. Refresh reloads cloud data and can discard unsynced changes. Reconnect and wait for synchronization before refreshing. Test offline behavior in the external PWA; the NetSuite emulator is insufficient. Record device/browser, task/tab and sync symptoms when diagnosing failures. Mobile dropdowns and stock lists can be cached, so an outdated display does not prove inventory or configuration needs repair.

## Capture tabs

To include configured Mobile content in a service report, use [Mobile report mapping](service-reports/mobile-tabs.md) and the selected report's data contract.

- Asset and History show current equipment and completed work, inventory and accessible files. The default Asset article selects the event Asset or one of its children and shows its Item image and description as read-only fields. Effective resource configuration and permissions can differ. Contact actions open communication apps. See [assets](assets.md) for hierarchy and history.
- Details captures actions and configured signatures. Save precedes Complete. Close Case can affect the Case and other tasks beyond completing the selected task. Actual required fields depend on the configured form.
- Time needs a service item and duration; decimal hours may be accepted. Editing or addition after completion depends on the workflow. Expenses save category, amount, description and receipt; a visible local entry is not proof of cloud persistence.
- Files need file and description; later edits change description. File or note deletion can remove cloud data. Notes use title and message.
- Task creates additional work on the existing Case when present. Date display is device-dependent; entry time uses 24-hour format.

Custom-record resources can appear as tabs on configured Mobile events when the applicable event rule selects them. The default event types are CRM Tasks and, when Project Management is enabled, Project Tasks. Additional event types can be configured. The resource `label` names its Mobile tab or page without renaming the native NetSuite record type or field. A record title may supply a different page heading.

A selected tab can remain visible and dimmed when its `enable` or `disable` condition applies, and it can still open. Check restricted actions instead of assuming that navigation is blocked. A tab with no related entries may still be present. See [configuration](configuration.md#searches-mapping-and-request-diagnosis) for rule selection and [parent relationships](fsm-mobile-resource-properties-reference.md#parent-relationship) for loading and creation.

Custom-resource [`create`, `edit`, and `delete` flags](fsm-mobile-resource-properties-reference.md#permission-precedence) control Mobile actions. Omitted flags default to `true` unless resource `readonly` is `true`, so set each explicitly. A view-only UI uses `false` for all three. Resource and form `readonly` settings also affect editing.

Neither hidden controls nor a parent filter enforce record ownership. Check the technician's NetSuite record and field permissions and Mobile execution role separately. An [automatically generated article map](fsm-mobile-resource-properties-reference.md#automap) does not prove that its named fields exist on the article record; verify current metadata before relying on it.

Mobile Translation Collection references such as `custcollection_<collection>.<key>` can label a resource or selected field element after the collection, key meaning, and locale values are verified. Native NetSuite type and field translations use separate definition settings. Literal Mobile labels remain literal across locales. A token's presence alone does not establish the displayed wording, and static labels do not translate stored values or search results.

## Parts and transaction actions

Consumables captures CRM Task usage with task, Asset and employee context. Asset-nested Time and Consumables tabs can present a child Asset selector; see [Asset capture paths](financial-reporting.md#asset-capture-paths) for saved attribution and verification. Project Task material use follows Sales Order instead. See [materials and inventory](materials-and-inventory.md) for supported items, stock, serial/lot handling and fulfillment, and [financial reporting](financial-reporting.md#asset-capture-paths) for Asset attribution on transaction lines.

Sales Order can create or fulfill on an online save; offline changes wait for synchronization. It commonly permits one order, additional lines and read-only existing lines. Every line needs item and quantity. Filtering out existing lines can remove them on save. See [materials and inventory](materials-and-inventory.md) for technician stock, partial fulfillment and Inventory Status limits.

Quote can send email and capture approval or signature for order creation. Apply To Current Job links the current Project or Case where applicable. Totals can remain stale until cloud recalculation.

Receive, Return and Transfer Order actions follow the [technician stock workflow](materials-and-inventory.md). Inventory options refresh at startup or Refresh and are cached between refreshes. Choices depend on technician location, Mobile visibility and configured searches. Transfer receipt lists use pending orders to that location. See [billing](billing.md) for Case transaction relationships and invoice effects.

## Customization and compatibility

Do not duplicate History, Sales Order, Quote, Files, Return or Receive tabs expecting their special logic to transfer. [Configurable form elements](fsm-mobile-blocks-reference.md#common-element-properties) support Boolean expressions for `required`; custom date formats are not generally supported. Barcode scanning applies to select/text fields.

Verify the affected transaction flow before relying on custom transaction forms or partial serialized fulfillment. Enhanced File Security, Inventory Status, Time Tracking for CRM and Advanced Employee Permissions can affect relevant operations. Receipt uploads can fail with Enhanced File Security. Diagnose the affected operation without changing security or enabling features as an implicit fix.

Enhanced Technician Notes is optional. Clean Up processes the whole textarea even with selected text; review meaning before retaining changes. Global-off overrides element configuration; empty element settings disable it while omitted settings inherit. Language selection follows employee language and configured prompt variants. Preserve original service facts.

Mobile uses automatic `externalid` keys prefixed `fsm_`, a pending window and temporary tracking records for idempotency. Do not fabricate these keys for generic writes. See [configuration mappings](configuration.md#searches-mapping-and-request-diagnosis), [form behavior](configuration.md#mobile-form-values-and-validation), and [offline-cached imports](configuration.md#imports-access-and-security).
