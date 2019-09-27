<div class="login-register-reset-password-body">
	<h2 class="login-register-reset-password-title">
		{{translate 'Reset Password'}}
	</h2>

	<form class="login-register-reset-password-form" novalidate>
		<p class="login-register-reset-password-description">
			{{translate 'Enter a new password below'}}
		</p>

		<fieldset>
			<div class="login-register-reset-password-control-group" data-validation="control-group">
				<label class="login-register-reset-password-control-label" for="password">
					{{translate 'Password <small class="login-register-reset-password-forgot-password-form-required">*</small>'}}
				</label>
				<div class="login-register-reset-password-controls" data-validation="control">
					<input type="password" class="login-register-reset-password-input" id="password" name="password" value="">
				</div>
			</div>

			<div class="login-register-reset-password-control-group" data-validation="control-group">
				<label class="login-register-reset-password-control-label" for="confirm_password">{{translate 'Confirm Password <small class="login-register-reset-password-forgot-password-form-required">*</small>'}}</label>
				<div class="login-register-reset-password-controls" data-validation="control">
					<input type="password" class="login-register-reset-password-input" id="confirm_password" name="confirm_password" value="">
				</div>
			</div>

			<div data-type="alert-placeholder"></div>

			<div class="login-register-reset-password-control-group">
				<button type="submit" class="login-register-reset-password-submit">{{translate 'Change Password'}}</button>
				<a class="login-register-reset-password-sign-in" href="/login-register" data-target=".register">{{translate 'Cancel & Return To Log in'}}</a>
			</div>

		</fieldset>
	</form>
</div>

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
