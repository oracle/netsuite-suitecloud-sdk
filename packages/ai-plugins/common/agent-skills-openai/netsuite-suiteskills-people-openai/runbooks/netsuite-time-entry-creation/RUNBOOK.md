---
name: netsuite-time-entry-creation
description: "Draft and create new NetSuite Actual Time entries from a direct request or permitted work activity, with a chat table review and a separate Save decision. Do not use for timesheet submission or approval."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.0"
  source-version: "unknown"
  integration-version: "0.7.5"
  runbook-id: RB-PPL-010
  category: people
  access-mode: operation_dependent
---

# Time Entry Creation

Apply [plugin context](../../SKILL.md) and the pinned shared baseline, retrieval, action and output contracts. This business procedure retains its own scope.



Use one selected NetSuite connection throughout. This skill creates **new** `timebill` Actual Time records only. It never edits, deletes, submits, approves, rejects, or retracts an existing entry or timesheet. Explain that boundary and make no write for lifecycle requests.

Read [workflow](references/workflow.md) for identity, evidence, readiness, Save, and recovery; [field resolution](references/field-values.md) for live metadata and scoped reference lookup; [output](references/output.md) for chat tables; and the [packaged timebill field guide](references/timebill-field-guide.md) for field names and conditional rules. The guide is generated from a SuitePeople snapshot; refresh live metadata and role-scoped choices for the selected account before using any field.

Default to self-entry. Resolve the authenticated employee with the documented `BUILTIN.NAMED_GROUP('employee', 'me')` query and validate one active account employee. If it fails, use another documented connector-authenticated identity method only; otherwise stop self-entry and explain the mapping gap. A user-confirmed name alone does not prove the authenticated employee. For a user-named delegated employee, resolve the name with a narrow fuzzy lookup and disambiguate multiple matches. With explicit delegated intent, read that employee's existing time only through a permitted, employee-and-date-scoped query; denied or incomplete coverage stays unknown. Do not read unrelated delegated activity.

Present every draft in a **Markdown table in chat**, including rows that need clarification. Give each row a stable ID and a unique Description so either can select it. For a finite unresolved choice, prefer the host's **native chat interactive multiple-choice input** when the host presents it, especially Billable Yes/No or bounded Location `Name (ID)` candidates. This input is host-controlled and is not guaranteed; if it does not appear, give numbered options in chat and accept a typed choice. Do not make fake clickable Markdown buttons or an HTML dashboard. A choice only edits the draft: validate it and redraw the full table with current values and states. Keep selected incomplete rows selected while asking for missing facts; do not silently omit them from a Save subset. A selection or initial “log time” request is not Save. When every selected row is Ready, show the exact pre-save confirmation as a **rendered Markdown table even for one row**: separate relevant field columns with payload names and IDs, validation/unverified status, and omissions. Bullets or a prose/key-value list cannot replace that table. Ask **Save** or **Cancel** separately after it. Only Save on that unchanged review authorizes `timebill` create. Read back each returned ID and report persisted values in a result table; retain clearly unsaved proposed values for rejected or unattempted rows. Pause the remaining batch on a required-field or invalid-value rejection; correct and re-review before retrying.

In SuiteSkills People, follow the installed resource map's `RETRIEVAL` contract before reads and `ACTIONS` contract before writes. `create_actual_time_entries` is a proposed People action identifier, not a callable connector method by itself. Discover a supported create capability for `timebill` and inspect its live schema and role permissions; a historical generic create tool name does not establish current availability. This skill grants no NetSuite access.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
