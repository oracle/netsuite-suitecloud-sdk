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
 'netsuite-suiteskills-workforce': ['RB-PPL-001','RB-PPL-007','RB-PPL-008','RB-PPL-009','RB-PPL-010'],
};
const commonRootFiles = ['ID-REGISTER.json','INSTALL-LAYOUT.json','NOTICE.md'];
const commonLayerRoot = path.join(packageRoot,'common/layers/suiteskills');
const commonSkillsRoot = path.join(packageRoot,'common/skills/suiteskills');
const categories = ['Finance','Customers & Sales','Operations','Workforce'];
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
   assert.equal(plugin.skillSource,'suiteskills');
   assert.equal(plugin.version,'1.0.0');
   assert.deepEqual(workspace.buildConfig.skillSources,{suiteskills:'./common/skills/suiteskills'});
   assert.equal(workspace.buildConfig.commonLayersRoot,'./common/layers');
   assert.equal(workspace.commonLayersRoot,path.join(packageRoot,'common/layers'));
   assert.equal(plugin.selectedSkillsRoot,commonSkillsRoot);
   assert.equal(plugin.validatedSkillSource.rootDir,commonSkillsRoot);
   for (const name of plugin.skills) assert.equal(plugin.skillDirectories.get(name).rootDir,path.join(commonSkillsRoot,name));
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
    for (const row of index) {
     assert.equal(row.category,category);
     assert.equal(row.path,`skills/${category}/runbooks/${row.name}/RUNBOOK.md`);
     const route=rows.find(r=>r.id===row.id);
     assert.equal(route.name,row.name);
     assert.equal(route.path,row.path);
     assert.deepEqual(route.aliases,row.aliases);
     await exists(row.path);
    }
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
   const brandingFiles=['assets/netsuite-icon.png','assets/netsuite-logo.png'];
   if (provider==='openai') {
    const i=plugin.metadata.interface;
    for (const [key,max] of [['displayName',30],['shortDescription',30],['longDescription',4000],['developerName',80]]) assert(i[key].length>0 && i[key].length<=max,key);
    assert(Array.isArray(i.capabilities) && i.capabilities.length<=20);
    for (const asset of [i.logo,i.composerIcon]) await exists(asset);
    assert.equal(i.composerIcon,'./assets/netsuite-icon.png');
    assert.equal(i.logo,'./assets/netsuite-logo.png');
    assert.deepEqual(plugin.commonLayers.find(layer=>layer.name==='openai'),{name:'openai',include:brandingFiles,exclude:[]});
    for (const file of brandingFiles) assert.deepEqual(await read(file),await fs.readFile(path.join(packageRoot,'common/layers/openai',file)),file);
    assert.equal(plugin.metadata.extensions['com.openai'].onboardingSkill,'./skills/netsuite-suiteskills-onboarding/SKILL.md');
    await exists(plugin.metadata.extensions['com.openai'].onboardingSkill);
    assert.deepEqual(displayFiles,plugin.skills.map(s=>`skills/${s}/agents/openai.yaml`).sort());
    for(const file of displayFiles) assert.match((await read(file)).toString(),/interface:\n  display_name:.*\n  short_description:/);
    assert.equal(plugin.metadata.apps,undefined); assert.equal(plugin.metadata.mcpServers,undefined);
   } else {
    assert.deepEqual(displayFiles,[]);
    for (const file of brandingFiles) assert(!files.includes(file),file);
   }
   await t.test('visualization prerequisites and export-gate packaging',async()=>{
    const row=catalog.runbooks.find(r=>r.id==='RB-OPS-020');
    assert.match((await read(row.path)).toString(),/No Finance Analyst plugin or handoff is required/);
    assert.equal(row.source_version,'2.2.0-rc.1');
    const visualRoot=path.posix.dirname(row.path);
    for (const file of ['examples/supplied-revenue.json','examples/supplied-kpis.json','references/visual-design.md']) await exists(path.posix.join(visualRoot,file));
    const metadata=await json(path.posix.join(visualRoot,'metadata.json'));
    assert.equal(metadata.local_dependencies.finance_analyst,undefined);
    assert.deepEqual(row.local_dependencies,metadata.local_dependencies);
    assert.deepEqual(row.operations,metadata.operations);
    assert.equal(metadata.compatibility.host,'capability_dependent');
    for (const file of ['scripts/contract.py','scripts/chart_contract.py','references/delivery.md']) assert.doesNotMatch((await read(path.posix.join(visualRoot,file))).toString(),/actual unavailable Finance Analyst|financial.*keyword|FINANCIAL_WORDS/);
    for (const file of ['scripts/export_gate.py','scripts/capabilities.py','scripts/runtime.py','scripts/publication.py','scripts/verify_delivery.py','scripts/browser.cjs','references/publication.md','references/delivery.md','assets/view.js','assets/view.css']) await exists(path.posix.join(path.posix.dirname(row.path),file));
    assert.match((await read(path.posix.join(path.posix.dirname(row.path),'scripts/capabilities.py'))).toString(),/pypdf/);
   });
   await t.test('current SafeWords policy ownership, coverage and execution safeguards',async()=>{
    for(const name of ['SAFEWORDS-COVERAGE.md','SAFEWORDS-COVERAGE.json','SECURITY-CHANGELOG.md','VISUALIZER-CHANGELOG.md']) {
     await exists(name); assert(plugin.inputs.some(input=>input.include.includes(name)));
    }
    const coverage=await json('SAFEWORDS-COVERAGE.json');
    assert.equal(coverage.version,'1.0.0');
    assert.equal(coverage.host,'capability_dependent');
    assert.equal(coverage.counts.policy_owners,5);
    assert.equal(coverage.counts.runbooks,48);
    assert.equal(coverage.counts.workflows,15);
    assert.equal(coverage.policy_owners.length,5);
    assert.deepEqual(coverage.policy_owners.map(r=>r.path).sort(),plugin.skills.map(s=>`skills/${s}/SKILL.md`).sort());
    assert.deepEqual(coverage.application_references.filter(r=>r.kind==='workflow').map(r=>r.path).sort(),files.filter(f=>f.includes('/workflows/') && f.endsWith('.md')).sort());
    assert.equal(coverage.application_references.filter(r=>r.kind==='runbook').length,48);
    assert.equal(coverage.application_references.filter(r=>r.kind==='workflow').length,15);
    assert.equal(new Set(coverage.application_references.map(r=>r.path)).size,63);
    assert.deepEqual(coverage.application_references.filter(r=>r.kind==='runbook').map(r=>r.path).sort(),catalog.runbooks.map(r=>r.path).sort());
    const policies=[];
    for(const owner of coverage.policy_owners) {
     const raw=await read(owner.path),lines=raw.toString().split('\n');
     assert.equal(hash(raw),owner.sha256,owner.path);
     const policy=lines.slice(owner.start_line-1,owner.end_line).join('\n');
     assert(policy.startsWith('## SafeWords'));
     assert.deepEqual([...policy.matchAll(/\*\*(SW-\d{2})\*\*/g)].map(m=>m[1]),Array.from({length:11},(_,i)=>`SW-${String(i+1).padStart(2,'0')}`));
     policies.push(policy);
    }
    for(const policy of policies) assert.equal(policy,policies[0]);
    for(const row of coverage.application_references) {
     const raw=await read(row.path),text=raw.toString();
     assert.equal(hash(raw),row.sha256,row.path);
     assert(text.split('\n')[row.line-1].includes(`(${row.target})`),row.path);
     assert.match(text,/If it cannot be loaded, stop dependent operations/);
     assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(row.path),row.target.split('#')[0])),row.policy_owner);
     assert.doesNotMatch(text,/^## SafeWords$/m);
    }
    const restrictions={
     'netsuite-suiteskills-finance/runbooks/netsuite-cohort-analysis/RUNBOOK.md':/Never create, update, delete, transform, upload, send, publish, deploy/,
     'netsuite-suiteskills-workforce/runbooks/netsuite-absence-management-advisor/RUNBOOK.md':/read-only by design/,
     'netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/RUNBOOK.md':/Do not invent diagnostic identifiers/,
     'netsuite-suiteskills-workforce/runbooks/netsuite-time-entry-creation/RUNBOOK.md':/Only Save on that unchanged review authorizes/,
    };
    for(const [file,pattern] of Object.entries(restrictions)) assert.match((await read('skills/'+file)).toString(),pattern);
    const baseline=(await read('shared/contracts/BASELINE.md')).toString();
    assert.match(baseline,/Discover the currently exposed integration/);
    assert.match(baseline,/Preselection is not submission/);
    const outputs=(await read('shared/contracts/OUTPUTS.md')).toString();
    assert.match(outputs,/POSIX O_NOFOLLOW/);
    assert.match(outputs,/Unsupported execution fails closed/);
    assert.match(outputs,/downloadable HTML file is not an inline interactive surface/);
    for(const file of files.filter(f=>f.endsWith('/deliver_response.py'))) {
     const text=(await read(file)).toString();
     assert(text.includes("'.claude-plugin'"),file); assert(text.includes("'.codex-plugin'"),file);
    }
   });
   await t.test('current skill directories, copy, versions and relative links',async()=>{
    const copy={
     'customers-sales':['Customers & Sales','Sales, marketing, service, and pricing assistance grounded in your NetSuite data.','Supported actions require explicit confirmation and validated tools and access; other workflows provide analysis, drafts, and recommendations for human review.'],
     finance:['Finance','Close faster, see cash clearly, and catch issues early, all from NetSuite.','Any action beyond analysis requires explicit authorization from the user.'],
     onboarding:['Onboarding','Your guided starting point for SuiteSkills. Find the right workflow for your role in minutes.','Onboarding skips the interview and routes them straight to the matching workflow.'],
     operations:['Operations','Inventory, fulfillment, and supply chain insights for the teams that keep orders moving.',"Any requested action depends on the user's authorization and business prerequisites."],
     workforce:['Workforce','Payroll readiness, time, absence, and benefits insight for HR and managers.','the skill makes no eligibility or employment judgments.'],
    };
    const skillDirectories=(await fs.readdir(path.join(root,'skills'),{withFileTypes:true})).filter(entry=>entry.isDirectory()).map(entry=>entry.name).sort();
    assert.deepEqual(skillDirectories,plugin.skills.slice().sort());
    const register=await json('ID-REGISTER.json');
    assert.equal(register.version,'1.0.0');
    assert.deepEqual(register.active_ids.slice().sort(),catalog.runbooks.map(r=>r.id).sort());
    assert.equal(catalog.categories.find(c=>c.slug==='netsuite-suiteskills-workforce').id,'CAT-PPL');
    for(const [suffix,[label,tagline,boundary]] of Object.entries(copy)) {
     const prefix=`skills/netsuite-suiteskills-${suffix}`;
     const text=(await read(`${prefix}/SKILL.md`)).toString();
     assert(text.includes(`# ${label}\n`)); assert(text.includes(`*${tagline}*`)); assert(text.includes(boundary));
     assert.match(text,/version: "1\.0\.0"/);
     const metadata=await json(`${prefix}/metadata.json`);
     assert.equal(metadata.version,'1.0.0');
     if(provider==='openai') assert((await read(`${prefix}/agents/openai.yaml`)).toString().includes(`display_name: "${label}"`));
    }
    assert.match((await read('skills/netsuite-suiteskills-workforce/SKILL.md')).toString(),/NetSuite and SuitePeople/);
    for(const row of catalog.runbooks) {
     assert.equal(row.integration_version,'1.0.0');
     if(row.category==='netsuite-suiteskills-workforce') assert.match((await read(row.path)).toString(),/category: workforce/);
     const metadata=await json(path.posix.join(path.posix.dirname(row.path),'metadata.json'));
     assert.equal(metadata.integration_version,'1.0.0');
     if(typeof metadata.target_plugin==='object') assert.equal(metadata.target_plugin.version,'1.0.0');
     if(row.id==='RB-FIN-020') { assert.equal(row.source_version,'0.8.0'); assert.equal(metadata.version,'0.8.0'); }
    }
    for(const file of files.filter(f=>f.endsWith('.md') && !f.endsWith('CHANGELOG.md'))) {
     const text=(await read(file)).toString();
     for(const match of text.matchAll(/(?<!!)\[[^\]]*\]\(([^\s)]+)\)/g)) {
      const target=match[1].split('#')[0];
      if(!target || /^(?:[a-zA-Z]+:|\/|\{|<)/.test(target)) continue;
      assert(files.includes(path.posix.normalize(path.posix.join(path.posix.dirname(file),target))),`${file}: ${target}`);
     }
    }
   });
   await t.test('current SDK foundation snapshots and onboarding binding',async()=>{
    const snapshot=await json('FOUNDATION-SNAPSHOT.json');
    assert.equal(snapshot.plugin.version,'1.0.0');
    assert.equal(snapshot.native_host_execution,'not_run');
    assert.match(snapshot.authoring_tools,/pending_realignment/);
    assert.deepEqual(Object.keys(snapshot.category_source_sha256).sort(),Object.keys(expectedRoutes).sort());
    assert.deepEqual(Object.keys(snapshot.shared_files).sort(),files.filter(f=>f.startsWith('shared/')).sort());
    for(const [file,digest] of Object.entries(snapshot.shared_files)) assert.equal(hash(await read(file)),digest,file);
    for(const [category,digest] of Object.entries(snapshot.category_source_sha256)) assert.equal(hash(await read(`skills/${category}/SKILL.md`)),digest,category);
    const basis={category_source_sha256:snapshot.category_source_sha256,shared_files:snapshot.shared_files};
    assert.equal(hash(JSON.stringify(basis,null,2)+'\n'),snapshot.foundation_sha256);
    const lock=await json('skills/netsuite-suiteskills-onboarding/FOUNDATION-LOCK.json');
    assert.equal(lock.reference_plugin.version,'1.0.0');
    assert.equal(lock.foundation_sha256,snapshot.foundation_sha256);
    assert.deepEqual(lock.shared_files,snapshot.shared_files);
    assert.equal(lock.utility_context_sha256,hash(await read('skills/netsuite-suiteskills-onboarding/PLUGIN-CONTEXT.md')));
   });
   const inventory=await json('INVENTORY.json');
   const sharedInventory=Object.keys(inventory).filter(f=>f.startsWith('shared/')).sort();
   assert.equal(sharedInventory.length,149);
   const layer=plugin.commonLayers.find(layer=>layer.name==='suiteskills');
   const layerInventory=[...commonRootFiles,...sharedInventory].sort();
   assert.equal(layerInventory.length,152);
   assert.deepEqual(layer,{name:'suiteskills',include:layerInventory,exclude:[]});
   assert.equal(plugin.validatedCommonLayers.find(layer=>layer.name==='suiteskills').rootDir,commonLayerRoot);
   assert.deepEqual((await listRelativeFiles(commonLayerRoot)).sort(),layerInventory);
   for (const file of commonRootFiles) {
    await assert.rejects(()=>fs.access(path.join(plugin.pluginDirectory,'src',file)),/ENOENT/);
    assert(!plugin.inputs.some(input=>input.include.includes(file)));
    assert((await read(file)).equals(await fs.readFile(path.join(commonLayerRoot,file))),file);
   }
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
 await fs.cp(commonLayerRoot,root,{recursive:true});
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
  assert.deepEqual(result.files.filter(file=>file.startsWith('shared/') || commonRootFiles.includes(file)).sort(),layer.include.slice().sort());
 }
});
