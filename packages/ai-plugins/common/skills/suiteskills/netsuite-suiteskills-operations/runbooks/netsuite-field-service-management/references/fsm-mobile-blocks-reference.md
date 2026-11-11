# FSM Mobile element (block) reference

FSM Mobile element behavior depends on account configuration. Read the section for the element or behavior you need to change.

## Section routes

- [Values and configuration conventions](#element-configuration-conventions), [expressions](#mobile-expressions-and-value-updates), [element types and aliases](#element-types), and [tables](#table-element-structure).
- [Common properties](#common-element-properties), [type-specific properties](#element-specific-properties), and [property support by type](#property-support-by-element-type).
- [Select options and values](#configuring-the-select-options-property), [Number configuration](#configuring-number-elements), [precision and steps](#number-precision-and-steps), and [units](#unit-definitions-used-by-number).
- [File and Image behavior](#file-and-image-accept-behavior), [temporal values and steps](#temporal-values-and-steps), and [validation rules](#property-validation-rules).

## Element configuration conventions

For guidance on unsupported or ineffective settings, see [Correct unsupported or ineffective configuration](configuration.md#correct-unsupported-or-ineffective-configuration).

An element's type and properties control its value, appearance, validation, and behavior. The element tables give each supported type's value format, accepted values, and default. The property tables give the properties available for each type, their accepted values and defaults, and whether they support expressions.

This reference covers configuration evaluated by FSM Mobile. Internal callbacks and temporary runtime state, such as search text or loading state, are outside its scope.

- A default is the value FSM Mobile uses when a property is omitted. FSM Mobile normalizes an invalid explicit literal according to that property, which may produce a different result. After normalization, an explicitly configured `value` takes precedence over a type default.
- A static value is a literal configuration value, not an expression. The Accepted values columns list the literals each property accepts. An FSM expression must also evaluate to an accepted value for that property.
- `null` is an explicit JSON value, distinct from the text string `"null"`. When accepted or used as a default, it means no value or no constraint, depending on the property.
- `""` is an explicit empty string, distinct from `null`. Use it only where an empty string is accepted or used as a default.
- Boolean values are the lowercase, unquoted JSON literals `true` and `false`. Quoted values such as `"true"`, `"false"`, `"True"`, or `"False"` are strings.
- An omitted property has no configured value. `undefined` is not a JSON configuration value.
- `parent` places a column element under a `table` element. Set it only on a direct child of a table, using that top-level table element’s `name`. The child belongs to each row of the parent table and does not render as a separate top-level element. Do not use `parent` to nest ordinary elements, create nested tables, or reference an element that is not `"type": "table"`.

A static `value` sets the initial default when FSM Mobile creates a record. It does not reset or replace a value on an existing record. When `value` is an expression, FSM Mobile can calculate or update it when the expression runs in its applicable default or change context. The result must be accepted for the element type.

`date` and `datetime` use the current date or date-time only when `"value"` is omitted. To leave either element blank on a new record, explicitly set `"value": ""`. This is the recommended value because it matches how these types store a blank. Although `null` and other invalid explicit literals can normalize to `""`, use `""` to request a blank: other invalid literals may fail during resource loading.

Configure Boolean properties, such as `required`, `disabled`, `hidden`, `readonly`, `multiple`, and `stepper`, with the unquoted literals `true` or `false`. Do not use quoted Boolean-looking text: it is invalid for Boolean properties and can produce unexpected behavior. A Boolean expression must also evaluate to `true` or `false`, not text.

For backward compatibility only, FSM Mobile converts the exact checkbox static `value` strings `"T"`, `"F"`, `"true"`, and `"false"` to Booleans. This exception applies only to a checkbox element's `value`. Settings such as `hidden` or `required` must use unquoted `true` or `false`. Checkbox `value` does not recognize the strings `"True"` and `"False"` either.

### Mobile expressions and value updates

Expressions must return the expected type synchronously and avoid dependency cycles. They reevaluate when directly referenced properties change. Table children use row scope, and existing saved values remain until expression dependencies change.

Keep `type` and `parent` static. Select `multiple` supports Boolean expressions, but changing the selection mode does not guarantee conversion of existing values between single-value and array forms. Repeated evaluation, wrong return types, and cycles can make forms slow or behave unexpectedly.

### Number configuration values

Use [Number precision and steps](#number-precision-and-steps) for normalization and interaction rules. The text `"any"` has no special meaning: it can be ordinary text where text is accepted, but `"step": "any"` normalizes to `null`, leaving no increment. Omit `step` or use a positive number such as `0.01`. `"precision": null` normalizes to `8`; use an integer from `0` through `8`. Invalid static values can affect element behavior. An expression for either property must return a valid value.

## Element types

For each element that stores a value, the table gives the format and accepted static values for its `"value"` property, plus the default used when `"value"` is omitted for a new record. To override a type default, set `"value"` to an accepted static value or an expression. The display-only `heading` element has no `"value"` property.

| Type | Customer-facing description | Value property format | Accepted static value | Default value for a new record |
| --- | --- | --- | --- | --- |
| `checkbox` | A checkbox for a true or false value. | Boolean | `true`, `false` | `false` |
| `date` | A calendar date. | String (`YYYY-MM-DD`) | A valid canonical date, `""`, `null`, or a date string that NetSuite can parse using the current user’s date format. Non-canonical static values are normalized to `YYYY-MM-DD`. | Current date. To leave the value blank on a new record, set `"value": ""`. |
| `datetime` | A date and time. | String (`YYYY-MM-DD HH:mm:ss`)   | A valid canonical date and time, `""`, `null`, or a date-time string that NetSuite can parse using the current user’s date and time format. Non-canonical static values are normalized to `YYYY-MM-DD HH:mm:ss`. | Current date and time. To leave the value blank on a new record, set `"value": ""`. |
| `email` | A single-line email address field with a basic input-format check. | String | Text. The editable input flags values that do not match `^[^@]+@[^@]+\.[^@]+$`. Configure `pattern` when the format must be enforced by article validation. | `""` |
| `file` | A file upload and download field. | File object | A file object supplied by the Mobile upload flow, or `null`. | `null` |
| `heading` | A display-only section heading whose text comes from `label`, not `value`. | None | Not applicable. | Not applicable. |
| `html` | An HTML-content field. Read-only mode renders the value as HTML; editing uses multi-line text. | String | HTML or plain text. | `""` |
| `image` | An image capture or upload field. | Image/file object | An image object supplied by the Mobile upload or camera flow, or `null`. | `null` |
| `number` | A numeric field, optionally formatted with a unit. | Number | Any numeric value. Set the lower and upper limits with `min` and `max`, require a fixed increment such as 0.25 with `step`, and set the decimal places users can enter and see with `precision`. | `null` |
| `password` | A masked single-line text field. | String | Any text; apply `pattern` to constrain it. | `""` |
| `select` | A list where users select one or more options. | Object, or array of objects | One `{ id, label }` option object; an array of option objects when `multiple` is `true`. | `null`, `[]` for multi-select, or selected/auto-selected option(s) |
| `signature` | A signature capture field. | String | A signature value supplied by the Mobile signature capture flow. | `""` |
| `table` | A container for repeating rows and the only supported parent element type. Set each direct child column element’s `parent` to this table's `name`. | Array of objects | An array of row objects whose keys are the names of the table’s column elements. | `[]` |
| `tel` | A single-line telephone field. | String | Any text; apply `pattern` to constrain it. | `""` |
| `text` | A single-line text field. | String | Any text; apply `maxlength` and `pattern` to constrain it. | `""` |
| `textarea` | A multi-line plain-text field. | String | Any text; apply `maxlength` to constrain it. | `""` |
| `time` | A time of day. | String (`HH:mm:ss`) | A valid canonical time, `""`, `null`, or a time string that NetSuite can parse using the current user’s time format. Non-canonical static values are normalized to `HH:mm:ss`. | `""` |
| `url` | A web-link field. `text` can supply the read-only link text. | String | Any text; apply `pattern` to constrain it. | `""` |

### Other element types

When FSM Mobile loads these aliases or backward-compatible types, it resolves them to the listed base element types and applies the generated properties and values at runtime. The alias can stay in the configuration; FSM Mobile does not write the generated properties back to it.

For new configuration, use the base element type and set the required properties explicitly.

| Alias or compatibility element type | Base element type | Generated properties or behavior |
| --- | --- | --- |
| `integer` | `number` | `"precision": 0` |
| `float` | `number` | `"precision": 8` |
| `currency` | `number` | `"precision": 2`; `"unit": "usd"` |
| `percent` | `number` | `"precision": 4`; `"unit": "percent"`; `"map": "formulanumeric:{fieldId}*100\|fieldId[float]"`. It reads the stored fraction as a percentage value and writes through as a float. |
| `help` | `textarea` | `"map": "\|"`; `"readonly": true` |
| `longtext` | `textarea` | `"maxlength": 1000000`; `"rows": 12` |
| `inlinehtml` | `html` | `"map": "\|"`; `"readonly": true` |
| `richtext` | `signature` or `html` | A field ID that matches the signature naming pattern becomes `signature`; otherwise it becomes `html` with `"maxlength": 1000000` and `"rows": 12`. |
| `multiselect` | `select` | `"multiple": true` |
| `phone` | `tel` | No additional properties. |
| `document` | `file` | No additional properties. |
| `datetimetz` | `datetime` | Uses the `datetime` default `"step": 1`. |
| `timeofday` | `time` | Uses the `time` default `"step": 60`. |
| `datalist` | `text` | Deprecated compatibility type. It is hidden and uses `"map": "\|"`; do not use it for new configuration. |
| Unsupported type, for example `hidden` | `text` | Compatibility fallback. It is hidden; do not use it as an element type. |

`float` and `percent` resolve with the fixed precisions shown in the table; they do not receive a generated `step`. For new Number configuration, use a positive numeric `step` where an increment is required.

### Table element structure

Define a top-level table element, followed by its direct child column elements. Each child uses the table's `name` as its `parent`. The table provides the parent and row structure; the child definitions describe the values stored in each row. Do not assign `parent` to a non-table element or to another table.

```json
[
  { "name": "materials", "type": "table", "label": "Materials" },
  { "name": "description", "parent": "materials", "type": "text", "label": "Description" },
  { "name": "quantity", "parent": "materials", "type": "number", "label": "Quantity", "min": 0, "step": 1 }
]
```

The stored table value is an array of row objects, for example:

```json
{
  "materials": [
    { "description": "Filter", "quantity": 2 }
  ]
}
```

FSM Mobile finds children by matching the `parent` string and does not separately reject a missing or non-table parent during normalization. Only a `table` element uses those children as columns and iterates their row values. A non-table or missing parent is therefore unsupported and can prevent the element from rendering or being validated in the intended table context.

## Element properties

Properties control an element’s label, stored value, validation, input behavior, and other settings. All elements except the display-only `heading` support the common properties, plus only the additional properties listed for their type. The `heading` element supports only the limited set listed in the tables.

### Common element properties

Every element except the display-only `heading` supports these common properties. The [property support table](#property-support-by-element-type) lists the limited set supported by `heading`.

| Property | Description | Format type | Accepted values | Expressions | Default |
| --- | --- | --- | --- | --- | --- |
| `type` | The element type. | String | One of the types in [Element types](#element-types). Invalid or omitted types are treated as `text`. | No: structural | `text` |
| `name` | Stable identifier used to store and reference the element value. | String | A unique element identifier within its form or table. | No: structural | No default; configure it. |
| `parent` | Identifies the parent table that owns this column element. | String | The `name` of a top-level `table` element. The named parent must be `"type": "table"`; omit this property for top-level elements. | No: structural | Omitted (top-level element) |
| `value` | Sets a static default for a new record or a value calculated by an expression. A static value does not replace the saved value when an existing record opens. | Type-specific | See the element’s format type in [Element types](#element-types). | Yes: result must match the element format. | Type-specific; see the element table. |
| `label` | Label shown with the element. | String | Any display text. | Yes: String result. | `""` |
| `required` | Requires a non-empty accepted value before the form can be completed. | Boolean | `true`, `false` | Yes: Boolean result. | `false` |
| `disabled` | Displays the element but prevents user input. | Boolean | `true`, `false` | Yes: Boolean result. | `false` |
| `hidden` | Does not display the element. | Boolean | `true`, `false` | Yes: Boolean result. | `false` |
| `readonly` | Displays the value without allowing edits. | Boolean | `true`, `false` | Yes: Boolean result. | `false` |
| `class` | Additional supported style class token(s). Use only documented styling tokens. | String | A supported class token string. | Yes: String result. | `""` |

### Element-specific properties

These properties supplement the common properties. Each applies only to its listed types.

| Property | Description | Supported types | Accepted values | Expressions | Default |
| --- | --- | --- | --- | --- | --- |
| `accept` | Sets the file-type filter shown by the browser file picker. | `file`, `image` | Comma-separated file extensions or MIME-type specifiers. Configure, for example, `"accept": ".pdf,.docx"` or `"accept": ".jpg,.jpeg,.png"`. | Yes: String result. | `file`: omitted, so no picker filter. `image`: `.bmp,.gif,.jpg,.jpeg,.pjpg,.pjpeg,.png,.tiff,.tif` |
| `autoselect` | Selects the only option automatically when no option is marked selected. Applies only to single-select lists. | `select` | `true`, `false` | Yes: Boolean result. | `false` |
| `barcode` | Enables device barcode scanning where the device/browser can provide camera access. | `select`, `text` | `true`, `false` | Yes: Boolean result. | `false` |
| `camera` | Enables image capture from the device camera. | `image` | `true`, `false` | Yes: Boolean result. | `false` |
| `column` | Controls whether a table child appears in the column list and where it appears. | Any direct child of a `table` element | Include the property with a number, for example `"column": 1`, to include and order the column. Omit the property to exclude the child from the column list. `null` still counts as a configured column property. | No: table structure | Omitted unless resource normalization adds a column position for a visible element. |
| `cols` | Sets the visible text width. | `html`, `textarea` | Positive integer. | Yes: positive integer result. | `null` |
| `downsample` | Sets the maximum width or height, in pixels, for supported bitmap images before upload. FSM Mobile preserves the image proportions. This is not a file-size limit. | `file`, `image` | Positive whole-number pixel value, for example `1080`. | Yes: positive integer result. | Resource `imagesize` value; standard mobile default is `1080` pixels. |
| `height` | Sets the signature input height. | `signature` | Positive pixel value. | Yes: positive integer result. | `148` pixels |
| `level` | Sets the heading level. | `heading` | `1`, `2`, `3` | Yes: integer result from `1` through `3`. | `1` |
| `max` | Sets the maximum permitted value. | `date`, `datetime`, `number`, `time` | Number for `number`; otherwise the canonical value format for that type. | Yes: result must match the element type. | `null` |
| `maxlength` | Sets the maximum character count. | `html`, `text`, `textarea` | Positive integer. | Yes: positive integer result. | `null` |
| `maxsize` | Sets the client-side size limit in KB for non-bitmap files selected through a File element. Image elements do not apply it. File elements down-sample recognized bitmaps, which bypass this limit. | `file`, `image` | Positive whole-number KB value. | Yes: positive integer result. | `10240` KB (10 MB). The Image input does not apply this value. |
| `min` | Sets the minimum permitted value. | `date`, `datetime`, `number`, `time` | Number for `number`; otherwise the canonical value format for that type. | Yes: result must match the element type. | `null` |
| `multiple` | Allows more than one option to be selected. | `select` | `true`, `false` | Yes: Boolean result. | `false` |
| `options` | Defines the options that a Select element presents. | `select` | A static list is an array of option objects. A configured option source or expression must resolve to an array of option objects. See [Configuring the Select `options` Property](#configuring-the-select-options-property). | Yes: array result. | `[]` |
| `pattern` | Checks input against a regular expression during article validation. The editable Email input keeps its built-in live email-format check, which a configured pattern does not replace. | `email`, `password`, `tel`, `text`, `url` | Valid regular-expression source string. | Yes: valid regular-expression String result. | `""` (no configured pattern validation) |
| `placeholder` | Displays hint text when the field has no value. | `email`, `html`, `password`, `select`, `tel`, `text`, `textarea`, `url` | String. | Yes: String result. | `""` |
| `precision` | Sets the maximum decimal places in the editable control and display when no unit precision or `step` display precision applies. | `number` | Whole number from `0` through `8`. | Yes: whole-number result from `0` through `8`. | `8` |
| `remote` | Retrieves Select options remotely rather than supplying them only through `options`. | `select` | `true`, `false` | Yes: Boolean result. | `false` |
| `rows` | Sets the visible text height. | `html`, `textarea` | Positive integer. | Yes: positive integer result. | `3` |
| `search` | Enables searching in the Select list. | `select` | `true`, `false` | Yes: Boolean result. | `false` |
| `step` | Sets the permitted increment. | `date`, `datetime`, `number`, `time` | Positive number for `number`; positive whole number for date/time values. Date uses days; datetime and time use seconds. | Yes: result must meet the type-specific increment rule. | `null` for `date` and `number`; `1` for `datetime`; `60` for `time` |
| `stepper` | Shows numeric increment and decrement controls. | `number` | `true`, `false` | Yes: Boolean result. | `false` |
| `text` | Provides display text for a read-only URL. The URL remains the `value`. | `url` | String. | Yes: String result. | `""` |
| `unit` | Selects the unit used for number display formatting. | `number` | Unit identifier string. | Yes: String result. | `""` |
| `width` | Sets the signature input width. | `signature` | Positive pixel value. | Yes: positive integer result. | `448` pixels |

### File and Image `accept` behavior

Use `accept` to filter the file types shown in the device's file picker. Set it to a comma-separated string of extensions or MIME-type specifiers, as in these examples.

```json
{
  "name": "attachment",
  "type": "file",
  "accept": ".pdf,.docx,.xlsx"
}
```

```json
{
  "name": "photo",
  "type": "image",
  "accept": ".jpg,.jpeg,.png"
}
```

| Element type | Default picker filter | Effect of an explicit `accept` value |
| --- | --- | --- |
| `file` | No filter. | Replaces the no-filter default with the configured picker filter. |
| `image` | `.bmp,.gif,.jpg,.jpeg,.pjpg,.pjpeg,.png,.tiff,.tif` | Replaces the default picker filter when the user selects an existing file. If `"camera": true`, FSM Mobile uses `image/*` for the camera selection path instead. |

`downsample` works independently of `accept`. It down-samples only PNG, JPG/JPEG, GIF, and BMP uploads and does not convert other image formats. The limit applies to bitmap dimensions, not bytes. Image elements do not enforce `maxsize`. File elements down-sample recognized bitmaps, which bypass that size limit.

`accept` filters the browser file picker only; it does not validate uploads. Depending on the device and browser, users can still select files outside the configured or default filter. FSM Mobile does not check the selected file against `accept` before displaying it in the element or sending it for upload. Configure `accept` to guide users, but do not rely on it to prevent unsupported file types from reaching the upload process.

This limitation can affect `.webp` files even when `accept` is omitted. Although `.webp` is outside the default Image picker filter, a device or browser can still return a WebP file to the Image element. FSM Mobile then displays and uploads it without conversion or image-specific processing. The File Cabinet upload path has no WebP type mapping and falls back to `MISCBINARY`, so the upload can fail with an invalid `MISCBINARY` file type. WebP support requires a product or integration change to convert the image or map it to a supported File Cabinet type.

### Property support by element type

**C** means the type supports all [common properties](#common-element-properties): `type`, `name`, `parent`, `value`, `label`, `required`, `disabled`, `hidden`, `readonly`, and `class`. The third column lists additional properties supported by that type. The `heading` element supports only the properties in its row, without the common set. Any direct table child can also use `column`. A dash means the type has no additional properties.

| Type | Common properties | Supported type-specific properties |
| --- | --- | --- |
| `checkbox` | **C** | — |
| `date` | **C** | `min`, `max`, `step` |
| `datetime` | **C** | `min`, `max`, `step` |
| `email` | **C** | `pattern`, `placeholder` |
| `file` | **C** | `accept`, `downsample`, `maxsize` |
| `heading` | Not supported | `type`, `name`, `parent`, `label`, `level`, `hidden` |
| `html` | **C** | `rows`, `cols`, `maxlength`, `placeholder` |
| `image` | **C** | `accept`, `camera`, `downsample`, `maxsize` |
| `number` | **C** | `min`, `max`, `precision`, `step`, `stepper`, `unit` |
| `password` | **C** | `pattern`, `placeholder` |
| `select` | **C** | `multiple`, `autoselect`, `barcode`, `options`, `placeholder`, `remote`, `search` |
| `signature` | **C** | `width`, `height` |
| `table` | **C** | No additional properties. Only this element type supports children. Direct child column elements use its `name` in `parent`. |
| `tel` | **C** | `pattern`, `placeholder` |
| `text` | **C** | `barcode`, `maxlength`, `pattern`, `placeholder` |
| `textarea` | **C** | `maxlength`, `rows`, `cols`, `placeholder` |
| `time` | **C** | `min`, `max`, `step` |
| `url` | **C** | `pattern`, `placeholder`, `text` |

### Configuring the Select `options` property

The `options` property of a `select` element defines the choices shown to users. `options` holds a list, not the selected value or a single option ID. The element's `value` is selected from that list.

You can supply that list in three ways:

- Set a static array of option objects directly on the element.
- Set an expression that returns an array of option objects. It can reuse or filter another element or resource's option list, such as `consumable.options`.
- Set a NetSuite search definition that identifies the record to search and the fields for option IDs and labels. FSM Mobile runs the search and converts the results to an option array at runtime.

In all three cases, `options` must resolve to an array of option objects. Set a static `value` or a `value` expression separately to choose the initial selected option or options.

#### NetSuite search-based option source

This Select element searches active Asset records using the text entered in the Select search interface. It maps each matching record to an option:

```json
"asset": {
  "type": "select",
  "label": "Asset",
  "search": true,
  "remote": true,
  "options": {
    "record": "customrecord_nx_asset",
    "filters": [
      ["isinactive", "is", "F"],
      "and",
      [
        "formulatext:{name}||' '||nvl(trim({custrecord_nx_asset_customer.firstname}||' '||{custrecord_nx_asset_customer.lastname}),{custrecord_nx_asset_customer.companyname})",
        "contains",
        "${ options.search || '' }"
      ]
    ],
    "map": {
      "id": "internalid",
      "label": "name",
      "optgroup": "formulatext:nvl(trim({custrecord_nx_asset_customer.firstname}||' '||{custrecord_nx_asset_customer.lastname}),{custrecord_nx_asset_customer.companyname})",
      "customer": {
        "id": "custrecord_nx_asset_customer",
        "label": "formulatext:nvl(trim({custrecord_nx_asset_customer.firstname}||' '||{custrecord_nx_asset_customer.lastname}),{custrecord_nx_asset_customer.companyname})"
      }
    }
  }
}
```

`record` and `filters` define the NetSuite search. `map` converts each matching result to an option object and must produce both `id` and `label` for FSM Mobile to use it as a Select option. The map can also add properties. Here, `optgroup` controls the group shown in the Select list, and `customer` retains related customer data for expressions that use `asset.options`.

An expression-based option source must also return an array of objects containing `id` and `label`. It can return or filter another element's option list, such as `consumable.options`. Additional mapped properties stay in the option array; after selection, the Select element's `value` retains only `id` and `label`.

Each option requires an `id` and a `label`. Use a unique string `id` within the option list. The `label` is the text shown to the user.

| Option property | Required | Accepted value | Behavior |
| --- | --- | --- | --- |
| `id` | Yes | String | Identifies the option. FSM Mobile stores this value in the Select element's `value`. |
| `label` | Yes | String | Text displayed for the option. FSM Mobile stores this value in the Select element's `value`. |
| `selected` | No | `true`, `false` | Marks an option as a default candidate for a new record. For a single-select element, configure only one selected option. For a multi-select default, use the element's `value` property with an array of `{ id, label }` objects. |
| `optgroup` | No | String | Places the option under a named group heading in the list. |
| `disabled` | No | `true`, `false` | Displays the option but prevents the user from selecting it. |
| Additional string property, such as `altname` | No | String | Stores additional information with the option. When `search` is enabled, FSM Mobile searches every string-valued option property, including this one. |

#### Select defaults and stored values

When `value` is omitted for a new single-select record, an option marked selected supplies the initial value. If none is selected, `autoselect` is `true`, and the list contains exactly one option, FSM Mobile selects it. Otherwise, the initial value is `null`. For a multi-select element, the empty initial value is `[]`.

An explicitly configured `value` takes precedence over option defaulting. A Select value retains only the selected option's `id` and `label`; it does not retain `selected`, `optgroup`, `disabled`, `altname`, or any other additional option property. Use an expression that looks up the selected `id` in `options` when another option property is needed.

#### Option search behavior

The `search` property controls the Select search interface. For local options, FSM Mobile compares the search text with every string-valued property on each option, including properties it does not display. A property such as `altname` can therefore make an option searchable without changing its label. When an element uses a NetSuite search definition and `remote` is `true`, FSM Mobile retrieves matching options on demand.

### Configuring Number elements

`number` is the base numeric element type and stores a numeric value. `integer`, `float`, `currency`, and `percent` are compatibility aliases that resolve to Number; [form field translation](fsm-mobile-resource-properties-reference.md#form-field-translation) is a separate path. There is no separate `decimal` element type. Use the supported Number properties to configure the required number pattern.

| Usage pattern | Recommended configuration | Result |
| --- | --- | --- |
| Whole numbers | `"precision": 0`, `"step": 1`; optionally `"stepper": true`. Set `min` and `max` where the range is known. | Limits entry and display to whole numbers. |
| Decimal measurements | Set `precision` to the required displayed decimal places and `step` to the smallest permitted increment, such as `0.25`. | Supports decimal entry and enforces the increment. |
| Currency | Set `unit` to a configured currency unit, such as `usd`; use the unit definition’s prefix/suffix and precision, commonly 2. Use a matching `step`, commonly `0.01`. | Formats the value using the unit definition, for example a `$` prefix and two decimal places. |
| Percentage | Set `unit` to a configured percentage unit, such as `percent`; use `precision`/`step` appropriate for the accepted percentage value. | Adds the configured percent suffix. The mobile renderer formats the stored number directly; it does not inherently convert a fraction such as `0.8554` to `85.54%`. |
| Data size | Set `unit` to a unit definition with `multiple`, for example `byte` with `"multiple": 1024`, a `B` suffix, and precision 0. | Read-only rendering scales values through K, M, and G prefixes as appropriate. |
| Other measurements | Set `unit` to another configured unit identifier, such as a temperature unit, and define its suffix, prefix, and precision. | Uses the configured formatting while storing a number. |

### Number property detail

The [element-specific properties table](#element-specific-properties) lists Number property types and defaults. A Number `value` is numeric; resource normalization also coerces numeric strings, but use a JSON number such as `1.25` in new configuration. `min` and `max` are inclusive numeric limits. `precision: 0` prevents decimal entry. `stepper` displays controls with a valid step and does not itself change validation. `unit` selects a formatting profile, not a value conversion; an unrecognised key leaves unadorned formatting. Units do not set `value`, `min`, `max`, `step`, or `stepper`.

### Number precision and steps

The default Float, Percent, Currency, Integer, and generic Number mappings have precision 8, 4, 2, 0, and 8 respectively. None supplies a default `step`. A literal `precision` must be an integer from 0 through 8; resource normalization replaces any other literal, including `null`, with 8. Precision limits decimal entry and display but does not validate the stored number or pad trailing zeros.

FSM Mobile retains a positive numeric `step`. A missing, nonnumeric, zero, or negative step becomes `null`.

Effective precision comes first from a configured unit's precision, then from a positive numeric `step`, then from the element's precision. An integral step supplies zero decimal places. A fractional step supplies the number of decimal places in its numeric form, even without stepper controls.

A positive Number `step` validates multiples from zero, while `min` separately sets the lower bound. For example, `1.20` has two decimal places but fails `step: 0.25`, while `1.25` passes.

With a valid positive numeric step, `stepper: true` shows plus and minus controls. Each action starts from the current value, or zero when empty, adds or subtracts the step, rounds to effective precision, and follows the normal change flow. It does not clamp the result to `min` or `max`; those bounds produce validation errors.

Editable Number fields reject extra decimal digits during entry and truncate an existing value to effective precision when formatting it. Read-only fields round before display: at precision 2, `1.256` appears as `1.25` when editable and `1.26` when read-only. Neither presentation pads trailing zeros.

A unit precision coarser than the step can make a stepper action appear unchanged. Setting `stepper: true` with a missing or invalid step can produce `NaN`. A fractional step written in exponential notation can infer precision 0, and a read-only table column does not receive step-derived precision.

NetSuite Percent fields can store more than four decimal places and may rewrite an unchanged value to four on edit and save. JavaScript number accuracy becomes unreliable beyond roughly 15 significant digits.

### Unit definitions used by Number

`unit` identifies a named formatting profile. It is not a separate element type and does not convert the stored number. FSM Mobile looks up the key in the mobile configuration's `"units"` collection and, when a definition exists, uses its formatting members to render the Number element.

A unit definition does not set the Number element's `min`, `max`, `step`, `stepper`, or `value`. If the unit definition includes `precision`, it takes precedence over the element's `precision` and any precision inferred from `step`. The resulting precision applies to both the editable Number control and its display.

The default mobile route provides definitions such as:

```json
{
  "usd": { "prefix": "$", "precision": 2 },
  "percent": { "suffix": "%" },
  "byte": { "suffix": "B", "precision": 0, "multiple": 1024 },
  "celsius": { "suffix": "°C" }
}
```

To add an account-specific unit, add a key to the mobile configuration's `"units"` collection and set the Number element's `"unit"` property to that key. For example:

```json
{
  "jpy": { "prefix": "¥", "precision": 0 },
  "kilogram": { "suffix": " kg", "precision": 2 }
}
```

With these definitions, `"unit": "jpy"` displays a whole-number amount with a yen prefix, and `"unit": "kilogram"` displays a value such as `2.5 kg`. The stored values remain numbers; the unit does not convert yen, kilograms, or any other value to a different base value.

Unit-definition members are settings read directly by the mobile Number renderer. They are not Number-element properties.

| Unit member | Configuration guidance | Effect |
| --- | --- | --- |
| `prefix` | String | Added before the displayed number. |
| `suffix` | String | Added after the displayed number. |
| `precision` | Use a whole number from `0` through `8`, consistent with the Number element's `precision` property. | Overrides the element’s `precision` and `step`-derived precision for the editable control and display. |
| `multiple` | Use a positive numeric factor greater than `1`, such as `1024` for bytes. | Enables magnitude scaling in read-only mode. The renderer repeatedly divides the displayed value by this factor and adds K, M, or G before the suffix. The stored value and editable entry do not change. |

The Celsius suffix is the two-character text `°C`: Unicode degree sign `°` (U+00B0), followed by uppercase `C`. Use that literal text in JSON. Do not use the HTML entity `&deg;C`, because unit suffixes are rendered as text rather than decoded as HTML.

Available unit identifiers, including `usd` and `percent`, depend on account configuration and can include custom keys. The default USD unit supplies precision 2, the Percent unit supplies a suffix without precision, and the Byte unit supplies precision 0 for unscaled values. A Byte value scaled to KB, MB, or GB for read-only display uses precision 2.

### Temporal values and steps

Runtime temporal formats are `YYYY-MM-DD`, `HH:mm:ss`, and `YYYY-MM-DD HH:mm:ss`, regardless of display locale. An omitted date or datetime can default to now; an explicit empty string leaves it blank. Expression and template outputs must match the canonical formats.

Date step validation uses `min` when supplied and the type's epoch otherwise. Resource-completion validation uses `min` or the type's epoch for Time and DateTime. The Mobile editor's Save validation measures Time steps from midnight even when `min` is set. It may not reliably reject canonical DateTime values that are off-step.

### Property validation rules

FSM Mobile validates a value against these rules when the relevant properties are configured:

- `required` rejects an empty value. A checkbox is always considered to have a value, so `required` does not require it to be checked.
- `min`, `max`, and `step` apply to `number`, `date`, `datetime`, and `time`. See [Number precision and steps](#number-precision-and-steps) and [temporal values and steps](#temporal-values-and-steps) for the validation bases and differences between Mobile editor Save and resource completion.
- `precision` limits decimal entry in the Number control and formats the displayed value, but it does not add a stored-value validation rule.
- `maxlength` validates `text`, `textarea`, and `html`.
- `pattern` validates `email`, `password`, `tel`, `text`, and `url`.
- A select's value is an option object (or an array of them when `"multiple": true`), not just an option identifier.
