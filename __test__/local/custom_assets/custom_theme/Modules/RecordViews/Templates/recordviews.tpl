<tr class="recordviews-row" data-item-id="{{id}}" data-navigation-hashtag="{{detailsURL}}" data-action="navigate">
	<td class="recordviews-title" data-name="title">
		<span class="recordviews-title-value">
			{{#if isNavigable}}
			<a class="recordviews-title-anchor" href="#" data-touchpoint="{{touchpoint}}" data-id="{{id}}" data-hashtag="{{detailsURL}}" {{#if showInModal}}data-toggle="show-in-modal"{{/if}}>
			{{/if}}
				{{title}}
			{{#if isNavigable}}
			</a>
			{{/if}}
		</span>
	</td>

{{#each columns}}
	<td class="recordviews-{{type}}" data-name="{{name}}">
		{{#if showLabel}}
			<span class="recordviews-label">{{label}}</span>
		{{/if}}
		{{#if isComposite}}
			<span class="recordviews-value" data-view="{{compositeKey}}"></span>
		{{else}}
			<span class="recordviews-value">{{value}}</span>
		{{/if}}
	</td>
{{/each}}
</tr>




{{!----
Use the following context variables when customizing this template: 
	
	model (Object)
	model.touchpoint (String)
	model.title (String)
	model.detailsURL (String)
	model.id (String)
	model.internalid (String)
	model.columns (Array)
	model.columns.0 (Object)
	model.columns.0.label (String)
	model.columns.0.type (String)
	model.columns.0.name (String)
	model.columns.0.value (String)
	model.columns.0.showLabel (Boolean)
	model.columns.0.isComposite (Boolean)
	id (String)
	isNavigable (Boolean)
	showInModal (Boolean)
	touchpoint (String)
	detailsURL (String)
	title (String)
	columns (Array)

----}}
