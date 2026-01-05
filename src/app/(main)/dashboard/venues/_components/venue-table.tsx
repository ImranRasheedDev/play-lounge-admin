"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { useActiveCategories } from "@/hooks/use-categories";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useActiveVenueTypes } from "@/hooks/use-venue-types";
import { useVenues, useDeleteVenue } from "@/hooks/use-venues";
import { Venue } from "@/types/venue";

import { createColumns } from "./columns";
import { DeleteAlert } from "./delete-alert";

export function VenueTable() {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedVenue, setSelectedVenue] = React.useState<Venue | null>(null);

  // Pagination state for server-side pagination
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: venuesData,
    isLoading,
    dataUpdatedAt,
  } = useVenues({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });
  const venues = venuesData?.data ?? [];
  const pageCount = venuesData?.meta?.totalPages ?? 0;

  const { data: categoriesData } = useActiveCategories();
  const categories = categoriesData ?? [];
  const { data: venueTypesData } = useActiveVenueTypes();
  const venueTypes = venueTypesData ?? [];
  const deleteMutation = useDeleteVenue();

  const getCategoryNames = React.useCallback(
    (categoryId: string | string[] | unknown) => {
      if (!categoryId) return [];
      const ids = Array.isArray(categoryId) ? categoryId : [categoryId as string];
      return ids.map((id) => {
        const category = categories.find((c) => c.id === id);
        return category?.title ?? "Unknown";
      });
    },
    [categories],
  );

  const getVenueTypeName = React.useCallback(
    (venueTypeId: string) => {
      const venueType = venueTypes.find((vt) => vt.id === venueTypeId);
      return venueType?.name ?? "Unknown";
    },
    [venueTypes],
  );

  const columns = React.useMemo(
    () =>
      createColumns({
        onEdit: (venue) => {
          router.push(`/dashboard/venues/${venue.id}/edit`);
        },
        onDelete: (venue) => {
          setSelectedVenue(venue);
          setIsDeleteOpen(true);
        },
        getCategoryNames,
        getVenueTypeName,
      }),
    [getCategoryNames, getVenueTypeName, router],
  );

  const table = useDataTableInstance({
    data: venues,
    columns,
    getRowId: (row) => String(row.id),
    manualPagination: true,
    pageCount,
    pagination,
    onPaginationChange: setPagination,
  });

  const handleCreate = () => {
    router.push("/dashboard/venues/new");
  };

  const handleDelete = () => {
    if (selectedVenue) {
      deleteMutation.mutate(String(selectedVenue.id));
    }
  };

  // Effect to handle delete alert close on mutation success
  React.useEffect(() => {
    if (deleteMutation.isSuccess) {
      setIsDeleteOpen(false);
      setSelectedVenue(null);
    }
  }, [deleteMutation.isSuccess]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venues</CardTitle>
        <CardDescription>Manage your venues and their details.</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <Button variant="outline" size="sm" onClick={handleCreate} className="cursor-pointer">
              <Plus />
              <span className="hidden lg:inline">Add Venue</span>
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">Loading venues...</div>
        ) : (
          <div className="space-y-4" key={dataUpdatedAt}>
            <div className="overflow-hidden rounded-md border">
              <DataTable table={table} columns={columns} />
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </CardContent>

      <DeleteAlert open={isDeleteOpen} onOpenChange={setIsDeleteOpen} venue={selectedVenue} onConfirm={handleDelete} />
    </Card>
  );
}
