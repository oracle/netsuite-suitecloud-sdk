<div id="{{lineId}}" data-item-id="{{itemId}}" data-type="order-item" class="cart-lines-free-row">
	<div class="cart-lines-free-col-first">
		<div class="cart-lines-free-thumbnail">
			<span class="cart-lines-free-badge">{{translate 'FREE'}}</span>
			<img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
		</div>
	</div>
	<div class="cart-lines-free-col-middle">
		<div class="cart-lines-free-name">
		{{#if isNavigable}}
			<a {{{linkAttributes}}} class="cart-lines-free-name-link">
				{{item._name}}
			</a>
		{{else}}
				<span class="cart-lines-free-name-viewonly">{{item._name}}</span>
		{{/if}}
		</div>

		<div data-view="Item.Sku"></div>
		<div data-view="Item.Tax.Info"></div>

		<div class="cart-lines-free-options">
			<div data-view="Item.SelectedOptions"></div>
		</div>

		<div class="cart-lines-free-item-summary">
			<div class="cart-lines-free-item-summary-container-qty">
				<label class="cart-lines-free-item-summary-container-qty-label">{{translate 'Quantity:'}}</label>
				{{#if isQtyEditable}}
					<div class="cart-lines-free-item-summary-container-qty-input">
							<button type="button" class="cart-lines-free-item-summary-quantity-remove" data-action="minus" {{#if isMinusButtonDisabled}}disabled{{/if}}>-</button>
							<input type="number" data-type="cart-free-item-quantity-input" name="quantity" id="quantity-{{lineId}}" class="cart-lines-free-item-summary-quantity-value quantity-{{lineId}}" value="{{line.quantity}}" min="1" max="{{qtyElegible}}"/>
							<button type="button" class="cart-lines-free-item-summary-quantity-add" data-action="plus">+</button>
					</div>
				{{else}}
					<span class="cart-lines-free-item-summary-container-qty-value" data-type="cart-free-item-quantity-span">{{line.quantity}}</span>
				{{/if}}
			</div>

			<div class="cart-lines-free-item-summary-amount">
				<span class="cart-lines-free-item-summary-amount-label">{{translate 'Amount: ' }}</span>
				<span class="cart-lines-free-item-summary-amount-value">{{ line.total_formatted }}</span>
				<small class="muted cart-lines-free-item-summary-view-old-price">{{ line.amount_formatted}}</small>
			</div>
		</div>

		<div data-view="StockDescription"></div>
		<button class="cart-lines-free-item-actions" data-action="remove-free-gift">Remove</button>
	</div>
	<div class="cart-lines-free-col-last">
		<button class="cart-lines-free-item-actions" data-action="remove-free-gift">Remove</button>
        <div class="cart-lines-free-shipping-method" data-view="CartLines.PickupInStore"></div>

		<div class="cart-lines-free-stock" data-view="Product.Stock.Info"></div>

		<div class="cart-lines-free-alert-placeholder" data-type="alert-placeholder"></div>
	</div>
</div>




{{!----
Use the following context variables when customizing this template:

	line (Object)
	line.item (Object)
	line.item.internalid (Number)
	line.item.type (String)
	line.quantity (Number)
	line.internalid (String)
	line.options (Array)
	line.location (String)
	line.fulfillmentChoice (String)
	lineId (String)
	item (Object)
	item.isinactive (Boolean)
	item.isinstock (Boolean)
	item.isonline (Boolean)
	item.matrixchilditems_detail (undefined)
	item.itemid (String)
	item.minimumquantity (undefined)
	item.ispurchasable (Boolean)
	item.stockdescription (String)
	item.isbackorderable (Boolean)
	item.itemimages_detail (Object)
	item.onlinecustomerprice_detail (Object)
	item.onlinecustomerprice_detail.onlinecustomerprice_formatted (String)
	item.onlinecustomerprice_detail.onlinecustomerprice (Number)
	item.internalid (Number)
	item.showoutofstockmessage (Boolean)
	item.itemtype (String)
	item.outofstockmessage (String)
	item.itemoptions_detail (Object)
	item.itemoptions_detail.fields (Array)
	item.itemoptions_detail.fields.0 (Object)
	item.itemoptions_detail.fields.0.internalid (String)
	item.itemoptions_detail.fields.0.label (String)
	item.itemoptions_detail.fields.0.type (String)
	item.displayname (String)
	item.storedisplayname2 (String)
	item.pricelevel1 (Number)
	item.pricelevel1_formatted (String)
	item.urlcomponent (String)
	item._optionsDetails (Object)
	item._optionsDetails.fields (Array)
	item._optionsDetails.fields.0 (Object)
	item._optionsDetails.fields.0.internalid (String)
	item._optionsDetails.fields.0.label (String)
	item._optionsDetails.fields.0.type (String)
	item._matrixParent (Object)
	item._matrixParent.options (Array)
	item.options (Array)
	item.options.0 (Object)
	item.options.0.cartOptionId (String)
	item.options.0.itemOptionId (String)
	item.options.0.label (String)
	item.options.0.type (String)
	item._url (String)
	item._isPurchasable (Boolean)
	item._name (String)
	item._priceDetails (Object)
	item._priceDetails.onlinecustomerprice_formatted (String)
	item._priceDetails.onlinecustomerprice (Number)
	item._comparePriceAgainst (Number)
	item._comparePriceAgainstFormated (String)
	item._isInStock (Boolean)
	item._outOfStockMessage (String)
	item._showOutOfStockMessage (Boolean)
	item._inStockMessage (String)
	item._showInStockMessage (Boolean)
	item._stockDescription (String)
	item._showStockDescription (Boolean)
	item._stockDescriptionClass (String)
	item._quantityavailableforstorepickup_detail (Array)
	item._showQuantityAvailable (Boolean)
	item._sku (String)
	item._minimumQuantity (Number)
	item._itemType (String)
	itemId (Number)
	linkAttributes (String)
	isNavigable (Boolean)
	showCustomAlert (Boolean)
	customAlertType (String)
	showActionsView (Boolean)
	showSummaryView (Boolean)
	showAlert (Boolean)
	showGeneralClass (Boolean)
	thumbnail (Object)
	thumbnail.url (String)
	thumbnail.altimagetext (String)

----}}
