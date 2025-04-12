export * from './jwtTypes';
export * from './groupTypes';
export * from './listTypes';

export enum OtpMethod {
  EMAIL = 'email',
  SMS = 'sms',
}

export interface OTPSendParams {
  method: OtpMethod;
  destination: string;
  otp: string;
}

export interface UserProfileUpdateData {
  name?: string;
  username?: string;
  email?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
}
