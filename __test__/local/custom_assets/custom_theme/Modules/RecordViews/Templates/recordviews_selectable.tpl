<tr class="recordviews-selectable-row {{#if isChecked}}recordviews-selectable-active{{/if}} {{#unless isActive}}recordviews-selectable-disabled{{/unless}}" data-action="{{actionType}}" data-id="{{id}}">
	<td class="recordviews-selectable-td-selectable">
		<input class="recordviews-selectable-checkbox" type="checkbox" value="{{id}}" data-action="select" {{#if isChecked}}checked{{/if}} {{#unless isActive}}disabled{{/unless}}>
	</td>
	<td class="recordviews-selectable-td-title">
		{{#if isNavigable}}
			<a class="recordviews-selectable-anchor" data-action="go-to-record" href="{{{url}}}">
				{{title}}
			</a>
		{{else}}
			<p class="recordviews-selectable-title">
				{{title}}
			</p>
		{{/if}}
	</td>

	{{#each columns}}
		<td class="recordviews-selectable-td recordviews-selectable-td-{{name}}" data-name="{{name}}">
			{{#if showLabel}}
				<span class="recordviews-selectable-label">{{label}}</span>
			{{/if}}
			{{#if isComposite}}
				<span data-view="{{compositeKey}}"></span>
			{{else}}
				<span class="recordviews-selectable-value">{{value}}</span>
			{{/if}}
		</td>
	{{/each}}
</tr>

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
