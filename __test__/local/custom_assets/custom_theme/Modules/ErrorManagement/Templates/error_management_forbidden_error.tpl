<div class="error-management-forbidden-error">
    <div class="error-management-forbidden-error-header">
	{{#if pageHeader}}
		<h1>{{pageHeader}}</h1>
	{{/if}}
	
    	<div id="main-banner" class="error-management-forbidden-error-main-banner"></div>
    </div>
    <div id="forbidden-error-content" class="error-management-forbidden-error-content">
    	<p>{{translate 'Sorry! You have no permission to view this page.'}}</p>
    	<p>{{{translate 'Please contact the website administrator, click <a href="/">here</a> to continue.'}}}</p>
    </div>
</div>



{{!----
Use the following context variables when customizing this template: 
	
	title (String)
	pageHeader (String)

----}}
