# NetSuite SAFE Guide Reference Index
> Summarized from Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

This index provides quick access to the 12 SAFE Guide principles and appendices for NetSuite SuiteCloud Development Framework (SDF) best practices.

## The 12 Principles

| # | Principle | Reference File | Key Topics |
|---|-----------|---------------|------------|
| 1 | [Understand NetSuite Features and Data Schema](01-understand-netsuite-features.md) | `01-understand-netsuite-features.md` | REST vs SOAP, SuiteScript 2.1, SuiteTax, OneWorld |
| 2 | [Manage SuiteScript Usage Unit Consumption](02-governance-usage-units.md) | `02-governance-usage-units.md` | Governance limits, script types, optimization |
| 3 | [Optimize Your SuiteApps](03-performance-optimization.md) | `03-performance-optimization.md` | N/cache, Map/Reduce, N/query, SuiteQL |
| 4 | [Understand Multi-SuiteApp Environment](04-multi-suiteapp-environment.md) | `04-multi-suiteapp-environment.md` | Script coexistence, event ordering, conflicts |
| 5 | [Design for Security and Privacy](05-security-privacy.md) | `05-security-privacy.md` | Roles, permissions, OAuth 2.0, data protection |
| 6 | [Test Your SuiteApps](06-testing-suiteapps.md) | `06-testing-suiteapps.md` | Jest testing, SDN environments, phased releases |
| 7 | [Managed Distribution](07-managed-distribution.md) | `07-managed-distribution.md` | Managed SuiteApps, SuiteApp Control Center |
| 8 | [Maintain Your SuiteApps](08-maintenance.md) | `08-maintenance.md` | Publisher environment, versioning, deployment |
| 9 | [Agreements and Licensing](09-agreements-licensing.md) | `09-agreements-licensing.md` | IP protection, click-through agreements |
| 10 | [Open Source and Third-Party Software](10-open-source-third-party.md) | `10-open-source-third-party.md` | License compliance, prohibited licenses |
| 11 | [Industry Best Practice Security](11-security-best-practices.md) | `11-security-best-practices.md` | OWASP principles, secure coding |
| 12 | [UIF SPA Best Practices](12-uif-spa-best-practices.md) | `12-uif-spa-best-practices.md` | StackPanel layout, conditional rendering, DataGrid, third-party lib integration, module-level caching |

## Appendices

| Appendix | Reference File | Description |
|----------|---------------|-------------|
| Concurrency Cheat Sheet | [appendices/appendix-concurrency-cheatsheet.md](appendices/appendix-concurrency-cheatsheet.md) | Concurrency governance limits and error handling |
| N/query Joins | [appendices/appendix-nquery-joins.md](appendices/appendix-nquery-joins.md) | Multi-level joins using N/query module |
| N/Cache Sample | [appendices/appendix-ncache-sample.md](appendices/appendix-ncache-sample.md) | Complete caching example for concurrent processing |
| N/dataset Formulas | [appendices/appendix-ndataset-formulas.md](appendices/appendix-ndataset-formulas.md) | Formula auto-transformations for N/dataset and N/workbook |
| N/dataset Record Types | [appendices/appendix-ndataset-record-types.md](appendices/appendix-ndataset-record-types.md) | Record types, field locations, and join patterns for N/dataset |
| CustomTool Runtime | [appendices/appendix-customtool-runtime.md](appendices/appendix-customtool-runtime.md) | JS entry points, schema design, MCP integration, and complete examples |
| SuiteApp application.xml | [appendices/appendix-application-xml.md](appendices/appendix-application-xml.md) | beforeUndeploy pre-uninstall lifecycle hook for SuiteApp projects |
| Manifest Features | [appendices/appendix-manifest-features.md](appendices/appendix-manifest-features.md) | ERP feature string catalog, required vs optional, manifest.xml examples |
| UIF Component Patterns | [appendices/appendix-uif-component-patterns.md](appendices/appendix-uif-component-patterns.md) | AccordionPanel, Breadcrumbs, ToolBar, Pagination, Stepper, Popover, MultiselectDropdown, SplitButton, SystemIcon catalog, ImmutableArray/Object, FormatService, LazyDataSource, EventBus patterns |
| SuiteTalk REST API | [appendices/appendix-suitetalk-rest.md](appendices/appendix-suitetalk-rest.md) | REST Web Services fundamentals, 2026.1 features (Attach/Detach, Batch, selectOptions), OAuth 2.0 quick reference, SOAP deprecation timeline, Integration Record SDF XML |

