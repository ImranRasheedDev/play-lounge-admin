/* eslint-disable max-lines */
/* eslint-disable complexity */
"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import {
  Building2,
  FileText,
  Globe,
  Home,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/use-site-settings";
import { useVenues } from "@/hooks/use-venues";
import { cn } from "@/lib/utils";

interface FeatureSectionForm {
  icon: File | string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  image: File | string;
  reversed: boolean;
}

interface MarketingPageForm {
  hero: {
    title: string;
    backgroundImage: File | string;
  };
  sections: FeatureSectionForm[];
  cta: {
    title: string;
    bulletsText: string;
    leftBackgroundImage: File | string;
    rightImage: File | string;
  };
}

interface ContactPageForm {
  hero: {
    title: string;
    backgroundImage: File | string;
  };
  sectionTitle: string;
  sectionImage: File | string;
}

interface PartnerWithUsPageForm {
  hero: {
    title: string;
    backgroundImage: File | string;
  };
  title: string;
  description: string;
}

interface LegalSectionForm {
  title: string;
  content: string;
}

interface LegalPageForm {
  hero: {
    title: string;
    backgroundImage: File | string;
  };
  sections: LegalSectionForm[];
}

interface EventConciergeSlideForm {
  image: File | string;
  alt: string;
  description: string;
  address: string;
  name: string;
  userImage: File | string;
}

interface HomepageFeatureCardForm {
  heading: string;
  subheading: string;
  description: string;
  icon: File | string;
  backgroundImage: File | string;
}

interface HomepageForm {
  heroBanner: {
    heading: string;
    backgroundImage: File | string;
    backgroundVideo: File | string;
  };
  categorySection: {
    heading: string;
    subheading: string;
    icon: File | string;
  };
  trendingSection: {
    heading: string;
    subheading: string;
    icon: File | string;
  };
  featuredVenue: {
    venueId: string;
    heading: string;
    subheading: string;
    buttonText: string;
    buttonUrl: string;
  };
  featuresSection: {
    cards: HomepageFeatureCardForm[];
  };
  testimonialsSection: {
    heading: string;
    subheading: string;
    icon: File | string;
  };
  expertSection: {
    heading: string;
    subheading: string;
    description: string;
    icon: File | string;
    image: File | string;
    buttonText: string;
    buttonUrl: string;
  };
}

interface FormValues {
  homepage: HomepageForm;
  aboutUs: MarketingPageForm;
  howItsWork: MarketingPageForm;
  forCorporates: MarketingPageForm;
  forIndividuals: MarketingPageForm;
  contactUs: ContactPageForm;
  partnerWithUs: PartnerWithUsPageForm;
  privacyPolicy: LegalPageForm;
  termsConditions: LegalPageForm;
  cookiePolicy: LegalPageForm;
  discover: {
    hero: {
      title: string;
      backgroundImage: File | string;
    };
    conciergeCard: {
      title: string;
      subtitle: string;
      description: string;
      linkText: string;
      linkUrl: string;
    };
  };
  eventConcierge: {
    slides: EventConciergeSlideForm[];
  };
}

const emptySection = (): FeatureSectionForm => ({
  icon: "",
  title: "",
  description: "",
  buttonText: "",
  buttonUrl: "",
  image: "",
  reversed: false,
});

const emptyMarketingPage = (): MarketingPageForm => ({
  hero: { title: "", backgroundImage: "" },
  sections: [emptySection()],
  cta: {
    title: "",
    bulletsText: "",
    leftBackgroundImage: "",
    rightImage: "",
  },
});

const emptyLegalSection = (): LegalSectionForm => ({
  title: "",
  content: "",
});

const emptySlide = (): EventConciergeSlideForm => ({
  image: "",
  alt: "",
  description: "",
  address: "",
  name: "",
  userImage: "",
});

const emptyHomepageCard = (): HomepageFeatureCardForm => ({
  heading: "",
  subheading: "",
  description: "",
  icon: "",
  backgroundImage: "",
});

type TabValue =
  | "homepage"
  | "aboutUs"
  | "howItsWork"
  | "forCorporates"
  | "forIndividuals"
  | "contactUs"
  | "partnerWithUs"
  | "privacyPolicy"
  | "termsConditions"
  | "cookiePolicy"
  | "discover"
  | "eventConcierge";

