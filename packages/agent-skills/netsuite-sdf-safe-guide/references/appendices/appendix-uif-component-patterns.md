# UIF Component Patterns — Quick Reference Appendix

> Appendix 9 of the SAFE Guide (Principle 12: UIF SPA Best Practices)
> Covers components not fully documented in the main guide.

---

## AccordionPanel — Collapsible Sections

```jsx
import { AccordionPanel, AccordionPanelItem, GapSize } from '@uif-js/component';

// Use global GapSize enum (not AccordionPanel.GapSize)
<AccordionPanel multiple={false} outerGap={GapSize.M}>
    <AccordionPanelItem label="Customer Details" icon={SystemIcon.PERSON}>
        <CustomerDetailsSection />
    </AccordionPanelItem>
    <AccordionPanelItem label="Order Lines" collapsed={true}>
        <OrderLinesSection />
    </AccordionPanelItem>
    <AccordionPanelItem label="Shipping" disabled={!hasShipping}>
        <ShippingSection />
    </AccordionPanelItem>
</AccordionPanel>
```

Key props: `multiple={false}` for single-expand, `fullyCollapsible={true}` to allow all collapsed, `collapsed` on item for initial state.

Note: Use the top-level `GapSize` enum from `@uif-js/component` for gap props — not `AccordionPanel.GapSize`.

---

## Breadcrumbs — Navigation Hierarchy

```jsx
import { Breadcrumbs, BreadcrumbsItem } from '@uif-js/component';

// In page header, before ApplicationHeader or inside ContentPanel.
<Breadcrumbs>
    <BreadcrumbsItem label="Home" route="/" />
    <BreadcrumbsItem label="Customers" route="/customers" />
    <BreadcrumbsItem label="ACME Corp" />  {/* current page — no route */}
</Breadcrumbs>
```

---

## ToolBar — Action Button Groups

```jsx
import { ToolBar, ToolBarGroup } from '@uif-js/component';

<ToolBar>
    <ToolBarGroup>
        <Button label="Save" hierarchy={Button.Hierarchy.PRIMARY} action={handleSave} />
        <Button label="Cancel" hierarchy={Button.Hierarchy.SECONDARY} action={handleCancel} />
    </ToolBarGroup>
    <ToolBarGroup>
        <Button label="Export" icon={SystemIcon.DOWNLOAD_DOCUMENT} action={handleExport} />
    </ToolBarGroup>
</ToolBar>
```

Note: `ToolBarGroup` provides semantic grouping with separator spacing between groups.

---

## Pagination — Server-Side Paging

```jsx
import { Pagination } from '@uif-js/component';

var [currentPage, setCurrentPage] = useState(0);
var [rowsPerPage, setRowsPerPage] = useState(25);
var totalRows = 1250;  // from server

<Pagination
    selectedPageIndex={currentPage}
    rowsCount={totalRows}
    rowsPerPage={rowsPerPage}
    rowsPerPageSelector={{ type: Pagination.RowsPerPageSelector.LIST }}
    onPageSelected={function(args) {
        setCurrentPage(args.pageIndex);
        loadPage(args.pageIndex, rowsPerPage);
    }}
/>
```

`Pagination.RowsCounter` values: `COMPLETE`, `TOTAL`, `UNKNOWN`, `CUSTOM`, `NONE`

Note: `DataGrid` has its own built-in pagination for client-side data. Use standalone `Pagination` for server-side paged queries.

---

## Stepper — Multi-Step Wizards

```jsx
import { Stepper, StepperItem } from '@uif-js/component';

var [currentStep, setCurrentStep] = useState(0);

<Stepper
    selectedStepIndex={currentStep}
    onSelectionChanged={function(args) {
        if (args.stepIndex < currentStep) {
            setCurrentStep(args.stepIndex);  // allow back navigation
        }
    }}
>
    <StepperItem label="Select Customer" done={currentStep > 0} />
    <StepperItem label="Add Items" done={currentStep > 1} />
    <StepperItem label="Review & Submit" />
</Stepper>

{/* Render step content based on currentStep */}
{currentStep === 0 ? <CustomerStep onNext={...} /> : null}
{currentStep === 1 ? <ItemsStep onNext={...} onBack={...} /> : null}
{currentStep === 2 ? <ReviewStep onSubmit={...} onBack={...} /> : null}
```

