export interface DietaryNeedInfo {
  id: string;
  name: string;
}

export interface RsvpUser {
  id: string;
  name: string;
  email: string;
}

export interface RsvpHostEventRequest {
  id: string;
  eventName?: string;
  date?: string;
}

export interface Rsvp {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dietaryNeeds: DietaryNeedInfo[];
  customDietaryNeed?: string;
  hostEventRequestId?: string;
  user?: RsvpUser;
  hostEventRequest?: RsvpHostEventRequest;
  createdAt: string;
  updatedAt: string;
}

export interface RsvpUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  dietaryNeeds?: string[];
  customDietaryNeed?: string;
}

export interface RsvpCreateInput {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dietaryNeeds?: string[];
  customDietaryNeed?: string;
  hostEventRequestId?: string;
}
