import apiClient from "@/lib/api-client";
import { EventQuery, EventQueryStatus } from "@/types/event-query";

export interface EventQueryResponse {
  status: boolean;
  message: string;
  data: EventQuery[];
}

export interface EventQuerySingleResponse {
  status: boolean;
  message: string;
  data: EventQuery;
}

export interface EventQueryUpdateInput {
  status?: EventQueryStatus;
  adminNotes?: string;
}

// Get all event queries
export const getEventQueries = async (): Promise<EventQuery[]> => {
  const response = await apiClient.get<EventQueryResponse>("/event-queries");
  return response.data.data;
};

// Get a single event query by ID
export const getEventQuery = async (id: string): Promise<EventQuery> => {
  const response = await apiClient.get<EventQuerySingleResponse>(`/event-queries/${id}`);
  return response.data.data;
};

// Update an event query
export const updateEventQuery = async (id: string, data: EventQueryUpdateInput): Promise<EventQuery> => {
  const response = await apiClient.patch<EventQuerySingleResponse>(`/event-queries/${id}`, data);
  return response.data.data;
};

// Delete an event query
export const deleteEventQuery = async (id: string): Promise<void> => {
  await apiClient.delete(`/event-queries/${id}`);
};
