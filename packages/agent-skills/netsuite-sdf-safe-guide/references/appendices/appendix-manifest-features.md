# Appendix: Manifest Feature Dependencies

> Author: Oracle NetSuite

Quick reference for NetSuite feature strings required in `manifest.xml` `<dependencies><features>` section. Missing feature declarations cause SDF validation warnings and may block deployment in target accounts.

## How Feature Dependencies Work

When a custom field (`custbody_*`, `custitem_*`, etc.) applies to a record type that requires a specific NetSuite feature, that feature must be declared in `manifest.xml`. SDF validates this at deploy time — each missing feature generates a warning per affected object.

**Key insight:** One missing feature × N custom fields = N identical warnings. Fix the manifest once to silence all of them.

## Core Features (Always Required)

| Feature String | Required When | UI Setting Location |
|---|---|---|
| SERVERSIDESCRIPTING | Any server-side script (UE, SL, SS, MR, RL, WA, BIS, SDFI, Portlet) | Setup > Company > Enable Features > SuiteCloud > Server SuiteScript |
| CUSTOMRECORDS | Any `customrecordtype` in the project | Setup > Company > Enable Features > SuiteCloud > Custom Records |

## Transaction Body Field Features (`custbody_*`)

These features are required when custom fields are applied to the corresponding transaction body types:

| Feature String | Transaction Type | UI Setting Location |
|---|---|---|
| RECEIVABLES | Customer Payment | Setup > Company > Enable Features > Accounting > Accounts Receivable |
| PAYABLES | Vendor Payment | Setup > Company > Enable Features > Accounting > Accounts Payable |
| EXPREPORTS | Expense Report | Setup > Company > Enable Features > Employees > Expense Reports |
| ADVRECEIVING | Item Receipt | Setup > Company > Enable Features > Items & Inventory > Advanced Receiving |
| OPPORTUNITIES | Opportunity | Setup > Company > Enable Features > CRM > Opportunities |
| WEBSTORE | Web Store / eCommerce | Setup > Company > Enable Features > Web Presence > Web Store |
| MULTILOCINVT | Transfer Order | Setup > Company > Enable Features > Items & Inventory > Multi-Location Inventory |

## Item Field Features (`custitem_*`)

These features are required when custom fields apply to specific item types:

| Feature String | Item Type | UI Setting Location |
|---|---|---|
| INVENTORY | Inventory Item | Setup > Company > Enable Features > Items & Inventory > Inventory |
| ASSEMBLIES | Assembly Item | Setup > Company > Enable Features > Items & Inventory > Assemblies |
| MATRIXITEMS | Matrix Items (customlist abbreviation) | Setup > Company > Enable Features > Items & Inventory > Matrix Items |

## Other Common Features

| Feature String | Required When | Notes |
|---|---|---|
| ADVANCEDPRINTING | Advanced PDF/HTML Templates | Custom transaction forms with advanced printing |
| SUBSIDIARIES | Multi-subsidiary records | OneWorld accounts only |
| MULTICURRENCY | Multi-currency transactions | Fields on currency-related records |
| DEPARTMENTS | Department segmentation | Fields referencing department records |
| CLASSES | Class segmentation | Fields referencing class records |
| LOCATIONS | Location tracking | Fields referencing location records |

## manifest.xml Example

A comprehensive manifest for a project with server-side scripts, transaction body fields, and inventory item fields:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest projecttype="ACCOUNTCUSTOMIZATION">
  <projectname>My ETO Project</projectname>
  <frameworkversion>1.0</frameworkversion>
  <dependencies>
    <features>
      <!-- Scripts -->
      <feature required="true">SERVERSIDESCRIPTING</feature>
      <!-- Transaction body fields -->
      <feature required="true">RECEIVABLES</feature>
      <feature required="true">PAYABLES</feature>
      <feature required="true">EXPREPORTS</feature>
      <feature required="true">ADVRECEIVING</feature>
      <feature required="true">OPPORTUNITIES</feature>
      <feature required="true">WEBSTORE</feature>
      <feature required="true">MULTILOCINVT</feature>
      <!-- Item fields -->
      <feature required="true">INVENTORY</feature>
      <feature required="true">ASSEMBLIES</feature>
    </features>
  </dependencies>
</manifest>
```

## Diagnosing Missing Features

Run `suitecloud project:validate` to identify missing features. The output follows this pattern:

```
WARNING — One or more potential issues were found during custom object validation. (custbody_my_field)
Details: The bodycustomerpayment field depends on the RECEIVABLES feature. The manifest must define
the RECEIVABLES feature as required or optional.
```

Each warning identifies: the affected object (`custbody_my_field`), the dependent field (`bodycustomerpayment`), and the required feature (`RECEIVABLES`).

## `required` vs `optional`

- `required="true"` — The feature MUST be enabled in the target account. Deployment fails if disabled.
- `required="false"` (optional) — The feature is used if available but not required. Custom objects that depend on the feature will only be active when the feature is enabled.

**Recommendation:** Use `required="true"` unless you have a specific reason to make a feature optional (for example, multi-edition SuiteApps that work with or without certain features).

## Common Pitfalls

### Manifest Structure Pitfalls

1. **`MANUFACTURING` is Not a Valid Feature ID** — Using `<feature required="true">MANUFACTURING</feature>` in `manifest.xml` causes validation error: `The "MANUFACTURING" feature defined in the manifest does not exist`. The correct feature ID for work orders and assembly items is `ASSEMBLIES`. Other commonly confused feature IDs: use `INVENTORY` (not `INVENTORYMANAGEMENT`), `MULTILOCINVT` (not `MULTILOCATIONINVENTORY`). Always cross-reference the feature tables above when adding features to `manifest.xml`.

2. **`<objects>` Element Not Supported in SuiteApp Manifests** — Adding an `<objects>` section inside `<dependencies>` in a SuiteApp manifest causes validation error: `The object field "objects" is invalid or not supported`. SuiteApp projects auto-deploy all files in the `Objects/` folder — no explicit object listing is needed in `manifest.xml`. Only `<features>` is valid inside `<dependencies>`. This element IS valid in Account Customization projects but NOT in SuiteApp projects (`projecttype="SUITEAPP"`). Error message: `The object field "objects" is invalid or not supported`.

```xml
<!-- BAD — <objects> is not supported in SuiteApp manifests -->
<manifest projecttype="SUITEAPP">
  <dependencies>
    <features>
      <feature required="true">CUSTOMRECORDS</feature>
    </features>
    <objects>
      <object>customrecord_my_record</object>
    </objects>
  </dependencies>
</manifest>
```

```xml
<!-- GOOD — SuiteApp manifests only use <features> in <dependencies> -->
<manifest projecttype="SUITEAPP">
  <dependencies>
    <features>
      <feature required="true">CUSTOMRECORDS</feature>
    </features>
  </dependencies>
</manifest>
<!-- Objects in src/Objects/ are auto-deployed by SDF -->
```
