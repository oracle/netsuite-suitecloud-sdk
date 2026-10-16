# Shared NetSuite vocabulary

Version 0.1 — initial glossary, not exhaustive. Definitions below are short product paraphrases of the linked Oracle sources, reviewed September 13, 2026. Usage guidance is our editorial baseline.

## Product and platform terms

| Canonical term | Plain-language meaning | Usage distinction |
|---|---|---|
| **SuiteSuccess** | NetSuite's configuration methodology using industry- and role-oriented leading practices and predefined components. [Source](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1511800348.html) | Do not call it a single SuiteApp or infer a customer's edition, license or installed components from the name. |
| **SuiteApp** | An application or customization bundle that extends NetSuite for particular business needs. Oracle, partners or customers may develop one. [Source](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_3134602194.html) | Distinguish a NetSuite-installed extension from our AI-client plugin. Do not assume every SuiteApp is Oracle-developed. |
| **SuiteCloud Platform** | NetSuite's tools for adapting the product and packaging customizations. [Glossary](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156138959503.html) | The platform, not a particular installed application. |
| **SuiteScript** | NetSuite's JavaScript-based scripting platform. [Glossary](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156138959503.html) | Custom account code; distinct from a prompt or query. |
| **SuiteFlow** | Visual tools for automating record-based business processes. [Glossary](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156138959503.html) | A NetSuite workflow, not an AI conversation workflow. |
| **SuiteBuilder** | Point-and-click tools for custom fields, forms and other objects. [Glossary](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156138959503.html) | Customization tooling, not a synonym for SuiteApp. |
| **SuiteCloud Development Framework (SDF)** | A framework for developing and deploying account customizations and SuiteApps. [Glossary](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156138959503.html) | Expand once for technical audiences; usually unnecessary in business answers. |
| **SuiteAnalytics** | NetSuite's analytics area, including searches, reports and other analytical tools. [Glossary](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156138959503.html) | Do not equate the whole area with one query or report. |
| **SuiteAnalytics Connect** | Access to NetSuite data through ODBC, JDBC or ADO.NET. [Glossary](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156138959503.html) | Different from the AI/MCP connection. |
| **Role** | A permission set governing access to parts of NetSuite. [Glossary](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156138959503.html) | A job title alone does not identify the effective connection role. |
| **Permission** | Access to a record type, task or page. [Glossary](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156138959503.html) | Record restrictions and observed access also matter. |
| **Governance** | Controls on automated activity and resource usage. [Glossary](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156138959503.html) | Explain the specific limit only from applicable evidence. |
| **Bundle / SuiteBundler** | A packaged group of objects / the tool used to share it. [Glossary](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156138959503.html) | Preserve the documented distribution mechanism; do not treat bundle IDs as SDF application IDs. |

## Project vocabulary

These are working product definitions, not Oracle platform claims. The [plugin glossary](PLUGIN-TERMS.md) is the maintained register for plugin architecture, abbreviations and statuses. Project terminology reconciled on 2026-09-17; the Oracle definitions above retain their stated review date.

| Term | Meaning in this project |
|---|---|
| **AI plugin** | Our shared product delivered through supported ChatGPT and Codex packaging. Qualify this term to avoid confusion with NetSuite's own plug-in architecture. |
| **Skill** | A host-registered entry point that selects or performs a business workflow. |
| **Runbook** | A separately specified and tested business procedure; it can be supporting content beneath a category skill. |
| **Tool** | An operation the assistant can invoke through an available integration. Tool visibility does not prove successful execution. |
| **Shared foundation** | Common response, visual, reference, connection and result conventions used by all skills. |
| **Account context** | Information about the target NetSuite environment and the scope of access. This does not imply a snapshot exists. |

## Editorial rules

Use official capitalization: NetSuite, SuiteSuccess, SuiteApp, SuiteApps, SuiteCloud, SuiteScript, SuiteFlow, SuiteBuilder, SuiteAnalytics. Accept natural user variants or misspellings without lecturing; respond with the canonical spelling.

Introduce unfamiliar terms with a short explanation: “SuiteApp, an extension installed in NetSuite.” Retain the term where it helps users recognize the product UI or documentation. Do not define it again on every mention.

If a term is ambiguous, clarify only when its meaning changes the answer. Preserve customer record labels separately from product vocabulary. Do not let a customer-named role or search silently redefine a platform concept.

This vocabulary is non-exhaustive. For an unfamiliar or ambiguous term, consult an appropriate source such as Oracle's [area-specific glossaries](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_159531755298.html) or relevant product documentation. Use the supported term in the answer without waiting for a glossary update; propose a reusable addition when useful. Do not invent definitions.

Illustrative response: “SuiteSuccess provides an industry-oriented starting configuration. SuiteApps are individual extensions that may support those processes.” This explains the distinction; it is not an account inclusion claim.
