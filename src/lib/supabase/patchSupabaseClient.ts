/**
 * This file patches the Supabase client to ensure all requests include the proper Accept header
 * It should be imported once at the application entry point
 */

// Only patch if we're in a browser environment
if (typeof window !== 'undefined') {
  // Store the original fetch function
  const originalFetch = window.fetch;

  // Replace the global fetch with our patched version
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // Convert input to string to check if it's a Supabase request
    const url = typeof input === 'string' ? input : input.toString();
    const isSupabaseRequest = url.includes('supabase.co');
    
    if (isSupabaseRequest) {
      // Create new headers object to avoid modifying the original
      const headers = new Headers(init?.headers || {});
      
      // Add Accept header if not present
      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
      }
      
      // Create new init object with updated headers
      const newInit = {
        ...init,
        headers
      };
      
      // Call original fetch with updated init
      return originalFetch(input, newInit);
    }
    
    // For non-Supabase requests, use original fetch
    return originalFetch(input, init);
  };

  console.log('Supabase client patched to include Accept: application/json header');
} 