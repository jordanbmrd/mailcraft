import "next-auth";
import { Plan } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
    interface User {
        id: string;
        username: string;
        plan: Plan;
        email?: string;
    }

    interface Session {
        user: User & {
            email: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        username?: string
        email?: string;
    }
}
