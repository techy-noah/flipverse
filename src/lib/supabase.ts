import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function createServer(cookies: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: Record<string, unknown>) => void;
  remove: (name: string, options: Record<string, unknown>) => void;
}) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies,
  });
}

export { isConfigured };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = (typeof window !== 'undefined' && isConfigured) ? createClient() : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SupabaseClient = SupabaseClientType<any>;
