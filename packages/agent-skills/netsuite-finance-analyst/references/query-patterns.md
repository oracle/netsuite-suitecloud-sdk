# Query Patterns

Use this reference when standard reports or saved searches are not enough and the user needs
SuiteQL-oriented finance support. These are starter patterns, not drop-in production queries.
Replace placeholders with real values before running the query.

## Metadata Guard

Field and table availability in NetSuite SuiteQL varies by account configuration,
enabled modules, and MCP endpoint permissions. A pattern that works in one instance
may return an error or empty results in another.

Before running any SuiteQL pattern in this file for the first time in a session,
call `ns_getSuiteQLMetadata` to confirm the relevant tables and fields are queryable
on this endpoint:

```
ns_getSuiteQLMetadata(table: "<TABLE_NAME>")
```

Run this once per table per session. Results can be cached for the remainder of the
conversation; do not re-probe a table you have already confirmed.

**If `ns_getSuiteQLMetadata` is unavailable on the endpoint**, run a minimal probe
query against the target table before running the full pattern:

```sql
SELECT * FROM <TABLE_NAME> FETCH FIRST 1 ROW ONLY
```

If the probe fails, record the table as unavailable and fall back one tier:
SuiteQL → saved search → standard report.

**Key tables to verify before first use:**

| Table | Used in | Common Availability Issue |
| --- | --- | --- |
| `accountingperiod` | Period status, variance patterns | Not queryable on all MCP endpoints; use transaction-density inference from `project-onboarding.md` as fallback |
| `budget` | Variance Pattern A | Only present when budgets are configured; empty table is not the same as unavailable |
| `subsidiary` | Entity resolution, consolidation patterns | Available on OneWorld accounts only; single-entity accounts return an error |
| `transactionaccountingline` | Multi-book detection | Present only when Advanced Multi-Book Accounting is enabled |
| `accountingbook` | Book filtering | Not directly queryable; use `transactionaccountingline` inferential probe instead |
| `budgetcategory` | Budget category filtering | Not directly queryable; pass category name as a string filter on the `budget` table |

Surface any unavailable table honestly in output. Do not silently substitute a default
or omit the column; state what could not be verified and why.

## Report and Query Order

1. Standard report
2. Saved search
3. SuiteQL

Prefer the earliest source in that order that answers the question cleanly.

### Common NetSuite Standard Report IDs

Use these IDs when calling `ns_runReport` or equivalent report tools.
All reports accept `startDate`, `endDate`, and optionally `subsidiary` as parameters.
Resolve subsidiary IDs before passing them as filters (see Subsidiary resolution below).

| Report ID | Finance Use Case | Key Parameters |
| --- | --- | --- |
| `IncomeStatement` | Revenue, gross margin, EBITDA, period P&L | `startDate`, `endDate`, `subsidiary`, `department`, `class` |
| `BalanceSheet` | Assets, liabilities, equity, net book positions | `endDate`, `subsidiary`, `accountingBook` |
| `CashFlow` | Operating, investing, financing cash movements | `startDate`, `endDate`, `subsidiary` |
| `TrialBalance` | Period-end debit/credit balance by account | `startDate`, `endDate`, `subsidiary`, `accountingBook` |
| `GeneralLedger` | Full transaction-level posting detail by account | `startDate`, `endDate`, `subsidiary`, `account` |
| `BudgetVsActual` | Variance of actuals against budget by account | `startDate`, `endDate`, `subsidiary`, `budgetCategory` |
| `ARAgingSummary` | AR balance bucketed by aging tier, by customer | `endDate`, `subsidiary` |
| `ARAgingDetail` | Invoice-level AR aging with days outstanding | `endDate`, `subsidiary`, `customer` |
| `APAgingSummary` | AP balance bucketed by aging tier, by vendor | `endDate`, `subsidiary` |
| `APAgingDetail` | Bill-level AP aging with days outstanding | `endDate`, `subsidiary`, `vendor` |
| `VendorBalanceSummary` | Vendor balance roll-forward and open liability | `endDate`, `subsidiary` |
| `CustomerBalanceSummary` | Customer balance roll-forward and open AR | `endDate`, `subsidiary` |
| `BankRegister` | Cash and bank account transaction register | `startDate`, `endDate`, `account` |
| `ExpenseByDepartment` | Expense breakdown by department or cost center | `startDate`, `endDate`, `subsidiary`, `department` |