---

## Popover — Contextual Popup

```jsx
import { Popover } from '@uif-js/component';

var [isOpen, setIsOpen] = useState(false);
var buttonRef = useRef(null);

<Button
    ref={buttonRef}
    label="Options"
    action={function() { setIsOpen(true); }}
/>

{isOpen ? (
    <Popover
        owner={buttonRef.current}
        opened={true}
        size={Popover.Size.MEDIUM}
    >
        <ContentPanel outerGap={ContentPanel.GapSize.MEDIUM}>
            <StackPanel orientation={StackPanel.Orientation.VERTICAL} itemGap={StackPanel.GapSize.S}>
                <Button
                    label="Edit"
                    hierarchy={Button.Hierarchy.SECONDARY}
                    action={function() {
                        handleEdit();
                        setIsOpen(false);
                    }}
                />
                <Button
                    label="Delete"
                    hierarchy={Button.Hierarchy.DANGER}
                    action={function() {
                        handleDelete();
                        setIsOpen(false);
                    }}
                />
            </StackPanel>
        </ContentPanel>
    </Popover>
) : null}
```

**Important:** `Popover` must be placed outside the component that owns the trigger button — otherwise the popup z-index stacks incorrectly. Place it at the page root level using the imperative array pattern.

---

## MultiselectDropdown — Multiple Selection

```jsx
import { MultiselectDropdown } from '@uif-js/component';
import { ArrayDataSource } from '@uif-js/core';

var regionOptions = new ArrayDataSource([
    { value: 'north', label: 'North' },
    { value: 'south', label: 'South' },
    { value: 'east', label: 'East' },
    { value: 'west', label: 'West' }
]);

<Field label="Regions">
    <MultiselectDropdown
        dataSource={regionOptions}
        displayMember="label"
        selectedItems={formData.regions}
        onSelectionChanged={function(args) {
            setFormData({ ...formData, regions: args.selectedItems });
        }}
    />
</Field>
```

`MultiselectDropdown.VisualStyle` values: `STANDALONE`, `EMBEDDED`, `REDWOOD_FIELD`

---

## SplitButton — Button with Dropdown Menu

```jsx
import { SplitButton, Menu, MenuItem } from '@uif-js/component';

<SplitButton
    label="Save"
    type={SplitButton.Type.PRIMARY}
    action={handleSave}
    menu={
        <Menu>
            <MenuItem label="Save & New" action={handleSaveAndNew} />
            <MenuItem label="Save & Close" action={handleSaveAndClose} />
        </Menu>
    }
/>
```

---

## SystemIcon Catalog — Common Icons

The `SystemIcon` namespace has 277 named icons. Common categories:

**Navigation & Actions:**
| Icon | Usage |
|------|-------|
| `SystemIcon.HOME` | Dashboard/home link |
| `SystemIcon.MENU` | Hamburger/navigation toggle |
| `SystemIcon.SEARCH` | Search button |
| `SystemIcon.ADD` | Create new |
| `SystemIcon.EDIT` | Edit action |
| `SystemIcon.DELETE` | Delete action |
| `SystemIcon.SAVE` | Save action |
| `SystemIcon.CLOSE` | Close/cancel |
| `SystemIcon.REFRESH` | Reload data |
| `SystemIcon.FILTER` | Filter toggle |
| `SystemIcon.DOWNLOAD_DOCUMENT` | Export/download |
| `SystemIcon.UPLOAD_DOCUMENT` | Import/upload |
| `SystemIcon.SETTINGS` | Settings/configuration |
| `SystemIcon.PRINT` | Print |

