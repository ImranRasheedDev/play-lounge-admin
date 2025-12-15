import apiClient from "@/lib/api-client";
import { User } from "@/types/user";

export interface UserResponse {
  status: boolean;
  message: string;
  data: User[];
}

export interface SingleUserResponse {
  status: boolean;
  message: string;
  data: User;
}

// Get all users (Super Admin only)
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<UserResponse>("/users");
  return response.data.data;
};

// Toggle user active status (Super Admin only)
export const toggleUserStatus = async (id: string): Promise<User> => {
  const response = await apiClient.patch<SingleUserResponse>(`/users/${id}/toggle-status`);
  return response.data.data;
};
