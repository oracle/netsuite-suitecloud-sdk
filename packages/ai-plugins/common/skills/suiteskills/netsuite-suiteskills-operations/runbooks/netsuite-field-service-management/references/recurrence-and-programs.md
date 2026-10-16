# Recurring work and Project programs

Recurring series and Project programs can affect work beyond one scheduled task. Use the [scheduling workflow](../workflows/scheduling.md) for assignment and rescheduling.

## Recurring series

`custevent_nx_recurrence` identifies a recurring series. Configuration controls its enabled state, generation horizon and copied fields. Common copied fields include company, priority, assignee, customer, type, team, asset, timezone and scheduled times. Required skills must be explicitly included in the configured fields.

Editing one occurrence can preserve changed fields as exemptions. Propagation updates only eligible unstarted instances and respects configured fields and exemptions. Deleted indexes can prevent recreation.

Changing recurrence parameters can delete occurrences outside the range. Changing a nonprimary instance can split/reindex the series. Processing is asynchronous, with task instances preceding case instances.

Dragging a recurring task on the Schedule Board changes only that occurrence; its future pattern stays unchanged. Establish whether the request concerns one occurrence or the series before choosing an operation. Do not manipulate recurrence JSON, exemptions or processing flags to imitate a missing series action. Recurring records use preferred forms. Copying a recurring task can interfere with series behavior.

## Project programs

Programs are separate from recurrence. Project type, start/date bounds, assets and configured project rules generate cases. Matching project/case types and case rules can generate CRM tasks. Cases alone do not appear as schedulable tasks.

A Project program needs a start date, type, and either an end date or a rolling horizon. `custentity_nx_program_create_until` sets a horizon in days from today in the Project timezone. `custentity_nx_start_date` can change the pattern anchor while the native Project start remains a generation bound.

Create Until overrides the create option. Shift applies when create is false, and a total limit caps generation.

Existing cases match chronologically by type, without requiring an exact schedule-date match. Manually added cases of the same type can explain apparent gaps. Displayed planned rows may not yet be persisted records.

Program updates can create or delete children. They remove dependent tasks before cases. Configured inactive Project states can remove unstarted cases and their tasks. Manual Case closure may not advance a next-case-only program, while FSM closure can generate the next program service when configured.

Inspect rules, generation bounds, current children and pending changes before changing a program. Large programs can encounter generation limits. More than 1,000 cases under one Project can risk duplicate generation. Do not extend a single-task request into a program rebuild.
