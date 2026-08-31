/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { parseStringPromise } from 'xml2js';

import {
	type CustomObjectInfo,
	type ImportObjectStatusItem,
	type ImportObjectsResult,
	type ObjectImportResultItem,
} from '../../api/object/ObjectCommand';
import { OBJECT } from '../../services/translation/TranslationKeys';
import { translationService } from '../../services/translation/TranslationService';

const CUSTOM_SEGMENT_TYPE = 'customsegment';
const CUSTOM_RECORD_TYPE = 'customrecordtype';
const CUSTOM_RECORD_PREFIX = 'customrecord';
const IDE_RESULT_KEY = 'result';
const UPDATE_OBJECT_TYPE_BY_ROOT_TAG: Readonly<Record<string, string>> = {
	pluginimplementation: 'plugintypeimpl',
	savedcsvimport: 'csvimport',
};

export function buildCustomObjectsXml(customObjects: CustomObjectInfo[]): string {
	const expandedObjects: CustomObjectInfo[] = [];
	for (const customObject of customObjects) {
		expandedObjects.push(customObject);
		if (customObject.type.toLowerCase() === CUSTOM_SEGMENT_TYPE) {
			expandedObjects.push({
				type: CUSTOM_RECORD_TYPE,
				scriptId: `${CUSTOM_RECORD_PREFIX}_${customObject.scriptId}`,
				appId: customObject.appId,
			});
		}
	}

	const xmlLines = ['<customObjects>'];
	for (const object of uniqueCustomObjects(expandedObjects)) {
		const attributes = [
			object.appId ? ` package="${escapeXmlAttribute(object.appId)}"` : '',
			` id="${escapeXmlAttribute(object.scriptId)}"`,
			` type="${escapeXmlAttribute(object.type)}"`,
		].join('');
		xmlLines.push(`  <customObject${attributes}/>`);
	}
	xmlLines.push('</customObjects>');
	return xmlLines.join('\n');
}

