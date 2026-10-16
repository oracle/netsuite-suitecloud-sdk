import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {loadWorkspace} from '../scripts/lib/build-config.mjs';
test('SuiteSkills Claude 0.7.9 preserves 48 routes and secured visualization without obsolete branding',async()=>{
 const w=await loadWorkspace(process.cwd());const p=w.plugins.find(p=>p.sourceKey==='anthropic/netsuite-suiteskills');
 assert(p);assert.equal(p.version,'0.7.9');assert.equal(p.skills.length,5);
 const src=path.resolve('anthropic/netsuite-suiteskills/src');const c=JSON.parse(await fs.readFile(path.join(src,'CATALOG.json'),'utf8'));
 assert.equal(c.runbooks.length,48);const rows=c.runbooks.filter(r=>r.id==='RB-OPS-020');assert.equal(rows.length,1);assert.equal(rows[0].version,'2.1.0-rc.1');
 const rb=path.resolve('../agent-skills',rows[0].path.replace(/^skills\//,''));assert.match(await fs.readFile(rb,'utf8'),/Finance Analyst/);
 assert((await fs.stat(path.join(path.dirname(rb),'scripts/export_gate.py'))).isFile());
 const inv=JSON.parse(await fs.readFile(path.join(src,'INVENTORY.json'),'utf8'));
 for(const n of Object.keys(inv)){
  const file=n.startsWith('skills/')?path.resolve('../agent-skills',n.slice(7)):path.join(src,n);
  assert(!/clau[d]esuite/i.test(n));assert(!/clau[d]esuite/i.test(await fs.readFile(file,'utf8')),n);
 }
});
