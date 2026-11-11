# Output Modes

Choose the mode from the question's scope, not from a global preference.

| Question scope | Mode | Required shape |
| --- | --- | --- |
| No named group, or whole company | Portfolio | Aggregate, exception-led, no employee roster by default. |
| Department or direct-supervisor team | Group | That group's figures and the comparable company rate. |
| Identified employee | Individual | Source detail needed to answer the question; every Time-Off Changes table includes signed hours and running balance. |

## Portfolio mode

- Lead with affected/eligible counts and the affected rate; never open with a bare total-hours figure.
- For a portfolio expiry review, add one department exposure table for each entitlement cycle and next applicable event date. Show `Time-Off Type` as a column so types with the same event date share one table. Its headers are `Department`, `Time-Off Type`, `Hours at Risk`, a blank continuation header for the text bar, `Affected Employees`, and `Average Hours per Affected Employee`, in that order. Right-align the total in `Hours at Risk` and put its text block bar in the blank continuation column so every bar starts at a common edge. Sort by the net total hours at risk. This is an exposure-prioritization view, not a concentration finding; use the separate rate-based concentration method for that conclusion. Do not add membership-basis or date-source columns. A later carryover-expiry event is a date-only note, not another exposure table or projected amount.
- A team-level summary may add a typical or range figure per affected employee, but not a sum of hours. If a meaningful share of affected employees have source amounts conspicuously smaller than their peers, disclose that count and observed range with the affected-employee count. Do not apply a materiality floor or exclude anyone from the count.
- Lead with exceptions. Do not list employees with no exposure or no planned absence.
- Evaluate department and direct-supervisor groups without waiting for the user to name one. Do not treat a group at or near the company rate as a finding.
- For planned-absence availability, follow EX-11's supervisor-team-only overlap method instead of this general grouping rule.
- For a multi-type expiry or low-use question, make concentration conclusions by time-off type. Describe a near-universal outcome from a no-carryover type as a plan characteristic, not a local concentration, and do not pool it into a cross-type group ranking.
- Keep the minimum group size at four active eligible employees. A smaller group may be described only as context when the user asks about it; it is not a portfolio concentration finding.
- If group rates are materially flat, say `Nothing stands out from the company pattern.` Do not manufacture a ranked list.
- For a genuine supervisor-team outlier, add one source-supported finding line with its affected and eligible counts and the population rate. Do not print the full supervisor breakdown table by default.
- Every portfolio expiry response offers, without printing, all three follow-ups: an individual employee list ordered by hours at risk, a supervisor-team breakdown, and a contact list. Keep the department exposure view even when the user asks which groups stand out; the wording of a near-identical prompt does not change the default shape or authorize an unsolicited team table.

## Group mode

- Show the requested group's affected/eligible count and rate, plus the comparable company rate and the period and membership basis.
- Keep hours out of the group headline. An employee-specific drill-down may show the relevant hours.
- A typical or range figure per affected employee is allowed when it clarifies severity; do not use a team total as the severity summary.
- Use active direct reports for a supervisor team. Job title and sub-tree are not analysis grouping dimensions.
- For a requested supervisor-team expiry view, place `Supervisor` immediately after `Department`, retain `Time-Off Type` before `Hours at Risk`, and retain the blank bar-continuation column after `Hours at Risk`. Include a column only when its values differ between rows. An individual expiry list has exactly four columns: `Employee`, `Department`, `Supervisor`, and `Hours at Risk`. State a common event and date once in the heading above it; do not add event, date, expiry, carryover, or bar columns. Add `Outcome` only when the list spans mechanisms with genuinely different outcomes.

## Individual mode

- For a balance explanation, show the detailed Time-Off Changes needed to answer the question, with signed hours, source dates, and running balance after each transaction. For an individual expiry answer, event arithmetic alone — pre-event balance, expiry, next-day carryover, and net outcome — is the default; if a Time-Off Change sequence is included, show its running balance after every transaction.
- For an expiry drill-down with more than one employee, order the list by hours at risk descending within the presentation-priority type grouping. A nonzero amount remains in the at-risk list even when it is very small or the outcome label notes rounding; state the source amount rather than rounding it away in prose.
- Do not include record IDs or direct record URLs unless requested. Never display an employee or supervisor internal ID in place of, or alongside, that person's name.
- Use employee and supervisor names whenever an authorized response identifies people.
- Use they/them for every employee; never infer gender from a name.
