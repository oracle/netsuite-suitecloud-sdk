# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Source notes and implementation decisions
Verified against official documentation on 2026-09-23. These sources support the
qualifications below, not the existence of any connected-account feature or field.

- Oracle, New Project Health Indicators (2026.2):
  https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_3715561461.html
  Describes native indicator types and daily evaluation. Retrieval time and actual
  evaluation time must not be collapsed. Native coverage is not ordinary utilization.
- Oracle, Advanced Project Profitability:
  https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1484339384.html
  Describes configurable actual/committed mappings, approved-time treatment, and
  calculated report freshness. One generic field label does not establish a cost,
  contract or committed-revenue definition; finance validation remains upstream.
- W3C WAI-ARIA APG, Tabs Pattern:
  https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
  Guides progressive tab semantics and keyboard navigation. With scripts disabled,
  all logical sections stay readable; essential warnings are outside tab panels.

Implementation decisions (suite policy, not product claims): retain four entrypoints
and five domain profiles; add two optional presets plus adaptive composition; preserve
29 existing domain recipes; do not introduce a standalone PM application, network
client or renderer-specific dependency. Use flat themed components, responsive tables,
source captions, separately labeled interpretation and local-only selectors.

Review disposition of supplied design prompts: retain narrative synthesis and PM
interaction intent. Qualify forced KPI counts, live-data wording, color semantics,
raw diagnostic publication, source-only-query footers, fixed mapping assumptions,
numeric-only risk selection and exclusion of unfinished past-end work.
No saved-search-first replacement of universal source selection was introduced.
