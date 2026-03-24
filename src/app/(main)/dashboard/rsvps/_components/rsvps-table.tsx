"use client";

import * as React from "react";

import { PaginationState } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useDeleteRsvp, useRsvps, useUpdateRsvp } from "@/hooks/use-rsvps";
import { Rsvp, RsvpUpdateInput } from "@/types/rsvp";

import { createColumns } from "./columns";
import { DeleteAlert } from "./delete-alert";
import { ViewDialog } from "./view-dialog";

export function RsvpsTable() {
  const [selectedRsvp, setSelectedRsvp] = React.useState<Rsvp | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  // Pagination state for server-side pagination
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: rsvpsData,
    isLoading,
    dataUpdatedAt,
  } = useRsvps({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });
  const rsvps = rsvpsData?.data ?? [];
  const pageCount = rsvpsData?.meta?.totalPages ?? 0;

  const updateMutation = useUpdateRsvp();
  const deleteMutation = useDeleteRsvp();

  const columns = React.useMemo(
    () =>
      createColumns({
        onView: (rsvp) => {
          setSelectedRsvp(rsvp);
          setIsViewOpen(true);
        },
        onDelete: (rsvp) => {
          setSelectedRsvp(rsvp);
          setIsDeleteOpen(true);
        },
      }),
    [],
  );

  const table = useDataTableInstance({
    data: rsvps,
    columns,
    getRowId: (row) => row.id,
    manualPagination: true,
    pageCount,
    pagination,
    onPaginationChange: setPagination,
  });

  // Effect to handle dialog close on mutation success
  React.useEffect(() => {
    if (updateMutation.isSuccess) {
      setIsViewOpen(false);
      setSelectedRsvp(null);
    }
  }, [updateMutation.isSuccess]);

  // Effect to handle delete alert close on mutation success
  React.useEffect(() => {
    if (deleteMutation.isSuccess) {
      setIsDeleteOpen(false);
      setSelectedRsvp(null);
    }
  }, [deleteMutation.isSuccess]);

  const handleUpdate = (id: string, data: RsvpUpdateInput) => {
    updateMutation.mutate({ id, data });
  };

  const handleDelete = () => {
    if (selectedRsvp) {
      deleteMutation.mutate(selectedRsvp.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>RSVPs</CardTitle>
        <CardDescription>View and manage all guest RSVPs across all events.</CardDescription>
        <CardAction>
          <DataTableViewOptions table={table} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">Loading RSVPs...</div>
        ) : (
          <div className="space-y-4" key={dataUpdatedAt}>
            <div className="overflow-hidden rounded-md border">
              <DataTable table={table} columns={columns} />
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </CardContent>

      <ViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        rsvp={selectedRsvp}
        onUpdate={handleUpdate}
        isUpdating={updateMutation.isPending}
      />

      <DeleteAlert open={isDeleteOpen} onOpenChange={setIsDeleteOpen} rsvp={selectedRsvp} onConfirm={handleDelete} />
    </Card>
  );
}
