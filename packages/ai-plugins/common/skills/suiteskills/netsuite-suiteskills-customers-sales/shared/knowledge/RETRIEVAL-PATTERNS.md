# Reusable retrieval patterns

These patterns are optional starting points for reducing repeated discovery. They are not an exhaustive schema catalog, mandatory sequence or permission to query. Choose sources that fit the request and establish current access, scope and business meaning under [retrieval](../contracts/RETRIEVAL.md).

| Need | Useful approach | Interpretation |
|---|---|---|
| Human-readable reference | Prefer the label already returned; otherwise use a supported display-value lookup or narrow related-record read. | A label describes that field, not a separate business event. Avoid a broad roster solely to translate one ID. |
| Business identifier | Resolve name/document number to the relevant record type and internal ID. | Display identifiers and internal IDs need not be interchangeable; disambiguate material matches. |
| Omitted field | Use a supported alternate source when the missing value matters. | Omission does not mean false, zero, blank or nonexistent. |
| Related documents | Discover relationships within the selected record's scope; preserve relationship type and row grain. | Candidate links do not independently prove downstream status or activity. Read further only as needed for the requested claim. |
| Payment applications | Keep application amounts/currencies distinct from payment totals and unapplied balances. | One application does not establish the payment's complete allocation or all activity for a customer. |
| Current state | Retrieve the minimum fields needed for the selected question. | One flag or status does not explain every possible blocker or establish historical cause. |

Use metadata-supported display functions when suitable; no particular function or join is required for every record. Other appropriately evidenced methods remain available.

## Maintaining reusable examples

A reusable query example should document its purpose, source, typed parameters, result grain, pagination/completeness, interpretation limits and validation context. Separate a proposed template from one that has actually run successfully. Remove account-specific values and sensitive results from shared examples. Prior success helps discovery but does not establish access or correctness in a different account or role.

Add a pattern when it solves a recurring need. Specialized calculations and feature-specific recipes remain with the owning runbook. An absent catalog entry is an invitation to establish a suitable query, not a ban on it. Apply the selected helper's actual parameter schema or use another supported safe implementation; never interpolate untrusted values into SQL.
