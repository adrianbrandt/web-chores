import express from 'express';
import { authMiddleware } from '@/middleware/auth/auth';
import { asyncHandler } from '@/utils/asyncHandler';
import * as controller from '@/controllers/userController';

const router = express.Router();

router.post('/register', asyncHandler(controller.register));
router.post('/login', asyncHandler(controller.login));
router.post('/password-reset/request', asyncHandler(controller.requestPasswordReset));
router.post('/password-reset/reset', asyncHandler(controller.resetPassword));

router.post('/verify', authMiddleware, asyncHandler(controller.verifyAccount));
router.post('/verify/resend', authMiddleware, asyncHandler(controller.resendVerification));
router.get('/profile', authMiddleware, asyncHandler(controller.getProfile));
router.put('/profile', authMiddleware, asyncHandler(controller.updateProfile));
router.post('/password/change', authMiddleware, asyncHandler(controller.changePassword));

export default router;
