"use client";

import * as React from "react";

import { PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useCreateVenueType, useDeleteVenueType, useUpdateVenueType, useVenueTypes } from "@/hooks/use-venue-types";
import { VenueType } from "@/types/venue-type";

import { createColumns } from "./columns";
import { DeleteAlert } from "./delete-alert";
import { VenueTypeDialog } from "./venue-type-dialog";

export function VenueTypeTable() {
  const [selectedVenueType, setSelectedVenueType] = React.useState<VenueType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  // Pagination state for server-side pagination
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: venueTypesData,
    isLoading,
    dataUpdatedAt,
  } = useVenueTypes({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });
  const venueTypes = venueTypesData?.data ?? [];
  const pageCount = venueTypesData?.meta?.totalPages ?? 0;

  const createMutation = useCreateVenueType();
  const updateMutation = useUpdateVenueType();
  const deleteMutation = useDeleteVenueType();

  const columns = React.useMemo(
    () =>
      createColumns({
        onEdit: (venueType) => {
          setSelectedVenueType(venueType);
          setIsDialogOpen(true);
        },
        onDelete: (venueType) => {
          setSelectedVenueType(venueType);
          setIsDeleteOpen(true);
        },
      }),
    [],
  );

  const table = useDataTableInstance({
    data: venueTypes,
    columns,
    getRowId: (row) => row.id,
    manualPagination: true,
    pageCount,
    pagination,
    onPaginationChange: setPagination,
  });

  // Effect to handle dialog close on mutation success
  React.useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      setIsDialogOpen(false);
      setSelectedVenueType(null);
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess]);

  // Effect to handle delete alert close on mutation success
  React.useEffect(() => {
    if (deleteMutation.isSuccess) {
      setIsDeleteOpen(false);
      setSelectedVenueType(null);
    }
  }, [deleteMutation.isSuccess]);

  const handleCreate = () => {
    setSelectedVenueType(null);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedVenueType) {
      deleteMutation.mutate(selectedVenueType.id);
    }
  };

  const handleSubmit = (venueTypeData: VenueType) => {
    if (selectedVenueType) {
      // Update existing venue type
      updateMutation.mutate({
        id: selectedVenueType.id,
        data: {
          name: venueTypeData.name,
          isActive: venueTypeData.isActive,
        },
      });
    } else {
      // Create new venue type
      createMutation.mutate({
        name: venueTypeData.name,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venue Types</CardTitle>
        <CardDescription>Manage the types of venues available in the platform.</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <Button variant="outline" size="sm" onClick={handleCreate} className="cursor-pointer">
              <Plus />
              <span className="hidden lg:inline">Add Venue Type</span>
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">Loading venue types...</div>
        ) : (
          <div className="space-y-4" key={dataUpdatedAt}>
            <div className="overflow-hidden rounded-md border">
              <DataTable table={table} columns={columns} />
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </CardContent>

      <VenueTypeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        venueType={selectedVenueType}
        onSubmit={handleSubmit}
      />

      <DeleteAlert
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        venueType={selectedVenueType}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
