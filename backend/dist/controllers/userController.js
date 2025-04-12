"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.changePassword = exports.updateProfile = exports.getProfile = exports.resetPassword = exports.requestPasswordReset = exports.resendVerification = exports.verifyAccount = exports.login = exports.register = void 0;
const userService = __importStar(require("../services/userService"));
const logger_1 = __importDefault(require("../config/logger"));
const AppError_1 = require("@/utils/AppError/AppError");
const errorCases_1 = require("@/utils/errorCases/errorCases");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body;
    logger_1.default.debug('Registration attempt', { username: userData.username });
    const result = yield userService.registerUser(req.context, userData);
    logger_1.default.info('User registered successfully', {
        userId: result.user.id,
        username: result.user.username,
    });
    res.status(201).json({
        message: 'User registered successfully',
        token: result.token,
        needsVerification: result.needsVerification,
    });
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identifier, password } = req.body;
    const result = yield userService.loginUser(req.context, identifier, password);
    logger_1.default.info('User logged in successfully', {
        userId: result.user.id,
        username: result.user.username,
    });
    res.json({
        message: 'Login successful',
        token: result.token,
        isVerified: result.isVerified,
    });
});
exports.login = login;
const verifyAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { otp } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.AuthErrors.TokenMissing());
    }
    yield userService.verifyUserAccount(req.context, userId, otp);
    res.json({ message: 'Account verified successfully' });
});
exports.verifyAccount = verifyAccount;
const resendVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.AuthErrors.TokenMissing());
    }
    yield userService.resendVerificationCode(req.context, userId);
    res.json({ message: 'Verification code resent successfully' });
});
exports.resendVerification = resendVerification;
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identifier } = req.body;
    yield userService.requestPasswordResetToken(req.context, identifier);
    res.json({ message: 'If the account exists, a reset code has been sent' });
});
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identifier, token, newPassword } = req.body;
    yield userService.resetUserPassword(req.context, identifier, token, newPassword);
    res.json({ message: 'Password has been reset successfully' });
});
exports.resetPassword = resetPassword;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.AuthErrors.TokenMissing());
    }
    const user = yield userService.getUserProfile(req.context, userId);
    res.json(user);
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.AuthErrors.TokenMissing());
    }
    const profileData = req.body;
    const updatedUser = yield userService.updateUserProfile(req.context, userId, profileData);
    res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
    });
});
exports.updateProfile = updateProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.AuthErrors.TokenMissing());
    }
    const { currentPassword, newPassword } = req.body;
    yield userService.changeUserPassword(req.context, userId, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
});
exports.changePassword = changePassword;
