import { AppContext } from '@/context';
import { Errors } from '@/utils/AppError';
import { ListErrors } from '@/utils/errorCases';
import { CreateListData, UpdateListData, CreateListItemData, UpdateListItemData } from '@/types';
import { ListCollaboratorRole, ListItemStatus, ListType, RecurrenceFrequency } from '@/generated/client';
import { checkListItem } from '@/utils/listUtils';
import {
  ListResponse,
  ListsListResponse,
  ListItemResponse,
  ServiceResponse,
  ListStatsResponse,
  ListStats,
} from '@/types/serviceTypes';

export const createList = async (context: AppContext, data: CreateListData): Promise<ListResponse> => {
  const { name, type, description, isShared, groupId, ownerId, recurrence, collaborators } = data;

  if (!name || !type || !ownerId) {
    throw Errors.BadRequest(ListErrors.MissingRequiredFields());
  }

  const list = await context.db.$transaction(async (tx) => {
    const list = await tx.list.create({
      data: {
        name,
        type,
        description,
        isShared,
        groupId,
        ownerId,
      },
    });

    if (recurrence) {
      await tx.listRecurrence.create({
        data: {
          listId: list.id,
          frequency: recurrence.frequency,
          customInterval: recurrence.customInterval,
          startDate: recurrence.startDate,
          endDate: recurrence.endDate,
        },
      });
    }

    if (collaborators && collaborators.length > 0) {
      const collaboratorData = collaborators.map((collab) => ({
        listId: list.id,
        userId: collab.userId,
        role: collab.role,
      }));

      await tx.listCollaborator.createMany({
        data: collaboratorData,
      });
    }

    return list;
  });

  return {
    success: true,
    data: list,
    message: 'List created successfully',
  };
};

export const updateList = async (
  context: AppContext,
  listId: string,
  data: UpdateListData,
  userId: string
): Promise<ListResponse> => {
  const updatedList = await context.db.$transaction(async (tx) => {
    const collaborator = await tx.listCollaborator.findUnique({
      where: {
        listId_userId: {
          listId,
          userId,
        },
      },
    });

    const list = await tx.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw Errors.NotFound(ListErrors.NotFound());
    }

    if (
      list.ownerId !== userId &&
      (!collaborator ||
        (collaborator.role !== ListCollaboratorRole.EDITOR && collaborator.role !== ListCollaboratorRole.OWNER))
    ) {
      throw Errors.Forbidden(ListErrors.InsufficientPermissions());
    }

    const updatedList = await tx.list.update({
      where: { id: listId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.type && { type: data.type }),
        ...(data.isShared !== undefined && { isShared: data.isShared }),
      },
    });

    if (data.recurrence) {
      await tx.listRecurrence.upsert({
        where: { listId },
        update: {
          ...(data.recurrence.frequency && { frequency: data.recurrence.frequency }),
          ...(data.recurrence.customInterval && { customInterval: data.recurrence.customInterval }),
          ...(data.recurrence.startDate && { startDate: data.recurrence.startDate }),
          ...(data.recurrence.endDate && { endDate: data.recurrence.endDate }),
        },
        create: {
          listId,
          frequency: data.recurrence.frequency || RecurrenceFrequency.ONE_TIME,
          startDate: data.recurrence.startDate || new Date(),
          customInterval: data.recurrence.customInterval,
          endDate: data.recurrence.endDate,
        },
      });
    }

    return updatedList;
  });

  return {
    success: true,
    data: updatedList,
    message: 'List updated successfully',
  };
};

