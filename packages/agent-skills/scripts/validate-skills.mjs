/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSkills } from './lib/skill-validator.mjs';

const skillsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const count = await validateSkills(skillsRoot);

console.log(`Validated ${count} Agent Skills`);
