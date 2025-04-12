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
describe('updateUserProfile', () => {
    it('should update profile with email changes', () => __awaiter(void 0, void 0, void 0, function* () {
        const profileData = { email: 'newemail@example.com' };
        mockCtx.db.user.findFirst.mockResolvedValue(null);
        const updatedProfile = (0, testData_1.createMockUser)({ id: '1', email: 'newemail@example.com' });
        mockCtx.db.user.update.mockResolvedValue((0, testData_1.createMockPrismaResponse)(updatedProfile));
        const result = yield userService.updateUserProfile(ctx, '1', profileData);
        expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
            where: {
                OR: [{ email: 'newemail@example.com' }],
                NOT: { id: '1' },
            },
        });
        expect(mockCtx.db.user.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: profileData,
            select: expect.objectContaining({ id: true, email: true }),
        });
        expect(result).toEqual(updatedProfile);
    }));
    it('should update profile with phone number changes', () => __awaiter(void 0, void 0, void 0, function* () {
        const profileData = { phoneNumber: '+19876543210' };
        mockCtx.db.user.findFirst.mockResolvedValue(null);
        const updatedProfile = (0, testData_1.createMockUser)({ id: '1', phoneNumber: '+19876543210' });
        mockCtx.db.user.update.mockResolvedValue((0, testData_1.createMockPrismaResponse)(updatedProfile));
        const result = yield userService.updateUserProfile(ctx, '1', profileData);
        expect(mockCtx.db.user.findFirst).toHaveBeenCalledWith({
            where: {
                OR: [{ phoneNumber: '+19876543210' }],
                NOT: { id: '1' },
            },
        });
        expect(mockCtx.db.user.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: profileData,
            select: expect.any(Object),
        });
        expect(result).toEqual(updatedProfile);
    }));
    it('should update profile with avatar URL only', () => __awaiter(void 0, void 0, void 0, function* () {
        const profileData = { avatarUrl: 'https://example.com/avatar.png' };
        const updatedProfile = (0, testData_1.createMockUser)({ id: '1', avatarUrl: 'https://example.com/avatar.png' });
        mockCtx.db.user.update.mockResolvedValue((0, testData_1.createMockPrismaResponse)(updatedProfile));
        const result = yield userService.updateUserProfile(ctx, '1', profileData);
        expect(mockCtx.db.user.findFirst).not.toHaveBeenCalled();
        expect(mockCtx.db.user.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: profileData,
            select: expect.any(Object),
        });
        expect(result).toEqual(updatedProfile);
    }));
    it('should throw error if identifier is already in use', () => __awaiter(void 0, void 0, void 0, function* () {
        const profileData = { username: 'existinguser' };
        mockCtx.db.user.findFirst.mockResolvedValue((0, testData_1.createMockUser)({ id: '2' }));
        yield expect(userService.updateUserProfile(ctx, '1', profileData)).rejects.toThrow('Username, email, or phone number already in use');
        expect(mockCtx.db.user.update).not.toHaveBeenCalled();
    }));
});
