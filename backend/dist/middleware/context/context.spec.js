"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("./context");
const context_2 = require("@/context");
jest.mock('@/context', () => ({
    appContext: {
        db: {
            user: {},
        },
    },
}));
describe('Context Middleware', () => {
    it('should attach appContext to request object', () => {
        const mockRequest = {};
        const mockResponse = {};
        const mockNext = jest.fn();
        (0, context_1.contextMiddleware)(mockRequest, mockResponse, mockNext);
        expect(mockRequest.context).toBe(context_2.appContext);
        expect(mockNext).toHaveBeenCalled();
    });
});
