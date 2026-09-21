"use client";

import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) { setMessage("Registration will be available after Supabase is connected."); setLoading(false); return; }
    const normalized = username.trim().toLowerCase();
    const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/signup`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email: `${normalized}@login.pchub.local`, password, data: { username: normalized } }) });
    const body = await response.json().catch(() => ({})) as { msg?: string; message?: string };
    setMessage(response.ok ? "Account created. Wait for an admin to approve your access." : body.msg ?? body.message ?? "Unable to create account.");
    setLoading(false);
  }

  return <main className="simple-login"><div className="login-stack"><div className="login-branding"><img className="login-logo" src="/pchub-login-logo.png" alt="PC Hub"/><span>Digital Marketing WebApp</span></div><form className="login-panel" onSubmit={register}><label>Username<input value={username} onChange={event => setUsername(event.target.value)} pattern="[A-Za-z0-9_-]{3,30}" title="Use 3–30 letters, numbers, underscores or hyphens." required /></label><label>Password<input type="password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} required /></label>{message && <div className="login-error">{message}</div>}<button className="login-button" disabled={loading}>{loading ? "Creating…" : "Create account"}</button><a className="register-link" href="/login">Back to sign in</a></form></div></main>;
}
