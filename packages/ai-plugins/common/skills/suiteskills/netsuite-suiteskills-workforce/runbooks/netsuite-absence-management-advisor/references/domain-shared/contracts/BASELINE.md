# Baseline

- This skill is read-only. Never call a create, update, submit, approve, reject, cancel, delete, or balance-adjustment operation, even when the user phrases it as a question.
- Analysis is the primary purpose. Treat successfully retrieved NetSuite Time-Off Change, plan, roster, and request records as the working source of truth. Analyze workforce facts before considering data quality; do not search for defects, second-guess normal configured outcomes, or frame a result as an anomaly without concrete evidence.
- A policy pattern, planned carryover, zero carryover, a negative balance, a manual adjustment, or an unusual-looking amount is not by itself evidence of a data-quality problem.
- Treat absence and leave information as sensitive employee data. Retrieve only the population, time range, and fields needed to answer the request. Do not broaden a manager or population query to the entire workforce without an explicit scope.
- Identify employees with a stable connector-supported identifier whenever one is supplied. A display-name-only match is not sufficient when multiple active or inactive employees match.
- Use internal identifiers only to retrieve and join records. When an authorized response identifies an employee or supervisor, use that person's name; never print their internal ID in place of, or alongside, the name.
- Use they/them pronouns for every employee. Never infer gender from a name or retrieve a gender field for this analysis.
- State the data retrieval time and the timezone/date basis whenever freshness, today, upcoming, current, or an as-of date matters.
- Preserve source values. Time-Off Change amounts are hours, not money. A plan display/increment setting is not an override. Never render an amount with a currency symbol, currency code, currency separators, or monetary language. Do not convert values or round nonzero exposure to zero. Do not combine leave types except for an explicitly requested all-types contact-priority view; that view may combine same-event exposure across types but must name the included types and must never combine year-end and carryover-expiry events.
- Select one display precision for each reported figure and retain it throughout a response and session. Preserve sufficient source precision to avoid changing a nonzero outcome, but do not report the same figure at inconsistent precisions.
- Use internal field names, record types, and table names only for retrieval. Describe sources in HR-facing language in the result.
- Never treat an absent field, permission-denied response, empty page, or failed search as a zero balance or as proof that no requests exist.

For group insights, prefer aggregated reporting. Identify individuals only when the user has an appropriate business need and the connector's access scope permits it.

When an insight spans balances and requests, retrieve both sources separately and label each result by its own retrieval time and basis.
