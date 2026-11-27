import type { CollectionEntry } from 'astro:content';
type Member = CollectionEntry<'members'>;
type Comment = CollectionEntry<'comments'>;
export function alumniDegreeGroup(member: Member) {
 const degree = [member.data.degree?.type,member.data.degree?.type_en].join(' ');
 return /박사|doctor|ph\.?\s*d/i.test(degree) ? 'doctoral' : /석사|master|m\.?sc/i.test(degree) ? 'masters' : 'unclassified';
}
/** Mirrors the alumni page: degree groups, then the sheet roster order within each group. */
export function compareAlumni(a: Member,b: Member) {
 const rank={doctoral:0,masters:1,unclassified:2};
 return rank[alumniDegreeGroup(a)]-rank[alumniDegreeGroup(b)] || (a.data.order ?? 999)-(b.data.order ?? 999) || (b.data.degree?.date ?? '').localeCompare(a.data.degree?.date ?? '') || a.id.localeCompare(b.id);
}
export function voiceGroups(comments: Comment[],members: Member[]) {
 const normalize=(name:string)=>name.replace(/\s/g,'');
 const rows=comments.filter(c=>c.data.name!=='김진성').map(c=>({...c,member:members.find(m=>normalize(m.data.name)===normalize(c.data.name))}));
 return [
  {key:'faculty',ko:'교수진 코멘트',en:'Faculty voices',rows:rows.filter(c=>c.data.group!=='editor' && c.member?.data.role==='professor').sort((a,b)=>(a.member!.data.order ?? 999)-(b.member!.data.order ?? 999))},
  {key:'alumni',ko:'졸업생 코멘트',en:'Alumni voices',rows:rows.filter(c=>c.data.group!=='editor' && c.member?.data.role==='alumni').sort((a,b)=>compareAlumni(a.member!,b.member!))},
  {key:'editors',ko:'10주년을 준비하며',en:'Preparing for our 10th anniversary',rows:rows.filter(c=>c.data.group==='editor').sort((a,b)=>['박예인','윤용도','석재현'].indexOf(a.data.name)-['박예인','윤용도','석재현'].indexOf(b.data.name))},
 ];
}
