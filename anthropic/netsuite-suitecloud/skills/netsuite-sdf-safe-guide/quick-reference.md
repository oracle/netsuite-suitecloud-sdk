# NetSuite SDF Safe Guide – Quick Reference Guide

**Created by:** Oracle NetSuite

**For NetSuite Platform Developers and Solution Consultants using coding assistants such as Claude Code, Codex or Cline**

---

## Overview

Comprehensive NetSuite SuiteCloud Development Framework (SDF) best practices guide. This guide:
- **Generates** Object XML files for all 14 SuiteScript types.
- **Enforces** deployment configurations and conventions.
- **Documents** common pitfalls and solutions.
- **Guides** logging, permissions, and script deployment.

Works with supported coding assistants, including:
- **Claude Code** (via Skills).
- **Cline** (via `.clinerules`).

---

## How to Use

### Manual Invocation (Slash Command)
Invoke this skill at any time by typing:
```
/netsuite-sdf-safe-guide
```

Or use natural language triggers:
- `generate objects` – Scan the SuiteScripts folder and create missing Object XML files.
- `create object for this script` – Generate Object XML for the current or specified file.
- `check my deployment XML` – Review and validate existing Object XML files.

### Optional Coding Assistant Activation Example
For Claude Code, add this to your project's `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "Skill(netsuite-sdf-safe-guide)",
      "Skill(netsuite-suitescript-learning)"
    ]
  }
}
```

With skill preloading configured, an assistant will automatically apply SDF best practices when you:
- Work on any NetSuite SDF project (SuiteApps or Account Customization projects).
- Create or modify SuiteScript files (all 14 script types, including Suitelets, RESTlets, etc.).
- Work with Object XML files, custom records, custom fields, or other SDF objects.
- Configure deployment settings, `manifest.xml`, or `deploy.xml`.

### Using Cline
Add a `.clinerules` file to your project root with the rule content.

---

## Quick Start

### Claude Code Example
```
generate objects
```

### Cline Example
```
generate objects
```
(Requires `.clinerules` file in project root.)

---

## What It Does

### Object Generation
1. **Scans** `/SuiteScripts/` for `.js` files with `@NScriptType` annotations.
2. **Normalizes** filenames (lowercase, underscores, maximum 40 characters).
3. **Generates** Object XML files in `/Objects/`.
4. **Creates** schema files for CustomTool scripts.
5. **Updates** `manifest.xml` for server-side scripts.

### Best Practices Enforcement
6. **Validates** deployment configurations (`runasrole`, `allroles`, status).
7. **Documents** 124+ common pitfalls with solutions (see the full list in `SKILL.md`).
8. **Recommends** architecture patterns (Suitelet-as-API, `postMessage`).
9. **Identifies** performance issues (N+1 queries, search field selection).
10. **Configures** appropriate logging levels (development vs. production).

---

## Supported Script Types (14 Total)

| # | Script Type | Prefix | Has Deployment | Needs Record Type |
|---|-------------|--------|----------------|-------------------|
| 1 | BundleInstallationScript | `customscript_` | No | No |
| 2 | ClientScript | `customscript_` | Yes | Yes |
| 3 | CustomTool (ToolSet) | `custtoolset_` (2026.1+) / `customtool_` (2025.2) | No | No (needs schema) |
| 4 | MapReduceScript | `customscript_` | Yes | No |
| 5 | MassUpdateScript | `customscript_` | Yes | Yes |
| 6 | Portlet | `customscript_` | Yes | No |
| 7 | Restlet | `customscript_` | Yes | No |
| 8 | ScheduledScript | `customscript_` | Yes | No |
| 9 | SDFInstallationScript | `customscript_` | No | No |
| 10 | **SpaServerScript** | `custspa_` | No* | No |
| 11 | **SpaClientScript** | `custspa_` | No* | No |
| 12 | Suitelet | `customscript_` | Yes | No |
| 13 | UserEventScript | `customscript_` | Yes | Yes |
| 14 | WorkflowActionScript | `customscript_` | Yes | Yes |

*SPA scripts use a single `<singlepageapp>` object for both client and server scripts.

---

## Critical: Bracket Notation for File Paths

**All `<scriptfile>` and `<rpcschema>` paths MUST be wrapped in square brackets `[]`**.

### Correct (Will Deploy Successfully)
```xml
<scriptfile>[/SuiteScripts/my_script.js]</scriptfile>
<rpcschema>[/SuiteScripts/my_script_schema.json]</rpcschema>
```

### Incorrect (Will Fail Deployment)
```xml
<scriptfile>/SuiteScripts/my_script.js</scriptfile>
<rpcschema>/SuiteScripts/my_script_schema.json</rpcschema>
```

**Why?** NetSuite SDF uses brackets to indicate file references within the File Cabinet. Without them, the deployment system cannot resolve the path.

---

## Critical: Run As Role Support

**Only certain script types support `<runasrole>` and `<allroles>` in deployments!**

| Script Type | runasrole | allroles | Notes |
|-------------|-----------|----------|-------|
| UserEventScript | YES | YES | |
| Suitelet | YES | YES | |
| Portlet | NO | YES | Omit runasrole to run as current user |
| ClientScript | NO | NO | |
| Restlet | NO | NO | |
| MapReduceScript | NO | NO | Uses NOTSCHEDULED status |
| ScheduledScript | NO | NO | Uses NOTSCHEDULED status |
| MassUpdateScript | NO | NO | |
| WorkflowActionScript | NO | NO | Requires recordtype |

**Important:** `<allroles>T</allroles>` selects **internal roles only**. For external roles (Customer Center, Partner Center, Vendor Center), add `<audslctrole>` elements to the scriptdeployment. See [05-security-privacy.md](references/05-security-privacy.md) for details.

---

## Logging Configuration

**The `<loglevel>` element is OPTIONAL**; omit it entirely to disable logging.

| Level | Captures | Use Case |
|-------|----------|----------|
| `DEBUG` | All logs | Development |
| `AUDIT` | Audit, error, emergency | Production with monitoring |
| `ERROR` | Error, emergency | Production minimal |
| `EMERGENCY` | Emergency only | Critical errors only |
| *(omit element)* | No logs | Production, no logging |

**With logging (development):**
```xml
<scriptdeployment scriptid="customdeploy_my_script">
    <isdeployed>T</isdeployed>
    <loglevel>DEBUG</loglevel>
    <status>RELEASED</status>
</scriptdeployment>
```

**Without logging (production):**
```xml
<scriptdeployment scriptid="customdeploy_my_script">
    <isdeployed>T</isdeployed>
    <!-- No <loglevel> = no logging -->
    <status>RELEASED</status>
</scriptdeployment>
```

---

## Filename Requirements

| Rule | Example |
|------|---------|
| Lowercase only | `MyScript.js` → `myscript.js` |
| Underscores, not hyphens | `my-script.js` → `my_script.js` |
| Max 40 characters (script ID) | Truncated if needed |

---

## Project Structure

```
src/
  manifest.xml
  FileCabinet/
    SuiteScripts/
      my_suitelet.js
      my_tool.js
      my_tool_schema.json    ← auto-created for CustomTool
  Objects/
    customscript_my_suitelet.xml
    custtoolset_my_tool.xml
