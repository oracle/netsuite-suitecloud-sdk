---
name: netsuite-uif-spa-reference
description: "Use when building, modifying, or debugging NetSuite UIF SPA components. Provides API/type lookup for `@uif-js/core` and `@uif-js/component` (constructors, methods, props, enums, hooks, and component options)."
license: The Universal Permissive License (UPL), Version 1.0
metadata:
  author: Oracle NetSuite
---

# NetSuite UIF Reference

Complete type definitions for `@uif-js/core` and `@uif-js/component`, the two packages that power NetSuite SPA (single-page application) user interfaces.

## When to Use

- Building or modifying a UIF SPA component (JSX files)
- Looking up the exact API for a UIF class (Date, ArrayDataSource, Router, etc.)
- Checking available props/methods on UIF components (DataGrid, StackPanel, Button, etc.)
- Debugging runtime errors from UIF framework code
- Verifying enum values (for example, `Button.Hierarchy`, `GapSize`, `DataGrid.ColumnType`)
- Understanding UIF Date vs. Native Date behavior

## Reference Data

The type definitions are located in the `references/` subdirectory.

| File | Package | Contents |
|------|---------|----------|
| `references/core.d.ts` | `@uif-js/core` | Core framework: Date, ArrayDataSource, Ajax, Router, useState, useEffect, Context, etc. |
| `references/component.d.ts` | `@uif-js/component` | UI components: DataGrid, StackPanel, Button, Text, Badge, Heading, Card, ContentPanel, Modal, etc. |

## Lookup Instructions

To find information about a specific class or component:

1. **Search by class name**:
   ```
   Search for `class Date` in the local `references/` directory.
   ```

2. **Search by method name**:
   ```
   Search for `lastOfMonth`, `firstOfMonth`, or `addDay` in `references/core.d.ts`.
   ```

3. **Search by enum**:
   ```
   Search for `enum GapSize`, `enum Hierarchy`, or `enum Type` in `references/component.d.ts`.
   ```

4. **Read a section**: Once you find the line number, open that part of the file to view the full definition.

## Key Classes Quick Reference

### @uif-js/core

