import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {page} from './helpers.mjs';
const d=JSON.parse(readFileSync(new URL('../../src/data/archive-analytics.json',import.meta.url),'utf8'));
test('funding totals reconcile across years, investigators and sources',()=>{
 const f=d.funding;
 assert.equal(f.byYear.reduce((s,r)=>s+r.tot,0),f.tot.a);
 assert.equal(f.pis.reduce((s,r)=>s+r.a,0),f.tot.a);
 assert.equal(Object.values(f.tot.cat).reduce((s,r)=>s+r.a,0),f.tot.a);
 assert.equal(f.byYear.reduce((s,r)=>s+r.new,0),f.tot.u);
 for(const r of f.byYear)assert.equal(r['정부']+r['민간']+r['교내'],r.tot);
});
test('citation snapshot keeps career metrics separate from post-2016 works',()=>{
 const p=d.publications;
 assert.equal(p.schYear.reduce((s,r)=>s+r.c,0),p.tot.cit16);
 assert.equal(p.schYear.reduce((s,r)=>s+r.n,0),p.tot.sw16);
 assert.ok(p.tot.cit>p.tot.cit16);
 for(const prefix of ['', 'en/']){
  const $=page(prefix+'publication/papers');
  assert.equal($('.journal-performance-table tbody tr').length,20);
  assert.ok($('#citation-performance').text().includes(d.citation_as_of));
  assert.equal($('.citation-top>li').length,15);
 }
});
test('timeline includes the current roster and corrected join dates in both languages',()=>{
 for(const prefix of ['', 'en/']){
  const $=page(prefix+'people/timeline');
  assert.equal($('[data-timeline-member]').length,56);
  assert.equal($('[data-timeline-role=student]').length,22);
  assert.equal($('[data-timeline-role=alumni]').length,13);
  assert.equal($('[data-timeline-role=professor]').length,0);
  assert.equal($('[data-timeline-member=ye-in-park][data-timeline-role=alumni]').length,1);
  assert.match($('[data-timeline-member=wonhyeong-lee] .member-timeline-period').text(),/2025\.01/);
  assert.match($('[data-timeline-member=jaehwan-lee] .member-timeline-period').text(),/2026\.03/);
 }
});

test('requested summary details, timeline display and removed guidance are reflected in both languages',()=>{
 for(const prefix of ['', 'en/']){
  const home=page(prefix);
  assert.match(home('.figure-secondary').first().text(),/22/);
  assert.match(home('.figure-secondary').last().text(),/508\.5/);
  const timeline=page(prefix+'people/timeline');
  assert.equal(timeline('.is-estimated,.timeline-estimate-key').length,0);
  assert.equal(timeline('.member-timeline-bar').text().trim(),'');
  for(const row of timeline('.member-timeline-period').toArray())assert.match(timeline(row).text(),/^\d{4}\.\d{2}/);
  assert.equal(page(prefix+'publication/papers')('.edition-return').length,0);
  assert.equal(page(prefix+'projects')('.analytics-source').length,0);
  assert.ok(page(prefix+'people/students')('[data-member=jaehwan-lee] img').length || page(prefix+'people/jaehwan-lee')('img.member-portrait').length);
 }
});
