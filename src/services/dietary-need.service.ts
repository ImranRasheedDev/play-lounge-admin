import apiClient from "@/lib/api-client";
import { DietaryNeed } from "@/types/dietary-need";

export interface DietaryNeedResponse {
  status: boolean;
  message: string;
  data: DietaryNeed[];
}

export interface DietaryNeedCreateInput {
  name: string;
}

export interface DietaryNeedUpdateInput {
  name: string;
  isActive: boolean;
}

// Get all dietary needs (including inactive)
export const getAllDietaryNeeds = async (): Promise<DietaryNeed[]> => {
  const response = await apiClient.get<DietaryNeedResponse>("/dietary-needs/all");
  return response.data.data;
};

// Get active dietary needs only
export const getActiveDietaryNeeds = async (): Promise<DietaryNeed[]> => {
  const response = await apiClient.get<DietaryNeedResponse>("/dietary-needs");
  return response.data.data;
};

// Create a new dietary need
export const createDietaryNeed = async (data: DietaryNeedCreateInput): Promise<DietaryNeed> => {
  const response = await apiClient.post<{ data: DietaryNeed }>("/dietary-needs", data);
  return response.data.data;
};

// Update an existing dietary need
export const updateDietaryNeed = async (id: string, data: DietaryNeedUpdateInput): Promise<DietaryNeed> => {
  const response = await apiClient.patch<{ data: DietaryNeed }>(`/dietary-needs/${id}`, data);
  return response.data.data;
};

// Delete a dietary need
export const deleteDietaryNeed = async (id: string): Promise<void> => {
  await apiClient.delete(`/dietary-needs/${id}`);
};
