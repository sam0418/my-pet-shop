import { SUPABASE_CONFIG } from '../config.js';

const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

export const supabaseService = {
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