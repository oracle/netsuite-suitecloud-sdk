# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Connection and retrieval

## Authorized operations

Use the existing read-only NetSuite connection. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions. The package does not grant permissions or install a connection. Do not use arbitrary server code, direct account network calls, or another role as an alternative route.

## Scope resolution

Prefer supplied record IDs, verified links or completed record selections. Resolve natural names with a supported exact read or selector. If unavailable, ask for an ID or link; do not enumerate unrelated records or invent lookup SQL. Preserve all filters; never widen an unresolved scope to ALL. A transaction number is not an internal ID. Multiple exact matches require clarification.

A saved search can replace a template only when its filters, fields, grain, quantity and date meanings are already established as equivalent. Its title alone is insufficient. Do not add report cross-checking or runtime schema exploration.

## Execute packaged queries directly

Schema and business-semantic validation is a pre-release responsibility, outside the runtime skill. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions. Do not request schema metadata, perform field probes or block a packaged query because metadata has empty properties. Do not claim that this package has been tested against an account without an actual test record.

Unknown-table, unknown-field, unsupported-function, access and execution failures are unavailable evidence, not zero exceptions. Stop the affected query; do not translate a table by name similarity, invent fields or bypass restrictions. The explicitly packaged putaway fallbacks may supply independent evidence: a balance-only view when receipt-based aging is unavailable, and null-bin-only variants when bin type is unavailable. Follow the putaway reference; do not retry denied data or broaden filters.

## Compilation and bounded retrieval

Locate the installed skill directory and a separate writable task directory. Put every catalog-declared parameter in a task-local JSON file. Compile locally:

```sh
python3 "<skill_dir>/scripts/compile_query.py" negative_inventory_quantity "<task_dir>/parameters.json" "<task_dir>/request.json" --page-size 25
```

The helper validates template digests and typed inputs; it makes no account calls. Read its output and map the query and first-page limit to the available connection's documented arguments. Never put user values into shell commands or submit unexpanded binds.

Retrieve only the first bounded response. Do not advance page index, follow continuation tokens, or replace pagination with repeated smaller queries. Primary limits default to 25 and cannot exceed 100. Enrichment may have a larger SQL cap but still receives at most one response of 100 rows. Account reads, including resolution and retries, have an overall ceiling of 20. Preserve primary facts before optional labels or links.

Sort before applying the SQL cap. Source caps and connector limits are independent: a connector reporting no next page does not prove the SQL's uncapped population was complete. Disclose a reached cap, continuation indicator or unknown coverage. Existing tied ranking keys do not justify claiming a uniquely ordered exhaustive result.

## Visible evidence and enrichment

Use only rows available to the current role. Do not report invisible purchase orders, picks or expiration dates as exceptions. Successful empty, denied, failed and partial results have different meanings; keep them distinct without speculating about hidden records.

Keep IDs, display strings and URLs separate. Normalize response-key casing only when aliases map unambiguously. Resolve optional labels by exact returned IDs and verified record type; reuse existing labels. Do not fetch records solely to manufacture links. Use only verified browser URLs, not API self-links or constructed routes. Missing optional labels never discard primary evidence.
