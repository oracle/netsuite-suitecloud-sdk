# Monthly cost queries

Use these examples to answer monthly cost questions. Select only the requested monetary metrics and groups. Read [review.md](review.md) when assignment review is requested.

## Contents

- [Monthly amounts and requested grouping](#monthly-amounts-and-requested-grouping) contains totals and group templates.
- [Optional monetary calculations](#optional-monetary-calculations) contains employer share and annualization.
- [Optional cost patterns](#optional-cost-patterns) contains zero and negative amount checks.

## Apply calculation rules

- Round each source amount to two decimals before aggregation or comparison. `SUM` ignores blanks and returns null when every value is blank.
- Calculate component total as `SUM(employee) + SUM(employer)`, not `SUM(employee + employer)`. Include partial recorded components. If either component aggregate is entirely blank, show components and difference as unavailable.
- Preserve blank counts for required total quality checks. Calculate employer share only when every included Employee and Employer amount is present and nonnegative, and the component total is positive.
- Use `GROUP_ID` and `GROUP_LABEL` from the requested pair in [sources.md](sources.md). Select only the requested tuple for joint groups. Combine optional expressions in one scoped aggregate when practical.
- Use `cost_totals` for a requested Total row. Don't add monetary figures in the agent. Distinct employees can overlap across assignment groups. Assignments and monetary sums partition across complete group tuples.
- Add employee or assignment counts only when requested. Combine their counters from `assignment_groups` into the monetary aggregate when practical, adding only the needed IDs.
- Treat difference as a net aggregate. Opposing mismatches can cancel. Check field meaning and inputs before recommending corrections. Neither recorded totals nor components become authoritative because they differ.
- Publish calculations and magnitude comparisons only from figures returned by SQL. Numeric ordering doesn't establish business priority. Disclose the source rounding policy for monetary analysis. Don't claim additional owner approval without evidence.

## Monthly amounts and requested grouping

### cost_amounts

Select only three rounded amounts for the aggregate input. Leave out names, IDs, groups, flags, and labels.

<!-- BEGIN SQL cost_amounts -->
```sql
SELECT ROUND(a.custrecord_bt_emp_bp_employee_cost, 2) AS employee_cost,
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
<!-- END SQL cost_amounts -->

### grouped_cost_amounts

Select input for one requested group. Set `GROUP_ID` and `GROUP_LABEL` to a verified employee, organization, or assignment pair from [sources.md](sources.md). For several dimensions, use `cost_groups_joint`.

<!-- BEGIN SQL grouped_cost_amounts -->
```sql
SELECT {{GROUP_ID}} AS group_id, {{GROUP_LABEL}} AS group_label,
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
<!-- END SQL grouped_cost_amounts -->

### cost_totals

Use this for monthly totals and required blank amount checks. Leave out coverage, review, employer share, and annualization.

<!-- BEGIN SQL cost_totals -->
```sql
SELECT SUM(x.employee_cost) AS employee_pays, SUM(x.employer_cost) AS employer_pays,
       SUM(x.employee_cost) + SUM(x.employer_cost) AS component_total,
       SUM(x.total_cost) AS recorded_total,
       SUM(x.total_cost) - (SUM(x.employee_cost) + SUM(x.employer_cost)) AS difference,
       COUNT(CASE WHEN x.employee_cost IS NULL THEN 1 END) AS blank_employee_amounts,
       COUNT(CASE WHEN x.employer_cost IS NULL THEN 1 END) AS blank_employer_amounts,
       COUNT(CASE WHEN x.total_cost IS NULL THEN 1 END) AS blank_total_amounts,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM ({{COST_AMOUNTS}}) x
```
<!-- END SQL cost_totals -->

### cost_groups

Use this for one requested dimension. Use `cost_totals` for a Total row only when requested. Leave out unrequested dimensions.

<!-- BEGIN SQL cost_groups -->
```sql
SELECT x.group_id AS group_id, MIN(x.group_label) AS group_label,
       SUM(x.employee_cost) AS employee_pays, SUM(x.employer_cost) AS employer_pays,
       SUM(x.employee_cost) + SUM(x.employer_cost) AS component_total,
       SUM(x.total_cost) AS recorded_total,
       SUM(x.total_cost) - (SUM(x.employee_cost) + SUM(x.employer_cost)) AS difference,
       COUNT(CASE WHEN x.employee_cost IS NULL THEN 1 END) AS blank_employee_amounts,
       COUNT(CASE WHEN x.employer_cost IS NULL THEN 1 END) AS blank_employer_amounts,
       COUNT(CASE WHEN x.total_cost IS NULL THEN 1 END) AS blank_total_amounts,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM ({{GROUPED_COST_AMOUNTS}}) x
GROUP BY x.group_id ORDER BY component_total DESC, group_id
```
<!-- END SQL cost_groups -->

### cost_groups_joint

Set `GROUP_INPUTS` to each requested ID and label from [sources.md](sources.md). Set `GROUP_SELECT` to those IDs on `x` and `MIN` of their labels. Set `GROUP_BY` and `GROUP_ORDER` to all `x` IDs or codes.

For subsidiary and carrier, set `GROUP_INPUTS` to `e.subsidiary AS subsidiary_id, BUILTIN.DF(e.subsidiary) AS subsidiary_label, a.custrecord_bt_emp_bp_carrier AS carrier_id, BUILTIN.DF(a.custrecord_bt_emp_bp_carrier) AS carrier_label`. Set `GROUP_SELECT` to `x.subsidiary_id AS subsidiary_id, MIN(x.subsidiary_label) AS subsidiary_label, x.carrier_id AS carrier_id, MIN(x.carrier_label) AS carrier_label`. Set `GROUP_BY` and `GROUP_ORDER` to `x.subsidiary_id, x.carrier_id`.

<!-- BEGIN SQL cost_groups_joint -->
```sql
SELECT {{GROUP_SELECT}}, SUM(x.employee_cost) AS employee_pays,
       SUM(x.employer_cost) AS employer_pays,
       SUM(x.employee_cost) + SUM(x.employer_cost) AS component_total,
       SUM(x.total_cost) AS recorded_total,
       SUM(x.total_cost) - (SUM(x.employee_cost) + SUM(x.employer_cost)) AS difference,
       COUNT(CASE WHEN x.employee_cost IS NULL THEN 1 END) AS blank_employee_amounts,
       COUNT(CASE WHEN x.employer_cost IS NULL THEN 1 END) AS blank_employer_amounts,
       COUNT(CASE WHEN x.total_cost IS NULL THEN 1 END) AS blank_total_amounts,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM (
  SELECT {{GROUP_INPUTS}},
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
GROUP BY {{GROUP_BY}} ORDER BY component_total DESC, {{GROUP_ORDER}}
```
<!-- END SQL cost_groups_joint -->

## Optional monetary calculations

Calculate employer share as Employer pays divided by components. Annualize the current month by multiplying it by 12. Don't present this as historical spending or a forecast. For groups, add only the requested tuple to `SELECT` and `GROUP BY` with verified expressions. Leave out unused amounts.

### cost_share

Use only Employee and Employer amounts for employer share. Return Unavailable if any included amount is blank or negative, or the rounded component total isn't positive. Apply the same check to each requested group. Combine this expression with other requested cost metrics when practical.

<!-- BEGIN SQL cost_share -->
```sql
SELECT CASE WHEN SUM(CASE WHEN a.custrecord_bt_emp_bp_employee_cost IS NULL
                            OR a.custrecord_bt_emp_bp_employer_cost IS NULL
                            OR a.custrecord_bt_emp_bp_employee_cost < 0
                            OR a.custrecord_bt_emp_bp_employer_cost < 0
                       THEN 1 ELSE 0 END) = 0
                  AND SUM(ROUND(a.custrecord_bt_emp_bp_employee_cost, 2))
                    + SUM(ROUND(a.custrecord_bt_emp_bp_employer_cost, 2)) > 0
            THEN ROUND(100.0 * SUM(ROUND(a.custrecord_bt_emp_bp_employer_cost, 2))
                 / (SUM(ROUND(a.custrecord_bt_emp_bp_employee_cost, 2))
                   + SUM(ROUND(a.custrecord_bt_emp_bp_employer_cost, 2))), 2)
            ELSE NULL END AS employer_share_percent,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM employee e
{{EMPLOYEE_JOIN}}
JOIN customrecord_bt_emp_benefit_plan a ON a.custrecord_bt_emp_bp_employee = e.id
WHERE e.isinactive = 'F'
  AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)
  AND ({{EMPLOYEE_SCOPE}})
  AND ({{ASSIGNMENT_SCOPE}})
```
<!-- END SQL cost_share -->

### annualized_costs

Use this to annualize the current month. It doesn't show actual annual history. Combine it with other requested monetary metrics when practical.

<!-- BEGIN SQL annualized_costs -->
```sql
SELECT 12 * (SUM(x.employee_cost) + SUM(x.employer_cost)) AS annualized_components,
       12 * SUM(x.total_cost) AS annualized_recorded,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM ({{COST_AMOUNTS}}) x
```
<!-- END SQL annualized_costs -->

## Optional cost patterns

Use these templates for focused zero or negative amount questions. Those amounts already appear in the default review union. Count distinct assignments. The comprehensive examples read rounded amounts and assignment identity, without Benefit completeness or organization fields. For one pattern, select only the required amounts, aggregate or flag, and predicate. For a named work list, add the needed identities and requested Benefit label.

### cost_pattern_inputs

Select the assignment ID and three rounded amounts. Leave out Benefit completeness fields.

<!-- BEGIN SQL cost_pattern_inputs -->
```sql
SELECT a.id AS assignment_id, ROUND(a.custrecord_bt_emp_bp_employee_cost, 2) AS employee_cost,
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
<!-- END SQL cost_pattern_inputs -->

### cost_pattern_summary

Use this for a comprehensive summary of cost patterns. For one pattern, select one aggregate and its needed amounts. These counts can overlap default review counts. Don't add them as distinct assignments.

<!-- BEGIN SQL cost_pattern_summary -->
```sql
SELECT COUNT(DISTINCT CASE WHEN x.employee_cost IS NULL THEN x.assignment_id END) AS blank_employee_amounts,
       COUNT(DISTINCT CASE WHEN x.employer_cost IS NULL THEN x.assignment_id END) AS blank_employer_amounts,
       COUNT(DISTINCT CASE WHEN x.total_cost IS NULL THEN x.assignment_id END) AS blank_total_amounts,
       COUNT(DISTINCT CASE WHEN x.employee_cost = 0 THEN x.assignment_id END) AS zero_employee_amounts,
       COUNT(DISTINCT CASE WHEN x.employer_cost = 0 THEN x.assignment_id END) AS zero_employer_amounts,
       COUNT(DISTINCT CASE WHEN x.total_cost = 0 THEN x.assignment_id END) AS zero_total_amounts,
       COUNT(DISTINCT CASE WHEN x.employee_cost < 0 THEN x.assignment_id END) AS negative_employee_amounts,
       COUNT(DISTINCT CASE WHEN x.employer_cost < 0 THEN x.assignment_id END) AS negative_employer_amounts,
       COUNT(DISTINCT CASE WHEN x.total_cost < 0 THEN x.assignment_id END) AS negative_total_amounts,
       COUNT(DISTINCT CASE WHEN x.employee_cost = 0 OR x.employer_cost = 0 THEN x.assignment_id END) AS zero_component_records,
       COUNT(DISTINCT CASE WHEN x.employee_cost < 0 OR x.employer_cost < 0 THEN x.assignment_id END) AS negative_component_records,
       COUNT(DISTINCT CASE WHEN x.total_cost = 0 AND x.employee_cost + x.employer_cost <> 0 THEN x.assignment_id END) AS zero_total_with_components,
       COUNT(DISTINCT CASE WHEN x.total_cost = 0 AND x.employee_cost = 0 AND x.employer_cost = 0 THEN x.assignment_id END) AS all_three_zero_records,
       TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS query_date
FROM ({{COST_PATTERN_INPUTS}}) x
```
<!-- END SQL cost_pattern_summary -->

### cost_pattern_flags

Use this for cost pattern details. Return only amounts and their flags. Add employee and Benefit identities when the requested work list needs them.

<!-- BEGIN SQL cost_pattern_flags -->
```sql
SELECT r.assignment_id AS assignment_id, r.employee_cost AS employee_cost,
       r.employer_cost AS employer_cost, r.total_cost AS total_cost,
       CASE WHEN r.employee_cost IS NULL THEN 1 ELSE 0 END AS null_employee_flag,
       CASE WHEN r.employer_cost IS NULL THEN 1 ELSE 0 END AS null_employer_flag,
       CASE WHEN r.total_cost IS NULL THEN 1 ELSE 0 END AS null_total_flag,
       CASE WHEN r.employee_cost = 0 THEN 1 ELSE 0 END AS zero_employee_flag,
       CASE WHEN r.employer_cost = 0 THEN 1 ELSE 0 END AS zero_employer_flag,
       CASE WHEN r.total_cost = 0 THEN 1 ELSE 0 END AS zero_total_flag,
       CASE WHEN r.employee_cost < 0 THEN 1 ELSE 0 END AS negative_employee_flag,
       CASE WHEN r.employer_cost < 0 THEN 1 ELSE 0 END AS negative_employer_flag,
       CASE WHEN r.total_cost < 0 THEN 1 ELSE 0 END AS negative_total_flag
FROM ({{COST_PATTERN_INPUTS}}) r
```
<!-- END SQL cost_pattern_flags -->
