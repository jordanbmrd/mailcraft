'use client'
import CreatedEmailsTable from "@/app/components/created-emails-table";
import {useState} from "react";
import NewEmailModal from "@/app/components/new-email-modal";
import {useSession} from "next-auth/react";
import {redirect} from "next/navigation";

export default function Audience() {
    const {status} = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/api/auth/signin");
        },
    });

    const [open, setOpen] = useState(false);

    if (status === "loading") return "Loading...";

    return (
        <>
            <NewEmailModal open={open} setOpen={setOpen} />
            <div className="flex flex-1 flex-col gap-6">
                <div className="mb-6">
                    <h1 className="text-3xl text-black">
                        Your posts
                    </h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                        View and manage your email templates here.
                    </p>
                </div>
                <CreatedEmailsTable onNewEmail={() => setOpen(true)}/>

                <div className="mt-4 mb-6">
                    <h1 className="text-3xl text-black">
                        Our templates
                    </h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                        Create emails faster with our pre-built templates.
                    </p>
                </div>

                <p>Coming soon...</p>

            </div>
        </>
    );
}