**Usage notes:**

- `BalanceSheet` returns point-in-time balances; always pass `endDate` only, not a date range.
- `TrialBalance` and `GeneralLedger` can return large result sets; narrow with `account` or `department` filters where possible.
- `BudgetVsActual` requires at least one budget category to be configured in NetSuite; if none exists, fall back to a SuiteQL variance pattern.
- For multi-book environments, pass `accountingBook` explicitly. If omitted, NetSuite defaults to the primary book.
- If a report call fails or returns empty, fall back to the saved search tier before dropping to SuiteQL.

## Subsidiary Resolution

Before running any subsidiary-filtered report or query, resolve valid subsidiary IDs:

1. Call `ns_getSubsidiaries` if available; use the returned IDs and names directly.
2. If `ns_getSubsidiaries` is unavailable, fall back to this SuiteQL pattern:

```sql
SELECT s.id, s.name, s.country, s.currency
FROM subsidiary s
WHERE s.iselimination = 'F'
ORDER BY s.name ASC
```

Never assume or hard-code subsidiary IDs. Always resolve before filtering.
Use the returned `id` field when passing a subsidiary filter to reports or queries.

## Variance Starter Patterns

A variance query requires two distinct data sources: actuals from posted transactions,
and a comparison basis from a separate source. Use this decision table to pick the
right pattern:

| Comparison Basis | Use When | Pattern |
| --- | --- | --- |
| Budget table | Customer has budgets configured in NetSuite | Pattern A below |
| Prior period actuals | No budget configured, or customer wants period-over-period view | Pattern B below |
| Saved search | Budget vs actual saved search already exists | Call `ns_listSavedSearches` with keyword `budget`; use the result directly |

If the `BudgetVsActual` standard report is available (see Report and query order above),
prefer it over either SuiteQL pattern; it applies NetSuite's own budget-matching logic
and handles multi-period rollups correctly.

---

### Pattern A – Actuals vs Budget

Use when the customer has budget amounts loaded into NetSuite. The `budget` table
holds period-level plan amounts by account, subsidiary, department, and class.

If CTEs are supported on the MCP endpoint, use the WITH clause form below.
If the endpoint rejects CTEs, restructure as inline subqueries using the same
logic in the FROM clause.

```sql
WITH actuals AS (
  SELECT
    a.id          AS account_id,
    a.fullname    AS account,
    a.accttype    AS account_type,
    NVL(SUM(tl.amount), 0) AS actual_amount
  FROM account a
  LEFT JOIN transactionline tl ON tl.account = a.id
  LEFT JOIN transaction t      ON t.id = tl.transaction
    AND t.posting        = 'T'
    AND t.approvalstatus = 2
    AND t.trandate >= TO_DATE('<START_DATE>', 'MM/DD/YYYY')
    AND t.trandate <= TO_DATE('<END_DATE>',   'MM/DD/YYYY')
  WHERE a.accttype IN ('Income', 'Expense', 'CostOfGoodsSold')
    AND a.isinactive = 'F'
  GROUP BY a.id, a.fullname, a.accttype
),
plan AS (
  SELECT
    b.account AS account_id,
    NVL(SUM(b.amount), 0) AS budget_amount
  FROM budget b
  JOIN accountingperiod ap ON ap.id = b.period
  WHERE ap.startdate >= TO_DATE('<START_DATE>', 'MM/DD/YYYY')
    AND ap.enddate   <= TO_DATE('<END_DATE>',   'MM/DD/YYYY')
    -- Optional: AND b.subsidiary = <SUBSIDIARY_ID>
    -- Optional: AND b.budgetcategory = '<CATEGORY_NAME>'
  GROUP BY b.account
)
SELECT
  act.account,
  act.account_type,
  act.actual_amount,
  NVL(pln.budget_amount, 0)                                      AS budget_amount,
  act.actual_amount - NVL(pln.budget_amount, 0)                  AS variance_amount,
  CASE
    WHEN NVL(pln.budget_amount, 0) = 0 THEN NULL
    ELSE ROUND(
      (act.actual_amount - NVL(pln.budget_amount, 0))
      / ABS(pln.budget_amount) * 100, 1)
  END                                                            AS variance_pct
FROM actuals act
LEFT JOIN plan pln ON pln.account_id = act.account_id
ORDER BY ABS(act.actual_amount - NVL(pln.budget_amount, 0)) DESC
```

