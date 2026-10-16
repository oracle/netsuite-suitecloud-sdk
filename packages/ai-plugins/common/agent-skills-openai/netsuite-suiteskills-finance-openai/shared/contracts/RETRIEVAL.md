# Shared runbook retrieval contract

## Domain source precedence

When a selected domain runbook supplies specific data-retrieval instructions, follow that evidence strategy if applicable to the request and supported by current capabilities and schema. Shared report/search/record/query preferences are defaults only when the domain supplies no specific path, never a mandatory execution order. A selected-record question may go directly to an authorized record read; governed financial totals require a reconciled authoritative financial basis. Domain precedence does not override action authorization, access denial, actual tool approvals, schema validation, population completeness or financial verification gates. Do not load a generic source order in place of a more specific validated plan.

The request for analysis authorizes the necessary supported reads. Do not invent a separate confirmation merely because the read uses SuiteQL. Respect an approval explicitly required by the actual host/tool. Requested changes follow the action contract; analysis alone does not authorize a change.

Use the selected runbook's source plan as the starting approach. Preserve business definitions and dependencies; adapt discovery and retrieval order when another supported path answers the same question accurately. Examples and named tools are non-exhaustive. Prefer a narrow known-record read over broad discovery. Natural names require a verified lookup or the optional native selector app; never invent IDs. An app selection must return before use. Conversational disambiguation is an equivalent fallback only when supported reads can resolve the same object.

Minimize incidental data in every retrieval branch. Request only needed fields when the tool supports field selection. If a response includes unrelated personal, contact or other business fields, do not repeat them in answers, charts, exports or generated artifacts merely because they were returned. Do not make additional reads to enrich those fields. Continue only with task-relevant values and scope; if a search is unnecessarily broad, stop further paging and choose a narrower supported source or explain the limitation. Do not claim that unneeded fields were never retrieved or were deleted from the host/tool history.

