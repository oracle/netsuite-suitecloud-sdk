# Current Liability Hours

Use this only when the user asks for current outstanding time-off balances or liability hours. It is distinct from future expiry exposure.

| Analysis | Question | Source | Date | Unit |
| --- | --- | --- | --- | --- |
| Expiry exposure | What may be lost at a future boundary? | `timeoffchange` expiry and carryover rows | Future event date | Hours at risk |
| Current liability | What balance is outstanding now? | Time-Off Balance Summary report -307 | Today | Balance hours |

Never substitute one analysis for the other, add their totals together, or describe either as money.

Run report -307 from the first day of each employee population's entitlement period through today. Use the report's `Balance` column as the liability figure and its own totals; do not derive a replacement from Time-Off Changes or manually add report detail rows. Report the result by time-off type, entitlement-cycle run, and period basis.

When plans have different `startmonth` values, run the report separately for each entitlement cycle. Keep each report-provided total tied to its own period basis. If the connector exposes a report-level combined total, use it; otherwise do not manufacture a cross-cycle grand total.

The expected report columns are `Carried Over`, `Earned`, `Used`, `Carryover Expiry`, and `Balance`. If report -307 or `Balance` is unavailable to the connector role, state that current liability is unavailable; do not proxy it with expiry, carryover, or ledger sums.
