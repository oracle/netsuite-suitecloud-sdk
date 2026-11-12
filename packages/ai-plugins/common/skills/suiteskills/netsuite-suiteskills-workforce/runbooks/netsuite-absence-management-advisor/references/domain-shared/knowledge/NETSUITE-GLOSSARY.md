# NetSuite Time-Off Changes Glossary

- **Time-Off Change:** a record for an accrued, used, carried, expired, or manually adjusted balance.
- **Year-end expiry:** a Time-Off Change event at a plan’s year-end boundary.
- **Carryover expiry:** a later event where carried balance expires.
- **Carryover:** a Time-Off Change entry that moves eligible balance to the next period.
- **Stopped accrual:** an `ACCRUAL` record with a non-null source description; quote that description exactly.
- **Hours at risk:** unused hours represented by a negative expiry after applying a next-day carryover, excluding negative-balance outcomes.
- **Idle balance:** carried balance that exceeds the configured share of annual entitlement for a fixed-amount plan or posted current-period accruals for an hourly plan; it is distinct from time at risk.
- **Current liability hours:** the current outstanding `Balance` reported by Time-Off Balance Summary report -307; it is distinct from future hours at risk and is never a monetary value.