```

---

## XML Template Examples

### Suitelet (Supports runasrole)

> **SECURITY:** Never use `ADMINISTRATOR` as runasrole. Create a custom role with minimum permissions.

```xml
<suitelet scriptid="customscript_my_suitelet">
  <name>My Suitelet</name>
  <scriptfile>[/SuiteScripts/my_suitelet.js]</scriptfile>
  <description></description>
  <isinactive>F</isinactive>
  <notifyadmins>F</notifyadmins>
  <notifyowner>T</notifyowner>
  <scriptdeployments>
    <scriptdeployment scriptid="customdeploy_my_suitelet">
      <isdeployed>T</isdeployed>
      <loglevel>DEBUG</loglevel>
      <!-- SECURITY: Use least-privilege custom role. See 05-security-privacy.md -->
      <runasrole>[CUSTOM_ROLE_OR_REMOVE]</runasrole>
      <status>RELEASED</status>
      <title>My Suitelet</title>
      <allroles>T</allroles>
    </scriptdeployment>
  </scriptdeployments>
</suitelet>
```

### Restlet (No runasrole/allroles)
```xml
<restlet scriptid="customscript_my_restlet">
  <name>My Restlet</name>
  <scriptfile>[/SuiteScripts/my_restlet.js]</scriptfile>
  <description></description>
  <isinactive>F</isinactive>
  <notifyadmins>F</notifyadmins>
  <notifyowner>T</notifyowner>
  <scriptdeployments>
    <scriptdeployment scriptid="customdeploy_my_restlet">
      <isdeployed>T</isdeployed>
      <loglevel>DEBUG</loglevel>
      <status>RELEASED</status>
      <title>My Restlet</title>
    </scriptdeployment>
  </scriptdeployments>
</restlet>
```

### CustomTool / ToolSet (Minimal Elements Only)

**NetSuite 2026.1+ Format** (flat `<toolset>` structure with `custtoolset_` prefix):

```xml
<!-- NetSuite 2026.1+ -->
<toolset scriptid="custtoolset_my_tool">
  <name>My Tool</name>
  <scriptfile>[/SuiteScripts/my_tool.js]</scriptfile>
  <rpcschema>[/SuiteScripts/my_tool_schema.json]</rpcschema>
  <exposetoaiconnector>T</exposetoaiconnector>
  <permissions>
    <permission>
      <permkey>LIST_CONTACT</permkey>
      <permlevel>VIEW</permlevel>
    </permission>
  </permissions>
</toolset>
```

**Note:** CustomTool does NOT support `<description>`, `<isinactive>`, `<notifyadmins>`, or `<notifyowner>`. The `<exposetoaiconnector>` element was formerly `<exposeto3rdpartyagents>` (before 2026.1).

### Portlet (No runasrole; Runs as Current User)
```xml
<portlet scriptid="customscript_my_portlet">
  <name>My Portlet</name>
  <scriptfile>[/SuiteScripts/my_portlet.js]</scriptfile>
  <portlettype>HTML</portlettype>
  <description></description>
  <isinactive>F</isinactive>
  <notifyadmins>F</notifyadmins>
  <notifyemails></notifyemails>
  <notifyowner>T</notifyowner>
  <scriptdeployments>
    <scriptdeployment scriptid="customdeploy_my_portlet">
      <isdeployed>T</isdeployed>
      <loglevel>DEBUG</loglevel>
      <status>RELEASED</status>
      <title>My Portlet</title>
      <allroles>T</allroles>
    </scriptdeployment>
  </scriptdeployments>
</portlet>
```

**Portlet Type Selection:**
- `HTML` (default) – Custom HTML content
- `FORM` – User mentions "form", "input", "data entry"
- `LIST` – User mentions "list", "table", "grid"
- `LINKS` – User mentions "links", "navigation", "menu"

### ScheduledScript (NOTSCHEDULED Status, No runasrole)
```xml
<scheduledscript scriptid="customscript_my_scheduled">
  <name>My Scheduled Script</name>
  <scriptfile>[/SuiteScripts/my_scheduled.js]</scriptfile>
  <description></description>
  <isinactive>F</isinactive>
  <notifyadmins>F</notifyadmins>
  <notifyowner>T</notifyowner>
  <scriptdeployments>
    <scriptdeployment scriptid="customdeploy_my_scheduled">
      <isdeployed>T</isdeployed>
      <loglevel>DEBUG</loglevel>
      <status>NOTSCHEDULED</status>
      <title>My Scheduled Script</title>
    </scriptdeployment>
  </scriptdeployments>
</scheduledscript>
```

**Note:** ScheduledScript does not support `<defaultfunction>`; entry point is auto-detected.

### MapReduceScript (NOTSCHEDULED Status, No runasrole)
```xml
<mapreducescript scriptid="customscript_my_mapreduce">
  <name>My Map Reduce</name>
  <scriptfile>[/SuiteScripts/my_mapreduce.js]</scriptfile>
  <description></description>
  <isinactive>F</isinactive>
  <notifyadmins>F</notifyadmins>
  <notifyowner>T</notifyowner>
  <scriptdeployments>
    <scriptdeployment scriptid="customdeploy_my_mapreduce">
      <isdeployed>T</isdeployed>
      <loglevel>DEBUG</loglevel>
      <status>NOTSCHEDULED</status>
      <title>My Map Reduce</title>
    </scriptdeployment>
  </scriptdeployments>
</mapreducescript>
```

### BundleInstallationScript (No Deployment, No Entry Point XML)
```xml
<bundleinstallationscript scriptid="customscript_my_bundle">
  <name>My Bundle Install</name>
  <scriptfile>[/SuiteScripts/my_bundle.js]</scriptfile>
  <description></description>
  <isinactive>F</isinactive>
  <notifyadmins>F</notifyadmins>
  <notifyowner>T</notifyowner>
</bundleinstallationscript>
```

**Note:** Entry point functions (`<beforeinstallfunction>`, etc.) are not supported because they are autodetected from JS.

### Single Page Application (SPA)
**Note:** Both SpaServerScript and SpaClientScript are defined in one object.

```xml
<singlepageapp scriptid="custspa_my_app">
  <name>My SPA</name>
  <description>Single Page Application</description>
  <url>my-spa-url</url>
  <folder>[/SuiteScripts/my_spa/]</folder>
  <clientscriptfile>[/SuiteScripts/my_spa/SpaClient.js]</clientscriptfile>
  <serverscriptfile>[/SuiteScripts/my_spa/SpaServer.js]</serverscriptfile>
  <assetsfolder>[/SuiteScripts/my_spa/assets/]</assetsfolder>
  <loglevel>DEBUG</loglevel>
  <audienceallroles>T</audienceallroles>
