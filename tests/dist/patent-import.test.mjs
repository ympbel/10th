import {test} from 'node:test';
import assert from 'node:assert/strict';
import {entries,scalar,page} from './helpers.mjs';
const records=entries('patents');
const patents=records.filter(p=>scalar(p.fm,'kind')!=='copyright' && !['확인 필요','출원 준비','거절'].includes(scalar(p.fm,'status')));
test('imported patent identifiers are unique and private operational fields stay out of published records',()=>{
 for(const key of ['application_number','registration_number']){
  const ids=records.map(p=>scalar(p.fm,key)).filter(Boolean).map(v=>v.replace(/[^A-Z0-9]/gi,''));
  assert.equal(new Set(ids).size,ids.length,key);
 }
 for(const p of records){
  assert.doesNotMatch(p.fm,/Y0113419|개인번호|입금완료|지분|IRIS\s*\d+%|기술이전 필요없음/);
  assert.notEqual(scalar(p.fm,'application_number'),'10-2023-0000000');
 }
});
test('patent and copyright totals stay separated in both languages',()=>{
 for(const prefix of ['','en/']){
  const $=page(prefix+'publication/patents');
  assert.equal($('.patent-main .pub-item').length,patents.length);
  assert.equal($('.patent-related .pub-item').length,records.filter(p=>scalar(p.fm,'kind')==='copyright').length);
  assert.equal($('[data-summary-kind=patents] [data-summary-total]').text(),String(patents.length));
  const ids=$('[id]').map((_,e)=>$(e).attr('id')).get();
  assert.equal(new Set(ids).size,ids.length,'unique year anchors');
 }
});
