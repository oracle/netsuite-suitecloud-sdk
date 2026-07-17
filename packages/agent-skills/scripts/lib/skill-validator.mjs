/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { isMap, isScalar, parseDocument } from 'yaml';

const FRONTMATTER_PATTERN = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/;
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SKILL_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;
const MAX_COMPATIBILITY_LENGTH = 500;

function isPlainObject(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertString(value, label, skillDirectoryName) {
	if (typeof value !== 'string') {
		throw new Error(`Skill ${skillDirectoryName}: ${label} must be a string`);
	}
}

function assertBoundedNonEmptyString(value, label, maximumLength, skillDirectoryName) {
	assertString(value, label, skillDirectoryName);
	if (value.length === 0 || value.length > maximumLength) {
		throw new Error(`Skill ${skillDirectoryName}: ${label} must be 1-${maximumLength} characters`);
	}
}

export function validateSkillContents(contents, skillDirectoryName, { requireDirectoryMatch = true } = {}) {
	const match = FRONTMATTER_PATTERN.exec(contents);
	if (!match) {
		throw new Error(`Skill ${skillDirectoryName}: SKILL.md must contain YAML frontmatter followed by a non-empty Markdown body`);
	}
	if (match[2].trim().length === 0) {
		throw new Error(`Skill ${skillDirectoryName}: SKILL.md must contain a non-empty Markdown body`);
	}

	const document = parseDocument(match[1], { uniqueKeys: true });
	if (document.errors.length > 0) {
		throw new Error(`Skill ${skillDirectoryName}: invalid YAML frontmatter: ${document.errors[0].message}`);
	}
	if (document.warnings.length > 0) {
		throw new Error(`Skill ${skillDirectoryName}: invalid YAML frontmatter: ${document.warnings[0].message}`);
	}

	const frontmatter = document.toJS();
	if (!isPlainObject(frontmatter)) {
		throw new Error(`Skill ${skillDirectoryName}: frontmatter must be a YAML mapping`);
	}

	assertBoundedNonEmptyString(frontmatter.name, 'name', MAX_SKILL_NAME_LENGTH, skillDirectoryName);
	if (!SKILL_NAME_PATTERN.test(frontmatter.name)) {
		throw new Error(`Skill ${skillDirectoryName}: name must contain lowercase letters, numbers, and single hyphens only`);
	}
	if (requireDirectoryMatch && frontmatter.name !== skillDirectoryName) {
		throw new Error(`Skill ${skillDirectoryName}: name must match the parent directory name`);
	}
	if (!frontmatter.name.startsWith('netsuite-')) {
		throw new Error(`Skill ${skillDirectoryName}: name must begin with "netsuite-"`);
	}

	assertBoundedNonEmptyString(frontmatter.description, 'description', MAX_DESCRIPTION_LENGTH, skillDirectoryName);

	if (frontmatter.compatibility !== undefined) {
		assertBoundedNonEmptyString(frontmatter.compatibility, 'compatibility', MAX_COMPATIBILITY_LENGTH, skillDirectoryName);
	}

	if (frontmatter.metadata !== undefined) {
		const metadataNode = document.get('metadata', true);
		if (!isPlainObject(frontmatter.metadata) || !isMap(metadataNode)) {
			throw new Error(`Skill ${skillDirectoryName}: metadata must be a mapping of string keys to string values`);
		}
		for (const item of metadataNode.items) {
			if (!isScalar(item.key) || typeof item.key.value !== 'string') {
				throw new Error(`Skill ${skillDirectoryName}: metadata keys must be strings`);
			}
		}
		for (const [key, value] of Object.entries(frontmatter.metadata)) {
			if (typeof value !== 'string') {
				throw new Error(`Skill ${skillDirectoryName}: metadata.${key} must be a string`);
			}
		}
	}

	return frontmatter;
}

export async function validateSkills(skillsRoot) {
	const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
	const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
	const seenNames = new Set();

	const skills = [];
	for (const skillDirectoryName of directories) {
		const skillFilePath = path.join(skillsRoot, skillDirectoryName, 'SKILL.md');
		let contents;
		try {
			contents = await fs.readFile(skillFilePath, 'utf8');
		} catch (error) {
			if (error.code === 'ENOENT') {
				continue;
			}
			throw error;
		}

		const frontmatter = validateSkillContents(contents, skillDirectoryName, { requireDirectoryMatch: false });
		if (seenNames.has(frontmatter.name)) {
			throw new Error(`Duplicate skill name: ${frontmatter.name}`);
		}
		seenNames.add(frontmatter.name);
		skills.push({ directoryName: skillDirectoryName, frontmatter });
	}

	for (const skill of skills) {
		if (skill.frontmatter.name !== skill.directoryName) {
			throw new Error(`Skill ${skill.directoryName}: name must match the parent directory name`);
		}
	}

	return skills.length;
}
