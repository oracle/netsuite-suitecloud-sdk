{{#if showPromo}}
	<div class="cart-promocode-list-item" data-id="{{internalid}}">
		<div class="cart-promocode-list-item-container">
			{{#if showDiscountRate}}
				<span class="cart-promocode-list-item-discount">{{discountRate}}</span>
			{{/if}}
			<span class="cart-promocode-list-item-code">
				<span class="cart-promocode-list-item-code-label">{{translate 'Promo: '}}</span>
				<span class="cart-promocode-list-item-code-value">{{code}}</span>
			</span>
			{{#if isEditable}}
				<a href="#" data-action="remove-promocode" data-id="{{internalid}}">
					<span class="cart-promocode-list-item-remove-action"><i></i></span>
				</a>
			{{/if}}

			{{#if showWarning}}
				<span class="cart-promocode-list-item-warning" >
					<i data-toggle="tooltip" data-container=".cart-promocode-list-item-warning" data-placement="bottom" title="{{errorMessage}}"></i>
				</span>
			{{/if}}
		</div>
	</div>
{{/if}}

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
