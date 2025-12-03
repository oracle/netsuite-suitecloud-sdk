import * as vscode from 'vscode';
import { DEVASSIST, VSCODE_PLATFORM } from '../ApplicationConstants';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import VSConsoleLogger from "../loggers/VSConsoleLogger";
import MessageService from '../service/MessageService';
import { BUTTONS, DEVASSIST_SERVICE, REFRESH_AUTHORIZATION } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';
import { AuthenticationUtils, ExecutionEnvironmentContext, SuiteCloudAuthProxyService } from '../util/ExtensionUtil';
import { output } from '../suitecloud';

type devAssistConfig = {
    proxyEnabled: boolean,
    authID: string,
    localPort: number,
    startupNotificationDisabled: boolean
};

const devAssistConfigStatus: { current: devAssistConfig, previous: devAssistConfig } = {
    current: {
        proxyEnabled: false,
        authID: '',
        localPort: 0,
        startupNotificationDisabled: false,
    },
    previous: {
        proxyEnabled: false,
        authID: '',
        localPort: 0,
        startupNotificationDisabled: false
    }
}

const PROXY_SERVICE_EVENTS = {
    PROXY_ERROR: 'proxyError',
    REAUTHORIZE: 'manualAuthRefreshRequired',
    REQUEST_PATH_NOT_ALLOWED: 'requestPathNotAllowed',
    SERVER_ERROR: 'serverError',
    SERVER_ERROR_ON_REFRESH: 'serverErrorOnRefresh',
    UNAUTHORIZED_PROXY_REQUEST: 'unauthorizedProxyRequest',
}

const executionEnvironmentContext = new ExecutionEnvironmentContext({
    platform: VSCODE_PLATFORM,
    platformVersion: vscode.version,
});

let devAssistProxyService: SuiteCloudAuthProxyService;
const vsLogger: VSConsoleLogger = new VSConsoleLogger();
const vsNotificationService = new MessageService('DevAssistService');
const translationService = new VSTranslationService();
let awaitingApiKeyCreation = false;


export const startDevAssistProxyIfEnabled = async (extensionContext: vscode.ExtensionContext, devAssistStatusBar: vscode.StatusBarItem) => {
    updateDevAssistConfigStatus();

    if (!devAssistConfigStatus.current.startupNotificationDisabled && !devAssistConfigStatus.current.proxyEnabled) {
        showDevAssistStartUpNotification();
    }

    if (devAssistConfigStatus.current.proxyEnabled) {
        try {
            devAssistStatusBar.show();
            await initializeDevAssistService(extensionContext, devAssistStatusBar);
            await startDevAssistService(devAssistConfigStatus.current.authID, devAssistConfigStatus.current.localPort, devAssistStatusBar);
        } catch (error) {
            console.log(error);
            showStartDevAssistProblemNotification('startup', error as string, devAssistStatusBar);
        }
    } else {
        vsLogger.printTimestamp();
        vsLogger.info(translationService.getMessage(DEVASSIST_SERVICE.STARTUP.SERVICE_NOT_ENABLED_OUTPUT_MESSAGE));
    }
    // add extra line to differenciate logs
    vsLogger.info('');
}

export const devAssistConfigurationChangeHandler = async (configurationChangeEvent: vscode.ConfigurationChangeEvent, extensionContext: vscode.ExtensionContext, devAssistStatusBar: vscode.StatusBarItem) => {
    if (configurationChangeEvent.affectsConfiguration(DEVASSIST.CONFIG_KEYS.devAssistSection)) {
        updateDevAssistConfigStatus();

        if (!devAssistConfigStatusHasEffectivelyChanged()) {
            // if configuration has not effectively changed do not perform any action
            return;
        }

        if (devAssistConfigStatus.current.proxyEnabled === true) {
            devAssistStatusBar.show();
            try {
                if (devAssistProxyService) {
                    await devAssistProxyService?.stop();
                } else {
                    await initializeDevAssistService(extensionContext, devAssistStatusBar);
                }
                await startDevAssistService(devAssistConfigStatus.current.authID, devAssistConfigStatus.current.localPort, devAssistStatusBar);
            } catch (error) {
                showStartDevAssistProblemNotification('settingsChange', error as string, devAssistStatusBar);
            }
            // add extra line to differenciate logs
            vsLogger.info('');
        } else { // devAssistConfigStatus.current.proxyEnabled === false
            if (devAssistProxyService) {
                // only try to stop the service if has been initialized
                // this check is usefull for initial stages when no apiKey is present
                await stopDevAssistService(devAssistStatusBar);
            }
            devAssistStatusBar.hide();
        }
    }
};

