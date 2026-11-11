<p align="left"><img width="250" src="https://raw.githubusercontent.com/oracle/netsuite-suitecloud-sdk/master/resources/Netsuite-logo-ocean-150-bg.png" alt="NetSuite"></p>

# NetSuite AI Companion

This plug-in, compatible with ChatGPT and Codex, includes the `netsuite-ai-connector-instructions` skill and requires the NetSuite AI Connector Service to access NetSuite data. The NetSuite AI Companion plug-in guides AI assistants that use NetSuite AI Connector with the correct tool-selection order, output formatting, NetSuite domain knowledge, multi-subsidiary and currency handling, and SuiteQL safety guardrails.

## Supported Tasks

### Tool Orchestration
- **Report-first query routing:** Uses a priority order when retrieving data: standard reports, saved searches, record lookups, and SuiteQL. Uses SuiteQL only when a safer option is not available.
- **Subsidiary context checks:** Retrieves subsidiary metadata when a report includes a subsidiary filter. This helps prevent scoping errors in accounts with multiple entities.
### Output and Presentation
- **Financial number formatting:** Formats currency amounts, percentages, and whole numbers consistently across NetSuite skills. For example, amounts are displayed as $2.1M, $342.5K, and 12.3%.
- **Linked record references:** Converts transaction and entity references into clickable NetSuite links by using internal IDs. This removes raw IDs from user-facing output.
- **Dashboard versus inline output:** Uses a full dashboard or report when a request includes three or more key performance indicators (KPIs), a comparative analysis, 10 or more rows, or an explicit request for a dashboard or report. Otherwise, responds inline.
### Domain Knowledge
- **General ledger and accounting logic grounding:** Provides debit and credit rules, account type behavior, and double-entry logic. This helps keep financial narratives accurate without restating accounting fundamentals in each session.
- **Record type and field reference:** Maps business concepts to SuiteQL record types, table names, and field names. This reduces hallucinated schema references in custom queries.
### Multi-Subsidiary and Currency
- **Consolidation scope clarification:** Prompts for the subsidiary scope before retrieving financial data: consolidated, single entity, or comparison of multiple entities.
- **Native versus base currency handling:** Applies the correct rules for foreign-amount and base-amount fields and exchange rate timing. It also identifies foreign exchange gain or loss exposure for open accounts receivable (AR) and accounts payable (AP).
### Query Safety
- **SuiteQL pre-query checklist:** Runs a required safety check before executing a custom query. The check includes row limits, null handling, posting and approval filters, and explicit column lists.
- **Common mistake correction:** Maps common SQL errors to Oracle SQL-safe equivalents that NetSuite requires. Examples include OFFSET/FETCH, common table expressions (CTEs), ISNULL, and SELECT *.
### Error Recovery
- **Recovery from tool failures:** Retries failed tool calls and falls back to alternative tools. It reports an error to the user only after those attempts fail. Error messages include a NetSuite navigation path.
- **Handling permission errors and unusual figures:** Identifies the specific role required to resolve permission errors. It also flags unusual figures for user verification rather than presenting them as fact.

## Contributing

This project welcomes contributions from the community. Before submitting a pull request, review our [contribution guide](https://github.com/oracle/netsuite-suitecloud-sdk/blob/master/CONTRIBUTING.md).

## License

Copyright (c) 2019, 2023 Oracle and/or its affiliates. The Universal Permissive License (UPL), Version 1.0.
