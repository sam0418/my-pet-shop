export const SUPABASE_CONFIG = {
  url: "https://oehiiqwunnfjvqkmxxen.supabase.co",
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9laGlpcXd1bm5manZxa214eGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDc1MzIsImV4cCI6MjA4NzcyMzUzMn0.JmHZeoGde5bEaSbGvptgKf3gzRDqUKuVgUyLHaN_pow'
};

export const isSupabaseConfigured = () => {
  return SUPABASE_CONFIG.url.includes('supabase.co') && SUPABASE_CONFIG.anonKey;
};