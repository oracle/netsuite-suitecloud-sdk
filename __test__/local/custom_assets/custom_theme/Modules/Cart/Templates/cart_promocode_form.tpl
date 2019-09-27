<form class="cart-promocode-form" data-action="apply-promocode">
	<div class="cart-promocode-form-summary-grid">
		<div class="cart-promocode-form-summary-container-input">
			<div class="{{#if showErrorMessage}}error{{/if}}">
				<!-- Placeholder removed on SCA 2015 / placeholder="{{translate 'Promo code'}}" -->
				<input
					{{#if isSaving}}disabled{{/if}}
					type="text"
					name="promocode"
					id="promocode"
					class="cart-promocode-form-summary-input"
					value="{{promocodeCode}}"
				>
			</div>
		</div>
		<div class="cart-promocode-form-summary-promocode-container-button">
			<button type="submit" class="cart-promocode-form-summary-button-apply-promocode" {{#if isSaving}}disabled{{/if}}>
				{{translate 'Apply'}}
			</button>
		</div>
	</div>
	<div data-type="promocode-error-placeholder">
		{{#if showErrorMessage}}
			<div data-view="GlobalsViewErrorMessage"></div>
		{{/if}}
	</div>
</form>




{{!----
Use the following context variables when customizing this template:

	showErrorMessage (Boolean)
	errorMessage (undefined)
	promocodeCode (String)
	isSaving (Boolean)

----}}
