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
exports.checkListItem = void 0;
const AppError_1 = require("@/utils/AppError");
const errorCases_1 = require("@/utils/errorCases");
const client_1 = require("@/generated/client");
const checkListItem = (tx, listItemId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const listItem = yield tx.listItem.findUnique({
        where: { id: listItemId },
        include: {
            list: {
                include: {
                    collaborators: true,
                },
            },
        },
    });
    if (!listItem) {
        throw AppError_1.Errors.NotFound(errorCases_1.ListErrors.NotFound());
    }
    const isAuthorized = listItem.list.ownerId === userId ||
        listItem.list.collaborators.some((collab) => collab.userId === userId &&
            (collab.role === client_1.ListCollaboratorRole.EDITOR || collab.role === client_1.ListCollaboratorRole.OWNER));
    if (!isAuthorized) {
        throw AppError_1.Errors.Forbidden(errorCases_1.ListErrors.InsufficientPermissions());
    }
    return listItem;
});
exports.checkListItem = checkListItem;
