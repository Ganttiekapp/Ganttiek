import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || supabaseUrl.includes('your-supabase-project-url')) {
  console.warn('Invalid or placeholder Supabase URL detected. Using test configuration.');
}

if (!supabaseAnonKey || supabaseAnonKey.includes('your-supabase-anon-key')) {
  console.warn('Invalid or placeholder Supabase key detected. Using test configuration.');
}

// Use fallback values for testing if environment variables are invalid
const finalUrl = (supabaseUrl && !supabaseUrl.includes('your-supabase-project-url')) 
  ? supabaseUrl 
  : 'https://test-project.supabase.co';

const finalKey = (supabaseAnonKey && !supabaseAnonKey.includes('your-supabase-anon-key')) 
  ? supabaseAnonKey 
  : 'test-anon-key-for-testing-only';

export const supabase = createClient(finalUrl, finalKey);
