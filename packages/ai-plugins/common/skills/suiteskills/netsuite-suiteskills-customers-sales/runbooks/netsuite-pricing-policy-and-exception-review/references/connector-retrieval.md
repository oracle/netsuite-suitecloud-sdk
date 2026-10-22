# MCP Connector Retrieval

Use this reference to retrieve pricing evidence through the NetSuite AI Connector MCP Standard Tools. Every record type, field, sublist, join, saved search, and SuiteQL template must be verified in the connected account and role before it becomes a release-tested dependency.

## Contents

- [Tool posture](#tool-posture)
- [Target-aware source selection](#target-aware-source-selection)
- [Identity resolution](#identity-resolution)
- [Metadata discipline](#metadata-discipline)
- [Record-read patterns](#record-read-patterns)
- [Saved-search rules](#saved-search-rules)
- [SuiteQL safety](#suiteql-safety)
- [Completeness and failures](#completeness-and-failures)
- [Minimum live-validation set](#minimum-live-validation-set)

## Tool posture

This skill uses only read operations:

- `ns_getRecordTypeMetadata` to inspect REST record availability and fields.
- `ns_getRecord` to read a known record by `recordType` and internal `recordId`, optionally with a comma-separated field list.
- `ns_listSavedSearches` to find an existing bounded search by name.
- `ns_runSavedSearch` to run the selected search with explicit ranges and page through all required results.
- `ns_getSuiteQLMetadata` to inspect accessible query record types, fields, and joins.
- `ns_runCustomSuiteQL` for validated, bounded, read-only queries.

Never call `ns_createRecord` or `ns_updateRecord`. Tool visibility does not prove row access, and metadata presence does not prove a feature is enabled or a record exists.

Some connector installations also expose account-specific read tools such as `searchCustomer`, `getCustomerDetails`, and `getItemDetails`. When present, inspect their schemas and prefer them as bounded identity or detail shortcuts. Supply the name, entity identifier, or other identity value the user provided; never issue an empty or wildcard-only search merely to enumerate candidates. Require a unique typed identity before continuing, retrieve only necessary fields, and do not treat a convenience-tool response as complete pricing evidence unless its coverage has been live-validated. After Item identity is resolved, call `getItemDetails` only when it supplies a required pricing relationship or setting that the selected focused source cannot return. If it cannot project fields and would primarily retrieve inventory, weight, reorder, or cost data, prefer a focused Item record or pricing read. Keep the standard-tool path as the fallback.

## Target-aware source selection

| Request shape | Preferred path |
| --- | --- |
| Typed internal ID for a transaction, Customer, Item, Price Level, or Price Rule | Minimal `ns_getRecord` read |
| Customer or Item name when a validated connector-specific search tool is available | Bounded connector search, user selection if ambiguous, then a focused detail or record read |
| Other document number or name | Narrow saved search or SuiteQL identity lookup, user selection if ambiguous, then `ns_getRecord` |
| One transaction's item lines | Transaction read; use a full record read only when a fields projection omits sublists |
| A small related population | Existing saved search with verified definition and grain |
| Candidate Price Rules or pricing rows not available through records/search | Metadata-verified, bounded SuiteQL |
| Portfolio totals or trends | Governed report or saved search, not reconstructed raw pricing rows |

Do not use a broad report when one selected transaction is the target. Do not scan raw query tables when a focused record read returns authoritative line data.

## Identity resolution

1. If the connector exposes validated `searchCustomer`, `getCustomerDetails`, or `getItemDetails` tools, search with the supplied name or entity identifier before a blind SuiteQL identity query. Never use an empty or wildcard-only value. Use email only when the user supplied it or it is necessary to distinguish matches, and only through a live-verified field. Confirm the tool returns the typed internal identity needed by the next call; a display name alone is insufficient.
2. A numeric or coded Customer ID displayed with a name may be an auto-generated entity identifier, not a record ID and not part of the company-name value. Keep the full supplied reference intact, validate the applicable entity-identifier and display/name fields for the current account and role, and require the returned record to match the supplied identifying facts before continuing.
3. For a saved-search or SuiteQL identity lookup, include the supplied identity value in a narrow filter on a live-verified field; never use an unfiltered query to enumerate candidates. Use fields such as `entityid` or `email` only after verifying them for that record type and role, and use email only when supplied or necessary for disambiguation. An empty name-only path is a lookup limitation, not proof that the customer is absent.
4. Never pass a document number, entity ID, item name, or display name as `recordId` unless the connector documentation explicitly says it is an internal ID.
5. Search only the plausible record type and active/inactive scope needed for the question.
6. Return the minimum identity fields needed to distinguish matches.
7. Ask the user to choose when multiple genuine matches remain. Do not select by recency or similar spelling without authorization.
8. Preserve the resolved internal ID between calls, but omit it from the final answer unless useful to the user.

For a project or job, resolve and retain both the project/job and its parent Customer. Use the parent Customer for pricing assignments and Price Rule audience checks.

## Metadata discipline

- Verify REST `recordType` identifiers separately from SuiteQL record identifiers. Do not extrapolate capitalization or naming between APIs.
- Verify transaction header and item-sublist fields for each transaction type. A field valid on a Sales Order is not automatically valid on an Estimate, Invoice, Credit Memo, or Return Authorization.
- Verify line Price Level, Rate, amount, unit, quantity, pricing-details, applied-rule, and manual/custom indicators before using them.
- Verify the Customer pricing relationships, Item pricing matrix, Price Rule audience and item-scope relationships, dynamic membership surfaces, Price Level state, currency, quantity thresholds, and accounting preference source before making them dependencies.
- If metadata discovery fails because of a named broken field, do not repeat it. When safe, use a minimal standard-field record read or validated SuiteQL query and describe the metadata path as unavailable.
- A missing metadata entry, 404, or empty schema is a discovery limitation, not proof that a record type or feature is absent.
- An empty schema for the SuiteQL `pricing` table is a known connector metadata gap in at least one live-tested environment. That historical observation does not establish current schema; stop the affected query until required metadata is established.
- If SuiteQL metadata is empty or unavailable for any required table, stop that SuiteQL path. Do not issue an ad hoc query against the table merely because the expected field names seem plausible or a similar query worked elsewhere. Use a validated connector search, saved search, or focused record read instead. A maintenance-time probe does not become runtime evidence until its exact query, fields, role, and results pass the readiness process and are documented as a guarded path.
- Within one conversation, reuse successful metadata discovery only for the same connector, account, role, API surface, and record or table type. Refresh it after an account or role change, reconnect, permission or schema error, or a response inconsistent with the cached shape. Cache field and join verification, not record values, query results, row completeness, or pricing conclusions.

## Record-read patterns

### Existing transaction

Use a minimal header projection first when it can return the needed header and line fields. If item-line detail is absent, perform one full record read and retain only the relevant line in the response.

Required logical fields are:

- header: internal ID, document number, entity, transaction date, currency, subsidiary when applicable, and only verified channel fields;
- line: stable line identifier, Item, quantity, unit, Price Level, Rate, amount, tax-inclusive indicator when relevant, Pricing Details or applied Price Rule when exposed, and an explicit manual/custom marker when exposed.

Do not retrieve addresses, contacts, memos, costs, margins, commissions, or unrelated lines unless the user asks and the data is necessary.

### Price Rule

The REST record ID documented for a Sales Price Rule is `salespricerule`, but verify its availability and fields through `ns_getRecordTypeMetadata` in the connected account. A field-scoped `ns_getRecord` request can return `{}` for populated `salespricerule` sublists without reporting an error. Use projections for scalar header fields only. When checking `customerDimension`, `customerGroups`, or `priceRuleItemCollections`, perform one full read of the known rule and retain only the necessary evidence. Never interpret an empty projected sublist as proof of no rows.

Required logical fields can include active state, dates, Price Level, all-customer and all-item scope, direct customers, customer groups, explicit items, Item Collections, and any exposed priority/preference field. Never assign semantics to a priority field solely from its name or numeric value.

Do not expect direct item entries to appear as an `items` sublist on the `salespricerule` REST record. A live-tested SuiteQL catalog exposed this item-scope path:

- `SalesPriceRuleEntry`: join `pricerule` to the selected Price Rule and read `item` for the direct item entry.
- `salesPriceRuleEntryQuantityBreak`: join `parentRecord` to the Price Rule Entry; `lowerBound` identifies the quantity threshold and `rate` the entry-specific override.

Verify the exact table and field identifiers, role access, result grain, and pagination in the connected account before relying on them. Query only the selected Price Rule or resolved Item, select explicit fields, and treat inaccessible or incomplete rows as unresolved item scope rather than as an all-item or no-item rule.

A live-tested connector accepted `itemcollection` as the Item Collection record type. Use that identifier when reading a known collection; do not probe guessed variants such as `pricingitemcollection`. Reverify it for the current account and role. The collection header does not prove that a specific Item belongs to it, and it does not replace the stored materialized-membership evidence used by dynamic collections.

#### Joined candidate-rule discovery

A single bounded SuiteQL query may replace repeated per-rule candidate-discovery calls only after its exact statement has been executed and validated under the current connector and role. Use it to shortlist candidate Price Rule IDs, not as engine-confirmed pricing evidence.

Before treating the result as a complete candidate set, verify that the query correctly handles the applicable direct-customer, customer-group, all-customer, direct-item, Item Collection, all-item, active-state, date, and subsidiary or currency branches. Validate join cardinality, duplicate rows, null behavior, pagination, and comparison against controlled full Price Rule reads. Do not invent the query from table names or join every available table speculatively. Until an exact query passes those tests and is recorded in the testing notes, retain the bounded record-read and verified SuiteQL paths above.

### Customer and Item

Retrieve only the relationships needed for the active hierarchy branch:

- Customer: parent relationship for a project/job, default Price Level, direct Item Pricing row for the resolved Item, Group Pricing assignments, currency, and subsidiary.
- Item: pricing group, sales unit, quantity-pricing type, marginal-rate flag, schedule relationship, and the compatible pricing matrix cells.

Do not call `getItemDetails` merely to inspect a nullable base-price summary when the workflow already requires compatible pricing rows. Use it only when its live-validated response supplies a required fact such as Pricing Group, sales unit, quantity-pricing behavior, marginal-rate setting, or schedule relationship. Do not retrieve cost, quantity available, weight, reorder point, or other operational fields for a sales-price question unless the user explicitly asks and the field is necessary.

If a record API cannot expose a required relationship, use a verified saved search or SuiteQL path; do not replace stored assignments with an unrelated generated record.

## Saved-search rules

- Use `ns_listSavedSearches` with a focused name filter; do not enumerate every search without need.
- Before trusting a search, verify its record type, filters, columns, audience, result grain, and whether summary rows change the meaning.
- Use `range_start` and `range_end` deliberately. Continue through ranges until the required bounded result is complete or a connector limit stops retrieval.
- A single page is not complete when more results exist. Report a lower bound or partial set if paging cannot finish.
- A saved search that returns current-role results is not a substitute for the materialized System-user snapshot used by dynamic Price Rule groups or Item Collections.
- Do not modify or create a saved search in this skill.

## SuiteQL safety

Use SuiteQL after `ns_getSuiteQLMetadata` confirms every selected record, field, and join in this account and role.

- Select explicit fields; never use `SELECT *`.
- Filter by resolved internal IDs, exact transaction scope, date, currency, or another narrow predicate.
- Use an explicit page size and complete pagination only for a bounded required set.
- Parameterize or safely encode user values according to the tool's verified behavior. Never interpolate untrusted free text into raw SQL.
- Avoid unbounded cross-products, population-wide anti-joins, unsupported pagination syntax, and guessed joins.
- Resolve display labels through verified fields or `BUILTIN.DF` only when metadata and a live test confirm the exact expression.
- Re-run every edited query verbatim during live validation. Do not ship a query merely because it looks plausible.

#### Missing pricing metadata

An empty `pricing` metadata response does not authorize trial SQL. Use an independently supported Item record or verified saved search when sufficient; otherwise state that the affected pricing evidence is unresolved.

## Completeness and failures

- **Explicit permission error**: report an access restriction for that exact request; do not retry it with broader scope.
- **Successful zero rows**: report no matching accessible configuration for the exact filters only.
- **Partial paging or row cap**: narrow the scope or report partial results. Never choose a winner from an incomplete candidate tier.
- **Unsupported field or sublist shape**: retry once with a documented safe alternate shape, including a full record when required for transaction lines or `salespricerule` sublists.
- **Generic failure**: call the path indeterminate. Do not label it feature-off, permission denied, or absent.
- **Conflicting sources**: prefer the saved transaction for its stored Rate, preserve both facts, and state that the cause requires additional provenance rather than forcing agreement.

## Minimum live-validation set

Before release, test every path against an authorized non-Administrator connector role:

1. One saved transaction with automatic base pricing.
2. One saved transaction with traditional customer-specific pricing.
3. One saved transaction with a customer-specific Price Rule, including a direct `SalesPriceRuleEntry` item and an entry quantity break.
4. One all-customer Price Rule fallback.
5. Multiple qualifying rules with both highest and lowest preference in controlled environments or fixtures.
6. Transaction-currency price, subsidiary-base fallback, and no-price cases.
7. Quantity pricing for line, overall aggregate, and marginal behavior as available.
8. Dynamic customer group and Item Collection materialization.
9. Manual/custom line override.
10. Permission denial, missing metadata, ambiguous identity, and paginated/capped result cases, including projected-versus-full `salespricerule` sublists and a `pricing` empty-metadata stop.
11. Optional `searchCustomer`, `getCustomerDetails`, and `getItemDetails` behavior when those tools are installed, including ambiguous matches and returned internal identities.
12. Empty or unavailable SuiteQL metadata for a required table such as `item`: stop the query path and use a validated identity or record fallback.
13. `itemcollection` metadata and record reads, plus the separate materialized-membership surface; do not test guessed record-type variants during the operational workflow.
14. `getItemDetails` with and without field projection: prove when it contributes required pricing context and when a focused Item or pricing read avoids unrelated operational or cost fields.

Record exact account/role evidence and verified identifiers outside the installable skill package.
