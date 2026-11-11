# Connector discovery and evidence guide

Treat the current tool schemas as authoritative. The examples below were checked
against connector descriptions exposed during skill preparation, not against live
account records. Re-discover tools at execution time.

## Saved searches

Use `ns_listSavedSearches(query="project")` before `ns_runSavedSearch`.
The exposed run schema accepts `searchId`, optional `range_start` and `range_end`,
and `type` for qualifying standalone search types. Do not invent date, subsidiary,
or project-filter arguments that are not in that schema.

The uploaded draft supplied these example IDs, not validated account resources:

| Purpose | Example from the draft |
| --- | --- |
| Deadline-flagged projects | `customsearch_p360_projects_at_risk` |
| Overdue tasks | `customsearch_p360_projecttasks_overdue` |
| Hours overage by project/task | `customsearch_atlas_over_by_proj_tsk_list` |
| No resource allocation | `customsearch_atlas_svs_em_prj_no_ra_cond` |

Only run IDs returned by current discovery or explicitly supplied and validated
for the current account. Inspect returned columns and documented filters before
assigning the search to a risk category. A name alone does not prove semantics.

### Pagination

Establish range indexing and end-boundary semantics from current documentation,
tool metadata, or returned pagination information. The exposed parameter
descriptions alone do not state whether the upper bound is inclusive.

Use supported ranges and retain page/range information. When no total is returned,
continue according to verified range semantics until an explicitly empty terminal
page or another documented completion signal is observed. A short page can be a
server cap rather than proof of completion. Detect repeated pages/no progress;
stop and mark partial rather than looping indefinitely. Preserve stable IDs and
deduplicate overlapping page boundaries.

Do not silently convert summary rows, display-truncated output, a tool limit, or a
single page into a complete task dataset. Capture returned totals separately from
retrieved distinct counts. Use “Observed in retrieved records” when completeness
cannot be established.

## Native records and permission gaps

Discover record types and fields with `ns_getRecordTypeMetadata`; retrieve known
records with `ns_getRecord(recordType=..., recordId=..., fields=...)`. Do not assume
`ns_getRecord` lists records. Locate relevant IDs via accessible searches or other
documented read mechanisms.

Attempt discoverable native Project Risks, Project Issues, and Project Summary
views where permitted. A successful empty result is not the same as an unavailable
feature or access denial. Mark “not discovered” rather than “no native risks” when
no compatible view can be found.

For a denied request, retain the actual tool, search/view identifier, and error
scope. Explain that the NetSuite administrator should review the relevant access.
Do not invent a permission name or claim all records of a type are blocked unless
the error supports that statement.

## Reports

Use purpose-built risk searches when they exist. When a relevant report is needed:

1. Call `ns_listAllReports` first.
2. Inspect `as_of_format`, subsidiary-filter requirements and supported options.
3. Fetch subsidiary/book/context/nexus values only with the corresponding exposed
   helper tools and only when required or supported.
4. Follow the connector's parameter-collection app requirements; wait for its
   returned selection when user input is required. Never manufacture selections.
5. Call `ns_runReport` with the actual report ID and supported required parameters.

The currently exposed report tool returns summary-line column values. Do not claim
it supplied task-level rows or a full project list. Keep report period/as-of scope,
subsidiary, currency, accounting basis, and fiscal calendar visible when relevant.
Do not assume a January fiscal year or mix snapshots and reporting periods.

## Optional read-only SuiteQL

Use SuiteQL only if needed for a supported gap and the appropriate tools exist;
do not replace an accessible risk-focused search merely for convenience.
First inspect `ns_getSuiteQLMetadata`. Use only discovered fields and join paths.
Construct read-only queries; do not bypass a failed permission check.

Follow `ns_runCustomSuiteQL` pagination requirements. In the currently exposed
schema, use `pageSize` with `pageIndex`, inspect `totalResults` and `numberOfPages`,
and fetch all remaining pages. Do not invent SQL tables from display names,
assume full SQL dialect support, or treat an unpaged capped result as complete.

## Source manifest

Assign local source keys such as `s01`, each tied to actual calls. Retain:

- Exact tool name and call/response references.
- Actual saved-search/report ID, or record type plus record ID.
- Query/filters, pagination ranges and returned counts.
- Retrieval timestamp with offset, snapshot date and timezone.
- Source category, completeness state, permission/error notes and field mapping.
- Actual returned record URLs when available.

Local keys are an index into evidence, not evidence themselves. Verify every key
against the conversation's tool results before publishing.
