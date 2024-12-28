# Available SuiteScript 2.x Stubs

This directory contains all the available stubs for SuiteScript 2.x modules. Each stub provides mock implementations that can be used in your unit tests.

## Currently Supported Modules

<details>
<summary><strong>Action</strong></summary>

- `N/action` - Core action module
  - `find()` - Search for available record actions
  - `get()` - Get executable record action
  - `execute()` - Execute record action
  - `executeBulk()` - Execute bulk record action
- `N/action/instance` - Action instance operations
  - Properties: description, id, label, parameters, recordType
  - Methods: execute(), executeBulk()
</details>

<details>
<summary><strong>Authentication</strong></summary>

- `N/auth` - Authentication operations
  - `changeEmail()` - Change user email
  - `changePassword()` - Change user password
</details>

<details>
<summary><strong>Cache</strong></summary>

- `N/cache` - Caching operations
  - `getCache()` - Get named, scoped cache
  - Scope types: PRIVATE, PROTECTED, PUBLIC
- `N/cache/instance` - Cache instance management
  - Methods: get(), put(), remove()
  - Properties: name, scope
</details>

<details>
<summary><strong>Certificate Control</strong></summary>

- `N/certificateControl` - Certificate management
  - Operations: createCertificate(), deleteCertificate(), loadCertificate()
  - Types: PFX, P12, PEM
- `N/certificateControl/certificate` - Certificate operations
  - Properties: file, subsidiaries, restrictions, notifications
  - Methods: save(), toJSON()
</details>

<details>
<summary><strong>Commerce</strong></summary>

- `N/commerce/recordView` - Commerce record viewing
  - `viewItems()` - Get item field values
  - `viewWebsite()` - Get website field values
- `N/commerce/promising` - Date promising functionality
  - `getAvailableDate()` - Calculate promise dates
- `N/commerce/webstore/order` - Webstore order management
  - `createOrLoad()` - Access Sales Order record
  - `save()` - Update sales order
- `N/commerce/webstore/shopper` - Shopper management
  - Methods: getCurrentShopper(), createCustomer(), createGuest()
- `N/commerce/webstore/shopper/instance` - Individual shopper operations
  - Properties: currencyId, languageLocale, subsidiaryId, details
</details>

<details>
<summary><strong>Compression</strong></summary>

- `N/compress` - Compression utilities
  - `gzip()` - Compress with gzip
  - `gunzip()` - Decompress gzip
  - `createArchiver()` - Create archive
- `N/compress/archiver` - Archive creation and management
  - Methods: add(), archive()
  - Supported formats: CPIO, TAR, TGZ, TBZ2, ZIP
</details>

<details>
<summary><strong>Configuration</strong></summary>

- `N/config` - System configuration access
  - `load()` - Load configuration object
  - Types: USER_PREFERENCES, COMPANY_INFORMATION, FEATURES, etc.
</details>

<details>
<summary><strong>Cryptography</strong></summary>

- `N/crypto` - Core cryptography operations
  - Methods: createSecretKey(), createHash(), createHmac()
  - Algorithms: SHA1, SHA256, SHA512, MD5
- `N/crypto/certificate/*`
  - `signedXml` - XML signing operations
  - `signer` - Digital signing capabilities
  - `verifier` - Signature verification
- `N/crypto/cipher` - Encryption operations
  - Methods: update(), final()
- `N/crypto/cipherPayload` - Encrypted data handling
  - Properties: iv, ciphertext
- `N/crypto/decipher` - Decryption operations
  - Methods: update(), final()
- `N/crypto/hash` - Hashing functionality
  - Methods: update(), digest()
- `N/crypto/hmac` - HMAC operations
  - Methods: update(), digest()
- `N/crypto/secretKey` - Secret key management
</details>

<details>
<summary><strong>Currency</strong></summary>

- `N/currency` - Currency operations
  - Methods: exchangeRate(), getExchangeRate()
  - Support for currency conversion and exchange rates
</details>

<details>
<summary><strong>Current Record</strong></summary>

- `N/currentRecord` - Current record operations
  - Methods: get(), create(), load()
- `N/currentRecord/instance` - Current record instance
  - Properties: id, isDynamic, type
  - Methods: getValue(), setValue(), save()
- `N/currentRecord/field` - Field operations
  - Methods: getValue(), setText(), getField()
