# Appendix: N/dataset Formula Patterns and Auto-Transformations
> Author: Oracle NetSuite

> For use with N/dataset and N/workbook modules in SuiteScript 2.1

## Overview

The N/dataset module uses SuiteQL under the hood, which has **stricter limitations** than Oracle SQL used in Saved Searches. Many formulas that work in Saved Searches will fail silently or throw vague errors in N/dataset workbooks.

This appendix documents:
1. Unsupported functions and their alternatives
2. Auto-transformation patterns that convert problematic formulas
3. Best practices for formula columns in workbooks

## Critical: SuiteQL vs Oracle SQL Limitations

| Feature | Saved Search (Oracle SQL) | N/dataset (SuiteQL) |
|---------|---------------------------|---------------------|
| DECODE | ✅ Supported | ❌ Use CASE WHEN |
| NVL2 | ✅ Supported | ❌ Use CASE WHEN |
| TO_CHAR date formats | ✅ Full support | ⚠️ Limited; use EXTRACT |
| Complex nested arithmetic | ✅ Works | ❌ May fail silently |
| Window functions (ROW_NUMBER, etc.) | ❌ | ❌ |
| LISTAGG | ❌ | ❌ |
| REGEXP functions | ✅ REGEXP_LIKE, etc. | ❌ Use LIKE patterns |

## Auto-Transform Patterns

The CustomTool workbook creator automatically transforms these problematic formulas into N/dataset-compatible alternatives:

### 1. TO_CHAR Date Formatting → EXTRACT + CONCAT

**Problem:** `TO_CHAR({trandate}, 'YYYY-MM')` passes validation but fails at runtime.

**Original Formula:**
```sql
TO_CHAR({trandate}, 'YYYY-MM')
```

**Auto-Transformed To:**
```sql
CONCAT(CAST(EXTRACT(YEAR FROM {trandate}) AS VARCHAR), '-', LPAD(CAST(EXTRACT(MONTH FROM {trandate}) AS VARCHAR), 2, '0'))
```

**Additional Patterns:**

| Original | Transformed |
|----------|-------------|
| `TO_CHAR({field}, 'YYYY')` | `CAST(EXTRACT(YEAR FROM {field}) AS VARCHAR)` |
| `TO_CHAR({field}, 'MM')` | `LPAD(CAST(EXTRACT(MONTH FROM {field}) AS VARCHAR), 2, '0')` |
| `TO_CHAR({field}, 'YYYY-MM')` | `CONCAT(EXTRACT(YEAR), '-', LPAD(EXTRACT(MONTH), 2, '0'))` |

### 2. Tiered Calculations → CASE WHEN

**Problem:** Complex nested arithmetic with TRUNC fails silently in N/dataset.

**Original Formula (Commission Tiers):**
```sql
{amount} * (0.05 + 0.01 * TRUNC({amount} / 50000))
```

This formula calculates tiered commission:
- 5% base rate
- +1% for every $50,000 tier

**Auto-Transformed To:**
```sql
CASE
  WHEN {amount} < 50000 THEN {amount} * 0.05
  WHEN {amount} < 100000 THEN {amount} * 0.06
  WHEN {amount} < 150000 THEN {amount} * 0.07
  WHEN {amount} < 200000 THEN {amount} * 0.08
  ... (up to 20 tiers for $1M)
  ELSE {amount} * 0.25
END
```

### 3. DECODE → CASE WHEN

**Problem:** DECODE is not supported in SuiteQL.

**Original Formula:**
```sql
DECODE({status}, 'A', 'Active', 'I', 'Inactive', 'Unknown')
```

**Auto-Transformed To:**
```sql
CASE WHEN {status} = 'A' THEN 'Active' ELSE 'I', 'Inactive', 'Unknown' END
```

> **Note:** For multi-value DECODE, manually rewrite to full CASE WHEN:
> ```sql
> CASE
>   WHEN {status} = 'A' THEN 'Active'
>   WHEN {status} = 'I' THEN 'Inactive'
>   ELSE 'Unknown'
> END
> ```

### 4. NVL2 → CASE WHEN

**Problem:** NVL2 is not supported in SuiteQL.

**Original Formula:**
```sql
NVL2({email}, 'Has Email', 'No Email')
```

**Auto-Transformed To:**
```sql
CASE WHEN {email} IS NOT NULL THEN 'Has Email' ELSE 'No Email' END
```

## Unsupported Functions (Use Alternatives)

### Window Functions (Not Available)
```sql
-- These will NOT work:
ROW_NUMBER() OVER (PARTITION BY ...)
RANK() OVER (...)
LAG() / LEAD()
FIRST_VALUE() / LAST_VALUE()
```

**Alternative:** Use N/search with post-processing, or restructure query logic.

### Aggregate String Functions (Not Available)
```sql
-- These will NOT work:
LISTAGG({field}, ', ')
XMLAGG()
WM_CONCAT()
```

**Alternative:** Return multiple rows and concatenate in SuiteScript.

### Regular Expressions (Not Available)
```sql
-- These will NOT work:
REGEXP_LIKE({field}, 'pattern')
REGEXP_REPLACE({field}, 'pattern', 'replacement')
REGEXP_SUBSTR({field}, 'pattern')
```

**Alternative:** Use LIKE patterns:
```sql
-- Instead of REGEXP_LIKE({email}, '@company\.com$')
{email} LIKE '%@company.com'
```

## Dataset Pre-Validation

The workbook tool validates datasets by running them with 1 row **before** creating the workbook. This catches formula runtime errors early with clear error messages.

