import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import React from "react";
import SubscribeForm from "@/app/components/subscribe-form";
import { capitalizeFirstLetter, hasReachedSubscriptionLimit, PLAN_LIMITS } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function Subscribe({params}: {
    params: Promise<{ username: string }>
}) {
    const resolvedParams = await params;
    const displayUsername = capitalizeFirstLetter(resolvedParams.username);

    // First get the user
    const user = await prisma.users.findUnique({
        where: { 
            username: resolvedParams.username
        },
        select: {
            id: true,
            plan: true
        }
    });

    if (!user) {
        redirect('/404');
    }

    // Then get their newsletter and subscriber count
    const newsletter = await prisma.newsletters.findFirst({
        where: { 
            userId: user.id
        }
    });

    if (!newsletter) {
        redirect('/404');
    }

    const subscriberCount = await prisma.subscribers.count({
        where: {
            newsletterId: newsletter.id
        }
    });

    const hasReachedLimit = hasReachedSubscriptionLimit(subscriberCount, user.plan);

    if (hasReachedLimit) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Card className="mx-auto shadow-xl">
                    <CardContent>
                        <div className="mb-2 flex flex-col items-center gap-2 mt-8">
                            <CardHeader>
                                <CardTitle className="sm:text-center">
                                    Subscription Limit Reached
                                </CardTitle>
                                <CardDescription className="sm:text-center">
                                    {displayUsername}&apos;s newsletter has reached its maximum subscriber limit.
                                    Please try again later.
                                </CardDescription>
                            </CardHeader>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="mx-auto shadow-xl">
                <CardContent>
                    <div className="mb-2 flex flex-col items-center gap-2 mt-8">
                        <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
                            aria-hidden="true"
                        >
                            <svg
                                className="stroke-zinc-800 dark:stroke-zinc-100"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 32 32"
                                aria-hidden="true"
                            >
                                <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8"/>
                            </svg>
                        </div>
                        <CardHeader>
                            <CardTitle className="sm:text-center">
                                {displayUsername}&apos;s Newsletter
                            </CardTitle>
                            <CardDescription className="sm:text-center">
                                Subscribe to receive {displayUsername}&apos;s messages
                            </CardDescription>
                        </CardHeader>
                    </div>

                    <SubscribeForm username={resolvedParams.username}/>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        By subscribing you agree to our{" "}
                        <a className="underline hover:no-underline" href="#">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default Subscribe;
