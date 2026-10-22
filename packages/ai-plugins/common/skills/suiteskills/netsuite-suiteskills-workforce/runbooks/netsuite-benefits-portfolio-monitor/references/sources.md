# Population, scope and query selection

Read this file for every Benefits answer. It covers the employee population, query scope, query selection, and record links.

Find [employee population](#employee-population), [query construction](#minimal-query-construction), [dimensions](#requested-dimensions-and-joint-composition), [selection](#selection-and-resolution), and [record links](#record-links-and-identity) below.

- Open only the query reference needed for the answer: [focused queries](focused-queries.md), [grouped queries](grouped-queries.md), [coverage](coverage.md), [monthly costs](costs.md), or [assignment review](review.md).
- Read [currency](currency.md) before publishing or comparing money.
- Read [reference validation](reference-validation.md) only for a request to validate Benefit, Type, Carrier, or Coverage references.

Use the current account's read-only SuiteQL and metadata tools.

- Follow the connector's mandatory metadata requirements. Verify unfamiliar fields and joins before querying.
- Request metadata only for record types used by the selected query or needed to resolve its scope. Select a specific `recordType` instead of the full catalog.
- Reuse metadata only when it was checked for the same account and access in this conversation.
- If access to a required field or record is denied, block the affected answer. Keep the required field in the selection.

## Employee population

Use the Benefits Tracking owner definitions below. Reverify them after SuiteApp changes.

Current employees satisfy `e.isinactive = 'F' AND (e.releasedate IS NULL OR e.releasedate >= CURRENT_DATE)`.

- Treat any assignment as coverage, even when its Benefit is blank. Coverage does not establish eligibility or enrollment.
- Count distinct nonblank Benefit IDs for the measure of employees with exactly one Benefit. Do not count assignments as Benefits.
- Keep the owner criteria unchanged. Do not add an assignment inactive filter.

- Check a suspicious name, ID, or apparent template record without excluding the employee or calling the denominator inflated.
- Use the employee's subsidiary country for country scope. Do not use residence or payroll country.
- Describe results under the requester's current account and access. Do not claim unrestricted access.

| Record | Relevant meaning and fields |
| --- | --- |
| employee | `id` identifies the employee. `entityid` supplies the displayed name. `isinactive` and `releasedate` define the current population. Organization fields are optional filters, grouping fields, or output. |
| customrecord_bt_emp_benefit_plan | `id` identifies one assignment. Join `custrecord_bt_emp_bp_employee` to `employee.id`. `custrecord_bt_emp_bp_plan`, `_type`, `_carrier`, and `_coverage` identify Benefit details using the same prefix. |
| Assignment amounts | `custrecord_bt_emp_bp_employee_cost`, `_employer_cost`, and `_total_cost` are recorded monthly amounts using the same prefix. Blank differs from zero. |
| subsidiary | `id` and `name` resolve a named subsidiary. `country` supplies country scope. `parent` and `currency` support the required root currency check. |
| currency | `symbol` is the ISO code. `currencyprecision` supports the required precision check. |

Use the records above for normal answers. Read Benefit, Type, Carrier, or Coverage tier records only for requested [reference validation](reference-validation.md). Use `BUILTIN.DF` for required display labels when available. Keep a populated ID distinct when its label is unavailable.

## Minimal query construction

Select the template needed for the request. Do not run every template.

- Before a call, account for every projected field, predicate, join, calculation, and subquery. Keep only requested output, population and filters, needed calculation inputs, stable identity and order, or verification.
- Inspect the composed SQL, including nested projections. Remove unnecessary parts. Use explicit aliases and projections. Do not select wildcard columns. Use `COUNT(*)` only for row verification.

For "Which benefits are assigned in the Australia subsidiary?", use only `assigned_benefits` with distinct Benefit ID and label, current employee predicates, and the resolved `e.subsidiary` filter. Omit employee detail, coverage metrics, monetary fields, gaps, and review queries.

- `EMPLOYEE_SCOPE` is a verified predicate such as `e.subsidiary = 5`, `e.department = 10`, or `s.country = 'AU'`. Use `1 = 1` for unfiltered scope.
- Leave `EMPLOYEE_JOIN` empty for predicates that use only employee or assignment fields, including `e.subsidiary` and `e.department`. Use `LEFT JOIN subsidiary s ON s.id = e.subsidiary` only when a verified country predicate or requested information references `s`. `BUILTIN.DF(e.subsidiary)` needs no explicit Subsidiary join.
- Set `ASSIGNMENT_SCOPE` with verified `a` fields. Its default is `1 = 1`. Place this predicate in the `LEFT JOIN` for coverage so all scoped employees remain.
- Set `ASSIGNMENT_SCOPE_A2` to the same assignment predicate with alias `a2`, only for the optional `one_benefit_count` query.
- Choose `GROUP_ID` and `GROUP_LABEL` from a verified pair in the table below. Include only requested dimensions. For joint grouping, group by the requested tuple of IDs or codes. Do not group by names alone or substitute separate marginal tables.
- Replace each named fragment token with its matching fenced query, then expand its tokens. Resolve every token before execution. Treat fragments as SQL text, not files or commands. Insert resolved numeric IDs and escape single quotes in string literals by doubling them. Never insert untrusted raw SQL.

Apply the same current criteria, filters, grouping, and agreed denominator to related queries and subqueries.

- A named subsidiary includes only its resolved ID unless the requester asks for children. A country request can span subsidiaries. Clarify before calculating when ambiguous.
- For coverage under an assignment predicate, use the agreed organization employee population. Employees without matching assignments differ from employees without any benefit record. Use `NOT EXISTS` across every assignment for actual gaps.

### Requested dimensions and joint composition

| Dimension | ID/code expression | Label expression |
| --- | --- | --- |
| Employee | `e.id` | `e.entityid` |
| Benefit | `a.custrecord_bt_emp_bp_plan` | `BUILTIN.DF(a.custrecord_bt_emp_bp_plan)` |
| Benefit Type | `a.custrecord_bt_emp_bp_type` | `BUILTIN.DF(a.custrecord_bt_emp_bp_type)` |
| Carrier | `a.custrecord_bt_emp_bp_carrier` | `BUILTIN.DF(a.custrecord_bt_emp_bp_carrier)` |
| Coverage | `a.custrecord_bt_emp_bp_coverage` | `BUILTIN.DF(a.custrecord_bt_emp_bp_coverage)` |
| Department | `e.department` | `BUILTIN.DF(e.department)` |
| Class | `e.class` | `BUILTIN.DF(e.class)` |
| Location | `e.location` | `BUILTIN.DF(e.location)` |
| Subsidiary | `e.subsidiary` | `BUILTIN.DF(e.subsidiary)` |
| Country | `s.country` | `s.country` (verified country code) |
| Supervisor, gaps only | verified `e.supervisor` | `BUILTIN.DF(e.supervisor)` |

- Employee and organization dimensions partition employees. Assignment dimensions can put one employee in several groups. Do not sum distinct employee counts across Benefit, Type, Carrier, or Coverage.
- Complete assignment counts and monetary sums partition across assignment tuples, including null dimensions.
- Display a null ID as "Not recorded". Keep a populated ID with an unavailable label as a separate identified group.
- Use the requested organization gaps query for employees with no assignment. A null assignment field on an existing assignment is not an employee gap.

Build joint templates from explicit SQL fragments. Do not run scripts.

- Set `GROUP_SELECT` to each ID or code plus `MIN(label) AS <dimension>_label`. Set `GROUP_BY` to the same ID or code expressions. Set `GROUP_ORDER` to all group IDs or codes for stable, unique order.
- In `cost_groups_joint`, set `GROUP_INPUTS` to each source ID and label with aliases. Reference those aliases on `x` in the other group fragments.
- For subsidiary and carrier, set `GROUP_SELECT` to `e.subsidiary AS subsidiary_id, MIN(BUILTIN.DF(e.subsidiary)) AS subsidiary_label, a.custrecord_bt_emp_bp_carrier AS carrier_id, MIN(BUILTIN.DF(a.custrecord_bt_emp_bp_carrier)) AS carrier_label`. Set `GROUP_BY` and `GROUP_ORDER` to `e.subsidiary, a.custrecord_bt_emp_bp_carrier`. Add the Subsidiary join only for country or an actual `s` reference.

- Return `query_date` from fresh final answer queries. Internal input and flag fragments do not need it. Capture the observed call time.
- Label a successful empty list with "Checked at" and its observed call time because no row carries a NetSuite date.
- Give each new read its own date. Do not substitute the local calendar date for a NetSuite date. Treat query date as provenance, not an HR table field or record identity.

## Selection and resolution

| Answer | Select |
| --- | --- |
| Distinct benefits | Use `assigned_benefits`. |
| Requested assignments | Use `assignment_list` and add only requested columns. |
| Blank Carrier assignments | Use `blank_carrier_assignments`. |
| Employee count for a Benefit | Use `employee_count` with the resolved Benefit predicate. |
| Employees with no benefit record | Use `employees_without_benefits`. Add requested fields only. |
| Coverage | Use the basic headline or requested group in [coverage.md](coverage.md). Add optional metrics only when requested. |
| Grouped assignments or employees | Use `assignment_groups` or `assignment_groups_joint`. Select only requested counters. |
| Monthly costs | Use requested totals or grouping in [costs.md](costs.md) plus the required currency. Do not add review, share, or annualization reads. |
| Review | Use `review_summary`, `review_groups_joint`, or details in [review.md](review.md). Add field or pattern breakdowns only when needed. |
| Blank monthly amount fields | Use `missing_amounts_summary` or a targeted list of identities and blank flags. Zero is recorded. Read currency only when publishing or comparing money. |
| Single monetary fact | Use a targeted `ROUND(amount, 2)` selection and the required currency. |
| Broad portfolio snapshot | Use `coverage_headline`, `cost_totals`, and expanded `review_summary` with required currency. Include complete `review_details` and `employees_without_benefits` with SQL `GAP_PRIORITY` unless explicitly asked for summary only. A matching checked zero can skip detail. Use `actual_gap_count` when filtered coverage cannot establish actual gaps. |

- Clarify whether the scope is a subsidiary or country when context does not decide. A targeted combined name and country candidate query can show that both readings produce the same complete population. Otherwise ask before the answer query.
- Resolve an explicit "US subsidiary" to the unique United States name without a country wide read. A named subsidiary needs a unique match. Clarify multiple candidates. Treat no candidates as an unresolved name, not empty assignments.
- Use an escaped lower case `NAME_PATTERN`, such as `%australia%`, in [focused-queries.md](focused-queries.md).
- Resolve Benefit names by distinct plan IDs and `BUILTIN.DF` labels within the selected current population. Treat no matching ID as an unresolved Benefit name, not a checked zero employee count. Clarify multiple IDs even when they share a label.
- Add country to a resolution projection only when the ambiguity needs it. Do not scan all subsidiaries for a targeted name. Resolution and schema reads do not initiate reports.

## Record links and identity

- Keep employee and assignment IDs internally for joins, distinct counts, deduplication, stable ordering and reconciliation. Hide numeric IDs in default HR tables, evidence and exports unless requested.
- Link employee names only after checking a route in view mode under the requester's account host and permissions. Otherwise show the name and briefly disclose that record links are unavailable.
- Show a displayed employee or assignment ID as plain text by default. Link it only after separately verifying its exact route for the account, record identity, view mode, and permitted read. Require HTTPS and the requester account host. Test an invalid route to ensure rejection.
- Do not guess URL patterns or reuse another account's route. Escape names and verified link attributes as data.
