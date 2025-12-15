"use client";

import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useUsers, useToggleUserStatus } from "@/hooks/use-users";
import { User } from "@/types/user";

import { createColumns } from "./columns";

export function UserTable() {
  const { data: users = [], isLoading, dataUpdatedAt } = useUsers();
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