**Usage notes:**

- If `plan` returns zero rows, the `budget` table is empty or the period join produced
  no matches. Verify that budget amounts are loaded for the requested period before
  concluding there is no budget. Fall back to Pattern B and surface the gap to the user.
- `variance_pct` returns NULL when the budget is zero to avoid division-by-zero. Present
  NULL variance percentages as `N/A — no budget` in output.
- For income accounts, a positive `variance_amount` means revenue beat plan. For expense
  accounts, a positive `variance_amount` means spend exceeded plan. Apply sign
  interpretation before presenting results.
- To filter by subsidiary or budget category, uncomment the optional filters in the
  `plan` CTE. Always resolve subsidiary IDs before filtering (see Subsidiary resolution).

---

### Pattern B - Actuals vs Prior Period

Use when no budget is configured, or when the user wants a period-over-period comparison.
This pattern is self-contained and requires no budget table.

```sql
WITH current_period AS (
  SELECT
    a.id       AS account_id,
    a.fullname AS account,
    a.accttype AS account_type,
    NVL(SUM(tl.amount), 0) AS current_amount
  FROM account a
  LEFT JOIN transactionline tl ON tl.account = a.id
  LEFT JOIN transaction t      ON t.id = tl.transaction
    AND t.posting        = 'T'
    AND t.approvalstatus = 2
    AND t.trandate >= TO_DATE('<CURRENT_START>', 'MM/DD/YYYY')
    AND t.trandate <= TO_DATE('<CURRENT_END>',   'MM/DD/YYYY')
  WHERE a.accttype IN ('Income', 'Expense', 'CostOfGoodsSold')
    AND a.isinactive = 'F'
  GROUP BY a.id, a.fullname, a.accttype
),
prior_period AS (
  SELECT
    a.id AS account_id,
    NVL(SUM(tl.amount), 0) AS prior_amount
  FROM account a
  LEFT JOIN transactionline tl ON tl.account = a.id
  LEFT JOIN transaction t      ON t.id = tl.transaction
    AND t.posting        = 'T'
    AND t.approvalstatus = 2
    AND t.trandate >= TO_DATE('<PRIOR_START>', 'MM/DD/YYYY')
    AND t.trandate <= TO_DATE('<PRIOR_END>',   'MM/DD/YYYY')
  WHERE a.accttype IN ('Income', 'Expense', 'CostOfGoodsSold')
    AND a.isinactive = 'F'
  GROUP BY a.id
)
SELECT
  cur.account,
  cur.account_type,
  cur.current_amount,
  NVL(pri.prior_amount, 0)                                  AS prior_amount,
  cur.current_amount - NVL(pri.prior_amount, 0)             AS variance_amount,
  CASE
    WHEN NVL(pri.prior_amount, 0) = 0 THEN NULL
    ELSE ROUND(
      (cur.current_amount - NVL(pri.prior_amount, 0))
      / ABS(pri.prior_amount) * 100, 1)
  END                                                       AS variance_pct
FROM current_period cur
LEFT JOIN prior_period pri ON pri.account_id = cur.account_id
ORDER BY ABS(cur.current_amount - NVL(pri.prior_amount, 0)) DESC
```

**Usage notes:**

- For prior year same period, set `<PRIOR_START>` and `<PRIOR_END>` to the matching
  dates twelve months earlier.
- For prior month, shift the prior dates back by one calendar month.
- Label output clearly as "current period vs prior period" so the user does not
  interpret it as a budget comparison.

## Period Status Starter Pattern

```sql
SELECT ap.periodname, ap.startdate, ap.enddate, ap.closed, ap.isquarter, ap.isyear
FROM accountingperiod ap
WHERE ap.isquarter = 'F'
  AND ap.isyear = 'F'
ORDER BY ap.startdate DESC
```

## Pending Approvals Starter Pattern

