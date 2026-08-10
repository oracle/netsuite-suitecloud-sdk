# Unmapped APIs: SuiteScript 1.0 Functions Without Direct SS2.1 Equivalents
> Author: Oracle NetSuite

> These SS1.0 APIs have no direct 1:1 mapping in SuiteScript 2.1.
> Each entry includes the original function, its purpose, and the recommended workaround.

---

## Functions

### nlapiAddDays(d, days)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Add or subtract days from a Date object. |
| **Why removed** | Standard JavaScript Date API provides this natively. |
| **Severity** | `alternative-available` |
| **Workaround** | Use native JavaScript Date methods. |

```javascript
// SS1.0
var futureDate = nlapiAddDays(new Date(), 30);

// SS2.1 — native JavaScript
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 30);
```

---

### nlapiAddMonths(d, months)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Add or subtract months from a Date object. |
| **Why removed** | Standard JavaScript Date API provides this natively. |
| **Severity** | `alternative-available` |
| **Workaround** | Use native JavaScript Date methods. |

```javascript
// SS1.0
var futureDate = nlapiAddMonths(new Date(), 3);

// SS2.1 — native JavaScript
const futureDate = new Date();
futureDate.setMonth(futureDate.getMonth() + 3);
```

**Note:** Native `setMonth()` handles year rollover automatically (for example, October + 3 months = January next year). Be aware of month-end edge cases (for example, Jan 31 + 1 month may become March 2 or 3 depending on leap year).

---

### nlapiEncrypt(s, algorithm, key)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Encrypt or hash data using a specified algorithm. |
| **Why removed** | Replaced by dedicated, more capable modules. |
| **Severity** | `alternative-available` |
| **Workaround** | Use `N/crypto` module for hashing/HMAC, `N/encode` module for encoding. |

```javascript
// SS1.0
var hashed = nlapiEncrypt('password', 'sha256');

// SS2.1 — N/crypto module
define(['N/crypto', 'N/encode'], (crypto, encode) => {
    const inputObj = crypto.createHash({ algorithm: crypto.HashAlg.SHA256 });
    inputObj.update({ input: 'password' });
    const hashedObj = inputObj.digest({ outputEncoding: encode.Encoding.HEX });
});
```

---

### nlapiGetCurrentLineItemDateTimeValue(type, fieldId, timeZone)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Get datetime value from current sublist line with timezone. |
| **Why removed** | DateTime timezone handling consolidated into N/format module. |
| **Severity** | `alternative-available` |
| **Workaround** | Use `N/format` module with `format.Timezone` enum. |

```javascript
// SS1.0
var dtValue = nlapiGetCurrentLineItemDateTimeValue('item', 'custcol_datetime', 'America/Los_Angeles');

// SS2.1
define(['N/format'], (format) => {
    const rawValue = rec.getCurrentSublistValue({
        sublistId: 'item',
        fieldId: 'custcol_datetime'
    });
    const formatted = format.format({
        value: rawValue,
        type: format.Type.DATETIMETZ,
        timezone: format.Timezone.AMERICA_LOS_ANGELES
    });
});
```

---

### nlapiGetDateTimeValue(fieldId, timeZone)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Get datetime value from body field with timezone. |
| **Why removed** | DateTime timezone handling consolidated into N/format module. |
| **Severity** | `alternative-available` |
| **Workaround** | Use `N/format` module with `format.Timezone` enum. |

```javascript
// SS1.0
var dtValue = nlapiGetDateTimeValue('trandate', 'America/New_York');

// SS2.1
const rawValue = rec.getValue({ fieldId: 'trandate' });
const formatted = format.format({
    value: rawValue,
    type: format.Type.DATETIMETZ,
    timezone: format.Timezone.AMERICA_NEW_YORK
});
```

---

### nlapiGetLineItemDateTimeValue(type, fieldId, lineNum, timeZone)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Get datetime value from specific sublist line with timezone. |
| **Why removed** | DateTime timezone handling consolidated into N/format module. |
| **Severity** | `alternative-available` |
| **Workaround** | Use the `N/format` module; remember the line index is 0-based. |

---

### nlapiSetCurrentLineItemDateTimeValue(type, fieldId, dateTime, timeZone)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Set datetime value on current sublist line with timezone |
| **Why removed** | DateTime timezone handling consolidated into N/format module |
| **Severity** | `alternative-available` |
| **Workaround** | Format with `N/format`, then set using `setCurrentSublistValue()` |

---

### nlapiSetDateTimeValue(fieldId, dateTime, timeZone)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Set datetime value on body field with timezone. |
| **Why removed** | DateTime timezone handling consolidated into N/format module. |
| **Severity** | `alternative-available` |
| **Workaround** | Format with `N/format`, then set using `setValue()`. |

---

### nlapiSetLineItemDateTimeValue(type, fieldId, lineNum, dateTime, timeZone)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Set datetime value on specific sublist line with timezone. |
| **Why removed** | DateTime timezone handling consolidated into N/format module. |
| **Severity** | `alternative-available` |
| **Workaround** | Format with `N/format`, then set using `setSublistValue()`. |

