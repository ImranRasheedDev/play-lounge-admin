import apiClient from "@/lib/api-client";
import { PaginationMeta, PaginationParams } from "@/types/pagination";
import { Rsvp, RsvpCreateInput, RsvpUpdateInput } from "@/types/rsvp";

export interface RsvpListResponse {
  status: boolean;
  message: string;
  data: Rsvp[];
  meta: PaginationMeta;
}

export interface RsvpListResult {
  data: Rsvp[];
  meta: PaginationMeta;
}

export interface RsvpSingleResponse {
  status: boolean;
  message: string;
  data: Rsvp;
}

export interface RsvpArrayResponse {
  status: boolean;
  message: string;
  data: Rsvp[];
}

// Get all RSVPs with pagination (admin)
export const getRsvps = async (params: PaginationParams): Promise<RsvpListResult> => {
  const response = await apiClient.get<RsvpListResponse>("/rsvps/admin", {
    params: { page: params.page, limit: params.limit },
  });
  return { data: response.data.data, meta: response.data.meta };
};

// Get RSVPs by event ID (admin)
export const getRsvpsByEvent = async (eventId: string): Promise<Rsvp[]> => {
  const response = await apiClient.get<RsvpArrayResponse>(`/rsvps/admin/event/${eventId}`);
  return response.data.data;
};

// Get RSVPs by user ID (admin)
export const getRsvpsByUser = async (userId: string): Promise<Rsvp[]> => {
  const response = await apiClient.get<RsvpArrayResponse>(`/rsvps/admin/user/${userId}`);
  return response.data.data;
};

// Get single RSVP by ID (admin)
export const getRsvp = async (id: string): Promise<Rsvp> => {
  const response = await apiClient.get<RsvpSingleResponse>(`/rsvps/admin/${id}`);
  return response.data.data;
};

// Update RSVP (admin)
export const updateRsvp = async (id: string, data: RsvpUpdateInput): Promise<Rsvp> => {
  const response = await apiClient.patch<RsvpSingleResponse>(`/rsvps/admin/${id}`, data);
  return response.data.data;
};

// Delete RSVP (admin)
export const deleteRsvp = async (id: string): Promise<void> => {
  await apiClient.delete(`/rsvps/admin/${id}`);
};

// Create RSVP for a user (admin)
export const createRsvp = async (data: RsvpCreateInput): Promise<Rsvp> => {
  const response = await apiClient.post<RsvpSingleResponse>("/rsvps/admin", data);
  return response.data.data;
};
