/* global acquireVsCodeApi */

const vscode = acquireVsCodeApi();

const EVENTS = window.__SUITECLOUD_PANEL_EVENTS__;
const DEFAULT_PROXY_PORT = 8181;

const DEFAULT_UI_STRINGS = {
	noAccountsAvailable: 'Select from list',
	notResolved: 'Not resolved',
	generateApiKeyTitle: 'Generate API key',
	rotateApiKeyTitle: 'Generate a new API key',
	openClineChatEnabledTitle: 'Open Cline chat view.',
	openClineChatDisabledTitle: 'Start and configure the proxy before opening Cline chat.',
	applyClineNoChangesTitle: 'No change detected. Nothing to apply to Cline config.',
	applyClineIncompatibleTitle: 'Automatic Cline update is not supported on this machine.',
	applyClineMissingApiKeyTitle: 'Generate an API key first.',
	applyClineProxyUnavailableTitle: 'Start the SuiteCloud proxy before applying Cline settings.',
	applyClineReadyTitle: 'Apply current panel settings to Cline configuration.',
	workspaceManualSetupTitle: 'Workspace-specific Cline setup must be configured manually.',
	changePortWhileRunningTitle: 'Stop the proxy before changing the local port.',
	changeAuthIdWhileRunningTitle: 'Stop the proxy before changing the Auth ID.',
	changeApiKeyWhileRunningTitle: 'Stop the proxy before generating or rotating the API key.',
	invalidPortFormat: 'Enter a 4 or 5 digit port between 1024 and 65535.'
};

const UI_STRINGS = {
	...DEFAULT_UI_STRINGS,
	...(window.__SUITECLOUD_PANEL_STRINGS__ || {})
};

const byId = (id) => document.getElementById(id);
const elements = {
	authId: byId('authId'),
	authIdField: byId('authIdField'),
	setupAccount: byId('setupAccount'),
	port: byId('port'),
	portField: byId('portField'),
	portValidation: byId('portValidation'),
	statusBadge: byId('statusBadge'),
	apiKeyRow: byId('apiKeyRow'),
	apiKeyStatus: byId('apiKeyStatus'),
	maskedApiKey: byId('maskedApiKey'),
	copyApiKey: byId('copyApiKey'),
	apiKeyCountdown: byId('apiKeyCountdown'),
	lastError: byId('lastError'),
	lastErrorRow: byId('lastErrorRow'),
	clineCompatibility: byId('clineCompatibility'),
	clineCompatibilityMessage: byId('clineCompatibilityMessage'),
	clineSyncMessage: byId('clineSyncMessage'),
	clineStateIcon: byId('clineStateIcon'),
	clineMarketplaceLink: byId('clineMarketplaceLink'),
	clineDescription: byId('clineDescription'),
	clineScope: byId('clineScope'),
	disableWelcomeNotification: byId('disableWelcomeNotification'),
	rotateKey: byId('rotateKey'),
	rotateKeyIcon: byId('rotateKeyIcon'),
	rotateKeyLabel: byId('rotateKeyLabel'),
	startProxy: byId('startProxy'),
	stopProxy: byId('stopProxy'),
	openOutput: byId('openOutput'),
	applyCline: byId('applyCline'),
	openClineChat: byId('openClineChat'),
	toggleFeedback: byId('toggleFeedback'),
	feedbackContent: byId('feedbackContent'),
	feedbackText: byId('feedbackText'),
	submitFeedback: byId('submitFeedback'),
	clearFeedback: byId('clearFeedback'),
	controlPanelContent: byId('controlPanelContent'),
	expandedViewInfo: byId('expandedViewInfo'),
	expandView: byId('expandView')
};

let state = {
	isSdkReady: false,
	authId: '',
	port: 8181,
	proxyStatus: 'stopped',
	proxyOwnership: 'none',
	baseUrl: '',
	runtimeAuthId: null,
	hasPendingRuntimeConfig: false,
	maskedApiKey: '',
	apiKeyVisible: false,
	apiKeyVisibleUntilMs: null,
	apiKeyExists: false,
	apiKeyActionLabel: 'Generate API Key',
	disableWelcomeNotification: false,
	clineScope: 'user',
	authIds: [],
	isClineCompatible: false,
	clineCompatibilityMessage: '',
	isClineConfigInSync: false,
	clineConfigSyncMessage: '',
	expandedViewOpen: false,
	lastError: null
};

