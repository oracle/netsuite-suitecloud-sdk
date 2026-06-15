# Appendix: CustomTool Runtime Patterns
> Source: Production CustomTool project patterns + Oracle NetSuite SAFE Guide
> Author: Oracle NetSuite

## Overview

CustomTools are SuiteScript 2.1 server-side scripts (`@NScriptType CustomTool`) that expose functions as callable tools for AI agents via MCP. This appendix covers runtime patterns not covered by the XML/deployment guidance in the main skill.

Every CustomTool consists of three files:

```
Objects/custtoolset_my_toolset.xml          # SDF object — 2026.1+ naming (or customtool_my_toolset.xml for 2025.2)
FileCabinet/SuiteScripts/tools/
    my_toolset.js                           # Runtime script
    my_toolset_schema.json                  # RPC schema (MCP tool definition)
```

---

## JS Entry Point Pattern

The full production-ready pattern with governance tracking and structured error handling:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType CustomTool
 * @NModuleScope SameAccount
 *
 * @description Brief description of what this tool does
 * @governance Estimated usage (for example, "~10 units for query + ~10/1000 rows")
 * @note Entry points must be async functions (NetSuite 2026.1+)
 */
define(['N/log', 'N/runtime', 'N/error', /* other N/* modules */],
    (log, runtime, error, /* ... */) => {

    const TOOL_NAME = 'myToolFunction';

    const getRequestId = (params) => {
        const candidate = String((params && params.requestId) || '');
        return /^[A-Za-z0-9_-]{1,80}$/.test(candidate)
            ? candidate
            : `ct_${Date.now()}`;
    };

    const myToolFunction = async (params) => {
        params = params || {};
        const startTime = Date.now();
        const script = runtime.getCurrentScript();
        const requestId = getRequestId(params);
        log.audit('Tool Start', `tool=${TOOL_NAME} requestId=${requestId}`);

        try {
            // 1. Parse JSON string parameters
            let complexParam;
            try {
                complexParam = typeof params.myJsonParam === 'string'
                    ? JSON.parse(params.myJsonParam)
                    : params.myJsonParam;
            } catch (e) {
                return {
                    success: false,
                    requestId,
                    error: { type: 'PARSE_ERROR', message: 'Invalid JSON in myJsonParam' }
                };
            }

            // 2. Validate required inputs
            if (!params.requiredField) {
                return {
                    success: false,
                    requestId,
                    error: { type: 'VALIDATION_ERROR', message: 'requiredField is required' }
                };
            }

            // 3. Check governance before expensive operations
            if (script.getRemainingUsage() < 50) {
                return {
                    success: false,
                    requestId,
                    error: { type: 'GOVERNANCE_ERROR', message: 'Insufficient governance units remaining' }
                };
            }

            // 4. Business logic
            const result = doWork(complexParam, params.requiredField);

            // 5. Audit completion
            log.audit('Tool Complete', `tool=${TOOL_NAME} requestId=${requestId} rows=${result.length} elapsedMs=${Date.now() - startTime}`);

            // 6. Return structured result
            return {
                success: true,
                requestId,
                data: result,
                metadata: {
                    executionTime: `${Date.now() - startTime}ms`,
                    governanceRemaining: script.getRemainingUsage()
                }
            };

        } catch (e) {
            log.error('Tool Error', `tool=${TOOL_NAME} requestId=${requestId} elapsedMs=${Date.now() - startTime}`);
            return {
                success: false,
                requestId,
                error: {
                    type: 'UNEXPECTED_ERROR',
                    message: 'Unexpected tool execution error. Use requestId to correlate with logs.'
                }
            };
        }
    };

    return { myToolFunction };  // Export name MUST match schema tools[0].name
});
```

### Runtime Facts

| Fact | Detail |
|------|--------|
| `params` object | Flat, untyped. Keys match `inputSchema.properties`. No TypeScript types at runtime. |
| Complex params | Arrive as JSON strings when schema declares `"type": "string"`. You must `JSON.parse()`. |
| No `context` object | Unlike Suitelets/UE scripts — just `params`. No HTTP request, no record context. |
| Return value | Plain serializable object. Runtime serializes to JSON. No `context.response.write()`. |
| Error handling | Must be structured returns, never thrown exceptions. |
| Governance | 1,000 units / 300 seconds. Track with `getRemainingUsage()`. |
| Unsupported modules | `N/http`, `N/https`, `N/sftp` are NOT supported. Runtime error: "Couldn't load modules in the custom tool script because it uses unsupported modules." Use N/query, N/record, N/search. For external HTTP calls, route through a Suitelet intermediary. |
| Entry point signature | Functions must be `async` (2026.1+): `const myTool = async (params) => { ... }` |

---

## Helper Module Pattern

Helper modules live alongside the main script as plain AMD modules with no `@NScriptType`:

### MCP Query Security Baseline

CustomTools exposed through MCP receive parameters selected by an AI agent. Treat every parameter as untrusted, even when the user appears trusted. Prompt injection, hallucination, or schema misunderstanding can change tool arguments in ways that would not occur in a normal Suitelet or RESTlet UI flow.

**Never expose a CustomTool parameter that accepts raw SuiteQL, table names, field names, join clauses, WHERE fragments, or ORDER BY text.** Instead:
- Use allowlisted `datasetId` values such as `open_sales_orders` or `customer_balance_summary`.
- Map each dataset to a fixed SuiteQL template owned by the tool.
- Bind all caller values through `params`, never string concatenation.
- Validate each filter against per-dataset type, enum, date, numeric, and length rules.
- Keep table and field names in server-side allowlists. Do not let the caller choose them directly.
- Exclude sensitive records and fields by default, including credentials, tokens, auth/session data, payment/bank/card data, employee compensation, and broad audit/system-note datasets.
- Return bounded result sets and only the columns needed by the tool's business purpose.

```javascript
// lib/query_helpers.js; no script annotations needed.
define(['N/query'], (query) => {

    const DATASETS = {
        open_sales_orders: {
            customScriptId: 'custtool_open_sales_orders_v1',
            maxRows: 500,
            allowedFilters: {
                status: ['SalesOrd:B', 'SalesOrd:D', 'SalesOrd:E'],
                fromDate: 'date'
            },
            query:
                'SELECT id, tranid, trandate, entity, status, amount ' +
                'FROM transaction ' +
                'WHERE type = ? AND mainline = ? AND status = ? AND trandate >= ? ' +
                'ORDER BY trandate DESC',
            buildParams: (filters) => [
                'SalesOrd',
                'T',
                filters.status || 'SalesOrd:B',
                filters.fromDate || '2026-01-01'
            ]
        },
        customer_balance_summary: {
            customScriptId: 'custtool_customer_balance_v1',
            maxRows: 250,
            allowedFilters: {
                minBalance: 'number'
            },
            query:
                'SELECT id, entityid, companyname, balance ' +
                'FROM customer ' +
                'WHERE NVL(isinactive, ?) = ? AND balance >= ? ' +
                'ORDER BY balance DESC',
            buildParams: (filters) => [
                'F',
                'F',
                Number(filters.minBalance || 0)
            ]
        }
    };

    const validateFilters = (dataset, filters) => {
        const safeFilters = {};
        Object.keys(filters || {}).forEach((key) => {
            const rule = dataset.allowedFilters[key];
            if (!rule) {
                throw new Error(`Filter is not allowed for this dataset: ${key}`);
            }
            const value = filters[key];
            if (Array.isArray(rule)) {
                if (!rule.includes(value)) {
                    throw new Error(`Invalid value for filter: ${key}`);
                }
                safeFilters[key] = value;
            } else if (rule === 'number') {
                const numericValue = Number(value);
                if (!Number.isFinite(numericValue)) {
                    throw new Error(`Filter must be numeric: ${key}`);
                }
                safeFilters[key] = numericValue;
            } else if (rule === 'date') {
                if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    throw new Error(`Filter must be YYYY-MM-DD: ${key}`);
                }
                safeFilters[key] = value;
            }
        });
        return safeFilters;
    };

    const runAllowedDataset = (datasetId, filters, requestedLimit) => {
        const dataset = DATASETS[datasetId];
        if (!dataset) {
            throw new Error(`Dataset is not allowed: ${datasetId}`);
        }

        const safeFilters = validateFilters(dataset, filters);
        const limit = Math.min(Number(requestedLimit) || dataset.maxRows, dataset.maxRows);
        const results = query.runSuiteQL({
            query: dataset.query,
            params: dataset.buildParams(safeFilters),
            customScriptId: dataset.customScriptId
        });

        return results.asMappedResults().slice(0, limit);
    };

    return { runAllowedDataset };
});
```

Referenced from the main script by relative path:

```javascript
define(['N/log', './lib/query_helpers'], (log, helpers) => {
    const myTool = async (params) => {
        const filters = typeof params.filters === 'string'
            ? JSON.parse(params.filters || '{}')
            : (params.filters || {});
        const records = helpers.runAllowedDataset(params.datasetId, filters, params.limit);
        return { success: true, data: records };
    };
    return { myTool };
});
```

Schema should expose only allowlisted choices:

```json
{
    "properties": {
        "datasetId": {
            "type": "string",
            "enum": ["open_sales_orders", "customer_balance_summary"],
            "description": "Allowlisted dataset to run. Raw SuiteQL is never accepted."
        },
        "filters": {
            "type": "string",
            "description": "JSON string of allowlisted filters for the selected dataset. Example: {\"status\":\"SalesOrd:B\",\"fromDate\":\"2026-01-01\"}"
        },
        "limit": {
            "type": "integer",
            "description": "Optional row limit. The tool enforces a server-side maximum per dataset."
        }
    },
    "required": ["datasetId"]
}
```

---

## Schema Design Patterns

### Complex Parameter Strategy

NetSuite's runtime may not pass nested JSON objects cleanly. The proven pattern:

1. Schema declares complex params as `"type": "string"` with descriptive text.
2. AI agent serializes the value to a JSON string.
3. JS calls `JSON.parse()` to deserialize.

```json
{
    "properties": {
        "filters": {
            "type": "string",
            "description": "JSON string containing an array of filter objects. Each object: {field, operator, value}. Example: [{\"field\":\"status\",\"operator\":\"is\",\"value\":\"open\"}]"
        }
    }
}
```

### Property Types

| JSON Schema Type | JS Runtime Type | Notes |
|-----------------|----------------|-------|
| `"string"` | `string` | Default choice. Use for complex objects (JSON string). |
| `"number"` | `number` | Numeric values |
| `"integer"` | `number` | Whole numbers only |
| `"boolean"` | `boolean` | `true` / `false` |

### Annotations Reference

| Annotation | Type | Purpose | Guidance |
|-----------|------|---------|----------|
| `title` | string | Human-readable name in tool listings | Keep short (~3-5 words) |
| `readOnlyHint` | boolean | `true` if tool only reads data | Query/validate = `true`; create/update = `false` |
| `idempotentHint` | boolean | `true` if N calls = same result as 1 | Query = `true`; create = `false`; update = `true` |
| `destructiveHint` | boolean | `true` by default — agents may seek confirmation | Set `false` for read-only/non-destructive tools; omit or set `true` for create/update/delete tools |
| `openWorldHint` | boolean | `false` for tools that only access NetSuite | Almost always `false` for NetSuite tools |

---

## MCP Integration Lifecycle

```
┌──────────┐     ┌───────────┐     ┌────────────┐     ┌─────────┐     ┌────────┐
│  Deploy   │────►│  Register  │────►│  Discover   │────►│  Invoke  │────►│ Return  │
│  (SDF)    │     │  (auto)    │     │  (MCP srv)  │     │  (agent) │     │  (JSON) │
└──────────┘     └───────────┘     └────────────┘     └─────────┘     └────────┘
```

1. **Deploy** — `suitecloud project:deploy` pushes XML + JS + schema to NetSuite.
2. **Register** — NetSuite reads the RPC schema and registers the tool internally.
3. **Discover** — MCP servers query available tools; if `exposetoaiconnector=T`, external clients see it.
4. **Invoke** — AI agent calls the tool; NetSuite routes to the JS function matching `schema.tools[0].name`.
5. **Return** — JS return value is serialized to JSON and sent back through MCP to the agent.

### Schema-to-MCP Mapping

The RPC schema IS the MCP tool definition; no transformation occurs:

| RPC Schema Field | MCP Tool Field |
|-----------------|---------------|
| `tools[0].name` | tool name |
| `tools[0].description` | tool description |
| `tools[0].inputSchema` | tool input_schema |
| `tools[0].annotations` | MCP annotations |

### `exposetoaiconnector` Flag (formerly `exposeto3rdpartyagents`)

The XML element was renamed from `<exposeto3rdpartyagents>` to `<exposetoaiconnector>` in NetSuite 2026.1. Value semantics are unchanged.

**Version selection:** Use `<exposetoaiconnector>` when `target_netsuite_version` is `"2026.1"` (default). Use `<exposeto3rdpartyagents>` when targeting `"2025.2"`.

| Value | Meaning |
|-------|---------|
| `T` | Available to external MCP clients AND NetSuite AI |
| `F` | Only available to NetSuite's built-in AI assistant |

---

## N/action Module Reference

`N/action` provides programmatic access to record actions (approve, reject, close, etc.) and can be used inside a CustomTool to trigger workflows.

### API Methods

**`action.find(options)`** — Discover available actions on a record type:
```javascript
const actions = action.find({
    recordType: 'salesorder',
    recordId: 12345           // Optional; filters to actions available for this specific record.
});
// Returns object with action names as keys.
```

**`action.execute(options)`** — Execute a single action:
```javascript
const result = action.execute({
    recordType: 'salesorder',
    id: 12345,
    action: 'approve',
    params: { approvalNote: 'Approved by automated process' }
});
```

**`action.executeBulk(options)`** — Execute on multiple records (high governance cost):
```javascript
const results = action.executeBulk({
    recordType: 'salesorder',
    ids: [12345, 12346, 12347],
    action: 'approve',
    params: {}
});
// Returns: Array of results, one per record
```

### Governance Costs

| Method | Cost |
|--------|------|
| `action.find()` | ~5 units |
| `action.execute()` | ~10 units |
| `action.executeBulk()` | **50 units** (use sparingly within 1,000 unit budget) |

---

## Complete Examples

### Example 1: Read-Only Validation Tool

**`custtoolset_validate_formula.js`**
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType CustomTool
 * @NModuleScope SameAccount
 */
define(['N/log'], (log) => {
    const TOOL_NAME = 'validateFormula';

    const getRequestId = (params) => {
        const candidate = String((params && params.requestId) || '');
        return /^[A-Za-z0-9_-]{1,80}$/.test(candidate)
            ? candidate
            : `ct_${Date.now()}`;
    };

    const validateFormula = async (params) => {
        params = params || {};
        const startTime = Date.now();
        const requestId = getRequestId(params);
        log.audit('Tool Start', `tool=${TOOL_NAME} requestId=${requestId}`);
        try {
            let formulas;
            try {
                formulas = typeof params.formulas === 'string'
                    ? JSON.parse(params.formulas) : params.formulas;
            } catch (e) {
                return { success: false, requestId, error: { type: 'PARSE_ERROR', message: 'Invalid JSON in formulas' } };
            }
            if (!Array.isArray(formulas) || formulas.length === 0) {
                return { success: false, requestId, error: { type: 'VALIDATION_ERROR', message: 'formulas must be a non-empty array' } };
            }
            const results = formulas.map((f, i) => ({
                index: i,
                label: f.label || `Formula ${i + 1}`,
                valid: f.formula && f.formula.length <= 4000,
                errors: [],
                warnings: []
            }));
            log.audit('Tool Complete', `tool=${TOOL_NAME} requestId=${requestId} formulaCount=${formulas.length} elapsedMs=${Date.now() - startTime}`);
            return {
                success: true,
                requestId,
                allValid: results.every(r => r.valid),
                formulaCount: formulas.length,
                results
            };
        } catch (e) {
            log.error('Tool Error', `tool=${TOOL_NAME} requestId=${requestId} elapsedMs=${Date.now() - startTime}`);
            return {
                success: false,
                requestId,
                error: {
                    type: 'UNEXPECTED_ERROR',
                    message: 'Unexpected tool execution error. Use requestId to correlate with logs.'
                }
            };
        }
    };
    return { validateFormula };
});
```

