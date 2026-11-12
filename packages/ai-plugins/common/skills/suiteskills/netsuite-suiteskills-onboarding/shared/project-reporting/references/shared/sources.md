# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# Research and provenance

Retained v1 research dated 2026-09-16; not all v1 web sources were rerun in this build. Source-derived facts, user-directed overrides and new design choices are separated below. This is an implementation reference, not legal/accounting advice or certification against a standard.

## External primary sources

### S01 — PMI, PMBOK Guide (Eighth Edition) overview
https://www.pmi.org/standards/pmbok

Public overview identifies governance, scope, schedule, finance, stakeholders, resources and risk, with tailoring and accountability. Used for domain ownership, not as a claim that this suite implements or certifies the full standard.

### S02 — APM, What is change control?
https://www.apm.org.uk/resources/what-is-project-management/what-is-change-control/

Baseline changes should be recorded, evaluated, approved/rejected/deferred and monitored. Used for authorized project changes and preserving baseline history.

### S03 — APM, What is risk management?
https://www.apm.org.uk/resources/what-is-project-management/what-is-risk-management/

Risk identification, analysis and response inform the separation of observed conditions, uncertain exposure, ownership and response.

### S04 — Oracle, Specialized User: Project Manager
https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_0731012800.html

The security role differs from the Project Manager field. Custom variants cannot exceed this standard role's permission ceiling; access/licensing must be validated.

### S05 — Oracle, Standard Roles
https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N295396.html

Standard-role availability varies with features/modules. Role families are candidates, not guarantees of a user's actual access.

### S06 — Oracle, Records Catalog Overview
https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_159367848537.html

The catalog exposes role-specific record/field information and requires the corresponding permission. Use current account metadata rather than historical browser mappings as execution authority.

### S07 — Oracle, Records Catalog Record Types
https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_159376859035.html

Record/channel metadata is channel-specific. Do not interchange REST record and analytical query identifiers or writable fields.

### S08 — Oracle, 2026.2 Project Management release notes
https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_3715561461.html

Documents expanded indicators, including time overrun, overdue tasks, resource coverage, margin and actual unbilled charges, and a daily calculation cadence. Confirm the account's deployed version/configuration.

### S09 — Oracle, Project Management help chapter
https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N1179876.html

The linked help describes three legacy types and prior-week input collection. Evaluation cadence and input window are separate; neither proves the actual account evaluation.

### S10 — Microsoft, Tips for designing a great Power BI dashboard
https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips

Audience-first hierarchy, contextual cards, compact overview, consistent scales and comparison bars inform presentation. These are design principles; the suite does not require Power BI.

### S11 — Microsoft, Creating accessible reports
https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-accessibility-creating-reports

Accessible navigation, text alternatives and non-color-only communication inform the four skills' rendered-artifact checks.

### S12 — W3C, WCAG 2.2: Non-text Contrast
https://www.w3.org/WAI/WCAG22/understanding/non-text-contrast.html

Meaningful graphical objects and interface components generally need 3:1 contrast against adjacent colors, subject to the criterion's exceptions.

### S13 — W3C, WCAG: Contrast Minimum
https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum

Normal text generally needs 4.5:1 contrast, large text 3:1. The suite must test a rendered interface before claiming accessibility conformance.

## Source authority and release lineage
The supplied connector baseline and sanitized native Indicator references remain authoritative inputs
to this suite's operating contract. They are preserved separately from current account observations.
Public documentation describes product behavior, not the connected role's actual features or permissions.
Validate actual tools, schemas, filters, definitions and authorizations at runtime.
No source is evidence that a current account has a particular risk or balance.

The original project-intelligence materials informed the earlier suite. The former 132-control workflow
is replaced in v8 by evidence-led discovery. A development-only migration map explains coverage treatment;
it is not a new mandatory runtime checklist or proof of equivalence to a control audit.
See docs/RESEARCH.md in the complete edition for the current source-evaluation and paging design basis.

## Engineering choices
Four coordinated skills, a shared Portfolio Health carrier, frozen request/search plans, source receipts,
candidate resolution, audience projection and adaptive visual components are implementation decisions.
The cited sources do not establish those exact schemas, default layouts, automatic delegation or a
guarantee that every possible risk can be discovered. No live account validation is claimed by this file.
