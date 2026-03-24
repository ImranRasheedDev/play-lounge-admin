import apiClient from "@/lib/api-client";
import { PaginationMeta, PaginationParams } from "@/types/pagination";
import { User, UserSavedVenue } from "@/types/user";

export interface UserResponse {
  status: boolean;
  message: string;
  data: User[];
  meta: PaginationMeta;
}

export interface SingleUserResponse {
  status: boolean;
  message: string;
  data: User;
}

export interface UserListResult {
  data: User[];
  meta: PaginationMeta;
}

export interface SavedVenuesResponse {
  status: boolean;
  message: string;
  data: UserSavedVenue[];
}

export interface AdminUpdateUserInput {
  name?: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  isActive?: boolean;
}

// Get all users with pagination (Super Admin only)
export const getUsers = async (params: PaginationParams): Promise<UserListResult> => {
  const response = await apiClient.get<UserResponse>("/users", {
    params: { page: params.page, limit: params.limit },
  });
  return { data: response.data.data, meta: response.data.meta };
};

// Toggle user active status (Super Admin only)
export const toggleUserStatus = async (id: string): Promise<User> => {
  const response = await apiClient.patch<SingleUserResponse>(`/users/${id}/toggle-status`);
  return response.data.data;
};

// ============================================
// ADMIN METHODS
// ============================================

// Get single user by ID (Super Admin only)
export const getUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<SingleUserResponse>(`/users/admin/${id}`);
  return response.data.data;
};

// Update user profile (Super Admin only)
export const updateUser = async (id: string, data: AdminUpdateUserInput): Promise<User> => {
  const response = await apiClient.patch<SingleUserResponse>(`/users/admin/${id}`, data);
  return response.data.data;
};

// Reset user password (Super Admin only)
export const resetUserPassword = async (id: string, password: string): Promise<void> => {
  await apiClient.post(`/users/admin/${id}/reset-password`, { password });
};

// Get user's saved venues (Super Admin only)
export const getUserSavedVenues = async (id: string): Promise<UserSavedVenue[]> => {
  const response = await apiClient.get<SavedVenuesResponse>(`/users/admin/${id}/saved-venues`);
  return response.data.data;
};

// Remove venue from user's saved venues (Super Admin only)
export const removeUserSavedVenue = async (userId: string, venueId: string): Promise<void> => {
  await apiClient.delete(`/users/admin/${userId}/saved-venues/${venueId}`);
};
