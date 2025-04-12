import { AppContext } from '@/context';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Errors } from '@/utils/AppError/AppError';
import { AuthErrors, UserErrors, ValidationErrors, VerificationErrors } from '@/utils/errorCases/errorCases';
import { JwtPayload, OtpMethod, OTPSendParams, UserProfileUpdateData } from '@/types';
import logger from '@/config/logger';

dotenv.config();

const getJwtSecret = () => process.env.JWT_SECRET ?? '';

const OTP_EXPIRY_MINUTES = 10;

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async ({ method, destination, otp }: OTPSendParams) => {
  if (method === 'email') {
    logger.info(`[EMAIL OTP] To: ${destination}, Code: ${otp}`);
  } else {
    logger.info(`[SMS OTP] To: ${destination}, Code: ${otp}`);
  }
  return true;
};

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '1h' });
};

export const registerUser = async (
  context: AppContext,
  userData: {
    name: string;
    username: string;
    email?: string;
    phoneNumber?: string;
    password: string;
  }
) => {
  const { name, username, email, phoneNumber, password } = userData;

  if (!name || !username || !password || (!email && !phoneNumber)) {
    throw Errors.BadRequest(UserErrors.MissingRequiredFields());
  }

  const existingUser = await context.db.user.findFirst({
    where: {
      OR: [{ username }, ...(email ? [{ email }] : []), ...(phoneNumber ? [{ phoneNumber }] : [])],
    },
  });

  if (existingUser) {
    throw Errors.Conflict(UserErrors.AlreadyExists());
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const otp = generateOTP();
  const verificationExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const user = await context.db.user.create({
    data: {
      name,
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      verificationCode: otp,
      verificationExpires,
    },
  });

  if (email) {
    await sendOTP({ method: OtpMethod.EMAIL, destination: email, otp });
  } else if (phoneNumber) {
    await sendOTP({ method: OtpMethod.SMS, destination: phoneNumber, otp });
  }

  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  const token = generateToken(payload);

  return {
    user,
    token,
    needsVerification: true,
  };
};

export const loginUser = async (context: AppContext, identifier: string, password: string) => {
  if (!identifier || !password) {
    throw Errors.BadRequest(ValidationErrors.MissingRequired('Please provide username/email/phone and password'));
  }

  const user = await context.db.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }, { phoneNumber: identifier }],
    },
  });

  if (!user) {
    throw Errors.BadRequest(UserErrors.InvalidCredentials());
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw Errors.BadRequest(UserErrors.InvalidCredentials());
  }

  if (user.accountStatus !== 'ACTIVE') {
    throw Errors.Unauthorized(AuthErrors.AccountSuspended(user.accountStatus.toString()));
  }

  await context.db.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  const token = generateToken(payload);

  return {
    user,
    token,
    isVerified: user.isVerified,
  };
};

export const verifyUserAccount = async (context: AppContext, userId: string, otp: string) => {
  if (!otp) {
    throw Errors.BadRequest(VerificationErrors.MissingCode());
  }

  const user = await context.db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw Errors.NotFound(UserErrors.NotFound());
  }

  if (user.isVerified) {
    throw Errors.BadRequest(VerificationErrors.AccountAlreadyVerified());
  }

  if (user.verificationCode !== otp) {
    throw Errors.BadRequest(VerificationErrors.InvalidCode());
  }

  if (user.verificationExpires && user.verificationExpires < new Date()) {
    throw Errors.BadRequest(VerificationErrors.CodeExpired());
  }

  return context.db.user.update({
    where: { id: userId },
    data: {
      isVerified: true,
      verificationCode: null,
      verificationExpires: null,
    },
  });
};

export const resendVerificationCode = async (context: AppContext, userId: string) => {
  const user = await context.db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw Errors.NotFound(UserErrors.NotFound());
  }

  if (user.isVerified) {
    throw Errors.BadRequest(VerificationErrors.AccountAlreadyVerified());
  }

  const otp = generateOTP();
  const verificationExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await context.db.user.update({
    where: { id: userId },
    data: {
      verificationCode: otp,
      verificationExpires,
    },
  });

  if (user.email) {
    await sendOTP({ method: OtpMethod.EMAIL, destination: user.email, otp });
  } else if (user.phoneNumber) {
    await sendOTP({ method: OtpMethod.SMS, destination: user.phoneNumber, otp });
  }

  return true;
};

export const requestPasswordResetToken = async (context: AppContext, identifier: string) => {
  if (!identifier) {
    throw Errors.BadRequest(VerificationErrors.MissingIdentifier());
  }

  const user = await context.db.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phoneNumber: identifier }, { username: identifier }],
    },
  });

  if (!user) {
    return true;
  }

  const otp = generateOTP();
  const resetExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await context.db.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: otp,
      passwordResetExpires: resetExpires,
    },
  });

  if (user.email) {
    await sendOTP({ method: OtpMethod.EMAIL, destination: user.email, otp });
  } else if (user.phoneNumber) {
    await sendOTP({ method: OtpMethod.SMS, destination: user.phoneNumber, otp });
  }

  return true;
};

export const resetUserPassword = async (
  context: AppContext,
  identifier: string,
  token: string,
  newPassword: string
) => {
  if (!identifier || !token || !newPassword) {
    throw Errors.BadRequest(ValidationErrors.MissingRequired('Please provide all required fields'));
  }

  const user = await context.db.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phoneNumber: identifier }, { username: identifier }],
    },
  });

  if (!user) {
    throw Errors.BadRequest(VerificationErrors.InvalidReset());
  }

  if (user.passwordResetToken !== token) {
    throw Errors.BadRequest(VerificationErrors.InvalidResetToken());
  }

  if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
    throw Errors.BadRequest(VerificationErrors.ResetTokenExpired());
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  return context.db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
};

export const getUserProfile = async (context: AppContext, userId: string) => {
  const user = await context.db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phoneNumber: true,
      avatarUrl: true,
      isVerified: true,
      accountStatus: true,
      role: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw Errors.NotFound(UserErrors.NotFound());
  }

  return user;
};

export const updateUserProfile = async (context: AppContext, userId: string, profileData: UserProfileUpdateData) => {
  const { username, email, phoneNumber } = profileData;

  if (username || email || phoneNumber) {
    const existingUser = await context.db.user.findFirst({
      where: {
        OR: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : []),
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
        NOT: {
          id: userId,
        },
      },
    });

    if (existingUser) {
      throw Errors.Conflict(UserErrors.IdentifierInUse());
    }
  }

  const updateData = Object.fromEntries(Object.entries(profileData).filter(([_, value]) => value !== undefined));

  return context.db.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phoneNumber: true,
      avatarUrl: true,
      isVerified: true,
      accountStatus: true,
      role: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const changeUserPassword = async (
  context: AppContext,
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  if (!currentPassword || !newPassword) {
    throw Errors.BadRequest(ValidationErrors.MissingRequired('Please provide current and new password'));
  }

  const user = await context.db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw Errors.NotFound(UserErrors.NotFound());
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw Errors.BadRequest(UserErrors.CurrentPasswordIncorrect());
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await context.db.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return true;
};
