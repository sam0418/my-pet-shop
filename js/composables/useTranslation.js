/**
 * 多語言功能 Composable
 */

import { ref } from 'vue';

export const useTranslation = () => {
  const lang = ref('zh');

  const translations = {
    en: {
      products: 'Products', search: 'Search products...', add: 'Add to Cart',
      outOfStock: 'Out of Stock', stock: 'Stock', loading: 'Loading products...',
      noProducts: 'No products found',
      shoppingCart: 'Shopping Cart', emptyCart: 'Your cart is empty', backToShop: 'Back to Shop',
      orderSummary: 'Order Summary', shippingMethod: 'Shipping Method',
      selfPickup: 'Self Pickup', delivery: 'Standard Delivery',
      customDelivery: 'Custom Delivery', selfPay: 'Fee Apply',
      deliveryDetails: 'Delivery Details', name: 'Full Name',
      phone: 'Phone Number', address: 'Delivery Address',
      subtotal: 'Subtotal', discountPickup: 'Pickup Discount',
      shippingFee: 'Shipping Fee', free: 'Free!', total: 'Total',
      freeShippingOver: 'Free shipping for orders over',
      sendWhatsApp: 'Order via WhatsApp', downloadPDF: 'Download Receipt (PDF)',
      manageProducts: 'Products', settings: 'Settings', logout: 'Logout',
      addProduct: 'Add New Product', editProduct: 'Edit Product Details',
      prodName: 'Product Name', prodPrice: 'Price', prodStock: 'Stock Qty',
      prodDiscount: 'Discount', prodImage: 'Product Image',
      prodImageURL: 'Or paste Image URL here...',
      imageNote: 'Large images may affect performance.',
      prodDesc: 'Description', image: 'Image', price: 'Price',
      discount: 'Discount', actions: 'Actions', update: 'Update', cancel: 'Cancel',
      shippingSettings: 'Shipping & Store Settings', standardShippingFee: 'Standard Shipping Fee',
      freeShippingThreshold: 'Free Shipping Threshold',
      shopWhatsApp: 'Store WhatsApp Number',
      whatsappHint: 'Format: 60123456789 (country code, no +)',
      saveSettings: 'Save Settings',
      saved: 'Settings saved!', addedToCart: 'Added to cart!',
      confirmDelete: 'Are you sure to delete this product?',
      fillDelivery: 'Please fill in all delivery details.',
      loginError: 'Incorrect username or password.',
      productSaved: 'Product added!', productUpdated: 'Product updated!',
      productDeleted: 'Product deleted!', fillRequired: 'Please fill in name and price.',
    },
    zh: {
      products: '商品列表', search: '搜索商品...', add: '加入购物车',
      outOfStock: '已售罄', stock: '库存', loading: '正在加载商品...',
      noProducts: '没有找到商品',
      shoppingCart: '购物车', emptyCart: '购物车为空', backToShop: '继续购物',
      orderSummary: '订单摘要', shippingMethod: '配送方式',
      selfPickup: '到店自取', delivery: '物流配送（标准）',
      customDelivery: '自定义物流配送', selfPay: '自付运费',
      deliveryDetails: '收件人信息', name: '姓名',
      phone: '手机号码', address: '收货地址',
      subtotal: '小计', discountPickup: '自取优惠',
      shippingFee: '运费', free: '免运费！', total: '合计',
      freeShippingOver: '满额免运：',
      sendWhatsApp: 'WhatsApp 下单', downloadPDF: '下载订单 PDF',
      manageProducts: '商品管理', settings: '设置', logout: '退出登录',
      addProduct: '新增商品', editProduct: '编辑商品信息',
      prodName: '商品名称', prodPrice: '价格', prodStock: '库存数量',
      prodDiscount: '折扣', prodImage: '商品图片',
      prodImageURL: '或粘贴图片链接...',
      imageNote: '注意：上传大图可能影响性能。',
      prodDesc: '商品描述', image: '图片', price: '价格',
      discount: '折扣', actions: '操作', update: '更新', cancel: '取消',
      shippingSettings: '物流与店铺设置', standardShippingFee: '标准运费',
      freeShippingThreshold: '免运门槛',
      shopWhatsApp: '店家 WhatsApp 号码',
      whatsappHint: '例如：60123456789（含国家代码，无 + 号）',
      saveSettings: '保存设置',
      saved: '设置已保存！', addedToCart: '已加入购物车！',
      confirmDelete: '确定要删除该商品吗？',
      fillDelivery: '请填写所有收件人信息。',
      loginError: '账号或密码错误。',
      productSaved: '商品已添加！', productUpdated: '商品已更新！',
      productDeleted: '商品已删除！', fillRequired: '请填写商品名称和价格。',
    }
  };

  const t = (key) => translations[lang.value]?.[key] || key;

  const toggleLang = () => {
    lang.value = lang.value === 'zh' ? 'en' : 'zh';
  };

  return { lang, t, toggleLang };
};