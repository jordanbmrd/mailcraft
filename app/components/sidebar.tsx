'use client'
import {Sidebar as ShadcnSidebar, SidebarBody, SidebarLink} from "@/components/ui/sidebar";
import {
    ArrowLeftToLine,
    ArrowRightToLine,
    LayoutDashboard,
    Settings,
    Speech,
    SquarePen,
    TrendingUp
} from "lucide-react";
import React, {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {motion} from "framer-motion";
import {redirect, usePathname} from "next/navigation";
import {useSession} from "next-auth/react";

const PAGES_WITHOUT_SIDEBAR = ['/signin', '/signup'];

export default function Sidebar() {
    const pathname = usePathname();
    const {data, status} = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/api/auth/signin");
        },
    });

    const links = [
        {
            label: "Dashboard",
            href: "/",
            icon: (
                <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
            ),
        },
        {
            label: "Write",
            href: "/write",
            icon: (
                <SquarePen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
            ),
        },
        {
            label: "Grow",
            href: "#",
            icon: (
                <TrendingUp className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
            ),
        },
        {
            label: "Audience",
            href: "/audience",
            icon: (
                <Speech className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
            ),
        },
        {
            label: "Settings",
            href: "#",
            icon: (
                <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
            ),
        },
        {
            label: status === 'authenticated' ? `${data?.user.firstName} ${data?.user.lastName}` : 'Loading...',
            href: "#",
            position: "bottom",
            icon: (
                <Image
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                />
            ),
        }
    ];

    const [isOpen, setIsOpen] = useState(!pathname.startsWith('/emails/create'));

    return !PAGES_WITHOUT_SIDEBAR.some(url => pathname.startsWith(url)) && (
        <ShadcnSidebar open={isOpen} setOpen={setIsOpen}>
            <SidebarBody className="justify-between gap-10">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    { isOpen ? (
                        <div className="flex justify-between">
                            <Logo/>
                            <button
                                className="text-gray-500 size-6 hidden md:block"
                                onClick={() => setIsOpen(!isOpen)}>
                                <ArrowLeftToLine size={20} />
                            </button>
                        </div>
                    ) : (
                        <LogoIcon />
                    ) }
                    <div className="mt-8 flex flex-col gap-2">
                        {links.filter(l => !l.position).map((link, idx) => (
                            <SidebarLink key={idx} link={link}/>
                        ))}
                    </div>
                </div>
                <div className="gap-4">
                    { !isOpen ? (
                        <button
                            onClick={() => setIsOpen(!isOpen)}>
                            <ArrowRightToLine size={20}/>
                        </button>
                    ) : null }
                    {links.filter(l => l.position === "bottom").map((link, idx) => (
                        <SidebarLink key={idx} link={link}/>
                    ))}
                </div>
            </SidebarBody>
        </ShadcnSidebar>
    );
}

const Logo = () => {
    return (
        <Link
            href="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div
                className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0"/>
            <motion.span
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                className="font-medium text-black dark:text-white whitespace-pre"
            >
                Mailcraft
            </motion.span>
        </Link>
    );
};

const LogoIcon = () => {
    return (
        <Link
            href="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
        </Link>
    );
};