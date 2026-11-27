
import * as childProcess from 'child_process';
import { ApplicationConstants } from '../../util/ExtensionUtil';

const clientPlatformVersionOption = `${ApplicationConstants.SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION}=${process.versions.node}`;
const vmOptions: string[] = [...ApplicationConstants.SDK_INTEGRATION_MODE_JVM_OPTIONS, clientPlatformVersionOption];

export function validateSdk(sdkPath: string): Promise<boolean> {
    return new Promise(resolve => {
        const sdkProcess = childProcess.spawn('java', [...vmOptions, '-jar', sdkPath], { shell: false });
        // Drain both streams. JVM warnings on stderr do not make a successful launch invalid.
        sdkProcess.stdout.resume();
        sdkProcess.stderr.resume();
        sdkProcess.once('error', () => resolve(false));
        sdkProcess.once('close', code => resolve(code === 0));
    });
}
