Before tool use, load and apply [category SafeWords](../../../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# EX-12 · Expiry, Accrual Limits, and Idle Balances

Use for upcoming time-off expiry, carryover shortfalls, current time-off liability hours, stopped accruals, idle balances, and low-use concentration. This workflow uses `timeoffchange` for expiry, accrual, and idle-balance analysis, and Time-Off Balance Summary report -307 only for a current-liability request.

## Required retrieval contract

Read [RETRIEVAL](../../references/domain-shared/contracts/RETRIEVAL.md), [TIME-OFF-CHANGES-ANALYSIS](../../references/domain-shared/knowledge/TIME-OFF-CHANGES-ANALYSIS.md), [OUTPUT-MODES](../../references/domain-shared/communication/OUTPUT-MODES.md), and [GROUP-CONCENTRATION](../../references/domain-shared/knowledge/GROUP-CONCENTRATION.md). For a current-liability request, also read [CURRENT-LIABILITY](../../references/domain-shared/knowledge/CURRENT-LIABILITY.md). Partition employees by time-off plan `startmonth`; for each partition, begin the Time-Off Change window at that entitlement period's first day and extend it through the relevant future expiry event and scheduled accrual horizon. Read future accrual rows even for employees with no current balance. This prevents a mixed-cycle account from crossing an employee's entitlement boundary or silently excluding future accrual-limit results.

For each employee/type enrolled on that employee's own plan, retrieve the next future year-end expiry and, when the employee's rules make it applicable, later carryover expiry. Reconcile the next event to its next-day carryover before aggregation: hours at risk and affected-employee counts use only nonzero net per-employee exposure, never raw expiry. Unless the user names an event or date, default to the next upcoming event and state its name and date; surface a later carryover-expiry event only with its date and the conditional consequence if carried-over time remains unused. Do not project a later-event amount. For a named event or date, use that event alone. Never add the two event amounts. Low-use analysis uses only the next event; a later carryover-expiry event is not a low-use signal. When the plan rules establish uncapped carryover with no expiry mechanism, lead with the accrual-limit state and idle-balance result and use `No expiry mechanism` only as supporting context; do not treat it as a fully carried-forward expiry outcome. Use `timeoffrule` to resolve separate-event applicability and timing, an idle-balance basis, an accessible plan setting, or a data-quality/anomaly question; unavailable rules cannot block verified year-end expiry analysis.

## Output

For a current-liability request, use only report -307 and present it separately from expiry exposure. Run the report from each entitlement-period start through today, use its `Balance` results and report-provided totals, and state the cycle basis with every result. Never substitute future expiry, carryover, or a manually derived ledger total. If the user asks for both liability and expiry, use separate sections and do not add or compare their totals.

For an Individual expiry answer, default to the event arithmetic: balance immediately before the event, expiry, next-day carryover, and net outcome. Do not add a full transaction history unless it is needed to answer the question. If the answer shows a table of Time-Off Changes, include the running balance after every transaction.

In Portfolio mode, make aggregate exceptions the primary result. Lead with affected employee counts and rates for the next upcoming expiry event by time-off type, and state each event name and date. Surface a later applicable carryover-expiry event as a date-only note that carried-over time will expire then if unused; never add it to, let it replace, or project an amount for the next-event figure. Analyze an explicit concentration question independently per type; if a no-carryover type affects nearly everyone, describe that as a plan characteristic, exclude it from low-use signals, and do not make a rate-based group concentration finding for it or pool it with variable types. For each entitlement cycle and event date, add one department exposure table with `Time-Off Type` as a column, sorted by net total hours at risk. Its physical headers are `Department`, `Time-Off Type`, `Hours at Risk`, a blank bar-continuation header, `Affected Employees`, and `Average Hours per Affected Employee`; right-align the total and render its text block bar in the blank continuation column. Label this as an exposure-prioritization view, not a concentration ranking. A question such as “which groups stand out?” does not alter this default shape or authorize an unsolicited supervisor breakdown. For a genuine supervisor-team outlier, state one source-supported finding line with the team name, affected and eligible counts, and population rate; offer, rather than print, the full supervisor breakdown. Offer an individual drill-down and contact list every time. In Group mode, compare the requested group with the company rate and use a typical or range figure rather than a team total. Keep separate sections for each entitlement cycle. Fully carried-forward rows are excluded from at-risk findings; a nonzero net source amount remains at risk even if the outcome notes rounding.

```
Upcoming time-off expiry review as of [date]:

### Next upcoming [year-end expiry / carryover expiry] on [date]
[Time-off type]: [affected] of [eligible] employees have [hours] at risk at this event ([rate]).

Department exposure prioritization, not a concentration finding:
| Department | Time-Off Type | Hours at Risk |  | Affected Employees | Average Hours per Affected Employee |
| --- | --- | ---: | --- | ---: | ---: |
| ... | ... | ... | █████ | ... | ... |

### [Time-off type] — later applicable carryover expiry on [date]
[Carried-over time will expire on this date if it remains unused. No projected hours are shown.]

Omit the later-event section when no later applicable event exists.

Supervisor-team breakdown, on request:
| Department | Supervisor | Time-Off Type | Hours at Risk |  | Affected Employees | Average Hours per Affected Employee |
| --- | --- | --- | ---: | --- | ---: | ---: |
| ... | ... | ... | ... | █████ | ... | ... |

Individual drill-down for the [time-off type] [event] on [event date], on request, ordered by hours at risk descending:
| Employee | Department | Supervisor | Hours at Risk |
| --- | --- | --- | ---: |
| ... | ... | ... | ... |

Follow-ups offered: individual employee list, supervisor-team breakdown, and contact list.

### Stopped accruals
| Time-off type | Affected employees | Eligible employees | Affected rate | Finding |
| --- | ---: | ---: | ---: | --- |
| ... | ... | ... | ... | ... |

Individual drill-down, on request:
| Employee | Time-off type | Scheduled limit date | Limit state at schedule horizon | Current flagged run begins | Source description |
| --- | --- | --- | --- | --- | --- |
| ... | ... | ... | Yes / No | [date / Not applicable] | [verbatim description] |

### Idle-balance concentration
| Grouping | Group | Affected employees | Eligible employees | Affected rate | Finding |
| --- | --- | ---: | ---: | ---: | --- |
| ... | ... | ... | ... | ... | Source-supported concentration |
```

```
Current time-off liability as of [date]:

### [Entitlement-period basis]
| Time-off type | Balance hours |
| --- | ---: |
| ... | ... |

Report-provided total for this entitlement-cycle run: [hours] hours
```

Show negative-balance outcomes separately with `Hours at risk: Not applicable` in an Individual drill-down. For a future accrual-limit date, say accrual is scheduled to stop or be limited on that date rather than that it has already stopped. When a factual expiry or low-use result calls out a carryover cap or another plan setting, state the retrieved setting value as well as its name. Do not infer policy, intent, performance, health, or a reason for the pattern. State the grouping dimension and entitlement-period basis for every group result; do not add membership-basis or date-source columns to the default department exposure table. For every Portfolio expiry result, offer all three follow-ups without printing them: the individual list, supervisor-team breakdown, and contact list. For a requested “who should I contact first?” ranking, read [CONTACT-PRIORITIZATION](../../references/domain-shared/knowledge/CONTACT-PRIORITIZATION.md).