const tabConfig: { value: TabValue; label: string; icon: React.ElementType; description: string }[] = [
  { value: "homepage", label: "Homepage", icon: Home, description: "Main landing page content" },
  { value: "aboutUs", label: "About Us", icon: Users, description: "Company information" },
  { value: "howItsWork", label: "How It Works", icon: Sparkles, description: "Process explanation" },
  { value: "forCorporates", label: "For Corporates", icon: Building2, description: "B2B content" },
  { value: "forIndividuals", label: "For Individuals", icon: Users, description: "B2C content" },
  { value: "contactUs", label: "Contact Us", icon: Mail, description: "Contact information" },
  { value: "partnerWithUs", label: "Partner With Us", icon: Building2, description: "Partnership page" },
  { value: "privacyPolicy", label: "Privacy Policy", icon: Shield, description: "Privacy terms" },
  { value: "termsConditions", label: "Terms", icon: FileText, description: "Legal terms" },
  { value: "cookiePolicy", label: "Cookie Policy", icon: Shield, description: "Cookie terms" },
  { value: "discover", label: "Discover", icon: MapPin, description: "Discovery page" },
  { value: "eventConcierge", label: "Shared Slider", icon: Globe, description: "Auth + concierge pages slider" },
];

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const legacyLegalToHtml = (paragraphs: string[] = [], bullets: string[] = []) => {
  const paragraphHtml = paragraphs.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  const bulletsHtml = bullets.length
    ? `<ul>${bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
  return `${paragraphHtml}${bulletsHtml}`.trim();
};

export function SiteSettingsForm() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSettings();
  const { data: venuesData } = useVenues();
  const venues = venuesData?.data ?? [];
  const [activeTab, setActiveTab] = useState<TabValue>("homepage");

  const form = useForm<FormValues>({
    defaultValues: {
      homepage: {
        heroBanner: { heading: "", backgroundImage: "", backgroundVideo: "" },
        categorySection: { heading: "", subheading: "", icon: "" },
        trendingSection: { heading: "", subheading: "", icon: "" },
        featuredVenue: {
          venueId: "",
          heading: "",
          subheading: "",
          buttonText: "",
          buttonUrl: "",
        },
        featuresSection: {
          cards: [emptyHomepageCard()],
        },
        testimonialsSection: { heading: "", subheading: "", icon: "" },
        expertSection: {
          heading: "",
          subheading: "",
          description: "",
          icon: "",
          image: "",
          buttonText: "",
          buttonUrl: "",
        },
      },
      aboutUs: emptyMarketingPage(),
      howItsWork: emptyMarketingPage(),
      forCorporates: emptyMarketingPage(),
      forIndividuals: emptyMarketingPage(),
      contactUs: {
        hero: { title: "", backgroundImage: "" },
        sectionTitle: "",
        sectionImage: "",
      },
      partnerWithUs: {
        hero: { title: "", backgroundImage: "" },
        title: "",
        description: "",
      },
      privacyPolicy: {
        hero: { title: "", backgroundImage: "" },
        sections: [emptyLegalSection()],
      },
      termsConditions: {
        hero: { title: "", backgroundImage: "" },
        sections: [emptyLegalSection()],
      },
      cookiePolicy: {
        hero: { title: "", backgroundImage: "" },
        sections: [emptyLegalSection()],
      },
      discover: {
        hero: { title: "", backgroundImage: "" },
        conciergeCard: {
          title: "",
          subtitle: "",
          description: "",
          linkText: "",
          linkUrl: "",
        },
      },
      eventConcierge: {
        slides: [emptySlide()],
      },
    },
  });

  const aboutSections = useFieldArray({ control: form.control, name: "aboutUs.sections" });
  const homepageCards = useFieldArray({ control: form.control, name: "homepage.featuresSection.cards" });
  const howSections = useFieldArray({ control: form.control, name: "howItsWork.sections" });
  const corporateSections = useFieldArray({ control: form.control, name: "forCorporates.sections" });
  const individualSections = useFieldArray({ control: form.control, name: "forIndividuals.sections" });
  const privacySections = useFieldArray({ control: form.control, name: "privacyPolicy.sections" });
  const termsSections = useFieldArray({ control: form.control, name: "termsConditions.sections" });
  const cookieSections = useFieldArray({ control: form.control, name: "cookiePolicy.sections" });
  const eventSlides = useFieldArray({ control: form.control, name: "eventConcierge.slides" });

  useEffect(() => {
    if (!settings) return;

    const data = settings;
    const mapMarketing = (page: typeof data.aboutUs): MarketingPageForm => ({
      hero: {
        title: page.hero?.title ?? "",
        backgroundImage: page.hero?.backgroundImage ?? "",
      },
      sections: page.sections?.map((section) => ({
        icon: section.icon ?? "",
        title: section.title ?? "",
        description: section.description ?? "",
        buttonText: section.buttonText ?? "",
        buttonUrl: section.buttonUrl ?? "",
        image: section.image ?? "",
        reversed: section.reversed ?? false,
      })) ?? [emptySection()],
      cta: {
        title: page.cta?.title ?? "",
        bulletsText: (page.cta?.bullets ?? []).join("\n"),
        leftBackgroundImage: page.cta?.leftBackgroundImage ?? "",
        rightImage: page.cta?.rightImage ?? "",
      },
    });

    const mapLegal = (page: typeof data.privacyPolicy): LegalPageForm => ({
      hero: {
        title: page.hero?.title ?? "",
        backgroundImage: page.hero?.backgroundImage ?? "",
      },
      sections: page.sections?.map((section) => ({
        title: section.title ?? "",
        content: section.content ?? legacyLegalToHtml(section.paragraphs, section.bullets),
      })) ?? [emptyLegalSection()],
    });

    form.reset({
      homepage: {
        heroBanner: {
          heading: data.homepage?.heroBanner?.heading ?? "",
          backgroundImage: data.homepage?.heroBanner?.backgroundImage ?? "",
          backgroundVideo: data.homepage?.heroBanner?.backgroundVideo ?? "",
        },
        categorySection: {
          heading: data.homepage?.categorySection?.heading ?? "",
          subheading: data.homepage?.categorySection?.subheading ?? "",
          icon: data.homepage?.categorySection?.icon ?? "",
        },
        trendingSection: {
          heading: data.homepage?.trendingSection?.heading ?? "",
          subheading: data.homepage?.trendingSection?.subheading ?? "",
          icon: data.homepage?.trendingSection?.icon ?? "",
        },
        featuredVenue: {
          venueId: data.homepage?.featuredVenue?.venueId ?? "",
          heading: data.homepage?.featuredVenue?.heading ?? "",
          subheading: data.homepage?.featuredVenue?.subheading ?? "",
          buttonText: data.homepage?.featuredVenue?.buttonText ?? "",
          buttonUrl: data.homepage?.featuredVenue?.buttonUrl ?? "",
        },
        featuresSection: {
          cards: data.homepage?.featuresSection?.cards?.map((card) => ({
            heading: card.heading ?? "",
            subheading: card.subheading ?? "",
            description: card.description ?? "",
            icon: card.icon ?? "",
            backgroundImage: card.backgroundImage ?? "",
          })) ?? [emptyHomepageCard()],
        },
        testimonialsSection: {
          heading: data.homepage?.testimonialsSection?.heading ?? "",
          subheading: data.homepage?.testimonialsSection?.subheading ?? "",
          icon: data.homepage?.testimonialsSection?.icon ?? "",
        },
        expertSection: {
          heading: data.homepage?.expertSection?.heading ?? "",
          subheading: data.homepage?.expertSection?.subheading ?? "",
          description: data.homepage?.expertSection?.description ?? "",
          icon: data.homepage?.expertSection?.icon ?? "",
          image: data.homepage?.expertSection?.image ?? "",
          buttonText: data.homepage?.expertSection?.buttonText ?? "",
          buttonUrl: data.homepage?.expertSection?.buttonUrl ?? "",
        },
      },
      aboutUs: mapMarketing(data.aboutUs),
      howItsWork: mapMarketing(data.howItsWork),
      forCorporates: mapMarketing(data.forCorporates),
      forIndividuals: mapMarketing(data.forIndividuals),
      contactUs: {
        hero: {
          title: data.contactUs?.hero?.title ?? "",
          backgroundImage: data.contactUs?.hero?.backgroundImage ?? "",
        },
        sectionTitle: data.contactUs?.sectionTitle ?? "",
        sectionImage: data.contactUs?.sectionImage ?? "",
      },
      partnerWithUs: {
        hero: {
          title: data.partnerWithUs?.hero?.title ?? "",
          backgroundImage: data.partnerWithUs?.hero?.backgroundImage ?? "",
        },
        title: data.partnerWithUs?.title ?? "",
        description: data.partnerWithUs?.description ?? "",
      },
      privacyPolicy: mapLegal(data.privacyPolicy),
      termsConditions: mapLegal(data.termsConditions),
      cookiePolicy: mapLegal(data.cookiePolicy),
      discover: {
        hero: {
          title: data.discover?.hero?.title ?? "",
          backgroundImage: data.discover?.hero?.backgroundImage ?? "",
        },
        conciergeCard: {
          title: data.discover?.conciergeCard?.title ?? "",
          subtitle: data.discover?.conciergeCard?.subtitle ?? "",
          description: data.discover?.conciergeCard?.description ?? "",
          linkText: data.discover?.conciergeCard?.linkText ?? "",
          linkUrl: data.discover?.conciergeCard?.linkUrl ?? "",
        },
      },
      eventConcierge: {
        slides: data.eventConcierge?.slides?.map((slide) => ({
          image: slide.image ?? "",
          alt: slide.alt ?? "",
          description: slide.description ?? "",
          address: slide.address ?? "",
          name: slide.name ?? "",
          userImage: slide.userImage ?? "",
        })) ?? [emptySlide()],
      },
    });
  }, [settings, form]);

  const handleFileChange = (fieldPath: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    form.setValue(fieldPath as never, file as never);
  };

  const getPreviewUrl = (value: File | string): string => {
    if (value instanceof File) return URL.createObjectURL(value);
    return value;
  };

  const isVideoValue = (value: File | string): boolean => {
    if (!value) return false;

    if (value instanceof File) {
      return value.type.startsWith("video/");
    }

    const lower = value.toLowerCase();
    return lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".ogg") || lower.includes("video");
  };

  const parseLines = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const onSubmit = (values: FormValues) => {
    const mapMarketing = (page: MarketingPageForm, includeCta: boolean) => ({
      hero: page.hero,
      sections: page.sections.map((section) => ({
        ...section,
        bgColor: section.reversed ? "bg-white" : "bg-primary-1800",
      })),
      ...(includeCta
        ? {
            cta: {
              title: page.cta.title,
              bullets: parseLines(page.cta.bulletsText),
              leftBackgroundImage: page.cta.leftBackgroundImage,
              rightImage: page.cta.rightImage,
            },
          }
        : {}),
    });

    updateMutation.mutate({
      homepage: {
        heroBanner: values.homepage.heroBanner,
        categorySection: values.homepage.categorySection,
        trendingSection: values.homepage.trendingSection,
        featuredVenue: {
          ...values.homepage.featuredVenue,
          venueId: values.homepage.featuredVenue.venueId || null,
        },
        featuresSection: values.homepage.featuresSection,
        testimonialsSection: values.homepage.testimonialsSection,
        expertSection: values.homepage.expertSection,
      },
      aboutUs: mapMarketing(values.aboutUs, false),
      howItsWork: mapMarketing(values.howItsWork, false),
      forCorporates: mapMarketing(values.forCorporates, false),
      forIndividuals: mapMarketing(values.forIndividuals, true),
      contactUs: values.contactUs,
      partnerWithUs: values.partnerWithUs,
      privacyPolicy: {
        hero: values.privacyPolicy.hero,
        sections: values.privacyPolicy.sections.map((section) => ({
          title: section.title,
          content: section.content,
        })),
      },
      termsConditions: {
        hero: values.termsConditions.hero,
        sections: values.termsConditions.sections.map((section) => ({
          title: section.title,
          content: section.content,
        })),
      },
      cookiePolicy: {
        hero: values.cookiePolicy.hero,
        sections: values.cookiePolicy.sections.map((section) => ({
          title: section.title,
          content: section.content,
        })),
      },
      discover: values.discover,
      eventConcierge: values.eventConcierge,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">Loading site settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderImageInput = (label: string, fieldPath: string, value: File | string, description?: string) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && <p className="text-muted-foreground text-xs">{description}</p>}
      <div className="flex items-start gap-4">
        {value ? (
          <div className="group relative">
            {(() => {
              const isIconField = label.toLowerCase().includes("icon") || fieldPath.toLowerCase().includes(".icon");
              const previewSizeClass = isVideoValue(value) ? "h-40 w-64" : isIconField ? "h-16 w-16" : "h-32 w-48";

              return (
                <div
                  className={cn(
                    "relative overflow-hidden rounded-lg border-2 border-dashed transition-colors",
                    "bg-muted/30",
                    previewSizeClass,
                  )}
                >
                  {isVideoValue(value) ? (
                    <video
                      src={getPreviewUrl(value)}
                      className="h-full w-full rounded-lg bg-black object-contain"
                      controls
                      muted
                    />
                  ) : (
                    <Image
                      src={getPreviewUrl(value)}
                      alt={label}
                      fill
                      className="rounded-lg object-cover"
                      unoptimized
                    />
                  )}
                </div>
              );
            })()}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => form.setValue(fieldPath as never, "" as never)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all",
              "bg-muted/30 hover:bg-muted/50 hover:border-primary/50",
              "h-32 w-48 gap-2",
            )}
          >
            <ImageIcon className="text-muted-foreground h-8 w-8" />
            <span className="text-muted-foreground text-xs">Click to upload</span>
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={(event) => handleFileChange(fieldPath, event)}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );

  const renderMarketingPage = (
    title: string,
    path: "aboutUs" | "howItsWork" | "forCorporates" | "forIndividuals",
    sections: ReturnType<typeof useFieldArray<FormValues, `${typeof path}.sections`>>,
    showCta: boolean,
  ) => (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Hero Section
          </CardTitle>
          <CardDescription>Configure the hero banner for this page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Hero Title</Label>
            <Input {...form.register(`${path}.hero.title`)} placeholder="Enter hero title..." />
          </div>
          {renderImageInput(
            "Hero Background Image",
            `${path}.hero.backgroundImage`,
            form.watch(`${path}.hero.backgroundImage`),
            "Recommended size: 1920x1080px",
          )}
        </CardContent>
      </Card>

      {/* Feature Sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Feature Sections
              </CardTitle>
              <CardDescription>Add and manage content sections for this page</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => sections.append(emptySection())}>
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.fields.map((section, index) => (
            <Card key={section.id} className="border-dashed">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Section {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => sections.remove(index)}
                    disabled={sections.fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input {...form.register(`${path}.sections.${index}.title`)} placeholder="Section title..." />
                  </div>
                  <div className="flex items-center gap-3 pt-8">
                    <Switch
                      checked={form.watch(`${path}.sections.${index}.reversed`)}
                      onCheckedChange={(checked) => form.setValue(`${path}.sections.${index}.reversed`, checked)}
                    />
                    <div className="space-y-0.5">
                      <Label>Reverse Layout</Label>
                      <p className="text-muted-foreground text-xs">
                        Normal = <code>bg-primary-1800</code>, Reversed = <code>bg-white</code>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Controller
                    control={form.control}
                    name={`${path}.sections.${index}.description` as const}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Section description..."
                      />
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input {...form.register(`${path}.sections.${index}.buttonText`)} placeholder="Button label..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Button URL</Label>
                    <Input {...form.register(`${path}.sections.${index}.buttonUrl`)} placeholder="https://..." />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {renderImageInput(
                    "Section Icon",
                    `${path}.sections.${index}.icon`,
                    form.watch(`${path}.sections.${index}.icon`),
                    "Upload section icon (small)",
                  )}
                  {renderImageInput(
                    "Section Image",
                    `${path}.sections.${index}.image`,
                    form.watch(`${path}.sections.${index}.image`),
                    "Upload main section image",
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* CTA Section */}
      {showCta && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Call to Action
            </CardTitle>
            <CardDescription>Configure the CTA block for this page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>CTA Title</Label>
              <Input {...form.register("forIndividuals.cta.title")} placeholder="CTA title..." />
            </div>
            <div className="space-y-2">
              <Label>CTA Bullets</Label>
              <Textarea
                rows={4}
                {...form.register("forIndividuals.cta.bulletsText")}
                placeholder="Enter bullet points (one per line)..."
              />
              <p className="text-muted-foreground text-xs">Enter each bullet point on a new line</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {renderImageInput(
                "Left Background Image",
                "forIndividuals.cta.leftBackgroundImage",
                form.watch("forIndividuals.cta.leftBackgroundImage"),
              )}
              {renderImageInput(
                "Right Image",
                "forIndividuals.cta.rightImage",
                form.watch("forIndividuals.cta.rightImage"),
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderLegalPage = (
    title: string,
    path: "privacyPolicy" | "termsConditions" | "cookiePolicy",
    sections: ReturnType<typeof useFieldArray<FormValues, `${typeof path}.sections`>>,
  ) => (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Hero Section
          </CardTitle>
          <CardDescription>Configure the hero banner for this page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Hero Title</Label>
            <Input {...form.register(`${path}.hero.title`)} placeholder="Enter hero title..." />
          </div>
          {renderImageInput(
            "Hero Background Image",
            `${path}.hero.backgroundImage`,
            form.watch(`${path}.hero.backgroundImage`),
            "Recommended size: 1920x1080px",
          )}
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Sections
              </CardTitle>
              <CardDescription>Manage the legal content sections</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => sections.append(emptyLegalSection())}>
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.fields.map((section, index) => (
            <Card key={section.id} className="border-dashed">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Section {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => sections.remove(index)}
                    disabled={sections.fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input {...form.register(`${path}.sections.${index}.title`)} placeholder="Section title..." />
                </div>
                <div className="space-y-2">
                  <Label>Section Content</Label>
                  <Controller
                    control={form.control}
                    name={`${path}.sections.${index}.content` as const}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Write legal section content..."
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        {/* Navigation Tabs */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-6 lg:grid-cols-12">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border-2 border-transparent px-3 py-3 transition-all",
                      "data-[state=active]:border-primary data-[state=active]:bg-primary/5",
                      "hover:bg-muted/50",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </CardContent>
        </Card>

        {/* Homepage Tab */}
        <TabsContent value="homepage" className="space-y-6">
          {/* Hero Banner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Hero Banner
              </CardTitle>
              <CardDescription>Configure the main hero section of the homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input {...form.register("homepage.heroBanner.heading")} placeholder="Main heading text..." />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {renderImageInput(
                  "Background Image",
                  "homepage.heroBanner.backgroundImage",
                  form.watch("homepage.heroBanner.backgroundImage"),
                  "Fallback image when video is not playing",
                )}
                {renderImageInput(
                  "Background Video",
                  "homepage.heroBanner.backgroundVideo",
                  form.watch("homepage.heroBanner.backgroundVideo"),
                  "Optional video background",
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section Headers */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Category Section</CardTitle>
                <CardDescription>Section header for categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input {...form.register("homepage.categorySection.heading")} placeholder="Heading..." />
                </div>
                <div className="space-y-2">
                  <Label>Subheading</Label>
                  <Input {...form.register("homepage.categorySection.subheading")} placeholder="Subheading..." />
                </div>
                {renderImageInput(
                  "Section Icon",
                  "homepage.categorySection.icon",
                  form.watch("homepage.categorySection.icon"),
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trending Section</CardTitle>
                <CardDescription>Section header for trending venues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input {...form.register("homepage.trendingSection.heading")} placeholder="Heading..." />
                </div>
                <div className="space-y-2">
                  <Label>Subheading</Label>
                  <Input {...form.register("homepage.trendingSection.subheading")} placeholder="Subheading..." />
                </div>
                {renderImageInput(
                  "Section Icon",
                  "homepage.trendingSection.icon",
                  form.watch("homepage.trendingSection.icon"),
                )}
              </CardContent>
            </Card>
          </div>

          {/* Featured Venue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Featured Venue
              </CardTitle>
              <CardDescription>Select and configure the featured venue section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Venue</Label>
                <Select
                  value={form.watch("homepage.featuredVenue.venueId")}
                  onValueChange={(value) => form.setValue("homepage.featuredVenue.venueId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a venue..." />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subheading</Label>
                  <Input {...form.register("homepage.featuredVenue.subheading")} placeholder="Section subheading..." />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input {...form.register("homepage.featuredVenue.buttonText")} placeholder="Button label..." />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Feature Cards
                  </CardTitle>
                  <CardDescription>Manage the feature cards displayed on the homepage</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => homepageCards.append(emptyHomepageCard())}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Card
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {homepageCards.fields.map((card, index) => (
                <Card key={card.id} className="border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Card {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => homepageCards.remove(index)}
                        disabled={homepageCards.fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Heading</Label>
                        <Input
                          {...form.register(`homepage.featuresSection.cards.${index}.heading`)}
                          placeholder="Card heading..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subheading</Label>
                        <Input
                          {...form.register(`homepage.featuresSection.cards.${index}.subheading`)}
                          placeholder="Card subheading..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Controller
                        control={form.control}
                        name={`homepage.featuresSection.cards.${index}.description` as const}
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Card description..."
                          />
                        )}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {renderImageInput(
                        "Card Icon",
                        `homepage.featuresSection.cards.${index}.icon`,
                        form.watch(`homepage.featuresSection.cards.${index}.icon`),
                      )}
                      {renderImageInput(
                        "Card Background",
                        `homepage.featuresSection.cards.${index}.backgroundImage`,
                        form.watch(`homepage.featuresSection.cards.${index}.backgroundImage`),
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Testimonials Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Testimonials Section</CardTitle>
              <CardDescription>Section header for customer testimonials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input {...form.register("homepage.testimonialsSection.heading")} placeholder="Heading..." />
                </div>
                <div className="space-y-2">
                  <Label>Subheading</Label>
                  <Input {...form.register("homepage.testimonialsSection.subheading")} placeholder="Subheading..." />
                </div>
              </div>
              {renderImageInput(
                "Section Icon",
                "homepage.testimonialsSection.icon",
                form.watch("homepage.testimonialsSection.icon"),
              )}
            </CardContent>
          </Card>

          {/* Expert Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Expert Section
              </CardTitle>
              <CardDescription>Configure the expert consultation section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input {...form.register("homepage.expertSection.heading")} placeholder="Heading..." />
                </div>
                <div className="space-y-2">
                  <Label>Subheading</Label>
                  <Input {...form.register("homepage.expertSection.subheading")} placeholder="Subheading..." />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input {...form.register("homepage.expertSection.buttonText")} placeholder="Button label..." />
                </div>
                <div className="space-y-2">
                  <Label>Button URL</Label>
                  <Input {...form.register("homepage.expertSection.buttonUrl")} placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Controller
                  control={form.control}
                  name="homepage.expertSection.description"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Section description..."
                    />
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {renderImageInput(
                  "Section Icon",
                  "homepage.expertSection.icon",
                  form.watch("homepage.expertSection.icon"),
                )}
                {renderImageInput(
                  "Section Image",
                  "homepage.expertSection.image",
                  form.watch("homepage.expertSection.image"),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing Pages */}
        <TabsContent value="aboutUs">{renderMarketingPage("About Us", "aboutUs", aboutSections, false)}</TabsContent>

        <TabsContent value="howItsWork">
          {renderMarketingPage("How It Works", "howItsWork", howSections, false)}
        </TabsContent>

        <TabsContent value="forCorporates">
          {renderMarketingPage("For Corporates", "forCorporates", corporateSections, false)}
        </TabsContent>

        <TabsContent value="forIndividuals">
          {renderMarketingPage("For Individuals", "forIndividuals", individualSections, true)}
        </TabsContent>

        {/* Contact Us */}
        <TabsContent value="contactUs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Us Page
              </CardTitle>
              <CardDescription>Configure the contact page content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Hero Section</h4>
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input {...form.register("contactUs.hero.title")} placeholder="Hero title..." />
                </div>
                {renderImageInput(
                  "Hero Background Image",
                  "contactUs.hero.backgroundImage",
                  form.watch("contactUs.hero.backgroundImage"),
                )}
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Content Section</h4>
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input {...form.register("contactUs.sectionTitle")} placeholder="Section title..." />
                </div>
                {renderImageInput("Section Image", "contactUs.sectionImage", form.watch("contactUs.sectionImage"))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partner With Us */}
        <TabsContent value="partnerWithUs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Partner With Us Page
              </CardTitle>
              <CardDescription>Configure the partnership page hero and intro content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Hero Section</h4>
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input {...form.register("partnerWithUs.hero.title")} placeholder="Hero title..." />
                </div>
                {renderImageInput(
                  "Hero Background Image",
                  "partnerWithUs.hero.backgroundImage",
                  form.watch("partnerWithUs.hero.backgroundImage"),
                )}
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Intro Content</h4>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input {...form.register("partnerWithUs.title")} placeholder="Section title..." />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Controller
                    control={form.control}
                    name="partnerWithUs.description"
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Write page description..."
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Pages */}
        <TabsContent value="privacyPolicy">
          {renderLegalPage("Privacy Policy", "privacyPolicy", privacySections)}
        </TabsContent>

        <TabsContent value="termsConditions">
          {renderLegalPage("Terms & Conditions", "termsConditions", termsSections)}
        </TabsContent>

        <TabsContent value="cookiePolicy">
          {renderLegalPage("Cookie Policy", "cookiePolicy", cookieSections)}
        </TabsContent>

        {/* Discover Page */}
        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Discover Page
              </CardTitle>
              <CardDescription>Configure the venue discovery page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Hero Section</h4>
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input {...form.register("discover.hero.title")} placeholder="Hero title..." />
                </div>
                {renderImageInput(
                  "Hero Background Image",
                  "discover.hero.backgroundImage",
                  form.watch("discover.hero.backgroundImage"),
                )}
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Event Concierge Card</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Card Title</Label>
                    <Input {...form.register("discover.conciergeCard.title")} placeholder="Card title..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Card Subtitle</Label>
                    <Input {...form.register("discover.conciergeCard.subtitle")} placeholder="Card subtitle..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Card Description</Label>
                  <Controller
                    control={form.control}
                    name="discover.conciergeCard.description"
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Card description..."
                      />
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Link Text</Label>
                    <Input {...form.register("discover.conciergeCard.linkText")} placeholder="Link text..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Link URL</Label>
                    <Input {...form.register("discover.conciergeCard.linkUrl")} placeholder="https://..." />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shared Slider */}
        <TabsContent value="eventConcierge" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Shared Page Slider
                  </CardTitle>
                  <CardDescription>Used across auth pages and event concierge page</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => eventSlides.append(emptySlide())}>
                  <Plus className="mr-2 h-4 w-4" /> Add Slide
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {eventSlides.fields.map((slide, index) => (
                <Card key={slide.id} className="border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Slide {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => eventSlides.remove(index)}
                        disabled={eventSlides.fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {renderImageInput(
                        "Main Image",
                        `eventConcierge.slides.${index}.image`,
                        form.watch(`eventConcierge.slides.${index}.image`),
                      )}
                      {renderImageInput(
                        "User Avatar",
                        `eventConcierge.slides.${index}.userImage`,
                        form.watch(`eventConcierge.slides.${index}.userImage`),
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Alt Text</Label>
                        <Input
                          {...form.register(`eventConcierge.slides.${index}.alt`)}
                          placeholder="Image alt text..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input {...form.register(`eventConcierge.slides.${index}.name`)} placeholder="Person name..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Controller
                        control={form.control}
                        name={`eventConcierge.slides.${index}.description` as const}
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Slide description..."
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input
                        {...form.register(`eventConcierge.slides.${index}.address`)}
                        placeholder="Location address..."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky Save Button */}
      <Card className="sticky bottom-4 border-2 shadow-lg">
        <CardContent className="flex items-center justify-between py-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Editing:</span>{" "}
            <span className="font-medium">{tabConfig.find((t) => t.value === activeTab)?.label}</span>
          </div>
          <Button type="submit" disabled={updateMutation.isPending} className="min-w-[140px]">
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
