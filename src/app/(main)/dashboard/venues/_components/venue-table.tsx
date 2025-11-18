"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { useCategories } from "@/hooks/use-categories";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useVenueTypes } from "@/hooks/use-venue-types";
import { useVenues, useDeleteVenue } from "@/hooks/use-venues";
import { Venue } from "@/types/venue";

import { createColumns } from "./columns";
import { DeleteAlert } from "./delete-alert";

export function VenueTable() {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedVenue, setSelectedVenue] = React.useState<Venue | null>(null);

  const { data: venues = [], isLoading, dataUpdatedAt } = useVenues();
  const { data: categories = [] } = useCategories();
  const { data: venueTypes = [] } = useVenueTypes();
  const deleteMutation = useDeleteVenue();

  const getCategoryName = React.useCallback(
    (categoryId: string) => {
      const category = categories.find((c) => c.id === categoryId);
      return category?.title ?? "Unknown";
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
        getCategoryName,
        getVenueTypeName,
      }),
    [getCategoryName, getVenueTypeName, router],
  );

  const table = useDataTableInstance({
    data: venues,
    columns,
    getRowId: (row) => row.id,
  });

  const handleCreate = () => {
    router.push("/dashboard/venues/new");
  };

  const handleDelete = () => {
    if (selectedVenue) {
      deleteMutation.mutate(selectedVenue.id);
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
            <Button variant="outline" size="sm" onClick={handleCreate}>
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
