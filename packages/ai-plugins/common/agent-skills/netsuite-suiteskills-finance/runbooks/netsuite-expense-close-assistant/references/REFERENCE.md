# Expense close cockpit reference

## Package contents

- `../RUNBOOK.md`: period selection, exception review, owner discovery, follow-up workflow, and dashboard routing.
- `../assets/expense-close-dashboard.html`: reusable native HTML/CSS/JavaScript template with a `dashboardData` insertion point.
- `../assets/expense-close-october-2026-example.html`: Sanitized illustration derived from a dated source snapshot, with four example exceptions and editable follow-up drafts. Use as a dated interaction example only; retrieve fresh NetSuite data for new reviews. EXP35 is future-dated relative to retrieval, and some returned last-modified dates are also in the future.
- `../assets/expense-close-cockpit-example.html`: design example with sanitized EXP35 example data. It is illustrative, includes a future transaction date relative to retrieval, and does not establish the October period population or current close status.

## Populate the review

Discover accessible NetSuite fields and joins before querying. Paginate detail queries from the first request and exhaust available pages. Include period, subsidiary scope, retrieval time, currency basis, and completeness in the dashboard context. Label transaction-date and posting-period populations separately when they differ. Never assume a transaction date establishes its posting period.

Replace the template's `dashboardData` with validated results, not example data. Suggested shape:

```json
{
  "period": "Sep 2026",
  "scope": "Selected subsidiary",
  "populationBasis": "Posting period",
  "reports": [{
    "recordId": "internal ID returned by NetSuite",
    "reportNumber": "report number returned by NetSuite",
    "employee": "employee returned by NetSuite",
    "transactionDate": "2026-09-05",
    "amount": 100,
    "currency": "USD",
    "status": "Pending Supervisor Approval",
    "reason": "Awaiting supervisor review",
    "priority": "normal",
    "actionOwner": {"name": "verified name", "source": "explicit report assignment"},
    "recordUrl": null
  }]
}
```

The values above illustrate the schema only. Preserve unknown amounts and currencies as unknown. Sum only amounts with the same verified currency basis. An empty result means no exceptions were returned within the stated scope, not that the accounting period is ready to close.

## Native interactions

Include visible Exceptions column headers: `Report / date`, `Employee`, `Amount`, and `Exception`. Align headers and row cells using the same column widths. Keep headers outside the filtered row container so they survive filtering and empty results. On narrow screens, replace the header row with the same field labels inside each report row.

Use the cockpit layout: compact summary, exception filters, selectable reports, owner details, and an editable follow-up draft. Filter buttons must update the displayed rows and show an explicit empty state. Report selection must update the detail panel. Add policy, accounting, and supervisor filters when those categories are present. Clearly distinguish the full-scope totals from filtered totals.

Keep a native row-selection button and a separate sibling text link over the report number; never nest a link inside a button. The report-name link opens the verified NetSuite view page in a new tab. Other cells and row padding select the report and update the detail and follow-up panel. Enter and Space activate the selection button; Enter activates the link. Highlight the selected row and preserve keyboard focus when its detail changes. Keep the optional view link in the detail panel too. When a verified view URL is unavailable, leave the report number as plain text and disclose the missing link.

Use native buttons, selects, details, and textareas. Support keyboard interaction, narrow screens, visible focus, and readable contrast. Honor reduced-motion preferences. CSS Grid, Flexbox, custom properties, and system fonts need no installation; provide ordinary color fallbacks before newer CSS features. No external image or icon dependency is needed.

Create an HTML artifact using the rendering capability available in the customer's Claude environment. Use only the rendering interfaces actually supported in that environment. Keep all browser interactions local; the browser does not hold connector credentials or call NetSuite directly. Claude retrieves data through its connector and embeds the returned snapshot.

## Follow-up workflow

Prepare copy-ready drafts for identified approvers without ending with only an offer to draft. When no named approver is identified, display `Accounting department` for pending accounting approval, otherwise `No approver`. These are presentation fallbacks, not verified assignments: keep `actionOwner` null and exclude them from the named-approver count. Department-directed drafts must mark the specific contact/channel as unresolved; other unresolved drafts must ask who should review the report. Resolve the actual recipient before communicating. Never treat a configured supervisor as an explicit workflow assignment.

Local buttons may reveal or edit a draft. They must accurately describe what they do and must not claim to create a Slack/Outlook draft or send a message. For a connected-channel draft, the user continues the request in chat; Claude resolves the recipient through the installed integration and uses its actual draft tool when available. Ask which channel to use if needed. Creating an external draft, sending, scheduling or creating a conversation follows the pinned action contract: exact authorized recipient/channel/content, supported current interface, result verification and ambiguous-outcome reconciliation. Reuse existing authorization for unchanged scope.

Use only verified report facts, recipients, addresses, and record links. Do not invent deadlines or a reason for the policy violation. Keep each recipient's draft limited to the reports relevant to them.

## Verify before delivery

Render source values as text, not executable HTML. Escape embedded JSON so text cannot terminate a script element. Verify links before making them clickable. Exercise each filter, report selection, empty state, and draft button. Verify displayed totals against connector results; a draft being prepared does not resolve its expense-report exception.

The template preserves `completeness`, `retrievedAt` and `dataLoaded`; set these from retrieval evidence. A URL is clickable only when `recordUrlVerified` is true and its format is safe. Blank, Boolean and missing amounts remain unavailable rather than zero. Totals describe the returned snapshot; qualify population completeness separately.