let apiKeyCountdownIntervalHandle = null;
let panelStateLoaded = false;
let feedbackExpanded = false;
let lastAuthIdRefreshRequestAt = 0;

function post(eventType, eventData) {
	vscode.postMessage({ eventType, eventData });
}

function on(element, eventName, listener) {
	if (element) {
		element.addEventListener(eventName, listener);
	}
}

function getFormUpdatePayload() {
	const portValue = elements.port.value.trim();
	const parsedPort = portValue === '' ? DEFAULT_PROXY_PORT : Number.parseInt(portValue, 10);
	return {
		authId: elements.authId.value,
		port: Number.isFinite(parsedPort) ? parsedPort : state.port,
		clineScope: elements.clineScope.value,
		disableWelcomeNotification: elements.disableWelcomeNotification.checked
	};
}

function applyFormUpdate() {
	post(EVENTS.UPDATE_FORM, getFormUpdatePayload());
}

function validatePort(showMessage) {
	const portValue = elements.port.value.trim();
	const port = Number(portValue);
	const isValid = portValue === '' || (/^\d{4,5}$/.test(portValue) && port >= 1024 && port <= 65535);
	const message = isValid ? '' : UI_STRINGS.invalidPortFormat;
	elements.port.setCustomValidity(message);
	elements.portValidation.textContent = message;
	elements.portValidation.classList.toggle('hidden', !showMessage || isValid);
	return isValid;
}

function applyProxyConfigUpdate() {
	if (!validatePort(true)) {
		return;
	}
	applyFormUpdate();
}

function startProxy() {
	if (validatePort(true)) {
		post(EVENTS.START_PROXY, getFormUpdatePayload());
	}
}

function renderAuthIds(authIds, selectedAuthId) {
	const currentValue = selectedAuthId || '';
	elements.authId.innerHTML = '';

	const placeholder = document.createElement('option');
	placeholder.value = '';
	placeholder.textContent = authIds && authIds.length ? 'Select from list' : UI_STRINGS.noAccountsAvailable;
	placeholder.disabled = true;
	placeholder.selected = !currentValue;
	elements.authId.appendChild(placeholder);

	(authIds || []).forEach((authItem) => {
		const option = document.createElement('option');
		option.value = authItem.authId;
		option.textContent = authItem.authId;
		option.title = [authItem.companyName, authItem.roleName].filter(Boolean).join(' | ');
		option.selected = authItem.authId === currentValue;
		elements.authId.appendChild(option);
	});
}

