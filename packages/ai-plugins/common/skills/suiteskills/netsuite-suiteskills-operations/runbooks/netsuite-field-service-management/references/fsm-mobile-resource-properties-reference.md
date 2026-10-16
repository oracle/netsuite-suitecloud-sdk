# FSM Mobile resource properties reference

Resource availability and behavior depend on account configuration.

## Section routes

- [Configuration conventions and templates](#resource-configuration-conventions) and [resource properties](#resource-properties).
- [Permission precedence](#permission-precedence) and [resource dependencies](#resource-dependencies).
- [Article properties](#article-properties), [parent relationships](#parent-relationship), and [automap](#automap).
- [Custom-form loading](#form-properties) and [field translation](#form-field-translation).
- [Runtime defaults](#runtime-defaults-applied-to-every-resource) and [default resources](#out-of-the-box-mobile-resources).

Resource definitions supply a Mobile tab or related Mobile data set. A resource combines an article record definition with a set of elements. For element types, element properties, values, and mobile expressions, see [FSM Mobile Element (Block) Reference](fsm-mobile-blocks-reference.md#section-routes).

## Resource configuration conventions

For guidance on unsupported or ineffective settings, see [Correct unsupported or ineffective configuration](configuration.md#correct-unsupported-or-ineffective-configuration).

Configure resource definitions under `routes/mobile`. A definition can contain a record definition in `article`, an element definition in `element`, or both. The Mobile service renders the resource before sending it to the app.

Configuration values use these terms:

| Term | Meaning |
| --- | --- |
| Static value | A literal configuration value, such as `true`, `"page"`, `1`, or an object or array. |
| Default | The value applied by the product when the property is omitted. A default is not necessarily written back to the configuration. |
| Template tag | Server-side JavaScript in the form `${ ... }`. It is evaluated while the resource is rendered. A tag used as the complete value preserves its result type; a tag embedded in other text produces text. Legacy `{...}` lookup tags are still recognized, but `${ ... }` is the recommended syntax. |
| Mobile expression | A client-side expression on an **element** property. It is evaluated by the Mobile app as element values change. It is not a resource-property feature. |

Resource configuration values support template tags, including nested `article`, `element`, and `form` values. At render time, the standard context provides `event`, `user`, `server`, `url`, `config`, `crud`, `template`, `merge`, and `resolve`. Resource request values are available through `options`. Additional, unrecognised top-level keys supply template data local to the resource; they are not returned as resource properties.

A template tag must return a valid value for its target property. For example, a tag in `max` must resolve to a number, a tag in `hidden` must resolve to a Boolean value, and a tag in `article.record` must resolve to a NetSuite record type ID. Tags are evaluated once when the resource is rendered and do not react to later user input. For reactive behaviour, configure the relevant element property as described in the element reference.

## Resource properties

Resource definitions recognize the properties below. Unless stated otherwise, each supports a complete-value template tag that must resolve to its accepted value. Resource `parent` sets client hierarchy, `article.parent` links an article to the current event, and an element `parent` assigns a table column.

| Property | Description | Accepted static value | Template tags | Default |
| --- | --- | --- | --- | --- |
| `id` | Resource identifier. In normal Mobile configuration, the resource key supplies the identifier; a rule can also supply an ID or an ID with a numeric suffix. | String. | Yes; string. | No default. |
| `label` | Label displayed for the resource. | String. | Yes; string. | If omitted and `article.record` is set, a title-cased label is derived from the record ID. Otherwise no label is added. |
| `icon` | Icon name displayed for the resource. | String. | Yes; string. | `"page"`. |
| `parent` | Parent resource ID for the client resource hierarchy. This is normally supplied by the resource rule rather than the base definition. | String. | Yes; string. | The current event or user resource is used by the client when no parent is supplied. |
| `search` | Enables the resource search user interface. It does not define record search filters. | `true` or `false`. | Yes; Boolean. | `false` in the Mobile client. |
| `remote` | Treats the resource article as remote. The rendered resource does not include `article`; the client requests articles separately. | `true` or `false`. | Yes; Boolean. | `false` in the Mobile client. |
| `readonly` | Removes create, edit, and delete permissions during rendering. It is not returned as a resource property. | `true` or `false`. | Yes; Boolean. | `false` in the Mobile client; no permission override during rendering. |
| `create` | Allows creation of articles. | `true` or `false`. | Yes; Boolean. | `true`, unless `readonly` is `true`. |
| `edit` | Allows editing of existing articles. | `true` or `false`. | Yes; Boolean. | `true`, unless `readonly` is `true`. |
| `delete` | Allows deletion of articles. | `true` or `false`. | Yes; Boolean. | `true`, unless `readonly` is `true`. |
| `min` | Minimum number of articles required for the resource to be complete. | Number. | Yes; number. | `0` in the Mobile client. |
| `max` | Maximum number of articles that the resource allows. | Number. | Yes; number. | `0` in the Mobile client (no maximum enforced). |
| `enable` | Dependencies that must all be complete before the resource is enabled. A dependency can be another resource ID, `"commenced"`, or `"completed"`. | String or array of strings. | Yes; string or array. | No dependencies. |
| `disable` | Dependencies that must all be complete before the resource is disabled. A dependency can be another resource ID, `"commenced"`, or `"completed"`. | String or array of strings. | Yes; string or array. | No dependencies. |
| `hidden` | Prevents the resource from being rendered when true. | `true` or `false`. | Yes; Boolean. | `false`. |
| `latitude` | Latitude returned with the resource for resource geolocation. It is used only when `longitude` is also present and both values are valid coordinates. | Number or numeric string. | Yes; number or numeric string. | No geolocation. |
| `longitude` | Longitude returned with the resource for resource geolocation. It is used only when `latitude` is also present and both values are valid coordinates. | Number or numeric string. | Yes; number or numeric string. | No geolocation. |
| `coercevalues` | Applies backward-compatible type coercion to article values returned by the resource model. | `true` or `false`. | Yes; Boolean. | `true`. |
| `automap` | When enabled, fills missing `article.map` entries for value-carrying entries in the resource's element collection. An element `map` supplies its mapping when no article entry exists. See [Automap](#automap). | `true` or `false`. | Yes; Boolean. | `false`; becomes `true` with `form` only when `automap` is omitted. |
| `article` | Defines the record model and article data for the resource. See [Article Properties](#article-properties). | Object or array. | Yes; the result must be an object or array. | `[]`. |
| `element` | Defines the resource's elements. Each property name is an element name; its value is the element definition. | Object. | Yes; the result must be an object. Individual element properties support the expression behaviour documented in the element reference. | `{}` before element processing. |
| `form` | Loads a NetSuite form and translates its fields into elements before explicit `element` configuration is merged over them. See [Form Properties](#form-properties). | Internal ID as a number or numeric string, or a form object. | Yes; number, numeric string, or object. | Not used. |

### Automap

Set `automap: true` to generate an `article.map` entry for each value-carrying entry in the resource's element collection that lacks one. An existing `article.map` entry takes precedence. When an eligible element has its own `map`, that value becomes the article entry; otherwise Mobile derives a type-specific mapping. Element `map` values are removed from the rendered element definitions. With `form`, omitted `automap` becomes `true`; an explicit `false` remains false. Without `form`, omitted `automap` is false.

Without an element override, ordinary value elements map to their same-named field. A single Select maps `id` as `=name` and `label` as `name#`; a multi-select uses `name=[]` and `name#[]|`. File and Image generate an ID mapping and a computed `mobile/file/` URL.

The generated mapping connects element and article values. It does not prove that the named field exists on the NetSuite record or that a generic record write is available. Check current metadata and the effective article model before relying on it.

### Resource rendering request controls

The Mobile service uses the request controls `articleonly` and `elementonly` to return only an article model or one named element definition. Do not configure them as properties in a `routes/mobile` resource definition. `articleonly` accepts `true`; `elementonly` accepts an element-name string. Neither has a configuration default or a customer-facing template-tag use.

### Permission precedence

When `readonly` resolves to `true`, FSM Mobile sets `create`, `edit`, and `delete` to `false`, even when configured as `true`. When `readonly` is absent or false, each permission defaults to `true` unless explicitly set to a Boolean value.

### Resource dependencies

For `enable`, the resource remains disabled until every listed dependency is complete. For `disable`, it becomes disabled only when every listed dependency is complete. The special dependencies `"commenced"` and `"completed"` refer to the current event state. Other values refer to resource IDs selected in the same Mobile context. A prerequisite with effective `min: 0` can count as complete immediately. A positive minimum is needed when that resource's completion must control whether the tab is enabled. These conditions govern Mobile behavior, not NetSuite authorization.

## Article properties

`article` defines the record model for reading, creating, updating, or deleting the resource's articles. It can be a single model definition or an array of static article data supplied by the resource. The resource renderer applies template tags to article values before creating the model.

| Property | Description | Accepted static value | Template tags | Default |
| --- | --- | --- | --- | --- |
| `record` | NetSuite record type used by the article model. | Record type ID string, such as `"timebill"` or `"customrecord_my_record"`. | Yes; record type string. | No default. |
| `extend` | Selects the article model base. | `"models/transaction"` to use the transaction base; other values use the standard record base. | Yes; string. | Standard record base. |
| `filters` | NetSuite search filter expression used to retrieve articles. | Filter expression object or array. | Yes; filter expression. | No filters. |
| `filterby` | Values used by the model to filter or group results for a request. | Object. | Yes; object. | No filter-by values. |
| `map` | Maps NetSuite fields or formulas to article attributes and element values. | Object; each map entry uses the Mobile record-map syntax. | Yes; object. | `{}` when `automap` creates entries; otherwise no map is added. |
| `defaults` | Values used when a new NetSuite article is created. | Object. | Yes; object. | No defaults, except the parent-field default described below. |
| `parent` | NetSuite field ID that relates the article to the current event. | Field ID string. | Yes; string. | No parent link. When supplied, FSM Mobile adds a filter for the current event ID only if `article.filters` is absent. It sets this field's create default to the current event ID, replacing any configured default for the same field. |
| `resources` | Nested resource-rule definitions for this article model. The resource renderer preserves this property while resolving the rest of a nested record definition. | Array of resource rules. | Yes; array. | No nested resources. |

Article models can also use record-model capabilities supplied by the configured model implementation, such as a model-specific `sync` function. These implementation extensions are not general resource properties or a portable configuration contract.

### Parent relationship

In default Mobile resource handling, `article.parent` sets the parent default to the current event's internal ID, replacing any configured default for that key. It adds a parent filter only when `article.filters` is absent. Explicit filters must retain the intended parent restriction.

For a Case, Asset, Project or other parent that differs from the current event, omit `article.parent` and configure `article.defaults` and `article.filters` with the correct parent record ID. Filtering loaded records alone does not populate the parent link when creating a record. Supply the default or a writable mapping for that relationship.

## Form properties

Use `form` to create the element definition from a NetSuite custom form. FSM Mobile loads the form, converts the returned NetSuite fields to element definitions, then merges the configured `element` object over the generated definitions. An explicit element definition overrides the generated definition, including when the explicit element key is a regular-expression pattern.

A scalar `form` value is treated as the NetSuite custom form ID. For example:

```json
{
  "article": { "record": "customrecord_my_inspection" },
  "form": 123,
  "element": {
    "custrecord_my_notes": { "type": "textarea", "rows": 6 }
  }
}
```

When `form` is an object, it supports the sub-properties below. Other properties are passed as record-initialization values while the form loads. For example, `customform` selects a particular custom form.

| Property | Description | Accepted static value | Template tags | Default |
| --- | --- | --- | --- | --- |
| `record` | Record type whose form is loaded. | Record type ID string. | Yes; record type string. | `article.record`. |
| `customform` | NetSuite custom form internal ID used to initialize the record. | Number or numeric string. | Yes; number or numeric string. | No explicit custom form. |
| `order` | Applies the FSM user-event ordering before fields are read. | `true` or `false`. | Yes; Boolean. | `true`. |
| `options` | Loads available options for NetSuite select and multiselect fields. | `true` or `false`. | Yes; Boolean. | `true`. |
| `hidden` | Includes hidden NetSuite form fields in the generated elements. | `true` or `false`. | Yes; Boolean. | `false`. |
| `inline` | Uses a copied record, when one exists, to include Inline Text field settings that are unavailable on a new record. | `true` or `false`. | Yes; Boolean. | `true`. |
| `include` | Restricts generated elements to these NetSuite field IDs. | Array of field ID strings. | Yes; array. | All form fields, subject to exclusions. |
| `exclude` | Excludes these NetSuite field IDs from generated elements. The renderer also excludes the article `parent` field when present. | Array of field ID strings. | Yes; array. | No configured exclusions; system fields are always excluded. |
| `cache` | Reuses the generated form for the same complete form-options object during the server process. Set to `false` to load the form again. | `true` or `false`. | Yes; Boolean. | `true`. |
| Other initialization values | Values used to initialize the temporary NetSuite record whose fields are read. | Values valid for the selected record's fields. | Yes; must resolve to the field's accepted NetSuite value. | Not set. |

The complete form-options object is the form cache key. A cached form is reused only when the options match. Setting `cache` to `false` bypasses both cache retrieval and storage.

When `order` is not false, form loading may create or use the FSM user-event deployment for the selected record type. Loading forms can therefore add measurable time to a Mobile fetch.

## Form field translation

The custom-form loader translates the NetSuite field types below to base Mobile element types. It applies suffix rules to NetSuite `select` fields before normal translation. This form translation is separate from [compatibility element aliases](fsm-mobile-blocks-reference.md#other-element-types) in explicit resource configuration.

| NetSuite field type or rule | Generated Mobile element type | Generated properties or behaviour |
| --- | --- | --- |
| `checkbox` | `checkbox` | — |
| `currency` | `number` | `precision: 2`, `unit: "usd"` |
| `date` | `date` | — |
| `datetimetz` | `datetime` | — |
| `document`, or a `select` field ending `_doc` or `_document` | `file` | — |
| `float` | `number` | `precision: 8` |
| `help` | `textarea` | `map: "|"`, `readonly: true` |
| `image`, or a `select` field ending `_img` or `_image` | `image` | — |
| `inlinehtml` | `html` | `map: "|"`, `readonly: true` |
| `integer` | `number` | `precision: 0` |
| `longtext` | `textarea` | `maxlength: 1000000`, `rows: 12` |
| `multiselect` | `select` | `multiple: true`; options are included when `form.options` is not false. |
| `password` | `password` | `map: "|"` |
| `percent` | `number` | `precision: 4`, `unit: "percent"`; the generated map reads a stored fraction as a percentage and writes it as a float. |
| `phone` | `tel` | — |
| `richtext` | `signature` or `html` | A field ID matching the signature naming pattern becomes `signature`; otherwise it becomes `html` with `maxlength: 1000000` and `rows: 12`. |
| `select` | `select` | Options are included when `form.options` is not false. |
| `textarea` | `textarea` | `maxlength: 4000`, `rows: 6` |
| `text` | `text` | `maxlength: 300` |
| `timeofday` | `time` | — |
| `url` | `url` | — |

The loader does not convert unrecognised NetSuite field types into Mobile elements. Generated elements receive the normal element defaults documented in [FSM Mobile Element (Block) Reference](fsm-mobile-blocks-reference.md#element-types).

## Runtime defaults applied to every resource

The [resource properties](#resource-properties) table gives the defaults for omitted resource settings and identifies client defaults. Omitted defaults are distinct from explicit property values and article or element defaults. The [article properties](#article-properties) table gives article defaults. Resource geolocation is `null` unless both latitude and longitude are valid.

## Out-of-the-box Mobile resources

FSM Mobile includes the default resource definitions below. Only explicit resource-level settings and the article record are listed; element and article-map entries are not shown in full. Values not listed inherit the runtime defaults above. Feature-dependent resources can be hidden when the associated NetSuite feature is unavailable.

| Resource | Explicit resource-level defaults | Article record / purpose |
| --- | --- | --- |
| `inventory` | `label` only. | Inventory lookup data used by other Mobile resources. |
| `details` | `icon: "clipboard"`, `min: 1`, `max: 1`. | Current event record; captures event details. |
| `history` | `icon: "bookmark"`, `hidden` when no current or requested asset, `search: true`, `remote: true`, `readonly: true`. | Service-history data for an asset. |
| `contact` | `icon: "torso"`, `readonly: true`. | Contact and customer-contact lookup models. |
| `asset` | Hidden when no current or requested asset; `min: 1`, `max: 1`. | `customrecord_nx_asset`; shows an asset or child asset. |
| `salesorder` | `icon: "wrench"`, `max: 1`. | Sales order transaction. |
| `consumables` | `icon: "wrench"`. | Consumable usage records. |
| `times` | `icon: "clock"`; `disable: "completed"` only when Project Management is enabled. | `timebill`; time entry. |
| `expenses` | `icon: "creditcard"`, `max: 1`. | Expense report transaction. |
| `files` | `icon: "paperclip"`. | `file`; task-related uploads and attachments. |
| `notes` | `icon: "comment"`. | `note`; task-related notes. |
| `actions` | `icon: "checked"`. | Task/action article configuration. |
| `quote` | `icon: "quote"`. | Estimate/quote transaction. |
| `order` | `icon: "shoppingcart"`; hidden when Locations is unavailable. | Transfer order transaction. |
| `return` | `icon: "outbox"`; hidden when Locations is unavailable. | Return transfer order transaction. |
| `receive` | `icon: "inbox"`; hidden when Locations is unavailable. | Item receipt transaction. |


## Related topics

- [FSM Mobile Element (Block) Reference](fsm-mobile-blocks-reference.md#section-routes): element types, element properties, defaults, and mobile expressions.
- [Form Properties](#form-properties): custom-form loading, field translation, cache behaviour, and performance considerations.
