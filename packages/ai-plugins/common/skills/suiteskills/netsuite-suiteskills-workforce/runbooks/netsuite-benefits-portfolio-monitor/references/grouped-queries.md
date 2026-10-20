# Grouped Benefits queries

Use these templates for requested grouped counts. Select only the requested grouping fields and counters. Apply the verified population and scope from [sources.md](sources.md).

## Requested grouped counts

These templates count employees with matching assignments. Remove a counter when it isn't requested. For coverage percentages, use the separate full employee denominator in [coverage.md](coverage.md). For a requested total, use the same scoped count without grouping. Don't add employee counts across assignment dimensions.

### assignment_groups

<!-- BEGIN SQL assignment_groups -->
```sql
SELECT {{GROUP_ID}} AS group_id, MIN({{GROUP_LABEL}}) AS group_label,
       COUNT(DISTINCT e.id) AS employee_count, COUNT(DISTINCT a.id) AS assignment_rows,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
GROUP BY {{GROUP_ID}} ORDER BY group_id
```
<!-- END SQL assignment_groups -->

### assignment_groups_joint

Set `GROUP_SELECT`, `GROUP_BY`, and `GROUP_ORDER` to the requested group tuple.

<!-- BEGIN SQL assignment_groups_joint -->
```sql
SELECT {{GROUP_SELECT}}, COUNT(DISTINCT e.id) AS employee_count,
       COUNT(DISTINCT a.id) AS assignment_rows,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
GROUP BY {{GROUP_BY}} ORDER BY {{GROUP_ORDER}}
```
<!-- END SQL assignment_groups_joint -->

### gap_groups_joint

Use only employee or organization dimensions, including verified Supervisor, for actual gaps. Set `GROUP_SELECT`, `GROUP_BY`, and `GROUP_ORDER` without referencing `a`. For one dimension, use its single pair in those fragments.

<!-- BEGIN SQL gap_groups_joint -->
```sql
SELECT {{GROUP_SELECT}}, COUNT(DISTINCT e.id) AS employees_without_benefits,
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
GROUP BY {{GROUP_BY}} ORDER BY {{GROUP_ORDER}}
```
<!-- END SQL gap_groups_joint -->
