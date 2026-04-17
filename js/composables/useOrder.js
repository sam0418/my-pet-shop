import { SHIPPING_METHODS } from '../utils/constants.js';
import { cleanPhoneNumber } from '../utils/helpers.js';

export const useOrder = () => {
  const generateOrderText = (cart, order, cartSubtotal, pickupDiscount, currentShippingFee, cartTotal, lang = 'zh') => {
    let text = `*🐾 ${lang === 'zh' ? '新訂單 - PetFood Mart' : 'New Order - PetFood Mart'}*\n\n`;
    
    text += `*${lang === 'zh' ? '📦 商品清單：' : '📦 Items:'}*\n`;
    cart.forEach(item => {
      text += `  • ${item.name} ×${item.quantity} @ RM ${item.finalPrice} = RM ${(parseFloat(item.finalPrice) * item.quantity).toFixed(2)}\n`;
    });

    text += `\n*${lang === 'zh' ? '小計：' : 'Subtotal:'}* RM ${cartSubtotal.toFixed(2)}\n`;

    if (order.shippingMethod === SHIPPING_METHODS.PICKUP) {
      text += `*${lang === 'zh' ? '配送方式：' : 'Shipping:'}* 🏪 ${lang === 'zh' ? '到店自取（-3%）' : 'Self Pickup (-3%)'}\n`;
      text += `*${lang === 'zh' ? '優惠折扣：' : 'Discount:'}* -RM ${pickupDiscount.toFixed(2)}\n`;
    } else {
      const method = order.shippingMethod === SHIPPING_METHODS.DELIVERY 
        ? `🚚 ${lang === 'zh' ? '標準配送' : 'Standard Delivery'}`
        : `📦 ${lang === 'zh' ? '自定義配送' : 'Custom Delivery'}`;
      text += `*${lang === 'zh' ? '配送方式：' : 'Shipping:'}* ${method}\n`;
      text += `*${lang === 'zh' ? '運費：' : 'Shipping Fee:'}* RM ${currentShippingFee.toFixed(2)}\n`;
      text += `\n*${lang === 'zh' ? '收件人：' : 'Name:'}* ${order.name}\n`;
      text += `*${lang === 'zh' ? '電話：' : 'Phone:'}* ${order.phone}\n`;
      text += `*${lang === 'zh' ? '地址：' : 'Address:'}* ${order.address}\n`;
    }

    text += `\n*💰 ${lang === 'zh' ? '合計：' : 'Total:'}* RM ${cartTotal.toFixed(2)}`;
    return text;
  };

  const openWhatsApp = (phoneNumber, message) => {
    const cleanPhone = cleanPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return { generateOrderText, openWhatsApp };
};