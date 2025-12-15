import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  deleteEventQuery,
  getEventQueries,
  updateEventQuery,
  type EventQueryUpdateInput,
} from "@/services/event-query.service";

const EVENT_QUERIES_KEY = ["event-queries"];

// Hook to fetch all event queries
export const useEventQueries = () => {
  return useQuery({
    queryKey: EVENT_QUERIES_KEY,
    queryFn: getEventQueries,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};

// Hook to update an event query
export const useUpdateEventQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventQueryUpdateInput }) => updateEventQuery(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERIES_KEY });
      toast.success("Event inquiry updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to update event inquiry");
    },
  });
};

// Hook to delete an event query
export const useDeleteEventQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEventQuery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERIES_KEY });
      toast.success("Event inquiry deleted successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete event inquiry");
    },
  });
};
