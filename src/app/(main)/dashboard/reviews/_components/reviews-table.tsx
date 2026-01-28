"use client";

import * as React from "react";

import { Plus } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import {
  useCreateReview,
  useDeleteReview,
  useReviews,
  useToggleReviewStatus,
  useUpdateReview,
} from "@/hooks/use-reviews";
import { Review, ReviewCreateInput } from "@/types/review";

import { createColumns } from "./columns";
import { DeleteAlert } from "./delete-alert";
import { ReviewDialog } from "./review-dialog";

export function ReviewsTable() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedReview, setSelectedReview] = React.useState<Review | null>(null);

  const { data: reviews, isLoading, dataUpdatedAt } = useReviews();

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const deleteMutation = useDeleteReview();
  const toggleStatusMutation = useToggleReviewStatus();

  const columns = React.useMemo(
    () =>
      createColumns({
        onEdit: (review) => {
          setSelectedReview(review);
          setIsDialogOpen(true);
        },
        onDelete: (review) => {
          setSelectedReview(review);
          setIsDeleteOpen(true);
        },
        onToggleStatus: (review) => {
          toggleStatusMutation.mutate(review.id);
        },
      }),
    [toggleStatusMutation],
  );

  const table = useDataTableInstance({
    data: reviews ?? [],
    columns,
    getRowId: (row) => row.id,
  });

  const handleCreate = () => {
    setSelectedReview(null);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedReview) {
      deleteMutation.mutate(selectedReview.id);
    }
  };

  React.useEffect(() => {
    if (deleteMutation.isSuccess) {
      setIsDeleteOpen(false);
      setSelectedReview(null);
    }
  }, [deleteMutation.isSuccess]);

  const handleSubmit = (data: ReviewCreateInput, avatarFile?: File | null) => {
    if (selectedReview) {
      updateMutation.mutate({
        id: selectedReview.id,
        data: {
          ...data,
          avatar: avatarFile ?? data.avatar,
        },
      });
    } else {
      createMutation.mutate({
        ...data,
        avatar: avatarFile ?? undefined,
      });
    }
  };

  React.useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      setIsDialogOpen(false);
      setSelectedReview(null);
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
        <CardDescription>Manage customer reviews displayed on the homepage.</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <Button variant="outline" size="sm" onClick={handleCreate} className="cursor-pointer">
              <Plus />
              <span className="hidden lg:inline">Add Review</span>
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">Loading reviews...</div>
        ) : (
          <div className="space-y-4" key={dataUpdatedAt}>
            <div className="overflow-hidden rounded-md border">
              <DataTable table={table} columns={columns} />
            </div>
          </div>
        )}
      </CardContent>

      <ReviewDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        review={selectedReview}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteAlert
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        review={selectedReview}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
