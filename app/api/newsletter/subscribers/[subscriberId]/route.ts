import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ subscriberId: string }> }
) {
    try {
        const resolvedParams = await params;

        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            );
        }

        const body = await req.json();
        const {groups} = body;

        // Vérifier que l'abonné existe et appartient à la newsletter de l'utilisateur
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

        const subscriber = await prisma.subscribers.findFirst({
            where: {
                id: resolvedParams.subscriberId,
                newsletterId: newsletter.id
            }
        });

        if (!subscriber) {
            return NextResponse.json(
                {error: "Subscriber not found"},
                {status: 404}
            );
        }

        // Mettre à jour les groupes de l'abonné
        const updatedSubscriber = await prisma.subscribers.update({
            where: {
                email: subscriber.email
            },
            data: {
                groups: groups,
                updatedAt: new Date()
            }
        });

        return NextResponse.json(updatedSubscriber);
    } catch (error) {
        console.error("Error updating subscriber:", error);
        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        );
    }
} 