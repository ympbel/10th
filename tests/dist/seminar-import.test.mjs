import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {entries,scalar,page} from './helpers.mjs';
const input=JSON.parse(readFileSync(new URL('../../src/data/seminar-import.json',import.meta.url),'utf8'));
test('every spreadsheet presentation is imported once with its date, presenter and topic',()=>{
 const imported=entries('seminars').filter(e=>scalar(e.fm,'source_file')===input.source_file);
 assert.equal(imported.length,input.records.length);
 for(const r of input.records){
  assert.equal(imported.filter(e=>scalar(e.fm,'event_date')===r.date && scalar(e.fm,'presenter')===r.name && scalar(e.fm,'title')===r.topic).length,1,`${r.date}: ${r.name}`);
 }
 assert.equal(input.import.matched_existing+input.import.added,input.records.length);
});
test('seminar dashboard separates presentation records from seminar days and keeps mailbox links private',()=>{
 for(const prefix of ['','en/']){
  const $=page(prefix+'activity/seminars');
  assert.deepEqual($('.seminar-statistics .analytics-stats dd').map((i,e)=>Number($(e).text())).get(),[301,578]);
  assert.equal($('a[href*="mail.google.com"]').length,0);
  assert.equal($('.seminars-tbl tbody tr').length,578);
 }
});

test('seminar graph splits every presentation into Trend or Research and hides removed summaries',()=>{
 for(const prefix of ['','en/']){
  const $=page(prefix+'activity/seminars');
  const bars=$('[data-seminar-year]');
  assert.equal(bars.length,7);
  assert.equal(bars.toArray().reduce((sum,e)=>sum+Number($(e).attr('data-trend'))+Number($(e).attr('data-research')),0),578);
  assert.equal($('.seminar-presenter-ranking').length,0);
  assert.ok(!$('.seminar-statistics').text().includes('2024–2026 자료'));
  const home=page(prefix);
  const paths=home('.contents-chapter').map((i,e)=>home(e).attr('href')).get();
  const awards=paths.findIndex(p=>p.endsWith('/awards/'));
  assert.ok(paths[awards+1].endsWith('/projects/'));
  assert.ok(paths[awards+2].endsWith('/activity/seminars/'));
  assert.ok(paths[awards+3].endsWith('/archive/photos/'));
  assert.equal(home('.contents-chapter[href$="/people/timeline/"]').length,0);
  assert.equal(home('.contents-chapter').length,12);
  assert.equal(home('.drawer-more').length,0);
  assert.equal(page(prefix+'people/students')('.snb a[href$="/people/timeline/"]').length,1);
 }
});
