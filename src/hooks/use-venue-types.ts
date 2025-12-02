import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  createVenueType,
  deleteVenueType,
  getAllVenueTypes,
  getActiveVenueTypes,
  updateVenueType,
  type VenueTypeCreateInput,
  type VenueTypeUpdateInput,
} from "@/services/venue-type.service";

const VENUE_TYPES_QUERY_KEY = ["venue-types"];
const ACTIVE_VENUE_TYPES_QUERY_KEY = ["venue-types", "active"];

// Hook to fetch all venue types (including inactive) - for venue types page
export const useVenueTypes = () => {
  return useQuery({
    queryKey: VENUE_TYPES_QUERY_KEY,
    queryFn: getAllVenueTypes,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale for immediate refetch
  });
};

// Hook to fetch active venue types only - for venue form
export const useActiveVenueTypes = () => {
  return useQuery({
    queryKey: ACTIVE_VENUE_TYPES_QUERY_KEY,
    queryFn: getActiveVenueTypes,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale for immediate refetch
  });
};

// Hook to create a new venue type
export const useCreateVenueType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VenueTypeCreateInput) => createVenueType(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: VENUE_TYPES_QUERY_KEY });
      toast.success("Venue type created successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to create venue type");
    },
  });
};

// Hook to update a venue type
export const useUpdateVenueType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VenueTypeUpdateInput }) => updateVenueType(id, data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: VENUE_TYPES_QUERY_KEY });
      toast.success("Venue type updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to update venue type");
    },
  });
};

// Hook to delete a venue type
export const useDeleteVenueType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVenueType(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: VENUE_TYPES_QUERY_KEY });
      toast.success("Venue type deleted successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete venue type");
    },
  });
};
