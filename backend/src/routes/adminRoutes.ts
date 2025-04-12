import express from 'express';
import { authMiddleware, authorizeRole } from '@/middleware/auth/auth';
import { UserRole } from '@/generated/client';
import * as controller from '@/controllers/adminController';

const router = express.Router();

router.use(authMiddleware);

router.get('/users', authorizeRole([UserRole.ADMIN]), controller.getAllUsers);

router.get('/users/:username', authorizeRole([UserRole.ADMIN]), controller.getUserByUsername);

router.patch('/users/:username/status', authorizeRole([UserRole.ADMIN]), controller.updateUserStatus);

router.patch('/users/:username/role', authorizeRole([UserRole.ADMIN]), controller.updateUserRole);

router.delete('/users/:username', authorizeRole([UserRole.ADMIN]), controller.deleteUser);

export default router;
