# NetSuite reconciliation data and calculations

Use the sections relevant to the requested count, relationship, difference, completion or history question. Record names and relationships guide planning; verify their availability and interpretation in the current connector.

## Schema verification

Plan only required fields, types, state meanings and joins. Reuse metadata verified for the same connection, NetSuite account, role, session and scope while relevant capabilities remain unchanged, when permitted. Fetch unresolved required metadata or satisfy an actual connector prerequisite; no blanket per-table recheck. Refresh affected metadata after relevant connection, role, permission or capability changes. Cached metadata is not a current financial observation.

Use field selection only when supported. `ns_getSuiteQLMetadata` accepts `recordType`, not a field projection: fetch a needed schema once and retain relevant properties, join targets and errors. This reduces retained context, not server response size. Do not substitute speculative query probes for required metadata or guess undocumented fields/joins. Missing standalone currency/book/subsidiary metadata does not invalidate a verified reference field or justify display-only label lookups.

## Populations and relationships

| Population | Identity and classification |
| --- | --- |
| Accounts | Verify Bank/CredCard type values and `Account.reconcileWithMatching = 'T'`. Retrieve identity/name, inactive state and required subsidiary/currency scope. Preserve eligible, ineligible and unknown accounts; an active-only result does not establish all close obligations. Retrieve `balance`/`fxBalance` only when needed. |
| Bank items | Count distinct `BankingTransaction.id`. Linked when `ImportedTransactionMatch.importedTransaction = BankingTransaction.id` exists. Open requires a complete current membership check finding no link and verified non-exclusion. `transactionStatus`, suggestions and duplicate flags do not establish matching. |
| Excluded bank items | `BankingTransaction.excluded = 'T'` removes an imported item from matching without deleting it or reversing GL postings. Keep excluded items outside active work and eligible matching denominators. `'F'` is non-excluded; null/unavailable is Unknown. |
| Recorded duplicate bank items | Non-null `BankingTransaction.duplicateOf` references another `BankingTransaction.id`. Flag the referencing item without changing its exclusion/matching classification. Null means no recorded duplicate reference, not proof of uniqueness. This does not establish a duplicate GL posting. |
| Posted GL | `TransactionAccountingLine` supplies posted document/line/account/book effects; join `transactionLine` on document and line identity. Its basic identity/clearing fields are `transaction`, `id`, `cleared`. Linked when `GeneralLedgerTransactionMatch.transactionDoc = transactionLine.transaction` AND `GeneralLedgerTransactionMatch.transactionLine = transactionLine.id` exists. Verify effective-date/posting source, account/book and currency basis. Eligible unlinked effects with `cleared = 'F'` are active open; `'T'` is cleared; null/other is Unknown. |
| Suggestions | `SuggestionBankingTransaction.suggestion` identifies `BankRecSuggestion.id`; `bankingTransaction` identifies the bank item. Count distinct proposals and affected bank items separately, deduplicating across accounts. Membership alone does not prove pending state or actionability. |

Both membership tables reference `TransactionMatch.id` through `transactionMatch`. Current membership counts need no parent lookup; retrieve it only for type/source, item completion or unresolved workflow semantics. Match type is not a generic lifecycle filter. Missing/incomplete memberships or unknown eligibility/exclusion/clearing remain Unknown.

## Counts and aggregation

- Establish scoped items and consolidate posted effects at document/line/account/book grain before membership joins, preserving currency basis. Use `EXISTS` or reduced memberships so each item/effect contributes once. Retain unlinked lines, line 0 and mainline effects; no blanket mainline filter. Distinct counts do not fix inflated sums; distinct amounts can discard equal-value items. Exclude opening effects only with evidence, never age alone.
- Aggregate bank and GL independently by account, currency/book basis, state and needed date cohort. Combine counts, signed nets, oldest dates and missing-amount counts in the same summaries. For current work/priorities, retain older and undated work; exclude future items from close-period work or show them separately. Period-limited counts keep their requested population. Undated work cannot prove a clean cutoff.
- For workload summaries, count distinct excluded items, recorded duplicates and their overlap in the same bank aggregation before filtering active work, preserving account/date cohorts. Unavailable flag evidence stays Unknown. Fetch duplicate originals only for an investigation or consequential exception.
- Preserve missing amounts before consolidation. `NVL(amount,0)` requires a missing-amount count; nonzero makes the amount incomplete. Show known amounts only as a labeled subtotal. Net zero with open items is still work. Both signs support an offsets note if established by the same result; no extra call or gross/absolute sums.
- For suggestion counts, deduplicate account/item/proposal relationships first. Count distinct proposals and affected items independently; if needed, overlap counts items with multiple distinct proposals. Use one grouped query or complete compact relationships. Summing per-item proposal counts overcounts shared proposals.
- Apply any required row cap outside aggregation, never to its input. A capped query's `totalResults` does not establish completeness. If grouped output reaches its limit, retrieve complete supported pages or disjoint partitions with stable unique ordering. If grouping fails or returns item rows, reuse complete paginated detail and calculate with code. Never claim totals from truncated/sample rows or rerun complete results merely to count them.
- Matching progress uses each population's own complete, defined period denominator. Zero means “No period items”; Unknown cannot support a percentage. Linked counts do not establish saved-statement completion. Bank/GL counts are separate populations, and their totals do not identify individual counterparts.

