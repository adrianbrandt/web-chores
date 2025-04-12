"use strict";
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
exports.generateGroupInviteCode = exports.listUserGroups = exports.getGroupById = exports.updateGroupDetails = exports.removeGroupMember = exports.addGroupMember = exports.createGroup = void 0;
const AppError_1 = require("@/utils/AppError");
const errorCases_1 = require("@/utils/errorCases");
const client_1 = require("@/generated/client");
const crypto_1 = require("crypto");
const createGroup = (context, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, type = client_1.GroupType.CUSTOM, createdById } = data;
    if (!name) {
        throw AppError_1.Errors.BadRequest(errorCases_1.GroupErrors.MissingRequiredFields());
    }
    const inviteCode = (0, crypto_1.randomBytes)(8).toString('hex');
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield tx.group.create({
            data: {
                name,
                description,
                type,
                createdById,
                inviteCode,
            },
        });
        yield tx.groupMember.create({
            data: {
                groupId: group.id,
                userId: createdById,
                role: client_1.GroupMemberRole.ADMIN,
            },
        });
        return group;
    }));
});
exports.createGroup = createGroup;
const addGroupMember = (context_1, groupId_1, userId_1, ...args_1) => __awaiter(void 0, [context_1, groupId_1, userId_1, ...args_1], void 0, function* (context, groupId, userId, role = client_1.GroupMemberRole.MEMBER) {
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield tx.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            throw AppError_1.Errors.NotFound(errorCases_1.GroupErrors.NotFound());
        }
        const existingMember = yield tx.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId,
                },
            },
        });
        if (existingMember) {
            throw AppError_1.Errors.Conflict(errorCases_1.GroupErrors.MemberAlreadyExists());
        }
        return tx.groupMember.create({
            data: {
                groupId,
                userId,
                role,
            },
        });
    }));
});
exports.addGroupMember = addGroupMember;
const removeGroupMember = (context, groupId, userId, removingUserId) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield tx.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            throw AppError_1.Errors.NotFound(errorCases_1.GroupErrors.NotFound());
        }
        const memberToRemove = yield tx.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId,
                },
            },
        });
        if (!memberToRemove) {
            throw AppError_1.Errors.NotFound(errorCases_1.GroupErrors.NotFound());
        }
        const owners = yield tx.groupMember.count({
            where: {
                groupId,
                role: client_1.GroupMemberRole.ADMIN,
            },
        });
        if (memberToRemove.role === client_1.GroupMemberRole.ADMIN && owners <= 1) {
            throw AppError_1.Errors.BadRequest(errorCases_1.GroupErrors.CannotRemoveLastOwner());
        }
        const removingMember = yield tx.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId: removingUserId,
                },
            },
        });
        if (!removingMember ||
            (removingMember.role !== client_1.GroupMemberRole.ADMIN && removingMember.role !== client_1.GroupMemberRole.OWNER)) {
            throw AppError_1.Errors.Forbidden(errorCases_1.GroupErrors.InsufficientPermissions());
        }
        return tx.groupMember.delete({
            where: {
                groupId_userId: {
                    groupId,
                    userId,
                },
            },
        });
    }));
});
exports.removeGroupMember = removeGroupMember;
const updateGroupDetails = (context, groupId, updateData, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const member = yield tx.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId,
                },
            },
        });
        if (!member || (member.role !== client_1.GroupMemberRole.ADMIN && member.role !== client_1.GroupMemberRole.OWNER)) {
            throw AppError_1.Errors.Forbidden(errorCases_1.GroupErrors.InsufficientPermissions());
        }
        return tx.group.update({
            where: { id: groupId },
            data: Object.assign(Object.assign(Object.assign({}, (updateData.name && { name: updateData.name })), (updateData.description && { description: updateData.description })), (updateData.type && { type: updateData.type })),
        });
    }));
});
exports.updateGroupDetails = updateGroupDetails;
const getGroupById = (context, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    const group = yield context.db.group.findUnique({
        where: { id: groupId },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            },
            lists: true,
        },
    });
    if (!group) {
        throw AppError_1.Errors.NotFound(errorCases_1.GroupErrors.NotFound());
    }
    return group;
});
exports.getGroupById = getGroupById;
const listUserGroups = (context, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.group.findMany({
        where: {
            members: {
                some: {
                    userId,
                },
            },
        },
        include: {
            members: {
                where: {
                    userId,
                },
                select: {
                    role: true,
                },
            },
        },
    });
});
exports.listUserGroups = listUserGroups;
const generateGroupInviteCode = (context, groupId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const member = yield tx.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId,
                },
            },
        });
        if (!member || (member.role !== client_1.GroupMemberRole.ADMIN && member.role !== client_1.GroupMemberRole.OWNER)) {
            throw AppError_1.Errors.Forbidden(errorCases_1.GroupErrors.InsufficientPermissions());
        }
        const newInviteCode = (0, crypto_1.randomBytes)(8).toString('hex');
        return tx.group.update({
            where: { id: groupId },
            data: { inviteCode: newInviteCode },
        });
    }));
});
exports.generateGroupInviteCode = generateGroupInviteCode;
