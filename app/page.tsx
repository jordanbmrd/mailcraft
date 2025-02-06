'use client'
import ActiveSubscribersChart from "@/app/components/active-subscribers-chart";
import StatsCard from "@/app/components/stats-card";
import {Input} from "@/components/ui/input";
import {Check, Copy, ExternalLink, Pen} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {GradientButton} from "@/components/ui/gradient-button";
import {Card} from "@/components/ui/card";
import SubscriptionCard from "@/app/components/subscription-card";
import {useSession} from "next-auth/react";
import {redirect} from "next/navigation";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import React, {useState} from "react";
import NewEmailModal from "@/app/components/new-email-modal";

const Dashboard = () => {
    const {data, status} = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/api/auth/signin");
        },
    });

    const [isCopied, setIsCopied] = React.useState(false);
    const [isNewEmailModalOpen, setIsNewEmailModalOpen] = useState(false);

    const subscriptionLink = data?.user.username ? `mailcraft.pro/${data.user.username}/subscribe` : 'Loading...';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(subscriptionLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1500);
    };

    if (status === "loading") return "Loading...";

    return (
        <div className="flex">
            {/* Main Part */}
            <div className="flex-1">
                <div className="mb-6">
                    <h1 className="text-3xl text-black">
                        Welcome back, {data?.user.username} !
                    </h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                        Your newsletter is performing great this week ! 🚀<br/>
                        You have 3 drafts in progress and 2 scheduled campaigns.
                    </p>
                </div>

                {/* Top Metrics Row */}
                <div className="flex gap-4 flex-wrap">
                    <StatsCard
                        title="Subscribers"
                        value="12,450"
                        percentage={8.2}
                        footerText="From 11,500 (last 4 weeks)"
                        positive
                    />
                    <StatsCard
                        title="Open Rate"
                        value="64.7%"
                        percentage={2.1}
                        footerText="Industry average 58.3%"
                        positive
                    />
                    <StatsCard
                        title="Click Rate"
                        value="9.8%"
                        percentage={-1.4}
                        footerText="Previous period 11.2%"
                        positive={false}
                    />
                </div>

                {/* Active subscribers chart */}
                <ActiveSubscribersChart/>
            </div>

            {/* Right Sidebar */}
            <div className="w-full pl-6 md:w-80 md:block hidden space-y-6">
                {/* New Post Button */}
                <GradientButton className="w-full" onClick={() => setIsNewEmailModalOpen(true)}>
                    Make new post
                    <Pen className="w-4 h-4"/>
                </GradientButton>

                <NewEmailModal open={isNewEmailModalOpen} setOpen={setIsNewEmailModalOpen} />

                <SubscriptionCard />

                {/* Subscription Link Card */}
                <Card
                    className="p-5 rounded-xl bg-white dark:bg-neutral-800">
                    <h3 className="font-medium mb-4">Newsletter Subscription Link</h3>
                    <div className="flex gap-2">
                        <Input
                            value={subscriptionLink}
                            readOnly
                            className="truncate text-sm bg-neutral-50 dark:bg-neutral-700"
                        />
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="disabled:opacity-100 relative"
                                        onClick={handleCopyLink}
                                        aria-label={isCopied ? "Copied" : "Copy to clipboard"}
                                        disabled={isCopied}
                                    >
                                        <div
                                            className={cn(
                                                "transition-all",
                                                isCopied ? "scale-100 opacity-100" : "scale-0 opacity-0",
                                            )}
                                        >
                                            <Check className="stroke-emerald-500" size={16} strokeWidth={2} aria-hidden="true" />
                                        </div>
                                        <div
                                            className={cn(
                                                "absolute transition-all",
                                                isCopied ? "scale-0 opacity-0" : "scale-100 opacity-100",
                                            )}
                                        >
                                            <Copy size={16} strokeWidth={2} aria-hidden="true" />
                                        </div>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="px-2 py-1 text-xs">Click to copy</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </Card>

                {/* Tutorials Card */}
                <Card
                    className="p-5 rounded-xl bg-white dark:bg-neutral-800">
                    <h3 className="font-medium mb-4">Tutorials</h3>
                    <div className="flex flex-col gap-2">
                        <a href="#" className="group">
                            <Badge
                                variant="secondary"
                                className="w-full justify-between px-4 py-2 border border-gray-100 bg-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                Getting started guide
                                <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100"/>
                            </Badge>
                        </a>
                        <a href="#" className="group">
                            <Badge
                                variant="secondary"
                                className="w-full justify-between px-4 py-2 border border-gray-100 bg-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                Advanced formatting
                                <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100"/>
                            </Badge>
                        </a>
                        <a href="#" className="group">
                            <Badge
                                variant="secondary"
                                className="w-full justify-between px-4 py-2 border border-gray-100 bg-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                Analytics Walkthrough
                                <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100"/>
                            </Badge>
                        </a>
                    </div>
                </Card>

                {/* Help Card */}
                <Card
                    className="p-5 rounded-xl bg-white dark:bg-neutral-800">
                    <h3 className="font-medium mb-4">Need help ?</h3>
                    <div className="flex flex-col gap-2">
                        <a href="#" className="group">
                            <Badge
                                variant="secondary"
                                className="w-full justify-between px-4 py-2 border border-gray-100 bg-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                Blog & Guides
                                <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100"/>
                            </Badge>
                        </a>
                        <a href="#" className="group">
                            <Badge
                                variant="secondary"
                                className="w-full justify-between px-4 py-2 border border-gray-100 bg-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                FAQ Center
                                <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100"/>
                            </Badge>
                        </a>
                        <a href="#" className="group">
                            <Badge
                                variant="secondary"
                                className="w-full justify-between px-4 py-2 border border-gray-100 bg-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                Contact Support
                                <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100"/>
                            </Badge>
                        </a>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
