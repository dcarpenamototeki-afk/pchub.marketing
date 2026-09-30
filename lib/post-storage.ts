import type {Post} from './marketing';
export const postFields='id,title,contentType:content_type,platform,format,owners,date,postedTime:posted_time,status,url,views,likes,comments,shares,assetUrl:asset_url,assetType:asset_type,coverUrl:cover_url,imageTwoUrl:image_two_url,delayReason:delay_reason,completedAt:completed_at,caption,createdBy:created_by,createdAt:created_at,publishedAt:published_at';
export function postToRow(p:Post) {
 return {caption:p.caption??'',created_by:p.createdBy??null,...(p.createdAt?{created_at:p.createdAt}:{}),published_at:p.publishedAt??null,id:p.id,title:p.title,content_type:p.contentType,platform:p.platform,format:p.format,owners:p.owners,date:p.date,posted_time:p.postedTime||null,status:p.status,url:p.url,views:p.views,likes:p.likes,comments:p.comments,shares:p.shares,asset_url:p.assetUrl??'',asset_type:p.assetType??'video',cover_url:p.coverUrl??'',image_two_url:p.imageTwoUrl??'',...(p.delayReason?{delay_reason:p.delayReason}:{}),completed_at:p.completedAt??null};
}
export function normalizePost(p:Post):Post {return {...p,postedTime:p.postedTime?.slice(0,5)??''};}
