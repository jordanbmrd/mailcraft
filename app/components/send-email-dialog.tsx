'use client';

import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Checkbox} from "@/components/ui/checkbox";
import {cn} from "@/lib/utils";
import {useEffect, useState, useRef} from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    ColumnDef,
    flexRender,
    ColumnFiltersState,
    PaginationState
} from "@tanstack/react-table";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem} from "@/components/ui/select";
import {Loader2} from "lucide-react";
import {useToast} from "@/hooks/use-toast";

interface SendEmailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    emailId: string;
}

type Subscriber = {
    id: string;
    email: string;
    status: string;
    location: string;
    groups: string[];
}

export default function SendEmailDialog({ open, onOpenChange, emailId }: SendEmailDialogProps) {
    const {toast} = useToast();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [groups, setGroups] = useState<Array<{
        id: string;
        name: string;
        description: string;
    }>>([]);
    const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isSending, setIsSending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch subscribers
                const subscribersRes = await fetch('/api/newsletter/subscribers');
                const subscribersData = await subscribersRes.json();
                console.log('Subscribers:', subscribersData);
                setSubscribers(subscribersData
                    .filter((s: any) => s.status === "ACTIVE")
                    .map((s: any) => ({
                        ...s,
                        groups: s.groups || []
                    }))
                );

                // Fetch groups
                const groupsRes = await fetch('/api/newsletter/groups');
                const groupsData = await groupsRes.json();
                console.log('Groups:', groupsData);
                setGroups(groupsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        if (open) {
            fetchData();
        }
    }, [open]);

    const handleSelectAll = () => {
        if (selectedSubscribers.length === subscribers.length) {
            setSelectedSubscribers([]);
        } else {
            setSelectedSubscribers(subscribers.map(s => s.id));
        }
    };

    const handleSelectGroup = (groupId: string) => {
        const group = groups.find(g => g.id === groupId);
        if (!group) return;

        const subscribersInGroup = subscribers.filter(s => s.groups.includes(group.name));
        const allSelected = subscribersInGroup.every(s => selectedSubscribers.includes(s.id));
        
        if (allSelected) {
            setSelectedSubscribers(selectedSubscribers.filter(id => 
                !subscribersInGroup.some(s => s.id === id)
            ));
        } else {
            const subscribersToAdd = subscribersInGroup
                .filter(s => !selectedSubscribers.includes(s.id))
                .map(s => s.id);
            setSelectedSubscribers([...selectedSubscribers, ...subscribersToAdd]);
        }
    };

    const handleSendEmail = async () => {
        setIsSending(true);
        try {
            const res = await fetch('/api/newsletter/email-templates/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailId,
                    subscriberIds: selectedSubscribers
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to send emails');
            }

            const data = await res.json();
            console.log('Emails sent:', data);
            toast({
                title: "Success",
                description: `Email successfully sent to ${selectedSubscribers.length} subscriber${selectedSubscribers.length > 1 ? 's' : ''}.`,
                variant: "default",
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Error sending emails:', error);
            toast({
                title: "Error",
                description: "An error occurred while sending the email.",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
    };

    const columns: ColumnDef<Subscriber>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedSubscribers.includes(row.original.id)}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedSubscribers([...selectedSubscribers, row.original.id]);
                        } else {
                            setSelectedSubscribers(selectedSubscribers.filter(id => id !== row.original.id));
                        }
                    }}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            header: "Email",
            accessorKey: "email",
        },
        {
            header: "Location",
            accessorKey: "location",
        },
        {
            header: "Groups",
            accessorKey: "groups",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.groups.map(groupName => (
                        <Badge key={groupName} variant="secondary">
                            {groupName}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === "Subscribed" ? "default" : "secondary"}>
                    {row.original.status}
                </Badge>
            ),
        },
    ];

    const table = useReactTable({
        data: subscribers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            pagination,
            columnFilters,
        },
        pageCount: Math.ceil(subscribers.length / pagination.pageSize),
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Send email</DialogTitle>
                    <DialogDescription>
                        Select the subscribers you want to send this email to
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Selection buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            className={cn(
                                "transition-colors",
                                selectedSubscribers.length === subscribers.length && "bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary/90"
                            )}
                        >
                            All subscribers
                        </Button>
                        {groups.map(group => {
                            const subscribersInGroup = subscribers.filter(s => s.groups.includes(group.name));
                            if (subscribersInGroup.length === 0) return null;
                            
                            const allSelected = subscribersInGroup.every(s => selectedSubscribers.includes(s.id));
                            
                            return (
                                <Button
                                    key={group.id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSelectGroup(group.id)}
                                    className={cn(
                                        "transition-colors",
                                        allSelected && "bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary/90"
                                    )}
                                >
                                    {group.name}
                                    <span className={cn(
                                        "ml-2 text-xs",
                                        allSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                                    )}>
                                        {subscribersInGroup.length}
                                    </span>
                                </Button>
                            );
                        })}
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                        <Input
                            ref={inputRef}
                            placeholder="Search by email..."
                            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                            onChange={(e) => table.getColumn("email")?.setFilterValue(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {/* Subscribers table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value));
                                }}
                            >
                                <SelectContent>
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        {selectedSubscribers.length} subscribers selected
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSendEmail}
                            disabled={selectedSubscribers.length === 0 || isSending}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send'
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 