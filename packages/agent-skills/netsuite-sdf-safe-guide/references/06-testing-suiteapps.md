# Principle 6: Test Your SuiteApps
> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

It is your responsibility to ensure that SuiteApps distributed into customers' accounts run as intended from one NetSuite release to the next. You must retest and update published SuiteApps during the Release Preview phase that accompanies each new NetSuite release.

## Key Concepts

### Debugging SuiteScript

#### Interactive Debugger

NetSuite provides an interactive debugger accessible via **Customization > Scripting > Script Debugger** (recommended browser: Chrome).

**Supported Script Types:**
- User Event Script
- Suitelet
- RESTlet
- Scheduled Script
- Map/Reduce Script (On-Demand Debugging: `getInputData` stage only)
- Portlet
- Workflow Action Script
- Bundle Installation Script

**NOT Supported — use browser DevTools instead:**
- **Client Scripts** — these run in the browser; use `console.log()` and F12 DevTools.

#### On-Demand Debugging

Attach the debugger to a specific script deployment. The next time that deployment executes, it automatically pauses at the first breakpoint.

**Steps:**
1. Navigate to **Customization > Scripting > Script Debugger**.
2. Select the target script deployment.
3. Trigger the script (open the Suitelet URL, run the scheduled script, etc.).
4. The debugger pauses execution at your breakpoints.

> **Note:** On-Demand Debugging is NOT available for all script types. For Map/Reduce, call stage functions directly in the debugger console.

```javascript
// Call a Map/Reduce stage directly in the debugger console (not via On-Demand):
map({ key: 0, value: '{ "id": "12345" }', write: (options) => { debugger; } });
```

#### Debugger Limitations

| Limitation | Detail |
|-----------|--------|
| One session per account | Only one debugger session can be active across the entire account at a time |
| 30-minute timeout | Sessions automatically expire after 30 minutes |
| Map/Reduce: getInputData only | On-Demand Debugging only attaches to `getInputData`; call other stages manually |
| No role emulation | The debugger cannot emulate a specific user role; the account must be logged in with the target context |
| Governance context differs | Debugger does NOT consume governance units for paused time, but the script's overall governance limits still apply |
| Context differences | Scripts running in the debugger may behave differently if downstream scripts check `runtime.executionContext` |
| Client Scripts excluded | Client Scripts run in the browser — the NetSuite debugger does not support them |

#### Debugging Client Scripts with Browser DevTools

Client Scripts execute in the **browser**, not on the NetSuite server. The interactive debugger does not apply. Use browser developer tools instead.

| Tool | Use Case |
|------|----------|
| `console.log()` | General debug output — visible in the browser console |
| `console.table()` | Inspect sublist data or array structures as a readable grid |
| `console.error()` | Log errors with stack traces |
| Browser DevTools (F12) | Set breakpoints, inspect network requests, watch variables |

```javascript
// Server-side scripts (User Event, Suitelet, Scheduled, etc.): use N/log.
log.debug({ title: 'Record ID', details: recordId });

// Client Scripts: use console instead (log.* is ignored on forms).
console.log('Field value:', currentRecord.getValue({ fieldId: 'custbody_status' }));

// Inspect sublist data as a table in DevTools.
const lines = [];
for (let i = 0; i < currentRecord.getLineCount({ sublistId: 'item' }); i++) {
    lines.push({
        item: currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }),
        qty:  currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i })
    });
}
console.table(lines); // Renders as a formatted grid in DevTools.
```

> **Tip:** NetSuite does not guarantee that browser globals like `window` are available in all Client Script contexts. Stick to `console.*` for debugging and avoid relying on browser-specific globals in production code.

---

### SuiteCloud Unit Testing

The SuiteCloud SDK includes a Jest module for testing SuiteScript 2.x applications with pre-created stubs for NetSuite modules.

**Test File Setup:**
- Name test files with `.test.js` extension.
- Place in `tests` directory at project root.
- Import SuiteScript modules and stubs for mocking.

