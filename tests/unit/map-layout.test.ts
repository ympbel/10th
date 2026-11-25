import test from 'node:test';
import assert from 'node:assert/strict';
import { alumniUs } from '../../src/data/alumni-us.ts';
test('US institution badges do not overlap in the shared map coordinates',()=>{
 for(let i=0;i<alumniUs.length;i++)for(let j=i+1;j<alumniUs.length;j++) {
  const a=alumniUs[i],b=alumniUs[j];
  assert.ok(Math.abs(a.pinX-b.pinX)>80 || Math.abs(a.pinY-b.pinY)>80,`${a.short} overlaps ${b.short}`);
 }
});
