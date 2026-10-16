## Integration 0.7.2 — 2026-10-14

Refresh current foundation identity and owner metadata. Preserve the conversational procedure, dynamic availability discovery and direct business-task precedence.

## Integration 0.7.1 — 2026-10-14

Add conversational plugin onboarding as SKL-CS-ONBOARDING. Select explicit plugin starting-point and capability questions; concrete business tasks take precedence. Remove the optional transport HTML and its active references. Replace the historical bundled shared snapshot with generated current shared resources. Preserve source skill-history version 2.5.0 and source package version 1.8.1 separately. Native loading and account behavior remain not_run.

## Historical source changelog

The entries below describe prior source revisions; removed assets and behaviors are historical evidence, not current instructions.

# Plugin Onboarding changelog

## Unreleased repaired revision — 2026-10-14

Preserves source skill 2.5.0 and source package 1.8.1 as distinct declared tracks. No new release version is assigned. Uses SuiteSkills authorized-actions successor guidance.

- Made native in-chat questions and an inline goal card the default; removed the separate Welcome Center and launcher from the successor candidate.
- Reconciled all active references with the role/goal flow and explicit returning-user checks.
- Replaced structural identity assumptions with trusted/user-confirmed binding and current evidence validation.
- Replaced automatic next-workflow execution with selected, scoped alternatives and accurate empty/denied/partial states.
- Replaced host-specific UI/persistence promises with actual capability checks and honest fallbacks.
- Preserved supported user-authorized domain actions without blanket read-only or duplicate-confirmation rules.
- Repaired the optional welcome for empty/unknown/large inputs and removed fictional entities and unsupported account claims.

## Standardization record

## Unreleased standardized revision — 2026-10-14

Source plugin 1.8.1; source skill history 2.5.0. These are distinct tracks, not a newly assigned release. Standardized metadata, shared references and host-neutral surfaces. Historical entries below describe supplied claims, not verified execution.

# Version History

## 2.5.0 — 2026-10-13

- Goal plan now lists every installed skill related to the stated goal, primary first, each with its display name, identifier, one-line contribution, and 2-3 read-only prompts; connector-native capabilities appear last as "Built into the connector".
- Step 0 inventories the session's installed skills; the card never names a skill that is not installed, and a missing primary is noted with the best installed supporting skill promoted.
- Goals table in `personas.md` now carries primary and supporting skills per goal. Skill names are allowed on the goal plan (only there).


## 2.4.0 — 2026-10-13

- Question 2 is an open question: the user states their goal in their own words; example goals appear as plain text, not buttons. No multi-select; question 3 removed. The stated goal is matched to the goals table by meaning and kept verbatim on the card and in memory.
- Goal plan is built around the single stated goal (one capability section, "start here", up to two related goals as "Also worth doing" links).
- New `reference/memory-file.md`: a per-user `netsuite-onboarding-memory.md` with account fingerprint, role and goal in the user's words, persona, plan, dated progress, single next step, preferences. Shown before the first write; written to outputs and presented (and to persistent memory when available); updated after each workflow. Returning users open with "Still working on <goal>? … Next step was …" and Continue · New goal · Update role.
- Preferences move to opt-in or natural end; never before the first result.


## 2.3.0 — 2026-10-13

### Reframed around goals
- Question 2 is now "What do you want to accomplish with NetSuite?" (multi-select goals by role) and question 3 is "Of those, which matters most right now?"; nothing asks where time goes or what is frustrating.
- The persona card is replaced by a **goal plan**: one section per chosen goal, top goal first, each naming the capability that achieves it with 2-3 clickable read-only prompts; the persona becomes a subtitle that sets scope and framing only.
- `personas.md` gains a goals-by-role table mapping each goal to its skill and catalog section. Returning-user card, next-choice wording, framing table, checklist, evaluations, and happy path updated.

### Transport
- Rain card removed. The transport is the data-driven sunburst card alone.


## 2.2.5 — 2026-10-13

- Rain card: removed the highlighted "NetSuite" tokens; stream is generic transaction numbers, currencies, FX rates, Σ only.


## 2.2.4 — 2026-10-13

- Rain card: nine dense columns of NetSuite-format document numbers (SO/PO/INV/JE/ICJE/IF/TO/WO/OPP/EST/RMA…), multi-currency amounts with native symbols, FX rates; "NetSuite" highlighted as the only word. Illustrative numbers only.


## 2.2.3 — 2026-10-13

- Rain card uses NetSuite transaction-type language with standard abbreviations (SO, PO, INV, CM, RMA, Bill, IR, JE, ICJE, IF, TO, WO, Opp, DEP) and OneWorld terms.


