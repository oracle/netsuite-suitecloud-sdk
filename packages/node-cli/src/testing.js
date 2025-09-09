const DevAssistProxyService = require('./services/DevAssistProxyService');
const authId = 'antonioauth';

const sdkpath = 'C:\\Users\\Carol\\.suitecloud-sdk\\cli\\cli-2025.1.0-SNAPSHOT.jar';
const proxyService = new DevAssistProxyService(sdkpath);

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

proxyService.start('antonioauth', 8181).then(() =>
	console.log('service started')
).catch(err =>
	console.log('Service error' + err)
);
//proxyService.stop();
console.log('Ha regresado a la consola');
delay(5000).then(r => {
	console.log('After 5 seconds');
	proxyService.stop().then(r => {
		console.log('Proxy stopped');
	});
});