export const devAssistSecretApiKeyChangeHandler = async (secretChangeEvent: vscode.SecretStorageChangeEvent, extensionContext: vscode.ExtensionContext, devAssistStatusBar: vscode.StatusBarItem) => {
    const currentConfig: devAssistConfig = getDevAssistCurrentSettings();
    if (secretChangeEvent.key === DEVASSIST.SECRET_STORAGE_KEY_ID && currentConfig.proxyEnabled && !awaitingApiKeyCreation) {
        if (devAssistProxyService) {
            const devassistApiKey = await extensionContext.secrets.get(DEVASSIST.SECRET_STORAGE_KEY_ID);
            devAssistProxyService.updateApiKey(devassistApiKey);
        }
        else (
            await initializeDevAssistService(extensionContext, devAssistStatusBar)
        )
    }
};

const initializeDevAssistService = async (extensionContext: vscode.ExtensionContext, devAssistStatusBar: vscode.StatusBarItem) => {
    const devassistApiKey = await extensionContext.secrets.get(DEVASSIST.SECRET_STORAGE_KEY_ID);

    if (!devassistApiKey) {
        // when no devassistApiKey secret is available (only at initial devassist setup), attempt to setup a new one
        // and block service intialization on devAssistSecretApiKeyChangeHandler while this asynchronous code awaits to be resolved
        awaitingApiKeyCreation = true;
        const createApiKeyCommandResult = await triggerCreateNewApiKeyCommand();
        awaitingApiKeyCreation = false;
        // no apiKey was created
        if (!createApiKeyCommandResult) {
            // disable devassist service via setting change to force user to do it again if required
            const devAssistConfigSection = vscode.workspace.getConfiguration(DEVASSIST.CONFIG_KEYS.devAssistSection);
            devAssistConfigSection.update(DEVASSIST.CONFIG_KEYS.proxyEnabled, false);
            
            // throw to stop initialization and start flow
            const initialApiKeyCreationError = translationService.getMessage(DEVASSIST_SERVICE.CREATE_API_KEY.INITIAL_CREATION_ERROR)
            throw initialApiKeyCreationError;
        }

        // apiKey was created by triggerCreateNewApiKeyCommand
        devAssistProxyService = new SuiteCloudAuthProxyService(getSdkPath(), executionEnvironmentContext, DEVASSIST.ALLOWED_PROXY_PATH_PREFIX, createApiKeyCommandResult as string);
        addListenersToDevAssistProxyService(devAssistProxyService, devAssistStatusBar);
        return
    }

    if (devAssistProxyService) {
        devAssistProxyService.updateApiKey(devassistApiKey)
    } else {
        devAssistProxyService = new SuiteCloudAuthProxyService(getSdkPath(), executionEnvironmentContext, DEVASSIST.ALLOWED_PROXY_PATH_PREFIX, devassistApiKey);
        addListenersToDevAssistProxyService(devAssistProxyService, devAssistStatusBar);
    }
};

/**
 * Attaches all event listeners to the devAssistProxyService instance.
 * Handles authentication, error, and proxy events.
 */
