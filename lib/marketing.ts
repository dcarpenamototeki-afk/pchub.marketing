export type Post = { id:string; title:string; contentType:string; platform:string; format:string; owners:string[]; date:string; postedTime:string; status:string; url:string; views:number|null; likes:number|null; comments:number|null; shares:number|null };
export const staff=['Ella','Reg','Elijah'];
export const statuses=['Planned','In progress','For review','Published'];
export const contentTypes=['Entertainment','Product showcase','Educational','Community','Promotion','Other'];
export function seedPosts():Post[] {
 const main=[['POV / Entertainment','Ella','Trivia','Reg'],['POV / Meme','Reg','Trivia','Ella'],['Trivia','Reg','POV / Meme','Elijah'],['Trivia','Elijah','POV / Meme','Reg'],['Trivia','Ella','POV / Entertainment','Elijah'],['Trivia','Elijah','POV / Entertainment','Ella'],['Product entertainment','Team']];
 const reels=[['Product showcase','Team','Trivia','Reg'],['Product showcase','Team','Trivia','Ella'],['Trivia','Reg','Product showcase','Team'],['Trivia','Elijah','Product showcase','Team'],['Trivia','Ella','Product showcase','Team'],['Product showcase','Team','Trivia','Elijah'],['Product showcase','Team','Trivia','Team']];
 const statics=[['Static content','Ella,Reg'],['Static content','Team'],['Static content','Reg,Elijah'],['Static content','Team'],['Static content','Elijah,Ella'],['Static content','Team'],['Product showcase','Team'],['Static content','Team']];
 const out:Post[]=[];
 const add=(title:string,owner:string,day:number,platform:string,format:string)=>out.push({id:'plan-'+out.length,title,contentType:title.toLowerCase().includes('product')?'Product showcase':title.toLowerCase().includes('trivia')?'Educational':'Entertainment',platform,format,owners:owner==='Team'?[...staff]:owner.split(','),date:'2026-09-'+(21+day),postedTime:'',status:'Planned',url:'',views:null,likes:null,comments:null,shares:null});
 main.forEach((a,d)=>{for(let i=0;i<a.length;i+=2)add(a[i],a[i+1],d,'TikTok','Main output')});
 reels.forEach((a,d)=>{for(let i=0;i<a.length;i+=2)add(a[i],a[i+1],d,'Facebook','Reel')});
 statics.forEach((a,d)=>add(a[0],a[1],Math.min(d,6),'Facebook','Static'));
 return out;
}
export function validatePost(raw:unknown):Post {
 if(!raw || typeof raw!=='object')throw Error('Invalid post');
 const p=raw as Post;
 if(typeof p.id!=='string'||!p.id||p.id.length>100||typeof p.title!=='string'||!p.title.trim()||p.title.length>200)throw Error('Enter a title (up to 200 characters).');
 if(!['Facebook','TikTok'].includes(p.platform)||!['Main output','Reel','Static'].includes(p.format)||!statuses.includes(p.status)||!contentTypes.includes(p.contentType))throw Error('Choose a valid platform, content type, format and status.');
 if(!Array.isArray(p.owners)||!p.owners.length||p.owners.some(x=>typeof x!=='string'||!x.trim()))throw Error('Assign at least one team member.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||Number.isNaN(Date.parse(p.date))||new Date(p.date).toISOString().slice(0,10)!==p.date)throw Error('Choose a valid date.');
 if(typeof p.postedTime!=='string'||(p.postedTime&&!/^\d{2}:\d{2}$/.test(p.postedTime)))throw Error('Choose a valid posting time.');
 if(typeof p.url!=='string'||p.url.length>2048)throw Error('Invalid post link.');
 if(p.url){const u=new URL(p.url);const hosts=p.platform==='Facebook'?['facebook.com','www.facebook.com','m.facebook.com','fb.watch']:['tiktok.com','www.tiktok.com','vm.tiktok.com','vt.tiktok.com'];if(u.protocol!=='https:'||!hosts.includes(u.hostname))throw Error('Use an HTTPS link from the selected platform.');}
 if(p.status==='Published'&&!p.url)throw Error('Add the published post link first.');
 for(const key of ['views','likes','comments','shares'] as const)if(p[key]!==null&&(!Number.isSafeInteger(p[key])||(p[key] as number)<0))throw Error('Metrics must be non-negative whole numbers.');
 return {...p,title:p.title.trim(),owners:[...new Set(p.owners)]};
}

