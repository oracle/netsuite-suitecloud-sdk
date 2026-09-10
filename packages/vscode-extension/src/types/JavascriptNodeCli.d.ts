import { EventEmitter } from 'node:events';

// This file contains types for javascript @oracle/suitecloud-cli code
// Most of this types/interfaces will be used in ExtentionUtil.ts

export type SdkOperationResult<T> = {
	data: T;
	errorCode: undefined;
	errorMessages: string[];
	resultMessage?: string;
	status:'SUCCESS';
	isSuccess(): true;
} | {
	data: undefined;
	errorCode?: string;
	errorMessages: string[]
	resultMessage: undefined;
	status:'ERROR';
	isSuccess(): false;
}

export type RawSdkOperationResult<T> = {
	data: T;
	errorCode?: undefined;
	errorMessages: string[];
	resultMessage?: string;
	status: 'SUCCESS';
} | {
	data?: undefined;
	errorCode?: string;
	errorMessages: string[];
	resultMessage?: string;
	status: 'ERROR';
};

export interface ConsoleLoggerInstance {
	info(message: string): void;
	result(message: string): void;
	warning(message: string): void;
	error(message: string): void;
}
export interface ConsoleLoggerConstructor {
	new(): ConsoleLoggerInstance
}

export interface ExecutionEnvironmentContextInstance {
	getPlatform(): string;
	getPlatformVersion(): string;
	toUserAgentString(): string | undefined;
}
export interface ExecutionEnvironmentContextConstructor {
	new(params?: { platform?: string, platformVersion?: string }): ExecutionEnvironmentContextInstance;
}

export interface SdkArtifactVerificationProperties {
	getSdkSha256(): string;
	isCustomSdkMetadataUsed(): boolean;
}
export interface SdkArtifactVerifierInstance {
	verify(sdkPath: string, sdkProperties: SdkArtifactVerificationProperties): void;
}

export interface SuiteCloudAuthProxyServiceInstance extends EventEmitter {
	start(authId: string, localProxyPort: number): Promise<void>;
	stop(): Promise<void>;
	reloadAccessToken(): Promise<void>;
	updateApiKey(newApiKey?: string): void;
}
export interface SuiteCloudAuthProxyServiceConstructor {
	new(sdkPath: string, executionEnvironmentContext: ExecutionEnvironmentContextInstance, allowedPathPrefix?: string, apiKey?: string): SuiteCloudAuthProxyServiceInstance;
}

export type SuiteCloudAuthProxyEventPayload = {
	authId: string;
	message: string;
	requestUrl?: string;
};

export type SuiteCloudAuthProxyEvents = {
	PROXY_ERROR: {
		DEFAULT: string;
		MANUAL_AUTH_REFRESH_REQUIRED: string;
	};
	REQUEST_ERROR: {
		PATH_NOT_ALLOWED: string;
		UNAUTHORIZED: string;
	};
	SERVER_ERROR: {
		DEFAULT: string;
		ON_AUTH_REFRESH: string;
	};
	SERVER_INFO: {
		LISTENING: string;
		STOPPED: string;
		STOP_SKIPPED: string;
		ACCESS_TOKEN_RELOADED: string;
	};
};

export interface SdkExecutorInstance {}

export interface SdkExecutorConstructor {
	new(sdkPath: string, executionEnvironmentContext?: ExecutionEnvironmentContextInstance): SdkExecutorInstance;
}

export interface ClientAPIKeyObjectWrapperInstance {
	getDefaultKeyValue(): string;
}

export interface ClientAPIKeyObjectWrapperConstructor {
	new(jsonString: string): ClientAPIKeyObjectWrapperInstance;
}
