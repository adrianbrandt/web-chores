import express from 'express';
import * as listController from '@/controllers/listController';
import { authMiddleware } from '@/middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.post('/', listController.createList);
router.put('/:listId', listController.updateList);
router.delete('/:listId', listController.deleteList);

router.post('/:listId/collaborators', listController.addCollaborator);
router.delete('/:listId/collaborators/:collaboratorId', listController.removeCollaborator);

router.post('/:listId/items', listController.createListItem);
router.put('/items/:itemId', listController.updateListItem);

router.get('/:listId', listController.getListById);
router.get('/', listController.getUserLists);

router.get('/:listId/stats', listController.getListStats);

router.post('/regenerate-recurring', listController.regenerateRecurringLists);

export default router;
