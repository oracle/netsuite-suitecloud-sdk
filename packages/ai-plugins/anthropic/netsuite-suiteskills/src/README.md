# SuiteSkills 0.8.2 internal testing candidate

Put NetSuite expertise to work with SuiteSkills. Explore your business data, uncover actionable insights, and complete supported workflows across finance, sales, customer support, operations, and workforce management through NetSuite AI Connector.

The [catalog](CATALOG.json) contains 48 business runbooks and conversational onboarding. Source evidence, currency, coverage and preliminary/limited-result disclosure remain required. Data Visualization retains source version 2.2.0-rc.1 and accepts supplied files/tables and supported producer results without a Finance Analyst dependency. Read [shared guidance](shared/README.md) and [current status](CURRENT-RELEASE-STATUS.json).

## Included skills

### Customers & Sales

*Sales, support, and pricing intelligence from your live NetSuite data.*

Customers & Sales gives sales, marketing, and support teams an AI assistant grounded in their NetSuite records. It can prioritize and qualify leads and prepare discovery notes for sellers. It can plan campaign audiences and analyze recorded campaign performance and ROI. It can triage sales orders across fulfillment, billing, holds, and backorders. It can also review support queues, investigate cases, and draft replies. For pricing teams, it reviews Advanced Pricing rules and pricing exceptions and prepares change proposals. It can also find gaps in Knowledge Base coverage and draft new solution articles for human review. Every workflow uses read-only evidence and respects the user's existing NetSuite permissions. Drafts and proposals are handed off for people to act on.

[Open Customers & Sales](skills/netsuite-suiteskills-customers-sales/SKILL.md).

### Finance

*Close faster, see cash clearly, and catch issues early, all from NetSuite.*

Finance brings more than twenty accounting and FP&A workflows to the NetSuite AI Connector. It covers period close status, expense close exceptions, journal entry review, and variance and flux analysis. It also covers financial statement review, cash and liquidity runway, invoice collections, credit management, and payment prioritization. For deeper analysis, it handles vendor spend, vendor credit matching, revenue leakage, intercompany balances, SuiteTax nexus, labor cost, project financials, bank reconciliation prioritization, and CFO cohort analysis. Finance Controls Review and Executive Financial Reporting tie these results into board-ready packages, with clear metric sources and tie-outs. Results respect subsidiary, currency, and accounting book context. Any action beyond analysis requires explicit authorization from the user.

[Open Finance](skills/netsuite-suiteskills-finance/SKILL.md).

### Onboarding

*Your guided starting point for SuiteSkills. Find the right workflow for your role in minutes.*

Onboarding helps new users go from "I just connected" to a useful first result. It works out the user's role and access, asks about their goal in their own words, and suggests the SuiteSkills workflows that fit. It then hands off to the right specialist skill with the original request intact. Users can explore what's available, pick up an onboarding goal they started earlier, or refresh suggestions after a role or account change. If a user already has a concrete business question, Onboarding skips the interview and routes them straight to the matching workflow.

[Open Onboarding](skills/netsuite-suiteskills-onboarding/SKILL.md).

### Operations

*Inventory, fulfillment, and supply chain insights for the teams that keep orders moving.*

Operations helps warehouse, fulfillment, purchasing, and supply chain teams understand what's happening in NetSuite and what to do next. It looks up inventory availability and balances. It analyzes inventory movement, demand, and shortages by item and location, and explains how specific transactions affected inventory. It reviews WMS exceptions such as negative inventory, failed picks, late inbound orders, and expiring lots. It measures picking, packing, and shipping times against SLAs. It also supports return authorizations, item purchasing history, vendor optimization, field service, project risk, and role-specific supply chain answers, with data visualization for supported results and available host capabilities. Analysis is read-only by default. Any requested action depends on the user's authorization and business prerequisites.

[Open Operations](skills/netsuite-suiteskills-operations/SKILL.md).

### Workforce

