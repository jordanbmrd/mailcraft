"use client";

import {cn} from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Pagination, PaginationContent, PaginationItem} from "@/components/ui/pagination";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {
    ColumnDef,
    ColumnFiltersState,
    FilterFn,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    Row,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import {
    ChevronDown,
    ChevronFirst,
    ChevronLast,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    CircleAlert,
    CircleX,
    Columns3,
    Ellipsis,
    Filter,
    ListFilter,
    Trash,
    Plus,
} from "lucide-react";
import {useEffect, useId, useMemo, useRef, useState} from "react";
import DeleteConfirmationDialog from "@/app/components/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";

type Item = {
    id: string;
    email: string;
    flag: string;
    location: string;
    joinDate: string;
    groups: string[];
    status: "Subscribed" | "Unsubscribed";
};

const statusFilterFn: FilterFn<Item> = (row, columnId, filterValue: string[]) => {
    if (!filterValue?.length) return true;
    const status = row.getValue(columnId) as string;
    return filterValue.includes(status);
};

function GroupsCell({ row, table, setData }: { row: Row<Item>, table: any, setData: React.Dispatch<React.SetStateAction<Item[]>> }) {
    const [groups, setGroups] = useState<Array<{id: string; name: string}>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGroups() {
            try {
                setIsLoading(true);
                const res = await fetch('/api/newsletter/groups');
                const data = await res.json();
                setGroups(data);
            } catch (error) {
                console.error('Failed to fetch groups:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchGroups();
    }, []);

    const handleAddGroup = async (groupName: string) => {
        try {
            const currentGroups = row.getValue('groups') as string[];
            if (currentGroups.includes(groupName)) return;

            const res = await fetch(`/api/newsletter/subscribers/${row.original.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groups: [...currentGroups, groupName]
                }),
            });

            if (!res.ok) throw new Error('Failed to update subscriber');

            // Mettre à jour l'UI
            setData(prevData => {
                const newData = [...prevData];
                const index = newData.findIndex(item => item.id === row.original.id);
                if (index !== -1) {
                    newData[index] = {
                        ...newData[index],
                        groups: [...currentGroups, groupName]
                    };
                }
                return newData;
            });
        } catch (error) {
            console.error('Failed to add group:', error);
        }
    };

    const handleDeleteGroup = async (groupName: string) => {
        try {
            const currentGroups = row.getValue('groups') as string[];
            const updatedGroups = currentGroups.filter(g => g !== groupName);

            const res = await fetch(`/api/newsletter/subscribers/${row.original.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groups: updatedGroups
                }),
            });

            if (!res.ok) throw new Error('Failed to update subscriber');

            // Mettre à jour l'UI
            setData(prevData => {
                const newData = [...prevData];
                const index = newData.findIndex(item => item.id === row.original.id);
                if (index !== -1) {
                    newData[index] = {
                        ...newData[index],
                        groups: updatedGroups
                    };
                }
                return newData;
            });
        } catch (error) {
            console.error('Failed to remove group:', error);
        } finally {
            setGroupToDelete(null);
        }
    };

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {(row.getValue('groups') as string[] || []).map((group) => (
                <div key={group}>
                    <Badge 
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => setGroupToDelete(group)}
                    >
                        {group}
                    </Badge>

                    <DeleteConfirmationDialog
                        open={groupToDelete === group}
                        onOpenChange={(open) => !open && setGroupToDelete(null)}
                        onConfirm={() => handleDeleteGroup(group)}
                        title="Êtes-vous sûr ?"
                        description={`Cette action supprimera le groupe "${group}" de cet abonné.`}
                    />
                </div>
            ))}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                    </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    {isLoading ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                            Loading...
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                            No groups available
                        </div>
                    ) : (
                        groups
                            .filter(g => !(row.getValue('groups') as string[])?.includes(g.name))
                            .map(group => (
                                <DropdownMenuItem
                                    key={group.id}
                                    onClick={() => handleAddGroup(group.name)}
                                >
                                    {group.name}
                                </DropdownMenuItem>
                            ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

interface SubscribersTableProps {
    userId: string;
}

export default function SubscribersTable(props: SubscribersTableProps) {
    const id = useId();
    const { toast } = useToast();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        id: false
    });
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const inputRef = useRef<HTMLInputElement>(null);

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "joinDate",
            desc: true,
        },
    ]);

    const [data, setData] = useState<Item[]>([]);

    const columns = useMemo<ColumnDef<Item>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            size: 28,
            enableSorting: false,
            enableHiding: false,
        },
        {
            header: "ID",
            accessorKey: "id",
        },
        {
            header: "Email",
            accessorKey: "email",
            size: 220,
        },
        {
            header: "Location",
            accessorKey: "location",
            cell: ({ row }) => (
                <div>
                    <span className="text-lg leading-none">{row.original.flag}</span> {row.getValue("location")}
                </div>
            ),
            size: 180,
        },
        {
            header: "Subscription date",
            accessorKey: "joinDate",
        },
        {
            header: "Group(s)",
            accessorKey: "groups",
            cell: ({ row, table }) => <GroupsCell row={row} table={table} setData={setData} />,
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => (
                <Badge
                    className={cn(
                        row.getValue("status") === "Unsubscribed" && "bg-muted-foreground/60 text-primary-foreground",
                    )}
                >
                    {row.getValue("status")}
                </Badge>
            ),
            size: 100,
            filterFn: statusFilterFn,
        },
        {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => <RowActions row={row} />,
            size: 60,
            enableHiding: false,
        },
    ], []);

    useEffect(() => {
        async function fetchPosts() {
            const res = await fetch(
                "/api/newsletter/subscribers",
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            console.log(res);
            const data = await res.json();
            console.log(data);
            setData(data);
        }
        fetchPosts();
    }, []);

    const handleDeleteRows = async () => {
        const selectedRows = table.getSelectedRowModel().rows;

        try {
            // Delete each selected subscriber
            await Promise.all(
                selectedRows.map(async (row) => {
                    const res = await fetch(`/api/newsletter/subscribers/${row.getValue("id")}`, {
                        method: 'DELETE',
                    });

                    if (!res.ok) {
                        throw new Error(`Failed to delete subscriber ${row.getValue("id")}`);
                    }
                })
            );

            // Update local state
            const updatedData = data.filter(
                (item) => !selectedRows.some((row) => row.original.id === item.id)
            );
            setData(updatedData);
            table.resetRowSelection();

            toast({
                title: "Success",
                description: `Successfully deleted ${selectedRows.length} ${selectedRows.length === 1 ? 'subscriber' : 'subscribers'}.`,
            });
        } catch (error) {
            console.error('Error deleting subscribers:', error);
            toast({
                title: "Error",
                description: "Failed to delete subscribers. Please try again.",
                variant: "destructive",
            });
        }
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        enableSortingRemoval: false,
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        state: {
            sorting,
            pagination,
            columnFilters,
            columnVisibility,
        },
    });

    // Get unique status values
    const uniqueStatusValues = useMemo(() => {
        const statusColumn = table.getColumn("status");

        if (!statusColumn) return [];

        const values = Array.from(statusColumn.getFacetedUniqueValues().keys());

        return values.sort();
    }, [table.getColumn("status")?.getFacetedUniqueValues()]);

    // Get counts for each status
    const statusCounts = useMemo(() => {
        const statusColumn = table.getColumn("status");
        if (!statusColumn) return new Map();
        return statusColumn.getFacetedUniqueValues();
    }, [table.getColumn("status")?.getFacetedUniqueValues()]);

    const selectedStatuses = useMemo(() => {
        const filterValue = table.getColumn("status")?.getFilterValue() as string[];
        return filterValue ?? [];
    }, [table.getColumn("status")?.getFilterValue()]);

    const handleStatusChange = (checked: boolean, value: string) => {
        const filterValue = table.getColumn("status")?.getFilterValue() as string[];
        const newFilterValue = filterValue ? [...filterValue] : [];

        if (checked) {
            newFilterValue.push(value);
        } else {
            const index = newFilterValue.indexOf(value);
            if (index > -1) {
                newFilterValue.splice(index, 1);
            }
        }

        table.getColumn("status")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
    };

    return (
        <div className="space-y-4 w-full">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Filter by email */}
                    <div className="relative">
                        <Input
                            id={`${id}-input`}
                            ref={inputRef}
                            className={cn(
                                "peer min-w-60 ps-9",
                                Boolean(table.getColumn("email")?.getFilterValue()) && "pe-9",
                            )}
                            value={(table.getColumn("email")?.getFilterValue() ?? "") as string}
                            onChange={(e) => table.getColumn("email")?.setFilterValue(e.target.value)}
                            placeholder="Filter by email..."
                            type="text"
                            aria-label="Filter by email"
                        />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                            <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
                        </div>
                        {Boolean(table.getColumn("email")?.getFilterValue()) && (
                            <button
                                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Clear filter"
                                onClick={() => {
                                    table.getColumn("email")?.setFilterValue("");
                                    if (inputRef.current) {
                                        inputRef.current.focus();
                                    }
                                }}
                            >
                                <CircleX size={16} strokeWidth={2} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                    {/* Filter by status */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                <Filter
                                    className="-ms-1 me-2 opacity-60"
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                                Status
                                {selectedStatuses.length > 0 && (
                                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                    {selectedStatuses.length}
                  </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="min-w-36 p-3" align="start">
                            <div className="space-y-3">
                                <div className="text-xs font-medium text-muted-foreground">Filters</div>
                                <div className="space-y-3">
                                    {uniqueStatusValues.map((value, i) => (
                                        <div key={value} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`${id}-${i}`}
                                                checked={selectedStatuses.includes(value)}
                                                onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                                            />
                                            <Label
                                                htmlFor={`${id}-${i}`}
                                                className="flex grow justify-between gap-2 font-normal"
                                            >
                                                {value}{" "}
                                                <span className="ms-2 text-xs text-muted-foreground">
                          {statusCounts.get(value)}
                        </span>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    {/* Toggle columns visibility */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Columns3
                                    className="-ms-1 me-2 opacity-60"
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            onSelect={(event) => event.preventDefault()}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-3">
                    {/* Delete button */}
                    {table.getSelectedRowModel().rows.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="ml-auto" variant="outline">
                                    <Trash
                                        className="-ms-1 me-2 opacity-60"
                                        size={16}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                    Delete
                                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                                    <div
                                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                                        aria-hidden="true"
                                    >
                                        <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
                                    </div>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete{" "}
                                            {table.getSelectedRowModel().rows.length} selected{" "}
                                            {table.getSelectedRowModel().rows.length === 1 ? "row" : "rows"}.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteRows}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-border bg-background">
                <Table className="table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{ width: `${header.getSize()}px` }}
                                            className="h-11"
                                        >
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <div
                                                    className={cn(
                                                        header.column.getCanSort() &&
                                                        "flex h-full cursor-pointer select-none items-center justify-between gap-2",
                                                    )}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    onKeyDown={(e) => {
                                                        // Enhanced keyboard handling for sorting
                                                        if (
                                                            header.column.getCanSort() &&
                                                            (e.key === "Enter" || e.key === " ")
                                                        ) {
                                                            e.preventDefault();
                                                            header.column.getToggleSortingHandler()?.(e);
                                                        }
                                                    }}
                                                    tabIndex={header.column.getCanSort() ? 0 : undefined}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: (
                                                            <ChevronUp
                                                                className="shrink-0 opacity-60"
                                                                size={16}
                                                                strokeWidth={2}
                                                                aria-hidden="true"
                                                            />
                                                        ),
                                                        desc: (
                                                            <ChevronDown
                                                                className="shrink-0 opacity-60"
                                                                size={16}
                                                                strokeWidth={2}
                                                                aria-hidden="true"
                                                            />
                                                        ),
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            ) : (
                                                flexRender(header.column.columnDef.header, header.getContext())
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="last:py-0">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-8">
                {/* Results per page */}
                <div className="flex items-center gap-3">
                    <Label htmlFor={id} className="max-sm:sr-only">
                        Rows per page
                    </Label>
                    <Select
                        value={table.getState().pagination.pageSize.toString()}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                            <SelectValue placeholder="Select number of results" />
                        </SelectTrigger>
                        <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                            {[5, 10, 25, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={pageSize.toString()}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Page number information */}
                <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
                    <p className="whitespace-nowrap text-sm text-muted-foreground" aria-live="polite">
            <span className="text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                {Math.min(
                    Math.max(
                        table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                        table.getState().pagination.pageSize,
                        0,
                    ),
                    table.getRowCount(),
                )}
            </span>{" "}
                        of <span className="text-foreground">{table.getRowCount().toString()}</span>
                    </p>
                </div>

                {/* Pagination buttons */}
                <div>
                    <Pagination>
                        <PaginationContent>
                            {/* First page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() => table.firstPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    aria-label="Go to first page"
                                >
                                    <ChevronFirst size={16} strokeWidth={2} aria-hidden="true" />
                                </Button>
                            </PaginationItem>
                            {/* Previous page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    aria-label="Go to previous page"
                                >
                                    <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                                </Button>
                            </PaginationItem>
                            {/* Next page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    aria-label="Go to next page"
                                >
                                    <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                                </Button>
                            </PaginationItem>
                            {/* Last page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() => table.lastPage()}
                                    disabled={!table.getCanNextPage()}
                                    aria-label="Go to last page"
                                >
                                    <ChevronLast size={16} strokeWidth={2} aria-hidden="true" />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}

function RowActions({ row }: { row: Row<Item> }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleUnsubscribeUser = (row: Row<Item>) => {
        console.log(row);
    }

    const handleRemoveUser = async () => {
        try {
            const res = await fetch(`/api/newsletter/subscribers/${row.getValue("id")}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Failed to delete subscriber');
            }

            toast({
                title: "Success",
                description: "Subscriber successfully deleted.",
            });

            // Rafraîchir la page pour voir les changements
            window.location.reload();
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            toast({
                title: "Error",
                description: "Failed to delete subscriber. Please try again.",
                variant: "destructive",
            });
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex justify-end">
                    <Button size="icon" variant="ghost" className="shadow-none" aria-label="Edit item">
                        <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleUnsubscribeUser(row)}>Unsubscribe</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)} 
                    className="text-destructive focus:text-destructive"
                >
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>

            <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleRemoveUser}
                title="Êtes-vous sûr ?"
                description="Cette action est irréversible. L'abonné sera définitivement supprimé."
            />
        </DropdownMenu>
    );
}