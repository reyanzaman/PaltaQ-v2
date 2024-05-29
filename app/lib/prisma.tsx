import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example usage
async function getUserById(id: any) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
}

// Don't forget to close the Prisma client when done
prisma.$disconnect();

export default prisma;