# Showcase prompts

The bracketed values are user-supplied scope, not fabricated account IDs.

## 1. Profitability check

> Are any projects losing money this quarter?

**Expected behavior:** Activate the financial skill and build the Step 4 dashboard even though the question sounds yes/no. Verify the scope and cost coverage; do not infer profitability from missing cost.

## 2. Unbilled exposure

> Any unbilled WIP on our active projects?

**Expected behavior:** Build the dashboard with verified unbilled exposure and its actual currency. Treat unavailable reports as missing coverage, not no WIP.

## 3. Collections exception review

> Review overdue receivables for [customer]'s projects as of [date].

**Expected behavior:** Build the dashboard. Resolve the named customer and project relationship and disclose when aging is only available at customer grain.

## 4. Explicit CSV override

> Give me a CSV, no dashboard, of recognized revenue and cost-data coverage by project for [period] and [subsidiary].

**Expected behavior:** Honor the explicit CSV format, retain evidence and currency/coverage disclosures, and do not create or post transactions.

## 5. Presentation-only revision

> In the existing project financial dashboard, sort financial exceptions first and show full currency amounts. Keep the original data snapshot.

**Expected behavior:** Edit the existing dashboard's presentation, retain its snapshot and evidence, and do not run an unrelated data refresh.

