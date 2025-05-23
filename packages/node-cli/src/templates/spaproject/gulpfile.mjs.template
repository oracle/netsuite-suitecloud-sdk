import fs from 'fs/promises';
import path from 'path';
import gulp from 'gulp';
import ts from 'gulp-typescript';
import {rollup} from 'rollup';
import terser from '@rollup/plugin-terser';

/**
 * Enable or disable script concatenation. When enabled all code will be concatenated into a single file for each
 * entry point. This can greatly reduce the number of requests and loading time.
 */
const concatenateScripts = true;
/**
 * Enable/disable minification of scripts to save bandwidth
 */
const minifyScripts = true;

const tsBuildDir = 'build';
const srcSuiteAppDir = path.join('src', 'SuiteApps');
const buildSuiteAppDir = path.join(tsBuildDir, 'src', 'SuiteApps');
const fileCabinetSuiteAppDir = path.join('src', 'FileCabinet', 'SuiteApps');
const rollupTerserPlugin = terser();

export const clean = gulp.series(
    cleanBuild,
    cleanBundles,
);

export const build = gulp.series(
    cleanBuild,
    compileTs,
);

export const bundle = gulp.series(
    build,
    cleanBundles,
    bundleScripts,
    bundleAssets,
);

/**
 * Transpile TypeScript files into JavaScript. The output is saved in the build directory.
 */
function compileTs() {
    const tsProject = ts.createProject('tsconfig.json');
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest(tsBuildDir));
}

/**
 * Find all scripts that are entry points and bundle them using Rollup.
 * - Converts imports into define/require
 * - Scripts are optionally concatenated and minified based on the concatenateScripts and minifyScripts settings
 * - The input is taken from the build directory containing the transpiled sources
 * - The output is saved into src/FileCabinet/SuiteApps
 */
async function bundleScripts() {
    const spaRoots = await findSpaRoots();
    for (const root of spaRoots){
        const entryPoints = await findEntryPoints(root);
        for (const input of entryPoints) {
            const scriptType = input.metadata.match(scriptTypeRegex)[0];
            const result = await rollup({
                input: path.resolve(input.filePath),
                external: ['@uif-js/core', '@uif-js/core/jsx-runtime', '@uif-js/component', /^N$/, /^N\//],
                plugins: [rollupScriptTypePlugin()],
            });
            await result.write(rollupOutputConfig(input.filePath));
            if (scriptType.length > 0 && !scriptType.includes('SpaClient')) {
                await appendScriptType(input);
            }
        }
    }
}

/**
 * Copies all files that are not source files from src/SuiteApps into src/FileCabinet/SuiteApps
 */
async function bundleAssets() {
    await visitDir(srcSuiteAppDir, async (filePath) => {
        if (isSourceFile(filePath)) {
            return;
        }
        const targetPath = path.join(fileCabinetSuiteAppDir, path.relative(srcSuiteAppDir, filePath));
        await fs.mkdir(path.dirname(targetPath), {
            recursive: true,
        });
        await fs.copyFile(filePath, targetPath);
    });
}

/**
 * Cleans the build directory removing all transpiled sources
 */
async function cleanBuild() {
    await cleanDir(tsBuildDir);
}

/**
 * Cleans the src/FileCabinet/SuiteApps directory removing all bundled sources and assets for any SPA projects
 */
async function cleanBundles() {
    const ep = await findEntryPoints(tsBuildDir);
    for (const entry of ep){
        if (entry.metadata.includes("SpaServer")){
            await cleanDir(path.dirname(getOutputFile(entry.filePath)));
        }   
    }
}

/**
 * Finds source files that are entry points for backend scripts or SPAs
 */
async function findEntryPoints(dir) {
    const result = [];
    await visitDir(dir, async (filePath) => {
        const entryPoint = await checkEntryPoint(filePath);
        if (entryPoint) {
            result.push(entryPoint);
        }
    });
    return result;
}

/**
 * Determine if file path is a source file or an asset
 */
function isSourceFile(filePath) {
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    return extensions.some((ext) => filePath.endsWith(ext));
}

/**
 * Determines if file path is an entry point for a backend script or an SPA
 */
async function checkEntryPoint(filePath) {
    if (filePath.endsWith('SpaClient.js')) {
        return {filePath, metadata: '@NScriptType SpaClient'};
    }
    const content = (await fs.readFile(filePath)).toString();
    const array = content.match(scriptMetadataRegex);
    return array ? {filePath, metadata: array[0]} : null;
}

/**
 * Get Rollup output config for an input file based on the concatenateScripts and minifyScripts options
 */
function rollupOutputConfig(input) {
    const common = {
        plugins: minifyScripts ? [rollupTerserPlugin] : [],
        format: 'amd',
    };

    if (concatenateScripts) {
        return {
            file: getOutputFile(input),
            ...common,
        };
    } else {
        return {
            dir: fileCabinetSuiteAppDir,
            preserveModules: true,
            preserveModulesRoot: buildSuiteAppDir,
            ...common,
        };
    }
}

/**
 * For a file in the build folder get a corresponding file in the FileCabinet folder
 */
function getOutputFile(input) {
    return path.join(fileCabinetSuiteAppDir, path.relative(buildSuiteAppDir, input));
}

/**
 * Append the NScriptType annotation to the top of the bundled file
 */
async function appendScriptType(input) {
    const outputFile = getOutputFile(input.filePath);
    const content = (await fs.readFile(outputFile)).toString();
    await fs.writeFile(outputFile, `${input.metadata}\n${content}`);
}

/**
 * Removes a directory
 */
async function cleanDir(dirPath) {
    return fs.rm(dirPath, {
        recursive: true,
        force: true,
    });
}

/**
 * Visits all files in a directory recursively
 */
async function visitDir(dirPath, process) {
    for (const entryName of await fs.readdir(dirPath)) {
        const entryPath = path.join(dirPath, entryName);
        if ((await fs.lstat(entryPath)).isFile()) {
            await process(entryPath);
        } else {
            await visitDir(entryPath, process);
        }
    }
}

async function findSpaRoots(){
    const roots = [];
    await visitDir(tsBuildDir, async (filePath) => {
        const entryPoint = await checkEntryPoint(filePath);
        if (entryPoint && entryPoint.metadata.includes("SpaServer")) {
            roots.push(path.dirname(entryPoint.filePath));
        }
    });
    return roots;
}

/**
 * Rollup plugin that removes the NScriptType annotation before processing
 */
function rollupScriptTypePlugin() {
    return {transform: (code) => code.replace(scriptMetadataRegex, '')};
}

const scriptMetadataRegex = /\/\*\*[\s\S]*?NScriptType[\s\S]*?\*\//gm;
const scriptTypeRegex = /(?<=@NScriptType )\w+/gm