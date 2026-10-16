# Scheduling patterns

These consulting examples inform [scheduling](scheduling.md). Reading one does not adopt its rules. Apply restrictive or numeric rules only when the user explicitly selects them or the customer already follows them. A user can adapt an example for the current request. Do not save a pattern or edit a companion skill automatically.

## Cover fixed appointments

For this example, consider Not Started FSM CRM Tasks with a recorded appointment that fits the selected local day. A new-primary proposal requires a verified empty primary; use the replacement pattern when the user asks to change an existing primary. Each proposed primary must individually hold every recorded task skill and be an active Mobile User in the same Region as the task's verified linked Asset. Do not infer that Region from a search scope or location.

Retain every team member; do not promote a team member to primary within this example. Proposed-primary eligibility requirements and exclusions scoped to primary assignment do not apply to retained team members. Their availability, commitments, buffer and capacity still apply; check each participant's combined work under [scheduling](scheduling.md). Respect an explicit exclusion from all participation; do not narrow it to primary assignment. Clarify an ambiguous exclusion only when its scope changes the proposal.

Keep the appointment interval, timezone, duration, booking state, Due Date, status, team and unrelated work. Unknown booking remains disclosed unless the user adopts a confirmed-only rule, which requires verified confirmation. Do not infer that Due Date is an SLA or that a task needs a Case, Project or physical visit.

When adopted, leave at least 30 minutes between tasks for every involved technician. This gap is not a travel estimate. The example's daily limit is eight hours of scheduled task time per technician, counting each existing or proposed primary and team assignment once per task and resource. Count relevant Project Task commitments separately when their timed work is verified. Do not add buffers, travel, Native Resource Allocations, payroll time or actual hours to scheduled task hours, and do not invent a lunch break. Apply the limit using full-day task coverage for the selected local day. Native Resource Allocations remain informational unless the customer selects a different supported treatment.

This pattern creates a read-only proposal. If the user later authorizes a change, follow [Apply an authorized scheduling change](scheduling.md#apply-an-authorized-scheduling-change).

## Replace a primary resource

For a requested primary replacement, keep the recorded appointment and team unless the user also requests their revision. In the combined proposal, release the incumbent's projected commitment on that task only when a supported replacement is proposed. An unreplaced task keeps its incumbent and commitment. Team commitments remain. A person's current membership on the same task is not an external conflict with that task; other selected tasks are distinct competing work. Describe the projected assignment separately from any verified account change.

## Group work geographically

Use known service locations, technician operating bases, appointment windows and adjacent commitments to suggest a workable sequence. Use supplied or verified travel estimates when available, and disclose uncertainty that could affect an appointment. Respect adopted breaks and existing work. Region membership or last-known coordinates alone do not establish short travel or a technician's starting point. A geographic grouping does not promise a travel-time estimator or an optimized route.
