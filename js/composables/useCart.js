/**
 * 購物車邏輯 Composable
 */

import { ref, computed, reactive } from 'vue';
import { calculatePrice } from '../utils/helpers.js';
import { DEFAULT_SETTINGS, SHIPPING_METHODS, PICKUP_DISCOUNT_RATE } from '../utils/constants.js';

export const useCart = () => {
  const cart = ref([]);
  const settings = reactive({ ...DEFAULT_SETTINGS });
  const order = reactive({
    shippingMethod: SHIPPING_METHODS.PICKUP,
    name: '',
    phone: '',
    address: ''
  });

  const cartCount = computed(() => {
    return cart.value.reduce((total, item) => total + item.quantity, 0);
  });

  const cartSubtotal = computed(() => {
    return cart.value.reduce((total, item) => {
      return total + parseFloat(item.finalPrice) * item.quantity;
    }, 0);
  });

  const pickupDiscount = computed(() => {
    return order.shippingMethod === SHIPPING_METHODS.PICKUP 
      ? cartSubtotal.value * PICKUP_DISCOUNT_RATE 
      : 0;
  });

  const isFreeShipping = computed(() => {
    return cartSubtotal.value >= settings.freeShippingThreshold;
  });

  const currentShippingFee = computed(() => {
    if (order.shippingMethod === SHIPPING_METHODS.PICKUP) return 0;
    if (order.shippingMethod === SHIPPING_METHODS.CUSTOM) return parseFloat(settings.shippingFee);
    return isFreeShipping.value ? 0 : parseFloat(settings.shippingFee);
  });

  const cartTotal = computed(() => {
    return cartSubtotal.value - pickupDiscount.value + currentShippingFee.value;
  });

  const addToCart = (product) => {
    if (product.stock <= 0) return false;
    
    const existItem = cart.value.find(item => item.id === product.id);
    if (existItem) {
      existItem.quantity++;
    } else {
      cart.value.push({
        ...product,
        finalPrice: calculatePrice(product),
        quantity: 1
      });
    }
    return true;
  };

  const updateQuantity = (index, change) => {
    cart.value[index].quantity += change;
    if (cart.value[index].quantity <= 0) {
      cart.value.splice(index, 1);
    }
  };

  const removeFromCart = (index) => {
    cart.value.splice(index, 1);
  };

  const clearCart = () => {
    cart.value = [];
  };

  const resetOrder = () => {
    order.shippingMethod = SHIPPING_METHODS.PICKUP;
    order.name = '';
    order.phone = '';
    order.address = '';
  };

  return {
    cart, settings, order,
    cartCount, cartSubtotal, pickupDiscount,
    isFreeShipping, currentShippingFee, cartTotal,
    addToCart, updateQuantity, removeFromCart, clearCart, resetOrder
  };
};