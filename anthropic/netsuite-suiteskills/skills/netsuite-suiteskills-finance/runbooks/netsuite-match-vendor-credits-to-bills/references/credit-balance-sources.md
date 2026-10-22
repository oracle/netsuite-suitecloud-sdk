# Verifying vendor-credit balances

Read before filtering credits by a remaining amount or proposing allocations. Apply [operating-contract.md](operating-contract.md), including its retrieval, failure, output and action boundaries. Field names from another API or account do not establish this connector's schema. All SQL tables, columns and relationships require current SuiteQL metadata before any SELECT; missing/denied metadata blocks that branch. No probes, retries of permission/validation failures, or schema guesses. Independently qualified reports/searches/record reads may support their own conclusions; they never evade a denial. Use read tools only within the local call and paging budgets in operating-contract.md.

## Source order and verification

1. **Transaction-level A/P Aging Detail or a governed saved search.** Discover an available report/search through current approved callable tools and verify its parameters; never invent a report ID. If report discovery/detail is not exposed, use a qualified saved search or known-record read instead. A tool name in historical documentation is not availability. Require a vendor-credit row with stable transaction identity, an amount explicitly meaning remaining/open credit, the amount's currency basis, and the requested as-of date. Request the relevant vendor/subsidiary scope and complete pagination. A vendor subtotal or A/P Aging Summary cannot identify a particular credit's unused amount. A report that returns only base/consolidated currency cannot supply a native-currency allocation without a verified corresponding native amount. If credit rows or identity are not exposed, move to a supported source below.
2. **Vendor-credit record Unapplied amount.** Use an available read-only record/search tool whose metadata exposes an unapplied field. Oracle's VendorCredit schema describes `unApplied` (SuiteScript Records Browser: `unapplied`) separately from `applied` and the original amount. These API names are not automatically SuiteQL columns. Confirm that the returned value is for this saved credit, its transaction currency, and the relevant date. Prefer batched reads; a focused verification sample is acceptable, but does not establish whole-scope completeness.
3. **Metadata-verified SuiteQL unused-payment field.** An earlier account refinement reported `transaction.foreignpaymentamountunused` on credits and `transaction.foreignamountunpaid` on bills. This is a candidate mapping, not cross-account certification. Check current schema/exposure and corroborate populated values with source 1 or 2 for a bounded sample before using it for the full scope. `foreignamountunpaid` was NULL on that account's credits. Do not filter credits on it, or on `NVL(field, 0) > 0`, before validating semantics. Do not repeatedly query `foreignamountremaining` after a connector error. `amountunpaid` may be available for bills, but its currency basis must be verified independently.
4. **Validated application-link reconstruction.** Use `NextTransactionLineLink` only if the connector exposes the necessary link semantics and complete application history, following the checks below. It is not a guessable replacement for an unavailable remaining-amount field.

For a native report branch, inspect current `ns_listAllReports` and `ns_runReport` callable schemas. Resolve an observed report ID and its actual as-of/date and subsidiary flags; use `ns_getSubsidiaries` and accounting-book discovery only when the current report/source contract requires those supported filters. Do not invent dynamic vendor filters or assume report output is transaction detail. A report returning only summary rows cannot establish a credit allocation. If the required discovery/parameters are unavailable, that report branch is unavailable; independently qualified record/search evidence may still support the task.

Choose the first supported route. After a source fails, classify the failure and stop the affected branch. Another declared route may proceed only when it independently establishes access, identity, filters, grain, dates, currency and completeness for its conclusion; it cannot bypass denied metadata or a compiler refusal. Do not repeat the same invalid join or column with guessed spelling. Under a tool-call cap, prioritize balance verification over graphics and optional enrichment. If no route verifies a remaining amount, report the compatible record identities, the failed/missing source and the exact evidence needed; withhold only the unsupported allocations.

## Validate the returned amount

Retain source name/ID, record ID, raw amount, currency/basis, normalized remaining amount, as-of date and completeness. Distinguish literal zero, NULL, unavailable field, permission failure and no returned rows.

- A verified zero means fully used within that source/date; unknown is not zero.
- A signed negative report credit may be normalized to positive capacity only when that report's sign convention and credit row type are verified. Do not use `ABS` indiscriminately on transactions or application links.
- Original credit total, `foreigntotal`, vendor net payable balance, and status cannot substitute for remaining credit. They may include already applied amounts or other transactions.
- Confirm report currency and transaction currency; never allocate consolidated/base amounts against a foreign-currency bill without a supported conversion of the actual remaining amount.
- For a current position, exclude future-dated transactions. For a historical position, use a source valid for that date; today's unused field is not a historical snapshot.
- For joins to AP accounting lines, resolve the relevant primary accounting book and AP account rather than hardcoding book 1. Check transaction uniqueness before totaling.
- If two sources disagree for the same credit/date/currency beyond the source's rounding precision, report the discrepancy and withhold that credit's allocation. Do not pick whichever value enables a match.

## Conditional NextTransactionLineLink reconstruction

Require current `ns_getSuiteQLMetadata` for the link table and every joined table, including fields, direction and link-type meaning, before any link SELECT. Candidate concepts include previous/next document, previous/next line, link type and application amount. Do not assume the vendor credit is always the previous document, or that every link is an application: origin links, bill-payment links and item transformations are different events.

Before computing a balance, verify all of the following on a bounded known credit against its record Unapplied value or an A/P aging detail row:

1. Which endpoint represents the credit, which represents the affected transaction, and which link types consume or restore that credit.
2. Whether amounts are per application, line, or repeated document total, their sign convention and their currency basis. A missing amount is unknown, not zero.
3. The actual unique application/line key. Deduplicate join copies by that key, not by amount alone; two legitimate applications can have equal amounts. Aggregate valid link amounts before joining item, tax or accounting lines.
4. Treatment of voids, reversals, unapplies/reapplications and the as-of cutoff, with complete pagination. A filtered/truncated history cannot prove the residual. No returned links means no applications only if coverage and direction are established.

With that mapping established:

`remaining = original credit amount - net consumed credit amount`

Here net consumed includes only verified balance-reducing applications, net of verified restorations, all in the credit's transaction currency. Reconcile the computed residual to the authoritative unused amount used for validation and enforce `0 <= remaining <= original`. A negative or excessive residual is an inconsistency to investigate, not a value to clamp into range. If source access is insufficient to validate this mapping, do not run speculative link arithmetic; use another source or mark the balance unverified.

## Source documentation

- [Oracle: A/P Aging Detail Report](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1529840.html) describes transaction-level Amount Due and report scope; report/connector exposure still must be checked.
- [Oracle: VendorCredit record schema](https://system.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2023_2/schema/record/vendorcredit.html) describes `unApplied` and `applied`; it is not a SuiteQL schema guarantee.
