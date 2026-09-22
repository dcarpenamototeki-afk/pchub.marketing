import type {Post} from './marketing';
export function teamKpi(posts:Post[],name:string,week:string){
 const start=new Date(week+'T12:00:00Z');const end=new Date(start);end.setUTCDate(end.getUTCDate()+6);
 const assigned=posts.filter(p=>p.owners.includes(name)&&p.date>=week&&p.date<=end.toISOString().slice(0,10));
 const published=assigned.filter(p=>p.status==='Published');
 const dates=Array.from({length:7},(_,index)=>{const date=new Date(start);date.setUTCDate(date.getUTCDate()+index);return date.toISOString().slice(0,10)});
 const done=dates.reduce((total,date)=>{
  const daily=published.filter(post=>post.date===date);
  const facebook=daily.some(post=>post.platform==='Facebook'&&post.format!=='Static');
  const tiktok=daily.some(post=>post.platform==='TikTok'&&post.format!=='Static');
  const staticPost=daily.some(post=>post.format==='Static');
  return total+Number(facebook)+Number(tiktok)+Number(staticPost);
 },0);
 const requirements=21;
 const weekly=done/requirements*100;
 return {assigned:assigned.length,published:published.length,done,weekly,requirements};
}
