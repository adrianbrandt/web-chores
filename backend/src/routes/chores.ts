// backend/src/routes/chores.ts
import express from 'express';
import {
  createChore,
  getChoreById,
  getAllChores,
  updateChore,
  deleteChore,
  getChoreInstances,
  completeChoreInstance,
  createChoreInstance
} from '../controllers/choreController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all chore routes
router.use(authenticateToken);

// Chore routes
router.post('/', createChore);
router.get('/:id', getChoreById);
router.get('/', getAllChores);
router.put('/:id', updateChore);
router.delete('/:id', deleteChore);

// Chore instance routes
router.get('/:id/instances', getChoreInstances);
router.post('/:id/instances', createChoreInstance);
router.put('/instances/:instanceId/complete', completeChoreInstance);

export default router;