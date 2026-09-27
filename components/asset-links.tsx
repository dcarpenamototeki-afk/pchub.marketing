"use client";
import {driveFile} from '../lib/assets';
export function AssetLinks({url,kind,label,preview=false}:{url?:string;kind?:string;label:string;preview?:boolean}) {
 const file=url?driveFile(url):null;
 if(!url||!file)return null;
 return <section className="asset-links" aria-label={label}><a className="textlink" href={url} target="_blank" rel="noopener noreferrer">Open {label} in Google Drive ↗</a>{preview&&<><iframe src={file.preview} title={`${label} ${kind==='video'?'video':'image'} preview`} loading="lazy" referrerPolicy="no-referrer" allow="fullscreen" allowFullScreen/><small>Preview unavailable? Open the file in Google Drive using an account with access.</small></>}<a className="asset-download" href={file.download} target="_blank" rel="noopener noreferrer">Download {label} ↓</a></section>;
}
