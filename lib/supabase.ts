type SessionUser = { id: string; email?: string };
type Session = { access_token: string; user: SessionUser };

const storageKey = "pc-hub-marketing-session";

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function publicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase public URL and anon key are required.");
  return { url: url.replace(/\/$/, ""), key };
}

function savedSession(): Session | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(storageKey);
  if (!value) return null;
  try { return JSON.parse(value) as Session; } catch { return null; }
}

export function getBrowserSupabaseClient() {
  if (!hasSupabaseConfig()) {
    const demoSession: Session = { access_token: "local-demo-session", user: { id: "local-demo-admin", email: "admin@pchub.local" } };
    return {
      auth: {
        async getSession() { return { data: { session: savedSession() } }; },
        async getUser() { return { data: { user: savedSession()?.user ?? null } }; },
        async signOut() { if (typeof window !== "undefined") window.localStorage.removeItem(storageKey); return { error: null }; },
        async signInWithPassword({ email, password }: { email: string; password: string }) {
          if (email !== "admin@pchub.local" || password !== "pchub123") return { data: { user: null }, error: { message: "Incorrect email or password." } };
          window.localStorage.setItem(storageKey, JSON.stringify(demoSession));
          return { data: { user: demoSession.user }, error: null };
        },
      },
    };
  }
  const { url, key } = publicConfig();
  return {
    auth: {
      async getSession() { return { data: { session: savedSession() } }; },
      async getUser() { return { data: { user: savedSession()?.user ?? null } }; },
      async signOut() { if (typeof window !== "undefined") window.localStorage.removeItem(storageKey); return { error: null }; },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
          method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
        });
        const body = await response.json() as { access_token?: string; user?: SessionUser; error_description?: string; msg?: string };
        if (!response.ok) return { data: { user: null }, error: { message: body.error_description ?? body.msg ?? "Unable to sign in." } };
        if (!body.access_token || !body.user) return { data: { user: null }, error: { message: "Unable to sign in." } };
        const session: Session = { access_token: body.access_token, user: body.user };
        window.localStorage.setItem(storageKey, JSON.stringify(session));
        return { data: { user: session.user }, error: null };
      },
    },
  };
}

function adminConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase URL and service role key are required.");
  return { url: url.replace(/\/$/, ""), key };
}

export async function getSupabaseUser(token: string) {
  const { url, key } = adminConfig();
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
  if (!response.ok) return null;
  return response.json() as Promise<SessionUser>;
}

export async function supabaseRest(path: string, init: RequestInit = {}) {
  const { url, key } = adminConfig();
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
  });
}