export const deleteList = async (
  context: AppContext,
  listId: string,
  userId: string
): Promise<ServiceResponse<boolean>> => {
  await context.db.$transaction(async (tx) => {
    const list = await tx.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw Errors.NotFound(ListErrors.NotFound());
    }

    if (list.ownerId !== userId) {
      throw Errors.Forbidden(ListErrors.InsufficientPermissions());
    }

    await tx.list.update({
      where: { id: listId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  });

  return {
    success: true,
    data: true,
    message: 'List deleted successfully',
  };
};

export const addListCollaborator = async (
  context: AppContext,
  listId: string,
  collaboratorId: string,
  role: ListCollaboratorRole,
  addedById: string
): Promise<
  ServiceResponse<{
    listId: string;
    userId: string;
    role: ListCollaboratorRole;
  }>
> => {
  const collaborator = await context.db.$transaction(async (tx) => {
    const list = await tx.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw Errors.NotFound(ListErrors.NotFound());
    }

    const addingUserCollaborator = await tx.listCollaborator.findUnique({
      where: {
        listId_userId: {
          listId,
          userId: addedById,
        },
      },
    });

    if (
      list.ownerId !== addedById &&
      (!addingUserCollaborator ||
        (addingUserCollaborator.role !== ListCollaboratorRole.EDITOR &&
          addingUserCollaborator.role !== ListCollaboratorRole.OWNER))
    ) {
      throw Errors.Forbidden(ListErrors.InsufficientPermissions());
    }

    const existingCollaborator = await tx.listCollaborator.findUnique({
      where: {
        listId_userId: {
          listId,
          userId: collaboratorId,
        },
      },
    });

    if (existingCollaborator) {
      throw Errors.Conflict(ListErrors.CollaboratorAlreadyExists());
    }

    return tx.listCollaborator.create({
      data: {
        listId,
        userId: collaboratorId,
        role,
      },
    });
  });

  return {
    success: true,
    data: {
      listId: collaborator.listId,
      userId: collaborator.userId,
      role: collaborator.role,
    },
    message: 'Collaborator added successfully',
  };
};

export const removeListCollaborator = async (
  context: AppContext,
  listId: string,
  collaboratorId: string,
  removedById: string
): Promise<ServiceResponse<boolean>> => {
  await context.db.$transaction(async (tx) => {
    const list = await tx.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw Errors.NotFound(ListErrors.NotFound());
    }

    const removingUserCollaborator = await tx.listCollaborator.findUnique({
      where: {
        listId_userId: {
          listId,
          userId: removedById,
        },
      },
    });

    if (
      list.ownerId !== removedById &&
      (!removingUserCollaborator || removingUserCollaborator.role !== ListCollaboratorRole.OWNER)
    ) {
      throw Errors.Forbidden(ListErrors.InsufficientPermissions());
    }

    await tx.listCollaborator.delete({
      where: {
        listId_userId: {
          listId,
          userId: collaboratorId,
        },
      },
    });
  });

  return {
    success: true,
    data: true,
    message: 'Collaborator removed successfully',
  };
};

export const createListItem = async (
  context: AppContext,
  listId: string,
  data: CreateListItemData,
  userId: string
): Promise<ListItemResponse> => {
  const listItem = await context.db.$transaction(async (tx) => {
    const list = await tx.list.findUnique({
      where: { id: listId },
      include: {
        collaborators: true,
      },
    });

    if (!list) {
      throw Errors.NotFound(ListErrors.NotFound());
    }

    const isAuthorized =
      list.ownerId === userId ||
      list.collaborators.some(
        (collab) =>
          collab.userId === userId &&
          (collab.role === ListCollaboratorRole.EDITOR || collab.role === ListCollaboratorRole.OWNER)
      );

    if (!isAuthorized) {
      throw Errors.Forbidden(ListErrors.InsufficientPermissions());
    }

    return tx.listItem.create({
      data: {
        listId,
        title: data.title,
        description: data.description,
        assignedToId: data.assignedToId,
        quantity: data.quantity,
        timeEstimate: data.timeEstimate,
        priority: data.priority,
        dueDate: data.dueDate,
      },
    });
  });

  return {
    success: true,
    data: listItem,
    message: 'List item created successfully',
  };
};

