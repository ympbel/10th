/** Sample without replacement. Avoid showing the exact same trio on consecutive visits. */
export function samplePortraits<T>(items:T[], count=3, random:()=>number=Math.random, previous:T[]=[]):T[] {
 const shuffled=[...items];
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const selected=shuffled.slice(0,count);
 if(items.length>count && selected.length===previous.length && selected.every(item=>previous.includes(item))){const replacement=shuffled.find(item=>!selected.includes(item));if(replacement!==undefined)selected[selected.length-1]=replacement;}
 return selected;
}
