export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email is invalid' };
  }
  
  return { isValid: true, error: null };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  return { isValid: true, error: null };
};

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  
  return { isValid: true, error: null };
};

export const validateForm = (formData, validations) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validations).forEach(field => {
    const value = formData[field];
    const validation = validations[field];
    
    const result = validation(value);
    if (!result.isValid) {
      errors[field] = result.error;
      isValid = false;
    }
  });
  
  return { isValid, errors };
}; 