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
exports.deleteUser = exports.updateUserRole = exports.updateUserStatus = exports.getUserById = exports.getAllUsers = void 0;
const client_1 = require("@/generated/client");
const AppError_1 = require("@/utils/AppError");
const errorCases_1 = require("@/utils/errorCases");
const getAllUsers = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.prisma.user.findMany({
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
            updatedAt: true
        }
    });
});
exports.getAllUsers = getAllUsers;
const getUserById = (userId, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(userId)) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidId());
    }
    const user = yield ctx.prisma.user.findUnique({
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
            updatedAt: true
        }
    });
    if (!user) {
        throw AppError_1.Errors.NotFound(errorCases_1.UserErrors.NotFound());
    }
    return user;
});
exports.getUserById = getUserById;
const updateUserStatus = (userId, status, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(userId)) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidId());
    }
    if (!Object.values(client_1.AccountStatus).includes(status)) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidStatus());
    }
    const user = yield ctx.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw AppError_1.Errors.NotFound(errorCases_1.UserErrors.NotFound());
    }
    return ctx.prisma.user.update({
        where: { id: userId },
        data: { accountStatus: status },
        select: {
            id: true,
            username: true,
            accountStatus: true
        }
    });
});
exports.updateUserStatus = updateUserStatus;
const updateUserRole = (userId, role, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(userId)) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidId());
    }
    if (!Object.values(client_1.UserRole).includes(role)) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidRole());
    }
    const user = yield ctx.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw AppError_1.Errors.NotFound(errorCases_1.UserErrors.NotFound());
    }
    return ctx.prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
            id: true,
            username: true,
            role: true
        }
    });
});
exports.updateUserRole = updateUserRole;
const deleteUser = (userId, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(userId)) {
        throw AppError_1.Errors.BadRequest(errorCases_1.UserErrors.InvalidId());
    }
    const user = yield ctx.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw AppError_1.Errors.NotFound(errorCases_1.UserErrors.NotFound());
    }
    yield ctx.prisma.user.delete({
        where: { id: userId }
    });
    return true;
});
exports.deleteUser = deleteUser;
