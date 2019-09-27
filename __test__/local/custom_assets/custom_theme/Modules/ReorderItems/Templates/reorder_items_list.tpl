{{#if showBackToAccount}}
	<a href="/" class="reorder-items-list-button-back">
		<i class="reorder-items-list-button-back-icon"></i>
		{{translate 'Back to Account'}}
	</a>
{{/if}}

<div class="reorder-items-list">
	<header class="reorder-items-list-hedaer">
		<h2>{{pageHeader}}</h2>
	</header>

	<div data-view="ListHeader"></div>

	{{#if showItems}}
		 <table class="reorder-items-list-reorder-items-table md2sm">
			<tbody data-view="Reorder.Items">
			</tbody>
		</table>
	{{/if}}
	{{#if itemsNotFound}}
		<div class="reorder-items-list-empty-section">
			<h5>{{translate 'You bought no items in this time period.'}}</h5>
			<p><a class="reorder-items-list-empty-button" href="#" data-touchpoint="home">{{translate 'Shop Now'}}</a></p>
		</div>
	{{/if}}

	{{#if isLoading}}
		<p class="reorder-items-list-empty">{{translate 'Loading...'}}</p>
	{{/if}}

	{{#if showPagination}}
		<div class="reorder-items-list-paginator">
			<div data-view="GlobalViews.Pagination"></div>
			{{#if showCurrentPage}}
				<div data-view="GlobalViews.ShowCurrentPage"></div>
			{{/if}}
		</div>
	{{/if}}
</div>


{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
