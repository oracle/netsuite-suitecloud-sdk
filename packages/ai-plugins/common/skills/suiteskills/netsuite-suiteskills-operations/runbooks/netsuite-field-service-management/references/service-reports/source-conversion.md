# Converting report references

For the report workflow and related reading, see [linked references](../../workflows/service-reports/index.md#linked-references).

Start with a local HTML rendition of the supplied source, using placeholder data and images. Preserve page size, margins, sections, headers/footers, tables, labels, repeated groups, conditionals, and visual priorities. Use the HTML for revisions; translate the accepted design to NetSuite FreeMarker/BFO XML and verify its fields separately.

## By source

- **SSRS/RDL:** RDL is XML containing layout and data retrieval definitions. Inspect its datasets, fields, expressions, report items, and page dimensions with read-only XML tools. Reject DTD and entity declarations before parsing. Translate data meaning and layout into HTML placeholders. Do not execute or copy SQL/VB expressions into FreeMarker.
- **HTML:** Copy the semantic structure into the local preview, simplify unsupported web styling, and mark dynamic elements with `data-field` / `data-repeat`.
- **PDF:** Inspect pages and recover layout, labels, and images. A PDF usually contains output, not dynamic field IDs or joins. Represent sample values with placeholders until NetSuite bindings are verified.
- **Scanned PDF or image:** Use visual inspection/OCR for layout and wording; verify uncertain text and order. Treat screenshot values as examples, not evidence of NetSuite sources.

Default to the company's account branding, including its usable logo and company details. Keep legally meaningful footer text unless the user requests changes. Do not download unrelated NetSuite media to recreate sample images. The final XML must fit the customer-specific report data contract and pass a target-account render.


