# Appendix: Concurrency Governance Cheat Sheet
> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

This cheat sheet provides quick reference for NetSuite's concurrency governance limits and how to handle concurrent request scenarios.

## Governance Types

Two governance types are in place simultaneously for each integration:

### Account Limit
- Derived from service tier, number of SuiteCloud Plus (SC+) licenses, and account type
- Developer accounts have base limit = 5

### Integration Limit
- Part of account limit can be allocated to specific integrations
- Applies to total requests within that integration (Application ID)
- Optional and configurable in integration record

## Concurrency Limits by Service Tier (Post 20.1)

| Service Tier | Base Limit | 1 SC+ | 3 SC+ | 6 SC+ | 12 SC+ |
|--------------|------------|-------|-------|-------|--------|
| Standard | 5 | 5+10=15 | - | - | - |
| Premium | 15 | 15+10 | 15+30 | - | - |
| Enterprise | 20 | 20+10 | 20+30 | 20+60 | - |
| Ultimate | 20 | 20+10 | 20+30 | 20+60 | 20+120 |

**Formula**: `Account limit = sum(Integration limits) + Unallocated limit`

**Note**: Unallocated limit applies to all integrations with no limit set.

## Sample Scenarios

### Scenario: Multiple Integrations to Single Account

```
Account: Enterprise tier with 2 SC+ licenses
Account Limit = 20 + 20 = 40

Integration D: 9 RESTlet requests (no limit set)
Integration E: 18 REST WS requests (limit = 16)
Integration F: 16 SOAP WS requests (no limit set)

Total: 43 requests

Result:
- Integration E: 16 succeed, 2 fail (integration limit)
- D + F: 25 requests compete for unallocated (40-16=24)
- 3 total requests fail
```

## Error Codes

| Method | SOAP Fault | Error Message |
|--------|------------|---------------|
| Web Services + L/L or RLC* | ExceededRequestLimitFault | WS_CONCUR_SESSION_DISALLWD |
| Web Services + TBA | ExceededConcurrentRequestLimitFault | WS_REQUEST_BLOCKED |
| REST WS | HTTP error code: 429 | Too Many Requests |
| RESTlet | HTTP error code: 400 | Bad Request |
| RESTlet | SuiteScript error | SSS_REQUEST_LIMIT_EXCEEDED |

*Legacy SOAP authentication

## Recommended Actions

1. **Check integration limit** — Periodically call `getIntegrationGovernanceInfo` API
2. **Handle error codes** — Implement error handling in client application
3. **Implement retry logic** — Gradually increase delay between retry attempts
4. **Analyze peaks** — Consider rescheduling requests outside peak times
5. **Add SC+ licenses** — Increase limit with more licenses
6. **Monitor trends** — Track concurrency usage to prevent broken integrations
7. **Allocate integration limits** — Consider allocating part of account limit
8. **Use getAccountGovernanceInfo** — Get account and unallocated limits

## Retry Pattern Example

```javascript
// Basic SOAP WS error handling with retry
int i = 0;
int maxAttempts = 5; // try it 5 times, then fail for good

while (i < maxAttempts) {
    response = doWSCall();
    isSuccess = response.getIsSuccess();
    errorMsg = response.getErrorMsg();

    if (isSuccess == false &&
        (errorMsg == 'WS_CONCUR_SESSION_DISALLWD' || errorMsg == 'WS_REQUEST_BLOCKED')) {
        wait();    // Implement exponential backoff
        i++;       // try again
    } else {
        break;     // end the cycle
    }
}
```

## NetSuite Navigation Reference

| What | Where |
|------|-------|
| Account concurrency limit | Setup > Integration > Integration Management > Integration Governance |
| Total requests (number, ratio) | Same as above |
| Rejected SOAP WS requests | Reports > New Search -> Web Services Operations |
| Rejected RESTlet requests | RESTlet script record > Log |
| Concurrency violation details | Execution log on Integration record |
| SOAP request details | Setup > Integration > SOAP Web Services Usage Log |
| Concurrency Monitor dashboard | Search for Application Performance Management SuiteApp |
| Decision tree | Search Help Center for "concurrency decision tree" |

## Best Practices

### Integration Design
- Design for concurrent request limits.
- Implement exponential backoff.
- Use bulk operations where possible.
- Schedule heavy operations during off-peak hours.

### Monitoring
- Monitor concurrency trends regularly.
- Set up alerts for approaching limits.
- Review rejected request logs.

### Optimization
- Batch requests when possible.
- Use Map/Reduce for large data processing.
- Consider using webhooks instead of polling.