const addListenersToDevAssistProxyService = (devAssistProxyService: SuiteCloudAuthProxyService, devAssistStatusBar: vscode.StatusBarItem) => {
    // Listener to trigger manual reauthentication from vscode
    devAssistProxyService.on(PROXY_SERVICE_EVENTS.REAUTHORIZE, async (emitParams: { authId: string, message: string }) => {
        const refreshIsSuccessful = await refreshAuthorizationWithNotifications(emitParams.authId);
        if (refreshIsSuccessful) {
            updateDevAssistConfigStatus();
            try {
                // TODO: we could be using something like devAsssitProxy.reloadAccessToken() to avoid extra forceRefresh in next cline request
                await stopDevAssistService(devAssistStatusBar);
                await startDevAssistService(devAssistConfigStatus.current.authID, devAssistConfigStatus.current.localPort, devAssistStatusBar);
            } catch (error) {
                showStartDevAssistProblemNotification('afterManualRefresh', error as string, devAssistStatusBar);
            }
            vsLogger.error('');
        }
    });

    // Listener to forward ServerError from SuiteCloudAuthProxy to vscode SuiteCloud output
    devAssistProxyService.on(PROXY_SERVICE_EVENTS.SERVER_ERROR, (emitParams: { authId: string, message: string }) => {
        const errorMessage = translationService.getMessage(DEVASSIST_SERVICE.EMIT_ERROR.OUTPUT.SERVER_ERROR, emitParams.message);
        showDevAssistEmitProblemLog(PROXY_SERVICE_EVENTS.SERVER_ERROR, errorMessage, devAssistStatusBar);
        vsLogger.error('');
    });

    devAssistProxyService.on(PROXY_SERVICE_EVENTS.PROXY_ERROR, (emitParams: { authId: string, message: string }) => {
        const errorMessage = translationService.getMessage(DEVASSIST_SERVICE.EMIT_ERROR.OUTPUT.PROXY_ERROR, emitParams.message);
        showDevAssistEmitProblemNotification(PROXY_SERVICE_EVENTS.PROXY_ERROR, errorMessage, devAssistStatusBar);
        vsLogger.error('');
    });

    devAssistProxyService.on(PROXY_SERVICE_EVENTS.REQUEST_PATH_NOT_ALLOWED, (emitParams: { authId: string, message: string }) => {
        const errorMessage = translationService.getMessage(DEVASSIST_SERVICE.EMIT_ERROR.OUTPUT.PATH_NOT_ALLOWED_ERROR,
            getProxyUrl(devAssistConfigStatus.current.localPort));
        showDevAssistEmitProblemLog(PROXY_SERVICE_EVENTS.REQUEST_PATH_NOT_ALLOWED, errorMessage, devAssistStatusBar);
        vsLogger.error('');
    });

    devAssistProxyService.on(PROXY_SERVICE_EVENTS.SERVER_ERROR_ON_REFRESH, (emitParams: { authId: string, message: string }) => {
        const errorMessage = translationService.getMessage(DEVASSIST_SERVICE.EMIT_ERROR.OUTPUT.SERVER_ERROR_ON_REFRESH, emitParams.message);
        showDevAssistEmitProblemNotification(PROXY_SERVICE_EVENTS.SERVER_ERROR_ON_REFRESH, errorMessage, devAssistStatusBar);
        vsLogger.error('');
    });

    devAssistProxyService.on(PROXY_SERVICE_EVENTS.UNAUTHORIZED_PROXY_REQUEST, (emitParams: { authId: string, message: string, requestUrl?: string }) => {
        if (emitParams?.requestUrl === DEVASSIST.MODELS_PATH) {
            // CLINE is performing a "/models" request each time its configuration is open or setting is modified (on each character typing input)
            // we want to avoid showing the warning in this case
            console.log('Received unauthorized /models request.');
            return;
        }
        const outputErrorMessage = translationService.getMessage(DEVASSIST_SERVICE.EMIT_ERROR.OUTPUT.UNAUTHORIZED_PROXY_REQUEST, emitParams.message);
        showDevAssistApiKeyProblem(PROXY_SERVICE_EVENTS.UNAUTHORIZED_PROXY_REQUEST, outputErrorMessage, devAssistStatusBar);
        vsLogger.error('');
    });
};

const startDevAssistService = async (devAssistAuthID: string, localPort: number, devAssistStatusBar: vscode.StatusBarItem) => {
    await devAssistProxyService.start(devAssistAuthID, localPort);

    const proxyUrl = getProxyUrl(localPort);
    setSuccessDevAssistStausBarMessage(devAssistStatusBar);
    showDevAssistIsRunningNotification(proxyUrl);

    vsLogger.printTimestamp();
    vsLogger.info(translationService.getMessage(DEVASSIST_SERVICE.IS_RUNNING.OUTPUT, getProxyUrlWithoutPath(localPort), devAssistAuthID, proxyUrl));
}

