"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.originalEnv = exports.mockContextToAppContext = exports.createMockContext = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jest_mock_extended_1 = require("jest-mock-extended");
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
const createMockContext = () => {
    return {
        db: (0, jest_mock_extended_1.mockDeep)(),
    };
};
exports.createMockContext = createMockContext;
const mockContextToAppContext = (mockCtx) => {
    return mockCtx;
};
exports.mockContextToAppContext = mockContextToAppContext;
exports.originalEnv = Object.assign({}, process.env);
beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    bcrypt_1.default.genSalt.mockResolvedValue('salt');
    bcrypt_1.default.hash.mockResolvedValue('hashedPassword');
    bcrypt_1.default.compare.mockResolvedValue(true);
    jsonwebtoken_1.default.sign.mockReturnValue('token');
});
afterAll(() => {
    process.env = exports.originalEnv;
});
afterEach(() => {
    process.env = Object.assign({}, exports.originalEnv);
});
