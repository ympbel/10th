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
  assert.ok(home('.figure-secondary').last().text().includes(d.publications.tot.ifsum.toFixed(1)));
  const timeline=page(prefix+'people/timeline');
  assert.equal(timeline('.is-estimated,.timeline-estimate-key').length,0);
  assert.equal(timeline('.member-timeline-bar').text().trim(),'');
  for(const row of timeline('.member-timeline-period').toArray())assert.match(timeline(row).text(),/^\d{4}\.\d{2}/);
  assert.equal(page(prefix+'publication/papers')('.edition-return').length,0);
  assert.equal(page(prefix+'projects')('.analytics-source').length,0);
  assert.ok(page(prefix+'people/students')('[data-member=jaehwan-lee] img').length || page(prefix+'people/jaehwan-lee')('img.member-portrait').length);
 }
});

test('funding edition separates the laboratory totals from the 16 principal-investigator projects',()=>{
 const k=d.funding.k,total=k.projects.reduce((s,p)=>s+p.a,0);
 assert.equal(k.projects.length,16);
 assert.equal(k.byYear.reduce((s,r)=>s+r.a,0),total);
 assert.equal(k.field.reduce((s,r)=>s+r.a,0),total);
 assert.equal(k.min.reduce((s,r)=>s+r.a,0),total);
 assert.equal(k.projects.reduce((s,p)=>s+p.n,0),33);
 for(const prefix of ['','en/']){
  const $=page(prefix+'projects');
  assert.equal($('.funding-edition .analytics-jumps a').length,5);
  assert.equal($('[data-funding-year]').length,11);
  assert.equal($('[data-principal-year]').length,11);
  assert.equal($('.funding-project-register tbody tr').length,16);
  assert.equal($('.funding-gantt-row').length,16);
  assert.equal($('.funding-cumulative').length,1);
  assert.equal($('.funding-pis').length,0);
  assert.equal($('.legacy-project-records[open]').length,0);
  for(const [i,p] of k.projects.entries()){
   const row=$('#funding-project-'+i);
   assert.ok(row.text().includes(p.nm));
   assert.ok(row.text().includes(p.a.toLocaleString('en-US')));
   assert.equal($(`.funding-gantt-row a[href="#funding-project-${i}"]`).length,1);
  }
 }
});

test('home member timeline sits below the eleven-year title and before research metric controls',()=>{
 for(const prefix of ['','en/']){
  const $=page(prefix),history=$('#history');
  const children=history.children().toArray();
  const titleAt=children.indexOf(history.find('.timeline-head')[0]);
  const membersAt=children.indexOf(history.find('.home-member-timeline')[0]);
  const controlsAt=children.indexOf(history.find('.timeline-series')[0]);
  assert.ok(titleAt<membersAt && membersAt<controlsAt);
  assert.equal($('.home-member-timeline[open]').length,1);
  assert.equal($('.home-member-timeline [data-timeline-member]').length,56);
  assert.equal($('.home-member-timeline [data-member-filter]').length,4);
 }
});

test('latest roster, new alumni letters, funding explanation and default expanded timeline are present',()=>{
 for(const prefix of ['','en/']){
  const faculty=page(prefix+'people/faculty');
  assert.equal(faculty('.faculty-profile').length,10);
  assert.equal(faculty('[data-member=member-69]').length,0);
  const voices=page(prefix+'archive/comments');
  for(const name of ['천재희','최병수','박인경','백승협'])assert.ok(voices('#voices-alumni').text().includes(name));
  assert.equal(voices('#voices-alumni .voice-letter').length,13);
  assert.equal(page(prefix)('.home-member-timeline[open]').length,1);
  assert.ok(page(prefix+'projects')('.funding-context').text().includes('공동으로 함께 연구한 의학물리 교수님들의 총 연구비 정보입니다.'));
 }
});
