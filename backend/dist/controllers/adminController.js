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
exports.deleteUser = exports.updateUserRole = exports.updateUserStatus = exports.getUserByUsername = exports.getAllUsers = void 0;
const adminService = __importStar(require("../services/adminService"));
const logger_1 = __importDefault(require("../config/logger"));
const AppError_1 = require("@/utils/AppError");
const errorCases_1 = require("@/utils/errorCases");
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const users = yield adminService.getAllUsers(req.context);
    logger_1.default.debug('Admin retrieved all users', {
        adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        count: users.length,
    });
    res.json(users);
});
exports.getAllUsers = getAllUsers;
const getUserByUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username } = req.params;
    if (!username) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidName());
    }
    const user = yield adminService.getUserByUsername(req.context, username);
    logger_1.default.debug('Admin retrieved user details', {
        adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        targetUsername: username,
    });
    res.json(user);
});
exports.getUserByUsername = getUserByUsername;
const updateUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username } = req.params;
    const { status } = req.body;
    if (!username) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidName());
    }
    const updatedUser = yield adminService.updateUserStatus(req.context, username, status);
    logger_1.default.info('Admin updated user status', {
        adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        targetUsername: username,
        newStatus: status,
    });
    res.json({
        message: `User status updated to ${status.toLowerCase()}`,
        user: updatedUser,
    });
});
exports.updateUserStatus = updateUserStatus;
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username } = req.params;
    const { role } = req.body;
    if (!username) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidName());
    }
    const updatedUser = yield adminService.updateUserRole(req.context, username, role);
    logger_1.default.info('Admin updated user role', {
        adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        targetUsername: username,
        newRole: role,
    });
    res.json({
        message: `User role updated to ${role.toLowerCase()}`,
        user: updatedUser,
    });
});
exports.updateUserRole = updateUserRole;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username } = req.params;
    if (!username) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidName());
    }
    yield adminService.deleteUser(req.context, username);
    logger_1.default.info('Admin deleted user', {
        adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        targetUsername: username,
    });
    res.json({ message: 'User deleted successfully' });
});
exports.deleteUser = deleteUser;
