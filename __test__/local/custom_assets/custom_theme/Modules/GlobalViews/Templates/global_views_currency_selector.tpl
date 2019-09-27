{{#if showCurrencySelector}}
	<div class="global-views-currency-selector">
		<span class="global-views-currency-selector-addon">
			{{currentCurrencySymbol}}
		</span>
		<select data-toggle="currency-selector" class="global-views-currency-selector-select" {{#if isDisabled}}disabled{{/if}}>
			{{#each availableCurrencies}}
				<option value="{{code}}" {{#if isSelected}}selected{{/if}}>
					{{displayName}}
				</option>
			{{/each}}
		</select>
	</div>
{{/if}}



{{!----
Use the following context variables when customizing this template: 
	
	showCurrencySelector (Boolean)
	availableCurrencies (Array)
	currentCurrencyCode (String)
	currentCurrencySymbol (String)

----}}
