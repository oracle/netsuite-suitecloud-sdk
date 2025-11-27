import { EventEmitter } from 'node:stream';

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
}
export interface ExecutionEnvironmentContextConstructor {
	new(params?: { platform?: string, platformVersion?: string }): ExecutionEnvironmentContextInstance;
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
