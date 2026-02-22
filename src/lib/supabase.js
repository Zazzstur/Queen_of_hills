import { createClient } from '@supabase/supabase-js';

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
