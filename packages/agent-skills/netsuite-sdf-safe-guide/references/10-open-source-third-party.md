# Principle 10: Open Source and Third-Party Software
> Source: Oracle NetSuite SAFE Guide (SuiteApp Architectural Fundamentals & Examples) Version 2025.2
> Author: Oracle NetSuite

## Overview

You are solely responsible for the content of your SuiteApp, including any third-party code contained within it. Your SuiteApp must not include software that requires you or NetSuite to disclose source code, redistribute code free of charge, or enable derivative works.

## Key Concepts

### Prohibited License Types

Your SuiteApp may **NOT** include software subject to licenses requiring:

1. **Source code disclosure** – Disclose or distribute code in source form
2. **Free redistribution** – Redistribute code free of charge
3. **Derivative works enablement** – Make code available for others to make derivative works

### Problematic Licenses

These licenses may include such requirements:
- GNU Affero General Public License (AGPL)
- GNU General Public License (GPL)
- GNU Lesser/Library GPL (LGPL)
- Other copyleft licenses

## Best Practices

### Required Documentation

Keep the following information updated and available at all times:

| Documentation | Purpose |
|--------------|---------|
| Third-party software list | All third-party and open source in your products |
| License copies | Copies of all third-party licenses |
| Source links | Links where open source software was obtained |
| License agreements | Full text of all open source licenses |

### License Evaluation Checklist

Before including any third-party code:

- [ ] Review the license terms carefully
- [ ] Check for copyleft provisions
- [ ] Verify no source disclosure requirements
- [ ] Confirm no free redistribution mandates
- [ ] Ensure no derivative works requirements
- [ ] Document the license type and source

### Acceptable License Types (Generally)

These license types are typically acceptable (verify specific terms):

| License | Type | Notes |
|---------|------|-------|
| MIT | Permissive | Usually acceptable |
| Apache 2.0 | Permissive | Usually acceptable |
| BSD (2/3 clause) | Permissive | Usually acceptable |
| ISC | Permissive | Usually acceptable |

### License Types Requiring Caution

| License | Type | Concerns |
|---------|------|----------|
| GPL | Copyleft | Source disclosure required |
| LGPL | Weak copyleft | May require source for modifications |
| AGPL | Strong copyleft | Network use triggers disclosure |
| CC-BY-SA | Share-alike | Derivative works must use same license |

## Code Example

### Documenting Third-Party Dependencies

```javascript
/**
 * Third-Party Software Documentation
 *
 * This SuiteApp includes the following third-party libraries:
 *
 * 1. Library: moment.js
 *    Version: 2.29.4
 *    License: MIT
 *    Source: https://github.com/moment/moment
 *    Purpose: Date/time manipulation
 *
 * 2. Library: lodash
 *    Version: 4.17.21
 *    License: MIT
 *    Source: https://github.com/lodash/lodash
 *    Purpose: Utility functions
 *
 * All licenses are included in the /licenses directory.
 */
```

### License File Structure

```
COM.YOURCOMPANY.SUITEAPP/
├── src/
│   └── FileCabinet/
├── licenses/
│   ├── THIRD_PARTY_LICENSES.md
│   ├── moment-MIT.txt
│   └── lodash-MIT.txt
└── manifest.xml
```

### THIRD_PARTY_LICENSES.md Template

```markdown
# Third-Party Licenses

## Overview
This document lists all third-party software included in this SuiteApp.

## Libraries

### moment.js
- **Version**: 2.29.4
- **License**: MIT
- **Copyright**: Copyright (c) JS Foundation and other contributors
- **Source**: https://github.com/moment/moment
- **License Text**: See moment-MIT.txt

### lodash
- **Version**: 4.17.21
- **License**: MIT
- **Copyright**: Copyright OpenJS Foundation and other contributors
- **Source**: https://github.com/lodash/lodash
- **License Text**: See lodash-MIT.txt
```

## Common Pitfalls

1. **Assuming all open source is safe** – Review each license carefully.
2. **Not tracking dependencies** – Maintain comprehensive documentation.
3. **Ignoring transitive dependencies** – Check licenses of all nested dependencies.
4. **Outdated documentation** – Keep license records current with each release.
5. **Missing attribution** – Many licenses require attribution in documentation.

## Compliance Process

```
1. Identify all third-party code
        ↓
2. Obtain license for each component
        ↓
3. Review license terms
        ↓
4. Verify compliance with NetSuite requirements
        ↓
5. Document in THIRD_PARTY_LICENSES file
        ↓
6. Include license text copies
        ↓
7. Review with each SuiteApp update
```

## Further Reading

- [Open Source Initiative - License List](https://opensource.org/licenses)
- [SPDX License List](https://spdx.org/licenses/)
- SuiteCloud Terms of Service
