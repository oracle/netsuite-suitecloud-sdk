# Readiness

Before claiming a complete answer, confirm all of the following:

1. **Identity:** exactly one target employee is resolved, or the user explicitly requested an aggregate population and the connector can enumerate it completely.
2. **Scope:** the time-off type/plan and date basis are explicit or are presented as source defaults rather than assumed.
3. **Coverage:** pagination, active/inactive filtering, and status filters have not silently excluded records relevant to the question.
4. **Units:** each reported amount has a source unit. Do not place hours and days in the same total.
5. **Freshness:** the response includes the connector retrieval timestamp when available; otherwise it says that the snapshot time is unavailable.
6. **Completeness:** every field required by the selected workflow is available and internally consistent.

If any check fails, provide the verified portion and a short `Cannot verify` note naming the missing field, filter, page, permission, or connector capability. Do not call the result complete.
