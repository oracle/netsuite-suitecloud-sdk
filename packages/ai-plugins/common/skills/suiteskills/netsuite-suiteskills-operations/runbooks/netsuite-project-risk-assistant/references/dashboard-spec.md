# Dashboard presentation contract

## Output paths

Prefer a single-file React artifact when an inline renderer is present. Verify
dependencies before importing a chart library. Otherwise generate a self-contained
HTML file with inline styling and native SVG/CSS charts; do not require a CDN,
network requests, tracking scripts, or upload of NetSuite records.

Use Overview, Projects, and Staffing tabs. Add Sources/Coverage as a panel, footer,
or optional tab. Provide keyboard-operable controls, clear labels, visible focus,
accessible chart text/tables, and a layout that works on narrow screens.

Escape all account-supplied text and URLs. Do not use unsafe HTML insertion for
record content. Permit only safe link schemes; use actual returned links.
When embedding JSON in HTML, escape script terminators and unsafe characters.

## Context and coverage

Display the requested project/client scope, snapshot date, timezone, retrieval
timestamp, and whether data was reused. Show coverage for deadline, schedule,
hours/budget, project allocation, native risks/issues, and native summary.

Keep permission gaps and partial pagination visible near affected metrics. Show
“Not available” for uncollected or denied data. Show zero only for a successful
retrieval supporting zero within its stated scope. A zero risk-search result
does not prove the whole portfolio healthy.

## Overview

Use five primary cards:

| Card | Denominator or qualification |
| --- | --- |
| Deadline-flagged projects | Distinct projects from the deadline-risk source; not the broader union |
| Overdue tasks | Distinct eligible tasks from the retrieved schedule-risk source |
| Worst known observed delay | Maximum among known overdue ages; disclose missing ages and partial coverage |
| Unowned overdue tasks | Explicitly empty complete assignment lists |
| Placeholder-only overdue tasks | All observed assignments verified as placeholders |

For each card include source label/ID, metric definition, and partial-coverage
qualification where applicable. An optional observed-flagged-project card must
explicitly say it is the union of the supported flag categories.

Use these charts:

- Overdue ages: 1–15, 16–30, 31–60, 61–100, 101+; show unknown-age count separately.
- Hours/budget overage: horizontal bars by project, with actual units and basis.
  Separate positive task-hour overage from net project-hour overage; do not plot
  them under a misleading common total. Separate currencies unless conversion
  uses an explicit, sourced rate and date.
- Projects by overdue-task count: highest observed count first; disclose a top-N
  limit and retain the rest in the full table.

Label axes and bar values. Include text alternatives. Do not draw a zero-valued
chart when the data is unavailable.

## Cases and intersections

Show two to four cases only when supported. Avoid artificial ranking precision.
Prioritize documented impact/severity when available; otherwise describe observable
criteria such as age, overdue-task count, unowned work, and late-plus-overage overlap.

Use this structure:

**Confirmed:** Source-supported task/project state, due date, ownership, and hours.
**Calculated:** Days overdue, task counts, or overage with source and formula.
**Interpretation:** A clearly qualified possible explanation, not a causal claim.
**Proposed action:** A practical review step and an owner only when evidenced.

“Late and over planned hours” is a verified intersection when supported. “Scope
problem” is a possible explanation requiring investigation, not an established
conclusion. Do not call old overdue records stalled without progress evidence or
completed-but-open without completion evidence.

Identify clients with multiple flagged projects only when stable client IDs can
be joined. State which categories contribute to the flagged-project union.

## Projects tab

Provide the full retrieved at-risk project list in a scrollable table. Include
client, project, calculated end date, risk category, relevant overdue-task count,
and source reference when supported. Use separate rows/columns or filters to
distinguish deadline-risk projects from the broader flagged union.

Show missing names/dates as not available. Use stable IDs to disambiguate equal
names. A “full” list means full within the verified retrieval scope, not all
account projects. Flag incomplete coverage.

## Staffing tab

Use mutually exclusive categories: Unowned, Placeholder only, Named owner
present, Unknown. Show both counts and the denominator (retrieved overdue tasks).

A named owner does not prove capacity, availability, or complete staffing.
Flag named-plus-placeholder/unknown assignment lists separately. Keep project
no-allocation findings distinct: project allocation and task ownership are
different evidence.

Do not hardcode placeholder prefixes or infer a real employee from a plausible
display name. Use record types, explicit resource classifications, documented
account conventions, or direct user confirmation.

## Visual direction and checks

Follow the draft's Redwood-inspired navy / burnt-orange-red / amber direction.
Reserve green for explicitly supported healthy states; do not use green to imply
missing data is healthy. Use one readable sans-serif family, restrained borders,
and clear numbers. Do not represent proposed colors as official NetSuite tokens.

Verify tab operation, keyboard navigation, resizing, readable tables, empty/error
states, data-to-chart consistency, source references, escaping, and no external
data transmission. Record which checks were actually executed.
