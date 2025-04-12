import { Errors } from '../AppError/AppError';
import { ValidationErrors } from '../errorCases/errorCases';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: ValidationErrors.InvalidEmail().message };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
  if (!strongPasswordRegex.test(password)) {
    return { isValid: false, message: ValidationErrors.InvalidPassword().message };
  }

  return { isValid: true };
};

export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return { isValid: false, message: ValidationErrors.InvalidPhone().message };
  }
  return { isValid: true };
};

export const validate = (validations: ValidationResult[]): void => {
  for (const validation of validations) {
    if (!validation.isValid && validation.message) {
      throw Errors.Validation({
        message: validation.message,
        errorCode: 'VALIDATION_ERROR',
      });
    }
  }
};
