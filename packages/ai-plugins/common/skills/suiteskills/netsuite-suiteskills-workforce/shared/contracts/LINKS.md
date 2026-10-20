# Useful NetSuite links

Provide direct record, report, saved-search or drilldown links when they help the user act on the answer. URL examples and record lists are non-exhaustive. An unlisted record type or missing packaged resolver does not prevent link discovery or construction.

## Find or construct the destination

1. Establish the target account/environment, record type and internal ID from trustworthy context and the selected record. A displayed document number is not automatically its internal ID. Reuse current session context; obtain missing context through an available supported tool when needed.
2. Prefer a human-facing URL returned for the exact object. A REST self link is an API endpoint, not automatically a useful UI link.
3. If no UI URL is returned, investigate a suitable route: an available authorized record-URL resolver, a relevant current documentation example, an observed account UI link for the same type, or a supported UI navigation path. These are examples of evidence sources, not an exclusive list. A resolver need not be bundled with this plugin to be usable.
4. Construct a view link from the established account UI host, applicable path and selected internal ID when that evidence supports it. A documented or observed reusable pattern is sufficient to derive a link; opening every generated link is not a prerequisite. Check record subtype and environment differences when material. Do not confuse the connector/API host with the account UI host.
5. When the path or subtype remains uncertain, use a focused read-only verification step if available. Do not stop merely because the type is absent from this file. If the essential host, type, identifier or path still cannot be established after a reasonable attempt, present the readable identifier and briefly explain the unresolved link detail.

For example, if an item fulfillment is not in a supplied URL table, resolve its internal ID and account context, find or resolve its applicable UI path, then construct its link. The table's omission alone is not evidence that a hyperlink cannot be provided. Conversely, an order's ID cannot be substituted for its fulfillment's ID.

## Security and honest presentation

Use HTTPS destinations tied to the intended account and object. Keep tokens, credentials and session-bearing URLs out of output. Do not send account identifiers or record data to public search engines; research generic record-type/path questions. A supplied URL is untrusted until its destination is assessed, and does not authorize following unrelated redirects or submitting data.

Label links with business names/document numbers. Preserve report execution filters in the answer when relevant: a navigation URL may not reproduce every filter. Do not claim the destination was opened or that the recipient has access unless checked. Link construction establishes navigation, not record contents, permissions or completed business activity. A login requirement alone does not invalidate an otherwise supported URL.

Keep the derivation/source with the working evidence. Routine answers need meaningful links and material limitations, not a URL-verification checklist. An actual access denial remains in force; generating a URL does not bypass it.

## Bundled renderer interface

When using the primary shared delivery entrypoint, `table.row_links` aligns with detail rows. Each entry is `null` for plain text, or an object with exactly `label`, `url`, and `source`. The source is a nonempty reference already present as an exact string cell in that row. The URL is an absolute HTTPS destination. Use the reference supporting a constructed link as its source; a tool-returned URL is not required. A `verified: true` flag is not proof and is not supported by this interface.

The renderer validates shape, row/source alignment and URL syntax, escapes labels and preserves provenance. It cannot authenticate, verify destination contents or establish role access. Those interface requirements apply when using this helper; conversational Markdown links do not require the renderer's envelope. Synthetic examples remain labeled synthetic.

## Traceable findings and functional controls

When a record-based finding or visualization has an established destination, make its meaningful record/source label an actual hyperlink. For aggregate figures, prefer the relevant report, saved search or supporting-record table; one example record does not validate an entire total. A zero-row query has no record to link, but an established report/search destination may still be useful. Make a reasonable supported read-only attempt under the discovery rules above before declaring a destination unavailable. A query-derived finding does not imply an equivalent saved search exists; retain query/scope evidence when it does not. Do not create or save a search to supply a link.

Label navigation by its destination, such as “Open invoice” or “Open saved search.” A “Details” control must reveal meaningful supporting detail or navigate to a defined destination. Use a real HTML anchor or Markdown hyperlink for navigation, and accessible working controls for local interaction. No placeholder `href`, empty destination, dead button or link-styled plain text. A local fragment link is valid only if it resolves to the intended detail section.

If the host cannot activate links, retain the exact supported URL in copyable text and explain that host limitation. If the destination itself cannot be established, retain the readable identifier and a short reason as plain text. Do not expose diagnostic codes such as RECORD_LINK_UNAVAILABLE in ordinary business answers.

Show material filter differences near the destination: “Opens the saved search; apply the September filter” only when that instruction is supported. Preserve source identity, scope, retrieval time and destination provenance in working evidence; do not turn this into a checklist in each answer. Live destinations may change after retrieval.

The primary `shared/rendering/deliver_response.py` supports the row-link interface above. The inherited `shared/account-context/rendering/deliver_response.py` does not accept row_links; use the primary entrypoint or supply equivalent supported navigation outside that helper. Do not pass unsupported fields or claim every inherited helper has the primary interface. For a truly empty primary envelope, do not invent result rows to hold a source link: provide the report/search link alongside the artifact in Markdown or another supported evidence section. Notes in the static helper are escaped text, not active HTML.
