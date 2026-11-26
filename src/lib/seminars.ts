/** A seminar record is one presentation; multiple records on a day form one seminar day. */
export type SeminarRecord = { date:string; event_date?:string; presenter?:string; title?:string; seminar_type?:'trend'|'research' };
export const seminarDay = (record:SeminarRecord) => record.event_date ?? record.date;
export const seminarDays = (records:SeminarRecord[]) => new Set(records.map(seminarDay)).size;

/** Joint presenters each receive one participation; unnamed groups stay out of individual rankings. */
export function presenterRanking(records:SeminarRecord[], aliases:Map<string,string>=new Map()) {
 const normalize=(name:string)=>name.toLowerCase().replace(/[^a-z가-힣]/g,'');
 const totals=new Map<string,number>();
 for(const record of records){
  if(!record.presenter || /참석 학생|연구실 내/.test(record.presenter))continue;
  const names=new Set(record.presenter.split(/[,/、]/).map(name=>name.replace(/[\[(].*$/,'').trim()).filter(Boolean).map(name=>aliases.get(normalize(name)) ?? name));
  for(const name of names)totals.set(name,(totals.get(name) ?? 0)+1);
 }
 return [...totals].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count || a.name.localeCompare(b.name,'ko'));
}

/** Reviews/discussions belong to Trend; research updates, invited talks and rehearsals to Research. */
export function seminarType(record:SeminarRecord): 'trend'|'research' {
 if(/(?:연구\s*)?main\s*ref(?:erence)?/i.test(record.title ?? ''))return 'trend';
 if(record.seminar_type)return record.seminar_type;
 const title=record.title ?? '';
 if(/\[\s*(?:Research\s*Seminar|LAB)\s*\]/i.test(title))return 'research';
 return /trend|seminal|abstract|journal club|know.how|parallel|editorial|트렌드|기업 리뷰|병원 리뷰|학회 리뷰/i.test(title)?'trend':'research';
}
