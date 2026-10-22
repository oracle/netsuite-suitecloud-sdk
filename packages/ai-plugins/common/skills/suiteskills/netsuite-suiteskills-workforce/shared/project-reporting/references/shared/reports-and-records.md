# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Reports and essential record families
All report names are discovery candidates; all record/field names are semantic hints pending channel-specific runtime validation. No hard-coded report IDs are included.

| Need | Candidate report / dataset | Underlying alternatives and critical grain |
|---|---|---|
| Scope, status, baseline, milestones | Project/work-plan or task export | Project `job`, `projecttask`, assignment/dependency data; unique project/leaf task |
| Time and approvals | Time by Employee/Customer Detail; Time Entry Exception | Time entry/timebill, timesheet, approval state; entry/resource/date/project |
| Ordinary utilization/capacity | Planned Utilization report ONLY after validating plannedwork lineage; compatible planned-time export | plannedwork date/resource decomposition, task assignment, calendars and approved leave; no allocation demand |
| Remaining-work gap | Project Task Time Remaining | `projecttasktimeremainingrisk`; assignment/task/window, deduplicated missinghours |
| Actual margin | Project Profitability; Project Profitability Detail/by Month | Compatible actual revenue/cost lines with validated project attribution, accounting basis and period |
| Cost/billing budgets | Project Cost/Billing Budget vs Actual and task detail | Project Budget/WBS approved baseline and actual lines; no forecast substitution |
| Billing/unbilled work | Project Billings; Unbilled Time/Cost by Customer | Actual eligible Charge, billing schedule/rule, sales-order/invoice lines and links |
| Receivables and cash | A/R Aging Detail; A/R Payment History by Invoice/Payment | Invoice, Customer Payment, Credit Memo, Customer Deposit, Deposit Application and application lines |
| Procurement/payables | Open Purchase Orders; A/P Aging Detail; purchase/bill detail | Purchase Order, Item Receipt, Vendor Bill, Expense Report project/task lines |
| Revenue reconciliation | Billing and Revenue Summary; deferred-revenue rollforward/detail | Revenue Arrangement, Element, Recognition Plan/Event and actual GL recognition; plan is not actual |
| Expense compliance | Policy-evaluation result or expense-line export | Expense Report Policy and Expense Report lines, complete employee/day or report scope |
| Scope/quality/acceptance/change | Validated linked project records or authorized project artifacts | Recorded criteria, decisions, approvals, defects, acceptance and baseline history; unavailable if not exposed |

## Essential field semantics to validate
Project: identity/name, parent customer, manager, lifecycle/inactive, subsidiary/currency, baseline/current/actual dates, approved budgets and project billing/revenue model.
Task: project, parent/summary/milestone markers, status, start/end/finish-no-later-than, baseline dates/work, actual/remaining work, constraints and predecessor links.
Assignment: stable row key, task, resource, role, start/end/window, planned/remaining hours; distinguish task assignee listings from assignment-grain facts.
Resource: identifier, recorded role fit, inactive/eligible markers, workcalendar, authorized rate/cost basis; leave intervals require approved state.
Time: project/task, employee, date, hours, approval, billable/productive/utilized flags, billing item/rate where authorized.
Financial lines: stable transaction/line key, project/task link, created-from/applied-to links, currency/rate/book, date/posting period, amount/balance, actual/forecast and posted/approval/hold state.
Policy: active/effective dates, expense category and optional scope filters, limit type/maximum/currency basis, line memo requirement, action/engine outcome.
Indicator: see the dedicated first-stage map; row ID differs from type ID.

Use field-reference-index.md for semantic cautions and current authorized metadata for fields, enums, join paths and writable capability discovery. Historical field snapshots are not installed runtime dependencies. A missing descriptor is not proof that a source or product feature is absent.

Native coverage results precede their debug inputs. Allocation/time diagnostics in supplied backend maps remain native-risk-only; financial actual-time review is separate.
