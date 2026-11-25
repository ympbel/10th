import test from 'node:test';
import assert from 'node:assert/strict';
import { samplePortraits } from '../../src/lib/random-portraits.ts';
test('portrait samples have no duplicates and leave the source roster unchanged',()=>{
 const people=['a','b','c','d','e'];const before=[...people];
 for(let i=0;i<100;i++){const sample=samplePortraits(people);assert.equal(sample.length,3);assert.equal(new Set(sample).size,3);assert.ok(sample.every(id=>people.includes(id)));}
 assert.deepEqual(people,before);
});
test('a repeated trio is replaced even with the same random sequence',()=>{
 const people=['a','b','c','d','e'];const first=samplePortraits(people,3,()=>.5);const next=samplePortraits(people,3,()=>.5,first);
 assert.notDeepEqual([...next].sort(),[...first].sort());assert.equal(new Set(next).size,3);
});
test('small portrait pools stay valid',()=>assert.deepEqual(samplePortraits(['a','b'],3,()=>.9),['a','b']));
