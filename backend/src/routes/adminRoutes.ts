import express from 'express';
import { authMiddleware, authorizeRole } from '@/middleware/auth/auth';
import { UserRole } from '@/generated/client';
import { asyncHandler } from '@/utils/asyncHandler';
import * as controller from '@/controllers/adminController';

const router = express.Router();

router.use(authMiddleware);

router.get('/users', authorizeRole([UserRole.ADMIN]), asyncHandler(controller.getAllUsers));
router.get('/users/:username', authorizeRole([UserRole.ADMIN]), asyncHandler(controller.getUserByUsername));
router.patch('/users/:username/status', authorizeRole([UserRole.ADMIN]), asyncHandler(controller.updateUserStatus));
router.patch('/users/:username/role', authorizeRole([UserRole.ADMIN]), asyncHandler(controller.updateUserRole));
router.delete('/users/:username', authorizeRole([UserRole.ADMIN]), asyncHandler(controller.deleteUser));

export default router;
