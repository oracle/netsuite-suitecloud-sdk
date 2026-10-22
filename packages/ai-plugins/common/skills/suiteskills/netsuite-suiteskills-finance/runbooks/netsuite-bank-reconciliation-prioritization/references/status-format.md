# Status and priority presentation

Use for broad portfolio or account status, priorities, remaining work, matching progress and close-readiness summaries. Keep the same visual language across these questions; adapt emphasis to the decision. The [data model](data-model.md) owns financial definitions and calculations; this file controls presentation, not additional retrieval.

## Choose the emphasis

| Request | Lead with | Account emphasis |
| --- | --- | --- |
| “Where do we stand?” / status / “What's left?” | Main workload finding and any consequential gap. | Current bank and posted-GL work, older carryforwards and next review. |
| “Which accounts first?” / priorities / “Where should I focus before close?” | First review and why, with a provisional label if evidence could change the order. | Numbered review order, a specific reason for each position and the next review step. |
| “How much is matched?” / matching progress | Verified progress for each requested population. | Separate bank and GL linked/total measures alongside remaining work. |
| “Are we complete?” / close readiness | Supported completion conclusion, or the missing evidence preventing one. | Saved statement state, difference and coverage as distinct facts, plus relevant remaining work. |

A mention of close in a prioritization question does not by itself require a completion assessment. Combine emphases when explicitly requested. Honor requested brevity, tables, text or a specific account list. Simple counts and narrow investigations do not need this dashboard.

## One report, in this order

1. **Finding and scope.** Use a decision-specific title, such as “Reconciliation work — September 2026” or “Reconciliation priorities — September 2026”. Put the main finding directly below it. Add one compact scope line: subsidiary/accounts, period start and cutoff, observation date/time and accounting book, as applicable. State the observation basis in plain language, for example “Current matching state for transactions dated through the cutoff”. Use verified values; distinguish a current view of older transactions from historical status. A routine workload view can say “Item matching work” to make its meaning clear without a completion disclaimer on every card.
2. **Accounts.** Use the card format below by default, including for broad status and prioritization questions. Priorities use ranked order and explain the ranking basis once above the cards. Status-only views follow the requested ordering or a stable account number/name order without invented priority ranks. For a single account, show one card and omit portfolio framing.
3. **Scope exceptions, when present.** From the existing inventory, show a compact **Account | Type / currency | Review status | Reason** table. Distinguish “Outside matching workflow”, “Eligibility unknown” and “Evidence unavailable”. Eligible accounts with incomplete workload evidence remain visible in the main view. Accounts outside verified eligibility have no workload rank and may still have reconciliation obligations. Do not fetch balances to fill this table.
4. **Shared limits, only when consequential.** Place account-specific gaps beside the affected values. Use a short footer only for a shared limit that affects the conclusion, such as incomplete portfolio inventory or unavailable historical observations. Avoid repeating the same caveat across the report.

For a portfolio too long to scan comfortably as cards, use a compact full-scope table with **Account / order | Bank open | Posted GL open | Reason / gap | Next review**. Stack period and older count, signed net and oldest date on labeled lines within each workload cell; keep undated and uncertain states visible. Expand only accounts whose explanation benefits from a card, without repeating the full table. Keep every scoped account represented in the table or scope exceptions unless the user requests a shortlist; then label the displayed subset and retain gaps that could change the selection. Account counts in the finding may summarize a complete inventory; avoid a separate KPI strip.

## Account card

Use the workload panels for status, remaining work, priorities and progress within the requested population scope. Completion or history questions may instead emphasize the relevant evidence module, including workload only when needed for that conclusion. The layout never expands the evidence plan.

**Header:** Account number/name, verified account currency and readable state labels. For priorities, add a prominent review number and a short **Why this order** sentence using the evidence that actually distinguishes the account. Rank denotes review sequence, not a risk score. Keep consequential gaps visible; if they could change the order, label it provisional and do not place the affected account last merely because its workload is unknown.

**Requested-period work:** Two adjacent panels, **Bank items — [period]** and **Posted GL lines — [period]**. In each panel show:

- A prominent **active open count**, labeled with its population.
- **Signed net** with the verified currency and amount basis; identify GL book/basis where needed.
- **Oldest open transaction date**, naming the date basis if different.

For a verified empty open cohort, show “0 active open” and “Oldest: None”; zero net requires complete amount evidence. Do not label an empty open cohort “No period items” unless the full period population is also verified empty. The panels describe separate populations and do not establish individual counterparts or a bank/GL balance difference.

**Older and uncertain work:** Below the panels, use a small table:

