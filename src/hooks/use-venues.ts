import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const VENUES_QUERY_KEY = ["venues"];

// Hook to fetch all venues
export const useVenues = () => {
  return useQuery({
    queryKey: VENUES_QUERY_KEY,
    queryFn: getVenues,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale for immediate refetch
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
