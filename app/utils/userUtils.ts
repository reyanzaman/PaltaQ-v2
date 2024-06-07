import prisma from '@/app/lib/prisma';

export async function getUserIDFromDatabase(email: string): Promise<string> {
    try {
        if (!email || email === '') {
            throw new Error('Email is required to fetch user ID');
        }

        const foundUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!foundUser) {
            throw new Error('User not found');
        }

        return foundUser.id;
    } catch (error: any) {
        throw new Error(`Failed to get user ID from database: ${error.message}`);
    }
}
