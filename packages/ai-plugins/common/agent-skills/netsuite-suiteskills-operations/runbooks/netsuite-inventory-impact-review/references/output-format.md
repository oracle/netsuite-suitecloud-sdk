# Output format

Use ordinary text and native Markdown tables. Missing host presentation or computation capabilities must not block delivery. Do not include internal execution names, result aliases or debug information.

## Verified transaction blocks

For each resolved transaction, use this order:

1. `## Inventory impact: Confirmed`, `## Inventory impact: None`, or `## Inventory impact: Not confirmed`
2. `Here are the details for [user entry]:` followed by concise returned details
3. `## Key reasons`
4. `## Items with inventory impact` for Confirmed only
5. `## Limitations` when material

Prefer a type-specific number such as `Item Receipt number: IR-06`. Include verified status/date/header location only when returned and useful. Show an internal ID when supplied by the user, needed to disambiguate, or when no display reference is available. Label custom or non-transaction records accurately; do not infer impact for a non-transaction record.

For Confirmed include `No. of inventory-impacting lines: N` using classification inventoryAffectingLineCount. If the compatible read confirms a positive line but cannot establish the total, say `Total not established`; never substitute detail rows for a total. If some flags are unavailable, qualify N as confirmed lines only.

In Key reasons explain the returned inventory-affecting evidence and any verified business context. Explicitly false flags across the complete accessible scope support None. General transaction-type behavior does not override evidence. Product documentation is optional; do not invent business explanations when it is unavailable.

## Confirmed table

Use columns: Item, Quantity Change, Change Type, Location, and Line/Record when useful. Include Unit when returned; otherwise preserve the reported quantity basis without claiming stock-unit normalization. Use itemDisplay and locationDisplay, when returned, for the Item and Location cells; preserve the corresponding raw IDs separately for identity. Follow the missing-label rules in [positive detail](positive-impact-line-detail.md). A BUILTIN.DF result is display text, not a URL or a structured record reference. Use verified URLs only.

Quantity Change is the absolute signed quantity. Change Type is Increase for positive, Decrease for negative, No change for zero, and Not returned for missing/non-numeric quantity. Zero or missing quantity does not overturn an explicit inventory-affecting flag; state the inconsistency/limitation where material. Escape Markdown-special characters in record text.

If classification reports 450 lines and details return 400, display the total as 450 and state `450 impacting lines; 400 detailed`. If fewer rows are displayed, separately state that display count. Do not count the aggregate's one row or grouped table rows as impacting lines. No extra query is needed for counts.

If details fail or return no rows, retain Confirmed and the count; write `Impacted line details were not returned.` under the items heading and explain why when known. Never leave that section empty or manufacture placeholder rows.

## Unresolved and mixed requests

With no usable reference, ask for one. After up to three targeted attempts without a unique verified match, ask for the missing type, record link or distinguishing information, identifying the unresolved reference. A successful empty lookup may say `No accessible transaction with that exact reference was found in the checked scope.` A failed read must say that lookup could not complete, not that the transaction is absent.

Present completed blocks first in the user's order, followed by `## Clarification needed` with pending questions. Do not assign impact statuses to unqueried references. For clarification-only turns, give the questions directly. Retain earlier filters and resume only pending work.

No standalone Yes/No answer, optional follow-up sales pitch or empty table. A bulk cap may require a concise prompt to narrow or request another bounded batch. Mark accessible scope, missing flags, selected-line scope, denied branches and truncated details wherever they materially affect interpretation.