- `N/currentRecord/sublist` - Sublist management
  - Methods: getLineCount(), getSublistValue(), setSublistValue()
</details>

<details>
<summary><strong>Dataset</strong></summary>

- `N/dataset` - Dataset operations
  - Methods: load(), save(), getData()
- `N/dataset/instance` - Dataset instance management
- `N/dataset/condition` - Dataset conditions
- `N/dataset/column` - Dataset columns
- `N/dataset/join` - Dataset joins
</details>

<details>
<summary><strong>Dataset Link</strong></summary>

- `N/datasetLink` - Dataset linking operations
  - Methods: create(), link(), unlink()
- `N/datasetLink/instance` - Dataset link instance
</details>

<details>
<summary><strong>Email</strong></summary>

- `N/email` - Email operations
  - Methods: send(), sendBulk(), sendCampaign()
  - Support for attachments and templates
</details>

<details>
<summary><strong>Encode</strong></summary>

- `N/encode` - Encoding utilities
  - Methods: convert(), escape(), unescape()
  - Support for various encoding formats
</details>

<details>
<summary><strong>Error</strong></summary>

- `N/error` - Error handling
  - Methods: create(), throwSuiteScriptError()
- `N/error/suiteScriptError` - SuiteScript specific errors
- `N/error/userEventError` - User event specific errors
</details>

<details>
<summary><strong>File</strong></summary>

- `N/file` - File operations
  - Methods: create(), load(), delete(), copy()
- `N/file/instance` - File instance
  - Properties: id, name, size, url
  - Methods: getContents(), setContents(), save()
- `N/file/fileLines` - File line operations
- `N/file/fileSegments` - File segment operations
- `N/file/reader` - File reading utilities
</details>

<details>
<summary><strong>Format</strong></summary>

- `N/format` - Formatting utilities
  - Methods: format(), parse(), Type definitions
- `N/format/i18n` - Internationalization
  - Currency formatting
  - Number formatting
  - Phone number handling
</details>

<details>
<summary><strong>HTTP/HTTPS</strong></summary>

- `N/http` - HTTP operations
  - Methods: get(), post(), put(), delete()
- `N/http/clientResponse` - HTTP response handling
- `N/https` - HTTPS operations
  - Methods: get(), post(), put(), delete()
- `N/https/clientResponse` - HTTPS response handling
- `N/https/secretKey` - HTTPS security
</details>

<details>
<summary><strong>Record</strong></summary>

- `N/record` - Core record operations
  - Methods: create(), load(), copy(), transform()
  - Type definitions and constants
- `N/record/instance` - Record instance management
  - Methods: getValue(), setValue(), save()
  - Sublist operations
- `N/record/field` - Field operations
  - Methods: getValue(), setText(), getField()
- `N/record/column` - Column management
- `N/record/line` - Line item operations
- `N/record/sublist` - Sublist management
</details>

<details>
<summary><strong>Search</strong></summary>

- `N/search` - Search operations
  - Methods: create(), load(), global()
  - Search types and filters
- `N/search/instance` - Search instance
  - Methods: run(), save(), getFilters()
- `N/search/column` - Search column configuration
- `N/search/filter` - Search filtering
- `N/search/result` - Search result handling
- `N/search/resultSet` - Result set operations
- `N/search/setting` - Search settings
</details>

<details>
<summary><strong>SFTP</strong></summary>

- `N/sftp` - SFTP operations
  - Methods: createConnection(), connect()
- `N/sftp/connection` - SFTP connection management
  - Methods: upload(), download(), list()
</details>

<details>
<summary><strong>SSO</strong></summary>

- `N/sso` - Single Sign-On operations
  - Methods: generateToken(), validateToken()
</details>

<details>
<summary><strong>SuiteApp Info</strong></summary>

- `N/suiteAppInfo` - SuiteApp information operations
  - Methods: getSuiteAppInfo(), getModuleInfo()
</details>

<details>
<summary><strong>Task</strong></summary>

- `N/task` - Task management
  - Methods: create(), checkStatus(), submit()
- Task types:
  - CSV Import
  - Map/Reduce
  - Scheduled Script
  - Search
  - SuiteQL
  - Workflow
</details>

<details>
<summary><strong>Transaction</strong></summary>

- `N/transaction` - Transaction operations
  - Methods: void(), commit(), rollback()
</details>

<details>
<summary><strong>Translation</strong></summary>

