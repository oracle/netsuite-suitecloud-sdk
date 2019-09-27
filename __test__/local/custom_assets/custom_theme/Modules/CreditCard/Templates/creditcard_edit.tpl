{{#if showBackToAccount}}
	<a href="/" class="creditcard-edit-button-back">
	    <i class="creditcard-edit-button-back-icon"></i>
	    {{translate 'Back to Account'}}
	</a>
{{/if}}

<section class="creditcard-edit">
	{{#unless isInModalOrHideHeader}}
		<h2>
			{{#if isNew}}
				{{translate 'Add a new Credit Card'}}
			{{else}}
				{{translate 'Edit Credit Card'}}
			{{/if}}
		</h2>
		{{#if isCollectionEmpty}}
			<p>{{translate 'For faster checkouts, please enter your payment information below'}}</p>
		{{/if}}
	{{/unless}}

	<form action="CreditCard.Service.ss" method="POST">
		{{#if isModal}}
			<div class="creditcard-edit-body">
		{{/if}}

		<div data-view="CreditCard.Form"></div>

		{{#if isModal}}
			</div>
		{{/if}}

		{{#if showFooter}}
			<div class="{{#if isModal}} creditcard-edit-footer-modal {{else}} creditcard-edit-footer {{/if}}">
				<button type="submit" class="creditcard-edit-form-button-submit">
					{{#if isNew}}
						{{translate 'Add Card'}}
					{{else}}
						{{translate 'Update Card'}}
					{{/if}}
				</button>

				{{#if isModalOrCollectionLength}}
					<button class="creditcard-edit-form-button-cancel" data-dismiss="modal">
						{{translate 'Cancel'}}
					</button>
				{{/if}}
			</div>
		{{/if}}

	</form>
</section>



{{!----
Use the following context variables when customizing this template: 
	
	isModal (Boolean)
	isNew (Boolean)
	isCollectionEmpty (Boolean)
	isModalOrCollectionLength (Boolean)
	showFooter (Boolean)
	isInModalOrHideHeader (Boolean)
	showHeader (Boolean)
	showBackToAccount (Boolean)

----}}
