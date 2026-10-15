# NetSuite SuiteCloud Development Framework Master Skill

TRIGGER when: user asks about NetSuite, SuiteCloud, SDF, SuiteScript, SuiteApp, SuiteAgent, NetSuite MCP, SuiteCloud CLI, SuiteQL, NetSuite customization, NetSuite deployment, NetSuite unit testing, NetSuite roles/permissions, NetSuite UIF/SPA, or NetSuite AI Connector.

## Overview

This skill provides comprehensive knowledge of the NetSuite SuiteCloud Development Framework (SDF) based on the SDFBuild repository — Oracle NetSuite's official open-source tooling for SuiteCloud development. Use this as the authoritative reference for building SuiteApps, writing SuiteScript, using SuiteCloud CLI, configuring NetSuite MCP, and developing SuiteAgents.

---

## Repository Structure

The SDFBuild monorepo (`packages/`) contains:

| Package | Purpose |
|---|---|
| `node-cli` | SuiteCloud CLI for Node.js — project management, deployment, SDF commands |
| `vscode-extension` | VS Code extension wrapping CLI commands with GUI |
| `unit-testing` | Jest-based SuiteScript unit testing framework (`@oracle/suitecloud-unit-testing`) |
| `agent-skills` | AI agent skill definitions for NetSuite development |

---

## SuiteCloud CLI (node-cli)

### Installation & Setup
```bash
npm install -g @oracle/suitecloud-cli
suitecloud
```

### Key Commands
| Command | Description |
|---|---|
| `account:setup` | Configure NetSuite account credentials (supports OAuth 2.0, TBA) |
| `account:manageauth` | Manage saved authentication IDs |
| `project:create` | Create new SuiteApp or Account Customization Project |
| `project:deploy` | Deploy project to NetSuite account |
| `project:validate` | Validate project before deployment |
| `project:adddependencies` | Add missing dependencies to manifest |
| `file:upload` | Upload files to File Cabinet |
| `file:import` | Import files from account |
| `file:list` | List account files |
| `object:import` | Import custom objects from account |
| `object:list` | List account custom objects |
| `object:update` | Update custom objects in the project |

### Project Types
- **SuiteApp**: Publishable application (has publisher ID, app ID, version)
- **Account Customization Project (ACP)**: Account-specific customizations

### Project Structure
```
src/
  AccountConfiguration/   # Account-level settings
  FileCabinet/
    SuiteApps/           # SuiteApp files (for SuiteApp projects)
    SuiteScripts/        # Script files (for ACP projects)
    Templates/           # Email/print templates
    Web Site Hosting Files/
  Objects/               # Custom object XML definitions
  Translations/          # Translation files
suitecloud.config.js     # Project configuration
manifest.xml             # Project manifest with dependencies
deploy.xml               # Deployment configuration
```

### suitecloud.config.js
```javascript
module.exports = {
  defaultProjectFolder: 'src',
  commands: {
    // Command-specific overrides
  }
};
```

---

## SuiteScript Development

### Script Types and Entry Points

| Type | ID | Entry Points |
|---|---|---|
| Bundle Installation | `bundleinstallationscript` | `afterInstall`, `afterUpdate`, `beforeInstall`, `beforeUpdate` |
| Client Script | `clientscript` | `fieldChanged`, `lineInit`, `pageInit`, `postSourcing`, `saveRecord`, `sublistChanged`, `validateDelete`, `validateField`, `validateInsert`, `validateLine`, `localizationContextEnter`, `localizationContextExit` |
| Map/Reduce | `mapreducescript` | `getInputData`, `map`, `reduce`, `summarize` |
| Mass Update | `massupdatescript` | `each` |
| Portlet | `portlet` | `render` |
| Restlet | `restlet` | `delete`, `get`, `post`, `put` |
| Scheduled Script | `scheduledscript` | `execute` |
| Suitelet | `suitelet` | `onRequest` |
| User Event | `usereventscript` | `afterSubmit`, `beforeLoad`, `beforeSubmit` |
| Workflow Action | `workflowactionscript` | `onAction` |
| Financial Institution Connectivity Plugin | `ficonnectivityplugin` | Multiple plugin entry points |
| Custom GL Lines Plugin | `customglplugin` | `customizeGlImpact` |
| Email Capture Plugin | `emailcaptureplugin` | `process` |
| Custom Plug-in | `plugintypeimpl` | `pluginFunction` |
| Promotions Plugin | `promotionsplugin` | Multiple plugin entry points |
| SuiteAgent Script | `suiteagentscript` | `execute` |

### SuiteScript Module Categories