- `N/translation` - Translation operations
  - Methods: get(), load()
- `N/translation/handle` - Translation handling
</details>

<details>
<summary><strong>UI</strong></summary>

- `N/ui` - UI operations
- `N/ui/dialog` - Dialog management
  - Methods: create(), show()
- `N/ui/message` - Message handling
  - Methods: create(), show()
- `N/ui/serverWidget` - Server widget creation
  - Components: form, field, sublist, tab
</details>

<details>
<summary><strong>URL</strong></summary>

- `N/url` - URL operations
  - Methods: format(), resolve()
  - URL formatting and resolution
</details>

<details>
<summary><strong>Util</strong></summary>

- `N/util` - Utility operations
  - Methods: isArray(), isBoolean(), isDate()
  - Various utility functions
</details>

<details>
<summary><strong>Workflow</strong></summary>

- `N/workflow` - Workflow operations
  - Methods: initiate(), trigger()
  - Workflow state management
</details>

<details>
<summary><strong>Workbook</strong></summary>

- `N/workbook` - Workbook operations
  - Methods: create(), load(), save()
- `N/workbook/section` - Section management
  - Methods: addSection(), removeSection()
- `N/workbook/style` - Style configuration
  - Properties: font, alignment, borders
- `N/workbook/pivot` - Pivot table operations
  - Methods: createPivotTable(), refresh()
- `N/workbook/table` - Table management
  - Methods: addRow(), addColumn()
- `N/workbook/chart` - Chart creation and management
- `N/workbook/range` - Range operations
- `N/workbook/field` - Field management
</details>

<details>
<summary><strong>XML</strong></summary>

- `N/xml` - XML operations
  - Methods: Parser, XPath
- `N/xml/document` - XML document handling
- `N/xml/element` - XML element operations
- `N/xml/node` - XML node management
</details>

## Using Stubs in Tests

<details>
<summary><strong>Record Operations Example</strong></summary>

```javascript
import record from 'N/record';
import Record from 'N/record/instance';

jest.mock('N/record');
jest.mock('N/record/instance');

describe('Record Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should mock record loading', () => {
        const mockRecord = {
            getValue: jest.fn().mockReturnValue('test'),
            setValue: jest.fn()
        };
        record.load.mockReturnValue(mockRecord);
        
        // Your test code here
    });
});
```
</details>

<details>
<summary><strong>Search Operations Example</strong></summary>

```javascript
import search from 'N/search';
import SearchInstance from 'N/search/instance';

jest.mock('N/search');
jest.mock('N/search/instance');

describe('Search Operations', () => {
    it('should mock search results', () => {
        const mockResults = [
            { id: '1', getValue: jest.fn() },
            { id: '2', getValue: jest.fn() }
        ];
        search.create.mockReturnValue({
            run: () => ({
                each: jest.fn((callback) => {
                    mockResults.forEach(callback);
                    return true;
                })
            })
        });
    });
});
```
</details>

<details>
<summary><strong>Crypto Operations Example</strong></summary>

```javascript
import crypto from 'N/crypto';

jest.mock('N/crypto');

describe('Crypto Operations', () => {
    it('should mock encryption', () => {
        const mockCipher = {
            update: jest.fn(),
            final: jest.fn().mockReturnValue({ iv: 'test', ciphertext: 'encrypted' })
        };
        crypto.createCipher.mockReturnValue(mockCipher);
    });
});
```
</details>

## Creating Custom Stubs

<details>
<summary><strong>Custom Stub Example</strong></summary>

If you need to use a module that isn't stubbed yet, you can create your own custom stub. See the [Custom Stub Example](../README.md#custom-stub-example) in the main README.

Example custom stub:
```javascript
define([], function() {
    var customModule = function() {};
    
    customModule.prototype.myMethod = function(options) {};
    
    return new customModule();
});
```
</details>

## Module Documentation

For detailed information about each module's capabilities and methods:
- Refer to the JSDoc comments in the respective stub files
- Check the [NetSuite Help Center](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_4220488571.html)
- See the [SuiteScript 2.x API Reference](https://docs.oracle.com/en/cloud/saas/netsuite/nsoa-online-help/chapter_4220488571.html)

## Contributing

If you find any issues with existing stubs or would like to contribute new stubs, please follow our [contribution guidelines](../../../CONTRIBUTING.md). 