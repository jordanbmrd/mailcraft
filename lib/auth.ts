import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

const formatUsername = (name: string) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '') // Remove special characters except _ and -
        .replace(/\s+/g, ''); // Remove spaces
};

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    pages: {
        signIn: '/signin',
        newUser: '/signup',
    },
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.users.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    plan: user.plan
                };
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                try {
                    const existingUser = await prisma.users.findFirst({
                        where: {
                            email: user.email!,
                        },
                    });

                    if (!existingUser) {
                        // Create new user for Google sign in
                        const username = formatUsername(user.name || user.email!.split('@')[0]);
                        let finalUsername = username;
                        let counter = 1;

                        // Check username availability and append number if taken
                        while (await prisma.users.findFirst({ where: { username: finalUsername } })) {
                            finalUsername = `${username}${counter}`;
                            counter++;
                        }

                        const newUser = await prisma.users.create({
                            data: {
                                email: user.email!,
                                username: finalUsername,
                                password: '', // Empty password for Google users
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                        });

                        // Create a newsletter for the new user
                        await prisma.newsletters.create({
                            data: {
                                userId: newUser.id,
                                name: `${finalUsername}'s Newsletter`,
                                description: `Newsletter by ${finalUsername}`,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                        });

                        user.id = newUser.id;
                        user.username = newUser.username;
                    } else {
                        user.id = existingUser.id;
                        user.username = existingUser.username;
                    }
                } catch (error) {
                    console.error('Error in Google sign in:', error);
                    return false;
                }
            }
            return true;
        },
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    username: token.username,
                    plan: token.plan
                },
            };
        },
        jwt: ({ token, user }) => {
            if (user) {
                const u = user as unknown as any;
                return {
                    ...token,
                    id: u.id,
                    username: u.username,
                    plan: u.plan
                };
            }
            return token;
        },
    },
};