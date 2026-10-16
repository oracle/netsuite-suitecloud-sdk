# Case Context and Support Insights

Use this reference for a selected-case deep dive, customer-impact review, related-workflow
context, recurring customer concerns, or Support handoff preparation. Confirm all record
types and fields against the connected account before using them. Do not use it for a broad
account or meeting brief.

## Case brief

Interpret a natural request for a selected case's details as a selected-case deep dive. It
includes the baseline case-header and customer-message retrieval below; the support representative does not
need to separately ask for the message history.

Retrieve the smallest accessible set of facts needed to answer the request:

1. Resolve a displayed case number through [Support case record conventions](support-case-record-conventions.md#resolve-a-selected-case), then perform a direct `supportcase` record read. A SuiteQL case-number lookup alone does not replace this read.
2. Read the current accessible case status, priority, issue/category fields, owner, timestamps, requested or reported impact, and message-bearing fields returned by that same direct record. Inspect `incomingMessage` when present before attempting a Message-table lookup.
3. Apply the [message and timing limits](support-case-record-conventions.md#message-and-timing-limits): treat a returned `incomingMessage` as case-record incoming-message content unless its field semantics and case-creation context establish more. Then read and verify each Message ID already exposed by the selected-case read or narrow discovery. For every message-history request, reproduce each accessible body verbatim in a labeled blockquote or separate text section by default; summarize only when the user explicitly asks for a summary or overview. Do not substitute a paraphrase in a table cell. A table may organize metadata only. If a body cannot be displayed, state why rather than silently summarizing it. Do not use SuiteQL to reconstruct a message thread or discover a customer message the connector cannot verify. State that the thread is partial unless an available tool explicitly establishes complete case-message enumeration.
4. Retrieve the linked transaction, item, project, or activity only when the case or the user's question establishes that relationship.
5. Separate the case's reported symptoms from independently verified record facts.

Do not call a case subject the customer's original message. Call a message “original” only
when its verified chronology and the case-creation context establish that it is the initial
customer message; otherwise describe it by its retrieved timestamp and verified field meaning.
Do not name an author from a case contact field, a reply salutation, or another indirect clue;
only a Message record or explicit sender field can establish authorship.

If the available tool path cannot enumerate Message records, state that the original
customer-message body cannot be retrieved or verified and that the accessible case subject
is not a substitute. Likewise, describe a case-header timestamp only as a “last case
message/update” unless a retrieved Message record establishes customer authorship.

Do not expand a routine case brief into a full customer history, all support cases, or a
portfolio review unless the user requests a defined customer case population. Route a broad
account, opportunity, pipeline, quote, or meeting request to the relevant mode in NetSuite Sales Assistant.

## Support handoff preparation

Prepare a concise, internal evidence pack for Support:

- verified case facts and current status;
- affected customer/workflow and known impact;
- relevant timestamps and owners when accessible;
- evidence already checked and the remaining evidence gap; and
- the representative's customer-facing constraint or question; and
- an explicitly labeled next investigation.

Do not include private escalation messages, internal-only notes, attachment contents, or
an unsupported root-cause conclusion. The representative should hand off only the evidence needed
for Support to investigate or make a decision.

Do not call a handoff an escalation, assign a severity, or promise a resolution time unless
the relevant account policy or record explicitly establishes it. Route queue or SLA-risk
questions to Queue and triage mode; assignment, escalation, or lifecycle questions to Lifecycle
and escalation mode; and linked issue/defect investigation through the account's approved Product or Engineering process.

## Related-workflow review

Use the case evidence to select the smallest relevant workflow path. Examples include:

- order, fulfillment, invoice, payment, or return context when the case identifies a transaction;
- item, location, inventory, or shipment context when the case identifies a product or delivery issue;
- customer history when the user asks whether the issue is recurring for that customer; or
- a portfolio report or saved search when the user asks whether an issue is recurring across cases.

Use a report or saved search for broad trends. A few related records can explain one case,
but do not use them to make population-level claims.

## Customer-impact assessment

Build the assessment from an explicit evidence chain:

1. **Symptom:** What did the customer or case record report?
2. **Observed condition:** Which independent record facts support or contradict it?
3. **Scope:** Which customer, transaction, item, location, period, or case population is affected?
4. **Alternative explanations:** What timing difference, configuration, policy, data-quality issue, or missing evidence could explain the condition?
5. **Assessment:** Classify the conclusion accurately and translate it into an appropriate support action.

| Classification | Standard |
| --- | --- |
| `Verified cause` | Direct, independently retrieved evidence establishes the causal condition and no material contradictory evidence remains. |
| `Supported hypothesis` | The evidence is consistent with an explanation, but a causal link, comparison population, or required record remains unverified. |
| `Cause not verified` | The available evidence establishes the symptom or impact but cannot support a causal explanation. |

Correlation, a repeated keyword in notes, a single case, or a record missing from the
current role's results is never sufficient on its own to establish a root cause. Do not
present a root-cause hypothesis to the customer as a confirmed explanation. Default to
`Supported hypothesis` whenever the underlying service diagnosis is unavailable.

## Recurring-issue analysis

Before reporting a trend, state the case population, time window, selection criteria, and
grouping fields. Prefer a standard report or accessible saved search. If a custom view is
necessary, identify it as a custom analytical view and describe its source and logic.

Use terms such as “X matching accessible cases in the stated scope” rather than claiming
an issue is systemic unless the available population supports that conclusion.