---

### nlapiSetRecoveryPoint()

| Attribute | Value |
|-----------|-------|
| **Purpose** | Set a recovery point in scheduled scripts to resume after yield. |
| **Why removed** | Map/Reduce scripts handle recovery automatically; no longer needed. |
| **Severity** | `removed` |
| **Workaround** | Use Map/Reduce script type for large data processing; it handles yielding and recovery automatically. For Scheduled Scripts, check `script.getRemainingUsage()` and use `task.create()` to reschedule if needed. |

```javascript
// SS1.0
if (nlapiGetContext().getRemainingUsage() < 100) {
    nlapiSetRecoveryPoint();  // 100 governance units
    nlapiYieldScript();       // 100 governance units
}

// SS2.1 — Map/Reduce handles this automatically
// OR for Scheduled Scripts:
const script = runtime.getCurrentScript();
if (script.getRemainingUsage() < 200) {
    // Reschedule instead of yielding
    const scheduledTask = task.create({
        taskType: task.TaskType.SCHEDULED_SCRIPT,
        scriptId: runtime.getCurrentScript().id,
        deploymentId: runtime.getCurrentScript().deploymentId,
        params: { custscript_last_processed: lastId }
    });
    scheduledTask.submit();
    return; // exit gracefully
}
```

---

### nlapiYieldScript()

| Attribute | Value |
|-----------|-------|
| **Purpose** | Yield script execution to prevent governance timeout in scheduled scripts. |
| **Why removed** | Map/Reduce scripts incorporate yielding automatically. |
| **Severity** | `removed` |
| **Workaround** | Use Map/Reduce script type. See `nlapiSetRecoveryPoint()` above for full example. |

---

### nlapiRefreshLineItems(type)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Refresh the display of sublist line items in the UI. |
| **Why removed** | No equivalent functionality in SS2.1 |
| **Severity** | `removed` |
| **Workaround** | None available. UI refresh is handled automatically by the platform in SS2.1 client scripts. |

---

### nlapiSendFax(author, recipient, subject, body, records, attachments)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Send a fax message through NetSuite. |
| **Why removed** | Fax functionality deprecated; not carried forward to SS2.1 |
| **Severity** | `removed` |
| **Workaround** | Use a third-party fax service via `N/https` module, or use `N/email.send()` as an alternative communication channel. |

---

### nlapiOutboundSSO(id)

> **Note:** This function also appears in `api-mapping.json` with a mapping to `N/sso`. It is listed here because the entire SuiteSignOn feature is deprecated; the 2.1 equivalent exists but should not be used for new development.

| Attribute | Value |
|-----------|-------|
| **Purpose** | Generate an outbound Single Sign-On URL. |
| **Why removed** | Deprecated as of NetSuite 2025.1 |
| **Severity** | `deprecated` |
| **Workaround** | Use `N/sso` module: `sso.generateSuiteSignOnToken(options)`. Note that SuiteSignOn itself is being deprecated; migrate to OAuth 2.0 or TBA (Token-Based Authentication). |

```javascript
// SS1.0
var ssoUrl = nlapiOutboundSSO('customsso_integration');

// SS2.1
define(['N/sso'], (sso) => {
    const token = sso.generateSuiteSignOnToken({
        suiteSignOnId: 'customsso_integration'
    });
});
```

---

## Object Methods

### nlobjCredentialBuilder.replace(string1, string2)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Replace credential strings within a credential builder. |
| **Why removed** | No direct equivalent in SS2.1 `N/https.SecureString` |
| **Severity** | `alternative-available` |
| **Workaround** | Use `SecureString.replaceString(options)` or manually perform string replacement in your script before building the secure string. |

---

### nlobjPortlet.setRefreshInterval(n)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Set automatic refresh interval for a dashboard portlet. |
| **Why removed** | Portlet refresh behavior changed in SS2.1; no equivalent is needed. |
| **Severity** | `removed` |
| **Workaround** | None. The SS2.1 Portlet object does not support automatic refresh intervals. |

---

### nlobjRecord.getCurrentLineItemDateTimeValue / getDateTimeValue / getLineItemDateTimeValue

| Attribute | Value |
|-----------|-------|
| **Purpose** | Get datetime values with timezone awareness from record fields. |
| **Why removed** | Consolidated into N/format module |
| **Severity** | `alternative-available` |
| **Workaround** | Get the raw value with `getValue()`/`getSublistValue()`, then format with `N/format` module using `format.Timezone`. |

---

### nlobjRecord.setCurrentLineItemDateTimeValue / setDateTimeValue / setLineItemDateTimeValue

| Attribute | Value |
|-----------|-------|
| **Purpose** | Set datetime values with timezone awareness on record fields. |
| **Why removed** | Consolidated into N/format module |
| **Severity** | `alternative-available` |
| **Workaround** | Format the value with `N/format` module, then set with `setValue()`/`setSublistValue()`. |

