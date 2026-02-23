import { createClient } from '@supabase/supabase-js';

// Client-side initialization using Vite env variables
// Fallback to hardcoded values for production if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fwewzwhakwcctpstxvum.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJpc3MiOiJzdXBhYmFzeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9ZSIsInJlZiI6ImZ3ZXd6d2hha3djY3Rwc3R4dnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MzA3MzYsImV4cCI6MjA4NTUwNjczNn0.f0DcVPlpFUpsAWQZJQE9U6Z1eAbcYwQjmPtRr8K3NDk";

// Create a client only if keys are present, otherwise export a dummy or null
// ensuring the app doesn't crash in local-only mode.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : {
      from: () => ({ 
        select: () => ({ 
          single: () => ({ error: new Error('Supabase not configured') }),
          order: () => ({ error: new Error('Supabase not configured') }),
          eq: () => ({ select: () => ({ single: () => ({ error: new Error('Supabase not configured') }) }) })
        }),
        insert: () => ({ select: () => ({ single: () => ({ error: new Error('Supabase not configured') }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => ({ error: new Error('Supabase not configured') }) }) }) }),
        delete: () => ({ eq: () => ({ error: new Error('Supabase not configured') }) })
      }),
      storage: { 
        from: () => ({ 
          upload: () => ({ error: new Error('Supabase not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        }) 
      }
    };

// Server-side initialization helper (for Cloudflare Functions)
export const createServerSupabase = (env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase env variables missing on server');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
};