const PROXY_URL = DEVASSIST.PROXY_URL;
const getProxyUrl = (port: number) => `${PROXY_URL.SCHEME}${PROXY_URL.LOCALHOST_IP}:${port}${PROXY_URL.BASE_PATH}`;
const getProxyUrlWithoutPath = (port: number) => `${PROXY_URL.SCHEME}${PROXY_URL.LOCALHOST_IP}:${port}`;

const stopDevAssistService = async (devAssistStatusBar: vscode.StatusBarItem) => {
    await devAssistProxyService?.stop();

    setErrorDevAssistStausBarMessage(devAssistStatusBar);
    // only notify that devassist service has been disabled in the transition from enabled to disabled
    if (!devAssistConfigStatus.current.proxyEnabled && devAssistConfigStatus.previous.proxyEnabled) {
        vsNotificationService.showCommandInfo(translationService.getMessage(DEVASSIST_SERVICE.IS_DISABLED.OUTPUT));

        vsLogger.printTimestamp();
        vsLogger.info(translationService.getMessage(DEVASSIST_SERVICE.IS_DISABLED.NOTIFICATION));
        // add line separator
        vsLogger.info('');
    }
}

const showDevAssistStartUpNotification = () => {
    const infoMessage: string = translationService.getMessage(DEVASSIST_SERVICE.STARTUP.MESSAGE);
    const buttonsAndActions: { buttonMessage: string, buttonAction: () => void }[] = [
        {
            buttonMessage: translationService.getMessage(BUTTONS.OPEN_SETTINGS),
            buttonAction: openDevAssistSettings
        },
        {
            buttonMessage: translationService.getMessage(BUTTONS.DONT_SHOW_AGAIN),
            buttonAction: () => {
                const devAssistConfigSection = vscode.workspace.getConfiguration(DEVASSIST.CONFIG_KEYS.devAssistSection);
                devAssistConfigSection.update(DEVASSIST.CONFIG_KEYS.startupNotificationDisabled, true);
            }
        }
    ];
    vsNotificationService.showCommandInfoWithSpecificButtonsAndActions(infoMessage, buttonsAndActions);
}

const showDevAssistIsRunningNotification = (proxyUrl: string) => {
    const infoMessage: string = translationService.getMessage(DEVASSIST_SERVICE.IS_RUNNING.NOTIFICATION, proxyUrl);
    const buttonsAndActions: { buttonMessage: string, buttonAction: () => void }[] = [
        {
            buttonMessage: translationService.getMessage(BUTTONS.SEE_DETAILS),
            buttonAction: vsNotificationService.showOutput
        },
        {
            buttonMessage: translationService.getMessage(BUTTONS.GIVE_FEEDBACK),
            buttonAction: () => {
                vscode.commands.executeCommand('suitecloud.opendevassistfeedbackform')
            }
        },
    ];
    vsNotificationService.showCommandInfoWithSpecificButtonsAndActions(infoMessage, buttonsAndActions);
}

// TODO: refactor showNotificaiton methods into a generic one like:
// const showNotificationGeneric = (notificationConfig: {
//     stopSatusBar: boolean,
//     outputMessage: string,
//     notificationMessage: string,
//     notificationType: 'info'|'error'
//     buttonsAndActions: {}
// }) => { 
//     //method body
//     }


// stoped status bar
// logs into output
//      (DEVASSIST_SERVICE.IS_STOPPED.OUTPUT, error)
// show notifcation
//      (DEVASSIST_SERVICE.IS_STOPPED.NOTIFICATION)
//      with See Detials button (opens output and devassistSettings)
const showStartDevAssistProblemNotification = (errorStage: string, error: string, devAssistStatusBar: vscode.StatusBarItem) => {
    // console.log(`There was a problem when starting DevAssist service. (${errorStage})\n${error}`)
    setErrorDevAssistStausBarMessage(devAssistStatusBar);
    vsLogger.printTimestamp();
    vsLogger.error(translationService.getMessage(DEVASSIST_SERVICE.IS_STOPPED.OUTPUT, error));
    const errorMessage = translationService.getMessage(DEVASSIST_SERVICE.IS_STOPPED.NOTIFICATION);
    const buttonsAndActions: { buttonMessage: string, buttonAction: () => void }[] = [
        {
            buttonMessage: translationService.getMessage(BUTTONS.SEE_DETAILS),
            buttonAction: () => {
                // show suitecloud output and devassist settings
                output.show();
                openDevAssistSettings();
            },
        },
    ];
    vsNotificationService.showCommandErrorWithSpecificButtonsAndActions(errorMessage, buttonsAndActions);
}

