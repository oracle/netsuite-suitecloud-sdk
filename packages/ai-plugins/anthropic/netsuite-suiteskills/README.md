# SuiteSkills anthropic source navigation

This directory contains the SuiteSkills 1.0.0 build recipe and provider-specific inputs. Release authorization requires recorded component redistribution clearance and engineering acceptance of the final packages. Security approval covers the security review; it does not establish redistribution rights or installed-runtime qualification.

- [Build recipe](plugin.build.json)
- [Requirements and limitations](src/README.md#requirements-and-limitations)
- [Release history](src/CHANGELOG.md)
- [Shared guidance](../../common/layers/suiteskills/shared/README.md)
- [Customers & Sales](../../common/skills/suiteskills/netsuite-suiteskills-customers-sales/SKILL.md)
- [Finance](../../common/skills/suiteskills/netsuite-suiteskills-finance/SKILL.md)
- [Operations](../../common/skills/suiteskills/netsuite-suiteskills-operations/SKILL.md)
- [Workforce](../../common/skills/suiteskills/netsuite-suiteskills-workforce/SKILL.md)
- [Onboarding](../../common/skills/suiteskills/netsuite-suiteskills-onboarding/SKILL.md)

`src/README.md` is the installed-package README. Its relative skill/shared links target the assembled distribution, not this source directory. Use the links above when browsing source. After running `npm run build --workspace @oracle/ai-plugins` from the repository root, open `dist/ai-plugins/anthropic/netsuite-suiteskills/README.md` to review installed-package navigation.

Edit shared skills under `packages/ai-plugins/common/skills/suiteskills/`, shared guidance under `common/layers/suiteskills/`, and provider-specific inputs here. Regenerate `dist/` through the build; do not edit generated manifests. Bank Reconciliation Prioritization remains read-only.
