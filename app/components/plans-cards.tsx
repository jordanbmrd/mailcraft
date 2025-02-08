'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PlanDetails {
    name: string;
    description: string;
    price: {
        monthly: number;
        yearly: number;
    };
    features: string[];
    popular?: boolean;
}

const PLAN_DETAILS: Record<string, PlanDetails> = {
    LAUNCH: {
        name: "Launch",
        description: "Perfect for getting started with your newsletter",
        price: {
            monthly: 0,
            yearly: 0
        },
        features: [
            "Up to 2,500 subscribers",
            "Unlimited emails",
            "Custom newsletter",
            "Newsletter analytics",
        ]
    },
    GROW: {
        name: "Grow",
        description: "Best for growing newsletters",
        popular: true,
        price: {
            monthly: 29,
            yearly: 278
        },
        features: [
            "Everything in Launch",
            "Up to 10,000 subscribers",
            "Custom domains",
            "AI support",
            "Newsletter community",
            "Priority support"
        ]
    },
    SCALE: {
        name: "Scale",
        description: "For professional newsletter creators",
        price: {
            monthly: 99,
            yearly: 950
        },
        features: [
            "Everything in Grow",
            "Up to 100,000 subscribers",
            "Referral program",
            "Dedicated support"
        ]
    }
};

export default function PlansCard() {
    const { data: session } = useSession();
    const currentPlan = session?.user?.plan || "LAUNCH";
    const [isYearly, setIsYearly] = useState(false);

    const formatPrice = (price: number) => {
        return price === 0 ? "Free" : `$${price}`;
    };

    return (
        <div className="space-y-8">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-8 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg max-w-fit mx-auto">
                <div className={cn(
                    "text-sm font-medium transition-colors",
                    !isYearly ? "text-primary" : "text-muted-foreground"
                )}>
                    Monthly billing
                </div>
                <Switch
                    id="billing-toggle"
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                    className="data-[state=checked]:bg-primary"
                />
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "text-sm font-medium transition-colors",
                        isYearly ? "text-primary" : "text-muted-foreground"
                    )}>
                        Annual billing
                    </div>
                    <span className="rounded-full bg-green-100 dark:bg-green-900 px-3 py-1 text-xs font-medium text-green-800 dark:text-green-200">
                        Save 20%
                    </span>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                {Object.entries(PLAN_DETAILS).map(([plan, details]) => (
                    <Card 
                        key={plan} 
                        className={cn(
                            "relative p-6 flex flex-col transition-all hover:shadow-lg"
                        )}
                    >
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-2xl font-bold">{details.name}</h3>
                                <p className="text-muted-foreground text-sm mt-1.5 mb-2">{details.description}</p>
                            </div>

                            {details.popular && (
                                <div className="w-fit mb-2">
                                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Popular
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mt-5 flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight">
                                {formatPrice(isYearly ? details.price.yearly : details.price.monthly)}
                            </span>
                            {details.price.monthly > 0 && (
                                <span className="text-muted-foreground text-sm font-medium">
                                    /{isYearly ? 'year' : 'month'}
                                </span>
                            )}
                        </div>

                        <ul className="mt-8 space-y-4 flex-1">
                            {details.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            className="mt-8"
                            variant={plan === currentPlan ? "secondary" : "outline"}
                            disabled={plan === currentPlan}
                            size="lg"
                        >
                            {plan === currentPlan ? "Current Plan" : "Upgrade to " + details.name}
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
} 