# Assignment review and missing field queries

Use these examples to review assignments and missing fields. Select only the requested summary, field check, or complete work list. Read [sources.md](sources.md) for population and scope. Read [currency.md](currency.md) before publishing or comparing money. For broad snapshots, follow [snapshot-checks.md](snapshot-checks.md).

## Contents

- [Combined review and missing field breakdown](#combined-review-and-missing-field-breakdown) contains review totals and focused missing field counts.
- [Complete snapshot and requested review details](#complete-snapshot-and-requested-review-details) contains complete review work list templates.

## Combined review and missing field breakdown

The combined review includes assignments with a missing Benefit, Type, Carrier, or Coverage. It also includes blank, zero, or negative Employee, Employer, or Total amounts, and mismatches between a fully populated rounded total and rounded components.

- Treat blank amounts as findings that need confirmation. They aren't zero or automatic mismatches.
- Count the combined review as a distinct union. Separate issue counts can overlap. `incomplete_records` counts blanks in descriptive fields. `missing_amount_records` counts assignments with at least one blank amount.
- For a focused missing field or blank amount count or list, read only the needed fields. Check currency when publishing or comparing money, including cost comparisons in reviews.
- Classify these default findings as Review items. Use Exceptions only for the separate hard rules described in [output.md](output.md).

### review_inputs

Select employee and assignment identities, four required field IDs, and three rounded amounts. Leave out display labels and organization fields.

<!-- BEGIN SQL review_inputs -->
```sql
SELECT e.id AS employee_id, a.id AS assignment_id, a.custrecord_bt_emp_bp_plan AS benefit_id,
       a.custrecord_bt_emp_bp_type AS benefit_type_id,
       a.custrecord_bt_emp_bp_carrier AS carrier_id,
       a.custrecord_bt_emp_bp_coverage AS coverage_id,
       ROUND(a.custrecord_bt_emp_bp_employee_cost, 2) AS employee_cost,
       ROUND(a.custrecord_bt_emp_bp_employer_cost, 2) AS employer_cost,
       ROUND(a.custrecord_bt_emp_bp_total_cost, 2) AS total_cost
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
```
<!-- END SQL review_inputs -->

### review_flags

Produce one review record for an assignment with any combination of descriptive blanks, amount blanks, mismatches, zero amounts, or negative amounts. Compare amounts after rounding each source value to two decimals.

<!-- BEGIN SQL review_flags -->
```sql
SELECT r.employee_id AS employee_id, r.assignment_id AS assignment_id,
       CASE WHEN r.benefit_id IS NULL OR r.benefit_type_id IS NULL OR r.carrier_id IS NULL OR r.coverage_id IS NULL THEN 1 ELSE 0 END AS missing_required_flag,
       CASE WHEN r.employee_cost IS NULL OR r.employer_cost IS NULL OR r.total_cost IS NULL THEN 1 ELSE 0 END AS missing_amount_flag,
       CASE WHEN r.employee_cost IS NOT NULL AND r.employer_cost IS NOT NULL AND
         r.total_cost IS NOT NULL AND r.total_cost <> r.employee_cost + r.employer_cost THEN 1 ELSE 0 END AS mismatch_flag,
       CASE WHEN r.employee_cost = 0 THEN 1 ELSE 0 END AS zero_employee_flag,
       CASE WHEN r.employer_cost = 0 THEN 1 ELSE 0 END AS zero_employer_flag,
       CASE WHEN r.total_cost = 0 THEN 1 ELSE 0 END AS zero_total_flag,
       CASE WHEN r.employee_cost < 0 THEN 1 ELSE 0 END AS negative_employee_flag,
       CASE WHEN r.employer_cost < 0 THEN 1 ELSE 0 END AS negative_employer_flag,
       CASE WHEN r.total_cost < 0 THEN 1 ELSE 0 END AS negative_total_flag
FROM ({{REVIEW_INPUTS}}) r
```
<!-- END SQL review_flags -->

### review_summary

Use this when a review summary is requested. Count the distinct union, not the sum of issue counts. A monetary question alone doesn't request this review.

<!-- BEGIN SQL review_summary -->
```sql
SELECT COUNT(DISTINCT CASE WHEN x.missing_required_flag = 1 OR x.missing_amount_flag = 1 OR x.mismatch_flag = 1
         OR x.zero_employee_flag = 1 OR x.zero_employer_flag = 1 OR x.zero_total_flag = 1
         OR x.negative_employee_flag = 1 OR x.negative_employer_flag = 1 OR x.negative_total_flag = 1
         THEN x.assignment_id END) AS review_records,
       COUNT(DISTINCT CASE WHEN x.missing_required_flag = 1 OR x.missing_amount_flag = 1 OR x.mismatch_flag = 1
         OR x.zero_employee_flag = 1 OR x.zero_employer_flag = 1 OR x.zero_total_flag = 1
         OR x.negative_employee_flag = 1 OR x.negative_employer_flag = 1 OR x.negative_total_flag = 1
         THEN x.employee_id END) AS review_employees,
       COUNT(DISTINCT CASE WHEN x.missing_required_flag = 1 THEN x.assignment_id END) AS incomplete_records,
       COUNT(DISTINCT CASE WHEN x.missing_amount_flag = 1 THEN x.assignment_id END) AS missing_amount_records,
       COUNT(DISTINCT CASE WHEN x.mismatch_flag = 1 THEN x.assignment_id END) AS mismatch_records,
       COUNT(DISTINCT CASE WHEN x.zero_employee_flag = 1 OR x.zero_employer_flag = 1 OR x.zero_total_flag = 1 THEN x.assignment_id END) AS zero_cost_records,
       COUNT(DISTINCT CASE WHEN x.negative_employee_flag = 1 OR x.negative_employer_flag = 1 OR x.negative_total_flag = 1 THEN x.assignment_id END) AS negative_cost_records,
       COUNT(DISTINCT CASE WHEN x.zero_employee_flag = 1 THEN x.assignment_id END) AS zero_employee_amounts,
       COUNT(DISTINCT CASE WHEN x.zero_employer_flag = 1 THEN x.assignment_id END) AS zero_employer_amounts,
       COUNT(DISTINCT CASE WHEN x.zero_total_flag = 1 THEN x.assignment_id END) AS zero_total_amounts,
       COUNT(DISTINCT CASE WHEN x.negative_employee_flag = 1 THEN x.assignment_id END) AS negative_employee_amounts,
       COUNT(DISTINCT CASE WHEN x.negative_employer_flag = 1 THEN x.assignment_id END) AS negative_employer_amounts,
       COUNT(DISTINCT CASE WHEN x.negative_total_flag = 1 THEN x.assignment_id END) AS negative_total_amounts,
       COUNT(DISTINCT CASE WHEN x.missing_required_flag = 1 OR x.missing_amount_flag = 1 OR x.mismatch_flag = 1 THEN x.assignment_id END) AS medium_priority_records,
       COUNT(DISTINCT CASE WHEN x.missing_required_flag = 0 AND x.missing_amount_flag = 0 AND x.mismatch_flag = 0
         AND (x.zero_employee_flag = 1 OR x.zero_employer_flag = 1 OR x.zero_total_flag = 1
           OR x.negative_employee_flag = 1 OR x.negative_employer_flag = 1 OR x.negative_total_flag = 1)
         THEN x.assignment_id END) AS low_priority_records,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM ({{REVIEW_FLAGS}}) x
```
<!-- END SQL review_summary -->

### review_groups_joint

Use this for a requested grouped review summary. Set `GROUP_INPUTS` to the requested employee or organization IDs and labels. For assignment IDs already selected by the template, add only their labels. Don't select those IDs twice. Set `GROUP_SELECT`, `GROUP_BY`, and `GROUP_ORDER` to the needed aliases on `x`.

For subsidiary and carrier, set `GROUP_INPUTS` to `e.subsidiary AS subsidiary_id, BUILTIN.DF(e.subsidiary) AS subsidiary_label, BUILTIN.DF(a.custrecord_bt_emp_bp_carrier) AS carrier_label`. Set `GROUP_SELECT` to `x.subsidiary_id`, `MIN(x.subsidiary_label)`, `x.carrier_id`, and `MIN(x.carrier_label)`. Set `GROUP_BY` and `GROUP_ORDER` to `x.subsidiary_id, x.carrier_id`. Use the same scope without groups for distinct review totals. Don't infer an employee count from the review total.

<!-- BEGIN SQL review_groups_joint -->
```sql
SELECT {{GROUP_SELECT}},
       COUNT(DISTINCT CASE WHEN x.benefit_id IS NULL OR x.benefit_type_id IS NULL
         OR x.carrier_id IS NULL OR x.coverage_id IS NULL
         OR x.employee_cost IS NULL OR x.employer_cost IS NULL OR x.total_cost IS NULL
         OR (x.employee_cost IS NOT NULL AND x.employer_cost IS NOT NULL
           AND x.total_cost IS NOT NULL AND x.total_cost <> x.employee_cost + x.employer_cost)
         OR x.employee_cost = 0 OR x.employer_cost = 0 OR x.total_cost = 0
         OR x.employee_cost < 0 OR x.employer_cost < 0 OR x.total_cost < 0
         THEN x.assignment_id END) AS review_records,
       COUNT(DISTINCT CASE WHEN x.benefit_id IS NULL OR x.benefit_type_id IS NULL
         OR x.carrier_id IS NULL OR x.coverage_id IS NULL THEN x.assignment_id END) AS incomplete_records,
       COUNT(DISTINCT CASE WHEN x.employee_cost IS NULL OR x.employer_cost IS NULL
         OR x.total_cost IS NULL THEN x.assignment_id END) AS missing_amount_records,
       COUNT(DISTINCT CASE WHEN x.employee_cost IS NOT NULL AND x.employer_cost IS NOT NULL
         AND x.total_cost IS NOT NULL AND x.total_cost <> x.employee_cost + x.employer_cost
         THEN x.assignment_id END) AS mismatch_records,
       COUNT(DISTINCT CASE WHEN x.employee_cost = 0 OR x.employer_cost = 0 OR x.total_cost = 0 THEN x.assignment_id END) AS zero_cost_records,
       COUNT(DISTINCT CASE WHEN x.employee_cost < 0 OR x.employer_cost < 0 OR x.total_cost < 0 THEN x.assignment_id END) AS negative_cost_records,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM (
  SELECT {{GROUP_INPUTS}}, a.id AS assignment_id,
         a.custrecord_bt_emp_bp_plan AS benefit_id, a.custrecord_bt_emp_bp_type AS benefit_type_id,
         a.custrecord_bt_emp_bp_carrier AS carrier_id, a.custrecord_bt_emp_bp_coverage AS coverage_id,
         ROUND(a.custrecord_bt_emp_bp_employee_cost, 2) AS employee_cost,
         ROUND(a.custrecord_bt_emp_bp_employer_cost, 2) AS employer_cost,
         ROUND(a.custrecord_bt_emp_bp_total_cost, 2) AS total_cost
  FROM employee e
  {{EMPLOYEE_JOIN}}
  JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
  WHERE e.isinactive = 'F'
    AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
    AND ({{EMPLOYEE_SCOPE}})
    AND ({{ASSIGNMENT_SCOPE}})
) x
GROUP BY {{GROUP_BY}} ORDER BY {{GROUP_ORDER}}
```
<!-- END SQL review_groups_joint -->

### missing_amounts_summary

Use this for blank amount counts. For a single amount, select only its `CASE` expression and source field. Currency checks, comparison, and rounding aren't needed. Zero is recorded, so leave it out of blank counts.

<!-- BEGIN SQL missing_amounts_summary -->
```sql
SELECT COUNT(DISTINCT CASE WHEN a.custrecord_bt_emp_bp_employee_cost IS NULL
         OR a.custrecord_bt_emp_bp_employer_cost IS NULL OR a.custrecord_bt_emp_bp_total_cost IS NULL
         THEN a.id END) AS missing_amount_records,
       COUNT(DISTINCT CASE WHEN a.custrecord_bt_emp_bp_employee_cost IS NULL THEN a.id END) AS blank_employee_amounts,
       COUNT(DISTINCT CASE WHEN a.custrecord_bt_emp_bp_employer_cost IS NULL THEN a.id END) AS blank_employer_amounts,
       COUNT(DISTINCT CASE WHEN a.custrecord_bt_emp_bp_total_cost IS NULL THEN a.id END) AS blank_total_amounts,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
```
<!-- END SQL missing_amounts_summary -->

### missing_fields_summary

Use this for requested missing field counts. Leave out monetary fields and currency. For one field, select only its `CASE` expression.

<!-- BEGIN SQL missing_fields_summary -->
```sql
SELECT COUNT(DISTINCT CASE WHEN a.custrecord_bt_emp_bp_plan IS NULL THEN a.id END) AS missing_benefit_records,
       COUNT(DISTINCT CASE WHEN a.custrecord_bt_emp_bp_type IS NULL THEN a.id END) AS missing_type_records,
       COUNT(DISTINCT CASE WHEN a.custrecord_bt_emp_bp_carrier IS NULL THEN a.id END) AS missing_carrier_records,
       COUNT(DISTINCT CASE WHEN a.custrecord_bt_emp_bp_coverage IS NULL THEN a.id END) AS missing_coverage_records,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
```
<!-- END SQL missing_fields_summary -->

## Complete snapshot and requested review details

For a broad portfolio snapshot, select the complete combined review work list unless the request says summary-only. Run `review_details` with the matching `review_summary`. The requested chat, report, or dashboard format doesn't change this selection. If checked `review_records` is zero under identical scope and finding predicates, report an empty list without a detail read. A zero count for one issue category doesn't establish an empty combined list.

For the complete work list:

- Select employee and assignment identities, Benefit identity and label, compared amounts, and actionable flags. For narrow questions, select only the relevant fields and flags.
- Set `DETAIL_SCOPE` to `x.mismatch_flag = 1 OR x.missing_benefit_flag = 1 OR x.missing_type_flag = 1 OR x.missing_carrier_flag = 1 OR x.missing_coverage_flag = 1 OR x.null_employee_flag = 1 OR x.null_employer_flag = 1 OR x.null_total_flag = 1 OR x.zero_employee_flag = 1 OR x.zero_employer_flag = 1 OR x.zero_total_flag = 1 OR x.negative_employee_flag = 1 OR x.negative_employer_flag = 1 OR x.negative_total_flag = 1`.
- Add organization or other labels only when requested or needed for verified filtering. Type, Carrier, and Coverage IDs establish missing field flags. Their labels aren't needed for the default list.
- Use checked flags and rounded values for reasons, evidence, and verification actions as described in [output.md](output.md). Don't invent causes or an authoritative cost source.

### review_detail_inputs

Use this input for the complete combined review list. It adds employee identity and Benefit label to the review inputs. Leave out organization and unrelated labels.

<!-- BEGIN SQL review_detail_inputs -->
```sql
SELECT e.id AS employee_id, e.entityid AS employee_name, a.id AS assignment_id,
       a.custrecord_bt_emp_bp_plan AS benefit_id,
       BUILTIN.DF(a.custrecord_bt_emp_bp_plan) AS benefit_label,
       a.custrecord_bt_emp_bp_type AS benefit_type_id,
       a.custrecord_bt_emp_bp_carrier AS carrier_id,
       a.custrecord_bt_emp_bp_coverage AS coverage_id,
       ROUND(a.custrecord_bt_emp_bp_employee_cost, 2) AS employee_cost,
       ROUND(a.custrecord_bt_emp_bp_employer_cost, 2) AS employer_cost,
       ROUND(a.custrecord_bt_emp_bp_total_cost, 2) AS total_cost
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
```
<!-- END SQL review_detail_inputs -->

### review_detail_flags

Use this projection for identities, Benefit, compared amounts, components and difference returned by SQL, and actionable flags. Inputs are rounded to two decimals. `component_total` requires both component amounts. `difference` also requires recorded total. SQL preserves a missing operand as null instead of zero. Copy returned calculations into row evidence without local arithmetic. For a focused missing field question, use its targeted template.

<!-- BEGIN SQL review_detail_flags -->
```sql
SELECT r.employee_id AS employee_id, r.employee_name AS employee_name, r.assignment_id AS assignment_id, r.benefit_id AS benefit_id, r.benefit_label AS benefit_label, r.employee_cost AS employee_cost, r.employer_cost AS employer_cost, r.total_cost AS total_cost,
       ROUND(r.employee_cost + r.employer_cost, 2) AS component_total,
       ROUND(r.total_cost - (r.employee_cost + r.employer_cost), 2) AS difference,
       CASE WHEN r.benefit_id IS NULL THEN 1 ELSE 0 END AS missing_benefit_flag,
       CASE WHEN r.benefit_type_id IS NULL THEN 1 ELSE 0 END AS missing_type_flag,
       CASE WHEN r.carrier_id IS NULL THEN 1 ELSE 0 END AS missing_carrier_flag,
       CASE WHEN r.coverage_id IS NULL THEN 1 ELSE 0 END AS missing_coverage_flag,
       CASE WHEN r.employee_cost IS NULL THEN 1 ELSE 0 END AS null_employee_flag,
       CASE WHEN r.employer_cost IS NULL THEN 1 ELSE 0 END AS null_employer_flag,
       CASE WHEN r.total_cost IS NULL THEN 1 ELSE 0 END AS null_total_flag,
       CASE WHEN r.employee_cost IS NOT NULL AND r.employer_cost IS NOT NULL AND
         r.total_cost IS NOT NULL AND r.total_cost <> r.employee_cost + r.employer_cost THEN 1 ELSE 0 END AS mismatch_flag,
       CASE WHEN r.employee_cost = 0 THEN 1 ELSE 0 END AS zero_employee_flag,
       CASE WHEN r.employer_cost = 0 THEN 1 ELSE 0 END AS zero_employer_flag,
       CASE WHEN r.total_cost = 0 THEN 1 ELSE 0 END AS zero_total_flag,
       CASE WHEN r.employee_cost < 0 THEN 1 ELSE 0 END AS negative_employee_flag,
       CASE WHEN r.employer_cost < 0 THEN 1 ELSE 0 END AS negative_employer_flag,
       CASE WHEN r.total_cost < 0 THEN 1 ELSE 0 END AS negative_total_flag
FROM ({{REVIEW_DETAIL_INPUTS}}) r
```
<!-- END SQL review_detail_flags -->

### review_details

Use this complete list for a broad snapshot or an explicit request for complete details. Leave it out of summary-only snapshots and simple overviews. The default `DETAIL_SCOPE` includes mismatch, four descriptive missing field flags, three blank amount flags, and six zero or negative amount flags. Select fewer fields for narrow questions. Use Medium over Low when both apply. Reserve High for the separate employee gap list.

<!-- BEGIN SQL review_details -->
```sql
SELECT x.employee_id AS employee_id, x.employee_name AS employee_name, x.assignment_id AS assignment_id, x.benefit_id AS benefit_id, x.benefit_label AS benefit_label, x.employee_cost AS employee_cost, x.employer_cost AS employer_cost, x.total_cost AS total_cost, x.component_total AS component_total, x.difference AS difference, x.missing_benefit_flag AS missing_benefit_flag, x.missing_type_flag AS missing_type_flag, x.missing_carrier_flag AS missing_carrier_flag, x.missing_coverage_flag AS missing_coverage_flag, x.null_employee_flag AS null_employee_flag, x.null_employer_flag AS null_employer_flag, x.null_total_flag AS null_total_flag, x.mismatch_flag AS mismatch_flag, x.zero_employee_flag AS zero_employee_flag, x.zero_employer_flag AS zero_employer_flag, x.zero_total_flag AS zero_total_flag, x.negative_employee_flag AS negative_employee_flag, x.negative_employer_flag AS negative_employer_flag, x.negative_total_flag AS negative_total_flag,
       CASE WHEN x.missing_benefit_flag = 1 OR x.missing_type_flag = 1 OR x.missing_carrier_flag = 1 OR x.missing_coverage_flag = 1
         OR x.null_employee_flag = 1 OR x.null_employer_flag = 1 OR x.null_total_flag = 1 OR x.mismatch_flag = 1
         THEN 'Medium' ELSE 'Low' END AS review_priority,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM ({{REVIEW_DETAIL_FLAGS}}) x
WHERE {{DETAIL_SCOPE}}
ORDER BY CASE WHEN x.missing_benefit_flag = 1 OR x.missing_type_flag = 1 OR x.missing_carrier_flag = 1 OR x.missing_coverage_flag = 1
  OR x.null_employee_flag = 1 OR x.null_employer_flag = 1 OR x.null_total_flag = 1 OR x.mismatch_flag = 1 THEN 1 ELSE 2 END,
  x.assignment_id
```
<!-- END SQL review_details -->

- Read every page under the active connector's retrieval rules. Preserve SQL priority, stable assignment ID order, and identical SQL across pages.
- Reconcile the complete list to the matching scoped `review_summary`. Follow [snapshot-checks.md](snapshot-checks.md) for the required checks.
- Keep one row per assignment, even when several flags apply. The flagged rows are a subset of monetary assignments. Their amounts don't reconcile to overall monthly cost totals.
- If identities or fields are denied, or the list can't be checked completely, mark the workspace blocked and the snapshot partial.

For an explicitly illustrative follow-up, wrap the ordered detail selection in an outer `SELECT` with the same explicit aliases and a `ROWNUM` bound. Label the rows as examples and use the complete issue aggregate for totals. Examples don't satisfy a broad snapshot's complete list requirement. Retain checked pages in conversation and build final output directly.
