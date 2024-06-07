import NextAuth from "next-auth";
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
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            // Persist the user ID and other relevant information in the token
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            // Include user information in the session object
            session.user.id = token.id;
            session.user.email = token.email;
            session.user.name = token.name;
            session.user.image = token.image;
            return session;
        },
        async signIn({ user }: { user: any }) {
            const { email, name, image } = user;

            // Check if the user already exists in the database
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (!existingUser) {
                // User doesn't exist, create a new user record in the database
                await prisma.user.create({
                    data: {
                        email,
                        name,
                        image
                    }
                });
            }

            return true; // Allow sign-in to proceed
        },
    },
}

const handler = NextAuth({
    ...authOptions,
    session: {
        strategy: 'jwt' as const,
    },
});
export { handler as GET, handler as POST }