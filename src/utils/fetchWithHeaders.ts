/**
 * Custom fetch function that adds necessary headers for Supabase API requests
 * Use this instead of the native fetch when making direct API calls to Supabase
 */
export const fetchWithHeaders = async (url: string, options: RequestInit = {}) => {
  // Check if this is a Supabase request
  const isSupabaseRequest = url.includes('supabase.co');
  
  // Clone the headers to avoid modifying the original object
  const headers = new Headers(options.headers || {});
  
  // Add Accept header for Supabase requests if not already present
  if (isSupabaseRequest && !headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  
  // Add Content-Type if not already present
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Return the fetch with updated headers
  return fetch(url, {
    ...options,
    headers
  });
}; 