**Status & Feedback:**
| Icon | Usage |
|------|-------|
| `SystemIcon.INFO` | Informational note |
| `SystemIcon.ALERT` | Warning/alert (not `SystemIcon.WARNING` — does not exist) |
| `SystemIcon.HELP` | Help/tooltip |
| `SystemIcon.NOTIFICATION` | Alert badge |
| `SystemIcon.LOCK` | Secured/restricted |

**Data & Content:**
| Icon | Usage |
|------|-------|
| `SystemIcon.FILE` | Document/attachment |
| `SystemIcon.CHART_BAR` | Analytics/reports |
| `SystemIcon.CALENDAR` | Date-related |
| `SystemIcon.EMAIL` | Communications |
| `SystemIcon.PERSON` | Person/contact (not `SystemIcon.USER` — does not exist) |
| `SystemIcon.GLOBE` | Geography/website |

**NetSuite Record Icons** (from `RecordIcon` namespace, 43 total):

| Icon | Record Type |
|------|-------------|
| `RecordIcon.CUSTOMER` | Customer records |
| `RecordIcon.EMPLOYEE` | Employee records |
| `RecordIcon.INVOICE` | Invoice records |
| `RecordIcon.SALES_ORDER` | Sales orders |
| `RecordIcon.ITEM` | Inventory items |
| `RecordIcon.CONTACT` | Contact records |
| `RecordIcon.CASE` | Support cases |
| `RecordIcon.TASK` | Tasks |

Import: `import { SystemIcon, RecordIcon } from '@uif-js/core'`

Grep `SystemIcon` in `core.d.ts` for the full 277-icon catalog.

---

## ImmutableArray / ImmutableObject — Safe State Updates

Use these utilities to update arrays and objects in state without direct mutation:

```jsx
import { ImmutableArray, ImmutableObject } from '@uif-js/core';

// Arrays — all return NEW arrays
var newItems = ImmutableArray.push(items, newItem);
var filtered = ImmutableArray.filter(items, function(x) { return x.active; });
var updated = ImmutableArray.set(items, index, updatedItem);
var removed = ImmutableArray.remove(items, itemToRemove);

// Objects — all return NEW objects
var newState = ImmutableObject.set(state, 'loading', true);
var merged = ImmutableObject.merge(state, { loading: false, data: result });
var cleaned = ImmutableObject.remove(state, 'tempKey');
```

**Rule:** Never `push()`, splice, or assign directly to state arrays/objects. UIF state watchers compare references; mutating in place means the component sees no change.

---

## FormatService — Locale-Aware Date/Number Formatting

```jsx
import { FormatService, Format } from '@uif-js/core';

// Get i18n context
var i18n = useContext(ContextType.I18N);

// Format a UIF Date to display string.
var displayDate = FormatService.forI18n(i18n).format(uifDate, Format.DATE);
var displayDateTime = FormatService.forI18n(i18n).format(uifDate, Format.DATE_TIME);
var displayAmount = FormatService.forI18n(i18n).format(amount, Format.FLOAT);

// Parse a string back to typed value
var parsed = FormatService.forI18n(i18n).parse(dateString, Format.DATE);
```

`Format` enum values: `DATE`, `DATE_TIME`, `TIME`, `INTEGER`, `FLOAT`

---

## LazyDataSource — Server-Side Pagination Data

```jsx
import { LazyDataSource, ArrayDataSource } from '@uif-js/core';

// Wrap any async data loader
var lazyDs = new LazyDataSource(function() {
    return fetch('/api/data').then(function(response) {
        return response.json();
    }).then(function(data) {
        return new ArrayDataSource(data);
    });
});

// Trigger load (call once in useEffect or on demand).
lazyDs.load();

// Check status
if (lazyDs.loaded) {
    // data is ready
}

// Use with DataGrid paging for server-side pagination.
<DataGrid dataSource={lazyDs} paging={true} pageSize={25} ... />
```

---

## EventBus — Cross-Component Communication