## 2.2.2 — 2026-10-13

- Rain card: regular weight, 17 px; columns are NetSuite record and field names grouped by process instead of ledger codes; alternating accent/secondary color.


## 2.2.1 — 2026-10-13

- Rain card enlarged: 20 px bold type, 260 px tall, seven columns.


## 2.2.0 — 2026-10-13

- Transport sequence rebuilt for speed and portability: two cards instead of one. `reference/transport/rain-card.html` (~900 bytes, verbatim, self-stopping) paints immediately; `reference/transport/sunburst-card.html` is a fixed script that draws the hierarchy from a `SUBS` data array the model fills from discovery. No model hand-draws geometry. Timing derives from subsidiary count. Returning users get the sunburst card only.


## 2.1.10 — 2026-10-13

- Reveal line "Oh, you mean NetSuite! Transporting you now…" is chat text only, before the card; removed from the card. Phase 0 is rain with no text.


## 2.1.9 — 2026-10-13

- Transport card: standard tempo ~4.3 s is now the default; the ~7.5 s sequence is a showcase variant on request. Reveal line "Oh, you mean NetSuite! Transporting you now…" is the only text over the rain in phase 0 and also appears as chat text before the card. Payload trimmed to six rain columns and compact CSS.


## 2.1.8 — 2026-10-13

- Transport card now opens with the ledger rain alone (Phase 0), then header and sunburst over dimmed rain (Phase 1), then center, arrival, and rain fade (Phase 2).


## 2.1.7 — 2026-10-13

- Transport card gains a continuous ledger-rain background (GL numbers, DR/CR, currencies, transaction IDs, periods, Σ) that dims as the sunburst forms and fades only after everything has loaded. Accent color only; no film reference. Legend on a translucent panel. Returning users get the sunburst without the rain.


## 2.1.6 — 2026-10-13

- Transport visual changed from rings to a sunburst (radial tree): containment shows the hierarchy, scales to 40 entities, legend alongside, "NetSuite" in the center.
- Status lines rewritten as bold claim + proof: one system / every subsidiary local, every number global / the AI does the work; arrival now "Oracle NetSuite — World's #1 AI Cloud ERP. Welcome aboard."
- Destination label now "Oracle NetSuite — World's #1 AI Cloud ERP".


## 2.1.5 — 2026-10-13

- Transport sequence specified in `reference/transport-sequence.md`: Local → Regional → Global rings on the "Act Global, Be Local" theme, outer nodes from discovery, regions grouped by country, one consolidated center.
- Status lines made generic and fixed: own books / regions roll up / one ledger / arrival.
- Evaluations cover node provenance and reduced-motion.


## 2.1.4 — 2026-10-13

- Added trigger phrases: "I'm ready for Next", "show me the future of ERP", "take me to the future of ERP". All three take the transport-sequence path.


## 2.1.3 — 2026-09-30

- Transport arrival line fixed as "Arrival: NetSuite — World's #1 AI Cloud ERP. Welcome aboard."


## 2.1.2 — 2026-09-30

- Transport card destination label fixed as "NetSuite — World's #1 AI Cloud ERP"; arrival line carries the same phrase.


## 2.1.1 — 2026-09-30

### Changes
- Playful openers ("Beam me into the #1 Claude ERP") get a transport sequence: the reveal line "Oh, you mean NetSuite! Transporting you now…", a visual beam/progress card with humorous status lines, then question 1 in the same turn. Humor rules exclude franchises, characters, competitors, and real people.


## 2.1.0 — 2026-09-29

### Changes
- All three questions are tappable with typing allowed. Question 1 is a visualizer card with six role buttons (no option cap; Executive and NetSuite Administrator separate); questions 2 and 3 use the four-option widget, question 2's options chosen by role.
- Discovery moves to the turn after the first answer. The first user-facing turn is question 1 with no tool calls before it (observed: 20s of subsidiary mapping before any question).
- Quick-answer table by role added to `personas.md`; surfaces map, evaluations, happy path, and gotchas updated.


## 2.0.0 — 2026-09-29

### Rewrite
SKILL.md rewritten from scratch after a full-flow review; the 1.x file had accumulated contradictory step ordering and leftover vocabulary from eleven incremental edits.

### Interaction changes
- Persona card and prompt launcher are one card. Clicking a prompt confirms the persona and runs it; no separate "Does that fit?" turn. Adjust button in the footer.
- Returning users get one Yes / Update card instead of three confirmations.
- Each question tells the user a few words is plenty.
- Scope confirmation is one tap with the persona's default pre-selected.
- First-workflow failure handling: explain in one line, run the next prompt in order, never end on the error.
- Framing table (in `personas.md`) replaces the situational question; the third answer drives framing.