## Investigation and differences

Inspect complete selected groups and competing proposals. Verify detail for every represented suggestion type: `AutoMatchSuggestionDetail` for `AUTO_MATCH` existing transactions; `AutoApplySuggestionDetail` for `AUTO_APPLY` invoice/bill targets and installments. `AUTO_APPLY` can create/apply payments and affect the GL; this skill only analyzes it. An `AUTO_CREATE` enum alone does not establish support. Read proposal-state evidence for pending/actionable claims; inaccessible members make a group partial.

Compare signs, amounts, account/entity, dates, references, parties and payment/deposit detail as needed to establish event identity. Equal amounts/dates alone do not suffice. Attribute engine rationale only to exposed rule evidence. To investigate duplicates/exclusions, verify source account, import/statement lineage, original record, related matches and posted effects.

Align currency, book, cutoff/timezone and signs; normalize cash increases positive and verify credit-card polarity. Current `Account.balance`/`fxBalance`, imported-item sums, posted-book balances and statement balances are distinct measures. Verify their currency bases; the balance pair's difference does not prove FX exposure. Unknown codes stay labeled Unknown; equal raw currency keys establish identity, not comparable bank/GL amount bases. Include a verified USD measure only if the connector requires it. No prior reconciliation does not imply zero opening balance.

| Measure | Calculation on verified comparable bases |
| --- | --- |
| Selected match difference | Selected bank effects minus selected posted GL account effects. |
| Raw bank/GL gap | Bank closing balance minus GL closing balance. |
| Evidenced contribution | Bank minus GL effect for each supported event at cutoff; count events/opening effects once. |
| Unexplained residual | Raw gap minus evidenced contributions; incomplete balances/amounts prevent a verified total. |
| Native statement difference | With verified signs, ending statement balance minus prior reconciled balance and included activity. |

Equal-effect matching or imported-copy exclusion can change queues without changing GL balances. Statement inclusion can change saved difference without changing bank/GL balances. Zero difference proves amount agreement only.

Separate accounting causes from matching/clearing states. Timing, expected clearing dates and opening-balance classifications need evidence. For a supported adjustment, state purpose, amount/currency, account/book/period and evidence without guessing journal accounts. Verify posting-period status when material to close/adjustment conclusions; an open/incomplete period makes them preliminary. Prioritization alone requires no period-status query/disclaimer.

Use only user-provided or verified applicable materiality thresholds, with scope, currency and boundary. Itemize qualifying and independently consequential smaller exceptions; aggregate the complete remainder by account/currency/book/classification using count and signed net. Materiality never eliminates a residual. Without a threshold, apply no materiality filter; ask only when a formal decision needs one. Escalation labels require applicable policy.

## Completion, coverage and history

Identify the applicable workflow and required eligible population. Under a verified applicable NEXT interpretation, `TransactionMatch.matchType = RECONCILIATION` establishes completion for linked items without an additional `reconciledBy` or cleared-flag condition. Item completion does not establish full coverage or statement closure.

For a saved statement, verify actual reconciliation, account, date/cutoff, recorded state, included activity and saved difference. A completed statement can retain a nonzero difference; show state and difference separately. Missing fields do not establish an open/in-progress statement.

Verify query identifier `BankingStatement` (`bankingstatement`), not display label `ImportedAccountStatement`. `asOf` is imported statement date; `createdDate` is row creation time. Imported balances/dates do not prove closure. “Last reconciled statement date” requires completed saved-reconciliation evidence; it is not the action/completion date. Use “None found in verified scope” only after a complete search, otherwise Unknown.

Coverage needs statement-period gaps/overlaps and opening/closing continuity through the requested close, including older carryforwards. Date extrema, recent/no imports, zero balances or current matching do not prove coverage or inactivity. Clearing may rely on external bank evidence without an imported counterpart. Future/unsettled items are not automatically overdue.

Name the age basis: transaction date to cutoff, evidenced unresolved duration or time since a supported completed-through date. Historical comparisons need state at each observation on comparable account/entity, book, currency, scope and cutoff bases. Current relationships and transaction/modification dates cannot reconstruct past status. Distinguish effective date, posting period, observation time and action time. Attribute changes to evidenced additions, edits, exclusions, reversals, relationships or coverage changes, using changed amounts rather than whole current values. Recurrence requires the same event in comparable prior-close evidence; continuous unresolved duration alone does not show recurrence, and recurrence alone does not prove a control deficiency.
