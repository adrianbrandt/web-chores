// backend/src/scripts/initDb.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database initialization...');

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: await bcrypt.hash('password123', 10),
      },
    });

    console.log(`Created admin user: ${adminUser.name}`);

    // Create a regular user
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        name: 'Regular User',
        password: await bcrypt.hash('password123', 10),
      },
    });

    console.log(`Created regular user: ${regularUser.name}`);

    // Create some sample chores for the admin user
    const chores = [
      {
        title: 'Wash dishes',
        description: 'Clean all dishes in the sink',
        frequency: 'daily',
        createdBy: adminUser.id,
      },
      {
        title: 'Vacuum living room',
        description: 'Vacuum the entire living room floor',
        frequency: 'weekly',
        createdBy: adminUser.id,
      },
      {
        title: 'Clean bathroom',
        description: 'Clean the toilet, sink, and shower',
        frequency: 'weekly',
        createdBy: adminUser.id,
      },
      {
        title: 'Mow the lawn',
        description: 'Cut the grass in the front and back yard',
        frequency: 'monthly',
        createdBy: adminUser.id,
      },
    ];

    for (const chore of chores) {
      const createdChore = await prisma.chore.create({
        data: chore,
      });

      // Create an instance for each chore
      await prisma.choreInstance.create({
        data: {
          choreId: createdChore.id,
          userId: adminUser.id,
          dueDate: new Date(),
        },
      });

      console.log(`Created chore: ${createdChore.title}`);
    }

    // Create a sample shopping list for admin
    const groceryList = await prisma.list.create({
      data: {
        title: 'Grocery List',
        createdBy: adminUser.id,
      },
    });

    console.log(`Created list: ${groceryList.title}`);

    // Add items to the grocery list
    const groceryItems = [
      'Milk',
      'Eggs',
      'Bread',
      'Apples',
      'Chicken',
      'Rice',
      'Pasta',
      'Tomatoes',
    ];

    for (const item of groceryItems) {
      await prisma.listItem.create({
        data: {
          listId: groceryList.id,
          content: item,
        },
      });
    }

    console.log(`Added ${groceryItems.length} items to the grocery list`);

    // Share the grocery list with the regular user
    await prisma.listShare.create({
      data: {
        listId: groceryList.id,
        userId: regularUser.id,
      },
    });

    console.log(`Shared grocery list with user: ${regularUser.name}`);

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();