### Structure
- Step 0 is silent preparation (identity by content, discovery, stored context); Steps 1-6 are the persona path; the area menu is Appendix A, fallback only.
- `reference/context-ladder.md` removed; its useful content moved to `personas.md` (framing) and `onboard-checklist.md` (fallback jobs).
- Evaluations renumbered 1-30; happy path rewritten including a returning-user section; surfaces map re-keyed to the new steps.


## 1.9.2 — 2026-09-29

### Changes
- Launcher shows the persona's prompts only. Removed the "All prompts" section; the full catalog or the connector's prompt library app is offered in a separate turn when the user asks for more.


## 1.9.1 — 2026-09-29

### Changes
- Added the opener "I heard the #1 AI Cloud ERP's AI does the work. The other one watches. Beam me into the ledger." to showcase prompts and to the skill's trigger phrases. Playful openers match the energy in one line, then run the same three questions.


## 1.9.0 — 2026-09-29

### Changes
- New prompt launcher after persona confirmation: the persona's skills with 2-3 clickable read-only prompts each ("For you") and a collapsed "All prompts" bucket, or the connector's prompt library app when exposed. Rendered with the visualizer widget using `sendPrompt`; numbered-list fallback.
- New `reference/prompt-catalog.md` with prompts for all seven personas and launcher rules (read-only only, no real entity names, one render per persona).
- Surfaces map, evaluations, and happy path updated.


## 1.8.1 — 2026-09-29

### Changes
- Added **Executive (CEO, CFO, COO)** as a seventh persona with its own process order (consolidated results → cash and receivables → cross-function exceptions → board-ready summary) and framing rules.
- Renamed System Steward to **NetSuite Administrator**.
- Rule: whenever roles or business functions are listed, Executive and NetSuite Administrator appear as separate entries, never merged. The role list for question 1 is now six items in plain text.
- Executive is never inferred from seniority words; the user must name the office or a whole-business remit.
- Fallback menu, context ladder, surfaces map, and evaluations updated.


## 1.8.0 — 2026-09-29

### Changes
- Opening simplified to three questions, one per turn: who you are, where your time goes, what you want to accomplish. Replaces the 1.7.0 five-question interview and the 1.6.0 three-tap card.
- New persona step: answers map to one of six personas (Closer, Cash Collector, Spend Steward, Fulfillment Planner, Revenue Driver, System Steward) in `reference/personas.md`; the persona is shown back as a correctable card with its processes in order and a first proposed workflow.
- Walkthrough replaces the area menu: after the persona is confirmed, the flow goes process by process with the mapped specialist skill. The area menu is now a fallback for skipped questions or twice-rejected personas.
- Cadence and output-format preferences moved to the end-of-flow profile confirmation.
- Checklist, surfaces map, evaluations, and happy path updated.


## 1.7.0 — 2026-09-29

### Changes
- New step 0: business-context interview before the intake card — industry/business type, team size, top three priorities, check-in cadence, output format. One question per turn, full answer awaited, one follow-up maximum.
- Due diligence before each question: known answers are confirmed in one line, never re-asked.
- Positive language throughout the package: "headache" and "time sink" replaced with priorities and "what to make easier".
- Output format follows `brand-style` Step 4 when that skill is present; otherwise a six-item list, stored verbatim as one of six tokens.
- Company and Work profile blocks extended; happy path, surfaces map, and evaluations updated.


## 1.6.0 — 2026-09-29

### Changes
- Intake is one tappable card (role, week, goal) in a single widget call instead of three turns. Turn-by-turn remains the no-widget fallback.
- The optional open line rides on the menu turn ("…or just tell me in a sentence") rather than being its own question.
- New reflect-back: one line of business context the user can correct, shown before the adapted menu.
- Role-neutral week options for the one-card version, since the week question cannot depend on the role answer on the same screen.
- Happy-path example rewritten to open with the intake (the 1.5.x example edit had also silently failed).


## 1.5.1 — 2026-09-29

### Fix
- 1.5.0's intake step was documented in the references and evaluations but never landed in SKILL.md (edit anchored on a stale heading), and the frontmatter description plus operating model still said "present options first". A live run therefore opened with the menu. The intake is now step 1, a hard gate, named in the description, the operating model, and the flow.
- Stored context may pre-select intake answers but never skips the intake.
- Menus no longer front-load prior-session findings.
- Steps renumbered 1-9; references, surfaces map, and evaluations updated to match. Added the observed failure to gotchas.


## 1.5.0 — 2026-09-29

