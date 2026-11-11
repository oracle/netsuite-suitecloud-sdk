# Appendix: Performance Monitoring Queries
> Source: SuiteQL system tables confirmed via live account probing (March 2026)
> Author: Oracle NetSuite

## Overview

NetSuite exposes script execution data through several SuiteQL system tables. This appendix provides ready-to-use queries for monitoring script performance, error rates, and deployment inventory.

**What IS queryable via SuiteQL:**
- Scheduled Script and Map/Reduce execution duration (`scheduledscriptinstance`)
- Script log entries written by `log.debug/audit/error/emergency()` (`scriptnote`)
- Script deployment configuration and status (`scriptdeployment` + `script`)

**What is NOT queryable via SuiteQL:**
- APM (Application Performance Management) dashboard data — UI-only
- User Event, Suitelet, RESTlet, Client Script execution times — not tracked natively
- Governance unit consumption per execution — not stored in any table
- CustomTool execution logs (2026.1+) — UI-only at Customization > Scripting > Script Execution Logs

For synchronous script types without native timing, use the self-instrumented PERF_TIMING pattern (see [appendix-perf-timing.md](appendix-perf-timing.md)).

---

## Available System Tables

### Primary Tables

| Table | Purpose | Key Fields |
|---|---|---|
| `scheduledscriptinstance` | Execution instances for Scheduled/Map-Reduce | `startDate`, `endDate`, `status`, `mapReduceStage`, `percentComplete`, `taskId`, `queue` |
| `scriptnote` | Script execution log entries | `date`, `type` (DEBUG/AUDIT/ERROR/EMERGENCY), `title`, `detail`, `scriptType` (joinable) |
| `scriptdeployment` | Deployment configuration | `script` (joinable), `isdeployed`, `status`, `loglevel`, `recordtype`, `concurrencylimit`, `priority` |
| `script` | Script master records | `scriptid`, `name`, `scripttype` (joinable), `scriptfile`, `apiversion`, `isinactive` |

### Lookup Tables

| Table | Fields | Purpose |
|---|---|---|
| `scripttype` | `id`, `name` | Script type names (Suitelet, RESTlet, etc.) |
| `scriptstatus` | `id`, `name` | Deployment statuses |
| `scriptnotetype` | `id`, `name` | Log levels (Debug, Audit, Error, Emergency) |
| `scriptrecordtype` | `internalId`, `name` | Record types scripts apply to |
| `scripteventtype` | `id`, `name` | Event types (beforeLoad, etc.) |
| `executioncontext` | `id`, `name` | Execution contexts (UI, CSV Import, etc.) |

---

## Execution Duration Queries (scheduledscriptinstance)

These queries only cover **Scheduled Scripts** and **Map/Reduce Scripts** — the only script types with native execution time tracking.

### Average Execution Time by Deployment (Last 7 Days)

```sql
SELECT
    sd.title AS deployment_name,
    sd.scriptid AS deployment_id,
    COUNT(*) AS total_runs,
    ROUND(AVG((si.endDate - si.startDate) * 86400), 1) AS avg_duration_s,
    ROUND(MAX((si.endDate - si.startDate) * 86400), 1) AS max_duration_s,
    ROUND(MIN((si.endDate - si.startDate) * 86400), 1) AS min_duration_s
FROM scheduledscriptinstance si
    INNER JOIN scriptdeployment sd ON sd.id = si.scriptDeployment
WHERE si.startDate >= SYSDATE - 7
    AND si.status = 'Complete'
    AND si.endDate IS NOT NULL
GROUP BY sd.title, sd.scriptid
ORDER BY avg_duration_s DESC
```

**Notes:**
- `endDate - startDate` returns days as a decimal; multiply by 86400 for seconds.
- Filter `endDate IS NOT NULL` excludes in-progress or failed executions without completion.
- Results show which deployments are slowest on average.

### Top 10 Slowest Executions (Last 30 Days)

```sql
SELECT
    sd.title AS deployment_name,
    sd.scriptid AS deployment_id,
    si.startDate,
    si.endDate,
    ROUND((si.endDate - si.startDate) * 86400, 1) AS duration_s,
    si.status
FROM scheduledscriptinstance si
    INNER JOIN scriptdeployment sd ON sd.id = si.scriptDeployment
WHERE si.startDate >= SYSDATE - 30
    AND si.endDate IS NOT NULL
ORDER BY (si.endDate - si.startDate) DESC
FETCH FIRST 10 ROWS ONLY
```

### Execution Status Breakdown by Script

