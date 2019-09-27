<div class="error-management-page-not-found">
	<div data-cms-area="error_management_page_not_found_cms_area_1" data-cms-area-filters="path"></div>

    <div class="error-management-page-not-found-header">
	{{#if pageHeader}}
		<h1>{{pageHeader}}</h1>
	{{/if}}

	   <div id="main-banner" class="error-management-page-not-found-main-banner"></div>
    </div>
    <div id="page-not-found-content" class="error-management-page-not-found-content">
    	{{translate 'Sorry, we could not load the content you requested.'}}
    </div>

    <div data-cms-area="error_management_page_not_found_cms_area_2" data-cms-area-filters="path"></div>
</div>



{{!----
Use the following context variables when customizing this template:

	title (String)
	pageHeader (String)

----}}
