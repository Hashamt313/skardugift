import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') });
const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_ANON_KEY;
export const supabase=url&&key?createClient(url,key,{auth:{persistSession:false}}):null;
export function requireDb(){if(!supabase){const e=new Error('Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');e.status=503;throw e}return supabase}
