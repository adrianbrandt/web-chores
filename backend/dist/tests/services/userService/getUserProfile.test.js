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
describe('getUserProfile', () => {
    it('should return user profile successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const userProfile = (0, testData_1.createMockUser)();
        mockCtx.db.user.findUnique.mockResolvedValue((0, testData_1.createMockPrismaResponse)(userProfile));
        const result = yield userService.getUserProfile(ctx, '1');
        expect(mockCtx.db.user.findUnique).toHaveBeenCalledWith({
            where: { id: '1' },
            select: expect.objectContaining({
                id: true,
                name: true,
                username: true,
            }),
        });
        expect(result).toEqual(userProfile);
    }));
    it('should throw error if user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        mockCtx.db.user.findUnique.mockResolvedValue(null);
        yield expect(userService.getUserProfile(ctx, '999')).rejects.toThrow('User not found');
    }));
});
