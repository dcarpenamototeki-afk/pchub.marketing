import type {Post} from './marketing';
export function teamKpi(posts:Post[],name:string,week:string){
 const start=new Date(week+'T12:00:00Z');const end=new Date(start);end.setUTCDate(end.getUTCDate()+6);
 const assigned=posts.filter(p=>p.owners.includes(name)&&p.date>=week&&p.date<=end.toISOString().slice(0,10));
 const published=assigned.filter(p=>p.status==='Published');
 const done=[published.some(p=>p.platform==='Facebook'),published.some(p=>p.platform==='TikTok'),published.some(p=>p.format==='Static')].filter(Boolean).length;
 const weekly=done/3*100;
 return {assigned:assigned.length,published:published.length,done,weekly,requirements:3};
}
