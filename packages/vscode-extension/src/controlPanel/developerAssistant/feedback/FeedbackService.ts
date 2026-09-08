/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { DEVELOPER_ASSISTANT } from '../../../ApplicationConstants';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../Strings';
import { DeveloperAssistantFeedback } from './Types';

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
	payload: DeveloperAssistantFeedback;
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
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.feedbackRequired);
		}
		if (feedback.length > FEEDBACK_MAX_LENGTH) {
			throw new Error(
				SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.feedbackMaxLength(FEEDBACK_MAX_LENGTH)
			);
		}
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.feedbackInvalidRating);
		}
		if (topics.length === 0) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.feedbackTopicRequired);
		}
		if (topics.some((topic) => !FEEDBACK_ALLOWED_TOPICS.has(topic))) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.feedbackInvalidTopic);
		}
		if (!input.apiKey.trim()) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.missingApiKey);
		}

		const feedbackUrl =
			`${DEVELOPER_ASSISTANT.PROXY_URL.SCHEME}${DEVELOPER_ASSISTANT.PROXY_URL.LOCALHOST_IP}:${input.port}` +
			DEVELOPER_ASSISTANT.PROXY_URL.FEEDBACK_PATH;
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
				throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.feedbackTimeout);
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
					? SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.feedbackSubmitFailedWithBody(
						response.status,
						normalizedBody
					)
					: SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.feedbackSubmitFailed(
						response.status,
						response.statusText
					)
			);
		}
	}
}
