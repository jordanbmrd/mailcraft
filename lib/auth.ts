import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    pages: {
        signIn: '/signin',
        newUser: '/signup',
    },
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "example@example.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const user = await prisma.users.findFirst({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    username: user.username
                };
            },
        }),
    ],
    callbacks: {
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    username: token.username
                },
            };
        },
        jwt: ({ token, user }) => {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    username: user.username,
                };
            }
            return token;
        },
    },
};