import { readFileSync, realpathSync } from 'node:fs';
import fs, { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDashboardModel } from './dashboard-model.mjs';

/**
 * The template owns the surrounding HTML and data container. The renderer
 * replaces this token once and leaves every other template byte untouched.
 */
export const DASHBOARD_MODEL_MARKER = '__TIME_APPROVAL_REVIEW_MODEL__';

const schemaUrl = new URL('../assets/dashboard-model.schema.json', import.meta.url);
const defaultSchema = JSON.parse(readFileSync(schemaUrl, 'utf8'));
const escapedJsonCharacters = new Map([
  ['<', '\\u003c'],
  ['>', '\\u003e'],
  ['&', '\\u0026'],
  ['\u2028', '\\u2028'],
  ['\u2029', '\\u2029'],
]);

function invalidModel(error) {
  if (error instanceof Error && error.message.startsWith('Unsupported dashboard schema version')) {
    return error;
  }
  if (error instanceof Error && error.message.startsWith('Unsupported dashboard schema version in schema')) {
    return error;
  }
  const detail = error instanceof Error ? error.message : String(error);
  return new Error(`Invalid dashboard model: ${detail}`, { cause: error });
}

function validateForRendering(model, schema) {
  try {
    return validateDashboardModel(model, schema);
  } catch (error) {
    throw invalidModel(error);
  }
}

function serializeDashboardModel(model) {
  return JSON.stringify(model).replace(/[<>&\u2028\u2029]/g, (character) => escapedJsonCharacters.get(character));
}

/**
 * Parse model JSON and validate it with the shared dashboard contract.
 */
export function parseDashboardModel(jsonText, schema = defaultSchema) {
  let model;
  try {
    model = JSON.parse(jsonText);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid dashboard model JSON: ${detail}`, { cause: error });
  }
  return validateForRendering(model, schema);
}

/**
 * Validate a model and inject its escaped JSON into exactly one template slot.
 * The model object is never normalized or mutated.
 */
export function renderDashboard(model, template, schema = defaultSchema) {
  if (typeof template !== 'string') {
    throw new TypeError('Dashboard template must be a string');
  }
  const markerCount = template.split(DASHBOARD_MODEL_MARKER).length - 1;
  if (markerCount !== 1) {
    throw new Error(`Dashboard template must contain exactly one dashboard model marker; found ${markerCount}`);
  }

  const validatedModel = validateForRendering(model, schema);
  return template.replace(DASHBOARD_MODEL_MARKER, () => serializeDashboardModel(validatedModel));
}

const CLI_USAGE = 'Usage: node render-dashboard.mjs --model <dashboard-model.json> --template <dashboard.html>';

function parseCliArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (!['--model', '--template'].includes(option) || index + 1 >= argv.length) {
      throw new Error(CLI_USAGE);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--') || values[option]) {
      throw new Error(CLI_USAGE);
    }
    values[option] = value;
    index += 1;
  }
  if (!values['--model'] || !values['--template']) {
    throw new Error(CLI_USAGE);
  }
  return {
    modelPath: values['--model'],
    templatePath: values['--template'],
  };
}

export async function writeDashboardFile(outputPath, rendered) {
  const handle = await fs.open(outputPath, 'wx', 0o600);
  try {
    await handle.writeFile(rendered, 'utf8');
  } catch (error) {
    try {
      await handle.close();
    } catch {
      // Keep the write error when closing also fails.
    }
    throw error;
  }
  await handle.close();
}

export async function main(argv = process.argv.slice(2)) {
  const { modelPath, templatePath } = parseCliArgs(argv);
  const [modelText, template] = await Promise.all([
    readFile(modelPath, 'utf8'),
    readFile(templatePath, 'utf8'),
  ]);
  const model = parseDashboardModel(modelText);
  const rendered = renderDashboard(model, template);
  const parent = resolve(tmpdir());
  const directory = await fs.mkdtemp(join(parent, 'time-approval-review-'));
  const outputPath = join(directory, 'dashboard.html');
  await writeDashboardFile(outputPath, rendered);
  process.stdout.write(`${outputPath}\n`);
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMainModule()) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
