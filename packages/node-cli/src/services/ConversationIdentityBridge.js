/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { createHash } = require('node:crypto');

// Fixed adapter namespace. This identifies the Cline lifecycle-token contract, not prompt contents.
const CLINE_BRIDGE_NAMESPACE = '47e5a790-8d73-4d3e-b671-0f3c5062e39a';
const BRIDGE_HEADER = 'x-netsuite-conversation-bridge';
const MEMORY_HEADER = 'x-netsuite-memoryid';
const CHAT_COMPLETIONS_PATH = '/api/internal/devassist/chat/completions';
const CLAUDE_MESSAGES_PATH = '/api/internal/devassist/v1/messages';
const INFERENCE_PATH = /^\/api\/internal\/devassist\/(?:v1\/)?(?:chat\/completions|responses(?:\/compact)?|messages)$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{1,128}$/;
const MARKER = /^<netsuite-conversation-id>([A-Za-z0-9_-]{1,128})<\/netsuite-conversation-id>(?:\r?\n|$)/gm;

class IdentityError extends Error {
	constructor(code) { super(code); this.code = code; this.status = 400; }
}

function conversationUuid(nativeId) {
	if (typeof nativeId !== 'string' || !TOKEN.test(nativeId)) throw new IdentityError('invalid_bridge_token');
	const namespace = Buffer.from(CLINE_BRIDGE_NAMESPACE.replaceAll('-', ''), 'hex');
	const bytes = createHash('sha1').update(namespace).update(nativeId, 'utf8').digest().subarray(0, 16);
	bytes[6] = (bytes[6] & 0x0f) | 0x50;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;
	const hex = bytes.toString('hex');
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function extractClineIdentity(body, headers) {
	if (Object.entries(headers).some(([name, value]) => name.toLowerCase() === 'content-encoding' && value !== undefined)) throw new IdentityError('encoded_body_not_supported_by_bridge');
	let request;
	try { request = JSON.parse(body.toString('utf8')); } catch { throw new IdentityError('invalid_json_body'); }
	if (!request || typeof request !== 'object' || !Array.isArray(request.messages)) throw new IdentityError('invalid_messages');
	const nativeIds = [];
	function strip(text) {
		const cleaned = text.replace(MARKER, (_, nativeId) => { nativeIds.push(nativeId); return ''; });
		if (cleaned.includes('<netsuite-conversation-id') || cleaned.includes('</netsuite-conversation-id')) throw new IdentityError('malformed_system_marker');
		return cleaned;
	}
	const messages = request.messages.flatMap(message => {
		if (!message || typeof message !== 'object' || message.role !== 'system') return [message];
		if (typeof message.content === 'string') {
			const cleaned = strip(message.content);
			if (cleaned === message.content) return [message];
			return cleaned.length ? [{ ...message, content: cleaned }] : [];
		}
		if (Array.isArray(message.content)) {
			let changed = false;
			const parts = message.content.flatMap(part => {
				if (!part || typeof part !== 'object' || part.type !== 'text' || typeof part.text !== 'string') return [part];
				const cleaned = strip(part.text);
				if (cleaned === part.text) return [part];
				changed = true;
				return cleaned.length ? [{ ...part, text: cleaned }] : [];
			});
			return changed ? (parts.length ? [{ ...message, content: parts }] : []) : [message];
		}
		return [message];
	});
	if (nativeIds.length > 1) throw new IdentityError('multiple_system_markers');
	if (nativeIds.length === 0) throw new IdentityError('bridge_marker_required');
	return { conversationId: conversationUuid(nativeIds[0]), body: Buffer.from(JSON.stringify({ ...request, messages })) };
}

function singleHeader(headers, expectedName, duplicateCode) {
	const values = Object.entries(headers)
		.filter(([name, value]) => name.toLowerCase() === expectedName && value !== undefined);
	if (values.length > 1) throw new IdentityError(duplicateCode);
	return values[0]?.[1];
}

function bridgeConversation(body, { headers, method, path }) {
	const requestPath = path.split('?', 1)[0];
	if (method !== 'POST' || !INFERENCE_PATH.test(requestPath)) return { body, headers };
	const bridge = singleHeader(headers, BRIDGE_HEADER, 'multiple_bridge_headers');
	if (bridge === undefined
		|| (bridge === 'cline-v1' && requestPath !== CHAT_COMPLETIONS_PATH)
		|| (bridge === 'claude-v1' && requestPath !== CLAUDE_MESSAGES_PATH)) return { body, headers };

	const supplied = singleHeader(headers, MEMORY_HEADER, 'multiple_identity_headers');
	if (supplied !== undefined && (typeof supplied !== 'string' || !UUID.test(supplied))) throw new IdentityError('invalid_identity_header');

	let conversationId, outgoingBody = body;
	if (bridge === 'codex-v1') {
		const threadId = singleHeader(headers, 'thread-id', 'invalid_thread_id');
		if (threadId === undefined) throw new IdentityError('thread_id_required');
		if (typeof threadId !== 'string' || !UUID.test(threadId)) throw new IdentityError('invalid_thread_id');
		conversationId = threadId.toLowerCase();
	} else if (bridge === 'claude-v1') {
		const sessionId = singleHeader(headers, 'x-claude-code-session-id', 'invalid_claude_session_id');
		if (sessionId === undefined) throw new IdentityError('claude_session_id_required');
		if (typeof sessionId !== 'string' || !UUID.test(sessionId)) throw new IdentityError('invalid_claude_session_id');
		conversationId = sessionId.toLowerCase();
	} else if (bridge === 'cline-v1') {
		({ conversationId, body: outgoingBody } = extractClineIdentity(body, headers));
	} else {
		throw new IdentityError('unsupported_bridge_version');
	}
	if (supplied !== undefined && conversationId !== supplied.toLowerCase()) throw new IdentityError('conflicting_identity');

	const strippedHeaders = [BRIDGE_HEADER, MEMORY_HEADER];
	if (outgoingBody !== body) strippedHeaders.push('content-length', 'transfer-encoding');
	const outgoingHeaders = Object.fromEntries(Object.entries(headers)
		.filter(([name]) => !strippedHeaders.includes(name.toLowerCase())));
	outgoingHeaders[MEMORY_HEADER] = conversationId;
	if (outgoingBody !== body) outgoingHeaders['content-length'] = String(outgoingBody.byteLength);
	return { body: outgoingBody, headers: outgoingHeaders };
}

module.exports = { CHAT_COMPLETIONS_PATH, bridgeConversation };
