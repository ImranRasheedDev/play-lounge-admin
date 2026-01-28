/* eslint-disable max-lines */
/* eslint-disable complexity */
"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useHomepageSettings, useUpdateHomepageSettings } from "@/hooks/use-homepage-settings";
import { useVenues } from "@/hooks/use-venues";
import { UpdateHomepageSettingsInput } from "@/services/homepage-settings.service";

interface FormValues {
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
    cards: Array<{
      heading: string;
      subheading: string;
      description: string;
      icon: File | string;
      backgroundImage: File | string;
    }>;
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

export function HomepageSettingsForm() {
  const { data: settings, isLoading } = useHomepageSettings();
  const { data: venuesData } = useVenues();
  const updateMutation = useUpdateHomepageSettings();
  const [openSections, setOpenSections] = useState<string[]>(["hero-banner"]);

  const venues = venuesData?.data ?? [];

  const form = useForm<FormValues>({
    defaultValues: {
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
      featuresSection: { cards: [] },
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
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        heroBanner: {
          heading: settings.heroBanner?.heading ?? "",
          backgroundImage: settings.heroBanner?.backgroundImage ?? "",
          backgroundVideo: settings.heroBanner?.backgroundVideo ?? "",
        },
        categorySection: {
          heading: settings.categorySection?.heading ?? "",
          subheading: settings.categorySection?.subheading ?? "",
          icon: settings.categorySection?.icon ?? "",
        },
        trendingSection: {
          heading: settings.trendingSection?.heading ?? "",
          subheading: settings.trendingSection?.subheading ?? "",
          icon: settings.trendingSection?.icon ?? "",
        },
        featuredVenue: {
          venueId: settings.featuredVenue?.venueId ?? "",
          heading: settings.featuredVenue?.heading ?? "",
          subheading: settings.featuredVenue?.subheading ?? "",
          buttonText: settings.featuredVenue?.buttonText ?? "",
          buttonUrl: settings.featuredVenue?.buttonUrl ?? "",
        },
        featuresSection: {
          cards: settings.featuresSection?.cards ?? [],
        },
        testimonialsSection: {
          heading: settings.testimonialsSection?.heading ?? "",
          subheading: settings.testimonialsSection?.subheading ?? "",
          icon: settings.testimonialsSection?.icon ?? "",
        },
        expertSection: {
          heading: settings.expertSection?.heading ?? "",
          subheading: settings.expertSection?.subheading ?? "",
          description: settings.expertSection?.description ?? "",
          icon: settings.expertSection?.icon ?? "",
          image: settings.expertSection?.image ?? "",
          buttonText: settings.expertSection?.buttonText ?? "",
          buttonUrl: settings.expertSection?.buttonUrl ?? "",
        },
      });
    }
  }, [settings, form]);

  const onSubmit = (data: FormValues) => {
    const payload: UpdateHomepageSettingsInput = {
      heroBanner: data.heroBanner,
      categorySection: data.categorySection,
      trendingSection: data.trendingSection,
      featuredVenue: {
        ...data.featuredVenue,
        venueId: data.featuredVenue.venueId || null,
      },
      featuresSection: data.featuresSection,
      testimonialsSection: data.testimonialsSection,
      expertSection: data.expertSection,
    };
    updateMutation.mutate(payload);
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue(field as keyof FormValues, file as never);
    }
  };

  const getPreviewUrl = (value: File | string): string => {
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }
    return value;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Accordion type="multiple" value={openSections} onValueChange={setOpenSections} className="space-y-4">
        {/* Hero Banner Section */}
        <AccordionItem value="hero-banner" className="rounded-lg border">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Hero Banner</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div>
                <Label>Heading</Label>
                <Input {...form.register("heroBanner.heading")} />
              </div>
              <div>
                <Label>Background Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("heroBanner.backgroundImage", e)}
                />
                {form.watch("heroBanner.backgroundImage") && (
                  <div className="mt-2 flex items-start gap-2">
                    <div className="relative h-24 w-40">
                      <Image
                        src={getPreviewUrl(form.watch("heroBanner.backgroundImage"))}
                        alt="Preview"
                        fill
                        className="rounded object-cover"
                        unoptimized
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => form.setValue("heroBanner.backgroundImage", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label>Background Video (optional)</Label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange("heroBanner.backgroundVideo", e)}
                />
                {form.watch("heroBanner.backgroundVideo") && (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-muted-foreground text-sm">
                      Video uploaded:{" "}
                      {typeof form.watch("heroBanner.backgroundVideo") === "string"
                        ? "Current video"
                        : (form.watch("heroBanner.backgroundVideo") as File).name}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => form.setValue("heroBanner.backgroundVideo", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Category Section */}
        <AccordionItem value="category-section" className="rounded-lg border">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Category Section Header</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div>
                <Label>Heading</Label>
                <Input {...form.register("categorySection.heading")} />
              </div>
              <div>
                <Label>Subheading</Label>
                <Input {...form.register("categorySection.subheading")} />
              </div>
              <div>
                <Label>Icon</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange("categorySection.icon", e)} />
                {form.watch("categorySection.icon") && (
                  <div className="mt-2 flex items-start gap-2">
                    <div className="relative h-12 w-12">
                      <Image
                        src={getPreviewUrl(form.watch("categorySection.icon"))}
                        alt="Icon"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => form.setValue("categorySection.icon", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Trending Section */}
        <AccordionItem value="trending-section" className="rounded-lg border">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Trending Section Header</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div>
                <Label>Heading</Label>
                <Input {...form.register("trendingSection.heading")} />
              </div>
              <div>
                <Label>Subheading</Label>
                <Input {...form.register("trendingSection.subheading")} />
              </div>
              <div>
                <Label>Icon</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange("trendingSection.icon", e)} />
                {form.watch("trendingSection.icon") && (
                  <div className="mt-2 flex items-start gap-2">
                    <div className="relative h-12 w-12">
                      <Image
                        src={getPreviewUrl(form.watch("trendingSection.icon"))}
                        alt="Icon"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => form.setValue("trendingSection.icon", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Featured Venue Section */}
        <AccordionItem value="featured-venue" className="rounded-lg border">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Featured Venue (Sponsored)</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div>
                <Label>Select Venue</Label>
                <Select
                  value={form.watch("featuredVenue.venueId") || "none"}
                  onValueChange={(value) => form.setValue("featuredVenue.venueId", value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground mt-1 text-sm">
                  The venue name will be displayed as the section title. If no venue is selected, this section will be
                  hidden.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Features Section */}
        <AccordionItem value="features-section" className="rounded-lg border">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Features Section</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-6">
              {form.watch("featuresSection.cards")?.map((_, index) => (
                <Card key={index}>
                  <CardContent className="space-y-4 pt-4">
                    <h4 className="font-medium">Card {index + 1}</h4>
                    <div>
                      <Label>Heading</Label>
                      <Input {...form.register(`featuresSection.cards.${index}.heading`)} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea {...form.register(`featuresSection.cards.${index}.description`)} />
                    </div>
                    <div>
                      <Label>Icon (SVG only)</Label>
                      <Input
                        type="file"
                        accept=".svg,image/svg+xml"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const cards = form.getValues("featuresSection.cards");
                            cards[index].icon = file;
                            form.setValue("featuresSection.cards", cards);
                          }
                        }}
                      />
                      {form.watch(`featuresSection.cards.${index}.icon`) && (
                        <div className="mt-2 flex items-start gap-2">
                          <div className="relative h-12 w-12">
                            <Image
                              src={getPreviewUrl(form.watch(`featuresSection.cards.${index}.icon`))}
                              alt="Icon"
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              const cards = form.getValues("featuresSection.cards");
                              cards[index].icon = "";
                              form.setValue("featuresSection.cards", [...cards]);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Background Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const cards = form.getValues("featuresSection.cards");
                            cards[index].backgroundImage = file;
                            form.setValue("featuresSection.cards", cards);
                          }
                        }}
                      />
                      {form.watch(`featuresSection.cards.${index}.backgroundImage`) && (
                        <div className="mt-2 flex items-start gap-2">
                          <div className="relative h-24 w-40">
                            <Image
                              src={getPreviewUrl(form.watch(`featuresSection.cards.${index}.backgroundImage`))}
                              alt="Background"
                              fill
                              className="rounded object-cover"
                              unoptimized
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              const cards = form.getValues("featuresSection.cards");
                              cards[index].backgroundImage = "";
                              form.setValue("featuresSection.cards", [...cards]);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Testimonials Section */}
        <AccordionItem value="testimonials-section" className="rounded-lg border">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Testimonials Section Header</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div>
                <Label>Heading</Label>
                <Input {...form.register("testimonialsSection.heading")} />
              </div>
              <div>
                <Label>Subheading</Label>
                <Input {...form.register("testimonialsSection.subheading")} />
              </div>
              <div>
                <Label>Icon</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange("testimonialsSection.icon", e)} />
                {form.watch("testimonialsSection.icon") && (
                  <div className="mt-2 flex items-start gap-2">
                    <div className="relative h-12 w-12">
                      <Image
                        src={getPreviewUrl(form.watch("testimonialsSection.icon"))}
                        alt="Icon"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => form.setValue("testimonialsSection.icon", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm">Manage reviews in the Reviews section of the sidebar.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Expert Section */}
        <AccordionItem value="expert-section" className="rounded-lg border">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Expert Section (Bottom Banner)</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div>
                <Label>Heading</Label>
                <Input {...form.register("expertSection.heading")} />
              </div>
              <div>
                <Label>Subheading</Label>
                <Input {...form.register("expertSection.subheading")} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...form.register("expertSection.description")} />
              </div>
              <div>
                <Label>Icon</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange("expertSection.icon", e)} />
                {form.watch("expertSection.icon") && (
                  <div className="mt-2 flex items-start gap-2">
                    <div className="relative h-12 w-12">
                      <Image
                        src={getPreviewUrl(form.watch("expertSection.icon"))}
                        alt="Icon"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => form.setValue("expertSection.icon", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label>Image</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange("expertSection.image", e)} />
                {form.watch("expertSection.image") && (
                  <div className="mt-2 flex items-start gap-2">
                    <div className="relative h-24 w-40">
                      <Image
                        src={getPreviewUrl(form.watch("expertSection.image"))}
                        alt="Expert"
                        fill
                        className="rounded object-cover"
                        unoptimized
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => form.setValue("expertSection.image", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label>Button Text</Label>
                <Input {...form.register("expertSection.buttonText")} />
              </div>
              <div>
                <Label>Button URL</Label>
                <Input {...form.register("expertSection.buttonUrl")} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
