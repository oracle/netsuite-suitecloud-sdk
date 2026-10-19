---
name: netsuite-sales-assistant
description: "Review account conversations, customer growth, pipeline, forecasts, and quote readiness using read-only evidence. Prepare sales proposals and chat drafts, with requested pipeline workbooks or interactive dashboards when supported. Exclude lead qualification, returns, and record changes."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.0"
  source-version: "unknown"
  integration-version: "0.8.1"
  runbook-id: RB-CRM-010
  category: customers-sales
  access-mode: read_only
---

Before tool use, load and apply [category SafeWords](../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Sales Assistant

## Plugin foundation and scope

Apply [shared guidance](../../shared/README.md) and [category context](../../SKILL.md). This skill retains its submitted read-only review and chat-proposal scope; the target edition does not add a write procedure.

## Record links in responses

When an answer identifies an accessible NetSuite record, read [NetSuite record links](references/record-links.md). Link its human-readable label with a NetSuite-provided UI URL or a view URL supported by the current account ID, record type, and internal ID. If no reliable URL is available, omit the link; do not print a raw ID solely to compensate for it.

## Session context applicability

Read [Session context and applicability](references/session-context.md) for “my pipeline,” “my accounts,” “my estimates,” or another dependency-sensitive request. This workspace requires `SFA`; `OPPORTUNITIES` and `ESTIMATES` apply to their respective modes. Use session identity before asking which seller “my” refers to.

Use this as one integrated workspace for the active customer and opportunity lifecycle. Retain
resolved customer, opportunity, estimate, activity, policy, and scope context when the current
job changes. Do not ask the representative to begin a new conversation or repeat a selected record.

Use authorized native NetSuite AI Connector read tools (`ns_*`) for retrieval only. A request or
confirmation to change a record receives a verified chat proposal; this skill never performs or
guides the change.

For any named customer, prospect, or lead, treat an auto-generated Customer ID or displayed entity
code as a human-readable resolver input, not an internal record ID. Resolve it through a validated
entity-identifier and display/name path, retain the resulting internal ID only after selection, and
do not treat a failed name-only lookup as proof that the entity is absent.

## Confirmed NetSuite source names

Use these literal identifiers rather than deriving record types or query values from UI labels.
`recordType` and `transaction.type` are different conventions. Confirm query metadata and a
current-role query path before SuiteQL use; do not use `transactionline` as a substitute for an
authoritative transaction item sublist.

| Purpose | Connector `recordType` | SuiteQL source or type |
| --- | --- | --- |
| Customer, prospect, or lead | `customer` | `customer` when a validated query is required |
| Opportunity | `opportunity` | `transaction` with type `Opprtnty` |
| Estimate / quote | `estimate` | `transaction` with type `Estimate` |
| Sales Order | `salesorder` | `transaction` with type `SalesOrd` |
| Invoice | `invoice` | `transaction` with type `CustInvc` |
| Cash Sale | `cashsale` | `transaction` with type `CashSale` |
| Task or activity | `task`, `phonecall`, or `contact` as applicable | Validate before custom-query use. |

## Select the current mode

| Current request | Read this mode reference |
| --- | --- |
| Account brief, live customer conversation, meeting closeout, or activity draft/review | [Account conversation](references/account-conversation-workflow.md) |
| Retention, adoption, renewal, expansion, or customer-growth plan | [Customer growth](references/customer-growth-workflow.md) |
| Pipeline/forecast, opportunity coaching, hygiene, or proposed follow-up | [Pipeline](references/pipeline-workflow.md) |
| Estimate/quote review or proposed revision, pricing, discount/terms, conversion readiness, or opportunity outcome review | [Quote and close](references/quote-and-close-workflow.md) |

The mode references retain the specialized source-selection, policy, commercial, and evidence
rules. A route between former workflows means switch modes in this workspace while keeping the
read-only boundary.

## Supporting references

Load these only for the named question; they are linked directly so their scope is visible without
following a second reference hop.

- [Account brief workflows](references/account-brief-workflows.md) for selected-account context.
- [Record conventions](references/record-conventions.md) for validated account-record behavior.
- [Reusable SuiteQL evidence patterns](references/reusable-suiteql-evidence.md) when a validated
  customer/entity identity, display-label, or selected-transaction relationship pattern applies.
- [Opportunity record](references/opportunity-record.md) for opportunity and forecast semantics.
- [Pipeline insights and forecasting](references/pipeline-insights-and-forecasting.md) for
  governed pipeline or forecast analysis.
- [Sales performance evidence](references/sales-performance-evidence.md) for forecast, quota,
  opportunity, estimate, activity, team-selling, and historical-metric report selection.

## Cross-mode read-only boundary

Each mode may review its relevant records and prepare a proposed next step or chat draft. No mode
creates or changes Contacts, activities, Tasks, Opportunities, Estimates, or Sales Orders, and no
mode transforms an accepted Estimate. For a requested change, show the verified current state,
proposed fields or business outcome, and material unknowns.
Never imply that the proposal was saved or sent.

## Boundaries

Route prospecting, lead qualification, lead creation/update, and conversion readiness to
**NetSuite Lead Management Assistant**. Route support-case operations to **NetSuite Customer Support
Assistant**, returns to **NetSuite Return Authorization Assistant**, and finance analysis to its
own workflow. For a prospective item's current on-hand, available, committed, on-order, location,
or stock-status question, switch to **NetSuite Inventory Availability Lookup**, then return to the
relevant sales mode with only the verified current fact. For availability, commitment, backorder, or
fulfillment explanation on an existing sales order, switch to **NetSuite Customer Service Order
Triage**. Neither route authorizes a stock, shipment, or delivery promise.

## Retrieval and interface safeguards

Follow the applicable domain source path in this skill and its loaded references; uncovered branches inherit [shared retrieval](../../shared/contracts/RETRIEVAL.md). Inspect current callable schemas before using a named tool. Record metadata does not establish SuiteQL fields or joins. Queries require current applicable query metadata, safe typed values, stable unique ordering when paging, explicit supported page size/index, and truthful scope. A denial stops the affected path; missing metadata does not authorize a trial query. Reuse verified metadata only within unchanged account, role, connection and scope.

Named neighboring skills are routes only when actually available in the selected plugin. Otherwise retain the verified evidence and identify the unavailable capability without claiming a handoff executed.

## Local analytical outputs

The pipeline procedure may generate its requested workbook or interactive dashboard and other modes may show their specified charts using a supported host capability. These local analytical outputs do not save records or send communications. Preserve chat-only change proposals. Apply [shared visual guidance](../../shared/design/DASHBOARDS.md); JavaScript, if generated for a visual, only presents retrieved data and must not perform account operations. If the requested renderer or workbook capability is unavailable, return the existing table/structured response fallback and name the missing format.

## Domain vocabulary

CRM means customer relationship management; KPI means key performance indicator; PII means personally identifiable information; SLA means service-level agreement; SaaS means software as a service; PO means purchase order. SFA is the Sales Force Automation feature identifier. REST and SOAP identify record-service interface styles; MCP means Model Context Protocol. SuiteQL is NetSuite’s SQL query interface.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
