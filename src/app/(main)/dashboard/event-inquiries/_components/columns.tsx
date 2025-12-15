"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventQuery, EventQueryStatus } from "@/types/event-query";

interface ColumnsProps {
  onView: (inquiry: EventQuery) => void;
  onDelete: (inquiry: EventQuery) => void;
}

const getStatusBadgeVariant = (status: EventQueryStatus) => {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    case "COMPLETED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
};

const formatStatus = (status: EventQueryStatus) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
};

export const createColumns = ({ onView, onDelete }: ColumnsProps): ColumnDef<EventQuery>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="cursor-pointer"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="cursor-pointer"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Contact Name",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.firstName} {row.original.lastName}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => <div className="text-sm">{row.original.phoneNumber}</div>,
  },
  {
    accessorKey: "eventType",
    header: "Event Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.eventType}
      </Badge>
    ),
  },
  {
    accessorKey: "area",
    header: "Area",
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate text-sm" title={row.original.area}>
        {row.original.area}
      </div>
    ),
  },
  {
    accessorKey: "numberOfPeople",
    header: "Guests",
    cell: ({ row }) => <div className="text-sm">{row.original.numberOfPeople}</div>,
  },
  {
    accessorKey: "eventDate",
    header: "Event Date",
    cell: ({ row }) => {
      try {
        const date = new Date(row.original.eventDate);
        return <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>;
      } catch {
        return <div className="text-sm">{row.original.eventDate}</div>;
      }
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.status)}>{formatStatus(row.original.status)}</Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => {
      try {
        const date = new Date(row.original.createdAt);
        return <div className="text-muted-foreground text-sm">{format(date, "MMM dd, yyyy")}</div>;
      } catch {
        return <div className="text-muted-foreground text-sm">—</div>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const inquiry = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 cursor-pointer p-0">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(inquiry)} className="cursor-pointer">
              <Eye className="mr-2 size-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(inquiry)}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
