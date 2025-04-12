"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockCtx = void 0;
const jest_mock_extended_1 = require("jest-mock-extended");
const context_1 = require("@/context");
exports.mockCtx = (0, context_1.createMockContext)();
beforeEach(() => {
    (0, jest_mock_extended_1.mockReset)(exports.mockCtx.prisma);
});
