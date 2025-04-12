"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMockWinston = exports.mockLoggerInstance = void 0;
exports.mockLoggerInstance = {
    level: 'info',
    format: 'combined-format',
    defaultMeta: { service: 'chores-api' },
    transports: [],
    add: jest.fn(),
    info: jest.fn(),
};
const setupMockWinston = () => {
    const mockFormat = {
        timestamp: jest.fn(() => 'timestamp-format'),
        errors: jest.fn(() => 'errors-format'),
        splat: jest.fn(() => 'splat-format'),
        json: jest.fn(() => 'json-format'),
        printf: jest.fn(() => 'printf-format'),
        combine: jest.fn(() => 'combined-format'),
        colorize: jest.fn(() => 'colorize-format'),
    };
    jest.doMock('winston', () => ({
        format: mockFormat,
        createLogger: jest.fn(() => exports.mockLoggerInstance),
        transports: {
            File: jest.fn(),
            Console: jest.fn(),
        },
    }));
    const logStream = {
        write: (message) => {
            exports.mockLoggerInstance.info(message);
        },
    };
    return { mockFormat, logStream };
};
exports.setupMockWinston = setupMockWinston;
