import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seminarDays,presenterRanking,seminarType} from '../../src/lib/seminars.ts';
test('seminar days use event dates, collapsing multiple presentations on a day',()=>{
 assert.equal(seminarDays([{date:'2024-12-30',event_date:'2024-08-05'},{date:'2024-08-05'},{date:'2024-08-12'}]),2);
});
test('joint presenters receive one participation each and aliases share a total',()=>{
 const rows=[{date:'2024-01-01',presenter:'김정헌, 이찬웅'},{date:'2024-01-01',presenter:'Jeong Heon Kim'},{date:'2024-01-01',presenter:'김정헌 / 김정헌'},{date:'2024-01-01',presenter:'연구실 내 AAPM 참석 학생'}];
 assert.deepEqual(presenterRanking(rows,new Map([['jeongheonkim','김정헌']])),[{name:'김정헌',count:3},{name:'이찬웅',count:1}]);
});

test('seminar types preserve archived labels and distinguish reviews from research',()=>{
 assert.equal(seminarType({date:'2026-01-01',title:'트렌드 세미나 — PMB'}),'trend');
 assert.equal(seminarType({date:'2026-01-01',title:'PET Image reconstruction',seminar_type:'trend'}),'trend');
 assert.equal(seminarType({date:'2026-01-01',title:'[Research Seminar] New study'}),'research');
 assert.equal(seminarType({date:'2026-01-01',title:'[Journal Club] New study'}),'trend');
 assert.equal(seminarType({date:'2026-01-01',title:'[Journal Club] SOTA research'}),'trend');
});

test('research Main Ref reviews are Trend even when previously tagged Research',()=>{
 for(const title of ['연구 Main Reference 리뷰 (세부 주제 미기재)','- 저널: 연구 Main Ref'])assert.equal(seminarType({date:'2026-01-01',title,seminar_type:'research'}),'trend');
});
