import type {Post} from './marketing';
export const postFields='id,title,contentType:content_type,platform,format,owners,date,postedTime:posted_time,status,url,views,likes,comments,shares,assetUrl:asset_url,assetType:asset_type,coverUrl:cover_url,imageTwoUrl:image_two_url,delayReason:delay_reason,completedAt:completed_at,caption,createdBy:created_by,createdAt:created_at,publishedAt:published_at';
export function postToRow(p:Post) {
 return {caption:p.caption??'',created_by:p.createdBy??null,...(p.createdAt?{created_at:p.createdAt}:{}),published_at:p.publishedAt??null,id:p.id,title:p.title,content_type:p.contentType,platform:p.platform,format:p.format,owners:p.owners,date:p.date,posted_time:p.postedTime||null,status:p.status,url:p.url,views:p.views,likes:p.likes,comments:p.comments,shares:p.shares,asset_url:p.assetUrl??'',asset_type:p.assetType??'video',cover_url:p.coverUrl??'',image_two_url:p.imageTwoUrl??'',...(p.delayReason?{delay_reason:p.delayReason}:{}),completed_at:p.completedAt??null};
}
export function normalizePost(p:Post):Post {
 const value=typeof p.postedTime==='string'?p.postedTime.trim():'';
 const match=value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
 let postedTime='';
 if(match){let hour=Number(match[1]),minute=Number(match[2]);const period=match[3]?.toUpperCase();if(minute<60&&hour<=23){if(period){if(hour>=1&&hour<=12){hour=(hour%12)+(period==='PM'?12:0);postedTime=`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;}}else postedTime=`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;}}
 return {...p,postedTime};
}
