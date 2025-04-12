import { ErrorParams } from '@/utils/AppError';

export const UserErrors = {
  NotFound: (): ErrorParams => ({
    message: 'User not found',
    errorCode: 'USER_NOT_FOUND',
  }),

  InvalidName: (): ErrorParams => ({
    message: 'Invalid username',
    errorCode: 'INVALID_USER_NAME',
  }),

  InvalidStatus: (): ErrorParams => ({
    message: 'Invalid status value',
    errorCode: 'INVALID_STATUS_VALUE',
  }),

  InvalidRole: (): ErrorParams => ({
    message: 'Invalid role value',
    errorCode: 'INVALID_ROLE_VALUE',
  }),

  AlreadyExists: (): ErrorParams => ({
    message: 'User already exists',
    errorCode: 'USER_ALREADY_EXISTS',
  }),

  InvalidCredentials: (): ErrorParams => ({
    message: 'Invalid credentials',
    errorCode: 'INVALID_CREDENTIALS',
  }),

  MissingRequiredFields: (): ErrorParams => ({
    message: 'Please provide name, username, password, and either email or phone number',
    errorCode: 'USER_MISSING_REQUIRED_FIELDS',
  }),

  IdentifierInUse: (): ErrorParams => ({
    message: 'Username, email, or phone number already in use',
    errorCode: 'USER_IDENTIFIER_IN_USE',
  }),

  CurrentPasswordIncorrect: (): ErrorParams => ({
    message: 'Current password is incorrect',
    errorCode: 'USER_CURRENT_PASSWORD_INCORRECT',
  }),
};

export const AuthErrors = {
  TokenMissing: (): ErrorParams => ({
    message: 'No token, authorization denied',
    errorCode: 'AUTH_TOKEN_MISSING',
  }),

  TokenInvalid: (): ErrorParams => ({
    message: 'Token is not valid',
    errorCode: 'AUTH_TOKEN_INVALID',
  }),

  InsufficientRole: (): ErrorParams => ({
    message: 'Permission denied',
    errorCode: 'AUTH_INSUFFICIENT_ROLE',
  }),

  AccountNotVerified: (): ErrorParams => ({
    message: 'Account is not verified',
    errorCode: 'AUTH_ACCOUNT_NOT_VERIFIED',
  }),

  AccountSuspended: (status: string): ErrorParams => ({
    message: `Account is ${status.toLowerCase()}`,
    errorCode: 'AUTH_ACCOUNT_SUSPENDED',
  }),
};

export const ValidationErrors = {
  MissingField: (field: string): ErrorParams => ({
    message: `${field} is required`,
    errorCode: 'VALIDATION_MISSING_FIELD',
  }),

  InvalidEmail: (): ErrorParams => ({
    message: 'Invalid email format',
    errorCode: 'VALIDATION_INVALID_EMAIL',
  }),

  InvalidPassword: (): ErrorParams => ({
    message: 'Password must be at least 8 characters with one uppercase, one lowercase, and one number',
    errorCode: 'VALIDATION_INVALID_PASSWORD',
  }),

  InvalidPhone: (): ErrorParams => ({
    message: 'Invalid phone number format',
    errorCode: 'VALIDATION_INVALID_PHONE',
  }),

  MissingRequired: (message: string): ErrorParams => ({
    message,
    errorCode: 'VALIDATION_MISSING_REQUIRED',
  }),
};

export const VerificationErrors = {
  MissingCode: (): ErrorParams => ({
    message: 'Please provide verification code',
    errorCode: 'VERIFICATION_MISSING_CODE',
  }),

  AccountAlreadyVerified: (): ErrorParams => ({
    message: 'Account already verified',
    errorCode: 'VERIFICATION_ACCOUNT_ALREADY_VERIFIED',
  }),

  InvalidCode: (): ErrorParams => ({
    message: 'Invalid verification code',
    errorCode: 'VERIFICATION_INVALID_CODE',
  }),

  CodeExpired: (): ErrorParams => ({
    message: 'Verification code has expired',
    errorCode: 'VERIFICATION_CODE_EXPIRED',
  }),

  MissingIdentifier: (): ErrorParams => ({
    message: 'Please provide email, phone number, or username',
    errorCode: 'VERIFICATION_MISSING_IDENTIFIER',
  }),

  InvalidReset: (): ErrorParams => ({
    message: 'Invalid reset information',
    errorCode: 'VERIFICATION_INVALID_RESET',
  }),

  InvalidResetToken: (): ErrorParams => ({
    message: 'Invalid reset token',
    errorCode: 'VERIFICATION_INVALID_RESET_TOKEN',
  }),

  ResetTokenExpired: (): ErrorParams => ({
    message: 'Reset token has expired',
    errorCode: 'VERIFICATION_RESET_TOKEN_EXPIRED',
  }),
};
export const GroupErrors = {
  NotFound: (): ErrorParams => ({
    message: 'Group not found',
    errorCode: 'GROUP_NOT_FOUND',
  }),

  MemberAlreadyExists: (): ErrorParams => ({
    message: 'User is already a member of this group',
    errorCode: 'GROUP_MEMBER_ALREADY_EXISTS',
  }),

  CannotRemoveLastOwner: (): ErrorParams => ({
    message: 'Cannot remove the last group owner',
    errorCode: 'GROUP_CANNOT_REMOVE_LAST_OWNER',
  }),

  InsufficientPermissions: (): ErrorParams => ({
    message: 'Insufficient permissions for this group action',
    errorCode: 'GROUP_INSUFFICIENT_PERMISSIONS',
  }),

  InvalidInviteCode: (): ErrorParams => ({
    message: 'Invalid group invite code',
    errorCode: 'GROUP_INVALID_INVITE_CODE',
  }),

  MissingRequiredFields: (): ErrorParams => ({
    message: 'Group name is required',
    errorCode: 'GROUP_MISSING_REQUIRED_FIELDS',
  }),
};

export const ListErrors = {
  NotFound: (): ErrorParams => ({
    message: 'List not found',
    errorCode: 'LIST_NOT_FOUND',
  }),
  InsufficientPermissions: (): ErrorParams => ({
    message: 'Insufficient permissions for this list action',
    errorCode: 'LIST_INSUFFICIENT_PERMISSIONS',
  }),
  CollaboratorAlreadyExists: (): ErrorParams => ({
    message: 'Collaborator already exists in the list',
    errorCode: 'LIST_COLLABORATOR_ALREADY_EXISTS',
  }),
  InvalidRecurrencePattern: (): ErrorParams => ({
    message: 'Invalid recurrence pattern',
    errorCode: 'LIST_INVALID_RECURRENCE',
  }),
  MissingRequiredFields: (): ErrorParams => ({
    message: 'Missing required list fields',
    errorCode: 'LIST_MISSING_REQUIRED_FIELDS',
  }),
};
