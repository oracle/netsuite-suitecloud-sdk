{{#if isCurrentItemPurchasable}}
	<div class="cart-add-to-cart-button-container">
		<div class="cart-add-to-cart-button">
			<button type="submit" data-type="add-to-cart" data-action="sticky" class="cart-add-to-cart-button-button">
				{{#if isUpdate}}{{translate 'Update'}}{{else}}{{translate 'Add to Cart'}}{{/if}}
			</button/>
		</div>
	</div>
{{/if}}



{{!----
Use the following context variables when customizing this template: 
	
	isCurrentItemPurchasable (Boolean)
	isUpdate (Boolean)

----}}
