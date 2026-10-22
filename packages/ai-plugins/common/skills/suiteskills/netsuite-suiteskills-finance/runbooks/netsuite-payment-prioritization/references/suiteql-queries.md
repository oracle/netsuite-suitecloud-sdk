# Evidence retrieval for payment proposals

## Remaining-balance compatibility rule

The evaluated connector rejected a transaction query for a remaining-amount field. Treat this as a schema/capability boundary, not as evidence of zero balance.

- Discover metadata before selecting any remaining/unpaid/unapplied amount field.
- Do not use `foreignamountremaining` unless the live metadata explicitly exposes it for that record/query path.
- Candidate names in this reference are discovery hints only.
- If no authoritative report/search/record/SuiteQL path can verify the remaining amount, return `REMAINING_AMOUNT_NOT_VERIFIED` and exclude the affected row from fully verified cash-feasibility calculations.

Discover the current connector schema before querying. Names such as
`ns_listAllReports`, `ns_runReport`, `ns_listSavedSearches`, `ns_runSavedSearch`,
`ns_getRecord`, `ns_getSuiteQLMetadata`, and `ns_runCustomSuiteQL` describe likely
capabilities, not a dependency on a specific server prefix or account.

These are adaptable query shapes, not universally verified account schemas.
Confirm fields, result types, permissions, sign conventions and currency basis.
Use bound parameters when offered; otherwise validate numeric IDs and escape
string literals through the connector's supported mechanism. No SQL writes.

## Completeness before totals

- Prefer native connector pagination. When the discovered tool exposes
  `pageSize`/`pageIndex`, use both from the first call, follow its supported size
  and index convention, and exhaust the returned page count/continuation. Do not
  invent these arguments for another connector or assume paging removes a SQL cap.
- Put a deterministic `ORDER BY` in the **outermost submitted query**, including
  after any required ROWNUM wrapper. Include the complete unique obligation key
  (transaction plus line/installment where applicable), and explicit null-date
  placement. Keep query, scope and sort identical across pages; retain every page.
- A row count equal to a cap, a `hasMore` flag, or a continuation token means
  coverage is unresolved until pagination is completed or scope is narrowed.
- **Never put `ROWNUM <= 1000` on base rows before SUM/COUNT/AVG** when reporting a
  population total. One returned aggregate row can still hide a truncated input.
- If the connector requires a query-level cap, cap the result of an aggregate
  subquery, not its input. Count the complete scoped set of distinct obligation
  keys inside the subquery; an outer one-row cap may limit only the aggregate
  result. A transaction-header count cannot validate journal/installment units.
- A 1,000-row query cap cannot be overcome just by asking for page two of those
  same 1,000 rows. Use a verified row-number window over a stable ordered query,
  or exhaustive nonoverlapping date/ID partitions. Verify total unique IDs against
  an independently uncapped scoped count. If that cannot be done, label a sample
  and do not present complete rankings or whole-account feasibility.
- Top-N requires sorting the complete eligible set before selecting N. `ROWNUM`
  in the same query block as `ORDER BY` does not establish the top N. Correct
  membership and final display order are separate checks: sorting an already
  truncated arbitrary prefix cannot recover the true top N. If a required cap
  wraps an ordered subquery, repeat the sort outside the wrapper as well.
- Check page boundaries, duplicate/missing composite keys and an independent
  scoped count. Reconcile before deduplication hides a paging defect. If the
  source changes during retrieval, refresh consistently or disclose unresolved
  coverage. After complete retrieval, explicitly re-sort the whole eligible set
  by proposal priority before offset/cash allocation; never rank each page alone.
  A final local sort repairs order only, not missing source rows.

## Payment Run payable evidence

Prefer a supported Payment Run eligibility source when exposed. Otherwise discover
reports/searches/records and line-level schema that can reproduce its eligibility.
Document the gap when MCP cannot establish parity. Do not claim completeness from
a query restricted to `VendBill` or an inner join to vendor.

Retrieve by transaction type and payee type. Candidate codes may include `VendBill`,
`ExpRept`, `Journal`, `VendCred` and `VendPymt`; verify codes and field meanings in
current metadata. Also inspect other types exposed by the native eligibility pool.
A type code or posting status alone does not establish a selectable A/P balance.
Keep VPPs outside this workflow unless support is explicitly verified; the default
proposal excludes them.

Use an obligation identity comprising transaction ID, native A/P line identity
and installment ID as applicable. Record source type, payee ID/type, subsidiary,
A/P account, native currency, transaction and due/discount dates, remaining signed
balance, applicable approval/hold/void status, and active Payment Run reservation.
Do not inner-join all payees to vendor: resolve vendor and employee records by
their verified entity type, preserving unmatched identities as unknown.

- **Vendor bills:** remaining unpaid balance, not original total. When installments
  exist, retrieve each eligible open/partly paid installment; do not also allocate
  the parent header. Reconcile installment amounts and dates to supported records.
- **Expense reports:** retrieve employee payee and reimbursement eligibility from
  supported records/searches. Verify applicable approval and payment states rather
  than requiring vendor fields or assuming missing bill fields imply rejection.
