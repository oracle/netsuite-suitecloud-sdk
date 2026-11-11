# Principle 8: Maintain Your SuiteApps
> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

SuiteApp Control Center allows SDF SuiteApp developers to quickly define, install, or upgrade leading and lagging application versions across the customer install base. Proper maintenance requires understanding of SuiteApp Control Center, the SuiteApps themselves, and cloud application distribution practices.

## Key Concepts

### SuiteApp Naming Requirements

| Requirement | Description |
|-------------|-------------|
| Descriptive name | Must describe the feature or functionality delivered |
| No technical terms | Do not include "SDF" or "SuiteApp" in the name |
| Consistent naming | Use descriptive names (for example, "Japan Tax Reports") |
| Non-GA indication | Add "BETA" for non-GA SuiteApps |

### SuiteApp Control Center Features

- **Multi-tenant structures** — Serve multiple customers from a single location
- **Managed SuiteApp feature** — Automated upgrades without customer action
- **Leading/lagging versions** — Support version phasing during releases

### Publisher Environment Model

A typical ISV SDF SuiteApp publisher environment requires at least four accounts:

| Account Type | Purpose |
|--------------|---------|
| Development/Publisher | SuiteApp development, linked to Publisher ID |
| Trailing QA | QA testing on stable version |
| Leading QA | QA testing on new release version |
| Sales Demo | Product demonstrations |

## Best Practices

### Required SuiteCloud Features

Enable these features in development/publisher and QA accounts:

```
Setup → Company → Enable Features → SuiteCloud:

- SuiteScript
  - Client SuiteScript
  - Server SuiteScript
  - SuiteScript Server Pages
- SuiteTalk (Web Services)
  - SOAP Web Services
- Manage Authentication
  - Token-Based Authentication
- SuiteCloud Development Framework
  - SuiteCloud Development Framework
  - SuiteApp Control Center
```

### Development Process

```
┌─────────────────┐
│  IDE with       │
│  SuiteCloud SDK │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Deploy  │
    └────┬────┘
         │
┌────────▼────────┐     ┌─────────────────┐
│  Development    │────▶│   QA Accounts   │
│   Accounts      │     │ (Leading/Lagging)│
└─────────────────┘     └─────────────────┘
```

1. **Use SuiteCloud IDE** — VS Code with SuiteCloud Extension or WebStorm with SuiteCloud IDE Plug-in
2. **Deploy to development** — Test in development account first
3. **Use SuiteCloud CLI** — Automate validation and deployment with batch scripts
4. **Test in QA accounts** — Deploy to leading or lagging QA accounts

### Publishing Prerequisites

To publish an SDF SuiteApp to the SuiteApp Marketplace:

1. Defined and released in SuiteApp Control Center
2. BFN (Built for NetSuite) approved
3. SuiteApp listing submission approved by SDN

**Note**: These prerequisites can happen in any order. Review and approval can occur before the SuiteApp is defined in Control Center.

### Publishing Workflow

```
1. Create SuiteApp ZIP Archive
        ↓
2. Upload to SuiteApp Control Center
        ↓
3. Create SuiteApp Definition
        ↓
4. Release SuiteApp (leading or lagging)
        ↓
5. Submit BFN Questionnaire
        ↓
6. Submit PSD Record (Partner Solutions Directory)
        ↓
7. Await approvals
        ↓
8. SDN publishes listing → SuiteApp Marketplace
```

### Maintaining Publisher Account

- Ensure Publisher Account is linked to Publisher ID.
- Set Company Name correctly: `Setup > Company > Company Information`.
- If Publisher ID change needed, create support case via APC portal.

## Code Examples

### Using SuiteCloud CLI for Deployment

```bash
# Validate project
suitecloud project:validate

# Deploy to account
suitecloud project:deploy --accountid TSTDRV123456

# Create project package
suitecloud project:package
```

### SuiteApp Version Management

```javascript
// manifest.xml version structure
<manifest projecttype="SUITEAPP">
    <projectname>com.mycompany.mysuiteapp</projectname>
    <projectversion>1.0.0</projectversion>
    <frameworkversion>1.0</frameworkversion>
</manifest>
```

## Common Pitfalls

1. **Wrong project type** — Set project as "SuiteApp" not "Account Customization".
2. **Missing Publisher ID** — Required for SuiteApp projects.
3. **Deploying directly to production** — Use SuiteBundler or SuiteApp Marketplace, not SDF Deploy.
4. **Skipping QA accounts** — Test on both leading and lagging QA accounts.
5. **Incorrect Application ID** — Must match in listing for proper linking.

## Checklist

- [ ] SuiteCloud features enabled in all accounts
- [ ] Developer role assigned to development users
- [ ] Token credentials configured for IDE
- [ ] Publisher account linked to Publisher ID
- [ ] QA accounts set up (leading and lagging)
- [ ] SuiteApp Definition created correctly
- [ ] BFN review completed
- [ ] SuiteApp listing submitted and approved

## Further Reading

- SDF Custom Object Dependencies in SuiteApps
- SuiteCloud Project Deployment Preparation
- Getting Started with SuiteCloud SDK
- SuiteApp Versions in NetSuite Help Center