```javascript
// Import statements.
import Suitelet from "SuiteScripts/Suitelet";
import record from "N/record";
import Record from "N/record/instance";

// Mock setup.
jest.mock("N/record");
jest.mock("N/record/instance");

// Test definition.
describe("Suitelet Test", () => {
    it("Sales Order memo field has been updated", () => {
        // given
        const context = {
            request: {
                method: 'GET',
                parameters: {
                    salesOrderId: 1352
                }
            }
        };
        record.load.mockReturnValue(Record);
        Record.save.mockReturnValue(1352);

        // when
        Suitelet.onRequest(context);

        // then
        expect(record.load).toHaveBeenCalledWith({id: 1352});
        expect(Record.setValue).toHaveBeenCalledWith({fieldId: 'memo', value: 'foobar'});
        expect(Record.save).toHaveBeenCalledWith({enableSourcing: false});
    });
});
```

### Jest Engine vs. GraalJS Runtime Differences

SuiteScript 2.1 runs on **GraalJS** (ES2022-compatible). Jest runs on **Node.js** (V8 engine). These are different JavaScript runtimes and can produce subtle behavioral differences that only surface when code runs in NetSuite.

| Area | NetSuite (GraalJS) | Jest (Node.js / V8) |
|------|-------------------|---------------------|
| Runtime engine | GraalJS (ES2022) | Node.js (V8, version-dependent) |
| Module format | AMD (`define()`) | CommonJS / ESM |
| Native Iterator support | NOT supported (fails) | Supported |
| Constructor return values | May differ from V8 | Standard JS behavior |
| `require()` behavior | Loads AMD modules | Loads CommonJS modules |
| Governance | Full governance enforcement | No governance concept |

#### AMD Module Transpiling

SuiteScript modules use AMD `define()` syntax. Jest expects CommonJS or ESM. The **SuiteCloud Unit Testing Framework (SCUTF)** includes a Jest transform that handles AMD → CommonJS transpilation automatically.

```javascript
// SuiteScript AMD module (NetSuite runtime)
define(['N/record', 'N/log'], function(record, log) {
    function createSalesOrder(data) { /* ... */ }
    return { createSalesOrder };
});

// Unit test file (ES6 module syntax — SCUTF transpiles the AMD module).
import SalesOrderController from 'SuiteScripts/SalesOrderController';
import record from 'N/record';
jest.mock('N/record');
```

#### Key Pitfalls When Testing Across Runtimes

**Native Iterators** — Code using native JavaScript iterators may pass Jest but fail in NetSuite GraalJS:

```javascript
// BAD: Native Iterator. Works in Node.js/Jest, FAILS in NetSuite GraalJS.
function* getIds(results) {
    for (const r of results) yield r.id;
}

// GOOD: Standard array method. Works in both runtimes.
function getIds(results) {
    return results.map(r => r.id);
}
```

**Global `log` and `util`** — If your code uses `log` or `util` as globals (rather than importing `N/log`/`N/util`), declare them for Jest:

```javascript
// In your Jest test setup file:
global.log = {
    debug: jest.fn(),
    audit: jest.fn(),
    error: jest.fn(),
    emergency: jest.fn()
};
global.util = { isString: jest.fn().mockReturnValue(true) };
```

**AMD Function Return Values** — AMD allows returning a constructor or plain function directly. For Jest ES6 import compatibility, add a `default` property:

```javascript
// AMD function module: add default property for Jest ES6 import compatibility.
function myHandler(context) { /* ... */ }
myHandler.default = myHandler; // Required for: import myHandler from '...'
return myHandler;
```

**`require()` differences** — NetSuite's `require()` loads AMD modules; Node.js `require()` loads CommonJS. If you call `require()` directly in scripts, you may need to install a custom version of requirejs or mock it in your Jest environment.

**Governance in tests** — Jest has no concept of governance units. You can mock `runtime.getCurrentScript().getRemainingUsage()` to return controlled values, but Jest cannot validate whether code will hit `SSS_USAGE_LIMIT_EXCEEDED` in production. Always complement unit tests with sandbox integration testing.

#### Workaround: SuiteCloud Unit Testing Framework (SCUTF)

The recommended approach for NetSuite-compatible unit testing:

```bash
# Install via npm
npm install @oracle/suitecloud-unit-testing --save-dev
```

Configure `jest.config.js`:

```javascript
module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': '@oracle/suitecloud-unit-testing/jest-configuration/jest-transform'
    },
    moduleNameMapper: {
        '^N/(.*)$': '<rootDir>/node_modules/@oracle/suitecloud-unit-testing/stub/modules/N/$1'
    }
};
```

SCUTF provides:
- AMD → CommonJS transpilation via the Jest transform
- Pre-built stubs for all `N/*` modules
- Support for custom mocks and `@NConfig` module mapping
- `N/runtime` mock for testing environment-specific behavior

---

### NetSuite Release Cycle

- **Two major releases per year**: 20xx.1 (January) and 20xx.2 (July)
- **Phased rollout**: Partners upgraded first (Phase 0), customers follow in waves
- **Release Preview**: Isolated infrastructure with new code and customer data for testing

### Phased Release Challenges

1. **Early access needed** — Must test existing code against new NetSuite version.
2. **Prototype new APIs** — May need access to new features before GA.
3. **Version support** — Must simultaneously support customers on leading AND trailing versions.
4. **Stability requirements** — SuiteApps need stable deployment platform.

## SDN Testing Infrastructure

### Environment Types

| Attribute | Release Preview | Leading Environment | Trailing Environment |
|-----------|----------------|---------------------|---------------------|
| Upgrade Date | N/A | Phase 0 | Phase 3 (last) |
| Primary Use | Testing on customer data | Testing, prototyping new APIs | SuiteApp deployment, general QA |
| Available on Release Preview | N/A | No | Phase 0 |
| Limitations | Data not refreshed; purged after release | None | None |
| Can request more? | No | Yes | Yes |

### SDN Leading Environment
- Upgraded in Phase 0 (before any live customers)
- Ideal for testing SuiteApps against leading version
- Request via NetSuite Customer Support
- **Do NOT use for production deployment** (potential instability)
- **Do NOT release SuiteApps relying on new features during phased releases**

### SDN Trailing Environment
- Upgraded in last phase
- More stable during phased release
- Ideal for SuiteApp deployment platform
- Build production deployment chains here

### Release Preview Access
- Access via https://system.beta.netsuite.com
- Snapshot of trailing environment accounts taken at phased release start
- Data remains "stale" for duration of release
- Customers get 2-week access before their upgrade date

## Best Practices

### Testing Methodology During Phased Releases

1. **Attend SDN new release webinars** prior to Phase 0
2. **Request SDN leading environment accounts** via support cases
3. **Use Customer Lookup tool** (APC portal) for customer upgrade dates
4. **Test during Phase 0** on leading accounts (2-3 week window before customers)
5. **Report platform bugs** to NetSuite Customer Support
6. **Test on Release Preview** against trailing environment data
7. **Test new features/APIs** for future use

### QA Checkpoints

| Checkpoint | Description | Rationale |
|------------|-------------|-----------|
| Role-based testing | Test using intended role(s) | Matches how customers use the app |
| Peak hours testing | Stress test during NetSuite peak hours | Representative of server resources |
| Stress testing | Test with I/O, bandwidth, data exceeding capability | Determine limits and worst-case behavior |
| Multiple QA accounts | Different editions and configurations | Ensure compatibility across NetSuite variants |
| Deployment testing | Test install/update in QA before customers | Installation scripts handle data conversion |

### SuiteSuccess Compatibility

- **Test in SuiteSuccess environments** — Required for BFN badging.
- **Request SuiteSuccess accounts** via support cases.
- **Do NOT integrate directly with SuiteSuccess objects** unless requested by NetSuite.

**Prohibited actions with SuiteSuccess:**
- Write to custom fields in SuiteSuccess test accounts
- Create rows of custom records defined in SuiteSuccess
- Create customization objects referencing SuiteSuccess objects
- Include SuiteSuccess objects in your SuiteBundle

### Sandbox Accounts

- Replica of production configuration, customization, and data
- Ideal for customer acceptance testing
- **NOT for SDN partner development** (contains real customer data)
- Sandbox account IDs include `_SBx` suffix (for example, `123456_SB1`)
- Access via system.netsuite.com

```javascript
// Integration SuiteApps support sandbox by specifying sandbox account ID.
// Use 123456_SB1 instead of 123456 for sandbox.
```

## Code Examples

### Complete Jest Test Structure

