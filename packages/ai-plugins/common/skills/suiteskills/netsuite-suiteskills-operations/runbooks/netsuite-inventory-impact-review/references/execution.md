# Portable execution

Use an existing authorized read-only connection capable of exact identity resolution and transaction-line reads. Choose the actual exposed operations and arguments; do not assume a named host API or renderer.

## Packaged SQL

The local helper `scripts/compile_query.py` compiles packaged SQL using strict typed inputs. It requires Python 3.10+ standard library and makes no account calls. If local execution is unavailable, use a compatible exact structured read with the same filters/evidence, or documented parameter binding that safely expands lists. Never submit unexpanded template binds or concatenate raw user text into SQL.

```sh
python3 "<skill_dir>/scripts/compile_query.py" resolve_typed_reference "<task_dir>/inputs.json" "<task_dir>/query.sql"
```

Choose a new task-local output path outside the installed skill. Submit the resulting SELECT through the available connection using its documented first-response limit. The query templates contain no host-specific array or record-reference functions. Scalar IDs remain IDs. The detail template adds BUILTIN.DF(item) and BUILTIN.DF(inventoryReportingLocation) display values alongside those IDs in the same query. Use DF on record relationship fields, not numeric quantities, dates, free text or arbitrary ID literals. A display value does not establish a URL. Reuse returned labels before considering the single allowed enrichment read.

| Template | Inputs |
|---|---|
| resolve_typed_reference | transactionTypeCode, transactionReference |
| resolve_exact_reference | transactionReference |
| resolve_internal_id | transactionId |
| classify_inventory_impact | transactionId, transactionLineScope, transactionLineIds |
| inventory_impact_lines | Same three impact inputs |

Typed input codes come from the package table or explicit returned type evidence. Exact resolvers cap candidates at six, sorting by primary ID before the cap. A full candidate response is potentially truncated; never select one record from ambiguous or incomplete candidates.

Both impact queries must use identical transaction and line scope. ALL requires []; SELECTED requires nonempty integer IDs from this transaction. Line IDs may be zero when returned by the source; display ordinals are not IDs. The helper compiles an empty list to an inactive NULL list under ALL. No SQL identifiers, operators or arbitrary query fragments come from input.

## Fields and schema ownership

Retain current table-specific metadata evidence for any dynamically added header/line fields; consult only relevant metadata when needed for such field selection, not a broad catalog loop. A relationship belongs to whichever table exposes it. Omit unsupported optional fields instead of guessing a header column or inventing a join.

Packaged resolution uses only Transaction id, tranid, type and trandate. Required query schema must be established by current applicable SuiteQL metadata. Empty metadata does not authorize these core fields: this package does not supply the known-record comparison protocol needed for the foundation's bounded packaged-query exception. Stop the affected query if required schema is unavailable; an independently supported structured read may be used only if it preserves scope and does not bypass a denial. Current tool requirements always apply. Line classification requires TransactionLine transaction, id and isInventoryAffecting; detail uses item, quantity and inventoryReportingLocation. If an essential field cannot be read, report unavailable evidence. If available metadata already shows an optional detail field is absent, a compatible read may omit it while preserving the exact scope, flag filter and row cap. Do not retry failed details through a different projection.

Optional createdfrom context must use a supported header or line field and preserve that field's relationship meaning. It is never required for resolving a reference or confirming impact.

## Returned evidence

A complete aggregate row provides the classification and counts without loading all lines. Do not emulate it by counting a capped detail response. A partial false-only line response cannot prove None; a returned explicit true line confirms impact but any unestablished total remains unknown.

Detail rows are sorted by line ID before the 400-row SQL cap. A lower connection limit can truncate them further; never paginate. Preserve raw signed quantities for display derivation and preserve nulls. Missing function, schema, permissions or execution support is a retrieval limitation, not a stock conclusion.
