import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  createVenue,
  deleteVenue,
  getVenues,
  updateVenue,
  type VenueCreateInput,
  type VenueUpdateInput,
} from "@/services/venue.service";
import { PaginationParams } from "@/types/pagination";

const VENUES_QUERY_KEY = ["venues"];

// Hook to fetch all venues with optional pagination
// When params are provided, fetches with pagination
// When params are not provided, fetches all venues (high limit)
export const useVenues = (params?: PaginationParams) => {
  const effectiveParams = params ?? { page: 1, limit: 1000 };
  return useQuery({
    queryKey: params ? [...VENUES_QUERY_KEY, params.page, params.limit] : [...VENUES_QUERY_KEY, "all"],
    queryFn: () => getVenues(effectiveParams),
    refetchOnWindowFocus: false,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

// Hook to create a new venue
export const useCreateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VenueCreateInput) => createVenue(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
      toast.success("Venue created successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to create venue");
    },
  });
};

// Hook to update a venue
export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VenueUpdateInput }) => updateVenue(id, data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
      toast.success("Venue updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to update venue");
    },
  });
};

// Hook to delete a venue
export const useDeleteVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVenue(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
      toast.success("Venue deleted successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete venue");
    },
  });
};
