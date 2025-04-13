import { Request, Response } from 'express';
import * as listService from '../services/listService';
import logger from '../config/logger';
import { ListType } from '@/generated/client';

export const createList = async (req: Request, res: Response) => {
  const result = await listService.createList(req.context, req.body);
  logger.info('List created successfully', { listId: result.data?.id });
  res.status(201).json({
    message: result.message,
    list: result.data,
  });
};

export const updateList = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const result = await listService.updateList(req.context, listId, req.body, req.user!.userId);
  logger.info('List updated successfully', { listId: result.data?.id });
  res.json({
    message: result.message,
    list: result.data,
  });
};

export const deleteList = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const result = await listService.deleteList(req.context, listId, req.user!.userId);
  logger.info('List deleted', { listId });
  res.json({ message: result.message });
};

export const addCollaborator = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const { collaboratorId, role } = req.body;
  const result = await listService.addListCollaborator(req.context, listId, collaboratorId, role, req.user!.userId);
  logger.info('Collaborator added', { listId, collaboratorId });
  res.status(201).json({
    message: result.message,
    collaborator: result.data,
  });
};

export const removeCollaborator = async (req: Request, res: Response) => {
  const { listId, collaboratorId } = req.params;
  const result = await listService.removeListCollaborator(req.context, listId, collaboratorId, req.user!.userId);
  logger.info('Collaborator removed', { listId, collaboratorId });
  res.json({ message: result.message });
};

export const createListItem = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const result = await listService.createListItem(req.context, listId, req.body, req.user!.userId);
  logger.info('List item created', { listId, itemId: result.data?.id });
  res.status(201).json({
    message: result.message,
    item: result.data,
  });
};

export const updateListItem = async (req: Request, res: Response) => {
  const { listItemId } = req.params;
  const result = await listService.updateListItem(req.context, listItemId, req.body, req.user!.userId);
  logger.info('List item updated (via delete)', { listItemId });
  res.json({ message: result.message });
};

export const getListById = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const result = await listService.getListById(req.context, listId, req.user!.userId);
  logger.info('Fetched list', { listId });
  res.json(result.data);
};

export const getUserLists = async (req: Request, res: Response) => {
  const type = req.query.type as ListType | undefined;
  const groupId = req.query.groupId as string | undefined;

  const result = await listService.getUserLists(req.context, req.user!.userId, {
    type,
    groupId,
  });

  logger.info('Fetched user lists', { userId: req.user!.userId });
  res.json(result.data);
};

export const getListStats = async (req: Request, res: Response) => {
  const { listId } = req.params;
  const result = await listService.getListCompletionStats(req.context, listId);
  logger.info('Fetched list stats', { listId });
  res.json(result.data);
};

export const regenerateRecurringLists = async (req: Request, res: Response) => {
  const result = await listService.regenerateRecurringLists(req.context);
  logger.info('Recurring lists regenerated');
  res.json({ message: result.message });
};