```javascript
/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import CustomerController from "SuiteScripts/CustomerController";
import record from "N/record";
import search from "N/search";

jest.mock("N/record");
jest.mock("N/search");

describe("CustomerController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createCustomer", () => {
        it("should create customer with valid data", () => {
            // given
            const mockRecord = {
                setValue: jest.fn(),
                save: jest.fn().mockReturnValue(12345)
            };
            record.create.mockReturnValue(mockRecord);

            // when
            const result = CustomerController.createCustomer({
                companyName: "Test Corp",
                email: "test@example.com"
            });

            // then
            expect(record.create).toHaveBeenCalledWith({
                type: record.Type.CUSTOMER,
                isDynamic: true
            });
            expect(mockRecord.setValue).toHaveBeenCalledWith({
                fieldId: 'companyname',
                value: 'Test Corp'
            });
            expect(result).toBe(12345);
        });

        it("should handle errors gracefully", () => {
            // given
            record.create.mockImplementation(() => {
                throw new Error("Permission denied");
            });

            // when/then
            expect(() => {
                CustomerController.createCustomer({});
            }).toThrow("Permission denied");
        });
    });
});
```

### Testing Map/Reduce Scripts

```javascript
import MapReduceScript from "SuiteScripts/ProcessOrders";
import search from "N/search";
import record from "N/record";

jest.mock("N/search");
jest.mock("N/record");

describe("ProcessOrders Map/Reduce", () => {
    describe("getInputData", () => {
        it("should return search for pending orders", () => {
            const mockSearch = { id: 'customsearch_pending' };
            search.create.mockReturnValue(mockSearch);

            const result = MapReduceScript.getInputData();

            expect(search.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: search.Type.SALES_ORDER,
                    filters: expect.any(Array)
                })
            );
        });
    });

    describe("map", () => {
        it("should process each order correctly", () => {
            const context = {
                key: '12345',
                value: JSON.stringify({ id: '12345', status: 'pending' }),
                write: jest.fn()
            };

            MapReduceScript.map(context);

            expect(context.write).toHaveBeenCalled();
        });
    });
});
```

## Common Pitfalls

1. **Testing only on one account type** — Test on standard AND OneWorld accounts.
2. **Ignoring phased release timing** — Test during Phase 0 before customer exposure.
3. **Using production data for development** — Use SDN accounts, not customer sandboxes.
4. **Skipping stress testing** — Peak hours reveal real-world performance.
5. **Not testing installation scripts** — Bundle install/update scripts need thorough testing.
6. **Releasing during phased release** — Avoid releasing SuiteApps with new API dependencies mid-release.
7. **Integrating with SuiteSuccess objects** — Causes bundle conflicts and data issues.
8. **Using interactive debugger for Client Scripts** — Client Scripts run in the browser; the NetSuite debugger does not support them. Use browser DevTools (F12) and `console.log()` instead. See pitfall #107.
9. **Assuming Jest test pass = NetSuite pass** — GraalJS (ES2022) and Node.js (V8) have runtime differences. Native iterators, constructor behavior, and AMD/CommonJS `require()` semantics differ. Always follow unit tests with sandbox integration testing. See pitfall #108.

## Testing Checklist

- [ ] Unit tests written for all SuiteScript modules
- [ ] Tests run in Jest with SuiteCloud SDK stubs (SCUTF recommended)
- [ ] Client Script debugging done via browser DevTools (F12), not the interactive debugger
- [ ] Server-side scripts verified in interactive debugger or via execution logs
- [ ] Jest tests reviewed for GraalJS compatibility (no native iterators, AMD return values)
- [ ] Tested on SDN leading environment during Phase 0
- [ ] Tested on SDN trailing environment for deployment stability
- [ ] Tested on Release Preview with real data snapshots
- [ ] Role-based testing completed with intended roles
- [ ] Stress testing performed during peak hours
- [ ] Multiple QA accounts tested (Standard, OneWorld, SuiteSuccess)
- [ ] Installation/update scripts tested before customer deployment
- [ ] Platform bugs reported to NetSuite Support

## Further Reading

- [SuiteCloud SDK Documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/)
- [Jest Testing Framework](https://jestjs.io)
- Understanding Managed Bundles in NetSuite Help Center
- SuiteApp Versions in NetSuite Help Center
