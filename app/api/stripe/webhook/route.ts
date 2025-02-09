import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type { Plan } from '@prisma/client';
import type Stripe from 'stripe';

const relevantEvents = new Set([
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted'
]);

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'No signature found' },
                { status: 400 }
            );
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (error) {
            console.error('Error verifying webhook signature:', error);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        if (relevantEvents.has(event.type)) {
            try {
                switch (event.type) {
                    case 'checkout.session.completed': {
                        const session = event.data.object as Stripe.Checkout.Session;
                        
                        // Only handle subscription checkouts
                        if (session.mode !== 'subscription') break;

                        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                        const customerId = session.customer as string;

                        // Find user by Stripe customer ID
                        const user = await prisma.users.findFirst({
                            where: { stripeCustomerId: customerId }
                        });

                        if (!user) {
                            throw new Error(`No user found for Stripe customer: ${customerId}`);
                        }

                        const plan = session.metadata?.plan;
                        if (!plan) {
                            throw new Error('No plan specified in session metadata');
                        }

                        // Update user's plan and subscription ID
                        await prisma.users.update({
                            where: { id: user.id },
                            data: {
                                plan: plan as Plan,
                                stripeSubscriptionId: session.subscription as string
                            }
                        });

                        break;
                    }

                    case 'customer.subscription.updated': {
                        const subscription = event.data.object as Stripe.Subscription;
                        
                        // Find user by Stripe customer ID
                        const user = await prisma.users.findFirst({
                            where: { stripeCustomerId: subscription.customer as string }
                        });

                        if (!user) {
                            throw new Error(`No user found for Stripe customer: ${subscription.customer}`);
                        }

                        // Get the plan from the subscription metadata
                        const plan = subscription.metadata?.plan;
                        if (!plan) {
                            throw new Error('No plan specified in subscription metadata');
                        }

                        // Update user's plan
                        await prisma.users.update({
                            where: { id: user.id },
                            data: {
                                plan: plan as Plan,
                                stripeSubscriptionId: subscription.id
                            }
                        });

                        break;
                    }

                    case 'customer.subscription.deleted': {
                        const subscription = event.data.object as Stripe.Subscription;
                        
                        // Find user by Stripe customer ID
                        const user = await prisma.users.findFirst({
                            where: { stripeCustomerId: subscription.customer as string }
                        });

                        if (!user) {
                            throw new Error(`No user found for Stripe customer: ${subscription.customer}`);
                        }

                        // Revert to free plan
                        await prisma.users.update({
                            where: { id: user.id },
                            data: {
                                plan: 'LAUNCH',
                                stripeSubscriptionId: null
                            }
                        });

                        break;
                    }

                    default:
                        throw new Error('Unhandled relevant event!');
                }
            } catch (error) {
                console.error('Error handling Stripe webhook:', error);
                return NextResponse.json(
                    { error: 'Webhook handler failed' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 