# Coverage query examples

Use these examples to answer coverage questions for current employees. Read [sources.md](sources.md) for scope and the optional `EMPLOYEE_JOIN`.

## Contents

- [coverage_headline](#coverage_headline) and [actual_gap_count](#actual_gap_count) give overall counts.
- [coverage_groups](#coverage_groups) and [coverage_groups_joint](#coverage_groups_joint) group coverage by employee or organization fields.
- [one_benefit_count](#one_benefit_count), [benefit_type_counts](#benefit_type_counts), and [benefit_type_coverage](#benefit_type_coverage) answer optional Benefit questions.
- [assignment_group_coverage](#assignment_group_coverage) gives percentages by assignment fields.

## Select the answer

- Select only the requested metrics. Basic coverage needs current, covered, and gap employee counts and their percentage. Add organization completeness, assignment counts, exactly one Benefit, or Benefit Type breakdowns only when requested.
- Count coverage by assignment presence among current employees. Put the assignment predicate in the `LEFT JOIN` so the agreed employee denominator remains intact.
- Show null organization groups as "Not recorded." Employee counts and percentages can overlap across Benefit, Type, Carrier, and Coverage groups. Don't add them.
- Clarify an ambiguous denominator for an assignment filter before querying. For a standalone count, don't read an extra denominator. Include the query date in fresh final answers, including grouped answers.

## Check actual gaps

- For a broad snapshot, select the complete employee gap list from [focused-queries.md](focused-queries.md#employees_without_benefits), unless the request says summary-only. Add organization fields only when requested or needed for verified filtering. Follow [output.md](output.md) for the list's evidence and presentation.
- Treat an employee as an actual gap only when the employee has no assignment. A blank Benefit on an existing assignment isn't an employee gap. Apply this definition even when the report filters assignments.
- When `ASSIGNMENT_SCOPE` has no filter, reuse `coverage_headline`'s `employees_without_matching_assignments` as the actual gap count. It can establish an empty list and reconcile the complete list.
- When assignments are filtered, `employees_without_matching_assignments` means no matching assignment. Use `actual_gap_count` for the actual gap total unless an equivalent checked count already exists. Reconcile the complete list to that actual gap count under the same employee scope.
- If the matching actual gap count is zero, report an empty list without reading employee identities. Otherwise, read every page and reconcile distinct employee rows. For a broad snapshot, if the pages or count can't be checked, follow [snapshot-checks.md](snapshot-checks.md) for the blocked workspace.

### coverage_headline

Use this for basic coverage counts and percentage. Leave out optional organization, Benefit, and assignment counts.

<!-- BEGIN SQL coverage_headline -->
```sql
SELECT COUNT(DISTINCT e.id) AS current_employees,
       COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN e.id END) AS covered_employees,
       COUNT(DISTINCT CASE WHEN a.id IS NULL THEN e.id END) AS employees_without_matching_assignments,
       ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN e.id END)
         / NULLIF(COUNT(DISTINCT e.id), 0), 2) AS coverage_percent,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
LEFT JOIN customrecord_bt_emp_benefit_plan a
  ON a.custrecord_bt_emp_bp_employee = e.id AND ({{ASSIGNMENT_SCOPE}})
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
```
<!-- END SQL coverage_headline -->

### actual_gap_count

Use this for the actual gap count under the current employee scope when `coverage_headline` doesn't already provide it. The `NOT EXISTS` predicate checks every assignment, even when the report filters assignments.

<!-- BEGIN SQL actual_gap_count -->
```sql
SELECT COUNT(DISTINCT e.id) AS employees_without_benefits,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND NOT EXISTS (
    SELECT 1 FROM customrecord_bt_emp_benefit_plan a2
    WHERE a2.custrecord_bt_emp_bp_employee = e.id
  )
```
<!-- END SQL actual_gap_count -->

### coverage_groups

Use one requested employee or organization dimension from [sources.md](sources.md), including employee or country. Set `GROUP_LABEL` to its verified label expression. For assignment dimensions, use [assignment_group_coverage](#assignment_group_coverage).

<!-- BEGIN SQL coverage_groups -->
```sql
SELECT {{GROUP_ID}} AS group_id, MIN({{GROUP_LABEL}}) AS group_label,
       COUNT(DISTINCT e.id) AS current_employees,
       COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN e.id END) AS covered_employees,
       COUNT(DISTINCT CASE WHEN a.id IS NULL THEN e.id END) AS employees_without_matching_assignments,
       ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN e.id END)
         / NULLIF(COUNT(DISTINCT e.id), 0), 2) AS coverage_percent,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
LEFT JOIN customrecord_bt_emp_benefit_plan a
  ON a.custrecord_bt_emp_bp_employee = e.id AND ({{ASSIGNMENT_SCOPE}})
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
GROUP BY {{GROUP_ID}}
ORDER BY group_id
```
<!-- END SQL coverage_groups -->

### coverage_groups_joint

Use only employee or organization dimensions, so each employee belongs to one group tuple. Set `GROUP_SELECT`, `GROUP_BY`, and `GROUP_ORDER` from [sources.md](sources.md). Include only requested metrics. For assignment dimensions, use [assignment_group_coverage](#assignment_group_coverage) so the denominator remains the full agreed population.

<!-- BEGIN SQL coverage_groups_joint -->
```sql
SELECT {{GROUP_SELECT}}, COUNT(DISTINCT e.id) AS current_employees,
       COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN e.id END) AS covered_employees,
       COUNT(DISTINCT CASE WHEN a.id IS NULL THEN e.id END) AS employees_without_matching_assignments,
       ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN e.id END)
         / NULLIF(COUNT(DISTINCT e.id), 0), 2) AS coverage_percent,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
LEFT JOIN customrecord_bt_emp_benefit_plan a
  ON a.custrecord_bt_emp_bp_employee = e.id AND ({{ASSIGNMENT_SCOPE}})
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
GROUP BY {{GROUP_BY}} ORDER BY {{GROUP_ORDER}}
```
<!-- END SQL coverage_groups_joint -->

### one_benefit_count

Use this for the count of employees with exactly one distinct Benefit. Mirror the assignment predicate with `a2`.

<!-- BEGIN SQL one_benefit_count -->
```sql
SELECT COUNT(DISTINCT e.id) AS one_benefit_employees,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND (SELECT COUNT(DISTINCT a2.custrecord_bt_emp_bp_plan)
       FROM customrecord_bt_emp_benefit_plan a2
       WHERE a2.custrecord_bt_emp_bp_employee = e.id
         AND ({{ASSIGNMENT_SCOPE_A2}})) = 1
```
<!-- END SQL one_benefit_count -->

### benefit_type_counts

Use this for employee counts by Type. Read a denominator only when percentages are requested. An employee can appear in more than one Type row.

<!-- BEGIN SQL benefit_type_counts -->
```sql
SELECT a.custrecord_bt_emp_bp_type AS benefit_type_id,
       MIN(BUILTIN.DF(a.custrecord_bt_emp_bp_type)) AS benefit_type_label,
       COUNT(DISTINCT e.id) AS covered_employees,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
GROUP BY a.custrecord_bt_emp_bp_type ORDER BY benefit_type_id
```
<!-- END SQL benefit_type_counts -->

### benefit_type_coverage

Use this for Type percentages after agreeing on the employee denominator. Apply identical employee scope to the numerator and denominator. Leave out assignment counts and monetary fields.

<!-- BEGIN SQL benefit_type_coverage -->
```sql
SELECT a.custrecord_bt_emp_bp_type AS benefit_type_id,
       MIN(BUILTIN.DF(a.custrecord_bt_emp_bp_type)) AS benefit_type_label,
       COUNT(DISTINCT e.id) AS covered_employees,
       MAX(p.population_employees) AS population_employees,
       ROUND(100.0 * COUNT(DISTINCT e.id) / NULLIF(MAX(p.population_employees), 0), 2) AS coverage_percent,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
CROSS JOIN (
  SELECT COUNT(DISTINCT e.id) AS population_employees
  FROM employee e {{EMPLOYEE_JOIN}}
  WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
) p
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
GROUP BY a.custrecord_bt_emp_bp_type ORDER BY benefit_type_id
```
<!-- END SQL benefit_type_coverage -->

### assignment_group_coverage

For assignment dimensions alone, adapt `benefit_type_counts` or `benefit_type_coverage` with the requested verified ID and label pair. Use the agreed employee denominator, not the count already assigned in each group.

For a mixed organization and assignment group:

- Set `GROUP_SELECT`, `GROUP_BY`, and `GROUP_ORDER` to the full requested tuple.
- Set `POPULATION_SELECT` and `POPULATION_BY` to only its employee or organization dimensions. Join those dimensions to the numerator with a null-safe `POPULATION_JOIN`.
- Apply the same employee scope to both parts. Apply the assignment predicate to the denominator only when it defines the agreed employee population.

For subsidiary and carrier, set `GROUP_SELECT` to `e.subsidiary AS subsidiary_id, MIN(BUILTIN.DF(e.subsidiary)) AS subsidiary_label, a.custrecord_bt_emp_bp_carrier AS carrier_id, MIN(BUILTIN.DF(a.custrecord_bt_emp_bp_carrier)) AS carrier_label`. Set `GROUP_BY` and `GROUP_ORDER` to `e.subsidiary, a.custrecord_bt_emp_bp_carrier`. Set `POPULATION_SELECT` to `e.subsidiary AS population_id`, `POPULATION_BY` to `e.subsidiary`, and `POPULATION_JOIN` to `(p.population_id = e.subsidiary OR (p.population_id IS NULL AND e.subsidiary IS NULL))`. For several organization dimensions, combine one such join condition per dimension with `AND`. Put assignment dimensions only in the numerator tuple. With no organization dimension, use the ungrouped denominator through `CROSS JOIN`, as in `benefit_type_coverage`.

This result gives percentages of employees with assignments in each group. A null assignment dimension means that field is blank on an existing assignment. Employees with no assignment stay in the denominator, not the group with a blank field. For gaps, use their separate requested count or list. For counts alone, use `assignment_groups` without a denominator.

<!-- BEGIN SQL assignment_group_coverage -->
```sql
SELECT {{GROUP_SELECT}}, COUNT(DISTINCT e.id) AS covered_employees,
       MAX(p.population_employees) AS population_employees,
       ROUND(100.0 * COUNT(DISTINCT e.id) / NULLIF(MAX(p.population_employees), 0), 2) AS coverage_percent,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
JOIN (
  SELECT {{POPULATION_SELECT}}, COUNT(DISTINCT e.id) AS population_employees
  FROM employee e
  {{EMPLOYEE_JOIN}}
  WHERE e.isinactive = 'F'
    AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
    AND ({{EMPLOYEE_SCOPE}})
  GROUP BY {{POPULATION_BY}}
) p ON {{POPULATION_JOIN}}
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
GROUP BY {{GROUP_BY}} ORDER BY {{GROUP_ORDER}}
```
<!-- END SQL assignment_group_coverage -->

When several metrics are requested together, combine their expressions under the same scope when practical. Add `assignment_count` or `gap_organization_details` from [focused-queries.md](focused-queries.md) only when needed for the answer or applicable list reconciliation. Build only the requested dimensions.
