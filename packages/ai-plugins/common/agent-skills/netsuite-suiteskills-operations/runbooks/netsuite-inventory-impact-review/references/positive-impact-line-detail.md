# Confirmed impact details

After Confirmed, retrieve inventory-affecting lines once with the exact classified transaction/line scope and explicit true flag filter. The packaged query returns lineId, item ID, itemDisplay, signed quantityChanged, nullable inventory-reporting location ID and locationDisplay, ordered before a 400-row cap. The two display columns use BUILTIN.DF on their corresponding relationship fields in the same detail query; they do not require another account read. A compatible connection may return richer references and unit fields with the same meaning.

Use classification inventoryAffectingLineCount as the total. The classification's one returned summary row and the detail response's capped row count are different measures. For example, report “450 impacting lines; 400 detailed” when those are the observed values. No additional count query is needed.

Missing or failed details never negate Confirmed. Use `Impacted line details were not returned.` and explain the limitation without fabricating rows or retrying.

## Display and enrichment

Use the native Markdown table contract in [output format](output-format.md). Preserve the raw item and location IDs internally. Prefer itemDisplay and locationDisplay for presentation, or equivalent names/codes from a compatible read; a display string is not a verified link. Normalize response-key casing only when the aliases map unambiguously. Never group, match, filter or deduplicate by display text in place of IDs. Do not repeat a lookup for a label already returned. At most one targeted enrichment read may fill genuinely missing item names/quantities or requested extra detail, using only returned line IDs or their exact returned item IDs. If names remain missing, display `Not returned` and explain the gap, rather than treating an ID as a name.

Display absolute quantity and derive Increase/Decrease from the original sign. Zero displays `0` and `No change`; missing quantity displays `Not returned`. An explicit true impact flag still confirms impact; explain zero/missing quantity as a detail inconsistency or limitation. Do not initiate before/after balance checks.

A null inventory-reporting location, or a missing display label for that location, displays `(Not returned)`. Keep the line even when either display label is missing; missing labels do not change impact classification, counts or quantities. Never substitute header or ordinary line location, infer a disabled feature from null, or query again for location alone.

Keep one row per returned line by default. Group only compatible quantities with the same verified item, location, unit basis and direction, preserving the impacting-line count separately. Keep positive and negative lines separate. Missing grouping keys or unknown/incompatible unit bases require separate rows. Do not invent units or conversion factors.

If readability requires a display preview, state retrieved and displayed line counts separately from the classification total. Never imply a preview or grouped-row count is the number of impacting lines.
