// app/api/subscribers/route.ts
import {NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import { Plan } from "@prisma/client";
import moment from "moment";
import { getFlagEmoji } from "@/lib/utils";

const PLAN_LIMITS: Record<Plan, number> = {
    LAUNCH: 2500,
    GROW: 10000,
    SCALE: 100000
};

// app/api/subscribers/route.ts
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // First get the user's newsletter
        const newsletter = await prisma.newsletters.findFirst({
            where: { userId: session.user.id }
        });

        if (!newsletter) {
            return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
        }

        // Get subscribers
        const subscribers = await prisma.subscribers.findMany({
            where: { newsletterId: newsletter.id }
        });

        // Format subscribers data
        const formattedSubscribers = subscribers.map(sub => ({
            id: sub.id,
            email: sub.email,
            flag: getFlagEmoji(sub.countryCode),
            country: sub.country,
            location: sub.location,
            joinDate: moment(sub.subscriptionDate).format('MM/DD/yyyy HH:mm'),
            groups: sub.groups,
            status: sub.status
        }));

        return NextResponse.json(formattedSubscribers);

    } catch (error) {
        console.error('[SUBSCRIBERS_GET]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { email, newsletterId, countryCode, location } = body;

        if (!email || !newsletterId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Check if user has reached their plan's subscriber limit
        const user = await prisma.users.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const currentSubscriberCount = await prisma.subscribers.count({
            where: { newsletterId }
        });

        const planLimit = PLAN_LIMITS[user.plan];
        if (currentSubscriberCount >= planLimit) {
            return new NextResponse(
                JSON.stringify({
                    error: "Plan limit reached",
                    message: `You have reached the maximum number of subscribers (${planLimit}) for your ${user.plan} plan. Please upgrade to add more subscribers.`
                }),
                { status: 403 }
            );
        }

        const subscriber = await prisma.subscribers.create({
            data: {
                email,
                newsletterId,
                countryCode: countryCode || "Unknown",
                location: location || "Unknown",
                status: "active",
                groups: [],
                subscriptionDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(subscriber);
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return new NextResponse("Subscriber already exists", { status: 400 });
        }

        console.error("[SUBSCRIBERS_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
