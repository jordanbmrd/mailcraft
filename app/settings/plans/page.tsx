import PlansCard from "@/app/components/plans-card";

export default function PlansPage() {
    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className="mb-6">
            <h1 className="text-3xl text-black">
                    Plans
                </h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                    Choose the plan that best fits your needs. All plans include basic features.
                </p>
            </div>
            <PlansCard />
        </div>
    );
} 