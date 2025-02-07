// app/api/subscribers/route.ts
import {NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {getFlagEmoji} from "@/lib/utils";
import moment from "moment";

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
