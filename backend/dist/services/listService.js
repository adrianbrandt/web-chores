"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateRecurringLists = exports.getListCompletionStats = exports.getUserLists = exports.getListById = exports.updateListItem = exports.createListItem = exports.removeListCollaborator = exports.addListCollaborator = exports.deleteList = exports.updateList = exports.createList = void 0;
const AppError_1 = require("@/utils/AppError");
const errorCases_1 = require("@/utils/errorCases");
const client_1 = require("@/generated/client");
const listUtils_1 = require("@/utils/listUtils");
const createList = (context, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, type, description, isShared, groupId, ownerId, recurrence, collaborators } = data;
    if (!name || !type || !ownerId) {
        throw AppError_1.Errors.BadRequest(errorCases_1.ListErrors.MissingRequiredFields());
    }
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield tx.list.create({
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
            yield tx.listRecurrence.create({
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
            yield tx.listCollaborator.createMany({
                data: collaboratorData,
            });
        }
        return list;
    }));
});
exports.createList = createList;
const updateList = (context, listId, data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const collaborator = yield tx.listCollaborator.findUnique({
            where: {
                listId_userId: {
                    listId,
                    userId,
                },
            },
        });
        const list = yield tx.list.findUnique({
            where: { id: listId },
        });
        if (!list) {
            throw AppError_1.Errors.NotFound(errorCases_1.ListErrors.NotFound());
        }
        if (list.ownerId !== userId &&
            (!collaborator ||
                (collaborator.role !== client_1.ListCollaboratorRole.EDITOR && collaborator.role !== client_1.ListCollaboratorRole.OWNER))) {
            throw AppError_1.Errors.Forbidden(errorCases_1.ListErrors.InsufficientPermissions());
        }
        const updatedList = yield tx.list.update({
            where: { id: listId },
            data: Object.assign(Object.assign(Object.assign(Object.assign({}, (data.name && { name: data.name })), (data.description && { description: data.description })), (data.type && { type: data.type })), (data.isShared !== undefined && { isShared: data.isShared })),
        });
        if (data.recurrence) {
            yield tx.listRecurrence.upsert({
                where: { listId },
                update: Object.assign(Object.assign(Object.assign(Object.assign({}, (data.recurrence.frequency && { frequency: data.recurrence.frequency })), (data.recurrence.customInterval && { customInterval: data.recurrence.customInterval })), (data.recurrence.startDate && { startDate: data.recurrence.startDate })), (data.recurrence.endDate && { endDate: data.recurrence.endDate })),
                create: {
                    listId,
                    frequency: data.recurrence.frequency || client_1.RecurrenceFrequency.ONE_TIME,
                    startDate: data.recurrence.startDate || new Date(),
                    customInterval: data.recurrence.customInterval,
                    endDate: data.recurrence.endDate,
                },
            });
        }
        return updatedList;
    }));
});
exports.updateList = updateList;
const deleteList = (context, listId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield tx.list.findUnique({
            where: { id: listId },
        });
        if (!list) {
            throw AppError_1.Errors.NotFound(errorCases_1.ListErrors.NotFound());
        }
        if (list.ownerId !== userId) {
            throw AppError_1.Errors.Forbidden(errorCases_1.ListErrors.InsufficientPermissions());
        }
        yield tx.list.update({
            where: { id: listId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }));
});
exports.deleteList = deleteList;
const addListCollaborator = (context, listId, collaboratorId, role, addedById) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield tx.list.findUnique({
            where: { id: listId },
        });
        if (!list) {
            throw AppError_1.Errors.NotFound(errorCases_1.ListErrors.NotFound());
        }
        const addingUserCollaborator = yield tx.listCollaborator.findUnique({
            where: {
                listId_userId: {
                    listId,
                    userId: addedById,
                },
            },
        });
        if (list.ownerId !== addedById &&
            (!addingUserCollaborator ||
                (addingUserCollaborator.role !== client_1.ListCollaboratorRole.EDITOR &&
                    addingUserCollaborator.role !== client_1.ListCollaboratorRole.OWNER))) {
            throw AppError_1.Errors.Forbidden(errorCases_1.ListErrors.InsufficientPermissions());
        }
        const existingCollaborator = yield tx.listCollaborator.findUnique({
            where: {
                listId_userId: {
                    listId,
                    userId: collaboratorId,
                },
            },
        });
        if (existingCollaborator) {
            throw AppError_1.Errors.Conflict(errorCases_1.ListErrors.CollaboratorAlreadyExists());
        }
        return tx.listCollaborator.create({
            data: {
                listId,
                userId: collaboratorId,
                role,
            },
        });
    }));
});
exports.addListCollaborator = addListCollaborator;
const removeListCollaborator = (context, listId, collaboratorId, removedById) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield tx.list.findUnique({
            where: { id: listId },
        });
        if (!list) {
            throw AppError_1.Errors.NotFound(errorCases_1.ListErrors.NotFound());
        }
        const removingUserCollaborator = yield tx.listCollaborator.findUnique({
            where: {
                listId_userId: {
                    listId,
                    userId: removedById,
                },
            },
        });
        if (list.ownerId !== removedById &&
            (!removingUserCollaborator || removingUserCollaborator.role !== client_1.ListCollaboratorRole.OWNER)) {
            throw AppError_1.Errors.Forbidden(errorCases_1.ListErrors.InsufficientPermissions());
        }
        yield tx.listCollaborator.delete({
            where: {
                listId_userId: {
                    listId,
                    userId: collaboratorId,
                },
            },
        });
    }));
});
exports.removeListCollaborator = removeListCollaborator;
const createListItem = (context, listId, data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield tx.list.findUnique({
            where: { id: listId },
            include: {
                collaborators: true,
            },
        });
        if (!list) {
            throw AppError_1.Errors.NotFound(errorCases_1.ListErrors.NotFound());
        }
        const isAuthorized = list.ownerId === userId ||
            list.collaborators.some((collab) => collab.userId === userId &&
                (collab.role === client_1.ListCollaboratorRole.EDITOR || collab.role === client_1.ListCollaboratorRole.OWNER));
        if (!isAuthorized) {
            throw AppError_1.Errors.Forbidden(errorCases_1.ListErrors.InsufficientPermissions());
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
    }));
});
exports.createListItem = createListItem;
const updateListItem = (context, listItemId, data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, listUtils_1.checkListItem)(tx, listItemId, userId);
        yield tx.listItem.delete({
            where: { id: listItemId },
        });
    }));
});
exports.updateListItem = updateListItem;
const getListById = (context, listId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const list = yield context.db.list.findUnique({
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
        throw AppError_1.Errors.NotFound(errorCases_1.ListErrors.NotFound());
    }
    return list;
});
exports.getListById = getListById;
const getUserLists = (context, userId, filters) => __awaiter(void 0, void 0, void 0, function* () {
    return context.db.list.findMany({
        where: Object.assign(Object.assign(Object.assign({ OR: [
                { ownerId: userId },
                {
                    collaborators: {
                        some: {
                            userId: userId,
                        },
                    },
                },
            ] }, ((filters === null || filters === void 0 ? void 0 : filters.type) && { type: filters.type })), ((filters === null || filters === void 0 ? void 0 : filters.groupId) && { groupId: filters.groupId })), { isDeleted: false }),
        include: {
            items: true,
            collaborators: true,
        },
    });
});
exports.getUserLists = getUserLists;
const getListCompletionStats = (context, listId) => __awaiter(void 0, void 0, void 0, function* () {
    const list = yield context.db.list.findUnique({
        where: { id: listId },
        include: {
            items: true,
        },
    });
    if (!list) {
        throw AppError_1.Errors.NotFound(errorCases_1.ListErrors.NotFound());
    }
    const totalItems = list.items.length;
    const completedItems = list.items.filter((item) => item.status === client_1.ListItemStatus.COMPLETED).length;
    const userContributions = list.items.reduce((acc, item) => {
        if (item.completedById) {
            const existingContrib = acc.find((c) => c.userId === item.completedById);
            if (existingContrib) {
                existingContrib.completedItems++;
            }
            else {
                acc.push({
                    userId: item.completedById,
                    completedItems: 1,
                    completionPercentage: 0,
                });
            }
        }
        return acc;
    }, []);
    userContributions.forEach((contrib) => {
        contrib.completionPercentage = (contrib.completedItems / totalItems) * 100;
    });
    const completedItemsSorted = list.items
        .filter((item) => item.status === client_1.ListItemStatus.COMPLETED && item.completedAt)
        .sort((a, b) => { var _a, _b; return (((_a = b.completedAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.completedAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); });
    return {
        totalItems,
        completedItems,
        completionPercentage: (completedItems / totalItems) * 100 || 0,
        itemsByStatus: list.items.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {}),
        userContributions,
        lastCompletedAt: completedItemsSorted.length > 0 ? completedItemsSorted[0].completedAt : undefined,
    };
});
exports.getListCompletionStats = getListCompletionStats;
const regenerateRecurringLists = (context) => __awaiter(void 0, void 0, void 0, function* () {
    const recurringLists = yield context.db.listRecurrence.findMany({
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
        yield context.db.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const newList = yield tx.list.create({
                data: {
                    name: recurrence.list.name,
                    type: recurrence.list.type,
                    description: recurrence.list.description,
                    isShared: recurrence.list.isShared,
                    groupId: recurrence.list.groupId,
                    ownerId: recurrence.list.ownerId,
                },
            });
            yield tx.listRecurrence.update({
                where: { id: recurrence.id },
                data: {
                    lastOccurrence: new Date(),
                },
            });
        }));
    }
});
exports.regenerateRecurringLists = regenerateRecurringLists;
