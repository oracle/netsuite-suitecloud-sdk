# Focused Benefits queries

Use these templates for focused answers and requested work lists. Apply the verified population and scope from [sources.md](sources.md). Remove unrequested fields before execution.

## Contents

- [subsidiary_resolution](#subsidiary_resolution) resolves a named subsidiary.
- [assigned_benefits](#assigned_benefits), [assignment_list](#assignment_list), and [blank_carrier_assignments](#blank_carrier_assignments) answer assignment questions.
- [employee_count](#employee_count) and [assignment_count](#assignment_count) give focused counts.
- [employees_without_benefits](#employees_without_benefits) and [gap_organization_details](#gap_organization_details) find actual employee gaps.

### subsidiary_resolution

Return candidate subsidiary IDs and names. Add country only for a country question.

<!-- BEGIN SQL subsidiary_resolution -->
```sql
SELECT s.id AS subsidiary_id, s.name AS subsidiary_name
FROM subsidiary s WHERE LOWER(s.name) LIKE '{{NAME_PATTERN}}' ORDER BY s.id
```
<!-- END SQL subsidiary_resolution -->

### assigned_benefits

Return distinct Benefit IDs and names. A null Benefit identifies an assignment with no Benefit recorded.

<!-- BEGIN SQL assigned_benefits -->
```sql
SELECT DISTINCT a.custrecord_bt_emp_bp_plan AS benefit_id,
       BUILTIN.DF(a.custrecord_bt_emp_bp_plan) AS benefit_label,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
ORDER BY benefit_id, benefit_label
```
<!-- END SQL assigned_benefits -->

### assignment_list

Use this for a minimal assignment list. Add requested Type, Carrier, Coverage, organization, or amount fields. Include IDs when needed to tell blanks from unresolved names.

<!-- BEGIN SQL assignment_list -->
```sql
SELECT e.id AS employee_id, e.entityid AS employee_name, a.id AS assignment_id,
       a.custrecord_bt_emp_bp_plan AS benefit_id,
       BUILTIN.DF(a.custrecord_bt_emp_bp_plan) AS benefit_label,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
ORDER BY e.id, a.id
```
<!-- END SQL assignment_list -->

### blank_carrier_assignments

Use this for assignments with blank Carrier. The predicate reads Carrier. Leave out costs, other required fields, and organization labels.

<!-- BEGIN SQL blank_carrier_assignments -->
```sql
SELECT e.id AS employee_id, e.entityid AS employee_name, a.id AS assignment_id,
       a.custrecord_bt_emp_bp_plan AS benefit_id,
       BUILTIN.DF(a.custrecord_bt_emp_bp_plan) AS benefit_label,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
  AND a.custrecord_bt_emp_bp_carrier IS NULL
ORDER BY e.id, a.id
```
<!-- END SQL blank_carrier_assignments -->

### employee_count

Count distinct employees with matching assignments. The query returns one row even when the count is zero.

<!-- BEGIN SQL employee_count -->
```sql
SELECT COUNT(DISTINCT e.id) AS employee_count,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
```
<!-- END SQL employee_count -->

### assignment_count

Use this when an assignment count is requested or needed to reconcile a complete assignment list.

<!-- BEGIN SQL assignment_count -->
```sql
SELECT COUNT(a.id) AS assignment_rows,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
```
<!-- END SQL assignment_count -->

### employees_without_benefits

Use this for the complete employee gap list. Add Department or Supervisor only when requested. For a broad review workspace, set `GAP_PRIORITY` to `, 'High' AS review_priority`. For a focused gap question, set it to an empty string. `NOT EXISTS` checks every assignment, not only a selected Benefit.

<!-- BEGIN SQL employees_without_benefits -->
```sql
SELECT e.id AS employee_id, e.entityid AS employee_name{{GAP_PRIORITY}},
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
ORDER BY e.id
```
<!-- END SQL employees_without_benefits -->

### gap_organization_details

Use this to check whether Class, Department, and Location are all blank or at least one is present. Add the expression to the selected gap query only when needed. Don't fetch the same list twice.

<!-- BEGIN SQL gap_organization_details -->
```sql
SELECT e.id AS employee_id,
       CASE WHEN e.class IS NULL AND e.department IS NULL AND e.location IS NULL
         THEN 1 ELSE 0 END AS organization_fields_blank,
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
ORDER BY e.id
```
<!-- END SQL gap_organization_details -->
