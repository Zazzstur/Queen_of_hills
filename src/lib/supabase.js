import { createClient } from '@supabase/supabase-js';

// Client-side initialization using Vite env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a client only if keys are present, otherwise export a dummy or null
// ensuring the app doesn't crash in local-only mode.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : {
      from: () => ({ select: () => ({ single: () => ({ error: new Error('Supabase not configured') }) }) }),
      storage: { from: () => ({ upload: () => ({ error: new Error('Supabase not configured') }) }) }
    };

// Server-side initialization helper (for Cloudflare Functions)
export const createServerSupabase = (env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase env variables missing on server');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
};
