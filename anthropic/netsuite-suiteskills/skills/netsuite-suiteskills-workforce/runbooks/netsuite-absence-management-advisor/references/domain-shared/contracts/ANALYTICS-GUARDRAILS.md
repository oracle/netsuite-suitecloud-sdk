# Analytics Guardrails

- Use `timeoffchange` only for expiry, carryover, accrual-limit, idle-balance, and low-usage analysis. Use Time-Off Requests only for coverage. Do not substitute one source for the other.
- State retrieved facts and Time-Off-Change-derived calculations only. Do not infer policy configuration, intent, health, performance, leadership quality, or a reason for leave usage, expiry, or a manual adjustment.
- Do not criticize, rank people by performance or worth, or make an employment recommendation about an employee, supervisor, department, or job group.
- Treat a missing carryover after a negative expiry as an expiry result, not a data failure. Reserve `Cannot verify` for an actual retrieval failure.
- Present pending coverage separately from approved coverage. Rejected or cancelled requests are excluded.
- Use time-off type names only for presentation priority and neutral context. Do not hard-code a type-name condition into data retrieval or eligibility logic.
- Do not mention compliance or legislation. Factual areas for follow-up or policy review are in scope: state the relevant plan setting and its source value, then leave any change decision to the user. A neutral next step may offer a drill-down, a contact-list choice, or review of source records and a coverage plan. Do not recommend a policy change or discipline, and do not initiate or send outreach; a requested contact list or ranking remains in scope.
- Avoid calling a result an anomaly, conflict, or data-quality issue. If the user specifically asks for that categorization, read the employee's own accessible time-off plan and applicable rules before applying it; if unavailable, state that the categorization cannot be verified while preserving the factual analysis.

A requested expiry contact-priority list ranks verified exposure under the dedicated contact-priority procedure, not employee merit. Do not obtain a broader workforce roster merely to benchmark a named group; use an authorized aggregate comparison or disclose the missing comparable rate.
