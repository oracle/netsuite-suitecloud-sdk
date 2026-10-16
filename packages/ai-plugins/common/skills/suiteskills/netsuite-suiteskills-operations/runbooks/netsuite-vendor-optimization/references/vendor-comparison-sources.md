# Vendor comparison sources

Read before connected-account retrieval. Supplied quotes and extracts need no account calls. Apply [operating-contract.md](operating-contract.md), including its retrieval, failure, readiness, query and record-link boundaries. These instructions and the templates do not establish current schema or role authority.

## Select and qualify the source

1. Inspect the current callable schemas for the selected read-only branch; a packaged tool inventory is not current access evidence. Resolve the requested item, vendor, subsidiary/location, date basis, currency and unit scope through supplied IDs or narrow authorized discovery. Do not run broad capability probes.
2. Use applicable supplied quotes/contracts directly. For account-held vendor terms, prefer a supported item-record vendor/pricing sublist through `ns_getRecord` with current record-type metadata where needed, or an independently qualified saved search. Retrieve only relevant vendor/item identity, currency, units, prices, preferred flags and explicit validity/tier/pack terms that the source actually exposes. A UI vendor list or REST record shape does not establish an `itemvendor` SuiteQL table or join. Recorded terms are estimates until current applicability is established; a linked/preferred vendor is not thereby approved.
3. A saved search must establish its own access, identity, actual filters, grain, date basis, currency and completeness. A title or returned columns alone do not qualify the population. Do not assume dynamic filters exist in a tool schema.
4. When a history comparison is relevant, qualify a separate PO-line source and label it **PO history**, with pending orders separate from completed outcomes. The [purchase-line template](../queries/vendor-purchase-lines.sql) and [vendor-detail template](../queries/vendor-details.sql) describe a possible read-only SQL route only after every prerequisite below is met. They contain no item-vendor join and do not return current offers, preferred relationships or purchasing approval. A known-record read, report or saved search may independently supply history with the required scope and semantics.
5. Read vendor labels/activity once for the distinct returned vendor IDs through the separately qualified vendor source; join to PO lines in memory. Preserve purchase lines when vendor detail is inaccessible, using returned identifiers and unknown attributes. Do not make a separate account call merely to decorate each record with a link.

## Metadata boundary

Before writing or submitting any schema-dependent SELECT, obtain current `ns_getSuiteQLMetadata` for **every** source table/record type in the same connection, role and session. Verify **every** projected or filtered column, join key/relationship, unique ordering key, permission, grain and business meaning. Reuse only still-valid metadata evidence under the package metadata-reuse rule. Record metadata, REST fields, historical catalogs and a successful template fixture are not substitutes.

| Template | Required metadata concepts | Meaning and limits |
| --- | --- | --- |
| Purchase lines | `Transaction.id, tranid, trandate, type, entity, currency, status, voided`; `TransactionLine.transaction, id, item, subsidiary, units, quantity, foreignamount, mainline, taxline`; verified `TransactionLine.transaction = Transaction.id` relationship | One PO item line per verified `(transaction_id, line_id)`; raw signed amounts and quantities in their documented currency/unit basis. Verify purchase-order and flag values before using the predicates. |
| Vendor details | `Vendor.id, entityid, companyname, isinactive`; unique vendor ID | Identity and activity only. This establishes neither approval nor applicable offers. |

Missing, incomplete or denied critical metadata stops the affected SQL branch, including these templates and their ID filters. Do not probe a schema, guess a replacement join, try alternative SQL or substitute REST metadata to evade the failure. An unavailable optional projection can be omitted only when the remaining query's complete metadata, scope and semantics are already established; never drop a required scope predicate to make it run. The supplied subsidiary-scoped template is not qualified for a non-OneWorld account by deleting its subsidiary filter.

After an SQL/schema failure, preserve the error and supported facts. A fallback report, saved search, known-record read or supplied extract must independently establish its access, identity, filters, grain, dates, currency and coverage for the conclusion. It does not inherit qualification from the failed branch. Do not reroute to these SQL templates as a metadata-denial or schema-error workaround. If no independently supported source remains, return the supported sections and identify the blocked evidence.

## Typed parameters and bounds

The `{{...}}` tokens below are descriptive placeholders, **not** native NetSuite bindings or a claim of compatibility with the unprovided colon-based binder. No runbook-local binder or script is provided. Do not execute packaged binders/compilers/helpers, and do not bypass a compiler refusal. Prepare a SELECT only through a currently supported, permitted query path after all metadata and scope checks; otherwise retain it as a proposal and use independently supported text evidence.

| Token | Required type and position |
| --- | --- |
| `{{item_ids}}`, `{{subsidiary_ids}}`, `{{vendor_ids}}` | Nonempty distinct positive decimal integer IDs, resolved for the authorized scope. Render only validated integer literals in the unquoted `IN (...)` positions; never names, free text or SQL fragments. An empty or unresolved list blocks the query. |
| `{{start_date}}`, `{{as_of_date}}` | Actual calendar dates in exact `YYYY-MM-DD` form, with start no later than as-of. They occupy the quoted `TO_DATE` literals shown in the template. Reject other text and unresolved tokens. |

Validate the final SELECT against the qualified query shape and parameter types before submission. Do not broaden the item/subsidiary/date scope during binding. The upper bound includes the as-of date through a verified date expression; the lower bound is inclusive.

Use the observed structured `ns_runCustomSuiteQL` schema: `pageSize=20` by default, no more than 100 rows per page, and explicit zero-based `pageIndex=0` on the first call. Keep the template's stable unique outer ordering, with no ROWNUM wrapper or arbitrary SQL cap. Retrieve at most **five pages** of the same scoped source and at most **twenty account reads across the entire workflow**, including all metadata, discovery, detail and retries. Tighter tool/branch limits apply.

Inspect returned continuation/count evidence and distinct keys; do not treat a full page as proof of completeness. If required coverage exceeds either budget, stop with a partial result, narrow the scope or use an independently qualified appropriate report/search within the remaining budget. Never sum capped pages into a complete population total or claim the pages are a snapshot. Retry only transient reads, at most twice after the initial attempt within the same budget; never retry validation or permission failures.

## Interpretation and links

Validate quantity/amount sign, transaction currency and unit relationship before deriving unit prices. Zero quantity cannot supply a unit price; a zero amount remains literal. Keep incompatible currencies separate. Purchase-line amounts do not establish freight, total payable cost or current quote validity.

Count distinct PO IDs and retain genuine line grain. Do not count the same purchase again through receipts or bills. A past-dated PO is not thereby received, billed or settled. Cheaper/newer historical orders establish neither a volume tier, active discount, replacement relationship, realized saving nor purchasing approval. Report price differences as historical/open-order price variances with their source dates and sample coverage.

Use only trusted source-returned safe HTTPS URLs tied to the exact record and current account/environment under the package record-link contract. No constructed URLs or session-tool dependency is introduced. If the source provides no verified URL, retain its readable identifier and source with "record link unavailable"; useful analysis still proceeds.

Local template review establishes no live SuiteQL compatibility. Only a permitted scoped read against current metadata and the current role can establish account-specific behavior. Inspect raw rows for IDs, uniqueness, currency, signs and units before drawing conclusions; report only the achieved bounded coverage. Live qualification remains `not_run` until such evidence exists.
