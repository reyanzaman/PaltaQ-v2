import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/app/lib/prisma";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    secret: process.env.SECRET,
    callbacks: {
        async signIn(params: any) {
            const { email, name } = params.user;

            // Check if the user already exists in the database
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (!existingUser) {
                // User doesn't exist, create a new user record in the database
                await prisma.user.create({
                    data: {
                        email,
                        name
                    }
                });
            }

            return true; // Allow sign-in to proceed
        },
    },
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }