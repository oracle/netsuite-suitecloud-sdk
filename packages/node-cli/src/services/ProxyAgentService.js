/*
 ** Copyright (c) 2022 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const https = require('node:https');
const net = require('node:net');
const tls = require('node:tls');
const UriUtils = require('../utils/UriUtils');
const NodeTranslationService = require('./NodeTranslationService');
const {
	PROXY_AGENT_SERVICE,
} = require('./TranslationKeys');

const CONNECT_RESPONSE_HEADER_DELIMITER = '\r\n\r\n';
const DEFAULT_PROXY_PORTS = {
	http: 80,
	https: 443,
};
const DEFAULT_TARGET_PORT = 443;
const CONNECT_HANDSHAKE_TIMEOUT = 15000;
const MAX_CONNECT_RESPONSE_HEADER_SIZE = 16 * 1024;

class ProxyAgentService {
	static getProxyAgent(targetHost) {
		const configuredProxyValue = UriUtils.getSuiteCloudProxyValueFromEnvVariables();

		if (!configuredProxyValue || UriUtils.shouldBypassProxy(targetHost)) {
			return undefined;
		}
		let proxyURL;
		try {
			proxyURL = new URL(configuredProxyValue);
		} catch (error) {
			throw NodeTranslationService.getMessage(PROXY_AGENT_SERVICE.INVALID_SUITECLOUD_PROXY_URL, configuredProxyValue);
		}

		return new HttpsProxyTunnelAgent({
			keepAlive: true,
			keepAliveMsecs: 1000,
			maxSockets: 256,
			maxFreeSockets: 256,
			scheduling: 'lifo',
			proxy: {
				host: proxyURL.hostname,
				port: ProxyAgentService._getProxyPort(proxyURL),
				auth: proxyURL.username ? `${decodeURIComponent(proxyURL.username)}:${decodeURIComponent(proxyURL.password)}` : undefined,
			},
		});
	}

	static _getProxyPort(proxyURL) {
		return Number(proxyURL.port || DEFAULT_PROXY_PORTS[proxyURL.protocol.replace(':', '')] || DEFAULT_PROXY_PORTS.http);
	}
}

class HttpsProxyTunnelAgent extends https.Agent {
	constructor({ proxy, ...agentOptions }) {
		super(agentOptions);
		this.proxy = proxy;
	}

	createConnection(options, callback) {
		const socket = net.connect({
			host: this.proxy.host,
			port: this.proxy.port,
		});

		const cleanup = () => {
			socket.off('error', onError);
			socket.off('connect', onConnect);
			socket.off('timeout', onTimeout);
			socket.setTimeout(0);
		};

		const onError = (error) => {
			cleanup();
			socket.destroy();
			callback(error);
		};

		const onTimeout = () => {
			onError(new Error('Proxy CONNECT request timed out.'));
		};

		const onConnect = () => {
			const connectRequest = this._buildConnectRequest(options);
			socket.write(connectRequest);
			this._waitForConnectResponse(socket, options, callback, onError, cleanup);
		};

		socket.setTimeout(CONNECT_HANDSHAKE_TIMEOUT);
		socket.once('error', onError);
		socket.once('timeout', onTimeout);
		socket.once('connect', onConnect);
	}

	_buildConnectRequest(options) {
		const targetHost = options.host || options.hostname;
		const targetPort = options.port || DEFAULT_TARGET_PORT;
		const headers = [
			`CONNECT ${targetHost}:${targetPort} HTTP/1.1`,
			`Host: ${targetHost}:${targetPort}`,
			'Connection: keep-alive',
		];

		if (this.proxy.auth) {
			const credentials = Buffer.from(this.proxy.auth).toString('base64');
			headers.push(`Proxy-Authorization: Basic ${credentials}`);
		}

		return `${headers.join('\r\n')}\r\n\r\n`;
	}

	_waitForConnectResponse(socket, options, callback, onError, cleanup) {
		let responseBuffer = Buffer.alloc(0);

		const handleProxyResponse = (chunk) => {
			responseBuffer = Buffer.concat([responseBuffer, chunk]);

			if (responseBuffer.length > MAX_CONNECT_RESPONSE_HEADER_SIZE) {
				socket.off('data', handleProxyResponse);
				onError(new Error('Proxy CONNECT response headers exceeded the maximum allowed size.'));
				return;
			}

			const headerEndIndex = responseBuffer.indexOf(CONNECT_RESPONSE_HEADER_DELIMITER);

			if (headerEndIndex === -1) {
				return;
			}

			socket.off('data', handleProxyResponse);
			cleanup();

			const responseHeader = responseBuffer.subarray(0, headerEndIndex).toString('utf8');
			const statusLine = responseHeader.split('\r\n')[0] || '';
			if (this._parseStatusCode(statusLine) !== 200) {
				socket.destroy();
				callback(new Error(`Proxy CONNECT request failed: ${statusLine}`));
				return;
			}

			const remainingData = responseBuffer.subarray(headerEndIndex + CONNECT_RESPONSE_HEADER_DELIMITER.length);
			const tlsSocket = tls.connect({
				...options,
				socket,
				servername: options.servername || options.host || options.hostname,
			});

			tlsSocket.once('error', callback);
			tlsSocket.once('secureConnect', () => {
				tlsSocket.removeListener('error', callback);
				if (remainingData.length) {
					tlsSocket.unshift(remainingData);
				}
				callback(null, tlsSocket);
			});
		};

		socket.on('data', handleProxyResponse);
	}

	_parseStatusCode(statusLine) {
		const statusCodeMatch = statusLine.match(/^HTTP\/\d(?:\.\d)?\s+(\d{3})\b/);
		return statusCodeMatch ? Number(statusCodeMatch[1]) : undefined;
	}
}

module.exports = ProxyAgentService;