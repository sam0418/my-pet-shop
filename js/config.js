/**
 * 應用配置文件
 * 支持 Supabase 和本地 API 模式
 */

// API 模式選擇：'supabase' 或 'local'
export const API_MODE = 'local';

export const SUPABASE_CONFIG = {
  url: "https://oehiiqwunnfjvqkmxxen.supabase.co",
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9laGlpcXd1bm5manZxa214eGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDc1MzIsImV4cCI6MjA4NzcyMzUzMn0.JmHZeoGde5bEaSbGvptgKf3gzRDqUKuVgUyLHaN_pow'
};

export const LOCAL_API_CONFIG = {
  baseURL: 'http://localhost:3001'
};

export const isSupabaseConfigured = () => {
  if (API_MODE === 'local') return true;
  return SUPABASE_CONFIG.url.includes('supabase.co') && SUPABASE_CONFIG.anonKey;
};

export const isLocalMode = () => {
  return API_MODE === 'local';
};