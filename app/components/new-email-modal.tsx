'use client'
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import Link from "next/link";
import {useState} from "react";

function NewEmailModal({open, setOpen}: NewEmailModalProps) {
    const [subject, setSubject] = useState('My email template');
    return (
        <Dialog open={open} onOpenChange={open => setOpen(!open)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create a new email</DialogTitle>
                    <DialogDescription>
                        Choose an email subject here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Subject
                        </Label>
                        <Input
                            id="name"
                            className="col-span-3"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Link href={subject ? `/emails/create?subject=${subject}` : ''}>
                        <Button type="submit" disabled={!subject}>Create email</Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface NewEmailModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default NewEmailModal;