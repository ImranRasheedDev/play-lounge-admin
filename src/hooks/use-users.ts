import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  AdminUpdateUserInput,
  getUser,
  getUsers,
  getUserSavedVenues,
  removeUserSavedVenue,
  resetUserPassword,
  toggleUserStatus,
  updateUser,
} from "@/services/user.service";
import { PaginationParams } from "@/types/pagination";

const USERS_QUERY_KEY = ["users"];
const USER_QUERY_KEY = ["user"];
const USER_SAVED_VENUES_QUERY_KEY = ["user-saved-venues"];

// Hook to fetch all users with pagination (Super Admin only)
export const useUsers = (params: PaginationParams) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params.page, params.limit],
    queryFn: () => getUsers(params),
    refetchOnWindowFocus: false,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

// Hook to fetch single user by ID (Super Admin only)
export const useUser = (id: string) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, id],
    queryFn: () => getUser(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
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

// Hook to update user profile (Super Admin only)
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateUserInput }) => updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...USER_QUERY_KEY, variables.id] });
      toast.success("User updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to update user");
    },
  });
};

// Hook to reset user password (Super Admin only)
export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => resetUserPassword(id, password),
    onSuccess: () => {
      toast.success("Password reset successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to reset password");
    },
  });
};

// Hook to get user's saved venues (Super Admin only)
export const useUserSavedVenues = (userId: string) => {
  return useQuery({
    queryKey: [...USER_SAVED_VENUES_QUERY_KEY, userId],
    queryFn: () => getUserSavedVenues(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
};

// Hook to remove venue from user's saved venues (Super Admin only)
export const useRemoveUserSavedVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, venueId }: { userId: string; venueId: string }) => removeUserSavedVenue(userId, venueId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...USER_SAVED_VENUES_QUERY_KEY, variables.userId] });
      toast.success("Venue removed from user's favorites");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to remove venue");
    },
  });
};
