# Domain reference

Support the user’s requested analysis and authorized actions through available, supported tools. Establish the target, intended effect and required business inputs before acting; reuse authorization already given for that exact scope. Tool availability and source examples do not grant authorization. Preserve business validation, actual host approvals and account permissions. If the operation or required procedure is unavailable, explain the specific gap and provide a useful proposal without claiming execution.

# the host presentation

Render directly in the response. Use the exact scenario heading, one-row labeled bullets, or one multi-row Markdown table. There is no separate finalization API. Do not call tools from another host or describe a table as a Canvas.

Use each scenario's columns in their declared order. Keep all returned primary rows, including repeated-looking action details or order lines. The primary row count chooses bullets versus table, except inbound link expansion can also require a table. Missing enrichment never downgrades several rows to a prose summary.

Use a verified returned UI URL as a labeled hyperlink to the verified returned URL. Escape pipes, brackets and line breaks in record text so it cannot change the table structure. Keep nulls distinct from zero and no-match; use the specific scenario fallback. Keep dates exactly as supplied. A numeric relationship field is an ID, not a display label or a clickable reference. Preserve links that are available even when others are unavailable.

Use one Recommended actions bullet for a single negative-inventory/failed-pick row. For multiple rows, put one `### Recommended actions` section directly after the table with exactly that scenario's approved Help links. Do not repeat actions in each row or add actions to the other four scenarios.

Successful empty: heading and exact no-results sentence; no empty bullets or table. Unavailable: heading and exact unavailable sentence, followed only by a useful recovery step when known. Partial: retain verified rows and state the missing branch, enrichment or coverage. Never hide a material scope limitation merely to match a concise template.

The table is the complete default output; a chart or exported file is not required. If the user explicitly requests a file, use available the host file capabilities, include the same factual rows/scope, and verify that the file exists before linking it. If unavailable, state that the requested format could not be produced and give the factual text/table. Do not invent a renderer path or require a second skill for ordinary answers.

When an export contains leading spreadsheet-formula characters in text fields, neutralize them in CSV output without changing numeric values and disclose that text was escaped. For a requested action, establish its scope, authorization, supported tool schema and business prerequisites; execute only when these are satisfied and verify the resulting state. Keep proposals distinct from completed actions.