export function uniqueCustomObjects(customObjects: CustomObjectInfo[]): CustomObjectInfo[] {
	const seen = new Set<string>();
	return customObjects.filter((object) => {
		const key = `${object.type}:${object.scriptId}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

export async function parseCustomObjectListXml(xmlText: string): Promise<CustomObjectInfo[]> {
	const parsed = await parseStringPromise(xmlText, {
		explicitArray: false,
		trim: true,
		mergeAttrs: false,
	});

	return asArray(parsed?.customObjects?.customObject)
		.map((customObject): CustomObjectInfo | undefined => {
			const attrs = customObject?.$ ?? {};
			const type = stringOrUndefined(attrs.type);
			const scriptId = stringOrUndefined(attrs.id);
			if (!type || !scriptId) {
				return undefined;
			}
			return { type, scriptId, appId: stringOrUndefined(attrs.package) };
		})
		.filter((object): object is CustomObjectInfo => !!object)
		.sort(compareCustomObjects);
}

export async function parseImportObjectStatus(xmlText: string): Promise<ImportObjectStatusItem[]> {
	const parsed = await parseStringPromise(xmlText, { explicitArray: false, trim: true });
	const statusRoot = parsed?.Status ?? parsed?.status;
	return asArray(statusRoot?.customObject)
		.map((customObject): ImportObjectStatusItem => {
			const attrs = customObject?.$ ?? {};
			const result = customObject?.result;
			return {
				id: stringOrUndefined(attrs.id) ?? '',
				type: stringOrUndefined(attrs.type) ?? '',
				appId: stringOrUndefined(attrs.package),
				result: result ? {
					code: stringOrUndefined(result.code),
					message: stringOrUndefined(result.message),
				} : undefined,
			};
		})
		.filter((item) => !!item.id && !!item.type);
}

export function extractImportObjectsResult(statusItems: ImportObjectStatusItem[]): ImportObjectsResult {
	const result: ImportObjectsResult = { successfulImports: [], failedImports: [] };
	for (const statusItem of statusItems) {
		const objectImport: ObjectImportResultItem = {
			customObject: {
				id: statusItem.id,
				type: statusItem.type,
				appId: statusItem.appId,
				result: statusItem.result,
			},
			referencedFileImportResult: { successfulImports: [], failedImports: [] },
		};
		if (statusItem.result?.code === 'SUCCESS') {
			result.successfulImports.push(objectImport);
		} else if (statusItem.result?.code === 'FAILED') {
			result.failedImports.push(objectImport);
		}
	}
	return result;
}

export function extractScriptFileReferences(xmlText: string): string[] {
	const references = Array.from(xmlText.matchAll(/<scriptfile>\s*\[([^\]]+)]\s*<\/scriptfile>/gi))
		.map((match) => match[1].trim())
		.filter(Boolean);
	return references.filter((reference, index, array) => array.indexOf(reference) === index);
}

export function extractRootTagName(xmlText: string): string {
	let normalizedXml = xmlText.trim();
	while (normalizedXml.startsWith('<?') || normalizedXml.startsWith('<!--')) {
		const closingToken = normalizedXml.startsWith('<!--') ? '-->' : '?>';
		const closingIndex = normalizedXml.indexOf(closingToken);
		if (closingIndex === -1) {
			throw new Error(translationService.getMessage(OBJECT.ERROR.ROOT_TAG_PARSE_FAILED));
		}
		normalizedXml = normalizedXml.slice(closingIndex + closingToken.length).trimStart();
	}
	const tagMatch = normalizedXml.match(/^<([a-zA-Z0-9_:-]+)/);
	if (!tagMatch) {
		throw new Error(translationService.getMessage(OBJECT.ERROR.ROOT_TAG_PARSE_FAILED));
	}
	return tagMatch[1];
}

export function extractObjectTypeForUpdate(xmlText: string, scriptId: string): string {
	const rootTag = extractRootTagName(xmlText).toLowerCase();
	const unqualifiedScriptId = scriptId.slice(scriptId.lastIndexOf('.') + 1);
	if (unqualifiedScriptId.startsWith(CUSTOM_RECORD_PREFIX)) {
		return CUSTOM_RECORD_TYPE;
	}
	return UPDATE_OBJECT_TYPE_BY_ROOT_TAG[rootTag] ?? rootTag;
}

export async function parseIdePayload(xmlText: string): Promise<{ resultText?: string; errorMessage?: string }> {
	try {
		const parsed = await parseStringPromise(xmlText, { explicitArray: false, trim: true });
		const ideNode = parsed?.ide ?? parsed;
		const errorMessage = extractIdeErrorMessage(ideNode);
		return errorMessage ? { errorMessage } : { resultText: extractIdeResultText(ideNode) };
	} catch {
		return {};
	}
}

function escapeXmlAttribute(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function compareCustomObjects(left: CustomObjectInfo, right: CustomObjectInfo): number {
	return left.type.localeCompare(right.type) || left.scriptId.localeCompare(right.scriptId);
}

function extractIdeErrorMessage(ideNode: unknown): string | undefined {
	if (!isObject(ideNode)) {
		return undefined;
	}
	const directError = stringOrUndefined(ideNode.error);
	if (directError?.trim()) {
		return directError;
	}
	if (isObject(ideNode.error)) {
		const message = stringOrUndefined(ideNode.error.message) ?? stringOrUndefined(ideNode.error.detail);
		return message?.trim() ? message : undefined;
	}
	return undefined;
}

function extractIdeResultText(ideNode: unknown): string | undefined {
	if (!isObject(ideNode)) {
		return undefined;
	}
	const resultNode = ideNode.result;
	if (typeof resultNode === 'string') {
		return resultNode;
	}
	if (!isObject(resultNode)) {
		return undefined;
	}
	const nestedResultNode = resultNode[IDE_RESULT_KEY];
	if (typeof nestedResultNode === 'string') {
		return nestedResultNode;
	}
	if (isObject(nestedResultNode)) {
		return stringOrUndefined(nestedResultNode._);
	}

	for (const mapEntryNode of asArray(resultNode.entry)) {
		if (!isObject(mapEntryNode)) {
			continue;
		}
		const values = asArray(mapEntryNode.string).map((value) =>
			typeof value === 'string' ? value : isObject(value) ? stringOrUndefined(value._) : undefined
		);
		if (values.length >= 2 && values[0] === IDE_RESULT_KEY && values[1]) {
			return values[1];
		}
	}
	return undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function stringOrUndefined(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined;
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
	if (Array.isArray(value)) {
		return value;
	}
	return value === undefined || value === null ? [] : [value];
}
