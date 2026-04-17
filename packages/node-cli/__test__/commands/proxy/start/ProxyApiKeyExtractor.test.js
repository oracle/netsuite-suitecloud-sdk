'use strict';

const ProxyApiKeyExtractor = require('../../../../src/commands/proxy/start/ProxyApiKeyExtractor');

describe('ProxyApiKeyExtractor', () => {
	it('should throw actionable message when payload is empty string', () => {
		expect(() => ProxyApiKeyExtractor.extractApiKey('')).toThrow(
			'No client API key was found. Run "suitecloud proxy:generatekey" and try again.'
		);
	});

	it('should throw actionable message when payload is null', () => {
		expect(() => ProxyApiKeyExtractor.extractApiKey(null)).toThrow(
			'No client API key was found. Run "suitecloud proxy:generatekey" and try again.'
		);
	});

	it('should throw invalid payload message when payload is non-empty invalid JSON', () => {
		expect(() => ProxyApiKeyExtractor.extractApiKey('not-json')).toThrow(
			'Could not parse proxy key payload from SDK output.'
		);
	});

	it('should extract api key when payload has expected structure', () => {
		const payload = JSON.stringify({
			PROXY_KEY: {
				apiKey: 'my-api-key',
			},
		});

		expect(ProxyApiKeyExtractor.extractApiKey(payload)).toEqual({
			apiKey: 'my-api-key',
		});
	});
});
