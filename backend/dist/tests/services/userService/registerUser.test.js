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
const setup_1 = require("../../setup");
const userService = __importStar(require("@/services/userService"));
const testData_1 = require("../../testData");
const mockCtx = (0, setup_1.createMockContext)();
const ctx = (0, setup_1.mockContextToAppContext)(mockCtx);
describe('registerUser', () => {
    const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'user@example.com',
        password: 'Password123',
    };
    it('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        mockCtx.db.user.findFirst.mockResolvedValue(null);
        const createdUser = (0, testData_1.createMockUser)();
        mockCtx.db.user.create.mockResolvedValue(createdUser);
        const result = yield userService.registerUser(ctx, userData);
        expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
            where: {
                OR: [{ username: userData.username }, { email: userData.email }],
            },
        });
        expect(mockCtx.db.user.create).toHaveBeenCalled();
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('needsVerification', true);
    }));
    it('should throw error if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
        const incompleteData = {
            name: 'Test User',
            username: 'testuser',
            password: 'Password123',
        };
        yield expect(userService.registerUser(ctx, incompleteData)).rejects.toThrow('Please provide name, username, password, and either email or phone number');
        expect(mockCtx.db.user.findFirst).not.toHaveBeenCalled();
    }));
    it('should throw error if user already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        mockCtx.db.user.findFirst.mockResolvedValue((0, testData_1.createMockUser)());
        yield expect(userService.registerUser(ctx, userData)).rejects.toThrow('User already exists');
        expect(mockCtx.db.user.create).not.toHaveBeenCalled();
    }));
    it('should register a user with phone number instead of email', () => __awaiter(void 0, void 0, void 0, function* () {
        const userData = {
            name: 'Test User',
            username: 'testuser',
            phoneNumber: '+11234567890',
            password: 'Password123',
        };
        mockCtx.db.user.findFirst.mockResolvedValue(null);
        const createdUser = (0, testData_1.createMockUser)({
            email: null,
            phoneNumber: '+11234567890',
        });
        mockCtx.db.user.create.mockResolvedValue(createdUser);
        const result = yield userService.registerUser(ctx, userData);
        expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
            where: {
                OR: [{ username: userData.username }, { phoneNumber: userData.phoneNumber }],
            },
        });
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('needsVerification', true);
    }));
    it('should throw error when neither email nor phone is provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const userData = {
            name: 'Test User',
            username: 'tester',
            password: 'Password123',
        };
        yield expect(userService.registerUser(ctx, userData)).rejects.toThrow('Please provide name, username, password, and either email or phone number');
    }));
});