</singlepageapp>
```

**SPA Entry Points:**
- SpaServerScript: `export const initializeSpa = (context) => {}`
- SpaClientScript: `export const run = (context) => {}`

---

## Defensive Coding Practices

**Core Principle:** Assume you're not the only code working on a record. Multiple User Event Scripts, Workflows, SuiteFlow, SuiteApps, and bundles may all trigger on the same event.

### Key Rules

| Rule | Why | How |
|------|-----|-----|
| Check before overwriting | Other scripts may have set the value | `if (!currentValue) { setValue(...) }` |
| Check execution context | Skip unwanted triggers | `runtime.executionContext` |
| Verify records exist | Prevent load failures | Targeted search or `try/catch` before `record.load()` |
| Make operations idempotent | Safe to re-run | Check if record already exists before creating |
| Handle errors gracefully | Don't break other scripts | Wrap `afterSubmit` in try/catch |
| Use coordination flags | Script ordering | Custom fields like `custbody_script_a_complete` |

### Quick Patterns

```javascript
const beforeSubmit = (context) => {
    const record = context.newRecord;

// Check before overwriting
const current = record.getValue({ fieldId: 'custbody_status' });
if (!current) {
    record.setValue({ fieldId: 'custbody_status', value: 'PENDING' });
}

// Check execution context
if (runtime.executionContext === runtime.ContextType.CSV_IMPORT) {
    return; // Skip for imports
}

// Verify before loading
const exists = search.create({
    type: 'customrecord_config',
    filters: [['internalid', 'anyof', configId]],
    columns: ['internalid']
}).run().getRange({ start: 0, end: 1 });
if (exists.length > 0) {
    const rec = record.load({ type: 'customrecord_config', id: configId });
}
};
```

---

## Inactive Record Filtering

When querying records (N/search, N/query, or SuiteQL), always filter out inactive records unless the user explicitly needs them. Many record types (items, customers, vendors, employees, contacts, custom records) have an `isinactive` field. Forgetting to filter returns deactivated data that shouldn't appear in reports, searches, or automated processes. See pitfall #95 in SKILL.md.

### N/search Pattern
```javascript
// Add to filters array.
['isinactive', 'is', 'F']
```

### N/query (SuiteQL) Pattern
```javascript
// Add to WHERE clause. Use NVL because isinactive can be NULL.
WHERE NVL(isinactive, 'F') = 'F'
```

### Record Types with `isinactive`
Most entity, item, and list records have this field: Customer, Vendor, Employee, Contact, Partner, Item (all subtypes), Custom Records, and many more. Transaction records (Sales Order, Invoice, etc.) do **not** have `isinactive`. Use transaction status fields instead.

### When to Skip
- The user explicitly requests inactive records (for example, "show all customers including inactive").
- The script is a cleanup/archival process targeting inactive records.
- The record type does not have an `isinactive` field (transactions, most sublists).

---

## SuiteScript Governance & Limits

### Usage Unit Limits by Script Type

| Script Type | Units | Time Limit |
|-------------|-------|------------|
| User Event / Client / Suitelet / Portlet | 1,000 | 300s (5 min) |
| RESTlet | 5,000 | 300s |
| Scheduled Script | 10,000 | 3,600s (1 hour) |
| Map/Reduce | No overall limit | Varies by stage |

### Common API Costs

| Operation | Units | Notes |
|-----------|-------|-------|
| `search.lookupFields()` | 1 | **Most efficient** |
| `record.load()` | 2 / 5 / 10 | Custom / non-transaction / transaction |
| `record.save()` | 20 | Per SAFE Guide Principle 2 |
| `record.create()` | 2 / 5 / 10 | Custom / non-transaction / transaction |
| `ResultSet.each()` | 10 | |
| `email.send()` | 20 | Per SAFE Guide Principle 2 |
| `https.request()` | 10 | |

### Key Limits

| Limit | Value |
|-------|-------|
| Standard search results | 1,000 records |
| Saved search with `.each()` | 4,000 records |
| Company-wide log calls | 100,000 per 60 min |

### Governance Pattern

```javascript
// Always check before expensive loops.
const beforeSubmit = (context) => {
    const remaining = runtime.getCurrentScript().getRemainingUsage();
    if (remaining < 100) {
        log.audit('Stopping', 'Low governance units');
        return;
    }
};
```

**Note:** Client Scripts attached to forms ignore `log.*` calls. Use `console.log()` instead.

---

## Performance Monitoring

### Queryable System Tables

| Table | What It Tracks | Coverage |
|---|---|---|
| `scheduledscriptinstance` | Execution duration, status, M/R stage | Scheduled + Map/Reduce only |
| `scriptnote` | Log entries (debug/audit/error/emergency) | All server-side scripts |
| `scriptdeployment` | Deployment config, status, log level | All script types |
| `script` | Script master records | All script types |

**Not queryable via SuiteQL:** APM dashboard data, UE/Suitelet/RESTlet execution times, governance consumption per execution.

### PERF_TIMING Quick Pattern

For script types without native timing (User Event, Suitelet, RESTlet):

```javascript
// Gate behind toggle (always OFF by default).
const PERF_ENABLED = runtime.getCurrentScript().getParameter({
    name: 'custscript_perf_timing'
});

const _logPerf = (entry, startTime) => {
    if (!PERF_ENABLED) return;
    log.audit('PERF_TIMING', JSON.stringify({
        script: runtime.getCurrentScript().id,
        deploy: runtime.getCurrentScript().deploymentId,
        entry,
        duration_ms: Date.now() - startTime,
        remaining_units: runtime.getCurrentScript().getRemainingUsage(),
        context: runtime.executionContext.toString()
    }));
};

// Wrap each entry point.
const afterSubmit = (context) => {
    const _start = Date.now();
    try { /* ... logic ... */ }
    finally { _logPerf('afterSubmit', _start); }
};
```

See [appendix-perf-timing.md](references/appendices/appendix-perf-timing.md) for complete patterns by script type.

### Governance Budget Estimation Formula

```
Estimated cost = SUM(operation_count x unit_cost) + loop_multiplier
Budget utilization = estimated_cost / script_type_limit x 100%
```

| Threshold | Status | Action |
|---|---|---|
| 0-50% | OK | No action needed |
| 51-80% | Caution | Monitor with PERF_TIMING |
| 81-100% | High Risk | Optimize or offload to Map/Reduce |
| >100% | Over Limit | Refactor required |

### Key Performance Queries

```sql
-- Average execution time (Scheduled/M-R, last 7 days).
SELECT sd.title, ROUND(AVG((si.endDate - si.startDate) * 86400), 1) AS avg_s
FROM scheduledscriptinstance si
    INNER JOIN scriptdeployment sd ON sd.id = si.scriptDeployment
WHERE si.startDate >= SYSDATE - 7 AND si.status = 'Complete' AND si.endDate IS NOT NULL
GROUP BY sd.title ORDER BY avg_s DESC

