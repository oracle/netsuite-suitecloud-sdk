---
name: netsuite-inventory-impact-review
description: "Verify and explain the inventory impact of existing NetSuite transactions, including typed or untyped document references, record links, explicit internal IDs, selected lines, and bounded comparisons. Use for questions about whether a transaction changed inventory; not for estimating planned inventory changes."
metadata:
  owner: "Oracle NetSuite"
  version: "7.0.0"
  source-version: "7.0"
  integration-version: "1.0.0"
  runbook-id: RB-OPS-003
  category: operations
  access-mode: read_only
---

Before tool use, load and apply [category SafeWords](../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Transaction Inventory Impact

Version 7.0. SuiteSkills plugin skill, packaged separately for authoring and testing against SuiteSkills Non Read Only 0.6.11.

## Purpose and evidence

Determine inventory impact from transaction-specific evidence visible to the current user. An explicitly inventory-affecting line confirms inventory impact. Do not require a before/after balance query or an additional quantity-change verification step. Quantities describe the confirmed lines; they do not replace the impact flag.

Remain read-only. Do not modify records, install connections or bypass access restrictions. Select compatible capabilities from the current connection's actual descriptions and argument contracts. No particular account tool name, host execution API, special renderer or response envelope is required.

## Workflow

1. Parse every reference and preserve supplied types, exact document strings, filters and selected-line scope. Read [resolution rules](references/resolution-rules.md). Missing type alone does not require immediate clarification: attempt bounded exact resolution, stopping at a unique verified match or after at most three targeted attempts per reference. Never infer type from a prefix. No identifiable reference or usable scope requires a focused question before reads.
2. Verify identity before classification, including explicitly supplied internal IDs and IDs parsed from links. Require the returned primary ID and transaction type to match the intended record and supplied constraints. Reuse a successful resolver result; do not repeat identity reads merely for display fields. Continue independent references when another needs clarification.
3. Preserve metadata-driven field ownership for dynamically selected fields: use each field only from the table whose available SuiteQL metadata exposes it. `createdfrom` is optional; retrieve it only when requested/necessary and supported by the relevant header or line metadata. Do not assume it belongs to the header. This retains the earlier field-selection fix; it does not require broad schema exploration. For packaged query execution and safe binding, read [execution](references/execution.md).
4. Classify each verified transaction/line scope once using the semantics in `scripts/classify_inventory_impact.sql` or an exposed read with equivalent evidence. Whole transactions use ALL with an empty line-ID list; SELECTED requires resolved line IDs belonging to this transaction. An unresolved line selection requires clarification, never expansion to ALL.
5. For IMPACTING only, retrieve impacting lines once using `scripts/inventory_impact_lines.sql` or a compatible read with the same scope and flag filter. Retain the classification count independently of the detail cap (400). Read [positive detail](references/positive-impact-line-detail.md).
6. Render text and native Markdown tables following [output format](references/output-format.md). Derive display values directly from returned rows; no transformation service is required. Report outcomes and pending questions together without dropping successful work.

## Classification

| Evidence | Result |
|---|---|
| At least one matching line has an explicit true inventory-affecting flag | Confirmed |
| Matching accessible lines exist and every flag is explicitly false | None, within accessible line scope |
| No matching accessible lines | Not confirmed |
| No true flags and at least one missing/unrecognized flag | Not confirmed |
| Failed, incomplete, malformed or unavailable classification | Not confirmed; preserve any independently confirmed positive evidence |

The bundled aggregate returns `status`, `matchingLineCount`, `inventoryAffectingLineCount` and `unavailableImpactFlagCount`. Its single summary row is not a one-line impact count. For Confirmed, use `inventoryAffectingLineCount` even if details fail or are capped. Missing flags alongside true flags mean the count includes confirmed lines only.

Do not infer impact from transaction type, quantity alone, a document prefix, a picked/packed/shipped label, or generic product behavior. A None result requires sufficient coverage of the accessible requested line scope; a false-only truncated subset is not enough.

## Boundaries and stop rules

Read [retrieval budget](references/retrieval-budget.md) for multiple or bulk requests. Do not paginate. Stop a denied or failed scope without bypassing it. After unavailable classification, do not fetch details, rerun classification or search for a substitute answer; use [restricted results](references/restricted-access-results.md). Confirmed remains Confirmed when details are absent, zero or incomplete; explain the detail limitation.

Optional product documentation may explain a business rule after resolution and classification, but missing documentation cannot block the transaction-specific answer. Do not claim an unverified product rule. Use the detail query's BUILTIN.DF display labels where returned. Do not run additional reads to relabel an already named record, obtain counts or fetch missing reporting location. Genuinely missing item names/quantities or requested extra detail may use only the single targeted enrichment read in the retrieval budget.

## Package metadata and NetSuite requirements

Read [metadata.json](metadata.json) for the structured identity, documented effects, execution dependencies and NetSuite requirement statuses. Treat `not_collected` as unknown, not as no requirement. Preserve the existing procedure, scope and permission rules; metadata does not authorize additional account actions or add runtime discovery queries.

## Vocabulary

MCP means Model Context Protocol; SQL means structured query language; SuiteQL is the NetSuite query language; ID means identifier. BUILTIN.DF is the NetSuite display-value function.

## Retrieval and query requirements

This is a domain-specific exact-resolution, classification, then conditional-detail path; shared report/search preferences are not preliminary steps. Follow references/execution.md and current callable tool requirements. Preserve this source's no-pagination scope and disclose incomplete details. Unsupported schema blocks only the dependent path; do not bypass a denial.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
