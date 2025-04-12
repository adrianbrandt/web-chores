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
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("../setup");
const adminService = __importStar(require("../../services/adminService"));
const client_1 = require("@/generated/client");
const testData_1 = require("../testData");
describe('Admin Service', () => {
    const mockCtx = (0, setup_1.createMockContext)();
    const ctx = (0, setup_1.mockContextToAppContext)(mockCtx);
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('getAllUsers', () => {
        it('should return all users', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUsers = [
                (0, testData_1.createMockUser)({ username: 'user1' }),
                (0, testData_1.createMockUser)({ username: 'user2' }),
                (0, testData_1.createMockUser)({ username: 'user3' }),
            ];
            mockCtx.db.user.findMany.mockResolvedValue(mockUsers);
            const result = yield adminService.getAllUsers(ctx);
            expect(mockCtx.db.user.findMany).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUsers);
        }));
    });
    describe('getUserByUsername', () => {
        it('should return a user when valid username is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = (0, testData_1.createMockUser)({ username: 'testuser' });
            mockCtx.db.user.findUnique.mockResolvedValue((0, testData_1.createMockPrismaResponse)(mockUser));
            const result = yield adminService.getUserByUsername(ctx, 'testuser');
            expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'testuser' },
                select: expect.objectContaining({
                    id: true,
                    username: true,
                }),
            });
            expect(result).toEqual(mockUser);
        }));
        it('should throw NotFound error when user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            mockCtx.db.user.findUnique.mockResolvedValue(null);
            yield expect(adminService.getUserByUsername(ctx, 'nonexistentuser')).rejects.toThrow('User not found');
            expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'nonexistentuser' },
                select: expect.any(Object),
            });
        }));
    });
    describe('updateUserStatus', () => {
        it('should update user status when valid data is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = (0, testData_1.createMockUser)({ username: 'testuser' });
            const updatedUser = (0, testData_1.createMockUser)({
                username: 'testuser',
                accountStatus: client_1.AccountStatus.INACTIVE,
            });
            mockCtx.db.user.findUnique.mockResolvedValue(mockUser);
            mockCtx.db.user.update.mockResolvedValue(updatedUser);
            const result = yield adminService.updateUserStatus(ctx, 'testuser', client_1.AccountStatus.INACTIVE);
            expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'testuser' },
            });
            expect(mockCtx.db.user.update).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                data: { accountStatus: client_1.AccountStatus.INACTIVE },
                select: expect.objectContaining({
                    id: true,
                    username: true,
                    accountStatus: true,
                }),
            });
            expect(result).toEqual(updatedUser);
        }));
        it('should throw BadRequest error when username is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(adminService.updateUserStatus(ctx, '', client_1.AccountStatus.INACTIVE)).rejects.toThrow('Invalid username');
            expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
            expect(mockCtx.db.user.update).not.toHaveBeenCalled();
        }));
        it('should throw BadRequest error when invalid status is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // @ts-expect-error - Intentionally passing invalid status for testing
            yield expect(adminService.updateUserStatus(ctx, 'testuser', 'INVALID_STATUS')).rejects.toThrow('Invalid status value');
            expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
            expect(mockCtx.db.user.update).not.toHaveBeenCalled();
        }));
        it('should throw NotFound error when user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            mockCtx.db.user.findUnique.mockResolvedValue(null);
            yield expect(adminService.updateUserStatus(ctx, 'nonexistentuser', client_1.AccountStatus.INACTIVE)).rejects.toThrow('User not found');
            expect(mockCtx.db.user.findUnique).toHaveBeenCalled();
            expect(mockCtx.db.user.update).not.toHaveBeenCalled();
        }));
    });
    describe('updateUserRole', () => {
        it('should update user role when valid data is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = (0, testData_1.createMockUser)({ username: 'testuser' });
            const updatedUser = (0, testData_1.createMockUser)({
                username: 'testuser',
                role: client_1.UserRole.ADMIN,
            });
            mockCtx.db.user.findUnique.mockResolvedValue(mockUser);
            mockCtx.db.user.update.mockResolvedValue(updatedUser);
            const result = yield adminService.updateUserRole(ctx, 'testuser', client_1.UserRole.ADMIN);
            expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'testuser' },
            });
            expect(mockCtx.db.user.update).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                data: { role: client_1.UserRole.ADMIN },
                select: expect.objectContaining({
                    id: true,
                    username: true,
                    role: true,
                }),
            });
            expect(result).toEqual(updatedUser);
        }));
        it('should throw BadRequest error when username is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(adminService.updateUserRole(ctx, '', client_1.UserRole.ADMIN)).rejects.toThrow('Invalid username');
            expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
            expect(mockCtx.db.user.update).not.toHaveBeenCalled();
        }));
        it('should throw BadRequest error when invalid role is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // @ts-expect-error - Intentionally passing invalid role for testing
            yield expect(adminService.updateUserRole(ctx, 'testuser', 'INVALID_ROLE')).rejects.toThrow('Invalid role value');
            expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
            expect(mockCtx.db.user.update).not.toHaveBeenCalled();
        }));
        it('should throw NotFound error when user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            mockCtx.db.user.findUnique.mockResolvedValue(null);
            yield expect(adminService.updateUserRole(ctx, 'nonexistentuser', client_1.UserRole.ADMIN)).rejects.toThrow('User not found');
            expect(mockCtx.db.user.findUnique).toHaveBeenCalled();
            expect(mockCtx.db.user.update).not.toHaveBeenCalled();
        }));
    });
    describe('deleteUser', () => {
        it('should delete a user when valid username is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = (0, testData_1.createMockUser)({ username: 'testuser' });
            mockCtx.db.user.findUnique.mockResolvedValue(mockUser);
            mockCtx.db.user.delete.mockResolvedValue(mockUser);
            const result = yield adminService.deleteUser(ctx, 'testuser');
            expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'testuser' },
            });
            expect(mockCtx.db.user.delete).toHaveBeenCalledWith({
                where: { id: mockUser.id },
            });
            expect(result).toBe(true);
        }));
        it('should throw BadRequest error when username is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(adminService.deleteUser(ctx, '')).rejects.toThrow('Invalid username');
            expect(mockCtx.db.user.findUnique).not.toHaveBeenCalled();
            expect(mockCtx.db.user.delete).not.toHaveBeenCalled();
        }));
        it('should throw NotFound error when user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            mockCtx.db.user.findUnique.mockResolvedValue(null);
            yield expect(adminService.deleteUser(ctx, 'nonexistentuser')).rejects.toThrow('User not found');
            expect(mockCtx.db.user.findUnique).toHaveBeenCalled();
            expect(mockCtx.db.user.delete).not.toHaveBeenCalled();
        }));
    });
});
