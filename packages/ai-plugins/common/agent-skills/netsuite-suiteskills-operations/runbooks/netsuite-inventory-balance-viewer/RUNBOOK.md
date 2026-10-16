---
name: netsuite-inventory-balance-viewer
description: "Use for NetSuite inventory balance viewer. Show current NetSuite on-hand and available stock by item, location, or bin. Use for inventory levels, warehouse snapshots, and bin breakdowns with a compatible NetSuite connection. Provides scoped findings and requested local outputs. Requested actions depend on authorization, supported tools and business prerequisites."
metadata:
  owner: "Oracle NetSuite"
  version: "4.0.0"
  source-version: "4.0.0"
  integration-version: "0.7.4"
  integration_release_date: "2026-10-15"
  source_release_date: "not_collected"
  first_included_date: "2026-10-08"
  runbook-id: "RB-OPS-015"
  category: "operations"
  access-mode: "operation_dependent"
---

## Release operation scope

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

Read [shared baseline](../../shared/contracts/BASELINE.md) and [output safety](../../shared/contracts/OUTPUTS.md). For conventional CSV use [the shared serializer](../../shared/rendering/safe_csv.py); do not emit unprotected business text.

## Source readiness and result checks

Check relevant feature/access evidence before selecting a balance source. Prefer the supported dedicated/detailed balance source. If InventoryBalance is unavailable because its prerequisite is absent, use a separately authorized and metadata-verified inventoryItemLocations item-location source for current on-hand/available quantities when it supports the requested measure. Establish its item/location keys, field meanings, units and completeness. This fallback does not answer bin, lot or inventory-status detail. Never bypass an access denial, combine both sources into duplicate totals, or call an omitted quantity zero. See the qualified item-location fallback in references/connection.md.

# Inventory Balance Viewer

Source version 4.0. Integrated business runbook.

Answer current stock questions from current inventory-balance evidence. Keep item in every quantity grain: never combine quantities across different items. Present each item's primary stock unit when verified conversion metadata is available.

This runbook supplies current inventory evidence. For requested changes, follow the shared action contract: establish exact scope, authorization, supported capability and business prerequisites, then verify the outcome. Read [references/connection.md](references/connection.md) before any account lookup and [references/presentation.md](references/presentation.md) before answering.

## Scope

Support current on-hand and available quantities, filtered by item, location, and/or bin. Examples include "What's in stock?", "How much of ABC is in Location 1?", "Show stock by bin for ABC", and "What's in bin A1?".

Do not calculate committed, backordered, allocated, inventory-status, planning, or supply/demand availability. Do not provide forecasting, replenishment, allocation advice, or stock movement recommendations. For these requests, state that this skill does not support the requested interpretation and offer current on-hand and available quantities by item, location, or bin. Do not reinterpret available quantity as any unsupported balance.

The source inventory-balance capability depends on item-list visibility and Advanced Bin/Serial/Lot Management. Confirm what the actual connector supports; role, permission, feature, CDSL, subsidiary, location, and metadata restrictions can limit or block evidence. Never use those restrictions as proof of zero inventory.

## Workflow

1. **Choose a supported interpretation and scope.** Extract every item, location, and bin filter. For a broad request without these filters, ask a narrowing question unless an overview is explicit or a bounded sample is clearly acceptable. Keep a single requested item as the scope; do not add location or bin detail unless requested.

2. **Resolve references before retrieving balances.** Accept item name/number, SKU, full name, external ID, or internal ID; location name, hierarchy/full path, external ID, or internal ID; and bin number/name or internal ID. Resolve them using the current connector's exposed fields and read-only tools.
   - Treat a match as resolved only if it matches exactly after case and whitespace normalization, the user supplied its internal ID, or the user confirmed the candidate. A supplied internal ID is a filter, not proof that a record exists or is accessible.
   - After an initial lookup yields no exact match, make one structured exact-match record query if the connector exposes a supported one. Check item name/number and full name, location name and full hierarchy name, or bin number/name as appropriate. Check external ID or SKU fields only when their actual semantics are documented. If that query is unavailable, explain the resolution limitation and ask for an ID or confirmation; do not invent SQL or a tool.
   - If there are multiple exact matches, ambiguous references, or only similar/contains/fuzzy matches, ask the user to choose or confirm before retrieving balances. Do not silently correct `binitem2` to `BintItem2` or broaden an unresolved scope.
   - Resolve all requested records and retain a scope ledger so no item, location, or bin is dropped. If a filter remains unresolved, clarify before querying that scope.

3. **Select the answer grain.** Item is always mandatory. Use the user's explicit grain when stated. Otherwise use item plus the lowest requested storage level among location and bin.

   | Request | Quantity grain |
   |---|---|
   | Item only | Item; use any storage constraints only as filters |
   | Location totals or inventory in a location | Item + location |
   | By bin, in each bin, bin detail, or inventory in a bin | Item + bin; include location when needed to distinguish bins |
   | Explicit breakdown/drilldown | Item + requested storage dimension(s) |

   Set a grain argument only when its name and allowed values are documented by the connected tool. Map the desired grain to that contract; do not assume literal `BIN`, `LOCATION`, or `ITEM` arguments exist. Item/location/bin IDs remain filters regardless of presentation grain.

