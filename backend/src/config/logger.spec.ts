import { setupMockWinston, mockLoggerInstance } from '@/tests/mocks/mockWinston';
import { originalEnv } from '@/tests/setup';

jest.mock('winston');

describe('Logger Configuration', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  it('should create log directory if it does not exist', async () => {
    const mkdirSync = jest.fn();
    const existsSync = jest.fn(() => false);

    jest.mock('fs', () => ({ existsSync, mkdirSync }));
    setupMockWinston();

    jest.resetModules();
    await import('@/config/logger');

    expect(existsSync).toHaveBeenCalled();
    expect(mkdirSync).toHaveBeenCalled();
  });

  it('should not create log directory if it already exists', async () => {
    const mkdirSync = jest.fn();
    const existsSync = jest.fn(() => true);

    jest.mock('fs', () => ({ existsSync, mkdirSync }));
    setupMockWinston();

    jest.resetModules();
    await import('@/config/logger');

    expect(existsSync).toHaveBeenCalled();
    expect(mkdirSync).not.toHaveBeenCalled();
  });

  it('should configure winston logger with correct options in production', async () => {
    process.env.NODE_ENV = 'production';

    const mkdirSync = jest.fn();
    const existsSync = jest.fn(() => true);

    jest.mock('fs', () => ({ existsSync, mkdirSync }));
    setupMockWinston();

    jest.resetModules();
    await import('@/config/logger');

    const winston = await import('winston');
    const createLoggerArgs = (winston.createLogger as jest.Mock).mock.calls[0][0];

    expect(createLoggerArgs.level).toBe('info');
    expect(createLoggerArgs.defaultMeta).toEqual({ service: 'chores-api' });

    expect(winston.transports.File).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: expect.stringContaining('error.log'),
        level: 'error',
      })
    );

    expect(winston.transports.File).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: expect.stringContaining('combined.log'),
      })
    );

    expect(mockLoggerInstance.add).not.toHaveBeenCalled();
  });

  it('should add console transport in non-production environments', async () => {
    process.env.NODE_ENV = 'development';

    const mkdirSync = jest.fn();
    const existsSync = jest.fn(() => true);

    jest.mock('fs', () => ({ existsSync, mkdirSync }));
    setupMockWinston();

    jest.resetModules();
    await import('@/config/logger');

    expect(mockLoggerInstance.add).toHaveBeenCalled();
  });

  it('should configure log stream correctly', async () => {
    const mkdirSync = jest.fn();
    const existsSync = jest.fn(() => true);

    jest.mock('fs', () => ({ existsSync, mkdirSync }));
    const { logStream } = setupMockWinston();

    jest.resetModules();
    await import('@/config/logger');

    logStream.write('test log message\n');
    expect(mockLoggerInstance.info).toHaveBeenCalledWith('test log message\n');
  });

  it('should use correct format functions', async () => {
    const mkdirSync = jest.fn();
    const existsSync = jest.fn(() => true);

    jest.mock('fs', () => ({ existsSync, mkdirSync }));
    const { mockFormat } = setupMockWinston();

    jest.resetModules();
    await import('@/config/logger');

    expect(mockFormat.timestamp).toHaveBeenCalledWith({ format: 'YYYY-MM-DD HH:mm:ss' });
    expect(mockFormat.errors).toHaveBeenCalled();
    expect(mockFormat.splat).toHaveBeenCalled();
    expect(mockFormat.json).toHaveBeenCalled();
    expect(mockFormat.combine).toHaveBeenCalled();
  });
});
