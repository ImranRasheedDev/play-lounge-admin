import apiClient from "@/lib/api-client";
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
}

export interface VenueCreateInput {
  name: string;
  categoryId: string;
  venueTypeId: string;
  address: string;
  contactNumber?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  overview?: string;
  googleReviewsLink?: string;
  venueLink?: string;
  thumbnail: File;
  tags: string[];
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
}

export interface VenueUpdateInput {
  name: string;
  categoryId: string;
  venueTypeId: string;
  address: string;
  contactNumber?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  overview?: string;
  googleReviewsLink?: string;
  venueLink?: string;
  thumbnail?: File;
  existingThumbnail?: string;
  tags: string[];
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
}

// Get all venues
export const getVenues = async (): Promise<Venue[]> => {
  const response = await apiClient.get<VenueResponse>("/venues");
  return response.data.data;
};

// Create a new venue
// eslint-disable-next-line complexity
export const createVenue = async (data: VenueCreateInput): Promise<Venue> => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("categoryId", data.categoryId);
  formData.append("venueTypeId", data.venueTypeId);
  formData.append("address", data.address);

  if (data.contactNumber) formData.append("contactNumber", data.contactNumber);
  if (data.placeId) formData.append("placeId", data.placeId);
  if (data.latitude) formData.append("latitude", data.latitude.toString());
  if (data.longitude) formData.append("longitude", data.longitude.toString());
  if (data.overview) formData.append("overview", data.overview);
  if (data.googleReviewsLink) formData.append("googleReviewsLink", data.googleReviewsLink);
  if (data.venueLink) formData.append("venueLink", data.venueLink);

  // Append thumbnail as a file
  formData.append("thumbnail", data.thumbnail);

  // Append venue tags as JSON string
  formData.append("tags", JSON.stringify(data.tags));

  // Append images (tag-wise)
  if (data.images && data.images.length > 0) {
    // Append images with Multer-friendly keys: imageTag_${tagIndex}_${fileIndex}
    // Example: imageTag_0_0, imageTag_0_1, imageTag_1_0, etc.
    data.images.forEach((tagWithImages, tagIndex) => {
      tagWithImages.images.forEach((img, imageIndex) => {
        if (img instanceof File) {
          // Simple key pattern that Multer can easily extract
          formData.append(`imageTag_${tagIndex}_${imageIndex}`, img);
        }
      });
    });

    // Append images data as JSON (with tag names, tag indices, and existing image URLs)
    const imagesData = data.images.map((tagWithImages, tagIndex) => ({
      tagIndex: tagIndex, // Add tagIndex for easy matching
      name: tagWithImages.name,
      images: tagWithImages.images.map((img) => (img instanceof File ? "" : img)),
    }));
    formData.append("images", JSON.stringify(imagesData));
  }

  // Append experiences
  if (data.experiences && data.experiences.length > 0) {
    data.experiences.forEach((exp) => {
      if (exp.image instanceof File) {
        formData.append(`experienceImages`, exp.image);
      }
    });

    // Append experiences data as JSON
    const experiencesData = data.experiences.map((exp) => ({
      heading: exp.heading,
      subHeading: exp.subHeading,
      description: exp.description,
      image: exp.image instanceof File ? "" : exp.image,
    }));
    formData.append("experiences", JSON.stringify(experiencesData));
  }

  // Append highlights
  if (data.atmosphere) formData.append("atmosphere", data.atmosphere);
  if (data.foodOptions) formData.append("foodOptions", data.foodOptions);
  if (data.dressCode) formData.append("dressCode", data.dressCode);
  if (data.accessibility) formData.append("accessibility", data.accessibility);
  if (data.seated) formData.append("seated", data.seated);
  if (data.standing) formData.append("standing", data.standing);

  // Append open hours as JSON
  if (data.openHours) formData.append("openHours", JSON.stringify(data.openHours));

  // Append isSponsored and isTrending
  if (data.isSponsored !== undefined) formData.append("isSponsored", data.isSponsored.toString());
  if (data.isTrending !== undefined) formData.append("isTrending", data.isTrending.toString());

  const response = await apiClient.post<{ data: Venue }>("/venues", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

// Update an existing venue
// eslint-disable-next-line complexity
export const updateVenue = async (id: string, data: VenueUpdateInput): Promise<Venue> => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("categoryId", data.categoryId);
  formData.append("venueTypeId", data.venueTypeId);
  formData.append("address", data.address);
  formData.append("isActive", data.isActive.toString());

  if (data.contactNumber) formData.append("contactNumber", data.contactNumber);
  if (data.placeId) formData.append("placeId", data.placeId);
  if (data.latitude) formData.append("latitude", data.latitude.toString());
  if (data.longitude) formData.append("longitude", data.longitude.toString());
  if (data.overview) formData.append("overview", data.overview);
  if (data.googleReviewsLink) formData.append("googleReviewsLink", data.googleReviewsLink);
  if (data.venueLink) formData.append("venueLink", data.venueLink);

  // Append thumbnail (new file or keep existing)
  if (data.thumbnail) {
    formData.append("thumbnail", data.thumbnail);
  } else if (data.existingThumbnail) {
    formData.append("existingThumbnail", data.existingThumbnail);
  }

  // Append venue tags as JSON string
  formData.append("tags", JSON.stringify(data.tags));

  // Append new images (tag-wise) if any
  if (data.images && data.images.length > 0) {
    // Append images with Multer-friendly keys: imageTag_${tagIndex}_${fileIndex}
    // Example: imageTag_0_0, imageTag_0_1, imageTag_1_0, etc.
    data.images.forEach((tagWithImages, tagIndex) => {
      tagWithImages.images.forEach((img, imageIndex) => {
        if (img instanceof File) {
          // Simple key pattern that Multer can easily extract
          formData.append(`imageTag_${tagIndex}_${imageIndex}`, img);
        }
      });
    });

    // Append images data as JSON (with tag names, tag indices, and existing image URLs)
    const imagesData = data.images.map((tagWithImages, tagIndex) => ({
      tagIndex: tagIndex, // Add tagIndex for easy matching
      name: tagWithImages.name,
      images: tagWithImages.images.map((img) => (img instanceof File ? "" : img)),
    }));
    formData.append("images", JSON.stringify(imagesData));
  }

  // Append existing images to preserve them
  if (data.existingImages) {
    const existingImagesData = data.existingImages.map((tagWithImages) => ({
      name: tagWithImages.name,
      images: tagWithImages.images.map((img) => (typeof img === "string" ? img : "")),
    }));
    formData.append("existingImages", JSON.stringify(existingImagesData));
  }

  // Append experiences
  if (data.experiences && data.experiences.length > 0) {
    data.experiences.forEach((exp) => {
      if (exp.image instanceof File) {
        formData.append(`experienceImages`, exp.image);
      }
    });

    // Append experiences data as JSON
    const experiencesData = data.experiences.map((exp) => ({
      heading: exp.heading,
      subHeading: exp.subHeading,
      description: exp.description,
      image: exp.image instanceof File ? "" : exp.image,
    }));
    formData.append("experiences", JSON.stringify(experiencesData));
  }

  // Append existing experiences to preserve them
  if (data.existingExperiences) {
    formData.append("existingExperiences", JSON.stringify(data.existingExperiences));
  }

  // Append highlights
  if (data.atmosphere) formData.append("atmosphere", data.atmosphere);
  if (data.foodOptions) formData.append("foodOptions", data.foodOptions);
  if (data.dressCode) formData.append("dressCode", data.dressCode);
  if (data.accessibility) formData.append("accessibility", data.accessibility);
  if (data.seated) formData.append("seated", data.seated);
  if (data.standing) formData.append("standing", data.standing);

  // Append open hours as JSON
  if (data.openHours) formData.append("openHours", JSON.stringify(data.openHours));

  // Append isSponsored and isTrending
  if (data.isSponsored !== undefined) formData.append("isSponsored", data.isSponsored.toString());
  if (data.isTrending !== undefined) formData.append("isTrending", data.isTrending.toString());

  const response = await apiClient.patch<{ data: Venue }>(`/venues/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

// Delete a venue
export const deleteVenue = async (id: string): Promise<void> => {
  await apiClient.delete(`/venues/${id}`);
};
