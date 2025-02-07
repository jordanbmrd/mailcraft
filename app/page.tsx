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
import React, {useEffect, useState} from "react";
import NewEmailModal from "@/app/components/new-email-modal";
import SubscribersByCountryChart from "@/app/components/subscribers-by-country-chart";

type SubscriberStats = {
    total: number;
    previousTotal: number;
    activePercentage: number;
    percentageIncrease: number;
};

type EmailStats = {
    openRate: number;
    previousOpenRate: number;
    clickRate: number;
    previousClickRate: number;
};

const Dashboard = () => {
    const {data, status} = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/api/auth/signin");
        },
    });

    const [isCopied, setIsCopied] = React.useState(false);
    const [isNewEmailModalOpen, setIsNewEmailModalOpen] = useState(false);
    const [subscriberStats, setSubscriberStats] = useState<SubscriberStats>({
        total: 0,
        previousTotal: 0,
        activePercentage: 0,
        percentageIncrease: 0
    });
    const [emailStats, setEmailStats] = useState<EmailStats>({
        openRate: 0,
        previousOpenRate: 0,
        clickRate: 0,
        previousClickRate: 0
    });

    const subscriptionLink = data?.user.username ? `mailcraft.pro/${data.user.username}/subscribe` : 'Loading...';

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch subscribers
                const subscribersRes = await fetch('/api/newsletter/subscribers');
                const subscribers = await subscribersRes.json();
                
                const total = subscribers.length;
                const activeSubscribers = subscribers.filter((s: any) => s.status === 'ACTIVE').length;
                const previousTotal = total - Math.floor(total * 0.082); // Simulation du total précédent avec +8.2%

                const percentageIncrease = previousTotal > 0 
                    ? ((total - previousTotal) / previousTotal) * 100 
                    : 0;

                setSubscriberStats({
                    total,
                    previousTotal,
                    activePercentage: total > 0 ? (activeSubscribers / total) * 100 : 0,
                    percentageIncrease
                });

                // Fetch email templates to calculate open and click rates
                const emailsRes = await fetch('/api/newsletter/email-templates');
                const emails = await emailsRes.json();

                // Get date range for the history we need
                const fourWeeksAgo = new Date();
                fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

                // Fetch only relevant email sending history
                const historyRes = await fetch(`/api/newsletter/email-sending-history?from=${fourWeeksAgo.toISOString()}`);
                const history = await historyRes.json();

                // Create a map of emailTemplateId to number of recipients
                const emailRecipientsMap = new Map();
                history.forEach((record: any) => {
                    emailRecipientsMap.set(record.emailTemplateId, record.recipientsCount);
                });

                // Calculate current period stats (last 2 weeks)
                const currentPeriodEmails = emails.filter((email: any) => {
                    const sentDate = new Date(email.lastSentAt);
                    const twoWeeksAgo = new Date();
                    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                    return sentDate >= twoWeeksAgo && email.status === 'sent';
                });

                // Calculate previous period stats (2-4 weeks ago)
                const previousPeriodEmails = emails.filter((email: any) => {
                    const sentDate = new Date(email.lastSentAt);
                    const twoWeeksAgo = new Date();
                    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
                    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                    return sentDate >= fourWeeksAgo && sentDate < twoWeeksAgo && email.status === 'sent';
                });

                // Calculate rates
                const currentOpenRate = calculateRate(currentPeriodEmails, 'openCount', emailRecipientsMap);
                const previousOpenRate = calculateRate(previousPeriodEmails, 'openCount', emailRecipientsMap);
                const currentClickRate = calculateRate(currentPeriodEmails, 'clickCount', emailRecipientsMap);
                const previousClickRate = calculateRate(previousPeriodEmails, 'clickCount', emailRecipientsMap);

                setEmailStats({
                    openRate: currentOpenRate,
                    previousOpenRate,
                    clickRate: currentClickRate,
                    previousClickRate
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        }
        fetchStats();
    }, []);

    const calculateRate = (emails: any[], rateType: 'openCount' | 'clickCount', recipientsMap: Map<string, number>) => {
        if (emails.length === 0) return 0;

        let totalEvents = 0;
        let totalRecipients = 0;

        emails.forEach(email => {
            // Add the events (opens or clicks) for this email
            totalEvents += email[rateType] || 0;
            // Add the number of recipients for this email
            totalRecipients += recipientsMap.get(email.id) || 0;
        });

        if (totalRecipients === 0) return 0;

        // Return the percentage
        return (totalEvents / totalRecipients) * 100;
    };

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
                        value={subscriberStats.total.toLocaleString()}
                        percentage={subscriberStats.percentageIncrease}
                        footerText={`From ${subscriberStats.previousTotal.toLocaleString()} (last 4 weeks)`}
                        positive={subscriberStats.total > subscriberStats.previousTotal}
                    />
                    <StatsCard
                        title="Open Rate"
                        value={`${emailStats.openRate.toFixed(1)}%`}
                        percentage={emailStats.openRate - emailStats.previousOpenRate}
                        footerText={`Previous period ${emailStats.previousOpenRate.toFixed(1)}%`}
                        positive={emailStats.openRate > emailStats.previousOpenRate}
                    />
                    <StatsCard
                        title="Click Rate"
                        value={`${emailStats.clickRate.toFixed(1)}%`}
                        percentage={emailStats.clickRate - emailStats.previousClickRate}
                        footerText={`Previous period ${emailStats.previousClickRate.toFixed(1)}%`}
                        positive={emailStats.clickRate > emailStats.previousClickRate}
                    />
                </div>

                {/* Active subscribers chart */}
                <ActiveSubscribersChart />

                {/* Subscribers by country chart */}
                <SubscribersByCountryChart />
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
