# SuiteSkills changelog

## 1.0.0 — Initial SDK release candidate

SuiteSkills brings five entrypoints and 48 business runbooks to the SDK's Anthropic and OpenAI provider builds: Customers & Sales, Finance, Onboarding, Operations and Workforce. Workflows combine NetSuite AI Connector data or supplied evidence with guided analysis, drafts and supported actions subject to tool access, business prerequisites and explicit confirmation. Bank Reconciliation Prioritization remains read-only.

The npm build generates provider manifests and plugin directories from provider recipes and shared sources. Stable runbook IDs and aliases are preserved. Integration version 1.0.0 is separate from business/source versions, including Cohort Analysis 0.8.0 and Data Visualization 2.2.0-rc.1. The Workforce entrypoint retains CAT-PPL and RB-PPL identities.

Category-owned SafeWords policy and mandatory runbook/workflow loading remain in place. Visualization accepts supplied data and supported producer results without requiring Finance Analyst, with explicit currency and provenance checks. See [security notes](SECURITY-CHANGELOG.md), [visualization notes](VISUALIZER-CHANGELOG.md) and [support limits](README.md#prerequisites-and-limitations).

First-party content uses The Universal Permissive License (UPL), Version 1.0, with rights covered by the SDK contribution process. Full-plugin security approval has been obtained. This is an internal testing candidate: final validation and installed-provider, model, account and output/runtime qualification remain pending. No public-release or Q1 acceptance is asserted. Builder/Evaluator realignment remains pending.
