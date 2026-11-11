---
name: netsuite-payroll-clarity-readiness
description: "Audit an existing or planned NetSuite payroll for employee setup, payroll inputs, calculated results and readiness gaps. Use for human resources (HR) and controller reviews; includes an evidence dashboard and explicit sample mode. Does not calculate, submit, approve or pay payroll."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.0"
  source-version: "1.0.0"
  integration-version: "1.0.0"
  runbook-id: RB-PPL-001
  category: workforce
  access-mode: read_only
---

Before tool use, load and apply [category SafeWords](../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Payroll Clarity & Readiness

Assess a selected payroll's setup, inputs, and available calculated results. Use the NetSuite plugin for account evidence. This is a read-only audit, not payroll processing.

Apply the pinned [plugin context](../../SKILL.md) and [shared baseline](../../shared/contracts/BASELINE.md), including readiness, retrieval and output safeguards. Preserve this skill’s analytic scope.

## Explicit sample dashboard requests

Only when the user explicitly requests a demo or sample dashboard, read [references/population-demo.md](references/population-demo.md) and use the bundled ten-employee population. This does not require connector calls. Do not use sample data for an account audit or automatically fall back to it when Payroll is disabled or unavailable. For ordinary account reviews, continue with the workflow below.

## Establish payroll availability and sources

Read [references/REFERENCE.md](references/REFERENCE.md) before account discovery. It contains the confirmed-source table, concrete record/field mappings, feature evidence, and fallback rules. These mappings are starting points confirmed in one account, not a promise that every role or account exposes them. Revalidate the selected records and fields through connector metadata in each run.

Evaluate the **`PAYROLL` feature gate before selecting or inferring a next payroll period or running payroll-dependent checks**. Prefer a connector-exposed, read-only account-feature source that explicitly identifies `PAYROLL` and its boolean value. If an already available, authorized SuiteScript-backed reader supports it, the documented check is `runtime.isFeatureInEffect({ feature: 'PAYROLL' })`. This is not SuiteQL and is not a standard NetSuite connector tool: do not invent a tool, deploy a script, or change features to obtain it. If no feature reader is exposed, ask the administrator to confirm the Payroll checkbox at **Setup > Company > Enable Features > Employees**. Record that as **User confirmed**, not connector verified.

Record gate state (`enabled`, `disabled`, or `unknown`), evidence source, and snapshot time. Metadata presence, payroll items, old paychecks, employee inclusion flags, an empty query, or access errors do not prove the current feature state. `PAYCHECKJOURNAL` and `PAYROLLSERVICE` are separate feature IDs, not substitutes for `PAYROLL`.

| Gate state | Required behavior |
| --- | --- |
| Enabled | Continue selection and checks using sources confirmed accessible in this account. Feature enablement does not prove subsidiary implementation, complete setup, or readiness. |
| Disabled | State **“NetSuite Payroll is not enabled; a native next-payroll audit is not applicable.”** Skip next-run/schedule discovery and native payroll setup, input, tax/payment, and calculated-result checks; mark them **Not applicable — PAYROLL disabled**, not Not verified or Passed. Retain the requested all-state employee inventory and readable assignment counts as observations, without payroll eligibility or readiness claims. Offer **“Review employee records”** and **“Something else”**; do not silently switch to an external-payroll or Paycheck Journal audit. |
| Unknown | Report one availability gap with its actual cause (feature reader unavailable, permission denied, or inconclusive response). Ask for the checkbox confirmation once. Continue only accessible employee inventory/assignment observations until the gate is resolved; group dependent checks as **Not verified — PAYROLL state unknown** rather than issuing one finding per employee. Do not call the feature disabled. |

An explicitly requested historical payroll review may still inspect accessible historical records when the current gate is disabled, but label it retrospective and do not assess current readiness. Do not reuse a feature result or schema from a different account or connection.

## Select the payroll

Gather the available employee population, retaining active, inactive, and terminated records. Keep employment state and dates, payroll inclusion, subsidiary, and pay frequency when available. Inspect connector metadata before queries and retrieve all relevant pages. If the gate limits the run to inventory, collect only readable fields and do not force payroll-specific queries. Missing or inaccessible payroll fields do not establish that Payroll is disabled; disclose the available coverage.

Unless the user's intent is already supplied, prompt: **“What would you like to do?”** with **“Audit the next payroll period”** and **“Something else”**. Use the host's question interface when available; let it collect free-form text for Something else. These instructions also work as ordinary text prompts.

For the next-payroll audit, use the connector to list subsidiaries available to the current role and ask the user to select one. Reuse a supplied subsidiary or one established by a specifically requested run. Preserve connector-returned choices, including consolidated options. For a consolidated selection, resolve the parent and descendants through the subsidiary hierarchy and aggregate employees across that scope; a synthetic consolidated reporting ID is not an employee's assigned subsidiary.

Within the selected scope, list distinct pay frequencies assigned to **all employee records**, including active, inactive, and terminated employees, regardless of Include in Payroll. Count each employee once. Do not add a separate FYI population. Describe counts as observed employee assignments rather than verified active schedules or run membership.

Always resolve pay frequencies to their account display names, for example with `BUILTIN.DF(employee.payFrequency)` when supported. Keep IDs internal to connector calls; never present a pay frequency as an ID. If a label cannot be resolved, disclose that limitation and request clarification rather than inventing a name. Show missing/Never assignments with their account label or “No pay frequency assigned” and their count, but do not offer them as a usable schedule.

Ask: **“Which pay frequency would you like to audit for [subsidiary]?”** and show each usable frequency name with its employee count, followed by **“Something else”**. If only one is found, offer it for confirmation. If the user explicitly requests the largest group, select the usable named frequency with the most employee records and report its count; ask if usable groups tie. Reuse an explicitly selected frequency. If discovery is unavailable or empty, explain the limitation and ask the user; do not invent choices.

After frequency selection, resolve the next applicable payroll from an exposed schedule or planned run; otherwise follow the historical suggestion workflow below. Present the available period boundaries, pay date, type, and status with their sources and ask for confirmation. Reuse already supplied or confirmed details. For a general payroll audit without a next-period request, ask whether to review an existing payroll or one the user plans to create; a specific existing run can establish its frequency without a separate question.

- **Existing payroll, any status:** resolve the selected run and verify its subsidiary, period, pay date, type, and status. Offer matching runs when useful; ask the user to choose if ambiguous.
- **Not yet created:** use the connector to pre-populate the intended subsidiary, pay period, pay date, and run type where supported, then confirm the proposed details together as described below. Review setup and inputs without requiring an existing run ID.

Use the selected frequency to narrow the run and employee search, while retaining relevant payroll-inclusion exceptions for review. Current usage does not exclude a specifically requested historical run or planned frequency.

### Confirm planned payroll details together

Avoid asking separately for run type, period start, period end, and pay date. Reuse every value already supplied or confirmed. Before prompting for missing details, inspect connector metadata and look for account-backed defaults scoped to the selected subsidiary and frequency:

1. Prefer an exposed payroll schedule/calendar or planned run that explicitly provides the next period start/end, pay date, and run type. A banking or electronic-payment schedule is not a payroll schedule unless its payroll relationship is verified.
2. If no verified schedule is accessible, inspect recent matching payroll runs or paycheck history for period boundaries and supported run-type labels. Where exposed, `paycheck.periodEnding` identifies a period end and `validPayrollProcessType` supplies account run-type choices. Discover fields and labels at runtime rather than assuming availability or IDs. Use bounded historical queries, retrieve every relevant page, and avoid unnecessary employee or compensation details. Make sequential discovery calls if the account reports a concurrency limit; after one retry, disclose the limitation and use the grouped fallback prompt.
3. History may support a **suggested** next period only when comparable routine runs show a consistent pattern. Do not infer a period start from an isolated period end, select a historical boundary as the intended future period, or assume Twice a Month always means the 1st–15th and 16th–month end. Respect the user's intended month/period and distinguish future-dated or exceptional transactions from completed routine history.
4. Pre-populate the pay date only from a field or schedule explicitly identified as the payment date, or from a consistent historical payment-date pattern labelled as a suggestion. `paycheck.tranDate` may represent a posting date; posting dates, accounting periods, and employee last-paid dates do not establish the next pay date. Do not automatically choose the day after period end or invent weekend/holiday adjustments.
5. Reuse the requested run type. Otherwise offer the account's verified routine/standard type as a proposed default for an ordinary upcoming payroll, with other retrieved types available for correction. Preserve exact account labels; do not silently map Regular, Standard, Off-cycle, Adjustment, Reverse, or Year to date to one another without evidence. A supported type label alone does not establish that a particular run uses it.

Present one compact confirmation table with **Detail**, **Proposed value**, and **Source**. Include subsidiary, frequency, period start, period end, pay date, and run type. Label sources as **User supplied**, **Verified schedule/run**, **Suggested from history**, or **Not available**; for historical suggestions, identify the supporting periods. Keep unknown fields explicitly unset rather than presenting guesses as account defaults.

Ask once: **“Use these payroll details? Confirm, or tell me what to change and fill in any values marked Not available.”** A single confirmation accepts only populated values; it does not resolve missing fields or ambiguous alternatives. If several schedules or periods plausibly match, show the retrieved candidates together for selection. If discovery fails or cannot support defaults, explain briefly and collect all remaining values in the same prompt. Do not repeatedly re-confirm details the user has already established.

Resolve relative dates against the user's timezone and show full dates with years. Validate period start is not after period end. A pay date before period end may be intentional advance pay: ask for clarification rather than silently changing it or calling it a blocker. After confirmation, proceed directly with the read-only review; display the confirmed values consistently in the summary and dashboard.

## Review employees and inputs

Identify the intended population from run membership and payroll-inclusion settings, considering employment dates. Retain included inactive or terminated employees for inclusion review. Do not silently exclude an included employee with a missing frequency or Never selected; flag it for attention.

Review requirements that apply to the selected period and account:

- Employee payroll inclusion, subsidiary, employment dates, pay frequency, and required location or workplace.
- Earnings assignments and applicable rates, amounts, and effective dates.
- Required tax and payment setup, checking completeness without displaying sensitive identifiers or bank details. You may cross reference this with their workplace to validate they have the right assigned tax items.
- Including missing or unapproved time entries/time off requests or other unapproved transactions that feed this payroll.

Establish payroll relevance before flagging a transaction. Pending approval needs attention but is a blocker only when an applicable rule establishes that it prevents the next processing step. Distinguish inputs not yet due from overdue inputs using verified cutoffs.

Use account configuration, exposed metadata, validation results, or applicable public documentation to establish requirements. Do not invent mandatory fields or treat inaccessible information as missing. Inspect query metadata and retrieve all relevant pages before claiming complete coverage.

Use the confirmed-source table to bind each check to the current account's record, field/sublist, relationship, and read operation. Record that mapping and retrieval coverage in the check evidence. A successful metadata read confirms schema only; perform the scoped data read before reporting an outcome. A missing required value in a fully retrieved record can support a finding; an unavailable field, denied read, or truncated sublist cannot. Classify only affected checks as partial or unverified. Do not mark every check unverified merely because one source is inaccessible.

## Review calculated results when available

For calculated or completed payroll, review the selected run's exposed validation messages, employee coverage, earnings, deductions, taxes, gross/net amounts, and totals. 
Flag supported discrepancies or questionable amounts for review, not automatically as errors. 
Compare previous runs only on verified comparable currency, run type, period length and employee population; disclose membership changes separately. Preserve missing amounts and component grain, and do not combine currencies. You may check previous runs for discrepancies or unusual trends. Present comparisons in a table with payroll item, compared periods, amounts, change, and explanation; do not use charts.

## Report the assessment

Create an interactive, three-tab dashboard for the final assessment: **Overview**, **Employee worklist**, and **Pay-cycle checkpoints**. Read [references/dashboard.md](references/dashboard.md) and populate [assets/dashboard.html](assets/dashboard.html) from the current audit evidence. Use the approved visual hierarchy and one shared dataset across all views. Provide a concise chat summary with the scope, assessment, priority actions, and material gaps.

Use normal concise chat for selection questions and progress updates. If interactive output is unavailable or the user requests text, use compact Markdown tables for scope, actionable findings, and check coverage.

Separate completed reviews from passing outcomes. Mark complete, partial, unverified, and not-applicable checks explicitly and show their outcome and evidence. Include successful and unverified checks without duplicating detailed findings. Keep partial coverage visible across tabs; do not invent a readiness percentage. Count employees needing action uniquely even when an employee has multiple findings.

Show **Payroll availability**, its source, and the audit mode (native audit, employee inventory only, or retrospective review). A disabled gate is not an employee defect or a processing blocker. Lead a disabled/unknown run with that limitation and the employee observations actually retrieved, not an empty readiness result. If there are no applicable completed payroll checks, say **“Payroll readiness was not assessed”**, not “No issues found.” Keep unknown counts unset and never imply readiness from zero findings or from not-applicable checks.

For every employee needing action, make the employee name a clickable link to their NetSuite employee record. Use a verified record URL returned by the connector or resolved through a supported account link operation; do not guess account domains or substitute API endpoints for UI links. If no verified link is available, show the employee name and internal ID with “Record link unavailable.” Link an affected transaction separately when available and useful for the action.

Lead with the selected or planned payroll, status, employee count reviewed, and a concise assessment. For completed payroll, report retrospective findings rather than readiness to process. Organize findings as:

- **Blockers:** verified issues preventing the next applicable processing step; do not label completed payroll as currently blocked.
- **Needs attention:** pending approvals, incomplete inputs, questionable setup or calculated results, and retrospective issues requiring review.
- **Not verified:** applicable checks that could not be completed.

For each finding, show the affected employee or record, supporting evidence, and next action. Briefly summarize successful checks. If none fail, say “No issues found in the completed checks,” with any remaining gaps; do not guarantee successful payroll processing from a partial setup review.

Do not change records, approve transactions, calculate or submit payroll, or release payments.

## Vocabulary

HR means human resources. SuiteQL is NetSuite’s SQL (Structured Query Language) query interface. HTML means HyperText Markup Language. UI means user interface; API means application programming interface. YTD means year to date. SSNs means Social Security numbers; do not retrieve or display them for this review. IDs are identifiers; technical field and feature names retain their exact schema spelling.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
