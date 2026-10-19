---
name: netsuite-supply-chain-persona-based-responses
description: "Use for read-only supply-chain planning and operational inventory-count reconciliation, adapting recommendations to warehouse, purchasing, regional or executive audiences. Route bare stock balances, transaction impact, fulfillment performance and selected-item purchasing history to their focused skills."
metadata:
  owner: "Oracle NetSuite"
  version: "2.0.1"
  source-version: "2.0.1"
  integration-version: "0.8.1"
  runbook-id: RB-OPS-011
  category: operations
  access-mode: read_only
---

Before tool use, load and apply [category SafeWords](../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Supply Chain Persona-Based Responses

## Permission-limited evidence

When a read is denied, name the denied report, record, field, location, or other evidence category. Check whether an independently authorized report, saved search, or focused record can answer the user's question. Report surviving findings with their coverage and freshness before access guidance. If denied evidence is necessary for the requested conclusion, say what cannot be verified and suggest: **Work with your NetSuite administrator for additional access.** Do not give that guidance when authorized evidence is sufficient. An empty result or unavailable connector capability is not a permission denial. Never guess a permission setting, switch roles or credentials, or bypass an access control. See [references/netsuite-data-and-access.md](references/netsuite-data-and-access.md).

## Selection and ownership

This skill is a thin router for the response style of an in-scope SCM interpretation or decision. It owns operational Inventory Count sequencing and reconciliation through [references/inventory-count-guardrail.md](references/inventory-count-guardrail.md). It owns broader operational purchasing decisions; selected-item purchasing history belongs to the dedicated purchasing-history skill and vendor comparison to Vendor Optimization. It does not replace focused data or performance skills.

Choose the owner by the primary requested outcome before considering persona signals or explicit invocation:

| Primary request | Owner |
| --- | --- |
| Bare current on-hand, available quantity, or availability by location | `netsuite-inventory-balance-viewer` |
| Inventory impact of a specific transaction or transaction type | `netsuite-inventory-impact-review` |
| Item Fulfillment lifecycle duration, SLA, or fulfillment performance | `netsuite-fulfillment-performance-insights` |
| Operational Inventory Count reconciliation, including posted activity after a count snapshot | This skill and its Inventory Count guardrail |
| Selected-item purchasing history or historical item lead times | `netsuite-item-purchasing-history` |
| Vendor comparison and optimization | `netsuite-vendor-optimization` |
| Broader operational purchasing decisions or open-order priorities | This skill |

The focused-skill exclusions take precedence over explicit invocation of this skill and over role cues. Route to the named owner only when the host actually has it. If unavailable, state the routing gap and request the needed authorized evidence or help from an available host workflow; do not simulate the specialist or invent account data. Planning availability and fulfillment status may be supporting evidence for a broader planning or exception decision in this skill. Do not turn that supporting use into a bare balance or fulfillment performance answer. Financial and accounting analysis remains outside this skill.

Supported styles are Execution (Shop floor user, Warehouse user), Ops-Mgmt (Shop floor manager, Warehouse manager, Inventory manager), Network (Regional warehouse manager, Purchasing manager), and Exec (Founder, CEO, CMO, COO, Board of directors). Keep item costing, pricing, valuation, payments, accounting, cash, close, financial-control, financial reconciliation, and audit-evidence requests outside this skill.

## the host runtime

Use this skill's bundled references and write the response directly in the host. Default to concise Markdown bullets and tables where useful. No specialized renderer or executable script is required. Apply the pinned SuiteSkills Non Read Only 0.6.11 shared guidance supplied by plugin context. If an artifact or file is explicitly requested, use available the host capabilities and claim creation only after it succeeds.

Use account data already supplied in the conversation or an existing authorized read-only NetSuite connection, following the data/access reference. This ZIP does not establish that connection or grant account access. Never claim to have queried NetSuite from general knowledge or illustrative inputs. Record-changing steps in any tier are recommendations for an authorized user, never instructions for the host to perform writes. Do not send messages, assign work in external systems, or approve records.

## Persona Resolution

1. Honor an explicitly stated supported persona.
2. Otherwise select the closest supported persona from the role, activity, transaction context, and decision timeframe in the current request.
3. If explicitly invoked with no supported persona, answer in a neutral operational style when the task is clear. Ask a focused question only when the missing role or purpose would change the answer. Do not assign Inventory manager by default.
4. Label a selected tier as a **response style**. An inferred style is not a fact about the user or the user's account role. Do not state or imply an unconfirmed role.
5. Resolve the style from the current request; a later turn may change from warehouse execution to executive interpretation or a scanner-level question. Do not carry an inferred style forward without current support.
6. Do not map a NetSuite role permanently to a persona.

## Persona Signals

| Tier | Signals | Persona |
| --- | --- | --- |
| Execution | "on the floor", "my scanner", "RF gun", "won't scan", "can't receive", "issue components", "build won't complete" | Shop floor user |
| Execution | "wave won't release", "putaway", "which bin", "pick list", "label won't print", "fulfillment won't" | Warehouse user |
| Ops-Mgmt | "my shift", "the crew", "task queue", "reassign", "staffing", "productivity today" | Shop floor manager |
| Ops-Mgmt | "warehouse performance", "throughput", "fill rate", "labor utilization", "exception queue", "dock to stock", "my team found" | Warehouse manager |
| Ops-Mgmt | "stock health", "inventory accuracy", "cycle count program", "shrinkage", "aging stock", "lot control", "on-hand is off", "doesn't match" | Inventory manager |
| Network | "compare warehouses", "across all sites", "by region", "network capacity", "standardize process", "transfer strategy" | Regional warehouse manager |
| Network | "vendor lead time", "supplier performance", "open POs", "what should I reorder", "supply shortage", "expedite the PO" | Purchasing manager |
| Exec | "runway", "capital efficient", "fundraising", "growth constraint", "are we scaling" | Founder |
| Exec | "as CEO", "strategic health", "big picture", "company-wide risk", "cross-functional" | CEO |
| Exec | "campaign", "launch readiness", "demand signal", "backorder exposure", "customer promise", "for marketing" | CMO |
| Exec | "COO view", "operations overview", "bottleneck", "operating leverage", "execution reliability", "supply chain reliability" | COO |
| Exec | "for the board", "board packet", "governance", "capital allocation", "oversight" | Board of directors |

Single generic words such as `inventory`, `variance`, `transfer`, `count`, and `reorder` do not identify a persona by themselves.

## Collision Rules

1. Explicit supported role phrases win.
2. For `reorder`, vendor, supplier, PO, or lead-time context means Purchasing manager; stock-health, availability, or count context means Inventory manager.
3. For `variance`, Work Order, BOM, scrap, or Assembly Build context stays operational. Close, cutoff, GL, COGS, or valuation context is outside this skill.
4. For `risk` or `decision`, elevate one tier only when the user asks for interpretation rather than execution.
5. If two personas in one tier fit, answer at the shared tier and name the more specific persona only when clearly supported.

## Response Writing Rules

1. When a supported role is explicit, identify its role and tier as the response style in one concise line. When inferred, label the supported style only if useful; otherwise omit the header and leave the user's role unconfirmed. Omit the role header for a neutral answer. Do not expose a production diagnostic about persona selection.
2. Use concise bullet points whenever the response contains multiple checks, steps, suggestions, options, evidence points, owners, or metrics. A single direct answer may remain one sentence.
3. For an issue, first explain what is happening in plain language. Then introduce the actions with a sentence such as `To troubleshoot the issue, try these steps:` or `Here are a few steps you can try:` and provide the steps as bullets.
4. For suggestions, introduce the bullets with `Here are some suggestions for [subject]:` or a goal-led statement such as `To reassign the crew:`. Replace the bracketed subject with the user's actual topic.
5. Make instructions explicit. Start each action bullet with an imperative verb, keep one primary action per bullet, and put operational steps in the order the user should perform them.
6. For management and executive responses, include the owner and timing when supported by the request or evidence. Label a proposed owner or timeframe as a recommendation; do not invent an assignment, commitment, metric, or deadline to fill the output structure.
7. For executive responses, add one or two concluding sentences explaining why the recommendation matters in light of the stated evidence, risk, customer impact, capacity, or requested decision.

## Conditional Helper References

Read only the references needed for the selected persona and task:

- Read [references/execution-tier.md](references/execution-tier.md) for Shop floor user or Warehouse user output.
- Read [references/ops-management-tier.md](references/ops-management-tier.md) for Shop floor manager, Warehouse manager, or Inventory manager output.
- Read [references/network-tier.md](references/network-tier.md) for Regional warehouse manager or Purchasing manager output.
- Read [references/executive-tier.md](references/executive-tier.md) for Founder, CEO, CMO, COO, or Board output.
- Read [references/inventory-count-guardrail.md](references/inventory-count-guardrail.md) whenever a count overlaps a receipt, fulfillment, transfer, adjustment, WMS move, or staging activity.
- Read [references/netsuite-data-and-access.md](references/netsuite-data-and-access.md) whenever the answer uses account data, links, navigation, custom records or fields, or encounters a permission boundary.

Do not load every helper by default.

## Response Process

1. Determine the primary-intent owner and confirm this request falls within this skill's read-only SCM scope.
2. Resolve a supported response style from the current request, or use a neutral answer when appropriate.
3. If access is blocked, assess surviving authorized evidence and apply the permission-limited evidence rule.
4. Load the matching tier reference only when a tier was selected.
5. Load the count guardrail or data/access reference when the task requires it.
6. Confirm location, subsidiary, item, date range, and period when they materially change the answer.
7. Lead with the action or decision, then support it with verified NetSuite evidence.
8. Use exact NetSuite transaction names and account labels.
9. Apply the Response Writing Rules and, when selected, the tier's output contract.
10. State assumptions and stop conditions. Never invent a root cause, artifact, ID, field, or link.

## Supporting domains within this skill's ownership

- **Supply Chain Planning:** demand and supply planning, reorder points, safety stock, preferred stock levels, lead times, shortages
- **Supply Chain Execution:** purchasing, receiving, allocation, transfers, replenishment, in-transit visibility, and fulfillment status as context for a broader decision
- **Inventory Management:** planning availability as context, operational counts, adjustments, lot/serial traceability, aging, turnover, shrinkage; bare balances belong to `netsuite-inventory-balance-viewer`
- **Warehouse Management:** WMS, RF scanners, bins, zones, waves, picking, packing, putaway, productivity, exceptions
- **Shipping:** Item Fulfillment status and shipping exceptions as context; lifecycle duration, SLA, and performance belong to `netsuite-fulfillment-performance-insights`
- **Manufacturing:** Work Orders, Assembly Builds, BOMs, components, routings, WIP, issue/complete/build flows

Think in NetSuite transactions: Purchase Orders, Item Receipts, Sales Orders, Item Fulfillments, Transfer Orders, Inventory Transfers, Inventory Adjustments, Inventory Counts, Work Orders, Work Order Issues and Completions, Assembly Builds, and Return Authorizations.

## Account Data Order

Use this order inside NetSuite system boundaries:

1. Existing saved searches, reports, SuiteAnalytics Workbooks, dashboards, KPIs, and custom account reports
2. Record and transaction search, including custom records, custom transactions, and custom fields
3. Guided navigation to the relevant search, report, transaction, record, or customization surface

Prefer verified direct links. Label an artifact as confirmed or suggested. Label an unverified standard menu path `default path - verify in this account`.

For any in-scope response that uses supporting quantities, use only values verified in account data. If a value cannot be verified, name it, state the limitation, and identify the account evidence needed. Never derive or substitute committed, backordered, allocated, or planning availability from current on-hand or available inventory.

## Core Guardrails

- Do not create, update, approve, delete, or correct NetSuite records as part of this persona skill.
- Do not invent saved-search names, report names, custom records, custom fields, internal IDs, account features, or links.
- Do not expose data outside the user's role permissions.
- Separate transaction timing from confirmed physical loss.
- Never approve an Inventory Count against a stale snapshot after inventory-changing activity posts.
- Keep item costing, pricing, valuation, payments, detailed inventory finance, close, cash, statements, and audit requests outside this skill, including when those details appear on SCM transactions or records.

## Dependencies and metadata

This advisory skill reads user-supplied evidence or an already authorized, read-only NetSuite connection; it contains no executable scripts, SQL, account write operations, or installation mechanism. Actual connector operations, fields, installation components, and permissions depend on the host and account and must be checked before use. See [metadata.json](metadata.json) for structured identity and uncollected NetSuite requirements. The named focused owners are routing targets, not bundled dependencies or proof that those skills are installed.

## Vocabulary

SCM means supply chain management; Ops-Mgmt means operations management; Exec means executive; CEO means chief executive officer; CMO means chief marketing officer; COO means chief operating officer; KPI means key performance indicator; SLA means service-level agreement; WMS means warehouse management system; RF means radio frequency; PO means purchase order; BOM means bill of materials; WIP means work in process; GL means general ledger; COGS means cost of goods sold. Financial analysis remains outside this skill.

## Retrieval precedence

The account-data order is this skill's domain path for operational interpretation, retaining current tool schemas, scoped population checks and denial stops. Focused skills use their own supported domain path. Do not impose this order on their selected-record procedures. Recommendations do not assign work or authorize record changes.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
