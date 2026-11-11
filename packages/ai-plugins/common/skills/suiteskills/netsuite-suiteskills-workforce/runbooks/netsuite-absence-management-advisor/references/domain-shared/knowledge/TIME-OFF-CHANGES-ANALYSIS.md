# Time-Off Changes Analysis

## Separate expiry events

For a type with capped carryover and carryover expiry, year-end expiry and later carryover expiry are two different future events. They have separate dates and rules. Never add their hours at risk together.

For each employee and enrolled type, establish independently whether a future year-end event and a later carryover-expiry event apply. Use the employee's applicable accessible rules, including `allowcarryover`, `maximumcarryover`, `expireunusedcarryover`, and `carryoverexpirymonth`, together with the scheduled Time-Off Change records. `expireunusedcarryover = F` removes only the later carryover-expiry event; it does not remove year-end expiry.

For a forward-looking default, select the next upcoming applicable event chronologically and state its event name and date with the figure. Surface a later applicable carryover-expiry event separately by date only: state that carried-over time will expire then if unused. Do not quote a later-event amount, because future usage makes it unknowable. If the user names an event or date, use that event alone and say so. Do not report a completed boundary unless the user asks for history.

Where an output includes a derived balance, carryover exposure, or a period-level rollup, accumulate it only within the employee plan's entitlement period. The plan `startmonth` defines that period. Mixed plan cycles require separately retrieved and separately presented populations; a single over-broad date range can cross a plan boundary and create a false carryover result.

For each employee and time-off type, reconcile each event in scope from `timeoffchange`:

- Negative expiry plus next-day positive carryover summing to zero: fully carried forward; do not flag.
- Negative expiry plus next-day positive carryover summing negative: carryover shortfall; hours at risk are the absolute value of that sum.
- Negative expiry with no next-day carryover: full balance expires; hours at risk equal the absolute expiry amount. This is a result, not `Cannot verify`.
- Positive expiry with negative carryover: negative balance carried forward; no hours at risk.
- Positive expiry with no carryover: negative balance reset; no hours at risk.

For an Individual expiry response, establish the balance immediately before the selected event from the complete entitlement-period ledger. Lead with that pre-event balance and what becomes of it, such as fully carrying forward or the net hours at risk. Do not lead with a post-expiry zero: it is a mechanical consequence of the expiry transaction, not a finding. Explain year-end expiry and next-day carryover as one mechanism: the expiry clears the full balance, the carryover restores the eligible portion, and the net is the loss or full carry-forward. Do not present gross expiry and carryover as separate findings or leave the net unstated. When an accessible rule confirms a carryover cap, state its value and attribute the limited carryover to that cap's presence; never attribute a shortfall to an absent cap. A later carryover-expiry event remains a separate event. The default source detail is event arithmetic — pre-event balance, expiry, next-day carryover, and net outcome — rather than a full transaction history. If a response includes a Time-Off Change sequence beyond that arithmetic, include the running balance after every transaction. If the pre-event balance cannot be established from a complete sequence, label it unavailable rather than substituting zero.

Hours at risk is the employee's net expiry outcome: expiry plus next-day carryover, never the raw negative expiry amount. Use only employees with nonzero net exposure in affected-employee counts. Derive every aggregate from those per-employee net amounts: department totals, averages, group rates, rankings, removal tests, and concentration findings. An employee whose expiry and carryover sum to zero is fully carried forward and excluded from both the total and affected count.

`Cannot verify` is reserved for an actual retrieval failure, such as a missing page, denied permission, or date window that does not cover the event. When `CARRYOVER_EXPIRY` is the selected event, it produces an expiry-review finding; when it is later than the selected next event, surface only its date and conditional consequence. Do not use a result from one event to explain, suppress, or total the other.

The source expiry already includes a same-date accrual. Do not add, subtract, reorder, or independently recalculate it. When explaining an individual balance, state this source fact if it helps explain the transaction sequence. Include manual increases and decreases in any displayed balance sequence; name a material adjustment as a contributing source fact without inferring intent. Do not express an adjustment as a multiple of a normal accrual; use source amounts and a qualitative comparison only when useful.

Never add negative-balance rows to hours-at-risk totals. Render full carryover (zero at risk), retrieval failure (unknown), and negative-balance exclusion separately. Do not round a nonzero amount at risk to zero in prose or grouping. An employee with any nonzero source amount remains in the at-risk list, ordered by that amount, even if the displayed outcome notes rounding.

When explaining why an employee has no exposure, use only a verified source fact: for example, that accruals begin in a later period, that the entitlement period ends on a different date, that balance accrued before `startdatetimeoffcalc` is outside expiry calculation, or that the plan has no expiry mechanism. Do not substitute an invented cycle, recent-hire, or zero-balance explanation.

## Calculation start date and tenure transitions

