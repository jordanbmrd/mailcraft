import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const resolvedParams = await params;
        const { email } = await request.json();

        // Validate email format
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: "Valid email address is required" },
                { status: 400 }
            );
        }

        // Find newsletter owner by username
        const owner = await prisma.users.findFirst({
            where: { username: resolvedParams.username }
        });

        if (!owner) {
            return NextResponse.json(
                { error: "Newsletter not found" },
                { status: 404 }
            );
        }

        // Get the newsletter
        const newsletter = await prisma.newsletters.findFirst({
            where: { userId: owner.id }
        });

        if (!newsletter) {
            return NextResponse.json(
                { error: "Newsletter not found" },
                { status: 404 }
            );
        }

        // Check for existing subscription
        const existingSubscriber = await prisma.subscribers.findFirst({
            where: {
                email,
                newsletterId: newsletter.id
            }
        });

        if (existingSubscriber) {
            return NextResponse.json(
                { error: "You're already subscribed!" },
                { status: 409 }
            );
        }

        // Fetch user IP and position
        const userPositionReq = await fetch('http://ip-api.com/json/?fields=country,countryCode,city', {
            method: 'GET'
        });
        const userPosition = await userPositionReq.json();

        // Create new subscriber with default values
        await prisma.subscribers.create({
            data: {
                email,
                newsletterId: newsletter.id,
                countryCode: userPosition.countryCode || "",
                location: (userPosition.city && userPosition.country) ? `${userPosition.city}, ${userPosition.country}` : "Unknown",
                city: userPosition.city ? userPosition.city : "Unknown",
                country: userPosition.country ? userPosition.country : "Unknown",
                status: "ACTIVE",
                groups: [],
                subscriptionDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        return NextResponse.json(
            { success: true, message: "Subscription successful!" },
            { status: 201 }
        );

    } catch (error) {
        console.error('[SUBSCRIBE_POST]', error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
