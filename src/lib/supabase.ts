import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aaslnmbthwztvbzoestc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhc2xubWJ0aHd6dHZiem9lc3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNDcyNzIsImV4cCI6MjEwMDkyMzI3Mn0.cm5YVmorg9X64U40KG_XKc3bSgPy3Mav6bamU7ICopc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
