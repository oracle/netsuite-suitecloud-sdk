# Work records, descriptive updates and reporting

Use the FSM references in each procedure to interpret work and its downstream effects.

## Find and summarize work

Resolve the requested Case, Project, customer or resource, along with the time window and timezone. Clarify “jobs” only when context does not establish whether it means Cases, CRM Tasks or Projects.

Read the requested population with selected identity, status, priority, assignment, Case and customer, and schedule fields. Use the [data model](../references/data-model.md) to identify FSM work. Use [scheduling](../references/scheduling.md) to distinguish Field Service Employees from the Board roster and primary assignees from the additional team.

Resolve Case status references from the account using [work management](../references/work-management.md). Compare scheduled and actual work using [time](../references/time.md).

Count distinct work records and fetch details for relevant exceptions. Return the scope, count, exceptions, recognizable record labels and links, time window and visibility limits. Include raw internal identifiers only when necessary and safe.

For operational monitoring, review the requested mix of open, unassigned or overdue work, submitted outcomes, recorded time and Consumables, closed Cases with unbilled amounts, and pending processing errors. Existing Field Service saved searches and configured dashboards can help. Their visibility depends on role, subsidiary and dashboard configuration.

## Update Case or Task details

Resolve one record, the requested field and factual text, and whether to append or replace it. Candidate descriptive fields include the Task title or message, Case title and FSM service details (`custevent_nx_case_details`). Incoming customer messages and outgoing replies are not substitutes for internal service details.

Read the current text and the relationships needed to confirm identity. Update only the requested descriptive field and verify the result. If the text already matches the requested result, leave it unchanged. Do not append the same note twice.

This procedure excludes status, assignment, customer, Asset, company, type, booking, actual time, recurrence, program, notification and billing controls because they have separate FSM effects. A validation failure does not authorize changing another field or enabling a feature. Return verified changes, records that already matched, and specific blockers.

## Review Project and Case work

Resolve the Project (`job`), customer and requested review criterion. Use the [data model](../references/data-model.md) to identify FSM Projects and Cases. Do not assume every record follows the full service hierarchy.

Read related Cases and CRM Tasks. Inspect native Project Tasks separately when enabled and accessible. For scripted creation and queued links, see [work management](../references/work-management.md) and [assets](../references/assets.md).

Summarize open work, outcomes and specific missing or blocked items. Before identifying follow-up, check [recurrence and programs](../references/recurrence-and-programs.md) for effects on program children and [work management](../references/work-management.md) for Case closure effects. Keep proposed follow-up within the requested output.

## Run an existing search or report

Use this procedure for an existing analytical saved search or report. For a technician-facing service-report template, HTML preview, XML edit or publication, use the [service-report workflow](service-reports/index.md).

Resolve the named existing saved search or report. Field Service is a useful search prefix. Establish the period, subsidiary and required filters before interpreting results. If completeness cannot be established, report partial results.

Distinguish summary-line output from transaction detail; do not call summary output an itemized ledger. For Case or Asset profitability, use [financial reporting context](../references/financial-reporting.md) to distinguish recorded time from posted labour and transaction body references from line attribution.

Return the period, filters, scope and limitations. Running an existing report does not include editing searches or dashboards or sending results.
