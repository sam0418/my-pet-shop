export const calculatePrice = (product) => {
  const discountRate = (parseFloat(product.discount) || 0) / 100;
  const finalPrice = parseFloat(product.price) * (1 - discountRate);
  return finalPrice.toFixed(2);
};

export const cleanPhoneNumber = (phone) => {
  return phone ? phone.replace(/\D/g, '') : '';
};

export const formatCurrency = (amount) => {
  return `RM ${parseFloat(amount).toFixed(2)}`;
};

export const generateOrderNumber = () => {
  return Math.floor(Math.random() * 90000) + 10000;
};

export const validateRequired = (obj, fields) => {
  return fields.every(field => obj[field] && obj[field].toString().trim() !== '');
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};