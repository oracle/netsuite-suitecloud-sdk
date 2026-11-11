# Retrieval budget and stops

Use the smallest authorized read scope. Per reference:

1. Up to three targeted identity-resolution attempts, stopping as soon as a unique exact ID/type is verified. Include ID verification in this budget. No family-by-family search or unchanged failed retry.
2. One classification read for the verified transaction and resolved selected lines, if any. Reuse existing field metadata; optional dynamic context does not justify broad discovery.
3. One impacted-line detail read only for Confirmed, with identical scope and at most 400 rows. No pagination or additional count query.
4. Use the detail query's BUILTIN.DF labels first. At most one optional targeted enrichment read for genuinely missing item names/quantities or requested extra detail, restricted to returned impacting line IDs (or the exact item IDs returned on them). Never use it to retry failed details, fetch missing reporting location or redetermine impact.
5. At most one optional product-rule lookup per distinct resolved category/status, only after valid impact evidence. Reuse it across similar transactions. Missing product guidance never blocks delivery.

After denial, unavailable classification or classification failure, stop that reference's reads and report the evidence limitation. After failed/empty details retain Confirmed and its count without retrying. A null reporting location is not a reason to probe account features, substitute another location or make another read.

## Multiple references

Process independent references even when another is unresolved. Return checked results in the user's relative order followed by grouped clarification questions. Do not recheck completed references on a clarification reply unless freshness or scope changes require it.

## Bulk scopes

For bulk requests, require a concrete transaction type or sufficient user-supplied filters to define a bounded scope; ask when neither exists. Retrieve a deterministic list with verified primary IDs/types and supported filters. Check at most five transactions across the entire request (fewer if requested), allocating by requested type/scope order. A returned list row can establish identity without an additional per-record read when its evidence is sufficient.

Do not paginate or query additional families to fill the cap. Preserve every requested filter. State that the answer covers only checked transactions. When more are known to exist, ask the user to narrow or request another bounded batch; do not silently fetch it. Incomplete or failed scopes remain unavailable, not no impact.
