"use client";

import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import {
  useHostEventRequests,
  useDeleteHostEventRequest,
  useUpdateHostEventRequest,
} from "@/hooks/use-host-event-requests";
import { EventRequestDocument, HostEventRequest, HostEventRequestStatus } from "@/types/host-event-request";

import { createColumns } from "./columns";
import { DeleteAlert } from "./delete-alert";
import { ViewDialog } from "./view-dialog";

export function HostEventRequestsTable() {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<HostEventRequest | null>(null);

  const { data: requests = [], isLoading, dataUpdatedAt } = useHostEventRequests();
  const deleteMutation = useDeleteHostEventRequest();
  const updateMutation = useUpdateHostEventRequest();

  const columns = React.useMemo(
    () =>
      createColumns({
        onView: (request) => {
          setSelectedRequest(request);
          setIsViewOpen(true);
        },
        onDelete: (request) => {
          setSelectedRequest(request);
          setIsDeleteOpen(true);
        },
      }),
    [],
  );

  const table = useDataTableInstance({
    data: requests,
    columns,
    getRowId: (row) => String(row.id),
  });

  const handleDelete = () => {
    if (selectedRequest) {
      deleteMutation.mutate(String(selectedRequest.id));
    }
  };

  const handleUpdateStatus = (
    id: string,
    status: HostEventRequestStatus,
    adminNotes: string,
    documents?: EventRequestDocument[],
  ) => {
    updateMutation.mutate(
      { id, data: { status, adminNotes, documents } },
      {
        onSuccess: () => {
          setIsViewOpen(false);
          setSelectedRequest(null);
        },
      },
    );
  };

  // Effect to handle delete alert close on mutation success
  React.useEffect(() => {
    if (deleteMutation.isSuccess) {
      setIsDeleteOpen(false);
      setSelectedRequest(null);
    }
  }, [deleteMutation.isSuccess]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Host Event Requests</CardTitle>
        <CardDescription>Manage host event requests submitted through the website.</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">Loading requests...</div>
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
        request={selectedRequest}
        onConfirm={handleDelete}
      />

      <ViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        request={selectedRequest}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={updateMutation.isPending}
      />
    </Card>
  );
}
