# SuiteSkills 0.8.1 internal testing candidate

SuiteSkills 0.8.1 includes Data Visualization 2.2.0-rc.1 and consolidated SafeWords. Source evidence, currency, coverage and preliminary/limited-result disclosure remain required. FOUNDATION-SNAPSHOT.json and the onboarding FOUNDATION-LOCK.json describe historical foundation baselines, not the current shared files. SECURITY-RELEASE-STATUS.json is inherited evidence; native host, live account, source rights and security qualification remain pending.

Author-reported verification is recorded in the upstream handoff packet and is not receiving-repository verification. Receiving-repository checks and runtime limits are recorded below.

## Package scope

The openai distribution assembles five shared skills: Finance and Accounting; Customers, Sales and Support; Inventory and Operations; People and Workforce; and conversational onboarding. The [catalog](CATALOG.json) contains all 48 business routes. Read [shared guidance](shared/README.md) and [current status](CURRENT-RELEASE-STATUS.json).

Install the assembled `openai/netsuite-suiteskills` directory using the host's supported plugin installation flow. Skills use unsuffixed `skills/netsuite-suiteskills-*/` directories with isolated shared resources. The build generates the native `.codex-plugin/plugin.json` from `plugin.build.json`. OpenAI display metadata is supplied by five agents/openai.yaml files; onboarding is declared in the generated manifest.

Connector schemas, account and role permissions, rendering, native question controls and script execution are discovered in the actual session. Missing presentation capabilities preserve equivalent factual answers where the runbook permits. Source provenance, currency, coverage, preliminary/limited status and export gates remain mandatory. Data Visualization 2.2.0-rc.1 has separate checked runtime profiles; shared writers retain their 0.7.8 scope. Native host/routing and live account qualification remain not_run; rights remain not_collected. Historical provenance and qualification records are retained, not renewed by this integration.

## Receiving-repository verification — 2026-10-19

This integration was verified independently of the handoff author's reports against starting commit `d2abb49875035903a15620a018039a22102025cd`.

- `packages/agent-skills`: `npm run validate` (10 skills) and `npm test` (3 tests) passed.
- `packages/ai-plugins`: separate `npm run validate`, `npm test` (93 tests), `npm run build` and `npm run verify-release` passed. Packaging checks cover SafeWords locations/hashes, domain restrictions, manifest markers, host-neutral guidance, inventories, resource maps, branding, allowlists and shared provider bytes.
- `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s packages/ai-plugins/test -p 'test_*.py'` passed all 7 standard-library regression tests: financial inputs/labels, currency and units, incompatible series/intervals, missing values, immutable models, canonical HTML and asset pins.
- Local synthetic browser checks used Playwright 1.59.1 / Chromium 147.0.7727.15 at 1440×1000 and 390×844 for inventory, revenue and KPI examples. Filters and search worked; there were no page errors, network requests or page overflow. Revenue charts and KPI screenshots were visually inspected on desktop and mobile. Dense mobile detail tables wrap text; this is not pixel-parity qualification.
- Both financial examples generated PowerPoint files through the existing browser exporter and passed its `validate_pptx` checks. HTML publication probing passed on local Darwin/APFS. Browser execution required the normal macOS sandbox exception; no exporter safeguards were removed. PDF preflight reported `dependency_unavailable` (including absent `pypdf`); PDF export and inspection were not performed. Native PowerPoint application rendering was not tested.
- An isolated build of the starting commit matched every file and executable permission outside the two SuiteSkills distributions. Both providers retained all 48 route identities/aliases and 39 SQL files unchanged. Historical foundation snapshots, locks and security status files were byte-identical. `git diff --check` passed; temporary verification directories were removed.

Native host installation/routing/delivery, live-account operations, Linux execution, model adherence, IQ/security approval and source-rights clearance remain unperformed. No publishing was performed.
