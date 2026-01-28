import apiClient from "@/lib/api-client";
import { uploadFile } from "@/lib/upload-utils";
import { Review, ReviewResponse, SingleReviewResponse, ReviewCreateInput, ReviewUpdateInput } from "@/types/review";

export const getReviews = async (): Promise<Review[]> => {
  const response = await apiClient.get<ReviewResponse>("/reviews/admin");
  return response.data.data;
};

export const getReview = async (id: string): Promise<Review> => {
  const response = await apiClient.get<SingleReviewResponse>(`/reviews/${id}`);
  return response.data.data;
};

export const createReview = async (data: ReviewCreateInput): Promise<Review> => {
  let avatarUrl = "";
  if (data.avatar instanceof File) {
    avatarUrl = await uploadFile(data.avatar, "reviews/avatars");
  } else if (typeof data.avatar === "string") {
    avatarUrl = data.avatar;
  }

  const response = await apiClient.post<SingleReviewResponse>("/reviews", {
    ...data,
    avatar: avatarUrl,
  });
  return response.data.data;
};

export const updateReview = async (id: string, data: ReviewUpdateInput): Promise<Review> => {
  let avatarUrl = data.avatar;
  if (data.avatar instanceof File) {
    avatarUrl = await uploadFile(data.avatar, "reviews/avatars");
  }

  const response = await apiClient.patch<SingleReviewResponse>(`/reviews/${id}`, {
    ...data,
    avatar: avatarUrl,
  });
  return response.data.data;
};

export const deleteReview = async (id: string): Promise<Review> => {
  const response = await apiClient.delete<SingleReviewResponse>(`/reviews/${id}`);
  return response.data.data;
};

export const toggleReviewStatus = async (id: string): Promise<Review> => {
  const response = await apiClient.patch<SingleReviewResponse>(`/reviews/${id}/toggle-status`);
  return response.data.data;
};
