# NetSuite Support Platform Behavior

Use this reference for generic NetSuite support behavior. Confirm the relevant feature,
preference, custom form, record relationship, and invoking user's access in the connected
account before describing it as available or applying it to a specific case.

## Contents

- [Case population and queue sources](#case-population-and-queue-sources)
- [Triage and performance](#triage-and-performance)
- [Lifecycle, assignment, and escalation](#lifecycle-assignment-and-escalation)
- [Customer communication and knowledge](#customer-communication-and-knowledge)
- [Issue management](#issue-management)
- [Conceptual record map](#conceptual-record-map)

## Case population and queue sources

- Cases can originate from a support rep, online form, inbound email, Customer Center, or
  external case page. Case profiles and Email Case Capture can affect routing and communication
  identity. Do not assume an origin, profile, sender, or notification template from the case
  alone.
- Help Desk cases are internal cases. They can participate in assignment rules but are excluded
  from standard case reports. Establish whether a queue request includes customer support,
  Help Desk, or both before choosing a report or summarizing a population.
- For a defined operational queue, use the relevant accessible case saved search. For governed
  portfolio measures, prefer standard support reports. Do not reconstruct either from raw
  records when it is available.
- When a metadata-confirmed list or reference field needs a label in SuiteQL, use
  `BUILTIN.DF(field)` on the queried record where the connected account supports it; do not assume
  the labels live in a separately queryable lookup table. Prefer known internal values for filters
  and use the display function as a filter only when metadata establishes that as the viable path.
- For a case's assignee or other accessible reference, confirm the field path and resolve its
  display value directly on the `supportcase` row where supported. Do not enumerate a general
  Employee/Entity roster just to translate an ID. If a direct display value is unavailable, report
  the verified ID as an unresolved reference rather than guessing a person's name.
- For a customer name associated with `supportcase.company`, first confirm the relationship and
  field path available in the connected account. When the `customer` join and `altname` are
  available, use `customer.altname` as the display value: it covers both organization and
  individual customers. Do not treat `BUILTIN.DF(supportcase.company)`, a raw entity ID, or
  `customer.companyname` as a universal customer-display name; for an individual, `companyname`
  can be the person's employer. If no verified display path is available, omit the name and state
  that the customer label could not be resolved rather than presenting an ID as a name.

## Triage and performance

- Case priorities, types, origins, support issues, and support items are configurable. Resolve
  their current labels and the company's definitions; do not infer their order or business
  meaning from a label.
- When accessible through the Metrics subtab or a Case saved search, NetSuite provides metrics
  such as time elapsed/open/on hold, time to assign/close, initial response time, first update,
  first reply, reopening, and last-message timing. Use their documented meaning as configured;
  do not recreate an SLA measurement from timestamps or count automatic notifications as a
  first response.
- Case Alerts is documented as a beta feature. Do not depend on it, claim it is enabled, or
  generate alerts; it can be mentioned only when accessible account configuration verifies it.
- A duplicate-looking case is a review signal, not authorization to merge. Do not recommend a
  merge without a human review of customer identity, data retention, and access implications.

## Lifecycle, assignment, and escalation

- Assignment, grabbing, and escalation are separate operations. A manual escalation changes the
  case to Escalated and sends a private internal message; it does not itself raise priority or
  change the assignee. Its recipient can be an employee, group, vendor, or partner unless an
  account preference restricts the eligible population. For a group, notification can go to the
  group's configured email address rather than every member. Verify recipient eligibility and
  notification expectations from current account configuration or company guidance; do not infer
  them from a mapped recipient alone.
- Automated escalation rules and assignments are configuration-dependent. When the Automated
  Case Escalation feature is verified, NetSuite documents a five-minute processing cadence; do
  not interpret a short delay, a matching condition, or a status alone as proof that a rule did or
  did not run. Verify accessible rule/assignment evidence and the resulting case facts separately.
- Customer replies can reopen a closed case when the relevant preference is enabled, and a
  reopened case may return to the last replying support rep. Closed cases can also be locked
  after an account-configured period, limiting who can reopen or edit them. Do not predict either
  behavior without accessible policy/configuration evidence.

## Customer communication and knowledge

- Separate customer-facing and Internal Only content. Escalation messages are private; do not
  include them in a customer draft or expose them in routine output.
- A response may use a case profile address or an employee address, and may have extra
  recipients/attachments. Drafts must identify an unknown sender, recipient, or attachment as a
  review check rather than guessing it.
- Knowledge solutions may be attached to cases, but approval, active status, Display Online,
  topic publication, and audience can affect availability or visibility. Treat a proposed
  solution as a reviewer draft until accessible records verify its required state. New or updated
  solutions may not be searchable until the next indexing cycle.

## Issue management

Issues are internal records distinct from customer-facing cases. Issue Management availability,
roles, statuses, types, severity, priority, reproducibility, products/modules, and status
transitions are account-configured. Confirm feature and permission availability before using an
issue relationship or making a Product/Engineering recommendation.

A Case Issue (`supportCaseIssue`) is a separate case-classification record from an Issue
Management defect/issue. When the accessible `supportcase.issue` field is empty, it establishes
only that no Case Issue is selected on that accessible case; it does not establish that Issue
Management is unavailable or that no related defect exists. Conversely, a selected Case Issue is
not proof of a linked defect, root cause, or Product/Engineering investigation.

Metadata/catalog results can be inconsistent with REST Query exposure for a record type. A
metadata 404, a missing catalog entry, or an empty REST collection is an access-path limitation,
not proof that a feature is unprovisioned. Before drawing a feature or permission conclusion,
use an independently supported narrow direct record read only when its schema and access are established. Do not retry a denied underlying population through another interface or use a query to discover missing schema. If the scope of a denial is unclear, stop dependent reads until it is resolved.

## Conceptual record map

Use this map only to choose evidence to verify; it is **not** a fixed SuiteQL schema, a list of
guaranteed fields, or proof that a relationship is available in every account.

```text
Customer-facing support
customer ──< support case ──< accessible case messages (may be partial)
                     │
                     ├── assignment / escalation context
                     ├── linked transaction (when used)
                     ├── linked internal issue (when Issue Management is enabled)
                     └── attached knowledge solution (when Knowledge Base is enabled)

Knowledge
knowledge base ──> topic / subtopic ──> solution ──> approval and audience context
```

`supportcase` is the current REST record identifier for a support case, subject to connector
metadata confirmation. The names, availability, and relationships of customer, message, issue,
transaction, knowledge, topic, and solution records must be confirmed in the connected account
before they are queried or presented as facts.
