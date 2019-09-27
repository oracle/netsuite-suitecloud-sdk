<div class="global-views-confirmation-body {{className}}">
	{{#if showBodyMessage}}
		{{body}}
	{{else}}
		<div data-view="ChildViewMessage"></div>
	{{/if}}
</div>
<div class="global-views-confirmation-footer {{class}}">
	<button class="global-views-confirmation-confirm-button" data-action="confirm">
		{{#if hasConfirmLabel}}
			{{confirmLabel}}
		{{else}}
			{{translate 'Yes'}}
		{{/if}}
	</button>
	<button class="global-views-confirmation-cancel-button" data-action="cancel">
		{{#if hasCancelLabel}}
			{{cancelLabel}}
		{{else}}
			{{translate 'Cancel'}}
		{{/if}}
	</button>
</div>


{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
