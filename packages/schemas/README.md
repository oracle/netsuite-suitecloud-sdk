<p align="left"><a href="#"><img width="250" src="../../resources/Netsuite-logo-ocean-150-bg.png"></a></p>

# NetSuite Schemas

## Parent object schema

[`suitecloud-objects-1.0.0.json`](./suitecloud-objects-1.0.0.json) is the entry point for
the 15 object schemas in this directory. It uses `oneOf` to validate a document
against exactly one child schema. Each child requires its own top-level wrapper,
such as `CustomField`, `SdfInstallationScript`, or `Secret`, and rejects additional
top-level properties.

The parent uses relative `$ref` values and deliberately omits `$id`. Its references
resolve relative to the URL or file location used to load it. This keeps the parent
and its children together when testing a GitHub branch, pinning a commit, or using
a local checkout. Use the raw GitHub URL, not the GitHub HTML page URL.

Testing branch URL:

```text
https://raw.githubusercontent.com/oracle/netsuite-suitecloud-sdk/refs/heads/poc/json-parent-schema/packages/schemas/suitecloud-objects-1.0.0.json
```

To pin a test to an immutable revision, replace `refs/heads/poc/json-parent-schema`
in the URL with the full commit SHA. The relative references will use that revision
as well. A future merge into `dev` can use `refs/heads/dev` instead.

## VS Code smoke test

For a SuiteCloud project whose `suitecloud.config.js` sets
`defaultProjectFolder: 'src'`, add this entry to the project's
`.vscode/settings.json`, preserving any existing schema mappings:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["/src/Objects/**/*.json"],
      "url": "https://raw.githubusercontent.com/oracle/netsuite-suitecloud-sdk/refs/heads/poc/json-parent-schema/packages/schemas/suitecloud-objects-1.0.0.json"
    }
  ]
}
```

Adjust the object-directory pattern to the resolved project source directory. In a
multi-root workspace, put the mapping in the relevant workspace folder's settings.
These manual settings are only a way to test the schema; automatic project discovery
and dynamic IDE registration are separate extension work.

Create `src/Objects/customscript_schema_demo.json`:

```json
{
  "SdfInstallationScript": {
    "name": "Schema demo",
    "scriptFile": "[/SuiteScripts/schema-demo.js]",
    "scriptId": "customscript_schema_demo"
  }
}
```

Create `src/Objects/f_schema_demo.json`:

```json
{
  "CustomField": {
    "label": "Schema demo",
    "fieldType": "TEXT",
    "scriptId": "f_schema_demo"
  }
}
```

Both examples satisfy their JSON schemas. Account validation and the existence of
referenced SuiteScript files are outside these schema checks.

Try the following in either IDE:

- Trigger completion at the document root to see the supported object wrappers.
- Trigger completion inside `SdfInstallationScript` to see its properties.
- Trigger completion for `CustomField.fieldType` to see its enum values.
- Remove `name` from the installation script to see a required-property error.
- Change `fieldType` to `SELECT` to see the requirement for `selectRecordType`.
- Set `fieldType` to an unsupported value to see an enum error.
- Add an unknown property or a second object wrapper to see a validation error.

Associate the schema through IDE settings rather than adding `$schema` to the object
document: the child schemas reject additional top-level properties. Files imported
into the mapped object directory receive the same schema association without edits
to their contents.

## WebStorm smoke test

In **Settings > Languages & Frameworks > Schemas and DTDs > JSON Schema Mappings**,
add the parent URL above, select JSON Schema 2020-12, and map the project's resolved
object directory. Enable downloading schemas from remote sources if necessary.
Use the same example documents and checks listed above.

## Template generation

The parent selects an object schema for validation and completion. For template
generation, select the desired child schema and generate its required wrapper and
nested required properties. A generator must resolve references and recurse into
objects; reading only the parent's top-level `required` array will not generate a
template. Existing `default` values can be incomplete prefixes, so generated values
still need to be completed and validated against the child schema.
