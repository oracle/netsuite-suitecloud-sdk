
import { spawn } from 'child_process';

const SDK_INTEGRATION_MODE_JVM_OPTION = '-DintegrationMode';
const SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION = '-DclientPlatformVersion';
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