# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# NetSuite role and capability matching
## Separate three kinds of role
A security role grants permissions and record restrictions. A recorded project role expresses task/resource fit. An accountable process owner approves or acts. Never use one as proof of another. The Project Manager employee/project field does not establish the Specialized User: Project Manager security role.

## Capability preflight
Discover the actual exposed connector actions and inspect their schemas. Prefer non-invasive discovery and scoped reads; do not test access by writing data. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions.
A tool listed in the schema is not proved executable. A listed report is not proved readable or project-filtered. Distinguish:
`not_probed`, `listed`, `schema_verified`, `read_verified`, `write_supported_not_tested`, `denied`, `tool_missing`, `feature_absent_confirmed`, `incompatible`, `unknown`.
Use a successful scoped read to establish access only to that source and scope. Do not infer blanket account access. A REST metadata error is not proof that SuiteQL, saved searches, or the UI cannot read the record.

## Best-match decision
First map intent to the specialist. Then compare the required capabilities to the currently authorized role. Execute every supportable subrequest. For unresolved requirements, describe the narrow missing capability and identify a candidate role family, not an asserted permission grant.
Among already available roles, prefer one satisfying required scope/capabilities with the least additional access. Do not choose Administrator by default, switch roles automatically, combine unauthorized data across roles, or ask for credentials. If no role-list/identity tool exists, state “role identity unverified”; recommend capability requirements without pretending to inspect permissions.
For an actual role switch, use only an exposed authorized mechanism, re-discover scope, invalidate caches, and restart population reconciliation. Never treat a role suggestion as a grant.

## Candidate mapping — validate in the account
| Work | Best-match role family to inspect | Required capability families | Common qualification |
|---|---|---|---|
| Own project status and health | PM Manager / Specialized User: Project Manager / scoped custom PM | Projects/Jobs, Project Tasks, baselines, indicators, plannedwork, time, native coverage diagnostics; finance evidence for complete risk review | Project ownership does not imply all-project visibility |
| Cross-project/portfolio review | PM Manager or purpose-built portfolio role | Same families across required subsidiaries and projects; suitable project-finance reports | A sponsor's executive title alone proves no data access |
| Personal tasks/time | Consultant / Employee Center or scoped delivery role | Own tasks, assignments, time and workflow status | Personal-only scope cannot support portfolio completeness |
| Capacity and staffing | Resource Manager or validated custom resourcing role | Complete Project Resource directory, plannedwork detail, Work Calendar, approved time-off, exact recorded roles; optional permitted price | Zero work rows alone do not prove capacity; allocations are native-risk diagnostics only |
| Actual budgets/cost/margin | Accountant / Accountant (Reviewer) / CFO or project-finance role | Project Budget, Project Profitability, cost/transaction and classification evidence | General access or licenses may be needed beyond a specialized role |
| Billing and receivables/cash application | A/R Clerk or project-finance role | Charge, Invoice, Customer Payment, Credit Memo, Customer Deposit, Deposit Application, project linkage | Customer totals alone do not attribute balances to one project |
| Procurement and payables | Buyer / A/P Clerk or project-finance role | Purchase Order, Item Receipt, Bills, expenses, approvals and project-line attribution | Order value is not posted actual cost |
| Revenue evidence | Revenue Accountant / Revenue Manager or finance role | Revenue Arrangement/Element/Plan/Event, accounting book and posted recognition | Plan amounts are not automatically recognized revenue |
| Evidence-led risk review | No special “Risk” role assumed; compose the above requirements | Indicators first, then the applicable frozen source searches and candidate investigations | Lack of a custom risk record is irrelevant |
| Expense compliance | Finance role plus accessible policy/report-line evidence | Expense Report, Expense Report Policy, scope/effective date/limit/control fields | Approval is not proof of compliance |
| Authorized project changes | Project/Resource manager or scoped custom role | Appropriate create/edit/approval permissions and supported connector workflow | A financial posting is not a project-task operation |

These are candidate families derived from Oracle's standard-role documentation, not a certified permission matrix. Standard roles vary by enabled features/modules. Specialized User: Project Manager customizations cannot expand beyond that standard role's permission ceiling; validate licensing and actual granted capabilities. See sources S04–S07.

## Preserved historical connector observations, 2026-09-16 (not rerun in v2)
For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions. `ns_listAllReports` executed and returned project profitability, budget, utilization and billing report names.
`ns_getSuiteQLMetadata(projectindicator)` returned HTTP 400, “Tool ns_getSuiteQLMetadata not found”.
`ns_getRecordTypeMetadata(job)` returned “Access to this URL is restricted.”
The report list used `name` and `as_of_date_format` rather than the action documentation's `title` and `as_of_format`, and omitted several advertised filter flags. Do not assume the missing flags are false.
No security-role identity, granted-permission inventory, report-result grain, record-read access, or write capability was verified. These are historical compatibility observations to handle, not permanent restrictions baked into future runs.

## v2 identity and capability boundary
Coordinated runtime PM-4.0.0; native/capacity components remain PM-3.0.0. Read resource-identity-and-scope.md for exact authenticated entity-to-employee/vendor mapping.
For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions.
A source's older missing-tool failure is not a current absence. Actual type maps, feature state, permissions and user identity remain runtime checks.
Default placement eligibility is employee exact-role and verified date-matched capacity; price information does not rank unless explicitly requested.

## Proposal handoff

The Statement of Work (SOW) execution runbook is not included in this distribution. Retain proposal facts for financial/risk analysis; a requested SOW action needs an applicable supported procedure and tool.