// logs into output
//      emitError
// show notifcation
//      (DEVASSIST_SERVICE.IS_STOPPED.NOTIFICATION)
//      with See Detials button (opens output)
const showDevAssistEmitProblemLog = (errorStage: string, outputError: string, devAssistStatusBar: vscode.StatusBarItem) => {
    vsLogger.printTimestamp();
    vsLogger.error(outputError);
    const errorMessage = translationService.getMessage(DEVASSIST_SERVICE.IS_STOPPED.NOTIFICATION);
    const buttonsAndActions: { buttonMessage: string, buttonAction: () => void }[] = [
        {
            buttonMessage: translationService.getMessage(BUTTONS.SEE_DETAILS),
            buttonAction: () => output.show(),
        },
    ];
    vsNotificationService.showCommandErrorWithSpecificButtonsAndActions(errorMessage, buttonsAndActions);
};


// logs into output
//      outputErrorMessge
// show notifcation
//      something about wrong API key
//      with See Detials button (opens output)
const showDevAssistApiKeyProblem = (errorStage: string, outputErrorMessge: string, devAssistStatusBar: vscode.StatusBarItem) => {
    vsLogger.printTimestamp();
    vsLogger.error(outputErrorMessge);
    const newApiKeyButtonMessage = translationService.getMessage(DEVASSIST_SERVICE.EMIT_ERROR.BUTTON.CREATE_NEW_API_KEY);
    const buttonsAndActions: { buttonMessage: string, buttonAction: () => void }[] = [
        {
            buttonMessage: newApiKeyButtonMessage,
            buttonAction: () => triggerCreateNewApiKeyCommand()
        },
    ];
    vsNotificationService.showCommandErrorWithSpecificButtonsAndActions(outputErrorMessge, buttonsAndActions);
};

// stoped status bar
// logs into output
//      emitError
// show notifcation
//      (DEVASSIST_SERVICE.IS_STOPPED.NOTIFICATION)
//      with See Detials button (opens output)
const showDevAssistEmitProblemNotification = (errorStage: string, emitError: string, devAssistStatusBar: vscode.StatusBarItem) => {
    // console.log(`There was a problem when starting DevAssist service. (${errorStage})\n${error}`)
    setErrorDevAssistStausBarMessage(devAssistStatusBar)
    vsLogger.printTimestamp();
    vsLogger.error(emitError);
    const errorMessage = translationService.getMessage(DEVASSIST_SERVICE.IS_STOPPED.NOTIFICATION);
    const buttonsAndActions: { buttonMessage: string, buttonAction: () => void }[] = [
        {
            buttonMessage: translationService.getMessage(BUTTONS.SEE_DETAILS),
            buttonAction: () => {
                // show suitecloud output and devassist settings
                output.show()
                openDevAssistSettings();
            },
        },
    ];
    vsNotificationService.showCommandErrorWithSpecificButtonsAndActions(errorMessage, buttonsAndActions);
}

const openDevAssistSettings = () => {
    vscode.commands.executeCommand(
        'workbench.action.openWorkspaceSettings',
        DEVASSIST.CONFIG_KEYS.devAssistSection
    );
}

const triggerCreateNewApiKeyCommand = () => {
    return vscode.commands.executeCommand('suitecloud.createdevassistapikey');
}

const updateDevAssistConfigStatus = (): void => {
    const currentConfig: devAssistConfig = getDevAssistCurrentSettings();
    const previousConfig: devAssistConfig = devAssistConfigStatus.current;

    // update saved status
    devAssistConfigStatus.current = currentConfig;
    devAssistConfigStatus.previous = previousConfig;
}

