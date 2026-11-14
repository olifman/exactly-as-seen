import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export function publicClient() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Project service is unavailable.');
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  } } });
}
export function publicHeaders(request: Request) {
  const origin = request.headers.get('Origin');
  const headers = new Headers({ 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' });
  if (origin === 'https://olifman.github.io' || origin === new URL(request.url).origin) headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}