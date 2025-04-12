"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validatePhoneNumber = exports.validatePassword = exports.validateEmail = void 0;
const AppError_1 = require("../AppError/AppError");
const errorCases_1 = require("../errorCases/errorCases");
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: errorCases_1.ValidationErrors.InvalidEmail().message };
    }
    return { isValid: true };
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!strongPasswordRegex.test(password)) {
        return { isValid: false, message: errorCases_1.ValidationErrors.InvalidPassword().message };
    }
    return { isValid: true };
};
exports.validatePassword = validatePassword;
const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return { isValid: false, message: errorCases_1.ValidationErrors.InvalidPhone().message };
    }
    return { isValid: true };
};
exports.validatePhoneNumber = validatePhoneNumber;
const validate = (validations) => {
    for (const validation of validations) {
        if (!validation.isValid && validation.message) {
            throw AppError_1.Errors.Validation({
                message: validation.message,
                errorCode: 'VALIDATION_ERROR',
            });
        }
    }
};
exports.validate = validate;
