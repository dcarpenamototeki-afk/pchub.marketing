"use client";
import {driveFile} from '../lib/assets';
export function AssetLinks({url,kind,label,preview=false}:{url?:string;kind?:string;label:string;preview?:boolean}) {
 const file=url?driveFile(url):null;
 if(!url||!file)return null;
 return <div className="asset-links"><a className="textlink" href={url} target="_blank" rel="noopener noreferrer">Open {label} ↗</a>{kind==='video'&&<a className="textlink" href={file.download} target="_blank" rel="noopener noreferrer">Download video ↓</a>}{preview&&kind==='image'&&<details><summary>Preview {label}</summary><iframe src={file.preview} title={`${label} preview`} loading="lazy" referrerPolicy="no-referrer" allowFullScreen/><small>If preview is unavailable, use Open {label} and sign in to Google Drive.</small></details>}</div>;
}