Apply this decision model to the interface and operation actually affected. Record the observation and the narrower claim it supports separately. Use [readiness](READINESS.md#choose-the-applicable-interface) to distinguish record metadata from query metadata and interface-only errors from data access denials.

| Observation | Permitted behavior | Prohibited inference |
|---|---|---|
| Tool unavailable or not observed | Distinguish those states; discover or select an independently supported alternative | Treat incomplete enumeration as proof of absence |
| Metadata denied | Stop the affected metadata-dependent branch; return independently supported sections | Retry the permission failure or use alternate SQL to evade the denial |
| Metadata server or transport failure | Follow READINESS retry limits; then use an independently justified supported alternative or stop that branch | Interpret HTTP 500 as permission denial or permission to guess schema |
| Successful but incomplete metadata | Name the missing prerequisite and restrict claims or actions accordingly | Treat an absent constraint as proof that no constraint exists |
| Previously verified schema in the unchanged connection, role, session and scope | Reuse evidence that remains available in context while it remains applicable | Cache schema across sessions or assume evidence survived a scope change |

## Record reads

Use an available record-read capability such as ns_getRecord with the actual record type and ID. Prefer a narrow fields list when supported and sufficient; expand a selected-record read when needed to answer the request. Current record-type metadata is needed to resolve uncertain fields/types and remains required before any mutation. A successful REST-style record read or field list establishes only the returned record shape and values. It never substitutes for SuiteQL metadata, proves a join, or establishes that a field is writable.

If a requested field is omitted, treat it as unavailable from that response, not false, zero, blank or nonexistent. When material, use an appropriate supported alternate source or explain the gap. Prefer returned display labels or a supported display-value lookup over broad roster searches just to translate an ID. See [retrieval patterns](../knowledge/RETRIEVAL-PATTERNS.md) for optional examples.

## Specialized runbook retrieval

A selected runbook may define a specialized query compiler, packaged-query validation procedure or renderer. Follow that documented interface and preserve its typed parameters, scope, reconciliation and uncertainty handling. The generic shared compiler below is for runbooks that reference it, not a replacement for every submitted helper.

For an unchanged packaged query whose selected runbook explicitly defines bounded alternative validation after unavailable or inconclusive metadata, that procedure takes precedence over the generic incomplete-metadata rule below. Use its exact hash, known record IDs, narrow scope, authorization, comparison and uncertainty requirements. This exception does not permit bypassing permission denial, ignoring incompatible usable metadata, guessing fields/joins, or treating unreviewed new SQL as a packaged query. If current tool requirements demand metadata, comply with them. A source package's claim of prior validation is not current account evidence.

## Custom queries

Establish current SuiteQL schema evidence for each required record type using an available query-metadata capability such as ns_getSuiteQLMetadata. Reuse applicable evidence in the unchanged connection, role, session and scope; a fresh metadata call for every query is unnecessary. Follow current tool requirements. Establish fields, relationships, grain, accessible filters and business meaning. Metadata denial blocks the affected query; do not bypass it through guessed SQL, record metadata, REST field lists or diagnostic queries. Use READINESS for transient-read retries; do not repeat an unchanged denial or invalid request. A corrected request can proceed when its actual schema, scope and access requirements are established. Successful but incomplete metadata still blocks any predicate, join or interpretation that depends on the missing evidence. Use a single metadata-reviewed SELECT with stable unique ordering for paged details. Financial amounts require explicit header/line grain, sign and currency definitions. Avoid guessed joins and header duplication.

### Bundled compiler interface

This local compiler prepares a read-only query request; it does not execute an external action. Run it using absolute paths:

Resolve the compiler relative to this loaded RETRIEVAL.md: `../tools/compile_query.py`. Verify that resolved file is readable. From the directory containing this contract, the invocation is:

`python3 ../tools/compile_query.py --output-dir /absolute/existing/output-directory /work/query-input.json /work/query-request.json`

From any other working directory, pass the actual resolved absolute compiler path. The two /work paths illustrate task input/output paths; choose authorized task paths. Do not assume a plugin-root mount or execute a literal installation placeholder.

The neighboring bind_query.py implements private typed literal substitution, not native NetSuite bind parameters. Text placeholders go inside SQL quotes; approved integer placeholders are unquoted. Use only parameter names/types supported by the packaged helper. A compiler refusal means this helper cannot process that request as supplied. Correct it or choose another supported implementation with safe parameter handling and the required schema/scope evidence. Do not bypass validation or paste untrusted text into SQL. This helper's parameter names and supported SELECT shapes are not a plugin-wide query allowlist. The compiler validates syntax constraints and literals, not business meaning, joins, schema, query cost or permission. It makes no account call. Pass the resulting sqlQuery, pageSize and pageIndex as structured arguments to ns_runCustomSuiteQL using its observed schema.

Use a small page for narrow lookups and a supported page size for the requested population, with explicit pageIndex from the first call. Five pages is an initial planning batch, not a plugin cap. Continue supported pagination as needed for requested complete lists, or use an equivalent verified search/report. Actual tool limits and data scope apply; never describe a capped sample as full coverage. Capped detail SQL (ROWNUM) has a capped population even when hasNextPage is false. Do not use ROWNUM-before-ordering to claim latest/top results. Aggregates are valid only over the explicitly verified source population; never infer complete totals by summing incomplete pages. Concurrent changes mean pagination is not a snapshot.

## Saved searches

Discover an appropriate saved search using an available capability such as ns_listSavedSearches, or reuse a matching identity already established in current context. Resolve title/ID ambiguity in business language and establish the intended purpose and appropriate access scope before running it. A title alone is insufficient evidence of its population. Once scope and access are established, a bounded inspection run can help using explicit ranges supported by the actual callable schema. Do not assume whether range_end is inclusive; establish the convention from the tool contract or returned evidence before paging.

Inspection establishes only returned columns, returned values and the observed response shape. It does not establish hidden filters, active-status meaning, requested date/customer coverage or population completeness. Report a limited observation with those qualifications when useful, but do not promote it to the requested business result while population semantics remain unknown. Use a separately verified alternative or explain the missing evidence. If the saved search's filters, grain and completeness are verified and match the request, use that branch and skip query compilation. If it supplies only a total, it cannot fulfill a requested grouped breakdown.

The historical ns_runSavedSearch interface accepts searchId, optional type for standalone search types and range_start/range_end, without arbitrary dynamic business filters. Follow the current callable schema if capabilities differ; these historical parameters are not a permanent filter limitation. Do not pretend a user's requested date/customer scope was applied unless the saved search already matches or an independently verified semantically equivalent source supplies it. Keep the same search/scope and use supported page sizes and continuation until requested coverage is established or an actual tool/data limitation is reached. Missing continuation/completeness evidence yields partial or unknown completeness; a full-sized page is not proof of completeness.

## Recovery

Stop only the operation affected by an actual denial or an unresolved essential dependency. Continue independently supported work and investigate suitable alternatives; return partial results when useful. No matches is distinct from retrieval failure. Apply READINESS retry limits; do not repeat an unchanged validation or permission failure; correct the actual input issue or use an independently supported path without evading access controls. Never change source/population silently. Preserve nulls, units, time zone, retrieval time and source provenance. Read [reports](REPORTS.md) for report-specific parameters and [actions](ACTIONS.md) before any proposed account change.

Task-local query/input staging necessary for the requested analysis is part of the authorized work. Keep it scoped to the task and protect sensitive inputs; follow [BASELINE](BASELINE.md) and the current action contract.

## Select the metadata interface for the requested operation

For SuiteQL analysis, inspect the current callable schema and use `ns_getSuiteQLMetadata` for the needed query record types and fields. `ns_getRecordTypeMetadata` describes the record interface; it is not a prerequisite for SuiteQL and does not establish query fields or joins. Use `ns_getRecord` only when the selected procedure actually needs a record-interface read. A known internal ID alone does not require switching a query-backed analysis to that interface.

Record the exact failed tool, requested operation, target and returned error. A failure explicitly limited to REST Web Services access stops that REST-dependent call; it does not establish that the same role lacks independently exposed SuiteQL metadata or query access. In the unchanged connection and role, check the current SuiteQL metadata capability required by the selected analysis. Do not retry the denied REST call, switch identities, or request additional REST permission merely to satisfy an unnecessary preflight.

An explicit denial of the underlying record, field, population or connector policy remains a denial: do not use another interface to evade it. If the denial's scope is unclear, report that uncertainty and resolve it before a dependent data read. If SuiteQL metadata itself is denied or required field/relationship evidence is unavailable, stop the dependent query; never guess columns, run trial SQL, or suggest that user confirmation overrides the limitation.

The user's request authorizes the scoped reads and metadata discovery needed for that analysis. Do not ask for an additional go-ahead just to use a supported read-only query. Clarify genuinely missing scope or ambiguous fields instead. A saved search is an alternative only when its verified columns, filters, dates, grain and coverage satisfy the same question.


## Analysis continuity

Apply [evidence and scope](EVIDENCE.md) to preserve the selected population and distinguish observed values from coverage claims. Necessary read-only cross-checks within the requested analysis are covered by that request, not limited to the exact SQL technique used earlier. Current metadata, business semantics, actual tool approvals and access boundaries still apply. Clarify a genuinely different population or business objective before expanding scope. Keep source identity and supported navigation evidence for [links](LINKS.md); no-row reads may still have a report or saved-search destination.
