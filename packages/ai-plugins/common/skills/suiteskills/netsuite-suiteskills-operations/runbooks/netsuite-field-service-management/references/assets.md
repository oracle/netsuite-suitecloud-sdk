# Assets and service history

FSM Assets represent serviceable sites, machines or components and are distinct from native NetSuite Items, Locations and fixed assets. A common hierarchy runs from site to machine to component without restricting what an Asset can represent. An Asset or Task may identify the site or parent instead of the individual component serviced. Account configuration, permissions and queued processing determine which relationships and changes are available.

## Hierarchy, customers and location

Parent settings control which fields are inherited and which are available only on parent Assets. Selecting a parent on the editable Asset form disables the configured inherited and parent-only fields. By default, inherited fields include primary Customer, address reference, address text and Region. They exclude latitude, longitude and timezone.

The child model sources configured inherited values from its parent and clears configured parent-only values. Parent changes can queue child updates, and Asset location changes can queue updates to related work. Inspect effective configuration, child values and processing state before treating inheritance as immediate or historically constant.

`custrecord_nx_asset_customer` is the primary Customer; `custrecord_nx_asset_customers` holds additional Customers. The default Asset model's `customers` alias resolves the primary Customer, not the additional-Customers multiselect.

Adding an additional Customer association does not by itself make that Customer the billing entity, grant Mobile or general viewing rights, or reattribute existing financial transactions. Customer eligibility and Project behavior with multiple Assets depend on configuration. Resolve multiselect labels by ID because the ID and label arrays can have different orders.

An Asset can have usable coordinates without an address. Establish whether its location came from direct entry, a Customer address, inheritance or geocoding. Address geocoding runs only when enabled. Address Select can overwrite Address Text on save, and an existing latitude can prevent geocoding from running again for an address. A text change alone does not prove that coordinates changed.

Region can represent a service area. It supplies neither coordinates nor travel time and does not automatically match Employee Region. Whether Mobile captures the serviced child Asset depends on configured resources and the saved record; hierarchy alone does not ensure capture. See [Mobile](mobile.md) for capture behavior and [scheduling](scheduling.md) for use of locations in dispatch.

## Item-driven Project creation

`custrecord_nx_asset_item` points to a distinct NetSuite Item. The Asset Item picker includes only Items marked Field Service Asset (`custitem_nx_asset`). When the Item has `custitem_nx_project_type`, the default Asset creation path maps its Project Type into a new Project and queues creation after the Asset has an ID.

The Item's month-based `custitem_nx_project_duration` supplies the intended term. The Project Start Date uses the current timestamp in the Asset timezone when available, otherwise the session timezone. Its End Date is `ADD_MONTHS(current timestamp, custitem_nx_project_duration) - 1 day`. The trigger checks Project Type but does not require a positive, nonblank Duration, so verify the configured Duration and resulting dates.

A generic Asset record create does not reproduce the specialized Item picker and script steps. Confirm the supported creation operation and resulting queue state before expecting an Item-driven Project.

The Item or effective override controls the generated Project Type; `warranty.asset` does not force it to Warranty. Item settings do not necessarily persist as Asset fields. Assigning or changing the Item after Asset creation does not trigger Project creation.

Project creation is asynchronous. Before retrying, inspect effective configuration, queue state and existing Projects linked to the Asset, then verify the resulting Project Type, Asset, Customer and dates. Item-driven creation of Projects from Assets is separate from [Case generation by Project programs](recurrence-and-programs.md); either can be configured without the other.

## Fulfillment and service history

Field Service Asset on an Item controls eligibility for Asset creation on fulfillment. Field Service Show on Mobile separately controls Item selection for quotes and orders. The configured fulfillment path can queue an Asset save, but fulfillment alone does not prove that an Asset was created. Automatic creation may require a fulfillment saved through the NetSuite UI; a Mobile fulfillment alone does not establish it. Check the resulting Asset and processing state. See [materials and inventory](materials-and-inventory.md) for stock and fulfillment behavior.

Asset history can combine completed CRM Tasks, enabled Project Tasks, Sales Order lines and accessible files. Install, maintenance, repair and uninstall records add Asset, Project, Case and Task relationships. Job-safety records have Asset and Task relationships, but need not share the other service records' full set of relationships.

Visibility and child-Asset selection depend on effective resources and permissions. Check the underlying work and transactions before treating the displayed history as complete. See the [service workflow](../workflows/service-work.md) for reconciliation.
