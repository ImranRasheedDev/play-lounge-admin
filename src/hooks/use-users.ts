import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { getUsers, toggleUserStatus } from "@/services/user.service";

const USERS_QUERY_KEY = ["users"];

// Hook to fetch all users (Super Admin only)
export const useUsers = () => {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: getUsers,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};

// Hook to toggle user status
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleUserStatus(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success(`User ${data.isActive ? "activated" : "deactivated"} successfully`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to update user status");
    },
  });
};
