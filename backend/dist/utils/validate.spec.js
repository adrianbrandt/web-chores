"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("./validate");
const AppError_1 = require("./AppError");
// Mock the Errors utility
jest.mock('./AppError', () => ({
    Errors: {
        Validation: jest.fn().mockImplementation((params) => {
            throw new Error(params.message);
        }),
    },
}));
describe('Validation Utils', () => {
    describe('validateEmail', () => {
        it('should return isValid true for valid emails', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'user+tag@example.org',
                'user123@subdomain.domain.com',
            ];
            validEmails.forEach((email) => {
                const result = (0, validate_1.validateEmail)(email);
                expect(result.isValid).toBe(true);
                expect(result.message).toBeUndefined();
            });
        });
        it('should return isValid false for invalid emails', () => {
            // Only use examples that definitely fail the validation regex
            const invalidEmails = [
                'plaintext', // Not an email
                '@missingusername.com', // Missing username
                'user@', // Missing domain
                'user@.', // Invalid domain
                'user@@domain.com', // Double @ symbol
                'missing@domain', // Missing TLD
                'user name@domain.com', // Has space
            ];
            invalidEmails.forEach((email) => {
                const result = (0, validate_1.validateEmail)(email);
                expect(result.isValid).toBe(false);
                expect(result.message).toBe('Invalid email format');
            });
        });
    });
    describe('validatePassword', () => {
        it('should return isValid true for valid passwords', () => {
            const validPasswords = ['Password123', 'StrongP4ssword', 'C0mplexP@ssw0rd', 'Abcdefg1'];
            validPasswords.forEach((password) => {
                const result = (0, validate_1.validatePassword)(password);
                expect(result.isValid).toBe(true);
                expect(result.message).toBeUndefined();
            });
        });
        it('should return isValid false for passwords that are too short', () => {
            const shortPasswords = ['Pass1', 'Abc1', 'Ab1'];
            shortPasswords.forEach((password) => {
                const result = (0, validate_1.validatePassword)(password);
                expect(result.isValid).toBe(false);
                expect(result.message).toBe('Password must be at least 8 characters long');
            });
        });
        it('should return isValid false for passwords without required character types', () => {
            const invalidPasswords = [
                'password123', // missing uppercase
                'PASSWORD123', // missing lowercase
                'Passwordabc', // missing number
                '12345678', // missing letters
                'abcdefgh', // missing uppercase and numbers
            ];
            invalidPasswords.forEach((password) => {
                const result = (0, validate_1.validatePassword)(password);
                expect(result.isValid).toBe(false);
                expect(result.message).toBe('Password must be at least 8 characters with one uppercase, one lowercase, and one number');
            });
        });
    });
    describe('validatePhoneNumber', () => {
        it('should return isValid true for valid phone numbers', () => {
            const validPhoneNumbers = [
                '+11234567890',
                '+442071234567',
                '+61291234567',
                '+12345678901',
                '12345678901',
                '123', // Short numbers are also valid according to the regex
            ];
            validPhoneNumbers.forEach((phoneNumber) => {
                const result = (0, validate_1.validatePhoneNumber)(phoneNumber);
                expect(result.isValid).toBe(true);
                expect(result.message).toBeUndefined();
            });
        });
        it('should return isValid false for invalid phone numbers', () => {
            const invalidPhoneNumbers = [
                'abc123', // Contains letters
                'ab+1234567890', // Plus sign not at start
                '0', // Doesn't start with 1-9 after optional +
                '+0', // Leading zero after plus
                '+', // Just a plus sign
            ];
            invalidPhoneNumbers.forEach((phoneNumber) => {
                const result = (0, validate_1.validatePhoneNumber)(phoneNumber);
                expect(result.isValid).toBe(false);
                expect(result.message).toBe('Invalid phone number format');
            });
        });
    });
    describe('validate', () => {
        it('should not throw error for valid validations', () => {
            const validValidations = [{ isValid: true }, { isValid: true }];
            expect(() => (0, validate_1.validate)(validValidations)).not.toThrow();
        });
        it('should throw error for first invalid validation', () => {
            const invalidValidations = [
                { isValid: true },
                { isValid: false, message: 'First error' },
                { isValid: false, message: 'Second error' },
            ];
            expect(() => (0, validate_1.validate)(invalidValidations)).toThrow('First error');
            expect(AppError_1.Errors.Validation).toHaveBeenCalledWith({
                message: 'First error',
                errorCode: 'VALIDATION_ERROR',
            });
        });
        it('should not throw error if invalid validation has no message', () => {
            const validations = [
                { isValid: false }, // No message
            ];
            expect(() => (0, validate_1.validate)(validations)).not.toThrow();
        });
    });
});
