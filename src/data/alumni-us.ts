/** Member affiliations remain in the member records; these entries add city-level map locations. */
export const alumniUs = [
 {member:'jaehee-chun',logo:'/images/institutions/ucdavis.png',institution:'UC Davis Health',short:'UC Davis',city:'Sacramento',state:'California',lon:-121.49,lat:38.58,pinX:90,pinY:190,labelX:145,labelY:135,source:'https://health.ucdavis.edu/radiation-oncology/about/contact'},
 {member:'byong-su-choi',logo:'/images/institutions/mayo.png',institution:'Mayo Clinic Florida',short:'Mayo Clinic',city:'Jacksonville',state:'Florida',lon:-81.66,lat:30.33,pinX:820,pinY:350,labelX:730,labelY:420,source:'https://www.mayoclinic.org/about-mayo-clinic/contact'},
 {member:'min-seo-choi',logo:'/images/institutions/msk.svg',institution:'Memorial Sloan Kettering Cancer Center',short:'MSKCC',city:'New York',state:'New York',lon:-73.96,lat:40.76,pinX:865,pinY:130,labelX:800,labelY:55,source:'https://www.mskcc.org/locations/directory/memorial-hospital'},
 {member:'donghyeok-choi',logo:'/images/institutions/washu.png',institution:'Washington University School of Medicine in St. Louis',short:'WashU Medicine',city:'St. Louis',state:'Missouri',lon:-90.2,lat:38.63,pinX:540,pinY:140,labelX:470,labelY:75,source:'https://radonc.wustl.edu/about/contact-us/'},
 {member:'juyoung-lee',logo:'/images/institutions/emory.svg',institution:'Emory University',short:'Emory',city:'Atlanta',state:'Georgia',lon:-84.39,lat:33.75,pinX:610,pinY:300,labelX:470,labelY:295,source:'https://med.emory.edu/departments/radiation-oncology/about-us/index.html'},
];
export const usPoint=(lon:number,lat:number)=>({x:(lon+127)*15.5,y:(51-lat)*15.5});
