# Sample employee population dashboard

For an explicitly requested sample dashboard, create an interactive HTML Artifact in Claude from [assets/population-demo.fragment.html](../assets/population-demo.fragment.html). In a host without Artifacts, show [assets/population-demo.html](../assets/population-demo.html) using its supported HTML preview. Do not claim an Artifact was created unless rendered.

The editable records and shared scope are in [assets/population-demo.json](../assets/population-demo.json). The fragment embeds the same ten employees in `const employees`; keep them synchronized when the user requests data changes. Keep counts, composition labels, and pay-cycle copy consistent with updated records. Retain all employment states and payroll-inclusion values; no separate FYI list is needed.

Preserve the Overview, Employee population, and Pay-cycle checkpoints tabs; expanding employee details; and the Review buttons that open the matching employee. Show pay frequency as its name, never an ID. Keep one discreet Sample data label. Employee names are Simpsons characters; dates, assignments, and findings are fictional and do not establish account readiness or confirmed deadlines. Do not create fake NetSuite record links or run connector calls for this sample.

This explicit sample output is separate from the live account evidence dashboard in `dashboard.md`. It does not change Payroll availability or fallback behavior.
