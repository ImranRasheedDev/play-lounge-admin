import apiClient from "@/lib/api-client";
import { EventRequestDocument, HostEventRequest, HostEventRequestStatus } from "@/types/host-event-request";
import { PaginationParams, PaginationMeta } from "@/types/pagination";

export interface HostEventRequestResponse {
  status: boolean;
  message: string;
  data: HostEventRequest[];
  meta: PaginationMeta;
}

export interface HostEventRequestListResult {
  data: HostEventRequest[];
  meta: PaginationMeta;
}

export interface HostEventRequestSingleResponse {
  status: boolean;
  message: string;
  data: HostEventRequest;
}

export interface HostEventRequestUpdateInput {
  status?: HostEventRequestStatus;
  adminNotes?: string;
  documents?: EventRequestDocument[];
}

// Get all host event requests with pagination
export const getHostEventRequests = async (params: PaginationParams): Promise<HostEventRequestListResult> => {
  const response = await apiClient.get<HostEventRequestResponse>("/host-event-requests", {
    params: { page: params.page, limit: params.limit },
  });
  return { data: response.data.data, meta: response.data.meta };
};

// Get a single host event request by ID
export const getHostEventRequest = async (id: string): Promise<HostEventRequest> => {
  const response = await apiClient.get<HostEventRequestSingleResponse>(`/host-event-requests/${id}`);
  return response.data.data;
};

// Update a host event request
export const updateHostEventRequest = async (
  id: string,
  data: HostEventRequestUpdateInput,
): Promise<HostEventRequest> => {
  const response = await apiClient.patch<HostEventRequestSingleResponse>(`/host-event-requests/${id}`, data);
  return response.data.data;
};

// Delete a host event request
export const deleteHostEventRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/host-event-requests/${id}`);
};
