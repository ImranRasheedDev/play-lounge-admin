export interface PageHero {
  title: string;
  backgroundImage: string;
}

export interface SectionHeader {
  heading: string;
  subheading: string;
  icon: string;
}

export interface HeroBanner {
  heading: string;
  backgroundImage: string;
  backgroundVideo: string;
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

export interface HomepageContent {
  heroBanner: HeroBanner;
  categorySection: SectionHeader;
  trendingSection: SectionHeader;
  featuredVenue: FeaturedVenue;
  featuresSection: FeaturesSection;
  testimonialsSection: SectionHeader;
  expertSection: ExpertSection;
}

export interface FeatureSectionBlock {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  image: string;
  reversed: boolean;
  bgColor: string;
}

export interface IndividualsCta {
  title: string;
  bullets: string[];
  leftBackgroundImage: string;
  rightImage: string;
}

export interface MarketingPageContent {
  hero: PageHero;
  sections: FeatureSectionBlock[];
  cta: IndividualsCta;
}

export interface ContactPageContent {
  hero: PageHero;
  sectionTitle: string;
  sectionImage: string;
}

export interface PartnerWithUsPageContent {
  hero: PageHero;
  title: string;
  description: string;
}

export interface LegalSection {
  title: string;
  content: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalPageContent {
  hero: PageHero;
  sections: LegalSection[];
}

export interface EventConciergeCard {
  title: string;
  subtitle: string;
  description: string;
  linkText: string;
  linkUrl: string;
}

export interface DiscoverPageContent {
  hero: PageHero;
  conciergeCard: EventConciergeCard;
}

export interface EventConciergeSlide {
  image: string;
  alt: string;
  description: string;
  address: string;
  name: string;
  userImage: string;
}

export interface EventConciergeContent {
  slides: EventConciergeSlide[];
}

export interface SiteSettings {
  id: string;
  homepage: HomepageContent;
  aboutUs: MarketingPageContent;
  howItsWork: MarketingPageContent;
  forCorporates: MarketingPageContent;
  forIndividuals: MarketingPageContent;
  contactUs: ContactPageContent;
  partnerWithUs: PartnerWithUsPageContent;
  privacyPolicy: LegalPageContent;
  termsConditions: LegalPageContent;
  cookiePolicy: LegalPageContent;
  discover: DiscoverPageContent;
  eventConcierge: EventConciergeContent;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettingsResponse {
  status: boolean;
  message: string;
  data: SiteSettings;
}