| Class | Purpose | Key Members |
|-------|---------|-------------|
| `Date` | UIF date wrapper | `.year`, `.month` (0-indexed), `.day`, `.firstOfMonth()`, `.lastOfMonth()`, `.addDay()`, `.addMonth()`, `.stripTime()`, `.toDate()` (→ native), `Date.now()`, `Date.today()` |
| `ArrayDataSource` | Data provider for grids | `ArrayDataSource<T>` – constructor takes `T[]` |
| `Ajax` | HTTP client | `Ajax.post()`, `Ajax.get()`, `Ajax.DataType`, `Ajax.ResponseType` |
| `Router` | SPA routing | `Router.Routes`, `Router.Route`, `Router.Hash`, `Router.Path` |
| `useState` | State hook | `useState(initialValue)` → `[value, setter]` |
| `useEffect` | Effect hook | `useEffect(callback, deps)` |
| `useContext` | Context hook | `useContext(contextName: string)` – takes a string, for example, `ContextType.ROUTER_LOCATION` |
| `Context` | Context provider | `Context.Provider`, `Context.Consumer` |
| `ContextType` | Context type string constants | `ContextType.ROUTER_LOCATION`, `ContextType.ROUTER_NAVIGATION`, `ContextType.ROUTER_ROUTE`, `ContextType.I18N`, `ContextType.PREFERENCES`, `ContextType.FOCUS_MANAGER`, `ContextType.STORE` – full list: 31 values; search for `ContextType` in `core.d.ts` |
| `useCallback` | Memoized callback | `useCallback(fn, deps)` – prevents unnecessary re-renders |
| `useMemo` | Memoized value | `useMemo(() => compute(), deps)` |
| `useRef` | Mutable ref container | `useRef(initialValue)` – `.current` persists across renders |
| `Translation` | i18n support | `Translation.get('key')` for localized strings |
| `Store` | Redux-like state container | `Store.create({ reducer, initial })`; factory; `Store.Provider` – wrap the tree in JSX; `useSelector(fn)` – select slice; `useDispatch()` – dispatch actions |
| `Reducer` | Creates typed reducers | `Reducer.create(handlers)`; action handler map; `Reducer.combine([{path, reduce}])` – combine reducers (takes array, not plain object) |
| `useDispatch` | Dispatch hook | `var dispatch = useDispatch()`; dispatches Store actions; requires `Store.Provider` ancestor |
| `useSelector` | State selector hook | `var value = useSelector(function(state) { return state.data; })` – selects state slice from Store |
| `CancellationTokenSource` | Async operation cancellation | `new CancellationTokenSource()` → `var token = source.token` (pass to async fn), `source.cancel()` (call in useEffect cleanup) |
| `CancellationToken` | Cancellation check | `token.cancelled`; check before updating state in async callbacks |
| `TreeDataSource` | Hierarchical grid/tree data | `new TreeDataSource({ data, childAccessor: fn })`; `fn` receives item, returns children array (or pass string property name). Use with `DataGrid.ColumnType.TREE` or `TreeView` |
| `LazyDataSource` | On-demand data loading | `new LazyDataSource(() => fetch().then(data => new ArrayDataSource(data)))` – wraps any async data load. `.load()` triggers load; `.loaded` checks status. Use with DataGrid `paging` for server-side pagination |
| `ImmutableArray` | Immutable array helpers | `ImmutableArray.push(arr, item)`, `ImmutableArray.remove(arr, item)`, `ImmutableArray.set(arr, index, item)`, `ImmutableArray.filter(arr, fn)`, `ImmutableArray.EMPTY`; all return new arrays |
| `ImmutableObject` | Immutable object helpers | `ImmutableObject.set(obj, 'key', value)`, `ImmutableObject.merge(obj, partial)`, `ImmutableObject.remove(obj, 'key')`; all return new objects |
| `FormatService` | Locale-aware type formatting | `FormatService.forI18n(i18n).format(date, Format.DATE)`; converts UIF Date to display string. `Format` enum: `DATE`, `DATE_TIME`, `TIME`, `INTEGER`, `FLOAT`. Get `i18n` via `useContext(ContextType.I18N)` |
| `SystemIcon` | System icon constants (277) | `SystemIcon.ADD`, `SystemIcon.EDIT`, `SystemIcon.DELETE`, `SystemIcon.FILTER`, `SystemIcon.HOME`, `SystemIcon.SEARCH`, `SystemIcon.SETTINGS`, `SystemIcon.SAVE`, `SystemIcon.CLOSE`, `SystemIcon.ALERT`, `SystemIcon.CALENDAR`, `SystemIcon.DOWNLOAD_DOCUMENT`, `SystemIcon.UPLOAD_DOCUMENT`, `SystemIcon.PERSON` – search for `SystemIcon` in `core.d.ts` for full catalog |
| `RecordIcon` | NetSuite record icons (43) | `RecordIcon.CUSTOMER`, `RecordIcon.EMPLOYEE`, `RecordIcon.INVOICE`, `RecordIcon.SALES_ORDER`, `RecordIcon.CONTACT`, `RecordIcon.ITEM`, `RecordIcon.CASE`, `RecordIcon.TASK` |
| `EventBus` | Pub/sub event bus | `eventBus.subscribe(sender, listener)`, `eventBus.publish(event)` – for decoupled cross-component communication without prop-drilling or shared state |
| `KeyCode` | Keyboard key constants (101) | `KeyCode.ENTER`, `KeyCode.ESCAPE`, `KeyCode.TAB`, `KeyCode.BACKSPACE`, `KeyCode.SPACE`, `KeyCode.ARROW_DOWN`, `KeyCode.ARROW_UP`, `KeyCode.F1`–`KeyCode.F12`, `KeyCode.A`–`KeyCode.Z`, `KeyCode.NUM_0`–`KeyCode.NUM_9` |

