import { toast } from 'sonner';

export interface FormErrors {
  [key: string]: boolean;
}

export interface LoginFormErrors {
  email?: boolean;
  password?: boolean;
}

/**
 * Validates login form fields
 * @param email - Email address
 * @param password - Password
 * @returns Object containing validation result and errors
 */
export const validateLoginForm = (
  email: string, 
  password: string
): { isValid: boolean; errors: LoginFormErrors } => {
  const errors: LoginFormErrors = {};
  let isValid = true;
  
  // Email validation
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.email = true;
    isValid = false;
    toast.error("Nieprawidłowy adres email");
  }
  
  // Password validation
  if (!password) {
    errors.password = true;
    isValid = false;
    toast.error("Wprowadź hasło");
  }
  
  return { isValid, errors };
};
