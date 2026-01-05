"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { PaginationState } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useEventQueries, useDeleteEventQuery, useUpdateEventQuery } from "@/hooks/use-event-queries";
import { EventQuery, EventQueryStatus } from "@/types/event-query";

import { createColumns } from "./columns";
import { DeleteAlert } from "./delete-alert";
import { ViewDialog } from "./view-dialog";

export function EventInquiriesTable() {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [selectedInquiry, setSelectedInquiry] = React.useState<EventQuery | null>(null);

  // Pagination state for server-side pagination
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: inquiriesData,
    isLoading,
    dataUpdatedAt,
  } = useEventQueries({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });
  const inquiries = inquiriesData?.data ?? [];
  const pageCount = inquiriesData?.meta?.totalPages ?? 0;

  const deleteMutation = useDeleteEventQuery();
  const updateMutation = useUpdateEventQuery();

  const handleConvertToEvent = React.useCallback(
    (inquiry: EventQuery) => {
      router.push(`/dashboard/event-inquiries/${inquiry.id}/convert`);
    },
    [router],
  );

  const columns = React.useMemo(
    () =>
      createColumns({
        onView: (inquiry) => {
          setSelectedInquiry(inquiry);
          setIsViewOpen(true);
        },
        onDelete: (inquiry) => {
          setSelectedInquiry(inquiry);
          setIsDeleteOpen(true);
        },
        onConvertToEvent: handleConvertToEvent,
      }),
    [handleConvertToEvent],
  );

  const table = useDataTableInstance({
    data: inquiries,
    columns,
    getRowId: (row) => String(row.id),
    manualPagination: true,
    pageCount,
    pagination,
    onPaginationChange: setPagination,
  });

  const handleDelete = () => {
    if (selectedInquiry) {
      deleteMutation.mutate(String(selectedInquiry.id));
    }
  };

  const handleUpdateStatus = (id: string, status: EventQueryStatus, adminNotes: string) => {
    updateMutation.mutate(
      { id, data: { status, adminNotes } },
      {
        onSuccess: () => {
          setIsViewOpen(false);
          setSelectedInquiry(null);
        },
      },
    );
  };

  // Effect to handle delete alert close on mutation success
  React.useEffect(() => {
    if (deleteMutation.isSuccess) {
      setIsDeleteOpen(false);
      setSelectedInquiry(null);
    }
  }, [deleteMutation.isSuccess]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Inquiries</CardTitle>
        <CardDescription>Manage event inquiries submitted through the website.</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">Loading inquiries...</div>
        ) : (
          <div className="space-y-4" key={dataUpdatedAt}>
            <div className="overflow-hidden rounded-md border">
              <DataTable table={table} columns={columns} />
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </CardContent>

      <DeleteAlert
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        inquiry={selectedInquiry}
        onConfirm={handleDelete}
      />

      <ViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        inquiry={selectedInquiry}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={updateMutation.isPending}
      />
    </Card>
  );
}
