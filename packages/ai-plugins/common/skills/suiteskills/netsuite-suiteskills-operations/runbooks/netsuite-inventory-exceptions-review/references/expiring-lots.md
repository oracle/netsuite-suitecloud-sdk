# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Expired and expiring lots

## Query and meaning

Run `expired_lots`. Require lot-controlled items, a non-null expiration date, positive aggregate on-hand, and expiration date <= asOfDate + 1 account day. Group only within item, lot, expiration date, location and bin; source quantities sum statuses inside that combination. Do not merge across lots, locations or bins. Preserve expiration-date order, descending on-hand, location, item, lot, bin.

Use `daysToExpiry` only for the status: negative is `Expired N days ago` (absolute N; use `Expired 1 day ago` for -1), zero is `Expiring today`, one is `Expiring in 1 day`. More than one day is outside this population. If an unqualified source gives such a row, do not call it expiring soon: resolve the scope mismatch before treating it as a verified exception. An explicit request for a wider horizon requires clarification; this skill does not silently change its one-day definition.

Keep returned expirationDate byte-for-byte as the `YYYY-MM-DD` value. Never interpret it as a timestamp, shift a timezone, split characters, or reconstruct it. Keep both quantity values as returned. Compose Location and bin as `<returned location> / <returned bin>`, or `<returned location> / No bin assigned` for a null bin. An unresolved non-null bin must not be called unassigned.

## Output

Exact heading: `## Lots expired or expiring soon Exceptions`

One row bullets: **Lot item**, **Lot number**, **Expiration date**, **Expiration status**, **On-hand quantity**, **Available quantity**, **Location and bin**.

Multiple row columns: `Lot item`, `Lot number`, `Expiration date`, `Expiration status`, `On-hand quantity`, `Available quantity`, `Location and bin`.

Keep each source combination separate, retain verified Item/Lot links when present, and do not add Recommended actions or speculative quantity explanations. Disclose only material evidence/coverage limitations.

No results: `No expired lots or lots expiring within one day were found for the checked criteria.`

Unavailable: `Expired and expiring lot data is unavailable in the current context.` No visible expiration date means expiry cannot be determined; do not infer it or list that lot as expired. Do not perform metadata probes or bypass access restrictions.

## Explicit guidance only

Explain the expired/today/tomorrow definition, per-bin quantities, and the need to follow the warehouse's inspection/quarantine/disposition policy. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions. Keep process explanation concise and omit a Recommended actions section.
