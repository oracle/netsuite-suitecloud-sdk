# Scheduling data and evidence

Contents: [choose the evidence needed](#choose-the-evidence-needed); [task and resource fields](#task-and-resource-fields); [read scoped populations](#read-scoped-populations); [calendars, holidays, and absences](#calendars-holidays-and-absences); [scheduled and continuing work](#scheduled-and-continuing-work); [interpret incomplete representations](#interpret-incomplete-representations).

Use [scheduling](scheduling.md) for product behavior and the [scheduling workflow](../workflows/scheduling.md) for the action. Field names below are discovery leads; verify them against current metadata for the selected API before relying on them.

## Choose the evidence needed

### Match the question to the evidence

Match reads to the question. A recorded-skill question needs complete relevant skill memberships, but does not need a dated work population or availability audit. A work list needs a defined business scope, date basis and complete population; its detail gaps remain separate from membership. A pickup, replacement or capacity question also needs the applicable candidate, calendar, absence and commitment evidence. For dated scheduling, establish the effective IANA timezone.

Use the recipes to [review work](../workflows/scheduling.md#review-work-to-schedule), [find people with relevant skills](../workflows/scheduling.md#find-people-with-relevant-skills), [check availability and fit](../workflows/scheduling.md#check-availability-and-fit), [build or revise a proposed schedule](../workflows/scheduling.md#build-or-revise-a-proposed-schedule), or [apply an authorized change](../workflows/scheduling.md#apply-an-authorized-scheduling-change). The [fixed-appointment](../workflows/scheduling-patterns.md#cover-fixed-appointments), [primary-replacement](../workflows/scheduling-patterns.md#replace-a-primary-resource) and [geographic-grouping](../workflows/scheduling-patterns.md#group-work-geographically) patterns apply only when selected.

## Task and resource fields

### Task identity and field leads

Verify Task type, FSM identity, status and assignees before interpreting a schedule. Use current metadata for the selected API.

| Concept | Discovery leads | Interpretation |
| --- | --- | --- |
| FSM CRM Task | `task`, `custevent_nx_task_type`, `custevent_nx_task_number` | `projecttask` has a separate assignment and scheduling model. |
| Native status | `status`; observed REST codes `NOTSTART`, `PROGRESS`, `COMPLETE` | Verify actual values; do not invent a cancelled code. |
| Primary and team | `assigned`, `custevent_nx_task_team` | Expand both memberships; a blank primary does not empty the team. For primary/team cleanup, see [work relationships](work-management.md#work-relationships). |
| Required and recorded skills | Task `custevent_nx_task_skill`; employee `custentity_nx_skill`; both refer to `customrecord_nx_skill` | Establish complete ID collections; recorded membership alone does not establish current qualification or availability. |
| Employee eligibility | Inactive flag, `custentity_nx_mobile_user`, `custentity_nx_region` | Board roster, Mobile lookup and assignment prerequisites differ; see [resources and assignments](scheduling.md#resources-and-assignments). |
| Task Region | `custevent_nx_task_asset` → `customrecord_nx_asset.custrecord_nx_asset_region` | Verify the linked Asset, join, IDs, Region and permissions. Do not infer Region from a search scope or label. |
| FSM appointment | `custevent_nx_start_date`, `custevent_nx_start_time`, `custevent_nx_end_date`, `custevent_nx_end_time` | Combine local dates and clock times in the effective IANA timezone; preserve the planned interval. |
| FSM timezone | `custevent_nx_time_zone` → `customrecord_nx_time_zone.custrecord_nx_time_zone_olson` | Verify the relation and Olson/IANA value; a displayed GMT offset cannot resolve daylight-saving changes. |
| Other protected values | `custevent_nx_task_booking_confirmed`, native `duedate`, status, team | Record observed checked, unchecked or unknown state and preserve values outside the requested change. |

Native CRM Task `startdate`, `duedate`, `timedevent` and clock fields are distinct from FSM scheduled components. Standard Task `enddate` may combine Due Date and end time; it does not prove a multi-day appointment. Actual Start, On Site, Off Site and End (`custevent_nx_task_start`, `_onsite`, `_offsite`, `_end`) are lifecycle timestamps, not planned endpoints. Compare native and FSM dates when changing a schedule: FSM synchronization may overwrite a native-only edit, and Board Save may replace Due Date with the scheduled end date. A generic record write does not reproduce Board conversion or sourcing. Report inconsistencies without inventing times or repairing unrelated fields.

### Collection representations

Collections need explicit completeness. Record reads have returned `{}` for task teams, task skills and employee skills when queries showed populated ID collections. `{}` is not `[]`. Expand the collection or use a verified complete query; a comma-separated query value is a full ID set only if current query semantics establish that. Do not split display names as IDs. Query metadata may expose `MAP_task_custevent_nx_task_skill` or `MAP_task_custevent_nx_task_team` with `mapone`/`maptwo`; these are discovery leads. Zero visible rows can reflect query or permission limits.

### Clock and map representations

Time-only SuiteQL values may appear as date strings while record GET returns `HH:mm`. A date-shaped time-only value is not midnight. Obtain a reliable clock value and resolve daylight-saving ambiguity, nonexistent local times and reversed intervals before asserting an appointment or duration. Last-known employee map coordinates are not a planning origin.

## Read scoped populations

### Existing saved searches

Prefer a suitable existing saved search before ad hoc SuiteQL metadata discovery for recurring shapes such as unassigned Not Started tasks in a date range, skill rosters or region-mapped assets. If no suitable search is verified, use another supported bounded source.

Do not execute report tools or create searches solely to fill a missing scheduling read route. An explicit request to run an existing report follows the [reporting workflow](../workflows/work-records.md#run-an-existing-search-or-report). Supplied report evidence can still be interpreted under the same scope and completeness requirements.

### Population membership and record detail

A complete verified all-region source can serve a broad request without forcing a Region choice.

Preserve full team and skill expansion, record identities and source links. Do not trim candidates or surrounding work to an arbitrary count or use a preference to define the population.

### Dated and undated work

For dated work lists, use the requested date basis. Planned FSM schedule overlap includes appointments crossing the window; explicit Due Date or native Start Date questions use that field. Keep undated backlog distinct: an unassigned Not Started FSM CRM Task whose planned start and end are both verified absent is undated. One missing, unread or contradictory endpoint is unresolved. Deduplicate record counts without dropping IDs. For selected-day or multi-day scheduling, acquire the complete bounded task and candidate cohort for each relevant day, then collect the candidate and retained-team facts needed by the selected recipe.

## Calendars, holidays, and absences

### Feature branch and employee links

Verify Project Management (`ADVANCEDJOBS`) enabled or disabled for the current account through an independently supported, authoritative read-only MCP capability. There is no established SuiteQL or REST Record feature-status read here; do not invent a feature-status tool, arguments or implementation. A readable calendar route, populated employee field or calendar record does not establish feature state. If status is unavailable, denied or uninterpretable, mark calendar applicability unknown and continue independent absence and commitment reads. An explicit disabled result establishes the FSM calendar branch.

When enabled, the Board selects the employee's native `workcalendar`; when disabled, it selects `custentity_nx_work_calendar` → `customrecord_nx_work_calendar`. Verify the selected employee link independently of feature state. A blank or unread selected link does not fall back to the other calendar. Reconcile any cohort read against every candidate and retained team member; an individual read resolves only that member.

### Calendar evidence layers

| Layer | Read facts | Coverage |
| --- | --- | --- |
| Weekly pattern, FSM branch | `customrecord_nx_work_calendar`: `custrecord_nx_work_calendar_start`, `custrecord_nx_work_calendar_hours`, weekday booleans | Each linked calendar and relevant local weekdays. |
| Weekly pattern, native branch | SuiteQL `workCalendar`: `starthour`, `workhoursperday`, weekday flags such as `monday` | Each verified native calendar link and relevant local weekdays. |
| Dated FSM exceptions | `customrecord_nx_non_working_day`, `custrecord_nx_work_calendar`, `custrecord_nx_work_calendar_date`; verified active records only | Selected calendar IDs and local dates. |
| Dated native holidays | `workCalendarHoliday`: `workCalendar`, `exceptionDate`, `description` | Selected native calendar IDs and local dates. |
| Employee non-working periods | `customrecord_nx_employee_non_working_day`: `custrecord_nx_emp_avail_emp`, `custrecord_nx_emp_avail_startdate`, `custrecord_nx_emp_avail_enddate`; verified active records only | Each employee across overlapping inclusive whole local dates. |

### Active status of custom records

For custom holidays and employee non-working records, establish active status from verified record values or a verified query predicate selecting `isinactive = 'F'`. A verified predicate can establish that status even when the returned columns omit the flag. Exclude verified inactive records. Unknown active status leaves applicability unresolved for the affected resource and period; it establishes neither a confirmed conflict nor a clear interval. Keep independently verified conflicts visible. Do not assume native holiday records expose the same inactive field.

### Native calendar query exception

A prior successful calendar query is historical evidence, not a current-schema exception. Verify feature state, the employee's calendar relationship and current query metadata for the required calendar and holiday fields. Respect current tool requirements. Do not use SELECT-star probes or guess fields when essential schema is missing. A REST-only metadata failure does not establish that SuiteQL is denied; inspect the current query interface independently without evading an underlying data denial. If the required query schema remains unavailable, mark that calendar layer unknown and continue independent supported availability checks. Use a separately supported record/calendar capability only when its returned evidence satisfies the same scope and semantics. Keep calendar IDs and dates bounded, deduplicate calendars and complete supported pages. No new custom integration is provided.

### Coverage and meaning of clear layers

Keep weekly hours, dated holidays and employee absences as distinct evidence layers. A verified weekly pattern cannot establish the holiday layer. A complete empty result can establish a clear layer for its actual scope; missing or incomplete coverage cannot. Employee non-working periods are whole-date spans, not partial-day leave. Inspect other account-maintained availability sources and distinguish an approved blocking absence from an unapproved leave request. Calendar hours and Board unavailable displays alone do not enforce a server-side assignment prohibition.

## Scheduled and continuing work

### Scheduled reservations and participation

Read scheduled primary and team commitments for every participating resource, expanding all members and deduplicating each resource's involvement by record type and ID. Include intervals that begin before or end after the requested window. Include relevant Project Task assignments when enabled and applicable. A Project Task date range alone is not continuous occupied time; verify the task's timed work or supported daily planned-time facts. An allocation to a Project Task can establish a resource relationship but remains separate from its scheduled commitment.

### Continuing occupancy and release

Read potentially continuing work as well as scheduled overlaps, including earlier work whose planned end elapsed. A date-filtered overlap search alone cannot establish continuing-work coverage. Resolve the account's actual-state mapping, status meaning and relevant current-state evidence. Historical In Progress alone proves neither current activity nor release. Do not invent a history cutoff or completion time. Keep the planned reservation and assignment membership even when verified actual evidence shows early release.

| Finding | Meaning |
| --- | --- |
| Scheduled | The verified reservation remains the scheduling basis; progress may need release evidence. |
| Bounded | A verified effective interval also occupies time; retain the original reservation. |
| Ongoing | Current activity has no supported release bound; later dependent appointments remain uncertain. |
| Released | Verified release by an instant can clear later uncertainty without erasing the reservation or proving exact completion time. |
| Unknown | Progress or release is unresolved for the affected resource. |

Keep overlap and continuing-work coverage separate unless a verified predicate and all pages cover both. Unknown resource membership can affect every potentially involved candidate. Do not filter out uncertain commitments based on unverified timestamps or IDs.

### Resource Allocations

Native Resource Allocations require independently verified feature applicability and account use. Their hard/soft types, dates and levelled hours are not timed appointment blocks, and linked Project Task work must not be counted twice. A requested allocation capacity calculation needs a supported method and complete applicable evidence; otherwise leave that calculation unresolved while assessing independent sources.

## Interpret incomplete representations

### Interval and daily claims

Base each claim on the evidence applicable to that claim, resource and interval. For an interval availability check, cover the interval, relevant surrounding commitments and continuing-work evidence. Full local-day coverage is required for a daily-capacity claim or when applying an adopted daily limit; a short appointment does not hide assigned work elsewhere that day. Assess daily capacity against verified working hours without inventing a numerical cap. Calendar holidays or whole-day absences covering the interval remain separate from weekly hours. A complete overlapping conflict can be reported even if another layer is incomplete. An incomplete layer cannot be called clear.

### Known conflicts and unknown availability

When one source is unsupported, denied or incomplete, continue independently supported scoped reads for absences, commitments or other candidates. Preserve the precise gap and its affected combinations. A conditional suggestion may describe what would be possible if unresolved evidence clears, but do not call someone verified available or imply an account write from partial evidence. Unknown participation can affect all potentially involved candidates; a gap for one resource does not erase independently supported outcomes for others. A known conflict remains meaningful even when another layer is unknown. Distinguish checked and clear, checked and conflicting, incomplete or blocked, and unassessed sources when explaining a consequential gap. Lack of a verified proposal does not prove real-world infeasibility or maximum capacity.
