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
import { Rsvp } from "@/types/rsvp";

interface ColumnsProps {
  onView: (rsvp: Rsvp) => void;
  onDelete: (rsvp: Rsvp) => void;
}

export const createColumns = ({ onView, onDelete }: ColumnsProps): ColumnDef<Rsvp>[] => [
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
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.firstName} {row.original.lastName}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
  },
  {
    accessorKey: "user",
    header: "Owner",
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <div className="text-sm">
          <div className="font-medium">{user.name}</div>
          <div className="text-muted-foreground text-xs">{user.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "hostEventRequest",
    header: "Event",
    cell: ({ row }) => {
      const event = row.original.hostEventRequest;
      if (!event) return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <div className="text-sm">
          <div className="font-medium">{event.eventName ?? "Unnamed Event"}</div>
          {event.date && (
            <div className="text-muted-foreground text-xs">
              {(() => {
                try {
                  return format(new Date(event.date), "MMM d, yyyy");
                } catch {
                  return event.date;
                }
              })()}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "dietaryNeeds",
    header: "Dietary Needs",
    cell: ({ row }) => {
      const needs = row.original.dietaryNeeds;
      const customNeed = row.original.customDietaryNeed;

      if (needs.length === 0 && !customNeed) {
        return <span className="text-muted-foreground text-sm">None</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {needs.slice(0, 2).map((need) => (
            <Badge key={need.id} variant="secondary" className="text-xs">
              {need.name}
            </Badge>
          ))}
          {needs.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{needs.length - 2}
            </Badge>
          )}
          {customNeed && (
            <Badge variant="outline" className="text-xs">
              Custom
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.createdAt ? new Date(row.original.createdAt) : null;
      return <span className="text-muted-foreground text-sm">{date ? format(date, "MMM d, yyyy") : "—"}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rsvp = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 cursor-pointer p-0">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(rsvp)} className="cursor-pointer">
              <Eye className="mr-2 size-4" />
              View / Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(rsvp)}
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