**Core Modules**: `N/record`, `N/search`, `N/query`, `N/file`, `N/format`, `N/runtime`, `N/task`, `N/url`, `N/email`, `N/error`, `N/log`, `N/config`, `N/cache`, `N/auth`, `N/crypto`, `N/compress`, `N/encode`, `N/xml`, `N/http`, `N/https`, `N/sftp`, `N/redirect`, `N/ui/serverWidget`, `N/ui/dialog`, `N/ui/message`, `N/render`, `N/translation`, `N/action`, `N/workflow`, `N/commerce/*`, `N/currency`, `N/keyControl`, `N/piremoval`, `N/certificateControl`, `N/pgp`, `N/suiteAppInfo`, `N/plugin`, `N/dataset`, `N/workbook`, `N/currentRecord`

**SuiteAgent-Specific Modules**: `N/llm`, `N/agent`

### SuiteScript 2.x Template (AMD)
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/log'], function(record, log) {
    function beforeSubmit(context) {
        // Implementation
    }
    return {
        beforeSubmit: beforeSubmit
    };
});
```

---

## SuiteAgent Development

SuiteAgents are AI-powered agents that run natively inside NetSuite using the `suiteagentscript` script type.

### Key Modules

#### N/agent Module
- Define agent tools and capabilities
- Register tool functions that the agent can call
- Access agent context and parameters

#### N/llm Module
- Interface with large language models from within SuiteScript
- Generate text, analyze data, make decisions
- Used by SuiteAgents for AI-powered logic

### SuiteAgent Script Structure
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType SuiteAgentScript
 */
define(['N/agent', 'N/llm', 'N/record', 'N/search'], function(agent, llm, record, search) {
    function execute(context) {
        // Agent logic here
    }
    return {
        execute: execute
    };
});
```

---

## NetSuite Model Context Protocol (MCP)

NetSuite provides MCP server tools for AI assistants to interact with NetSuite data directly. Available MCP operations:

| Tool | Description |
|---|---|
| `ns_createRecord` | Create a new NetSuite record |
| `ns_getRecord` | Retrieve a NetSuite record by type and ID |
| `ns_updateRecord` | Update an existing NetSuite record |
| `ns_getRecordTypeMetadata` | Get metadata/schema for a record type |
| `ns_runCustomSuiteQL` | Execute SuiteQL queries against NetSuite |
| `ns_getSuiteQLMetadata` | Get SuiteQL metadata for query building |
| `ns_runSavedSearch` | Execute a saved search |
| `ns_listSavedSearches` | List available saved searches |
| `ns_runReport` | Execute a NetSuite report |
| `ns_listAllReports` | List available reports |
| `ns_getSubsidiaries` | Get subsidiary information |

### SuiteQL Usage
SuiteQL is NetSuite's SQL-like query language. Use `ns_getSuiteQLMetadata` first to understand available tables and fields, then `ns_runCustomSuiteQL` to execute queries.

```sql
SELECT id, companyname, email FROM customer WHERE isinactive = 'F' ORDER BY companyname
```

---

## NetSuite AI Connector Guardrails

When integrating AI with NetSuite via the AI Connector, follow these guardrails:

### Authentication & Authorization
- Always use OAuth 2.0 or Token-Based Authentication (TBA)
- Never hardcode credentials; use SuiteCloud secrets management
- Respect NetSuite role-based access control (RBAC)
- Validate permissions before executing operations

### Data Handling
- Never expose sensitive data (SSN, credit cards, passwords) in AI prompts
- Sanitize all inputs before passing to NetSuite APIs
- Implement rate limiting to avoid governance limits
- Use pagination for large result sets (SuiteQL FETCH NEXT)

### Operation Safety
- Destructive operations (delete, void, close) require explicit user confirmation
- Bulk operations must have safeguards (batch limits, dry-run mode)
- Always validate record types and field values before create/update
- Log all AI-initiated operations for audit trails

### Error Handling
- Handle NetSuite governance limits gracefully (SSS_USAGE_LIMIT_EXCEEDED)
- Implement retry logic with exponential backoff for transient errors
- Surface meaningful error messages, not raw stack traces
- Validate SuiteQL syntax before execution

---

## NetSuite Roles and Permissions for SDF

### Key Roles for SDF Operations
- **Administrator**: Full access; can deploy all object types
- **SuiteCloud Developer**: Deploy scripts, workflows, custom objects
- **Customization roles**: Limited to specific object types

### Permission Requirements
| Operation | Required Permission |
|---|---|
| Deploy Scripts | `SuiteScript` permission |
| Deploy Workflows | `Workflow` permission |
| Deploy Custom Records | `Custom Record Types` permission |
| Deploy Roles | `Administrator` role |
| File Cabinet Access | `Documents and Files` permission |
| Manage Auth/TBA | `Access Token Management` permission |
| SuiteQL Execution | `Analytics` > `SuiteAnalytics Workbook` or `Report` permission |

