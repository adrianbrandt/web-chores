import express from 'express';
import { authMiddleware } from '@/middleware/auth/auth';

import * as controller from '@/controllers/userController';

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/password-reset/request', controller.requestPasswordReset);
router.post('/password-reset/reset', controller.resetPassword);

router.post('/verify', authMiddleware, controller.verifyAccount);
router.post('/verify/resend', authMiddleware, controller.resendVerification);
router.get('/profile', authMiddleware, controller.getProfile);
router.put('/profile', authMiddleware, controller.updateProfile);
router.post('/password/change', authMiddleware, controller.changePassword);

export default router;
