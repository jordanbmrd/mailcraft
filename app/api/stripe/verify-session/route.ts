import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Retrieve the Stripe session
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

        // Verify that the session was successful and belongs to the current user
        const user = await prisma.users.findUnique({
            where: { email: session.user.email! }
        });

        if (!user || user.stripeCustomerId !== stripeSession.customer) {
            return NextResponse.json(
                { error: 'Invalid session' },
                { status: 400 }
            );
        }

        if (stripeSession.payment_status !== 'paid') {
            return NextResponse.json(
                { error: 'Payment not completed' },
                { status: 400 }
            );
        }

        // Update user's plan if not already updated by webhook
        if (stripeSession.metadata?.plan) {
            await prisma.users.update({
                where: { id: user.id },
                data: {
                    plan: stripeSession.metadata.plan as any,
                    stripeSubscriptionId: stripeSession.subscription as string
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error verifying session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 