### @uif-js/component

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `DataGrid` | Table/grid display | `dataSource`, `columns`, `columnStretch`, `rootStyle`, `dataRowHeight`, `highlightRowsOnHover` |
| `StackPanel` | Layout container | `orientation`, `itemGap`, `outerGap`, `alignment` |
| `Button` | Clickable button | `label`, `action`, `enabled` (not `disabled` – constructor-only). Enums: `Button.Hierarchy`: PRIMARY/SECONDARY/DANGER; `Button.Type`: DEFAULT/PRIMARY/PURE/EMBEDDED/GHOST/DANGER/LINK; `Button.Size`: SMALLER/SMALL/MEDIUM/LARGE; `Button.Behavior`: DEFAULT/TOGGLE |
| `Text` | Text display | `type` (WEAK, STRONG, etc.) |
| `Badge` | Status badges | `label`, `classList` (single class only!) |
| `Heading` | Section headings | `type` (LARGE_HEADING, MEDIUM_HEADING, etc.) |
| `Card` | Card container | Content wrapper |
| `ContentPanel` | Content wrapper | `outerGap`, `horizontalAlignment` |
| `ApplicationHeader` | Page header | `title` |
| `Modal` | Dialog overlay | `title`, `size` (DEFAULT/SMALL/MEDIUM/LARGE), `rootStyle`, `owner`, `content`, `closeButton` |
| `Loader` | Loading spinner | `label` |
| `GridPanel` | CSS Grid layout | `columns`, `defaultColumnWidth`, `gap`; prefer over horizontal StackPanel |
| `ScrollPanel` | Scrollable container | `orientation` – requires bounded parent height |
| `NavigationDrawer` | Vertical nav | `selectedValue`, items with `route`, `icon`, `label` |
| `Dropdown` | Select input | `dataSource`, `selectedValue`, `onSelectedValueChanged`; do not use `Select` |
| `TextBox` | Text input | `text`, `onTextChanged`, `placeholder`, `maxLength` |
| `CheckBox` | Boolean input | `value`, `onValueChanged`, `label` |
| `TabPanel` | Tab navigation | `selectedValue`, `selectedIndex`, items as `Tab` children with `label`, `value`, `icon`. Event: `onSelectionChanged`. Enum: `TabPanel.ContentUpdateReason` |
| `Tooltip` | Hover tooltip | Via component `tooltip` prop – every Component has it |
| `Portlet` | Dashboard card | `title`, `description`, collapsible container |
| `Skeleton` | Loading placeholder | `Skeleton.Table`, width/height for loading states |
| `Link` | Anchor element | `url`, `content` – standard hyperlink |
| `Image` | Image display | `image` (ImageMetadata), `alt` |
| `ListView` | Rich data list | `ListView.ofStaticData()`, layout config, search |
| `DatePicker` | Date input | `date`, `onDateChanged`, `withTimePicker` for datetime |
| `Switch` | Toggle switch | `value`, `onValueChanged` – on/off toggle |
| `Popover` | Popup content | `owner`, closing strategy, positioned relative to owner |
| `SplitPanel` | Resizable sections | `orientation` – horizontal or vertical resizable panes |
| `Field` | Form field wrapper | `label`, `control` (the input component), `mode` (EDIT/VIEW), `mandatory`, `orientation` (HORIZONTAL/VERTICAL), `size` (AUTO/SMALL/MEDIUM/LARGE/XLARGE/XXLARGE/STRETCH). Use `Field.Mode.EDIT` for editable forms, `Field.Mode.VIEW` for read-only display |
| `FieldGroup` | Grouped fields | `title`, `collapsed`, `collapsible`, `color` (`FieldGroup.Color`: THEMED/NEUTRAL) – wraps related `Field` components with a section header |
| `TextArea` | Multi-line text input | `text`, `onTextChanged`, `placeholder`, `maxLength`, `resizable` (`TextArea.ResizeDirection`) – use instead of `TextBox` when users need multi-line input |
| `RadioButtonGroup` | Radio button group | `selectedData`, `onSelectionChanged`, `columns` – use `RadioButton` children with `label`, `data`, `value` props |
| `Banner` | Inline alert/feedback | `title`, `content`, `color` – `Banner.Color`: BLUE, BLUE_DARK, GREEN, ORANGE. Use `Banner.Color.GREEN` for success, `Banner.Color.ORANGE` for warning |
| `GrowlPanel` | Toast notification container | `position`, `messages` – add to root layout; manages all toast messages. Use once per SPA shell. Imperative: `growlPanelRef.current.add(msg)` |
| `GrowlMessage` | Single toast message | `title`, `content`, `type` (INFO/SUCCESS/WARNING/ERROR), `showCloseButton` – add to a GrowlPanel |
| `AccordionPanel` | Collapsible sections | `items` (AccordionPanelItem children with `label`, `icon`, `collapsed`), `multiple` (allow multiple open), `fullyCollapsible`. Enum: `AccordionPanel.Orientation`: VERTICAL/HORIZONTAL |
| `Pagination` | Page navigation | `selectedPageIndex`, `pages`, `rowsPerPage`, `rowsCount`. Event: `onPageSelected`. Enum: `Pagination.RowsCounter`: COMPLETE/TOTAL/UNKNOWN/CUSTOM/NONE |
| `ToolBar` | Action button container | `components`, `children`, `orientation`, `wrap`. `ToolBarGroup` groups related tools with spacing. Enum: `ToolBar.VisualStyle`: SMALL/MEDIUM/LARGE/XLARGE/PLAIN |
| `Menu` | Dropdown menu | `items` (MenuItem/MenuGroup children), `orientation`, `size`. `MenuItem` has `label`, `icon`, `action`. Enum: `Menu.ItemType`: MENU_ITEM/ITEM/GROUP |
| `MenuButton` | Button with dropdown | `label`, `icon`, `menu` (Menu component). Combines Button + Menu in one component. Search `component.d.ts` for full props |
| `FilterPanel` | Filter container | `values`, `activeFilters`, `showClearAll`, `onFiltersChanged`. Contains `FilterChip` children. Enum: `FilterPanel.Orientation`: VERTICAL/HORIZONTAL |
| `FilterChip` | Single filter input | `label`, `selectedValue`, `picker` (dropdown/listbox picker), `onValueChanged`, `onValueAccepted`. Enum: `FilterChip.Size`: SMALL/MEDIUM |
| `MultiselectDropdown` | Multi-value dropdown | `selectedItems`, `dataSource`, `empty`, `mandatory`, `onSelectionChanged`. Enum: `MultiselectDropdown.VisualStyle`: STANDALONE/EMBEDDED/REDWOOD_FIELD |
| `Stepper` | Multi-step wizard | `items` (StepperItem children with `label`, `description`, `done`, `disabled`), `selectedStepIndex`, `orientation`, `onSelectionChanged`. Enum: `Stepper.Reason`: CALL |
| `Breadcrumbs` | Navigation trail | `items` (BreadcrumbsItem with `label`, `url`/`route`, `icon`), `expanded`, `expandStrategy`. Enum: `Breadcrumbs.ExpandStrategy`: EXPAND/MENU/NONE |

