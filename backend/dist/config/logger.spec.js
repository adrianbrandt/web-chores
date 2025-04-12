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
const mockWinston_1 = require("@/tests/mocks/mockWinston");
const setup_1 = require("@/tests/setup");
jest.mock('winston');
describe('Logger Configuration', () => {
    beforeEach(() => {
        process.env = Object.assign({}, setup_1.originalEnv);
        jest.clearAllMocks();
    });
    it('should create log directory if it does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const mkdirSync = jest.fn();
        const existsSync = jest.fn(() => false);
        jest.mock('fs', () => ({ existsSync, mkdirSync }));
        (0, mockWinston_1.setupMockWinston)();
        jest.resetModules();
        yield Promise.resolve().then(() => __importStar(require('@/config/logger')));
        expect(existsSync).toHaveBeenCalled();
        expect(mkdirSync).toHaveBeenCalled();
    }));
    it('should not create log directory if it already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        const mkdirSync = jest.fn();
        const existsSync = jest.fn(() => true);
        jest.mock('fs', () => ({ existsSync, mkdirSync }));
        (0, mockWinston_1.setupMockWinston)();
        jest.resetModules();
        yield Promise.resolve().then(() => __importStar(require('@/config/logger')));
        expect(existsSync).toHaveBeenCalled();
        expect(mkdirSync).not.toHaveBeenCalled();
    }));
    it('should configure winston logger with correct options in production', () => __awaiter(void 0, void 0, void 0, function* () {
        process.env.NODE_ENV = 'production';
        const mkdirSync = jest.fn();
        const existsSync = jest.fn(() => true);
        jest.mock('fs', () => ({ existsSync, mkdirSync }));
        (0, mockWinston_1.setupMockWinston)();
        jest.resetModules();
        yield Promise.resolve().then(() => __importStar(require('@/config/logger')));
        const winston = yield Promise.resolve().then(() => __importStar(require('winston')));
        const createLoggerArgs = winston.createLogger.mock.calls[0][0];
        expect(createLoggerArgs.level).toBe('info');
        expect(createLoggerArgs.defaultMeta).toEqual({ service: 'chores-api' });
        expect(winston.transports.File).toHaveBeenCalledWith(expect.objectContaining({
            filename: expect.stringContaining('error.log'),
            level: 'error',
        }));
        expect(winston.transports.File).toHaveBeenCalledWith(expect.objectContaining({
            filename: expect.stringContaining('combined.log'),
        }));
        expect(mockWinston_1.mockLoggerInstance.add).not.toHaveBeenCalled();
    }));
    it('should add console transport in non-production environments', () => __awaiter(void 0, void 0, void 0, function* () {
        process.env.NODE_ENV = 'development';
        const mkdirSync = jest.fn();
        const existsSync = jest.fn(() => true);
        jest.mock('fs', () => ({ existsSync, mkdirSync }));
        (0, mockWinston_1.setupMockWinston)();
        jest.resetModules();
        yield Promise.resolve().then(() => __importStar(require('@/config/logger')));
        expect(mockWinston_1.mockLoggerInstance.add).toHaveBeenCalled();
    }));
    it('should configure log stream correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const mkdirSync = jest.fn();
        const existsSync = jest.fn(() => true);
        jest.mock('fs', () => ({ existsSync, mkdirSync }));
        const { logStream } = (0, mockWinston_1.setupMockWinston)();
        jest.resetModules();
        yield Promise.resolve().then(() => __importStar(require('@/config/logger')));
        logStream.write('test log message\n');
        expect(mockWinston_1.mockLoggerInstance.info).toHaveBeenCalledWith('test log message\n');
    }));
    it('should use correct format functions', () => __awaiter(void 0, void 0, void 0, function* () {
        const mkdirSync = jest.fn();
        const existsSync = jest.fn(() => true);
        jest.mock('fs', () => ({ existsSync, mkdirSync }));
        const { mockFormat } = (0, mockWinston_1.setupMockWinston)();
        jest.resetModules();
        yield Promise.resolve().then(() => __importStar(require('@/config/logger')));
        expect(mockFormat.timestamp).toHaveBeenCalledWith({ format: 'YYYY-MM-DD HH:mm:ss' });
        expect(mockFormat.errors).toHaveBeenCalled();
        expect(mockFormat.splat).toHaveBeenCalled();
        expect(mockFormat.json).toHaveBeenCalled();
        expect(mockFormat.combine).toHaveBeenCalled();
    }));
});
