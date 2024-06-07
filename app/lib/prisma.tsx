import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to handle disconnection
// const disconnectPrisma = async () => {
//   try {
//     await prisma.$disconnect();
//     console.log('Prisma disconnected successfully');
//   } catch (error) {
//     console.error('Error disconnecting Prisma:', error);
//   }
// };

// // Call the disconnect function when the process is about to exit
// process.on('beforeExit', async () => {
//   await disconnectPrisma();
// });


export default prisma;