## Global Component Enums

These enums are available directly from `@uif-js/component` and are used across many components.

### GapSize
Used for `itemGap`, `outerGap`, `contentGap` on StackPanel, GridPanel, ContentPanel, AccordionPanel, etc.

`NONE`, `XXXXS`, `XXXS`, `XXS`, `XS`, `S`, `M`, `L`, `XL`, `XXL`, `XXXL`, `XXXXL`
`SPACING1X` through `SPACING12X`, `SMALL`, `MEDIUM`, `LARGE`.

```jsx
import { GapSize } from '@uif-js/component';
<StackPanel itemGap={GapSize.M} outerGap={GapSize.L} ... />
```

**Note**: Some components (StackPanel, GridPanel) expose their own nested `GapSize` type. The top-level `GapSize` export from `@uif-js/component` is the standard enum to use.

### InputSize
Used for `size` on `TextBox`, `Dropdown`, `DatePicker`, `TimePicker`, `Switch`, etc.

`AUTO`, `XXS`, `XS`, `S`, `M`, `L`, `XL`, `XXL`

### VisualizationColor
Semantic color set for `Kpi`, `Reminder`, `Banner`, `Avatar`, `Badge` color props:

`NEUTRAL`, `SUCCESS`, `WARNING`, `DANGER`, `INFO`, `TEAL`, `ORANGE`, `TURQUOISE`, `TAUPE`, `GREEN`, `PINK`, `BROWN`, `LILAC`, `YELLOW`, `PURPLE`, `BLUE`, `PINE`

## Known Pitfalls from Production Experience

### UIF Date
- `Date.now()` returns a **UIF Date object**, not a number like native `Date.now()`.
- UIF Date uses `.year`, `.month`, `.day` properties (not `.getFullYear()`, `.getMonth()`, `.getDate()`).
- `.month` is 0-indexed (January = 0).
- UIF SPA runtime does not replace global `Date`; `new Date()` creates a native JS Date.
- Only `import { Date } from '@uif-js/core'` returns UIF Date.
- If the import fails silently, `Date` falls back to native `Date` and `Date.now()` returns milliseconds.

### StackPanel
- StackPanel rejects all null children; `{cond ? <Item>... : null}` will throw an error.
- Empty arrays are also rejected; `{emptyArray}` inside StackPanel causes "Invalid StackPanel item" error. Never spread or inline an array that may be empty. Use a for-loop to append items: `for (var i = 0; i < items.length; i++) rootItems.push(items[i]);`.
- Only safe pattern: Imperative array building: `var items = []; if (x) items.push(<Item>...</Item>);`.
- `StackPanel.Item` must have exactly one child.

