/* eslint-disable max-lines -- Venue service requires extensive API methods */
import apiClient from "@/lib/api-client";
import { uploadFile } from "@/lib/upload-utils";
import { PaginationParams, PaginationMeta } from "@/types/pagination";
import { Venue } from "@/types/venue";

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface OpenHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface Experience {
  image: File | string;
  heading: string;
  subHeading: string;
  description: string;
}

export interface TagWithImages {
  name: string;
  images: (File | string)[];
}

export interface VenueResponse {
  status: boolean;
  message: string;
  data: Venue[];
  meta: PaginationMeta;
}

export interface VenueListResult {
  data: Venue[];
  meta: PaginationMeta;
}

export interface VenueCreateInput {
  name: string;
  categoryId: string | string[];
  venueTypeId: string;
  address: string;
  contactNumber?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  // Address components
  streetNumber?: string;
  route?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  countryCode?: string;
  overview?: string;
  googleReviewsLink?: string;
  venueLink?: string;
  thumbnail: File;
  images: TagWithImages[];
  experiences: Experience[];
  // Highlights
  atmosphere?: string;
  foodOptions?: string;
  dressCode?: string;
  accessibility?: string;
  seated?: string;
  standing?: string;
  openHours?: OpenHours;
  isSponsored?: boolean;
  isTrending?: boolean;
  // Video
  video?: File;
  videoUrl?: string;
}

export interface VenueUpdateInput {
  name: string;
  categoryId: string | string[];
  venueTypeId: string;
  address: string;
  contactNumber?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  // Address components
  streetNumber?: string;
  route?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  countryCode?: string;
  overview?: string;
  googleReviewsLink?: string;
  venueLink?: string;
  thumbnail?: File;
  existingThumbnail?: string;
  images: TagWithImages[];
  existingImages?: TagWithImages[];
  experiences: Experience[];
  existingExperiences?: string[];
  // Highlights
  atmosphere?: string;
  foodOptions?: string;
  dressCode?: string;
  accessibility?: string;
  seated?: string;
  standing?: string;
  openHours?: OpenHours;
  isActive: boolean;
  isSponsored?: boolean;
  isTrending?: boolean;
  // Video
  video?: File;
  videoUrl?: string;
  existingVideoUrl?: string;
}

// Get all venues with pagination
export const getVenues = async (params: PaginationParams): Promise<VenueListResult> => {
  const response = await apiClient.get<VenueResponse>("/venues/all", {
    params: { page: params.page, limit: params.limit },
  });
  return { data: response.data.data, meta: response.data.meta };
};

// Create a new venue

