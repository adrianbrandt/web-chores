// backend/src/routes/index.ts
import express from 'express';
import users from './users';
import chores from './chores';
import lists from './lists';

const router = express.Router();

router.use('/users',users)
router.use('/chores',chores)
router.use('/lists',lists)

export default router