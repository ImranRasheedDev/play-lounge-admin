export type EventQueryStatus = "PENDING" | "COMPLETED";

export interface EventQuery {
  id: string;
  eventType: string;
  area: string;
  numberOfPeople: string;
  estimatedSpend: string;
  venueLayout: string;
  venueStyle: string;
  message: string;
  eventDate: string;
  timeRange: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: EventQueryStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}
