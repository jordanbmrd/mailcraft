import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            );
        }

        // Récupérer l'ID de la newsletter de l'utilisateur
        const newsletter = await prisma.newsletters.findFirst({
            where: {
                userId: session.user.id
            }
        });

        if (!newsletter) {
            return NextResponse.json(
                {error: "Newsletter not found"},
                {status: 404}
            );
        }

        // Récupérer tous les groupes de la newsletter
        const groups = await prisma.groups.findMany({
            where: {
                newsletterId: newsletter.id
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(groups);
    } catch (error) {
        console.error("Error fetching groups:", error);
        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        );
    }
} 