### Modal Placement
- **Modals must be at the root component level.**
Placing modals inside deeply nested containers (for example, GridPanel > ContentPanel > StackPanel) causes stacking context issues where the modal renders inline behind page content instead of as a floating overlay.
- Push modal `<StackPanel.Item>` elements into the root-level items array, not into a nested content array.
- Always use imperative array pattern for modals: build a `modalItems` array, then append to root items via for-loop.

### Badge
- `Badge.Size` exists with values `DEFAULT` and `SMALL`; use `size={Badge.Size.SMALL}` for compact badges.
- `classList` prop uses `DOMTokenList.add()` internally; space-separated strings throw `InvalidCharacterError`.
- Always use a single class name per classList value.

### DataGrid
- **Full-width grids**: `columnStretch={true}` distributes column space proportionally, but only within the grid's own computed width; it does not make the grid fill its container. To achieve full-width:
  1. Always keep explicit `width` on every column; these act as **proportional weights** for `columnStretch`. Without them, columns collapse to tiny minimums.
  2. Add `rootStyle={{ width: '100%' }}` on the DataGrid to make it fill its parent container's width.
  3. Give wider columns a larger `width` value (for example, Description: 500, Name: 250, Badge: 70) so they get more proportional share.
- `rootStyle` is inherited from the base `Component` class; all UIF components accept `rootStyle={{ ... }}` for inline CSS on the root DOM element.
- Do not use `stretchStrategy={{}}`; it is constructor-only and causes VDom "Writable property not found" errors on re-render.
- TEMPLATED column `content` callback: `args` has `{cell, context}`, use `args.cell.value` or `args.cell.row.dataItem`.
- Always wrap TEMPLATED callbacks in try/catch; unhandled throws blank all remaining columns.
- `dataRowHeight` is the correct prop for row height; `rowHeight` is silently ignored.
- **`CHECK_BOX` columns require grid-level `editable={true}`**; setting `editable: true` on the column definition alone is not sufficient. Without `editable={true}` on the DataGrid itself, the column space renders but the checkbox widget is invisible.
- **`CHECK_BOX` columns + `CELL_UPDATE` is unreliable**; `DataGrid.Event.CELL_UPDATE` may not fire when checkboxes are toggled, making it impossible to track selection state. **Preferred pattern**: Use a TEMPLATED column with a toggle Button (for example, `label={checked ? '\u2611' : '\u2610'}`). Manage checked state in a `useRef({})` keyed by row ID. The Button `action` flips the ref entry and calls a `setState` counter to trigger re-render.
- **DataGrid.Options – key constructor-only vs writable props**: The Options interface (constructor) accepts many properties that are NOT writable after construction:
  - Constructor-only: `stretchStrategy`, `autoSize`, `bindingController`, `editingMode`, `preload`, `defaultColumnOptions`, `lockedLevels`, `beforeEditCell`, `stripedRows`, `multiColumnSort`, `allowUnsort`
  - Writable: `columnStretch`, `editable`, `paging`, `pageSize`, `pageNumber`, `sortable`, `placeholder`, `showHeader`, `highlightRowsOnHover`
- **`maxViewportWidth`** – Similar to `maxViewportHeight`, limits horizontal viewport. Use for grids with many columns to prevent horizontal overflow.
- **`stripedRows={true}`** – Enables alternating row stripes for readability. Constructor option.
- **`editingMode`** – `DataGrid.EditingMode.CELL` (default) or `DataGrid.EditingMode.ROW`. ROW mode edits all cells in a row simultaneously.
- **`multiColumnSort={true}`** – Enables sorting by multiple columns. Off by default.
- **`allowUnsort={true}`** – Lets users click a sorted column back to unsorted state.
- **Selection system** – DataGrid has built-in selection via `SelectionColumn` type and `DataGrid.SingleSelection`/`DataGrid.MultiSelection` strategies. More reliable than CHECK_BOX columns for row selection.
- **Useful imperative methods** – `autoSize()`, `stretchColumns()`, `reload()`, `rowForDataItem(dataItem)`, `scrollTo({cell/row/column})`, `pinRow(row, section)`.

