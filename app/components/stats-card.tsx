// Reusable StatsCard Component
import {Card} from "@/components/ui/card";

const StatsCard = ({ title, value, percentage, footerText, positive }: StatsCardProps) => {
    return (
        <Card className="flex-1 min-w-[280px] p-6 rounded-xl bg-white dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex flex-col gap-3">
                {/* Title */}
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-300">{title}</h3>

                {/* Main Value */}
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                        {value}
                    </span>
                    {/* Percentage Indicator */}
                    <span className={`flex items-center text-sm ${
                        positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                        {positive ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {percentage}%
                    </span>
                </div>

                {/* Footer Text */}
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {footerText}
                </p>
            </div>
        </Card>
    );
};

interface StatsCardProps {
    title: string;
    value: string;
    percentage: number;
    footerText: string;
    positive: boolean;
}

export default StatsCard;