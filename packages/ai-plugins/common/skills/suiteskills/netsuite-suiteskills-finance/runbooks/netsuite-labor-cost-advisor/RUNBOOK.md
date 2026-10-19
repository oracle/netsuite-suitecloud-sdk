---
name: netsuite-labor-cost-advisor
description: "Build a payroll-backed labor-cost dashboard when Payroll, both labor reports, and Labor Costs Setup are accessible; otherwise provide the bundled illustrative dashboard preview. Use for labor-cost what-if scenarios."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.0"
  source-version: "unknown"
  integration-version: "0.8.1"
  runbook-id: RB-FIN-019
  category: finance
  access-mode: read_only
---

Before tool use, load and apply [category SafeWords](../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Labor Cost Advisor

Apply [plugin context](../../SKILL.md) and the pinned shared baseline, retrieval, action and output contracts. This business procedure retains its own scope.


## When to use

Use this skill when the user asks for a labor-cost dashboard or what-if scenario. First check whether this account and role can supply the required payroll data. If the gate passes, build a live dashboard that models verified amounts for Labor Costs Setup subcategories at the group and employee levels. If it fails, provide the bundled illustrative preview with a clear explanation. A GL salary-account approximation is outside this skill's current scope. A direct request to preview the design can use the bundled demo without querying NetSuite.

## Eligibility gate: check before building

This skill requires NetSuite Payroll and Labor Cost and Revenue Insights, access to **both** labor reports, and working SuiteQL access to Labor Costs Setup. If a feature-status tool is available, check both feature flags directly; an explicitly disabled required feature fails the gate. Unless a feature is confirmed off, call `ns_listAllReports` first and require both selected reports in its results; then run each with the same valid scope to confirm the current role can access it. Inspect metadata and run all three Labor Costs Setup queries below. A successful query with no `CompanyPreference` row leaves the saved selection unverified under the rule below; a failed query does not pass this gate.

If either report is absent or cannot run, or a setup query fails, stop before retrieving payroll detail and take the **illustrative preview** path below. State which prerequisite could not be verified. An absent report or access error alone does not prove which feature is off; do not diagnose Payroll as disabled solely from that result. A transient connector error means the account state could not be verified right now. Do not substitute GL salary accounts or invent report totals.

**Report identity.** The submitted standard report candidates are `-334` and `-335`. Verify both identities, titles, measures and scope through the current supported report interface before use. If a customer explicitly supplies custom report IDs, treat them as a separate configured pair: verify both are listed and runnable, confirm that they expose the labor and revenue measures this dashboard needs, and record the IDs and report titles in the output. Do not silently replace a missing standard report by title search.

## Deliverable paths

**Gate passes — live dashboard.** Create a standalone `.html` file and provide it as the primary result. A prose summary or Markdown table does **not** complete an eligible dashboard request. Copy the bundled [HTML dashboard template](assets/dashboard-template.html) to the output file, replace only its `dashboard-data` JSON block with verified values from the [data contract](references/REFERENCE.md), and set `ready` to `true`. Keep the template's CSS and JavaScript; they validate the data and recalculate the sliders in the browser. If employee detail is unavailable, keep the employee array empty and explain the limit in `employee_detail_status`.

**Gate fails — illustrative preview.** Tell the user that the data required for a live payroll dashboard is unavailable or inaccessible for this account and role, naming the failed prerequisite. If the failure was transient, say the data could not be verified right now instead of claiming the feature is absent. Then copy the bundled [illustrative dashboard](assets/demo-dashboard.html) to a user-accessible `.html` output and attach or link it: "If Payroll and the required reports are enabled and accessible, this is what the dashboard could look like." The demo contains synthetic employees, financial figures, setup selections, and item amounts; never describe any of them as account results. Do not edit its data to imply a live run. If file creation is unavailable, link the bundled demo directly when the host can expose it; otherwise say that an HTML preview could not be attached.

Both paths use standalone HTML. No Python, build step, package install, server, or internet connection is required to open the file. Check that the chosen file renders before delivery when the host permits local preview.

## Workflow

1. **Set the scope and check eligibility.** Confirm the date range and subsidiary when missing; never infer a fiscal-year start. Apply the eligibility gate above before detailed analysis. If it fails, follow the illustrative preview path and stop the live-data workflow. If it passes, label the payroll date basis and currency basis. This packaged model uses two decimal places; require a reconciled two-decimal currency basis before live generation. For another precision, explain the renderer limitation and provide the clearly illustrative preview rather than silently rounding account amounts.
2. **Reconcile the reports.** Use Labor Costs Report (`-334`) and Labor Costs and Revenue Report (`-335`), or the explicitly configured and validated custom pair, for the same dates, subsidiary, and filters. Use labor and revenue from the Cost and Revenue report as the scenario base. If the labor totals differ beyond rounding, show both amounts and their difference in the dashboard.
3. **Interpret Labor Costs Setup.** Use the SuiteQL results from the eligibility gate. Include every available subcategory, grouped under its category with name, ID, and effective selection status. Show the saved preference separately. Regular Wages (ID `1`) is always effective; a setup selection does not prove payroll activity.
4. **Retrieve labor item amounts and paid employees.** Follow [references/REFERENCE.md](references/REFERENCE.md). Discover metadata before each SuiteQL source or join. Identify finalized paycheck statuses and map payroll items to each setup subcategory using account evidence. Aggregate verified item amounts by paid employee. Use `null` for an item amount that cannot be verified, and zero only when a complete query establishes no matching line. Include every paid employee, even when their Regular Wages amount is zero. Reconcile mapped amounts to their payroll item totals and the labor report.
5. **Build the HTML.** Copy and populate the bundled template. Each setup item has a group slider from zero to 200% of its observed mapped amount. Show ten employees per page without a roster show/hide control. Clicking an employee opens all setup items for that person, each with its own zero-to-200% slider when an amount is verified and nonzero. Preserve changes across pages. Keep reported revenue and any labor that could not be mapped fixed. Taxes and benefits change only through their own sliders; wage changes do not automatically recalculate them. Keep generated HTML and account data as task artifacts rather than skill files.
6. **Verify the model.** The baseline must reproduce the Cost and Revenue report used for the scenario (standard `-335` or the validated custom equivalent). For each mapped item, zero and 200% on the group slider must subtract or add exactly that item's observed mapped amount; 100% restores baseline. Zeroing or doubling one employee item must change modeled cost by exactly that person's observed amount for that item. Verify all paid employees are present, page boundaries are ten people, and each expanded employee shows every setup item. Do not change NetSuite records.

Scenario labor cost equals fixed unmodeled labor plus the modeled setup item amounts. Labor cost as a percentage of revenue equals scenario labor cost divided by fixed reported revenue. Revenue after labor equals revenue minus scenario labor cost; label it as before other costs, not profit. If revenue is zero or unavailable, show the percentage as unavailable.

## Read the current Labor Costs Setup

Use the NetSuite connector's SuiteQL capability. Inspect metadata for `CompanyPreference`, `paycheckInsightItemCategory`, and `paycheckInsightItemSubcategory`, then run:

```sql
SELECT preference, value FROM CompanyPreference
WHERE preference = 'PAYCHECK_INSIGHTS_SUBCATS'
```

```sql
SELECT id, name FROM paycheckInsightItemCategory
```

```sql
SELECT id, name, category FROM paycheckInsightItemSubcategory
```

The submitted `CompanyPreference` query uses `preference` and `value`. Establish those fields through current query metadata or the pinned retrieval contract's exact supported packaged-query validation evidence. An assertion in this source alone is not that evidence. If essential schema remains unavailable, stop the setup query and use the illustrative preview; never probe guessed fields or bypass denial. Match subcategory `category` to category `id`. Distinguish the saved preference value from the effective selections: a returned row with a null or blank value means every available subcategory is included; otherwise the value is a comma-separated list of selected subcategory IDs. Regular Wages (ID `1`) is always included. If the preference row is missing or a query fails, say the saved selection could not be verified. List the effective names and IDs by category, and do not treat an included element as evidence of payroll activity.

## Notes

- The setup preference is current and company-wide. It does not prove the setting on a past date or activity in the selected period.
- Treat zero pay or benefits as a scenario, not a recommendation to stop paying employees.
- Keep customer-specific report data and employee amounts in generated task artifacts, not in this skill or its support files.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