```sql
SELECT
  t.recordtype,
  t.trandate,
  t.tranid,
  NVL(t.memo, 'No memo') AS memo,
  NVL(e.entityid, 'N/A') AS created_by,
  NVL(SUM(ABS(tl.amount)), 0) / 2 AS transaction_amount
FROM transaction t
JOIN transactionline tl ON tl.transaction = t.id
LEFT JOIN employee e ON e.id = t.createdby
WHERE t.approvalstatus = 1
  AND t.posting = 'F'
  AND t.trandate >= TO_DATE('<START_DATE>', 'MM/DD/YYYY')
  AND t.trandate <= TO_DATE('<END_DATE>', 'MM/DD/YYYY')
GROUP BY t.recordtype, t.trandate, t.tranid, t.memo, e.entityid
ORDER BY transaction_amount DESC
```

## Unposted Transactions Starter Pattern

```sql
SELECT
  t.recordtype,
  t.trandate,
  t.tranid,
  NVL(t.memo, 'No memo') AS memo,
  NVL(e.entityid, 'N/A') AS created_by,
  NVL(SUM(ABS(tl.amount)), 0) / 2 AS transaction_amount
FROM transaction t
JOIN transactionline tl ON tl.transaction = t.id
LEFT JOIN employee e ON e.id = t.createdby
WHERE t.posting = 'F'
  AND t.void = 'F'
  AND t.trandate >= TO_DATE('<START_DATE>', 'MM/DD/YYYY')
  AND t.trandate <= TO_DATE('<END_DATE>', 'MM/DD/YYYY')
GROUP BY t.recordtype, t.trandate, t.tranid, t.memo, e.entityid
ORDER BY transaction_amount DESC
```

## Multi-Subsidiary and Consolidation Patterns

### When to Use Reports Versus SuiteQL for Consolidated Views

SuiteQL cannot replicate NetSuite's consolidation engine. Use this decision rule before
choosing an approach:

| Need | Use |
| --- | --- |
| Consolidated P&L or balance sheet with eliminations applied | Standard report (`IncomeStatement`, `BalanceSheet`) run at the parent subsidiary level; NetSuite applies eliminations automatically |
| Operational breakdown by subsidiary without elimination logic | SuiteQL multi-subsidiary pattern below |
| Intercompany AR/AP tie-out to verify eliminations are clean | SuiteQL intercompany offset pattern below |
| Identifying which elimination entries posted in a period | SuiteQL elimination entry pattern below |
| Consolidated cash flow | Standard `CashFlow` report at parent level only; do not attempt in SuiteQL |

**The consolidation boundary:** When a report is run at the parent subsidiary level in
NetSuite, the platform applies currency translation, intercompany eliminations, and
minority interest adjustments automatically. SuiteQL bypasses this engine entirely.
A SuiteQL `SUM` across all subsidiaries is not a consolidated figure; it is a
gross aggregation before eliminations and FX translation. Always label SuiteQL
multi-subsidiary output as "pre-elimination aggregate" and not "consolidated."

---

### Multi-Subsidiary Operational Breakdown (Pre-Elimination Aggregate)

Use for operational views (revenue by region, expense by entity) where elimination
logic is not required. Label output explicitly as pre-elimination.

```sql
SELECT
  s.name AS subsidiary,
  s.country AS country,
  c.symbol AS currency,
  NVL(SUM(tl.amount), 0) AS base_amount,
  NVL(SUM(tl.foreignamount), 0) AS foreign_amount
FROM transactionline tl
JOIN transaction t ON t.id = tl.transaction
JOIN subsidiary s ON s.id = t.subsidiary
JOIN currency c ON c.id = s.currency
WHERE t.recordtype = '<RECORD_TYPE>'
  AND t.posting = 'T'
  AND t.approvalstatus = 2
  AND s.iselimination = 'F'
  AND t.trandate >= TO_DATE('<START_DATE>', 'MM/DD/YYYY')
  AND t.trandate <= TO_DATE('<END_DATE>', 'MM/DD/YYYY')
GROUP BY s.name, s.country, c.symbol
ORDER BY base_amount DESC
```

