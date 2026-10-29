import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin:SupabaseClient|null=null;
export function supabaseAdmin(){
  const url=process.env.SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.");
  if(!admin)admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  return admin;
}
