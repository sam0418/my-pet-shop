import { ref, computed, reactive, onMounted } from 'vue';
import { supabaseService } from '../services/supabaseService.js';

export const useProducts = () => {
  const products = ref([]);
  const searchQuery = ref('');
  const isLoading = ref(false);

  const productForm = reactive({
    id: null,
    name: '',
    price: 0,
    stock: 0,
    discount: 0,
    image: '',
    description: ''
  });

  const isEditing = ref(false);

  const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value;
    
    const q = searchQuery.value.toLowerCase();
    return products.value.filter(product =>
      product.name.toLowerCase().includes(q) ||
      (product.description || '').toLowerCase().includes(q)
    );
  });

  const loadProducts = async () => {
    isLoading.value = true;
    try {
      const data = await supabaseService.fetchProducts();
      products.value = data || [];
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const saveProduct = async (payload) => {
    if (isEditing.value) {
      return await supabaseService.updateProduct(productForm.id, payload);
    } else {
      return await supabaseService.createProduct(payload);
    }
  };

  const deleteProduct = async (id) => {
    return await supabaseService.deleteProduct(id);
  };

  const editProduct = (product) => {
    Object.assign(productForm, product);
    isEditing.value = true;
  };

  const resetForm = () => {
    Object.assign(productForm, {
      id: null,
      name: '',
      price: 0,
      stock: 0,
      discount: 0,
      image: '',
      description: ''
    });
    isEditing.value = false;
  };

  const handleImageUpload = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        productForm.image = event.target.result;
        resolve();
      };
      reader.readAsDataURL(file);
    });
  };

  onMounted(async () => {
    await loadProducts();
  });

  return {
    products, searchQuery, isLoading, productForm, isEditing,
    filteredProducts, loadProducts, saveProduct, deleteProduct,
    editProduct, resetForm, handleImageUpload
  };
};