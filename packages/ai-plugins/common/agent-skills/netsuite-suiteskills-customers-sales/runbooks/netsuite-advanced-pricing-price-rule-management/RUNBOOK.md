---
name: netsuite-advanced-pricing-price-rule-management
description: "Review Advanced Pricing Price Rule applicability and prepare a new-rule or change proposal from read-only evidence. Use for rule dates, Price Level, customer-group, and item-collection scope; exclude record changes, item-price updates, and pricing-exception approval."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.0"
  source-version: "unknown"
  integration-version: "0.7.4"
  runbook-id: RB-CRM-002
  category: customers-sales
  access-mode: read_only
---

# Advanced Pricing Price Rule Review

## Plugin foundation and scope

Apply [shared guidance](../../shared/README.md) and [category context](../../SKILL.md). This skill retains its submitted read-only review and chat-proposal scope; the target edition does not add a write procedure.

## Record links and applicability

When an answer identifies an accessible NetSuite record, read [NetSuite record links](references/record-links.md). Link its human-readable label only when the current account, record type, and ID support a reliable view URL.

Read [Session context and applicability](references/session-context.md) before a dependency-sensitive request. This skill requires `ADVANCEDPRICING`; Price Rule and Price Level visibility still depends on the current role. Feature or read access does not authorize a write.

This skill serves authorized users at organizations that use NetSuite. It reviews existing Price Rules and prepares a proposed change in chat. Use authorized native NetSuite AI Connector read tools only. Never claim a rule, prerequisite, or item price was changed or guide its execution.

## Sources and evidence

Use literal Connector record types rather than deriving them from UI labels. Validate fields and associations in the connected account. This package has no generic Price Rule SuiteQL source; use a focused read for a selected record, a suitable saved search for a bounded related set, or report the access limitation.

| Purpose | Connector `recordType` | SuiteQL source |
| --- | --- | --- |
| Existing Price Rule | `salespricerule` | No generic source defined in this package. |
| Existing item collection in rule scope | `itemcollection` | No generic source defined in this package. |

For a material customer-identity or display-label lookup, read [Reusable SuiteQL evidence patterns](references/reusable-suiteql-evidence.md) only when its source and grain fit. It does not define a Price Rule source.

## Scope and routing

Review the selected Rule's current price level, effective dates, inactive state, description, and customer/customer-group and item/item-collection associations. A linked Price Level or static group/collection can affect the Rule's reach; distinguish the Rule's own fields from shared prerequisite records. Verify other Rule references when discussing the impact of a shared Price Level. Do not assume a missing relationship result proves no other Rule uses it.

For a requested new Rule or modification, collect only the proposed name, level, dates, active state, and customer/item scope needed to describe it. Present **Markup/Discount** and **Cost+** as distinct Price Level methods when relevant; do not infer a method, cost basis, percentage, or the optional **Update Prices for Items Using This Price Level** choice. That option can affect item prices if applied, so flag its possible scope and unknown downstream amounts without selecting or executing it. Treat dynamic groups, collections, and saved-search-backed scopes as unresolved prerequisites. Pricing Groups are outside this skill's Price Rule associations.

Read [Price Rule review workflow](references/price-rule-review-workflow.md) for the focused evidence and proposal steps. Route existing-transaction price explanations, customer-item price questions, or pricing discrepancies to **NetSuite Pricing Policy and Exception Review**. Standalone Price Level or group administration is outside this skill.

## Delivery

Lead with the verified current state or the proposed change. Separate existing values, user-requested values, and unverified prerequisites. For a modification, show `current -> proposed` only for supported, selected fields or associations; flag shared Price Level impact and material coverage limits. Give the reviewer the exact evidence and unresolved decisions. Do not request confirmation to execute, call a write tool, promise the resulting price, or report the proposal as saved. Do not make a commercial commitment or approve a discount.

## Retrieval and interface safeguards

Follow the applicable domain source path in this skill and its loaded references; uncovered branches inherit [shared retrieval](../../shared/contracts/RETRIEVAL.md). Inspect current callable schemas before using a named tool. Record metadata does not establish SuiteQL fields or joins. Queries require current applicable query metadata, safe typed values, stable unique ordering when paging, explicit supported page size/index, and truthful scope. A denial stops the affected path; missing metadata does not authorize a trial query. Reuse verified metadata only within unchanged account, role, connection and scope.

Named neighboring skills are routes only when actually available in the selected plugin. Otherwise retain the verified evidence and identify the unavailable capability without claiming a handoff executed.

## Pricing terminology

Price Level identifies a configured pricing method or price basis. Cost+ means cost-plus pricing; verify the selected cost basis and method inputs before describing a proposal. A proposed scope is an intended change, not verified future applicability or a promised transaction price.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
