<tr class="recordviews-actionable" data-item-id="{{itemId}}" data-id="{{id}}" data-record-type="{{recordType}}" data-type="order-item" data-action="navigate">
	<td class="recordviews-actionable-title">
		<a href="#" data-touchpoint="{{touchpoint}}" data-hashtag="{{detailsURL}}">{{title}}</a>
	</td>

	{{#each columns}}
		<td class="recordviews-actionable-{{type}}" data-name="{{name}}">
			{{#if showLabel}}
				<span class="recordviews-actionable-label">{{label}}</span>
			{{/if}}
			{{#if isComposite}}
				<span class="recordviews-actionable-composite" data-view="{{compositeKey}}"></span>
			{{else}}
				<span class="recordviews-actionable-value">{{value}}</span>
			{{/if}}
		</td>
	{{/each}}

	<td class="recordviews-actionable-actions">
		<p class="recordviews-actionable-label"> {{actionTitle}} </p>
		<div data-view="Action.View" ></div>
	</td>
</tr>




{{!----
Use the following context variables when customizing this template: 
	
	model (Object)
	model.title (Object)
	model.title.string (String)
	model.touchpoint (String)
	model.detailsURL (String)
	model.recordType (String)
	model.id (String)
	model.internalid (String)
	model.trackingNumbers (undefined)
	model.columns (Array)
	model.columns.0 (Object)
	model.columns.0.label (String)
	model.columns.0.type (String)
	model.columns.0.name (String)
	model.columns.0.value (String)
	model.columns.0.showLabel (Boolean)
	model.columns.0.isComposite (Boolean)
	id (String)
	touchpoint (String)
	isNavigable (Boolean)
	detailsURL (String)
	title (Object)
	title.string (String)
	columns (Array)
	recordType (String)

----}}
