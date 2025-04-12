import { UserErrors, AuthErrors, ValidationErrors, VerificationErrors } from './errorCases';

describe('Error Cases', () => {
  describe('UserErrors', () => {
    it('should return correct not found error', () => {
      const error = UserErrors.NotFound();
      expect(error.message).toBe('User not found');
      expect(error.errorCode).toBe('USER_NOT_FOUND');
    });

    it('should return correct invalid ID error', () => {
      const error = UserErrors.InvalidName();
      expect(error.message).toBe('Invalid username');
      expect(error.errorCode).toBe('INVALID_USER_NAME');
    });

    it('should return correct invalid status error', () => {
      const error = UserErrors.InvalidStatus();
      expect(error.message).toBe('Invalid status value');
      expect(error.errorCode).toBe('INVALID_STATUS_VALUE');
    });

    it('should return correct invalid role error', () => {
      const error = UserErrors.InvalidRole();
      expect(error.message).toBe('Invalid role value');
      expect(error.errorCode).toBe('INVALID_ROLE_VALUE');
    });

    it('should return correct already exists error', () => {
      const error = UserErrors.AlreadyExists();
      expect(error.message).toBe('User already exists');
      expect(error.errorCode).toBe('USER_ALREADY_EXISTS');
    });

    it('should return correct invalid credentials error', () => {
      const error = UserErrors.InvalidCredentials();
      expect(error.message).toBe('Invalid credentials');
      expect(error.errorCode).toBe('INVALID_CREDENTIALS');
    });

    it('should return correct missing required fields error', () => {
      const error = UserErrors.MissingRequiredFields();
      expect(error.message).toBe('Please provide name, username, password, and either email or phone number');
      expect(error.errorCode).toBe('USER_MISSING_REQUIRED_FIELDS');
    });

    it('should return correct identifier in use error', () => {
      const error = UserErrors.IdentifierInUse();
      expect(error.message).toBe('Username, email, or phone number already in use');
      expect(error.errorCode).toBe('USER_IDENTIFIER_IN_USE');
    });

    it('should return correct current password incorrect error', () => {
      const error = UserErrors.CurrentPasswordIncorrect();
      expect(error.message).toBe('Current password is incorrect');
      expect(error.errorCode).toBe('USER_CURRENT_PASSWORD_INCORRECT');
    });
  });

  describe('AuthErrors', () => {
    it('should return correct token missing error', () => {
      const error = AuthErrors.TokenMissing();
      expect(error.message).toBe('No token, authorization denied');
      expect(error.errorCode).toBe('AUTH_TOKEN_MISSING');
    });

    it('should return correct token invalid error', () => {
      const error = AuthErrors.TokenInvalid();
      expect(error.message).toBe('Token is not valid');
      expect(error.errorCode).toBe('AUTH_TOKEN_INVALID');
    });

    it('should return correct insufficient role error', () => {
      const error = AuthErrors.InsufficientRole();
      expect(error.message).toBe('Permission denied');
      expect(error.errorCode).toBe('AUTH_INSUFFICIENT_ROLE');
    });

    it('should return correct account not verified error', () => {
      const error = AuthErrors.AccountNotVerified();
      expect(error.message).toBe('Account is not verified');
      expect(error.errorCode).toBe('AUTH_ACCOUNT_NOT_VERIFIED');
    });

    it('should return correct account suspended error with status', () => {
      const error = AuthErrors.AccountSuspended('SUSPENDED');
      expect(error.message).toBe('Account is suspended');
      expect(error.errorCode).toBe('AUTH_ACCOUNT_SUSPENDED');
    });
  });

  describe('ValidationErrors', () => {
    it('should return correct missing field error with field name', () => {
      const error = ValidationErrors.MissingField('Email');
      expect(error.message).toBe('Email is required');
      expect(error.errorCode).toBe('VALIDATION_MISSING_FIELD');
    });

    it('should return correct invalid email error', () => {
      const error = ValidationErrors.InvalidEmail();
      expect(error.message).toBe('Invalid email format');
      expect(error.errorCode).toBe('VALIDATION_INVALID_EMAIL');
    });

    it('should return correct invalid password error', () => {
      const error = ValidationErrors.InvalidPassword();
      expect(error.message).toBe(
        'Password must be at least 8 characters with one uppercase, one lowercase, and one number'
      );
      expect(error.errorCode).toBe('VALIDATION_INVALID_PASSWORD');
    });

    it('should return correct invalid phone error', () => {
      const error = ValidationErrors.InvalidPhone();
      expect(error.message).toBe('Invalid phone number format');
      expect(error.errorCode).toBe('VALIDATION_INVALID_PHONE');
    });

    it('should return correct missing required error with custom message', () => {
      const customMessage = 'All fields must be filled';
      const error = ValidationErrors.MissingRequired(customMessage);
      expect(error.message).toBe(customMessage);
      expect(error.errorCode).toBe('VALIDATION_MISSING_REQUIRED');
    });
  });

  describe('VerificationErrors', () => {
    it('should return correct missing code error', () => {
      const error = VerificationErrors.MissingCode();
      expect(error.message).toBe('Please provide verification code');
      expect(error.errorCode).toBe('VERIFICATION_MISSING_CODE');
    });

    it('should return correct account already verified error', () => {
      const error = VerificationErrors.AccountAlreadyVerified();
      expect(error.message).toBe('Account already verified');
      expect(error.errorCode).toBe('VERIFICATION_ACCOUNT_ALREADY_VERIFIED');
    });

    it('should return correct invalid code error', () => {
      const error = VerificationErrors.InvalidCode();
      expect(error.message).toBe('Invalid verification code');
      expect(error.errorCode).toBe('VERIFICATION_INVALID_CODE');
    });

    it('should return correct code expired error', () => {
      const error = VerificationErrors.CodeExpired();
      expect(error.message).toBe('Verification code has expired');
      expect(error.errorCode).toBe('VERIFICATION_CODE_EXPIRED');
    });

    it('should return correct missing identifier error', () => {
      const error = VerificationErrors.MissingIdentifier();
      expect(error.message).toBe('Please provide email, phone number, or username');
      expect(error.errorCode).toBe('VERIFICATION_MISSING_IDENTIFIER');
    });

    it('should return correct invalid reset error', () => {
      const error = VerificationErrors.InvalidReset();
      expect(error.message).toBe('Invalid reset information');
      expect(error.errorCode).toBe('VERIFICATION_INVALID_RESET');
    });

    it('should return correct invalid reset token error', () => {
      const error = VerificationErrors.InvalidResetToken();
      expect(error.message).toBe('Invalid reset token');
      expect(error.errorCode).toBe('VERIFICATION_INVALID_RESET_TOKEN');
    });

    it('should return correct reset token expired error', () => {
      const error = VerificationErrors.ResetTokenExpired();
      expect(error.message).toBe('Reset token has expired');
      expect(error.errorCode).toBe('VERIFICATION_RESET_TOKEN_EXPIRED');
    });
  });
});
