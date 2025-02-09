import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia',
    typescript: true,
});

export const STRIPE_PLANS = {
    LAUNCH: {
        name: 'Launch',
        monthly: null, // Free plan
        yearly: null,
    },
    GROW: {
        name: 'Grow',
        monthly: process.env.STRIPE_GROW_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_GROW_YEARLY_PRICE_ID,
    },
    SCALE: {
        name: 'Scale',
        monthly: process.env.STRIPE_SCALE_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_SCALE_YEARLY_PRICE_ID,
    },
} as const; 