/* global acquireVsCodeApi */

const vscode = acquireVsCodeApi();

const EVENTS = window.__SUITECLOUD_PANEL_EVENTS__;
const PANEL_CONFIG = Object.freeze(window.__SUITECLOUD_PANEL_CONFIG__);
const DEFAULT_PROXY_PORT = PANEL_CONFIG.defaultProxyPort;
const MINIMUM_PROXY_PORT = PANEL_CONFIG.minimumProxyPort;
const MAXIMUM_PROXY_PORT = PANEL_CONFIG.maximumProxyPort;
const PORT_UPDATE_DEBOUNCE_MS = 250;
const ACTIVE_PROXY_STATUSES = new Set(['starting', 'running', 'stopping']);
const UI_STRINGS = Object.freeze(window.__SUITECLOUD_PANEL_STRINGS__);
const STATUS_LABELS = Object.freeze({
	stopped: UI_STRINGS.statusStopped,
	starting: UI_STRINGS.statusStarting,
	running: UI_STRINGS.statusRunning,
	stopping: UI_STRINGS.statusStopping,
	error: UI_STRINGS.statusError
});

const byId = (id) => document.getElementById(id);
const elements = {
	initializationView: byId('initializationView'),
	authId: byId('authId'),
	authIdField: byId('authIdField'),
	setupAccount: byId('setupAccount'),
	port: byId('port'),
	portField: byId('portField'),
	portValidation: byId('portValidation'),
	statusBadge: byId('statusBadge'),
	apiKeyRow: byId('apiKeyRow'),
	apiKeyStatus: byId('apiKeyStatus'),
	apiKeyStatusIcon: byId('apiKeyStatusIcon'),
	apiKeyStatusText: byId('apiKeyStatusText'),
	maskedApiKey: byId('maskedApiKey'),
	copyApiKey: byId('copyApiKey'),
	apiKeyCountdown: byId('apiKeyCountdown'),
	lastError: byId('lastError'),
	lastErrorRow: byId('lastErrorRow'),
	clineInstalledIcon: byId('clineInstalledIcon'),
	clineInstalledLabel: byId('clineInstalledLabel'),
	clineSyncedIcon: byId('clineSyncedIcon'),
	clineSyncedLabel: byId('clineSyncedLabel'),
	clineStatusBadge: byId('clineStatusBadge'),
	clineSyncMessage: byId('clineSyncMessage'),
	clineScope: byId('clineScope'),
	providerDisclosure: byId('providerDisclosure'),
	providerDisclosureSummary: byId('providerDisclosureSummary'),
	providerBaseUrl: byId('providerBaseUrl'),
	providerApiKey: byId('providerApiKey'),
	disableWelcomeNotification: byId('disableWelcomeNotification'),
	rotateKey: byId('rotateKey'),
	rotateKeyIcon: byId('rotateKeyIcon'),
	rotateKeyLabel: byId('rotateKeyLabel'),
	startProxy: byId('startProxy'),
	stopProxy: byId('stopProxy'),
	openOutput: byId('openOutput'),
	clineActionTooltip: byId('clineActionTooltip'),
	clineAction: byId('clineAction'),
	toggleFeedback: byId('toggleFeedback'),
	feedbackContent: byId('feedbackContent'),
	closeFeedback: byId('closeFeedback'),
	feedbackText: byId('feedbackText'),
	submitFeedback: byId('submitFeedback'),
	controlPanelContent: byId('controlPanelContent'),
	expandedViewInfo: byId('expandedViewInfo'),
	expandView: byId('expandView')
};

let state = {
	initializationStatus: 'loading',
	isSdkReady: false,
	authId: '',
	port: DEFAULT_PROXY_PORT,
	proxyStatus: 'stopped',
	proxyOwnership: 'none',
	baseUrl: '',
	runtimeAuthId: null,
	hasPendingRuntimeConfig: false,
	maskedApiKey: '',
	apiKeyVisible: false,
	apiKeyVisibleUntilMs: null,
	apiKeyExists: false,
	apiKeyActionLabel: UI_STRINGS.defaultApiKeyActionLabel,
	disableWelcomeNotification: false,
	clineScope: 'user',
	authIds: [],
	isClineInstalled: false,
	isClineCompatible: false,
	clineCompatibilityMessage: '',
	isClineConfigInSync: false,
	clineConfigSyncMessage: '',
	expandedViewOpen: false,
	lastError: null
};

