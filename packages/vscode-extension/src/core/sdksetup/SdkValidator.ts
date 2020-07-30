
import { spawn } from 'child_process';

import { SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION, SDK_INTEGRATION_MODE_JVM_OPTION } from '@oracle/suitecloud-cli/dist/ApplicationConstants';

const clientPlatformVersionOption = `${SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION}=${process.versions.node}`;
const vmOptions = `${SDK_INTEGRATION_MODE_JVM_OPTION} ${clientPlatformVersionOption}`;

export function validateSdk(sdkPath: string) {

    const jvmCommand = `java -jar ${vmOptions} "${sdkPath}"`;
    let isValid = true;
    const childProcess = spawn(jvmCommand, [], { shell: true });

    return new Promise((resolve, reject) => {
        childProcess.stderr.on('data', data => {
            isValid = false;
        });

        childProcess.on('close', code => {
            if (code === 0 && isValid) {
                return resolve(true);
            }
            else {
                return resolve(false);
            }
        });
    })
}