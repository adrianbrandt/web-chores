"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpLogger_1 = __importDefault(require("./httpLogger"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("@/config/logger");
// Mock dependencies
jest.mock('morgan', () => jest.fn(() => 'mocked-morgan-middleware'));
jest.mock('@/config/logger', () => ({
    logStream: { write: jest.fn() },
}));
describe('HTTP Logger Middleware', () => {
    it('should configure morgan middleware correctly', () => {
        expect(morgan_1.default).toHaveBeenCalledWith('combined', { stream: logger_1.logStream });
        expect(httpLogger_1.default).toBe('mocked-morgan-middleware');
    });
});
