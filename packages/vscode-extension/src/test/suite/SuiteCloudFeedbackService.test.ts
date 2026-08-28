/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import SuiteCloudFeedbackService from '../../panel/SuiteCloudFeedbackService';

suite('SuiteCloud Feedback Service', () => {
	test('preserves the existing feedback server contract', async () => {
		let requestedUrl = '';
		let requestedInit: RequestInit | undefined;
		const fetchStub: typeof fetch = async (input, init) => {
			requestedUrl = String(input);
			requestedInit = init;
			return new Response(undefined, { status: 204 });
		};
		const service = new SuiteCloudFeedbackService(fetchStub);

		await service.submit({
			apiKey: 'feedback-api-key',
			port: 8283,
			payload: {
				feedback: 'Helpful response',
				topics: ['CodeExplanation'],
				rating: 5,
			},
		});

		assert.strictEqual(
			requestedUrl,
			'http://127.0.0.1:8283/api/internal/devassist/feedback'
		);
		assert.strictEqual(requestedInit?.method, 'POST');
		assert.deepStrictEqual(requestedInit?.headers, {
			'Content-Type': 'application/json',
			authorization: 'Bearer feedback-api-key',
		});
		assert.deepStrictEqual(JSON.parse(String(requestedInit?.body)), {
			feedback: 'Helpful response',
			topics: ['CodeExplanation'],
			rating: 5,
		});
	});

	test('validates feedback before making a request', async () => {
		let requestCount = 0;
		const fetchStub: typeof fetch = async () => {
			requestCount += 1;
			return new Response(undefined, { status: 204 });
		};
		const service = new SuiteCloudFeedbackService(fetchStub);

		await assert.rejects(
			service.submit({
				apiKey: 'feedback-api-key',
				port: 8283,
				payload: {
					feedback: '',
					topics: ['CodeExplanation'],
					rating: 5,
				},
			}),
			/Feedback text is required/
		);
		assert.strictEqual(requestCount, 0);
	});
});
