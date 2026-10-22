# Materials and inventory

Material handling depends on effective configuration, NetSuite inventory features, permissions and subsidiary. A saved usage record, order, fulfillment and receipt are separate outcomes. See [billing](billing.md) for pricing, Case transactions and invoices.

## Material usage and item choices

`customrecord_nx_consumable` records CRM Task item usage. Task, Item and quantity are required business inputs. Case and Asset can come from the Task, and the record can also carry employee, location and transaction context. A Project Task uses a Sales Order for parts instead of Consumables. Check the saved record against the [Asset capture path](financial-reporting.md#asset-capture-paths) before relying on its attribution.

Consumables and direct Sales Order entry support inventory and serial/lot items, plus eligible sale/resale service, non-inventory and other-charge Items. Purchase-only Items and description, discount, markup, payment and subtotal lines are not normal material choices.

Consumables does not support kits. Sales Order kit availability may check only one kit instead of the requested quantity, so fulfillment can still fail. An item-group ending line with blank quantity can block later editing.

Field Service Show on Mobile controls Item selection for quotes and orders, separately from [fulfillment-driven Asset eligibility](assets.md#fulfillment-and-service-history). Consumable choices also depend on configured Item searches and stock at the technician's location.

`custrecord_nx_conserial` can hold an Inventory Number ID for a serial or lot; `custrecord_nx_conseriallabel` holds display text. Use the representation required by the current operation, without writing a displayed label into an ID field. Fulfillment also needs the applicable Item, location and serial, lot or bin assignments. Cross-subsidiary settings affect location selection.

## Technician stock and transfers

A Location can represent warehouse or technician van stock and is distinct from the customer service address. Vans commonly hold available inventory without bins, while warehouses may use bins. A transfer to a technician needs the correct destination, receipt and Mobile refresh before the stock appears. Inventory adjustments are for approved counts or opening-balance corrections; do not use them to work around transfer errors.

Transfer Order requests warehouse stock. Receive records a transfer receipt into technician stock, and Return prepares stock for the warehouse. Open status controls editable fields. Transfer requests need a source Location and at least one line.

The supported stock paths can sync Transfer Orders and create Item Receipts through a supported transform. One technician should manage a Mobile Sales Order's stock from their Location. A receipt is not an Item Fulfillment or a final billing result. See [Mobile](mobile.md) for cached choices and receipt-list visibility.

## Orders and fulfillment

Configured Consumables processing can fulfill eligible Sales Order lines by Location and Task after the separate [Case billing stages](billing.md#case-consumable-billing). Order creation alone does not establish fulfillment. Stock and material paths can create or replace Item Fulfillments. Inventory Status may require a supported manual-fulfillment path. Diagnose the failed operation; do not change fulfillment settings to bypass it.

Support for partial fulfillment and serialized fulfillment depends on the exact operation. Do not assume the standard Mobile order supports partial line fulfillment. Mobile fulfillment uses Shipped status and does not provide full Pick/Pack/Ship handling. Check the order, fulfillment, stock balance and resulting Asset separately, applying the [Asset creation conditions](assets.md#fulfillment-and-service-history). See [Mobile](mobile.md) for entry, line-editing and offline behavior.
