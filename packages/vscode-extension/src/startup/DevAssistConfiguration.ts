import * as vscode from 'vscode';
import { DEVASSIST, VSCODE_PLATFORM } from '../ApplicationConstants';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import VSConsoleLogger from "../loggers/VSConsoleLogger";
import MessageService from '../service/MessageService';
import { DEVASSIST_SERVICE, REFRESH_AUTHORIZATION } from '../service/TranslationKeys';
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
    REAUTHORIZE: 'authRefreshManual',
    SERVER_ERROR: 'serverError'
}

const executionEnvironmentContext = new ExecutionEnvironmentContext({
    platform: VSCODE_PLATFORM,
    platformVersion: vscode.version,
});

let devAssistProxyService: SuiteCloudAuthProxyService;
const vsLogger: VSConsoleLogger = new VSConsoleLogger();
const vsNotificationService = new MessageService('DevAssistService');
const translationService = new VSTranslationService();


export const startDevAssistProxyIfEnabled = async (devAssistStatusBar: vscode.StatusBarItem) => {
    updateDevAssistConfigStatus();

    if (!devAssistConfigStatus.current.startupNotificationDisabled && !devAssistConfigStatus.current.proxyEnabled) {
        showDevAssistStartUpNotification();
    }

    if (devAssistConfigStatus.current.proxyEnabled) {
        try {
            devAssistStatusBar.show();
            initializeDevAssistService(devAssistStatusBar);
            await startDevAssistService(devAssistConfigStatus.current.authID, devAssistConfigStatus.current.localPort, devAssistStatusBar);
        } catch (error) {
            showStartDevAssistProblemNotification('startup', error as string, devAssistStatusBar);
        }
    } else {
        // TODO: We might want to propose to configure and enable service
        vsLogger.info(translationService.getMessage(DEVASSIST_SERVICE.IS_DISABLED.OUTPUT));
    }
    // add extra line to differenciate logs
    vsLogger.info('');
}

export const devAssistConfigurationChangeHandler = async (configurationChangeEvent: vscode.ConfigurationChangeEvent, devAssistStatusBar: vscode.StatusBarItem) => {
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
                    devAssistProxyService?.stop();
                } else {
                    initializeDevAssistService(devAssistStatusBar);
                }
                await startDevAssistService(devAssistConfigStatus.current.authID, devAssistConfigStatus.current.localPort, devAssistStatusBar);
            } catch (error) {
                showStartDevAssistProblemNotification('settingsChange', error as string, devAssistStatusBar);
            }
            // add extra line to differenciate logs
            vsLogger.info('');
        } else { // devAssistConfigStatus.current.proxyEnabled === false
            stopDevAssistService(devAssistStatusBar);
            devAssistStatusBar.hide()
        }
    }
};

const initializeDevAssistService = (devAssistStatusBar: vscode.StatusBarItem) => {
    devAssistProxyService = new SuiteCloudAuthProxyService(getSdkPath(), executionEnvironmentContext);

    // adding listener to trigger manual reauthentication from vscode
    devAssistProxyService.on(PROXY_SERVICE_EVENTS.REAUTHORIZE, async (emitParams: { authId: string, message: string }) => {
        // trigger refresh on emited authID 
        const refreshIsSuccessful = await refreshAuthorizationWithNotifications(emitParams.authId);
        if (refreshIsSuccessful) {
            // edgy case: user might have changed configured authid while waiting for the manual refresh to complete
            updateDevAssistConfigStatus();
            try {
                // TODO: we could be using something like devAsssitProxy.reloadAccessToken() to avoid extra forceRefresh in next cline request
                stopDevAssistService(devAssistStatusBar);
                await startDevAssistService(devAssistConfigStatus.current.authID, devAssistConfigStatus.current.localPort, devAssistStatusBar);
            } catch (error) {
                showStartDevAssistProblemNotification('afterManualRefresh', error as string, devAssistStatusBar)
            }
            // add line sepparator
            vsLogger.error('');
        }
    });

    // adding listener to forward ServerError from SutieCloudAuthProxy to vscode suitecloud output
    devAssistProxyService.on(PROXY_SERVICE_EVENTS.SERVER_ERROR, (emitParams: { authId: string, message: string }) => {
        // just forwarding info into suitecloud output for now
        vsLogger.error(translationService.getMessage(DEVASSIST_SERVICE.SERVER_ERROR.OUTPUT, emitParams.message));
        // add line sepparator
        vsLogger.error('');
    });
};