```sql
SELECT
    sd.title AS deployment_name,
    si.status,
    COUNT(*) AS count
FROM scheduledscriptinstance si
    INNER JOIN scriptdeployment sd ON sd.id = si.scriptDeployment
WHERE si.startDate >= SYSDATE - 30
GROUP BY sd.title, si.status
ORDER BY sd.title, count DESC
```

**Common status values:** `Pending`, `Processing`, `Complete`, `Failed`, `Deferred`, `Canceled`

### Map/Reduce Stage Progression

```sql
SELECT
    sd.title AS deployment_name,
    si.mapReduceStage,
    si.status,
    si.percentComplete,
    si.startDate,
    si.endDate,
    ROUND((si.endDate - si.startDate) * 86400, 1) AS duration_s
FROM scheduledscriptinstance si
    INNER JOIN scriptdeployment sd ON sd.id = si.scriptDeployment
WHERE si.startDate >= SYSDATE - 7
    AND si.mapReduceStage IS NOT NULL
ORDER BY si.startDate DESC, si.mapReduceStage
```

**Stage values:** `GET_INPUT`, `MAP`, `REDUCE`, `SUMMARIZE`

---

## Error Analysis Queries (scriptnote)

### Error Count by Script (Last 7 Days)

```sql
SELECT
    sn.scriptType AS script_id,
    COUNT(*) AS error_count
FROM scriptnote sn
WHERE sn.type = 'ERROR'
    AND sn.date >= SYSDATE - 7
GROUP BY sn.scriptType
ORDER BY error_count DESC
```

### Recent Error Messages for a Script

```sql
SELECT
    sn.date,
    sn.title,
    sn.detail
FROM scriptnote sn
WHERE sn.type = 'ERROR'
    AND sn.scriptType = ?
    AND sn.date >= SYSDATE - 7
ORDER BY sn.date DESC
```

Replace `?` with the script internal ID (numeric).

### Error Rate Trend (Daily for Last 30 Days)

```sql
SELECT
    TO_CHAR(sn.date, 'YYYY-MM-DD') AS log_date,
    SUM(CASE WHEN sn.type = 'ERROR' THEN 1 ELSE 0 END) AS errors,
    SUM(CASE WHEN sn.type = 'AUDIT' THEN 1 ELSE 0 END) AS audits,
    COUNT(*) AS total_logs
FROM scriptnote sn
WHERE sn.date >= SYSDATE - 30
GROUP BY TO_CHAR(sn.date, 'YYYY-MM-DD')
ORDER BY log_date DESC
```

### Error Rate Trending with Threshold Alerts

Use this pattern to detect error rate spikes across deployments:

```sql
-- Weekly error rate by script (last 4 weeks for trend comparison).
SELECT
    sn.scriptType AS script_id,
    TO_CHAR(sn.date, 'IYYY-IW') AS iso_week,
    SUM(CASE WHEN sn.type = 'ERROR' THEN 1 ELSE 0 END) AS errors,
    SUM(CASE WHEN sn.type = 'AUDIT' THEN 1 ELSE 0 END) AS audits,
    COUNT(*) AS total_logs,
    ROUND(SUM(CASE WHEN sn.type = 'ERROR' THEN 1 ELSE 0 END) * 100.0
        / NULLIF(COUNT(*), 0), 1) AS error_pct
FROM scriptnote sn
WHERE sn.date >= SYSDATE - 28
GROUP BY sn.scriptType, TO_CHAR(sn.date, 'IYYY-IW')
ORDER BY sn.scriptType, iso_week
```

**Trend interpretation:**

| Pattern | Meaning | Action |
|---|---|---|
| error_pct stable week-over-week | Healthy — baseline error rate | No action |
| error_pct increased >50% from prior week | Spike — likely caused by recent deployment | Investigate recent changes |
| error_pct > 10% for any week | Elevated — systemic issue | Review script logic and error handling |
| errors > 0 but audits = 0 | Missing audit logging | Add `log.audit()` calls for traceability |

### Top Error Messages (Recurring Patterns)

```sql
-- Most frequent error titles (last 7 days) — identifies systemic issues.
SELECT
    sn.scriptType AS script_id,
    sn.title AS error_title,
    COUNT(*) AS occurrences,
    MIN(sn.date) AS first_seen,
    MAX(sn.date) AS last_seen
FROM scriptnote sn
WHERE sn.type = 'ERROR'
    AND sn.date >= SYSDATE - 7
GROUP BY sn.scriptType, sn.title
HAVING COUNT(*) >= 3
ORDER BY occurrences DESC
```

This query surfaces recurring errors (3+ occurrences) that are more likely to be systemic issues than one-off failures. Single-occurrence errors are often transient and less actionable.

---

## Script Deployment Inventory

### All Active Deployments with Script Type

