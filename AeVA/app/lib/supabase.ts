import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Supabase configuration
// Replace these with your actual Supabase URL and anon key
// In a production environment, these should be stored in environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Since we're only doing read operations, we don't need to persist the session
  },
});

// Example function to fetch data from a table
export async function fetchData<T>(tableName: string, options?: {
  columns?: string,
  filter?: { column: string, operator: string, value: any }[],
  limit?: number,
  order?: { column: string, ascending?: boolean }
}): Promise<T[]> {
  try {
    let query = supabase
      .from(tableName)
      .select(options?.columns || '*');
    
    // Apply filters if provided
    if (options?.filter && options.filter.length > 0) {
      options.filter.forEach(filter => {
        query = query.filter(filter.column, filter.operator, filter.value);
      });
    }
    
    // Apply ordering if provided
    if (options?.order) {
      query = query.order(options.order.column, { 
        ascending: options.order.ascending !== false 
      });
    }
    
    // Apply limit if provided
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching data from Supabase:', error);
      return [];
    }
    
    return data as T[];
  } catch (error) {
    console.error('Unexpected error when fetching data:', error);
    return [];
  }
}
