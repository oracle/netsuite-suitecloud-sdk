# Scheduling and Schedule Board

Use the [scheduling workflow](../workflows/scheduling.md) for assignment and rescheduling procedures.
For account reads and field interpretation, use [scheduling data](scheduling-data.md).
For recurring series and Project programs, see [recurrence and programs](recurrence-and-programs.md).

## Resources and assignments

### Skills and resource eligibility

`custevent_nx_task_skill` holds optional, multi-select skill requirements for CRM Tasks. `custentity_nx_skill` holds skills for employees, vendors and generic resources. Both fields reference `customrecord_nx_skill`.

Where the account uses these fields, compare skill identities and establish whether the primary worker must hold each required skill or a team can cover it. The Case Add Task UI can filter for all selected skills. Other assignment paths need their own qualification check. Empty skills may reflect missing data or non-adoption; they do not establish universal qualification.

A Field Service Employee is an active native Employee with `custentity_nx_mobile_user` checked and `custentity_nx_region` populated. Eligibility differs for the default Board roster and Mobile user lookup:

- The default Board roster filters active employees with a Region and a viewable subsidiary. It does not require Mobile User.
- The default Mobile user lookup requires an active employee with Mobile User. It does not require Region.

Resource visibility and editability also depend on effective searches, permissions and subsidiary settings. The Board may exclude resource types even when those resources have skill fields. Employee eligibility does not establish the effective calendar, skills, inventory Location or optional labour cost. Inspect these separately for the requested work. See [materials and inventory](materials-and-inventory.md) for technician stock and [financial reporting](financial-reporting.md) for labour cost.

### CRM Task membership and Region

