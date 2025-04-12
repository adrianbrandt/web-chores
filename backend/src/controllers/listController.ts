import { Request, Response } from 'express';
import * as listService from '../services/listService';
import logger from '../config/logger';
import { Errors } from '@/utils/AppError';
import { ListErrors } from '@/utils/errorCases';

export const createList = async (req: Request, res: Response) => {
  const result = await listService.createList(req.context, req.body);
  logger.info('List created successfully', { listId: result.id });
  res.status(201).json(result);
};

export const updateList = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const result = await listService.updateList(req.context, listId, req.body, req.user!.userId);
  logger.info('List updated successfully', { listId: result.id });
  res.json(result);
};

export const deleteList = async (req: Request, res: Response) => {
  const { listId } = req.params;
  await listService.deleteList(req.context, listId, req.user!.userId);
  logger.info('List deleted', { listId });
  res.status(204).send();
};

export const addCollaborator = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const { collaboratorId, role } = req.body;
  const result = await listService.addListCollaborator(req.context, listId, collaboratorId, role, req.user!.userId);
  logger.info('Collaborator added', { listId, collaboratorId });
  res.status(201).json(result);
};

export const removeCollaborator = async (req: Request, res: Response) => {
  const { listId, collaboratorId } = req.params;
  await listService.removeListCollaborator(req.context, listId, collaboratorId, req.user!.userId);
  logger.info('Collaborator removed', { listId, collaboratorId });
  res.status(204).send();
};

export const createListItem = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const result = await listService.createListItem(req.context, listId, req.body, req.user!.userId);
  logger.info('List item created', { listId, itemId: result.id });
  res.status(201).json(result);
};

export const updateListItem = async (req: Request, res: Response) => {
  const { listItemId } = req.params;
  await listService.updateListItem(req.context, listItemId, req.body, req.user!.userId);
  logger.info('List item updated (via delete)', { listItemId });
  res.status(204).send();
};

export const getListById = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const result = await listService.getListById(req.context, listId, req.user!.userId);
  logger.info('Fetched list', { listId });
  res.json(result);
};

export const getUserLists = async (req: Request, res: Response) => {
  const { type, groupId } = req.query;
  const result = await listService.getUserLists(req.context, req.user!.userId, {
    type: type as any,
    groupId: groupId as string,
  });
  logger.info('Fetched user lists', { userId: req.user!.userId });
  res.json(result);
};

export const getListStats = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const result = await listService.getListCompletionStats(req.context, listId);
  logger.info('Fetched list stats', { listId });
  res.json(result);
};

export const regenerateRecurringLists = async (req: Request, res: Response) => {
  await listService.regenerateRecurringLists(req.context);
  logger.info('Recurring lists regenerated');
  res.json({ message: 'Recurring lists regenerated' });
};
