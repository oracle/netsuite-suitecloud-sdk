# Principle 7: Consider Distributing Your SuiteApps in a Managed Fashion
> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

Wide-scale ISV SuiteApp deployments are best done with managed SuiteApps. The Managed SuiteApps feature allows you to turn your SuiteApps into true cloud-based applications where updates are pushed to customers without actions from users or administrators.

## Key Concepts

### Managed SuiteApps Feature

The capability to actively push updates is particularly important for SuiteApps that provide:
- Compliance and regulatory features
- Localization for international customers
- Time-specific functionality (tax calculations)

### Prerequisites for Managed SuiteApps

1. **Publisher Environment Model** — Must publish using:
   - Development account
   - QA account (leading and lagging)
   - Publisher account

2. **BFN Validation** — Must have achieved latest Built for NetSuite validation

3. **SDN Trailing Accounts** — Development, QA, and publisher accounts must be SDN trailing accounts

### Setting Up Managed SuiteApps

When creating a new SuiteApp Definition in the SuiteApp Control Center:

1. Select the **Managed** option (not Unmanaged).
2. This choice **cannot be changed** once the definition is created.
3. If options don't appear, request the feature via NetSuite support case.

**Important**: If a SuiteApp Definition is created as unmanaged, it cannot be changed to managed later.

## Best Practices

### SuiteApp Definition Setup

```
New SuiteApp Definition:
- SUITEAPP NAME: My SuiteApp
- PROJECT ID: mysuiteapp (cannot be edited later)
- PUBLISHER ID: com.yourcompany (cannot be edited later)
- Type: Managed (cannot be edited later)
```

### Key Considerations

1. **Request feature early** — Ensure Managed SuiteApp feature is enabled before creating definitions
2. **Plan for managed** — Cannot convert unmanaged to managed after creation
3. **Use SDN trailing accounts** — Provides stability during phased releases
4. **Test thoroughly** — Updates push automatically to all customers

## Common Pitfalls

1. **Creating unmanaged by mistake** — Cannot be changed to managed later
2. **Missing feature enablement** — Feature must be enabled before creating definition
3. **Wrong account type** — Must use SDN trailing accounts for the publisher environment
4. **Skipping BFN validation** — Required for managed SuiteApp distribution

## Further Reading

- Understanding Managed Bundles in NetSuite Help Center
- Publishing of SDF SuiteApps to SuiteApp Marketplace
