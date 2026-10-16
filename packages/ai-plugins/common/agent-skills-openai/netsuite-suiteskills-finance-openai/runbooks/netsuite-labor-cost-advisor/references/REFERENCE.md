# Labor-cost dashboard data and interaction

Read this reference after the eligibility gate in `SKILL.md` passes. Labor Costs Setup identifies available and effective items; it does not prove payroll activity. GL salary-account data is not a fallback in this version.

## Retrieve the scenario base

1. Reuse the two reports validated by the eligibility gate for the same confirmed dates and subsidiary. The submitted standard pair is Labor Costs Report (`-334`) and Labor Costs and Revenue Report (`-335`). An explicitly configured custom pair is usable only after both reports and the required labor and revenue measures are validated. Use the Cost and Revenue report for the scenario base, and display a material difference from the companion Labor Costs Report.
2. Reuse all three Labor Costs Setup queries from `SKILL.md`. Group every available subcategory by its category. A returned preference row with a null or blank value means every available subcategory is effective. Otherwise, parse its comma-separated selected IDs and add Regular Wages (ID `1`). If the preference row is missing, label the saved selection unverified. Never infer historical payroll activity from current setup.
3. Inspect SuiteQL metadata before querying `paycheckSummary`, `paycheck`, `payrollItem`, `employee`, or another source. Discover the joins, fields, date basis, and paid/finalized paycheck statuses in the connected account. Do not hardcode payroll item IDs or assume that a setup subcategory ID is a payroll item ID.
4. Find payroll items mapped to each setup subcategory from account evidence. One subcategory may contain multiple payroll items. Query item totals and paid employee totals for the same period, subsidiary, status, and currency basis as the reports. Exclude reimbursements and lines that the reports exclude. Reconcile each employee sum to its item total, and the combined mapped amount to the labor report. Record uncertain mappings and report gaps.
5. Retrieve every distinct paid employee, including people with no Regular Wages line. Query employee names separately from payroll detail using discovered fields. For each employee and every setup subcategory, store a verified amount, verified zero, or `null` when the mapping or employee amount could not be established. Zero requires a complete query with no matching paid line. Use the actual callable paging schema and supported page size (historical examples use page 0 and size 1000), and exhaust the scoped pages; this retrieval pagination is separate from the dashboard's ten-person display pages.

Example SuiteQL shapes, only after metadata confirms the fields and joins:

```sql
SELECT p.status, ps.itemcategory, COUNT(*) AS line_count,
       SUM(ps.amount) AS total_amount
FROM paycheckSummary ps
JOIN paycheck p ON ps.paycheck = p.id
WHERE p.tranDate >= TO_DATE('<from>', 'YYYY-MM-DD')
  AND p.tranDate <= TO_DATE('<to>', 'YYYY-MM-DD')
GROUP BY p.status, ps.itemcategory
```

```sql
SELECT p.entity AS employee_id, pi.id AS payitem_id, pi.name AS payitem_name,
       SUM(ps.amount) AS amount
FROM paycheckSummary ps
JOIN paycheck p ON ps.paycheck = p.id
JOIN payrollItem pi ON ps.payitem = pi.id
WHERE p.tranDate >= TO_DATE('<from>', 'YYYY-MM-DD')
  AND p.tranDate <= TO_DATE('<to>', 'YYYY-MM-DD')
  AND p.status = '<verified-final-status>'
GROUP BY p.entity, pi.id, pi.name
ORDER BY p.entity, pi.id
```

The query shapes are not a mapping from payroll items to setup subcategories. Establish that mapping separately. If an item cannot be mapped, keep its amount unavailable rather than assigning it to a category by a similar name.

## Data contract

Store a reproducible snapshot alongside or inside the generated dashboard: period, date basis, subsidiary, currency basis, actual report IDs and titles, report totals, retrieval time, setup preference row status and saved value, all setup categories and subcategories, item-to-subcategory mapping evidence, employee IDs/names/item amounts, status filter, query scope, page completeness, and reconciliation differences. Keep absent values unavailable, not zero. Do not put account-specific values in reusable skill files.

