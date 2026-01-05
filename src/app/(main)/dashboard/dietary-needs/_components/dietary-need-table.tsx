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
import {
  useCreateDietaryNeed,
  useDeleteDietaryNeed,
  useUpdateDietaryNeed,
  useDietaryNeeds,
} from "@/hooks/use-dietary-needs";
import { DietaryNeed } from "@/types/dietary-need";

import { createColumns } from "./columns";
import { DeleteAlert } from "./delete-alert";
import { DietaryNeedDialog } from "./dietary-need-dialog";

export function DietaryNeedTable() {
  const [selectedDietaryNeed, setSelectedDietaryNeed] = React.useState<DietaryNeed | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  // Pagination state for server-side pagination
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: dietaryNeedsData,
    isLoading,
    dataUpdatedAt,
  } = useDietaryNeeds({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });
  const dietaryNeeds = dietaryNeedsData?.data ?? [];
  const pageCount = dietaryNeedsData?.meta?.totalPages ?? 0;

  const createMutation = useCreateDietaryNeed();
  const updateMutation = useUpdateDietaryNeed();
  const deleteMutation = useDeleteDietaryNeed();

  const columns = React.useMemo(
    () =>
      createColumns({
        onEdit: (dietaryNeed) => {
          setSelectedDietaryNeed(dietaryNeed);
          setIsDialogOpen(true);
        },
        onDelete: (dietaryNeed) => {
          setSelectedDietaryNeed(dietaryNeed);
          setIsDeleteOpen(true);
        },
      }),
    [],
  );

  const table = useDataTableInstance({
    data: dietaryNeeds,
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
      setSelectedDietaryNeed(null);
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess]);

  // Effect to handle delete alert close on mutation success
  React.useEffect(() => {
    if (deleteMutation.isSuccess) {
      setIsDeleteOpen(false);
      setSelectedDietaryNeed(null);
    }
  }, [deleteMutation.isSuccess]);

  const handleCreate = () => {
    setSelectedDietaryNeed(null);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedDietaryNeed) {
      deleteMutation.mutate(selectedDietaryNeed.id);
    }
  };

  const handleSubmit = (dietaryNeedData: DietaryNeed) => {
    if (selectedDietaryNeed) {
      // Update existing dietary need
      updateMutation.mutate({
        id: selectedDietaryNeed.id,
        data: {
          name: dietaryNeedData.name,
          isActive: dietaryNeedData.isActive,
        },
      });
    } else {
      // Create new dietary need
      createMutation.mutate({
        name: dietaryNeedData.name,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dietary Needs</CardTitle>
        <CardDescription>Manage dietary needs options that hosts can assign to guests.</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <Button variant="outline" size="sm" onClick={handleCreate} className="cursor-pointer">
              <Plus />
              <span className="hidden lg:inline">Add Dietary Need</span>
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">Loading dietary needs...</div>
        ) : (
          <div className="space-y-4" key={dataUpdatedAt}>
            <div className="overflow-hidden rounded-md border">
              <DataTable table={table} columns={columns} />
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </CardContent>

      <DietaryNeedDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        dietaryNeed={selectedDietaryNeed}
        onSubmit={handleSubmit}
      />

      <DeleteAlert
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        dietaryNeed={selectedDietaryNeed}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
