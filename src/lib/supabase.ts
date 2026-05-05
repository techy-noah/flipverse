import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function createClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'x-app-name': 'flipverse',
      },
    },
  });
}

let cachedClient: SupabaseClient<Database> | null = null;

export const supabase: SupabaseClient<Database> = supabaseUrl
  ? createClient()
  : ({} as SupabaseClient<Database>);
