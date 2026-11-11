# Appendix: Self-Instrumented Performance Timing
> Patterns for measuring script execution time when native metrics are unavailable
> Author: Oracle NetSuite

## Overview

NetSuite tracks execution duration natively only for **Scheduled Scripts** and **Map/Reduce Scripts** (via the `scheduledscriptinstance` table — see [appendix-perf-queries.md](appendix-perf-queries.md)). For all other server-side script types (User Event, Suitelet, RESTlet, Portlet, Workflow Action, CustomTool), there is **no native execution time tracking**.

The PERF_TIMING pattern solves this by writing structured timing data to `scriptnote` via `log.audit()`, which can then be queried via SuiteQL.

**Governance cost:** Each `log.audit()` call consumes **1 governance unit**. Always gate behind a toggle parameter.

---

## The PERF_TIMING Pattern

### Core Pattern

```javascript
const _perfStart = Date.now();
// ... business logic ...
log.audit('PERF_TIMING', JSON.stringify({
    script: runtime.getCurrentScript().id,
    deploy: runtime.getCurrentScript().deploymentId,
    entry: 'afterSubmit',
    duration_ms: Date.now() - _perfStart,
    remaining_units: runtime.getCurrentScript().getRemainingUsage(),
    context: runtime.executionContext.toString()
}));
```

### Log Schema

| Field | Type | Description |
|---|---|---|
| `script` | string | Script ID (`customscript_xxx`) |
| `deploy` | string | Deployment ID (`customdeploy_xxx`) |
| `entry` | string | Entry point name (beforeLoad, afterSubmit, onRequest, etc.) |
| `duration_ms` | number | Execution time in milliseconds |
| `remaining_units` | number | Governance units remaining after execution |
| `context` | string | Execution context (USER_INTERFACE, WEBSERVICES, CSV_IMPORT, etc.) |

### Reusable Helper

All script type patterns below use this shared helper:

```javascript
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
```

---

## Patterns by Script Type

### User Event Script

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime', 'N/log'], (runtime, log) => {
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

    const beforeLoad = (context) => {
        const _start = Date.now();
        try {
            // ... business logic ...
        } finally {
            _logPerf('beforeLoad', _start);
        }
    };

    const beforeSubmit = (context) => {
        const _start = Date.now();
        try {
            // ... business logic ...
        } finally {
            _logPerf('beforeSubmit', _start);
        }
    };

    const afterSubmit = (context) => {
        const _start = Date.now();
        try {
            // ... business logic ...
        } finally {
            _logPerf('afterSubmit', _start);
        }
    };

    return { beforeLoad, beforeSubmit, afterSubmit };
});
```

### Suitelet

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/runtime', 'N/log'], (runtime, log) => {
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

    const onRequest = (context) => {
        const _start = Date.now();
        try {
            // ... business logic (GET/POST routing, form building, etc.) ...
        } finally {
            _logPerf('onRequest', _start);
        }
    };

    return { onRequest };
});
```

### RESTlet

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/runtime', 'N/log'], (runtime, log) => {
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

    const get = (requestParams) => {
        const _start = Date.now();
        try {
            // ... business logic ...
            return { success: true };
        } finally {
            _logPerf('get', _start);
        }
    };

    const post = (requestBody) => {
        const _start = Date.now();
        try {
            // ... business logic ...
            return { success: true };
        } finally {
            _logPerf('post', _start);
        }
    };

    return { get, post };
});
```

### Scheduled Script

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/log', 'N/search'], (runtime, log, search) => {
    const PERF_ENABLED = runtime.getCurrentScript().getParameter({
        name: 'custscript_perf_timing'
    });

    const _logPerf = (entry, startTime, extra) => {
        if (!PERF_ENABLED) return;
        log.audit('PERF_TIMING', JSON.stringify({
            script: runtime.getCurrentScript().id,
            deploy: runtime.getCurrentScript().deploymentId,
            entry,
            duration_ms: Date.now() - startTime,
            remaining_units: runtime.getCurrentScript().getRemainingUsage(),
            context: runtime.executionContext.toString(),
            ...extra
        }));
    };

    const execute = (context) => {
        const _overallStart = Date.now();
        let recordsProcessed = 0;

        // ... search and iterate ...
        search.create({ /* ... */ }).run().each((result) => {
            const _batchStart = Date.now();

            // ... process record ...
            recordsProcessed++;

            // Sample every 50th record to avoid log spam.
            if (recordsProcessed % 50 === 0) {
                _logPerf('execute_batch', _batchStart, {
                    records_processed: recordsProcessed
                });
            }
            return true;
        });

        _logPerf('execute_overall', _overallStart, {
            total_records: recordsProcessed
        });
    };

    return { execute };
});
```

