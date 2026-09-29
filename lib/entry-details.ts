const compact=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]/g,'');
export function staffNameMatches(owner:string,name:string){const left=compact(owner),right=compact(name);return left===right||(right.length>=3&&left.startsWith(right));}
export function accountName(username:string,names:string[]=[]){return names.find(name=>staffNameMatches(username,name))??username;}
export function entryIdentity(current:{owners:string[];createdBy?:string|null;createdAt?:string|null;publishedAt?:string|null;completedAt?:string|null}|undefined,userId:string,name:string,status:string,done:boolean,now:string){
 return {owners:current?.owners??[name],createdBy:current?.createdBy??(current?null:userId),createdAt:current?.createdAt??now,publishedAt:current?.publishedAt??(status==='Published'?now:null),completedAt:current?.completedAt??(done?now:null)};
}
export function manilaTimestamp(value?:string|null){return value?new Date(value).toLocaleString('en-US',{timeZone:'Asia/Manila',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}):'';}
export function manilaDate(now=new Date()){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const value=(type:string)=>parts.find(part=>part.type===type)?.value??'';return `${value('year')}-${value('month')}-${value('day')}`;}
export function mondayOfWeek(date:string){const value=new Date(`${date}T12:00:00Z`);value.setUTCDate(value.getUTCDate()-((value.getUTCDay()+6)%7));return value.toISOString().slice(0,10);}
export function clockTime(value:string){return new Date(`2000-01-01T${value.slice(0,5)}:00`).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});}
