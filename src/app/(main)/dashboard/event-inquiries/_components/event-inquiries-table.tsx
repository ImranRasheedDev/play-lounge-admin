"use client";

import * as React from "react";

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
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [selectedInquiry, setSelectedInquiry] = React.useState<EventQuery | null>(null);

  const { data: inquiries = [], isLoading, dataUpdatedAt } = useEventQueries();
  const deleteMutation = useDeleteEventQuery();
  const updateMutation = useUpdateEventQuery();

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
      }),
    [],
  );

  const table = useDataTableInstance({
    data: inquiries,
    columns,
    getRowId: (row) => String(row.id),
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
