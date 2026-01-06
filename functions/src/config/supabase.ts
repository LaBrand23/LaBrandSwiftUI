import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as functions from "firebase-functions";

// Get Supabase credentials from Firebase config
const supabaseUrl = functions.config().supabase?.url || process.env.SUPABASE_URL;
const supabaseServiceKey = functions.config().supabase?.service_key || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase credentials not configured. Set via: firebase functions:config:set supabase.url=YOUR_URL supabase.service_key=YOUR_KEY");
}

// Create Supabase client with service role key (bypasses RLS)
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "",
  supabaseServiceKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create client for public access (respects RLS)
export const supabasePublic: SupabaseClient = createClient(
  supabaseUrl || "",
  functions.config().supabase?.anon_key || process.env.SUPABASE_ANON_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;

