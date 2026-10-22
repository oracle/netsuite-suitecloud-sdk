Before tool use, load and apply [category SafeWords](../../../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# EX-13 · Time-Off Balance Explanation

Use to explain why an employee’s time-off balance has its current value. Use `timeoffchange`, not report -306.

Retrieve the complete relevant Time-Off Change history by employee internal ID and enrolled time-off type within the correct entitlement period, along with the employee's `startdatetimeoffcalc`. Show signed hours, date applied, change-type display name, linked request when available, description, and the running balance after each transaction. Derive the running balance only from a complete entitlement-period sequence; if an opening balance cannot be established from the retrieved ledger, label it unavailable rather than presenting a partial sequence as the balance. Include accrual, usage, carryover, expiry, and manual adjustments. Do not display internal change-type IDs where a display name is available. A transaction table is required for every individual explanation.

The running-balance rule applies to every table of Time-Off Changes, not only this workflow. An individual expiry answer may use only event arithmetic — pre-event balance, expiry, next-day carryover, and net outcome — without a full ledger table. If it instead shows a transaction sequence, include the running balance after every row.

Explain the sequence as source facts. Treat a year-end expiry and its next-day carryover as one mechanism, not two separate facts: the expiry clears the full balance, the carryover restores the eligible portion, and their net is the hours lost or fully carried forward. State that net explicitly; do not leave the reader to infer it from the gross expiry. When an accessible plan setting shows a carryover cap, state its value and attribute the limited carryover to the presence of that cap. Do not imply that an absent cap caused the shortfall. The source year-end expiry already includes any same-date accrual; do not derive a different expiry by reordering or recalculating it. If tenure changes during the entitlement period produce multiple accrual rows, sum the prorated rows and state the source-supported split and boundary date rather than a single flat entitlement. Do not call those rows duplicate or conflicting. A changed calculation start date does not retroactively recalculate posted rows; report history as posted. When a balance predates `startdatetimeoffcalc`, explain that it is outside expiry calculation rather than unknown or at risk. When posted accruals appear lower than the accessible plan rules suggest, read authorized employee `systemnote` history for plan assignment and calculation-start changes. If plan assignment is later than the calculation start date, state both dates and explain that accrual begins at assignment without backfill. Identify a manual adjustment as a contributing transaction without inferring why it was made or expressing it as a multiple of a normal accrual. If the record cannot be attributed to a known change type or accessible plan setting, or the figures do not reconcile, recommend contacting support rather than guessing a mechanism.

```
Time-off balance explanation for [employee] — [type]:

| Applied date | Change type | Change hours | Balance after change | Source description |
| --- | --- | ---: | ---: | --- |
| ... | Accrual | ... | ... | ... |
```

Add record IDs or direct record URLs only when the user requests them.
