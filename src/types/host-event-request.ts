export type HostEventRequestStatus = "PENDING" | "APPROVED" | "DECLINED" | "COMPLETED" | "CANCELLED";

// Document attached to an approved event request
export interface EventRequestDocument {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

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
  eventInstructions?: string;
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
  documents?: EventRequestDocument[];
  // Current step in event creation process (1-5)
  currentStep?: number;
  // Attachments (Step 3)
  foodMenuUrls?: string[];
  drinkMenuUrls?: string[];
  additionalDocumentUrls?: string[];
  // RSVP Settings (Step 4)
  submissionDeadlineDate?: string;
  submissionDeadlineTime?: string;
  automatedReminders?: boolean;
  reminder48Hours?: boolean;
  reminder5Days?: boolean;
  reminder12to24Hours?: boolean;
  send48HoursBeforeEvent?: boolean;
  // Guests (references to RSVPs)
  guests?: string[];
  createdAt: string;
  updatedAt: string;
}
