import test from 'node:test';
import assert from 'node:assert/strict';
import { page } from './helpers.mjs';
const text = el=>el.text().replace(/\s+/g,' ').trim();
for(const prefix of ['', 'en/']) {
 test(`${prefix || 'ko/'}: comments follow the faculty and alumni page rosters`,()=>{
  const $=page(prefix+'archive/comments');
  for(const [key,path,selector] of [['faculty','people/faculty','.faculty-profile h2'],['alumni','people/alumni','.alumni-gallery--graduates .alumni-name-row']]) {
   const rosterPage=page(prefix+path);
   // Korean source names are preserved in the letters even on the English page.
   const koRoster=page(path);
   const roster=koRoster(selector).map((_,el)=>text(koRoster(el))).get();
   const actual=$(`#voices-${key} .comment-name`).map((_,el)=>text($(el))).get();
   assert.deepEqual(actual,roster.filter(name=>actual.includes(name)));
   assert.equal($(`#voices-${key} article.comment`).length,key==='faculty'?7:13);
   assert.ok(rosterPage(selector).length);
  }
  assert.equal($('.comment').length,23);
  assert.equal($('#voices-editors .comment').length,3);
  assert.equal(new Set($('.comment').map((_,el)=>$(el).attr('id')).get()).size,23);
 });
 test(`${prefix || 'ko/'}: student cards omit undergraduate majors and show updated programs`,()=>{
  const $=page(prefix+'people/students');
  const expected={'younghun-yoon':'통합 (박사)','chanwoong-lee':'통합 (박사)','jeongheon-kim':'통합 (박사)','dongho-lee':'통합 (박사)','sac-lee':'통합 (박사)','gahee-son':'박사','hyejin-lee':'석사','geumbong-ji':'통합 (석사)','dongyoon-lee':'통합 (석사)','seungbin-choi':'인턴','wonhyeong-lee':'통합 (박사)'};
  for(const [id,program] of Object.entries(expected))assert.ok(text($(`[data-member="${id}"]`)).includes(program),id);
  assert.ok(!text($('.member-list')).includes('컴퓨터소프트웨어학'));
  assert.ok(!text($('.member-list')).includes('원자력공학'));
 });
}

test('comment portraits preserve original proportions without square padding',()=>{
 const $=page('archive/comments');
 const portraits=$('.voice-person img');
 assert.ok(portraits.length>0);
 assert.ok(portraits.toArray().some(el=>Number($(el).attr('height'))>Number($(el).attr('width'))));
 for(const el of portraits.toArray()){
  assert.equal(Number($(el).attr('width')),160);
  assert.ok(Number($(el).attr('height'))>0);
 }
});