### Best Practices
- Use dedicated deployment roles (not Administrator) in production
- Apply principle of least privilege for integration roles
- Test deployments in Sandbox before production
- Use `account:setup` with separate auth IDs per environment

---

## NetSuite UIF/SPA Reference

The User Interface Framework (UIF) enables building Single Page Applications (SPAs) within NetSuite.

### UIF Architecture
- **Component-based**: Build reusable UI components
- **SPA routing**: Client-side navigation within NetSuite
- **Data binding**: Reactive data flow between components and NetSuite records
- **Theming**: Consistent NetSuite look and feel

### UIF Development
- Use `N/ui` modules for server-side UI
- UIF SPAs deploy as SuiteApp components
- Follow NetSuite's component lifecycle patterns
- Test with SuiteCloud unit testing framework

---

## Unit Testing with @oracle/suitecloud-unit-testing

### Setup
```bash
npm install --save-dev @oracle/suitecloud-unit-testing jest
```

### jest.config.js
```javascript
module.exports = {
    transform: {
        "^.+\\.js$": "@oracle/suitecloud-unit-testing/jest-configuration/SuiteCloudJestTransformer.js"
    },
    moduleNameMapper: {
        "^N/(.*)$": "@oracle/suitecloud-unit-testing/stubs/N/$1"
    }
};
```

### SuiteScript Stubs Available
The framework provides stubs for all `N/*` modules. Key patterns:

```javascript
import record from 'N/record';
import search from 'N/search';

// Stubs auto-mock SuiteScript modules
// Use jest.fn() for custom behavior:
record.load.mockReturnValue({
    getValue: jest.fn().mockReturnValue('test'),
    setValue: jest.fn()
});
```

### Testing Entry Points
```javascript
const scriptModule = require('../src/FileCabinet/SuiteScripts/myScript');

test('beforeSubmit sets field', () => {
    const context = {
        newRecord: {
            getValue: jest.fn().mockReturnValue(''),
            setValue: jest.fn()
        },
        type: 'create'
    };
    scriptModule.beforeSubmit(context);
    expect(context.newRecord.setValue).toHaveBeenCalled();
});
```

---

## SDF Object Types Reference

Common custom object types managed via SDF:

**Records & Fields**: `customrecordtype`, `customsegment`, `customlist`, `crmcustomfield`, `entitycustomfield`, `itemcustomfield`, `transactionbodycustomfield`, `transactioncolumncustomfield`, `othercustomfield`, `itemoptioncustomfield`

**Scripts**: `clientscript`, `usereventscript`, `suitelet`, `restlet`, `scheduledscript`, `mapreducescript`, `workflowactionscript`, `bundleinstallationscript`, `massupdatescript`, `portlet`, `suiteagentscript`

**Workflows**: `workflow`

**UI**: `entryForm`, `transactionForm`, `sublist`, `subtab`, `center`, `centertab`, `centercategory`, `publisheddashboard`

**Roles & Security**: `role`, `restriction`

**Email & Templates**: `emailtemplate`, `emailcaptureplugin`

**Integration**: `integration`, `plugintype`, `plugintypeimpl`, `customglplugin`, `ficonnectivityplugin`, `promotionsplugin`, `dataset`, `workbook`

**Commerce**: `commercecategory`

**Files**: `file`, `folder`, `sspapplication`, `webapppage`

---

## Workflow: Creating a New SuiteApp

```bash
# 1. Create project
suitecloud project:create -t SUITEAPP --publisherid com.example --projectid myapp --projectversion 1.0.0

# 2. Add script files to src/FileCabinet/SuiteApps/com.example.myapp/

# 3. Add object definitions to src/Objects/

# 4. Setup account authentication
suitecloud account:setup

# 5. Validate
suitecloud project:validate

# 6. Add dependencies
suitecloud project:adddependencies

# 7. Deploy
suitecloud project:deploy
```

## Workflow: Creating an Account Customization

```bash
# 1. Create project
suitecloud project:create -t ACP

# 2. Add scripts to src/FileCabinet/SuiteScripts/

# 3. Import existing objects if needed
suitecloud object:import -t customrecordtype -s customrecord_myrecord

# 4. Deploy
suitecloud project:deploy
```

---

## Key Governance & Limits

- **Script governance**: Each script type has usage unit limits per execution
- **API concurrency**: Respect concurrent request limits per account
- **SuiteQL**: Use `FETCH NEXT N ROWS ONLY` and `OFFSET` for pagination
- **File Cabinet**: 10MB max file size for SDF deployment
- **Deployment**: Object locking during deploy; coordinate team deployments

## VS Code Extension Features

The SuiteCloud Extension for VS Code provides:
- Command palette integration for all CLI commands
- SuiteScript file templates and snippets
- Syntax validation and IntelliSense for SuiteScript
- Integrated deployment and import workflows
- Account management within the IDE