-- Error count by script (last 7 days).
SELECT sn.scriptType, COUNT(*) AS errors
FROM scriptnote sn WHERE sn.type = 'ERROR' AND sn.date >= SYSDATE - 7
GROUP BY sn.scriptType ORDER BY errors DESC
```

See [appendix-perf-queries.md](references/appendices/appendix-perf-queries.md) for the full query catalog.

---

## Common Pitfalls

| # | Problem | Cause | Solution |
|---|---------|-------|----------|
| 1 | Deployment fails with path error | Missing brackets on scriptfile | Add `[]` around path |
| 2 | "Script ID too long" error | ID exceeds 40 chars | Use shorter filename |
| 3 | Script won't deploy | Missing SERVERSIDESCRIPTING | Check manifest.xml |
| 4 | Script not detected | Missing @NScriptType | Add JSDoc annotation |
| 5 | Deployment validation error | runasrole on unsupported type | Remove from Restlet, Scheduled, MapReduce, etc. |
| 6 | Portlet runs as admin | runasrole included | Remove runasrole from Portlet |
| 7 | Popup can't communicate with parent | Using window.opener.function() | Use postMessage API |
| 8 | pageInit not firing | clientScriptModulePath issue | Put setup code at module level |
| 9 | Search returns wrong items | Too many fields in filter | Only search itemid + displayname |
| 10 | Slow performance | N+1 query problem | Use batch lookups with 'anyof' |
| 11 | Script conflicts with other scripts | Assuming you're the only code | Check values before overwriting |
| 12 | Duplicate records created | Non-idempotent operations | Search before creating |
| 13 | SSS_USAGE_LIMIT_EXCEEDED | Exceeded usage units | Use `getRemainingUsage()`, offload to Map/Reduce |
| 14 | SSS_TIME_LIMIT_EXCEEDED | Exceeded time limit | Break into smaller chunks, use yielding |
| 15 | Client Script logs not appearing | `log.*` ignored on forms | Use `console.log()` instead |
| 16 | Cache not shared between scripts | Using `cache.Scope.PRIVATE` | Use `cache.Scope.PUBLIC` for shared cache |
| 17 | URLSearchParams not defined | Browser API in server-side code | Use manual string concat + `encodeURIComponent()` |
| 18 | SuiteQL returns no results with mainline | `mainline = 'F'` filter unreliable | Use `TransactionLine.item IS NOT NULL` |
| 19 | CSS styles not applying in NetSuite | NetSuite's CSS overrides yours | Use `!important` and explicit values like `#FFFFFF` |
| 20 | N/dataset formula fails silently | TO_CHAR, DECODE, NVL2, complex TRUNC | Use EXTRACT for dates, CASE WHEN for conditionals |
| 21 | Workbook commission formula doesn't work | Nested arithmetic with TRUNC | Auto-transformed to CASE WHEN tiers |
| 22 | Saved search XML fails SDF deployment | Hand-authored `<definition>` XML. SDF requires system-generated binary blob | Use **Saved Search Creator Suitelet** pattern: deploy a login-required Suitelet that creates the search via N/search, restrict its audience, avoid public searches by default, then `object:import` the search into SDF. See SKILL.md Pitfall #125 |

### UIF SPA Pitfalls

