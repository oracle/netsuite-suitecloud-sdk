# UIF SPA Best Practices
> Author: Oracle NetSuite
> Layout, rendering, and component patterns for NetSuite UIF Single Page Applications
>
> UIF Version: **8.0.x** (NetSuite 2025.2) — `@oracle/netsuite-uif-types: "^8.0.0"`
>
> Official Oracle SPA samples: [oracle-samples/netsuite-suitecloud-samples/spa-suiteapp-samples](https://github.com/oracle-samples/netsuite-suitecloud-samples/tree/main/spa-suiteapp-samples)

## UIF Version Mapping

| `@oracle/netsuite-uif-types` | NetSuite Version |
|-------------------------------|-----------------|
| 5.0.x | 2024.1 |
| 6.0.x | 2024.2 |
| 7.0.x | 2025.1 |
| 8.0.x | 2025.2 |

Always match the UIF types version to your target NetSuite account version.

## 1. Application Shell Pattern (from Oracle airport360 sample)

The official Oracle sample uses a two-column layout with navigation drawer and scroll panel:

```tsx
// Airport.tsx; official Oracle pattern
<StackPanel>
    <StackPanel.Item shrink={0}>
        <Menu />
    </StackPanel.Item>
    <StackPanel.Item grow={1}>
        <ScrollPanel {...scrollOptions}>
            <Router.Routes>
                <Router.Route path={Route.DASHBOARD} exact={true}>
                    <Dashboard flights={flights} gates={gates} />
                </Router.Route>
                ...
            </Router.Routes>
        </ScrollPanel>
    </StackPanel.Item>
</StackPanel>
```

Key patterns from the official sample:
- **Navigation** uses `shrink={0}` to prevent compression.
- **Content area** uses `grow={1}` with `ScrollPanel` wrapping routes.
- **ScrollPanel** configured with explicit scroll options: `scrollAmount`, `hoverScrollAmount`, `orientation`.
- Root container needs bounded height (`rootStyle={{ height: "100vh" }}`) for ScrollPanel to scroll.

## 2. Page Layout Pattern (from Oracle airport360 sample)

Each page uses `StackPanel.Vertical` with `ApplicationHeader` and `ContentPanel`:

```tsx
// FlightList.tsx; official Oracle pattern
<StackPanel.Vertical>
    <StackPanel.Item shrink={0}>
        <ApplicationHeader icon={SystemIcon.LOCALIZE} title={'Flights'} />
    </StackPanel.Item>
    <StackPanel.Item grow={1}>
        <ContentPanel outerGap={ContentPanel.GapSize.LARGE}>
            {content}
        </ContentPanel>
    </StackPanel.Item>
</StackPanel.Vertical>
```

Note: `StackPanel.Vertical` is shorthand for `<StackPanel orientation={StackPanel.Orientation.VERTICAL}>`.

## 3. Multi-Column Layouts: Prefer GridPanel Over Horizontal StackPanels

**For any multi-column layout (KPI rows, card grids, master-detail splits, file pickers), use `GridPanel` instead of horizontal `StackPanel`.** GridPanel uses CSS Grid with `1fr` columns that properly distribute space — no `grow`/`basis`/`wrap` hacks needed.

```jsx
// BAD: horizontal StackPanel with grow/basis/wrap hacks.
<StackPanel orientation={StackPanel.Orientation.HORIZONTAL} itemGap={StackPanel.GapSize.M} wrap={true}>
    <StackPanel.Item grow={1} basis="200px">...</StackPanel.Item>
    <StackPanel.Item grow={1} basis="200px">...</StackPanel.Item>
    <StackPanel.Item grow={1} basis="200px">...</StackPanel.Item>
</StackPanel>

// GOOD: GridPanel with equal columns.
<GridPanel columns={3} defaultColumnWidth="1fr" gap={GridPanel.GapSize.MEDIUM}>
    <GridPanel.Item>...</GridPanel.Item>
    <GridPanel.Item>...</GridPanel.Item>
    <GridPanel.Item>...</GridPanel.Item>
</GridPanel>
```

Common GridPanel patterns:

| Layout | GridPanel Config |
|--------|-----------------|
| KPI cards (3-across) | `columns={3} defaultColumnWidth="1fr"` |
| Master-detail (1/3 + 2/3) | `columns={3}` with `columnSpan={1}` + `columnSpan={2}` |
| Agenda + detail (3/4 + 1/4) | `columns={4}` with `columnSpan={3}` + `columnSpan={1}` |
| File pickers (4-across) | `columns={4} defaultColumnWidth="1fr"` |
| Summary totals (2-across) | `columns={2} defaultColumnWidth="1fr"` |

**When to still use horizontal StackPanel:** Only for simple inline elements like a label + value pair, or button groups where items have natural widths (not equal-width columns).

### Use `shrink={0}` for Fixed-Width Items

Navigation drawers, action buttons, and sidebars should use `shrink={0}` to prevent compression.

```jsx
<StackPanel.Item shrink={0}>
    <NavigationDrawer ... />
</StackPanel.Item>
<StackPanel.Item grow={1}>
    {/* main content */}
</StackPanel.Item>
```

## 4. Conditional Rendering: Never Use `&&` Short-Circuit (CRITICAL)

UIF-JS VDom rejects `false` as a child node everywhere, not just in StackPanel, but for any element including native HTML (`<td>`, `<col>`, `<div>`, etc.). The `&&` short-circuit idiom common in React evaluates to `false` when the condition is falsy, which crashes the component with no visible error boundary.

The `VDom.Node` type is `(string | number | VDomElement | Component | Translation | null)` — `boolean` is **not** included.

```tsx
// BAD: Evaluates to `false` when condition is falsy → VDom crash.
{selectedCustomer && <td style={{color: 'green'}}>{price}</td>}
{items.length > 0 && <div className="badges">{items.map(...)}</div>}

// GOOD: `null` is a valid no-op in UIF-JS VDom.
{selectedCustomer ? <td style={{color: 'green'}}>{price}</td> : null}
{items.length > 0 ? <div className="badges">{items.map(...)}</div> : null}
```

**Rule:** Never use `{condition && <element>}` in UIF-JS JSX. Always use `{condition ? <element> : null}` or the always-render pattern (render the element unconditionally; let it be empty when there's no data).

### Conditional Rendering: Use `null`, Not `<Text />`

An empty `<Text />` component creates a phantom flex item that consumes space in the layout. Always return `null` for the falsy branch of conditional rendering.

```jsx
// BAD. Creates invisible element consuming space.
const errorBanner = error
    ? <Card>...</Card>
    : <Text />;

// GOOD. No element rendered.
const errorBanner = error
    ? <Card>...</Card>
    : null;
```

This applies to: error banners, loading indicators, conditional modals, conditional sections.

### 4b. Conditional StackPanel.Item Rendering (CRITICAL)

UIF's `StackPanel` validates its children strictly. **Null children in a StackPanel are rejected as "Invalid StackPanel Item"**. This means:
- `<StackPanel.Item>{null}</StackPanel.Item>` — INVALID (Item with null content)
- `{condition ? <StackPanel.Item>...</StackPanel.Item> : null}` — ALSO INVALID (null in children array)
- A `<StackPanel.Item>` with multiple children — INVALID (must have exactly one child)

**The ONLY safe pattern is the imperative array approach.** Build an array of StackPanel.Items, including only items with valid content:

```jsx
// BAD. Ternary produces null children that UIF rejects.
<StackPanel orientation={StackPanel.Orientation.VERTICAL}>
    {errorBanner ? <StackPanel.Item>{errorBanner}</StackPanel.Item> : null}
    <StackPanel.Item>{uploadSection}</StackPanel.Item>
    {summarySection ? <StackPanel.Item>{summarySection}</StackPanel.Item> : null}
</StackPanel>

// GOOD. Imperative array with zero null entries.
var contentItems = [];
if (errorBanner) contentItems.push(<StackPanel.Item key="error">{errorBanner}</StackPanel.Item>);
contentItems.push(<StackPanel.Item key="upload">{uploadSection}</StackPanel.Item>);
if (summarySection) contentItems.push(<StackPanel.Item key="summary">{summarySection}</StackPanel.Item>);

<StackPanel orientation={StackPanel.Orientation.VERTICAL}>
    {contentItems}
</StackPanel>
```

**The two-step pattern for conditional sections:**
1. Define the section variable with `null` fallback (not `<Text />`):
   ```jsx
   var summarySection = hasData ? <Card>...</Card> : null;
   ```
2. Build an array and push only truthy items:
   ```jsx
   var items = [];
   if (summarySection) items.push(<StackPanel.Item key="summary">{summarySection}</StackPanel.Item>);
   ```

**Why arrays work but ternaries don't:** When JSX processes `{contentItems}` (an array with no nulls), UIF receives only valid StackPanel.Items. When JSX processes inline ternaries, UIF receives `[null, <StackPanel.Item>, null, null]` — the nulls trigger validation errors.

### 4c. Modal Placement in StackPanel Layouts

Modals must be included in the imperative items array, not as siblings of other components inside a `<StackPanel.Item>`. A StackPanel.Item must have **exactly one child**; placing a modal alongside ContentPanel gives it two children.

```jsx
// BAD: StackPanel.Item has 2 children (ContentPanel + modal).
<StackPanel.Item grow={1}>
    <ContentPanel>...</ContentPanel>
    {modalContent}
</StackPanel.Item>

// GOOD: Modal is a separate entry in the items array.
var contentItems = [];
contentItems.push(<StackPanel.Item key="upload">{uploadSection}</StackPanel.Item>);
if (modalContent) contentItems.push(<StackPanel.Item key="modal">{modalContent}</StackPanel.Item>);

<StackPanel.Item grow={1}>
    <ContentPanel outerGap={ContentPanel.GapSize.LARGE}>
        <StackPanel orientation={StackPanel.Orientation.VERTICAL}>
            {contentItems}
        </StackPanel>
    </ContentPanel>
</StackPanel.Item>
```

### 4d. Modal `owner` Prop is MANDATORY

The `owner` property is the **only required property** in `Window.Options` (the parent class of Modal). Every Modal instance must receive an `owner` prop referencing the parent component, or UIF throws runtime errors:

- `Error: Property 'owner' must be any of: instance of Da, instance of Hr or Element`
- `Error: Cannot detach Component that is currently being updated`

The `owner` accepts a `useRef`, a `PackageCore.Component` instance, or a DOM `Element`.

**Pattern:** Create one ref per component file, attach it to the root element, and pass it to every Modal:

```jsx
function MyComponent(props) {
    var myRef = useRef(null);
    var [showModal, setShowModal] = useState(false);

    // Build content imperatively (see Section 4b)
    var items = [];
    items.push(<StackPanel.Item key="main">{mainContent}</StackPanel.Item>);

    // Modal with mandatory owner
    if (showModal) {
        items.push(
            <StackPanel.Item key="modal">
                <Modal
                    owner={myRef}
                    title="My Modal"
                    withTitleBar={true}
                    closeButton={true}
                    rootStyle={{ width: '500px', maxWidth: '90vw' }}
                    onClose={function() { setShowModal(false); }}
                    content={<Text>Modal content here</Text>}
                />
            </StackPanel.Item>
        );
    }

    return (
        <StackPanel.Vertical ref={myRef}>
            {items}
        </StackPanel.Vertical>
    );
}
```

**Convention across the codebase:** Each component uses its own ref name: `settingsRef`, `calendarRef`, `plannerRef`, `meetingsRef`, and `dashboardRef`.

**Additional Modal notes:**
- **Show/hide with conditional rendering**, not an `opened` prop; `opened` is a runtime-only instance property, NOT a constructor option
- **For modals wider than `Modal.Size.LARGE`**, omit the `size` prop entirely and use only `rootStyle={{ width: '80vw', maxWidth: '1100px' }}`; the `size` prop's internal CSS overrides `rootStyle` width
- **`Modal.DeprecatedNoOwner`** exists as an escape hatch but is deprecated and should NOT be used; it will be removed in a future UIF release

## 5. Loading State Pattern (from Oracle airport360 sample)

The official sample uses `Skeleton` components for loading states instead of `Loader`:

```tsx
// Dashboard.tsx; official Oracle pattern
const content = loading ? (
    <Skeleton.Table rows={10} columns={8} />
) : (
    actualContent
);
```

Available skeleton types:
- `<Skeleton width="100%" height={170} />` — generic block
- `<Skeleton.Table rows={10} columns={3} />` — table placeholder

## 6. GridPanel for Dashboard Layouts (from Oracle airport360 sample)

For complex dashboard layouts with varying column/row spans, use `GridPanel` instead of nested StackPanels:

```tsx
// Dashboard.tsx; official Oracle pattern
<GridPanel
    columns={6}
    defaultColumnWidth={'1fr'}
    gap={GridPanel.GapSize.LARGE}
    outerGap={GridPanel.GapSize.LARGE}
>
    <GridPanel.Item columnSpan={2} rowIndex={0} columnIndex={0}>
        <PortletTime />
    </GridPanel.Item>
    <GridPanel.Item columnSpan={4} rowSpan={3} rowIndex={0} columnIndex={2}>
        <PortletFlights flights={data} />
    </GridPanel.Item>
    <GridPanel.Item columnSpan={2} rowIndex={1} columnIndex={0}>
        <Portlet title={'Closed gates'}>...</Portlet>
    </GridPanel.Item>
</GridPanel>
```

## 7. DataGrid Patterns

### Always Set `maxViewportHeight`

Without `maxViewportHeight`, DataGrids expand infinitely and push content off-screen.

```jsx
// BAD: Grid grows without bound.
<DataGrid dataSource={data} columns={columns} />

// GOOD: Grid scrolls internally after 400px.
<DataGrid dataSource={data} columns={columns} maxViewportHeight={400} />
```

Recommended values:
- Primary data grid (full-width): `400` - `600`
- Secondary/sidebar grid: `300` - `400`
- Modal grid: `250` - `350`

### Key DataGrid Options Reference

Beyond the commonly used props, DataGrid accepts many constructor options that control behavior:

| Option | Type | Purpose |
|--------|------|---------|
| `stripedRows` | boolean | Alternating row stripes for readability |
| `editingMode` | `DataGrid.EditingMode.CELL` or `.ROW` | Cell-level vs row-level editing |
| `multiColumnSort` | boolean | Sort by multiple columns (off by default) |
| `allowUnsort` | boolean | Allow clicking sorted column back to unsorted |
| `maxViewportWidth` | number (px) | Max width before horizontal scroll |
| `preload` | `DataGrid.Preload.ALL`, `.VISIBLE`, `.NONE` | Virtualization preload strategy |
| `defaultColumnOptions` | Partial<GridColumn.Options> | Defaults applied to all columns |
| `beforeEditCell` | callback | Intercept and conditionally prevent cell editing |
| `keepSelection` | boolean | Preserve selection across data rebind |

**Constructor-only options** (cannot change after render): `stretchStrategy`, `autoSize`, `editingMode`, `preload`, `defaultColumnOptions`, `lockedLevels`, `beforeEditCell`, and `bindingController`.

### Row Height for Multi-Line TEMPLATED Cells

When using TEMPLATED columns with stacked content (for example, name + address, badges + objective), the default row height clips content. Use `dataRowHeight` to increase it:

```jsx
// BAD: rowHeight is silently ignored.
<DataGrid dataSource={data} columns={columns} rowHeight={96} />

// BAD: customizeRow row properties are READ-ONLY at runtime.
<DataGrid dataSource={data} columns={columns}
    customizeRow={function(args) {
        args.row.heightType = DataGrid.Row.Height.AUTO;  // TypeError: readonly!
        args.row.maxHeight = 112;                        // TypeError: readonly!
    }}
/>

// GOOD: dataRowHeight is the correct writable prop.
<DataGrid dataSource={data} columns={columns} dataRowHeight={96} />
```

Recommended values:
- Single-line text rows: `32` - `40`
- Two-line content (name + subtitle): `64` - `80`
- Multi-line with badges/dropdowns: `96` - `112`

**Note:** Despite type definitions showing `heightType`, `minHeight`, and `maxHeight` as properties on `GridRow`, they are getter-only at runtime. The `customizeRow` callback cannot set them. Use `dataRowHeight` for fixed row height instead.

### Column Alignment and Responsive Visibility

DataGrid columns support cell alignment and responsive visibility:

```jsx
{
    name: 'amount',
    label: 'Amount',
    binding: 'amount',
    type: DataGrid.ColumnType.TEXT_BOX,
    horizontalAlignment: GridColumn.HorizontalAlignment.RIGHT,  // right-align numbers
    verticalAlignment: GridColumn.VerticalAlignment.CENTER,
    visibility: GridColumn.VisibilityBreakpoint.MEDIUM,  // hide on small screens
    stretchFactor: 1,
    minWidth: 80,
    maxWidth: 200,
}
```

Available alignments:
- **Horizontal**: `LEFT`, `CENTER`, `RIGHT`, `STRETCH`
- **Vertical**: `TOP`, `CENTER`, `BOTTOM`, `STRETCH`

Visibility breakpoints (smallest to largest): `XX_SMALL`, `X_SMALL`, `SMALL`, `MEDIUM`, `LARGE`, `X_LARGE`

### CHECK_BOX Columns Require Grid-Level `editable`

`DataGrid.ColumnType.CHECK_BOX` columns have two requirements that are easy to miss:

1. **The DataGrid itself must have `editable={true}`** — setting `editable: true` on the column definition alone is NOT sufficient. Without the grid-level prop, the column space renders but the checkbox widget is invisible.

2. **`CELL_UPDATE` may not fire for CHECK_BOX toggles** — the checkboxes toggle visually, but `DataGrid.Event.CELL_UPDATE` may never dispatch, making it impossible to track selection state from the handler.

```jsx
// BAD: Checkbox column space appears but no checkbox widget.
<DataGrid dataSource={data}
    columns={[
        { type: DataGrid.ColumnType.CHECK_BOX, name: 'sel', binding: 'selected', editable: true }
    ]}
/>

// BETTER: Checkbox renders, but CELL_UPDATE may not fire.
<DataGrid dataSource={data} editable={true}
    columns={[
        { type: DataGrid.ColumnType.CHECK_BOX, name: 'sel', binding: 'selected',
            editable: true, inputMode: DataGrid.InputMode.EDIT_ONLY }
    ]}
    on={{ [DataGrid.Event.CELL_UPDATE]: handler }}  // May not fire.
/>

// BEST: TEMPLATED toggle button, fully reliable.
<DataGrid dataSource={data}
    columns={[
        { type: DataGrid.ColumnType.TEMPLATED, name: 'sel', label: '', binding: 'name', width: 40,
            content: function(args) {
                var name = args.cell.value;
                var checked = !!selectionRef.current[name];
                return <Button label={checked ? '\u2611' : '\u2610'}
                    size={Button.Size.SMALL}
                    hierarchy={Button.Hierarchy.SECONDARY}
                    action={function() {
                        selectionRef.current[name] = !selectionRef.current[name];
                        var count = 0;
                        for (var k in selectionRef.current) { if (selectionRef.current[k]) count++; }
                        setSelectionCount(count);  // Triggers re-render.
                    }}
                />;
            }
        }
    ]}
/>
```

### SelectionColumn for Row Selection

For reliable row selection, prefer `SelectionColumn` over `CHECK_BOX` columns:

```jsx
<DataGrid dataSource={data}
    columns={[
        { type: DataGrid.ColumnType.SELECTION, name: 'sel', width: 40 },
        { type: DataGrid.ColumnType.TEXT_BOX, name: 'name', binding: 'name', label: 'Name' },
    ]}
    on={{
        [DataGrid.Event.ROW_SELECTION_CHANGED]: function(args) {
            // args contains selection state
            console.log('Selection changed');
        }
    }}
/>
```

`SelectionColumn` works with the DataGrid's built-in selection system. Use `DataGrid.SingleSelection` (alias for `GridSingleSelection`) or `DataGrid.MultiSelection` (alias for `GridMultiSelection`) from `@uif-js/component` — more reliable than the CHECK_BOX + CELL_UPDATE workaround.

### DataGrid Events Reference

| Event | Fires When | Usage |
|-------|-----------|-------|
| `DataGrid.Event.CELL_UPDATE` | Cell value changes | `on={{ [DataGrid.Event.CELL_UPDATE]: handler }}` |
| `DataGrid.Event.ROW_UPDATE` | Row added/removed/moved | Row lifecycle tracking |
| `DataGrid.Event.ROW_SELECTION_CHANGED` | Row selection changes | Selection tracking |
| `DataGrid.Event.CURSOR_UPDATED` | Cursor position changes | Active row/cell tracking |
| `DataGrid.Event.SORT` | Sort direction changes | Custom sort handling with `onSort` |
| `DataGrid.Event.DATA_BOUND` | Data binding complete | Post-bind initialization |

### Useful Imperative Methods

When you have a DataGrid ref, these methods are available:

| Method | Purpose |
|--------|---------|
| `grid.autoSize()` | Auto-size rows and columns to fit content |
| `grid.autoSizeWidth()` | Auto-size all column widths |
| `grid.stretchColumns()` | Force column stretch to fill grid width |
| `grid.reload()` | Reload data rows from data source |
| `grid.rowForDataItem(item)` | Get the GridDataRow for a data item |
| `grid.scrollTo({ row })` | Scroll to a specific row/cell/column |
| `grid.pinRow(row, DataGrid.RowSection.HEADER)` | Pin a row to header/footer |
| `grid.expandAll()` | Expand all rows in hierarchical grid |

### ListView for Full-Featured Data Tables (from Oracle airport360 sample)

For advanced features (search, layout switching, customized rows), use `ListView` wrapping a DataGrid:

```tsx
// GateList.tsx; official Oracle pattern
const listView = ListView.ofStaticData({
    dataProvider: () => data,
    layout: {
        [ListView.Layout.TABLE]: {
            columns: this.columns,
            gridOptions: {
                customizeRow: this.customizeRow,
            },
        },
    },
    availableLayouts: {
        [ListView.Layout.TABLE]: true,
    },
    searchBoxVisible: false,
});
```

### Column Definitions with `stretchFactor` and `minWidth` (from Oracle airport360 sample)

```tsx
// GateList.tsx; official Oracle pattern
{
    name: 'airline',
    label: 'Airline',
    binding: 'airline',
    type: DataGrid.ColumnType.TEXT_BOX,
    stretchFactor: 2,
    minWidth: 100,
}
```

### Column Bindings Must Match Data Source Field Names

Column `binding` values must exactly match the field names returned by the server data service. Stale bindings cause blank columns with no error.

```jsx
// Verify bindings match your SuiteQL query aliases.
const columns = [
    { binding: 'sc_name', ... },      // Must match query alias.
    { binding: 'city', ... },          // Not a custrecord_ field if aliased.
    { binding: 'custrecord_ss_...', ...}  // Use actual field ID if not aliased.
];
```

## 8. Card Patterns

### KPI Cards

```jsx
<GridPanel columns={3} defaultColumnWidth="1fr" gap={GridPanel.GapSize.MEDIUM}>
    <GridPanel.Item>
        <Card>
            <StackPanel alignment={StackPanel.Alignment.CENTER} outerGap={StackPanel.GapSize.M}>
                <StackPanel.Item>
                    <Heading type={Heading.Type.MEDIUM_HEADING}>{value}</Heading>
                </StackPanel.Item>
                <StackPanel.Item>
                    <Text type={Text.Type.WEAK}>{label}</Text>
                </StackPanel.Item>
            </StackPanel>
        </Card>
    </GridPanel.Item>
    {/* repeat for each KPI */}
</GridPanel>
```

### Portlet Cards (from Oracle airport360 sample)

For dashboard-style cards with titles and structured content, use `Portlet`:

```tsx
<Portlet title={'Closed gates'}>
    <StackPanel
        alignment={StackPanel.Alignment.CENTER}
        justification={StackPanel.Justification.SPACE_BETWEEN}
    >
        <StackPanel.Item>
            <Reminder count={count} description={'Gates are currently closed'} color={Reminder.Color.DANGER} />
        </StackPanel.Item>
        <StackPanel.Item>
            <Button label={'To gate list'} action={() => navigator.push('/gates')} />
        </StackPanel.Item>
    </StackPanel>
</Portlet>
```

## 9. Navigation Pattern (from Oracle airport360 sample)

```tsx
// Menu.tsx; official Oracle pattern (functional component with useContext)
function Menu() {
    const location = useContext(ContextType.ROUTER_LOCATION);
    return (
        <NavigationDrawer selectedValue={getCurrentNavigationItem(location)}>
            <NavigationDrawer.Item
                value={NavigationItem.DASHBOARD}
                label={'Dashboard'}
                route={Route.DASHBOARD}
                icon={SystemIcon.HOME}
            />
            ...
        </NavigationDrawer>
    );
}
```

Note: With `Router.Hash`, NavigationDrawer items use `route` prop instead of manual `onSelectedValueChanged` handlers.

### ContextType Reference — Available Service Contexts

`useContext(contextTypeString)` gives access to framework services. All 31 constants are on the `ContextType` namespace:

| ContextType Constant | Returns | Common Use |
|----------------------|---------|-----------|
| `ContextType.ROUTER` | `Router` | Active route, programmatic routing |
| `ContextType.ROUTER_NAVIGATION` | `Navigator` | `push()`, `replace()`, `back()` for SPA navigation |
| `ContextType.ROUTER_LOCATION` | `RouterLocation` | Current URL, `matches()` for active-link highlighting |
| `ContextType.ROUTER_ROUTE` | `Route` | Active route definition |
| `ContextType.I18N` | `I18n` | Locale-aware formatting, translation bundles |
| `ContextType.PREFERENCES` | `Preferences` | Per-user preference storage (`get`, `set`) |
| `ContextType.FOCUS_MANAGER` | `FocusManager` | Programmatic focus control |
| `ContextType.STORE` | `Store` | Access the shared Store instance from child components |
| `ContextType.DISPATCH` | `Dispatch` | Access the Store dispatch function directly |
| `ContextType.SCROLL_OBSERVER` | `ScrollObserver` | Subscribe to scroll events |
| `ContextType.DEVICE_METADATA` | `DeviceMetadataService` | Device/viewport capabilities |
| `ContextType.SHORTCUTS` | `Accelerator` | Keyboard shortcut registration |
| `ContextType.MESSAGING` | `PageMessageDispatcher` | Low-level message dispatching |
| `ContextType.PERFORMANCE` | `SimplePerformance` | Performance measurement |
| `ContextType.DISPATCHER` | `PageMessageDispatcher` | Global event dispatcher |

Full list: 31 values. Grep `ContextType` in `core.d.ts` for complete reference.

**Pattern:**
```jsx
// Access I18n for locale-aware formatting.
var i18n = useContext(ContextType.I18N);
var formatted = FormatService.forI18n(i18n).format(myDate, Format.DATE);

// Access user preferences.
var prefs = useContext(ContextType.PREFERENCES);
prefs.set('myapp.pageSize', 50);
var pageSize = prefs.get('myapp.pageSize') || 25;

// Access Store from deep child (alternative to prop-drilling).
var store = useContext(ContextType.STORE);
```

## 10. Root Container Height

The root StackPanel must have a bounded height for ScrollPanel to function.

```jsx
<StackPanel orientation={StackPanel.Orientation.HORIZONTAL} rootStyle={{ height: "100vh" }}>
    <StackPanel.Item shrink={0}>{/* nav */}</StackPanel.Item>
    <StackPanel.Item grow={1}>
        <ScrollPanel orientation={ScrollPanel.Orientation.VERTICAL}>
            {/* page content */}
        </ScrollPanel>
    </StackPanel.Item>
</StackPanel>
```

## 11. Agenda Component

The Agenda component needs a bounded container height to render properly. It **must** have a `ContentPanel` as an ancestor to provide height context; wrapping in an outer `StackPanel` without explicit height causes the month grid to render at 0 height.

```jsx
// CORRECT. ContentPanel as root provides height context.
return (
    <ContentPanel outerGap={ContentPanel.GapSize.L}>
        <StackPanel.Vertical>
            {calendarItems}
        </StackPanel.Vertical>
    </ContentPanel>
);

// WRONG. Outer StackPanel has no defined height, Agenda grid collapses.
return (
    <StackPanel orientation={StackPanel.Orientation.VERTICAL}>
        <StackPanel.Item grow={1}>
            <Agenda ... />   {/* renders 0-height grid */}
        </StackPanel.Item>
    </StackPanel>
);
```

```jsx
<Agenda
    viewDate={viewDate}
    events={events}
    rootStyle={{ height: "600px" }}
    monthViewConfig={{
        startingDay: 1,
        eventClickAction: handleEventClick,
        dayClickAction: handleDayClick,
        daysConfig: function(date) { return {}; }
    }}
    weekViewConfig={{
        eventClickAction: handleEventClick
    }}
    dayViewConfig={{
        eventClickAction: handleEventClick
    }}
    // NOTE: there is NO agendaViewConfig; see "Agenda View API Gap" below.
/>
```

### Agenda View API Gap (CRITICAL)

The Agenda component supports 4 view types (Month, Week, Day, Agenda) but **only exposes config props for 3 of them**:

| View | Config Prop | `eventClickAction` Support |
|------|-------------|---------------------------|
| Month | `monthViewConfig` | Yes |
| Week | `weekViewConfig` | Yes |
| Day | `dayViewConfig` | Yes |
| **Agenda (list)** | **None — `agendaViewConfig` does NOT exist** | **No** |

The internal `AgendaView` class (in `component.d.ts`) *does* support `eventClickAction` directly, but the parent `Agenda` component provides no way to pass configuration to it. Setting `agendaViewConfig` is **silently ignored**.

**Consequence:** Clicking an event in the Agenda (list) view always opens the built-in **"Edit Event" dialog**; there is no way to override this through props alone.

### UIF RoutedMessage Event System

UIF does **not** use standard DOM events for component interactions. It has its own **RoutedMessage** pipeline:

1. `PageMessageDispatcher` hooks into the DOM at root level and converts native browser events into `RoutedMessage` objects.
2. Clicks become `PointerMessage` objects (extends `RoutedMessage`) with code `MessageCode.CLICK`.
3. Messages route through the component tree via `processMessage()` and `RoutedMessage.Filter` chains.
4. **`document.addEventListener('click', handler, true)` CANNOT intercept UIF component clicks** — UIF's internal routing processes clicks independently of the DOM event system.
5. `e.stopImmediatePropagation()` on native DOM events has **NO effect** on UIF's RoutedMessage handling.

#### UIF Message Interception API

Every `Component` supports message filtering:

- **Constructor option**: `messageFilter` in Options (constructor-only, not dynamically changeable)
- **Instance method**: `component.addMessageFilter(filter)` → returns `{remove: () => void}`
- **Static utility**: `PageMessageDispatcher.addElementMessageFilter(element, filter)`

Filter forms:
```jsx
// Function form: receives ALL message types, must call next() to pass through.
function(next, message, result) { /* ... */ next(); }

// Record form: only fires for matching type, no next needed.
{ [FilterCode.CLICK]: function(message, result) { /* ... */ } }
```

`RoutedMessage.Result` controls propagation:
- `result.handled = true` — marks message as consumed.
- `result.executeDefault = false` — prevents default behavior.
- `result.stopPropagation = true` — stops message from bubbling.

`FilterCode` enum (from `@uif-js/core`): `CLICK`, `CAPTURE_CLICK`, `POINTER_DOWN`, `POINTER_UP`, `KEY_DOWN`, etc.

### Intercepting Built-In UIF Dialogs (MutationObserver Pattern)

When a UIF component opens a built-in dialog that cannot be suppressed through props (like the Agenda's "Edit Event" dialog), use a `MutationObserver` to intercept it at the DOM level:

```jsx
useEffect(function() {
    var observer = new MutationObserver(function(mutations) {
        for (var m = 0; m < mutations.length; m++) {
            var added = mutations[m].addedNodes;
            for (var n = 0; n < added.length; n++) {
                var node = added[n];
                if (node.nodeType !== 1) continue;

                // Detect the dialog by scanning for its title text
                var allText = node.querySelectorAll ? node.querySelectorAll('*') : [];
                var isTargetDialog = false;
                for (var t = 0; t < allText.length; t++) {
                    if ((allText[t].textContent || '').trim() === 'Edit Event') {
                        isTargetDialog = true;
                        break;
                    }
                }
                if (!isTargetDialog) continue;

                // Hide the dialog immediately (MutationObserver runs as
                // a microtask BEFORE browser repaint; no visible flash).
                node.style.display = 'none';

                // Hide the overlay/backdrop (usually the previous sibling).
                if (node.previousElementSibling) {
                    var prev = node.previousElementSibling;
                    var prevStyle = window.getComputedStyle(prev);
                    if (prevStyle.position === 'fixed' || prevStyle.zIndex > 100) {
                        prev.style.display = 'none';
                    }
                }

                // Extract data from the dialog (first input = event name).
                var nameInput = node.querySelector('input');
                var eventName = nameInput ? nameInput.value.trim() : '';

                // Click Cancel to properly dismiss from UIF's internal state.
                var allButtons = node.querySelectorAll('button, [role="button"]');
                for (var b = 0; b < allButtons.length; b++) {
                    var btnText = (allButtons[b].textContent || '').trim();
                    if (btnText === 'Cancel' || btnText === '\u00D7') {
                        allButtons[b].click();
                        break;
                    }
                }

                // Match extracted name against your data and open custom modal.
                if (eventName) {
                    handleCustomAction(eventName);
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return function() { observer.disconnect(); };
}, []);
```

**Why this works:** MutationObserver callbacks run as microtasks *before* the browser repaints, so the dialog is hidden before the user ever sees it. The Cancel button click properly cleans up UIF's internal dialog state.

**Why DOM event interception does NOT work:**
1. `document.addEventListener('click', handler, true)` — UIF's RoutedMessage system processes clicks independently.
2. `e.stopImmediatePropagation()` — No effect on UIF's internal routing.
3. `agendaViewConfig` prop — Does not exist; silently ignored.

### Agenda Pitfalls

- **`readOnly={true}` blocks `eventClickAction`** — The `readOnly` prop propagates from the parent `Agenda` down to each `AgendaDayView` cell, disabling event click handlers. Note that `dayClickAction` on `AgendaMonthView` is unaffected because it operates at the month-view level, not the day-cell level. Remove `readOnly` if you need `eventClickAction` to fire.
- **`daysConfig` `eventsLimit: 0`** — Throws "must be no value or positive number". To suppress events on specific days (for example, weekends), use `events: []` instead of `eventsLimit: 0`.
- **`daysConfig` with `events: []`** — Setting `events: []` in the `daysConfig` callback completely overrides the Agenda's event data for that day cell, hiding legitimate meetings. To dim weekends without hiding events, use only `background` and `showHeader` — do NOT include `events`.
- **`eventClickAction` callback receives `EventData`** — The callback gets the same `EventData` object you passed in (with `name`, `description`, `start`, `end`, `color`). It has no custom fields, so correlate back to your data by matching `name` + `start` date/time.
- **No `agendaViewConfig`** — The Agenda component has no config prop for its Agenda (list) view. Any `agendaViewConfig` prop is silently ignored. Use the MutationObserver pattern above to intercept the built-in Edit Event dialog.
- **`position: fixed; left: -9999px` permanently breaks Agenda layout** — The grid calculates 0 height when rendered off-screen and does NOT re-layout when moved on-screen. Never use off-screen positioning to pre-render the Agenda. Use `if (loading) return <Loader />` and render the Agenda only when ready.
- **Outer StackPanel without height breaks Agenda grid** — `grow={1}` on a StackPanel.Item containing the Agenda requires the parent StackPanel to have a defined height. Without it, the month grid renders at 0 height (toolbar appears but grid is empty). Use `ContentPanel` as the root ancestor.

## 12. Common Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| No `wrap={true}` on horizontal StackPanel | Items squeeze to single characters | Add `wrap={true}` |
| `grow={1}` without `basis` | Items collapse to 0px | Add `basis="200px"` (or appropriate size) |
| `{cond && <element>}` short-circuit | VDom crash — `false` is not a valid node type | Always use `{cond ? <element> : null}`. UIF VDom.Node does not include `boolean` |
| `<Text />` as conditional fallback | Phantom spacing, layout shifts | Use `null` instead |
| No root `height` on container | ScrollPanel doesn't scroll | Add `rootStyle={{ height: "100vh" }}` |
| No `maxViewportHeight` on DataGrid | Grid expands infinitely, pushes content off-screen | Add `maxViewportHeight={400}` |
| Stale column `binding` values | Blank columns, no error shown | Match bindings to actual data field names |
| Missing `shrink={0}` on fixed elements | Navigation/sidebar compresses | Add `shrink={0}` |
| Hard-coded custrecord field IDs in JSX | Breaks when fields renamed in SDF | Use aliased names from SuiteQL query |
| `Loader` for initial page load | No visual structure during load | Use `Skeleton` / `Skeleton.Table` instead |
| Manual nav state management | Complex state for simple routing | Use `Router.Hash` + `NavigationDrawer` `route` prop |
| Nested StackPanels for grid layouts | Fragile, hard to span rows/columns | Use `GridPanel` for dashboard-style layouts |
| Horizontal StackPanel for equal-width columns | Items compress/overflow, need grow/basis/wrap hacks | Use `GridPanel columns={N} defaultColumnWidth="1fr"` |
| Manual heading + button row for page header | Takes layout space, buttons truncate | Use `ApplicationHeader` with `actions` prop |
| Manual heading + description for data sections | Repetitive, inconsistent spacing | Use `Portlet` with `title` and `description` props |
| Modals inside StackPanel layout | Modals consume flex space even when hidden | Render modals outside the main StackPanel (siblings, not children) |
| Flat StackPanel with many siblings | UIF treats all items as competing flex items, causing overflow | Use three-zone pattern: `shrink={0}` header + `grow={1}` ContentPanel |
| `<Text />` fallback inside `<StackPanel.Item>` | "Invalid StackPanel Item" error at runtime | Use `null` fallback AND build items with imperative array (see Section 4b) |
| `null` child in StackPanel children array | "Invalid StackPanel Item" — UIF rejects null entries in children | Use imperative array: `var items = []; if (x) items.push(...); <StackPanel>{items}</StackPanel>` |
| Ternary `{cond ? <Item>... : null}` in StackPanel | Still produces null in children array — UIF rejects it | Use imperative array approach instead of inline ternaries (see Section 4b) |
| `<StackPanel.Item>` with multiple children | "Invalid StackPanel Item" — Item expects exactly one child | Ensure each StackPanel.Item wraps exactly one component |
| Modal as sibling of ContentPanel in StackPanel.Item | StackPanel.Item gets 2 children → "Invalid StackPanel Item" | Include modal in imperative items array (see Section 4c) |
| Modal without `owner` prop | "Property 'owner' must be any of: instance of Da, instance of Hr or Element" + "Cannot detach Component that is currently being updated" | Add `owner={myRef}` to every Modal, where `myRef` is a `useRef` attached to the root component via `ref={myRef}` (see Section 4d) |
| Custom list values don't match CSV data | Silent data mapping failures — records save with wrong/empty values | Compare CSV rating labels exactly against custom list values before deployment |
| Mandatory field with no CSV column | Record creation fails for CSV-imported data | Change field `<ismandatory>` to `F` when CSV doesn't include that column |
| No pre-deploy code review pass | Runtime errors discovered after deployment | Always review XML well-formedness, SuiteQL syntax, and UIF rules before deploying |
| `useState(function() { return val })` | Function stored as state value, not its return | UIF `useState` does NOT support lazy initializer functions (unlike React). Always pass computed value directly: `var v = compute(); useState(v)` |
| `Badge.Size` not working as expected | Forgetting to import Badge or using wrong enum path | `Badge.Size` exists with `DEFAULT` and `SMALL` values. Use `size={Badge.Size.SMALL}` for compact badges |
| Space-separated `classList` string | `InvalidCharacterError` at runtime | UIF `classList` uses `DOMTokenList.add()` internally. Always use a SINGLE class name per value. Merge base styles into each variant class in CSS |
| TEMPLATED column callback throws | All remaining columns in the row go blank | Always wrap `content` callbacks in try/catch. Access data via `args.cell.value` or `args.cell.row.dataItem` |
| DataGrid has grey area on right | Internal viewport background extends beyond columns | **CSS fix required.** Add `classList="road-datagrid"` to every `<DataGrid>`, then in your stylesheet: `.road-datagrid, .road-datagrid > div, .road-datagrid > div > div, .road-datagrid > div > div > div { background-color: transparent !important; }`. Note: `columnStretch={true}`, `rootStyle={{ width: '100%' }}`, `stretchFactor`, and `maxWidth: 9999` do NOT fix this — the DataGrid computes its viewport width from column widths regardless of container sizing. Do NOT use `stretchStrategy={{}}` — it is constructor-only and causes VDom errors |
| 35k+ rows in ArrayDataSource | Browser hangs or crashes | Cap preview grids at ~500 rows (`slice(0, PREVIEW_LIMIT)`) |
| Agenda `readOnly={true}` with `eventClickAction` | Event clicks do nothing | `readOnly` propagates to day cells and blocks event click handlers. Remove `readOnly` to enable `eventClickAction` |
| Agenda `eventsLimit: 0` in `daysConfig` | "Must be no value or positive number" error | Use `events: []` to suppress events on specific days instead |
| Agenda `events: []` in `daysConfig` | Legitimate meetings disappear for that day | `events: []` overrides the Agenda's data for that cell. Use only `background`/`showHeader` to dim days without hiding events |
| `agendaViewConfig` prop on Agenda | Silently ignored — Edit Event dialog still opens | This prop does NOT exist. Only `monthViewConfig`, `weekViewConfig`, `dayViewConfig` are available. Use MutationObserver pattern (Section 11) |
| `document.addEventListener('click', ...)` to intercept UIF clicks | Handler fires but cannot prevent UIF dialog | UIF uses its own RoutedMessage event system independent of DOM events. `stopImmediatePropagation()` has no effect. Use MutationObserver or `addMessageFilter()` (Section 11) |
| `position: fixed; left: -9999px` on Agenda | Grid renders at 0 height permanently | Agenda calculates layout from DOM dimensions. Off-screen rendering gives 0 height that never recovers. Use `if (loading) return <Loader />` pattern |
| Agenda inside StackPanel without height context | Toolbar visible but grid is empty/blank | Agenda requires `ContentPanel` ancestor for height context. Return `<ContentPanel>` directly as root, not a wrapper `<StackPanel>` |
| `new Date()` vs `import { Date } from '@uif-js/core'` | Wrong API — `.getFullYear()` vs `.year` | UIF SPA does NOT replace global `Date`. Only explicit import gives UIF Date with `.year`, `.month` (0-indexed), `.day`, `.firstOfMonth()`, `.lastOfMonth()` |
| `<orderindex>` on `<customvalue>` in SuiteApps | SDF ignores it with warnings | Values ordered by XML document order instead. Don't include `<orderindex>` in custom list XML |
| `rowHeight={N}` on DataGrid | Silently ignored — rows stay default height | The correct prop is `dataRowHeight={N}` (not `rowHeight`). Use `dataRowHeight={96}` for multi-line TEMPLATED cells |
| `customizeRow` setting `args.row.heightType` | "Attempted to assign to readonly property" TypeError | `heightType`, `minHeight`, `maxHeight` on GridRow are read-only at runtime despite type defs showing them as writable. Use `dataRowHeight={N}` fixed height instead. `DataGrid.Row.Height.AUTO` is not usable via customizeRow |
| `stretchStrategy={{}}` on DataGrid | VDom "Writable property not found" errors on every re-render | `stretchStrategy` is constructor-only. Use `columnStretch={true}` instead — functionally equivalent and writable |
| `Text.Alignment` for centering text | TypeError: undefined | `Text.Alignment` does not exist in UIF. Use a horizontal `StackPanel` with `justification={StackPanel.Justification.CENTER}` to center text |
| Card as height-propagating container | Card content doesn't stretch to fill parent | Card does NOT propagate height to children. For vertical SPACE_BETWEEN distribution, replace Card with a decorated StackPanel using `rootStyle={{ height: '100%' }}` |
| `disabled={saving}` on Button | "Writable property disabled not found" on re-render | `disabled` is constructor-only. Use `enabled={!saving}` instead — `enabled` IS a writable property |
| Button `action` handler uses stale state | Async handlers read initial-render values, ignoring later state changes | UIF Button may not update `action` reference on re-renders. Store state in refs (`useRef`), sync on every render (`ref.current = stateValue`), read from refs inside the handler |
| `Image.Size.XXL` or `Image.Color.SUCCESS` | TypeError crash, silently blanks parent container | These enum values do not exist in UIF. Use `<Text>` with a Decorator-based style for status indicators instead |
| `Select` component import from `@uif-js/component` | Resolves to `undefined`, silently fails in JSX | `Select` does not exist in `@uif-js/component`. For dropdowns inside DataGrid, use `DataGrid.ColumnType.DROPDOWN` with `inputMode: DataGrid.InputMode.EDIT_ONLY`. For standalone dropdowns, use `Dropdown` from `@uif-js/component` |
| `StackPanel.VerticalAlignment.CENTER` | TypeError crash on module load — kills entire component | `StackPanel.VerticalAlignment` does not exist. Use `alignment={StackPanel.Alignment.CENTER}` for cross-axis alignment on horizontal StackPanels |
| `useEffect` cleanup inside `setTimeout` callback | Cleanup function silently discarded — event listeners leak on every mount | The return value of a `setTimeout` callback is **ignored** by the runtime. Hoist cleanup references to variables in the outer `useEffect` scope (see Section 14) |
| Raw HTML string with unescaped data | XSS in third-party library popups/tooltips | Always use an `escapeHtml()` helper for ALL data values injected into HTML strings — including numeric IDs in `data-` attributes |
| CSS values from data injected into inline `style` | CSS injection can break layout or exfiltrate data via `url()` | Validate dynamic CSS values against an allowlist regex (for example, `/^#[0-9a-fA-F]{3,6}$/` for hex colors) before inserting into style strings |
| `useEffect` with array/object in dependency list | Effect fires on every render — arrays/objects create new references each time | Derive a primitive dependency: `var ready = !loading && !error; useEffect(fn, [ready])` instead of `useEffect(fn, [loading, error, dataArray])` |
| Stale `navigator` in imperative event handlers | Navigation targets wrong route or throws on unmounted component | Store `navigator` in a `useRef`, sync on every render (`ref.current = navigator`), read from ref inside event handlers. See Section 14 for full pattern |
| External CDN scripts in SPA without SRI | Supply chain risk (OWASP A08:2021); NetSuite CSP may silently block | Add `integrity` and `crossOrigin="anonymous"` to injected script/link elements. Prefer self-hosted assets via FileCabinet when build pipeline supports it |
| Module-level `var` for cache without null-check guard | Cache persists stale data after errors or across users | Always initialize as `null`, check with `!== null` (not truthy), and provide a manual cache-clear path (Refresh button). See Section 15 |
| CHECK_BOX for row selection | Unreliable CELL_UPDATE, invisible without grid `editable` | Use `SelectionColumn` type with `DataGrid.Event.ROW_SELECTION_CHANGED` |
| Constructor-only options on re-render | VDom "Writable property not found" errors | `stretchStrategy`, `editingMode`, `preload`, `autoSize`, `defaultColumnOptions`, `bindingController`, `lockedLevels`, `beforeEditCell`, `stripedRows`, `multiColumnSort`, `allowUnsort` are constructor-only — set once in JSX, never bind to state |

## 13. Component API Quick Reference

### StackPanel

| Prop | Values | Purpose |
|------|--------|---------|
| `orientation` | `HORIZONTAL`, `VERTICAL` (default) | Layout direction |
| `itemGap` | `XS`, `S`, `M`, `L`, `XL` | Gap between items |
| `outerGap` | `XS`, `S`, `M`, `L`, `XL` | Padding around panel |
| `wrap` | `true`, `false` | Allow items to wrap |
| `justification` | `START`, `END`, `CENTER`, `SPACE_BETWEEN` | Main axis alignment |
| `alignment` | `START`, `END`, `CENTER`, `STRETCH` | Cross axis alignment |
| `rootStyle` | CSS object | Inline styles on root element |

Shorthand: `StackPanel.Vertical` = `<StackPanel orientation={VERTICAL}>`, `StackPanel.Horizontal` = `<StackPanel orientation={HORIZONTAL}>`

### StackPanel.Item

| Prop | Values | Purpose |
|------|--------|---------|
| `grow` | number (0, 1, etc.) | Flex grow factor |
| `shrink` | number (0, 1, etc.) | Flex shrink factor |
| `basis` | CSS length string | Flex basis (min width before wrap) |

### DataGrid

| Prop | Values | Purpose |
|------|--------|---------|
| `dataSource` | array or DataSource | Data to display |
| `columns` | array | Column definitions |
| `maxViewportHeight` | number (px) | Max height before internal scroll |
| `highlightRowsOnHover` | boolean | Hover highlight |
| `rowCursor` | boolean | Clickable row cursor |
| `columnStretch` | boolean (`true`) | Stretch columns to fill width |
| `dataRowHeight` | number (px) | Fixed row height for data rows (NOT `rowHeight`) |
| `maxViewportWidth` | number (px) | Max width before horizontal scroll |
| `editable` | boolean | Enables cell editing (required for CHECK_BOX/DROPDOWN) |
| `editingMode` | `CELL`, `ROW` | Cell vs row editing mode (constructor-only) |
| `stripedRows` | boolean | Alternating row stripes |
| `multiColumnSort` | boolean | Multi-column sort support |
| `preload` | `ALL`, `VISIBLE`, `NONE` | Virtualization preload strategy |
| `onSort` | SortCallback | Sort event handler |
| `placeholder` | string or Component | Empty grid placeholder |

### DataGrid Column Definition

| Prop | Values | Purpose |
|------|--------|---------|
| `name` | string | Column identifier |
| `label` | string | Column header text |
| `binding` | string | Data field name to bind |
| `type` | `TEXT_BOX`, `CHECK_BOX`, `DETAIL`, etc. | Column type |
| `width` | number | Fixed pixel width |
| `minWidth` | number | Minimum pixel width |
| `stretchFactor` | number | Relative stretch weight |
| `maxWidth` | number | Maximum pixel width (set 9999 for unrestricted stretch) |
| `horizontalAlignment` | `LEFT`, `CENTER`, `RIGHT`, `STRETCH` | Cell content alignment |
| `verticalAlignment` | `TOP`, `CENTER`, `BOTTOM`, `STRETCH` | Cell vertical alignment |
| `inputMode` | `DEFAULT`, `EDIT_ONLY` | When editable widgets show |
| `visibility` | VisibilityBreakpoint | Responsive column visibility |
| `customizeCell` | callback | Per-cell customization function |

### GridPanel

| Prop | Values | Purpose |
|------|--------|---------|
| `columns` | number | Number of grid columns |
| `defaultColumnWidth` | CSS length (for example, `'1fr'`) | Default column width |
| `gap` | `GridPanel.GapSize.*` | Gap between cells |
| `outerGap` | `GridPanel.GapSize.*` | Outer padding |

### GridPanel.Item

| Prop | Values | Purpose |
|------|--------|---------|
| `columnIndex` | number | Starting column |
| `rowIndex` | number | Starting row |
| `columnSpan` | number | Columns to span |
| `rowSpan` | number | Rows to span |

### ListView

| Method | Purpose |
|--------|---------|
| `ListView.ofStaticData({...})` | Create list from static array |
| `dataProvider` | Function returning data array |
| `layout` | Layout configuration with columns and grid options |
| `availableLayouts` | Which layout modes to enable |
| `searchBoxVisible` | Show/hide search |

### ContentPanel

| Prop | Values | Purpose |
|------|--------|---------|
| `outerGap` | `ContentPanel.GapSize.*` | Padding around content |

### ApplicationHeader

| Prop | Values | Purpose |
|------|--------|---------|
| `icon` | `SystemIcon.*` | Header icon |
| `title` | string | Main title |
| `subtitle` | string | Subtitle text |
| `actions` | `[[{label, action, type}]]` | Action buttons in header |

Action button types: `ApplicationHeader.ActionType.PRIMARY`, `ApplicationHeader.ActionType.SECONDARY`

```jsx
// Move page action buttons INTO ApplicationHeader instead of manual button rows
<ApplicationHeader
    title="Roadshow Planner"
    actions={[[
        { label: 'New Roadshow', type: ApplicationHeader.ActionType.PRIMARY, action: handleNew },
        { label: 'Add Meeting', type: ApplicationHeader.ActionType.SECONDARY, action: handleAdd }
    ]]}
/>
```

### Agenda

| Prop | Values | Purpose |
|------|--------|---------|
| `viewDate` | UifDate | Current view date |
| `events` | array | Event objects with `name`, `start`, `end`, `color` |
| `readOnly` | boolean | Prevent editing |
| `rootStyle` | CSS object | Container sizing |

### Global Spacing and Size Enums

These enums are used across many components for consistent spacing and sizing:

**GapSize** (for `itemGap`, `outerGap`, `contentGap`, `gap` props):

| Value | Approximate Size | Use |
|-------|-----------------|-----|
| `GapSize.NONE` | 0px | No gap |
| `GapSize.XS` | ~4px | Tight — compact badges, icons |
| `GapSize.S` | ~8px | Small — compact content |
| `GapSize.M` | ~12px | Medium (default) — most content |
| `GapSize.L` | ~16px | Large — section separators |
| `GapSize.XL` | ~24px | Extra large — page-level margins |
| `GapSize.XXL` | ~32px | Dashboard outer margins |

Import: `import { GapSize } from '@uif-js/component'`

Full enum: `NONE`, `XXXXS`, `XXXS`, `XXS`, `XS`, `S`, `M`, `L`, `XL`, `XXL`, `XXXL`, `XXXXL`, `SPACING1X`–`SPACING12X`, `SMALL`, `MEDIUM`, `LARGE`

**InputSize** (for `TextBox.inputSize`, `Dropdown.size`, `DatePicker.size`):

| Value | Use |
|-------|-----|
| `InputSize.AUTO` | Inherit from container |
| `InputSize.S` | Short/compact inputs |
| `InputSize.M` | Standard inputs |
| `InputSize.L` | Wide inputs |
| `InputSize.XL` | Extra wide |

Import: `import { InputSize } from '@uif-js/component'`

Full enum: `AUTO`, `XXS`, `XS`, `S`, `M`, `L`, `XL`, `XXL`

## 14. Third-Party Library Integration (Leaflet, D3, Chart.js, etc.)

When integrating imperative DOM libraries into a UIF SPA, UIF's virtual DOM owns the render tree. You must create a "DOM escape hatch" where the library takes ownership of a specific element.

### 14a. Container Pattern: `classList` + `querySelector`

UIF does not expose React-style `ref` on `StackPanel.Item`. Use `classList` to tag a container element, then find it with `querySelector` in a `useEffect`:

```jsx
// JSX; tag the container.
<StackPanel.Item classList="my-map-container" rootStyle={{ height: '600px' }}>
    {loading ? <Loader label="Loading..." /> : null}
</StackPanel.Item>
```

```jsx
// useEffect; find the container after UIF renders.
useEffect(function() {
    var container = document.querySelector('.my-map-container');
    if (!container) return;
    // Imperative library takes ownership here.
    container.innerHTML = '';  // Wipe UIF children (Loader).
    var instance = L.map(container, { center: [39.8, -98.5], zoom: 4 });
    // ...
    return function() { instance.remove(); };
}, [ready]);
```

**Risks and mitigations:**
- Use a unique class name (for example, `my-app-map-container`) to avoid collisions if multiple components share the page.
- UIF may re-render the container's parent; once the library owns the element, avoid state changes that trigger parent re-renders.
- Add a short `setTimeout(fn, 50)` before `querySelector` to ensure UIF has flushed its render to the DOM.

### 14b. `useEffect` Cleanup with `setTimeout` (CRITICAL)

When using `setTimeout` inside `useEffect` to defer DOM access, the cleanup pattern has a subtle but critical bug: **the return value of a `setTimeout` callback is silently discarded**.

```jsx
// BAD: removeEventListener is NEVER called (return inside setTimeout is ignored).
useEffect(function() {
    var timer = setTimeout(function() {
        container.addEventListener('click', handleClick);
        return function() { container.removeEventListener('click', handleClick); }; // ← DISCARDED
    }, 50);
    return function() { clearTimeout(timer); };  // ← only this runs
}, []);

// GOOD: hoist cleanup reference to outer scope.
useEffect(function() {
    var removeClickHandler = null;
    var timer = setTimeout(function() {
        container.addEventListener('click', handleClick);
        removeClickHandler = function() {
            container.removeEventListener('click', handleClick);
        };
    }, 50);
    return function() {
        clearTimeout(timer);
        if (removeClickHandler) removeClickHandler();   // ← NOW runs
        if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
    };
}, []);
```

### 14c. Navigator Ref Pattern for Event Handlers

Event handlers registered on raw DOM elements (for example, click delegation on popup buttons) exist outside UIF's render cycle. They capture the `navigator` from the closure at registration time, which may become stale.

```jsx
var navigator = useContext(ContextType.ROUTER_NAVIGATION);
var navigatorRef = useRef(null);
navigatorRef.current = navigator;  // sync on every render

// Inside setTimeout or event handler:
function handleClick(e) {
    var btn = e.target.closest('[data-rsid]');
    if (btn && navigatorRef.current) {
        navigatorRef.current.push('/my-meetings?roadshowId=' + btn.getAttribute('data-rsid'));
    }
}
```

### 14d. Event Delegation for Dynamic HTML

When a third-party library generates HTML (for example, Leaflet popups, D3 tooltips), UIF event handlers don't apply. Use event delegation on the container:

```jsx
container.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (btn) {
        // handle action based on data attributes
    }
});
```

**Security requirements for raw HTML:**
1. **Always escape data** with an `escapeHtml()` helper — including IDs in `data-` attributes.
2. **Validate CSS values** against an allowlist regex before injecting into `style` attributes.
3. **Never interpolate user data** into `href` or event handler attributes.

```jsx
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var SAFE_HEX = /^#[0-9a-fA-F]{3,6}$/;
var color = STATUS_COLORS[status] || '#999';
if (!SAFE_HEX.test(color)) color = '#999';
```

### 14e. CSS Z-Index Isolation

Third-party libraries (Leaflet uses z-index 400+) can overlay UIF modals and dropdowns. Create a new stacking context on the container:

```css
.my-map-container { position: relative; z-index: 0; }
.my-map-container .leaflet-pane { z-index: 1; }
.my-map-container .leaflet-top,
.my-map-container .leaflet-bottom { z-index: 2; }
```

### 14f. Loading External Scripts

UIF SPAs may need to load external JavaScript at runtime. Use DOM injection with error handling:

```jsx
var _loadPromise = null;

function loadLibrary() {
    if (_loadPromise) return _loadPromise;
    if (window.L) { _loadPromise = Promise.resolve(window.L); return _loadPromise; }

    _loadPromise = new Promise(function(resolve, reject) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.example.com/lib.css';
        document.head.appendChild(link);

        var script = document.createElement('script');
        script.src = 'https://cdn.example.com/lib.js';
        script.onload = function() { resolve(window.LibGlobal); };
        script.onerror = function() { reject(new Error('Failed to load library')); };
        document.head.appendChild(script);
    });
    return _loadPromise;
}
```

**Module-level promise** prevents duplicate `<script>` injection across component remounts.

**Build pipeline awareness:** The SPA build (`gulpfile.mjs`) copies non-source files from `src/SuiteApps/` to `src/FileCabinet/SuiteApps/` via `bundleAssets()`. Files ending in `.js`, `.jsx`, `.ts`, `.tsx` are treated as source files and **skipped** by `bundleAssets()`. To self-host vendor scripts in FileCabinet, either modify the `isSourceFile()` filter or use a non-source extension.

**NetSuite CSP:** SPAs run on the NetSuite domain. External CDN scripts may be blocked by Content Security Policy. Self-hosting in FileCabinet avoids CSP issues. When using CDN, add `integrity` (SRI) and `crossOrigin="anonymous"` attributes.

### 14g. `useEffect` Dependency Design

Avoid using arrays or objects as `useEffect` dependencies — they create new references on every render, causing the effect to fire repeatedly and rebuild the library instance.

```jsx
// BAD: fires 3+ times per data load cycle (loading→false, error→null, roadshows→[...]).
useEffect(function() { /* build map */ }, [loading, error, roadshows]);

// GOOD: fires once when transitioning to ready state.
var mapReady = !loading && !error;
useEffect(function() {
    if (!mapReady) return;
    // roadshows is captured at effect run time from the outer closure
    // ... build map with current roadshows value
}, [mapReady]);
```

## 15. Module-Level Data Caching

For SPA pages that fetch data on mount, module-level caching prevents re-fetching when navigating back to a page. This pattern survives component remounts during the SPA session.

```jsx
// Module scope; outside the component function
var _pageCache = null;

function MyPage(props) {
    var hasCached = _pageCache !== null;
    var [loading, setLoading] = useState(!hasCached);
    var [error, setError] = useState(null);
    var [data, setData] = useState(hasCached ? _pageCache : []);

    useEffect(function() {
        if (!_pageCache) {
            loadData();
        }
    }, []);

    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            var response = await getMyData({});
            if (response.success) {
                _pageCache = response.data;
                setData(response.data);
            } else {
                setError(safeErrorMessage(response.error));
            }
        } catch (err) {
            setError(safeErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    function handleRefresh() {
        _pageCache = null;
        loadData();
    }

    // ... render with loading / error / data states
}
```

**Key rules:**
- Initialize cache as `null`, check with `!== null` (empty arrays `[]` are valid cached data).
- Always provide a Refresh action that sets `_pageCache = null` before reloading.
- Cache stores the raw data from the server response — state initialization reads from cache on remount.
- The `safeErrorMessage()` helper is commonly duplicated per page; extract to `utils/` if used in 3+ pages.

## 16. Form Building Pattern (Field + FieldGroup + Controls)

The standard NetSuite UIF form pattern uses `Field` as a label-control wrapper, `FieldGroup` to group related fields, and individual controls (`TextBox`, `Dropdown`, `CheckBox`, `DatePicker`, `Switch`, `RadioButtonGroup`) as the inputs.

### 16a. Basic Form Field Pattern

`Field` wraps a single control with a label and optional validation display:

```jsx
import { Field, TextBox, Dropdown, CheckBox, DatePicker, Switch } from '@uif-js/component';
import { ArrayDataSource } from '@uif-js/core';

// Text field
<Field label="Customer Name" mandatory={true} orientation={Field.Orientation.HORIZONTAL}>
    <TextBox
        text={formData.name}
        placeholder="Enter customer name"
        maxLength={100}
        onTextChanged={function(args) {
            setFormData({ ...formData, name: args.text });
        }}
    />
</Field>

// Dropdown field
<Field label="Status" orientation={Field.Orientation.HORIZONTAL}>
    <Dropdown
        dataSource={new ArrayDataSource(statusOptions)}
        displayMember="label"
        valueMember="value"
        selectedValue={formData.status}
        onSelectionChanged={function(args) {
            setFormData({ ...formData, status: args.item ? args.item.value : null });
        }}
    />
</Field>

// Date picker field
<Field label="Due Date" orientation={Field.Orientation.HORIZONTAL}>
    <DatePicker
        date={formData.dueDate}
        onDateChanged={function(args) {
            setFormData({ ...formData, dueDate: args.date });
        }}
    />
</Field>

// Checkbox field
<Field label="Active" orientation={Field.Orientation.HORIZONTAL}>
    <CheckBox
        value={formData.active}
        label="Enable record"
        action={function(args) {
            setFormData({ ...formData, active: args.value });
        }}
    />
</Field>

// Switch (toggle) field
<Field label="Notifications" orientation={Field.Orientation.HORIZONTAL}>
    <Switch
        value={formData.notifications}
        action={function(args) {
            setFormData({ ...formData, notifications: args.value });
        }}
    />
</Field>
```

### 16b. FieldGroup for Grouped Sections

`FieldGroup` creates a visually grouped panel of fields with an optional title and collapse behavior:

```jsx
import { FieldGroup } from '@uif-js/component';

<FieldGroup title="Contact Information" collapsible={true}>
    <Field label="First Name" mandatory={true}>
        <TextBox text={formData.firstName} onTextChanged={...} />
    </Field>
    <Field label="Last Name" mandatory={true}>
        <TextBox text={formData.lastName} onTextChanged={...} />
    </Field>
    <Field label="Email">
        <TextBox text={formData.email} type={TextBox.Type.EMAIL} onTextChanged={...} />
    </Field>
</FieldGroup>
```

### 16c. Field.Mode for View/Edit Toggle

`Field.Mode.VIEW` renders the value as read-only display text; `Field.Mode.EDIT` renders the input control. This is the standard pattern for record view/edit toggle:

```jsx
var [isEditing, setIsEditing] = useState(false);
var fieldMode = isEditing ? Field.Mode.EDIT : Field.Mode.VIEW;

<Field label="Customer Name" mode={fieldMode}>
    <TextBox text={formData.name} onTextChanged={...} />
</Field>
```

### 16d. Field Sizing

Use `Field.Size` to constrain form field widths:

| Size | Use Case |
|------|----------|
| `Field.Size.SMALL` | Short inputs (codes, quantities) |
| `Field.Size.MEDIUM` | Standard fields (names, titles) |
| `Field.Size.LARGE` | Wider fields (addresses, descriptions) |
| `Field.Size.STRETCH` | Full-width (fills container) |

```jsx
<Field label="Item Code" size={Field.Size.SMALL}>
    <TextBox text={code} onTextChanged={...} />
</Field>

<Field label="Description" size={Field.Size.STRETCH}>
    <TextBox text={desc} onTextChanged={...} />
</Field>
```

### 16e. RadioButtonGroup for Exclusive Choice

```jsx
import { RadioButtonGroup, RadioButton } from '@uif-js/component';

<Field label="Priority" orientation={Field.Orientation.HORIZONTAL}>
    <RadioButtonGroup
        selectedData={formData.priority}
        onSelectionChanged={function(args) {
            setFormData({ ...formData, priority: args.data });
        }}
    >
        <RadioButton label="Low" value="low" />
        <RadioButton label="Medium" value="medium" />
        <RadioButton label="High" value="high" />
    </RadioButtonGroup>
</Field>
```

**Note:** Do not use the deprecated `radio` prop on `RadioButton` — use `value` instead.

### 16f. Form Submit Pattern

Collect all form state in a single object and submit via `Ajax.post()` to your SPA server action:

```jsx
var [formData, setFormData] = useState({ name: '', status: null, active: true });
var [saving, setSaving] = useState(false);

async function handleSave() {
    setSaving(true);
    try {
        var response = await Ajax.post(
            '/app/site/hosting/scriptlet.nl?script=custspa_my_app&deploy=1&action=saveRecord',
            formData,
            { responseType: Ajax.ResponseType.JSON }
        );
        if (response.success) {
            // navigate away or show success
        }
    } finally {
        setSaving(false);
    }
}

// Note: Verify ApplicationHeader.ActionType values against @uif-js/component docs.
<ApplicationHeader
    title="Edit Record"
    actions={[[
        { label: 'Save', type: ApplicationHeader.ActionType.PRIMARY, action: handleSave, enabled: !saving },
        { label: 'Cancel', type: ApplicationHeader.ActionType.SECONDARY, action: handleCancel }
    ]]}
/>
```

---

## 17. Notification Patterns (GrowlMessage, Banner)

### 17a. Toast Notifications with GrowlPanel + GrowlMessage

`GrowlPanel` is the container; add `GrowlMessage` instances to it programmatically. The `GrowlPanel` should be placed at the page root level (alongside the content in your shell).

```jsx
import { GrowlPanel, GrowlMessage } from '@uif-js/component';

// In your root component or shell:
var growlPanelRef = useRef(null);

// Notify helper:
function notify(type, title, content) {
    if (!growlPanelRef.current) return;
    var msg = new GrowlMessage({
        title: title,
        content: content,
        type: type,       // GrowlMessage.Type: INFO | SUCCESS | WARNING | ERROR
        showCloseButton: true,
        closeOnClick: true,
    });
    growlPanelRef.current.add(msg);  // method is .add(), not .addMessage()
}

// Usage:
notify(GrowlMessage.Type.SUCCESS, 'Saved', 'Record has been saved.');
notify(GrowlMessage.Type.ERROR, 'Error', 'Failed to save record.');

// Render in JSX (place outside StackPanel content area to avoid layout interference):
<GrowlPanel
    ref={function(panel) { growlPanelRef.current = panel; }}
    position={GrowlPanel.Position.BOTTOM_RIGHT}
/>
```

**Common mistake:** Placing `GrowlPanel` inside a `<StackPanel.Item>` causes it to scroll with content. Place it at the top-level page JSX or use `rootStyle={{ position: 'fixed' }}`.

### 17b. Persistent Banners with Banner

Use `Banner` for persistent informational alerts that stay visible until dismissed:

```jsx
import { Banner } from '@uif-js/component';

{errorMessage ? (
    <Banner
        title="Error"
        content={errorMessage}
        color={Banner.Color.ORANGE}
        showControls={true}
        closeAction={function() { setErrorMessage(null); }}
    />
) : null}
```

Available colors: `Banner.Color.BLUE` (informational), `Banner.Color.BLUE_DARK` (emphasis), `Banner.Color.GREEN` (success), `Banner.Color.ORANGE` (warning/error).

---

## 18. TabPanel for Multi-Section Pages

`TabPanel` organizes content into tabs — the primary pattern for record detail pages with multiple sections (Details, Notes, History, Related Records).

### 18a. Basic TabPanel Pattern

```jsx
import { TabPanel, Tab } from '@uif-js/component';
import { useState, useRef, useEffect } from '@uif-js/core';

function RecordDetail(props) {
    var [activeTab, setActiveTab] = useState('details');
    var tabPanelRef = useRef(null);

    useEffect(function() {
        if (!tabPanelRef.current) return;
        // Subscribe to TAB_SELECTED event; there is no onTabChanged prop.
        return tabPanelRef.current.on(TabPanel.Event.TAB_SELECTED, function(e) {
            setActiveTab(e.value);
        });
    }, []);

    return (
        <TabPanel
            ref={function(c) { tabPanelRef.current = c; }}
            selectedValue={activeTab}
        >
            <Tab label="Details" value="details">
                <DetailsSection record={props.record} />
            </Tab>
            <Tab label="Notes" value="notes" icon={SystemIcon.ADD}>
                <NotesSection id={props.record.id} />
            </Tab>
            <Tab label="History" value="history">
                <HistorySection id={props.record.id} />
            </Tab>
        </TabPanel>
    );
}
```

**Note:** `TabPanel` does not have an `onTabChanged` prop. Listen to tab selection via `tabPanelRef.current.on(TabPanel.Event.TAB_SELECTED, handler)` in a `useEffect`. The cleanup return value from `.on()` unsubscribes when the component unmounts.

### 18b. Lazy-Loading Tab Content

To avoid loading all tab data upfront, only render the active tab's content:

```jsx
<TabPanel ref={...} selectedValue={activeTab}>
    <Tab label="Details" value="details">
        {activeTab === 'details' ? <DetailsSection /> : null}
    </Tab>
    <Tab label="History" value="history">
        {activeTab === 'history' ? <HistorySection /> : null}
    </Tab>
</TabPanel>
```

**Note:** This pattern destroys and recreates the tab's component tree on each tab switch, clearing any local state. Use module-level caching (Section 15) for data that should survive tab switches.

---

## 19. Shared State Management with Store

For SPAs with multiple pages that share state (selected items, user preferences, filter state, loaded data), use the `Store` + `Reducer` pattern instead of prop-drilling through `Router.Routes`.

### 19a. Creating a Store

```jsx
import { Store, Reducer, ImmutableObject } from '@uif-js/core';

// Note: Reducer.create() takes an action handler map. Verify exact API against Oracle sample apps
// as TypeScript types use an options-object pattern. The pattern below is the documented usage.
var appReducer = Reducer.create({
    SET_DATA: function(state, action) {
        return ImmutableObject.set(state, 'data', action.data);
    },
    SET_LOADING: function(state, action) {
        return ImmutableObject.set(state, 'loading', action.loading);
    },
    SET_FILTER: function(state, action) {
        return ImmutableObject.set(state, 'filter', action.filter);
    }
});

// Create store with initial state.
var store = Store.create({
    reducer: appReducer,
    initial: {
        data: [],
        loading: false,
        filter: ''
    }
});
```

### 19b. Providing the Store to the Component Tree

Wrap your root component (or the Router.Routes block) with `Store.Provider`:

```jsx
// In your SPA's root component (run() or initializeSpa()):
function App(props) {
    return (
        <Store.Provider store={store}>
            <StackPanel>
                <StackPanel.Item shrink={0}>
                    <Menu />
                </StackPanel.Item>
                <StackPanel.Item grow={1}>
                    <ScrollPanel {...scrollOptions}>
                        <Router.Routes>
                            <Router.Route path="/list" exact={true}>
                                <ListPage />
                            </Router.Route>
                        </Router.Routes>
                    </ScrollPanel>
                </StackPanel.Item>
            </StackPanel>
        </Store.Provider>
    );
}
```

### 19c. Reading and Writing Store State

Use `useSelector` to read state slices, `useDispatch` to write:

```jsx
import { useSelector, useDispatch } from '@uif-js/core';

function ListPage(props) {
    var data = useSelector(function(state) { return state.data; });
    var loading = useSelector(function(state) { return state.loading; });
    var dispatch = useDispatch();

    useEffect(function() {
        if (!loading && data.length === 0) {
            dispatch({ type: 'SET_LOADING', loading: true });
            loadData().then(function(result) {
                dispatch({ type: 'SET_DATA', data: result });
                dispatch({ type: 'SET_LOADING', loading: false });
            });
        }
    }, []);

    // ...
}
```

You can also access the Store instance directly in deep child components via `useContext(ContextType.STORE)` instead of prop-drilling.

### 19d. When to Use Store vs Local useState

| Pattern | Use When |
|---------|----------|
| `useState` | State is local to one component (form inputs, open/closed toggle) |
| Module-level cache (Section 15) | Data that should survive remount in the same session |
| `Store` | State shared across multiple pages or deeply nested components |

**Tip:** Start with `useState`. Migrate to `Store` only when you find yourself passing the same state/setter as props through 3+ component levels.

### 19e. Combining Multiple Reducers

`Reducer.combine()` takes an array of `WithPath` objects (not a plain object map):

```jsx
var combinedReducer = Reducer.combine([
    { path: 'records', reduce: recordsReducer },
    { path: 'ui', reduce: uiReducer },
    { path: 'filters', reduce: filtersReducer }
]);

var store = Store.create({
    reducer: combinedReducer,
    initial: {
        records: { data: [], loading: false },
        ui: { selectedId: null },
        filters: { query: '', status: 'all' }
    }
});

// Access with namespaced selectors:
var records = useSelector(function(state) { return state.records.data; });
var selectedId = useSelector(function(state) { return state.ui.selectedId; });
```

---

## 20. Async Cancellation Pattern (CancellationToken)

When a component starts an async operation (`Ajax.post()`, `Promise`) and the user navigates away before it completes, the component may have unmounted. Calling `setState` on an unmounted component causes silent state corruption. Use `CancellationTokenSource` to abort in-flight operations during cleanup.

```jsx
import { CancellationTokenSource } from '@uif-js/core';

function DataPage(props) {
    var [data, setData] = useState([]);
    var [loading, setLoading] = useState(true);

    useEffect(function() {
        // Create a cancellation source for this effect instance
        var source = new CancellationTokenSource();
        var token = source.token;

        loadData(token);

        // Cleanup: cancel when component unmounts or effect re-runs
        return function() {
            source.cancel();
        };
    }, []);  // empty deps = run once on mount

    async function loadData(token) {
        try {
            var response = await Ajax.post(
                '/app/site/hosting/scriptlet.nl?...',
                {},
                { responseType: Ajax.ResponseType.JSON }
            );

            // Check before setting state — component may have unmounted
            if (token.cancelled) return;

            setData(response.records);
            setLoading(false);
        } catch (err) {
            if (token.cancelled) return;
            // handle error
        }
    }

    // ...
}
```

**Rule:** Always check `token.cancelled` before calling any state setter in an async function that was started in a `useEffect`. The check is free (a boolean read) and prevents a class of subtle bugs that are difficult to reproduce.

**When to use:**
- Any `useEffect` that starts a fetch/Ajax call.
- Any `useEffect` that starts a multi-step async operation.
- Any `useEffect` with deps that could change while async work is in progress (re-triggers with new token).

---

## 21. Hierarchical Grids with TreeDataSource

For displaying tree-structured data (bill of materials, account hierarchies, nested categories), use `TreeDataSource` with `DataGrid.ColumnType.TREE`.

```jsx
import { TreeDataSource } from '@uif-js/core';
import { DataGrid } from '@uif-js/component';

// Your data: each item has a children array.
var hierarchicalData = [
    {
        id: 1, name: 'Assembly A', qty: 1,
        children: [
            { id: 2, name: 'Part X', qty: 2, children: [] },
            { id: 3, name: 'Part Y', qty: 1, children: [
                { id: 4, name: 'Sub-Part Z', qty: 3, children: [] }
            ]}
        ]
    }
];

// Create a TreeDataSource with a childAccessor.
// childAccessor can be a function OR a string property name (for example, 'children').
var treeDs = new TreeDataSource({
    data: hierarchicalData,
    childAccessor: function(item) { return item.children; }
});

// Use TREE column type for the hierarchy column.
<DataGrid
    dataSource={treeDs}
    maxViewportHeight={400}
    columns={[
        {
            type: DataGrid.ColumnType.TREE,
            name: 'name',
            binding: 'name',
            label: 'Component',
            showTreeLines: true,
            minWidth: 200,
            stretchFactor: 2
        },
        {
            type: DataGrid.ColumnType.TEXT_BOX,
            name: 'qty',
            binding: 'qty',
            label: 'Qty',
            width: 80,
            horizontalAlignment: GridColumn.HorizontalAlignment.RIGHT
        }
    ]}
/>
```

**Updating tree data:**
```jsx
// Replace all data (triggers full grid refresh).
treeDs.setData(newHierarchicalData);

// Add a child item.
treeDs.add(newItem, parentItem);

// Remove an item and all its children.
treeDs.remove(item);
```

**Note:** `DataGrid.ColumnType.TREE` and `DataGrid.ColumnType.DETAIL` serve different purposes. `TREE` is for `TreeDataSource` hierarchies. `DETAIL` is for expandable rows in flat `ArrayDataSource` grids.

---

## Sources

- Oracle official SPA samples: [airport360](https://github.com/oracle-samples/netsuite-suitecloud-samples/tree/main/spa-suiteapp-samples/airport360), [basics-routing](https://github.com/oracle-samples/netsuite-suitecloud-samples/tree/main/spa-suiteapp-samples/basics-routing), [basics-state-management](https://github.com/oracle-samples/netsuite-suitecloud-samples/tree/main/spa-suiteapp-samples/basics-state-management)
- [@oracle/netsuite-uif-types](https://www.npmjs.com/package/@oracle/netsuite-uif-types) NPM package
- NetSuite Help Center: Single Page Applications documentation
