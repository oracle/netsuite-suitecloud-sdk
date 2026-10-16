# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Project Indicator semantics — sanitized supplied specification
V5-SANITIZED-1. This technical derivative preserves the supplied formulas, thresholds,
messages and unresolved boundaries, but excludes internal issue/wiki links, ticket
identifiers and collaboration metadata. It is not an assertion that every draft
definition is a verified public API or current account behavior.
Use `indicator-definition-notes.md` and native results; do not silently repair ambiguities.

|   |
| - |
|   |

|   |
| - |

|   |
| - |

- Planned vs. Actual Time Overrun




|   |
| - |

Identifies
&#x20;planned work entries where the actual time logged by resources exceeds&#x20;
the planned time assignment for the same day, resource and task,&#x20;
signaling a potential time or effort overrun.

- Planned work feature required
- Parent/summary tasks are excluded from the scope of this indicator

|   |
| - |

- Green: No tasks where actual time exceeds planned time
- Yellow: At least one task where actual time exceeds planned time by 1% - 10%
- Red: Actual time exceeds planned time by more than 10% for one or more tasks. 

|   |
| - |

Green

- 'All tasks are within the planned time.'




Yellow

- 'Actual time exceeds planned time by 1% - 10% for one or more tasks. '

Red

- 'Actual time exceeds planned time by more than 10% for one or more tasks. '

|  Green |
| ------ |

- No

Yellow/Red

- Yes

|   |
| - |

Green

- 'No action necessary.'

Yellow/Red

- 'Click Planned time overruns and review overdue tasks, identify blockers, and update dates, staffing, or scope to recover the schedule.'

| Planned Time Entries (joined with actual time entries | Include  only time entries where actual time logged by a resource, on a specific  day and task, exceeds the planned time for that entry. | <br>Columns: |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------ |

- Task Name
- Task ID
- Resource/Employee
- Date
- Planned Time (hrs)
- Actual Time (hrs)
- % overrun (calculated: (Actual - Planned) / Planned × 100)
- Task status
- Parent task

| <br> |
| ---- |
|      |

|   |
| - |

Overdue Tasks




|   |
| - |

Alerts
&#x20;when one or more project tasks remain incomplete past their end date,&#x20;
with additional weight placed on tasks that are overdue by a greater&#x20;
proportion of their planned duration (start date - end date) to help&#x20;
prioritize corrective actions.

- Parent/summary tasks are excluded from the scope of this indicator

|   |
| - |

For each overdue task calculate Overdue % as:

(days overdue / planned task duration in days ) \* 100

Assign points based on how significant the tardiness is in context:

- 1 point: Overdue ≤ 10% of planned duration
- 2 points: Overdue >10% and ≤25% of planned duration
- 3 points: Overdue >25% of planned duration

Total the points across all overdue tasks to get overall "Overdue risk score."

Apply traffic light thresholds to the total score:

- Green: total score < 3
- Yellow: score 3–5
- Red: score > 5

|   |
| - |

Green

- 'No overdue tasks.'




Yellow

- 'Some tasks are overdue and may impact the schedule.'

Red

- 'Many tasks are significantly overdue.'

|   |
| - |

 Green

- No

Yellow/Red

- Yes

|   |
| - |

Green

- 'No action necessary.'

Yellow/Red

- 'Click Overdue Tasks to open the overdue tasks list, identify blockers, and take corrective action.'

|   |
| - |

Project Task based dataset

Include Project tasks where status ≠ Completed AND Finish No Later Than < today (if FNLT missing, than replace for End Date)

- Task Name
- Task ID
- Assigned Resources/Employees
- Start Date
- End Date
- Finish No Later Than
- Status
- Days overdue (today – End Date)
- Duration (End date - Start date)
- Parent task

|   |
| - |

Task still in progress, but due date was in the past (1 day, 1 week, ..)

Use the proportion of days overdue relative to the task’s original planned duration

A
&#x20;1-day delay on a 2-day task is far more significant (that’s 50%&#x20;
overdue!), whereas the same on a 60-day task is barely noticeable&#x20;
(\~1.7%). Weighting overdue tasks relative to their planned duration&#x20;
gives a much more accurate risk assessment.

|   |
| - |

|   |
| - |

Project Resource Coverage for Remaining Work




|   |
| - |

Aka staffing availability.

Evaluates
&#x20;whether the currently assigned resources have enough available work&#x20;
hours - considering all project assignments and work calendars- to&#x20;
complete the remaining planned work on a task before its end date.

- Parent/summary tasks are excluded from the scope of this indicator
- Task  Time Remaining is evaluated only for tasks with an effective due date  on or after today (i.e., tasks that still have time left). Tasks already  past due are excluded from evaluation.
- This  indicator answers: do we have enough capacity to complete the remaining  planned work before the task due date? It does not evaluate tasks whose  due date is already in the past; those are covered by Tasks Overdue and  Time Not Tracked indicators.

