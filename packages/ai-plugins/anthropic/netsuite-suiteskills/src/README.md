# SuiteSkills 0.7.9 internal testing candidate

The anthropic distribution assembles five shared skills: Finance and Accounting; Customers, Sales and Support; Inventory and Operations; People and Workforce; and conversational onboarding. The [catalog](CATALOG.json) contains all 48 business routes. Read [shared guidance](shared/README.md) and [current status](CURRENT-RELEASE-STATUS.json).

Install the assembled `anthropic/netsuite-suiteskills` directory using the host's supported plugin installation flow. Skills use unsuffixed `skills/netsuite-suiteskills-*/` directories with isolated shared resources. The build generates the native `.claude-plugin/plugin.json` from `plugin.build.json`. No OpenAI display files are included.

Connector schemas, account and role permissions, rendering, native question controls and script execution are discovered in the actual session. Missing presentation capabilities preserve equivalent factual answers where the runbook permits. Finance Analyst handoff requirements and export gates remain mandatory. Data Visualization 2.1.0-rc.1 has separate checked runtime profiles; shared writers retain their 0.7.8 scope. Native host/routing and live account qualification remain not_run; rights remain not_collected. Historical provenance and qualification records are retained, not renewed by this integration.
