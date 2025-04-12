import express from 'express';
import userRoutes from '@/routes/userRoutes';
import adminRoutes from '@/routes/adminRoutes';
import groupRoutes from '@/routes/groupRoutes';
import listRoutes from '@/routes/listRoutes';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/groups', groupRoutes);
router.use('/lists', listRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Chores API!' });
});

export default router;
