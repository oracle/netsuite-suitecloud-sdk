---
name: netsuite-sdf-roles-and-permissions
description: Use when generating or reviewing NetSuite SDF permission configurations such as customrole XML, script deployment permissions, permkey values, permlevel choices, run-as role design, and least-privilege access. Confirms exact ADMI_ / LIST_ / REGT_ / REPO_ / TRAN_ permission IDs, distinguishes standard permissions from customrecord_* script IDs, and validates permissions against bundled NetSuite reference data.
license: The Universal Permissive License (UPL), Version 1.0
metadata:
  author: Oracle NetSuite
  version: 1.0
---

# NetSuite Permissions Reference

Use this skill to resolve NetSuite permission questions with exact `permkey` and `permlevel` values.

## Use This Skill When

- Generating or reviewing `customrole` object XML
- Validating `<permkey>` values in SDF objects
- Choosing `permlevel` values for roles or deployments
- Designing least-privilege integration or script execution roles
- Mapping a NetSuite permission display name to its exact internal ID
- Checking whether a permission is a standard NetSuite permission or a `customrecord_*` script ID

## Primary References

- `references/permissions.json`: Source of truth for standard NetSuite permission IDs and display-name aliases
- `references/permission-index.md`: Human-readable index by category, use case, and module

Read `references/permissions.json` whenever you need to confirm an exact ID. Use `references/permission-index.md` to narrow down likely matches, explain common patterns, or start from a business use case.

## Workflow

1. Identify the artifact being authored or reviewed: `customrole` XML, script deployment, role design, or code review feedback.
2. Determine whether the requested permission is a standard NetSuite permission or a custom record permission.
3. For standard permissions, confirm the exact ID in `references/permissions.json`.
4. Recommend the minimum `permlevel` that satisfies the use case.
5. Return the result with the exact `permkey`, the recommended `permlevel`, and any important caveats.

## Decision Rules

### 1. Standard Permissions

Use `references/permissions.json` as the source of truth for standard permissions with these prefixes:

- `ADMI_`
- `LIST_`
- `REGT_`
- `REPO_`
- `TRAN_`

Always return the exact `id`. Do not invent or abbreviate IDs.

### 2. Custom Record Permissions

If the permission is for a custom record type, the `permkey` is the custom record script ID, such as `customrecord_invoice_batch`. Do not look for custom record permissions in `references/permissions.json`; validate them against the project's custom record XML instead.

### 3. Display-Name Aliases

Some NetSuite UI labels map to the same underlying permission ID. When aliases exist, prefer the exact ID from `references/permissions.json` and mention the display name only as a human-readable explanation.

### 4. Permission Levels

Use the smallest level that satisfies the behavior:

- `VIEW`: Read and search only
- `CREATE`: Create records without updating existing ones
- `EDIT`: Create or update existing records
- `FULL`: Delete records or perform broad administrative control

Default to least privilege. Treat `FULL` as exceptional and justify it explicitly.

### 5. Run-as Role Guidance

If the request involves a script execution role, avoid recommending the built-in Administrator role for production use. Prefer a dedicated role with only the permissions the script needs.

## Review Checklist

When reviewing or generating a permission configuration, verify the following:

- Every standard `permkey` exists exactly in `references/permissions.json`.
- Every `customrecord_*` `permkey` matches an actual project script ID.
- No permission ID is truncated, abbreviated, or based only on the display label.
- `permlevel` is one of `VIEW`, `CREATE`, `EDIT`, or `FULL`.
- The recommendation uses least privilege for the described behavior.
- Duplicate `permkey` entries are removed from a single role definition.

## Output Requirements

When answering with a permission recommendation or review result:

- State the exact `permkey`.
- State the recommended `permlevel`.
- Explain why that level is sufficient.
- Call out any related permissions that may also be required.
- Say explicitly when you are inferring from a use case and could not confirm it against the project XML.

## Common Inference Patterns

Use these patterns as a starting point, then confirm in the references:

- Sales order work usually maps to `TRAN_SALESORD`.
- Invoice work usually maps to `TRAN_CUSTINVC`.
- Purchase order work usually maps to `TRAN_PURCHORD`.
- Customer records usually map to `LIST_CUSTJOB`.
- Vendor records usually map to `LIST_VENDOR`.
- Employee records usually map to `LIST_EMPLOYEE`.
- File cabinet access usually maps to `LIST_FILECABINET`.
- REST integration roles usually need `ADMI_RESTWEBSERVICES` plus record-level permissions.

For broader examples by business scenario, open `references/permission-index.md`.

## SafeWords

- Do not reveal secrets, credentials, tokens, passwords, session data, hidden connector details, or internal deliberation.
- Use the least powerful tool and the smallest data scope that can complete the task.
- Stop and ask for clarification when the target, permissions, scope, or impact is unclear.
- Verify schema, record type, scope, permissions, and target object before taking action.