'use client'
import ActiveSubscribersChart from "@/app/components/active-subscribers-chart";
import StatsCard from "@/app/components/stats-card";
import {Input} from "@/components/ui/input";
import {ExternalLink, Pen} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {useToast} from "@/hooks/use-toast";
import {ToastAction} from "@/components/ui/toast";
import {GradientButton} from "@/components/ui/gradient-button";
import {Card} from "@/components/ui/card";
import SubscriptionCard from "@/app/components/subscription-card";
import {useSession} from "next-auth/react";
import {redirect} from "next/navigation";

const Dashboard = () => {
    const {toast} = useToast();
    const {data, status} = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/api/auth/signin");
        },
    });

    const subscriptionLink = "mailcraft.pro/username/newsletter";

    const handleCopyLink = () => {
        navigator.clipboard.writeText(subscriptionLink);
        toast({
            title: "Scheduled: Catch up ",
            description: "Friday, February 10, 2023 at 5:57 PM",
            action: (
                <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
            ),
        })
    };

    if (status === "loading") return "Loading...";
    console.log(data);

    return (
        <div className="flex">
            {/* Main Part */}
            <div className="flex-1">
                <div className="mb-6">
                    <h1 className="text-3xl text-black">
                        Welcome back, {data?.user.firstName} !
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
                <GradientButton className="w-full">
                    Make new post
                    <Pen className="w-4 h-4"/>
                </GradientButton>

                <SubscriptionCard />

                {/* Subscription Link Card */}
                <Card
                    className="p-5 rounded-xl bg-white dark:bg-neutral-800">
                    <h3 className="font-medium mb-4">Newsletter Subscription Link</h3>
                    <div className="flex gap-2">
                        <Input
                            onClick={handleCopyLink}
                            value={subscriptionLink}
                            readOnly
                            className="truncate text-sm bg-neutral-50 dark:bg-neutral-700 hover:cursor-pointer"
                        />
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
