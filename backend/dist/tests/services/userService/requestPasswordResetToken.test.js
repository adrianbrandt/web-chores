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
describe('requestPasswordResetToken', () => {
    it('should create reset token for existing user', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = (0, testData_1.createMockUser)();
        mockCtx.db.user.findFirst.mockResolvedValue(user);
        yield userService.requestPasswordResetToken(ctx, 'user@example.com');
        expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
            where: {
                OR: [{ email: 'user@example.com' }, { phoneNumber: 'user@example.com' }, { username: 'user@example.com' }],
            },
        });
        expect(mockCtx.db.user.update).toHaveBeenCalledWith({
            where: { id: user.id },
            data: {
                passwordResetToken: expect.any(String),
                passwordResetExpires: expect.any(Date),
            },
        });
    }));
    it('should return success even if user does not exist (for security)', () => __awaiter(void 0, void 0, void 0, function* () {
        mockCtx.db.user.findFirst.mockResolvedValue(null);
        const result = yield userService.requestPasswordResetToken(ctx, 'nonexistent@example.com');
        expect(result).toBe(true);
        expect(mockCtx.db.user.update).not.toHaveBeenCalled();
    }));
    it('should create reset token and send via email if available', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = (0, testData_1.createMockUser)({
            email: 'user@example.com',
            phoneNumber: '+11234567890',
        });
        mockCtx.db.user.findFirst.mockResolvedValue(user);
        yield userService.requestPasswordResetToken(ctx, 'user@example.com');
        expect(mockCtx.db.user.update).toHaveBeenCalledWith({
            where: { id: user.id },
            data: {
                passwordResetToken: expect.any(String),
                passwordResetExpires: expect.any(Date),
            },
        });
    }));
    it('should create reset token and send via SMS if no email available', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = (0, testData_1.createMockUser)({
            email: null,
            phoneNumber: '+11234567890',
        });
        mockCtx.db.user.findFirst.mockResolvedValue(user);
        yield userService.requestPasswordResetToken(ctx, 'username');
        expect(mockCtx.db.user.update).toHaveBeenCalledWith({
            where: { id: user.id },
            data: {
                passwordResetToken: expect.any(String),
                passwordResetExpires: expect.any(Date),
            },
        });
    }));
    it('should handle case when user has neither email nor phone', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = (0, testData_1.createMockUser)({
            email: null,
            phoneNumber: null,
        });
        mockCtx.db.user.findFirst.mockResolvedValue(user);
        const result = yield userService.requestPasswordResetToken(ctx, 'username');
        expect(mockCtx.db.user.update).toHaveBeenCalledWith({
            where: { id: user.id },
            data: {
                passwordResetToken: expect.any(String),
                passwordResetExpires: expect.any(Date),
            },
        });
        expect(result).toBe(true);
    }));
    it('should throw error if no identifier is provided', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(userService.requestPasswordResetToken(ctx, '')).rejects.toThrow('Please provide email, phone number, or username');
        expect(mockCtx.db.user.findFirst).not.toHaveBeenCalled();
    }));
});