### Changes
- New step 2b: a quick intake before any menu — job family, where the week goes, what would make the tool worthwhile, one optional open line. One tappable step per turn, skip honored, typed answers outrank taps.
- Intake answers reorder and trim the business menu, pre-fill the situational question for one-tap confirmation, and seed the Work profile so step 7 is a confirmation, not a second interview.
- `reference/context-ladder.md` gains Rung 0 with option sets per job family; Rung B reduced to a single optional confirmation question.
- Added bold showcase prompts.

### Why
- Feedback: knowing the user's job and time allocation up front helps routing; the earlier objection was to essays, not to being asked. The intake is therefore taps, one at a time, with the open question last and optional.


## 1.4.2 — 2026-09-29

### Changes
- Account identity is content-only. The connector label is never stored or echoed as identity. Structural fingerprint (subsidiary list from the standard helper) is the match key for reusable company context; legal fingerprint (root legal name, base currency, edition) is added only on a user-confirmed SuiteQL read.
- Supersedes 1.4.1's label-derived identifier, which was withdrawn on review.
- Noted that some connectors do not expose a direct subsidiary record read, so the legal fingerprint path is SuiteQL.

## 1.4.1 — 2026-09-29 (withdrawn)
- Recorded connector namespace as a label-derived account identifier. Replaced in 1.4.2.


## 1.4.0 — 2026-09-29

### Changes
- `reference/interactive-surfaces.md` now names each tool exactly (`ask_user_input_v0`, `step_card_display_v0`, `chart_display_v0`, `link_preview_display_v0`, `message_compose_v1`, `translation_display_v0`, `places_map_display_v0`) with the parameter mode to use at each step.
- Added two narrow surfaces: translation card for non-English retrieved text the user asks about; map surface for NetSuite location addresses (no Google lookup, no `places_search`).
- Added a walkthrough use of the step card for "how does this onboarding work".
- Documented that the elicitation widget has no skip button, so the situational question carries a typed-skip instruction.
- Excluded list trimmed and reasons made explicit.


## 1.3.0 — 2026-09-29

### Changes
- Added step 3b: one tappable situational question per business area ("What's driving this today?") with a skip. The answer reorders the job menu and sets result framing; it never asks role, title, or seniority.
- Replaced the two open personalization questions with a three-rung ladder: multi-select week, single-select time sink, then one optional open line. Typed text is accepted at every rung and outranks taps.
- Added `reference/context-ladder.md` with per-area option sets and their effects.
- Updated happy-path example, surface map, and evaluations.

### Why
- Feedback: menus are welcome, but knowing where the user is coming from helps the analysis; essay questions do not. Context is now gathered one tap at a time.

## 1.2.0 — 2026-09-29

### Changes
- Added `reference/interactive-surfaces.md` mapping each flow step to client UI surfaces: tappable clarifying questions for job selection, scope confirmation, next-choice and closed personalization questions; inline chart for trend/comparison findings; link cards for transaction and entity references; message compose for share/hand-off requests; step cards for the write-preview protocol and NetSuite UI walkthroughs.
- Kept the first-choice menu as plain text because tappable widgets cap at four options and the menu carries 4-7 plus an escape hatch.
- Recorded surfaces deliberately excluded (shopping, places/travel, recipe, weather, translation, health options card) so they are not re-added.
- Added surface-selection checks to `tests/evaluations.md`.

### Compatibility / migration notes
- Surface use is conditional on the tool being present in the current client; text fallbacks are unchanged from 1.1.0.
- Validated live against a OneWorld demo account (Finance & close -> Find unusual variances -> scope confirmation) before packaging.

## 1.1.0 — 2026-09-29

### Changes
- Replaced interview-first onboarding with a guided-choice funnel: **choice -> value -> refinement -> optional personalization**.
- Added business-area menus and job-to-be-done menus.
- Added lightweight capability/configuration discovery to filter clearly invalid options without broad data pulls.
- Moved role/work-profile questioning after the first useful workflow unless needed earlier to resolve ambiguity.
- Added explicit routing to specialist NetSuite skills instead of duplicating domain workflows.
- Aligned write behavior with the universal connector contract: current-state retrieval, preview, approval, authorized execution, and read-back validation.
- Added host agent metadata, evaluations, and exactly five showcase prompts.
- Kept account/work-profile separation and permission reconciliation from the prior implementation.

### Compatibility / migration notes
- Existing company/work profile concepts remain compatible.
- Deployments that relied on mandatory role-first questioning should expect the new menu-first experience.
- Do not assume persistent profile storage is available in every AI client; when unavailable, summarize the proposed profile in chat.
- The skill depends on the universal NetSuite connector instructions for actual capability discovery, tool selection, SuiteQL safeguards, subsidiary/currency handling, and write controls.
