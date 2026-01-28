export interface HeroBanner {
  heading: string;
  backgroundImage: string;
  backgroundVideo: string;
}

export interface SectionHeader {
  heading: string;
  subheading: string;
  icon: string;
}

export interface FeaturedVenueInfo {
  id: string;
  name: string;
  thumbnail: string;
  videoUrl: string;
  address: string;
  city: string;
}

export interface FeaturedVenue {
  venueId: string | null;
  venue: FeaturedVenueInfo | null;
  heading: string;
  subheading: string;
  buttonText: string;
  buttonUrl: string;
}

export interface FeatureCard {
  heading: string;
  subheading: string;
  description: string;
  icon: string;
  backgroundImage: string;
}

export interface FeaturesSection {
  cards: FeatureCard[];
}

export interface ExpertSection {
  heading: string;
  subheading: string;
  description: string;
  icon: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
}

export interface HomepageSettings {
  id: string;
  heroBanner: HeroBanner;
  categorySection: SectionHeader;
  trendingSection: SectionHeader;
  featuredVenue: FeaturedVenue;
  featuresSection: FeaturesSection;
  testimonialsSection: SectionHeader;
  expertSection: ExpertSection;
}

export interface HomepageSettingsResponse {
  status: boolean;
  message: string;
  data: HomepageSettings;
}
