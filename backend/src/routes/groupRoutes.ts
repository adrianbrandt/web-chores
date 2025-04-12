import express from 'express';
import { authMiddleware } from '@/middleware/auth';
import * as groupController from '@/controllers/groupController';

const router = express.Router();
router.use(authMiddleware);

router.post('/', groupController.createGroup);
router.post('/:groupId/members', groupController.addGroupMember);
router.delete('/:groupId/members/:memberId', groupController.removeGroupMember);
router.put('/:groupId', groupController.updateGroupDetails);
router.get('/:groupId', groupController.getGroup);
router.get('/', groupController.listUserGroups);
router.post('/:groupId/invite-code', groupController.generateInviteCode);

export default router;
