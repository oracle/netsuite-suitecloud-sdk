/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { SchemaNode, SchemaRepository } from './SchemaRepository';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));

function matchesCondition(condition: any, value: { [key: string]: JsonValue }): boolean {
	if (typeof condition === 'boolean') { return condition; }
	if (Object.keys(condition).some(key => !['properties', 'required'].includes(key))) {
		throw new Error('Template conditions support required fields and property const/enum checks.');
	}
	if ((condition.required ?? []).some((key: string) => !Object.prototype.hasOwnProperty.call(value, key))) { return false; }
	return Object.entries(condition.properties ?? {}).every(([key, rule]: [string, any]) => {
		if (Object.keys(rule).some(keyword => !['const', 'enum'].includes(keyword))) {
			throw new Error('Template conditions support property const/enum checks.');
		}
		if (!Object.prototype.hasOwnProperty.call(value, key)) { return true; }
		return (!Object.prototype.hasOwnProperty.call(rule, 'const') || JSON.stringify(value[key]) === JSON.stringify(rule.const)) &&
			(!rule.enum || rule.enum.some((item: JsonValue) => JSON.stringify(value[key]) === JSON.stringify(item)));
	});
}

/** Extends the template PoC's required/default/type rules to nested objects and references. */
export async function generateTemplate(node: SchemaNode, repository: SchemaRepository, depth = 0): Promise<JsonValue> {
	if (depth > 40) { throw new Error('Required schema nesting is too deep or recursive.'); }
	const { schema, base } = await repository.dereference(node);
	if (schema === false) { throw new Error('Cannot create a template for a false schema.'); }
	if (schema === true) { return null; }
	if (schema.oneOf || schema.anyOf || schema.allOf) {
		throw new Error('Choose a concrete object schema. Nested schema compositions are not supported by this template generator.');
	}
	if (Object.prototype.hasOwnProperty.call(schema, 'const')) { return copy(schema.const); }
	const hasDefault = Object.prototype.hasOwnProperty.call(schema, 'default');
	if (hasDefault && schema.default === null) { return null; }
	const type = Array.isArray(schema.type) ? schema.type.find((value: string) => value !== 'null') ?? 'null' : schema.type;
	if (type === 'object' || schema.properties) {
		const result: { [key: string]: JsonValue } = hasDefault && schema.default && typeof schema.default === 'object'
			? copy(schema.default) : {};
		for (const name of schema.required ?? []) {
			if (!Object.prototype.hasOwnProperty.call(result, name)) {
				Object.defineProperty(result, name, { enumerable: true, configurable: true, writable: true,
					value: await generateTemplate({ schema: schema.properties?.[name] ?? true, base }, repository, depth + 1) });
			}
		}
		if (schema.if !== undefined) {
			const branch = matchesCondition(schema.if, result) ? schema.then : schema.else;
			if (branch !== undefined) {
				if (branch === false) { throw new Error('The template values select a false conditional schema.'); }
				if (branch !== true) {
					if (Object.keys(branch).some(key => !['required', 'properties'].includes(key))) {
						throw new Error('Template conditional branches support required fields and properties.');
					}
					return generateTemplate({ base, schema: { ...schema, $id: undefined, if: undefined, default: result,
						required: [...(schema.required ?? []), ...(branch.required ?? [])], properties: { ...schema.properties, ...branch.properties } } }, repository, depth + 1);
				}
			}
		}
		return result;
	}
	if (hasDefault) { return copy(schema.default); }
	if (schema.enum?.length) { return copy(schema.enum[0]); }
	if (type === 'array') {
		const count = schema.minItems ?? 0;
		if (count > 100) { throw new Error('Template arrays are limited to 100 required items.'); }
		const values: JsonValue[] = [];
		for (let i = 0; i < count; i++) {
			values.push(await generateTemplate({ schema: schema.prefixItems?.[i] ?? schema.items ?? true, base }, repository, depth + 1));
		}
		return values;
	}
	// These are editable placeholders, just as in the PoC; validation supplies further guidance.
	switch (type) {
		case 'boolean': return true;
		case 'integer': case 'number': return 1;
		case 'string': return '';
		default: return null;
	}
}
