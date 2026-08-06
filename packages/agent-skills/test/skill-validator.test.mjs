/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { validateSkillContents, validateSkills } from '../scripts/lib/skill-validator.mjs';

const validSkill = (name, fields = {}) => `---
name: ${name}
description: ${fields.description ?? 'A valid skill description.'}${fields.compatibility === undefined ? '' : `\ncompatibility: ${fields.compatibility}`}${fields.metadata === undefined ? '' : `\nmetadata:\n${fields.metadata}`}
---
# Instructions
`;

async function writeSkill(root, directoryName, contents) {
	const directory = path.join(root, directoryName);
	await fs.mkdir(directory, { recursive: true });
	await fs.writeFile(path.join(directory, 'SKILL.md'), contents, 'utf8');
}

test('validates every repository Agent Skill', async () => {
	const skillsRoot = path.resolve(process.cwd());
	assert.equal(await validateSkills(skillsRoot), 10);
});

test('rejects invalid individual Agent Skill frontmatter', () => {
	const cases = [
		['invalid YAML', '---\nname: netsuite-test\ndescription: [\n---\n# Body\n', /invalid YAML frontmatter/i],
		['missing name', '---\ndescription: Valid description\n---\n# Body\n', /name must be a string/i],
		['missing description', '---\nname: netsuite-test\n---\n# Body\n', /description must be a string/i],
		['missing body', '---\nname: netsuite-test\ndescription: Valid description\n---\n', /non-empty Markdown body/i],
		['invalid name', validSkill('netsuite--test'), /name must contain/i],
		['overlong name', validSkill(`netsuite-${'a'.repeat(56)}`), /name must be 1-64 characters/i],
		['overlong description', validSkill('netsuite-test', { description: 'a'.repeat(1025) }), /description must be 1-1024 characters/i],
		['empty compatibility', validSkill('netsuite-test', { compatibility: '' }), /compatibility must be/i],
		['overlong compatibility', validSkill('netsuite-test', { compatibility: 'a'.repeat(501) }), /compatibility must be 1-500 characters/i],
		['non-string metadata value', validSkill('netsuite-test', { metadata: '  version: 1' }), /metadata.version must be a string/i],
		['non-string metadata key', validSkill('netsuite-test', { metadata: '  1: version' }), /metadata keys must be strings/i],
	];

	for (const [label, contents, expectedError] of cases) {
		assert.throws(() => validateSkillContents(contents, 'netsuite-test'), expectedError, label);
	}
	assert.throws(
		() => validateSkillContents(validSkill('other-skill'), 'other-skill'),
		/must begin with "netsuite-"/i
	);
});

test('rejects directory-name mismatches and duplicate skill names', async () => {
	const mismatchRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'agent-skills-mismatch-'));
	await writeSkill(mismatchRoot, 'netsuite-directory-name', validSkill('netsuite-frontmatter-name'));
	await assert.rejects(() => validateSkills(mismatchRoot), /must match the parent directory name/i);

	const duplicateRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'agent-skills-duplicate-'));
	await writeSkill(duplicateRoot, 'netsuite-first', validSkill('netsuite-duplicate'));
	await writeSkill(duplicateRoot, 'netsuite-second', validSkill('netsuite-duplicate'));
	await assert.rejects(() => validateSkills(duplicateRoot), /Duplicate skill name: netsuite-duplicate/i);
});
