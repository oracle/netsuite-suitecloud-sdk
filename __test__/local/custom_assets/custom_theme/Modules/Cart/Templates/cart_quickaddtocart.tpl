<form class="cart-quickaddtocart" data-action="add-to-cart">
	<div data-view="ProductViewsPrice.Price" class="cart-quickaddtocart-price"></div>
	{{#if showQuickAddToCartButton}}
		<div data-view="AddToCart">
			<input name="quantity" data-action="setquantity" class="cart-quickaddtocart-quantity" type="number" min="{{minimumQuantity}}"{{#if isMaximumQuantity}} max="{{maximumQuantity}}"{{/if}} value="{{quantity}}"/>
		</div>
	{{/if}}
</form>




{{!----
Use the following context variables when customizing this template: 
	
	itemId (Number)
	showQuickAddToCartButton (Boolean)
	minimumQuantity (Number)
	quantity (Number)

----}}
