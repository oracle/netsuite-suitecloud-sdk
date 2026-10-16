import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadWorkspace } from '../scripts/lib/build-config.mjs';
test('SuiteSkills OpenAI has matching portable and compatibility metadata within listing limits',async()=>{
 const workspace=await loadWorkspace(process.cwd());
 const plugin=workspace.plugins.find(p=>p.sourceKey==='openai/netsuite-suiteskills');
 assert(plugin);assert.equal(plugin.version,'0.7.9');assert.equal(plugin.skills.length,5);
 const root=JSON.parse(await fs.readFile(path.resolve('openai/netsuite-suiteskills/src/plugin.json'),'utf8'));
 const ext=root.extensions['com.openai'];const i=plugin.metadata.interface;
 assert.deepEqual(i,ext.interface);
 for(const [key,max] of [['displayName',30],['shortDescription',30],['longDescription',4000],['developerName',80]])assert(i[key].length>0&&i[key].length<=max,key);
 assert(Array.isArray(i.capabilities));assert(i.capabilities.length<=20);
 for(const name of plugin.skills)assert(('netsuite-suiteskills:'+name).length<=64,name);
 assert.equal(root.extensions['com.openai'].onboardingSkill,'./skills/netsuite-suiteskills-onboarding-openai/SKILL.md');
 assert.equal(plugin.metadata.extensions['com.openai'].onboardingSkill,ext.onboardingSkill);
 assert.equal(plugin.metadata.apps,undefined);assert.equal(plugin.metadata.mcpServers,undefined);
});

test('OpenAI 0.7.9 contains one secured Data Visualization route and all prior routes', async()=>{
 const root=path.resolve('openai/netsuite-suiteskills/src');
 const cat=JSON.parse(await fs.readFile(path.join(root,'CATALOG.json'),'utf8'));
 assert.equal(cat.runbooks.length,48);
 const visual=cat.runbooks.filter(r=>r.id==='RB-OPS-020');assert.equal(visual.length,1);
 assert.equal(visual[0].version,'2.1.0-rc.1');
 const row=visual[0];const skillRoot=path.resolve('../agent-skills');
 const runbook=path.join(skillRoot,row.path.replace(/^skills\//,''));
 assert.match(await fs.readFile(runbook,'utf8'),/Finance Analyst/);
 const gate=path.join(path.dirname(runbook),'scripts/export_gate.py');
 assert((await fs.stat(gate)).isFile());
});
