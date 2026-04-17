import { ref, reactive } from 'vue';
import { ADMIN_TABS } from '../utils/constants.js';
import { supabaseService } from '../services/supabaseService.js';

export const useAdmin = () => {
  const isAdmin = ref(false);
  const activeTab = ref(ADMIN_TABS.PRODUCTS);
  const authToken = ref(localStorage.getItem('authToken') || '');

  const loginForm = reactive({
    username: '',
    password: ''
  });

  /**
   * 驗證登入 - 使用後端 JWT 認證
   */
  const validateLogin = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      // 儲存 token（使用 sessionStorage 而非 localStorage 提高安全性）
      authToken.value = data.token;
      sessionStorage.setItem('authToken', data.token);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const saveSettings = async (settings) => {
    return await supabaseService.updateSettings(settings);
  };

  const loadSettings = async () => {
    return await supabaseService.fetchSettings();
  };

  const logout = () => {
    isAdmin.value = false;
    authToken.value = '';
    loginForm.username = '';
    loginForm.password = '';
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
  };

  const resetLoginForm = () => {
    loginForm.username = '';
    loginForm.password = '';
  };

  /**
   * 取得認證 header
   */
  const getAuthHeader = () => {
    const token = authToken.value || sessionStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  return {
    isAdmin, 
    activeTab, 
    loginForm,
    authToken,
    validateLogin, 
    saveSettings, 
    loadSettings,
    logout, 
    resetLoginForm,
    getAuthHeader
  };
};