### Select / Dropdown
- **`Select` does not exist in `@uif-js/component`**; importing it resolves to `undefined`. Using `<Select>` in a TEMPLATED column silently throws, and try/catch fallbacks mask the error (renders em-dash or blank instead of a dropdown).
- **For dropdown components inside DataGrid**: Use `DataGrid.ColumnType.DROPDOWN` with these key options:
  - `inputMode: DataGrid.InputMode.EDIT_ONLY`; makes the dropdown always visible (not just on click).
  - `valueMember: 'value'`, `displayMember: 'label'`, `bindToValue: true`; binds to the value property, displays the label.
  - `dataSource`: static `ArrayDataSource` (cache via `useRef` to avoid recreation each render).
  - `dataSourceConfigurator: function(row) { return new ArrayDataSource([...]); }`; for per-row dynamic options.
  - `widgetOptions: { allowEmpty: true, placeholder: 'Unassigned' }`; passed through to the underlying `Dropdown` widget.
  - Wire value changes via `DataGrid.Event.CELL_UPDATE` on the grid's `on` prop, not via onChange on individual cells.
  - The grid itself must have `editable={true}` for DROPDOWN columns to be interactive.
- **For standalone dropdowns outside DataGrid**: Use `Dropdown` from `@uif-js/component` (not `Select`).

### Modal
- `Modal.Size` enum only has: `DEFAULT`, `SMALL`, `MEDIUM`, `LARGE`; there is no `EXTRA_LARGE`.
- **`Modal.Size.LARGE` has an internal max-width that `rootStyle` cannot override** when both are set. The `size` prop's CSS takes precedence.
- **For wider-than-LARGE modals**: Remove the `size` prop entirely and control width via `rootStyle` only:
  ```jsx
  <Modal rootStyle={{ width: '80vw', maxWidth: '1200px' }} ... />
  ```
- When a DataGrid is inside a Modal, always add `rootStyle={{ width: '100%' }}` on the DataGrid so it fills the modal's content area.
- **`onClose` is not a valid prop**; using `onClose={handler}` throws "VDom: Writable property onClose not found" and prevents the modal from rendering. Modal/Window has no `onClose` callback prop. To handle close, use `closeButton={false}` and provide your own Close `<Button>` inside the modal content. For event-based close handling, use `on={{ [Window.Event.CLOSED]: handler }}`.

### MenuButton
- `MenuButton` extends `Button`; accepts all Button props (`label`, `icon`, `type`, `hierarchy`, etc.) plus `menu` (array of `MenuItem.ItemDefinition` or `Menu.Options`).
- **Menu items are `ActionItemDefinition`** objects: `{ label: 'Text', action: function() { ... } }`. The `action` property is what makes UIF treat them as clickable action items (vs submenu items which only have `label`/`icon`).
- **Do not set `icon: null` on menu items**; this can interfere with UIF's internal type discrimination between `ActionItemDefinition` and `SubmenuItemDefinition`, causing clicks to silently do nothing.
- **Use `SystemIcon.OVERFLOW` for the standard three-dot menu icon**: `<MenuButton icon={SystemIcon.OVERFLOW} type={Button.Type.GHOST} menu={items} />`.
- **Suppress tooltip with `tooltip={null}`**; MenuButton inherits Button's tooltip behavior which can persist after the dropdown opens.
- **In TEMPLATED DataGrid columns** use ref-based handlers in menu item actions to avoid stale closures: `{ action: function() { myRef.current(item); } }`.

### General
- `rootStyle` is available on all UIF components (inherited from base `Component` class). Accepts `Record<string, string>` for inline CSS on the root DOM element. Useful for `width`, `height`, `minWidth`, `maxWidth`, etc.
- Never use empty `<Text />` as conditional fallback; use `null` (but not inside StackPanel!).
- Large datasets: Cap ArrayDataSource at ~500 rows for preview grids.

### Store / State Management
- `Store.Provider` must wrap the component tree **above** any component calling `useDispatch()` or `useSelector()`; missing it throws an error from both hooks.
- `Reducer.create()` takes an object mapping action type strings to handler functions. Each handler receives `(state, action)` and must return a new state object (never mutate).
- Use `ImmutableObject.set(state, 'key', value)` inside reducers to return updated state without mutation.
- `Store.create()` is constructor-only; create once at module level, not inside a component.
- Access the existing store in deep child components via `useContext(ContextType.STORE)` instead of prop-drilling.

