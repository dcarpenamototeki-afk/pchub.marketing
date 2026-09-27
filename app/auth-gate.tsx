"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient, hasSupabaseConfig } from "../lib/supabase";

const allowedUids = (process.env.NEXT_PUBLIC_ALLOWED_USER_UIDS ?? "").split(",").map((value) => value.trim()).filter(Boolean);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    async function checkSession() {
      setError("");
      try {
        const { data } = await supabase.auth.getSession();
        let permitted = Boolean(data.session && (allowedUids.length ? allowedUids.includes(data.session.user.id) : data.session.user.id === "local-demo-admin"));
        if (data.session && hasSupabaseConfig()) {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
          const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          const response = await fetch(`${url}/rest/v1/profiles?select=approval_status&id=eq.${data.session.user.id}`, {
            headers: { apikey: key ?? "", Authorization: `Bearer ${data.session.access_token}` },
            signal: controller.signal,
          });
          if (response.status === 401) {
            permitted = false;
          } else {
            if (!response.ok) throw new Error("Unable to verify your account. Please try again.");
            const profiles: unknown = await response.json();
            if (!Array.isArray(profiles)) throw new Error("Unexpected login response. Please try again.");
            permitted = profiles[0]?.approval_status === "approved";
          }
        }
        if (!active) return;
        if (!permitted) {
          if (data.session) await supabase.auth.signOut();
          if (active) router.replace("/login");
          return;
        }
        setReady(true);
      } catch {
        if (active) setError("We couldn't verify your login. Check your connection and try again, or return to sign in.");
      } finally {
        clearTimeout(timeout);
      }
    }
    void checkSession();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [router, supabase, attempt]);

  if (error) return <main className="auth-loading"><div role="alert"><p>{error}</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button><p><a href="/login">Return to sign in</a></p></div></main>;
  if (!ready) return <main className="auth-loading">Checking secure login…</main>;
  return <>{children}</>;
}