export const createVenue = async (data: VenueCreateInput): Promise<Venue> => {
  // Upload thumbnail to S3
  const thumbnailUrl = await uploadFile(data.thumbnail, "venues/thumbnails");

  // Upload tag images to S3
  const uploadedImages = await Promise.all(
    data.images.map(async (tagWithImages) => {
      const uploadedTagImages = await Promise.all(
        tagWithImages.images.map(async (img) => {
          if (img instanceof File) {
            return await uploadFile(img, "venues/images");
          }
          return img; // Already a URL string
        }),
      );
      return {
        name: tagWithImages.name,
        images: uploadedTagImages,
      };
    }),
  );

  // Upload experience images to S3
  const uploadedExperiences = await Promise.all(
    data.experiences.map(async (exp) => {
      let imageUrl = exp.image;
      if (exp.image instanceof File) {
        imageUrl = await uploadFile(exp.image, "venues/experiences");
      }
      return {
        heading: exp.heading,
        subHeading: exp.subHeading,
        description: exp.description,
        image: imageUrl,
      };
    }),
  );

  // Upload video to S3 if provided as file, otherwise use the URL
  let videoUrl = data.videoUrl ?? "";
  if (data.video instanceof File) {
    videoUrl = await uploadFile(data.video, "venues/videos");
  }

  // Send data as JSON to backend
  const payload = {
    name: data.name,
    categoryId: data.categoryId,
    venueTypeId: data.venueTypeId,
    address: data.address,
    contactNumber: data.contactNumber,
    placeId: data.placeId,
    latitude: data.latitude,
    longitude: data.longitude,
    streetNumber: data.streetNumber,
    route: data.route,
    city: data.city,
    state: data.state,
    country: data.country,
    postalCode: data.postalCode,
    countryCode: data.countryCode,
    overview: data.overview,
    googleReviewsLink: data.googleReviewsLink,
    venueLink: data.venueLink,
    thumbnail: thumbnailUrl,
    images: uploadedImages,
    experiences: uploadedExperiences,
    atmosphere: data.atmosphere,
    foodOptions: data.foodOptions,
    dressCode: data.dressCode,
    accessibility: data.accessibility,
    seated: data.seated,
    standing: data.standing,
    openHours: data.openHours,
    isSponsored: data.isSponsored,
    isTrending: data.isTrending,
    videoUrl: videoUrl || undefined,
  };

  const response = await apiClient.post<{ data: Venue }>("/venues", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data.data;
};

// Update an existing venue
// eslint-disable-next-line complexity -- Complex function handling multiple file uploads
export const updateVenue = async (id: string, data: VenueUpdateInput): Promise<Venue> => {
  // Upload thumbnail to S3 if new file provided
  let thumbnailUrl = data.existingThumbnail;
  if (data.thumbnail instanceof File) {
    thumbnailUrl = await uploadFile(data.thumbnail, "venues/thumbnails");
  }

  // Upload tag images to S3 (only new files)
  const uploadedImages = data.images
    ? await Promise.all(
        data.images.map(async (tagWithImages) => {
          const uploadedTagImages = await Promise.all(
            tagWithImages.images.map(async (img) => {
              if (img instanceof File) {
                return await uploadFile(img, "venues/images");
              }
              return img; // Already a URL string
            }),
          );
          return {
            name: tagWithImages.name,
            images: uploadedTagImages,
          };
        }),
      )
    : undefined;

  // Upload experience images to S3 (only new files)
  const uploadedExperiences = data.experiences
    ? await Promise.all(
        data.experiences.map(async (exp) => {
          let imageUrl: string;
          if (exp.image instanceof File) {
            imageUrl = await uploadFile(exp.image, "venues/experiences");
          } else {
            imageUrl = exp.image;
          }
          return {
            heading: exp.heading,
            subHeading: exp.subHeading,
            description: exp.description,
            image: imageUrl,
          };
        }),
      )
    : undefined;

  // Upload video to S3 if new file provided, otherwise use existing or new URL
  let videoUrl = data.existingVideoUrl ?? data.videoUrl ?? "";
  if (data.video instanceof File) {
    videoUrl = await uploadFile(data.video, "venues/videos");
  } else if (data.videoUrl) {
    videoUrl = data.videoUrl;
  }

  // Prepare payload
  const payload: {
    name: string;
    categoryId: string | string[];
    venueTypeId: string;
    address: string;
    isActive: boolean;
    contactNumber?: string;
    placeId?: string;
    latitude?: number;
    longitude?: number;
    overview?: string;
    googleReviewsLink?: string;
    venueLink?: string;
    streetNumber?: string;
    route?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    countryCode?: string;
    thumbnail?: string;
    images?: Array<{ name: string; images: string[] }>;
    existingImages?: Array<{ name: string; images: string[] }>;
    experiences?: Array<{ heading: string; subHeading: string; description: string; image: string }>;
    existingExperiences?: string[];
    atmosphere?: string;
    foodOptions?: string;
    dressCode?: string;
    accessibility?: string;
    seated?: string;
    standing?: string;
    openHours?: OpenHours;
    isSponsored?: boolean;
    isTrending?: boolean;
    videoUrl?: string;
  } = {
    name: data.name,
    categoryId: data.categoryId,
    venueTypeId: data.venueTypeId,
    address: data.address,
    isActive: data.isActive,
    contactNumber: data.contactNumber,
    placeId: data.placeId,
    latitude: data.latitude,
    longitude: data.longitude,
    overview: data.overview,
    googleReviewsLink: data.googleReviewsLink,
    venueLink: data.venueLink,
    streetNumber: data.streetNumber,
    route: data.route,
    city: data.city,
    state: data.state,
    country: data.country,
    postalCode: data.postalCode,
    countryCode: data.countryCode,
    atmosphere: data.atmosphere,
    foodOptions: data.foodOptions,
    dressCode: data.dressCode,
    accessibility: data.accessibility,
    seated: data.seated,
    standing: data.standing,
    openHours: data.openHours,
    isSponsored: data.isSponsored,
    isTrending: data.isTrending,
  };

  if (thumbnailUrl) {
    payload.thumbnail = thumbnailUrl;
  }

  if (uploadedImages) {
    payload.images = uploadedImages;
  }

  if (data.existingImages) {
    payload.existingImages = data.existingImages.map((tagWithImages) => ({
      name: tagWithImages.name,
      images: tagWithImages.images.filter((img): img is string => typeof img === "string"),
    }));
  }

  if (uploadedExperiences) {
    payload.experiences = uploadedExperiences;
  }

  if (data.existingExperiences) {
    payload.existingExperiences = data.existingExperiences;
  }

  if (videoUrl) {
    payload.videoUrl = videoUrl;
  }

  const response = await apiClient.patch<{ data: Venue }>(`/venues/${id}`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data.data;
};

// Delete a venue
export const deleteVenue = async (id: string): Promise<void> => {
  await apiClient.delete(`/venues/${id}`);
};
