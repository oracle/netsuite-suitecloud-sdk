{{#if isCountryAndStatePresent}}
	<label class="global-views-states-group-label is-required" for="{{manage}}state">
		{{translate 'State'}} <span class="global-views-states-input-required">*</span>
	</label>
	<div  class="global-views-states-group-form-controls" data-validation="control">
		<select class="{{inputClass}} global-views-states-group-select" id="{{manage}}state" name="state" data-type="selectstate" data-action="selectstate" >
			<option value="">
				{{translate '-- Select --'}}
			</option>
			{{#each states}}
				<option value="{{code}}" {{#if isSelected}} selected {{/if}} >
					{{name}}
				</option>
			{{/each}}
		</select>
	</div>
{{else}}
	<label class="global-views-states-group-label" for="{{manage}}state">
		{{translate 'State/Province/Region'}}
		<p class="global-views-states-optional-label">{{translate '(optional)'}}</p>
	</label>
	<div  class="global-views-states-group-form-controls" data-validation="control">
		<input
			type="text"
			id="{{manage}}state"
			name="state"
			class="{{inputClass}} global-views-states-group-input"
			value="{{selectedState}}"
			data-action="inputstate"
		>
	</div>
{{/if}}



{{!----
Use the following context variables when customizing this template: 
	
	isCountryAndStatePresent (Boolean)
	manage (String)
	states (undefined)
	inputClass (String)
	selectedState (String)

----}}
