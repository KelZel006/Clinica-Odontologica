import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/** Cliente del navegador: solo para subir archivos directo a Storage con la sesión del usuario. */
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