```sql
SELECT
    s.scriptid AS script_id,
    s.name AS script_name,
    sd.scriptid AS deployment_id,
    sd.title AS deployment_title,
    sd.isdeployed,
    sd.loglevel
FROM scriptdeployment sd
    INNER JOIN script s ON s.id = sd.script
WHERE sd.isdeployed = 'T'
    AND s.isinactive = 'F'
ORDER BY s.name
```

### Deployments by Record Type

```sql
SELECT
    sd.recordtype,
    s.name AS script_name,
    sd.scriptid AS deployment_id,
    sd.isdeployed
FROM scriptdeployment sd
    INNER JOIN script s ON s.id = sd.script
WHERE sd.isdeployed = 'T'
    AND sd.recordtype IS NOT NULL
ORDER BY sd.recordtype, s.name
```

---

## PERF_TIMING Log Extraction

When scripts are instrumented with the PERF_TIMING pattern (see [appendix-perf-timing.md](appendix-perf-timing.md)), timing data is written to `scriptnote` with `title = 'PERF_TIMING'`.

### Extract Timing Data for a Script (Last 7 Days)

```sql
SELECT
    sn.date,
    sn.detail
FROM scriptnote sn
WHERE sn.title = 'PERF_TIMING'
    AND sn.scriptType = ?
    AND sn.date >= SYSDATE - 7
ORDER BY sn.date DESC
```

The `detail` field contains a JSON string with the timing payload:

```json
{
    "script": "customscript_my_ue",
    "deploy": "customdeploy_my_ue",
    "entry": "afterSubmit",
    "duration_ms": 245,
    "remaining_units": 920,
    "context": "USER_INTERFACE"
}
```

Parse client-side to extract metrics for analysis and trending.

### Aggregate PERF_TIMING by Entry Point

Since SuiteQL cannot parse JSON in the `detail` field, aggregation must be done client-side after fetching raw rows. Fetch with:

```sql
SELECT sn.date, sn.detail
FROM scriptnote sn
WHERE sn.title = 'PERF_TIMING'
    AND sn.date >= SYSDATE - 7
ORDER BY sn.date DESC
```

Then parse and aggregate in JavaScript or the calling application.

---

## AI Connector Integration

### How to Execute These Queries

When the AI Connector is detected, these fixed diagnostic queries can be executed programmatically through an existing reviewed connector tool.

> **Security note:** This section is for running the static performance queries in this appendix only. Do not use it as a pattern for CustomTools exposed through MCP. CustomTools must not accept raw SuiteQL, table names, field names, joins, WHERE fragments, or ORDER BY text from the agent/user; use allowlisted dataset IDs and fixed query templates instead. See `appendix-customtool-runtime.md`.

1. **Read connector config:**
   ```
   ~/.claude/netsuite-connector-config.json
   → { "detected": true, "prefix": "claude_ai_NetSuite_-_Mfg", ... }
   ```

2. **Construct tool call:**
   - Use `mcp__<prefix>__ns_runCustomSuiteQL` (preferred — supports pagination)
   - Or `mcp__<prefix>__runCustomSuiteQL` (simpler, no pagination)
   - Pass only one of the static SuiteQL queries from this appendix as the `sqlQuery` parameter. Do not compose `sqlQuery` from free-form user or agent text.

3. **Handle errors gracefully:**
   - Table access may be restricted by role permissions.
   - Some tables may not be available in all account configurations.
   - Query timeout for large result sets — add date filters to narrow scope.
   - **Never block a workflow on query failure** — treat all connector queries as advisory.

### Graceful Degradation

If the AI Connector is unavailable or queries fail:

1. Present the SuiteQL query to the user for manual execution.
2. Direct them to: **Customization > Lists, Records & Fields > SuiteQL** in NetSuite.
3. Note: "Performance baseline unavailable — run this query manually to capture metrics".

---

## Baseline Capture Schema

The deploy flow uses this schema to store pre/post deployment performance baselines.

### perf-baseline.json Format

**Location:** `~/.claude/docs/deployments/perf-baseline.json`

```json
{
    "captured_at": "2026-03-06T10:30:00Z",
    "deployment_id": "2026-03-06_10-28-45",
    "scripts": {
        "customdeploy_my_scheduled": {
            "pre": {
                "avg_duration_s": 45.2,
                "max_duration_s": 82.0,
                "error_rate_pct": 5.0,
                "total_runs": 120
            },
            "post": {
                "avg_duration_s": 38.1,
                "max_duration_s": 55.0,
                "error_rate_pct": 2.0,
                "total_runs": 3
            },
            "delta": {
                "duration_pct": -15.7,
                "error_rate_pct": -60.0
            }
        }
    },
    "notes": "Post-deploy metrics based on limited sample (3 runs). Re-check after 24 hours for reliable comparison."
}
```

