# HR presentation

Use this reference to present checked Benefits answers to HR. Answer the requested question first, then choose the smallest format that carries the answer.

Find guidance on [answer detail](#detail-follows-the-question), [delivery](#delivery-format), [snapshot workspaces](#snapshot-review-workspaces), [evidence and status](#evidence-and-check-outcomes), [money](#money-and-findings), and [downloads](#requested-downloads).

- Use a sentence for one fact or a checked empty result. Use a narrow list or table for requested records, and a table for exact grouped values.
- Use a graph only when it explains returned comparisons. A focused answer needs a requested, useful graph. For dashboard comparisons, follow [dashboard.md](dashboard.md).
- Use readable labels such as Employee, Benefit, Benefit Type, Carrier, Coverage, and Department. Follow [record links and identity](sources.md) for names, links and internal IDs.
- Keep internal route names, SQL aliases, query terms and validation steps out of HR replies and downloads. Describe the checked result in plain HR language, without claiming it passed an automatic validator.
- Follow the requester's style preference when the answer still makes scope, evidence and limits clear.

## Detail follows the question

| Requested answer | Presentation |
| --- | --- |
| Single fact | The returned value with its unit and scope. |
| Which benefits are assigned? | Show the complete distinct Benefit list. Show employee rows only if requested. |
| Which employees or assignments? | Relevant complete work list with identities and requested fields. |
| Coverage overview | Show returned current, assigned and gap counts, percentage and denominator. Add requested organization groups or groups by assignment dimension. |
| Monthly costs | Returned monthly component and recorded figures, differences, currency, and requested groups. Review, employer share and annualization only when requested or necessary to explain an affected amount. |
| Review overview | Show the combined distinct review count for descriptive blanks, blank amounts, fully populated mismatches, and zero or negative monthly costs. Show requested issue and priority counts and explain overlaps. Fetch examples only when useful and label them as examples. |
| Full snapshot | Show coverage, gaps, costs and review summaries. Add a complete work list of assignments needing review and a separate list of employees with no benefit record. Include reasons, evidence and supported next verification actions. Explicit requests for summaries only omit these detail lists. |

For a requested complete list or a broad snapshot's required workspaces, retrieve and present every matching row. There is no fixed preview limit. A checked zero aggregate can establish an empty list when its scope and finding selection match the detail query. You can then skip the detail read.

If the interface cannot fit the complete list, state that limit. Provide a requested export or ask how to deliver the complete list. Label any displayed subset as partial.

Use SQL aggregates without detail reads for focused overviews and snapshots explicitly limited to summaries. A full snapshot retrieves flagged assignments and gap employees, rather than every assignment or employee.

Label bounded examples as illustrative. When claiming totals, pair examples with a complete scoped aggregate. Examples cannot replace a required complete workspace.

Choose narrow tables with fields relevant to the answer. Count distinct employees, assignments and Benefits separately. Describe empty results as no matching records in the stated current population. Do not treat an empty result as proof of eligibility or insurance status. A response with one employee count can report zero employees.

## Delivery format

- Deliver portfolio snapshots and grouped comparisons as branded, interactive, standalone HTML previews that fill the host preview width. Follow [dashboard.md](dashboard.md) for construction and preview steps.
- In chat, link the final file and add at most one checked insight beyond its cards and tables. If there is no added insight, give only the link and brief status.
- Keep focused facts, work lists and simple review summaries in chat. Honor an explicit request for chat or inline format. For inline HTML, use only a host that renders the fragment in the conversation.
- Keep query selection tied to the request. A dashboard does not call for extra review, count, cost, configuration or employee detail reads to fill a card. A broad snapshot still requires its complete review and gap detail, even when delivered in chat.
- If presentation fails, give the checked answer in chat and explain the limit. A complete list can start inside native disclosures, but every checked row must remain available. Label loaded rows, illustrative examples and detail omitted by an explicit request for a summary only.

## Snapshot review workspaces

After the summary, show distinct assignment and employee counts, priority counts, counts by issue category and one supported verification action per category. Then show two separately labelled, complete, expandable workspaces: assignment records needing review and employees with no benefit record.

- Use native disclosure for assignment rows. In the closed view, group Employee with a quieter Benefit label. Then show labelled priority with a subtle accent for queue order and neutral badges for checked issue categories.
- In the open view, show balanced, labelled source values. Add a short "Check before updating" list with one to three actions based on that record's evidence. Show Source fields only when they add information. Write actions from returned evidence, rather than splitting a sentence into mechanical steps.
- Keep gap rows in a table with labelled High priority, Employee and requested scope fields. Explain the common reason and verification once above the list.
- Keep IDs internally to distinguish employees with the same name and separate assignments. Add organization fields only when requested or needed for a verified filter. Treat collapsed detail as personal data. Do not describe collapse as a privacy control.

Render one row per assignment and preserve every returned finding reason. Derive evidence and verification text from checked flags and values in the selected detail query. Do not add a new business calculation. Display a populated Benefit ID with an unavailable label as "Name unavailable" while retaining its distinct internal identity.

Use `$` on every verified USD value, including `$0.00` and `−$30.00`. Put `USD/month` in the heading. For other currencies, use ISO codes unless the symbol is verified and clear. Keep two decimal places from the source, and distinguish Not recorded from zero. Keep raw flag aliases and query dates out of record summaries. Put brief provenance in the footer and conditional notes beside affected views.

| Returned evidence | Reason and supported next action |
| --- | --- |
| Missing Benefit, Type, Carrier or Coverage flag | Name each missing field. Ask the Benefits Tracking owner to confirm the intended value; any correction belongs to a separate authorized workflow. |
| Blank Employee, Employer or Total monthly amount flag | Name each amount that is Not recorded. Confirm the intended cost basis and required value before entry. |
| Fully populated mismatch flag and compared monthly amounts | Show Employee pays, Employer pays and Recorded total as evidence. Verify field meaning and supporting inputs before deciding which field, if any, needs correction. |
| Zero or negative Employee, Employer or Total monthly amount flag | Name each affected field and show its rounded value. Ask the owner to confirm whether the value is expected for the plan. Zero alone is not blank. |
| Employee returned by the query for those without assignments | State "No benefit record" under the checked current employee scope. Confirm intended assignment status with HR or the owner. Do not infer eligibility or prescribe enrollment. |

Keep employee gaps separate from the distinct union of assignments needing review. Count an assignment once even when it has several reasons or actions.

Use priority to order checks: High for no assignment, Medium for a missing descriptive field, blank cost or fully populated mismatch, and Low for zero or negative costs alone. Use the highest applicable priority.

Do not present priority as eligibility, compliance, severity or proof of error. A mismatch does not establish an authoritative cost source.

If required detail is denied, incomplete or inconsistent, deliver independently checked summary figures only as a partial snapshot. Name the affected workspace and the read access or retry needed. Treat a checked empty workspace as empty, not unavailable.

### Compact response shapes

- **Fact:** Give the returned value, unit and scope in one sentence. Add a brief date line only when needed. Omit unrelated sections and a default extra denominator.
- **List:** Give a descriptive headline, the requested complete narrow table, any needed note about meaning or blanks, and a brief date and scope line. Label a null Benefit row "Assignments with Benefit not recorded." Do not count it as another distinct Benefit.
- **Coverage:** Use figures returned by SQL in the headline "N of D current employees have a Benefits Tracking assignment (P%). G have none." Add requested groups and explain assignment presence when needed to avoid an enrollment inference. Give a brief date and scope line.
- **Costs:** Show the requested monetary table, any relevant blank amount note, a careful interpretation of net difference, and a supported verification action for discrepancies. Add a brief date and scope line.
- **Review:** Show the distinct assignment count and exact check scope. Use `Finding | Assignments | Evidence | HR follow-up`. Label examples as illustrative. Use neutral finding categories by default and show complete identities only when requested.
- **Snapshot:** Show four coverage, cost and review cards, summaries by issue category with shared verification actions, and complete searchable workspaces for assignments needing review and employees with no benefit record. Use native disclosures. An explicit request for a summary only omits detail. Keep employee gaps and assignment review counts separate. Name blocked sections. Do not repeat card figures in an opening headline or accompanying chat.

Give a caveat once, where it matters. Offer next steps tied to the request. Base every explanation on retained fields.

## Evidence and check outcomes

Separate checked facts, labelled hypotheses and supported verification actions. Describe a hypothesis as a possible explanation to confirm, not a diagnosis. Describe the observed fields and ask HR or the Benefits Tracking owner to verify their intended basis before corrections.

Keep these claims tied to evidence. An ID gap does not establish a Benefit. A name does not establish that an employee is fake. A zero total does not establish that it was never entered. A rate does not establish another Benefit, and an amount does not establish an enrollment premium.

A disagreement does not establish which recorded source is authoritative. Patterns alone do not establish an application defect, broken import, stale edit or eligibility. Do not recommend a mass update of Total to the components solely from a mismatch.

Finding kind and check completion are separate:

| Label | Use |
| --- | --- |
| Review item | Use for a missing descriptive field, blank monetary amount, recorded and component mismatch, zero or negative monthly amount, or employee with no assignment. Treat it as a prompt to verify, not a determination. |
| Information | Other checked observations outside the approved review list. |
| Checked | Use when this requested check completed with sufficient evidence. This label alone does not mean every record has no issues. |
| Could not check | A requested check is blocked by permission, unavailable field/currency, unresolved scope, incomplete pages or inconsistent evidence. |
| Not configured | Use when positive evidence establishes that a requested check that depends on configuration has no applicable configuration. Missing assignment or cost data does not establish missing configuration. Do not read configuration merely to populate this label. |
| No review items found | Use when completed requested issue checks found no Review items or proven Exceptions. Name those checks and scope. Do not claim a clean result across the portfolio from unchecked or blocked sections. |

Benefits has no default Exception rule for a hard violation. Use High, Medium and Low only to order review. An explicit hard rule approved by the owner supports an Exception only after you check that the rule applies and was violated. Name the rule and evidence. Do not import Time Approval rules or infer urgency from amounts or names.

A record can have several finding badges and a separate blocked check. Carry a proven Exception through affected assignment and employee findings while preserving other badges. Treat check failures as blocked checks, not record Exceptions. Count distinct entities, not badges. A configuration inventory can show Not configured without creating a Review item unless an applicable approved policy requires the configuration.

Deliver independently checked sections alongside blocked sections only as "Partial — some requested checks could not be completed." Name each blocked section. If a requested issue check is incomplete, do not publish an overall No review items found verdict. Omit unrequested checks instead of marking them Could not check or Not configured.

## Money and findings

- Use "Employee pays," "Employer pays," "Sum of components," and "Recorded total (Monthly Total Cost field)." Label the difference "Net difference (recorded minus components)." A zero net difference does not establish that every assignment matches. Opposing mismatches can cancel.
- State the verified company currency in monetary table titles. Explain that a nonzero difference shows disagreement between recorded sources. It does not establish which source is correct.
- Show employer share or annualized values returned by SQL when requested. Employer share divides Employer pays by components. Show Unavailable if an included component is blank or negative, or if the component total is not positive. Annualized means the current month multiplied by 12. It is neither historical spending nor a forecast.
- Display a blank as "Not recorded" and an unavailable ratio as "Unavailable." Keep both distinct from zero. If sums omit blank source amounts, call them recorded amounts and show the relevant blank counts.
- State that source amounts are rounded to two decimals before aggregation or comparison. Use this calculation basis, and do not claim approval without evidence.

Classify a missing Benefit, Type, Carrier or Coverage, a blank cost amount, a recorded and component mismatch, or a zero or negative monthly amount as a Review item. Ask the owner to verify blank cost amounts; corrections belong to a separate authorized workflow.

Zero or negative values alone are Low priority. Say "Check whether this value is expected for the plan." A zero recorded total with nonzero components also mismatches and is Medium priority. When every amount is zero, priority is Low.

Treat zero as a recorded value, and do not infer a duplicate from a similar name. Give a specific verification action only when supported by relevant fields. Keep employee gaps separate from assignment review totals.

Count combined review as a distinct union, not the sum of issue counts. Label overlaps. A zero recorded total with nonzero components is a subset of mismatches. Findings about a named Benefit or rate pattern can overlap those mismatches too. Do not present overlapping groups as disjoint counts that account for every record.

Use counts, percentages, totals, magnitude comparisons and annualization returned by SQL. Do not calculate unsolicited metrics from list rows. You can describe connector totals for returned rows with the correct unit. Employee counts across groups by assignment dimension can overlap, so do not sum them.

Explain that coverage means a current employee has a Benefits Tracking assignment where readers might infer eligibility or enrollment. Keep the answer within the checked scope. Omit unrelated failures in reports across the company and record problems in other subsidiaries.

Show a brief date and scope line instead of a routine source inventory. Include each fresh query's returned NetSuite date or observed call time. Name the applied subsidiary, country, Benefit or grouping scope. Combine dates only when they match. State the current employee criteria, active with no past release date, once when scope would otherwise be unclear.

Name Benefits Tracking assignment or current employee records when the distinction changes the answer or the user asks about sources. For country scope, say "employees in subsidiaries whose country is ..." Named subsidiaries exclude children unless requested. For a successful empty list, say "Checked at [observed call time]" rather than inventing an account date.

When using retained data in a later answer, identify its original date. Give a new read its own date. Keep account and access context in the conversation, and limit claims across the company to checked access.

For a blocked answer, name the unavailable field, record, company currency or unresolved completeness issue in plain language. For a permission problem, name the read access needed. Deliver independently checked sections only when you identify the blocked section and mark the result Partial.

## Requested downloads

For HTML dashboards, put a compact, visible date and scope footer in the file. Include the completion state and verified account context when known. Name source records only when needed to interpret a view or when requested. Keep card counts and long criteria out of the footer. Put essential current employee criteria there in brief form. Place notes about carrier overlap, what assignment presence means, monetary basis, link limits and loaded rows beside the affected view. Give each caveat once.

Automatic dashboard delivery follows the [delivery format](#delivery-format). Create a CSV or workbook only when requested. For CSV, use available file tools, readable headers and every checked row. Include scope, query date, units or currency, and blank meanings in the accompanying reply.

Omit numeric IDs from default exports. When requested, preserve IDs as exact text. Keep blanks separate from zero. Escape CSV quotes, commas and line breaks.

Use the pinned shared safe CSV serializer or an equivalent exporter protecting formula-leading text including leading whitespace/control and full-width variants. Keep trusted numeric amounts numeric and identifiers as text. CSV quoting alone is insufficient. Necessary task-local export staging is permitted outside installed assets; do not persist unnecessary raw responses. Save account data outside the repository and link the file.

If file tools are unavailable, explain the limit and provide the requested data in chat. Avoid unnecessary raw-result copies; permitted local helpers and minimized task-local staging may support safe dashboard/export delivery.
