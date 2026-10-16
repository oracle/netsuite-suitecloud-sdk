# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Data access

Contents: [metadata decisions](#query-trust-and-metadata), [bounded fallback](#bounded-template-fallback), [account qualification](#account-qualification), [capabilities](#required-capabilities), [selection](#select-the-population), [query preparation](#prepare-the-timing-query), [coverage](#retrieve-and-verify-coverage), [query meaning](#query-meaning-and-limitations), [exports and missing capabilities](#supplied-export-and-unavailable-capability).

## Query trust and metadata

Use the packaged [fulfillment SQL](../queries/fulfillment_performance.sql), matching adapter, and approved exact-number/known-ID resolver templates as fixed implementations. Their definitions specify the intended fields, joins, and calculations; they do not prove current-account compatibility or event meaning. Preserve these definitions and validate current evidence instead of inventing query repairs.

Before a SuiteQL branch, check `ns_getSuiteQLMetadata` for its actual dependencies or reuse applicable observations from the same account, connection, role, session, and scope. The timing query needs `ItemFulfillment`, `TransactionHistory`, and `Transaction`; an approved resolver needs `ItemFulfillment`. Querying `Location` for name resolution requires its metadata. Known IDs remove identity-resolution work, not the initial metadata check. Metadata describes structure; the lookup resolves identity.

| Metadata outcome | Action |
|---|---|
| Required fields, types, and relationships are supported | Execute the approved template after input validation; still verify results and applicable account semantics. |
| Usable metadata omits or contradicts a required field/type/relationship | Stop that dependent query and report the incompatibility. Do not assume the catalog is broken merely because it conflicts with the template. If explicitly paginated or truncated, complete the metadata within the read budget before deciding. |
| Successful schema shell such as `{"type":"object"}` without properties, structurally unusable response, or explicitly unsupported metadata-catalog coverage | Record **inconclusive metadata**. It proves neither access denial nor schema validity. Consider only the bounded template fallback below. An unsupported query record type is an incompatibility, not catalog-only unavailability. |
| Explicit access denial, required feature disabled, or connector/host refusal | Stop the affected branch. Report the actual denied capability without inferring broader permissions; this fallback does not bypass a denial or enforced prerequisite. |
| Transient metadata timeout/service error | Apply the existing retry limit. After exhaustion, only applicable account qualification can support template fallback; otherwise report unverifiable compatibility. |
| Metadata tool not observed/unavailable | Perform targeted discovery once if needed. Only applicable account qualification can support template fallback; absence alone is not a successful check or proof of a catalog defect. |

Record each outcome and its source in the current task context. Make at most one non-transient metadata attempt per required type in that context; reuse the result rather than repeating empty calls, case variants, or checks before every page. Transient retries remain bounded. Do not hardcode a type as permanently exempt because an earlier report returned an empty schema.

Refresh affected evidence after account/role/connection/session changes, relevant feature or permission changes, connector changes, or contradictory results. A changed query/adapter invalidates its qualification and requires checking any changed dependencies; it does not invalidate unrelated metadata. Unknown scope cannot support cross-context reuse. Retain observations in the task context; do not silently persist customer configuration in the portable skill.

## Bounded template fallback

Use this alternative to fresh metadata only for an inconclusive outcome above, or for unavailable metadata after the additional qualification condition in the table is met. It never overrides explicit incompatibility, access denial, or connector/host controls.

1. Keep the same authorized connection, role, supported parameters, requested filters, and read limits. Use only the packaged hash-checked timing SQL and matching adapter, or the exact resolver templates below. Documented predicate preparation and typed binding are allowed. No arbitrary probes, new joins, alternate roles, speculative field substitutions, or new selector SQL inherit this exception.
2. With applicable documented account qualification, execute within that proven scope and normal retrieval bounds. New populations still need complete selection and paging; qualification is not evidence that today's result is complete.
3. For an inconclusive schema response without applicable qualification, allow one initial timing read for **at most five verified fulfillment IDs in total per request**, using selected-ID mode and `pageSize: 5`. A user's small named-record request can itself be this read; do not duplicate it as a probe. Approved exact-number/known-ID resolvers may resolve up to five explicitly supplied references first, retaining their documented ambiguity/completeness checks. Do not enumerate a broad population to find a convenient sample or split requests to evade the bound.
4. This initial read establishes compatibility only for the actual non-null fields and result shape observed. Empty results, null history/source values, or a successful resolver do not prove timing semantics or access to missing evidence. Stop on actual SQL/permission errors or failed integrity checks. Apply all coverage, status, null, and timestamp checks below.
5. A compatible named-record result may answer the requested metric as **query-derived**, with one concise qualification if its account meaning is not independently established. Known semantic contradictions make the affected metric unavailable. Do not widen this initial run into unqualified population analysis or treat a sample as a population SLA/recommendation assessment. For broader work, obtain applicable account qualification or a complete independently verified export preserving the requested scope.

For additional queries outside these templates, require metadata for their actual fields and joins. Missing evidence blocks that selector; do not use REST record metadata, trial queries, prior query success, or a simpler population to work around it. Useful unaffected work may continue only if its requested scope is preserved.

## Account qualification

Metadata verifies structure; independent account evidence establishes how the metrics should be interpreted. This package contains a validation procedure, not completed account qualification. Neither user-reported success, a schema response, a query hash, nor repeating the same query establishes semantic proof.

When qualification is needed, reconcile a small representative set against independent authorized record/history evidence from the same account with a documented visibility scope. Use available fitting read tools or a supplied trace/export; do not invent tools or generate unreviewed diagnostic SQL. Work within the read budget. Choose cases relevant to the requested use: a normal full lifecycle, skipped or missing stages, repeated/reopened transitions, multiple fulfillments from one source, and each source type actually included. Add date/timezone boundary cases only when those claims are needed. Mark untested cases explicitly; do not invent fixture records or claim observed coverage.

| Check | Evidence to establish |
|---|---|
| Event meaning and ordering | Confirm that `ItemShip`, `CREATE`/`CHANGE`, A/B/C and history `dateTime` correspond to the claimed events; verify reliable event ordering by `history.version`, including ties if present. |
| Source and start point | Reconcile `ItemFulfillment.createdFrom` with `Transaction.id` and its creation timestamp for the source types used. Source creation includes pre-picking waiting; it is not a measured labor start. |
| Status/lifecycle | Compare repeated, skipped, or reopened cases with the query's latest-transition rule and chronology nulling. Do not label it first-passage or complete-cycle timing without proof. |
| Time basis | Reconcile source/history timestamp timezone, connector/session display, and fulfillment-creation date filters. Text formatting preserves precision, not timezone or absolute elapsed-time correctness across clock changes. |
| Grain and missingness | Verify one row per selected fulfillment, no source/history join multiplication, retained no-history cases, and the meaning of missing evidence under the role's visibility. |
| Durations | Compare applicable returned seconds with independently established events using the same time basis and metric definition. This qualification check does not replace runtime query results with timestamp subtraction. |

Keep a minimal qualification record in the task context or an explicitly requested external validation record: account/environment and role scope, connection/channel, relevant features and timezone, actual SQL/adapter identity or hashes, date checked, representative cases and evidence sources, checks passed/failed/untested, supported metrics/populations, and unresolved limits. Use safe references and minimal identifying data. Do not include secrets or customer records in this portable ZIP, claim unknown account identity, or silently create persistent customer state.

Reuse qualification only for matching demonstrated scope. Refresh affected checks after relevant role, feature, timezone, connector, query/adapter changes, or contrary evidence; do not repeat a full account check for every question. Unknown or changed context requires requalification before extending prior claims. Qualification of an exact resolver proves identity fields only, not timing semantics.

Without applicable qualification, supported named-record values may be explained as query-derived with a material limitation, provided the metadata/fallback rules permit the read. Before using results for operational population conclusions, SLA decisions, or recommendations, establish the relevant event/source/time/grain semantics and scope. If evidence is unavailable, explain the missing check and retain useful verified facts. A complete metadata response permits structural execution but does not itself satisfy this semantic requirement. Scope-specific qualification does not prove unrestricted account-wide visibility.

## Required capabilities

Use an existing authorized NetSuite MCP connection. Before each branch, inspect the tools actually available and their callable schemas. The bundled [tool catalog excerpt](standard-tools.json) records the approved read tools; it is not evidence of live access. Use an alias only when its schema and semantics match. Missing tools block the affected branch, not unrelated supported work.

| Purpose | Tool and approved argument shape |
|---|---|
| Optional known-ID record/context read, when exposed | `ns_getRecord(recordType, recordId, fields?)`; `fields` is a comma-separated string in the bundled schema. It is not required and does not resolve a document number by itself. |
| Resolve uncertain record fields | `ns_getRecordTypeMetadata(recordType)` |
| Check current query fields and joins | `ns_getSuiteQLMetadata(recordType)` for actual dependencies; reuse current-scope evidence and apply the metadata decision table and bounded fallback. |
| Execute prepared timing query | `ns_runCustomSuiteQL(sqlQuery, pageSize, pageIndex, description?)` |
| Optional fitting saved-search lookup | `ns_listSavedSearches(query?)`, then `ns_runSavedSearch(searchId, type?, range_start?, range_end?)` |

Do not assume the host has `queryRecords`, `readSkillScriptMeta`, `runSuiteQL`, `computeStructuredData`, `finalize`, saved-response column bindings, or `RECORD_REF` column types. Read local files normally, retain returned IDs locally, calculate locally, and write the response directly.

When the host uses on-demand tool discovery, search for the specific capability needed. If a general lookup search does not expose the timing tool, make a targeted discovery request for `ns_runCustomSuiteQL`; discover `ns_getSuiteQLMetadata` separately when needed. Do not repeat broad discovery or assume the first result is an exhaustive inventory. Describe an unreturned tool as **not observed** unless the host explicitly establishes unavailability. Tool discovery is not an account read; actual metadata and record/query calls count against the read budget.

## Select the population

- **Named fulfillments:** distinguish a document number from an internal ID. A verified internal ID can go directly into the timing selection; use an optional narrow record read only when context is needed. A document number needs a suitable verified lookup or the approved SuiteQL resolver below. Ambiguous names need clarification. Preserve all other requested filters.
- **Direct population:** if the only selection filters are optional fulfillment creation dates and locations, use the timing query to select the population. Resolve named locations first. “All warehouses” means no location filter, including inactive and unspecified locations; do not enumerate active warehouses.
- **Other criteria/date basis:** use a fitting verified lookup/search to select the complete matching fulfillment ID list, then pass those IDs to the timing query with date and location filtering disabled. The selection lookup may filter records; it must not calculate durations.
- For a selection outside the approved templates, prefer fitting verified record/search tools. A new custom selection query is only a justified fallback, with metadata for its required fields/joins and the bundled typed compiler. Do not guess joins or invent dynamic saved-search filters.
- The saved-search tool exposes no arbitrary date/customer filter arguments. Verify hidden filters, grain, range conventions, and completeness. A matching title or a sample is insufficient.
- Reuse current source context and verified record links. Do not requery just to make links. If the only unresolved names are some explicitly named fulfillments, continue with the resolved subset and disclose it; an incomplete population lookup otherwise blocks population analysis.

| Selection need | Metadata handling |
|---|---|
| Known internal fulfillment IDs | Bind directly; no repeat identity read. Apply the timing query's metadata/qualification rules. |
| Exact fulfillment document number | Use a fitting verified lookup or the approved resolver below after checking/reusing ItemFulfillment metadata or establishing fallback eligibility. |
| Known internal location IDs | Bind directly; no `Location` metadata call solely to filter by ID. The timing query's three dependencies still need the metadata decision process. |
| Warehouse name | Use a fitting verified lookup. If a new SuiteQL lookup is needed, inspect `Location` metadata, query for matches, and resolve ambiguity before binding an ID. |
| All warehouses | Disable the location filter; no location enumeration or metadata call. |
| Additional unsupported criterion/date basis | Use a complete verified selector; inspect the actual dependencies if constructing new SuiteQL. Never drop the criterion to use a simpler template. |

### Approved fulfillment resolvers

Use this narrow SuiteQL fallback to resolve an exact document number, not to calculate timing. It does not require `ns_getRecord` or broad saved-search discovery. Check or reuse `ItemFulfillment` metadata for `id`, `tranId`, and `createdFrom`; if inconclusive, follow the bounded fallback. Use this exact table and fields; do not substitute `Transaction.createdFrom`.

Create a local compiler input with exactly `template`, `parameters`, and `pageSize`:

```json
{
  "template": "SELECT id AS itemFulfillmentId, tranId, createdFrom AS sourceTransactionId FROM ItemFulfillment WHERE tranId = ':tranid' ORDER BY id",
  "parameters": {"tranid": "IF-EXAMPLE"},
  "pageSize": 20
}
```

`IF-EXAMPLE` is a synthetic placeholder. Put the user's exact document number in the JSON parameter; never concatenate it into SQL. For a verified internal ID when a context read is needed, use `WHERE id = :record_id` and `parameters: {"record_id": <verified positive integer>}` instead. Do not interpret a document number as an internal ID.

Run the unchanged local `scripts/compile_query.py` with that input file and a new output file outside the skill directory. Pass its `sqlQuery`, `pageSize`, and `pageIndex` to the observed `ns_runCustomSuiteQL` schema. Apply the normal read and completeness limits. Zero rows means unresolved, one unique row resolves the identity, and multiple matches require clarification. Preserve any additional requested filters in a metadata-reviewed selector; the exact-number example alone does not apply them.

Save the returned fulfillment ID and source ID for the timing request. A successful resolver proves only the returned identity/context. Before timing execution, check or reuse metadata for `Transaction` and `TransactionHistory` and any ItemFulfillment fields not covered by the resolver check; apply the same decision table. Verify the timing result separately. Do not repeat already applicable complete or inconclusive metadata calls.

## Prepare the timing query

Query ID: `fulfillment-performance`; retrieval mode: `author_defined_suiteql`. Use the packaged [timing SQL](../queries/fulfillment_performance.sql) and matching local adapter. The four evidence fields return formatted date-time text. Prepare requests from these packaged definitions; regenerate any prepared request if the SQL or adapter changes. No competing timing search/report trial is needed.

1. Resolve the requested population and ambiguous identities using the selection rules. Known IDs/dates need typed validation; they do not waive the current compatibility process. For each needed query, check or reuse metadata for its actual dependencies.
2. Compare the intended schema below with usable metadata. Apply the decision table and any bounded fallback before execution. Keep the SQL and matching adapter unchanged. The adapter pins the SQL hash and rejects unsupported parameter shapes; a hash verifies integrity, not live correctness.
3. Preserve the requested date basis and established timezone. If an unresolved timezone changes the intended date selection, clarify it; do not invent a timezone or gate an ordinary named-record request on unrelated timezone discovery. Verify material history/source-mapping assumptions from actual results and independently available account evidence. For recommendation populations, establish whether `TrnfrOrd` covers the requested transfers; an unknown or incompatible mapping blocks that affected claim, not unrelated supported timing reads.
4. Write a task-local JSON input file with the following fields. Pass values as data, not shell text or SQL fragments. Compile locally, execute only under the compatible-metadata or eligible-fallback route, then validate actual results and applicable account qualification.

| Authored dependency | Fields and meaning |
|---|---|
| `ItemFulfillment` | `id`, `tranId`, `status`, `orderType`, `createdFrom`, `createdDate`, `location`; fulfillment identity, source, and selection. |
| `TransactionHistory` | `internalId`, `type`, `action`, `status`, `dateTime`, `version`; fulfillment lifecycle transitions using the packaged `ItemShip` and `CREATE`/`CHANGE` semantics. |
| `Transaction` | `id`, `createdDate`; source creation joined through fulfillment `createdFrom`. |
| Location display/filter | The timing query uses `ItemFulfillment.location` and `BUILTIN.DF`; it does not query the `Location` table directly. |

The packaged joins and latest-transition rules define one row per fulfillment. Preserve them and inspect actual nulls/status/history evidence; feature availability alone does not prove complete history. The metadata exception does not extend to new or modified SQL outside the matching adapter's documented preparation and binding. Additional lookups may follow the normal metadata-reviewed path without becoming approved templates.

| Input | Meaning / constraints |
|---|---|
| `filterByItemFulfillments` | Boolean. True for a fully resolved ID selection; false for a direct population. |
| `itemFulfillmentIds` | 1–50 positive integer IDs when enabled; otherwise `[]`. |
| `filterByLocations` | Boolean. Allowed only for a direct population. |
| `locationIds` | 1–50 positive integer IDs when enabled; otherwise `[]`. |
| `filterByDate` | Boolean. Allowed only for a direct population on fulfillment creation date. |
| `startDate`, `endDate` | Inclusive ISO `YYYY-MM-DD` dates when enabled; `""` otherwise. End cannot precede start. |
| `shippedOnly` | True for lead-time SLA and recommendations; false for ordinary timing or another SLA metric. |
| `salesAndTransferOnly` | True only for recommendations; false otherwise. |
| `pageSize` | Optional integer 5–100; default 100. Lower tool-specific bounds prevail. |

For a selected-ID population, preserve the SLA/reference eligibility filters in the selector and enable the matching status/source flags as well; the flags must not change the intended population. Do not apply a second date or location filter.

Run the bundled adapter with resolved paths:

```bash
python3 "<skill-directory>/scripts/prepare_fulfillment_query.py" \
  "<work-directory>/inputs.json" "<work-directory>/query-request.json"
```

It reads only `queries/fulfillment_performance.sql`, adapts parameter syntax, and calls the packaged compiler and binder. It makes no account calls. Output must be a new file outside the skill directory. Inspect the prepared `sqlQuery`, `pageSize`, and `pageIndex`; pass them as structured arguments to the live tool. Do not submit the original colon-bind/array syntax directly or bypass a compiler rejection by interpolating user values.

The SQL uses booleans and two array parameters that the compiler does not accept directly. The adapter uses its supported `doc_ids`, `from`, and `to` parameters and fixed optional predicates. More than 50 selected IDs or locations is unsupported by this compiler: request narrower scope; do not split lists to evade the bound. Direct unfiltered/all-location populations do not have this 50-ID selection limit.

## Retrieve and verify coverage

- Start at `pageIndex: 0` and keep the same compiled query, page size, scope, and connection for all pages. Preserve its unique `ORDER BY itemFulfillmentId` ordering.
- Use at most 20 account reads per request, including metadata, lookups, paging, and retries. Each query/search permits at most five pages and 100 rows per page. A tighter live limit wins. Thus this route can retrieve at most 500 timing rows even though the timing query's own guard is 50,000.
- Inspect `totalResults`, `numberOfPages`, and continuation/completeness evidence. Retrieve every required page within the limits. If the result needs more pages, cannot be retrieved within the remaining budget, or has unknown completeness, stop the analysis and ask for narrower scope. Do not compute a population total or SLA rate from a capped sample.
- An empty successful result means no matches. For a nonempty result, inspect the first row's `resultStatus`: `POPULATION_TOO_LARGE` means the source query exceeded 50,000 matches; stop. Normal rows have null `resultStatus`. A mixed sentinel/normal result is a contract failure.
- Verify expected columns, unique fulfillment IDs, totals, consistent coverage, and preserved nulls. Normalize column-name casing if necessary without changing values. Duplicates, missing pages, or changing totals invalidate completeness. Pagination is not a snapshot; do not promise consistency across concurrent record changes.
- Inspect each non-null evidence field for a valid `YYYY-MM-DD HH24:MI:SS` string, including time through seconds. Preserve nulls. If a value remains date-only or malformed, timestamp detail is incomplete: check the already-prepared request matches the packaged SQL and uses its four outer `TO_CHAR` projections. Do not fabricate times, silently mark timestamp retrieval as verified, or issue schema-bypass probes. Report the limitation while retaining any independently valid duration answer.
- Retry only transient read failures, at most twice after the initial attempt, within the total budget. Do not retry validation or permission failures. Report actual schema/query incompatibility without rewriting the approved SQL or broadening access. Missing tools, denied access, empty results, and partial data are different outcomes. Query success does not prove account-wide visibility or complete lifecycle history.

## Query meaning and limitations

The result has one row per fulfillment, context fields, six numeric duration fields, four evidence date-time text fields (existing `*Timestamp` aliases), and `resultStatus`. Non-null evidence text uses the fixed 19-character format `YYYY-MM-DD HH24:MI:SS`. Calculations use whole seconds. The query chooses the **latest** transition into each status, ignores repeated unchanged statuses, and nulls later steps that violate chronology. It does not measure first passage through a reopened lifecycle. Preserve this behavior.

The query returns `TO_CHAR(value, 'YYYY-MM-DD HH24:MI:SS')` directly for all four evidence fields, so the SQL output is text containing the date and time. Keep those strings as text during transport; parse them locally only for display. Do not change the inner date expressions, date filters, or duration arithmetic. Null timestamps remain null; no midnight, zero-date, timezone offset, or fractional-second value is synthesized.

If a supplied query export or live result contains date-only evidence, use the limited-precision fallback in [metrics and output](metrics-and-output.md). Verify the evidence strings from the actual result before claiming timestamp detail is complete.

Timestamp-to-string conversion does not establish an absolute elapsed-time or daylight-saving-time guarantee. Verify connection/session date behavior before relying on date filtering or timing across timezone changes. Do not relabel the results as business hours or working days; those calendars are not implemented.

## Supplied export and unavailable capability

A user-supplied complete result from this designated query can support local analysis when query provenance, parameters, timezone/date basis, grain, expected columns, and completeness are verified. Treat it as an export at its recorded retrieval time, not a fresh live query. This is not an automatic fallback to any spreadsheet with similarly named fields.

If the required connection, compiler, query capability, or complete verified export is unavailable, explain what is missing and request a compatible connection or complete query export. Apply the metadata decision table; never treat all missing metadata as equivalent. If no permitted route exists or relevant semantics cannot be established, stop the affected claim and identify the specific missing evidence. Exports still need applicable semantic evidence; they do not bypass a known incompatibility or permission restriction. Do not improvise timestamps or use another source with unverified timing semantics. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions.