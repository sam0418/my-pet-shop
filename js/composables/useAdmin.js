import { ref, reactive } from 'vue';
import { ADMIN_CREDENTIALS, ADMIN_TABS } from '../utils/constants.js';
import { supabaseService } from '../services/supabaseService.js';

export const useAdmin = () => {
  const isAdmin = ref(false);
  const activeTab = ref(ADMIN_TABS.PRODUCTS);

  const loginForm = reactive({
    username: '',
    password: ''
  });

  const validateLogin = (username, password) => {
    return (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    );
  };

  const saveSettings = async (settings) => {
    return await supabaseService.updateSettings(settings);
  };

  const loadSettings = async () => {
    return await supabaseService.fetchSettings();
  };

  const logout = () => {
    isAdmin.value = false;
    loginForm.username = '';
    loginForm.password = '';
  };

  const resetLoginForm = () => {
    loginForm.username = '';
    loginForm.password = '';
  };

  return {
    isAdmin, activeTab, loginForm,
    validateLogin, saveSettings, loadSettings,
    logout, resetLoginForm
  };
};