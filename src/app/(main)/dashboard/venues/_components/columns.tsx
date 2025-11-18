"use client";
import Image from "next/image";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Venue } from "@/types/venue";

interface ColumnsProps {
  onEdit: (venue: Venue) => void;
  onDelete: (venue: Venue) => void;
  getCategoryName: (categoryId: string) => string;
  getVenueTypeName: (venueTypeId: string) => string;
}

export const createColumns = ({
  onEdit,
  onDelete,
  getCategoryName,
  getVenueTypeName,
}: ColumnsProps): ColumnDef<Venue>[] => [
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
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "thumbnail",
    header: "Thumbnail",
    cell: ({ row }) => {
      const thumbnail = row.original.thumbnail ?? row.original.images?.[0]?.images?.[0];
      if (!thumbnail) return <span className="text-muted-foreground text-sm">No image</span>;

      const imageUrl = thumbnail.startsWith("http") ? thumbnail : `${process.env.NEXT_PUBLIC_API_URL}${thumbnail}`;

      return (
        <div className="relative size-12 overflow-hidden rounded-md border">
          <Image src={imageUrl} alt={row.original.name} fill className="object-cover" unoptimized />
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Venue Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "categoryId",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">{getCategoryName(row.original.categoryId)}</span>
    ),
  },
  {
    accessorKey: "venueTypeId",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">{getVenueTypeName(row.original.venueTypeId)}</span>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="max-w-xs truncate text-sm" title={row.original.address}>
        {row.original.address}
      </div>
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags || [];
      if (tags.length === 0) return <span className="text-muted-foreground text-sm">No tags</span>;

      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive ?? true;
      return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const venue = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(venue)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(venue)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