| Population / cohort | Count / state | Signed net / currency | Oldest transaction date |
| --- | --- | --- | --- |
| Bank — before period start | Verified active open count or Unknown | Verified net, known subtotal or Unknown | Verified date or Unknown |
| Posted GL — before period start | Verified active open count or Unknown | Verified net, known subtotal or Unknown | Verified date or Unknown |

Use actual values in the output, not these instructions. When both older cohorts are verified empty with no unresolved state evidence, replace those rows with “No older active open items found”. Show undated work separately, preserving its verified open or unknown state. For items with unknown matching, exclusion or clearing state, label counts **state unknown** and keep them separate from active open counts within each date cohort. Use “Undated” where a date is missing; a missing date alone does not make the matching state unknown. An unresolved older cohort stays visible as Unknown. Older transaction dates alone do not establish overdue work or time spent unresolved.

**Bank flags:** Show nonzero **Excluded** and **Recorded duplicates** counts beside the affected account/cohort, including their overlap. Duplicate counts can overlap excluded or open items; do not add them to open counts. Unavailable flag evidence reads Unknown.

**Decision-specific evidence, when needed:** Add the relevant module below. Omit unused modules entirely; do not create rows of Unknown for optional measures that the question does not need.

**Next review:** End with one concrete, read-only step tied to the finding, such as “Inspect the older bank items and their candidate GL lines” or “Resolve the missing GL clearing-state evidence before finalizing this account's priority”. Specify which account/cohort or evidence gap it concerns. Workload summaries support an investigation step; recommendations about individual matches, duplicates or exclusions require the full group evidence. No action buttons, assignments, implied completed changes or unsolicited offers to execute transactions.

## Decision-specific modules

- **Matching progress:** For each requested population, add its own linked count / period total measure, with a percentage or slim progress bar only when the numerator and positive denominator are verified. Define each denominator. A verified zero total reads “No period items” without a percentage; an unknown denominator reads Unknown. Do not infer the active open count as total minus linked. Label bars “Item matching”; they do not measure statement completion or close readiness. Matched amounts appear only if requested.
- **Balance or statement context:** Use a compact two-column grid only when the question needs it. Label current account balances separately as **Balance — base currency** and **Balance — account currency**, with verified codes; distinguish them from balances at cutoff. Label **Imported statement date** separately from **Last reconciled statement date**, deriving the latter only from completed saved-reconciliation evidence. Display required unavailable facts as Unknown. Do not infer FX exposure, missing statements or a supported balance exception from these fields alone.
- **Completion / close readiness:** Show saved statement state, statement/cutoff, saved difference with currency, coverage through the requested close and any required unresolved dependencies as separate facts. Missing required evidence limits the conclusion. A saved statement may be completed with a nonzero difference; zero difference or fully linked items alone cannot produce a “Ready” or “Complete” label for the account.
- **Historical change:** Compare only supported observations on the same basis. Label observation dates and explain verified changes. If earlier state is unavailable, show the current finding and the missing historical evidence without a trend arrow or inferred improvement.
- **Supporting detail:** If item/suggestion detail was already needed for the decision, place it in an initially collapsed “Show evidence” disclosure with necessary verified record links. Keep the main reason, next review and consequential gaps outside the disclosure. Do not retrieve detail merely to populate it. In Markdown, use a short evidence table only when needed.

## Labels and amount display

Use specific labels such as **Active work**, **Older work**, **Evidence gap**, or **Blocked — [verified dependency]**. “Blocked” requires a dependency that actually prevents the relevant step. Use **No active open work found** only with complete required bank/GL scope, including older and undated work and resolved state classifications; it does not assert statement closure. Show a saved statement's verified status separately. Avoid invented High/Medium/Low risk bands and unsupported “On track”, “Overdue” or “Ready” labels.

Unknown is not zero or low priority. A known partial amount reads **Known signed subtotal [currency, value]; [count] amounts unknown** when the missing count is verified. Retain positive/negative signs, currency codes and separate book/basis labels. Open items with net zero remain work. Do not add bank and GL amounts, mix currencies/books, or substitute gross/absolute amounts for signed nets. User-requested monetary ranking still requires comparable bases. Shared presentation never creates comparability.

## Rendering and visual style

Honor the host's required artifact format; otherwise prefer one inline React artifact when supported. Generate it directly from this specification and verified evidence. Use Markdown when requested or no renderer is available: preserve the finding/scope, account order, paired bank/GL evidence as a compact table, older/uncertain work and next review. Do not return raw component source as the report or build a separate rendering pipeline. Accompany a rendered report with at most a short handoff, not a duplicate prose report.
