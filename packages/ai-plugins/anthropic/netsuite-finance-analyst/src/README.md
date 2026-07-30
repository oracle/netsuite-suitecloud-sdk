<p align="left"><img width="250" src="https://raw.githubusercontent.com/oracle/netsuite-suitecloud-sdk/master/resources/Netsuite-logo-ocean-150-bg.png" alt="NetSuite"></p>

# NetSuite Finance Analyst

This plug-in, compatible with Claude, bundles the `netsuite-finance-analyst` skill and requires the NetSuite AI Connector Service to access NetSuite data.

## Supported Tasks

### Executive Reporting
- **Chief Financial Officer (CFO) dashboard:** Assemble a live income statement, balance sheet, and cash snapshot in one view. Quantify the top three drivers of change and recommend an action, owner, and timeline.
- **Board-ready narrative:** Convert period results into a headline, performance summary, key risks, and outlook. Label the narrative as preliminary or final based on close status so that it is ready for inclusion in a board package.
### Financial Statements and Variance
- **Budget vs. actual review:** Compare actuals with budget or forecast by account and department. Quantify the top variance drivers in dollars and percentages, and distinguish recurring variances from timing-related and one-time items.
- **Income statement deep dive:** Generate a profit and loss (P&L) statement for any period and subsidiary. Decompose margin movement into volume, price, and mix effects, and flag line items that exceed materiality thresholds.
- **Balance sheet health check:** Aggregate balance sheet accounts across subsidiaries and currencies, reconcile intercompany eliminations, and surface accounts that trend outside historical norms.
### Close and Controls
- **Month-end close readiness:** Check open-period status, identify unposted transactions and pending approvals that block the close, and sequence the remaining close tasks by owner and priority.
- **Journal entry review:** Scan journal entries for the period, flag manual entries above a threshold or with missing supporting detail, and route high-risk reclasses for explicit confirmation before posting.
### Cash and Working Capital
- **Accounts receivable (AR) aging and collections priority:** Pull open invoices by aging bucket and customer, rank collection targets by dollar exposure and credit-limit breaches, and identify invoices already offset by unapplied credit memos.
- **Accounts payable (AP) aging and vendor exposure:** Surface open vendor credits and unapplied cash, examine bills that are stuck or pending approval, and quantify net payable exposure against gross payable exposure.
- **Cash position and runway:** Aggregate cash across subsidiaries and currencies, project near-term inflows and outflows from AR and AP aging, and flag liquidity risk against covenant and runway targets.

## Contributing

This project welcomes contributions from the community. Before submitting a pull request, review our [contribution guide](https://github.com/oracle/netsuite-suitecloud-sdk/blob/master/CONTRIBUTING.md).

## License

Copyright (c) 2019, 2023 Oracle and/or its affiliates. The Universal Permissive License (UPL), Version 1.0.
