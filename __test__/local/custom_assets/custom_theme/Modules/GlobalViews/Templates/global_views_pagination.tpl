{{#if currentPageLowerThanTotalPagesAndCurrentPageGreaterThan0AndPagesCountGreaterThan1}}
<nav class="global-views-pagination">
	{{#if showPageIndicator}}
	<p class="global-views-pagination-count">{{translate '$(0) of $(1)' currentPage totalPages}}</p>
	{{/if}}

	<ul class="global-views-pagination-links {{#if showPaginationLinksCompactClass}} global-views-pagination-links-compact {{/if}}">

		{{#if isCurrentPageDifferentThan1}}
		<li class="global-views-pagination-prev">
			<a href="{{previousPageURL}}">
				<i class="global-views-pagination-prev-icon"></i>
			</a>
		</li>
		{{else}}
		<li class="global-views-pagination-prev-disabled">
			<a href="{{currentPageURL}}">
				<i class="global-views-pagination-prev-icon"></i>
			</a>
		</li>
		{{/if}}

		{{#if showPageList}}
		{{#if isRangeStartGreaterThan1}}
		<li class="global-views-pagination-disabled">
			<a href="{{currentPageURL}}">...</a>
		</li>
		{{/if}}

		{{#each pages}}
		{{#if isCurrentPageActivePage}}
		<li class="global-views-pagination-links-number">
			<a class="global-views-pagination-active" href="{{fixedURL}}">{{pageIndex}}</a>
		</li>
		{{else}}
		<li class="global-views-pagination-links-number">
			<a href="{{URL}}">{{pageIndex}}</a>
		</li>
		{{/if}}
		{{/each}}

		{{#if isRangeEndLowerThanTotalPages}}
		<li class="global-views-pagination-disabled">
			<a href="{{currentPageURL}}">...</a>
		</li>
		{{/if}}
		{{/if}}

		{{#if isCurrentPageLast}}
		<li class="global-views-pagination-next-disabled">
			<a href="{{currentPageURL}}">
				<i class="global-views-pagination-next-icon"></i>
			</a>
		</li>
		{{else}}
		<li class="global-views-pagination-next">
			<a href="{{nextPageURL}}">
				<i class="global-views-pagination-next-icon"></i>
			</a>
		</li>
		{{/if}}
	</ul>
</nav>
{{/if}}



{{!----
Use the following context variables when customizing this template: 
	
	currentPageLowerThanTotalPagesAndCurrentPageGreaterThan0AndPagesCountGreaterThan1 (Boolean)
	showPageIndicator (Boolean)
	paginatorClass (String)
	currentPage (Number)
	totalPages (Number)
	isCurrentPageDifferentThan1 (Boolean)
	currentPageURL (String)
	previousPageURL (String)
	nextPageURL (String)
	showPageList (Boolean)
	showPaginationLinksCompactClass (Boolean)
	isRangeStartGreaterThan1 (Boolean)
	isRangeEndLowerThanTotalPages (Boolean)
	isCurrentPageLast (Boolean)
	pages (Array)

----}}
