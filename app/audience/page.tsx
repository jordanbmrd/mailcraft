'use client';
import SubscribersTable from "@/app/components/subscribers-table";
import {useSession} from "next-auth/react";
import {redirect} from "next/navigation";

export default function Audience() {
    const {status} = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/api/auth/signin");
        },
    });

    if (status === "loading") return "Loading...";

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className="mb-6">
                <h1 className="text-3xl text-black">
                    Your subscribers
                </h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                    View and manage your subscribers here.
                </p>
            </div>

            <SubscribersTable />
        </div>
    );
}