| # | Problem | Cause | Solution |
|---|---------|-------|----------|
| 22 | StackPanel crashes with "Invalid StackPanel Item" | `null` child in children array | Use imperative array: `var items = []; if (x) items.push(<Item>...</Item>);` |
| 23 | StackPanel.Item error with 2 children | Modal + ContentPanel as siblings in one Item | Each StackPanel.Item must have exactly one child; add modal via imperative array |
| 24 | `useState` stores function object as value | Lazy initializer `useState(function() {...})` | UIF does NOT call function initializers (unlike React). Pass computed value directly |
| 25 | `Badge.Size` not working as expected | Forgetting to import Badge or using wrong enum path | `Badge.Size` exists with `DEFAULT` and `SMALL` values. Use `size={Badge.Size.SMALL}` for compact badges |
| 26 | `InvalidCharacterError` on classList | Space-separated class string `'a b'` | `DOMTokenList.add()` rejects spaces. Use single class name per value |
| 27 | TEMPLATED column blanks remaining columns | Unhandled throw in `content` callback | Wrap callbacks in try/catch. Use `args.cell.value` or `args.cell.row.dataItem` |
| 28 | DataGrid has grey area on right side | Columns don't fill container width | Add `columnStretch={true}` to auto-stretch columns. Do NOT use `stretchStrategy={{}}`; it is constructor-only and causes VDom errors on re-render |
| 29 | 35k+ rows in ArrayDataSource causes hang | Too much data for client-side rendering | Cap preview at ~500 rows |
| 30 | Agenda `eventClickAction` does nothing | `readOnly={true}` on parent Agenda | `readOnly` propagates to day cells and blocks event clicks. Remove `readOnly` |
| 31 | Agenda `eventsLimit: 0` throws error | "Must be no value or positive number" | Use `events: []` to suppress events on specific days |
| 32 | Wrong Date API (`.getFullYear()` vs `.year`) | Mixing native Date with UIF Date | `import { Date } from '@uif-js/core'` for UIF Date (`.year`, `.month`, `.day`). `new Date()` is always native |
| 33 | `<orderindex>` on `<customvalue>` ignored | Not supported in SuiteApps | Remove `<orderindex>`; values ordered by XML document order |
| 34 | `FREEFORMTEXT` fails on any custom field type | `FREEFORMTEXT` is not a valid SDF fieldtype enum | Use `TEXT` (single-line) or `TEXTAREA` (multi-line) for all custom field types |
| 35 | Changing deployed field type fails | "The fieldtype field must not be X" | Cannot change field types after deployment. Create a new field with desired type and migrate data |
| 36 | "Invalid Field Value" on TIMEOFDAY field | `record.setValue` passed a string like `"10:00 AM"` | TIMEOFDAY requires a JS `Date` object: `new Date(1970, 0, 1, hours, minutes, 0)`. Parse the time string first |
| 37 | SuiteQL result key `managername` not found | Alias written as `AS managerName` but accessed as `row.managerName` | SuiteQL returns ALL aliases in lowercase. Use lowercase aliases and access with lowercase keys |
| 38 | `COALESCE` with `\|\|` never falls through to fallback | `NULL \|\| ' ' \|\| NULL` → `' '` (space), not NULL | Literal strings in `\|\|` chains defeat NULL propagation. Use `CASE WHEN join.id IS NOT NULL THEN ... ELSE fallback END` |
| 39 | Button `disabled={saving}` throws on re-render | `disabled` is constructor-only | Use `enabled={!saving}` — `enabled` is a writable property |
| 40 | Button `action` handler reads stale state | UIF may not update `action` reference on re-render | Store state in refs (`useRef`), sync each render (`ref.current = val`), read from refs in handler |
| 41 | `Image.Size.XXL` / `Image.Color.SUCCESS` crash | Enum values don't exist in UIF | Use `<Text>` with Decorator-based styling for status indicators |
| 42 | `Select` import is `undefined` | `Select` doesn't exist in `@uif-js/component` | Use `DataGrid.ColumnType.DROPDOWN` in grids, or `Dropdown` standalone |
| 43 | `StackPanel.VerticalAlignment.CENTER` crashes page | Enum doesn't exist — TypeError on module load | Use `alignment={StackPanel.Alignment.CENTER}` for cross-axis alignment |
| 44 | Script uses string literal for standard record type | Using `'customer'` instead of `record.Type.CUSTOMER` | Use `record.Type.*` / `search.Type.*` enums; reserve strings for `customrecord_*` |
| 45 | `{cond && <element>}` crashes component | `false` is not a valid `VDom.Node` type; UIF rejects it everywhere | Always use `{cond ? <element> : null}`. UIF VDom.Node = `string \| number \| VDomElement \| Component \| Translation \| null` — no `boolean` |
| 46 | SDFInstallationScript `run()` missing version check | Migration logic runs on fresh install; corrupts default data | Always check `if (!context.fromVersion)` to distinguish fresh install from upgrade |
| 47 | deploy.xml `<script><path>` points to JS file | Script never triggers; silent deployment failure | `<path>` must point to the Object XML file (`~/Objects/customscript_*.xml`), not the `.js` file |
| 48 | `<script>` block placed before `<objects>` in deploy.xml | Installation script runs before custom records/fields exist | Place `<script>` AFTER `<objects>` unless you need pre-deployment logic |
| 49 | `DataGrid.ColumnType.CHECK_BOX` renders empty column | Grid-level `editable={true}` is missing | `CHECK_BOX` columns require `editable={true}` on the DataGrid itself, not just `editable: true` on the column definition. Without it, the column space appears but the checkbox widget does not render |
| 50 | `CHECK_BOX` column checkbox state not trackable via `CELL_UPDATE` | `CELL_UPDATE` event may not fire for `CHECK_BOX` toggles | Use a TEMPLATED column with a toggle Button instead. Manage checked state in a `useRef({})` object keyed by row identifier. The Button's `action` updates the ref and calls `setState` to trigger re-render for count display |
| 51 | `TextBox` shows stale value after programmatic update | TextBox `text` prop is not a controlled input in the React sense; UIF caches the internal value | Use a `key` on the TextBox to force remount when value changes externally: `key={formData.version}`, or call `textBox.current.setText(newValue)` imperatively |
| 52 | `Dropdown` shows blank/no selection after `dataSource` is replaced with a new `ArrayDataSource` instance | Creating a new `ArrayDataSource` on every render disconnects the previous binding | Create the `ArrayDataSource` once (outside the render function or in `useMemo`), then call `ds.clear()` + `ds.add()` to update it rather than creating a new instance |
| 53 | `RadioButton` with `radio` prop causes type warning or unexpected behavior | The `radio` prop is deprecated | Use `value` prop instead: `<RadioButton label="Option A" value="a" />` |
| 54 | `useDispatch()` or `useSelector()` throws an error | Component uses Store hooks but `Store.Provider` is not an ancestor in the component tree | Wrap the component tree with `<Store.Provider store={store}>` at the root. Import: `import { Store, useDispatch, useSelector } from '@uif-js/core'` |
| 55 | State update after navigation causes silent corruption or "cannot read property of null" | `async` function completes after component unmounts; `setState` runs on gone component | Use `CancellationTokenSource` in `useEffect` cleanup. Check `token.cancelled` before every `setState` call in an async function. See Section 20 |
| 56 | `DataGrid` with `TreeDataSource` renders flat rows — hierarchy not shown | Column type is `TEXT_BOX` or `DETAIL` instead of `TREE` | Use `DataGrid.ColumnType.TREE` (not `DETAIL`) as the hierarchy column type when using `TreeDataSource`. Add `showTreeLines: true` to the column definition |
| 57 | GrowlPanel messages never appear | `GrowlPanel` ref is null or panel placed inside `ScrollPanel` with overflow hidden | Ensure `GrowlPanel` is rendered at the root layout level (sibling to `ScrollPanel`, not inside it). Check ref before calling `.add(msg)` — the method is `.add()`, not `.addMessage()`. Use `rootStyle={{ position: 'fixed', bottom: '20px', right: '20px' }}` for guaranteed visibility |
| 58 | `Field` in `VIEW` mode shows blank when wrapping a `DatePicker` | `DatePicker` in `VIEW` mode needs a `ValueField` with its `activeValueAdaptor` prop, not a plain `Field` | For date fields in view/edit toggle, use `ValueField` with its `activeValueAdaptor` prop. Consult the `ValueField` API for the specific date adaptor class name |
| 59 | All `AccordionPanelItem` sections expand when clicking any item | `multiple={true}` (or default behavior without `multiple={false}`) allows multi-expansion | Set `multiple={false}` on `AccordionPanel` to enforce single-expand behavior: `<AccordionPanel multiple={false}>` |
| 60 | `Popover` stays open after clicking outside | No `closing` strategy set — Popover requires explicit close handling | Set `opened` state and handle `closing` event: `<Popover opened={isOpen} closing={function() { setIsOpen(false); }} owner={buttonRef.current}>`. The `closing` event fires on Escape key or focus-out |
| 61 | Store state changes don't trigger `useSelector` re-renders | Reducer mutates state directly instead of returning a new object | Store reducers must return NEW state objects. Use `ImmutableObject.set(state, 'key', value)` or spread: `{ ...state, key: value }`. Direct mutation (`state.key = value; return state`) returns the same reference — selector sees no change |
| 62 | `<objects>` in SuiteApp manifest.xml fails validation | `<objects>` is not supported in SuiteApp manifests — only `<features>` is valid inside `<dependencies>` | Remove `<objects>` section entirely. SuiteApp projects auto-deploy all files from the `Objects/` folder. This element is only valid in Account Customization projects |
| 97 | Sandbox script triggers real-world side effects | No environment check — same code runs in sandbox and production | Detect sandbox with `runtime.accountId.includes('_SB')`. Skip or redirect external calls, emails, and integrations when `isSandbox === true` |
| 98 | DOM manipulation breaks after NetSuite upgrade | Using `document.getElementById`, jQuery, or `innerHTML` in SuiteScript | Never access the DOM directly. Use `N/ui/serverWidget` (server), `currentRecord.setValue()` (client), `N/ui/dialog`, `N/ui/message` for all UI interactions |
| 99 | Off-by-one-day errors in date comparisons | Raw `new Date('...')` string parsing is timezone-dependent — returns UTC midnight, not PT | Always use `format.parse()` / `format.format()` from N/format. Get user TZ via `runtime.getCurrentUser().getPreference({ name: 'TIMEZONE' })`. Never construct date strings manually |
| 100 | Multiple UE scripts on same record conflict | No consolidation — multiple scripts write same fields in undefined order | Use a single dispatcher UE per record/event that calls modular functions in explicit order. For external coexistence: read-before-write, use flag fields, check `runtime.executionContext` |
| 101 | Suitelet list view exceeds 100 rows — slow browser rendering | Loading full dataset into a single list with no pagination | Keep lists under 100 rows. Implement pagination: pass `page`/`offset` param in request URL, load one page at a time, render Next/Previous navigation |
| 102 | Suitelet URL breaks when deployed to different account or sandbox | Domain hardcoded as `https://1234567.app.netsuite.com/...` | Use `url.resolveScript({ scriptId, deploymentId, params })` from N/url — resolves correct domain for the current environment automatically |
| 103 | Suitelet in iframe renders broken in Firefox or triggers CSP errors | URL missing `ifrmcntnr=T` query parameter | Append `&ifrmcntnr=T` to the Suitelet URL when loading it in an iframe. Prefer popups or full-page navigation over iframes when possible |
| 104 | Server-side script calls Suitelet via outbound HTTP — requires auth and adds latency | Using `https.get()` with a Suitelet URL from another server-side script | Use `https.requestSuitelet({ scriptId, deploymentId, params })` for direct in-process invocation. Use `https.requestRestlet()` for RESTlets. No authentication or network overhead |
| 105 | SuiteQL JOIN on SystemNote table causes query timeouts | `SystemNote` is extremely high-volume — every field change on every record creates a row; joining it performs a full-table scan | Run a standalone query on `SystemNote` with tight filters (`recordid`, `field`, narrow date range) — never as a JOIN against a large transaction or entity result set |
| 106 | Dynamic SuiteQL string interpolation prevents query plan caching | Template literals (for example, `` `WHERE id = ${custId}` ``) generate a unique fingerprint per call — NetSuite cannot reuse cached execution plans | Use parameterized queries: `query.runSuiteQL({ query: 'WHERE id = ?', params: [custId], customScriptId: 'my_query_v1' })`. Assign and version a `customScriptId`; update it whenever the query structure changes |
| 107 | Interactive debugger does nothing for Client Scripts | Client Scripts run in the browser — the NetSuite Script Debugger (Customization > Scripting > Script Debugger) only supports server-side script types | Use browser DevTools (F12) and `console.log()` / `console.table()` for Client Script debugging. Use `log.debug()` only for server-side scripts |
| 108 | Code passes Jest tests but fails in NetSuite at runtime | GraalJS (ES2022) and Node.js (V8) are different engines — native iterators, constructor return values, and AMD `require()` behave differently | Avoid native iterators (`function*`, `Symbol.iterator`); use standard array methods. Add `global.log` stubs for Jest. Use SCUTF for AMD transpilation. Always follow unit tests with sandbox integration tests |
| 109 | Client Script changes have no effect after upload | Browser caches Client Script files aggressively — normal refresh (F5) serves the old cached version | Use hard refresh: Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac). Or: open DevTools (F12), right-click Refresh > "Empty Cache and Hard Reload" |
| 110 | `setValue()` change not visible on server before form save | `setValue()` / `setCurrentSublistValue()` are deferred IO — they update the in-memory record only, not the server | Pass field values explicitly as parameters to any server call. Read back from local record via `currentRecord.getValue()` within the same event handler |
| 111 | Client Script silently stops executing — no errors | More than 10 Client Scripts deployed to the same record type; extras are silently ignored | Consolidate scripts using dispatcher pattern, or enable "Remove Client Script Deployment Limit" at Setup > Company > Enable Features > SuiteCloud |
| 112 | `fieldChanged` reads sourced field that is still empty | `fieldChanged` fires before dependent sourcing completes — for example, selecting Customer doesn't yet populate Terms | Use `postSourcing` instead: fires after all auto-sourced fields are populated. Use `fieldChanged` for direct user input; `postSourcing` for downstream sourced values |
| 113 | Client Script throws on `getValue()` for missing field | Field doesn't exist on this record type or form variant — runtime error aborts the script | Check existence first: `if (currentRecord.getFields().includes('custbody_myfield')) { ... }` |
| 114 | `validateLine` in one CS blocks line commit for all scripts | Any Client Script returning `false` from `validateLine` cancels the line for all deployed scripts; `sublistChanged` fires for all scripts on every sublist change | Filter by `context.sublistId` in all sublist handlers. Scope `validateLine` to only return `false` for the sublist this script owns |
| 115 | Migrating SOAP without a complete integration inventory | Starting migration without full discovery of all SOAP integrations, auth methods, record types, and volumes | Complete Phase 0 discovery (see Appendix: SOAP to REST Migration) before Wave 1 work. Document every integration in a Migration Registry with direction, SOAP operations, auth method, volume, and business criticality |
| 116 | Cutting over from SOAP to REST without parallel run | Switching directly without running both simultaneously risks undetected data discrepancies | Run SOAP and REST in parallel for at least 1 full business cycle, comparing outputs field-by-field. High-risk integrations require 2+ billing/fulfillment cycles with zero discrepancies before cutover |
| 117 | Not testing SOAP rollback before cutover | Assuming SOAP rollback will work without actually testing it | Keep SOAP credential active (unused) for a 30-day rollback window after cutover. Test rollback procedure in sandbox before production — especially for high-risk integrations with real-time SLAs |
| 118 | Using NLAuth for new REST integrations | NLAuth is legacy authentication not suitable for new REST Web Services integrations | Use OAuth 2.0 Client Credentials for M2M integrations and Authorization Code grant for user-delegated access. See Pitfall #93 for RSA-PSS key requirements |
| 119 | Ignoring REST Record API field coverage gaps | Not all SOAP-exposed fields are available in the REST Record API; some record types may have incomplete coverage or be unavailable | Identify field gaps during Phase 0 discovery by comparing SOAP response fields against REST GET responses for the same records. Build RESTlet adapters for unsupported record types or missing fields as part of Phase 1 foundation work |
| 120 | Wildcard deploy.xml paths include `.DS_Store` — deployment fails | `~/FileCabinet/Web Site Hosting Files/*` picks up macOS `.DS_Store` artifacts | Use specific subfolder paths instead of broad wildcards. Delete `.DS_Store` files from `src/` tree before deploying |
| 121 | Logging PERF_TIMING in production without a toggle | Every `log.audit()` costs 1 governance unit; 3,000+/day for a 3-entry-point UE script | Gate behind `custscript_perf_timing` checkbox parameter (default OFF). Enable only during active investigation |
| 122 | Using `log.audit('PERF_TIMING', ...)` in Client Scripts | `log.audit()` is silently ignored in browser context — produces no output | Use `performance.now()` for sub-millisecond precision and `console.time()` / `console.timeEnd()` in Client Scripts |
| 123 | Not estimating governance before deploying bulk scripts | Scripts processing variable-size inputs can exceed limits silently in production | Calculate: `(per-iteration cost) x (max iterations) + overhead` vs script type limit before deploying |
| 124 | Comparing post-deploy metrics too soon | `scheduledscriptinstance` returns stale or empty data immediately after deployment | Wait for at least 3 representative runs before drawing conclusions; for before/after comparison re-check after 24 hours |
| 125 | `bodytransactiontypes` in custom field XML fails validation | Element not supported in SDF Object XML for `transactionbodycustomfield` | Remove `<bodytransactiontypes>` entirely. Configure transaction type filtering in UI after deployment |
| 126 | `MANUFACTURING` feature in manifest.xml fails validation | `MANUFACTURING` is not a valid SDF feature ID | Use `ASSEMBLIES` for work orders and assembly items. Cross-reference appendix-manifest-features.md |
| 127 | Mandatory script parameter fails SDF deploy | `<ismandatory>T</ismandatory>` on `<scriptcustomfield>` — SDF cannot supply a value at deploy time | Set `<ismandatory>F</ismandatory>` in Object XML. Validate the parameter at runtime in the script entry point (null check + `log.error` + early return) |
| 128 | Mandatory script parameter fails SDF deploy (duplicate of 127 — see SKILL.md) | — | — |
| 129 | `SUITESCRIPT_API_UNAVAILABLE_IN_DEFINE` on deploy | N/ API called at module scope in `define()` callback — `runtime.getCurrentScript()`, `record.load()`, etc. | Use lazy initialization: declare as `null`, init on first access from entry point function |
| 130 | "Invalid sublist or line item operation" on item subsidiary | Item subsidiary sublist is static — `selectNewLine`/`commitLine` fails in dynamic mode | Create item with `isDynamic: false`, use `setSublistValue` on line 0 |
| 131 | `Unknown identifier 'isinactive'` on entitystatus | `entitystatus` table has no `isinactive` column | Remove `isinactive` filter; use `probability IS NOT NULL` or other available columns |
| 132 | "Please enter value(s) for: Tax Schedule" (or other field) on record creation | Account-specific mandatory fields vary by config, features, and custom forms | Use `ignoreMandatoryFields: true` as safety net; look up values from existing records via `record.load` |
| 133 | Entity custom field doesn't appear on Project/Job records after deploy | `appliestojob` is ignored in SDF `entitycustomfield` XML | Configure "Applies To" manually in UI after deployment: Customization > Entity Fields > edit > Applies To > check Project |
| 134 | Saved Search Creator Suitelet exposes elevated search creation | Combining elevated `<runasrole>` with `<allroles>T</allroles>`, or making generated searches public by default | Prefer Current Role or a least-privilege execution role; if `ADMINISTRATOR` is unavoidable, use explicit admin/developer audience only. Deactivate Suitelet after import |
| 135 | **SECURITY**: Suitelet accessible without authentication | `<isonline>T</isonline>` or `<isonline>` omitted on data-modifying Suitelet | **Always** set `<isonline>F</isonline>` explicitly. NEVER use `T` on Suitelets that create/modify/query data |
| 136 | deploy.xml validation fails: "objects" field missing | Account Customization deploy.xml has no `<objects>` section | Add `<objects><path>~/Objects/*</path></objects>` to deploy.xml |
| 137 | Scriptfile reference "could not be resolved" during deployment | deploy.xml missing standard sections (`<configuration>`, `<translationimports>`) breaks reference resolution | Use complete deploy.xml with all 4 sections: configuration, files, objects, translationimports |
| 138 | `search.create()` throws "The record type [PURCHORD] is invalid" | SuiteQL type abbreviation (for example, `'PurchOrd'`) used instead of an N/search type ID (for example, `'purchaseorder'`) | Use `search.Type.*` enum or a lowercase type ID in `search.create()`; SuiteQL abbreviations belong only in SuiteQL query strings — see the type mapping table in `03-performance-optimization.md § 3.3.7` |
| 139 | SuiteQL `Unknown identifier 'createdfrom'` on transaction table | `createdfrom` does not exist on the `transaction` table in SuiteQL — it's on `transactionline` | Join through `transactionline`: `FROM transactionline tl INNER JOIN transaction t ON t.id = tl.transaction WHERE tl.createdfrom = :id`. Note: VBs link directly to PO, not to IR (chain is PO→IR and PO→VB, not PO→IR→VB) |
| 140 | CustomTool accepts raw SuiteQL from MCP caller | Agent/user-supplied `query`, `sql`, table, field, join, WHERE, or ORDER BY text can be changed by hallucination or prompt injection | Do not expose raw query text. Use allowlisted `datasetId` enums, fixed SuiteQL templates, bound params, filter validation, result limits, and sensitive-record exclusions |

