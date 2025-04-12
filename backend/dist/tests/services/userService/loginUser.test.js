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
const setup_1 = require("../../setup");
const userService = __importStar(require("@/services/userService"));
const testData_1 = require("../../testData");
const client_1 = require("@/generated/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const mockCtx = (0, setup_1.createMockContext)();
const ctx = (0, setup_1.mockContextToAppContext)(mockCtx);
describe('loginUser', () => {
    it('should log in a user successfully with username', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = (0, testData_1.createMockUser)();
        mockCtx.db.user.findFirst.mockResolvedValue(mockUser);
        const result = yield userService.loginUser(ctx, 'testuser', 'Password123');
        expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
            where: {
                OR: [{ username: 'testuser' }, { email: 'testuser' }, { phoneNumber: 'testuser' }],
            },
        });
        expect(mockCtx.db.user.update).toHaveBeenCalledWith({
            where: { id: mockUser.id },
            data: { lastLogin: expect.any(Date) },
        });
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('isVerified', false);
    }));
    it('should throw error when identifier or password is missing', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(userService.loginUser(ctx, '', 'password')).rejects.toThrow('Please provide username/email/phone and password');
        yield expect(userService.loginUser(ctx, 'username', '')).rejects.toThrow('Please provide username/email/phone and password');
    }));
    it('should throw error if credentials are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        mockCtx.db.user.findFirst.mockResolvedValue(null);
        yield expect(userService.loginUser(ctx, 'wronguser', 'Password123')).rejects.toThrow('Invalid credentials');
    }));
    it('should throw error if password is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
        mockCtx.db.user.findFirst.mockResolvedValue((0, testData_1.createMockUser)());
        bcrypt_1.default.compare.mockResolvedValue(false);
        yield expect(userService.loginUser(ctx, 'testuser', 'WrongPassword')).rejects.toThrow('Invalid credentials');
    }));
    it('should throw error if account is suspended', () => __awaiter(void 0, void 0, void 0, function* () {
        const suspendedUser = (0, testData_1.createMockUser)({ accountStatus: client_1.AccountStatus.SUSPENDED });
        mockCtx.db.user.findFirst.mockResolvedValue(suspendedUser);
        yield expect(userService.loginUser(ctx, 'testuser', 'Password123')).rejects.toThrow('Account is suspended');
    }));
});
