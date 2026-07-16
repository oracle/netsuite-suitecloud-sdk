import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSkills } from './lib/skill-validator.mjs';

const skillsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const count = await validateSkills(skillsRoot);

console.log(`Validated ${count} Agent Skills`);