**Note:** Scheduled Scripts already have native timing in `scheduledscriptinstance`. PERF_TIMING adds per-batch granularity and governance tracking that the native table lacks.

### Map/Reduce Script

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/runtime', 'N/log'], (runtime, log) => {
    const PERF_ENABLED = runtime.getCurrentScript().getParameter({
        name: 'custscript_perf_timing'
    });

    const _logPerf = (entry, startTime, extra) => {
        if (!PERF_ENABLED) return;
        log.audit('PERF_TIMING', JSON.stringify({
            script: runtime.getCurrentScript().id,
            deploy: runtime.getCurrentScript().deploymentId,
            entry,
            duration_ms: Date.now() - startTime,
            remaining_units: runtime.getCurrentScript().getRemainingUsage(),
            ...extra
        }));
    };

    const getInputData = (context) => {
        const _start = Date.now();
        try {
            // ... return search or array ...
            return [];
        } finally {
            _logPerf('getInputData', _start);
        }
    };

    const map = (context) => {
        const _start = Date.now();
        try {
            // ... process key/value ...
            context.write({ key: context.key, value: context.value });
        } finally {
            // Sample 1% of keys to avoid governance burn
            if (Math.random() < 0.01) {
                _logPerf('map_sample', _start, { key: context.key });
            }
        }
    };

    const reduce = (context) => {
        const _start = Date.now();
        try {
            // ... aggregate values ...
        } finally {
            // Sample 1% of keys
            if (Math.random() < 0.01) {
                _logPerf('reduce_sample', _start, { key: context.key });
            }
        }
    };

    const summarize = (context) => {
        const _start = Date.now();
        try {
            // ... log results, handle errors ...
        } finally {
            _logPerf('summarize', _start, {
                mapErrors: context.mapSummary.errors.length,
                reduceErrors: context.reduceSummary.errors.length
            });
        }
    };

    return { getInputData, map, reduce, summarize };
});
```

### Client Script (Browser-Only)

Client Scripts run in the browser. `log.audit()` is **silently ignored** on form-attached scripts. Use browser APIs instead:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/currentRecord'], (currentRecord) => {

    const pageInit = (context) => {
        console.time('pageInit');
        // ... initialization logic ...
        console.timeEnd('pageInit'); // Prints duration to browser DevTools
    };

    const fieldChanged = (context) => {
        const start = performance.now();
        // ... field handling logic ...
        const elapsed = performance.now() - start;
        console.log(`fieldChanged(${context.fieldId}): ${elapsed.toFixed(2)}ms`);
    };

    const saveRecord = (context) => {
        console.time('saveRecord');
        // ... validation logic ...
        console.timeEnd('saveRecord');
        return true;
    };

    return { pageInit, fieldChanged, saveRecord };
});
```

**Key differences from server-side:**
- Use `console.time()` / `console.timeEnd()` for named timers
- Use `performance.now()` for sub-millisecond precision
- Output appears in browser DevTools console (F12)
- No `log.audit()` — it is silently ignored in Client Scripts
- No `scriptnote` entries — timing data stays in the browser only

### CustomTool

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType CustomTool
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/log'], (runtime, log) => {
    const TOOL_NAME = 'myToolFunction';
    const PERF_ENABLED = runtime.getCurrentScript().getParameter({
        name: 'custscript_perf_timing'
    });
    const getRequestId = (params) => {
        const candidate = String((params && params.requestId) || '');
        return /^[A-Za-z0-9_-]{1,80}$/.test(candidate)
            ? candidate
            : `ct_${Date.now()}`;
    };

    const myToolFunction = async (params) => {
        params = params || {};
        const _start = Date.now();
        const requestId = getRequestId(params);

        try {
            // ... tool logic ...
            const result = { success: true, requestId, data: {} };

            if (PERF_ENABLED) {
                log.audit('PERF_TIMING', JSON.stringify({
                    tool: TOOL_NAME,
                    requestId: requestId,
                    duration_ms: Date.now() - _start
                }));
            }

            return result;
        } catch (e) {
            log.error('Tool Error', `tool=${TOOL_NAME} requestId=${requestId} elapsedMs=${Date.now() - _start}`);
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

    return { myToolFunction };
});
```

**Note:** NetSuite 2026.1+ provides execution logs at Customization > Scripting > Script Execution Logs, but PERF_TIMING gives a focused timing record without logging raw tool inputs or responses.

---

## Conditional Toggle Pattern

### Script Parameter Toggle (Recommended)

Enable/disable timing without redeployment by using a script parameter:

**1. Define the parameter in your script Object XML:**

```xml
<usereventscript scriptid="customscript_my_ue">
  <name>My User Event</name>
  <scriptfile>[/SuiteScripts/my_ue.js]</scriptfile>
  <scriptcustomfields>
    <scriptcustomfield scriptid="custscript_perf_timing">
      <fieldtype>CHECKBOX</fieldtype>
      <label>Enable Performance Timing</label>
      <description>When checked, writes PERF_TIMING audit logs for execution time measurement</description>
      <defaultchecked>F</defaultchecked>
    </scriptcustomfield>
  </scriptcustomfields>
  <scriptdeployments>
    <scriptdeployment scriptid="customdeploy_my_ue">
      <isdeployed>T</isdeployed>
      <loglevel>AUDIT</loglevel>
      <status>RELEASED</status>
      <recordtype>salesorder</recordtype>
      <allroles>T</allroles>
    </scriptdeployment>
  </scriptdeployments>
