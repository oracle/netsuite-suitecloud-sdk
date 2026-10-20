Before tool use, load and apply [category SafeWords](../../../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# EX-14 · Low Usage and Idle-Balance Concentration

Use when the user asks whether low time-off use is concentrated by department or supervisor. This is a Time-Off Change expiry/carryover analysis, not a request analysis.

## Method

Read [OUTPUT-MODES](../../references/domain-shared/communication/OUTPUT-MODES.md), [GROUP-CONCENTRATION](../../references/domain-shared/knowledge/GROUP-CONCENTRATION.md), and [TIME-OFF-CHANGES-ANALYSIS](../../references/domain-shared/knowledge/TIME-OFF-CHANGES-ANALYSIS.md). For every active employee with a time-off plan, read the types enrolled on that employee's own plan and establish whether each type has an expiry mechanism. If time can expire, detect low use through future expiry exposure. If carryover is uncapped and no expiry mechanism exists, detect low use through the idle-balance test. Do not select the method from fixed-versus-hourly accrual basis.

Combine next-event expiry exposure and idle-balance exposure into one low-use count. The denominator is every active employee with a time-off plan in the group, regardless of plan mix. Count an employee once when one or more enrolled types meet the applicable method; do not let a person with several types inflate the count. State the method breakdown after the headline, for example `6 of 8 showing low use: 4 with time expiring and 2 with idle balances.` For a type with separate year-end and carryover-expiry events, assess only the next upcoming event for a low-use signal; do not use a later carryover-expiry event or add event amounts. A later event shared by the population is a plan characteristic, not a low-use signal. For concentration analysis, assess each type separately before the combined headline: exclude a near-universal no-carryover expiry from the low-use count and group finding, explain that it is a plan characteristic, and analyze types where outcomes vary. On an uncapped no-expiry plan, lead with the accrual-limit state and idle-balance result; `No expiry mechanism` is supporting context. When a current or scheduled accrual-limit signal applies, label the employee or relevant group detail as capped and state the limit date; if idle balance also applies, state both facts and still count the employee once. Do not rank on total or average hours, and do not produce separate ranked lists for expiry and idle balances. Report group findings first; offer an employee list only as a drill-down, never as the default answer to a low-use question.

Keep department and direct-supervisor groupings separate. Do not use the supervisor in a direct-report denominator. Job title and sub-tree are not analysis grouping dimensions. Do not include employees without a time-off plan in groups or denominators; state their count in the analysis scope. In Portfolio mode, apply the ranking and removal test before reporting a concentration. Distinguish `No expiry mechanism`, retrieval-unknown, and excluded negative-balance populations from employees with no exposure.

For a deadline question such as `What is at risk before [date]?`, use only expiry exposure for plans with an expiry mechanism. Idle balances have no deadline and must not be included in that result.

## Response

```
Low time-off usage / idle-balance patterns for [period]:

| Grouping | Group | Employees showing low use | Eligible employees | Affected rate | Company rate | Finding |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Department | ... | ... | ... | ... | ... | Source-supported concentration |

Nothing stands out from the company pattern: [when applicable].
Drill-down available: [one group / affected employees].
```

State facts only: the group, membership basis, type, period, combined method breakdown, and comparable basis. Include a one-line supervisor-team outlier finding when one exists, but offer the full supervisor breakdown instead of printing it. Do not speculate about cause or describe any employee, manager, or department negatively.
