export function accountName(username:string,names:string[]=[]){return names.find(name=>name.toLowerCase()===username.toLowerCase())??username;}
export function entryIdentity(current:{owners:string[];createdBy?:string|null;createdAt?:string|null;publishedAt?:string|null;completedAt?:string|null}|undefined,userId:string,name:string,status:string,done:boolean,now:string){
 return {owners:current?.owners??[name],createdBy:current?.createdBy??(current?null:userId),createdAt:current?.createdAt??now,publishedAt:current?.publishedAt??(status==='Published'?now:null),completedAt:current?.completedAt??(done?now:null)};
}
export function manilaTimestamp(value?:string|null){return value?new Date(value).toLocaleString('en-US',{timeZone:'Asia/Manila',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}):'';}
export function manilaDate(now=new Date()){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const value=(type:string)=>parts.find(part=>part.type===type)?.value??'';return `${value('year')}-${value('month')}-${value('day')}`;}
export function clockTime(value:string){return new Date(`2000-01-01T${value.slice(0,5)}:00`).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});}
