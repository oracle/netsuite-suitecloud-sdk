# In-chat interaction surfaces

The default experience runs in the current conversation: native role question → open goal question → inline goal card → selected domain workflow → next choice. Do not route the user through a separate Welcome Center, dashboard, standalone onboarding HTML page, browser launcher or copy/paste onboarding prompt.

Use native host capabilities actually exposed in the current session. Inspect their current interface and supported effects. The example interaction pattern describes the intended conversation, not a portable API definition or a guaranteed tool name. Do not invent a message-send API. Where the host supports native question controls and an inline card whose selection submits the chosen prompt, use them. A real user selection event is required before workflow execution. A rendered card or preselection is not submission.

## Role question

Ask “Tell me about your role — tap one or type it.” Present Finance and accounting; Operations and supply chain; Sales and customer-facing; Executive; NetSuite Administrator; Other when the actual host surface supports them. If its option count is smaller, preserve typed answers and use a supported subset or plain-text choices; never hide Executive inside Administrator. Wait for the answer before asking the goal, unless already supplied.

## Open goal question

Ask “What do you want to accomplish with NetSuite? Tell me in your own words — one goal is plenty.” Show two or three relevant examples as ordinary text. The answer is free text, not a mandatory menu. Preserve it verbatim. A finance role with the goal “track sales orders” gets order-tracking workflows, not a finance-first plan.

## Inline goal card

- Header: “Your goal” and the verbatim user goal.
- Subtitle: a concise relevant work context, using the user's stated role without overriding their goal.
- Body: one section per actually available relevant workflow, primary first. Each section has the display name, one-line contribution and up to three analytical starter prompts. Technical route details may appear in an optional detail, never as the main label. Independently supported connector-native capabilities may be labeled “Built into the connector.” Do not imply a missing specialist's procedure is supplied by that label.
- Mark exactly one prompt “Start here.” Only include supporting workflows that materially advance this goal; do not add finance work merely because the user chose a finance role.
- Use native selectable prompt controls only if they have a real supported submission effect. Otherwise use numbered prompts the user can select by reply. Do not silently replace the chat flow with an HTML artifact that has no chat connection.
- Footer: Adjust, which asks for an updated goal. Nothing executes when the card renders.

After an actual selection, the specialist resolves only missing scope and applies current action/retrieval rules. User selection confirms the requested analytical workflow; it does not authorize unrelated writes, sends, scheduling or persistence. If the submitted prompt already establishes scope, do not add a duplicate confirmation turn.

## Capability fallbacks

| Need | Preferred current-chat surface | When unavailable |
|---|---|---|
| Role or next choice | Native question control | Ordinary chat question/numbered choices |
| Goal | Ordinary open chat question | Same chat question; never force a menu |
| Goal plan | Native inline goal card with supported selection | Grouped text with numbered starters and Adjust by reply |
| Result | Specialist-owned supported output | Supported text/table with evidence |
| Plugin starting point | Brief text welcome, then role question | Same ordinary chat flow |
| Saved progress | Reviewed local Markdown snapshot if supported | Reviewable content in chat |
| Sharing | Requested draft | Chat draft; no automatic send |

Typed answers always work. Render/open/copy actions state exactly what they do. Use verified links under the shared contract. No external onboarding entry page, host memory adapter or background scheduler is implemented.
