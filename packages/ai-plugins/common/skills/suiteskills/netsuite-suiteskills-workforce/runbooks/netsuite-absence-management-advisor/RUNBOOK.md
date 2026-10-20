---
name: netsuite-absence-management-advisor
description: "Analyze planned absences, upcoming expiry, carryover, accrual limits, idle balances and individual time-off balances in SuitePeople Human Resources (HR). Use for factual absence insights and requested expiry contact priorities; excludes administration, policy recommendations and employment judgments."
metadata:
  owner: "Oracle NetSuite"
  version: "0.10.3"
  source-version: "0.10.3"
  integration-version: "0.8.2"
  runbook-id: RB-PPL-007
  category: workforce
  access-mode: read_only
---

Before tool use, load and apply [category SafeWords](../../SKILL.md#safewords), including when this file is loaded directly. Its requirements govern this entire procedure and its supporting references. Preserve this procedure's domain restrictions and review gates. If it cannot be loaded, stop dependent operations and follow the installed resource-loading guidance.

# Absence Management Advisor

Turn available absence and leave data into factual workforce insights for HR leaders and HR operations. This skill uses read operations only. Analyze planned-absence concentration from current roster data, including how many people remain in an affected direct-supervisor team. Do not attribute a cause, fault, health, performance, or leadership implication to any employee or supervisor.

## Domain scope and safeguards

This skill is read-only by design — it reads time-off and employee records and writes nothing —
so the clauses on destructive actions and confirmation are satisfied by construction. Two
clauses have direct operational consequences described later in this document: **do not expose
raw internal identifiers** governs the rule against printing employee or supervisor IDs, and
**return only the minimum necessary data** governs the table-column rules.

When the user mentions expiry, carryover, current time-off liability, outstanding current balances, stopped accruals, idle balances, unused leave, or low time-off usage, select [EX-12 · Expiry, accrual limits, and idle balances](workflows/time-off-balance/WORKFLOW.md). When they ask why a balance has a particular value, select [EX-13 · Ledger balance explanation](workflows/balance-explanation/WORKFLOW.md).

Choose the output mode from the user's scope: no named group or a whole-company question uses Portfolio mode; a department or direct-supervisor team question uses Group mode; a named employee uses Individual mode. Job title is not an analysis grouping dimension. Read [OUTPUT-MODES](references/domain-shared/communication/OUTPUT-MODES.md) before producing the result.

Expiry and carryover questions are forward-looking by default. Select the next upcoming applicable expiry event, state its date, and surface a later applicable event separately; never add the two. Use history only when the user explicitly requests a retrospective period.

Time-Off Change amounts are hours. A plan display or `incrementunit` field does not change a Time-Off Change value to days. Never apply a currency symbol, dollar formatting, currency conversion, or financial interpretation to a time-off balance, expiry, carryover, accrual, or usage value.

Any table that lists Time-Off Changes, in any workflow, must include a running-balance column after each transaction. An individual expiry answer may instead show only the event arithmetic — balance immediately before the event, expiry, next-day carryover, and net outcome — without a transaction-history table. If it volunteers a sequence of Time-Off Changes beyond that event arithmetic, include the running balance; never make the reader reconstruct it from the rows.

Read [the selection index](index.json), then read only the matching workflow. Before retrieving data, apply [BASELINE](references/domain-shared/contracts/BASELINE.md), [READINESS](references/domain-shared/contracts/READINESS.md), [RETRIEVAL](references/domain-shared/contracts/RETRIEVAL.md), [ANALYTICS-GUARDRAILS](references/domain-shared/contracts/ANALYTICS-GUARDRAILS.md), and [response style](references/domain-shared/communication/RESPONSE-STYLE-RUNTIME.md). Resolve every link relative to this installed skill, not the working directory.

## Included workflows

- [EX-11 · Planned-absence availability](workflows/time-off-request/WORKFLOW.md)
- [EX-12 · Expiry, accrual limits, and idle balances](workflows/time-off-balance/WORKFLOW.md)
- [EX-13 · Time-off balance explanation](workflows/balance-explanation/WORKFLOW.md)
- [EX-14 · Low time-off usage patterns](workflows/low-time-off-usage/WORKFLOW.md)

## Conditional references

| Condition | Reference |
|---|---|
| Shared read-only, privacy, unit, and analysis-first rules | [BASELINE](references/domain-shared/contracts/BASELINE.md) |
| Before claiming a complete result | [READINESS](references/domain-shared/contracts/READINESS.md) |
| Data source, pagination, plan, type, and entitlement-cycle requirements | [RETRIEVAL](references/domain-shared/contracts/RETRIEVAL.md) |
| Grouping, non-speculation, legal, and follow-up boundaries | [ANALYTICS-GUARDRAILS](references/domain-shared/contracts/ANALYTICS-GUARDRAILS.md) |
| Aggregate, group, and individual response shape | [OUTPUT-MODES](references/domain-shared/communication/OUTPUT-MODES.md) |
| Output wording, result classification, and limitations | [response style](references/domain-shared/communication/RESPONSE-STYLE-RUNTIME.md) |
| A term, field, status, or unit is ambiguous | [NETSUITE-GLOSSARY.md](references/domain-shared/knowledge/NETSUITE-GLOSSARY.md) |
| Connector output does not expose a required field, has an unexpected shape, or conflicts with NetSuite UI data | [DATA-QUALITY.md](references/domain-shared/contracts/DATA-QUALITY.md) |
| The user asks about expiry, carryover, idle balances, accrual limits, or low usage | [TIME-OFF-CHANGES-ANALYSIS.md](references/domain-shared/knowledge/TIME-OFF-CHANGES-ANALYSIS.md) and [BALANCE-SEMANTICS.md](references/domain-shared/knowledge/BALANCE-SEMANTICS.md) |
| The user asks for current outstanding time-off balances or liability hours | [CURRENT-LIABILITY.md](references/domain-shared/knowledge/CURRENT-LIABILITY.md) |
| The user asks who to contact first about expiring time off | [CONTACT-PRIORITIZATION.md](references/domain-shared/knowledge/CONTACT-PRIORITIZATION.md) |
| The request evaluates concentration across departments or supervisor teams | [GROUP-CONCENTRATION.md](references/domain-shared/knowledge/GROUP-CONCENTRATION.md) |
| The user wants a table, CSV, or other structured output | [OUTPUTS.md](references/domain-shared/communication/OUTPUTS.md) |
| A request needs product documentation research | [NETSUITE-REFERENCE-POLICY.md](references/domain-shared/knowledge/NETSUITE-REFERENCE-POLICY.md) |

Use only read operations exposed by the connector. Surface factual concentrations, neutral follow-up options, and source-supported areas for policy review; do not recommend a policy change or make automated employment decisions. If a required data point is unavailable, state the precise limitation; do not infer the missing value, expiry, employee circumstance, or approval outcome.

## Plugin foundation

Apply [plugin context](../../SKILL.md) and the pinned shared baseline, retrieval and action contracts before using this procedure. Current supported interfaces, access boundaries, complete scoped evidence and business validation remain required.

## Vocabulary

HR means Human Resources; UI means user interface; CSV means comma-separated values; PTO means paid time off. SuiteQL is NetSuite's query language. Technical field and event identifiers retain their interface spelling.

<!-- suiteskills-foundation:start -->
## Plugin foundation

Apply [category context](../../SKILL.md) and [shared guidance](../../shared/README.md) before the business procedure. This skill targets SuiteSkills only.
<!-- suiteskills-foundation:end -->