## Quick Reference by Topic

### Development

| Topic | Relevant Principles |
|-------|---------------------|
| SuiteScript 2.1 | [1](01-understand-netsuite-features.md) |
| Governance/Usage Units | [2](02-governance-usage-units.md) |
| Performance | [3](03-performance-optimization.md) |
| Caching | [3](03-performance-optimization.md), [Appendix](appendices/appendix-ncache-sample.md) |
| Querying Data | [3](03-performance-optimization.md), [Appendix](appendices/appendix-nquery-joins.md) |
| UIF / SPA Layout | [12](12-uif-spa-best-practices.md) |
| Third-Party Libraries (Leaflet, D3, etc.) | [12 §14](12-uif-spa-best-practices.md) |
| SPA Data Caching | [12 §15](12-uif-spa-best-practices.md) |

### Architecture

| Topic | Relevant Principles |
|-------|---------------------|
| Multi-SuiteApp Design | [4](04-multi-suiteapp-environment.md) |
| Security Design | [5](05-security-privacy.md), [11](11-security-best-practices.md), [OWASP](../../netsuite-owasp-secure-coding/SKILL.md) |
| API Selection | [1](01-understand-netsuite-features.md), [Appendix](appendices/appendix-suitetalk-rest.md) |

### Testing & Deployment

| Topic | Relevant Principles |
|-------|---------------------|
| Unit Testing | [6](06-testing-suiteapps.md) |
| SDN Environments | [6](06-testing-suiteapps.md) |
| Phased Releases | [6](06-testing-suiteapps.md) |
| SuiteApp Control Center | [7](07-managed-distribution.md), [8](08-maintenance.md) |
| Publishing | [8](08-maintenance.md) |

### Compliance & Legal

| Topic | Relevant Principles |
|-------|---------------------|
| IP Protection | [9](09-agreements-licensing.md) |
| License Compliance | [10](10-open-source-third-party.md) |
| Privacy | [5](05-security-privacy.md) |
| BFN Requirements | [6](06-testing-suiteapps.md), [7](07-managed-distribution.md) |

## Key Concepts Quick Reference

### REST vs SOAP Web Services
- **REST required** for new SuiteApps (since 2024.2); preferred for all new development
- SOAP: last new endpoint added in 2025.2; all endpoints permanently disabled in 2028.2 — plan migration
- 2026.1 additions: Attach/Detach, Batch Operations, create-form, selectOptions, Support Case records
- See [Principle 1](01-understand-netsuite-features.md) and [Appendix: SuiteTalk REST API](appendices/appendix-suitetalk-rest.md)

### Governance Limits
- Client scripts: 1,000 units
- User events: 1,000 units
- Scheduled scripts: 10,000 units
- Map/Reduce: 10,000 units per stage
- See [Principle 2](02-governance-usage-units.md)

### Script Execution Order
- Client scripts: First added, first executed
- User events: No guaranteed order
- See [Principle 4](04-multi-suiteapp-environment.md)

### Testing Environments
- **Leading**: Upgraded in Phase 0
- **Trailing**: Upgraded in last phase
- **Release Preview**: Testing against new release
- See [Principle 6](06-testing-suiteapps.md)

## File Structure

```
references/
├── 01-understand-netsuite-features.md
├── 02-governance-usage-units.md
├── 03-performance-optimization.md
├── 04-multi-suiteapp-environment.md
├── 05-security-privacy.md
├── 06-testing-suiteapps.md
├── 07-managed-distribution.md
├── 08-maintenance.md
├── 09-agreements-licensing.md
├── 10-open-source-third-party.md
├── 11-security-best-practices.md
├── 12-uif-spa-best-practices.md
├── safe-guide-index.md (this file)
└── appendices/
    ├── appendix-application-xml.md
    ├── appendix-concurrency-cheatsheet.md
    ├── appendix-customtool-runtime.md
    ├── appendix-manifest-features.md
    ├── appendix-ncache-sample.md
    ├── appendix-ndataset-formulas.md
    ├── appendix-ndataset-record-types.md
    ├── appendix-nquery-joins.md
    ├── appendix-perf-queries.md
    ├── appendix-perf-timing.md
    ├── appendix-soap-rest-migration.md
    ├── appendix-suitetalk-rest.md
    └── appendix-uif-component-patterns.md

    
```

## Original Source

These reference files are summarized from the Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2, July 2025.

For the complete guide, refer to the official NetSuite documentation in the NetSuite Help Center.
