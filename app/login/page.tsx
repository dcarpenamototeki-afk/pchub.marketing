"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient, hasSupabaseConfig } from "../../lib/supabase";

const allowedUids = (process.env.NEXT_PUBLIC_ALLOWED_USER_UIDS ?? "").split(",").map((value) => value.trim()).filter(Boolean);

export default function LoginPage() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const normalized = username.trim().toLowerCase();
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: normalized === "admin" && !hasSupabaseConfig() ? "admin@pchub.local" : `${normalized}@login.pchub.local`, password });
    if (loginError || !data.user) { setError(loginError?.message ?? "Unable to sign in."); setLoading(false); return; }
    if ((allowedUids.length && !allowedUids.includes(data.user.id)) || (!hasSupabaseConfig() && data.user.id !== "local-demo-admin")) { await supabase.auth.signOut(); setError("This account is not allowed to access PC Hub Marketing."); setLoading(false); return; }
    router.replace("/");
  }

  return <main className="simple-login"><div className="login-stack"><div className="login-branding"><img className="login-logo" src="/pchub-login-logo.png" alt="PC Hub"/><span>Digital Marketing WebApp</span></div><form className="login-panel" onSubmit={login}><label>Username<input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <div className="login-error">{error}</div>}<button className="login-button" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button><a className="register-link" href="/register">Create staff account</a></form></div></main>;
}
