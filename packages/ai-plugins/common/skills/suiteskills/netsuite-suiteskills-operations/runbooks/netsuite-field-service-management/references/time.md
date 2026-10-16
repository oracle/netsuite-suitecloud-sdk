# Service time and Time Bills

Time behavior depends on installed Time Tracking features, task configuration and the operation used. Scheduled dates, actual commencement and completion, and on/off-site timestamps each have distinct meanings. The completed date follows the task timezone. See [scheduling](scheduling.md) for scheduled dates and [Mobile](mobile.md) for technician actions.

## Activity and task completion

Activity sync can create, read, update and delete `customrecord_nx_activity` records through supported operations. These activity records are separate from generated Time Bills.

Track Service Time applies to CRM tasks and tracks one active task. It does not separate breaks and travel into their own categories. Confirmed activity times can differ from button-click timestamps.

Mobile Start can move a task to In Progress. Actual completion may immediately complete an untracked CRM task, while a time-tracked task can remain In Progress until generated time is processed. Reopening a task while actual End remains set can cause it to complete again. Project tasks use a separate completion path. Setting a status, timestamp or outcome through a generic update does not reproduce Mobile completion.

FSM service hours are distinct from SuitePeople WFM payroll rows.

## Generated Time Bills

With `time.timetracking` enabled and a task-type service item configured, activity boundaries can generate Time Bills (`timebill`) for the primary employee and additional team. Generation requires positive duration and uses activity identity to avoid recreating existing rows.

Pending activity processing clears before status maintenance completes the task. Failed time processing can defer a task while other tasks continue. A saved task or activity does not prove that Time Bill generation and task completion have finished.

## Manual time and billability

A manual Time Bill's employee, customer or Project, service item, task reference, date and duration must match the work. Time-of-day fields do not represent duration. Check the current operation's accepted format and the persisted entry. See [Mobile](mobile.md) for technician capture, entry limits, post-completion edits and offline persistence.

Billing settings and pricing features can determine billability and rate. Check Time status, approval and invoice linkage separately; a search status code does not establish all three. A Time Bill can be saved before Case totals update. See [billing](billing.md) for unbilled amounts and invoice application, and [financial reporting](financial-reporting.md) for approval, labour cost posting and GL attribution.
