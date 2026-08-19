# Appendix: N/Cache Full Code Sample
> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

This complete Suitelet example demonstrates using the N/cache module to prevent concurrent processing of the same journal entries by multiple users during an approval workflow.

## Use Case

Multiple users may be approving journal entries simultaneously. The N/cache module is used to:
- Track which journal entries are being processed
- Prevent duplicate processing
- Release entries if user times out (5 minute TTL)

## Complete Code Sample

```javascript
/**
 * Journal Entry Approval Suitelet with N/Cache
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(function(require, exports) {
    const url = require('N/url');
    const query = require('N/query');
    const cache = require('N/cache');
    const format = require('N/format');
    const record = require('N/record');
    const runtime = require('N/runtime');
    const message = require('N/ui/message');
    const widget = require('N/ui/serverWidget');

    /**
     * Main entry point
     * @param {Object} context
     */
    exports.onRequest = function(context) {
        if (context.request.method === 'GET' || context.request.method === 'POST') {
            const currentUser = runtime.getCurrentUser();
            const form = widget.createForm({
                title: 'Approve Journal Entries'
            });

            // Display current user
            form.addField({
                id: 'custpage_user',
                type: widget.FieldType.TEXT,
                label: 'Journal Approver'
            }).updateDisplayType({
                displayType: widget.FieldDisplayType.INLINE
            }).defaultValue = currentUser.name;

            // Check permissions
            const jeApprovalPerm = currentUser.getPermission({
                name: 'TRAN_JOURNALAPPRV'
            });

            if (jeApprovalPerm === 0) {
                form.addPageInitMessage({
                    type: message.Type.ERROR,
                    message: 'You do not have permissions to approve journal entries.'
                });
                return context.response.writePage(form);
            }

            let params = context.request.parameters;

            if (context.request.method === 'GET') {
                setSearchJournalsForm(form, params);
            } else {
                if (params.custpage_search) {
                    setJournalsPendingApprovalForm(form, params);
                } else {
                    setJournalSubmissionForm(context.request, form, params);
                }
            }

            context.response.writePage(form);
        }
    };

    /**
     * Display search form.
     */
    const setSearchJournalsForm = (form, params) => {
        // Purge cache if returning from previous session
        if (params.qr) {
            purgeCache('JournalApprovalCache', params.qr);
        }

        if (params.expired === 'T') {
            form.addPageInitMessage({
                type: message.Type.WARNING,
                message: 'The maximum allowed time for your previous approval submission was reached.'
            });
        } else {
            form.addPageInitMessage({
                type: message.Type.INFORMATION,
                message: 'Select a subsidiary and click the search button to view journals'
            });
        }

        form.addSubmitButton({ label: 'Search' });

        const subsidiaryFld = form.addField({
            id: 'custpage_subsidiary',
            type: widget.FieldType.SELECT,
            label: 'Subsidiary',
            source: 'subsidiary'
        });
        subsidiaryFld.defaultValue = params.qr || runtime.getCurrentUser().subsidiary;
        subsidiaryFld.isMandatory = true;

        form.addField({
            id: 'custpage_search',
            type: widget.FieldType.CHECKBOX,
            label: 'Search Journals'
        }).updateDisplayType({
            displayType: widget.FieldDisplayType.HIDDEN
        }).defaultValue = 'T';
    };

    /**
     * Display journals pending approval with cache management.
     */
    const setJournalsPendingApprovalForm = (form, params) => {
        const endDateTime = getEndDateTime();
        const subsidiaryId = params.custpage_subsidiary;

        // Get or create cache
        const appCache = cache.getCache({
            name: 'JournalApprovalCache',
            scope: cache.Scope.PROTECTED
        });

        // Get currently cached journal IDs
        const cacheValues = getCacheValues(appCache, subsidiaryId);

        // Get available journals (excluding cached ones)
        const journals = getPendingApprovalJournals(subsidiaryId, cacheValues);

        if (journals.length > 0) {
            // Add journal IDs to cache
            updateCacheValues(
                appCache,
                subsidiaryId,
                cacheValues.concat(journals.map(a => a.id))
            );

            form.addPageInitMessage({
                type: message.Type.INFORMATION,
                message: `Select journals to approve. You have until ${endDateTime} to complete.`
            });

            form.addSubmitButton({ label: 'Submit' });
            setCancelButton(form, subsidiaryId, true);
            addRecordSublist(form, 'Pending Approval', journals, 'transaction', false);
        } else {
            form.addPageInitMessage({
                type: message.Type.ERROR,
                message: 'There are no journals to approve.'
            });
            setCancelButton(form, '', false);
        }

        form.addField({
            id: 'custpage_subsidiary',
            type: widget.FieldType.SELECT,
            label: 'Subsidiary',
            source: 'subsidiary'
        }).updateDisplayType({
            displayType: widget.FieldDisplayType.HIDDEN
        }).defaultValue = params.custpage_subsidiary;
    };

    /**
     * Process journal approval submission.
     */
    const setJournalSubmissionForm = (request, form, params) => {
        let errorCount = 0;
        let notProcessed = [];
        const subsidiaryId = params.custpage_subsidiary;

        // Get selected journals.
        let journals = getSublistValues(
            request,
            'custpage_transaction',
            ['select', 'id', 'intercompany'],
            'custpage_'
        ).filter(a => {
            if (a.select === 'T') return true;
            notProcessed.push(a.id);
            return false;
        }).map(b => ({
            id: b.id,
            type: b.intercompany === 'Yes' ? 'advintercompanyjournalentry' : 'journalentry',
            values: { approvalstatus: 2 }
        }));

        // Process approvals.
        journals.forEach(journal => {
            try {
                record.submitFields(journal);
                journal.message = 'Approved';
            } catch (e) {
                journal.message = e.name + ' ' + e.message;
                notProcessed.push(journal.id);
                errorCount += 1;
            }
        });

        // Update cache.
        const appCache = cache.getCache({
            name: 'JournalApprovalCache',
            scope: cache.Scope.PROTECTED
        });
        const cacheValues = getCacheValues(appCache, subsidiaryId);

        if (notProcessed.length > 0) {
            updateCacheValues(
                appCache,
                subsidiaryId,
                cacheValues.filter(a => !notProcessed.includes(a))
            );
        }

        // Display results.
        if (errorCount > 0) {
            form.addPageInitMessage({
                type: message.Type.ERROR,
                message: 'Journal entry approval completed with errors.'
            });
            setCancelButton(form, subsidiaryId, false);
        } else {
            form.addPageInitMessage({
                type: message.Type.CONFIRMATION,
                message: 'Journal entries were successfully approved.'
            });
            setGoBackToMainButton(form, subsidiaryId);
        }

        addRecordSublist(form, 'Processed', journals.map(a => {
            delete a.type;
            delete a.values;
            return a;
        }), 'transaction', true);
    };

    // ==================== CACHE HELPER FUNCTIONS ====================

    /**
     * Get values from cache.
     */
    const getCacheValues = (appCache, cacheKey) => {
        const cacheValues = appCache.get({ key: cacheKey });
        return cacheValues ? cacheValues.split(',') : [];
    };

    /**
     * Update cache values.
     */
    const updateCacheValues = (appCache, cacheKey, cacheValues) => {
        const uniqueValues = cacheValues
            .map(d => parseFloat(d))
            .reduce((u, b) => u.includes(b) ? u : [...u, b], [])
            .join(',');

        if (uniqueValues.length > 0) {
            appCache.put({
                key: cacheKey,
                value: uniqueValues,
                ttl: 300  // 5 minutes
            });
        } else {
            purgeCache(appCache.name, cacheKey);
        }
    };

    /**
     * Remove cache entry.
     */
    const purgeCache = (cacheName, cacheKey) => {
        cache.getCache({
            name: cacheName,
            scope: cache.Scope.PROTECTED
        }).remove({
            key: cacheKey
        });
    };

    // ==================== QUERY FUNCTION ====================

    /**
     * Get pending approval journals excluding cached IDs.
     */
    /**
     * SECURITY NOTE: Cache IDs are validated as integers and passed via
     * parameterized placeholders to prevent SQL injection. Never use string
     * concatenation with user-controllable values in SuiteQL queries.
     * See: netsuite-owasp-secure-coding/references/01-injection-prevention.md.
     */
    const getPendingApprovalJournals = (subsidiaryId, cacheIds) => {
        // Validate and sanitize cache IDs as integers.
        const validIds = cacheIds
            .map(id => parseInt(id, 10))
            .filter(id => !isNaN(id) && id > 0);

        // Build parameterized IN clause.
        const params = [subsidiaryId];
        let idsFilter = '';
        if (validIds.length > 0) {
            const placeholders = validIds.map(() => '?').join(',');
            idsFilter = ` AND (Transaction.ID NOT IN(${placeholders}))`;
            params.push(...validIds);
        }

        return query.runSuiteQL({
            query: `
                SELECT DISTINCT
                    Transaction.Id AS id,
                    MAX(Transaction.TranDate) AS date,
                    MAX(BUILTIN.DF(Transaction.PostingPeriod)) AS period,
                    BUILTIN.DF(TransactionLine.Subsidiary) AS subsidiary,
                    MAX(BUILTIN.DF(Transaction.Currency)) AS currency,
                    SUM(ABS(NVL(TransactionLine.debitforeignamount,0))) as total,
                    MAX(BUILTIN.DF(Transaction.CreatedBy)) AS createdby,
                    MAX(CASE WHEN NVL(TransactionLine.Eliminate, 'T') = 'T'
                        THEN 'Yes' ELSE 'No' END) AS intercompany
                FROM Transaction
                    INNER JOIN TransactionAccountingLine ON
                        TransactionAccountingLine.Transaction = Transaction.ID
                    INNER JOIN TransactionLine ON
                        TransactionLine.Transaction = Transaction.ID
                WHERE
                    Transaction.Type = 'Journal'
                    AND TransactionLine.Subsidiary = ?
                    AND BUILTIN.DF(Transaction.ApprovalStatus) = 'Pending Approval'
                    AND NVL(TransactionAccountingLine.Debit, 0) <> 0
                    AND (TransactionAccountingLine.Debit IS NOT NULL
                         OR TransactionAccountingLine.Credit IS NOT NULL)
                    ${idsFilter}
                GROUP BY
                    Transaction.Id,
                    BUILTIN.DF(TransactionLine.Subsidiary)
                ORDER BY
                    MAX(Transaction.TranDate) DESC
            `,
            params: params
        }).asMappedResults().slice(0, 25);
    };

    // ==================== UI HELPER FUNCTIONS ====================

    const getEndDateTime = () => {
        const userTMZ = runtime.getCurrentUser().getPreference('TIMEZONE');
        const tmzEnum = Object.entries(format.Timezone)
            .filter(a => a[1] === userTMZ)[0][0];

        const endTimeStr = format.format({
            value: new Date(format.parse({
                value: new Date(),
                type: format.Type.DATETIME,
                timezone: format.Timezone[tmzEnum]
            }).getTime() + 5 * 60000),
            type: format.Type.DATETIME,
            timezone: format.Timezone[tmzEnum]
        });

        return endTimeStr.split(' ').map((a, i) => {
            if (i === 0) return '';
            const s = a.split(':');
            return s.length <= 1 ? a : s[0] + ':' + s[1];
        }).join('');
    };

    // Additional UI helper functions (setCancelButton, setGoBackToMainButton,
    // addRecordSublist, getSublistValues) would be included here.
});
```

## Key N/Cache Patterns

### Creating/Getting a Cache

```javascript
const appCache = cache.getCache({
    name: 'MyCache',
    scope: cache.Scope.PROTECTED  // Accessible across scripts in same bundle.
});
```

### Storing Values with TTL

```javascript
appCache.put({
    key: 'myKey',
    value: 'myValue',
    ttl: 300  // Time-to-live in seconds (5 minutes).
});
```

### Retrieving Values

```javascript
const value = appCache.get({
    key: 'myKey'
});
// Returns null if not found or expired.
```

### Removing Values

```javascript
appCache.remove({
    key: 'myKey'
});
```

## Cache Scopes

| Scope | Description |
|-------|-------------|
| PRIVATE | Only accessible to current script |
| PROTECTED | Accessible to scripts in same bundle |
| PUBLIC | Accessible across all bundles in account |
