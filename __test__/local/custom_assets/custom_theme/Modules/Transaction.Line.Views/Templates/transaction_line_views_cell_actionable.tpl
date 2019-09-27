<tr id="{{lineId}}" data-item-id="{{itemId}}" data-type="order-item" {{#if showGeneralClass}} class="{{generalClass}}" {{/if}} >
	<td class="transaction-line-views-cell-actionable-table-first">
		<div class="transaction-line-views-cell-actionable-thumbnail">
			{{#if isFreeGift}}
	    		<span class="transaction-line-views-cell-actionable-free-badge">{{translate 'FREE'}}</span>
	    	{{/if}}
			{{#if isNavigable}}
				<a {{{linkAttributes}}}>
					<img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
				</a>
			{{else}}
				<img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
			{{/if}}
		</div>
	</td>
	<td class="transaction-line-views-cell-actionable-table-middle">
		<div class="transaction-line-views-cell-actionable-name">
		{{#if isNavigable}}
			<a {{{linkAttributes}}} class="transaction-line-views-cell-actionable-name-link">
				{{item._name}}
			</a>
		{{else}}
				<span class="transaction-line-views-cell-actionable-name-viewonly">{{item._name}}</span>
		{{/if}}
		</div>
		{{#unless isFreeGift}}
		<div class="transaction-line-views-cell-actionable-price">
			<div data-view="Item.Price"></div>
		</div>
	    {{/unless}}
		<div data-view="Item.Sku"></div>
		<div data-view="Item.Tax.Info"></div>
		<div class="transaction-line-views-cell-actionable-options">
			<div data-view="Item.SelectedOptions"></div>
		</div>
		{{#if showSummaryView}}
			<div class="transaction-line-views-cell-actionable-summary" data-view="Item.Summary.View"></div>
		{{/if}}
		<div class="transaction-line-views-cell-actionable-stock" data-view="ItemViews.Stock.View">
		</div>

		<div data-view="StockDescription"></div>
	</td>
	<td class="transaction-line-views-cell-actionable-table-last">
		<div data-view="Item.Actions.View"></div>

		{{#if showAlert}}
			<div class="transaction-line-views-cell-actionable-alert-placeholder" data-type="alert-placeholder"></div>
		{{/if}}

		{{#if showCustomAlert}}
			<div class="alert alert-{{customAlertType}}">
				{{item._cartCustomAlert}}
			</div>
		{{/if}}
	</td>
</tr>




{{!----
Use the following context variables when customizing this template: 
	
	line (Object)
	line.item (Object)
	line.item.internalid (Number)
	line.item.type (String)
	line.quantity (Number)
	line.internalid (String)
	line.options (Array)
	line.options.0 (Object)
	line.options.0.cartOptionId (String)
	line.options.0.itemOptionId (String)
	line.options.0.label (String)
	line.options.0.type (String)
	line.options.0.value (Object)
	line.options.0.value.internalid (String)
	line.shipaddress (undefined)
	line.shipmethod (undefined)
	line.location (String)
	line.fulfillmentChoice (String)
	model (Object)
	model.item (Object)
	model.item.internalid (Number)
	model.item.type (String)
	model.quantity (Number)
	model.internalid (String)
	model.options (Array)
	model.options.0 (Object)
	model.options.0.cartOptionId (String)
	model.options.0.itemOptionId (String)
	model.options.0.label (String)
	model.options.0.type (String)
	model.options.0.value (Object)
	model.options.0.value.internalid (String)
	model.shipaddress (undefined)
	model.shipmethod (undefined)
	model.location (String)
	model.fulfillmentChoice (String)
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
	item._isPurchasable (Boolean)
	item._url (String)
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
	item._itemType (String)
	item._id (Number)
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
