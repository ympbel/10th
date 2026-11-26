/** Count the same records shown by a board, retaining empty years in its chart. */
export function yearlySummary(records:Array<{year:number}>, startYear?:number){
 const recorded=records.map(r=>r.year);
 const from=startYear ?? (recorded.length?Math.min(...recorded):new Date().getFullYear());
 const to=recorded.length?Math.max(from,...recorded):from;
 const counts=new Map<number,number>();
 for(const {year} of records)counts.set(year,(counts.get(year) ?? 0)+1);
 let cumulative=0;
 const years=Array.from({length:to-from+1},(_,i)=>{const year=from+i,count=counts.get(year) ?? 0;return {year,count,cumulative:cumulative+=count};});
 const peak=Math.max(0,...years.map(y=>y.count));
 return {years,total:records.length,latest:years.at(-1)!,peak,peakYears:years.filter(y=>y.count===peak && peak>0).map(y=>y.year),activeYears:counts.size};
}
