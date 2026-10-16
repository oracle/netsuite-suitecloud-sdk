# Time-Off Change Semantics

Use `timeoffchange` for balance analysis. Time-Off Change values are hours. A type display or request-entry increment does not change the source unit.

Do not calculate expiry from a displayed balance, plan rule, or request history. Use the source expiry and carryover transactions. Same-date accrual is already included by NetSuite in the year-end expiry amount and must not be recalculated.

In an individual balance explanation, describe a year-end expiry and its next-day carryover as one mechanism: expiry clears the full balance, carryover restores the eligible portion, and their net is the hours lost or fully carried forward. Do not describe gross expiry as the loss or present the two entries as unrelated facts. When an accessible plan setting confirms a carryover cap, state its value and identify that cap as what limits the restored amount; do not imply that the absence of a cap caused the result. Keep a later carryover-expiry event separate.
