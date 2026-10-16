# Projects, Cases and Tasks

Installed features, account rules, forms, permissions and queued processing affect work creation and status. A saved parent record does not prove that downstream work has finished. Use the [data model](data-model.md#work-and-service-concepts) for FSM record identities and the optional service hierarchy.

## Work relationships

The Case's native Company can reference a Customer or Project, while its FSM Customer retains separate service-customer context. When Company differs from FSM Customer, the FSM Case model derives `project` from native Company. It does not use a separate native Case Project field. On a Project, FSM Customer sourcing can resolve through an intervening Project parent.

Changing Company, Customer or Asset can source or clear relationships. Changing Company on a typed Case can also queue updates to existing Tasks and transactions. Verify those results after processing.

For transaction Customer and Project representation, see [financial reporting](financial-reporting.md#transaction-references-and-report-meaning).

A CRM Task has one primary assignee and a separate additional team. When FSM task validation runs, it removes the primary assignee from that team. Other write paths may leave the same employee in both. Task outcome classifies work without completing it. Task type, status and assignment can each affect notifications separately. See [scheduling](scheduling.md) for assignment prerequisites.

## Case Project selection and staged Task creation

A generic Case record create does not reproduce the scripted Project selector, Task staging and save steps. Confirm the supported creation operation before expecting a queued Project or Tasks.

### Case form Project selector

On an editable, visible Case form with supporting fields, the default Project selector displays scripted `custpage_nx_active_projects` and hides native Company. The saved value remains in Company. The replacement selector is unavailable in view mode or when a required field such as Case Asset is hidden. `views/case/projects` controls the form selector; `options.active` and `options.types` govern its native Case form options.

- For an existing Project, default active choices have the same Asset, an active Project status and dates covering the Case start. Blank Project Start or End is accepted, and the End calendar date is inclusive. Comparison uses the Project's valid Olson timezone, otherwise the session timezone. There is no Customer match filter, so a qualifying Project for another Customer may appear. Initial load can retain an already-selected Project outside current options. Choosing a numeric Project ID writes it to native Company. Overrides can change this option set.
- For a new Project Type, default choices are active FSM Project Types excluding Program types and ID zero. The form value is `type-<id>`. Choosing one leaves Company pointing to FSM Customer until background processing creates and links the Project. Creation is not immediate, and some Project Types are not offered.

### Staged Task rows

The scripted Case Add Task subtab validates input and stages one row per calendar day in the selected range. Staged rows are not saved Tasks. Inputs include Task Type, assignee, times, booking confirmation, skills and message.

The subtab's assignee picker offers resources with all selected skills and can retain an empty choice. It does not define assignment rules for every Task path. The staged end-date input is not necessarily written to native Task Due Date. Form and configuration affect availability.

### Queued Project and Task creation

When a new Project Type is selected and each stage succeeds, saving the Case queues Project creation at priority 1. Processing saves the Project and relinks Case Company. The Project uses the Case's Company as parent and copies FSM Customer, Asset, Contact, Time Zone, timezone-adjusted start date and selected Type. Case relink retries record-change collisions within its coded limit.

Staged Tasks are queued at priority 2 with `yieldpriority: true`. Each callback reads the Case's current Company, then saves a Task linked to the Case.

The priority wait observes higher-priority FSM jobs while they are Pending or Processing. It does not verify that Project creation succeeded. A failed Project job can leave Tasks using whichever Company is then on the Case. Existing Tasks use a separate queued propagation path after a typed Case's Company changes.

Case, Project and Tasks are not atomic, and staged Tasks need not receive a new Project. After processing, verify their IDs, Company and Case links, status, assignment, skills, booking, dates and timezone. Investigate queue errors and resulting records before retrying.

## Project contacts

On a new typed Project, `custentity_nx_contact_update` defaults to enabled. With a Project Type and the flag enabled, creation or a later change can queue contact processing. A primary Contact chosen on the form has a separate attachment path.

The processor selects typed Projects with the flag, applies the configured customer-contact filter, and attaches existing Contacts that are not already on the Project. It clears the flag when no attachments remain. It does not create Contact records or remove existing Project associations that become ineligible.

An Asset-only FSM Project may not meet the typed-Project filter. This path does not make every Customer Contact immediately available. Check contact ownership, effective filters, queued outcome and associations before relying on a link.

## Completion and closure

Project Tasks and CRM Tasks have separate completion transitions. Setting status, timestamp or outcome through a generic update does not reproduce [Mobile completion](mobile.md).

In the default Mobile CRM Task view, Complete is limited to the primary `assigned` employee. Details actions and Close Case may be read-only for additional team members. The configured form determines required saved tab data and signatures. See [time](time.md) for actual timestamps and completion delayed by Time Bill generation.

Configured formulas determine Case opening and closure. In-progress Tasks can open a Case. A Task's closing instruction can close the Case even while other Tasks remain open. Completing every Task closes the Case only when the configured close rule supplies a status. Case statuses are account references, distinct from native CRM Task statuses, so resolve them in the account.

FSM closure can populate end dates, recalculate unbilled amounts, generate the next program service or close an eligible Project. A manual native Case-status change can bypass these steps. See [billing](billing.md) for unbilled amounts and [recurrence and programs](recurrence-and-programs.md) for generated work.

## Notifications and service reports

For report design, source conversion, XML edits, publication and activation, follow the [service-report workflows](../workflows/service-reports/index.md).

Case, CRM Task and Project Task notifications are queued independently of status maintenance and native assignment email. Configured rules determine the sender, recipients, language and templates. The HTML email body and XML/PDF service report use separate templates. Pending requests can clear before delivery is verified; do not write or clear queue fields to resend or repair service notes.

Employee language can affect labels and technician notes. Customer language can affect reports and email when translations exist. Related records and subsidiary branding affect generated reports. PDF image keys can expire during long generation, leaving images missing. Check delivered messages and generated output; the parent record or a cleared queue does not establish success.

## Files and documents

File sync can create or update both the Task's `customrecord_nx_file` link and its File Cabinet document. It can delete the document when explicitly requested. The file link and document are distinct records. Use the supported operation and established associations for the requested scope.
