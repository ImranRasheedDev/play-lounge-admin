import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  createDietaryNeed,
  deleteDietaryNeed,
  getAllDietaryNeeds,
  getActiveDietaryNeeds,
  updateDietaryNeed,
  type DietaryNeedCreateInput,
  type DietaryNeedUpdateInput,
} from "@/services/dietary-need.service";
import { PaginationParams } from "@/types/pagination";

const DIETARY_NEEDS_QUERY_KEY = ["dietary-needs"];
const ACTIVE_DIETARY_NEEDS_QUERY_KEY = ["dietary-needs", "active"];

// Hook to fetch all dietary needs with pagination (including inactive) - for dietary needs page
export const useDietaryNeeds = (params: PaginationParams) => {
  return useQuery({
    queryKey: [...DIETARY_NEEDS_QUERY_KEY, params.page, params.limit],
    queryFn: () => getAllDietaryNeeds(params),
    refetchOnWindowFocus: false,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

// Hook to fetch active dietary needs only - for guest list form
export const useActiveDietaryNeeds = () => {
  return useQuery({
    queryKey: ACTIVE_DIETARY_NEEDS_QUERY_KEY,
    queryFn: getActiveDietaryNeeds,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale for immediate refetch
  });
};

// Hook to create a new dietary need
export const useCreateDietaryNeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DietaryNeedCreateInput) => createDietaryNeed(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: DIETARY_NEEDS_QUERY_KEY });
      toast.success("Dietary need created successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to create dietary need");
    },
  });
};

// Hook to update a dietary need
export const useUpdateDietaryNeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DietaryNeedUpdateInput }) => updateDietaryNeed(id, data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: DIETARY_NEEDS_QUERY_KEY });
      toast.success("Dietary need updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to update dietary need");
    },
  });
};

// Hook to delete a dietary need
export const useDeleteDietaryNeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDietaryNeed(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: DIETARY_NEEDS_QUERY_KEY });
      toast.success("Dietary need deleted successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete dietary need");
    },
  });
};
