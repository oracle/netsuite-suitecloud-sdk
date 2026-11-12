# NetSuite XML, FreeMarker, and BFO

For the report workflow and related reading, see [linked references](../../workflows/service-reports/index.md#linked-references).

Use this reference when generating or reviewing report XML. Apply the [source policy](source-index.md#source-policy) to the relevant documentation before relying on its claims. The selected FSM report data contract and a target-account render are decisive.

## Compatibility target

The supplied reference records Oracle documentation of FreeMarker **2.3.26** and BFO **1.2.10** for Advanced Printing. Verify current target compatibility before preparing or publishing a report; do not assume features from a newer FreeMarker manual work in NetSuite. FSM PDF service-report templates are File Cabinet XML files; notification email bodies use separate HTML templates. Available report variables come from the selected FSM report data contract. See [notifications and service reports](../work-management.md#notifications-and-service-reports). Do not assume the native Advanced PDF editor exposes the same variables. Read the relevant [compatibility sources](source-index.md#compatibility-target) before relying on these claims.

## FreeMarker source rules

Read the relevant [FreeMarker sources](source-index.md#freemarker-source-rules) before relying on these syntax and field rules.

- Use `&&`, `||`, and `!` for logical expressions. Bare `and` and `or` are invalid. Avoid `\and` and `&amp;&amp;`: those alternatives arrived in FreeMarker 2.3.27, later than Oracle's documented version.
- Use `gt`, `gte`, `lt`, and `lte` for comparisons inside directives when literal angle brackets could close the tag. Keep each `<#if>`, `<#list>`, and `<#function>` properly closed.
- Guard optional paths with `(record.field)??` or `(record.field)!fallback`; parentheses also cover a missing parent record. Check type and content before `?number`, `?split`, substring, arithmetic, or list operations. Parenthesize composite defaults because FreeMarker 2.3.x gives the default operator unusual right-side precedence.
- Use only plugin-verified fields and report resources. Use the [field manifest](account-discovery.md#field-manifest) to distinguish strings, reference objects, and sequences. Escape dynamic text and URLs for XML at output; preserve a single escaping strategy so values are not double escaped. FreeMarker cannot query another NetSuite record by itself.

## Field content and rich text

- Decide whether each field is plain text or intentional markup. When a plain-text field contains literal `<br />` separators from NetSuite, replace them with spaces only if the report should show one line, then XML-escape the result (for example, `${((record.field)!"")?replace("<br />", " ")?html}`). This replacement matches that exact tag spelling; inspect actual stored values before assuming other break forms are covered. Preserve line breaks where they carry meaning.
- Do not apply the plain-text replacement or `?html` to an entire rich-text signature value: that would prevent its stored `<img>` from rendering. Treat such markup as a separate content type. Verify the field's actual image format and source, normalize unsupported HTML to BFO-compatible XML when needed, and test a populated signature in a NetSuite PDF.
- Presence checks such as `?has_content` choose empty-value fallbacks; they do not validate HTML, image URLs, or XML. Validate the expanded XML with representative text containing `&`, `<`, and quotes, and with populated rich-text fields before publication.

## XML and BFO output rules

Read the relevant [XML and BFO sources](source-index.md#xml-and-bfo-output-rules) before relying on these rendering rules.

- Put the XML declaration on line 1, the BFO `report-1.1.dtd` DOCTYPE on line 2, and one `<pdf>` with `<head>` and `<body>`. Close every element and quote attributes. FreeMarker expands first; BFO then validates the resulting XML and generates the PDF.
- Translate the accepted HTML to simple CSS2 and BFO-supported elements. Replace flex/grid, JavaScript, web fonts, and inline SVG placeholders. Avoid HTML-only entities such as `&nbsp;`; use supported spacing and explicit image dimensions.
- Set text leading with `line-height: normal`, a percentage, or an explicit length such as `13pt`. Avoid unitless decimals; validate every label/value stack in the generated NetSuite PDF against the compatibility target above.
- For fixed-width report tables, use `table-layout: fixed` and an explicit `width` on each `<table>`. Put summary labels and values in distinct rows or cells so they do not depend on inline breaks for vertical space. Validate the resulting widths and page flow in the selected NetSuite renderer.
- When the accepted design reserves space for empty fields or sections, keep their headings and a bounded blank cell or row in the XML instead of suppressing the section with `?has_content`. For a full-width section heading, use a full-width table with one full-width cell; CSS width on a standalone `<div>` can collapse in the BFO PDF even when the HTML preview looks correct. Give empty cells content such as `&#160;` and an explicit height where needed, then check the actual PDF with both populated and empty data. Keep optional sections conditional only when the accepted design calls for hiding them.
- Define repeating headers and footers in `<macrolist>` with body references and enough reserved height. Keep repeated or long content in top-level flow; a table inside a `<td>` can be cut off across pages. Test long notes, many rows, empty sections, fonts, logos, and page breaks.
- Bind a company/subsidiary logo or other image only to a verified File Cabinet source that the renderer can access.

## Validation gates

1. Inspect the source for the required XML declaration, BFO DOCTYPE, `<pdf>` wrapper, compatible FreeMarker operators, balanced directives, and references to defined macros. Treat this as a source review, not a full FreeMarker parse.
2. If a compatible local FreeMarker 2.3.26 engine is available, process the template against local mock data with missing, single, and repeated values, XML special characters, and long text. Parse the expanded result with an available XML validator and check for one `<pdf>` with `<head>` and `<body>`, resolved macros, and no remaining FreeMarker directives. Never send account data to an external validator.
3. Render representative Tasks with populated and empty optional fields through the selected NetSuite FSM report path when the plugin supports it. Verify that full-width headings, reserved blank rows, and page flow match the accepted design, and verify the actual File Cabinet file and configuration reference when possible. An HTML preview or well-formed expanded XML does not prove the PDF works. If a target render is unavailable, report that gap explicitly.
