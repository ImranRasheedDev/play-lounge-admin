import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  deleteHostEventRequest,
  getHostEventRequests,
  updateHostEventRequest,
  type HostEventRequestUpdateInput,
} from "@/services/host-event-request.service";

const HOST_EVENT_REQUESTS_KEY = ["host-event-requests"];

// Hook to fetch all host event requests
export const useHostEventRequests = () => {
  return useQuery({
    queryKey: HOST_EVENT_REQUESTS_KEY,
    queryFn: getHostEventRequests,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};

// Hook to update a host event request
export const useUpdateHostEventRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HostEventRequestUpdateInput }) => updateHostEventRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOST_EVENT_REQUESTS_KEY });
      toast.success("Host event request updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to update host event request");
    },
  });
};

// Hook to delete a host event request
export const useDeleteHostEventRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHostEventRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOST_EVENT_REQUESTS_KEY });
      toast.success("Host event request deleted successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete host event request");
    },
  });
};
