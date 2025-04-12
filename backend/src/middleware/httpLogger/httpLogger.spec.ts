jest.mock('morgan', () => jest.fn(() => 'mocked-morgan-middleware'));
jest.mock('@/config/logger', () => ({
  logStream: { write: jest.fn() },
}));

describe('HTTP Logger Middleware', () => {
  it('should configure morgan middleware correctly', async () => {
    const morgan = await import('morgan');
    const { logStream } = await import('@/config/logger');
    const { default: httpLogger } = await import('./httpLogger');

    expect(morgan.default).toHaveBeenCalledWith('combined', { stream: logStream });
    expect(httpLogger).toBe('mocked-morgan-middleware');
  });
});
