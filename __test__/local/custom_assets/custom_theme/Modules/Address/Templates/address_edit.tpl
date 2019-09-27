<section class="address-edit">
	{{#unless isInModalOrHideHeader}}
		<h2>
			{{#if isAddressNew}}
				{{translate 'Add a new Address'}}
			{{else}}
				{{translate 'Update Address'}}
			{{/if}}
		</h2>

		{{#if isCollectionEmpty}}
			<p>{{translate 'For faster checkouts, please enter an address below.'}}</p>
		{{/if}}
	{{/unless}}

	<form class="address-edit-form" action="addressbook.ss" method="POST">
		{{#if isInModal}}
			<div class="address-edit-body">
		{{/if}}

		<fieldset data-view="Address.Edit.Fields"></fieldset>

		{{#if isInModal}}
			</div>
		{{/if}}

		{{#if showFooter}}
			<div class="{{#if isInModal}}address-edit-footer{{else}}form-actions{{/if}}">
				<button type="submit" class="address-edit-form-button-submit">
					{{#if isAddressNew}}
						{{translate 'Save Address'}}
					{{else}}
						{{translate 'Update Address'}}
					{{/if}}
				</button>

				{{#if isInModalOrCollectionNotEmpty}}
					<button class="address-edit-form-button-cancel" data-dismiss="modal" data-action="reset">
						{{translate 'Cancel'}}
					</button>
				{{/if}}
			</div>
		{{/if}}
	</form>
</section>



{{!----
Use the following context variables when customizing this template: 
	
	model (Object)
	isAddressNew (Boolean)
	isCollectionEmpty (Boolean)
	isInModal (Boolean)
	isInModalOrHideHeader (Boolean)
	showFooter (Boolean)
	isInModalOrCollectionNotEmpty (Boolean)

----}}
