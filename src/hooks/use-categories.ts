import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getActiveCategories,
  updateCategory,
  type CategoryCreateInput,
  type CategoryUpdateInput,
} from "@/services/category.service";
import { PaginationParams } from "@/types/pagination";

const CATEGORIES_QUERY_KEY = ["categories"];
const ACTIVE_CATEGORIES_QUERY_KEY = ["categories", "active"];

// Hook to fetch all categories with pagination (including inactive) - for categories page
export const useCategories = (params?: PaginationParams) => {
  return useQuery({
    queryKey: params ? [...CATEGORIES_QUERY_KEY, params.page, params.limit] : CATEGORIES_QUERY_KEY,
    queryFn: () => (params ? getAllCategories(params) : getAllCategories({ page: 1, limit: 100 })),
    refetchOnWindowFocus: false,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

// Hook to fetch active categories only - for venue form
export const useActiveCategories = () => {
  return useQuery({
    queryKey: ACTIVE_CATEGORIES_QUERY_KEY,
    queryFn: getActiveCategories,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale for immediate refetch
  });
};

// Hook to create a new category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryCreateInput) => createCategory(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category created successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to create category");
    },
  });
};

// Hook to update a category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateInput }) => updateCategory(id, data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to update category");
    },
  });
};

// Hook to delete a category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category deleted successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete category");
    },
  });
};
