Copyright (c) 2026 Oracle and/or its affiliates.
Licensed under the Universal Permissive License v1.0 as shown at
[The Universal Permissive License (UPL), Version 1.0](https://oss.oracle.com/licenses/upl).

# File Upload & Download Security
> Author: Oracle NetSuite

> Applies to: SuiteScript 2.x (Server-Side)
> Related OWASP Categories: A04:2021 (Insecure Design), A01:2021 (Broken Access Control)

Insecure file handling is a major attack vector. Attackers can upload malicious files
to achieve remote code execution, cross-site scripting, or denial of service. Every
file upload and download operation must be rigorously validated and controlled.

---

## Table of Contents

1. [File Type Validation (Allowlist Approach)](#file-type-validation-allowlist-approach)
2. [MIME Type Verification](#mime-type-verification)
3. [File Size Limits](#file-size-limits)
4. [Path Traversal Prevention](#path-traversal-prevention)
5. [N/file Module Security Patterns](#nfile-module-security-patterns)
6. [File Content Validation (Magic Bytes)](#file-content-validation-magic-bytes)
7. [Filename Sanitization](#filename-sanitization)
8. [Secure File Storage Locations](#secure-file-storage-locations)
9. [Download Security](#download-security)
10. [Zip Bomb Prevention](#zip-bomb-prevention)

---

## File Type Validation (Allowlist Approach)

Always use an allowlist of permitted file extensions. Never use a blocklist
approach, as it is impossible to enumerate all dangerous file types.

```javascript
// BAD: Blocklist approach (will always miss something)
function validateFileBlocklist(filename) {
    const blocked = ['.exe', '.bat', '.cmd', '.sh'];
    const ext = filename.substring(filename.lastIndexOf('.'));
    return !blocked.includes(ext.toLowerCase());
    // Misses: .ps1, .vbs, .jar, .hta, .scr, .pif, .msi, .dll, etc.
}

// BAD: No validation at all
function uploadFileNoValidation(fileObj) {
    fileObj.folder = 123;
    fileObj.save();
}

// BAD: Only checking the user-provided Content-Type header
function validateByContentType(request) {
    const contentType = request.headers['Content-Type'];
    if (contentType === 'image/png') {
        return true; // Attacker can spoof this header
    }
}
```

```javascript
// GOOD: Strict allowlist of allowed extensions
const ALLOWED_FILE_TYPES = Object.freeze({
    // Documents
    '.pdf': file.Type.PDF,
    '.csv': file.Type.CSV,
    '.xlsx': file.Type.EXCEL,
    '.txt': file.Type.PLAINTEXT,
    // Images
    '.png': file.Type.PNGIMAGE,
    '.jpg': file.Type.JPGIMAGE,
    '.jpeg': file.Type.JPGIMAGE,
    '.gif': file.Type.GIFIMAGE
});

function validateFileType(filename) {
    if (!filename || typeof filename !== 'string') {
        return { valid: false, reason: 'Filename is required.' };
    }

    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1 || lastDot === filename.length - 1) {
        return { valid: false, reason: 'File must have a valid extension.' };
    }

    const ext = filename.substring(lastDot).toLowerCase();
    if (!ALLOWED_FILE_TYPES[ext]) {
        return {
            valid: false,
            reason: `File type "${ext}" is not permitted. Allowed: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`
        };
    }

    return { valid: true, fileType: ALLOWED_FILE_TYPES[ext], extension: ext };
}
```

---

## MIME Type Verification

MIME types from HTTP headers are client-controlled and cannot be trusted alone.
Cross-reference the extension, declared MIME type, and file magic bytes.

```javascript
// BAD: Trusting the declared MIME type
function handleUpload(request) {
    const uploadedFile = request.files.upload;
    if (uploadedFile.getType() === 'image/png') {
        uploadedFile.folder = 123;
        uploadedFile.save(); // Could be a disguised malicious file
    }
}
```

```javascript
// GOOD: Cross-reference extension, MIME type, and magic bytes
const MIME_EXTENSION_MAP = Object.freeze({
    'application/pdf': ['.pdf'],
    'text/csv': ['.csv'],
    'text/plain': ['.txt', '.csv'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/gif': ['.gif'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
});

function validateMimeType(filename, declaredMimeType) {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const allowedExtensions = MIME_EXTENSION_MAP[declaredMimeType];

    if (!allowedExtensions) {
        return { valid: false, reason: `MIME type "${declaredMimeType}" is not allowed.` };
    }

    if (!allowedExtensions.includes(ext)) {
        return {
            valid: false,
            reason: `Extension "${ext}" does not match MIME type "${declaredMimeType}".`
        };
    }

    return { valid: true };
}
```

---

## File Size Limits

Enforce file size limits to prevent denial of service and resource exhaustion.

```javascript
// BAD: No file size validation
function uploadFileNoSizeCheck(fileObj) {
    fileObj.folder = 123;
    fileObj.save(); // Could be a multi-GB file
}
```

```javascript
// GOOD: Enforce size limits based on file type
const FILE_SIZE_LIMITS = Object.freeze({
    '.pdf': 10 * 1024 * 1024,   // 10 MB
    '.csv': 5 * 1024 * 1024,    // 5 MB
    '.xlsx': 10 * 1024 * 1024,  // 10 MB
    '.png': 2 * 1024 * 1024,    // 2 MB
    '.jpg': 2 * 1024 * 1024,    // 2 MB
    '.jpeg': 2 * 1024 * 1024,   // 2 MB
    '.gif': 1 * 1024 * 1024,    // 1 MB
    '.txt': 1 * 1024 * 1024,    // 1 MB
    DEFAULT: 5 * 1024 * 1024    // 5 MB fallback
});

function validateFileSize(filename, sizeInBytes) {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const maxSize = FILE_SIZE_LIMITS[ext] || FILE_SIZE_LIMITS.DEFAULT;

    if (sizeInBytes <= 0) {
        return { valid: false, reason: 'File is empty.' };
    }

    if (sizeInBytes > maxSize) {
        const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
        const actualMB = (sizeInBytes / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            reason: `File size (${actualMB} MB) exceeds the ${maxMB} MB limit for ${ext} files.`
        };
    }

    return { valid: true };
}
```

---

## Path Traversal Prevention

Path traversal attacks use sequences like `../` to escape the intended directory
and access or overwrite arbitrary files on the file system.

```javascript
// BAD: Using user-supplied path components directly
function saveFileInsecure(userFilename, content) {
    // Attacker sends: "../../../etc/passwd" or "..\..\windows\system32\config"
    const filePath = '/SuiteScripts/uploads/' + userFilename;
    const fileObj = file.create({
        name: userFilename,
        fileType: file.Type.PLAINTEXT,
        contents: content,
        folder: -15 // SuiteScripts folder
    });
    fileObj.save();
}

// BAD: Incomplete sanitization
function sanitizePathWeak(filepath) {
    return filepath.replace('../', ''); // Only removes first occurrence
    // "....//....//etc/passwd" becomes "../../etc/passwd"
}
```

```javascript
// GOOD: Strict path traversal prevention
function sanitizePath(filepath) {
    if (!filepath || typeof filepath !== 'string') {
        throw error.create({
            name: 'INVALID_PATH',
            message: 'File path is required and must be a string.'
        });
    }

    // Reject null bytes (poison null byte attack)
    if (filepath.includes('\0') || filepath.includes('%00')) {
        throw error.create({
            name: 'PATH_TRAVERSAL_DETECTED',
            message: 'Null bytes are not allowed in file paths.'
        });
    }

    // Normalize path separators
    let normalized = filepath.replace(/\\/g, '/');

    // Reject any traversal sequences (even after normalization)
    if (normalized.includes('../') || normalized.includes('..\\') ||
        normalized === '..' || normalized.startsWith('/')) {
        throw error.create({
            name: 'PATH_TRAVERSAL_DETECTED',
            message: 'Directory traversal sequences are not allowed.'
        });
    }

    // Decode URL encoding and check again
    try {
        const decoded = decodeURIComponent(normalized);
        if (decoded.includes('../') || decoded.includes('..\\') || decoded === '..') {
            throw error.create({
                name: 'PATH_TRAVERSAL_DETECTED',
                message: 'Encoded directory traversal sequences are not allowed.'
            });
        }
    } catch (e) {
        if (e.name === 'PATH_TRAVERSAL_DETECTED') throw e;
        // Invalid URI encoding (reject)
        throw error.create({
            name: 'INVALID_PATH',
            message: 'File path contains invalid encoding.'
        });
    }

    // Extract only the filename (strip any directory components)
    const basename = normalized.split('/').pop();
    return basename;
}
```

---

## N/file Module Security Patterns

Secure patterns for using the NetSuite `N/file` module.

```javascript
// BAD: Allowing arbitrary folder selection
function uploadToAnyFolder(fileData, folderId) {
    const fileObj = file.create({
        name: fileData.name,
        fileType: file.Type.PLAINTEXT,
        contents: fileData.contents,
        folder: folderId // User-controlled folder ID
    });
    fileObj.save();
}
```

```javascript
// GOOD: Comprehensive secure file upload handler
function secureFileUpload(fileData, context) {
    // Step 1: Validate filename
    const sanitizedName = sanitizeFilename(fileData.name);

    // Step 2: Validate file type (allowlist)
    const typeValidation = validateFileType(sanitizedName);
    if (!typeValidation.valid) {
        throw error.create({ name: 'INVALID_FILE_TYPE', message: typeValidation.reason });
    }

    // Step 3: Validate file size
    const sizeValidation = validateFileSize(sanitizedName, fileData.size);
    if (!sizeValidation.valid) {
        throw error.create({ name: 'FILE_TOO_LARGE', message: sizeValidation.reason });
    }

    // Step 4: Validate content (magic bytes)
    const contentValidation = validateMagicBytes(fileData.contents, typeValidation.extension);
    if (!contentValidation.valid) {
        throw error.create({ name: 'INVALID_CONTENT', message: contentValidation.reason });
    }

    // Step 5: Generate a safe storage name (avoid overwrites and conflicts)
    const storageName = generateSafeFilename(sanitizedName, context.userId);

    // Step 6: Save to a controlled folder
    const UPLOAD_FOLDER_ID = runtime.getCurrentScript()
        .getParameter({ name: 'custscript_upload_folder_id' });

    const fileObj = file.create({
        name: storageName,
        fileType: typeValidation.fileType,
        contents: fileData.contents,
        folder: parseInt(UPLOAD_FOLDER_ID, 10),
        isOnline: false // Not publicly accessible by default
    });

    const fileId = fileObj.save();

    log.audit('FILE_UPLOAD', {
        fileId: fileId,
        originalName: sanitizedName,
        storageName: storageName,
        size: fileData.size,
        user: context.userId
    });

    return fileId;
}
```

---

## File Content Validation (Magic Bytes)

Validate file contents by checking magic bytes (file signatures) to ensure the
actual content matches the declared file type.

```javascript
// BAD: No content validation; extension alone is insufficient
function uploadImageNoContentCheck(fileObj) {
    if (fileObj.name.endsWith('.png')) {
        fileObj.save(); // Could be a renamed .exe or HTML file
    }
}
```

```javascript
// GOOD: Validate magic bytes against expected file types
const MAGIC_BYTES = Object.freeze({
    '.pdf': { hex: '25504446', description: '%PDF' },
    '.png': { hex: '89504E47', description: 'PNG header' },
    '.jpg': { hex: 'FFD8FF', description: 'JPEG header' },
    '.jpeg': { hex: 'FFD8FF', description: 'JPEG header' },
    '.gif': { hex: '47494638', description: 'GIF header' },
    '.xlsx': { hex: '504B0304', description: 'ZIP/XLSX header' },
    '.zip': { hex: '504B0304', description: 'ZIP header' }
});

function validateMagicBytes(fileContents, extension) {
    const expected = MAGIC_BYTES[extension];

    // Not all file types have magic bytes (for example, .csv, .txt)
    if (!expected) {
        return { valid: true, reason: 'No magic bytes check for this type.' };
    }

    // Convert beginning of file to hex
    const headerHex = getFileHeaderHex(fileContents, expected.hex.length / 2);

    if (!headerHex.toUpperCase().startsWith(expected.hex.toUpperCase())) {
        return {
            valid: false,
            reason: `File content does not match expected ${extension} format. ` +
                    `Expected ${expected.description} signature.`
        };
    }

    return { valid: true };
}

function getFileHeaderHex(contents, numBytes) {
    // For Base64-encoded contents
    const decoded = encode.convert({
        string: contents.substring(0, Math.ceil(numBytes * 4 / 3)),
        inputEncoding: encode.Encoding.BASE_64,
        outputEncoding: encode.Encoding.HEX
    });
    return decoded.substring(0, numBytes * 2);
}
```

---

## Filename Sanitization

Sanitize filenames to prevent injection attacks, path traversal, and file system issues.

```javascript
// BAD: Using user-supplied filename directly
function saveFile(userFilename, content) {
    const fileObj = file.create({
        name: userFilename, // Could be: "../../malicious.html" or "file\x00.txt.exe"
        fileType: file.Type.PLAINTEXT,
        contents: content,
        folder: 123
    });
    fileObj.save();
}
```

```javascript
// GOOD: Thorough filename sanitization
function sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') {
        throw error.create({
            name: 'INVALID_FILENAME',
            message: 'Filename is required.'
        });
    }

    // Remove null bytes
    let safe = filename.replace(/\0/g, '');

    // Extract only the filename portion (strip any path)
    safe = safe.split(/[/\\]/).pop();

    // Remove or replace dangerous characters
    // Allow only alphanumeric, hyphens, underscores, single dots
    safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Prevent double extensions (for example, "file.php.jpg")
    const parts = safe.split('.');
    if (parts.length > 2) {
        safe = parts[0] + '.' + parts[parts.length - 1];
    }

    // Prevent hidden files (starting with dot)
    if (safe.startsWith('.')) {
        safe = '_' + safe.substring(1);
    }

    // Limit filename length
    if (safe.length > 200) {
        const ext = safe.substring(safe.lastIndexOf('.'));
        safe = safe.substring(0, 200 - ext.length) + ext;
    }

    // Prevent empty filenames
    if (!safe || safe === '.' || safe === '..') {
        throw error.create({
            name: 'INVALID_FILENAME',
            message: 'Filename resolved to an invalid value after sanitization.'
        });
    }

    return safe;
}

// GOOD: Generate a unique safe filename to prevent collisions
function generateSafeFilename(originalName, userId) {
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedBase = sanitizeFilename(originalName).replace(/\.[^.]+$/, '');
    const truncatedBase = sanitizedBase.substring(0, 50);
    return `${truncatedBase}_${userId}_${timestamp}${ext}`;
}
```

---

## Secure File Storage Locations

Control where files are stored and who can access them.

```javascript
// BAD: Storing uploads in publicly accessible web folders
function storeFileInsecure(fileObj) {
    fileObj.folder = -15; // SuiteScripts folder (may be web-accessible)
    fileObj.isOnline = true; // Publicly accessible!
    fileObj.save();
}
```

```javascript
// GOOD: Store uploads in restricted folders with proper access controls
function storeFileSecure(fileObj, fileType) {
    // Use dedicated upload folders configured via Script Parameters
    const FOLDER_MAP = {
        'customer_docs': runtime.getCurrentScript()
            .getParameter({ name: 'custscript_customer_docs_folder' }),
        'internal_reports': runtime.getCurrentScript()
            .getParameter({ name: 'custscript_internal_reports_folder' }),
        'temp_processing': runtime.getCurrentScript()
            .getParameter({ name: 'custscript_temp_processing_folder' })
    };

    const folderId = FOLDER_MAP[fileType];
    if (!folderId) {
        throw error.create({
            name: 'INVALID_STORAGE_TYPE',
            message: `Unknown file storage type: "${fileType}".`
        });
    }

    fileObj.folder = parseInt(folderId, 10);
    fileObj.isOnline = false; // Not publicly accessible
    fileObj.save();

    log.audit('FILE_STORED', {
        fileId: fileObj.id,
        folder: folderId,
        type: fileType,
        isOnline: false
    });
}

// GOOD: Clean up temporary files after processing
function cleanupTempFiles(maxAgeHours) {
    const tempFolderId = runtime.getCurrentScript()
        .getParameter({ name: 'custscript_temp_processing_folder' });

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - maxAgeHours);

    const results = search.create({
        type: 'file',
        filters: [
            ['folder', 'is', tempFolderId],
            'AND',
            ['created', 'before', format.format({ value: cutoff, type: format.Type.DATETIME })]
        ],
        columns: ['name', 'created']
    }).run().getRange({ start: 0, end: 100 });

    results.forEach(result => {
        file.delete({ id: result.id });
        log.audit('TEMP_FILE_CLEANED', { fileId: result.id, name: result.getValue('name') });
    });
}
```

---

## Download Security

Secure file downloads to prevent unauthorized access and content-type attacks.

```javascript
// BAD: Serving files without access control or proper headers
function downloadFileInsecure(request, response) {
    const fileId = request.parameters.fileId;
    const fileObj = file.load({ id: fileId }); // No access check
    response.write(fileObj.getContents()); // No Content-Disposition header
}
```

```javascript
// GOOD: Secure file download with access control and proper headers
function downloadFileSecure(request, response) {
    const fileId = parseInt(request.parameters.fileId, 10);

    // Validate fileId is a positive integer
    if (!fileId || fileId <= 0 || !Number.isInteger(fileId)) {
        response.setHeader({ name: 'Content-Type', value: 'application/json' });
        response.write(JSON.stringify({ error: 'Invalid file identifier.' }));
        return;
    }

    // Check authorization
    const currentUser = runtime.getCurrentUser();
    if (!isUserAuthorizedForFile(currentUser.id, fileId)) {
        log.audit('UNAUTHORIZED_DOWNLOAD', {
            userId: currentUser.id,
            fileId: fileId
        });
        response.setHeader({ name: 'Content-Type', value: 'application/json' });
        response.write(JSON.stringify({ error: 'Access denied.' }));
        return;
    }

    const fileObj = file.load({ id: fileId });

    // Force download (prevent browser interpretation of file content)
    const safeFilename = sanitizeFilename(fileObj.name);
    response.setHeader({
        name: 'Content-Disposition',
        value: `attachment; filename="${safeFilename}"`
    });

    // Prevent MIME-type sniffing
    response.setHeader({
        name: 'X-Content-Type-Options',
        value: 'nosniff'
    });

    // Set appropriate Content-Type
    response.setHeader({
        name: 'Content-Type',
        value: getSecureMimeType(fileObj.fileType)
    });

    // Prevent caching of sensitive downloads
    response.setHeader({
        name: 'Cache-Control',
        value: 'no-store, no-cache, must-revalidate'
    });

    response.write(fileObj.getContents());

    log.audit('FILE_DOWNLOADED', {
        fileId: fileId,
        userId: currentUser.id,
        filename: safeFilename
    });
}

function getSecureMimeType(fileType) {
    const mimeMap = {
        [file.Type.PDF]: 'application/pdf',
        [file.Type.CSV]: 'text/csv',
        [file.Type.PLAINTEXT]: 'text/plain',
        [file.Type.PNGIMAGE]: 'image/png',
        [file.Type.JPGIMAGE]: 'image/jpeg',
        [file.Type.EXCEL]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return mimeMap[fileType] || 'application/octet-stream';
}
```

---

## Zip Bomb Prevention

Zip bombs (or decompression bombs) are small compressed files that expand to enormous
sizes when extracted, causing denial of service.

```javascript
// BAD: Extracting zip files without size checks
function processZipInsecure(zipContents) {
    const extracted = extractZip(zipContents);
    extracted.files.forEach(f => {
        file.create({
            name: f.name,     // Unsanitized name
            contents: f.data, // Unbounded size
            folder: 123
        }).save();
    });
}
```

```javascript
// GOOD: Safe zip processing with multiple safeguards
const ZIP_LIMITS = Object.freeze({
    MAX_COMPRESSED_SIZE: 10 * 1024 * 1024,     // 10 MB compressed
    MAX_UNCOMPRESSED_SIZE: 100 * 1024 * 1024,  // 100 MB total uncompressed
    MAX_COMPRESSION_RATIO: 100,                 // Max 100:1 ratio
    MAX_FILE_COUNT: 50,                         // Max 50 files in archive
    MAX_DEPTH: 2                                // Max nesting depth
});

function processZipSecure(zipContents, compressedSize) {
    // Check compressed size
    if (compressedSize > ZIP_LIMITS.MAX_COMPRESSED_SIZE) {
        throw error.create({
            name: 'ZIP_TOO_LARGE',
            message: 'Compressed file exceeds maximum allowed size.'
        });
    }

    const extracted = extractZip(zipContents);

    // Check file count
    if (extracted.files.length > ZIP_LIMITS.MAX_FILE_COUNT) {
        throw error.create({
            name: 'ZIP_TOO_MANY_FILES',
            message: `Archive contains ${extracted.files.length} files; ` +
                     `maximum is ${ZIP_LIMITS.MAX_FILE_COUNT}.`
        });
    }

    // Check for nested archives (zip bomb technique)
    const hasNestedArchives = extracted.files.some(f =>
        f.name.toLowerCase().endsWith('.zip') ||
        f.name.toLowerCase().endsWith('.gz') ||
        f.name.toLowerCase().endsWith('.tar')
    );
    if (hasNestedArchives) {
        throw error.create({
            name: 'ZIP_NESTED_ARCHIVE',
            message: 'Nested archives are not allowed.'
        });
    }

    let totalUncompressedSize = 0;
    const safeFiles = [];

    for (const f of extracted.files) {
        // Sanitize each filename
        const safeName = sanitizeFilename(f.name);

        // Validate each file type
        const typeCheck = validateFileType(safeName);
        if (!typeCheck.valid) {
            log.audit('ZIP_BLOCKED_FILE', { name: f.name, reason: typeCheck.reason });
            continue; // Skip disallowed file types
        }

        // Track cumulative uncompressed size
        totalUncompressedSize += f.data.length;
        if (totalUncompressedSize > ZIP_LIMITS.MAX_UNCOMPRESSED_SIZE) {
            throw error.create({
                name: 'ZIP_BOMB_DETECTED',
                message: 'Total uncompressed size exceeds safety limit.'
            });
        }

        // Check compression ratio per file
        if (f.compressedSize > 0) {
            const ratio = f.data.length / f.compressedSize;
            if (ratio > ZIP_LIMITS.MAX_COMPRESSION_RATIO) {
                throw error.create({
                    name: 'ZIP_BOMB_DETECTED',
                    message: `Suspicious compression ratio (${ratio.toFixed(0)}:1) detected.`
                });
            }
        }

        safeFiles.push({ name: safeName, data: f.data, type: typeCheck.fileType });
    }

    return safeFiles;
}
```

---

## Quick Reference Checklist

| Practice | Status |
|---|---|
| Allowlist allowed file extensions | Required |
| Validate MIME type matches extension | Required |
| Enforce per-type file size limits | Required |
| Prevent path traversal (../ and null bytes) | Required |
| Validate file magic bytes | Required |
| Sanitize filenames (strip special chars) | Required |
| Store uploads in restricted folders | Required |
| Set Content-Disposition: attachment on downloads | Required |
| Set X-Content-Type-Options: nosniff | Required |
| Verify authorization before serving files | Required |
| Check zip compression ratios | Required |
| Limit files per archive and nesting depth | Required |
| Clean up temporary files on schedule | Recommended |
| Log all upload and download operations | Recommended |

---

## See Also

- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [NetSuite N/file Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4205693274.html)
- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [CWE-434: Unrestricted Upload of File with Dangerous Type](https://cwe.mitre.org/data/definitions/434.html)
