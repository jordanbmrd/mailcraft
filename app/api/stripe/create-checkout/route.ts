import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, STRIPE_PLANS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { plan, interval } = body;

        if (!plan || !interval || !STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
            return NextResponse.json(
                { error: 'Invalid plan or interval' },
                { status: 400 }
            );
        }

        const priceId = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS][interval as 'monthly' | 'yearly'];
        if (!priceId) {
            return NextResponse.json(
                { error: 'Invalid price ID for the selected plan' },
                { status: 400 }
            );
        }

        const user = await prisma.users.findUnique({
            where: { email: session.user.email! }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get or create Stripe customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user.id
                }
            });
            customerId = customer.id;
            await prisma.users.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId }
            });
        }

        // Create checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?paymentSuccess=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?paymentCanceled=true`,
            metadata: {
                userId: user.id,
                plan,
                interval
            }
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 