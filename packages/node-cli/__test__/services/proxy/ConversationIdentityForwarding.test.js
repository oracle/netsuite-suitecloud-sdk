/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const http = require('node:http');
const https = require('node:https');
const { once } = require('node:events');
const { SuiteCloudAuthProxyService, EVENTS } = require('../../../src/services/SuiteCloudAuthProxyService');

jest.mock('../../../src/utils/AuthenticationUtils', () => ({
	getAuthCredentialsById: async () => ({ hostName: '127.0.0.1', accessToken: 'initial-test-token' }),
	checkIfReauthorizationIsNeeded: async () => ({ isSuccess: () => true, data: {} }),
	forceRefreshAuthorization: async () => ({ isSuccess: () => true, data: { accessToken: 'refreshed-test-token' } }),
}));

const prefix = '/api/internal/devassist';
const threadId = '018f86ba-7f8c-7000-8000-111111111111';
const otherId = '018f86ba-7f8c-7000-8000-222222222222';
const optIn = { 'x-netsuite-conversation-bridge': 'codex-v1' };
const identity = { ...optIn, 'thread-id': threadId };
const payload = '{ "tools": [{ "parameters": { "minimum": 9007199254740993 }}] }';
let proxy, upstream, forwarded;

beforeEach(async () => {
	forwarded = [];
	upstream = http.createServer((request, response) => {
		const chunks = [];
		request.on('data', chunk => chunks.push(chunk));
		request.on('end', () => {
			forwarded.push({ headers: request.headers, body: Buffer.concat(chunks).toString('utf8') });
			const retry = request.url.includes('?retry') && request.headers.authorization === 'Bearer initial-test-token';
			response.writeHead(retry ? 401 : 200, { 'content-type': 'text/event-stream' });
			response.end(retry ? '' : 'data: done\n\n');
		});
	});
	upstream.listen(0, '127.0.0.1');
	await once(upstream, 'listening');
	jest.spyOn(https, 'request').mockImplementation((options, callback) =>
		http.request({ ...options, agent: false, port: upstream.address().port }, callback));
	proxy = new SuiteCloudAuthProxyService('/unused', {}, prefix, 'local-test-key');
	const ready = once(proxy, EVENTS.SERVER_INFO.LISTENING);
	await proxy.start('local-test', '0');
	await ready;
});

afterEach(async () => {
	await proxy.stop();
	upstream.closeAllConnections();
	await new Promise(resolve => upstream.close(resolve));
	jest.restoreAllMocks();
});

async function send(path, headers, body = payload) {
	const response = await fetch(`http://127.0.0.1:${proxy._localProxy.address().port}${prefix}${path}`, {
		method: 'POST',
		headers: { authorization: 'Bearer local-test-key', ...headers },
		body,
	});
	return { status: response.status, body: await response.text() };
}

test.each(['/v1/responses', '/responses', '/v1/responses/compact', '/v1/messages?beta=true', '/chat/completions'])('maps an opted-in thread ID and leaves the body intact at %s', async path => {
	expect(await send(path, identity)).toEqual({ status: 200, body: 'data: done\n\n' });
	expect(forwarded).toHaveLength(1);
	expect(forwarded[0].headers['x-netsuite-memoryid']).toBe(threadId);
	expect(forwarded[0].headers['x-netsuite-conversation-bridge']).toBeUndefined();
	expect(forwarded[0].body).toBe(payload);
});

test.each([
	[optIn, 'thread_id_required'],
	[{ ...optIn, 'thread-id': 'invalid' }, 'invalid_thread_id'],
	[{ ...optIn, 'thread-id': [threadId, threadId] }, 'invalid_thread_id'],
	[{ ...identity, 'x-netsuite-memoryid': otherId }, 'conflicting_identity'],
])('returns 400 before forwarding invalid opted-in identity (%j)', async (headers, code) => {
	const result = await send('/v1/responses', headers);
	expect(result.status).toBe(400);
	expect(JSON.parse(result.body)).toEqual({ error: code });
	expect(forwarded).toHaveLength(0);
});

test('forwards direct and auxiliary requests without interpreting thread identity', async () => {
	await send('/v1/responses', { 'thread-id': otherId, 'x-netsuite-memoryid': threadId });
	await send('/v1/analytics/codex/turn-costs', optIn);
	expect(forwarded.map(request => request.headers['x-netsuite-memoryid'])).toEqual([threadId, undefined]);
	expect(forwarded.map(request => request.body)).toEqual([payload, payload]);
});

test('replays the mapped ID and unchanged bytes on authentication retry', async () => {
	expect((await send('/v1/responses?retry', { ...identity, 'x-netsuite-memoryid': threadId })).status).toBe(200);
	expect(forwarded.map(request => request.headers.authorization)).toEqual(['Bearer initial-test-token', 'Bearer refreshed-test-token']);
	expect(forwarded.map(request => request.headers['x-netsuite-memoryid'])).toEqual([threadId, threadId]);
	expect(forwarded.map(request => request.body)).toEqual([payload, payload]);
});

test('keeps the Cline marker bridge working on Chat Completions', async () => {
	const messages = [
		{ role: 'system', content: '<netsuite-conversation-id>synthetic-cline-task</netsuite-conversation-id>' },
		{ role: 'user', content: 'Synthetic prompt' },
	];
	const result = await send('/chat/completions', { 'x-netsuite-conversation-bridge': 'cline-v1' }, JSON.stringify({ messages }));
	const [request] = forwarded;
	expect(result.status).toBe(200);
	expect(request.headers['x-netsuite-memoryid']).toBe('734dc44e-ce9e-5cb1-85e4-88f3e1e386d6');
	expect(request.headers['x-netsuite-conversation-bridge']).toBeUndefined();
	expect(JSON.parse(request.body)).toEqual({ messages: [messages[1]] });
});

test('keeps Cline opt-in scoped to the original Chat Completions endpoint', async () => {
	expect((await send('/v1/responses', { 'x-netsuite-conversation-bridge': 'cline-v1' })).status).toBe(200);
	expect(forwarded[0].headers['x-netsuite-memoryid']).toBeUndefined();
	expect(forwarded[0].body).toBe(payload);
});
