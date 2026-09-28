import { NextRequest, NextResponse } from "next/server";
import { supabaseRest } from "../../../../../lib/supabase";

type TokenResponse = { access_token?: string; error?: { message?: string } };
type Page = { id: string; name: string; access_token: string };

export async function GET(request: NextRequest) {
  const appUrl = new URL("/", request.url);
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  if (error) { appUrl.searchParams.set("facebook", "cancelled"); return NextResponse.redirect(appUrl); }
  if (!code || !state || state !== request.cookies.get("pc_hub_facebook_state")?.value) { appUrl.searchParams.set("facebook", "invalid-request"); return NextResponse.redirect(appUrl); }
  const appId = process.env.META_APP_ID, secret = process.env.META_APP_SECRET;
  if (!appId || !secret) { appUrl.searchParams.set("facebook", "not-configured"); return NextResponse.redirect(appUrl); }
  const redirectUri = `${request.nextUrl.origin}/api/connect/facebook/callback`;
  const tokenParams = new URLSearchParams({ client_id: appId, client_secret: secret, redirect_uri: redirectUri, code });
  const tokenResponse = await fetch(`https://graph.facebook.com/v23.0/oauth/access_token?${tokenParams}`);
  const token = await tokenResponse.json() as TokenResponse;
  if (!tokenResponse.ok || !token.access_token) { appUrl.searchParams.set("facebook", "token-error"); return NextResponse.redirect(appUrl); }
  const pagesResponse = await fetch(`https://graph.facebook.com/v23.0/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(token.access_token)}`);
  const pagesData = await pagesResponse.json() as { data?: Page[] };
  const configuredPage = process.env.META_PAGE_ID;
  const page = pagesData.data?.find(item => item.id === configuredPage) ?? pagesData.data?.[0];
  if (!page) { appUrl.searchParams.set("facebook", "no-page-access"); return NextResponse.redirect(appUrl); }
  const saved = await supabaseRest("social_connections?on_conflict=platform", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ platform: "Facebook", account_id: page.id, account_name: page.name, access_token: page.access_token, connected_at: new Date().toISOString() }) });
  appUrl.searchParams.set("facebook", saved.ok ? "connected" : "save-error");
  const response = NextResponse.redirect(appUrl); response.cookies.delete("pc_hub_facebook_state"); return response;
}
