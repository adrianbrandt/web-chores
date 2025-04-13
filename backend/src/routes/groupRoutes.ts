import express from 'express';
import { authMiddleware } from '@/middleware/auth';
import { asyncHandler } from '@/utils/asyncHandler';
import * as groupController from '@/controllers/groupController';

const router = express.Router();
router.use(authMiddleware);

router.post('/', asyncHandler(groupController.createGroup));
router.post('/:groupId/members', asyncHandler(groupController.addGroupMember));
router.delete('/:groupId/members/:memberId', asyncHandler(groupController.removeGroupMember));
router.put('/:groupId', asyncHandler(groupController.updateGroupDetails));
router.get('/:groupId', asyncHandler(groupController.getGroup));
router.get('/', asyncHandler(groupController.listUserGroups));
router.post('/:groupId/invite-code', asyncHandler(groupController.generateInviteCode));

export default router;