### useEffect / Async Cleanup
- **Never update state after component unmount**; always create a `CancellationTokenSource` at the top of `useEffect`, declare `var token = source.token`, pass token to async operations, call `source.cancel()` in the cleanup function, and check `token.cancelled` before calling any state setter.
- Correct pattern:
  ```javascript
  useEffect(function() {
      var source = new CancellationTokenSource();
      var token = source.token;
      Ajax.get({ url: '/api/data' }).then(function(result) {
          if (token.cancelled) return;
          setData(result.data);
      });
      return function() { source.cancel(); };
  }, []);
  ```

### DataGrid – TreeDataSource
- **`TreeDataSource` for hierarchy**: Use `new TreeDataSource({ data: items, childAccessor: (item) => item.children })` as the `dataSource` prop. The first column must be `DataGrid.ColumnType.TREE` (not `TEXT_BOX`) to render the expand/collapse control. `ArrayDataSource` with manual indent does not support expand/collapse.

### Form Building
- Always wrap form controls in `Field` for consistent label spacing, accessibility, and mandatory indicators; bare `TextBox` + adjacent `Text` label is not the correct pattern.
- `Field.Mode.VIEW` renders the control as read-only display text; use for detail/view screens without creating separate read-only components.
- `FieldGroup` collapses a logical group of fields with a section title; preferred over bare `StackPanel` dividers for long forms.
- `RadioButtonGroup` (not individual `RadioButton` for groups) manages selection state automatically.
- `Field.Size` full enum: `AUTO`, `SMALL`, `MEDIUM`, `LARGE`, `XLARGE`, `XXLARGE`, `STRETCH`.

### User Feedback (Banner / Growl)
- `GrowlPanel` must be in the component tree; it is not a service call. Add it once in the root shell, obtain a ref to it, then call `.add(msg)` (not `.addMessage()`) to push a `GrowlMessage`.
- Do not use `Modal` for success/error feedback; use `GrowlMessage` for transient feedback and `Banner` for persistent inline alerts.
- `Banner` is always visible until dismissed; `GrowlMessage` auto-dismisses on a timer unless `manual={true}` is set on the parent `GrowlPanel`.
- `Banner.Color` values: `BLUE` (informational), `BLUE_DARK` (emphasis), `GREEN` (success), `ORANGE` (warning).

### FilterPanel
- `FilterPanel.filters` and `FilterPanel.filtersVisibilityToggle` are **deprecated**; use `activeFilters` + `showClearAll` instead.
- `FilterChip` requires a `picker` prop (for example, `FilterChip.textBox`, `FilterChip.date` static pickers) to open the selection UI; without it the chip is display-only.

### Immutable State Updates
- **Never mutate state directly**; `state.items.push(x)` does not trigger re-render; use `ImmutableArray.push(state.items, x)` and pass the result to the state setter.
- `ImmutableObject.set(state, 'loading', true)` is the correct pattern inside Store reducers; always return a new object, never `Object.assign(state, ...)`.

## Component API Quick Reference – DataGrid

### DataGrid Props

| Prop | Type | Description |
|------|------|-------------|
| `dataSource` | ArrayDataSource | Data provider |
| `columns` | ColumnDefinition[] | Column definitions |
| `columnStretch` | Boolean | Stretch columns to fill width (writable) |
| `rootStyle` | Object | Inline CSS on root element |
| `dataRowHeight` | Number (px) | Row height (`rowHeight` is silently ignored) |
| `highlightRowsOnHover` | Boolean | Hover highlighting |
| `maxViewportHeight` | Number (px) | Max height before internal scroll |
| `maxViewportWidth` | Number (px) | Max width before horizontal scroll |
| `editable` | Boolean | Enables cell editing (required for CHECK_BOX/DROPDOWN columns) |
| `editingMode` | `CELL`, `ROW` | Cell vs row editing mode (constructor-only) |
| `stripedRows` | Boolean | Alternating row stripes (constructor-only) |
| `multiColumnSort` | Boolean | Multi-column sort support (constructor-only) |
| `allowUnsort` | Boolean | Allow unsort back to natural order (constructor-only) |
| `preload` | `ALL`, `VISIBLE`, `NONE` | Virtualization preload strategy (constructor-only) |
| `showHeader` | Boolean | Show/hide header row (writable) |
| `placeholder` | String or Component | Empty grid placeholder (writable) |
| `paging` | Boolean | Enable pagination (writable) |
| `pageSize` | Number | Rows per page (writable) |
| `pageNumber` | Number | Current page (writable) |
| `sortable` | Boolean | Enable column sorting (writable) |
| `onSort` | SortCallback | Sort event handler |

