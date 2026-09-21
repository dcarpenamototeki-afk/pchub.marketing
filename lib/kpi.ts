import type {Post} from './marketing';
export function teamKpi(posts:Post[],name:string,week:string){
 const start=new Date(week+'T12:00:00Z');const end=new Date(start);end.setUTCDate(end.getUTCDate()+6);
 const assigned=posts.filter(p=>p.owners.includes(name)&&p.date>=week&&p.date<=end.toISOString().slice(0,10));
 const done=assigned.filter(p=>p.status==='Published').length;
 const weekly=assigned.length?done/assigned.length*100:0;
 const month=week.slice(0,7);
 const buckets=new Map<string,Post[]>();
 posts.filter(p=>p.owners.includes(name)).forEach(p=>{const d=new Date(p.date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));const monday=d.toISOString().slice(0,10);if(monday.slice(0,7)!==month)return;buckets.set(monday,[...(buckets.get(monday)??[]),p])});
 const monthly=Math.min(100,[...buckets.values()].reduce((s,rows)=>s+rows.filter(p=>p.status==='Published').length/rows.length*25,0));
 return {assigned:assigned.length,done,weekly,monthly,contribution:weekly*.25};
}