---

### nlobjResponse.setContentType(type, name, disposition)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Set the HTTP response content type, filename, and disposition. |
| **Why removed** | Handled through HTTP headers in SS2.1 |
| **Severity** | `alternative-available` |
| **Workaround** | Use `ServerResponse.setHeader()` to set Content-Type and Content-Disposition headers. |

```javascript
// SS1.0
response.setContentType('PDF', 'report.pdf', 'inline');

// SS2.1
context.response.setHeader({
    name: 'Content-Type',
    value: 'application/pdf'
});
context.response.setHeader({
    name: 'Content-Disposition',
    value: 'inline; filename="report.pdf"'
});
```

---

### nlobjResponse.setEncoding(encodingType)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Set the response character encoding. |
| **Why removed** | UTF-8 is the default encoding in SS2.1 |
| **Severity** | `alternative-available` |
| **Workaround** | UTF-8 is used by default. For other encodings, set the `Content-Type` header with a charset parameter. |

---

### nlobjSublist.setLineItemValues(values)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Set multiple sublist line values at once. |
| **Why removed** | No bulk-set equivalent in SS2.1 |
| **Severity** | `alternative-available` |
| **Workaround** | Use `Sublist.setSublistValue(options)` to set each value individually in a loop. |

```javascript
// SS1.0
sublist.setLineItemValues([
    { name: 'item', value: '123' },
    { name: 'quantity', value: '5' }
]);

// SS2.1 — set each value individually
sublist.setSublistValue({ id: 'item', line: 0, value: '123' });
sublist.setSublistValue({ id: 'quantity', line: 0, value: '5' });
```

---

### nlobjSubrecord.cancel()

| Attribute | Value |
|-----------|-------|
| **Purpose** | Cancel changes to a subrecord. |
| **Why removed** | Subrecord scripting is fundamentally different in SS2.1; subrecords are managed through the parent record. |
| **Severity** | `removed` |
| **Workaround** | Subrecords in SS2.1 are accessed via `getSubrecord()` and saved automatically with the parent. To "cancel" changes, reload the parent record without saving. |

---

### nlobjSubrecord.commit()

| Attribute | Value |
|-----------|-------|
| **Purpose** | Commit changes to a subrecord. |
| **Why removed** | Subrecords save automatically with the parent record in SS2.1. |
| **Severity** | `removed` |
| **Workaround** | No action needed; call `parentRecord.save()` and subrecords save automatically. |

---

### nlobjError.getUserEvent()

| Attribute | Value |
|-----------|-------|
| **Purpose** | Get the user event type that triggered the error. |
| **Why removed** | No equivalent property on `error.SuiteScriptError` |
| **Severity** | `removed` |
| **Workaround** | Track the user event type yourself by storing `context.type` before the try/catch block. |

---

## Summary Table

| SS1.0 API | Severity | SS2.1 Workaround |
|-----------|----------|-------------------|
| `nlapiAddDays()` | alternative-available | Native `Date.setDate()` |
| `nlapiAddMonths()` | alternative-available | Native `Date.setMonth()` |
| `nlapiEncrypt()` | alternative-available | `N/crypto` + `N/encode` modules |
| `nlapiGetCurrentLineItemDateTimeValue()` | alternative-available | `N/format` module |
| `nlapiGetDateTimeValue()` | alternative-available | `N/format` module |
| `nlapiGetLineItemDateTimeValue()` | alternative-available | `N/format` module |
| `nlapiSetCurrentLineItemDateTimeValue()` | alternative-available | `N/format` module |
| `nlapiSetDateTimeValue()` | alternative-available | `N/format` module |
| `nlapiSetLineItemDateTimeValue()` | alternative-available | `N/format` module |
| `nlapiSetRecoveryPoint()` | removed | Map/Reduce or reschedule pattern |
| `nlapiYieldScript()` | removed | Map/Reduce automatic yielding |
| `nlapiRefreshLineItems()` | removed | None (platform handles automatically) |
| `nlapiSendFax()` | removed | Third-party via `N/https` |
| `nlapiOutboundSSO()` | deprecated | `N/sso` module (also being deprecated) |
| `nlobjCredentialBuilder.replace()` | alternative-available | `SecureString.replaceString()` |
| `nlobjPortlet.setRefreshInterval()` | removed | None |
| `nlobjRecord.*DateTimeValue()` (6 methods) | alternative-available | `N/format` module |
| `nlobjResponse.setContentType()` | alternative-available | `ServerResponse.setHeader()` |
| `nlobjResponse.setEncoding()` | alternative-available | UTF-8 default / Content-Type header |
| `nlobjSublist.setLineItemValues()` | alternative-available | `Sublist.setSublistValue()` in loop |
| `nlobjSubrecord.cancel()` | removed | Reload parent without saving |
| `nlobjSubrecord.commit()` | removed | Saves automatically with parent |
| `nlobjError.getUserEvent()` | removed | Track `context.type` manually |
