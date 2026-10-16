import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { loadWorkspace } from '../scripts/lib/build-config.mjs';
import { buildPlugin } from '../scripts/lib/plugin-builder.mjs';
import { listRelativeFiles } from '../scripts/lib/fs-utils.mjs';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const expectedRoutes = {
 'netsuite-suiteskills-customers-sales': ['RB-CRM-002','RB-CRM-004','RB-CRM-005','RB-CRM-006','RB-CRM-007','RB-CRM-008','RB-CRM-009','RB-CRM-010'],
 'netsuite-suiteskills-finance': ['RB-FIN-002','RB-FIN-003','RB-FIN-006','RB-FIN-007','RB-FIN-008','RB-FIN-009','RB-FIN-011','RB-FIN-012','RB-FIN-013','RB-FIN-015','RB-FIN-016','RB-FIN-017','RB-FIN-018','RB-FIN-019','RB-FIN-020','RB-FIN-021','RB-FIN-022','RB-FIN-023','RB-FIN-024','RB-FIN-025','RB-FIN-026','RB-FIN-027'],
 'netsuite-suiteskills-operations': ['RB-OPS-001','RB-OPS-002','RB-OPS-003','RB-OPS-004','RB-OPS-005','RB-OPS-006','RB-OPS-011','RB-OPS-012','RB-OPS-014','RB-OPS-015','RB-OPS-016','RB-OPS-019','RB-OPS-020'],
 'netsuite-suiteskills-people': ['RB-PPL-001','RB-PPL-007','RB-PPL-008','RB-PPL-009','RB-PPL-010'],
};
const categories = ['Finance and Accounting','Customers, Sales and Support','Inventory and Operations','People and Workforce'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

// These inspect packaged contracts and files; they do not qualify execution or runtime security.
test('SuiteSkills assembled packaging for both providers', async t => {
 const workspace = await loadWorkspace(packageRoot);
 const results = [];
 t.after(async () => { for (const result of results) await fs.rm(path.dirname(result.outputDir), { recursive:true, force:true }); });
 for (const provider of ['anthropic','openai']) {
  await t.test(provider, async t => {
   const result = await buildPlugin(`${provider}/netsuite-suiteskills`, { workspace, writeOutput:false });
   results.push(result);
   const root = result.outputDir;
   const read = file => fs.readFile(path.join(root,file));
   const json = async file => JSON.parse(await read(file));
   const exists = async file => assert((await fs.stat(path.join(root,file))).isFile(),file);
   const files = await listRelativeFiles(root);
   const plugin = result.plugin;
   const catalog = await json('CATALOG.json');
   assert.equal(plugin.skillSource,'plugin-only');
   assert.equal(catalog.version,plugin.version);
   assert.deepEqual(catalog.categories.map(c=>c.name), categories);
   assert.equal(new Set(catalog.runbooks.map(r=>r.id)).size,48);
   assert.deepEqual(catalog.runbooks.map(r=>r.id).sort(),Object.values(expectedRoutes).flat().sort());
   for (const [category,ids] of Object.entries(expectedRoutes)) {
    const rows=catalog.runbooks.filter(r=>r.category===category);
    assert.deepEqual(rows.map(r=>r.id).sort(),ids);
    assert.equal(catalog.categories.find(c=>c.slug===category).runbook_count,ids.length);
    const index=await json(`skills/${category}/index.json`);
    assert.deepEqual(index.map(r=>r.id).sort(),ids);
    for (const row of index) { assert.equal(row.category,category); await exists(row.path); }
   }
   for (const row of [...catalog.runbooks,...catalog.utility_skills]) {
    await exists(row.path);
    for (const dep of row.shared_dependencies ?? []) await exists(dep);
    for (const resource of row.resources ?? []) await exists(path.posix.join(path.posix.dirname(row.path),resource));
   }
   assert.deepEqual(plugin.skills.slice().sort(),[...Object.keys(expectedRoutes),'netsuite-suiteskills-onboarding'].sort());
   const layout=await json('INSTALL-LAYOUT.json');
   for (const name of plugin.skills) { assert.equal(layout.copies[name],`skills/${name}/shared/`); await exists(layout.copies[name]+'README.md'); }
   const manifestPath=provider==='openai'?'.codex-plugin/plugin.json':'.claude-plugin/plugin.json';
   assert.deepEqual(await json(manifestPath),{...plugin.metadata,version:plugin.version,skills:'./skills/'});
   assert(!files.includes('plugin.json'));
   assert(!files.includes(provider==='openai'?'.claude-plugin/plugin.json':'.codex-plugin/plugin.json'));
   const displayFiles=files.filter(f=>f.endsWith('/agents/openai.yaml'));
   if (provider==='openai') {
    const i=plugin.metadata.interface;
    for (const [key,max] of [['displayName',30],['shortDescription',30],['longDescription',4000],['developerName',80]]) assert(i[key].length>0 && i[key].length<=max,key);
    assert(Array.isArray(i.capabilities) && i.capabilities.length<=20);
    for (const asset of [i.logo,i.composerIcon]) await exists(asset);
    await exists('assets/suiteskills.svg');
    assert.equal(plugin.metadata.extensions['com.openai'].onboardingSkill,'./skills/netsuite-suiteskills-onboarding/SKILL.md');
    await exists(plugin.metadata.extensions['com.openai'].onboardingSkill);
    assert.deepEqual(displayFiles,plugin.skills.map(s=>`skills/${s}/agents/openai.yaml`).sort());
    for(const file of displayFiles) assert.match((await read(file)).toString(),/interface:\n  display_name:.*\n  short_description:/);
    assert.equal(plugin.metadata.apps,undefined); assert.equal(plugin.metadata.mcpServers,undefined);
   } else { assert.deepEqual(displayFiles,[]); assert(!files.includes('assets/suiteskills.svg')); }
   await t.test('visualization prerequisites and export-gate packaging',async()=>{
    const row=catalog.runbooks.find(r=>r.id==='RB-OPS-020');
    assert.match((await read(row.path)).toString(),/Finance Analyst/);
    for (const file of ['scripts/export_gate.py','scripts/capabilities.py','scripts/runtime.py','scripts/publication.py','scripts/verify_delivery.py','scripts/browser.cjs','references/publication.md','references/delivery.md','assets/view.js','assets/view.css']) await exists(path.posix.join(path.posix.dirname(row.path),file));
    assert.match((await read(path.posix.join(path.posix.dirname(row.path),'scripts/capabilities.py'))).toString(),/pypdf/);
   });
   const inventory=await json('INVENTORY.json');
   const sharedInventory=Object.keys(inventory).filter(f=>f.startsWith('shared/')).sort();
   assert.equal(sharedInventory.length,149);
   const layer=plugin.commonLayers.find(layer=>layer.name==='suiteskills');
   assert.deepEqual(layer,{name:'suiteskills',include:sharedInventory,exclude:[]});
   assert.deepEqual((await listRelativeFiles(path.join(packageRoot,'common/suiteskills'))).sort(),sharedInventory);
   await assert.rejects(()=>fs.access(path.join(plugin.pluginDirectory,'src/shared')),/ENOENT/);
   assert(!plugin.inputs.some(input=>input.include.some(file=>file.startsWith('shared/'))));
   assert.deepEqual(files.filter(f=>!Object.hasOwn(inventory,f)).sort(),[manifestPath,'INVENTORY.json','LICENSE.txt'].sort());
   for(const [file,digest] of Object.entries(inventory)) assert.equal(hash(await read(file)),digest,file);
   for(const file of files.filter(f=>f.endsWith('/RESOURCE-MAP.json'))) {
    const map=await json(file); const parent=path.posix.dirname(path.posix.dirname(file));
    for (const [target,digest] of Object.entries(map)) assert.equal(hash(await read(path.posix.join(parent,target))),digest,`${file}: ${target}`);
   }
  });
 }
 await t.test('shared skill bytes match across providers with only five OpenAI additions',async()=>{
  const [a,o]=results;
  const aFiles=a.files.filter(f=>f.startsWith('skills/'));
  const oFiles=o.files.filter(f=>f.startsWith('skills/'));
  assert.deepEqual(oFiles.filter(f=>!aFiles.includes(f)),o.plugin.skills.map(s=>`skills/${s}/agents/openai.yaml`).sort());
  assert.deepEqual(aFiles,oFiles.filter(f=>!f.endsWith('/agents/openai.yaml')));
  for(const file of aFiles) assert((await fs.readFile(path.join(a.outputDir,file))).equals(await fs.readFile(path.join(o.outputDir,file))),file);
 });
});

test('SuiteSkills layer allowlists exclude unlisted ordinary files', async t => {
 const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'suiteskills-filter-'));
 t.after(()=>fs.rm(temporary,{recursive:true,force:true}));
 const root=path.join(temporary,'suiteskills');
 await fs.cp(path.join(packageRoot,'common/suiteskills'),root,{recursive:true});
 await fs.writeFile(path.join(root,'shared/unlisted.md'),'not selected\n');
 await fs.writeFile(path.join(root,'unlisted.md'),'not selected\n');
 const workspace=await loadWorkspace(packageRoot);
 for(const provider of ['anthropic','openai']) {
  const plugin=workspace.plugins.find(plugin=>plugin.sourceKey===`${provider}/netsuite-suiteskills`);
  const layer=plugin.validatedCommonLayers.find(layer=>layer.name==='suiteskills');
  layer.rootDir=root; layer.boundaryDir=temporary;
  const result=await buildPlugin(plugin.sourceKey,{workspace,writeOutput:false});
  t.after(()=>fs.rm(path.dirname(result.outputDir),{recursive:true,force:true}));
  assert(!result.files.includes('shared/unlisted.md'));
  assert(!result.files.includes('unlisted.md'));
  assert.deepEqual(result.files.filter(file=>file.startsWith('shared/')).sort(),layer.include.slice().sort());
 }
});
