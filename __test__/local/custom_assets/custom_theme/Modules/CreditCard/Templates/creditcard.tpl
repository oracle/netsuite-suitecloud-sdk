{{#if isNewPaymentMethod}}
	<a class="creditcard creditcard-new-card" href="/creditcards/new" data-toggle="show-in-modal">
		<div class="creditcard-new-card-title">
			<p><i class="creditcard-new-card-plus-icon"></i></p>
			{{translate 'Add Card'}}
		</div>
	</a>
{{else}}
	{{#if showSelector}}
		<a class="creditcard-selector {{#if isSelected}}creditcard-selected{{/if}}" data-action="select" data-id="{{creditCartId}}">
			<input type="radio" name="cards-options" class="creditcard-selector-option" data-id="{{creditCartId}}" value="{{creditCartId}}" {{#if isSelected}} checked {{/if}}>
			{{#if isSelected}}
				<b>{{translate 'Selected'}}</b>
			{{else}}
				{{translate 'Select'}}
			{{/if}}
		</a>
	{{/if}}

	<div class="creditcard {{#if isSelected}}creditcard-selected{{/if}}" data-id="{{creditCartId}}">
		<div class="creditcard-container">
			<div>
				{{#if showSecurityCodeForm}}
					<div class="creditcard-section">
				{{/if}}

				<div class="creditcard-header">
					{{#if showCreditCardImage}}
						<img class="creditcard-header-icon" src="{{creditCardImageUrl}}" alt="{{paymentName}}">
					{{else}}
						{{paymentName}}
					{{/if}}
					<p class="creditcard-number"><b>{{translate 'Ending in'}}</b> {{ccnumber}}</p>
				</div>

				<p class="creditcard-expdate"><b>{{translate 'Expires in'}}</b> {{expirationDate}}</p>
				<p class="creditcard-name">{{ccname}}</p>


				{{#if showDefaults}}
					<p class="creditcard-default">
						{{#if isDefaultCreditCard}}
							<i class="creditcard-default-icon"></i>
							{{translate 'Default Credit Card'}}
						{{/if}}
					</p>
				{{/if}}
				{{#if showSecurityCodeForm}}
					</div>
					<div class="creditcard-security-code-section">
						<form>
							<div data-view="CreditCard.Edit.Form.SecurityCode"></div>
						</form>
					</div>
				{{/if}}
			</div>

			{{#if showActions}}
				<div class="creditcard-actions">
					<a class="creditcard-action" href="/creditcards/{{creditCartId}}" data-toggle="show-in-modal">
						{{translate 'Edit'}}
					</a>
					<button class="creditcard-action" data-action="remove" data-id="{{creditCartId}}">
						{{translate 'Remove'}}
					</button>
				</div>
			{{/if}}
		</div>
	</div>
{{/if}}


{{!----
Use the following context variables when customizing this template:

	creditCartId (String)
	showSecurityCodeForm (Boolean)
	showCreditCardImage (Boolean)
	creditCardImageUrl (String)
	paymentName (String)
	ccnumber (String)
	ccname (String)
	expirationDate (String)
	showDefaults (Boolean)
	isDefaultCreditCard (Boolean)
	showSelect (Boolean)
	showActions (Boolean)

----}}
