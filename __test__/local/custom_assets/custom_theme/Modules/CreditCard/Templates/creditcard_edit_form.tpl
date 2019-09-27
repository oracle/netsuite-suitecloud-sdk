<fieldset class="creditcard-edit-form">
	<div data-type="alert-placeholder"></div>

	<small class="creditcard-edit-form">{{translate 'Required'}} <span class="creditcard-edit-form-required">*</span></small>

	<div class="creditcard-edit-form" data-input="ccnumber" data-validation="control-group">
		<label class="creditcard-edit-form-label" for="ccnumber">
			{{translate 'Credit Card Number'}} <span class="creditcard-edit-form-label-required">*</span>
		</label>
		<div class="creditcard-edit-form-controls" data-validation="control">
			<input type="text" class="creditcard-edit-form-input" id="ccnumber" name="ccnumber" value="{{ccnumber}}" {{#unless isNew}}disabled{{/unless}}>
		</div>
	</div>

	<div class="creditcard-edit-form">
		{{#if showPaymentSelector}}
			<div class="creditcard-edit-form-controls-cc-select-container" data-value="creditcard-select-container" data-validation="control-group">
					<label class="creditcard-edit-form-controls-cc-select-label" for="paymentmethod"> 
						{{translate 'Credit Card Type:'}}
						<span class="creditcard-edit-form-required">*</span> 
					</label>
					<div data-validation="control">
						<select class="creditcard-edit-form-controls-cc-select" id="paymentmethod" name="paymentmethod">
							<option value="0">{{translate 'Please Select Credit Card Type'}}</option>
							{{#each paymentMethods}}
								<option value="{{key}}" {{#if selected}} selected {{/if}}>{{name}}</option>
							{{/each}}
						</select>
					</div>
			</div>
		{{else}}
			<input class="creditcard-edit-form-input" type="hidden" id="paymentmethod" name="paymentmethod" value="{{paymentMethodValue}}"/>
		{{/if}}
		<div class="creditcard-edit-form-controls-img-container" data-value="creditcard-img-container">
			{{#each paymentMethods}}
				<img
					class="creditcard-edit-form-card-icon {{#if hidden}} hidden {{/if}}"
					src="{{icon}}"
					data-value="{{key}}"
					alt="{{name}}"
					data-image="creditcard-icon"
				/>
			{{/each}}			
		</div>
	</div>

	<div class="creditcard-edit-form" data-validation="control-group">
		<label class="creditcard-edit-form-label" for="expmonth">
			{{translate 'Expiration Date'}} <span class="creditcard-edit-form-label-required">*</span>
		</label>
		<div class="creditcard-edit-form-controls" data-validation="control">
			<div>
				<select class="creditcard-edit-form-select" id="expmonth" name="expmonth">
					{{#each months}}
						<option value="{{month}}" {{#if selected}} selected {{/if}}>
							{{month}}
						</option>
					{{/each}}
				</select>
				<select class="creditcard-edit-form-select" id="expyear" name="expyear">
					{{#each years}}
						<option value="{{year}}" {{#if selected}} selected {{/if}} {{#if disabled}} disabled {{/if}}>
							{{year}}
						</option>
					{{/each}}
				</select>
			</div>
		</div>
	</div>
	{{#if showSecurityCodeForm}}
		<div data-view="CreditCard.Edit.Form.SecurityCode"></div>
	{{/if}}

	<div class="creditcard-edit-form" data-input="ccname" data-validation="control-group">
		<label class="creditcard-edit-form-label" for="ccname">
			{{translate 'Name on Card'}} <span class="creditcard-edit-form-label-required">*</span>
		</label>
		<div class="creditcard-edit-form-controls" data-validation="control">
			<input type="text" class="creditcard-edit-form-input" id="ccname" name="ccname" maxlength="26" value="{{ccname}}">
		</div>
	</div>

	{{#if showDefaults}}
	<div class="creditcard-edit-form">
		<label class="creditcard-edit-form-checkbox">
			<input
				type="checkbox"
				id="ccdefault"
				value="T"
				data-unchecked-value="F"
				name="ccdefault"
				{{#if ccdefault}} checked disabled {{/if}}
			>
			{{translate 'Make this my default credit card'}}
			{{#if ccdefault}} <i class="creditcard-edit-form-info-icon" data-toggle="tooltip" title="{{translate 'You need to have at least one card selected by default'}}"></i> {{/if}}
		</label>
	</div>
	{{/if}}
	{{#if showSaveCreditCardCheckbox}}
	<div class="creditcard-edit-form">
		<label class="creditcard-edit-form-checkbox">
			<input
				type="checkbox"
				id="savecreditcard"
				value="T"
				data-unchecked-value="F"
				name="savecreditcard"
				{{#if saveCreditCardByDefault}} checked {{/if}}
			>
			{{translate 'Save this credit card for future purchases'}}
		</label>
	</div>
	{{/if}}

</fieldset>




{{!----
Use the following context variables when customizing this template: 
	
	paymentMethods (Array)
	paymentMethodValue (String)
	showPaymentSelector (Boolean)
	isNew (Boolean)
	months (Array)
	years (Array)
	showDefaults (Boolean)
	ccdefault (Boolean)
	showSecurityCodeForm (Boolean)
	showSaveCreditCardCheckbox (Boolean)
	saveCreditCardByDefault (Boolean)

----}}
