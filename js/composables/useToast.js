import { reactive } from 'vue';
import { TOAST_DURATION, TOAST_TYPES } from '../utils/constants.js';

export const useToast = () => {
  const toast = reactive({ show: false, message: '', type: TOAST_TYPES.SUCCESS });

  const showToast = (message, type = TOAST_TYPES.SUCCESS) => {
    toast.show = true;
    toast.message = message;
    toast.type = type;
    
    setTimeout(() => {
      toast.show = false;
    }, TOAST_DURATION);
  };

  return { toast, showToast };
};