---

## Required JSDoc Header

Your SuiteScript files must have this header:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
```

Valid `@NScriptType` values:
- `BundleInstallationScript`
- `ClientScript`
- `CustomTool`
- `MapReduceScript`
- `MassUpdateScript`
- `Portlet`
- `Restlet`
- `ScheduledScript`
- `SDFInstallationScript`
- `SpaServerScript`
- `SpaClientScript`
- `Suitelet`
- `UserEventScript`
- `WorkflowActionScript`

---

## Manifest Requirement

All server-side scripts require SERVERSIDESCRIPTING in manifest.xml:

```xml
<dependencies>
  <features>
    <feature required="true">SERVERSIDESCRIPTING</feature>
  </features>
</dependencies>
```

**ERP Feature Dependencies** — Custom fields on transaction bodies or items may require additional features:
- `custbody_*` fields: RECEIVABLES, PAYABLES, EXPREPORTS, ADVRECEIVING, OPPORTUNITIES, WEBSTORE, MULTILOCINVT
- `custitem_*` fields: INVENTORY, ASSEMBLIES
- Run `suitecloud project:validate` to identify all missing dependencies
- See Step 7 in the main skill for the complete feature dependency table

---

## Installation

### Claude Code Skill Example
For Claude Code, copy skill file to:
```
~/.claude/skills/netsuite-sdf-safe-guide/SKILL.md
```

### Codex Skill Example
For Codex, copy skill file to:
```
~/.codex/skills/netsuite-sdf-safe-guide/SKILL.md
```

### Cline Rule Example
Add `.clinerules` file to your project root with the rule content.

---

## Files on Desktop

| File | Purpose |
|------|---------|
| `netsuite-sdf-safe-guide-skill.md` | Full skill documentation for supported coding assistants |
| `netsuite-object-generator.clinerules` | Rule file content for Cline users |
| `NetSuite SDF Safe Guide – Quick Reference.md` | This quick reference guide |

---

## Permission Keys (permkey) Quick Reference

| Prefix | Category | Count | Common Examples |
|--------|----------|-------|-----------------|
| `ADMI_*` | Administration | 213 | ADMI_CUSTOMSCRIPT, ADMI_WORKFLOW, ADMI_WEBSERVICES |
| `LIST_*` | Lists/Records | 224 | LIST_CUSTJOB, LIST_ITEM, LIST_VENDOR, LIST_EMPLOYEE |
| `REGT_*` | Registers | 21 | REGT_BANK, REGT_ACCTPAY, REGT_ACCTREC |
| `REPO_*` | Reports | 67 | REPO_FINANCIALS, REPO_SALES, REPO_INVENTORY |
| `TRAN_*` | Transactions | 159 | TRAN_SALESORD, TRAN_PURCHORD, TRAN_CUSTINVC |
| `customrecord_*` | Custom Records | varies | customrecord_my_record (project-specific) |

**Permission Levels:** `VIEW` | `CREATE` | `EDIT` | `FULL` | `REMOVE`

**Validation:** Use `netsuite-sdf-roles-and-permissions` skill for full lookup of all 670+ permission IDs.

**Common Use Cases:**
| Script Context | Typical Permissions |
|---------------|-------------------|
| Sales Order Script | TRAN_SALESORD, LIST_CUSTJOB |
| Purchase Order Script | TRAN_PURCHORD, LIST_VENDOR |
| Invoice Processing | TRAN_CUSTINVC, TRAN_SALESORD, LIST_CUSTJOB |
| Inventory Scripts | TRAN_INVADJST, LIST_ITEM |
| Journal/Accounting | TRAN_JOURNAL, LIST_ACCOUNT |
| Employee Scripts | LIST_EMPLOYEE, TRAN_TIMEBILL |

---

## Need Help?

1. Check that your `.js` file has the correct `@NScriptType` annotation.
2. Verify filenames are lowercase with underscores.
3. Ensure `<scriptfile>` paths have brackets: `[/SuiteScripts/...]`.
4. Check `manifest.xml` has SERVERSIDESCRIPTING feature.
5. Verify runasrole is ONLY used for UserEventScript, Suitelet (not Restlet, Scheduled, etc.).
6. For ClientScript/UserEventScript/MassUpdateScript/WorkflowActionScript, ensure `<recordtype>` is specified.
7. To disable logging, omit the `<loglevel>` element entirely.

---

## N/dataset Formula Limitations (SuiteAnalytics Workbooks)

N/dataset uses SuiteQL which has stricter limitations than Oracle SQL in Saved Searches. The workbook CustomTool **auto-transforms** problematic formulas.

### Auto-Transformed Patterns

| Problem Formula | Auto-Transformed To |
|-----------------|---------------------|
| `TO_CHAR({trandate}, 'YYYY-MM')` | `CONCAT(EXTRACT(YEAR), '-', LPAD(EXTRACT(MONTH)))` |
| `{amount} * (0.05 + 0.01 * TRUNC({amount}/50000))` | CASE WHEN with 20 tiers |
| `DECODE({status}, 'A', 'Active', 'Inactive')` | `CASE WHEN {status} = 'A' THEN...` |
| `NVL2({email}, 'Yes', 'No')` | `CASE WHEN {email} IS NOT NULL THEN...` |

### Functions Not Supported in N/dataset

| Function | Alternative |
|----------|-------------|
| `DECODE` | Use `CASE WHEN...THEN...ELSE...END` |
| `NVL2` | Use `CASE WHEN {field} IS NOT NULL...` |
| `TO_CHAR` date formats | Use `EXTRACT(YEAR/MONTH/DAY FROM {field})` |
| `ROW_NUMBER()`, `RANK()` | Not available - use Saved Search |
| `LISTAGG` | Not available; return multiple rows |
| `REGEXP_LIKE` | Use `LIKE` patterns |

### Best Practices

```sql
-- Good: Use CASE WHEN
CASE WHEN {amount} > 1000 THEN 'Large' ELSE 'Small' END

