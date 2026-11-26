import {test} from 'node:test';
import assert from 'node:assert/strict';
import {page,entries,scalar} from './helpers.mjs';
const awards=entries('awards'),presentations=entries('presentations');
const patents=entries('patents').filter(e=>scalar(e.fm,'kind')!=='copyright' && !['확인 필요','출원 준비','거절'].includes(scalar(e.fm,'status')));
for(const prefix of ['','en/'])for(const [kind,path,records] of [['awards','awards',awards],['presentations','publication/presentations',presentations],['patents','publication/patents',patents]]){
 test(`${prefix||'ko/'}${kind}: annual graph matches the displayed records and links to existing year sections`,()=>{
  const $=page(prefix+path),summary=$('[data-summary-kind='+kind+']');
  assert.equal(Number(summary.find('[data-summary-total]').text()),records.length);
  let total=0;
  summary.find('[data-summary-year]').each((i,node)=>{
   const year=Number($(node).attr('data-summary-year')),count=Number($(node).attr('data-summary-count'));
   assert.equal(count,records.filter(e=>Number(scalar(e.fm,'year'))===year).length);total+=count;
  });
  assert.equal(total,records.filter(e=>Number(scalar(e.fm,'year'))>=2016).length);
  assert.equal(Number(summary.find('[data-summary-year]').first().attr('data-summary-year')),2016);
  assert.equal(summary.find('.analytics-stats dd').length,1);
  summary.find('a[href^="#y"]').each((i,node)=>assert.equal($($(node).attr('href')).length,1));
 });
}
