import { NextRequest, NextResponse } from "next/server";
import { getSupabaseUser, supabaseRest } from "../../../lib/supabase";

async function account(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: NextResponse.json({ error: "Login required." }, { status: 401 }) };
  const user = await getSupabaseUser(token); if (!user) return { error: NextResponse.json({ error: "Invalid login session." }, { status: 401 }) };
  const response = await supabaseRest(`profiles?id=eq.${user.id}&select=approval_status,role`);
  const [profile] = await response.json() as Array<{ approval_status: string; role: string }>;
  if (!profile || profile.approval_status !== "approved") return { error: NextResponse.json({ error: "Awaiting approval." }, { status: 403 }) };
  return { profile };
}

export async function GET(request: NextRequest) {
  const auth = await account(request); if (auth.error) return auth.error;
  const response = await supabaseRest("team_members?active=eq.true&select=name&order=name.asc");
  if (!response.ok) return NextResponse.json({ error: "Unable to load team." }, { status: 500 });
  const rows = await response.json() as Array<{ name: string }>;
  return NextResponse.json(rows.map(row => row.name));
}

export async function POST(request: NextRequest) {
  const auth = await account(request); if (auth.error) return auth.error;
  if (auth.profile.role !== "admin") return NextResponse.json({ error: "Only admins can add staff." }, { status: 403 });
  const { name } = await request.json() as { name?: string };
  const clean = name?.trim(); if (!clean || clean.length > 60) return NextResponse.json({ error: "Enter a staff name." }, { status: 400 });
  const response = await supabaseRest("team_members?on_conflict=name", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ name: clean, active: true }) });
  if (!response.ok) return NextResponse.json({ error: "Unable to add staff." }, { status: 500 });
  const rows = await response.json() as Array<{ name: string }>;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: NextRequest) {
  const auth = await account(request); if (auth.error) return auth.error;
  if (auth.profile.role !== "admin") return NextResponse.json({ error: "Only admins can remove staff." }, { status: 403 });
  const name = request.nextUrl.searchParams.get("name"); if (!name) return NextResponse.json({ error: "Staff name is required." }, { status: 400 });
  const response = await supabaseRest(`team_members?name=eq.${encodeURIComponent(name)}`, { method: "DELETE" });
  if (!response.ok) return NextResponse.json({ error: "Unable to remove staff." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
