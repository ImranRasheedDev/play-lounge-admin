"use client";

import * as React from "react";

import { PaginationState } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useToggleUserStatus, useUsers } from "@/hooks/use-users";
import { User } from "@/types/user";

import { createColumns } from "./columns";

export function UserTable() {
  // Pagination state for server-side pagination
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: usersData,
    isLoading,
    dataUpdatedAt,
  } = useUsers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });
  const users = usersData?.data ?? [];
  const pageCount = usersData?.meta?.totalPages ?? 0;

  const toggleStatusMutation = useToggleUserStatus();

  const handleToggleStatus = React.useCallback(
    (user: User) => {
      toggleStatusMutation.mutate(user.id);
    },
    [toggleStatusMutation],
  );

  const columns = React.useMemo(
    () =>
      createColumns({
        onToggleStatus: handleToggleStatus,
      }),
    [handleToggleStatus],
  );

  const table = useDataTableInstance({
    data: users,
    columns,
    getRowId: (row) => row.id,
    manualPagination: true,
    pageCount,
    pagination,
    onPaginationChange: setPagination,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>View all registered users in the system.</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">Loading users...</div>
        ) : (
          <div className="space-y-4" key={dataUpdatedAt}>
            <div className="overflow-hidden rounded-md border">
              <DataTable table={table} columns={columns} />
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
