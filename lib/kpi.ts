import type {Post} from './marketing';
export function teamKpi(posts:Post[],name:string,week:string){
 const start=new Date(week+'T12:00:00Z');const end=new Date(start);end.setUTCDate(end.getUTCDate()+6);
 const assigned=posts.filter(p=>p.owners.includes(name)&&p.date>=week&&p.date<=end.toISOString().slice(0,10));
 const done=assigned.filter(p=>p.status==='Published').length;
 const weekly=assigned.length?done/assigned.length*100:0;
 return {assigned:assigned.length,done,weekly};
}
