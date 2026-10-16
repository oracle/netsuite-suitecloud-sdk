# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.


# Publication integration — PRESENTATION-2.0.0
This is an additive privacy boundary around unchanged protected PM/VISUAL/SOW evidence.
It requires no connector change and no new AI platform. The caller's host handles
identity, authorization, storage and text review, not this library.

## Sequence
1. Resolve account/user/project/resource scope and complete the inherited evidence gates.
2. Build the protected VISUAL-2.0.0 object using `visual_dataset.build`. Keep it private.
3. Establish the actual reader and destination audience. Access to records alone is
   not permission to export them. Review every proposed published free-text value
   (including labels, source references, messages, financial notes and SOW fields).
4. Supply a separate trusted policy using `presentation-policy.example.json`.
   Bind `input_sha256` to `presentation_disclosure.sha(protected_object)`, set a real
   expiry, and record actual host authorization/review references. Grant only needed
   figures, identities, prices and exact link origins. These references are not
   serialized in the output. Policy files belong in protected runtime storage.
5. Put only actually reviewed string paths and `sha(value)` digests in `reviewed_text`.
   Use JSON Pointer escaping. `leaf_reviews()` enumerates candidate hashes for review
   tooling; it must never be used to automatically approve live data. Synthetic-test
   fixtures are the only auto-reviewed examples in this package.
6. Call `presentation_disclosure.project(protected_object, policy)` for public JSON,
   or `visual_render.render_html(protected_object, policy)` / `render_markdown(...)`.
   Both renderers project before serializing visible and expandable content.
7. Keep the approved SOW plan, scope bindings and execution ledger unchanged. Never
   execute a presentation. Request a new audience/content review after changes to
   input, expiry, audience, permissions or destination.

## CLI (run from the edition root; paths are examples, not connector URLs)
```sh
python -B skills/netsuite-suiteskills-operations/runbooks/netsuite-project-portfolio-health-assistant/scripts/presentation_disclosure.py project protected.dataset.json --policy approved.policy.json --output presentation.json
python -B skills/netsuite-suiteskills-operations/runbooks/netsuite-project-portfolio-health-assistant/scripts/visual_render.py protected.dataset.json --policy approved.policy.json --format html --output report.html
python -B skills/netsuite-suiteskills-operations/runbooks/netsuite-project-portfolio-health-assistant/scripts/visual_render.py protected.dataset.json --policy approved.policy.json --format markdown --output report.md
```
Do not put the protected input or live policy into the skill source/distribution.

## Meaning of withholding
Unknown extra properties are excluded. Common secret-like strings are blocked even
if reviewed. Other free text needs real audience/content review; regexes cannot prove
that text is safe. A permitted field name is not approval of its contents.
Aliases replace typed identities when forbidden. No row is dropped; risk/request
coverage is not recomputed. A withheld price is not zero and does not affect candidate
ranking. A missing source remains missing; a presentation restriction is separately
marked. If even aggregate population counts are not authorized, publishing is blocked
and a narrower authorized analysis is required.

## Compatibility and limits
The old one-argument renderer intentionally fails closed without a policy. The
protected dataset and business helpers are unchanged; public JSON uses its own strict
schema. Additional custom display fields need explicit profile-schema review, not
runtime field pass-through. New host control is required but no vendor-specific API
is assumed. Policy hashes provide binding, not identity authentication or cryptographic
authorization; a trusted host must prevent attackers from forging/altering policies.
For ordinary chat answers, follow the same audience/source minimization contract;
a Python helper cannot enforce every model-authored sentence.

## v6 adaptive composition
PRESENTATION-2.0.0 adds explicit dashboard fields; the review policy and projection
must cover new confirmed/interpretation text and any permitted identity/financial
details. Build the protected dataset first, complete the host review, then select a
LAYOUT-1.0.0 plan bound to the approved presentation. Neither a preset nor a layout
hash grants extra access. Renderers accept only the projected object internally.
Use `--preset classic` for the previous arrangement; `auto` selects an appropriate
broad preset and `--narrow` creates a compact overview. New fields do not change
the protected runtime, financial, resource, or SOW evidence semantics.

## v10 task and publication ordering
Use the single root connector selection and actual current-conversation tool receipts under
task-execution.md before production delivery. Missing active connection stops the account task.
Complete automatic required/cheap cross-domain reads before freezing and reviewing the visual data.
Record all deferrals/coverage in the protected dataset BEFORE audience review; do not append raw
context, diagnostics or narrative caveats after the approved artifact. Preserve original source dates.
A task ledger is not an audience permission grant and cannot authorize an external publication or write.
