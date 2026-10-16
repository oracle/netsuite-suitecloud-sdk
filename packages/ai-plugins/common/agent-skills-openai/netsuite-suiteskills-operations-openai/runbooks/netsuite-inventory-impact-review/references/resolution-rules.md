# Exact identity resolution

## Bounded attempts

Allow at most three targeted resolution attempts per reference, including retries and identity-verification calls. Stop sooner when a unique exact primary record is verified, an access denial occurs, or no meaningful supported alternative exists. This is a ceiling, not a requirement to use all attempts.

- With a supplied concrete type and document number, first match the full reference exactly within that type. Use [type codes](transaction-type-codes.md) and the packaged typed resolver when a query read is available, or an equivalent exact structured read.
- Without a supplied type, first match the full document reference across accessible transactions with a bounded exact query. Use returned primary-record type evidence to determine the type. Do not infer it from `IF-`, `INV-` or another prefix, and do not cycle through transaction families.
- A second or third attempt must address a specific missing identity field, use an exposed exact alternate reference field with documented semantics, or correct a demonstrable query-construction problem. Preserve the full reference and all supplied constraints. Do not repeat unchanged failures, perform fuzzy/suffix searches or broaden scope.
- Multiple exact matches are ambiguous. Use already supplied date/entity/subsidiary/location constraints when supported; otherwise ask for the distinguishing detail rather than choosing one. A bounded candidate result reaching its cap is not proof of uniqueness.
- After up to three unsuccessful attempts, ask for the transaction type, record link or another identifying detail. For example: `What type of transaction is IF-26?` when that is the missing detail. Execution failures must be described as failures, not as proof that the user's reference is wrong.

## Explicit IDs and links

Numeric-only text is a document reference unless explicitly described as an internal ID. Never extract a suffix as an internal ID.

For an explicit internal ID, perform an exact identity read before impact classification. Require the returned primary ID and type to agree with the request; if a type was not supplied, derive it from that returned record. Do not classify a returned fulfillment as an invoice merely because the user supplied that ID. Ask about a mismatch.

For a link, establish its current-account scope using trusted connection context and verify the candidate target with an exact read. URL text and labels supply candidates, not verified identity. Do not fetch arbitrary URLs, follow redirects, switch accounts or silently ignore a conflicting host. If account scope is unclear, ask. A successful exact identity read may supply the document number, type and status without another lookup.

## Mixed requests and continuity

An ambiguous shared filter blocks only affected references. Never drop a filter or widen an unresolved line selection. Complete independent checks and group questions for pending references. Do not give unqueried references an impact classification or claim their lookup failed.

Retain the original reference and filters across clarification replies. Resume newly ready references without repeating completed checks, unless freshness or changed scope requires it. Apply a type to multiple references only when the user groups them under that type or each returned identity establishes it.

## Outcome language

One unique exact match with verified ID/type permits classification. Successful empty lookup means no accessible exact match was found within the checked scope, not that the record cannot exist. An inaccessible, partial, ambiguous or failed lookup is not confirmed not-found and must not become None.
