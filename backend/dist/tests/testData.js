"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockPrismaResponse = exports.createMockUser = void 0;
const createMockUser = (overrides = {}) => {
    const now = new Date();
    return Object.assign({ id: '1', name: 'Test User', username: 'testuser', email: 'user@example.com', phoneNumber: '+1234567890', password: '$2b$10$dummyhashedpassword', avatarUrl: null, isVerified: false, verificationCode: null, verificationExpires: null, passwordResetToken: null, passwordResetExpires: null, accountStatus: 'ACTIVE', role: 'USER', lastLogin: null, notificationPreference: 'IN_APP', createdAt: now, updatedAt: now, friendships: [], friendOf: [], groupMemberships: [], ownedGroups: [], ownedLists: [], assignedItems: [], completedItems: [], listCollaborations: [], uploadedAttachments: [], preferences: null }, overrides);
};
exports.createMockUser = createMockUser;
const createMockPrismaResponse = (data) => {
    return data;
};
exports.createMockPrismaResponse = createMockPrismaResponse;