Copy `assets/dashboard-template.html` and replace only its `dashboard-data` JSON block. Set `ready` to `true` after verification. Every employee needs one `items` entry for **every** setup subcategory; use `null` for an unavailable amount. Amounts are in the report currency. The following example is synthetic:

```json
{
  "ready": true,
  "period_label": "Selected report period",
  "subsidiary": "Selected subsidiary",
  "currency_symbol": "$",
  "revenue": 1000.00,
  "labor_cost": 400.00,
  "companion_labor_cost": null,
  "regular_wages": 300.00,
  "payroll_item": "Mapped Regular Wages item or explained proxy",
  "mapping_basis": "Evidence for all modeled item mappings",
  "employee_count": 1,
  "employee_detail_status": "Complete for the selected period",
  "employees": [
    {"id": "example-1", "name": "Example Employee", "items": [
      {"subcategory_id": 1, "amount": 100.00},
      {"subcategory_id": 2, "amount": null}
    ]}
  ],
  "scope_note": "Date, status, currency, and retrieval basis",
  "setup_preference_row_found": true,
  "setup_saved_value": null,
  "setup_retrieved_at": "Current setup retrieval time",
  "setup_categories": [{"id": 1, "name": "Earnings/Wages"}],
  "setup_subcategories": [
    {"id": 1, "name": "Regular Wages", "category": 1},
    {"id": 2, "name": "Bonus Wages", "category": 1}
  ]
}
```

Escape any `<` in account text as `\u003c` so names cannot close the JSON block. If `employee_count` exceeds the supplied rows, mark the employee detail partial in `employee_detail_status`. Keep the template visibly unpopulated until `ready` is true and data is valid.

## Calculations and interaction

- Baseline labor cost and revenue come from the same run of standard report `-335`, or its validated custom equivalent. Revenue is fixed.
- The Regular Wages group baseline is `regular_wages`. Its unattributed portion is `regular_wages` minus the sum of verified employee Regular Wages. Other setup item baselines are the sums of verified employee amounts. Any remaining reported labor is fixed unmodeled labor. The template rejects mapped amounts that exceed reported labor.
- Every setup item has a group slider from 0 through 200% of its baseline. Its 100% position restores the baseline. A group slider applies that multiplier to all verified employee amounts for that item; Regular Wages also applies it to the unattributed portion. A zero-baseline group slider is disabled.
- Show ten employees per page without a roster show/hide button. Clicking one employee opens every setup item for that person, grouped by category. Each nonzero verified item has a 0 through 200% slider. Verified zero and unavailable amounts are visible with disabled sliders. A change to one employee item affects that item once and is retained across page changes.
- Employee and group sliders do not automatically adjust different items. In particular, increasing wages does not automatically increase taxes or benefits. Model each as a separate what-if assumption and explain this in the dashboard.
- Compute using cents or equivalent decimal arithmetic: modeled labor cost = fixed unmodeled labor + all modeled item amounts; labor cost as % of revenue = modeled labor cost ÷ reported revenue × 100; revenue after labor = reported revenue − modeled labor cost. Call the last measure **before other costs**, not profit. If revenue is zero or unavailable, show the ratio as unavailable.

## Verification

Check the baseline against the report. For at least one mapped item in each category, zero and 200% at the group level must subtract and add exactly its baseline amount. Zeroing or doubling one employee item must change modeled cost by exactly that employee's amount for that item. Verify all supplied paid employees are reachable in ten-person pages, each expanded employee shows every setup subcategory, changes persist across pages, reset restores the baseline, and unmapped labor stays fixed. Record any payroll-item-to-report reconciliation gap. Generated HTML and data are task outputs; keep them separate from reusable skill files unless the user explicitly asks otherwise.
