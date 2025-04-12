"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserPassword = exports.updateUserProfile = exports.getUserProfile = exports.resetUserPassword = exports.requestPasswordResetToken = exports.resendVerificationCode = exports.verifyUserAccount = exports.loginUser = exports.registerUser = exports.generateToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const AppError_1 = require("@/utils/AppError/AppError");
const errorCases_1 = require("@/utils/errorCases/errorCases");
const types_1 = require("@/types");
const logger_1 = __importDefault(require("@/config/logger"));
dotenv_1.default.config();
const getJwtSecret = () => { var _a; return (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : ''; };
const OTP_EXPIRY_MINUTES = 10;
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const sendOTP = (_a) => __awaiter(void 0, [_a], void 0, function* ({ method, destination, otp }) {
    if (method === 'email') {
        logger_1.default.info(`[EMAIL OTP] To: ${destination}, Code: ${otp}`);
    }
    else {
        logger_1.default.info(`[SMS OTP] To: ${destination}, Code: ${otp}`);
    }
    return true;
});
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, getJwtSecret(), { expiresIn: '1h' });
};
exports.generateToken = generateToken;
const registerUser = (context, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, username, email, phoneNumber, password } = userData;
    if (!name || !username || !password || (!email && !phoneNumber)) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.MissingRequiredFields());
    }
    const existingUser = yield context.db.user.findFirst({
        where: {
            OR: [{ username }, ...(email ? [{ email }] : []), ...(phoneNumber ? [{ phoneNumber }] : [])],
        },
    });
    if (existingUser) {
        throw AppError_1.Errors.Conflict(errorCases_1.UserErrors.AlreadyExists());
    }
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    const otp = generateOTP();
    const verificationExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const user = yield context.db.user.create({
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
        yield sendOTP({ method: types_1.OtpMethod.EMAIL, destination: email, otp });
    }
    else if (phoneNumber) {
        yield sendOTP({ method: types_1.OtpMethod.SMS, destination: phoneNumber, otp });
    }
    const payload = {
        userId: user.id,
        username: user.username,
        role: user.role,
    };
    const token = (0, exports.generateToken)(payload);
    return {
        user,
        token,
        needsVerification: true,
    };
});
exports.registerUser = registerUser;
const loginUser = (context, identifier, password) => __awaiter(void 0, void 0, void 0, function* () {
    if (!identifier || !password) {
        throw AppError_1.Errors.BadRequest(errorCases_1.ValidationErrors.MissingRequired('Please provide username/email/phone and password'));
    }
    const user = yield context.db.user.findFirst({
        where: {
            OR: [{ username: identifier }, { email: identifier }, { phoneNumber: identifier }],
        },
    });
    if (!user) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidCredentials());
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidCredentials());
    }
    if (user.accountStatus !== 'ACTIVE') {
        throw AppError_1.Errors.Unauthorized(errorCases_1.AuthErrors.AccountSuspended(user.accountStatus.toString()));
    }
    yield context.db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });
    const payload = {
        userId: user.id,
        username: user.username,
        role: user.role,
    };
    const token = (0, exports.generateToken)(payload);
    return {
        user,
        token,
        isVerified: user.isVerified,
    };
});
exports.loginUser = loginUser;
const verifyUserAccount = (context, userId, otp) => __awaiter(void 0, void 0, void 0, function* () {
    if (!otp) {
        throw AppError_1.Errors.BadRequest(errorCases_1.VerificationErrors.MissingCode());
    }
    const user = yield context.db.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw AppError_1.Errors.NotFound(errorCases_1.UserErrors.NotFound());
    }
    if (user.isVerified) {
        throw AppError_1.Errors.BadRequest(errorCases_1.VerificationErrors.AccountAlreadyVerified());
    }
    if (user.verificationCode !== otp) {
        throw AppError_1.Errors.BadRequest(errorCases_1.VerificationErrors.InvalidCode());
    }
    if (user.verificationExpires && user.verificationExpires < new Date()) {
        throw AppError_1.Errors.BadRequest(errorCases_1.VerificationErrors.CodeExpired());
    }
    return context.db.user.update({
        where: { id: userId },
        data: {
            isVerified: true,
            verificationCode: null,
            verificationExpires: null,
        },
    });
});
exports.verifyUserAccount = verifyUserAccount;
const resendVerificationCode = (context, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield context.db.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw AppError_1.Errors.NotFound(errorCases_1.UserErrors.NotFound());
    }
    if (user.isVerified) {
        throw AppError_1.Errors.BadRequest(errorCases_1.VerificationErrors.AccountAlreadyVerified());
    }
    const otp = generateOTP();
    const verificationExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    yield context.db.user.update({
        where: { id: userId },
        data: {
            verificationCode: otp,
            verificationExpires,
        },
    });
    if (user.email) {
        yield sendOTP({ method: types_1.OtpMethod.EMAIL, destination: user.email, otp });
    }
    else if (user.phoneNumber) {
        yield sendOTP({ method: types_1.OtpMethod.SMS, destination: user.phoneNumber, otp });
    }
    return true;
});
exports.resendVerificationCode = resendVerificationCode;
const requestPasswordResetToken = (context, identifier) => __awaiter(void 0, void 0, void 0, function* () {
    if (!identifier) {
        throw AppError_1.Errors.BadRequest(errorCases_1.VerificationErrors.MissingIdentifier());
    }
    const user = yield context.db.user.findFirst({
        where: {
            OR: [{ email: identifier }, { phoneNumber: identifier }, { username: identifier }],
        },
    });
    if (!user) {
        return true;
    }
    const otp = generateOTP();
    const resetExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    yield context.db.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken: otp,
            passwordResetExpires: resetExpires,
        },
    });
    if (user.email) {
        yield sendOTP({ method: types_1.OtpMethod.EMAIL, destination: user.email, otp });
    }
    else if (user.phoneNumber) {
        yield sendOTP({ method: types_1.OtpMethod.SMS, destination: user.phoneNumber, otp });
    }
    return true;
});
exports.requestPasswordResetToken = requestPasswordResetToken;
const resetUserPassword = (context, identifier, token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (!identifier || !token || !newPassword) {
        throw AppError_1.Errors.BadRequest(errorCases_1.ValidationErrors.MissingRequired('Please provide all required fields'));
    }
    const user = yield context.db.user.findFirst({
        where: {
            OR: [{ email: identifier }, { phoneNumber: identifier }, { username: identifier }],
        },
    });
    if (!user) {
        throw AppError_1.Errors.BadRequest(errorCases_1.VerificationErrors.InvalidReset());
    }
    if (user.passwordResetToken !== token) {
        throw AppError_1.Errors.BadRequest(errorCases_1.VerificationErrors.InvalidResetToken());
    }
    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        throw AppError_1.Errors.BadRequest(errorCases_1.VerificationErrors.ResetTokenExpired());
    }
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
    return context.db.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
        },
    });
});
exports.resetUserPassword = resetUserPassword;
const getUserProfile = (context, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield context.db.user.findUnique({
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
        throw AppError_1.Errors.NotFound(errorCases_1.UserErrors.NotFound());
    }
    return user;
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (context, userId, profileData) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, phoneNumber } = profileData;
    if (username || email || phoneNumber) {
        const existingUser = yield context.db.user.findFirst({
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
            throw AppError_1.Errors.Conflict(errorCases_1.UserErrors.IdentifierInUse());
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
});
exports.updateUserProfile = updateUserProfile;
const changeUserPassword = (context, userId, currentPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (!currentPassword || !newPassword) {
        throw AppError_1.Errors.BadRequest(errorCases_1.ValidationErrors.MissingRequired('Please provide current and new password'));
    }
    const user = yield context.db.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw AppError_1.Errors.NotFound(errorCases_1.UserErrors.NotFound());
    }
    const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
    if (!isMatch) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.CurrentPasswordIncorrect());
    }
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
    yield context.db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
    return true;
});
exports.changeUserPassword = changeUserPassword;
