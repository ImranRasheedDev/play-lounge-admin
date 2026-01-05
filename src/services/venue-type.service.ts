import apiClient from "@/lib/api-client";
import { PaginationParams, PaginationMeta } from "@/types/pagination";
import { VenueType } from "@/types/venue-type";

export interface VenueTypeResponse {
  status: boolean;
  message: string;
  data: VenueType[];
  meta: PaginationMeta;
}

export interface VenueTypeListResult {
  data: VenueType[];
  meta: PaginationMeta;
}

export interface VenueTypeCreateInput {
  name: string;
}

export interface VenueTypeUpdateInput {
  name: string;
  isActive: boolean;
}

// Get all venue types with pagination (including inactive)
export const getAllVenueTypes = async (params: PaginationParams): Promise<VenueTypeListResult> => {
  const response = await apiClient.get<VenueTypeResponse>("/venue-types/all", {
    params: { page: params.page, limit: params.limit },
  });
  return { data: response.data.data, meta: response.data.meta };
};

// Get active venue types only
export const getActiveVenueTypes = async (): Promise<VenueType[]> => {
  const response = await apiClient.get<VenueTypeResponse>("/venue-types");
  return response.data.data;
};

// Create a new venue type
export const createVenueType = async (data: VenueTypeCreateInput): Promise<VenueType> => {
  const response = await apiClient.post<{ data: VenueType }>("/venue-types", data);
  return response.data.data;
};

// Update an existing venue type
export const updateVenueType = async (id: string, data: VenueTypeUpdateInput): Promise<VenueType> => {
  const response = await apiClient.patch<{ data: VenueType }>(`/venue-types/${id}`, data);
  return response.data.data;
};

// Delete a venue type
export const deleteVenueType = async (id: string): Promise<void> => {
  await apiClient.delete(`/venue-types/${id}`);
};
