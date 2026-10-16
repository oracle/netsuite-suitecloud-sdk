# Shared Redwood Design Guide

Revision: `redwood-1.3.0-shared.1` · October 8, 2026.

The user selected NetSuite Data Visualization 1.3.0 as the visual direction for the whole plugin. Apply this design system to every product-owned chart, report, dashboard, table, KPI view and exported presentation, across business categories. It supersedes the earlier dark-first shared visual baseline. Native conversation retains the host's appearance.

## Source and ownership

Shared presentation guidance covers layout, readability and chart semantics.

The root shared folder owns the visual system. Business runbooks supply trustworthy data, definitions, scope and limitations. Renderers implement the shared design; provider adapters establish available display/export behavior. Nested domain resources may extend components, but should use the same tokens and visual notes rather than maintain a competing theme. Existing evidence, disclosure, finance-verification and authorization boundaries remain controlling.

## Default appearance

- Use a light `#F1EFED` page with flat `#FBF9F8` portlets, 10px radius, no decorative border or shadow, and 16px gutters. There is no floating white canvas.
- Use an Ocean 150 (`#264759`) header with a restrained CSS accent above it, a yellow uppercase breadcrumb, bold white title, and yellow navigation links. Keep the header compact; the finding and figures should dominate.
- Use system fonts for body text, labels and numbers, with tabular numerals. No custom font files are distributed.
- Light is the default for finance and operational reports. Use `data-theme="ocean-dark"` on the document root for an explicitly requested presentation/deck treatment. Do not silently switch an analytical report because the operating system uses dark mode. Honor an explicit user theme or supplied template.
- Use restrained semantic accents alongside explicit labels and signed values. An increase is not automatically good; the owning runbook determines business meaning. Do not assign risk or finality from color.
- Use inline SVG or bundled icons when useful. Avoid decorative emoji, icon fonts, gradients, glow, neon, invented logos and ornamental charts. Never stretch a logo, strip or texture. Textures belong in quiet backdrop layers, at opacity no greater than .08, outside numbers and plot areas.

## Typography and layout

Use Title Case for authored report titles and card headings, uppercase for breadcrumbs, and sentence case for descriptions, labels and body copy. Preserve customer names and record labels exactly. Native conversational prose retains its response-style conventions. Prefer Regular/Bold for the principal hierarchy; do not mix weights arbitrarily.

Use 24–32px report titles, 14–18px panel headings, 12–14px chart descriptions/table labels, and 16px narrative text. These are defaults, not permission to shrink dense content until it fits. Keep 16px gutters, comfortable 14–20px portlet padding, and responsive layouts. On narrow displays, stack or wrap cards and allow the data table's labeled region to scroll without making the whole page scroll sideways.

Order a substantive analytical view as: finding and scope → relevant KPIs → main chart/trend → drivers and supporting detail → sources and methodology. Use only supported KPIs/comparisons. Material limitations belong beside the affected finding; an appendix does not replace a visible coverage warning. A single chart does not require a dashboard.

## Charts, controls and exports

Use the [chart notes](CHARTS.md) for palette order, chart choice, axes, legends and contrast. Use [dashboard and export notes](DASHBOARDS.md) for composition, controls, PDF and presentation treatment. Tokens live in [Redwood CSS](redwood-tokens.css); [legacy-compatible tokens](design-tokens.json) and [shared layout CSS](visual.css) support existing renderers.

Choose the format through [shared output guidance](../contracts/OUTPUTS.md) and the selected runbook. This design alignment does not impose the visualization skill's HTML/export mandate on every answer, install its export kit, or require its Finance Analyst dependency for unrelated runbooks. Apply that skill's own delivery and verification requirements when it is selected. Never display an Export button unless the active renderer implements it.

## Accessibility and validation

Provide exact values or equivalent text with every chart. Do not use color as the only cue. Check labels, keyboard focus, screen-reader names, table navigation, contrast, long/localized content, desktop/narrow layouts and print output on the actual artifact. Match screen and exported scope, units, filters, provenance and limitations. A palette or linter alone does not certify accessibility.

Use visible text for unknown, partial, empty, denied and failed states. For chart fills, check contrast on the actual surface; some supplied palette entries do not reach 3:1 everywhere. Keep the palette, adding an adequate outline, direct labels, patterns or another suitable encoding when needed. Dark-theme colors require their own check. Do not claim the whole palette is contrast-qualified.

## State contract

| State | Required communication |
|---|---|
| Loading | Specific work in progress; no claim of results |
| Complete within scope | Scope and as-of/source where material; never imply whole-account completeness |
| Empty | No matching results within the completed query scope |
| Ambiguous | Ask the smallest meaningful selection question |
| Partial / truncated | What is available, what is missing and whether continuation exists |
| Permission denied | Access restriction; no claim that the record or feature does not exist |
| Disconnected | Connection needed; do not guess a role or account |
| Tool unavailable | Specific capability unavailable; distinct from permissions |
| Stale | Observation date and impact; refresh option where supported |
| Failed | No result established; do not replace with zero or an empty success |

Use visible text labels for all states. Semantic warning/error/success color mappings are proposed product choices, not inherited brand meanings. The initial baseline uses neutral state surfaces with text labels to avoid inventing those mappings.

## Response contract

Teams supply: result kind; human-readable title/outcome; scoped account/environment and identity evidence when relevant; filters/date basis; structured fields with business labels and units; completeness; provenance/as-of; optional relationship edges; error state and recovery action. Internal IDs may remain machine fields for retrieval; explain the result with meaningful business labels. Include technical IDs when requested or necessary for the user's next action.

Unknown, unavailable and null values remain distinguishable from zero. Financial output names currency, accounting period/date basis and book where applicable. Do not infer remaining balance from invoice total or normalize customer-specific business meanings without evidence.

Shared renderers own typography and state presentation. Skill teams own business semantics, query evidence and expected output fixtures. The provider adapter owns the supported interaction implementation. The foundation team owns versioned tokens, pattern specifications and parity acceptance.

## Companion response style

The shared [AI response style guide](../communication/RESPONSE-STYLE-GUIDE.md) defines voice, tone, terminology, answer structure and editorial acceptance for all skills. Its [compact runtime baseline](../communication/RESPONSE-STYLE-RUNTIME.md) is intended for provider instruction integration. This visual guide governs presentation components; the response guide governs what the assistant says and how it says it. Neither file's presence proves runtime adoption.
