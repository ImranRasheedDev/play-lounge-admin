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
import { HostEventRequest, HostEventRequestStatus } from "@/types/host-event-request";

interface ColumnsProps {
  onView: (request: HostEventRequest) => void;
  onDelete: (request: HostEventRequest) => void;
}

const getStatusBadgeVariant = (status: HostEventRequestStatus) => {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "APPROVED":
      return "outline";
    case "DECLINED":
      return "destructive";
    case "COMPLETED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
};

const formatStatus = (status: HostEventRequestStatus) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "APPROVED":
      return "Approved";
    case "DECLINED":
      return "Declined";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
};

export const createColumns = ({ onView, onDelete }: ColumnsProps): ColumnDef<HostEventRequest>[] => [
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
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div className="text-sm">{row.original.phone ?? "—"}</div>,
  },
  {
    accessorKey: "eventName",
    header: "Event Name",
    cell: ({ row }) => <div className="text-sm">{row.original.eventName ?? "—"}</div>,
  },
  {
    accessorKey: "venue",
    header: "Venue",
    cell: ({ row }) => {
      const venue = row.original.venueId;
      if (typeof venue === "object" && venue !== null) {
        return <div className="text-sm">{venue.name}</div>;
      }
      return <div className="text-muted-foreground text-sm">—</div>;
    },
  },
  {
    accessorKey: "eventType",
    header: "Event Type",
    cell: ({ row }) =>
      row.original.eventType ? (
        <Badge variant="outline" className="text-xs">
          {row.original.eventType}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "numberOfGuests",
    header: "Guests",
    cell: ({ row }) => <div className="text-sm">{row.original.numberOfGuests}</div>,
  },
  {
    accessorKey: "date",
    header: "Event Date",
    cell: ({ row }) => {
      try {
        const date = new Date(row.original.date);
        return <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>;
      } catch {
        return <div className="text-sm">{row.original.date}</div>;
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
      const request = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 cursor-pointer p-0">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(request)} className="cursor-pointer">
              <Eye className="mr-2 size-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(request)}
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
