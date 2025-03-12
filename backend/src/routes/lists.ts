// backend/src/routes/lists.ts
import express from 'express';
import {
  createList,
  getListById,
  getAllLists,
  updateList,
  deleteList,
  addListItem,
  updateListItem,
  deleteListItem,
  toggleListItemCompletion,
  shareList,
  getSharedLists,
  removeListShare
} from '../controllers/listController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all list routes
router.use(authenticateToken);

// List routes
router.post('/', createList);
router.get('/:id', getListById);
router.get('/', getAllLists);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

// List items routes
router.post('/:id/items', addListItem);
router.put('/items/:itemId', updateListItem);
router.delete('/items/:itemId', deleteListItem);
router.put('/items/:itemId/toggle', toggleListItemCompletion);

// List sharing routes
router.post('/:id/share', shareList);
router.get('/shared', getSharedLists);
router.delete('/:id/share/:userId', removeListShare);

export default router;