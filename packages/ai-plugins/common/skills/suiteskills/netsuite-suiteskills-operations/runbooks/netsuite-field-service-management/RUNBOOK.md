---
name: netsuite-field-service-management
description: "Explain and review customer-account Field Service Management (FSM), or perform supported authorized changes to service work, schedules, time, materials, configuration and service reports. Prepare report templates and companion drafts. Internal administration and synchronization-monitor diagnostics are unavailable; verify actual account and rendering capabilities."
metadata:
  owner: "Oracle NetSuite"
  version: "1.0.0"
  source-version: "unknown"
  integration-version: "0.8.1"
  runbook-id: RB-OPS-014
  category: operations
  access-mode: operation_dependent
---

Before tool use, load and apply [category SafeWords](../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Field Service Management

Use the product knowledge to understand FSM and the procedures to help with the requested work. For reusable assistance tailored to a customer's practices, use the companion-skill recipe. General explanations and planning from supplied evidence do not require a connected account.

Use the connected NetSuite MCP tools for live account reads and changes. Establish the installed FSM release and applicability of the supplied reference snapshot before relying on version-dependent defaults or effects. If version or effective behavior is unresolved, qualify analysis and stop only the change that depends on it. When a workflow depends on configuration, check the account's effective settings. Product defaults and field definitions alone do not show which behavior is enabled.

Use MCP for account checks and changes. Do not open or automate the NetSuite UI as part of this skill. If a material check requires the UI, exhaust the available MCP evidence, then ask the user for a sanitized observation of the relevant result.

## Scope and unavailable diagnostics

This version supplies customer-account workflows and client package definitions. Internal administration and synchronization-monitor diagnostics are not included, and no supported customer-safe replacement source is supplied.

For a request to inspect a synchronization monitor, diagnose its health or reset it, state that this diagnostic path is unavailable. Do not infer monitor status, synchronization health or cause from stored configuration, missing records, a successful record read or the client dictionary. Do not invent diagnostic identifiers, substitute a generic record update for a reset, or enable diagnostics to fill the gap.

Continue independently supported customer work, including selected-record reads and stored configuration checks, within the requested scope. A missing diagnostic path does not block those checks. Report their observed facts separately from the unavailable monitor result. A sanitized observation may inform a qualified explanation; it does not create a supported monitor procedure or authorize a change.

## Unsupported or ineffective configuration

If task evidence shows that configuration or setup is unsupported, outdated or ineffective, use the [configuration advice](references/configuration.md#correct-unsupported-or-ineffective-configuration) to explain the effect and recommend a supported correction.

## Start from the request

An explanation, inspection, analysis or draft request authorizes its supported reads and local preparation. A sufficiently scoped initial instruction to apply a change is valid authorization under the pinned action contract once its business prerequisites and exact effect are established.

Use an existing explicit authorization for the exact supported change; ask only for missing scope, a changed revision, a material business decision or an actual host approval. Publication and activation remain separate effects and must each be covered. Continuing or delegating the same task does not reset valid authorization.

- For an explanation of FSM or how to perform a task, read the relevant product knowledge and procedure. A general explanation does not need account checks.
- To find, inspect, compare or report account information, follow the relevant procedure.
- To recommend or plan work, use the relevant knowledge and recipes. Explain assumptions and consequential gaps. A proposal does not change records.
- To apply a named change when authorized, use its supported change procedure within the user's existing authorization.
- To create or tailor a reusable FSM skill, use [tailor an FSM skill](workflows/tailor-fsm-skill.md). Adapting today's work to customer priorities is an operational request; it does not start a skill-authoring interview.
- When a request combines outcomes, address each and load only the references needed for those outcomes.

Use customer practices already supplied by the user or an active companion skill. Companions assume `netsuite-field-service-management` is available in the same host and refer to its entry point and relevant references for shared FSM knowledge. When a companion loads this skill, continue the underlying FSM task with those practices without starting skill authoring. Do not automatically search for, select or invoke companions.

| Topic or request | Product knowledge | Practical help |
| --- | --- | --- |
| What FSM is; concepts and relationships | [Data model](references/data-model.md) | Use the topic below for the requested work. |
| Cases, Tasks and Projects; creation and queued links | [Work management](references/work-management.md), [recurrence and programs](references/recurrence-and-programs.md) | [Find work](workflows/work-records.md#find-and-summarize-work), [update details](workflows/work-records.md#update-case-or-task-details), [review Project or Case work](workflows/work-records.md#review-project-and-case-work) |
| Saved searches, analytical reports and profitability | [Financial reporting](references/financial-reporting.md) and the reference for the reported business data | [Run an existing search or report](workflows/work-records.md#run-an-existing-search-or-report) |
| Assets, creation and service history | [Assets](references/assets.md) | [Find service history](workflows/service-work.md#find-asset-service-history) |
| Scheduling and resources | [Scheduling and Schedule Board](references/scheduling.md) | [Review work](workflows/scheduling.md#review-work-to-schedule), [find skills](workflows/scheduling.md#find-people-with-relevant-skills), [check availability](workflows/scheduling.md#check-availability-and-fit), [propose or revise a schedule](workflows/scheduling.md#build-or-revise-a-proposed-schedule), [apply a change](workflows/scheduling.md#apply-an-authorized-scheduling-change) |
| Mobile and completion | [Mobile](references/mobile.md), [completion and closure](references/work-management.md#completion-and-closure) | [Review outcomes](workflows/service-work.md#review-completion-and-outcomes), [configure a custom record in Mobile](workflows/custom-record-mobile.md#choose-the-requested-change), [diagnose an existing resource](workflows/custom-record-mobile.md#diagnose-an-existing-resource) |
| Time and labour | [Time](references/time.md), [labour posting](references/financial-reporting.md#time-and-labour-cost) | [Reconcile or record time](workflows/service-work.md#reconcile-or-record-service-time) |
| Materials, billing and profitability | [Materials and inventory](references/materials-and-inventory.md), [billing](references/billing.md), [financial reporting](references/financial-reporting.md) | [Reconcile consumables and billing](workflows/service-work.md#reconcile-consumables-and-billing) |
| Configuration, access and performance | [Configuration](references/configuration.md), [detailed configuration index](references/configuration-index.md) | [Review configuration evidence](workflows/configuration.md#review-configuration-evidence), [prepare an authorized change](workflows/configuration.md#prepare-an-authorized-change) |
| Service-report templates, rebranding and PDF/SSRS/HTML/image conversion | [Report data and fields](references/service-reports/account-discovery.md), [Mobile content](references/service-reports/mobile-tabs.md), [source conversion](references/service-reports/source-conversion.md), [XML, FreeMarker and BFO](references/service-reports/netsuite-xml-bfo.md) | [Build or revise a preview](workflows/service-reports/template.md#draft-or-revise-an-html-preview), [prepare XML](workflows/service-reports/template.md#prepare-xml-from-an-accepted-design), [edit existing XML](workflows/service-reports/template.md#edit-existing-xml), [publish or activate](workflows/service-reports/publication.md). See [report access and workflow boundaries](workflows/service-reports/index.md). |
| Reusable customer assistance | The product references for the selected FSM topics | [Tailor an FSM skill](workflows/tailor-fsm-skill.md) |

For specific record and field identifiers, follow the [dictionary guide](references/dictionary-guide.md#targeted-lookup) to the relevant entries in the [data dictionary](references/data-dictionary.json). Do not load the whole dictionary for a general question.

## Plugin foundation

Apply [plugin context](../../SKILL.md) and the pinned shared baseline, retrieval and action contracts before using this procedure. Current supported interfaces, access boundaries, complete scoped evidence and business validation remain required.

## Vocabulary

FSM means Field Service Management; CRM means Customer Relationship Management; MCP means Model Context Protocol; API means application programming interface; UI means user interface; PWA means progressive web application; WFM means workforce management; GL means general ledger; P&L means profit and loss; SDF means SuiteCloud Development Framework; SSRS means SQL Server Reporting Services; RDL means Report Definition Language; BFO means Big Faceless Organization, the PDF renderer; PDF means Portable Document Format; XML means Extensible Markup Language; HTML means Hypertext Markup Language; CSS means Cascading Style Sheets; JS means JavaScript; JSON means JavaScript Object Notation; SQL means Structured Query Language; IANA means Internet Assigned Numbers Authority; GMT means Greenwich Mean Time; SLA means service-level agreement; SHA-256 is the 256-bit Secure Hash Algorithm. Technical identifiers preserve their exact interface spelling.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
