# Connector and coverage

Read before the first account query. This file defines common tool discovery, safe substitutions, population checks and failure handling for the control recipes.

## Contents

- [Standard capabilities](#standard-capabilities)
- [Bind the account and cutoff](#bind-the-account-and-cutoff)
- [Preserve selected records and lines](#preserve-selected-records-and-lines)
- [Preflight by control](#preflight-by-control)
- [Compile query templates safely](#compile-query-templates-safely)
- [Population, joins and counts](#population-joins-and-counts)
- [Retrieve completely without a hidden lookback](#retrieve-completely-without-a-hidden-lookback)
- [Coverage record](#coverage-record)
- [Recover from failures proportionately](#recover-from-failures-proportionately)

## Standard capabilities

Discover tool schemas from the active connector; prefixes can vary. Use these Oracle-standard capabilities when available:

| Capability | Documented name | Purpose |
|---|---|---|
| Analytics schema | `ns_getSuiteQLMetadata` | Discover record types, fields and supported joins. |
| Read-only query | `ns_runCustomSuiteQL` | Run native SuiteQL through the standard tool. |
| Record evidence | `ns_getRecord` | Retrieve a known source record and relevant fields. |
| Existing searches | `ns_listSavedSearches`, `ns_runSavedSearch` | Use an existing search if it exposes equivalent data and complete result ranges. |
| Existing reports | `ns_listAllReports`, `ns_runReport` | Supporting reconciliation where scope, grain, currency and book match. |

Oracle supplies these capabilities in its MCP Standard Tools SuiteApp. Record-level access remains constrained by the connected role. Determine query metadata requirements from the current callable SuiteQL metadata interface. A REST-only metadata failure does not establish that SuiteQL metadata or query access is denied; check the required interface independently, while preserving any underlying data denial. If essential SuiteQL schema is unavailable, stop the dependent query. Historical permission notes are not a universal prerequisite. Customer setup uses a non-administrator role with the relevant connector and read permissions. Do not change roles or permissions as part of a review.

Sources: [standard tools](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_0902023508.html), [query tool](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_0905091645.html), [metadata tool](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_23123937539.html).

The documented query inputs are `sqlQuery`, optional `description`, and optional `pageSize`; inspect the live schema before calling. Do not pass a SuiteScript `params` array unless the discovered standard tool actually supports it. A `pageSize` does not itself prove all pages were returned. Use only pagination fields and continuation mechanisms actually supplied by the tool; never invent `offset` or a cursor parameter.

## Bind the account and cutoff

- Use the existing connection selected by the user; if multiple accounts are plausible, resolve that ambiguity before reading financial data.
- Preserve every supplied entity/subsidiary restriction. Resolve names using standard reads, and ask only when there are multiple valid matches. Do not query an unrestricted population because name resolution failed.
- If no date is given, a standard query can retrieve the session's NetSuite date:

```sql
SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS currentdate
FROM dual
```

- Confirm the account/session timezone where exposed. If unknown, identify the date basis as NetSuite session date and the timezone as unverified; do not silently borrow the computer's timezone. Resolve timezone ambiguity if it affects date-boundary evidence.
- Record the query execution timestamp and business date. A current-day review is based on records available at execution, not transactions that may arrive later that day. Follow [as-of and report](as-of-and-report.md) for past dates.

## Preserve selected records and lines

Resolve the user's target before relationship queries. A typed internal ID warrants a minimum standard record read to verify the record type, identity and supplied customer/subsidiary restrictions. Treat a document number or name as a narrow resolver input, then read the selected record. Ambiguous or inaccessible targets stay unresolved; do not substitute another record or broaden to the customer's entire population.

Maintain the selected record type, source ID and any exact native line ID as the scope contract. A display line number is not a native line ID: resolve it within its verified parent. Transaction-line identity is `(source ID, line ID)`. When multiple requested records have different line selections, group by parent and run disjoint parent-specific batches; independent lists of order IDs and line IDs must not create unintended record/line combinations. Use the same discipline for subscription-line selections.

Apply these restrictions in every population query and its independent denominator, plus dependent queries, probes and evidence drill-downs. Combine them with any supplied customer/subsidiary filters. Use only the scoped eligible source/line keys for child retrieval; filtering a broader result after retrieval is not scope preservation. A source-ID batch alone cannot preserve a selected line. Apply the relevant module's verified alias allowlist at each stage; never reuse a predicate with incompatible aliases.

A control needing a different record type or relationship must establish native lineage from the selected source before reading its dependent population. If that link cannot be verified, mark only the affected control Partial or Not assessed and continue independent controls within the original scope. In particular, an SO-level revenue-element mapping does not establish which element belongs to a selected SO line. Do not infer that relationship from item, amount or customer, and do not expand a line request to the whole order.

## Preflight by control

Read the relevant control file's capability requirements. Inspect metadata for required tables, fields and joins; use a small read-only probe to confirm critical relationships and value conventions. Probe limits are for validation, not the production population.

1. Confirm identifiers, line keys, dates, quantity/unit fields, amount/currency fields, state/status fields and feature-dependent columns.
2. Check native values for statuses and flags through metadata and representative reads. Do not assume a human display label equals an internal status code. The original implementation's codes are candidates, not a universal approval policy.
3. Verify related-record visibility. An absent invoice/plan/source link can only support an absence finding when the relationship and relevant related population are accessible. Table visibility alone does not prove unrestricted row access. Cross-check known related records where available and disclose remaining uncertainty.
4. Establish the accounting-book basis for ARM. Unknown book context is not evidence of single-book support. Continue billing checks while ARM is blocked.
5. Decide whether the required data is valid for the chosen date. Current-state templates cannot silently become historical snapshots through a date predicate.

Do not conflate an empty table with a disabled feature. Use explicit feature evidence, metadata plus relevant records, or customer-confirmed configuration to determine applicability. If a required table/field is missing with an ambiguous reason, use **Not assessed — unavailable to this connection**, not **Not applicable**.

Metadata confirms names and types; it does not establish business meaning, state history, or population completeness. REST record metadata is not a substitute for SuiteQL metadata. A saved-search alternative needs verified equivalent fields and joins, not merely a similar title.

## Compile query templates safely

Control references contain staged SELECTs and declared tokens. They are templates, not unfinished account-specific queries. Complete the substitutions only after preflight:

| Token | Allowed source and representation |
|---|---|
| `{{AS_OF_DATE}}` | A real calendar date in exact `YYYY-MM-DD` format. Insert only that validated string inside the template's `TO_DATE(..., 'YYYY-MM-DD')`. Reject impossible dates and strings containing SQL. |
| `{{SCOPE_PREDICATE}}` | Assistant-compiled predicates using the specific aliases declared beside the query and verified numeric IDs. For intentionally unrestricted role-visible scope, `1 = 1`. Never accept user or record text as a raw predicate. |
| `{{SOURCE_IDS}}` or a query-specific ID token | Distinct positive numeric internal IDs returned by an earlier scoped query, comma separated; no names, wildcards, expressions, or invented IDs. Skip a dependent query for an empty list only after the source population is known complete. |

Other tokens must be declared in the control reference. Keep ID batches at 500 or fewer as a practical bound; do not exceed the platform's documented 1,000 `IN` arguments. De-duplicate across batches by full record/line identity, never by amount. Preserve both source document and source line key when a query needs a composite identity.

Only the validated date and typed IDs are interpolated from input. Build identifiers and syntax from metadata-verified templates; do not insert free-text descriptions, account memos, names or arbitrary SQL. Where native bind parameters are supported by the discovered tool, prefer them. Remove every unresolved token before execution. Submit one read-only statement per call. No DDL, DML, database procedures, external functions, or custom tool calls.

Use `TO_DATE` date filters and one consistent join style per query. These references use staged SELECTs so they need not rely on `WITH` support. If a template requires adaptation, keep it semantically equivalent and recheck the grain, cutoff and scope. Do not remove a failing predicate merely to get results. [Oracle query guidance](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_0824094533.html)

## Population, joins and counts

Start with the eligible source population, not just positive exceptions. Retain healthy sources and sources that cannot be evaluated. The denominator is distinct source identities at the control's grain, not joined rows or the sum of rows across controls.

- SO grain: document ID + line ID. Subscription grain: subscription ID + subscription-line ID. ARM grain: revenue-element ID (plus book where supported). Credit grain: credit-memo ID with all relevant lines checked.
- Related invoices must be matched through exact native lineage; matching on customer/item alone can misattribute charges.
- Deduplicate link identities before summing. Two invoices with equal amounts are still two invoices.
- Aggregate invoice facts, plan headers and planned lines independently before combining, to avoid one-to-many multiplication.
- Missing required values are not zero. A missing child sum is zero only if the complete child population and relationship access were verified and no eligible child exists.
- Check sign, quantity units, currency, discounts/tax, cancellations and void/approval treatment. Unsupported cases stay visible as skipped or review-only, outside a defensible monetary subtotal.

For a template's source relation, obtain a separate `COUNT(*)` or count of its grouped identity using the same scope/cutoff, without `ORDER BY`. When identity already spans multiple columns, count an inline grouped relation rather than guessing a multi-column `COUNT(DISTINCT ...)` dialect. This is a completeness cross-check, not proof of access to records outside the role.

After evaluation, reconcile:

`eligible sources = evaluated sources + sources skipped for missing evidence`

Track any separately justified not-applicable partition without silently deleting it from the population. Count each identity once per control. A zero exception count is supported only when the relevant eligible population has been evaluated or is verified empty.

## Retrieve completely without a hidden lookback

Prefer aggregate counts and monetary calculations in SuiteQL, plus bounded evidence drill-down. For large raw populations, follow actual continuation semantics or partition by stable ID ranges or subsidiaries. Every eligible partition must be covered; do not impose a recent-order cutoff.

Use stable ordering at the full row identity. Compare retrieved/evaluated distinct IDs with the aggregate count; reconcile relevant totals per currency. Record incomplete pages, timeouts and skipped partitions. The largest returned ID is not proof of exhaustion. A known top-N/capped result cannot support an account-wide total.

If a server-side aggregate fully evaluates the eligible population but only a short findings list is displayed, the analysis can be **Assessed** with “showing N of M findings.” If analysis itself is truncated, it is **Partial**, with only an assessed-subset amount if that amount is reliable. Do not label a subset amount as total account exposure.

Shared cutoff dates do not freeze database state. If source counts change during extraction, reconcile or rerun the affected bounded queries; if still inconsistent, state partial coverage. Do not claim a transactional snapshot.

## Coverage record

Maintain a working record per requested control and RL-005 subcheck:

```text
control / subcheck
status: Assessed | Partial | Not assessed | Not applicable
scope: customer / subsidiary / role visibility / accounting book
as_of_date / state_basis / retrieved_at
required_capabilities_verified / missing_capabilities
eligible_source_count / evaluated_source_count / skipped_source_count
exception_count / amounts_by_currency / aggregate_and_detail_reconciled
completion_evidence / limitation / next_action
```

Unknown counts/amounts remain unknown. This is a conversational working record or report evidence, not a NetSuite custom record.

| Status | Use when |
|---|---|
| Assessed | Required capabilities, time basis and population completion are verified within the stated scope. Business exceptions can still need review. |
| Partial | Some sources/subchecks were evaluated but data, history, visibility or retrieval gaps constrain the conclusion. Identify them and qualify totals. |
| Not assessed | A required capability/evidence is missing, or execution did not complete any valid assessment. Do not put a zero amount here. |
| Not applicable | Positive evidence establishes no applicable feature/population for this control. An unexplained empty result is insufficient. |

Use **Not requested** only to describe controls outside an explicit focused request. It is not a coverage failure. Do not report “X% of leakage detected.” A verified record ratio can describe population processing for that specific control, never completeness of all possible revenue risks.

## Recover from failures proportionately

For a schema error, inspect metadata and make a targeted correction; if the corrected query still fails, stop that query path and mark its checks not assessed/partial. For truncation/timeouts, use bounded partitions or a simpler equivalent aggregate; retain every scope restriction. Do not keep guessing field names or retry unchanged failures.

Proceed with independent working controls and report the specific limitation and remedy. Missing access is not permission to deploy scripts, broaden role scope or use another customer's data. If the standard connector is entirely unavailable, return setup requirements and state that no live assessment occurred.
