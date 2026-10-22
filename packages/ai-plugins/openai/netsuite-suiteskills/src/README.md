<p align="left"><img width="250" src="https://raw.githubusercontent.com/oracle/netsuite-suitecloud-sdk/master/resources/Netsuite-logo-ocean-150-bg.png" alt="NetSuite"></p>

# SuiteSkills

SuiteSkills provides NetSuite business workflows for ChatGPT and Codex through the NetSuite AI Connector Service. Explore business data, prepare analysis and drafts, and complete supported workflows across finance, sales, customer support, operations and workforce management.

The [catalog](CATALOG.json) contains 48 business runbooks exposed through the five skills below.

## Included Skills

### Customers & Sales

*Sales, marketing, service, and pricing assistance grounded in your NetSuite data.*

Customers & Sales helps teams prepare for account conversations, prioritize and qualify leads, review pipelines, and work through estimates and quotes. It supports campaign audience planning and analysis of recorded performance and ROI. Service teams can investigate sales orders, review returns and refund status, prioritize support queues, investigate cases, and draft replies. Pricing teams can explain transaction pricing, review exceptions, and prepare Advanced Pricing rule changes. It also identifies gaps in NetSuite Knowledge Base coverage and drafts solution articles for review. Workflows respect existing NetSuite permissions. Supported actions require explicit confirmation and validated tools and access; other workflows provide analysis, drafts, and recommendations for human review.

[Open Customers & Sales](skills/netsuite-suiteskills-customers-sales/SKILL.md).

### Finance

*Close faster, see cash clearly, and catch issues early, all from NetSuite.*

Finance brings more than 20 accounting and FP&A workflows to the NetSuite AI Connector. It covers period close status, expense close exceptions, journal entry review, and variance and flux analysis. It also covers financial statement review, cash and liquidity runway, invoice collections, credit management, and payment prioritization. For deeper analysis, it handles vendor spend, vendor credit matching, revenue leakage, intercompany balances, SuiteTax nexus, and labor cost. It also covers project financials, bank reconciliation prioritization, and CFO cohort analysis. Finance Controls Review and Executive Financial Reporting tie these results into board-ready packages, with clear metric sources and tie-outs. Results respect subsidiary, currency, and accounting book context. Any action beyond analysis requires explicit authorization from the user.

[Open Finance](skills/netsuite-suiteskills-finance/SKILL.md).

### Onboarding

*Your guided starting point for SuiteSkills. Find the right workflow for your role in minutes.*

Onboarding helps new users go from "I just connected" to a useful first result. It identifies users' roles and access, asks about their goals in their own words, and suggests the SuiteSkills workflows that fit. It then hands off to the right specialist skill with the original request intact. Users can explore what's available, pick up an onboarding goal they started earlier, or refresh suggestions after a role or account change. If a user already has a concrete business question, Onboarding skips the interview and routes them straight to the matching workflow.

[Open Onboarding](skills/netsuite-suiteskills-onboarding/SKILL.md).

### Operations

*Inventory, fulfillment, and supply chain insights for the teams that keep orders moving.*

Operations helps warehouse, fulfillment, purchasing, and supply chain teams understand what's happening in NetSuite and what to do next. It looks up inventory availability and balances. It analyzes inventory movement, demand, and shortages by item and location, and explains how specific transactions affected inventory. It reviews WMS exceptions such as negative inventory, failed picks, late inbound orders, and expiring lots. It measures picking, packing, and shipping times against SLAs. It also supports return authorizations, item purchasing history, vendor optimization, field service, project risk, and role-specific supply chain answers. Data visualization is available for supported results, depending on the host's capabilities. Analysis is read-only by default. Any requested action depends on the user's authorization and business prerequisites.

[Open Operations](skills/netsuite-suiteskills-operations/SKILL.md).

### Workforce

*Payroll readiness, time, absence, and benefits insight for HR and managers.*

Workforce gives HR teams, controllers, and managers a clear view of workforce data in NetSuite and SuitePeople. It audits payroll readiness across employee setup, inputs, and calculated results, without running or submitting payroll. It analyzes absence balances, carryover, and upcoming expirations, and monitors benefits coverage and recorded costs. For time management, it can review pending time and approve or reject entries after a confirmed preview. It can also draft new time entries for the user to review and save. Every change requires explicit user confirmation, and the skill makes no eligibility or employment judgments.

[Open Workforce](skills/netsuite-suiteskills-workforce/SKILL.md).

## Prerequisites and limitations

- NetSuite data access requires the NetSuite AI Connector Service, available tools, enabled account features and appropriate role permissions. SuiteSkills checks actual schemas and access in the session, respects access denials and discloses missing or partial evidence. Results preserve subsidiary, currency and accounting-book context.
- Supported actions require explicit authorization, validated tools, business prerequisites and the runbook's exact preview/confirmation gates. SuiteSkills does not retry changes automatically; it checks ambiguous results with reads. Confirmation cannot enable excluded actions, including Bank Reconciliation Prioritization, which remains read-only.
- Presentation, native question controls, script execution and file delivery depend on the actual host. When presentation is unavailable, SuiteSkills provides equivalent factual answers where the procedure permits. Generated outputs are stored outside installed assets with a fresh basename. See [shared guidance](shared/README.md) and the [security notes](SECURITY-CHANGELOG.md).
- Data Visualization accepts supplied files/tables and supported producer results without requiring Finance Analyst. It requires explicit currency/unit validation, source provenance and guarded output publication. The Python runtime and execution dependencies declared in the [visualization runbook’s publication requirements](skills/netsuite-suiteskills-operations/runbooks/netsuite-data-visualization/references/publication.md) are required. HTML is the baseline; PDF/PowerPoint require requested, qualified Darwin exports and applicable browser/font/PDF dependencies. The exact Linux HTML candidate profile does not qualify general Linux support. See [visualization support notes](VISUALIZER-CHANGELOG.md) for runtime and delivery limits.

## Contributing
This project welcomes contributions from the community. Before submitting a pull request, review our [contribution guide](https://github.com/oracle/netsuite-suitecloud-sdk/blob/master/CONTRIBUTING.md).

## [License](https://github.com/oracle/netsuite-suitecloud-sdk/blob/master/LICENSE.txt)
Copyright (c) 2019, 2023 Oracle and/or its affiliates. The Universal Permissive License (UPL), Version 1.0.
