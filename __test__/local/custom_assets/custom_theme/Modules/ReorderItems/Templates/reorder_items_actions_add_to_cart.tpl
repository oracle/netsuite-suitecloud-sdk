<div class="reorder-items-actions-add-to-cart-button-container">
	<button 
		data-item-id="{{itemId}}" 
		data-line-id="{{lineId}}" 
		data-parent-id="{{parentItemId}}" 
		data-item-options="{{itemOptions}}" 
		data-action="add-to-cart" 
		{{#if disableButtonAddToCart}} disabled {{/if}} 
		class="reorder-items-actions-add-to-cart">
		{{translate 'Add to Cart'}}	
	</button>
</div>


{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
