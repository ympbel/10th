import {test} from 'node:test';
import assert from 'node:assert/strict';
import {yearlySummary} from '../../src/lib/yearly-summary.ts';
test('annual summaries retain missing years, count records once and reconcile cumulative totals',()=>{
 const result=yearlySummary([{year:2020},{year:2020},{year:2022},{year:2022}],2019);
 assert.deepEqual(result.years,[{year:2019,count:0,cumulative:0},{year:2020,count:2,cumulative:2},{year:2021,count:0,cumulative:2},{year:2022,count:2,cumulative:4}]);
 assert.deepEqual(result.peakYears,[2020,2022]);assert.equal(result.total,4);assert.equal(result.activeYears,2);
});
test('empty records have a finite scale and no peak or active years',()=>{
 const result=yearlySummary([],2016);assert.equal(result.total,0);assert.equal(result.peak,0);assert.deepEqual(result.peakYears,[]);assert.equal(result.activeYears,0);
});

test('an explicit chart start excludes earlier years without changing the overall record total',()=>{
 const result=yearlySummary([{year:2009},{year:2016},{year:2026}],2016);
 assert.equal(result.years[0].year,2016);assert.equal(result.total,3);assert.equal(result.years.reduce((s,r)=>s+r.count,0),2);
});
