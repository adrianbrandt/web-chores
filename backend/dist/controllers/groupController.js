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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInviteCode = exports.listUserGroups = exports.getGroup = exports.updateGroupDetails = exports.removeGroupMember = exports.addGroupMember = exports.createGroup = void 0;
const groupService = __importStar(require("../services/groupService"));
const logger_1 = __importDefault(require("../config/logger"));
const AppError_1 = require("@/utils/AppError");
const errorCases_1 = require("@/utils/errorCases");
const client_1 = require("@/generated/client");
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { name, description, type } = req.body;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.GroupErrors.InsufficientPermissions());
    }
    const group = yield groupService.createGroup(req.context, {
        name,
        description,
        type,
        createdById: userId,
    });
    logger_1.default.info('Group created successfully', {
        groupId: group.id,
        createdBy: userId,
    });
    res.status(201).json({
        message: 'Group created successfully',
        group,
    });
});
exports.createGroup = createGroup;
const addGroupMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { groupId } = req.params;
    const { userId: memberToAddId, role } = req.body;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.GroupErrors.InsufficientPermissions());
    }
    yield groupService.addGroupMember(req.context, groupId, memberToAddId, role || client_1.GroupMemberRole.MEMBER);
    logger_1.default.info('Member added to group', {
        groupId,
        addedUserId: memberToAddId,
        addedByUserId: userId,
    });
    res.status(200).json({
        message: 'Member added to group successfully',
    });
});
exports.addGroupMember = addGroupMember;
const removeGroupMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { groupId, memberId } = req.params;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.GroupErrors.InsufficientPermissions());
    }
    yield groupService.removeGroupMember(req.context, groupId, memberId, userId);
    logger_1.default.info('Member removed from group', {
        groupId,
        removedUserId: memberId,
        removedByUserId: userId,
    });
    res.status(200).json({
        message: 'Member removed from group successfully',
    });
});
exports.removeGroupMember = removeGroupMember;
const updateGroupDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { groupId } = req.params;
    const { name, description, type } = req.body;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.GroupErrors.InsufficientPermissions());
    }
    const updatedGroup = yield groupService.updateGroupDetails(req.context, groupId, { name, description, type }, userId);
    logger_1.default.info('Group details updated', {
        groupId,
        updatedByUserId: userId,
    });
    res.status(200).json({
        message: 'Group details updated successfully',
        group: updatedGroup,
    });
});
exports.updateGroupDetails = updateGroupDetails;
const getGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { groupId } = req.params;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.GroupErrors.InsufficientPermissions());
    }
    const group = yield groupService.getGroupById(req.context, groupId);
    res.status(200).json(group);
});
exports.getGroup = getGroup;
const listUserGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.GroupErrors.InsufficientPermissions());
    }
    const groups = yield groupService.listUserGroups(req.context, userId);
    res.status(200).json(groups);
});
exports.listUserGroups = listUserGroups;
const generateInviteCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { groupId } = req.params;
    if (!userId) {
        throw AppError_1.Errors.Unauthorized(errorCases_1.GroupErrors.InsufficientPermissions());
    }
    const group = yield groupService.generateGroupInviteCode(req.context, groupId, userId);
    logger_1.default.info('Group invite code regenerated', {
        groupId,
        regeneratedByUserId: userId,
    });
    res.status(200).json({
        message: 'Invite code regenerated successfully',
        inviteCode: group.inviteCode,
    });
});
exports.generateInviteCode = generateInviteCode;
