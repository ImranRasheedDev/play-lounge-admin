import apiClient from "@/lib/api-client";
import { uploadFile } from "@/lib/upload-utils";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  address: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  phoneNumber?: string;
  address?: string;
  avatar?: File | string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Get current user profile
export const getProfile = async (): Promise<Profile> => {
  const response = await apiClient.get<Profile>("/auth/profile");
  return response.data;
};

// Update profile
export const updateProfile = async (data: UpdateProfileInput): Promise<Profile> => {
  let avatarUrl = typeof data.avatar === "string" ? data.avatar : undefined;

  // Upload avatar if it's a file
  if (data.avatar instanceof File) {
    avatarUrl = await uploadFile(data.avatar, "users/avatars");
  }

  const payload: {
    name?: string;
    phoneNumber?: string;
    address?: string;
    avatar?: string;
  } = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.phoneNumber !== undefined) payload.phoneNumber = data.phoneNumber;
  if (data.address !== undefined) payload.address = data.address;
  if (avatarUrl !== undefined) payload.avatar = avatarUrl;

  const response = await apiClient.patch<Profile>("/auth/profile", payload);
  return response.data;
};

// Change password
export const changePassword = async (data: ChangePasswordInput): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>("/auth/change-password", data);
  return response.data;
};
