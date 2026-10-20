---
name: netsuite-financial-statement-review
description: "Use to retrieve and interpret an income statement, balance sheet, or cash flow statement for a resolved period, entity, currency and accounting book. Reconcile statement relationships, calculate supported financial indicators, and label open-period or incomplete results; route driver analysis and board-package assembly to their owning skills."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.0"
  source-version: "unknown"
  integration-version: "0.8.2"
  runbook-id: RB-FIN-009
  category: finance
  access-mode: read_only
---

Before tool use, load and apply [category SafeWords](../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Financial Statement Review


## Audience and use cases

**User roles:** Financial Analyst, Accounting Manager, Controller, CFO

**Use cases:** Pull a period income statement, balance sheet, or cash flow; review gross, operating and EBITDA margin; assess working capital, current and quick ratio, DSO and DPO; compute free cash flow and Rule of 40; interpret what a statement says rather than only retrieving it.



# Financial Statement Review

## Task

Produce the requested statement for the resolved scope and say what it means. One statement family
per run unless the user asks for a set.

## Trigger boundary

| Request | Owner |
| --- | --- |
| "Show me the P&L" | This skill |
| "Why is the P&L worse than plan" | `netsuite-variance-analysis` |
| "Is the balance sheet reconciled" | the unavailable broad account-reconciliation specialist (not packaged; Bank Reconciliation Prioritization is not an equivalent) |
| "Put the statements in a board deck" | `netsuite-executive-finance-reporting` |

## Procedure

1. Resolve the scope contract. State it.
   - P&L, revenue, expense, margin → Income Statement variant
   - Assets, liabilities, equity, working capital → Balance Sheet variant
   - Cash flow statement, burn or statement-based cash coverage → Cash Flow, then balance sheet cash detail; broader liquidity planning belongs to the cash-and-liquidity skill when available
   - AR or AP exposure → the relevant aging report
2. Retrieve the authoritative statement/report for the resolved scope under the shared report contract. Verify period dates, entity/consolidation, currency, accounting book, posting basis, report parameters and coverage.
3. Apply the presentation checks below against the applicable accounting framework; do not claim audit or compliance certification.
4. Compute the supported key performance indicators (KPIs) for that statement family.
5. Interpret: what the shape of the statement says, and what is out of pattern.

## GAAP presentation checks

**Income statement** — revenue, cost of revenue, gross profit, operating expense, operating income,
other income or expense, tax, net income. Label and reconcile any non-GAAP measure. "Extraordinary
item" is not a valid category.

**Balance sheet** — AR net of allowance. PP&E net of accumulated depreciation. Current and
non-current debt, leases, and deferred revenue separated. Equity components distinct when material.

**Cash flow** — indirect method unless the source clearly provides another basis. Starting net income agrees with the same-scope income statement; noncash and working-capital adjustments bridge it to operating cash flow. Ending cash and cash equivalents reconcile to corresponding balance sheet components with any restricted-cash or presentation bridge disclosed.

## KPI set

| Family | KPIs |
| --- | --- |
| Income statement | Gross margin %, operating margin %, EBITDA margin %, revenue growth %, R&D % of revenue, S&M % of revenue |
| Balance sheet | Current ratio, quick ratio, working capital, DSO (gross AR / trailing 3-month avg revenue per day), DPO (gross AP / trailing 3-month avg COGS per day) |
| Cash flow | Free cash flow, burn rate, cash coverage, Rule of 40 |

## Output

Standard headline / scope / what changed / risks / action block, then the statement table.
Label preliminary when the period is open and name what is outstanding.


## Plugin contracts

Apply the pinned plugin context and shared baseline, retrieval, evidence, outputs and action contracts supplied with this package. Domain-specific retrieval instructions above take precedence over the shared default within common safeguards. Verify current callable tool schemas, metadata, scope and access; no guessed schema or access-denial bypass. Preserve unknown and partial evidence. Requested analysis does not authorize external changes. Reuse authorization for an exact supported action and verify the result under the action contract.

## Indicator calculations and limits

Use the same period, currency and entity/book scope for all components and expose the formula and source of each indicator. Gross margin = gross profit / revenue; operating margin = operating income / revenue; working capital = current assets minus current liabilities; current ratio = current assets / current liabilities. Quick ratio uses the company-defined eligible liquid assets divided by current liabilities; disclose exclusions. Zero or missing denominators yield not calculable, not zero or infinity. Revenue growth uses comparable periods and a nonzero prior revenue basis.

Preserve the source-defined days sales outstanding (DSO) and days payable outstanding (DPO) approximations: gross accounts receivable (AR) divided by trailing three-month revenue per calendar day, and gross accounts payable (AP) divided by trailing three-month cost of goods sold (COGS) per calendar day. Disclose actual window dates/day count and that these are gross closing-balance approximations, not average-balance or credit-only metrics. Missing or nonpositive daily basis prevents a meaningful days metric.

Earnings before interest, taxes, depreciation and amortization (EBITDA), free cash flow, burn rate, cash coverage and Rule of 40 require explicit component definitions and reconciled evidence. Reuse the company definition or obtain the missing choice; do not choose a profit/cash margin for Rule of 40 or invent adjustments. Rule of 40 combines an explicitly defined revenue-growth percentage and profitability percentage on consistent periods; report those separately. Research and development (R&D) and sales and marketing (S&M) percentages divide the evidenced expense by revenue.

## Vocabulary and boundaries

P&L means profit and loss (income statement); GAAP means generally accepted accounting principles; PP&E means property, plant and equipment; CFO means chief financial officer. State the actual accounting framework. These checks identify presentation/reconciliation issues and do not establish compliance. For material variance explanations or executive assembly requested by an example, route to the named owning skill when available rather than expanding this procedure.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