</usereventscript>
```

**2. Read in script:**
```javascript
const PERF_ENABLED = runtime.getCurrentScript().getParameter({
    name: 'custscript_perf_timing'
});
```

**3. Toggle via NetSuite UI:**
Navigate to: Script Deployment record > Parameters tab > check/uncheck "Enable Performance Timing".

No redeployment required; takes effect immediately on next execution.

### Why a Toggle is Critical

| Concern | Impact Without Toggle |
|---|---|---|
| Governance cost | 1-3 extra units per execution (per entry point) |
| Log volume | 3 entries per record save × 1,000 records/day = 3,000 extra logs/day |
| Company log limit | 100,000 log calls per 60 minutes (company-wide) |
| Auto-escalation | NetSuite auto-raises log level if a script logs excessively |
| Storage | Log entries retained 30 days; high volume fills database log quota (5M entries) |

**Always deploy with the toggle OFF (`F`).** Enable only when actively investigating performance.

---

## Querying PERF_TIMING Data

After instrumenting scripts, extract timing data via SuiteQL:

```sql
SELECT sn.date, sn.detail
FROM scriptnote sn
WHERE sn.title = 'PERF_TIMING'
    AND sn.date >= SYSDATE - 7
ORDER BY sn.date DESC
```

The `detail` field contains the JSON payload. Parse client-side to compute averages, identify outliers, and track trends.

For comprehensive performance queries including `scheduledscriptinstance` and error analysis, see [appendix-perf-queries.md](appendix-perf-queries.md).

---

## Governance Cost of Instrumentation

| Script Type | Entry Points Timed | Extra Units Per Execution | Notes |
|---|---|---|---|
| User Event | 3 (beforeLoad, beforeSubmit, afterSubmit) | 3 | Per record load/save |
| Suitelet | 1 (onRequest) | 1 | Per page request |
| RESTlet | 1 (per method called) | 1 | Per API call |
| Portlet | 1 (render) | 1 | Per dashboard refresh |
| Workflow Action | 1 (onAction) | 1 | Per workflow transition |
| CustomTool | 1 (per tool function) | 1 | Per tool invocation |
| Scheduled | 1 overall + N sampled batches | 1 + ceil(records / sampleRate) | Use sampling |
| Map/Reduce | 4 stages + N sampled keys | 4 + ceil(keys × sampleRate) | 1% sampling recommended |

### Sampling Pattern for High-Volume Scripts

For Map/Reduce `map()` and `reduce()` stages, log every Nth key instead of every key:

```javascript
const SAMPLE_RATE = 0.01; // 1% of keys

const map = (context) => {
    const _start = Date.now();
    // ... business logic ...

    if (Math.random() < SAMPLE_RATE && PERF_ENABLED) {
        _logPerf('map_sample', _start, { key: context.key });
    }
};
```

At 10,000 keys, this produces ~100 log entries instead of 10,000 — a 99% reduction in instrumentation overhead while still providing statistically meaningful timing data.

---

## Mode-Aware Integration

| Mode | Auto-Inject PERF_TIMING? | Toggle Default | Rationale |
|---|---|---|---|
| Assisted | No | N/A | Too complex for non-technical users |
| Standard | Yes — include in generated code | Off (`F`) | Developers can enable when needed |
| Expert | Yes — include in generated code | Off (`F`) | Experts expect instrumentation hooks |

When generating code in **Standard** or **Expert** mode, include:
1. The `custscript_perf_timing` parameter in the Object XML
2. The `PERF_ENABLED` check and `_logPerf` helper in the script
3. `try/finally` blocks around each entry point

When generating code in **Assisted** mode, omit all PERF_TIMING code to keep scripts simple and focused on business logic.