function formatCountdown(milliseconds) {
	const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}s`;
}

function isApiKeyCopyAvailable() {
	const remainingMs = Number(state.apiKeyVisibleUntilMs) - Date.now();
	return !!state.apiKeyVisible && Number.isFinite(remainingMs) && remainingMs > 0;
}

function updateApiKeyCountdown() {
	const remainingMs = Number(state.apiKeyVisibleUntilMs) - Date.now();
	const isCopyAvailable = isApiKeyCopyAvailable();
	elements.apiKeyCountdown.textContent = isCopyAvailable
		? formatCountdown(remainingMs)
		: '';
	elements.apiKeyCountdown.title = isCopyAvailable ? 'Time left to copy API key' : '';
	elements.apiKeyCountdown.classList.toggle('hidden', !isCopyAvailable);
	elements.copyApiKey.classList.toggle('hidden', !isCopyAvailable);
	elements.copyApiKey.classList.toggle('copyAvailable', isCopyAvailable);
	elements.copyApiKey.disabled = !isCopyAvailable;
	if (!isCopyAvailable && apiKeyCountdownIntervalHandle) {
		clearInterval(apiKeyCountdownIntervalHandle);
		apiKeyCountdownIntervalHandle = null;
	}
}

function scheduleApiKeyCountdown() {
	updateApiKeyCountdown();
	if (isApiKeyCopyAvailable() && !apiKeyCountdownIntervalHandle) {
		apiKeyCountdownIntervalHandle = setInterval(updateApiKeyCountdown, 1000);
	}
}

function refreshAuthIdsOnOpen() {
	const now = Date.now();
	if (elements.authId.disabled || now - lastAuthIdRefreshRequestAt < 1000) {
		return;
	}
	lastAuthIdRefreshRequestAt = now;
	post(EVENTS.AUTH_ID_DROPDOWN_OPEN);
}

function setStatusPill(status) {
	let label = 'not running';
	if (status === 'running') {
		label = 'running';
	} else if (status === 'starting') {
		label = 'starting';
	} else if (status === 'stopping') {
		label = 'stopping';
	} else if (status === 'error') {
		label = 'error';
	}
	elements.statusBadge.textContent = label;
	elements.statusBadge.className = `statusPill ${status}`;
}

function renderCline(status) {
	const isWorkspaceManualSetup = state.clineScope === 'workspace';
	const isCompatible = !!state.isClineCompatible && !isWorkspaceManualSetup;
	const isConfigured = isCompatible && !!state.isClineConfigInSync;

	elements.clineCompatibility.textContent = isConfigured ? 'ready' : 'not ready';
	elements.clineCompatibility.className = `statusPill ${isConfigured ? 'ready' : ''}`;

	elements.clineStateIcon.textContent = isCompatible ? '✓' : '×';
	elements.clineStateIcon.className = `stateIcon ${isCompatible ? 'stateIconSuccess' : 'stateIconError'}`;

	if (isConfigured) {
		elements.clineCompatibilityMessage.textContent = 'Cline installed and configured.';
	} else if (isCompatible) {
		elements.clineCompatibilityMessage.textContent = 'Cline installed.';
	} else if (isWorkspaceManualSetup) {
		elements.clineCompatibilityMessage.textContent = 'Workspace setup requires manual provider configuration.';
	} else {
		elements.clineCompatibilityMessage.textContent = 'Cline not installed.';
	}

	elements.clineMarketplaceLink.classList.toggle('hidden', isCompatible || isWorkspaceManualSetup);
	elements.clineDescription.classList.toggle('hidden', isConfigured);
	elements.openClineChat.classList.toggle('hidden', !isConfigured);
	elements.applyCline.classList.toggle('hidden', !isCompatible || isConfigured);

	const isClineProxyAvailable = status === 'running';
	const applyDisabledReason = !isClineProxyAvailable
		? UI_STRINGS.applyClineProxyUnavailableTitle
		: !state.apiKeyExists
			? UI_STRINGS.applyClineMissingApiKeyTitle
			: !isCompatible
			? UI_STRINGS.applyClineIncompatibleTitle
			: '';
	elements.applyCline.disabled = !!applyDisabledReason;
	elements.applyCline.title = applyDisabledReason || UI_STRINGS.applyClineReadyTitle;

	const canOpenCline = status === 'running' && isConfigured;
	elements.openClineChat.disabled = !canOpenCline;
	elements.openClineChat.title = canOpenCline
		? UI_STRINGS.openClineChatEnabledTitle
		: UI_STRINGS.openClineChatDisabledTitle;

	elements.clineSyncMessage.textContent = state.clineConfigSyncMessage || '';
	elements.clineSyncMessage.classList.toggle('hidden', !state.clineConfigSyncMessage || isConfigured);
}

function renderFeedback(isRunning) {
	elements.submitFeedback.disabled = !isRunning;
	elements.submitFeedback.title = isRunning
		? 'Submit feedback through the current proxy session.'
		: 'Start the local service before sending feedback.';
	elements.feedbackContent.classList.toggle('feedbackExpanded', feedbackExpanded);
	elements.toggleFeedback.setAttribute('aria-expanded', String(feedbackExpanded));
	elements.toggleFeedback.textContent = feedbackExpanded ? 'Hide feedback' : 'Share your feedback';
}

function render() {
	const status = String(state.proxyStatus || 'stopped').toLowerCase();
	const isRunning = status === 'running';
	renderFeedback(isRunning);

	renderAuthIds(state.authIds, state.authId);
	if (document.activeElement !== elements.port) {
		elements.port.value = String(state.port || 8181);
	}

	const isStarting = status === 'starting';
	const isStopping = status === 'stopping';
	const isOwnedProxy = state.proxyOwnership === 'owned';
	const isProxyConfigLocked = isRunning || isStarting || isStopping;
	const isApiKeyChangeBlocked = isRunning || isStarting || isStopping;
	const hasAuthAccounts = Array.isArray(state.authIds) && state.authIds.length > 0;
	const isSdkReady = !!state.isSdkReady;

	setStatusPill(status);

	elements.authId.disabled = isProxyConfigLocked;
	elements.authId.title = isProxyConfigLocked ? UI_STRINGS.changeAuthIdWhileRunningTitle : '';
	elements.authIdField.title = isProxyConfigLocked ? UI_STRINGS.changeAuthIdWhileRunningTitle : '';
	elements.authIdField.classList.toggle('lockedField', isProxyConfigLocked);
	elements.setupAccount.disabled = !isSdkReady;
	elements.setupAccount.title = isSdkReady ? 'Set up SuiteCloud account' : 'Preparing SuiteCloud SDK...';
	elements.port.disabled = isProxyConfigLocked;
	elements.port.title = isProxyConfigLocked ? UI_STRINGS.changePortWhileRunningTitle : '';
	elements.portField.title = isProxyConfigLocked ? UI_STRINGS.changePortWhileRunningTitle : '';
	elements.portField.classList.toggle('lockedField', isProxyConfigLocked);
	elements.disableWelcomeNotification.checked = !!state.disableWelcomeNotification;
	elements.clineScope.value = state.clineScope || 'user';

	elements.rotateKey.disabled = !panelStateLoaded || !isSdkReady || isApiKeyChangeBlocked;
	const apiKeyActionTitle = state.apiKeyExists
		? UI_STRINGS.rotateApiKeyTitle
		: UI_STRINGS.generateApiKeyTitle;
	elements.rotateKey.title = !isSdkReady
		? 'Preparing SuiteCloud SDK...'
		: isApiKeyChangeBlocked
		? UI_STRINGS.changeApiKeyWhileRunningTitle
		: apiKeyActionTitle;
	elements.rotateKey.setAttribute('aria-label', apiKeyActionTitle);
	elements.rotateKey.classList.toggle('iconOnlyButton', state.apiKeyExists);
	elements.rotateKeyIcon.classList.toggle('hidden', !state.apiKeyExists);
	elements.rotateKeyLabel.classList.toggle('hidden', state.apiKeyExists);

	const hasApiKey = isSdkReady && !!state.apiKeyExists;
	elements.apiKeyRow.classList.toggle('hasApiKey', hasApiKey);
	elements.apiKeyStatus.classList.toggle('hidden', !hasApiKey);
	elements.maskedApiKey.textContent = hasApiKey
		? state.maskedApiKey || UI_STRINGS.notResolved
		: '';
	scheduleApiKeyCountdown();

	elements.startProxy.classList.toggle('hidden', isRunning || isStopping);
	elements.stopProxy.classList.toggle('hidden', !isRunning || !isOwnedProxy);
	elements.startProxy.disabled = !isSdkReady || isStarting || !hasAuthAccounts || !state.authId || !state.apiKeyExists;
	elements.startProxy.querySelector('span:last-child').textContent = isStarting ? 'Starting' : 'Start';
	elements.startProxy.title = !isSdkReady
		? 'Preparing SuiteCloud SDK...'
		: 'Start proxy';
	elements.stopProxy.disabled = isStopping;
	elements.stopProxy.querySelector('span:last-child').textContent = isStopping ? 'Stopping' : 'Stop';
	elements.stopProxy.title = 'Stop proxy';
	elements.lastError.textContent = state.lastError || '';
	elements.lastErrorRow.classList.toggle('hidden', !state.lastError);

	renderCline(status);

	const inSidebarMode = document.body.dataset.viewMode === 'sidebar';
	const showExpandedMessage = inSidebarMode && !!state.expandedViewOpen;
	elements.controlPanelContent.classList.toggle('hidden', showExpandedMessage);
	elements.expandedViewInfo.classList.toggle('hidden', !showExpandedMessage);
}

function getFeedbackPayload() {
	const ratingInput = document.querySelector('input[name="rating"]:checked');
	const rating = Number(ratingInput ? ratingInput.value : 0);
	const topics = Array.from(document.querySelectorAll('input[name="topics"]:checked')).map((item) => item.value);
	const feedback = (elements.feedbackText.value || '').trim();
	return { rating, topics, feedback };
}

function clearFeedbackForm() {
	elements.feedbackText.value = '';
	resizeFeedbackText();
	document.querySelectorAll('input[name="topics"], input[name="rating"]').forEach((input) => {
		input.checked = false;
	});
}

function resizeFeedbackText() {
	elements.feedbackText.style.height = 'auto';
	elements.feedbackText.style.height = `${elements.feedbackText.scrollHeight}px`;
}

on(elements.rotateKey, 'click', () => post(EVENTS.ROTATE_KEY));
on(elements.startProxy, 'click', startProxy);
on(elements.stopProxy, 'click', () => post(EVENTS.STOP_PROXY));
on(elements.setupAccount, 'click', () => post(EVENTS.SETUP_ACCOUNT));
on(elements.authId, 'pointerdown', refreshAuthIdsOnOpen);
on(elements.authId, 'keydown', (event) => {
	if (event.key === 'Enter' || event.key === ' ' || (event.altKey && event.key === 'ArrowDown')) {
		refreshAuthIdsOnOpen();
	}
});
on(elements.openOutput, 'click', () => post(EVENTS.OPEN_OUTPUT));
on(elements.copyApiKey, 'click', () => {
	if (isApiKeyCopyAvailable()) {
		post(EVENTS.COPY_API_KEY);
	}
});
on(elements.applyCline, 'click', () => post(EVENTS.APPLY_CLINE_SETTINGS));
on(elements.clineMarketplaceLink, 'click', () => post(EVENTS.OPEN_CLINE_MARKETPLACE));
on(elements.openClineChat, 'click', () => post(EVENTS.OPEN_CLINE_CHAT));
on(elements.toggleFeedback, 'click', () => {
	feedbackExpanded = !feedbackExpanded;
	render();
	if (feedbackExpanded) {
		resizeFeedbackText();
		requestAnimationFrame(() => {
			elements.feedbackContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
		});
	}
});
on(elements.expandView, 'click', () => post(EVENTS.OPEN_EXPANDED_VIEW));
on(elements.submitFeedback, 'click', () => post(EVENTS.SUBMIT_FEEDBACK, getFeedbackPayload()));
on(elements.clearFeedback, 'click', clearFeedbackForm);

on(elements.authId, 'change', applyProxyConfigUpdate);
on(elements.port, 'change', applyProxyConfigUpdate);
on(elements.port, 'input', () => validatePort(false));
on(elements.feedbackText, 'input', resizeFeedbackText);
on(elements.disableWelcomeNotification, 'change', applyFormUpdate);
on(elements.clineScope, 'change', applyFormUpdate);

window.addEventListener('message', (event) => {
	const message = event.data || {};
	if (message.eventType === EVENTS.STATE_UPDATE) {
		panelStateLoaded = true;
		state = { ...state, ...(message.eventData || {}) };
		render();
		document.documentElement.classList.add('panelReady');
		return;
	}

	if (message.eventType === EVENTS.ACTION_SUCCESS) {
		if (message.eventData && message.eventData.action === EVENTS.SUBMIT_FEEDBACK) {
			clearFeedbackForm();
		}
	}
});

post(EVENTS.LOAD);