### Error Response Example
```json
{
  "success": false,
  "error": {
    "type": "DATASET_FORMULA_ERROR",
    "message": "Dataset formulas failed at runtime: Invalid function DECODE",
    "recommendation": "Check formula syntax. Use CASE WHEN instead of complex TRUNC calculations. Use EXTRACT instead of TO_CHAR for dates."
  },
  "formulaTransformations": [
    {
      "alias": "month_year",
      "original": "TO_CHAR({trandate}, 'YYYY-MM')",
      "transformed": "CONCAT(...)",
      "changes": ["TO_CHAR YYYY-MM → EXTRACT+CONCAT"]
    }
  ]
}
```

## Best Practices for Formula Columns

### 1. Always Use CASE WHEN for Conditional Logic
```sql
-- Good
CASE WHEN {amount} > 1000 THEN 'Large' ELSE 'Small' END

-- Bad (may fail silently)
DECODE({amount} > 1000, TRUE, 'Large', 'Small')
```

### 2. Use EXTRACT for Date Parts
```sql
-- Good
EXTRACT(YEAR FROM {trandate})
EXTRACT(MONTH FROM {trandate})
EXTRACT(DAY FROM {trandate})

-- Risky
TO_CHAR({trandate}, 'YYYY')
```

### 3. Avoid Complex Nested Arithmetic
```sql
-- Bad (may fail silently)
{amount} * (0.05 + 0.01 * TRUNC({amount} / 50000))

-- Good (explicit tiers)
CASE
  WHEN {amount} < 50000 THEN {amount} * 0.05
  WHEN {amount} < 100000 THEN {amount} * 0.06
  ELSE {amount} * 0.07
END
```

### 4. Use NVL for Simple Null Handling
```sql
-- This works
NVL({field}, 'default')

-- NVL2 does NOT work; use CASE WHEN instead.
CASE WHEN {field} IS NOT NULL THEN 'has value' ELSE 'no value' END
```

### 5. Cast Types Explicitly
```sql
-- Good
CAST({amount} AS VARCHAR)
CAST({quantity} AS INTEGER)

-- May cause issues
{amount} || ''  -- implicit string conversion
```

## Governance Impact

| Scenario | Governance Units |
|----------|------------------|
| Valid formula (no transform needed) | ~30 units |
| Formula with auto-transform | ~40 units (+validation) |
| Invalid formula (fails early) | ~15 units (fail-fast) |
| Invalid formula (old behavior) | ~30 units (fails late) |

The pre-validation step adds ~10 units but saves governance when formulas fail by catching errors before workbook creation.

## Complete Example: Sales Commission Workbook

```javascript
// Input to CustomTool
{
  "workbookId": "custworkbook_sales_commission",
  "dataset": {
    "type": "transaction",
    "columns": [
      {"fieldId": "tranid", "alias": "tranid"},
      {"fieldId": "trandate", "alias": "trandate"},
      {"fieldId": "amount", "alias": "amount"},
      {
        "formula": "TO_CHAR({trandate}, 'YYYY-MM')",
        "alias": "month_year"
      },
      {
        "formula": "{amount} * (0.05 + 0.01 * TRUNC({amount} / 50000))",
        "alias": "commission"
      }
    ],
    "condition": {
      "column": "amount",
      "operator": "GREATER",
      "values": 0
    }
  },
  "tables": [{
    "id": "commission_table",
    "columns": [
      {"alias": "col_tranid", "datasetColumnAlias": "tranid"},
      {"alias": "col_month", "datasetColumnAlias": "month_year"},
      {"alias": "col_amount", "datasetColumnAlias": "amount"},
      {"alias": "col_commission", "datasetColumnAlias": "commission"}
    ]
  }]
}
```

**Response includes transformation details:**
```json
{
  "success": true,
  "formulaTransformations": {
    "message": "2 formula(s) were auto-transformed to work with N/dataset",
    "details": [
      {
        "alias": "month_year",
        "original": "TO_CHAR({trandate}, 'YYYY-MM')",
        "transformed": "CONCAT(CAST(EXTRACT(YEAR FROM {trandate}) AS VARCHAR), '-', LPAD(CAST(EXTRACT(MONTH FROM {trandate}) AS VARCHAR), 2, '0'))",
        "changes": ["TO_CHAR YYYY-MM → EXTRACT+CONCAT"]
      },
      {
        "alias": "commission",
        "original": "{amount} * (0.05 + 0.01 * TRUNC({amount} / 50000))",
        "transformed": "CASE WHEN {amount} < 50000 THEN {amount} * 0.05 ... END",
        "changes": ["Tiered TRUNC calculation → CASE WHEN (20 tiers)"]
      }
    ]
  },
  "datasetValidation": {
    "passed": true,
    "sampleRow": {}
  }
}
```

## When to Use Saved Search Instead

If your formula requirements include any of these, use a Saved Search instead of N/workbook:

1. **Window functions** (ROW_NUMBER, RANK, LAG, LEAD)
2. **String aggregation** (LISTAGG)
3. **Complex regex patterns** (beyond LIKE capabilities)
4. **Hierarchical queries** (CONNECT BY)
5. **Dynamic pivot operations**

The CustomTool Saved Search creator supports full Oracle SQL formula syntax.

## References

- [SuiteQL Functions Reference](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_159309850252.html)
- [N/dataset Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4675023796.html)
- [N/workbook Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4675054696.html)
- [SuiteAnalytics Workbook Best Practices](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4675067626.html)