For decoupled communication between components that don't share a common ancestor (or where prop-drilling would be impractical):

```jsx
import { EventBus } from '@uif-js/core';

var eventBus = new EventBus();

// Subscribe to events from a sender.
var unsubscribe = eventBus.subscribe(senderComponent, function(event) {
    // handle event
});

// Publish an event
eventBus.publish(senderComponent, { type: 'RECORD_SAVED', id: recordId });

// Cleanup in useEffect return.
return function() { unsubscribe(); };
```

---

## UIF RoutedMessage System — Event Interception

UIF does **not** use standard DOM events for component interactions. It has its own `RoutedMessage` pipeline. Standard `document.addEventListener('click', ...)` **cannot** intercept UIF component clicks, and `stopImmediatePropagation()` has no effect.

### Message Filter API

Every `Component` supports message filtering via `addMessageFilter()`:

```jsx
import { FilterCode } from '@uif-js/core';

var agendaRef = useRef(null);

useEffect(function() {
    if (!agendaRef.current) return;

    // Record form — only fires for CLICK messages
    var handle = agendaRef.current.addMessageFilter({
        [FilterCode.CLICK]: function(message, result) {
            result.handled = true;
            result.executeDefault = false;
            result.stopPropagation = true;
        }
    });

    return function() { handle.remove(); };
}, [agendaRef.current]);
```

### PropertyObservable — Detecting Internal Property Changes

Every UIF Component extends `PropertyObservable`:

```jsx
// Detect when user switches Agenda view tabs
var handle = agendaRef.current.onPropertyChanged('selectedView', function(args) {
    console.log('View changed to:', args.newValue);
});
// Cleanup: handle.remove();
```

---

## MutationObserver — Intercepting Built-In UIF Dialogs

When a UIF component opens a built-in dialog that cannot be suppressed through props (for example, the Agenda's "Edit Event" dialog in the Agenda/list view — see Section 11 of the main guide), use a `MutationObserver`:

```jsx
useEffect(function() {
    var observer = new MutationObserver(function(mutations) {
        for (var m = 0; m < mutations.length; m++) {
            var added = mutations[m].addedNodes;
            for (var n = 0; n < added.length; n++) {
                var node = added[n];
                if (node.nodeType !== 1) continue;

                // Detect dialog by title text
                var allText = node.querySelectorAll ? node.querySelectorAll('*') : [];
                var isTargetDialog = false;
                for (var t = 0; t < allText.length; t++) {
                    if ((allText[t].textContent || '').trim() === 'Edit Event') {
                        isTargetDialog = true;
                        break;
                    }
                }
                if (!isTargetDialog) continue;

                // Hide immediately (runs as microtask BEFORE repaint; no flash).
                node.style.display = 'none';

                // Hide overlay/backdrop.
                if (node.previousElementSibling) {
                    var prev = node.previousElementSibling;
                    var prevStyle = window.getComputedStyle(prev);
                    if (prevStyle.position === 'fixed' || prevStyle.zIndex > 100) {
                        prev.style.display = 'none';
                    }
                }

                // Extract data from dialog inputs.
                var nameInput = node.querySelector('input');
                var eventName = nameInput ? nameInput.value.trim() : '';

                // Click Cancel to dismiss from UIF's internal state.
                var allButtons = node.querySelectorAll('button, [role="button"]');
                for (var b = 0; b < allButtons.length; b++) {
                    var btnText = (allButtons[b].textContent || '').trim();
                    if (btnText === 'Cancel' || btnText === '\u00D7') {
                        allButtons[b].click();
                        break;
                    }
                }

                // Open your custom handler.
                if (eventName) handleCustomAction(eventName);
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return function() { observer.disconnect(); };
}, []);
```

**Key points:**
- MutationObserver callbacks run as microtasks *before* browser repaint; no visible flash.
- Always click Cancel/Close to properly dismiss the dialog from UIF's internal state.
- Store data references in `useRef` so the observer callback has access to current state.