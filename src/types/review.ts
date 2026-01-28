export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  status: boolean;
  message: string;
  data: Review[];
}

export interface SingleReviewResponse {
  status: boolean;
  message: string;
  data: Review;
}

export interface ReviewCreateInput {
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar?: File | string;
  isActive?: boolean;
}

export type ReviewUpdateInput = Partial<ReviewCreateInput>;
