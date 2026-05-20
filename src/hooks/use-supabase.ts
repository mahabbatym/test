"use client";

import { useMemo } from "react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function useSupabase() {
  const client = useMemo(() => {
    if (!isSupabaseConfigured()) return null;
    return createClient();
  }, []);

  return client;
}
