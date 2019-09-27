{{#if isPriceEnabled}}
<div class="cart-item-summary-item-list-actionable-qty">
	<form action="#" class="cart-item-summary-item-list-actionable-qty-form" data-action="update-quantity" data-validation="control-group">
		<input type="hidden" name="internalid" id="update-internalid-{{lineId}}" class="update-internalid-{{lineId}}" value="{{lineId}}">
		<label for="quantity-{{lineId}}" data-validation="control">
			{{#if showQuantity}}
				<input type="hidden" name="quantity" id="quantity-{{lineId}}" value="1">
			{{else}}
				<div class="cart-item-summary-item-list-actionable-container-qty">
					<label class="cart-item-summary-item-list-actionable-label-qty">{{translate 'Quantity:'}}</label>
					<div class="cart-item-summary-item-list-actionable-input-qty">
							<button type="button" class="cart-item-summary-quantity-remove" data-action="minus" {{#if isMinusButtonDisabled}}disabled{{/if}}>-</button>
							<input type="number" data-type="cart-item-quantity-input" name="quantity" id="quantity-{{lineId}}" class="cart-item-summary-quantity-value quantity-{{lineId}}" value="{{line.quantity}}" min="1"/>
							<button type="button" class="cart-item-summary-quantity-add" data-action="plus" {{#if isPlusButtonDisabled}}disabled{{/if}}>+</button>
					</div>
					{{#if showMinimumQuantity}}
						<small class="cart-item-summary-quantity-title-help">
							{{translate 'Minimum of $(0) required' minimumQuantity}}
						</small>
					{{/if}}
					{{#if showMaximumQuantity}}
						<small class="cart-item-summary-quantity-title-help">
							{{translate 'A maximum of $(0) is allowed' maximumQuantity}}
						</small>
					{{/if}}
				</div>
			{{/if}}
			<div data-type="alert-placeholder"></div>
		</label>
	</form>
</div>

<div data-view="Quantity.Pricing"></div>

<div class="cart-item-summary-item-list-actionable-amount">
	<span class="cart-item-summary-item-list-actionable-amount-label">{{translate 'Amount: ' }}</span>
	<span class="cart-item-summary-amount-value">{{ totalFormatted }}</span>
	{{#if showComparePrice}}
		<small class="muted cart-item-summary-item-view-old-price">{{ line.amount_formatted}}</small>
	{{/if}}
</div>

<div data-view="PromocodeList" class="cart-item-summary-promocodes"></div>
{{/if}}




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
	isMinusButtonDisabled (Boolean)
	showQuantity (Boolean)
	showComparePrice (Boolean)
	showMinimumQuantity (Boolean)
	minimumQuantity (Number)
	isPriceEnabled (Boolean)

----}}