import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ emailId: string }> }
) {
    try {
        const resolvedParams = await params;
        const searchParams = request.nextUrl.searchParams;
        const subscriberId = searchParams.get("subscriberId");
        const eventType = searchParams.get("eventType");
        const url = searchParams.get("url");

        if (!subscriberId || !eventType) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Créer l'événement
        await prisma.emailEvents.create({
            data: {
                emailTemplateId: resolvedParams.emailId,
                subscriberId,
                eventType,
                createdAt: new Date(),
                url: eventType === "click" ? url : undefined,
            },
        });

        const uniqueOpens = await prisma.emailEvents.groupBy({
            by: ['subscriberId'],
            where: {
                emailTemplateId: resolvedParams.emailId,
                eventType: "open",
            },
            _count: true,
        });

        const uniqueClicks = await prisma.emailEvents.groupBy({
            by: ['subscriberId'],
            where: {
                emailTemplateId: resolvedParams.emailId,
                eventType: "click",
            },
            _count: true,
        });

        // Mettre à jour les taux dans le template
        await prisma.emailTemplates.update({
            where: {
                id: resolvedParams.emailId,
            },
            data: {
                openRate: uniqueOpens.length,
                clickRate: uniqueClicks.length
            },
        });

        // Si c'est un événement de clic, rediriger vers l'URL originale
        if (eventType === "click" && url) {
            return NextResponse.redirect(url);
        }

        // Pour les événements d'ouverture, renvoyer une image transparente 1x1
        return new NextResponse(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'), {
            headers: {
                'Content-Type': 'image/gif',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error("Error tracking email event:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 