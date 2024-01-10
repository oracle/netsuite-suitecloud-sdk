/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const http = require('http');
const { URL } = require('url');
const tls = require('tls');
const net = require('net');
const { PROTOCOL, EVENT, METHOD } = require('./HttpConstants');

class ProxyAgent {
	constructor(proxyString, agentOptions) {
		this.proxyString = proxyString;
		this.agentOptions = agentOptions;
		this.initProxyURL();
	}

	initProxyURL() {
		try {
			const proxy = new URL(this.proxyString);
			proxy.host = proxy.hostname || proxy.host;
			proxy.port = +proxy.port || (proxy.protocol.toLowerCase() === PROTOCOL.HTTPS ? 443 : 80);
			this.proxyURL = proxy;
		} catch (err) {
			throw new ProxyAgentError(`${err.input} ${ERROR_MESSAGES.BAD_PROXY}`);
		}
	}

	addRequest(req, options) {
		req.shouldKeepAlive = false;

		this.createConnection(options)
			.then((socket) => {
				req.onSocket(socket);
			})
			.catch((err) => {
				req.emit(EVENT.ERROR, err);
			});
	}

	createConnection(options) {
		return new Promise((resolve, reject) => {
			const useSSL = options.protocol ? options.protocol.toLowerCase() === PROTOCOL.HTTPS : false;
			if (useSSL && this.agentOptions.tunnel === true) {
				if (options.port === 80) options.port = 443;
				// CONNECT Method
				const req = http.request({
					host: this.proxyURL.hostname,
					port: this.proxyURL.port,
					auth: this.proxyURL.auth,
					method: METHOD.CONNECT,
					path: (options.hostname || options.host) + ':' + options.port,
					headers: {
						host: options.host,
					},
					timeout: this.agentOptions.timeout,
				});

				req.once(EVENT.CONNECT, (res, socket, head) => {
					const tunnel = tls.connect({
						socket: socket,
						host: options.hostname || options.host,
						port: +options.port,
						servername: options.servername || options.host,
					});
					resolve(tunnel);
				});

				req.once(EVENT.TIMEOUT, () => {
					req.destroy();
					reject(new ProxyAgentError(ERROR_MESSAGES.CONNECT_TIMEOUT));
				});

				req.once(EVENT.ERROR, (err) => {
					reject(err);
				});

				req.once(EVENT.CLOSE, () => {
					reject(new ProxyAgentError(ERROR_MESSAGES.SERVER_CLOSE_EVENT));
				});

				req.end();
			} else {
				const socket = net.connect({
					host: this.proxyURL.host,
					port: this.proxyURL.port === '' ? 80 : +this.proxyURL.port,
					auth: this.proxyURL.auth,
				});
				resolve(socket);
			}
		});
	}
}

class ProxyAgentError extends Error {
	constructor(message) {
		super(message);
		this.name = 'ProxyAgentError';
	}
}

const ERROR_MESSAGES = {
	CONNECT_TIMEOUT: 'CONNECT request timeout.',
	SERVER_CLOSE_EVENT: 'Tunnel failed. Socket closed prematurely.',
	BAD_PROXY: 'is not a valid value for proxy.'
}

module.exports = ProxyAgent;
