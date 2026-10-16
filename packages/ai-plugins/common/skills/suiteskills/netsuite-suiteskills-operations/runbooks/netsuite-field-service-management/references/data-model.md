# FSM concepts, records and relationships

FSM combines custom records with native NetSuite records. Adding an FSM field, script or sublist leaves the native record's type unchanged. The [data dictionary](data-dictionary.json) is a schema snapshot; use the [dictionary guide](dictionary-guide.md) for custom identifiers and field cardinality.

Check installed packages, features, deployments, permissions and current metadata before relying on a field or write path. A record definition or supported read does not establish support for creating, updating or deleting that record.

## Work and service concepts

| Concept and record | Identity and relationships | Behavior reference |
| --- | --- | --- |
| Customer | Service recipient; native activity Company can reference a Customer or Project, while FSM Customer retains separate service context. | [Work management](work-management.md#work-relationships) |
| Project (`job`) | Native Project with FSM Project Type **or** FSM Project Asset populated. Customer hierarchy is normal, but native Project Management can permit a Project without a Customer. | [Work management](work-management.md), [programs](recurrence-and-programs.md#project-programs) |
| Case (`supportcase`) | Native Case describing a service job or problem, identified as FSM by populated FSM Case Type. An Asset is expected; its requirement depends on operation and account rules. Company can be a Customer or Project. | [Work management](work-management.md) |
| CRM Task (`task`) | Native Task identified as FSM by populated FSM Task Type; Service, Admin or Training work need not have a Case, Project or customer visit. Primary assignee and additional team are separate. | [Work management](work-management.md), [scheduling](scheduling.md) |
| Project Task (`projecttask`) | Native project work belonging to a Project, with separate resource, completion and parts handling. | [Scheduling](scheduling.md), [work management](work-management.md#completion-and-closure), [materials](materials-and-inventory.md) |
| Asset (`customrecord_nx_asset`) | FSM service context such as a site, machine or component; optional parent/children, Item, primary/additional Customers, location, timezone and source transaction. Distinct from native Item, Location and fixed-asset records; coordinates can exist without an address. | [Assets](assets.md) |
| Field Service Employee (`employee`) | Active native Employee with Mobile User checked and Region populated; Board roster criteria differ. | [Scheduling](scheduling.md#resources-and-assignments) |
| Service resource / Mobile resource | Service resource means a technician or other configured assignable entity; visibility depends on configuration. Mobile resource means a configured tab/screen or data resource, not necessarily a technician. | [Scheduling](scheduling.md), [Mobile](mobile.md) |
| Skills; Task type / booking | Task skill requirements differ from resource qualifications; the assignee UI can require all selected skills. Task Type controls configured behavior; booking confirmation is independent. | [Scheduling](scheduling.md) |
| Schedule / actual; service outcome | Planned time differs from commencement/completion and on/off-site timestamps. Actions, classification and service or safety results do not themselves establish completion. | [Time](time.md), [work management](work-management.md#completion-and-closure) |
| Consumable (`customrecord_nx_consumable`) | CRM Task Item/quantity usage with Case, Asset, employee, Location and possible inventory/transaction links; Project Task parts use a Sales Order. | [Materials](materials-and-inventory.md), [billing](billing.md#case-consumable-billing) |
| Activity (`customrecord_nx_activity`) / Time Bill (`timebill`) | Custom task activity and native labour Time entries are separate records. | [Time](time.md) |
| Recurrence / program | A recurring series preserves occurrence exceptions; a Project program derives and reconciles child Cases/Tasks. | [Recurrence and programs](recurrence-and-programs.md) |
| Unbilled amounts | Calculated expense, sales and Time components, not an Invoice command. | [Billing](billing.md#unbilled-amounts-and-invoices) |

The expected FSM service hierarchy runs from Customer to Project to Case to CRM Task. The full chain is not required for every native record or CRM Task. Cases can group several CRM Tasks, while native Project Tasks belong to Projects.

A Task has one primary Asset reference, which may identify a site or parent instead of the serviced child. Cases and Projects can have multiple Asset relationships. CRM Tasks also link resources, service results, Consumables and activities. Field applicability and cardinality vary.

## Supporting records and limits

| Group | Records and relationships | Behavior and limits |
| --- | --- | --- |
| Files | `customrecord_nx_file` links a Task to a native File Cabinet document. | [File and document operations](work-management.md#files-and-documents) affect distinct records. |
| Scheduling | `customrecord_nx_recurrence` holds a repeat pattern and target work type. `customrecord_nx_work_calendar`, `customrecord_nx_non_working_day`, `customrecord_nx_employee_non_working_day` and `customrecord_nx_time_zone` supply availability and timezone context. | [Scheduling](scheduling.md) reads calendars and employee exceptions; a scheduler read does not establish a write path for every scheduling record. See [recurrence processing](recurrence-and-programs.md) for instance effects. |
| Classifications | Custom activity, Asset, Case, Project and Task types, Task outcomes, skills and language choices. | Work and configuration paths read classifications; values and maintenance interfaces vary by account. |
| Operational state | `customrecord_nx_account`, `customrecord_nx_configuration`, `customrecord_nx_error`, `customrecord_nx_idempotency` and `customrecord_nx_notification` support setup, configuration, errors, duplicate-operation control and notifications. | Their respective FSM processes create or update them; they are not substitutes for business records or proof that queued outcomes completed. |
| Service results | `customrecord_nx_install`, `customrecord_nx_uninstall`, `customrecord_nx_repair`, `customrecord_nx_maintenance` and `customrecord_nx_jobsafety` hold work-result or safety data. | Check current records, metadata, workflow and connector operation before using them as history sources or write targets; definitions alone do not establish runtime operations. See [Asset history](assets.md#fulfillment-and-service-history). |
| Native transactions | `expensereport`, Estimate, Sales Order, Item Fulfillment, Transfer Order, Item Receipt, Invoice and Journal Entry retain their native types. | See [billing](billing.md), [materials and inventory](materials-and-inventory.md), and [financial reporting](financial-reporting.md) for their distinct processing and posting paths. |
| Native context | Customer, Contact, Employee, Item, Location, Subsidiary and Inventory Number supply service context, access, pricing, stock or timezones. | Reads do not imply writes; [Project Contact attachment](work-management.md#project-contacts) is not Contact creation. |

## Native-record extensions

FSM adds `custevent_*` fields to native Case, Task and Project Task records; `custentity_*` fields to entities such as Project and Employee; `custitem_*` fields to Items; and `custbody_*` or `custcol_*` fields to transactions. These fields hold classifications and links such as Asset, Case, Task or Consumable references.

Saved-search sublists can display related task expenses or customer Cases. Client, user-event and scheduled scripts can add form behavior or queue processing. A field or deployment definition does not prove that a value was saved, a script ran or a downstream record was created. Inspect saved records and processing state before retrying or reporting completion.
