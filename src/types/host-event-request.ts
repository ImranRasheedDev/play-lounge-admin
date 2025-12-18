export type HostEventRequestStatus = "PENDING" | "APPROVED" | "DECLINED" | "COMPLETED" | "CANCELLED";

export interface HostEventRequest {
  id: string;
  userId?:
    | {
        id: string;
        name: string;
        email: string;
        isEmailVerified: boolean;
      }
    | string
    | null;
  venueId?:
    | {
        id: string;
        name: string;
      }
    | string
    | null;
  // Contact Details
  name: string;
  email: string;
  phone?: string;
  // Event Name (optional)
  eventName?: string;
  // Event Details
  numberOfGuests: number;
  date: string;
  startTime: string;
  endTime: string;
  guestArrivalTime?: string;
  eventDescription?: string;
  eventType?: string;
  eventStyle?: string;
  maxBudget?: string;
  message?: string;
  banner?: string;
  status: HostEventRequestStatus;
  isDraft: boolean;
  flexibleDates: boolean;
  agreeTerms: boolean;
  agreeOffers: boolean;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
