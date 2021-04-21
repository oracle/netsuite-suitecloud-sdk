const http = require('http');
const { URL } = require('url');
const tls = require('tls');
const net = require('net');

class ProxyAgent{
	constructor(proxyString, options) {
		this.proxyString = proxyString;
		this.options = options;
		this.initProxyURL();
	}

	initProxyURL() {
		// throws error if proxyString is not correct
		const proxy = new URL(this.proxyString);

		proxy.host = proxy.hostname || proxy.host;
		proxy.port = +proxy.port || (proxy.protocol.toLowerCase() === 'https:' ? 443 : 80);
		this.proxyURL = proxy;
	}

	addRequest(req, options) {
		req.shouldKeepAlive = false;

		this.createConnection(options)
			.then((socket) => {
				req.onSocket(socket);
			})
			.catch((err) => {
				req.emit('error', err);
			});
	}

	createConnection(options) {
		console.log('HttpsProxyAgent.createConnection options parameter');
		console.log(options);
		return new Promise((resolve, reject) => {
			const ssl = options.protocol ? options.protocol.toLowerCase() === 'https:' : false;
			if (ssl && this.options.tunnel === true) {
				if (options.port === 80) options.port = 443;
				// CONNECT Method
				const req = http.request({
					host: this.proxyURL.hostname,
					port: this.proxyURL.port,
					auth: this.proxyURL.auth,
					method: 'CONNECT',
					path: (options.hostname || options.host) + ':' + options.port,
					headers: {
						host: options.host,
					},
					timeout: this.options.timeout,
				});

				req.once('connect', (res, socket, head) => {
					const tunnel = tls.connect({
						socket: socket,
						host: options.hostname || options.host,
						port: +options.port,
						servername: options.servername || options.host,
					});
					resolve(tunnel);
				});

				req.once('timeout', () => {
					req.destroy();
					reject(new Error('ProxyAgent CONNECT request timeout.'));
				});

				req.once('error', (err) => {
					console.log('Error in ProxyAgent COONECT')
					reject(err);
				});

				req.once('close', () => {
					reject(new Error('Tunnel failed. Socket closed prematurely'));
				});

				req.end();
			} else {
				const socket = net.connect({
					host: this.proxyURL.host,
					port: this.proxyURL.port === '' ? 80 : + this.proxyURL.port,
					auth: this.proxyURL.auth,
				});
				resolve(socket);
			}
		});
	}
}

module.exports = ProxyAgent;
