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
import {usePathname} from "next/navigation";
import {signOut, useSession} from "next-auth/react";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import { capitalizeFirstLetter } from "@/lib/utils";

const PAGES_WITHOUT_SIDEBAR = ['/signin', '/signup', '/subscribe'];

export default function Sidebar() {
    const pathname = usePathname();
    const {data} = useSession();

    const links = [
        {
            label: "Dashboard",
            href: "/",
            icon: (
                <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
            ),
        },
        {
            label: "Emails",
            href: "/emails",
            icon: (
                <SquarePen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
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
            label: "Grow",
            href: "#",
            icon: (
                <TrendingUp className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
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
            label: capitalizeFirstLetter(data?.user.username) ?? 'Loading...',
            href: "#",
            position: "bottom",
            icon: (
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="focus:outline-none">
                            <Image
                                src="https://assets.aceternity.com/manu.png"
                                className="h-7 w-7 flex-shrink-0 rounded-full cursor-pointer hover:ring-2 ring-purple-500 transition-all"
                                width={50}
                                height={50}
                                alt="Avatar"
                            />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="start"
                        className="w-48 p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg"
                    >
                        <div className="flex flex-col space-y-2">
                            <div className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {data?.user.email}
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => signOut({callbackUrl: '/signin'})}
                                className="w-full justify-start px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                Log out
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            ),
        }
    ];

    console.log(pathname);
    const [isOpen, setIsOpen] = useState(true);

    React.useEffect(() => {
        if (pathname.startsWith('/emails/create')) {
            setIsOpen(false);
        }
    }, [pathname]);

    return !PAGES_WITHOUT_SIDEBAR.some(url => pathname.includes(url)) && (
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