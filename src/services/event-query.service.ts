import apiClient from "@/lib/api-client";
import { EventQuery, EventQueryStatus } from "@/types/event-query";
import { PaginationParams, PaginationMeta } from "@/types/pagination";

export interface EventQueryResponse {
  status: boolean;
  message: string;
  data: EventQuery[];
  meta: PaginationMeta;
}

export interface EventQueryListResult {
  data: EventQuery[];
  meta: PaginationMeta;
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

// Get all event queries with pagination
export const getEventQueries = async (params: PaginationParams): Promise<EventQueryListResult> => {
  const response = await apiClient.get<EventQueryResponse>("/event-queries", {
    params: { page: params.page, limit: params.limit },
  });
  return { data: response.data.data, meta: response.data.meta };
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

// Convert to event input type
export interface ConvertToEventInput {
  eventQueryId: string;
  eventName?: string;
  numberOfGuests: number;
  date: string;
  startTime: string;
  endTime: string;
  eventType?: string;
  eventStyle?: string;
  maxBudget?: string;
  message?: string;
  venueId: string;
  flexibleDates?: boolean;
}

// Convert event query to host event request
export const convertToEvent = async (
  data: ConvertToEventInput,
): Promise<{ eventQuery: EventQuery; hostEventRequest: unknown }> => {
  const response = await apiClient.post<{
    status: boolean;
    message: string;
    data: { eventQuery: EventQuery; hostEventRequest: unknown };
  }>("/event-queries/convert-to-event", data);
  return response.data.data;
};
