import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user's newsletter
        const newsletter = await prisma.newsletters.findFirst({
            where: { userId: session.user.id }
        });

        if (!newsletter) {
            return NextResponse.json(
                { error: "Newsletter not found" },
                { status: 404 }
            );
        }

        // Get the date filter from query params
        const fromDate = req.nextUrl.searchParams.get('from');
        if (!fromDate) {
            return NextResponse.json(
                { error: "Missing 'from' date parameter" },
                { status: 400 }
            );
        }

        // Get email sending history with recipient counts
        const history = await prisma.emailSendingHistory.findMany({
            where: {
                newsletterId: newsletter.id,
                sentAt: {
                    gte: new Date(fromDate)
                }
            },
            select: {
                emailTemplateId: true,
                subscribers: true,
                sentAt: true
            }
        });

        // Format the response to only include what we need
        const formattedHistory = history.map(record => ({
            emailTemplateId: record.emailTemplateId,
            recipientsCount: record.subscribers.length,
            sentAt: record.sentAt
        }));

        return NextResponse.json(formattedHistory);

    } catch (error) {
        console.error('[EMAIL_SENDING_HISTORY_GET]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 