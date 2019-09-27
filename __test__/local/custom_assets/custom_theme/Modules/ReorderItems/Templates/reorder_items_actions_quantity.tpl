<div class="reorder-items-actions-quantity">
	{{#if showQuantityInput}}
		<label class="reorder-items-actions-quantity-label">{{translate 'Quantity:'}}</label>
		<div class="reorder-items-actions-quantity-input">
			<button class="reorder-items-actions-quantity-remove" data-action="minus">-</button>
				<input type="number" name="item_quantity" data-line-id="{{lineId}}" value="{{itemQuantity}}" class="reorder-items-actions-quantity-value" min="{{minimumQuantity}}" {{#if showMaximumQuantity}} max="{{maximumQuantity}}"{{/if}}>
			<button class="reorder-items-actions-quantity-add" data-action="plus">+</button>
		</div>
	{{else}}
		<div data-view="Item.Stock"></div>
	{{/if}}
</div>
<div data-view="Quantity.Pricing"></div>
{{#if showLastPurchased}}
	<p class="reorder-items-actions-quantity-last-purchased">{{translate 'Last purchased on $(0)' line.trandate}}</p>
{{/if}}

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
