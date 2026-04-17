/**
 * 輸入驗證中介軟體
 */

const Joi = require('joi');

/**
 * 商品驗證schema
 */
const productSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .max(255)
    .messages({
      'string.empty': 'Product name is required',
      'string.max': 'Product name cannot exceed 255 characters'
    }),
  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Price must be greater than 0'
    }),
  stock: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.integer': 'Stock must be a whole number'
    }),
  discount: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .messages({
      'number.min': 'Discount cannot be negative',
      'number.max': 'Discount cannot exceed 100%'
    }),
  image: Joi.string()
    .uri()
    .allow('')
    .default('')
    .messages({
      'string.uri': 'Image must be a valid URL'
    }),
  description: Joi.string()
    .max(1000)
    .allow('')
    .default('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    })
});

/**
 * 設置驗證schema
 */
const settingsSchema = Joi.object({
  shipping_fee: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Shipping fee cannot be negative'
    }),
  free_shipping_threshold: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Threshold cannot be negative'
    }),
  whatsapp_number: Joi.string()
    .pattern(/^\d{10,15}$/)
    .allow('')
    .messages({
      'string.pattern.base': 'WhatsApp number must be 10-15 digits'
    })
});

/**
 * 登入驗證schema
 */
const loginSchema = Joi.object({
  username: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Username is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

/**
 * 驗證中介軟體工廠函數
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: messages
      });
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = {
  productSchema,
  settingsSchema,
  loginSchema,
  validateRequest
};
