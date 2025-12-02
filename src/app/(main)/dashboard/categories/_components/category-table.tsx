"use client";

import * as React from "react";

import { Plus } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/use-categories";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Category } from "@/types/category";

import { CategoryDialog } from "./category-dialog";
import { createColumns } from "./columns";
import { DeleteAlert } from "./delete-alert";

export function CategoryTable() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

  const { data: categories = [], isLoading, dataUpdatedAt } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const columns = React.useMemo(
    () =>
      createColumns({
        onEdit: (category) => {
          setSelectedCategory(category);
          setIsDialogOpen(true);
        },
        onDelete: (category) => {
          setSelectedCategory(category);
          setIsDeleteOpen(true);
        },
      }),
    [],
  );

  const table = useDataTableInstance({
    data: categories,
    columns,
    getRowId: (row) => row.id,
  });

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  // Effect to handle delete alert close on mutation success
  React.useEffect(() => {
    if (deleteMutation.isSuccess) {
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    }
  }, [deleteMutation.isSuccess]);

  const handleSubmit = (categoryData: Category, iconFileParam?: File | null, imageFileParam?: File | null) => {
    if (selectedCategory) {
      // Update existing category
      // If no new file provided, use existing URL from categoryData
      updateMutation.mutate({
        id: selectedCategory.id,
        data: {
          title: categoryData.title,
          slug: categoryData.slug,
          isActive: categoryData.isActive,
          isFeatured: categoryData.isFeatured,
          icon: iconFileParam ?? categoryData.icon ?? undefined,
          image: imageFileParam ?? categoryData.image ?? undefined,
        },
      });
    } else {
      // Create new category - requires both files
      if (!iconFileParam || !imageFileParam) {
        return;
      }

      createMutation.mutate({
        title: categoryData.title,
        slug: categoryData.slug,
        icon: iconFileParam,
        image: imageFileParam,
        isFeatured: categoryData.isFeatured,
      });
    }
  };

  // Effect to handle dialog close on mutation success
  React.useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      setIsDialogOpen(false);
      setSelectedCategory(null);
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>Manage your venue categories and their details.</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <Button variant="outline" size="sm" onClick={handleCreate} className="cursor-pointer">
              <Plus />
              <span className="hidden lg:inline">Add Category</span>
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">Loading categories...</div>
        ) : (
          <div className="space-y-4" key={dataUpdatedAt}>
            <div className="overflow-hidden rounded-md border">
              <DataTable table={table} columns={columns} />
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </CardContent>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
        onSubmit={handleSubmit}
      />

      <DeleteAlert
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        category={selectedCategory}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
