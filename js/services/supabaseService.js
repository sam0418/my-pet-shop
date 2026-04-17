/**
 * 數據服務層 - 支持 Supabase 和本地 API
 */

import { SUPABASE_CONFIG, LOCAL_API_CONFIG, API_MODE } from '../config.js';

let supabase = null;

// 初始化 Supabase（如果使用 Supabase 模式）
if (API_MODE === 'supabase' && window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

const BASE_URL = LOCAL_API_CONFIG.baseURL;

/**
 * 本地 API 調用方法
 */
const localAPI = {
  async fetchProducts() {
    const response = await fetch(`${BASE_URL}/api/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  },

  async createProduct(payload) {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to create product');
    return await response.json();
  },

  async updateProduct(id, payload) {
    const response = await fetch(`${BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to update product');
    return await response.json();
  },

  async deleteProduct(id) {
    const response = await fetch(`${BASE_URL}/api/products/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return await response.json();
  },

  async fetchSettings() {
    const response = await fetch(`${BASE_URL}/api/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return await response.json();
  },

  async updateSettings(settings) {
    const response = await fetch(`${BASE_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shipping_fee: parseFloat(settings.shippingFee),
        free_shipping_threshold: parseFloat(settings.freeShippingThreshold),
        whatsapp_number: settings.whatsappNumber
      })
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return await response.json();
  },

  subscribeToProducts(callback) {
    // 使用 polling 替代實時訂閱
    const interval = setInterval(async () => {
      try {
        const data = await this.fetchProducts();
        callback({ new: data });
      } catch (err) {
        console.error('Error polling products:', err);
      }
    }, 3000);
    return { unsubscribe: () => clearInterval(interval) };
  },

  subscribeToSettings(callback) {
    const interval = setInterval(async () => {
      try {
        const data = await this.fetchSettings();
        callback({ new: data });
      } catch (err) {
        console.error('Error polling settings:', err);
      }
    }, 5000);
    return { unsubscribe: () => clearInterval(interval) };
  }
};

/**
 * Supabase API 調用方法
 */
const supabaseAPI = {
  async fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id');
    if (error) throw error;
    return data;
  },

  async createProduct(payload) {
    const { data, error } = await supabase
      .from('products')
      .insert([payload]);
    if (error) throw error;
    return data;
  },

  async updateProduct(id, payload) {
    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async fetchSettings() {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 'main')
      .single();
    if (error) throw error;
    return data;
  },

  async updateSettings(settings) {
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        id: 'main',
        shipping_fee: parseFloat(settings.shippingFee),
        free_shipping_threshold: parseFloat(settings.freeShippingThreshold),
        whatsapp_number: settings.whatsappNumber
      });
    if (error) throw error;
  },

  subscribeToProducts(callback) {
    return supabase
      .channel('realtime-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
      .subscribe();
  },

  subscribeToSettings(callback) {
    return supabase
      .channel('realtime-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, callback)
      .subscribe();
  }
};

// 導出服務 - 根據配置選擇使用的 API
export const supabaseService = API_MODE === 'local' ? localAPI : supabaseAPI;