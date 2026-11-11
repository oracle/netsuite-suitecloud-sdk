# Appendix: SuiteApp application.xml — Pre-Uninstall Lifecycle Hook

> **Applies to:** SuiteApp projects only. Not applicable to Account Customization Projects (ACPs).

## Overview

The `application.xml` file is an optional SDF project file placed at the project root (alongside `manifest.xml` and `deploy.xml`). It enables custom SuiteScript logic to run **before** a SuiteApp is uninstalled — a pre-uninstall lifecycle phase not available through any other SDF mechanism.

## File Location

```
src/
  application.xml     ← optional, auto-discovered by SDF
  manifest.xml
  deploy.xml
```

## XML Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<application>
  <hooks>
    <beforeundeploy>
      <!-- Reference an SDFInstallationScript Object XML and its deployment -->
      <script>
        <path>~/Objects/customscript_[uninstall_cleanup].xml</path>
        <run>customdeploy_[uninstall_cleanup]</run>
      </script>
    </beforeundeploy>
  </hooks>
</application>
```

> **Note:** The exact child element structure inside `<beforeundeploy>` should be verified against Oracle's Lifecycle Hooks documentation. The outer `<application><hooks><beforeundeploy>` wrapper is confirmed by Oracle.

## How It Works

1. Create an SDFInstallationScript (`.js` file + Object XML) containing your cleanup logic.
2. Reference the Object XML path and deployment ID in `application.xml`.
3. When a SuiteApp is uninstalled, NetSuite runs the referenced script **before** the uninstall process removes SuiteApp components.
4. The script has access to record data and the File Cabinet before they are deleted.

## When to Use

- Clean up custom records or data before the SuiteApp schema is removed
- Revoke API tokens or external service credentials
- Archive data that would otherwise be permanently lost
- Send notifications about the pending uninstall
- Delete custom records, files, or folders that should not survive the uninstall

## Comparison: application.xml vs BundleInstallationScript

| Aspect | BundleInstallationScript | application.xml beforeUndeploy |
|--------|--------------------------|--------------------------------|
| Mechanism | Standalone script type with JS entry points | References an SDFInstallationScript via XML config |
| Lifecycle phases | afterInstall, afterUpdate, afterUninstall | Before uninstall begins |
| Timing | Runs AFTER install/update/uninstall completes | Runs BEFORE uninstall starts |
| Data access | After uninstall: schema already removed | Before uninstall: full access to records and files |
| Required? | No | No (optional file) |
| Distribution | SuiteApp (bundle) only | SuiteApp only |
| Configuration | JavaScript entry point functions | XML reference to SDFInstallationScript |

## Key Notes

- `application.xml` is **optional**; SDF deployment succeeds without it
- The file is NOT included in `deploy.xml`; SDF auto-discovers it at the project root
- The referenced SDFInstallationScript must exist as an Object XML file in your project
- Use `application.xml` when you need to act BEFORE data is removed; use BundleInstallationScript's `afterUninstall` when you need to act AFTER removal
- For install and update lifecycle handling, continue using BundleInstallationScript; `application.xml` only supports `beforeUndeploy`

## Related

- [SKILL.md — application.xml section](../../SKILL.md) — inline documentation in the leading practices guide
- [BundleInstallationScript coverage](../../SKILL.md) — the complementary lifecycle mechanism
- Pitfall #87 — Confusing application.xml beforeUndeploy with BundleInstallationScript
- Pitfall #88 — Missing application.xml for Pre-Uninstall Cleanup