The primary CRM assignee in `assigned`, additional employees in `custevent_nx_task_team`, and native Project Task resource assignments are distinct. A blank primary assignee does not mean the additional team is empty. Inspect both before treating a CRM Task as unassigned. For primary/team cleanup by FSM task validation, see [work relationships](work-management.md#work-relationships).

Board visibility can include primary or team membership and has a separate selection path for Case-linked tasks. A displayed team fallback does not change the primary assignee. A Case is not required for every schedulable CRM Task.

Asset and employee Region fields use `customlist_nx_region`. The default Board maps and filters by Region. An account may use Region for non-geographic groupings, so matching Regions do not ensure short travel. Establish what Region means in the account and whether matching is required or preferred. Subsidiary visibility and edit scope are distinct from any customer policy restricting cross-subsidiary assignments.

## Calendars and availability

### Effective calendar and dated exceptions

With Project Management enabled, the default Board selects the native employee `workcalendar`. Otherwise it selects `custentity_nx_work_calendar` and the FSM calendar. A blank selected calendar does not substitute the other field.

The basic calendar uses one daily start time and one hours-per-day value across its selected weekdays. It does not define a different shift for each day. Native exceptions and FSM calendar non-working dates supply separately dated holidays that do not recur automatically.

Employee-specific `customrecord_nx_employee_non_working_day` spans inclusive whole dates and appears separately as unavailable on the default Board. Effective scheduler event configuration may add or change other availability sources.

### Meaning of unavailable time

Calendar hours show normal availability on the Board; they do not themselves veto assignment. An employee non-working day shown as unavailable on the Board does not itself enforce a server-side assignment prohibition.

Before drawing an availability conclusion, determine which sources the customer maintains and treats as informative, preferred or unavailable. Leave or time-off requests are separate when the account exposes and uses them; their status determines whether they represent an approved absence.

## Project work and allocations

### Project Task assignments

The Project Task Board maps `projecttaskassignment.resource[]` through a separate synchronization path. Do not model those resources as CRM `assigned` or Task Team. When Project Management is enabled, scheduler paths read, create or update Project Tasks and their assignees. This application behavior does not establish a supported connector write path.

Technicians assigned to Project Tasks need Project Resource. Support Rep applies only to its relevant assignment path. These prerequisites are separate from Field Service Employee and Board roster eligibility.

Project Task start and end dates alone do not establish continuous occupied time across a multi-day span. Check the task's scheduled work and resource relationship before treating it as a timed commitment.

### Native Resource Allocations

Native Resource Allocations are a separate project-planning source when enabled and maintained. Direct allocation to a Project Task can establish a resource relationship, but allocation dates, hard or soft types, and levelled hours do not themselves create timed appointments. Do not add allocation hours to scheduled Task hours or count linked Project Task work twice. A capacity review that uses allocations needs an account-supported calculation.

## Dates and notifications

### Planned and actual time

Native CRM Task Start Date (`startdate`), Due Date (`duedate`), Reserve Time (`timedevent`), Start Time and End Time differ from the FSM local scheduled components (`custevent_nx_start_date`, `_start_time`, `_end_date`, `_end_time`, `_time_zone`). Mobile separately maps actual Start, On Site, Off Site and End to `custevent_nx_task_start`, `_onsite`, `_offsite` and `_end`.

Enabling Reserve Time requires Start Time and End Time. FSM Tasks should reserve time and have a scheduled start/end interval. Default Task and timezone synchronization sets `timedevent`, but historical Tasks and other write routes may still lack a complete interval. Scheduled duration is the start-to-end interval in the effective timezone. It is distinct from Due Date, travel, actual work, Time Bills and billable hours. Flag missing intervals rather than inventing times.

### Synchronization and timezone

Populated FSM dates can drive native-date synchronization, which may overwrite a generic native-only edit. Keep `duedate` on or after `startdate`; equality is allowed. On create, update or patch, the default Board CRM Task save sets native `duedate` to the scheduled end date. This may replace an existing valid Due Date.

Inspect both dates when proposing a change and verify their persisted values. Do not assume generic APIs repair an invalid date. Use a scheduler operation for conversions and sourcing only when current capabilities show it is available. Do not emulate that operation by clearing custom fields.

A missing timezone can derive from the Case, Project, Asset, subsidiary, then user preference. Confirm the effective timezone and daylight-saving interpretation. CRM Task validation can require the start time to precede the end time.

The Case's FSM Time Zone gives context to its start time. Case start-field synchronization requires Case Type and Time Zone. Equivalent end-field conversion is not assured.

Project Time Zone can source from its Asset, with subsidiary or preference fallback where applicable. A blank Project Time Zone is populated from an available source before create or edit submission. Changing the Asset or subsidiary on the Project form reevaluates the timezone. An existing value is not necessarily overwritten on every save. Check the record-specific conversion and effective account configuration before interpreting dates.

### Booking and Board edit conditions

Booking confirmation (`custevent_nx_task_booking_confirmed`) is independent of Task type and status. On the default Board, dragging a confirmed CRM Task does not change its scheduled date or time. Resource reassignment is handled separately when otherwise eligible. Treat a confirmed interval as a commitment. This Board behavior is not a universal API or record write lock. A schedule change does not imply actual work, booking confirmation or completion.

The default Board marks CRM Tasks editable when native status is `NOTSTART` and the related Case, Project or company is in the user's subsidiary edit scope where subsidiaries are enabled. Tasks with no such subsidiary can also be editable.

Project Tasks have separate default edit conditions: status `NOTSTART`, native Constraint Type `FIXEDSTART`, Project `allowallresourcesfortasks = T`, and Project subsidiary within the user's edit scope when enabled or unrestricted. Board edit mode must also permit dragging either Task type. These conditions apply to the Board UI; they are not universal native or API restrictions.

Fixed Start can include an explicit Start Time, ignores predecessor relationships, and derives the end date from estimated work and resource availability. Changing Constraint Type alters native Project scheduling behavior and is not a mechanical way to unlock movement. Verify the account's effective configuration and permissions before applying these defaults.

### Priority and notifications

Native CRM Task status values are Not Started, In Progress and Completed; native Priority values are High, Medium and Low. Priority use varies by account. Do not infer a universal rank between Task Priority, FSM Case Type and FSM Project Type; these are distinct signals whose scheduling meaning depends on the account.

Assignment may send native email. Task type or status changes can independently queue FSM notifications. These effects are separate, and FSM queue deduplication does not make repeated edits safe.

## Schedule Board interaction

### View and access

The Board combines a resource list, calendar, optional map and filters. Resource and assigned/unassigned filters affect visibility. Scrolling can load additional dates and resources.

Colors are configurable. Colors and icons can represent priority, completion, errors or unsaved edits, so colors alone do not establish status or persistence. Map resource coordinates are last-known locations. Task coordinates commonly come from the Asset.

Board viewing and drag/drop editing have different licensing and role requirements. Field Service Scheduler permission governs editing; subsidiary restrictions govern visible work.

### Selection, staging and save

Selecting work can also select linked Tasks, commonly on the same Case. Keyboard modifiers affect selection and dragging:

- Shift supports independent selection.
- Ordinary dragging moves the assignment or date.
- Alt/Option allows clock-time changes.
- Ctrl/Command adds team members.

Changes remain staged until Save. Cancel discards staged changes only. A red border can mean unsaved work or a save failure, so inspect the error indicator and persisted record.

The Board remembers its selected timezone and saves changes in that view timezone. Task context menus show the Task timezone. Dragging a recurring Task changes only that occurrence; see [recurrence and programs](recurrence-and-programs.md) before changing a series.
