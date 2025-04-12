"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestUsers = exports.createTestUser = void 0;
const client_1 = require("@/generated/client");
const createTestUser = (overrides = {}) => {
    return Object.assign({ id: 1, name: 'Test User', username: 'testuser', email: 'user@example.com', phoneNumber: '+1234567890', password: '$2b$10$dummyhashedpassword', avatarUrl: null, isVerified: false, verificationCode: null, verificationExpires: null, passwordResetToken: null, passwordResetExpires: null, accountStatus: client_1.AccountStatus.ACTIVE, role: client_1.UserRole.USER, lastLogin: null, createdAt: new Date('2025-04-11T00:00:00.000Z'), updatedAt: new Date('2025-04-11T00:00:00.000Z') }, overrides);
};
exports.createTestUser = createTestUser;
const createTestUsers = (count, overridesFn) => {
    return Array.from({ length: count }).map((_, index) => (0, exports.createTestUser)(overridesFn ? overridesFn(index) : { id: index + 1, username: `user${index + 1}` }));
};
exports.createTestUsers = createTestUsers;
