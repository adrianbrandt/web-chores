// backend/src/controllers/listController.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Define interfaces to match Prisma models
interface ListShare {
  id: number;
  listId: number;
  userId: number;
}

interface List {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  shared: ListShare[];
}

interface ListItem {
  id: number;
  listId: number;
  content: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  list: List;
}

// Create a new list
export const createList = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return
    }

    // Validate input
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
    }

    // Create list
    const list = await prisma.list.create({
      data: {
        title,
        createdBy: userId
      }
    });

    res.status(201).json(list);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ message: 'Internal server error' });
    return
  }
};

// Get list by ID
export const getListById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Get list with items
    const list = await prisma.list.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        shared: true
      }
    });

    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return
    }

    // Check if user is the creator or has shared access
    const isSharedWithUser = list.shared.some((share: ListShare) => share.userId === userId);

    if (list.createdBy !== userId && !isSharedWithUser) {
      res.status(403).json({ message: 'Access denied' });
      return
    }

    res.status(200).json(list);
  } catch (error) {
    console.error('Error getting list:', error);
    res.status(500).json({ message: 'Internal server error' });
    return
  }
};

// Get all lists for the current user
export const getAllLists = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return
    }

    // Get user's lists
    const lists = await prisma.list.findMany({
      where: {
        createdBy: userId
      },
      include: {
        items: {
          select: {
            id: true,
            content: true,
            completed: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.status(200).json(lists);
  } catch (error) {
    console.error('Error getting lists:', error);
    res.status(500).json({ message: 'Internal server error' });
    return
  }
};

// Update list
export const updateList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return
    }

    // Check if list exists and belongs to user
    const existingList = await prisma.list.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingList) {
      res.status(404).json({ message: 'List not found' });
      return
    }

    if (existingList.createdBy !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return
    }

    // Update list
    const updatedList = await prisma.list.update({
      where: { id: parseInt(id) },
      data: { title }
    });

    res.status(200).json(updatedList);
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ message: 'Internal server error' });
    return
  }
};

// Delete list
export const deleteList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if list exists and belongs to user
    const existingList = await prisma.list.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingList) {
      res.status(404).json({ message: 'List not found' });
      return
    }

    if (existingList.createdBy !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return
    }

    // Delete list shares first
    await prisma.listShare.deleteMany({
      where: { listId: parseInt(id) }
    });

    // Delete list items
    await prisma.listItem.deleteMany({
      where: { listId: parseInt(id) }
    });

    // Delete list
    await prisma.list.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ message: 'Internal server error' });
    return
  }
};

// Add list item
export const addListItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if list exists
    const list = await prisma.list.findUnique({
      where: { id: parseInt(id) },
      include: { shared: true }
    });

    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return
    }

    // Check if user is the creator or has shared access
    const isSharedWithUser = list.shared.some((share: ListShare) => share.userId === userId);

    if (list.createdBy !== userId && !isSharedWithUser) {
      res.status(403).json({ message: 'Access denied' });
      return
    }

    // Add item to list
    const listItem = await prisma.listItem.create({
      data: {
        listId: parseInt(id),
        content
      }
    });

    res.status(201).json(listItem);
  } catch (error) {
    console.error('Error adding list item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update list item
export const updateListItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return
    }

    // Get the item with its list
    const item = await prisma.listItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        list: {
          include: { shared: true }
        }
      }
    });

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return
    }

    // Check if user is the creator or has shared access
    const isSharedWithUser = item.list.shared.some((share: ListShare) => share.userId === userId);

    if (item.list.createdBy !== userId && !isSharedWithUser) {
      res.status(403).json({ message: 'Access denied' });
    }

    // Update item
    const updatedItem = await prisma.listItem.update({
      where: { id: parseInt(itemId) },
      data: { content }
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating list item:', error);
    res.status(500).json({ message: 'Internal server error' });
    return
  }
};

// Delete list item
export const deleteListItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return
    }

    // Get the item with its list
    const item = await prisma.listItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        list: {
          include: { shared: true }
        }
      }
    });

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return
    }

    // Check if user is the creator or has shared access
    const isSharedWithUser = item.list.shared.some((share: ListShare) => share.userId === userId);

    if (item.list.createdBy !== userId && !isSharedWithUser) {
      res.status(403).json({ message: 'Access denied' });
    }

    // Delete item
    await prisma.listItem.delete({
      where: { id: parseInt(itemId) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting list item:', error);
    res.status(500).json({ message: 'Internal server error' });
    return
  }
};

// Toggle list item completion status
export const toggleListItemCompletion = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return
    }

    // Get the item with its list
    const item = await prisma.listItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        list: {
          include: { shared: true }
        }
      }
    });

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return
    }

    // Check if user is the creator or has shared access
    const isSharedWithUser = item.list.shared.some((share: ListShare) => share.userId === userId);

    if (item.list.createdBy !== userId && !isSharedWithUser) {
      res.status(403).json({ message: 'Access denied' });
      return
    }

    // Toggle item completion
    const updatedItem = await prisma.listItem.update({
      where: { id: parseInt(itemId) },
      data: { completed: !item.completed }
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error toggling list item completion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Share list with another user
export const shareList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if list exists and belongs to user
    const list = await prisma.list.findUnique({
      where: { id: parseInt(id) }
    });

    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return
    }

    if (list.createdBy !== userId) {
      res.status(403).json({ message: 'Only the list creator can share it' });
      return
    }

    // Find user by email
    const userToShare = await prisma.user.findUnique({
      where: { email }
    });

    if (!userToShare) {
      res.status(404).json({ message: 'User not found' });
      return
    }

    // Don't share with self
    if (userToShare.id === userId) {
      res.status(400).json({ message: 'Cannot share list with yourself' });
      return
    }

    // Check if already shared
    const existingShare = await prisma.listShare.findFirst({
      where: {
        listId: parseInt(id),
        userId: userToShare.id
      }
    });

    if (existingShare) {
      res.status(400).json({ message: 'List already shared with this user' });
    }

    // Create share
    const share = await prisma.listShare.create({
      data: {
        listId: parseInt(id),
        userId: userToShare.id
      }
    });

    res.status(201).json(share);
  } catch (error) {
    console.error('Error sharing list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all lists shared with the current user
export const getSharedLists = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Get all list IDs shared with user
    const shares = await prisma.listShare.findMany({
      where: { userId }
    });

    const listIds = shares.map((share: ListShare) => share.listId);

    // Get the actual lists with items
    const sharedLists = await prisma.list.findMany({
      where: {
        id: { in: listIds }
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(sharedLists);
  } catch (error) {
    console.error('Error getting shared lists:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove list share
export const removeListShare = async (req: Request, res: Response) => {
  try {
    const { id, userId: shareUserId } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if list exists
    const list = await prisma.list.findUnique({
      where: { id: parseInt(id) }
    });

    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return
    }

    // Only the list creator can remove shares
    if (list.createdBy !== currentUserId) {
      res.status(403).json({ message: 'Only the list creator can manage shares' });
      return
    }

    // Delete the share
    await prisma.listShare.deleteMany({
      where: {
        listId: parseInt(id),
        userId: parseInt(shareUserId)
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error removing list share:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};