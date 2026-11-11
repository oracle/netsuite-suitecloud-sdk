# Benefits presentation

Find [build and preview](#build-and-preview), [visual design](#bundled-visual-design), [content slots](#content-slots), [composition](#composition), [review rows](#review-rows-and-supported-verification), [browsing](#loaded-row-browsing-contract), [charts](#approved-chart-templates), and [the final check](#final-presentation-check) below.

## Build and preview

- Follow [output.md](output.md) for answer shape, delivery, complete workspaces and partial results.
- Complete [response checks](checks.md) before building the report. For a broad snapshot, also complete [snapshot checks](snapshot-checks.md). If a check fails, show its limitation in the affected section.

- Fill the packaged [fragment](../assets/dashboard-fragment.html) and place it in the [standalone shell](../assets/dashboard-shell.html).
- Save one final HTML file outside the repository. Read it back before linking it. Open it in the host's full-width preview when supported. Report a preview only after the host renders one.

- For requested inline HTML, use the filled fragment only when the host renders HTML in the conversation. An adapter may change its container, but must preserve checked content, accessibility and local interactions.
- Verify delivery in the requested host. Source views, attachment cards, standalone browser renders and file previews do not prove inline delivery. Link only an existing file.

- Build the final presentation directly from checked results with available file tools. Use only supported local artifact helpers where necessary; preserve this dashboard’s domain fields and interactions. Minimize sensitive staging and save outside installed assets. No helper may query or modify NetSuite directly.
- Use the instructions here for runtime work. Development fixtures and tests do not direct runtime answers.

## Bundled visual design

- Use the bundled compact scoreboards for overview values, aligned financial rows for costs, and searchable controls for complete workspaces.
- Use the pinned light page, Ocean header and flat opaque panels for overview and comparison tiles. Use the pinned shared design tokens.
- Leave out unsupported trends, gauges, application navigation and decorative actions. Use the packaged layout for the requested facts.

- Use this reference and the packaged assets as the runtime design. Keep their styles and examples fixed across answers. Runtime requires no external fonts, development processors, installation, telemetry or network resources.
- Use system fonts for the compact title. An optional opening insight may use the restrained Georgia or Times New Roman serif style when it adds a distinct checked fact.

- Use the pinned light background and flat opaque section panels; keep decorative background artwork hidden.
- Keep record rows, tables, controls, evidence values and text opaque. Use the packaged solid fallbacks for unsupported blur, reduced transparency, forced colors and print.
- Keep native tables and disclosures readable without JavaScript.

## Content slots

Use one dashboard per document. Keep fixed scoped styles and interaction code.

| Slot | Checked content |
| --- | --- |
| `{{REPORT_TYPE}}` | Use the fixed enum `snapshot`, `comparison` or `report`. Keep user text out of this slot. |
| `{{TITLE}}` | Escaped requested-report title. |
| `{{SUMMARY}}` | Use an optional complete `<p class="bpm-summary">` with one short checked insight absent from the cards or comparison. Leave it empty for ordinary snapshots or repeated figures. Escape text. Only fixed `bpm-amount` spans may wrap monetary units. |
| `{{CONTEXT}}` | Footer-only `<dl class="bpm-provenance">` with concise `dt`/`dd` pairs: applied scope, verified account context when known, each query's own as-of date/time and honest completion state. Name source records only when they change interpretation or HR asks. Do not repeat card counts or long criteria. |
| `{{SECTIONS}}` | Requested scoreboard group, complete workspaces and supporting native disclosures, using the structures below. |
| Shell `{{FRAGMENT}}` | Complete populated fragment, unchanged. |

- Escape dynamic text and quoted attribute values. Encode ampersands, angle brackets and both kinds of quote as entities.
- Treat names, labels, Coverage strings and pasted content as data. Keep customer text out of JavaScript, CSS and event handlers. Use connector-supported record URLs in escaped link attributes.
- Embed only requested employee identities and evidence. Treat hidden or collapsed personal detail as present in the delivered file.

- Wrap monetary amounts in prose with the value and verified monthly unit. For verified USD, use `<span class="bpm-amount">−$30.00 USD/month</span>`.
- Put `USD/month` once in the aligned cost summary heading. Prefix each value with `$`, including `$0.00` and `−$30.00`. For other currencies, use the ISO code unless a symbol is verified and clear.
- Preserve blank, Unavailable, signs and two-decimal precision. Use escaped text and fixed markup rather than arbitrary summary HTML. Keep currencies separate.

## Composition

- Build snapshots in this order: compact title, four overview cards, issue summaries, complete assignment review and employee gap disclosures, then a short provenance footer.
- Let the cards carry opening figures. Omit recap prose and jump buttons. Keep native disclosures usable without JavaScript and include every checked row in the final file, even when a disclosure starts closed.
- Omit both workspaces for an explicit summary only request. If a requested check is incomplete, show its limitation in the affected view and mark the footer Partial.

- Lead grouped reports with the requested comparison. Put the complete exact table in a closed native disclosure after it. Include every checked row.
- Show returned coverage percentages with labeled 0 to 100 meters. Show assignment counts with labeled horizontal bars. Show eligible monthly recorded and component costs with paired bars, exact currency labels and signed difference text.
- Nest joint groups under subsidiary identity. Use one common scale within each count or cost chart for geometry only. Do not report that scale as a business figure. If a chart is ineligible, use the compact text comparison.
- Add an "Amounts to verify" area only for groups with a returned nonzero difference or blank amount count. Give one supported next action without repeating visible figures. Leave out any claim about which source is right, how many assignments mismatch, or priority when the aggregate cannot establish it.
- Omit opening prose and headings that repeat the title. Keep a brief insight only if it adds distinct checked context.

- Wrap snapshot cards in `<div class="bpm-scoreboards">`. Give each `section.bpm-scoreboard` a short `h2`, a `dl.bpm-measures` and exact returned values.
- Wrap SQL facts in `span[data-bpm-fact]`. Keep those facts unchanged during local browsing.

- Show four compact cards. Cover assignment presence with numerator, denominator and returned percentage. Show distinct affected assignments, employees without any assignment, and monthly costs in the other cards.
- Keep each primary value and its context on the same baseline where space permits. For example, show "75% of current employees," "4 assignments" or "3 employees." Let text wrap without clipping on narrow screens. Add a labeled coverage track only when its returned percentage is available.
- Use aligned `bpm-cost-summary` rows for monthly costs. Put the verified ISO currency and monthly basis in the heading. Distinguish Recorded total from Sum of components with exact returned values. Show the signed Net difference as recorded minus components. Do not name either total as authoritative.
- Put Employee pays and Employer pays in quiet `bpm-cost-inputs` rows of the same card. Add one short definition of the difference. Keep secondary facts quiet and leave out a separate cost input disclosure.
- Show completion badges only for partial or blocked checks. Put overall status in the footer. Show Unavailable with a limitation for blocked values, not zero.
- Beneath the cards, show returned counts and one shared verification action for each of five issue categories: missing descriptive fields, blank monthly amounts, populated cost mismatches, zero monthly amounts and negative monthly amounts.
- Arrange those summaries five across on very wide screens, 3 plus 2 on desktop, 2 plus 2 with a full width final tile on tablet, and one column on mobile.
- Show separate SQL returned High gap employee, Medium assignment and Low assignment counts. Explain that issue categories overlap, priority counts partition distinct review assignments, and gap employees are a separate unit.

- Use the bundled compact label, value and context pattern. Keep issue badges neutral. Use text labels for High, Medium and Low review order. Subtle color and a small mark may support them.
- Use color only for review order. Leave out unsupported trends, sparklines, severity stripes, chat controls, history, background jobs, feedback icons and replica navigation. Never imply urgency, proof of error, policy, eligibility or financial authority through color.

- Build review and gap workspaces with `section.bpm-section.bpm-role-review#bpm-review` and `section.bpm-section.bpm-role-gaps#bpm-gaps`. Give each a `div.bpm-section-head`, `h2` and honest check state.
- Keep each title, complete count, purpose and shared verification guidance visible. Put the complete table in a closed `details.bpm-data-disclosure` with an "Explore N records" summary. Use the same disclosure for grouped exact evidence.
- Keep a blocked requested workspace visible as Partial or Could not check. Show its checked summary and the access or retry needed.

## Review rows and supported verification

- Build the assignment explorer from compact native `details` rows. In the closed summary, group Employee with quieter Benefit, then show neutral issue badges, labeled priority and a fixed chevron.
- Balance labeled source values in three desktop columns or two narrower columns. Put one to three short actions in the opaque "Check before updating" panel, one action per list item. Derive each action from checked flags and values. Keep a single supported action as one item.
- Show nested Source fields only when they add a distinct field. Keep all assignment identities and loaded rows. Show Not recorded for an absent Benefit.
- Link employee names only after verifying view routes in the requester's account. Otherwise show names without links and place one brief source note beside the workspace, away from the toolbar.
- Put shared actions beside issue summaries. Use record steps only for checked, specific guidance. Describe observed values rather than guessing a record's purpose or an unseen catalog record.

- Show one row per affected assignment and combine all returned finding flags. Keep its evidence available without JavaScript and for keyboard and print use.
- Hide numeric IDs by default. Add raw fields or IDs in nested Source fields only when requested. Distinguish employees with the same name and separate assignments by internal identity.
- Use semantic tables for employee gaps and grouped exact rows. Keep shared actions and finding badges from repeating without new meaning.

| Returned finding | Visible reason/evidence | Suggested verification |
| --- | --- | --- |
| Missing descriptive field | Name the absent Benefit, Type, Carrier or Coverage. | Confirm the intended value for the named missing field. |
| Blank monthly amount | Name the absent source amount. Show Not recorded. | Confirm the field's basis and intended value before entry. |
| Fully populated mismatch | Show exact recorded and component evidence in verified currency. Net difference is recorded total minus components. | Confirm field meaning and supporting inputs with the owner before correction. |
| Zero or negative monthly amount | Name each affected Employee, Employer or Total field and show its rounded value. | Confirm whether the value is expected for the plan. |
| Employee without assignments | Show no assignment found in the checked current population. | Confirm whether an assignment is intended for this employee. |

- Use returned SQL amount inputs, components and difference for monetary evidence. Keep business calculations out of the browser.
- Show blanks as Not recorded and unavailable values as Unavailable. Neither means zero. Do not infer an authoritative cost, incorrect rate, cause or bulk update from a difference. Aggregate agreement does not prove each assignment reconciles.

- Show employee gaps in a separate compact table with employee names and requested scope fields. Keep their IDs internal.
- State the shared reason and action once above the table. No assignment was returned for a checked current employee. Confirm whether an assignment is intended.
- Count gap employees separately from assignment findings. Check for the absence of every assignment, not only a matching Benefit.

- Use SQL returned priority. Show Medium for a missing descriptive field, blank cost or fully populated mismatch. Otherwise show Low for zero or negative cost. Show gap employees as High.
- Use visible priority text with restrained High coral, Medium lavender and Low teal accents. Color supports queue order only. Do not infer eligibility, compliance, proof of error or urgency from it.
- Keep check completion separate from priority. Use Checked, Could not check or Not configured only with the required evidence. Leave out configuration reads made solely to fill badges.

## Loaded-row browsing contract

- Put each table in its own `data-bpm-browse` element. Give it `data-bpm-table`, a semantic caption, explicit row and column header scopes, and one `tbody`.
- Put the table inside `div.bpm-table-scroll` with a descriptive `aria-label`, `role="region"` and `tabindex="0"`. Add `p.bpm-table-hint` with "Scroll across to view every column."
- Use `<caption><span class="bpm-caption-label">escaped table identity and units</span></caption>`. Keep the caption accessible on desktop and visible when it wraps on mobile.

- Use `div.bpm-controls[data-bpm-controls][hidden]` as the list toolbar. Label the search input `data-bpm-search`, sort select `data-bpm-sort` and reset button `data-bpm-reset` with the fields they control.
- Reveal controls for snapshot workspaces through `data-bpm-controls-always`. Reveal them for grouped exact tables with more than 12 loaded rows. Keep them hidden for shorter grouped tables.
- Keep `p[data-bpm-row-status][aria-live="polite"]` in the DOM. Hide it visually for a complete list with no filter or sort when the disclosure states the count. Show it for active filters, sorts and any partial list.
- Add `p[data-bpm-filter-empty][hidden]` to explain how clearing filters restores loaded rows. Show "Scope totals unchanged" only while a local filter is active.
- Set `data-bpm-completeness="partial"` on an incomplete list. Add the exact checked expected count as `data-bpm-expected-total` when available. Keep the partial warning after filtering. Describe visible rows as loaded rows, not all requested rows.

- Add `select[data-bpm-issue-filter]` to assignment workspaces with fixed values `all`, `missing-description`, `blank-cost`, `cost-mismatch`, `zero-cost` and `negative-cost`. Filter returned flags. Keep amount classification in SQL.
- Provide the exact `Employee A–Z` (`label-asc`) and `As returned` (`original`) sorts. As returned follows SQL priority and stable internal assignment identity. Name visible employee, Benefit, reason and evidence fields in search labels.
- Give gap tables search, employee sorting and reset. Leave out assignment and issue controls there.

- Give rows escaped `data-bpm-row-key` for internal identity, `data-bpm-sort-label` for the visible employee label and `data-bpm-issues` for supported issue tokens separated by spaces.
- Keep all applicable issue tokens. Deduplicate by internal assignment identity, not displayed name. Follow [record link guidance](sources.md) for employee links.

- Keep generic grouped table numeric sorts as `value-desc` and `value-asc`. Put the chosen SQL returned decimal in `data-bpm-sort-value`. Leave the numeric attribute out for blank or unavailable values so they sort last without changing zero or negative amounts.
- Use optional `data-bpm-finding-filter` with `all`, `review-item` and `information` from row `data-bpm-findings`. Keep one category control in the main assignment workspace.

- Apply search, filters, sorting, pagination and expansion only to loaded presentation rows. Keep full scope facts and partial list warnings unchanged.
- When more than 25 rows are loaded, create synchronized Previous and Next navigation above and below the list. Show the exact interface labels `Rows X–Y of Z` and `Page X of Y`.
- Filter and sort every loaded row before slicing pages. Reset to page 1 after a search, filter, sort or reset. Disable boundary buttons and announce the current view through the live status.
- Treat a new scope, grouping or refresh as a conversation request that needs the normal checked query flow.

- Keep native disclosures and all rows usable without JavaScript. Hide scripted controls and pagination until the script runs.
- Show all rows in print with a solid light palette. Keep connector calls, refresh claims, business rollups, local storage and mutation buttons out of the document.

## Approved chart templates

- Use the packaged labeled percentage track for a returned assignment presence percentage from 0 to 100 with a nonzero denominator.
- Use single horizontal bars for checked nonnegative assignment counts across at most 12 groups. Use paired bars for checked nonnegative Recorded total and Components in the same verified currency per month across at most 12 groups. Show the returned signed Net difference in text.
- Select the maximum checked displayed value only as a common visual scale. Keep it out of reported business metrics and calculate no new percentages.
- Give each chart a semantic `figure`, an exact text label per bar and a complete exact table after it.
- Use the compact text comparison and exact table when a required amount is blank, unavailable or negative, all values are zero, or more than 12 rows would appear. Query only data needed for the answer, not decoration.
- Use charts in suitable snapshots and grouped reports. Use them in focused answers only when a graph is requested and useful. Use checked time series for trends and disjoint groups for a pie. Omit those charts when evidence is insufficient.

## Final presentation check

- Read back the final artifact. Check template markers, exact figures and units, source dates, scope, current criteria, blank meanings, reasons, actions, complete identities, separate gap units and partial states.
- Reconcile requested tables before presenting them as complete. If a check fails, correct the file or mark the affected result partial.

Use development browser and fixture tests to check layout and local interactions. Record source evidence and actual host delivery evidence separately. Tests alone do not establish permissions, agent behavior or inline delivery.
