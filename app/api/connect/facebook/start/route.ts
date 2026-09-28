import { NextRequest, NextResponse } from "next/server";
import { getSupabaseUser, supabaseRest } from "../../../../../lib/supabase";

async function isAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const user = await getSupabaseUser(token); if (!user) return false;
  const response = await supabaseRest(`profiles?id=eq.${user.id}&select=approval_status,role`);
  const [profile] = await response.json().catch(() => []) as Array<{ approval_status: string; role: string }>;
  return profile?.approval_status === "approved" && profile.role === "admin";
}

export async function POST(request: NextRequest) {
  if (!await isAdmin(request)) return NextResponse.json({ error: "Only an approved admin can connect Facebook." }, { status: 403 });
  const appId = process.env.META_APP_ID;
  if (!appId) return NextResponse.json({ error: "Facebook connection is not configured. Add META_APP_ID in Vercel." }, { status: 503 });
  const state = crypto.randomUUID();
  const redirectUri = `${request.nextUrl.origin}/api/connect/facebook/callback`;
  const params = new URLSearchParams({ client_id: appId, redirect_uri: redirectUri, state, response_type: "code", scope: "pages_show_list,pages_read_engagement,read_insights" });
  const response = NextResponse.json({ url: `https://www.facebook.com/v23.0/dialog/oauth?${params}` });
  response.cookies.set("pc_hub_facebook_state", state, { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", maxAge: 600, path: "/" });
  return response;
}
