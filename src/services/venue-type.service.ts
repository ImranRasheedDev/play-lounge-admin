import apiClient from "@/lib/api-client";
import { VenueType } from "@/types/venue-type";

export interface VenueTypeResponse {
  status: boolean;
  message: string;
  data: VenueType[];
}

export interface VenueTypeCreateInput {
  name: string;
}

export interface VenueTypeUpdateInput {
  name: string;
  isActive: boolean;
}

// Get all venue types
export const getVenueTypes = async (): Promise<VenueType[]> => {
  const response = await apiClient.get<VenueTypeResponse>("/venue-types/all");
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