**`custtoolset_validate_formula_schema.json`**
```json
{
    "tools": [{
        "name": "validateFormula",
        "description": "Validates formula expressions BEFORE using them in saved search creation. Call with an array of formula objects to check syntax, character limits, and CSS compatibility.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "formulas": {
                    "type": "string",
                    "description": "JSON string containing an array of objects. Each object: {formula, type, label?}. Example: [{\"formula\":\"CASE WHEN {amount} > 1000 THEN 'High' ELSE 'Low' END\",\"type\":\"formulatext\",\"label\":\"Size\"}]"
                },
                "requestId": {
                    "type": "string",
                    "description": "Optional non-sensitive correlation ID for logs. Use letters, numbers, underscore, or hyphen only."
                }
            },
            "required": ["formulas"]
        },
        "annotations": {
            "title": "Validate Formula Rules",
            "readOnlyHint": true,
            "idempotentHint": true,
            "destructiveHint": false,
            "openWorldHint": false
        }
    }]
}
```

### Example 2: Data Query Tool with Governance Tracking

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType CustomTool
 * @NModuleScope SameAccount
 * @governance query.runSuiteQL() ~10 units + ~10/1000 rows
 */
define(['N/query', 'N/runtime', 'N/log'], (query, runtime, log) => {

    const TOOL_NAME = 'queryAnalyticsData';

    const getRequestId = (params) => {
        const candidate = String((params && params.requestId) || '');
        return /^[A-Za-z0-9_-]{1,80}$/.test(candidate)
            ? candidate
            : `ct_${Date.now()}`;
    };

    const DATASETS = {
        open_sales_orders: {
            customScriptId: 'custtool_open_sales_orders_v1',
            maxRows: 500,
            allowedStatuses: ['SalesOrd:B', 'SalesOrd:D', 'SalesOrd:E'],
            query:
                'SELECT id, tranid, trandate, entity, status, amount ' +
                'FROM transaction ' +
                'WHERE type = ? AND mainline = ? AND status = ? AND trandate >= ? ' +
                'ORDER BY trandate DESC'
        },
        overdue_invoices: {
            customScriptId: 'custtool_overdue_invoices_v1',
            maxRows: 250,
            query:
                'SELECT id, tranid, trandate, duedate, entity, amountremaining ' +
                'FROM transaction ' +
                'WHERE type = ? AND mainline = ? AND amountremaining > ? AND duedate < ? ' +
                'ORDER BY duedate ASC'
        }
    };

    const parseFilters = (params) => {
        return typeof params.filters === 'string'
            ? JSON.parse(params.filters || '{}')
            : (params.filters || {});
    };

    const assertDate = (name, value) => {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            throw new Error(`${name} must be YYYY-MM-DD`);
        }
        return value;
    };

    const buildQuery = (datasetId, filters) => {
        if (datasetId === 'open_sales_orders') {
            const dataset = DATASETS.open_sales_orders;
            const status = filters.status || 'SalesOrd:B';
            if (!dataset.allowedStatuses.includes(status)) {
                throw new Error('status is not allowed for open_sales_orders');
            }
            return {
                dataset,
                params: [
                    'SalesOrd',
                    'T',
                    status,
                    filters.fromDate ? assertDate('fromDate', filters.fromDate) : '2026-01-01'
                ]
            };
        }

        if (datasetId === 'overdue_invoices') {
            return {
                dataset: DATASETS.overdue_invoices,
                params: [
                    'CustInvc',
                    'T',
                    0,
                    filters.beforeDate ? assertDate('beforeDate', filters.beforeDate) : '2026-06-04'
                ]
            };
        }

        throw new Error(`Dataset is not allowed: ${datasetId}`);
    };

    const queryAnalyticsData = async (params) => {
        params = params || {};
        const startTime = Date.now();
        const script = runtime.getCurrentScript();
        const requestId = getRequestId(params);
        log.audit('Tool Start', `tool=${TOOL_NAME} requestId=${requestId}`);

        try {
            if (!params.datasetId) {
                return {
                    success: false,
                    requestId,
                    error: { type: 'VALIDATION_ERROR', message: 'datasetId is required' }
                };
            }

            const filters = parseFilters(params);
            const querySpec = buildQuery(params.datasetId, filters);

            // Governance check before query execution
            if (script.getRemainingUsage() < 20) {
                return {
                    success: false,
                    requestId,
                    error: { type: 'GOVERNANCE_ERROR', message: 'Insufficient units for query execution' }
                };
            }

            const results = query.runSuiteQL({
                query: querySpec.dataset.query,
                params: querySpec.params,
                customScriptId: querySpec.dataset.customScriptId
            });
            const requestedLimit = Number(params.limit) || querySpec.dataset.maxRows;
            const data = results.asMappedResults().slice(0, Math.min(requestedLimit, querySpec.dataset.maxRows));

            log.audit('Tool Complete', `tool=${TOOL_NAME} requestId=${requestId} rows=${data.length} elapsedMs=${Date.now() - startTime}`);

            return {
                success: true,
                requestId,
                datasetId: params.datasetId,
                data,
                totalRows: data.length,
                executionTime: `${Date.now() - startTime}ms`
            };
        } catch (e) {
            log.error('Tool Error', `tool=${TOOL_NAME} requestId=${requestId} elapsedMs=${Date.now() - startTime}`);
            return {
                success: false,
                requestId,
                error: {
                    type: 'EXECUTION_ERROR',
                    message: 'Unexpected tool execution error. Use requestId to correlate with logs.'
                }
            };
        }
    };

    return { queryAnalyticsData };
});
```

**Schema excerpt for the query tool:**

```json
{
    "tools": [{
        "name": "queryAnalyticsData",
        "description": "Runs one allowlisted NetSuite analytics dataset. This tool never accepts raw SuiteQL, table names, field names, joins, WHERE clauses, or ORDER BY text. Use datasetId plus documented filters only.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "datasetId": {
                    "type": "string",
                    "enum": ["open_sales_orders", "overdue_invoices"],
                    "description": "Allowlisted dataset identifier."
                },
                "filters": {
                    "type": "string",
                    "description": "JSON string containing filters allowed for the selected dataset. Examples: {\"status\":\"SalesOrd:B\",\"fromDate\":\"2026-01-01\"} or {\"beforeDate\":\"2026-06-04\"}."
                },
                "limit": {
                    "type": "integer",
                    "description": "Optional result limit. The script enforces a server-side maximum for each dataset."
                },
                "requestId": {
                    "type": "string",
                    "description": "Optional non-sensitive correlation ID for logs. Use letters, numbers, underscore, or hyphen only."
                }
            },
            "required": ["datasetId"]
        },
        "annotations": {
            "title": "Query Analytics Dataset",
            "readOnlyHint": true,
            "idempotentHint": true,
            "destructiveHint": false,
            "openWorldHint": false
        }
    }]
}
```

---

## Governance Reference

| Resource | Limit |
|----------|-------|
| Usage units per execution | 1,000 |
| Time limit | 300 seconds (5 minutes) |
| `query.runSuiteQL()` | ~10 units + ~10 per 1,000 rows |
| `search.create()` | 5 units |
| `search.load()` | 5 units |
| `record.load()` | 5 units |
| `record.save()` | 20 units |
| `action.execute()` | ~10 units |
| `action.executeBulk()` | 50 units |
| `N/log` operations | 0 units (free) |
| Pure string processing | 0 units (free) |

### Budget Strategy

Check remaining units before each expensive call and return partial results if insufficient:

```javascript
const MINIMUM_REQUIRED = 50;
if (script.getRemainingUsage() < MINIMUM_REQUIRED) {
    return {
        success: false,
        error: { type: 'GOVERNANCE_ERROR', message: 'Insufficient units remaining' },
        partialResults: resultsSoFar
    };
}
```

---

## Execution Logs (NetSuite 2026.1+)

NetSuite 2026.1 added Script Execution Logs for CustomTool scripts, making production debugging significantly easier.

**Navigation:** Customization > Scripting > Script Execution Logs

### What Gets Captured

| Log Source | Captured? | Notes |
|------------|-----------|-------|
| `log.audit()` calls | ✅ Yes | Captured when `loglevel` is AUDIT or DEBUG |
| `log.debug()` calls | ✅ Yes | Captured when `loglevel` is DEBUG |
| `log.error()` calls | ✅ Yes | Captured at ERROR level and above |
| Runtime errors | ✅ Yes | Oracle error messages captured automatically |
| Return values | ❌ No | Not logged — only call/response metadata |
| AI agent request params | ❌ No | Not logged by the platform for security reasons. Do not reintroduce raw params in `log.*` calls. |

### Log Volume Guidance

- CustomTool logs count against the same company-wide 100,000 log calls per 60-minute limit.
- Use `log.audit()` for entry/exit with only redacted metadata: `tool`, `requestId`, row/formula counts, and elapsed time.
- Do not log raw `params`, formulas, filter JSON, query text, return values, response payloads, credentials, tokens, internal IDs beyond what is strictly necessary, or stack traces.
- Use `log.error()` for correlation metadata only: `tool`, `requestId`, and elapsed time. Return a generic error message with `requestId` to the caller.
- In production, omit verbose `log.debug()` calls. If debug logging is temporarily enabled, keep it redacted and remove it after troubleshooting.
- Errors in triggered UE scripts and Workflow Actions appear in THOSE scripts' execution logs, not the CustomTool log.

---

## Custom Tools Management Page (NetSuite 2026.1+)

**Navigation:** Customization > Scripting > Custom Tools

This page provides:
- List of all deployed CustomTool scripts (ToolSets) in the account
- Per-tool enable/disable toggle
- Link to Script Execution Logs for each tool
- ACP (Agentic Customer Platform) vs SuiteApp tool differentiation

### ACP vs SuiteApp Deletion

| Tool Type | Deletion Method |
|-----------|----------------|
| ACP-created tools | Delete from Custom Tools Management Page |
| SuiteApp-deployed tools | Uninstall SuiteApp (do NOT delete from UI — causes orphans) |

---

## Official Error Reference

Oracle documents 7 specific error messages for CustomTool runtime failures. Use these to diagnose issues in Script Execution Logs rather than treating all failures as generic errors.

| Error Message | Root Cause | Resolution |
|---------------|------------|------------|
| `Access denied` | Invoking user/role lacks required permission | Check `<permissions>` block in ToolSet XML; verify user has the listed permkeys |
| `Couldn't load modules in the custom tool script because it uses unsupported modules` | Script imports N/http, N/https, or N/sftp | Remove unsupported modules; use N/query, N/record, N/search instead |
| `Invalid call, required properties missing` | Schema `required` array lists a param not provided by caller | Verify AI agent is providing all required parameters; check schema definition |
| `Script execution context creation failed` | ToolSet XML misconfiguration or account feature missing | Verify XML structure, check `<exposetoaiconnector>` value, confirm account has AI Connector enabled |
| `This tool is not allowed` | Tool not exposed to external clients, or caller lacks access | Check `<exposetoaiconnector>T</exposetoaiconnector>` in XML; verify calling client has access |
| `Unexpected error while executing the tool` | Unhandled exception in JS entry point | Wrap all code in try/catch and return a generic error with `requestId`; use redacted execution logs for correlation, not stack traces |
| `Tool execution failed` | Generic runtime failure | Check redacted Script Execution Logs by `requestId`; often caused by governance limit, schema mismatch, or data error |

---

## Schema: outputSchema and nullable (Optional/Platform-Specific)

Some AI platforms support additional schema fields beyond the standard MCP spec. These are optional and platform-specific:

| Field | Platform | Notes |
|-------|----------|-------|
| `outputSchema` | Some MCP clients | Describes the return value shape. Must use `"type": "object"` — other types are not accepted. NetSuite does not enforce this at runtime. |
| `nullable` | ChatGPT (OpenAI) | Marks a property as allowing null values. Not part of standard JSON Schema Draft 7. Ignored by most MCP clients. |

**Best practice:** Only include `outputSchema` if your AI client explicitly supports and benefits from it. Do not add `nullable` unless targeting OpenAI-specific integrations, it may cause validation warnings in other clients.