4. **Retrieve current inventory-balance evidence.** Prefer a documented dedicated balance operation. If none is compatible but an authorized generic SuiteQL reader is available, qualify and use only the narrow fallback path in [references/connection.md](references/connection.md) and [references/suiteql-fallback.md](references/suiteql-fallback.md). Supply only resolved internal IDs to balance filters. For multiple requested IDs, use a supported set filter or each necessary ID combination, retaining every successful result. Do not present only the last response.
   - For a location-wide or bin-wide snapshot, make the first retrieval a full scoped request using the maximum documented row limit. Do not guess the limit. For broader overviews, use the documented bounded limit and disclose it when applicable.
   - If the full scoped request returns limited or truncated rows, use that evidence and label the result limited. Do not rerun the same scope just to enlarge/change the limit, get a count, make a fuller table, or build an alternate rollup. Do not fetch additional pages. If the first response is incomplete, retain the returned subset, disclose the limitation, and let the user narrow the scope.
   - If a successful result does not contain the explicitly requested finer grain, retry once with the documented explicit grain control, if available. This is a correction of grain, not a limit retry. Do not call the finer grain unavailable unless the tool says so; if it still cannot be established, state that the returned evidence does not support the requested detail.
   - Apply the terminal outcomes in the connection reference immediately. A catalog-visible `InventoryBalance` table with empty field properties is not itself terminal; use the documented static-field and bounded-probe fallback once. Do not bypass a denial or manufacture a balance. When the detailed source is unavailable for a supported non-denial reason, the separately qualified item-location fallback may answer only its supported aggregate grain.

5. **Aggregate only the returned evidence.** Detailed rows are evidence, not the default presentation. Roll them up at most once to the selected grain if needed; do not run computation merely to count rows, make metric cards, or reshape an already suitable table.
   - Never sum, average, or compare different items' quantities as one quantity. A request for "total inventory in the warehouse" receives per-item balances, with a brief explanation that different items are not combined into one quantity.
   - Aggregate inventory-number, inventory-status, license-plate, and other lower dimensions into the selected storage row by default. Display breakdowns only by item, location, and bin. Lot/serial, inventory-status, license-plate, and other lower-dimension breakdowns are unsupported even when requested; explain the supported view. Preserve legitimate underlying rows when rolling up compatible quantities; identical visible values alone do not establish duplicates.
   - Avoid overlap when accumulating multiple requests: use disjoint scopes or deduplicate only by a verified unique row key and grain. Do not deduplicate simply because two quantity values or labels match. If overlap cannot be resolved, keep results separate and explain why no combined total is given.
   - Use primary stock-unit quantities. Apply conversion only when the evidence supplies the quantity unit, stock unit, conversion rate, and direction; never guess a factor or apply conversion twice. If conversion metadata is unavailable, preserve the returned basis and label it explicitly as not confirmed stock-unit-normalized. Do not sum incompatible or unknown unit bases for the same item.
   - Keep missing on-hand or available values unavailable; never fill with zero. Label sums from limited/truncated evidence as quantities for returned rows only.
   - Confirm that every resolved scope that returned rows appears in the final evidence. Identify empty, failed, or limited requested scopes separately; do not silently omit them or broaden their filters.

6. **Interpret and present.** On hand is the current quantity physically in inventory for the returned row. Available is the current available quantity in that stock view. Use [references/presentation.md](references/presentation.md) for tables, summaries, empty results, and large previews.

## Final checks

- Ground supported quantities in current balance rows, not item/location/bin setup, transaction metadata, reports used as replacements, memory, or general product knowledge.
- Show the requested scope and grain, preserve every requested successful scope, and keep items and units separate.
- Treat zero as a quantity only when explicit returned zero rows establish it; an empty, restricted, or failed query never does.
- Include unit basis and material limits: truncation, incomplete or partially resolved scope, permissions/CDSL, features, unavailable labels, unavailable conversion metadata, retrieval failures, and the required schema-fallback disclosure when that path was used.
- Use returned display names, or clearly labeled internal IDs when names are unavailable. Do not expose restricted details or internal exception traces.
- State when evidence was retrieved if available; do not imply uninterrupted real-time freshness or claim this skill was tested against the user's account.

## Package metadata and NetSuite requirements

Read [metadata.json](metadata.json) for the structured identity, documented effects, execution dependencies and NetSuite requirement statuses. Treat `not_collected` as unknown, not as no requirement. Preserve the existing procedure, scope and permission rules; metadata does not authorize additional account actions or add runtime discovery queries.
