import {accountName,daysBefore,entryIdentity,manilaDate} from '../../../lib/entry-details';
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseUser, supabaseRest } from "../../../lib/supabase";
import { validatePost } from "../../../lib/marketing";

import {postFields as fields,postToRow,normalizePost} from '../../../lib/post-storage';
import type {Post} from '../../../lib/marketing';

async function requireUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: NextResponse.json({ error: "Login required." }, { status: 401 }) };
  const user = await getSupabaseUser(token);
  if (!user) return { error: NextResponse.json({ error: "Invalid login session." }, { status: 401 }) };
  const profileResponse = await supabaseRest(`profiles?id=eq.${user.id}&select=approval_status,role,username`);
  const [profile] = await profileResponse.json().catch(() => []) as Array<{ approval_status: string; role: string; username: string }>;
  if (!profile || profile.approval_status !== "approved") return { error: NextResponse.json({ error: "This account is waiting for admin approval." }, { status: 403 }) };
  return { user, profile };
}

async function jsonError(response: Response) {
  const body = await response.json().catch(() => ({})) as { message?: string; hint?: string };
  return NextResponse.json({ error: body.message ?? body.hint ?? "Supabase request failed." }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  let selectedFields = fields, mediaPending = false, delayPending = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    const posts = await supabaseRest(`marketing_posts?select=${encodeURIComponent(selectedFields)}&order=date.asc`);
    if (posts.ok) {
      const rows = (await posts.json()) as Post[];
      return NextResponse.json(rows.map(post => normalizePost({ ...post, ...(mediaPending ? { imageTwoUrl: "" } : {}), ...(delayPending ? { delayReason: undefined } : {}) })), { headers: { "X-PC-Hub-Calendar": "2", ...(mediaPending ? { "X-PC-Hub-Media-Migration": "pending" } : {}), ...(delayPending ? { "X-PC-Hub-Delay-Migration": "pending" } : {}) } });
    }
    const body = await posts.json().catch(() => ({})) as { message?: string };
    if (body.message?.includes("image_two_url") && !mediaPending) { selectedFields = selectedFields.replace(",imageTwoUrl:image_two_url", ""); mediaPending = true; continue; }
    if (body.message?.includes("delay_reason") && !delayPending) { selectedFields = selectedFields.replace(",delayReason:delay_reason", ""); delayPending = true; continue; }
    return NextResponse.json({ error: body.message ?? "Unable to load entries." }, { status: 500 });
  }
  return NextResponse.json({ error: "Unable to load entries." }, { status: 500 });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  let post;
  try {
    let raw=await request.json() as Record<string, unknown>;
    if(typeof raw?.id!=='string'||!raw.id||raw.id.length>100)return NextResponse.json({error:'Invalid entry id.'},{status:400});
    const existing=await supabaseRest(`marketing_posts?id=eq.${encodeURIComponent(raw.id)}&select=${encodeURIComponent(fields)}`);
    if(!existing.ok)return jsonError(existing);
    const [current]=await existing.json() as Post[];
    if(auth.profile.role!=='admin'){
      const today=manilaDate();
      if(!current&&(typeof raw.date!=='string'||raw.date<today))return NextResponse.json({error:'Staff cannot add entries for past Manila dates.'},{status:403});
      if(current){
        if(current.date>today)return NextResponse.json({error:'This entry cannot be marked Done before its posting date.'},{status:403});
        if(!raw.completedAt||current.completedAt)return NextResponse.json({error:'Only an admin can edit an existing entry.'},{status:403});
        if(current.date<=daysBefore(today,2)&&(!raw.delayReason||typeof raw.delayReason!=='string'||!raw.delayReason.trim()))return NextResponse.json({error:'Enter the Reason of Delay before completing a post from two or more days ago.'},{status:400});
        raw={...current,url:raw.url,status:raw.status,completedAt:raw.completedAt,delayReason:raw.delayReason};
      }
    }
    const team=await supabaseRest('team_members?active=eq.true&select=name');
    if(!team.ok)return jsonError(team);
    const names=(await team.json() as {name:string}[]).map(row=>row.name);
    const name=accountName(auth.profile.username,names);
    if(raw.completedAt&&!current?.completedAt&&(raw.status!=='Published'||typeof raw.url!=='string'||!raw.url.trim()))return NextResponse.json({error:'Add the published post link to mark this entry Done.'},{status:400});
    const identity=entryIdentity(current,auth.user.id,name,String(raw.status),Boolean(raw.completedAt),new Date().toISOString());
    post=validatePost({...raw,...identity});
  } catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Invalid entry.'},{status:400});}
  const saved = await supabaseRest(`marketing_posts?on_conflict=id&select=${encodeURIComponent(fields)}`, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(postToRow(post)) });
  if (!saved.ok) return jsonError(saved);
  const [data] = await saved.json() as Post[];
  return NextResponse.json(normalizePost(data));
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  if (auth.profile.role !== "admin") return NextResponse.json({ error: "Only admins can delete posts." }, { status: 403 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Post id is required." }, { status: 400 });
  const removed = await supabaseRest(`marketing_posts?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
  if (!removed.ok) return jsonError(removed);
  return NextResponse.json({ ok: true });
}
