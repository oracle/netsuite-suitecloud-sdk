# Showcase prompts

These are example requests, not account data or reports of executed tests.
Use them with NetSuite established as the project system. Retain all existing
evidence, permissions, coverage, calculation, and no-fabrication requirements.

## 1. Deadline risk, phrased as a yes/no question

**Prompt:** "Are there deadlines at risk?"

**Expected behavior:** Activate the live-project risk workflow and build the
section 4 dashboard from accessible evidence. Do not substitute a yes/no sentence,
narrative, list, or chat table. Keep deadline-search counts distinct from the
observed union of flagged projects.

## 2. Task ownership and staffing gaps

**Prompt:** "Any staffing gaps on our overdue project tasks?"

**Expected behavior:** Build the dashboard with the Unowned, Placeholder only,
Named owner present, and Unknown breakdown. Keep unknown assignment evidence
distinct from confirmed lack of an owner, and do not infer full staffing merely
from a named-owner field.

## 3. Project allocation versus task ownership

**Prompt:** "Which projects have no resource allocation, and do their overdue
tasks have named owners?"

**Expected behavior:** Build the dashboard and distinguish project-level
allocation evidence from task-level ownership. Join only through verified
identifiers and expose missing or permission-limited coverage.

## 4. Hours and monetary budget health

**Prompt:** "Are any of our projects late and over planned hours or monetary
budget?"

**Expected behavior:** Build the dashboard with supported late-plus-overage
findings. Keep hours separate from monetary values and currencies separate from
one another. Show unavailable budget evidence as Not available rather than
inventing an amount or attributing an unverified cause.

## 5. Client exposure with an explicit format override

**Prompt:** "Give me a CSV of clients with multiple flagged projects, including
each project's supported deadline, staffing, and hours-overage indicators.
No dashboard."

**Expected behavior:** Honor the explicit CSV override while retaining source
provenance, evidence labels, scope, and coverage limitations. Group by verified
client identifiers; do not invent client mappings or portfolio-wide totals.
