import { createClient } from '@supabase/supabase-js'

// prefer dedicated server URL/key; fallback to public values where appropriate
const SERVER_SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVER_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const BROWSER_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const BROWSER_SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Server-side client (use in server components / API routes)
export const supabaseServer = createClient(SERVER_SUPABASE_URL, SERVER_SUPABASE_KEY, {
  auth: { persistSession: false },
});

// Browser/client factory (use in client components)
export const createSupabaseBrowser = () =>
  createClient(BROWSER_SUPABASE_URL, BROWSER_SUPABASE_KEY, {
    auth: { persistSession: false },
  });

// Backwards compatible alias (some code expects this name)
export const createSupabaseClientForBrowser = createSupabaseBrowser;