Use `startdatetimeoffcalc`, not `hiredate`, for tenure-based time-off calculations. An employee can cross a tenure-rule boundary within one entitlement period, creating more than one prorated `ACCRUAL` row. Sum those source rows; they are not duplicates, a double accrual, or a data-quality issue. For an individual balance explanation, state the source-supported accrual split and boundary date when it materially explains the balance; do not present a single flat entitlement that contradicts the posted rows.

Changing `startdatetimeoffcalc` does not retroactively recalculate posted accruals. A historical row may differ from the rule currently in force. Report the Time-Off Changes as posted and do not correct the history or characterize that difference as an error.

The calculation start date also bounds expiry. Amounts accrued before `startdatetimeoffcalc` are outside expiry calculation, so the absence of a year-end expiry for that balance is expected when the source dates establish it. Describe that amount as outside expiry calculation, not as at risk, unknown, or a configuration defect. Do not recommend a correction.

## Accrual limits

An `ACCRUAL` transaction with a non-null description is a limit-reached signal. Quote the retrieved description verbatim. NetSuite writes this signal on future scheduled accruals blocked wholly or partly by the limit, so the earliest future flagged accrual is the date when accrual is scheduled to stop or be limited. For a future row, use future tense and state that date; do not say the employee has already reached the limit. Describe this as stopped earning, never expiry or forfeiture.

Read scheduled future accrual rows through the analysis horizon even when the employee has no current balance. A current-balance snapshot cannot rule out a future accrual limit. Use a consistent source basis across related expiry, accrual-limit, and idle-balance conclusions: when plan-projected accruals are used for a fixed-amount expiry result, use that same projected basis for its related accrual-limit and idle-balance analysis. For hourly plans, retain the posted-accruals-to-date basis and state that no future accrual is projected.

Use presence of the description as the only trigger. Do not use, parse, or treat `amount = 0` as corroboration: a limit-blocked row can contain a partial accrual that tops the balance up to the cap. Description localization does not change this detection; preserve the source text verbatim rather than substituting a canned explanation.

Do not assume that flagged accruals form one uninterrupted sequence. Usage can allow a later unflagged full accrual, followed by another flagged partial or zero accrual. Report two distinct source facts in an Individual drill-down: the earliest future date on which accrual is scheduled to stop or be limited, and whether the employee is in an unbroken flagged run at the end of the retrieved schedule window. Only the latter represents continued stopped earning at that horizon. Re-evaluate on every run because usage can recalculate future accruals and remove or interrupt the signal; never cache a prior result.

## Idle balances and expiry mechanism

First establish from the employee's own accessible plan and rules whether the time-off type has an expiry mechanism. Before creating a low-use signal, identify a near-universal no-carryover expiry as a plan characteristic and exclude that type from the low-use count and group ranking; state the exclusion and analyze types that vary between employees. For remaining types, use the expiry-mechanism result to select the low-use signal:

- When time can expire, use expiry exposure. This applies to fixed-amount and hourly plans alike.
- When carryover is uncapped and the plan has no expiry mechanism, use the idle-balance test instead. Describe this as `No expiry mechanism`; do not describe it as fully carried forward.

Assess idle balances separately from hours at risk and only when the accessible plan/rule data establishes an uncapped, no-expiry type and its plan basis. For an uncapped plan, lead an Individual or low-use result with the accrual-limit state and idle-balance result; `No expiry mechanism` or no-hours-at-risk is supporting context, not the headline.

- For a fixed-amount plan, flag an employee's own carryover that exceeds the configurable share of the plan's annual entitlement; the default share is 50%. The threshold is the shared plan figure, not an employee-specific entitlement or balance. When the source entitlement or threshold is in days, convert it with the employee's assigned work-calendar hours per day before comparing to Time-Off Change hours. Never use another employee's or plan's day length. State the threshold and how it was derived.
- For an hourly plan with no annual entitlement, flag an employee's own carryover that exceeds the configurable share of that employee's posted accruals to date in the current entitlement period, including manual increases; the default share is 50%. State the threshold and how it was derived.

For an hourly plan, label the basis as accruals to date and state that no future accrual is projected. This comparison is less meaningful early in a period; note that limitation rather than suppressing the result. Do not add this caveat to a fixed-amount plan, whose projected future accrual is already reflected in the source expiry/carryover figures.

An employee with a current or scheduled described `ACCRUAL` limit signal is capped or scheduled to be capped, not merely idle. State the limit date. When that employee also meets the idle-balance measure, report both source facts without counting the employee twice in a group headline.

For low-use analysis, use only the next upcoming expiry event. Do not create a low-use signal from a later carryover-expiry event. When that later event is shared across the population, describe it only as a plan characteristic or date-only future consequence; it is not a discriminatory low-use finding.

If plan/rule data is unavailable, complete the expiry and accrual-limit analysis and state that the idle-balance basis and expiry mechanism cannot be verified. A high carryover is idle and growing, not automatically at risk or evidence of a policy problem.
