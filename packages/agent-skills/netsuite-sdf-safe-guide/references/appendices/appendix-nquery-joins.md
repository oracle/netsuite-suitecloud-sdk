# Appendix: Scripting with Multi-Level Joins using N/query
> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

The N/query module overcomes the two-level record join limitation of N/search by allowing multi-level joins using the SuiteAnalytics Workbook query engine.

## N/query Capabilities

- **Multi-level joins** - Join field data from multiple record types
- **Advanced conditions** - AND, OR, NOT logic with formulas and relative dates
- **Flexible sorting** - Sort results based on multiple columns

## Key Objects

| Object | Purpose |
|--------|---------|
| Query | Initial query definition |
| Component | Building block for joins |
| Condition | Filters/conditions for results |
| Column | Fields to return in results |
| Sort | Sorting configuration |
| ResultSet | Query execution results |

## Complete Code Example

```javascript
/**
 * Multi-level join query example
 * Customer → Sales Rep (Employee) → Location
 * @NApiVersion 2.1
 */
require(['N/query', 'N/log'], function(query, log) {

    // Step 1: Create a query definition for Customer records.
    const myCustomerQuery = query.create({
        type: query.Type.CUSTOMER
    });

    // Step 2: Join based on salesrep field (references Employee record).
    const mySalesRepJoin = myCustomerQuery.autoJoin({
        fieldId: 'salesrep'
    });

    // Step 3: Join Employee to Location (third level).
    const myLocationJoin = mySalesRepJoin.autoJoin({
        fieldId: 'location'
    });

    // Step 4: Create conditions.
    // Condition 1: id = 1022
    const firstCondition = myCustomerQuery.createCondition({
        fieldId: 'id',
        operator: query.Operator.EQUAL,
        values: 1022
    });

    // Condition 2: id = 955
    const secondCondition = myCustomerQuery.createCondition({
        fieldId: 'id',
        operator: query.Operator.EQUAL,
        values: 955
    });

    // Condition 3: Email does not start with 'foo'.
    const thirdCondition = mySalesRepJoin.createCondition({
        fieldId: 'email',
        operator: query.Operator.START_WITH_NOT,
        values: 'foo'
    });

    // Step 5: Combine conditions with AND/OR.
    // (Email NOT STARTS WITH 'foo') AND (id = 1022 OR id = 955)
    myCustomerQuery.condition = myCustomerQuery.and(
        thirdCondition,
        myCustomerQuery.or(firstCondition, secondCondition)
    );

    // Step 6: Create columns from different record types.
    myCustomerQuery.columns = [
        myCustomerQuery.createColumn({
            fieldId: 'entityid'
        }),
        myCustomerQuery.createColumn({
            fieldId: 'id'
        }),
        mySalesRepJoin.createColumn({
            fieldId: 'entityid'
        }),
        mySalesRepJoin.createColumn({
            fieldId: 'email'
        }),
        mySalesRepJoin.createColumn({
            fieldId: 'hiredate'
        }),
        myLocationJoin.createColumn({
            fieldId: 'name'
        })
    ];

    // Step 7: Sort by multiple columns.
    myCustomerQuery.sort = [
        myCustomerQuery.createSort({
            column: myCustomerQuery.columns[3]  // email
        }),
        myCustomerQuery.createSort({
            column: myCustomerQuery.columns[0], // entityid
            ascending: false
        })
    ];

    // Step 8: Run the query.
    const resultSet = myCustomerQuery.run();

    // Step 9: Process results
    const results = resultSet.results;
    for (let i = results.length - 1; i >= 0; i--) {
        log.debug(results[i].values);
    }
    log.debug(resultSet.types);
});
```

## Building Queries Step by Step

### 1. Create Initial Query

```javascript
const myQuery = query.create({
    type: query.Type.CUSTOMER  // Root record type.
});
```

### 2. Create Joins

```javascript
// First level join
const firstJoin = myQuery.autoJoin({
    fieldId: 'salesrep'  // Field that references another record.
});

// Second level join (from first join)
const secondJoin = firstJoin.autoJoin({
    fieldId: 'location'
});
```

### 3. Create Conditions

```javascript
// Simple condition on root query
const condition1 = myQuery.createCondition({
    fieldId: 'id',
    operator: query.Operator.EQUAL,
    values: 123
});

// Condition on joined record
const condition2 = firstJoin.createCondition({
    fieldId: 'email',
    operator: query.Operator.CONTAIN,
    values: '@company.com'
});
```

### 4. Combine Conditions

```javascript
// AND conditions
myQuery.condition = myQuery.and(condition1, condition2);

// OR conditions
myQuery.condition = myQuery.or(condition1, condition2);

// Nested conditions
myQuery.condition = myQuery.and(
    condition1,
    myQuery.or(condition2, condition3)
);
```

### 5. Create Columns

```javascript
myQuery.columns = [
    // Column from root query
    myQuery.createColumn({ fieldId: 'entityid' }),

    // Column from first join
    firstJoin.createColumn({ fieldId: 'email' }),

    // Column from second join
    secondJoin.createColumn({ fieldId: 'name' })
];
```

### 6. Create Sort

```javascript
myQuery.sort = [
    myQuery.createSort({
        column: myQuery.columns[0],
        ascending: true,
        caseSensitive: false
    })
];
```

### 7. Run Query

```javascript
// Standard run
const resultSet = myQuery.run();
const results = resultSet.results;

// Paged run for large results
const pagedResults = myQuery.runPaged({ pageSize: 1000 });
pagedResults.pageRanges.forEach(function(pageRange) {
    const page = pagedResults.fetch({ index: pageRange.index });
    page.data.forEach(function(result) {
        // Process result
    });
});
```

## Common Query Operators

| Operator | Description |
|----------|-------------|
| EQUAL | Equals |
| NOT_EQUAL | Not equals |
| GREATER | Greater than |
| GREATER_OR_EQUAL | Greater than or equal |
| LESS | Less than |
| LESS_OR_EQUAL | Less than or equal |
| CONTAIN | Contains string |
| START_WITH | Starts with string |
| START_WITH_NOT | Does not start with |
| IS_EMPTY | Is null/empty |
| IS_NOT_EMPTY | Is not null/empty |
| ANY_OF | In list of values |
| NONE_OF | Not in list of values |

## SuiteAnalytics Workbook Equivalent

The SuiteScript query above produces the same results as:

1. Create new Workbook with Customer root record.
2. Add Sales Rep (Employee) as joined record.
3. Add Location from Sales Rep as second join.
4. Add filter: Sales Rep Email does not start with "foo".
5. Add filters: Internal ID = 955 OR Internal ID = 1022.
6. Select columns from all three record types.
