/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { DEVASSIST } from '../../../ApplicationConstants';
import { SuiteCloudPanelSubmitFeedbackPayload } from '../../../controlPanel/devAssist/Messages';

const FEEDBACK_MAX_LENGTH = 1000;
const FEEDBACK_REQUEST_TIMEOUT_MS = 10000;
const FEEDBACK_ERROR_BODY_MAX_LENGTH = 2000;
const FEEDBACK_ALLOWED_TOPICS = new Set([
	'CodeExplanation',
	'SDFObjectGeneration',
	'SuiteScriptCodeGeneration',
	'UnitTesting',
	'Other',
]);

export type SubmitFeedbackInput = {
	payload: SuiteCloudPanelSubmitFeedbackPayload;
	apiKey: string;
	port: number;
};

export default class FeedbackService {
	private readonly _fetch: typeof fetch;

	constructor(fetchImplementation: typeof fetch = fetch) {
		this._fetch = fetchImplementation;
	}

	async submit(input: SubmitFeedbackInput): Promise<void> {
		const feedback =
			typeof input.payload.feedback === 'string' ? input.payload.feedback.trim() : '';
		const topics = Array.isArray(input.payload.topics)
			? input.payload.topics.filter((item) => typeof item === 'string')
			: [];
		const rating =
			typeof input.payload.rating === 'number' ? input.payload.rating : Number.NaN;

		if (!feedback) {
			throw new Error('Feedback text is required.');
		}
		if (feedback.length > FEEDBACK_MAX_LENGTH) {
			throw new Error(`Feedback text must be ${FEEDBACK_MAX_LENGTH} characters or less.`);
		}
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			throw new Error('Rating must be an integer between 1 and 5.');
		}
		if (topics.length === 0) {
			throw new Error('Select at least one feedback topic.');
		}
		if (topics.some((topic) => !FEEDBACK_ALLOWED_TOPICS.has(topic))) {
			throw new Error('One or more feedback topics are invalid.');
		}
		if (!input.apiKey.trim()) {
			throw new Error('No API key is available. Generate or rotate API key first.');
		}

		const feedbackUrl =
			`${DEVASSIST.PROXY_URL.SCHEME}${DEVASSIST.PROXY_URL.LOCALHOST_IP}:${input.port}` +
			DEVASSIST.PROXY_URL.FEEDBACK_PATH;
		const abortController = new AbortController();
		const timeout = setTimeout(() => abortController.abort(), FEEDBACK_REQUEST_TIMEOUT_MS);
		let response: Response;
		try {
			response = await this._fetch(feedbackUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					authorization: `Bearer ${input.apiKey}`,
				},
				body: JSON.stringify({ feedback, topics, rating }),
				signal: abortController.signal,
			});
		} catch (error) {
			if (abortController.signal.aborted) {
				throw new Error('Feedback submit timed out. Verify the proxy is running and retry.');
			}
			throw error;
		} finally {
			clearTimeout(timeout);
		}

		if (!response.ok) {
			const responseBody = await response.text();
			const normalizedBody = responseBody.trim().slice(0, FEEDBACK_ERROR_BODY_MAX_LENGTH);
			throw new Error(
				normalizedBody
					? `Feedback submit failed (${response.status}): ${normalizedBody}`
					: `Feedback submit failed (${response.status} ${response.statusText})`
			);
		}
	}
}