-- Good: Use EXTRACT for dates
EXTRACT(YEAR FROM {trandate})

-- Bad: Complex nested arithmetic (may fail silently)
{amount} * (0.05 + 0.01 * TRUNC({amount} / 50000))
```

See [Appendix: N/dataset Formulas](references/appendices/appendix-ndataset-formulas.md) for complete details.

---

## REST vs. SOAP Web Services

| Interface | Status | Notes |
|-----------|--------|-------|
| **REST Web Services** | Preferred | Required for new SuiteApps (since 2024.2). OAuth 2.0 support, SuiteQL support |
| **SOAP Web Services** | Deprecated | Last new endpoint: 2025.2. All endpoints disabled: 2028.2. Plan migration before deadline |
| **RESTlets** | Active | Custom REST APIs, packagable via SuiteApp |

**2026.1 REST Highlights:**
- **Attach/Detach** — `POST .../record/v1/{type1}/{id1}/!attach/{type2}/{id2}` (Contact + File only)
- **Batch Operations** — Single async request for bulk create/update/delete (HTTP 202, poll for completion)
- **selectOptions** — Role-aware field metadata endpoint
- **Support Case records** — 4 new record types via REST

See [Principle 1](references/01-understand-netsuite-features.md) and [Appendix: REST API](references/appendices/appendix-suitetalk-rest.md) for details.

> **Migration Guide:** For organizations migrating existing SOAP integrations to REST before the 2028.2 deadline, see `references/appendices/appendix-soap-rest-migration.md` for a complete phased migration strategy with discovery templates, wave execution patterns, and validation gates.

---

## Glossary of Key Terms

| Abbreviation | Full Name | Description |
|---|---|---|
| **UE** | User Event Script | Server-side script triggered by record events (beforeLoad, beforeSubmit, afterSubmit) |
| **SL** | Suitelet | Server-side script that generates custom pages or processes HTTP requests |
| **CS** | Client Script | Browser-side script for form-level interaction (pageInit, fieldChanged, saveRecord, etc.) |
| **RESTlet** | RESTlet | Server-side script providing custom REST API endpoints; callable via TBA or OAuth 2.0 |
| **M/R** | Map/Reduce Script | Server-side script for bulk data processing in parallel map, shuffle, reduce, and summarize stages |
| **SS** | Scheduled Script | Server-side script running on a defined schedule or triggered on-demand via N/task |
| **WA** | Workflow Action Script | Script triggered from a SuiteFlow workflow action step |
| **SDF** | SuiteCloud Development Framework | File-based customization and deployment framework for NetSuite accounts and SuiteApps |
| **SCA** | SuiteApp Control Center | Managed SuiteApp distribution platform for publishing and installing SuiteApps |
| **BFN** | Bundle File Naming | Naming convention used for managed SuiteApp files to prevent conflicts with account customizations |
| **AMD** | Asynchronous Module Definition | JavaScript module format used by SuiteScript 2.x (`define([...], function(...) {...})`) |
| **TBA** | Token-Based Authentication | OAuth 1.0a authentication used to call RESTlets and SOAP Web Services from external systems |
| **APM** | Application Performance Management | NetSuite SuiteApp for monitoring script execution performance and governance usage |

---

## SDF Git Workflow

SDF projects are well-suited to git version control; Object XML files are plain text and fully diff-able.

### Recommended Practices

- **Branch per change request** — Create a feature branch for each ticket, bug fix, or enhancement. Never develop directly on `main`/`master`.
- **Peer review before merge** — All changes should go through a pull request review before merging to `main`. A second set of eyes catches pitfalls early.
- **Validate before committing** — Run `suitecloud project:validate` locally before committing. This catches missing features, malformed XML, and deployment issues before they reach the team.
- **Deploy from a clean branch** — Only deploy to environments from a committed, reviewed branch; not from work-in-progress local changes.
- **Keep Object XML in source control** — Treat `/Objects/` the same as source code. Generated XML should be committed alongside the scripts that own them.

### Typical Branch Workflow

```
main (production-ready)
  └── feature/TICKET-123-add-vendor-approval-ue
        → validate locally with: suitecloud project:validate
        → peer review via pull request
        → merge to main
        → deploy to sandbox, then production
```

---

## NetSuite Documentation

- [SDF XML Reference](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/SDFxml.html)
- [Custom Objects](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_1537555588.html)
- [Script Record Creation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4486246677.html)
- [CustomTool Reference](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_0724071739.html)
- [N/dataset Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4675023796.html)
- [N/workbook Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4675054696.html)
- [Single Page Applications Overview](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_161244635803.html)
- [SPA Server Script](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_161796599785.html)
- [SPA Client Script](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_161796598422.html)
- [singlepageapp XML Reference](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/SDFxml_1427049920.html)