* Planned work feature required

|   |
| - |

- Green: Available staff time ≥ hours remaining
- Yellow: Available staff time is within 90–99% of hours remaining
- Red: Available staff time is less than 90% of hours remaining

*(see examples in Notes)*

|   |
| - |

Green

- 'Assigned resources have enough availability to finish remaining work on time.'




Yellow

- 'Resource availability is tight for one or more tasks.'

Red

- 'Resource availability is insufficient for one or more tasks.'

|   |
| - |

 Green

- No

Yellow/Red

- Yes

|   |
| - |

Green

- 'No action necessary.'

Yellow/Red

- 'Click Project Tasks at risk to review tasks and address the capacity gap: reassign work, adjust assignments, bring in additional resources, or extend task dates or work plan.'

|   |
| - |

Project Task based dataset.

Include
&#x20;only tasks where any assigned resource doesn't have enough available&#x20;
working hours to meet their planned hours before task end date/FNLT.

- Task Name
- Task ID
- Assigned Resource/Employee
- Task Start Date
- Task End Date
- Task Finish No Later Than
- Planned Hours for Resource
- Resource assignment End Date *(if possible?)*
- Available Hours for Resource (from now to end date, minus all other assignments and approved PTO)
- Missing hours (Planned - Available)
- Task status
- Parent task

|   |
| - |

Evaluates
&#x20;if the available time before task due date can cover the hours&#x20;
remaining to finish the task for each resource. The available time in&#x20;
this case is meant as

- Resource's available time from materialized work calendars) minus Planned Time on other Project Tasks and other Projects' Tasks
  - Definition limitation: approved time-off availability and prior deduction require runtime validation.
- the  system should check each assigned resource individually against real  available capacity, factoring in all assignments  (planned time entries  across all active projects)
- this  indicator ensures that task plans are not only set up correctly but are  also feasible given the real-world assignments of project resources.

|   |
| - |

* Calendar evidence can have a finite materialized range; validate coverage through the required window.


|   |
| - |

|   |
| - |

Project Margin Indicator (Cost vs. Revenue)




|   |
| - |

Calculates
&#x20;and monitors the project’s gross margin percentage by comparing total&#x20;
recognized project revenue to total project costs, highlighting projects
&#x20;that are at risk of low or negative profitability.

- Features required:
  - Job Costing and Project Budgeting feature required

OR

-

* Advanced Project Profitability

|   |
| - |

- Green - Margin >10%
- Yellow - Margin between 0–10%
- Red - Margin <0% (unprofitable)

|   |
| - |

Green

- 'Project margin is healthy.'




Yellow

- 'Project margin is low and may require attention.'

Red

- 'Project margin is negative - project is currently unprofitable.'

|   |
| - |

 Green

- No

Yellow/Red

- Yes

|   |
| - |

Green-

- 'No action necessary.'

Yellow/Red

'Click Project Profitability Report to open the profitability breakdown. identify cost overruns, billing gaps or under-recovery, and take corrective actions.'

|   |
| - |

- link leads to profitability report

|   |
| - |

Compares project gross margin percentage, i.e., *(Actual Revenue – Actual Cost) / Actual Revenue* to highlight unprofitable work

- IF "empty" state (P&L tab has 0 revenue and 0 cost) 

  -
  *
  - THEN show indicator as green

* IF zero revenue but some cost leads to zero division error in the formula *(Actual Revenue – Actual Cost) / Actual Revenue*

  -
  *
  - THEN avoid division and show as red directly

|   |
| - |

|   |
| - |

CBB,

- Actual charges have not been invoiced




|   |
| - |

Flags
&#x20;project's actual charges that have been approved for billing but remain
&#x20;unbilled beyond a defined time threshold, helping ensure timely&#x20;
invoicing and supporting healthy project cash flow.

|   |
| - |

- Green -  no unbilled charges older than 14 days
- Yellow - at least 1 unbilled charge older than 14 days
- Red - at least 1 unbilled charge older than 30 days

|   |
| - |

Green

- 'All charges billed correctly.'



Yellow

- 'Some approved charges are overdue for invoicing. '

Red

- 'Approved charges are significantly overdue for invoicing.'

|   |
| - |

 Green

- No

Yellow/Red

- Yes

|   |
| - |

Green

- 'No action necessary.'

Yellow/Red

- 'Click Unbilled Charges to  review unbilled approved charges. Make sure billable time and expenses  are invoiced promptly and resolve any billing holds to protect cash  flow.'

|   |
| - |

../app/accounting/transactions/billing/chargemanager.nl

|   |
| - |
