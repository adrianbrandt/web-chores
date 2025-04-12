import { Errors } from '@/utils/AppError';
import { ListErrors } from '@/utils/errorCases';
import { ListCollaboratorRole, Prisma, PrismaClient } from '@/generated/client';
import { DefaultArgs } from '@/generated/client/runtime/library';

export const checkListItem = async (
  tx: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  listItemId: string,
  userId: string
) => {
  const listItem = await tx.listItem.findUnique({
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
    throw Errors.NotFound(ListErrors.NotFound());
  }

  const isAuthorized =
    listItem.list.ownerId === userId ||
    listItem.list.collaborators.some(
      (collab) =>
        collab.userId === userId &&
        (collab.role === ListCollaboratorRole.EDITOR || collab.role === ListCollaboratorRole.OWNER)
    );

  if (!isAuthorized) {
    throw Errors.Forbidden(ListErrors.InsufficientPermissions());
  }

  return listItem;
};
