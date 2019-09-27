<div class="error-management-expired-link-header">
	{{#if pageHeader}}
		<h1 class="error-management-expired-link-header-title">{{pageHeader}}</h1>
	{{/if}}

	<div id="main-banner" class="error-management-expired-link-main-banner"></div>
</div>
<div id="internal-error-content" class="error-management-expired-link-content">
	{{{message}}}
</div>
<hr>
<div>
	<a class="error-management-expired-link-login-button" href="#" data-touchpoint="login">{{translate 'Login'}}</a>
	<a class="error-management-expired-link-register-button" href="#" data-touchpoint="register">{{translate 'Register'}}</a>
</div>

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