**Field Descriptions:**

| Field | Type | Description |
|---|---|---|
| `captured_at` | ISO-8601 | When the comparison was made |
| `deployment_id` | string | Matches the deployment log timestamp |
| `scripts` | object | Keyed by deployment ID (`customdeploy_*`) |
| `pre` / `post` | object | Metrics before and after deployment |
| `avg_duration_s` | number | Average execution time in seconds |
| `max_duration_s` | number | Maximum execution time in seconds |
| `error_rate_pct` | number | Percentage of failed executions |
| `total_runs` | number | Number of executions in the sample period |
| `delta.duration_pct` | number | Percentage change in avg duration (negative = improvement) |
| `delta.error_rate_pct` | number | Percentage change in error rate (negative = improvement) |
| `notes` | string | Contextual notes about sample size or limitations |

### governance-trend.json Format

**Location:** `~/.claude/docs/deployments/governance-trend.json`

This file tracks governance estimates and performance metrics across deployments, enabling trend analysis.

```json
{
    "deployments": [
        {
            "timestamp": "2026-03-06T10:30:00Z",
            "project": "my-suiteapp",
            "scripts_deployed": ["customscript_my_ue", "customscript_my_mr"],
            "governance_estimates": {
                "customscript_my_ue": {
                    "script_type": "UserEventScript",
                    "estimated_units": 80,
                    "limit": 1000,
                    "utilization_pct": 8.0
                },
                "customscript_my_mr": {
                    "script_type": "MapReduceScript",
                    "estimated_units": 4500,
                    "limit": 10000,
                    "utilization_pct": 45.0
                }
            },
            "perf_baseline": {
                "customdeploy_my_mr": {
                    "avg_duration_s": 38.1,
                    "error_count": 2,
                    "total_runs": 120
                }
            },
            "deployment_result": "success"
        }
    ]
}
```

**Field Descriptions:**

| Field | Type | Description |
|---|---|---|
| `timestamp` | ISO-8601 | When the deployment occurred |
| `project` | string | Project directory name (for multi-project filtering) |
| `scripts_deployed` | string[] | Script IDs included in this deployment |
| `governance_estimates` | object | Per-script governance budget estimates from code-quality-agent Step 6.5 |
| `perf_baseline` | object | Per-deployment execution metrics (only present when connector captured data) |
| `deployment_result` | string | `success` or `failed` |

**Retention:** Maximum 50 entries. Oldest entries trimmed on each append.

**Trend Thresholds:**

| Metric | Warning Threshold | Direction |
|---|---|---|
| Governance estimate | >20% increase from prior deploy | Regression |
| Avg execution duration | >25% increase over last 3 deploys | Regression |
| Error count | Increase in 2 consecutive deploys | Regression |

---

## Coverage Limitations

| Script Type | Execution Duration | Error Logs | Recommended Approach |
|---|---|---|---|
| Scheduled Script | `scheduledscriptinstance` | `scriptnote` | Full native coverage |
| Map/Reduce | `scheduledscriptinstance` | `scriptnote` | Full native coverage with per-stage tracking |
| User Event | Not available | `scriptnote` | Self-instrument with PERF_TIMING pattern |
| Suitelet | Not available | `scriptnote` | Self-instrument with PERF_TIMING pattern |
| RESTlet | Not available | `scriptnote` | Self-instrument with PERF_TIMING pattern |
| Portlet | Not available | `scriptnote` | Self-instrument with PERF_TIMING pattern |
| Workflow Action | Not available | `scriptnote` | Self-instrument with PERF_TIMING pattern |
| Client Script | Not available | Not available | Browser DevTools: `console.time()` / `performance.now()` |
| CustomTool | Not available | `scriptnote` (2026.1+) | Execution Logs UI + PERF_TIMING |

---

## SuiteQL Syntax Reminders

When writing or modifying these queries:

- **Date arithmetic:** `SYSDATE - N` for N days ago (not `DATEADD`).
- **Null handling:** `NVL(field, default)` not `COALESCE` or `ISNULL`.
- **Row limiting:** Use `FETCH FIRST N ROWS ONLY` or `WHERE ROWNUM <= N` (not `LIMIT`).
- **No CTEs:** `WITH` clauses are not supported. Use inline subqueries.
- **String concatenation:** Use `||` operator (not `+` or `CONCAT`).
- **Date formatting:** `TO_CHAR(date, 'YYYY-MM-DD')` for display.
- **Parameterized queries:** Use `?` placeholders with `params` array for variable values. It improves both security and query plan caching (see Pitfall #106).
