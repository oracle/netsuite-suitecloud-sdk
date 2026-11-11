# Runtime contract and discovery notes

Do not assume report titles, saved-search names, account mappings, subsidiary relationships, transaction fields, or SuiteQL schemas. Discover the current account's capabilities before analysis.

## Verify before use

| Source | Required confirmation |
| --- | --- |
| Native report | Data family, date/as-of semantics, subsidiary and counterpart dimensions, currency basis, account scope, and whether values include eliminations. |
| Saved search | Population, transaction and account filters, main-line versus line-level behavior, summary formula, date basis, approval status, and whether both sides of a pair are represented. For JE activity, confirm it includes the relevant intercompany journal type or verified mapped intercompany accounts. |
| Record lookup | Metadata and fields for counterparties, amounts, status, currency, subsidiary, account, and relevant application/elimination detail. |
| SuiteQL | Metadata for every table and join, bounded result set, verified fields for each comparison dimension, and any approval required by the actual host/tool before execution. |

## Required financial views

Use the Trial Balance, Balance Sheet, and Income Statement as complementary report views, not substitutes for each other. A receivable/payable-exposure review requires the Balance Sheet for its relevant analysis units. A review that presents revenue, cost, or expense flow requires the Income Statement for those units. Verify whether each report can filter or surface the mapped intercompany accounts, selected subsidiary scope, accounting book, currency basis, and required date/as-of period. Retain only mapped intercompany rows and immediately relevant subtotals when a report returns a full chart; row volume never justifies skipping a relevant view. Use journal detail to explain movements and test specific pair relationships; the financial statements alone do not establish a transaction-level pairing.

Resolve the subsidiary hierarchy before running the financial views. Build a non-overlapping analysis scope: selected leaf subsidiaries, or another explicitly requested non-overlapping set. A parent, consolidated, or roll-up entity must never be included in a tie-out alongside its descendants. If hierarchy is unavailable, do not calculate pair results that could overlap; state that limitation.

Apply the checklist only to sources required by the selected question. A full controller review uses all relevant views; retain the domain source sequence for the applicable review. Receivable/payable exposure requires the Balance Sheet; revenue, cost or expense conclusions require the Income Statement. Record coverage for every required non-overlapping analysis unit:

| Required source | Required coverage |
| --- | --- |
| Trial Balance | Returned or attempted for every confirmed non-overlapping analysis unit, as of the selected date. |
| Balance Sheet | Returned or attempted for every confirmed non-overlapping analysis unit, as of the selected date. |
| Income Statement | Returned or attempted for every confirmed non-overlapping analysis unit, for the selected date range. |
| Journal detail | Posted and pending-approval intercompany populations attempted for every confirmed non-overlapping analysis unit. |
| Intercompany Reconciliation | Returned or attempted once for the full confirmed scope; retain its own population. |
| Intercompany Elimination | Returned or attempted once for the full confirmed scope; retain its own population. |

For a date-only review, identify relevant intercompany accounts and active non-overlapping units from the smallest trustworthy native source before running detailed statements. Do not run a full chart-of-accounts sweep for every accessible entity unless the user explicitly requests full-estate coverage. If a native report cannot return a usable subsidiary breakout, run it separately for every required non-overlapping analysis unit. Do not sample units or treat a consolidated zero as individual-subsidiary evidence. A source attempt is accounted for when it returns data, confirms an empty population, or captures an access/runtime failure. Only verified complete data or a verified empty scoped population establishes coverage; a captured failure remains incomplete evidence.

For a current open period, use the actual run date as the as-of end date unless the user explicitly provides another date. Exclude any future-dated activity returned by a source and state the as-of date in the review.

## Evidence integrity

- A dashboard may aggregate only compatible rows. Keep incomplete and not-comparable records out of tie-out totals.
- Show the currency exactly as returned. Do not recalculate conversion or assume a consolidation currency.
- Capture a validated NetSuite transaction link while retrieving journal detail when the connector provides one; never display raw internal identifiers.
- For account rows, retain a validated source or account-detail link when available. Do not fabricate URLs.
- Do not include customer, vendor, or transaction detail beyond what is necessary to investigate an exception.
- Treat sales/purchase reconciliation, posted elimination activity, mapped-account balances, and intercompany-JE activity as distinct source populations. Keep them separate unless a verified common definition permits aggregation.
- A saved search may supplement journal detail but must not be the sole source for the controller dashboard when the required financial reports are available.
- Treat pending-approval intercompany JEs as a distinct non-posted population. They belong in the activity/approval queue, not in Trial Balance, reconciliation, elimination, or posted tie-out totals.
- Never broaden the date range, change subsidiaries, or claim zero account-wide activity as a hidden fallback. State the returned range and ask the user for a different scope when needed.
- Respect any approval required by the actual host/tool; do not invent a permission dialog or separate chat confirmation for a requested read. Initiate the bounded read only after applicable domain evidence discovery; if required approval is declined, stop that call.
- Prefer efficient retrieval, but never trade away source completeness. Reuse a report only when it demonstrably covers every needed subsidiary and dimension; otherwise run the missing subsidiary views. Use one bounded journal-detail retrieval where it can cover the whole confirmed scope.
- When a report returns an entire chart of accounts, retain only the mapped intercompany rows and immediately relevant subtotals. Do not include irrelevant rows in the review or use their volume as a reason to ask the user to continue the same normal review in a fresh chat.
- SuiteQL may provide bounded journal-line, mapping, counterparty, or movement evidence after report discovery. It supplements the native Trial Balance, Balance Sheet, and Income Statement; it never replaces them.
- “No rows returned” from Reconciliation or Elimination is a source-coverage fact only. Do not turn it into a claim that an elimination was not expected, posted, failed, or missing without another verified source.
- Do not claim an account had no pre-range activity merely because its current ending balance equals the selected-period activity. Retrieve pre-range evidence before making that statement.
