import express from 'express';
import * as listController from '@/controllers/listController';
import { authMiddleware } from '@/middleware/auth';
import { asyncHandler } from '@/utils/asyncHandler';

const router = express.Router();

router.use(authMiddleware);

router.post('/', asyncHandler(listController.createList));
router.put('/:listId', asyncHandler(listController.updateList));
router.delete('/:listId', asyncHandler(listController.deleteList));

router.post('/:listId/collaborators', asyncHandler(listController.addCollaborator));
router.delete('/:listId/collaborators/:collaboratorId', asyncHandler(listController.removeCollaborator));

router.post('/:listId/items', asyncHandler(listController.createListItem));
router.put('/items/:itemId', asyncHandler(listController.updateListItem));

router.get('/:listId', asyncHandler(listController.getListById));
router.get('/', asyncHandler(listController.getUserLists));

router.get('/:listId/stats', asyncHandler(listController.getListStats));

router.post('/regenerate-recurring', asyncHandler(listController.regenerateRecurringLists));

export default router;
