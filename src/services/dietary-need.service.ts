import apiClient from "@/lib/api-client";
import { DietaryNeed } from "@/types/dietary-need";
import { PaginationParams, PaginationMeta } from "@/types/pagination";

export interface DietaryNeedResponse {
  status: boolean;
  message: string;
  data: DietaryNeed[];
  meta: PaginationMeta;
}

export interface DietaryNeedListResult {
  data: DietaryNeed[];
  meta: PaginationMeta;
}

export interface DietaryNeedCreateInput {
  name: string;
}

export interface DietaryNeedUpdateInput {
  name: string;
  isActive: boolean;
}

// Get all dietary needs with pagination (including inactive)
export const getAllDietaryNeeds = async (params: PaginationParams): Promise<DietaryNeedListResult> => {
  const response = await apiClient.get<DietaryNeedResponse>("/dietary-needs/all", {
    params: { page: params.page, limit: params.limit },
  });
  return { data: response.data.data, meta: response.data.meta };
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
