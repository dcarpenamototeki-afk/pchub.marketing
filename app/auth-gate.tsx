"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "../lib/supabase";

const allowedUids = (process.env.NEXT_PUBLIC_ALLOWED_USER_UIDS ?? "").split(",").map((value) => value.trim()).filter(Boolean);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const supabase = getBrowserSupabaseClient();

  useEffect(() => {
    let active = true;
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      const permitted = data.session && (allowedUids.length ? allowedUids.includes(data.session.user.id) : data.session.user.id === "local-demo-admin");
      if (!permitted) {
        if (data.session) await supabase.auth.signOut();
        router.replace("/login");
        return;
      }
      if (active) setReady(true);
    }
    void checkSession();
    return () => { active = false; };
  }, [router, supabase]);

  if (!ready) return <main className="auth-loading">Checking secure login…</main>;
  return <>{children}</>;
}