- **Journals:** inspect qualifying A/P lines and their open/applicable balances,
  payees, accounts and signs. A zero-sum journal header is not a zero A/P liability.
  Keep distinct lines; exclude non-A/P and duplicate accounting-book rows. Do not
  assign a header-level entity, due date or unpaid field to every journal line.
- **Negative offsets:** separately retrieve remaining eligible vendor credits,
  negative bill-payment amounts and negative journal A/P balances. Original
  payment amounts and Paid status do not establish unused capacity. An unused
  field must be verified for that type. Check remaining amounts and signs against
  records/application history; preserve offset line identities and compatibility.
- **Other types:** only include when the native source or equivalent verified
  evidence establishes selectable open A/P obligations. Otherwise report unknown
  eligibility; do not silently exclude a supported type from the universe.

Field candidates such as `foreignamountunpaid`, `foreignpaymentamountunused`,
`approvalstatus`, `paymenthold`, `duedate` and installment/link tables are discovery
hints, not universal fields. Distinguish not-applicable from unavailable. Use
metadata, authoritative searches and record samples to validate each type’s
remaining-balance semantics. Resolve status labels by transaction type as well
as status code. Keep native signs until their meaning is verified; indiscriminate
ABS would convert offsets into new liabilities.

Reconcile unique obligations, amounts grouped by currency and type, and excluded
or unknown rows. Verify coverage for every relevant type, journal line and
installment. Nonexistent examples or inaccessible tables must be reported as
coverage gaps rather than tested support. Join enrichment back to these keys;
ignore headings, subtotals and duplicate representations. A bills-only user
scope excludes journals; a broad A/P scope must retain eligible journal lines.

Default due/discount windows use OR, not mutually exclusive AND predicates. Use
the requested payment date consistently. Retrieve relevant no-date obligations
separately. Offset sources are selected by remaining capacity and application
compatibility, not by the positive obligation’s overdue date predicate.

## Currency and application checks

Apply account-based Payment Run rules and verified transaction restrictions. A
bank in subsidiary base currency can support multiple native transaction
currencies; a non-base-currency account restricts candidates to its own currency.
Retrieve effective payment-date conversion rates and native/account precision.
Preserve native obligations/offsets per application group, then convert line cash
into account currency with verified flow rounding. Compare converted cash to the
account-currency cap and reserve. Never convert offsets across incompatible native
application groups just because both convert into the same bank currency.

Do not infer that two rows can be paid together merely from the same vendor name.
Use payee identity/type, currency, A/P account, rate and billing-address grouping
where required. Keep submitted/in-flight or reserved obligations from a second
payment proposal when native eligibility blocks them; an existing payment with
an independently verified remaining negative amount is a distinct offset source.

## Account, preference and balance evidence

Resolve explicitly named accounts from account number/name, then a documented
conversation choice, then configured preferences. Common fields to inspect on
`account`: ID, number, full name, type, currency, inactive status and subsidiary
restrictions. Type “Bank” alone does not prove payment-flow compatibility.

Prefer a balance report with explicit account, currency, accounting book and
as-of date. For a GL fallback, verify the monetary field on
`transactionaccountingline`, posting semantics, book, transaction cutoff and
currency. Do not assume a field named `amount` is the bank's native currency.

Aggregate the entire scoped ledger **inside** a subquery, then apply a required
output-row cap outside. Never sum the first million (or first thousand) ledger
lines and call that a bank balance. Reconcile a sample/account total to the
report. For the operational payment cash basis, discover the primary accounting
book from authoritative book metadata/report context and apply its verified ID
in the GL input filter **before SUM**. Do not hardcode `accountingbook = 1`, infer
primary status from a single visible book, or merge primary/secondary lines.
An ID/name listing, including the name “Primary Accounting Book,” is not proof
of the primary setting unless the tool contract explicitly guarantees it. Verify
an exposed primary flag or documented primary-scoped report context. A permission
failure is an evidence gap; grouping by book is diagnostic, not a substitute for
selecting the verified primary book before SUM.
Use only exposed fields/tools; a missing accounting-book table does not prove
single-book configuration. If primary context is not verifiable, use an
explicitly primary-scoped report or disclose the gap and withhold GL-based
feasibility. Preserve cap-only/ranking alternatives where allowed by the skill.
A user-requested secondary/adjustment-book report remains separate, with its
verified book/currency semantics; it is not extra bank cash. Do not treat an
adjustment-only book's raw lines as a complete operational balance.
If only subsidiary-base-currency GL is available for a foreign-currency bank,
do not use it for a native-currency feasibility test. Report the missing source.

Label the source “posted GL balance as of [date]” where applicable. It is distinct
from cleared bank funds and may omit restrictions or outstanding commitments.
Do not assume an overdraft facility or project future cash receipts.

## Response evidence

Preserve account identity, source/tool, scope, extraction time, page coverage,
obligation and offset keys and exact rules. Runtime evidence may contain account details;
the reusable skill package must not contain that evidence or test-account IDs.
