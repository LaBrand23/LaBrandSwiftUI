import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy initialization of Supabase clients
let _supabase: SupabaseClient | null = null;
let _supabasePublic: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL || "";
}

function getSupabaseServiceKey(): string {
  return process.env.SUPABASE_SERVICE_KEY || "";
}

function getSupabaseAnonKey(): string {
  return process.env.SUPABASE_ANON_KEY || "";
}

// Create Supabase client with service role key (bypasses RLS)
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = getSupabaseUrl();
    const key = getSupabaseServiceKey();

    if (!url || !key) {
      throw new Error("Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.");
    }

    _supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabase;
}

// Create client for public access (respects RLS)
export function getSupabasePublic(): SupabaseClient {
  if (!_supabasePublic) {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();

    if (!url || !key) {
      throw new Error("Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
    }

    _supabasePublic = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabasePublic;
}

// Export lazy proxy for backward compatibility - acts like a SupabaseClient
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default supabase;