export const getDevAssistCurrentSettings = (): devAssistConfig => {
    const devAssistConfigSection = vscode.workspace.getConfiguration(DEVASSIST.CONFIG_KEYS.devAssistSection);

    //  * The *effective* value (returned by {@linkcode WorkspaceConfiguration.get get}) is computed by overriding or merging the values in the following order:
    //  *
    //  * 1. `defaultValue` (if defined in `package.json` otherwise derived from the value's type)
    //  * 2. `globalValue` (if defined)
    //  * 3. `workspaceValue` (if defined)
    //  * 4. `workspaceFolderValue` (if defined)
    //  * 5. `defaultLanguageValue` (if defined)
    //  * 6. `globalLanguageValue` (if defined)
    //  * 7. `workspaceLanguageValue` (if defined)
    //  * 8. `workspaceFolderLanguageValue` (if defined)
    //  * Refer to [Settings](https://code.visualstudio.com/docs/getstarted/settings) for more information.

    const proxyEnabled = devAssistConfigSection.get<boolean>(DEVASSIST.CONFIG_KEYS.proxyEnabled, DEVASSIST.DEFAULT_VALUES.proxyEnabled);
    const authID = devAssistConfigSection.get<string>(DEVASSIST.CONFIG_KEYS.auhtID, DEVASSIST.DEFAULT_VALUES.authID);
    const localPort = devAssistConfigSection.get<number>(DEVASSIST.CONFIG_KEYS.localPort, DEVASSIST.DEFAULT_VALUES.localPort);
    const startupNotificationEnabled = devAssistConfigSection.get<boolean>(DEVASSIST.CONFIG_KEYS.startupNotificationDisabled, DEVASSIST.DEFAULT_VALUES.startupNotificationDisabled);

    return { proxyEnabled, authID, localPort, startupNotificationDisabled: startupNotificationEnabled }
}

const devAssistConfigStatusHasEffectivelyChanged = (): boolean => {
    // we don't know exactly where configuration change comes from when devAssistConfigurationChangeHandler is called
    // it could be that the configuration has changed from globalValue (user) and there is a workspaceValue that has been left intact
    // this is not 100% certain, but the configuration could have been changed even in a different vscode editor instance
    // we should not be performing any action in the case where DevAssist settings haven't effectively changed

    // intentionally omiting to compare startupNotificationDisabled status
    if (devAssistConfigStatus.current.authID === devAssistConfigStatus.previous.authID &&
        devAssistConfigStatus.current.localPort === devAssistConfigStatus.previous.localPort &&
        devAssistConfigStatus.current.proxyEnabled === devAssistConfigStatus.previous.proxyEnabled
    ) {
        return false;
    }
    return true;
}

// How to update: https://stackoverflow.com/questions/59161682/how-to-set-the-custom-icons-logos-in-the-status-bar-setstatusbarmessage-of-v
// using FontFoge App and importing the logo.svg into a template_font.woff
const setSuccessDevAssistStausBarMessage = (devAssistStatusBar: vscode.StatusBarItem): void => {
    devAssistStatusBar.text = `$(netsuite-mobius-colorless-icon)  ${translationService.getMessage(DEVASSIST_SERVICE.IS_RUNNING.STATUSBAR)}`;
    devAssistStatusBar.backgroundColor = undefined;
}
const setErrorDevAssistStausBarMessage = (devAssistStatusBar: vscode.StatusBarItem): void => {
    devAssistStatusBar.text = `$(netsuite-mobius-colorless-icon)  ${translationService.getMessage(DEVASSIST_SERVICE.IS_STOPPED.STATUSBAR)}`;
    devAssistStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
}

// refresh authorization with notification popups 
const refreshAuthorizationWithNotifications = async (authID: string) => {
    const executionEnvironmentContext = new ExecutionEnvironmentContext({
        platform: VSCODE_PLATFORM,
        platformVersion: vscode.version,
    });
    vsNotificationService.showInformationMessage(
        translationService.getMessage(
            REFRESH_AUTHORIZATION.CREDENTIALS_NEED_TO_BE_REFRESHED, authID
        )
    );
    const refreshAuthzOperationResult = await AuthenticationUtils.refreshAuthorization(
        authID,
        getSdkPath(),
        executionEnvironmentContext
    );

    if (!refreshAuthzOperationResult.isSuccess()) {
        // throw refreshAuthzOperationResult.errorMessages;
        // vsLogger.error(refreshAuthzOperationResult.)
        vsNotificationService.showCommandError(refreshAuthzOperationResult.errorMessages.join('\n'), false);
        return false;
    }
    vsNotificationService.showInformationMessage(
        translationService.getMessage(
            REFRESH_AUTHORIZATION.AUTHORIZATION_REFRESH_COMPLETED
        )
    );
    return true;
}
