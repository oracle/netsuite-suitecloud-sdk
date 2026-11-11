---
name: netsuite-expense-close-assistant
description: "Review NetSuite expense-report exceptions before close, show an interactive exception dashboard, and prepare owner-directed follow-ups. Supports communication drafts or explicitly authorized messages; excludes expense-record changes and period closure."
metadata:
  owner: "Oracle NetSuite"
  version: "0.2.1"
  source-version: "0.2.1"
  integration-version: "1.0.0"
  runbook-id: RB-FIN-002
  category: finance
  access-mode: operation_dependent
---

Before tool use, load and apply [category SafeWords](../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Expense Close Assistant

Use the connected NetSuite plugin to give finance leaders a period-specific view of expense reports that could require follow-up before close.

## Review expense reports

1. Resolve the requested period to explicit start and end dates. If the user names only a month, use that calendar month in the relevant year; ask only when the year cannot be determined from context.
2. Discover the current SuiteQL metadata interface and verify the actual expense-report record types, fields, status meanings and relationships before querying; `expensereport` is a source label, not proof of a query table. Stop a dependent query if essential schema is unavailable or denied. Retrieve only the report number, employee, transaction date, posting period, amount, approval status, policy-violation flag, rejection flag, and last-modified date needed for the review.
3. Use one row per expense report, verified currency basis and stable unique ordering across all supported pages. Record as-of time, scope and completeness; never sum duplicate header amounts or report a capped sample as a complete population. Preserve missing amounts and currency as unknown. Identify reports in the selected posting period that are in progress, pending supervisor approval, pending accounting approval, rejected, or flagged for a policy violation. Do not treat paid reports as exceptions merely because they are in the period.
4. State the population basis used: transaction date, posting period, or both. If the transaction-date and posting-period views differ, say so rather than combining them silently.
5. Identify the action owner for each exception when the data supports it. Check the expense report's explicit next-approver or workflow-assignment fields first. For a pending supervisor approval with no explicit assignment, inspect the submitting employee's configured Expense Approver and, only if that is blank, their Supervisor. Label this as a configuration-derived owner, not an explicit report assignment. If a pending accounting approval has no named accounting approver, display `Accounting department` as the next-action destination, not as a verified workflow assignment. For other unresolved cases, display `No approver`; this means no approver was identified by this review, not that NetSuite has no approval configuration.

## Present the result

Lead with the number of reports requiring attention and their total amount when all returned values share a currency basis. Then provide a compact table with report number, employee, amount, status, reason for review, and approver. Distinguish an explicit report assignment from a configuration-derived owner. Use `Accounting department` for pending accounting approval without an identified approver and `No approver` for other unresolved cases. Neither fallback counts as a named approver.

Prioritize reports with policy violations, rejections, and pending accounting approval ahead of reports awaiting supervisor approval.

## Prepare follow-up actions

For each exception with a named action owner, prepare a concise follow-up that identifies the expense report, amount, issue, and requested action. Address it to the action owner, not the submitting employee, unless they are the same person.

For `Accounting department`, prepare a department-directed draft with the specific contact or channel unresolved. For `No approver`, prepare an escalation asking who should review the report. Do not invent a person, mailbox, or Slack channel for either fallback; resolve the recipient before using a communication integration.

Use an available communication integration to create drafts when the user selects a channel. If more than one is available, such as Slack and Outlook Email, ask the user which channel to use. If no channel is available or selected, return copy-ready, channel-neutral drafts in the response. Before creating a draft in an external service or sending, scheduling, or creating a conversation, establish explicit authorization for the exact recipient, channel and content under the pinned action contract. Reuse valid existing authorization for that same scope. Discover the supported communication interface and verify its result; reconcile an ambiguous create/send outcome before retrying. Channel choice alone does not authorize sending. Never invent recipients or imply a delivery succeeded from submission alone.

## Interactive dashboard

Read [references/REFERENCE.md](references/REFERENCE.md) before generating the dashboard. Present the exception cockpit as an interactive HTML artifact in the host's conversation when supported, with a short text summary alongside it. Use only embedded HTML, CSS, and JavaScript; no frameworks, external libraries, fonts, build tools, or additional language runtimes are required. Always provide the factual exception review in chat. When requested or appropriate, present supported interactive HTML or a verified downloadable HTML file. If HTML creation or presentation is unavailable, provide the equivalent factual text review with scope, exceptions, owners and limitations.

The [cockpit example](assets/expense-close-cockpit-example.html) preserves the visual concept shown during design. Its one report is an illustrative snapshot, not current account data or a complete close review. Use [the reusable dashboard template](assets/expense-close-dashboard.html) for fresh reviews and follow the reference guide to adapt it.

Use [assets/expense-close-dashboard.html](assets/expense-close-dashboard.html) after retrieving the expense-report population. Replace the `dashboardData` object between `DATA_START` and `DATA_END` with the returned period, scope, population basis, and report rows. For every report, provide internal `recordId`, report number, employee, transaction date or posting period, amount, currency, status, reason, priority, action-owner name/source, and `recordUrl` when available. Set `recordUrlVerified: true` only for a returned or independently verified account view destination. Include `completeness` (complete, partial or unknown), `retrievedAt`, and `dataLoaded`; an empty unloaded template is not a completed review. Serialize embedded data with `<` escaped as `\u003c` so source text cannot terminate the script element.

Render each expense report number in Exceptions as a text link to its NetSuite view page, opening in a new tab. Use a `recordUrl` returned or verified by the connected NetSuite experience, not a REST API endpoint or edit URL. If no view URL is available, show plain text and ask for an expense-report view URL from the user's account to verify the link pattern; do not invent the hostname. Clicking the report name navigates; clicking other cells selects the report's follow-up panel.

The HTML is self-contained native HTML, CSS, and JavaScript. It does not retrieve data itself. Its local controls filter exceptions, reveal report detail, and prepare a copy-ready follow-up draft. When a verified `recordUrl` is available, include that URL in the draft; no message is sent from the dashboard.

Do not approve, reject, edit, post, pay, lock, or close any NetSuite record or accounting period. Do not claim the period can close; describe only the returned expense-report exceptions and any data limitations.

## Plugin foundation

Apply [plugin context](../../SKILL.md) and the pinned shared baseline, retrieval and action contracts before using this procedure. Current supported interfaces, access boundaries, complete scoped evidence and business validation remain required.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
