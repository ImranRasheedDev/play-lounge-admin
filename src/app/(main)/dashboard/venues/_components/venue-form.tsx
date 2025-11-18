/* eslint-disable complexity, max-lines */
"use client";

import * as React from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import Autocomplete from "react-google-autocomplete";
import { useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { toast } from "sonner";
import "react-phone-number-input/style.css";

import { GoogleMap } from "@/components/google-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/use-categories";
import { useVenueTypes } from "@/hooks/use-venue-types";
import { useCreateVenue, useUpdateVenue } from "@/hooks/use-venues";
import { Venue } from "@/types/venue";

import { venueFormSchema, type VenueFormValues } from "./schema";

interface VenueFormProps {
  venue?: Venue | null;
  mode: "create" | "edit";
}

export function VenueForm({ venue, mode }: VenueFormProps) {
  const router = useRouter();
  const [images, setImages] = React.useState<
    Array<{
      name: string;
      images: Array<File | string>;
      imagePreviews: string[];
    }>
  >([]);
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string>("");
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [existingThumbnail, setExistingThumbnail] = React.useState<string>("");
  const [experiences, setExperiences] = React.useState<
    Array<{
      image: File | string;
      imagePreview: string;
      heading: string;
      subHeading: string;
      description: string;
    }>
  >([]);
  const [tagInput, setTagInput] = React.useState("");
  const autocompleteRef = React.useRef<HTMLInputElement>(null);

  const { data: categories } = useCategories();
  const { data: venueTypes } = useVenueTypes();
  const createMutation = useCreateVenue();
  const updateMutation = useUpdateVenue();

  const googlePlacesApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: venue?.name ?? "",
      categoryId: venue?.categoryId ?? "",
      venueTypeId: venue?.venueTypeId ?? "",
      address: venue?.address ?? "",
      contactNumber: venue?.contactNumber ?? "",
      placeId: venue?.placeId ?? "",
      latitude: venue?.latitude,
      longitude: venue?.longitude,
      overview: venue?.overview ?? "",
      googleReviewsLink: venue?.googleReviewsLink ?? "",
      venueLink: venue?.venueLink ?? "",
      thumbnail: venue?.thumbnail ?? "",
      tags: venue?.tags ?? [],
      images: venue?.images ?? [],
      experiences: venue?.experiences ?? [],
      atmosphere: venue?.atmosphere ?? "",
      foodOptions: venue?.foodOptions ?? "",
      dressCode: venue?.dressCode ?? "",
      accessibility: venue?.accessibility ?? "",
      seated: venue?.seated ?? "",
      standing: venue?.standing ?? "",
      openHours: venue?.openHours ?? {
        monday: { isOpen: false, openTime: "", closeTime: "" },
        tuesday: { isOpen: false, openTime: "", closeTime: "" },
        wednesday: { isOpen: false, openTime: "", closeTime: "" },
        thursday: { isOpen: false, openTime: "", closeTime: "" },
        friday: { isOpen: false, openTime: "", closeTime: "" },
        saturday: { isOpen: false, openTime: "", closeTime: "" },
        sunday: { isOpen: false, openTime: "", closeTime: "" },
      },
      isActive: venue?.isActive ?? true,
      isSponsored: venue?.isSponsored ?? false,
      isTrending: venue?.isTrending ?? false,
    },
  });

  const tags = form.watch("tags");

  React.useEffect(() => {
    if (venue && mode === "edit") {
      // Set existing thumbnail
      if (venue.thumbnail) {
        const thumbnailUrl = venue.thumbnail.startsWith("http")
          ? venue.thumbnail
          : `${process.env.NEXT_PUBLIC_API_URL}${venue.thumbnail}`;
        setThumbnailPreview(thumbnailUrl);
        setExistingThumbnail(venue.thumbnail);
      }

      // Set existing images (tag-wise)
      if (venue.images && venue.images.length > 0) {
        const loadedImages = venue.images.map((tagWithImages: any) => ({
          name: tagWithImages.name,
          images: tagWithImages.images ?? [],
          imagePreviews: (tagWithImages.images ?? []).map((img: string) =>
            img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_API_URL}${img}`,
          ),
        }));
        setImages(loadedImages);
        // Sync with form
        form.setValue(
          "images",
          loadedImages.map((tag) => ({
            name: tag.name,
            images: tag.images,
          })),
        );
      }

      // Set existing experiences
      if (venue.experiences && venue.experiences.length > 0) {
        const loadedExperiences = venue.experiences.map((exp: any) => ({
          image: exp.image,
          imagePreview: exp.image.startsWith("http") ? exp.image : `${process.env.NEXT_PUBLIC_API_URL}${exp.image}`,
          heading: exp.heading,
          subHeading: exp.subHeading,
          description: exp.description,
        }));
        setExperiences(loadedExperiences);
      }
    }
  }, [venue, mode]);

  const handleAddImageTag = () => {
    const newImages = [
      ...images,
      {
        name: "",
        images: [],
        imagePreviews: [],
      },
    ];
    setImages(newImages);
    // Sync with form
    form.setValue(
      "images",
      newImages.map((tag) => ({
        name: tag.name,
        images: tag.images,
      })),
    );
  };

  const handleRemoveImageTag = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    // Sync with form
    form.setValue(
      "images",
      newImages.map((tag) => ({
        name: tag.name,
        images: tag.images,
      })),
    );
  };

  const handleUpdateImageTagName = (index: number, name: string) => {
    const newImages = [...images];
    newImages[index].name = name;
    setImages(newImages);
    // Sync with form
    form.setValue(
      "images",
      newImages.map((tag) => ({
        name: tag.name,
        images: tag.images,
      })),
    );
  };

  const handleAddImagesToTag = (tagIndex: number, files: File[]) => {
    const newImages = [...images];
    const tag = newImages[tagIndex];

    let processedCount = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        tag.images.push(file);
        tag.imagePreviews.push(reader.result as string);
        processedCount++;
        if (processedCount === files.length) {
          setImages([...newImages]);
          // Sync with form
          form.setValue(
            "images",
            newImages.map((tag) => ({
              name: tag.name,
              images: tag.images,
            })),
          );
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImageFromTag = (tagIndex: number, imageIndex: number) => {
    const newImages = [...images];
    const tag = newImages[tagIndex];
    tag.images.splice(imageIndex, 1);
    tag.imagePreviews.splice(imageIndex, 1);
    setImages([...newImages]);
    // Sync with form
    form.setValue(
      "images",
      newImages.map((tag) => ({
        name: tag.name,
        images: tag.images,
      })),
    );
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
        // Update form value
        form.setValue("thumbnail", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place) {
      // Set only venue name (not full address) in the name field
      const venueName = place.name ?? "";
      form.setValue("name", venueName);

      // Set full address in address field
      form.setValue("address", place.formatted_address ?? "");
      form.setValue("placeId", place.place_id ?? "");

      // Set coordinates
      if (place.geometry?.location) {
        form.setValue("latitude", place.geometry.location.lat());
        form.setValue("longitude", place.geometry.location.lng());
      }

      // Update the input field to show only the name
      if (autocompleteRef.current) {
        autocompleteRef.current.value = venueName;
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") ?? [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        image: "",
        imagePreview: "",
        heading: "",
        subHeading: "",
        description: "",
      },
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    const newExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(newExperiences);
  };

  const handleExperienceImageChange = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newExperiences = [...experiences];
      newExperiences[index].image = file;
      newExperiences[index].imagePreview = reader.result as string;
      setExperiences(newExperiences);
    };
    reader.readAsDataURL(file);
  };

  const handleExperienceFieldChange = (
    index: number,
    field: "heading" | "subHeading" | "description",
    value: string,
  ) => {
    const newExperiences = [...experiences];
    newExperiences[index][field] = value;
    setExperiences(newExperiences);
  };
  const onFormSubmit = (data: VenueFormValues) => {
    console.log("Form submit triggered", { data, images, thumbnailFile, existingThumbnail });

    if (images.length === 0) {
      console.error("Validation error: No image tags");
      toast.error("Please add at least one image tag");
      return;
    }

    // Validate that each tag has at least one image
    for (const imageTag of images) {
      if (!imageTag.name.trim()) {
        console.error("Validation error: Empty tag name", imageTag);
        toast.error("Please enter a tag name for all image tags");
        return;
      }
      if (imageTag.images.length === 0) {
        console.error("Validation error: No images in tag", imageTag);
        toast.error(`Please add at least one image for tag "${imageTag.name ?? "untagged"}"`);
        return;
      }
    }

    if (!thumbnailFile && !existingThumbnail) {
      console.error("Validation error: No thumbnail");
      toast.error("Please add a thumbnail image");
      return;
    }

    if (mode === "edit" && venue) {
      const existingImagesData = images
        .filter((tag) => tag.images.every((img) => typeof img === "string"))
        .map((tag) => ({
          name: tag.name,
          images: tag.images as string[],
        }));

      updateMutation.mutate(
        {
          id: venue.id,
          data: {
            name: data.name,
            categoryId: data.categoryId,
            venueTypeId: data.venueTypeId,
            address: data.address,
            contactNumber: data.contactNumber,
            placeId: data.placeId,
            latitude: data.latitude,
            longitude: data.longitude,
            overview: data.overview,
            googleReviewsLink: data.googleReviewsLink,
            venueLink: data.venueLink,
            thumbnail: thumbnailFile ?? undefined,
            existingThumbnail: existingThumbnail ?? undefined,
            tags: data.tags,
            images: images.map((tag) => ({
              name: tag.name,
              images: tag.images,
            })),
            existingImages: existingImagesData.length > 0 ? existingImagesData : undefined,
            experiences: experiences.map((exp) => ({
              image: exp.image,
              heading: exp.heading,
              subHeading: exp.subHeading,
              description: exp.description,
            })),
            existingExperiences: experiences
              .filter((exp) => typeof exp.image === "string")
              .map((exp) => exp.image as string),
            atmosphere: data.atmosphere,
            foodOptions: data.foodOptions,
            dressCode: data.dressCode,
            accessibility: data.accessibility,
            seated: data.seated,
            standing: data.standing,
            openHours: data.openHours,
            isActive: data.isActive,
            isSponsored: data.isSponsored,
            isTrending: data.isTrending,
          },
        },
        {
          onSuccess: () => {
            console.log("Venue updated successfully");
            router.push("/dashboard/venues");
          },
          onError: (error: any) => {
            console.error("Error updating venue:", error);
            toast.error(error?.response?.data?.message ?? "Failed to update venue");
          },
        },
      );
    } else {
      if (!thumbnailFile) {
        console.error("Validation error: No thumbnail file");
        toast.error("Please add a thumbnail image");
        return;
      }

      const createData = {
        name: data.name,
        categoryId: data.categoryId,
        venueTypeId: data.venueTypeId,
        address: data.address,
        contactNumber: data.contactNumber,
        placeId: data.placeId,
        latitude: data.latitude,
        longitude: data.longitude,
        overview: data.overview,
        googleReviewsLink: data.googleReviewsLink,
        venueLink: data.venueLink,
        thumbnail: thumbnailFile,
        tags: data.tags,
        images: images.map((tag) => ({
          name: tag.name,
          images: tag.images,
        })),
        experiences: experiences.map((exp) => ({
          image: exp.image,
          heading: exp.heading,
          subHeading: exp.subHeading,
          description: exp.description,
        })),
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

      console.log("Creating venue with data:", createData);
      createMutation.mutate(createData, {
        onSuccess: () => {
          console.log("Venue created successfully");
          router.push("/dashboard/venues");
        },
        onError: (error: any) => {
          console.error("Error creating venue:", error);
          console.error("Error response:", error?.response);
          console.error("Error data:", error?.response?.data);
          toast.error(error?.response?.data?.message ?? "Failed to create venue");
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form
        id="venue-form"
        onSubmit={form.handleSubmit(onFormSubmit, (errors) => {
          console.error("Form validation errors:", errors);
          console.error("Form values:", form.getValues());
          toast.error("Please fix the form errors before submitting");
        })}
        className="space-y-6"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Venue Information</CardTitle>
                <CardDescription>Enter the basic details of the venue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Venue Name with Google Places */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Venue Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Autocomplete
                          ref={autocompleteRef}
                          apiKey={googlePlacesApiKey}
                          onPlaceSelected={handlePlaceSelect}
                          options={{
                            types: ["establishment"],
                            fields: ["name", "formatted_address", "geometry", "place_id"],
                          }}
                          placeholder="Search for a venue..."
                          value={field.value}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                          className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          language="en"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category and Venue Type */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Category <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venueTypeId"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Venue Type <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a venue type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {venueTypes?.map((venueType) => (
                              <SelectItem key={venueType.id} value={venueType.id}>
                                {venueType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter venue address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Number */}
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <div className="[&_.PhoneInputInput]:border-input [&_.PhoneInputInput]:placeholder:text-muted-foreground [&_.PhoneInputInput]:focus-visible:ring-ring [&_.PhoneInputCountrySelect]:border-input [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountryIcon]:h-4 [&_.PhoneInputCountryIcon]:w-4 [&_.PhoneInputCountrySelect]:h-9 [&_.PhoneInputCountrySelect]:rounded-l-md [&_.PhoneInputCountrySelect]:border [&_.PhoneInputCountrySelect]:border-r-0 [&_.PhoneInputCountrySelect]:bg-transparent [&_.PhoneInputCountrySelect]:px-2 [&_.PhoneInputCountrySelect]:text-sm [&_.PhoneInputInput]:flex [&_.PhoneInputInput]:h-9 [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:rounded-md [&_.PhoneInputInput]:border [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:px-3 [&_.PhoneInputInput]:py-1 [&_.PhoneInputInput]:text-base [&_.PhoneInputInput]:shadow-sm [&_.PhoneInputInput]:transition-colors [&_.PhoneInputInput]:focus-visible:ring-1 [&_.PhoneInputInput]:focus-visible:outline-none [&_.PhoneInputInput]:disabled:cursor-not-allowed [&_.PhoneInputInput]:disabled:opacity-50 [&_.PhoneInputInput]:md:text-sm">
                          <PhoneInput
                            international
                            defaultCountry="US"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter contact number"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Google Map - Show when location is selected */}
                {form.watch("latitude") && form.watch("longitude") && (
                  <div className="space-y-2">
                    <FormLabel>Location on Map</FormLabel>
                    <GoogleMap latitude={form.watch("latitude")!} longitude={form.watch("longitude")!} zoom={16} />
                    <p className="text-muted-foreground text-xs">
                      Coordinates: {form.watch("latitude")?.toFixed(6)}, {form.watch("longitude")?.toFixed(6)}
                    </p>
                  </div>
                )}

                {/* Overview */}
                <FormField
                  control={form.control}
                  name="overview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Overview <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter venue overview/description..." rows={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Google Reviews Link */}
                <FormField
                  control={form.control}
                  name="googleReviewsLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Reviews Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://maps.google.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Venue Link */}
                <FormField
                  control={form.control}
                  name="venueLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://venue-website.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Images <span className="text-destructive">*</span>
                </CardTitle>
                <CardDescription>Upload images organized by tags (e.g., food, interior, exterior)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {images.map((imageTag, tagIndex) => (
                  <div key={tagIndex} className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Tag #{tagIndex + 1}</h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveImageTag(tagIndex)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Tag Name */}
                    <div className="space-y-2">
                      <FormLabel>
                        Tag Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        value={imageTag.name}
                        onChange={(e) => handleUpdateImageTagName(tagIndex, e.target.value)}
                        placeholder="e.g., food, interior, exterior..."
                      />
                    </div>

                    {/* Images Upload */}
                    <div className="space-y-2">
                      <FormLabel>
                        Images <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          if (files.length > 0) {
                            handleAddImagesToTag(tagIndex, files);
                          }
                        }}
                        className="cursor-pointer"
                      />
                    </div>

                    {/* Image Previews */}
                    {imageTag.imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {imageTag.imagePreviews.map((preview, imageIndex) => (
                          <div key={imageIndex} className="group relative">
                            <div className="relative h-40 overflow-hidden rounded-md border-2">
                              <Image
                                src={preview}
                                alt={`${imageTag.name} - ${imageIndex + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImageFromTag(tagIndex, imageIndex)}
                                className="bg-destructive text-destructive-foreground absolute top-2 right-2 rounded-full p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={handleAddImageTag} className="w-full">
                  Add Image Tag
                </Button>
              </CardContent>
            </Card>

            {/* Thumbnail Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Thumbnail <span className="text-destructive">*</span>
                </CardTitle>
                <CardDescription>Upload a thumbnail image (shown in listings)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="thumbnail"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Upload Thumbnail <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="cursor-pointer"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {thumbnailPreview && (
                  <div className="flex justify-center">
                    <div className="border-primary relative h-48 w-full max-w-sm overflow-hidden rounded-md border-2">
                      <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" unoptimized />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Experiences Card */}
            <Card>
              <CardHeader>
                <CardTitle>Experiences</CardTitle>
                <CardDescription>Add multiple experiences with images and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {experiences.map((exp, index) => (
                  <div key={index} className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Experience #{index + 1}</h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveExperience(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Experience Image */}
                    <div className="space-y-2">
                      <FormLabel>
                        Image <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleExperienceImageChange(index, file);
                        }}
                        className="cursor-pointer"
                      />
                      {exp.imagePreview && (
                        <div className="relative h-32 w-full overflow-hidden rounded-md border">
                          <Image
                            src={exp.imagePreview}
                            alt={`Experience ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>

                    {/* Heading */}
                    <div className="space-y-2">
                      <FormLabel>
                        Heading <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        value={exp.heading}
                        onChange={(e) => handleExperienceFieldChange(index, "heading", e.target.value)}
                        placeholder="Experience heading..."
                      />
                    </div>

                    {/* Sub Heading */}
                    <div className="space-y-2">
                      <FormLabel>
                        Sub Heading <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        value={exp.subHeading}
                        onChange={(e) => handleExperienceFieldChange(index, "subHeading", e.target.value)}
                        placeholder="Experience sub heading..."
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <FormLabel>
                        Description <span className="text-destructive">*</span>
                      </FormLabel>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => handleExperienceFieldChange(index, "description", e.target.value)}
                        placeholder="Describe the experience..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={handleAddExperience} className="w-full">
                  Add Experience
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Tags <span className="text-destructive">*</span>
                </CardTitle>
                <CardDescription>Add at least one tag to categorize the venue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Add Tags <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Type a tag..."
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={handleTagInputKeyDown}
                            />
                            <Button type="button" variant="secondary" onClick={handleAddTag}>
                              Add
                            </Button>
                          </div>
                          {tags && tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="gap-1 pr-1 pl-2">
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRemoveTag(tag);
                                    }}
                                    className="hover:bg-accent ml-1 rounded-sm"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Highlights Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Highlights <span className="text-destructive">*</span>
                </CardTitle>
                <CardDescription>All highlight fields are required</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="atmosphere"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Atmosphere <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Casual, Upscale, Energetic..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="foodOptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Food Options <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Full Menu, Snacks, Bar Food..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dressCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Dress Code <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Casual, Smart Casual, Formal..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Accessibility <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Wheelchair Accessible, Ground Floor..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Seated <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 100 people, Limited seating..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="standing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Standing <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 200 people, Standing room..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Open Hours Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Open Hours <span className="text-destructive">*</span>
                </CardTitle>
                <CardDescription>Set opening hours for at least one day of the week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.formState.errors.openHours && (
                  <p className="text-destructive text-sm font-medium">
                    {form.formState.errors.openHours.message as string}
                  </p>
                )}
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                  <div key={day} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-medium capitalize">{day}</FormLabel>
                      <FormField
                        control={form.control}
                        name={`openHours.${day}.isOpen` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch(`openHours.${day}.isOpen` as any) && (
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`openHours.${day}.openTime` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Open Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`openHours.${day}.closeTime` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Close Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Set the venue status and visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <div className="text-muted-foreground text-sm">Enable or disable this venue</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isSponsored"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Sponsored</FormLabel>
                        <div className="text-muted-foreground text-sm">Mark this venue as sponsored</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isTrending"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Trending</FormLabel>
                        <div className="text-muted-foreground text-sm">Mark this venue as trending</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="bg-card flex items-center justify-end gap-3 rounded-lg border p-4">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/venues")}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : mode === "edit"
                ? "Update Venue"
                : "Create Venue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
