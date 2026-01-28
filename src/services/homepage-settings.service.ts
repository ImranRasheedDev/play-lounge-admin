import apiClient from "@/lib/api-client";
import { uploadFile } from "@/lib/upload-utils";
import { HomepageSettings, HomepageSettingsResponse, FeatureCard } from "@/types/homepage-settings";

export const getHomepageSettings = async (): Promise<HomepageSettings> => {
  const response = await apiClient.get<HomepageSettingsResponse>("/homepage-settings");
  return response.data.data;
};

export interface UpdateHomepageSettingsInput {
  heroBanner?: {
    heading?: string;
    backgroundImage?: File | string;
    backgroundVideo?: File | string;
  };
  categorySection?: {
    heading?: string;
    subheading?: string;
    icon?: File | string;
  };
  trendingSection?: {
    heading?: string;
    subheading?: string;
    icon?: File | string;
  };
  featuredVenue?: {
    venueId?: string | null;
    heading?: string;
    subheading?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  featuresSection?: {
    cards?: Array<{
      heading?: string;
      subheading?: string;
      description?: string;
      icon?: File | string;
      backgroundImage?: File | string;
    }>;
  };
  testimonialsSection?: {
    heading?: string;
    subheading?: string;
    icon?: File | string;
  };
  expertSection?: {
    heading?: string;
    subheading?: string;
    description?: string;
    icon?: File | string;
    image?: File | string;
    buttonText?: string;
    buttonUrl?: string;
  };
}

/* eslint-disable complexity */
export const updateHomepageSettings = async (data: UpdateHomepageSettingsInput): Promise<HomepageSettings> => {
  const payload: Record<string, unknown> = {};

  // Handle heroBanner
  if (data.heroBanner) {
    const heroBanner: Record<string, string> = {};
    if (data.heroBanner.heading !== undefined) {
      heroBanner.heading = data.heroBanner.heading;
    }
    if (data.heroBanner.backgroundImage instanceof File) {
      heroBanner.backgroundImage = await uploadFile(data.heroBanner.backgroundImage, "homepage/hero");
    } else if (typeof data.heroBanner.backgroundImage === "string") {
      heroBanner.backgroundImage = data.heroBanner.backgroundImage;
    }
    if (data.heroBanner.backgroundVideo instanceof File) {
      heroBanner.backgroundVideo = await uploadFile(data.heroBanner.backgroundVideo, "homepage/hero");
    } else if (typeof data.heroBanner.backgroundVideo === "string") {
      heroBanner.backgroundVideo = data.heroBanner.backgroundVideo;
    }
    if (Object.keys(heroBanner).length > 0) {
      payload.heroBanner = heroBanner;
    }
  }

  // Handle categorySection
  if (data.categorySection) {
    const section: Record<string, string> = {};
    if (data.categorySection.heading !== undefined) {
      section.heading = data.categorySection.heading;
    }
    if (data.categorySection.subheading !== undefined) {
      section.subheading = data.categorySection.subheading;
    }
    if (data.categorySection.icon instanceof File) {
      section.icon = await uploadFile(data.categorySection.icon, "homepage/icons");
    } else if (typeof data.categorySection.icon === "string") {
      section.icon = data.categorySection.icon;
    }
    if (Object.keys(section).length > 0) {
      payload.categorySection = section;
    }
  }

  // Handle trendingSection
  if (data.trendingSection) {
    const section: Record<string, string> = {};
    if (data.trendingSection.heading !== undefined) {
      section.heading = data.trendingSection.heading;
    }
    if (data.trendingSection.subheading !== undefined) {
      section.subheading = data.trendingSection.subheading;
    }
    if (data.trendingSection.icon instanceof File) {
      section.icon = await uploadFile(data.trendingSection.icon, "homepage/icons");
    } else if (typeof data.trendingSection.icon === "string") {
      section.icon = data.trendingSection.icon;
    }
    if (Object.keys(section).length > 0) {
      payload.trendingSection = section;
    }
  }

  // Handle featuredVenue
  if (data.featuredVenue) {
    payload.featuredVenue = { ...data.featuredVenue };
  }

  // Handle featuresSection
  if (data.featuresSection?.cards) {
    const cards: FeatureCard[] = [];
    for (const card of data.featuresSection.cards) {
      const processedCard: FeatureCard = {
        heading: card.heading ?? "",
        subheading: card.subheading ?? "",
        description: card.description ?? "",
        icon: card.icon instanceof File ? await uploadFile(card.icon, "homepage/features") : (card.icon ?? ""),
        backgroundImage:
          card.backgroundImage instanceof File
            ? await uploadFile(card.backgroundImage, "homepage/features")
            : (card.backgroundImage ?? ""),
      };
      cards.push(processedCard);
    }
    payload.featuresSection = { cards };
  }

  // Handle testimonialsSection
  if (data.testimonialsSection) {
    const section: Record<string, string> = {};
    if (data.testimonialsSection.heading !== undefined) {
      section.heading = data.testimonialsSection.heading;
    }
    if (data.testimonialsSection.subheading !== undefined) {
      section.subheading = data.testimonialsSection.subheading;
    }
    if (data.testimonialsSection.icon instanceof File) {
      section.icon = await uploadFile(data.testimonialsSection.icon, "homepage/icons");
    } else if (typeof data.testimonialsSection.icon === "string") {
      section.icon = data.testimonialsSection.icon;
    }
    if (Object.keys(section).length > 0) {
      payload.testimonialsSection = section;
    }
  }

  // Handle expertSection
  if (data.expertSection) {
    const section: Record<string, string> = {};
    if (data.expertSection.heading !== undefined) {
      section.heading = data.expertSection.heading;
    }
    if (data.expertSection.subheading !== undefined) {
      section.subheading = data.expertSection.subheading;
    }
    if (data.expertSection.description !== undefined) {
      section.description = data.expertSection.description;
    }
    if (data.expertSection.buttonText !== undefined) {
      section.buttonText = data.expertSection.buttonText;
    }
    if (data.expertSection.buttonUrl !== undefined) {
      section.buttonUrl = data.expertSection.buttonUrl;
    }
    if (data.expertSection.icon instanceof File) {
      section.icon = await uploadFile(data.expertSection.icon, "homepage/icons");
    } else if (typeof data.expertSection.icon === "string") {
      section.icon = data.expertSection.icon;
    }
    if (data.expertSection.image instanceof File) {
      section.image = await uploadFile(data.expertSection.image, "homepage/expert");
    } else if (typeof data.expertSection.image === "string") {
      section.image = data.expertSection.image;
    }
    if (Object.keys(section).length > 0) {
      payload.expertSection = section;
    }
  }

  const response = await apiClient.put<HomepageSettingsResponse>("/homepage-settings", payload);
  return response.data.data;
};
/* eslint-enable complexity */