### DataGrid Column Definition

| Property | Type | Description |
|----------|------|-------------|
| `name` | String | Column ID |
| `type` | ColumnType enum | Column type (TEXT_BOX, TEMPLATED, DROPDOWN, etc.) |
| `binding` | String | Data field binding |
| `label` | String | Header label |
| `width` | Number | Initial pixel width (also serves as proportional weight for stretch) |
| `maxWidth` | Number | Maximum pixel width (set to 9999 to allow stretch) |
| `minWidth` | Number | Minimum pixel width |
| `editable` | Boolean | Column-level editability |
| `sortable` | Boolean | Column-level sortability |
| `content` | Callback | TEMPLATED column render function: `(args) => JSX` |
| `stretchFactor` | Number | Relative stretch weight (alternative to width) |
| `stretchable` | Boolean | Whether column participates in stretching |
| `horizontalAlignment` | `LEFT`, `CENTER`, `RIGHT`, `STRETCH` | Cell content alignment |
| `verticalAlignment` | `TOP`, `CENTER`, `BOTTOM`, `STRETCH` | Cell vertical alignment |
| `inputMode` | `DEFAULT`, `EDIT_ONLY` | When editable widgets are shown |
| `mandatory` | Boolean | Mandatory field indicator |
| `customizeCell` | Callback | Per-cell customization function |
| `visibility` | VisibilityBreakpoint enum | Responsive column visibility |

### DataGrid Enumerations

| Enum | Values | Access |
|------|--------|--------|
| `DataGrid.ColumnType` | `ACTION`, `CHECK_BOX`, `DATE_PICKER`, `DETAIL`, `DROPDOWN`, `GRAB`, `LINK`, `MULTI_SELECT_DROPDOWN`, `SELECTION`, `TEMPLATED`, `TEXT_AREA`, `TEXT_BOX`, `TIME_PICKER`, `TREE` | Column `type` prop |
| `DataGrid.InputMode` | `DEFAULT`, `EDIT_ONLY` | Column/grid `inputMode` |
| `DataGrid.EditingMode` | `CELL`, `ROW` | Grid `editingMode` |
| `DataGrid.SortDirection` | `NONE`, `ASCENDING`, `DESCENDING` | Column sort |
| `DataGrid.CursorVisibility` | `FOCUS`, `ALWAYS` | Grid `cursorVisibility` |
| `DataGrid.Preload` | `ALL`, `VISIBLE`, `NONE` | Grid `preload` |
| `DataGrid.VisualStyle` | `DEFAULT`, `EMBEDDED` | Grid visual style |
| `DataGrid.RowSection` | `HEADER`, `BODY`, `FOOTER` | Row pinning target |
| `DataGrid.ColumnSection` | `LEFT`, `BODY`, `RIGHT` | Column section |
| `DataGrid.SizingStrategy` | `MANUAL`, `INITIAL_WIDTH` | Auto-size strategy |
| `GridColumn.HorizontalAlignment` | `LEFT`, `CENTER`, `RIGHT`, `STRETCH` | Column alignment |
| `GridColumn.VerticalAlignment` | `TOP`, `CENTER`, `BOTTOM`, `STRETCH` | Column vertical alignment |
| `GridColumn.VisibilityBreakpoint` | `XX_SMALL`, `X_SMALL`, `SMALL`, `MEDIUM`, `LARGE`, `X_LARGE` | Responsive visibility |

### DataGrid Events

| Event | Fires When | Access |
|-------|-----------|--------|
| `DataGrid.Event.CELL_UPDATE` | Cell value changes | `on={{ [DataGrid.Event.CELL_UPDATE]: handler }}` |
| `DataGrid.Event.ROW_UPDATE` | Row added/removed/moved | Row lifecycle |
| `DataGrid.Event.COLUMN_UPDATE` | Column changes | Column lifecycle |
| `DataGrid.Event.ROW_SELECTION_CHANGED` | Row selection changes | Selection tracking |
| `DataGrid.Event.CURSOR_UPDATED` | Cursor moves | Cursor tracking |
| `DataGrid.Event.SORT` | Sort direction changes | Sort handling |
| `DataGrid.Event.SCROLLABILITY_CHANGED` | Scroll state changed | Scroll tracking |
| `DataGrid.Event.DATA_BOUND` | Data binding complete (inherited) | Data lifecycle |
