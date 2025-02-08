'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PlansCard from './plans-cards';

interface UpgradePlanDialogProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function UpgradePlanDialog({ children, open, onOpenChange }: UpgradePlanDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="md:min-w-[70vw] max-w-[90vw] p-8">
                <DialogHeader>
                    <DialogTitle className="text-xl">Upgrade Plan</DialogTitle>
                    <DialogDescription>
                        Choose the plan that best fits your needs. All plans include basic features.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-8">
                    <PlansCard />
                </div>
            </DialogContent>
        </Dialog>
    );
} 