const startDevAssistService = async (devAssistAuthID: string, localPort: number, devAssistStatusBar: vscode.StatusBarItem) => {
    await devAssistProxyService.start(devAssistAuthID, localPort);

    setSuccessDevAssistStausBarMessage(devAssistStatusBar)
    const proxyUrl = getProxyUrl(localPort);
    vsNotificationService.showCommandInfo(translationService.getMessage(DEVASSIST_SERVICE.IS_RUNNING.NOTIFICATION, proxyUrl));
    vsLogger.info(translationService.getMessage(DEVASSIST_SERVICE.IS_RUNNING.OUTPUT, getProyUrlWithoutPath(localPort), devAssistAuthID, proxyUrl));
}

const PROXY_URL = DEVASSIST.PROXY_URL
const getProxyUrl = (port: number) => `${PROXY_URL.SCHEME}${PROXY_URL.LOCALHOST_IP}:${port}${PROXY_URL.PATH}`;
const getProyUrlWithoutPath = (port: number) => `${PROXY_URL.SCHEME}${PROXY_URL.LOCALHOST_IP}:${port}`;

const stopDevAssistService = (devAssistStatusBar: vscode.StatusBarItem) => {
    devAssistProxyService?.stop();

    setErrorDevAssistStausBarMessage(devAssistStatusBar);
    // only notify that devassist service has been disabled in the transition from enabled to disabled
    if (!devAssistConfigStatus.current.proxyEnabled && devAssistConfigStatus.previous.proxyEnabled) {
        vsLogger.info(translationService.getMessage(DEVASSIST_SERVICE.IS_DISABLED.NOTIFICATION))
        vsNotificationService.showCommandInfo(translationService.getMessage(DEVASSIST_SERVICE.IS_DISABLED.OUTPUT));
        // add extra line to differenciate logs
        vsLogger.info('');
    }
}

const showDevAssistStartUpNotification = () => {
    const infoMessage: string = translationService.getMessage(DEVASSIST_SERVICE.STARTUP.MESSAGE);
    const buttonsAndActions: { buttonMessage: string, buttonAction: () => void }[] = [
        {
            buttonMessage: translationService.getMessage(DEVASSIST_SERVICE.STARTUP.BUTTON.OPEN_SETTINGS),
            buttonAction: openDevAssistSettings
        },
        {
            buttonMessage: translationService.getMessage(DEVASSIST_SERVICE.STARTUP.BUTTON.DONT_SHOW_AGAIN),
            buttonAction: () => {
                const devAssistConfigSection = vscode.workspace.getConfiguration(DEVASSIST.CONFIG_KEYS.devAssistSection);
                devAssistConfigSection.update(DEVASSIST.CONFIG_KEYS.startupNotificationDisabled, true);
            }
        }
    ];
    vsNotificationService.showCommandInfoWithSpecificButtonsAndActions(infoMessage, buttonsAndActions);
}

const showStartDevAssistProblemNotification = (errorStage: string, error: string, devAssistStatusBar: vscode.StatusBarItem) => {
    // console.log(`There was a problem when starting DevAssist service. (${errorStage})\n${error}`)
    setErrorDevAssistStausBarMessage(devAssistStatusBar)
    vsLogger.error(translationService.getMessage(DEVASSIST_SERVICE.IS_STOPPED.OUTPUT, error));
    const errorMessage = translationService.getMessage(DEVASSIST_SERVICE.IS_STOPPED.NOTIFICATION);
    const buttonsAndActions: { buttonMessage: string, buttonAction: () => void }[] = [
        {
            buttonMessage: translationService.getMessage(DEVASSIST_SERVICE.IS_STOPPED.NOTIFICATION_BUTTON),
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

const updateDevAssistConfigStatus = (): void => {
    const currentConfig: devAssistConfig = getDevAssistCurrentSettings();
    const previousConfig: devAssistConfig = devAssistConfigStatus.current;

    // update saved status
    devAssistConfigStatus.current = currentConfig;
    devAssistConfigStatus.previous = previousConfig;
}

const getDevAssistCurrentSettings = (): devAssistConfig => {
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
        return false
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
    devAssistStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground')
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