export const updateListItem = async (
  context: AppContext,
  listItemId: string,
  data: UpdateListItemData,
  userId: string
): Promise<ServiceResponse<boolean>> => {
  await context.db.$transaction(async (tx) => {
    await checkListItem(tx, listItemId, userId);

    await tx.listItem.delete({
      where: { id: listItemId },
    });
  });

  return {
    success: true,
    data: true,
    message: 'List item updated successfully',
  };
};

export const getListById = async (context: AppContext, listId: string, userId: string): Promise<ListResponse> => {
  const list = await context.db.list.findUnique({
    where: {
      id: listId,
      OR: [
        { ownerId: userId },
        {
          collaborators: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
    include: {
      items: true,
      collaborators: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      },
      recurrence: true,
    },
  });

  if (!list) {
    throw Errors.NotFound(ListErrors.NotFound());
  }

  return {
    success: true,
    data: list,
  };
};

export const getUserLists = async (
  context: AppContext,
  userId: string,
  filters?: {
    type?: ListType;
    groupId?: string;
  }
): Promise<ListsListResponse> => {
  const lists = await context.db.list.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          collaborators: {
            some: {
              userId: userId,
            },
          },
        },
      ],
      ...(filters?.type && { type: filters.type }),
      ...(filters?.groupId && { groupId: filters.groupId }),
      isDeleted: false,
    },
    include: {
      items: true,
      collaborators: true,
    },
  });

  return {
    success: true,
    data: lists,
  };
};

export const getListCompletionStats = async (context: AppContext, listId: string): Promise<ListStatsResponse> => {
  const list = await context.db.list.findUnique({
    where: { id: listId },
    include: {
      items: true,
    },
  });

  if (!list) {
    throw Errors.NotFound(ListErrors.NotFound());
  }

  const totalItems = list.items.length;
  const completedItems = list.items.filter((item) => item.status === ListItemStatus.COMPLETED).length;

  const userContributions = list.items.reduce(
    (acc, item) => {
      if (item.completedById) {
        const existingContrib = acc.find((c) => c.userId === item.completedById);
        if (existingContrib) {
          existingContrib.completedItems++;
        } else {
          acc.push({
            userId: item.completedById,
            completedItems: 1,
            completionPercentage: 0,
          });
        }
      }
      return acc;
    },
    [] as Array<{
      userId: string;
      completedItems: number;
      completionPercentage: number;
    }>
  );

  userContributions.forEach((contrib) => {
    contrib.completionPercentage = (contrib.completedItems / totalItems) * 100;
  });

  const completedItemsSorted = list.items
    .filter((item) => item.status === ListItemStatus.COMPLETED && item.completedAt)
    .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));

  const stats: ListStats = {
    totalItems,
    completedItems,
    completionPercentage: (completedItems / totalItems) * 100 || 0,
    itemsByStatus: list.items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<ListItemStatus, number>
    ),
    userContributions,
    lastCompletedAt: completedItemsSorted.length > 0 ? completedItemsSorted[0].completedAt! : undefined,
  };

  return {
    success: true,
    data: stats,
  };
};

export const regenerateRecurringLists = async (context: AppContext): Promise<ServiceResponse<boolean>> => {
  const recurringLists = await context.db.listRecurrence.findMany({
    where: {
      AND: [
        { endDate: null },
        {
          OR: [
            { lastOccurrence: null },
            {
              lastOccurrence: {
                lt: new Date(),
              },
            },
          ],
        },
      ],
    },
    include: {
      list: true,
    },
  });

  for (const recurrence of recurringLists) {
    await context.db.$transaction(async (tx) => {
      await tx.list.create({
        data: {
          name: recurrence.list.name,
          type: recurrence.list.type,
          description: recurrence.list.description,
          isShared: recurrence.list.isShared,
          groupId: recurrence.list.groupId,
          ownerId: recurrence.list.ownerId,
        },
      });

      await tx.listRecurrence.update({
        where: { id: recurrence.id },
        data: {
          lastOccurrence: new Date(),
        },
      });
    });
  }

  return {
    success: true,
    data: true,
    message: 'Recurring lists regenerated successfully',
  };
};
