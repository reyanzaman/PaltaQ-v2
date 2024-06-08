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

export async function getTopicIDFromDatabase(topic: string, classId: string): Promise<string> {
    try {
        if (!topic || topic.trim() === '') {
            throw new Error('Topic is required to fetch topic ID');
        }

        if (!classId || classId.trim() === '') {
            throw new Error('Class ID is required to fetch topic ID');
        }

        const foundTopic = await prisma.topic.findUnique({
            where: {
                name_classId: { // Adjusted for unique constraint field
                    name: topic,
                    classId: classId,
                },
            },
        });

        if (!foundTopic) {
            throw new Error('Topic not found');
        }

        return foundTopic.id;
    } catch (error: any) {
        throw new Error(`Failed to get topic ID from database: ${error.message}`);
    }
}