Note: the `s.iselimination = 'F'` filter excludes elimination subsidiaries from the
aggregate. Remove it only when you specifically want to inspect elimination entries.

---

### Elimination Entry Detection Pattern

Use to identify which elimination entries posted in a period and verify that
intercompany activity was eliminated. Elimination subsidiaries are flagged with
`iselimination = 'T'` in NetSuite.

```sql
SELECT
  s.name AS elimination_subsidiary,
  a.fullname AS account,
  a.accttype AS account_type,
  t.tranid AS transaction_id,
  t.trandate AS post_date,
  NVL(t.memo, 'No memo') AS memo,
  NVL(SUM(tl.amount), 0) AS elimination_amount
FROM transactionline tl
JOIN transaction t ON t.id = tl.transaction
JOIN subsidiary s ON s.id = t.subsidiary
JOIN account a ON a.id = tl.account
WHERE s.iselimination = 'T'
  AND t.posting = 'T'
  AND t.trandate >= TO_DATE('<START_DATE>', 'MM/DD/YYYY')
  AND t.trandate <= TO_DATE('<END_DATE>', 'MM/DD/YYYY')
GROUP BY s.name, a.fullname, a.accttype, t.tranid, t.trandate, t.memo
ORDER BY t.trandate DESC, ABS(NVL(SUM(tl.amount), 0)) DESC
```

If this query returns zero rows for a period where intercompany activity is known to
exist, flag it as a consolidation risk: eliminations may not have been posted.

---

### Intercompany AR/AP Tie-Out Pattern

Use to verify that intercompany receivables and payables net to zero before month-end
close. A non-zero net balance indicates an unreconciled intercompany position that
will survive into the consolidated financials unless corrected.

```sql
SELECT
  s.name AS subsidiary,
  a.accttype AS account_type,
  a.fullname AS account,
  NVL(SUM(tl.amount), 0) AS balance
FROM transactionline tl
JOIN transaction t ON t.id = tl.transaction
JOIN subsidiary s ON s.id = t.subsidiary
JOIN account a ON a.id = tl.account
WHERE t.posting = 'T'
  AND s.iselimination = 'F'
  AND t.trandate <= TO_DATE('<END_DATE>', 'MM/DD/YYYY')
  AND (
    LOWER(a.fullname) LIKE '%intercompany%'
    OR LOWER(a.fullname) LIKE '%due to%'
    OR LOWER(a.fullname) LIKE '%due from%'
  )
GROUP BY s.name, a.accttype, a.fullname
ORDER BY s.name, a.accttype
```

After running this query, sum the `balance` column across all rows. A non-zero
grand total is the intercompany gap requiring reconciliation. Present both the
subsidiary-level detail and the net total in the output.

**Interpretation guide:**

| Net IC balance | Meaning | Action |
| --- | --- | --- |
| Zero | Intercompany positions tie out | No action required |
| Non-zero, small | Timing difference or FX rounding | Verify with both subsidiaries; check for unposted revaluation |
| Non-zero, material | Missing IC invoice, unapplied payment, or booking error | Escalate to controller; do not close period until resolved |

---

### Consolidation Guidance for "Consolidated With Eliminations" Scope Requests

When the user requests a consolidated view with eliminations:

1. Use the standard `IncomeStatement` or `BalanceSheet` report run at the parent
   subsidiary level. Do not attempt to reconstruct this in SuiteQL.
2. Run the intercompany tie-out pattern above before presenting consolidated results.
   If IC balances are not clean, flag this before delivering the consolidated output.
3. Run the elimination entry detection pattern to confirm eliminations posted.
   If elimination entries are missing, state: `FLAG: Elimination entries not detected
   for this period. Consolidated output may overstate intercompany revenue and expense.`
4. For FX translation: consolidated report figures use NetSuite's translation rates.
   If the user asks about CTA (cumulative translation adjustment) or FX impact,
   direct them to the balance sheet equity section of the standard report; do not
   attempt to derive CTA in SuiteQL.

## Query Guardrails

- Do not mutate records from a query workflow unless the user explicitly asks for a write action.
- Resolve raw IDs to names before presenting the output.
- If report logic and query logic disagree, say so and explain which source is more authoritative.
- State when a query is a best-effort analytical view rather than a formally tied report.
