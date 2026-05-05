'use client';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export function useSupabase() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return supabase;
}
