import { NextRequest, NextResponse } from "next/server";
import { getSupabaseUser, supabaseRest } from "../../../lib/supabase";
import { validatePost } from "../../../lib/marketing";

const fields = "id,title,contentType:content_type,platform,format,owners,date,postedTime:posted_time,status,url,views,likes,comments,shares";

function databasePost(post: ReturnType<typeof validatePost>) {
  const { contentType, postedTime, ...rest } = post;
  return { ...rest, content_type: contentType, posted_time: postedTime || null };
}

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
  const posts = await supabaseRest(`marketing_posts?select=${encodeURIComponent(fields)}&order=date.asc`);
  if (!posts.ok) return jsonError(posts);
  return NextResponse.json(await posts.json());
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  let post;
  try { post = validatePost(await request.json()); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid post." }, { status: 400 }); }
  if (auth.profile.role !== "admin") {
    const existing = await supabaseRest(`marketing_posts?id=eq.${encodeURIComponent(post.id)}&select=status`);
    const [current] = await existing.json().catch(() => []) as Array<{ status: string }>;
    if (current?.status === "Published") return NextResponse.json({ error: "Published posts are locked. Only an admin can edit them." }, { status: 403 });
  }
  const saved = await supabaseRest("marketing_posts?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(databasePost(post)) });
  if (!saved.ok) return jsonError(saved);
  const [data] = await saved.json() as unknown[];
  return NextResponse.json(data);
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
