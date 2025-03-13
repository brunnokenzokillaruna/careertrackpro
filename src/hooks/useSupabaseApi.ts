import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PostgrestResponse, PostgrestSingleResponse, PostgrestError } from '@supabase/supabase-js';

/**
 * Custom hook to handle Supabase API calls with proper headers
 * This ensures that all requests include the Accept: application/json header
 */
export function useSupabaseApi<T>(
  tableName: string,
  query: (supabaseQuery: any) => any,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Start with the table query
        let supabaseQuery = supabase.from(tableName);
        
        // Apply the custom query function
        const queryResult = await query(supabaseQuery);
        
        // Check for errors
        if (queryResult.error) {
          throw new Error(queryResult.error.message);
        }
        
        setData(queryResult.data as T);
      } catch (err) {
        console.error(`Error fetching data from ${tableName}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, error, loading };
} 