// backend/src/controllers/choreController.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { addDays, addWeeks, addMonths } from 'date-fns';

// Create a new chore
export const createChore = async (req: Request, res: Response) => {
  try {
    const { title, description, frequency } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate input
    if (!title || !frequency) {
      res.status(400).json({ message: 'Title and frequency are required' });
    }

    // Validate frequency (daily, weekly, monthly)
    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      res.status(400).json({ message: 'Frequency must be daily, weekly, or monthly' });
    }

    // Create chore
    const chore = await prisma.chore.create({
      data: {
        title,
        description,
        frequency,
        createdBy: userId,
      },
    });

    // Create first instance of the chore
    const dueDate = new Date();
    await prisma.choreInstance.create({
      data: {
        choreId: chore.id,
        userId,
        dueDate,
      },
    });

    res.status(201).json(chore);
  } catch (error) {
    console.error('Error creating chore:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get chore by ID
export const getChoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    const chore = await prisma.chore.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        instances: {
          orderBy: {
            dueDate: 'desc'
          },
          take: 10
        }
      }
    });

    if (!chore) {
      res.status(404).json({ message: 'Chore not found' });
    }

    if (chore.createdBy !== userId) {
      res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(chore);
  } catch (error) {
    console.error('Error getting chore:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all chores for the current user
export const getAllChores = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    const chores = await prisma.chore.findMany({
      where: {
        createdBy: userId
      },
      include: {
        instances: {
          orderBy: {
            dueDate: 'desc'
          },
          take: 1
        }
      }
    });

    res.status(200).json(chores);
  } catch (error) {
    console.error('Error getting chores:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update chore
export const updateChore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, frequency } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if chore exists and belongs to user
    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingChore) {
      res.status(404).json({ message: 'Chore not found' });
    }

    if (existingChore.createdBy !== userId) {
      res.status(403).json({ message: 'Access denied' });
    }

    // Update chore
    const updatedChore = await prisma.chore.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        frequency,
      },
    });

    res.status(200).json(updatedChore);
  } catch (error) {
    console.error('Error updating chore:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete chore
export const deleteChore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if chore exists and belongs to user
    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingChore) {
      res.status(404).json({ message: 'Chore not found' });
    }

    if (existingChore.createdBy !== userId) {
      res.status(403).json({ message: 'Access denied' });
    }

    // Delete all instances first (due to foreign key constraint)
    await prisma.choreInstance.deleteMany({
      where: { choreId: parseInt(id) }
    });

    // Delete chore
    await prisma.chore.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting chore:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get chore instances
export const getChoreInstances = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if chore exists and belongs to user
    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingChore) {
      res.status(404).json({ message: 'Chore not found' });
    }

    if (existingChore.createdBy !== userId) {
      res.status(403).json({ message: 'Access denied' });
    }

    // Get chore instances
    const instances = await prisma.choreInstance.findMany({
      where: { choreId: parseInt(id) },
      orderBy: { dueDate: 'desc' },
      take: 100, // Limit to last 100 instances
    });

    res.status(200).json(instances);
  } catch (error) {
    console.error('Error getting chore instances:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create chore instance (schedule a chore)
export const createChoreInstance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dueDate, userId: assignedUserId } = req.body;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if chore exists and belongs to user
    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingChore) {
      res.status(404).json({ message: 'Chore not found' });
    }

    if (existingChore.createdBy !== currentUserId) {
      res.status(403).json({ message: 'Access denied' });
    }

    // Create chore instance
    const choreInstance = await prisma.choreInstance.create({
      data: {
        choreId: parseInt(id),
        userId: assignedUserId || currentUserId,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
      },
    });

    res.status(201).json(choreInstance);
  } catch (error) {
    console.error('Error creating chore instance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Complete chore instance
export const completeChoreInstance = async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if instance exists and belongs to user
    const instance = await prisma.choreInstance.findUnique({
      where: { id: parseInt(instanceId) },
      include: { chore: true }
    });

    if (!instance) {
      res.status(404).json({ message: 'Chore instance not found' });
    }

    if (instance.userId !== userId && instance.chore.createdBy !== userId) {
      res.status(403).json({ message: 'Access denied' });
    }

    // Update instance to completed
    const completedInstance = await prisma.choreInstance.update({
      where: { id: parseInt(instanceId) },
      data: {
        completedAt: new Date()
      },
    });

    // Create next instance based on frequency
    let nextDueDate = new Date();

    switch (instance.chore.frequency) {
      case 'daily':
        nextDueDate = addDays(instance.dueDate, 1);
        break;
      case 'weekly':
        nextDueDate = addWeeks(instance.dueDate, 1);
        break;
      case 'monthly':
        nextDueDate = addMonths(instance.dueDate, 1);
        break;
    }

    // Create next instance
    await prisma.choreInstance.create({
      data: {
        choreId: instance.choreId,
        userId: instance.userId,
        dueDate: nextDueDate,
      },
    });

    res.status(200).json(completedInstance);
  } catch (error) {
    console.error('Error completing chore instance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};