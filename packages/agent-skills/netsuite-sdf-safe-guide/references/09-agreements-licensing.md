# Principle 9: Agreements and Licensing
> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

This principle provides guidance on protecting ownership interest in your SuiteApps and preventing compromise of confidentiality in your products, services, and development efforts.

## Key Concepts

### Agreement Types

| Agreement Type | Purpose |
|----------------|---------|
| Employee/Consultant | IP ownership, assignment rights, confidentiality |
| Customer License | Terms for SuiteApp use |
| Professional Services | Implementation services terms |
| Privacy Policy | How customer data is collected and used |

### Critical Requirements

1. **Right to permit NetSuite** - Must have rights to make SuiteApp available through SuiteApp repository
2. **IP assignment** - Proper grants of ownership and assignment of intellectual property rights
3. **Confidentiality obligations** - Protect products, services, and development efforts
4. **Privacy commitments** - Describe how you collect and use customer data

## Best Practices

### Click-through Agreements

SuiteCloud technologies enable click-through agreements for your SuiteApp:

```
Bundle Builder > Bundle Properties > Terms of Service:
- Check "Requires Acceptance of Terms"
- Enter license agreement content
```

**Note**: For SuiteApp Control Center, click-through functionality is not yet GA.

### Protecting Intellectual Property

#### Code Source Rights

| Source Type | Considerations |
|-------------|----------------|
| Proprietary code | Copyrightable, subject to infringement |
| Open source code | Follow license conditions |
| Knowledge sharing platforms | Usually Creative Commons; short snippets may be fair use |
| AI/LLM generated code | May include proprietary content from training data |
| Self-generated code | Always the safest option |

#### Securing SuiteApp Content

Create `InstallationPreferences` folder in your SuiteApp project with:

```
COM.YOURCOMPANY.SUITEAPP/
├── src/
│   ├── FileCabinet/
│   └── InstallationPreferences/
│       ├── hiding.xml      ← Hide server-side scripts
│       ├── locking.xml     ← Lock custom objects
│       └── overwriting.xml
├── Objects/
├── deploy.xml
└── manifest.xml
```

**hiding.xml** – Control access to SuiteScript source code.
- Only use on server-side scripts (client-side must be downloadable by browsers).
- Prevents view, download, or overwrite of source code.

**locking.xml** – Prevent modification of custom objects.
- Cannot hide custom field definitions.
- Can lock to prevent intentional/unintentional modification.
- Ensures predictable behavior and backward compatibility.

### SDF and Publisher IDs

SDF provides trackability by tagging SuiteApps with Publisher IDs:

```javascript
// manifest.xml
<manifest projecttype="SUITEAPP">
    <publisherid>com.yourcompany</publisherid>
    <projectid>mysuiteapp</projectid>
    <projectversion>1.0.0</projectversion>
</manifest>
```

- Publisher IDs registered by SDN team
- Only available to SDN partners
- Provided during onboarding process
- Can be retroactively registered for existing partners

### Deployment Requirements

**Important**: As of version 2018.1, SDN Partner SuiteApps must be deployed to customer production accounts using:
- SuiteBundler, or
- SDF SuiteApp published via SuiteApp Marketplace

**Do NOT** deploy directly using SDF XML files and SuiteScript source code files.

## Code Examples

### hiding.xml Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<hidingpreferences>
    <files>
        <path>/SuiteScripts/ServerModule.js</path>
        <path>/SuiteScripts/ScheduledScript.js</path>
        <path>/SuiteScripts/MapReduceScript.js</path>
    </files>
</hidingpreferences>
```

### locking.xml Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<lockingpreferences>
    <objects>
        <path>/Objects/customrecord_myrecord.xml</path>
        <path>/Objects/customscript_myscript.xml</path>
    </objects>
</lockingpreferences>
```

### Account Authorization Pattern

```javascript
/**
 * Implement account authorization to ensure only authorized
 * customers can execute your SuiteApp
 * @NApiVersion 2.1
 */
define(['N/runtime', 'N/https'], (runtime, https) => {
    const AUTHORIZED_ACCOUNTS = ['TSTDRV123456', 'TSTDRV789012'];

    const isAuthorized = () => {
        const accountId = runtime.accountId;
        return AUTHORIZED_ACCOUNTS.includes(accountId);
    };

    const validateLicense = () => {
        if (!isAuthorized()) {
            throw new Error('Account not authorized for this SuiteApp');
        }
    };

    return { isAuthorized, validateLicense };
});
```

## Common Pitfalls

1. **Missing agreements** – Jeopardizes ownership interest in SuiteApp.
2. **Hiding client-side scripts** – Browsers cannot download hidden scripts.
3. **No account authorization** – Allows unauthorized use of your SuiteApp.
4. **Deploying via SDF directly** – Use proper distribution channels.
5. **Missing privacy policy** – Required for customer agreements.

## SuiteBundler Redistribution Risks (Legacy)

**Note**: SuiteBundler deployment not permitted for new SuiteApps starting in 24.1.

For existing SuiteBundles, mitigate redistribution risks:

1. Use click-through agreement with appropriate terms.
2. Enable "Hide in SuiteBundle" for SuiteScript source files.
3. Name customization objects with company name.
4. Set "Lock on Install" preferences.
5. Implement account authorization coding.

## Checklist

- [ ] Employee/consultant agreements include IP assignment
- [ ] Confidentiality obligations in place
- [ ] Customer license agreement prepared
- [ ] Privacy policy link included
- [ ] Click-through agreement configured
- [ ] hiding.xml configured for server-side scripts
- [ ] locking.xml configured for custom objects
- [ ] Account authorization implemented
- [ ] Publisher ID properly configured

## Further Reading

- Lockable Custom Objects Supported by SDF in NetSuite Help Center
- Sample agreements on partner portal
- SuiteCloud Terms of Service
