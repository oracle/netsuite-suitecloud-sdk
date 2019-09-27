<div class="login-register-checkout-as-guest-header collapse {{#unless hideRegister}}in{{/unless}}" id="guest-show-view">
	
		<p class="login-register-checkout-as-guest-description">
			{{translate 'Checkout as a guest and you will have an opportunity to create an account when you are finished.'}}
		</p>
		{{#if expandGuestUserEnabled}}
			<button href="#" class="login-register-checkout-as-guest-button-show" data-toggle="collapse" data-target="#guest-show-view,#guest-view">
				{{translate 'Checkout as a Guest'}}
			</button>
		{{else}}
			<form class="login-register-checkout-as-guest-form" method="POST" novalidate>
				<div class="login-register-checkout-as-guest-control-group">
					<button type="submit" class="login-register-checkout-as-guest-submit">
						{{translate 'Checkout as a Guest'}}
					</button>
				</div>
			</form>
	{{/if}}
</div>
<div class="login-register-checkout-as-guest-body collapse {{#if hideRegister}}in{{/if}}" id="guest-view">
	<p class="login-register-checkout-as-guest-description">
		{{#if hideRegister}}
			{{translate 'Checkout as a Guest'}}
		{{else}}
			{{translate 'Checkout as a guest and you will have an opportunity to create an account when you are finished.'}}
		{{/if}}
	</p>
	<form class="login-register-checkout-as-guest-form" method="POST" novalidate>

		{{#if showGuestFirstandLastname}}
			<div class="login-register-checkout-as-guest-control-group" data-validation="control-group">
				<label class="login-register-checkout-as-guest-control-label" for="register-firstname">
					{{translate 'First Name <small class="login-register-checkout-as-guest-required">*</small>'}}
				</label>
				<div class="login-register-checkout-as-guest-controls" data-validation="control">
					<input type="text" name="firstname" id="guest-firstname" class="login-register-checkout-as-guest-input">
				</div>
			</div>

			<div class="login-register-checkout-as-guest-control-group" data-validation="control-group">
				<label class="login-register-checkout-as-guest-control-label" for="guest-lastname">
					{{translate 'Last Name <small class="login-register-checkout-as-guest-required">*</small>'}}
				</label>
				<div class="login-register-checkout-as-guest-controls" data-validation="control">
					<input type="text" name="lastname" id="guest-lastname" class="login-register-checkout-as-guest-input">
				</div>
			</div>
		{{/if}}
		
		{{#if isRedirect}}
			<div class="login-register-checkout-as-guest-form-controls-group" data-validation="control-group">
				<div class="login-register-checkout-as-guest-register-form-controls" data-validation="control">
					<input value="true" type="hidden" name="redirect" id="redirect" >
				</div>
			</div>
		{{/if}}

		{{#if showGuestEmail}}
			<div class="login-register-checkout-as-guest-control-group" data-validation="control-group">
				<label class="login-register-checkout-as-guest-control-label" for="register-email">
					{{translate 'Email Address <small class="login-register-checkout-as-guest-required">*</small>'}}
				</label>
				<div class="login-register-checkout-as-guest-controls" data-validation="control">
					<input type="email" name="email" id="guest-email" class="login-register-checkout-as-guest-input" placeholder="{{translate 'your@email.com'}}" value="">
					<p class="login-register-checkout-as-guest-help-block">
						<small>{{translate 'We need your email address to contact you about your order.'}}</small>
					</p>
				</div>
			</div>
		{{/if}}

		<div class="login-register-checkout-as-guest-form-messages" data-type="alert-placeholder"></div>

		<div class="login-register-checkout-as-guest-control-group">
			<button type="submit" class="login-register-checkout-as-guest-submit">
				{{translate 'Proceed to Checkout'}}
			</button>
		</div>
	</form>
</div>

{{#unless hideRegister}}
	<hr>
	<div class="login-register-checkout-as-guest-register-header collapse in" id="register-show-view">
		<p class="login-register-checkout-as-guest-description">
			{{translate 'Create an account and take advantage of faster checkouts and other great benefits.'}}
		</p>
		<button class="login-register-checkout-as-guest-button-show" data-toggle="collapse" data-target="#register-show-view,#register-view">
			{{translate 'Create Account'}}
		</button>
	</div>
{{/unless}}



{{!----
Use the following context variables when customizing this template: 
	
	isRedirect (Boolean)
	hideRegister (Boolean)
	showGuestFirstandLastname (Boolean)
	showGuestEmail (Boolean)
	expandGuestUserEnabled (Boolean)

----}}
