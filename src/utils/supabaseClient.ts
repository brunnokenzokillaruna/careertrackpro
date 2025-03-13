import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a custom fetch function that adds the Accept header
const customFetch = (url: RequestInfo | URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers || {});
  
  // Add Accept header if not present
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  
  return fetch(url, {
    ...init,
    headers
  });
};

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'careertrack-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    },
    global: {
      headers: {
        'Accept': 'application/json'
      },
      fetch: customFetch
    }
  }
); 