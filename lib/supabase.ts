type SessionUser = { id: string; email?: string };
type Session = { access_token: string; refresh_token?: string; expires_at?: number; user: SessionUser };

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

function saveSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(storageKey, JSON.stringify(session));
  else window.localStorage.removeItem(storageKey);
}

type AuthResponse = { access_token?: string; refresh_token?: string; expires_at?: number; expires_in?: number; user?: SessionUser; error_description?: string; msg?: string };

function sessionFromAuth(body: AuthResponse): Session | null {
  if (!body.access_token || !body.user) return null;
  return { access_token: body.access_token, refresh_token: body.refresh_token, expires_at: body.expires_at ?? Math.floor(Date.now() / 1000) + (body.expires_in ?? 3600), user: body.user };
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
  async function currentSession() {
    const session = savedSession();
    if (!session) return null;
    if (!session.expires_at || session.expires_at * 1000 > Date.now() + 60_000) return session;
    if (!session.refresh_token) { saveSession(null); return null; }
    const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: session.refresh_token }) });
    const refreshed = sessionFromAuth(await response.json() as AuthResponse);
    if (!response.ok || !refreshed) { saveSession(null); return null; }
    saveSession(refreshed);
    return refreshed;
  }
  return {
    auth: {
      async getSession() { return { data: { session: await currentSession() } }; },
      async getUser() { return { data: { user: (await currentSession())?.user ?? null } }; },
      async signOut() { saveSession(null); return { error: null }; },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
          method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
        });
        const body = await response.json() as AuthResponse;
        if (!response.ok) return { data: { user: null }, error: { message: body.error_description ?? body.msg ?? "Unable to sign in." } };
        const session = sessionFromAuth(body);
        if (!session) return { data: { user: null }, error: { message: "Unable to sign in." } };
        saveSession(session);
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
