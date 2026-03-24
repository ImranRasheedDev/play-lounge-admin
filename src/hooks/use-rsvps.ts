import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { createRsvp, deleteRsvp, getRsvps, getRsvpsByEvent, getRsvpsByUser, updateRsvp } from "@/services/rsvp.service";
import { PaginationParams } from "@/types/pagination";
import { RsvpCreateInput, RsvpUpdateInput } from "@/types/rsvp";

const RSVPS_KEY = ["rsvps"];

// Hook to fetch all RSVPs with pagination
export const useRsvps = (params: PaginationParams) => {
  return useQuery({
    queryKey: [...RSVPS_KEY, params.page, params.limit],
    queryFn: () => getRsvps(params),
    refetchOnWindowFocus: false,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

// Hook to fetch RSVPs by event ID
export const useRsvpsByEvent = (eventId: string | undefined) => {
  return useQuery({
    queryKey: [...RSVPS_KEY, "event", eventId],
    queryFn: () => getRsvpsByEvent(eventId!),
    enabled: !!eventId,
    refetchOnWindowFocus: false,
  });
};

// Hook to fetch RSVPs by user ID
export const useRsvpsByUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: [...RSVPS_KEY, "user", userId],
    queryFn: () => getRsvpsByUser(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
};

// Hook to update an RSVP
export const useUpdateRsvp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RsvpUpdateInput }) => updateRsvp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RSVPS_KEY });
      toast.success("RSVP updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to update RSVP");
    },
  });
};

// Hook to delete an RSVP
export const useDeleteRsvp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRsvp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RSVPS_KEY });
      toast.success("RSVP deleted successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete RSVP");
    },
  });
};

// Hook to create an RSVP for a user (admin)
export const useCreateRsvp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RsvpCreateInput) => createRsvp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RSVPS_KEY });
      toast.success("RSVP created successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to create RSVP");
    },
  });
};
