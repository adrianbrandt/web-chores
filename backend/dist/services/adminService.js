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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.updateUserStatus = exports.getUserByUsername = exports.getAllUsers = void 0;
const client_1 = require("@/generated/client");
const AppError_1 = require("@/utils/AppError");
const errorCases_1 = require("@/utils/errorCases");
const getAllUsers = (context) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.user.findMany({
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            phoneNumber: true,
            isVerified: true,
            accountStatus: true,
            role: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
        },
    });
});
exports.getAllUsers = getAllUsers;
const getUserByUsername = (context, username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield context.db.user.findUnique({
        where: { username },
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
exports.getUserByUsername = getUserByUsername;
const updateUserStatus = (context, username, status) => __awaiter(void 0, void 0, void 0, function* () {
    if (!username) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidName());
    }
    if (!Object.values(client_1.AccountStatus).includes(status)) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidStatus());
    }
    const user = yield context.db.user.findUnique({
        where: { username },
    });
    if (!user) {
        throw AppError_1.Errors.NotFound(errorCases_1.UserErrors.NotFound());
    }
    return context.db.user.update({
        where: { id: user.id },
        data: { accountStatus: status },
        select: {
            id: true,
            username: true,
            accountStatus: true,
        },
    });
});
exports.updateUserStatus = updateUserStatus;
const updateUserRole = (context, username, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (!username) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidName());
    }
    if (!Object.values(client_1.UserRole).includes(role)) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidRole());
    }
    const user = yield context.db.user.findUnique({
        where: { username },
    });
    if (!user) {
        throw AppError_1.Errors.NotFound(errorCases_1.UserErrors.NotFound());
    }
    return context.db.user.update({
        where: { id: user.id },
        data: { role },
        select: {
            id: true,
            username: true,
            role: true,
        },
    });
});
exports.updateUserRole = updateUserRole;
const deleteUser = (context, username) => __awaiter(void 0, void 0, void 0, function* () {
    if (!username) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidName());
    }
    const user = yield context.db.user.findUnique({
        where: { username },
    });
    if (!user) {
        throw AppError_1.Errors.NotFound(errorCases_1.UserErrors.NotFound());
    }
    yield context.db.user.delete({
        where: { id: user.id },
    });
    return true;
});
exports.deleteUser = deleteUser;
