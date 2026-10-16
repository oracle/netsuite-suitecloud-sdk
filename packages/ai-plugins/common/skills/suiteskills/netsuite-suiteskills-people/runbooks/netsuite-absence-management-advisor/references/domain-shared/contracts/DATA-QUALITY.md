# Data Quality and Reconciliation

Data-quality review is secondary to the requested analysis. When the required source records are complete and internally coherent, treat them as correct and return the analysis as **Verified**, even if a result is unusual or reflects a configured policy outcome. Do not turn a normal source-backed pattern into a suspected defect or anomaly.

Classify an answer as one of these only:

- **Verified:** all workflow-required fields are present, identity and scope are unambiguous, and result coverage is complete.
- **Partial:** a specified employee or record has some requested facts verified, but at least one required fact for that item is unavailable or incomplete.
- **Unavailable:** the connector cannot retrieve the required source data with the current permissions or schema.
- **Conflicting:** two authoritative connector reads disagree, or a connector result conflicts with a user-provided NetSuite UI value that cannot be reconciled.

Use **Partial**, **Unavailable**, or **Conflicting** only for an actual retrieval gap or disagreement. A strange-looking value, an expiry without carryover, an adjustment, a negative balance, or a pattern affecting many employees is not enough on its own. Apply `Partial` to the affected employee or record, not to a whole run when the remaining population is fully resolved: state the count fully resolved and identify the limited item and missing fact.

Before calling an employee-level observation an anomaly, conflict, or data-quality issue, read that employee's own time-off plan and the applicable accessible rules. Do not infer plan membership from colleagues, teams, organizational attributes, or returned transaction types. If that verification cannot be completed, preserve the factual analysis and state that the categorization cannot be verified.

For conflicting data after that check, show both values with their source, retrieval time, unit, and relevant as-of/effective date. Do not select a winner or calculate a corrected figure. Recommend verification in NetSuite by an authorized HR administrator and identify the exact records/fields to compare.

For unexpected empty results that prevent the requested analysis, check employee identity, plan/type eligibility, date bounds, status filters, paging, inactive records, and permissions before reporting that no data exists. Do not surface this investigation as a data-quality concern unless it establishes an actual gap or conflict.

For a historical Time-Off Request pattern, repeated `creationdate` values after the absence start date are a source-supported recording-lag limitation. State the population and dates affected, but do not infer a reason or assign fault.
