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
describe('resetUserPassword', () => {
    it('should reset password successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = (0, testData_1.createMockUser)({
            passwordResetToken: '123456',
            passwordResetExpires: new Date(Date.now() + 100000),
        });
        mockCtx.db.user.findFirst.mockResolvedValue(user);
        yield userService.resetUserPassword(ctx, 'user@example.com', '123456', 'NewPassword123');
        expect(mockCtx.db.user.update).toHaveBeenCalledWith({
            where: { id: user.id },
            data: {
                password: 'hashedPassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
    }));
    it('should throw error if any required field is missing', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(userService.resetUserPassword(ctx, '', '123456', 'NewPassword')).rejects.toThrow('Please provide all required fields');
        yield expect(userService.resetUserPassword(ctx, 'user@example.com', '', 'NewPassword')).rejects.toThrow('Please provide all required fields');
        yield expect(userService.resetUserPassword(ctx, 'user@example.com', '123456', '')).rejects.toThrow('Please provide all required fields');
    }));
    it('should throw error if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
        mockCtx.db.user.findFirst.mockResolvedValue(null);
        yield expect(userService.resetUserPassword(ctx, 'nonexistent@example.com', '123456', 'NewPassword')).rejects.toThrow('Invalid reset information');
    }));
    it('should throw error if reset token is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = (0, testData_1.createMockUser)({
            passwordResetToken: '123456',
            passwordResetExpires: new Date(Date.now() + 100000),
        });
        mockCtx.db.user.findFirst.mockResolvedValue(user);
        yield expect(userService.resetUserPassword(ctx, 'user@example.com', 'wrong-token', 'NewPassword')).rejects.toThrow('Invalid reset token');
    }));
    it('should throw error if reset token has expired', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = (0, testData_1.createMockUser)({
            passwordResetToken: '123456',
            passwordResetExpires: new Date(Date.now() - 100000),
        });
        mockCtx.db.user.findFirst.mockResolvedValue(user);
        yield expect(userService.resetUserPassword(ctx, 'user@example.com', '123456', 'NewPassword')).rejects.toThrow('Reset token has expired');
    }));
    it('should handle null passwordResetExpires field', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = (0, testData_1.createMockUser)({
            passwordResetToken: '123456',
            passwordResetExpires: null,
        });
        mockCtx.db.user.findFirst.mockResolvedValue(user);
        yield userService.resetUserPassword(ctx, 'user@example.com', '123456', 'NewPassword123');
        expect(mockCtx.db.user.update).toHaveBeenCalledWith({
            where: { id: user.id },
            data: {
                password: 'hashedPassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
    }));
});
