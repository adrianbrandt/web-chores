"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListErrors = exports.GroupErrors = exports.VerificationErrors = exports.ValidationErrors = exports.AuthErrors = exports.UserErrors = void 0;
exports.UserErrors = {
    NotFound: () => ({
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
    }),
    InvalidName: () => ({
        message: 'Invalid username',
        errorCode: 'INVALID_USER_NAME',
    }),
    InvalidStatus: () => ({
        message: 'Invalid status value',
        errorCode: 'INVALID_STATUS_VALUE',
    }),
    InvalidRole: () => ({
        message: 'Invalid role value',
        errorCode: 'INVALID_ROLE_VALUE',
    }),
    AlreadyExists: () => ({
        message: 'User already exists',
        errorCode: 'USER_ALREADY_EXISTS',
    }),
    InvalidCredentials: () => ({
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS',
    }),
    MissingRequiredFields: () => ({
        message: 'Please provide name, username, password, and either email or phone number',
        errorCode: 'USER_MISSING_REQUIRED_FIELDS',
    }),
    IdentifierInUse: () => ({
        message: 'Username, email, or phone number already in use',
        errorCode: 'USER_IDENTIFIER_IN_USE',
    }),
    CurrentPasswordIncorrect: () => ({
        message: 'Current password is incorrect',
        errorCode: 'USER_CURRENT_PASSWORD_INCORRECT',
    }),
};
exports.AuthErrors = {
    TokenMissing: () => ({
        message: 'No token, authorization denied',
        errorCode: 'AUTH_TOKEN_MISSING',
    }),
    TokenInvalid: () => ({
        message: 'Token is not valid',
        errorCode: 'AUTH_TOKEN_INVALID',
    }),
    InsufficientRole: () => ({
        message: 'Permission denied',
        errorCode: 'AUTH_INSUFFICIENT_ROLE',
    }),
    AccountNotVerified: () => ({
        message: 'Account is not verified',
        errorCode: 'AUTH_ACCOUNT_NOT_VERIFIED',
    }),
    AccountSuspended: (status) => ({
        message: `Account is ${status.toLowerCase()}`,
        errorCode: 'AUTH_ACCOUNT_SUSPENDED',
    }),
};
exports.ValidationErrors = {
    MissingField: (field) => ({
        message: `${field} is required`,
        errorCode: 'VALIDATION_MISSING_FIELD',
    }),
    InvalidEmail: () => ({
        message: 'Invalid email format',
        errorCode: 'VALIDATION_INVALID_EMAIL',
    }),
    InvalidPassword: () => ({
        message: 'Password must be at least 8 characters with one uppercase, one lowercase, and one number',
        errorCode: 'VALIDATION_INVALID_PASSWORD',
    }),
    InvalidPhone: () => ({
        message: 'Invalid phone number format',
        errorCode: 'VALIDATION_INVALID_PHONE',
    }),
    MissingRequired: (message) => ({
        message,
        errorCode: 'VALIDATION_MISSING_REQUIRED',
    }),
};
exports.VerificationErrors = {
    MissingCode: () => ({
        message: 'Please provide verification code',
        errorCode: 'VERIFICATION_MISSING_CODE',
    }),
    AccountAlreadyVerified: () => ({
        message: 'Account already verified',
        errorCode: 'VERIFICATION_ACCOUNT_ALREADY_VERIFIED',
    }),
    InvalidCode: () => ({
        message: 'Invalid verification code',
        errorCode: 'VERIFICATION_INVALID_CODE',
    }),
    CodeExpired: () => ({
        message: 'Verification code has expired',
        errorCode: 'VERIFICATION_CODE_EXPIRED',
    }),
    MissingIdentifier: () => ({
        message: 'Please provide email, phone number, or username',
        errorCode: 'VERIFICATION_MISSING_IDENTIFIER',
    }),
    InvalidReset: () => ({
        message: 'Invalid reset information',
        errorCode: 'VERIFICATION_INVALID_RESET',
    }),
    InvalidResetToken: () => ({
        message: 'Invalid reset token',
        errorCode: 'VERIFICATION_INVALID_RESET_TOKEN',
    }),
    ResetTokenExpired: () => ({
        message: 'Reset token has expired',
        errorCode: 'VERIFICATION_RESET_TOKEN_EXPIRED',
    }),
};
exports.GroupErrors = {
    NotFound: () => ({
        message: 'Group not found',
        errorCode: 'GROUP_NOT_FOUND',
    }),
    MemberAlreadyExists: () => ({
        message: 'User is already a member of this group',
        errorCode: 'GROUP_MEMBER_ALREADY_EXISTS',
    }),
    CannotRemoveLastOwner: () => ({
        message: 'Cannot remove the last group owner',
        errorCode: 'GROUP_CANNOT_REMOVE_LAST_OWNER',
    }),
    InsufficientPermissions: () => ({
        message: 'Insufficient permissions for this group action',
        errorCode: 'GROUP_INSUFFICIENT_PERMISSIONS',
    }),
    InvalidInviteCode: () => ({
        message: 'Invalid group invite code',
        errorCode: 'GROUP_INVALID_INVITE_CODE',
    }),
    MissingRequiredFields: () => ({
        message: 'Group name is required',
        errorCode: 'GROUP_MISSING_REQUIRED_FIELDS',
    }),
};
exports.ListErrors = {
    NotFound: () => ({
        message: 'List not found',
        errorCode: 'LIST_NOT_FOUND',
    }),
    InsufficientPermissions: () => ({
        message: 'Insufficient permissions for this list action',
        errorCode: 'LIST_INSUFFICIENT_PERMISSIONS',
    }),
    CollaboratorAlreadyExists: () => ({
        message: 'Collaborator already exists in the list',
        errorCode: 'LIST_COLLABORATOR_ALREADY_EXISTS',
    }),
    InvalidRecurrencePattern: () => ({
        message: 'Invalid recurrence pattern',
        errorCode: 'LIST_INVALID_RECURRENCE',
    }),
    MissingRequiredFields: () => ({
        message: 'Missing required list fields',
        errorCode: 'LIST_MISSING_REQUIRED_FIELDS',
    }),
};
