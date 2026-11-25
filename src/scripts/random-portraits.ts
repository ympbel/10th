import { samplePortraits } from '../lib/random-portraits.ts';
export function refreshPortraits(root:HTMLElement) {
 const template=root.nextElementSibling;
 if(!(template instanceof HTMLTemplateElement))return;
 const images=[...template.content.querySelectorAll<HTMLImageElement>('img[data-person]')];
 const key='mpbel-portraits-'+root.dataset.randomPortraits;
 let previous:string[]=[];try{previous=JSON.parse(sessionStorage.getItem(key) ?? '[]');}catch{}
 const ids=samplePortraits(images.map(image=>image.dataset.person!),3,Math.random,previous);
 const selected=ids.map(id=>images.find(image=>image.dataset.person===id)!.cloneNode(true));
 root.replaceChildren(...selected);
 try{sessionStorage.setItem(key,JSON.stringify(ids));}catch{}
}
export function initRandomPortraits(){document.querySelectorAll<HTMLElement>('[data-random-portraits]').forEach(refreshPortraits);}
