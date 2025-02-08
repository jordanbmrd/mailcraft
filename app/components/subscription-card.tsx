import { GlowEffect } from '@/components/ui/glow-effect';
import { useState, useEffect } from 'react';
import UpgradePlanDialog from './upgrade-plan-dialog';
import { PLAN_LIMITS } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { Plan } from '@prisma/client';

export default function SubscriptionCard() {
    const [currentUsage, setCurrentUsage] = useState(0);
    const [userPlan, setUserPlan] = useState<Plan>('LAUNCH');
    const { data: session } = useSession();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id) {
                try {
                    // Fetch user data including plan
                    const userResponse = await fetch('/api/user');
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        setUserPlan(userData.plan);
                    }

                    // Fetch subscriber count
                    const subscribersResponse = await fetch('/api/newsletter/subscribers');
                    if (subscribersResponse.ok) {
                        const subscribers = await subscribersResponse.json();
                        setCurrentUsage(subscribers.length);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchData();
    }, [session]);

    const usageLimit = PLAN_LIMITS[userPlan];
    const progress = (currentUsage / usageLimit) * 100;
    const usagePercentage = Math.round(progress);

    return (
        <>
            <div className="relative h-44 w-full mb-8 group">
                <GlowEffect
                    colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
                    mode="static"
                    blur="softest"
                />
                <div className="relative h-full w-full rounded-lg bg-white p-4 flex flex-col justify-between shadow-md border border-slate-100">
                    {/* Header Section */}
                    <div className="flex justify-between items-start">
                        <h2 className="text-slate-900 font-semibold text-lg">{userPlan.charAt(0) + userPlan.slice(1).toLowerCase()} Plan</h2>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            Current Plan
                        </span>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{currentUsage}/{usageLimit}</span>
                            <span className="text-slate-500">{usagePercentage}% used</span>
                        </div>
                        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                                role="progressbar"
                                aria-valuenow={currentUsage}
                                aria-valuemin={0}
                                aria-valuemax={usageLimit}
                            />
                        </div>
                    </div>

                    {/* Action Section */}
                    <UpgradePlanDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-md text-sm text-blue-600 font-medium transition-all duration-200">
                            Upgrade Plan
                        </button>
                    </UpgradePlanDialog>
                </div>
            </div>
        </>
    );
}