let apiKeyCountdownIntervalHandle = null;
let portUpdateTimeoutHandle = null;
let panelStateLoaded = false;
let feedbackExpanded = false;
let lastAuthIdRefreshRequestAt = 0;
let clineActionEventType = EVENTS.OPEN_CLINE_MARKETPLACE;

function post(eventType, eventData) {
	vscode.postMessage({ eventType, eventData });
}

function on(element, eventName, listener) {
	if (element) {
		element.addEventListener(eventName, listener);
	}
}

function setTooltip(element, message) {
	if (message) {
		element.dataset.tooltip = message;
	} else {
		delete element.dataset.tooltip;
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
	const isValid =
		portValue === '' ||
		(/^\d+$/.test(portValue) && port >= MINIMUM_PROXY_PORT && port <= MAXIMUM_PROXY_PORT);
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

function clearScheduledPortUpdate() {
	if (portUpdateTimeoutHandle) {
		clearTimeout(portUpdateTimeoutHandle);
		portUpdateTimeoutHandle = null;
	}
}

function applyPortUpdate() {
	clearScheduledPortUpdate();
	applyProxyConfigUpdate();
}

function schedulePortUpdate() {
	clearScheduledPortUpdate();
	if (!validatePort(false)) {
		return;
	}
	portUpdateTimeoutHandle = setTimeout(() => {
		portUpdateTimeoutHandle = null;
		applyProxyConfigUpdate();
	}, PORT_UPDATE_DEBOUNCE_MS);
}

function startProxy() {
	if (validatePort(true)) {
		clearScheduledPortUpdate();
		post(EVENTS.START_PROXY, getFormUpdatePayload());
	}
}

function renderAuthIds(authIds, selectedAuthId) {
	const currentValue = selectedAuthId || '';
	elements.authId.innerHTML = '';

	const placeholder = document.createElement('option');
	placeholder.value = '';
	placeholder.textContent = UI_STRINGS.authIdPlaceholder;
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
	elements.apiKeyCountdown.title = isCopyAvailable ? UI_STRINGS.apiKeyCopyCountdownTitle : '';
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
	elements.statusBadge.textContent = STATUS_LABELS[status] || STATUS_LABELS.stopped;
	elements.statusBadge.className = `statusPill ${status}`;
}

function renderClineStatus(icon, label, isReady, readyLabel, notReadyLabel) {
	icon.textContent = isReady ? '✓' : '×';
	icon.className = `stateIcon ${isReady ? 'stateIconSuccess' : 'stateIconError'}`;
	label.textContent = isReady ? readyLabel : notReadyLabel;
}

function getClineConfigureDisabledReason({ supportsSync, isProxyAvailable, hasApiKey }) {
	if (!supportsSync) {
		return UI_STRINGS.syncClineIncompatibleTitle;
	}
	if (!hasApiKey) {
		return UI_STRINGS.syncClineMissingApiKeyTitle;
	}
	if (!isProxyAvailable) {
		return UI_STRINGS.syncClineProxyUnavailableTitle;
	}
	return '';
}

function getClineStatusMessage({
	isInstalled,
	supportsSync,
	isSynced,
	compatibilityMessage,
	syncMessage
}) {
	if (!isInstalled || isSynced) {
		return '';
	}
	return supportsSync
		? syncMessage || ''
		: compatibilityMessage || '';
}

function getClineActionState({
	isInstalled,
	supportsSync,
	isSynced,
	isProxyAvailable,
	hasApiKey
}) {
	if (!isInstalled) {
		return {
			label: UI_STRINGS.clineMarketplaceLabel,
			disabledReason: '',
			enabledTitle: UI_STRINGS.clineMarketplaceTitle,
			eventType: EVENTS.OPEN_CLINE_MARKETPLACE
		};
	}

	if (isSynced) {
		return {
			label: UI_STRINGS.clineOpenLabel,
			disabledReason: isProxyAvailable ? '' : UI_STRINGS.openClineChatDisabledTitle,
			enabledTitle: UI_STRINGS.openClineChatEnabledTitle,
			eventType: EVENTS.OPEN_CLINE_CHAT
		};
	}

	return {
		label: UI_STRINGS.clineConfigureLabel,
		disabledReason: getClineConfigureDisabledReason({
			supportsSync,
			isProxyAvailable,
			hasApiKey
		}),
		enabledTitle: UI_STRINGS.syncClineReadyTitle,
		eventType: EVENTS.APPLY_CLINE_SETTINGS
	};
}

function renderCline(status) {
	const isInstalled = !!state.isClineInstalled;
	const isWorkspaceManualSetup = state.clineScope === 'workspace';
	const supportsSync = isInstalled && !!state.isClineCompatible && !isWorkspaceManualSetup;
	const isSynced = !!state.isClineConfigInSync;
	const isClineProxyAvailable = status === 'running';

	renderClineStatus(
		elements.clineInstalledIcon,
		elements.clineInstalledLabel,
		isInstalled,
		UI_STRINGS.clineInstalled,
		UI_STRINGS.clineNotInstalled
	);
	renderClineStatus(
		elements.clineSyncedIcon,
		elements.clineSyncedLabel,
		isSynced,
		UI_STRINGS.clineConfigured,
		UI_STRINGS.clineNotConfigured
	);
	const isReady = isInstalled && isSynced && isClineProxyAvailable;
	elements.clineStatusBadge.textContent = isReady
		? UI_STRINGS.clineReady
		: UI_STRINGS.clineNotReady;
	elements.clineStatusBadge.className = `statusPill${isReady ? ' ready' : ''}`;

	const actionState = getClineActionState({
		isInstalled,
		supportsSync,
		isSynced,
		isProxyAvailable: isClineProxyAvailable,
		hasApiKey: !!state.apiKeyExists
	});
	clineActionEventType = actionState.eventType;
	elements.clineAction.textContent = actionState.label;
	elements.clineAction.disabled = !!actionState.disabledReason;
	elements.clineAction.title = actionState.disabledReason ? '' : actionState.enabledTitle;
	elements.clineAction.setAttribute(
		'aria-label',
		actionState.disabledReason
			? `${actionState.label}. ${actionState.disabledReason}`
			: actionState.label
	);
	setTooltip(elements.clineActionTooltip, actionState.disabledReason);

	const clineStatusMessage = getClineStatusMessage({
		isInstalled,
		supportsSync,
		isSynced,
		compatibilityMessage: state.clineCompatibilityMessage,
		syncMessage: state.clineConfigSyncMessage
	});
	elements.clineSyncMessage.textContent = clineStatusMessage;
	elements.clineSyncMessage.classList.toggle('hidden', !clineStatusMessage);
}

function updateFeedbackSubmitState() {
	const payload = getFeedbackPayload();
	const isRunning = String(state.proxyStatus || '').toLowerCase() === 'running';
	const isComplete =
		!!payload.feedback &&
		payload.topics.length > 0 &&
		Number.isInteger(payload.rating) &&
		payload.rating >= 1 &&
		payload.rating <= 5;
	elements.submitFeedback.disabled = !isRunning || !isComplete;
	elements.submitFeedback.title = !isRunning
		? UI_STRINGS.feedbackProxyRequired
		: !isComplete
			? UI_STRINGS.feedbackIncomplete
			: UI_STRINGS.feedbackSend;
}

function renderFeedback() {
	updateFeedbackSubmitState();
	elements.feedbackContent.classList.toggle('feedbackExpanded', feedbackExpanded);
	elements.feedbackContent.setAttribute('aria-hidden', String(!feedbackExpanded));
	elements.toggleFeedback.setAttribute('aria-expanded', String(feedbackExpanded));
	elements.toggleFeedback.textContent = UI_STRINGS.feedbackShare;
}

function setFeedbackViewOpen(isOpen) {
	feedbackExpanded = isOpen;
	render();
	if (isOpen) {
		resizeFeedbackText();
		elements.closeFeedback.focus();
		return;
	}
	elements.toggleFeedback.focus();
}

function renderProviderDisclosure(isRunning) {
	const disabledReason = UI_STRINGS.openClineChatDisabledTitle;
	elements.providerDisclosure.classList.toggle('disabled', !isRunning);
	elements.providerDisclosureSummary.setAttribute('aria-disabled', String(!isRunning));
	elements.providerDisclosureSummary.setAttribute(
		'aria-label',
		isRunning
			? UI_STRINGS.providerConfigurationLabel
			: `${UI_STRINGS.providerConfigurationLabel}. ${disabledReason}`
	);
	elements.providerDisclosureSummary.tabIndex = isRunning ? 0 : -1;
	elements.providerDisclosureSummary.title = isRunning
		? UI_STRINGS.providerConfigurationShow
		: '';
	setTooltip(elements.providerDisclosure, isRunning ? '' : disabledReason);
	if (!isRunning) {
		elements.providerDisclosure.open = false;
	}
}

function render() {
	const isInitializing = state.initializationStatus !== 'ready';
	elements.initializationView.classList.toggle('hidden', !isInitializing);
	elements.controlPanelContent.classList.toggle('hidden', isInitializing);
	elements.controlPanelContent.setAttribute('aria-hidden', String(isInitializing));
	elements.expandedViewInfo.classList.add('hidden');
	if (isInitializing) {
		return;
	}

	const status = String(state.proxyStatus || 'stopped').toLowerCase();
	const isRunning = status === 'running';
	renderFeedback();
	renderProviderDisclosure(isRunning);

	renderAuthIds(state.authIds, state.authId);
	if (document.activeElement !== elements.port) {
		elements.port.value = String(state.port || DEFAULT_PROXY_PORT);
	}

	const isStarting = status === 'starting';
	const isStopping = status === 'stopping';
	const isOwnedProxy = state.proxyOwnership === 'owned';
	const isProxyConfigLocked = ACTIVE_PROXY_STATUSES.has(status);
	const hasAuthAccounts = Array.isArray(state.authIds) && state.authIds.length > 0;
	const isSdkReady = !!state.isSdkReady;

	setStatusPill(status);

	elements.authId.disabled = isProxyConfigLocked;
	elements.authId.title = '';
	setTooltip(
		elements.authIdField,
		isProxyConfigLocked ? UI_STRINGS.changeAuthIdWhileRunningTitle : ''
	);
	elements.authIdField.classList.toggle('lockedField', isProxyConfigLocked);
	elements.setupAccount.disabled = !isSdkReady;
	setTooltip(
		elements.setupAccount,
		isSdkReady ? UI_STRINGS.setupAuthId : UI_STRINGS.sdkPreparing
	);
	elements.port.disabled = isProxyConfigLocked;
	elements.port.title = '';
	setTooltip(
		elements.portField,
		isProxyConfigLocked ? UI_STRINGS.changePortWhileRunningTitle : ''
	);
	elements.portField.classList.toggle('lockedField', isProxyConfigLocked);
	elements.disableWelcomeNotification.checked = !!state.disableWelcomeNotification;
	elements.clineScope.value = state.clineScope || 'user';

	elements.rotateKey.disabled = !panelStateLoaded || !isSdkReady || isProxyConfigLocked;
	const apiKeyActionTitle = state.apiKeyExists
		? UI_STRINGS.rotateApiKeyTitle
		: UI_STRINGS.generateApiKeyTitle;
	setTooltip(elements.rotateKey, !isSdkReady
		? UI_STRINGS.sdkPreparing
		: isProxyConfigLocked
		? UI_STRINGS.changeApiKeyWhileRunningTitle
		: apiKeyActionTitle);
	elements.rotateKey.setAttribute('aria-label', apiKeyActionTitle);
	elements.rotateKey.classList.toggle('iconOnlyButton', state.apiKeyExists);
	elements.rotateKeyIcon.classList.toggle('hidden', !state.apiKeyExists);
	elements.rotateKeyLabel.classList.toggle('hidden', state.apiKeyExists);

	const hasApiKey = isSdkReady && !!state.apiKeyExists;
	elements.apiKeyRow.classList.toggle('hasApiKey', hasApiKey);
	elements.apiKeyStatusIcon.textContent = hasApiKey ? '✓' : '×';
	elements.apiKeyStatusIcon.className =
		`stateIcon ${hasApiKey ? 'stateIconSuccess' : 'stateIconError'}`;
	elements.apiKeyStatusText.textContent = hasApiKey
		? UI_STRINGS.apiKeyGeneratedWithValue
		: UI_STRINGS.apiKeyNotGenerated;
	elements.apiKeyStatus.setAttribute(
		'aria-label',
		hasApiKey ? UI_STRINGS.apiKeyGenerated : UI_STRINGS.apiKeyNotGenerated
	);
	elements.maskedApiKey.textContent = hasApiKey
		? state.maskedApiKey || UI_STRINGS.notResolved
		: '';
	elements.providerBaseUrl.textContent = state.baseUrl || '-';
	elements.providerApiKey.textContent = hasApiKey
		? UI_STRINGS.providerApiKeyValueTemplate.replace(
			'{0}',
			state.maskedApiKey || UI_STRINGS.notResolved
		)
		: UI_STRINGS.providerApiKeyMissing;
	scheduleApiKeyCountdown();

	const showStartProxy = !isRunning && !isStopping && hasApiKey;
	elements.startProxy.classList.toggle('hidden', !showStartProxy);
	elements.stopProxy.classList.toggle('hidden', !isRunning || !isOwnedProxy);
	elements.startProxy.disabled = !isSdkReady || isStarting || !hasAuthAccounts || !state.authId || !state.apiKeyExists;
	elements.startProxy.querySelector('span:last-child').textContent = isStarting
		? UI_STRINGS.proxyStarting
		: UI_STRINGS.proxyStart;
	elements.startProxy.title = !isSdkReady
		? UI_STRINGS.sdkPreparing
		: UI_STRINGS.proxyStartTitle;
	elements.stopProxy.disabled = isStopping;
	elements.stopProxy.querySelector('span:last-child').textContent = isStopping
		? UI_STRINGS.proxyStopping
		: UI_STRINGS.proxyStop;
	elements.stopProxy.title = UI_STRINGS.proxyStopTitle;
	elements.lastError.textContent = state.lastError || '';
	elements.lastErrorRow.classList.toggle('hidden', !state.lastError);

	renderCline(status);

	const inSidebarMode = document.body.dataset.viewMode === 'sidebar';
	const showExpandedMessage = !feedbackExpanded && inSidebarMode && !!state.expandedViewOpen;
	const hideControlPanel = feedbackExpanded || showExpandedMessage;
	elements.controlPanelContent.classList.toggle('hidden', hideControlPanel);
	elements.controlPanelContent.setAttribute('aria-hidden', String(hideControlPanel));
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
	updateFeedbackSubmitState();
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
on(elements.clineAction, 'click', () => post(clineActionEventType));
on(elements.providerDisclosureSummary, 'click', (event) => {
	if (elements.providerDisclosure.classList.contains('disabled')) {
		event.preventDefault();
	}
});
on(elements.providerDisclosure, 'toggle', () => {
	if (elements.providerDisclosure.classList.contains('disabled') && elements.providerDisclosure.open) {
		elements.providerDisclosure.open = false;
	}
});
on(elements.toggleFeedback, 'click', () => {
	setFeedbackViewOpen(true);
});
on(elements.closeFeedback, 'click', () => setFeedbackViewOpen(false));
on(elements.expandView, 'click', () => post(EVENTS.OPEN_EXPANDED_VIEW));
on(elements.submitFeedback, 'click', () => post(EVENTS.SUBMIT_FEEDBACK, getFeedbackPayload()));

on(elements.authId, 'change', applyProxyConfigUpdate);
on(elements.port, 'change', applyPortUpdate);
on(elements.port, 'input', schedulePortUpdate);
on(elements.feedbackText, 'input', () => {
	resizeFeedbackText();
	updateFeedbackSubmitState();
});
document.querySelectorAll('input[name="topics"], input[name="rating"]').forEach((input) => {
	on(input, 'change', updateFeedbackSubmitState);
});
on(elements.disableWelcomeNotification, 'change', applyFormUpdate);
on(elements.clineScope, 'change', applyFormUpdate);

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && feedbackExpanded) {
		event.preventDefault();
		setFeedbackViewOpen(false);
	}
});

window.addEventListener('message', (event) => {
	const message = event.data || {};
	if (message.eventType === EVENTS.STATE_UPDATE) {
		panelStateLoaded = true;
		state = { ...state, ...(message.eventData || {}) };
		render();
		return;
	}

	if (message.eventType === EVENTS.ACTION_SUCCESS) {
		if (message.eventData && message.eventData.action === EVENTS.SUBMIT_FEEDBACK) {
			clearFeedbackForm();
		}
	}
});

render();
document.documentElement.classList.add('panelReady');
post(EVENTS.LOAD);