*Payroll readiness, time, absence, and benefits insight for HR and managers.*

Workforce gives HR teams, controllers, and managers a clear view of workforce data in NetSuite and SuitePeople. It audits payroll readiness across employee setup, inputs, and calculated results, without running or submitting payroll. It analyzes absence balances, carryover, and upcoming expirations, and monitors benefits coverage and recorded costs. For time management, it can review pending time and approve or reject entries after a confirmed preview. It can also draft new time entries for the user to review and save. Every change requires explicit user confirmation, and the skill makes no eligibility or employment judgments.

[Open Workforce](skills/netsuite-suiteskills-workforce/SKILL.md).

## Installation and migration

Install the assembled `anthropic/netsuite-suiteskills` directory through the host's supported plugin installation flow. The build generates `.claude-plugin/plugin.json` from `plugin.build.json`. Skills use unsuffixed `skills/netsuite-suiteskills-*/` directories and isolated shared resources. OpenAI display files and branding are excluded.

Version 0.8.2 renames the People entrypoint to Workforce. Refresh the host's installed skill inventory after upgrading; do not retain both entrypoints. CAT-PPL, every RB-PPL ID, all 48 runbook identities and existing aliases remain stable. Historical names remain in changelogs and provenance. Source/business versions, including Cohort Analysis 0.8.0, are preserved. The receiving repository retains `common/skills/suiteskills/`, the 152-path shared layer and existing provider recipes; the handoff's older `packages/agent-skills` migration is not applied directly. Handoff utilities, source manifests, archives and generated outputs are excluded from plugin inputs.

Connector schemas, account and role permissions, rendering, native question controls and script execution are discovered in the actual session. Missing presentation capabilities preserve equivalent factual answers where the procedure permits. Source provenance, currency, evidence coverage, export gates and exact action confirmation remain mandatory. Data Visualization has its own checked runtime profiles; shared writers retain their existing scope and safeguards. Store generated outputs outside installed assets with a fresh basename.

## Receiving-repository verification — 2026-10-20

The upstream 0.8.2 packet reports package/SDK checks and inherited renderer evidence. Its inventory was verified before adaptation. Those reports are distinct from the following receiving-repository checks against `99cb89de`:

- Agent-skills validation and Node tests; separate ai-plugins validation, Node tests, build and release verification.
- Separate Python visualization regressions for financial inputs/labels, currency/units, series/intervals, missing values, immutable models, canonical HTML and asset pins.
- Packaging checks for authored copy/display labels, Workforce migration, stale People output replacement, stable routes/aliases, relative links, complete SafeWords paths/lines/hashes, current foundation snapshots/onboarding lock, inventories, resource maps, generated native manifests, PNG branding, allowlists and cross-provider shared bytes. Dual-manifest detection, host-neutral discovery, presentation fallbacks and execution safeguards remain covered.
- Credential-pattern scans on both assembled SuiteSkills outputs. Isolated baseline build comparison preserves all 48 routes after the intentional Workforce category/path mapping, all 39 SQL files and executable/rendering bytes and permissions. Unrelated distributions match; the root distribution README changes only in the SuiteSkills overview.

FOUNDATION-SNAPSHOT.json and onboarding FOUNDATION-LOCK.json now describe the current SDK shared foundation and category entrypoints. Historical Builder evidence and provenance remain unchanged; Builder/Evaluator realignment remains pending. SECURITY-RELEASE-STATUS.json remains inherited evidence, not current security qualification.

The 0.8.1 receiving integration recorded local synthetic desktop/mobile browser checks and PowerPoint validation. That renderer evidence is inherited through unchanged executable/rendering bytes; browser/export checks were not rerun for this content migration. PDF/native PowerPoint rendering was not qualified by that receiving integration.

Native host installation/routing/delivery, live-account operations, Linux execution, model adherence, IQ/security approval and source-rights clearance remain unperformed. Publishing remains separate; no publishing was performed.
