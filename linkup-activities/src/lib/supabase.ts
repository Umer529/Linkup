import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Do NOT set a custom storageKey — Supabase must use its default
      // so getSession() can find the session after the Google OAuth redirect
    },
  }
);

export default supabase;
