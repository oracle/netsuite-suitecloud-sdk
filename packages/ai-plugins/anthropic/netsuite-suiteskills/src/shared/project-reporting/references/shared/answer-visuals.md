# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Answer format — v10

V12 OVERRIDE: [automatic scope and HTML output](../primary/scope-and-output.md) takes priority over earlier presentation defaults. Use HTML for structured answers; only a complete, accurate one-fact/one-sentence answer may be plain text. A one-row multi-value result is not an exception. Keep the remaining evidence, privacy and action controls.
Apply [task execution](task-execution.md), [presentation](presentation.md) and
[publication integration](presentation-integration.md). PM-4.0.0 evidence gates are unchanged.

## Select by analytical substance
Default to a graphical dashboard for status, risk or performance analysis, categories, trends,
comparisons and other multidimensional findings. Choose scope-sized cards/charts/table panels;
do not fill a fixed frame with fabricated metrics.
A genuinely single noncomparative fact, one-fact single-sentence answer or verified presence/absence
confirmation may remain concise prose/table. Single status value is a fact; a status comparison
is not. The source, units, date and material limitation remain attached to the answer.
A short prompt, follow-up or earlier dashboard does not waive substantive evidence or required detail.
An explicit visualization request produces a visual even for a single fact. Explicit text preference
or actual host limitations are handled truthfully, with equivalent permitted evidence.

## Evidence and notes
Reuse only compatible actual tool pulls from the current conversation, retaining their original
retrieval/evaluation dates. No invented numbers or model-estimated account data; no synthetic defaults.
A compact presentation does not require a broad investigation; broad scope cannot be silently reduced.
All caveats, definition differences, coverage gaps and permissions belong inside the artifact,
including widget source labels and a notes/coverage section. Keep material gaps prominent.
Do not append a trailing list of hedges or an offer to investigate later; complete cheap relevant
cross-domain detail in the current turn. Real blockers or expensive optional work are recorded honestly.

## Optional scalar visuals
The existing [answer-facts schema](answer-facts.schema.json) and fact_tiles.py remain unchanged.
They resolve one or two typed values from normalized, sourced evidence; they do not manufacture data.
Dates/statuses can be displayed without converting them to numbers. Missing, withheld, undefined,
and confirmed zero stay distinct. Scalar privacy checks include the original source-field paths.

## Delivery
review_delivery.py uses the existing audience/content policy and actual host capabilities.
For nonsynthetic data, --execution-context and --tool-trace are required. A missing relevant
connector produces a plain stop message, not a report. A source-level failure with an active
connector produces a labeled limited/partial result with its notes inside the artifact.
An inline flag is not a rendered result: inline_rendered stays false until an actual host tool
succeeds. Prefer supported inline output, then deliverable HTML, then a truthful fallback.
--narrow allows the single-fact exception; --explicit-visual overrides it.
Do not publish private receipts, arbitrary context, raw objects or execution approvals.
