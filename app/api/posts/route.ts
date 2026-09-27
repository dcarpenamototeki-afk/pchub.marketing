import { NextRequest, NextResponse } from "next/server";
import { getSupabaseUser, supabaseRest } from "../../../lib/supabase";
import { seedPosts, validatePost } from "../../../lib/marketing";

import {postFields as fields,postToRow,normalizePost} from '../../../lib/post-storage';
import type {Post} from '../../../lib/marketing';

async function requireUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: NextResponse.json({ error: "Login required." }, { status: 401 }) };
  const user = await getSupabaseUser(token);
  if (!user) return { error: NextResponse.json({ error: "Invalid login session." }, { status: 401 }) };
  const profileResponse = await supabaseRest(`profiles?id=eq.${user.id}&select=approval_status,role`);
  const [profile] = await profileResponse.json().catch(() => []) as Array<{ approval_status: string; role: string }>;
  if (!profile || profile.approval_status !== "approved") return { error: NextResponse.json({ error: "This account is waiting for admin approval." }, { status: 403 }) };
  return { user, profile };
}

async function jsonError(response: Response) {
  const body = await response.json().catch(() => ({})) as { message?: string; hint?: string };
  return NextResponse.json({ error: body.message ?? body.hint ?? "Supabase request failed." }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  const seed = await supabaseRest("marketing_posts?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=minimal" }, body: JSON.stringify(seedPosts().map(postToRow)) });
  if (!seed.ok) return jsonError(seed);
  const posts = await supabaseRest(`marketing_posts?select=${encodeURIComponent(fields)}&order=date.asc`);
  if (!posts.ok) return jsonError(posts);
  return NextResponse.json(((await posts.json()) as Post[]).map(normalizePost), {headers:{"X-PC-Hub-Calendar":"1"}});
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  let post;
  try { post = validatePost(await request.json()); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid post." }, { status: 400 }); }
  const saved = await supabaseRest(`marketing_posts?on_conflict=id&select=${encodeURIComponent(fields)}`, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(postToRow(post)) });
  if (!saved.ok) return jsonError(saved);
  const [data] = await saved.json() as Post[];
  return NextResponse.json(normalizePost(data));
}
