/* eslint-disable complexity, max-lines */
"use client";

import * as React from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, GripVertical, Plus, X } from "lucide-react";
import Autocomplete from "react-google-autocomplete";
import { useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { toast } from "sonner";
import "react-phone-number-input/style.css";

import { GoogleMap } from "@/components/google-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useActiveCategories } from "@/hooks/use-categories";
import { useActiveVenueTypes } from "@/hooks/use-venue-types";
import { useCreateVenue, useUpdateVenue } from "@/hooks/use-venues";
import { cn } from "@/lib/utils";
import { Venue } from "@/types/venue";

import { venueFormSchema, type VenueFormValues } from "./schema";

interface VenueFormProps {
  venue?: Venue | null;
  mode: "create" | "edit";
}

// Image Upload Box Component
interface ImageUploadBoxProps {
  accept?: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
}

function ImageUploadBox({ accept = "image/*", multiple = false, onChange }: ImageUploadBoxProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      onChange(files);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        className="hover:border-primary focus-visible:ring-ring group flex h-[180px] w-[275px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="text-muted-foreground group-hover:text-primary flex flex-col items-center gap-2 transition-colors">
          <Plus className="h-8 w-8" />
          <span className="text-sm font-medium">Click to upload</span>
          <span className="text-xs">or drag and drop</span>
        </div>
      </button>
    </>
  );
}

// Sortable Tag Item Component
interface SortableTagItemProps {
  id: string;
  tagIndex: number;
  imageTag: {
    name: string;
    images: Array<File | string>;
    imagePreviews: string[];
  };
  onRemove: (index: number) => void;
  onUpdateName: (index: number, name: string) => void;
  onAddImages: (index: number, files: File[]) => void;
  onRemoveImage: (tagIndex: number, imageIndex: number) => void;
  onImagesDragEnd: (event: DragEndEvent) => void;
}

function SortableTagItem({
  id,
  tagIndex,
  imageTag,
  onRemove,
  onUpdateName,
  onAddImages,
  onRemoveImage,
  onImagesDragEnd,
}: SortableTagItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="text-muted-foreground cursor-grab touch-none active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <h4 className="text-sm font-semibold">Tag #{tagIndex + 1}</h4>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(tagIndex)} className="cursor-pointer">
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
          onChange={(e) => onUpdateName(tagIndex, e.target.value)}
          placeholder="e.g., food, interior, exterior..."
        />
      </div>

      {/* Images Upload */}
      {imageTag.imagePreviews.length === 0 && (
        <div className="space-y-2">
          <FormLabel>
            Images <span className="text-destructive">*</span>
          </FormLabel>
          <ImageUploadBox
            accept="image/*"
            multiple
            onChange={(files) => {
              if (files.length > 0) {
                onAddImages(tagIndex, files);
              }
            }}
          />
        </div>
      )}

      {/* Image Previews with Drag and Drop */}
      {imageTag.imagePreviews.length > 0 && (
        <div className="space-y-2">
          <FormLabel>
            Images <span className="text-destructive">*</span>
          </FormLabel>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onImagesDragEnd}>
            <SortableContext
              items={imageTag.imagePreviews.map((_, imageIndex) => `image-${tagIndex}-${imageIndex}`)}
              strategy={rectSortingStrategy}
            >
              <div className="flex flex-wrap gap-3">
                {imageTag.imagePreviews.map((preview, imageIndex) => (
                  <SortableImageItem
                    key={imageIndex}
                    id={`image-${tagIndex}-${imageIndex}`}
                    preview={preview}
                    alt={`${imageTag.name} - ${imageIndex + 1}`}
                    onRemove={() => onRemoveImage(tagIndex, imageIndex)}
                  />
                ))}
                <ImageUploadBox
                  accept="image/*"
                  multiple
                  onChange={(files) => {
                    if (files.length > 0) {
                      onAddImages(tagIndex, files);
                    }
                  }}
                />
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

// Sortable Image Item Component
interface SortableImageItemProps {
  id: string;
  preview: string;
  alt: string;
  onRemove: () => void;
}

// Sortable Experience Item Component
interface SortableExperienceItemProps {
  id: string;
  exp: {
    image: File | string;
    imagePreview: string;
    heading: string;
    subHeading: string;
    description: string;
  };
  index: number;
  onRemove: (index: number) => void;
  onImageChange: (index: number, file: File) => void;
  onFieldChange: (index: number, field: "heading" | "subHeading" | "description", value: string) => void;
  onClearImage: (index: number) => void;
}

function SortableExperienceItem({
  id,
  exp,
  index,
  onRemove,
  onImageChange,
  onFieldChange,
  onClearImage,
}: SortableExperienceItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="text-muted-foreground cursor-grab touch-none active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <h4 className="text-sm font-semibold">Experience #{index + 1}</h4>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)} className="cursor-pointer">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Experience Image */}
      <div className="space-y-2">
        <FormLabel>
          Image <span className="text-destructive">*</span>
        </FormLabel>
        {exp.imagePreview ? (
          <div className="relative h-[180px] w-[275px] overflow-hidden rounded-md border">
            <Image src={exp.imagePreview} alt={`Experience ${index + 1}`} fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => onClearImage(index)}
              className="bg-destructive text-destructive-foreground absolute top-2 right-2 cursor-pointer rounded-full p-1.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <ImageUploadBox
            accept="image/*"
            multiple={false}
            onChange={(files) => {
              if (files.length > 0 && files[0]) {
                onImageChange(index, files[0]);
              }
            }}
          />
        )}
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <FormLabel>
          Heading <span className="text-destructive">*</span>
        </FormLabel>
        <Input
          value={exp.heading}
          onChange={(e) => onFieldChange(index, "heading", e.target.value)}
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
          onChange={(e) => onFieldChange(index, "subHeading", e.target.value)}
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
          onChange={(e) => onFieldChange(index, "description", e.target.value)}
          placeholder="Describe the experience..."
          rows={3}
        />
      </div>
    </div>
  );
}

function SortableImageItem({ id, preview, alt, onRemove }: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative h-[180px] w-[275px]">
      <div
        className="relative h-full w-full cursor-grab overflow-hidden rounded-md border-2 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <Image src={preview} alt={alt} fill className="pointer-events-none object-cover" unoptimized />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onPointerDown={(e) => {
            // Prevent drag when clicking on cross button
            e.stopPropagation();
          }}
          className="bg-destructive text-destructive-foreground absolute top-2 right-2 z-10 cursor-pointer rounded-full p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
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
  const autocompleteRef = React.useRef<HTMLInputElement>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { data: categories = [] } = useActiveCategories();
  const { data: venueTypes } = useActiveVenueTypes();

  // Filter out "All" category
  const filteredCategories = React.useMemo(() => {
    return categories.filter((cat) => cat.title.toLowerCase() !== "all" && cat.slug?.toLowerCase() !== "all");
  }, [categories]);

  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const createMutation = useCreateVenue();
  const updateMutation = useUpdateVenue();

  const googlePlacesApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: venue?.name ?? "",
      categoryId: Array.isArray(venue?.categoryId) ? venue.categoryId : venue?.categoryId ? [venue.categoryId] : [],
      venueTypeId: venue?.venueTypeId ?? "",
      address: venue?.address ?? "",
      contactNumber: venue?.contactNumber ?? "",
      placeId: venue?.placeId ?? "",
      latitude: venue?.latitude,
      longitude: venue?.longitude,
      streetNumber: (venue as any)?.streetNumber ?? "",
      route: (venue as any)?.route ?? "",
      city: (venue as any)?.city ?? "",
      state: (venue as any)?.state ?? "",
      country: (venue as any)?.country ?? "",
      postalCode: (venue as any)?.postalCode ?? "",
      countryCode: (venue as any)?.countryCode ?? "",
      overview: venue?.overview ?? "",
      googleReviewsLink: venue?.googleReviewsLink ?? "",
      venueLink: venue?.venueLink ?? "",
      thumbnail: venue?.thumbnail ?? "",
      images: venue?.images ?? [],
      experiences: venue?.experiences ?? [],
      atmosphere: venue?.atmosphere ?? "",
      foodOptions: venue?.foodOptions ?? "",
      dressCode: venue?.dressCode ?? "",
      accessibility: venue?.accessibility ?? "",
      seated: venue?.seated ? String(venue.seated) : "",
      standing: venue?.standing ? String(venue.standing) : "",
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

  React.useEffect(() => {
    if (venue && mode === "edit") {
      // Set existing categoryId (convert string to array if needed)
      if (venue.categoryId) {
        const categoryIds = Array.isArray(venue.categoryId) ? venue.categoryId : [venue.categoryId];
        form.setValue("categoryId", categoryIds);
      }

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

  // Handle tag reordering
  const handleTagsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((_, index) => `tag-${index}` === active.id);
      const newIndex = images.findIndex((_, index) => `tag-${index}` === over.id);
      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);
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

  // Handle image reordering within a tag
  const handleTagImagesDragEnd = (tagIndex: number) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newImages = [...images];
      const tag = newImages[tagIndex];
      const oldIndex = tag.images.findIndex((_, index) => `image-${tagIndex}-${index}` === active.id);
      const newIndex = tag.images.findIndex((_, index) => `image-${tagIndex}-${index}` === over.id);
      tag.images = arrayMove(tag.images, oldIndex, newIndex);
      tag.imagePreviews = arrayMove(tag.imagePreviews, oldIndex, newIndex);
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

      // Extract address components
      if (place.address_components) {
        const addressComponents = place.address_components;

        console.log("addressComponents", addressComponents);

        // Helper function to get component value by type
        const getComponentValue = (types: string[], targetType: string): string => {
          const component = addressComponents.find((comp) => comp.types.includes(targetType));
          return component?.long_name ?? "";
        };

        // Extract address parts
        const streetNumber = getComponentValue(["street_number"], "street_number");
        const route = getComponentValue(["route"], "route");
        const city =
          getComponentValue(["locality"], "locality") ||
          getComponentValue(["administrative_area_level_2"], "administrative_area_level_2");
        const state = getComponentValue(["administrative_area_level_1"], "administrative_area_level_1");
        const country = getComponentValue(["country"], "country");
        const postalCode = getComponentValue(["postal_code"], "postal_code");
        const countryCode = (() => {
          const component = addressComponents.find((comp) => comp.types.includes("country"));
          return component?.short_name ?? "";
        })();

        // Set address component values
        form.setValue("streetNumber", streetNumber);
        form.setValue("route", route);
        form.setValue("city", city);
        form.setValue("state", state);
        form.setValue("country", country);
        form.setValue("postalCode", postalCode);
        form.setValue("countryCode", countryCode);
      }

      // Update the input field to show only the name
      if (autocompleteRef.current) {
        autocompleteRef.current.value = venueName;
      }
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

  // Handle experiences reordering
  const handleExperiencesDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = experiences.findIndex((_, index) => `experience-${index}` === active.id);
      const newIndex = experiences.findIndex((_, index) => `experience-${index}` === over.id);
      const newExperiences = arrayMove(experiences, oldIndex, newIndex);
      setExperiences(newExperiences);
    }
  };

  const handleClearExperienceImage = (index: number) => {
    const newExperiences = [...experiences];
    newExperiences[index].image = "";
    newExperiences[index].imagePreview = "";
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
            thumbnail: thumbnailFile ?? undefined,
            existingThumbnail: existingThumbnail ?? undefined,
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
        thumbnail: thumbnailFile,
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
                            fields: ["name", "formatted_address", "geometry", "place_id", "address_components"],
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
                <FormField
                  control={form.control}
                  name="images"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTagsDragEnd}>
                          <SortableContext
                            items={images.map((_, index) => `tag-${index}`)}
                            strategy={verticalListSortingStrategy}
                          >
                            {images.map((imageTag, tagIndex) => (
                              <SortableTagItem
                                key={tagIndex}
                                id={`tag-${tagIndex}`}
                                tagIndex={tagIndex}
                                imageTag={imageTag}
                                onRemove={handleRemoveImageTag}
                                onUpdateName={handleUpdateImageTagName}
                                onAddImages={handleAddImagesToTag}
                                onRemoveImage={handleRemoveImageFromTag}
                                onImagesDragEnd={handleTagImagesDragEnd(tagIndex)}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="button" variant="outline" onClick={handleAddImageTag} className="w-full cursor-pointer">
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
                        {thumbnailPreview ? (
                          <div className="relative h-[180px] w-[275px] overflow-hidden rounded-md border-2">
                            <Image
                              src={thumbnailPreview}
                              alt="Thumbnail preview"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setThumbnailPreview("");
                                setThumbnailFile(null);
                                setExistingThumbnail("");
                                form.setValue("thumbnail", "");
                              }}
                              className="bg-destructive text-destructive-foreground absolute top-2 right-2 cursor-pointer rounded-full p-1.5"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <ImageUploadBox
                            accept="image/*"
                            onChange={(files) => {
                              if (files.length > 0) {
                                const file = files[0];
                                setThumbnailFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setThumbnailPreview(reader.result as string);
                                  form.setValue("thumbnail", file);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Experiences Card */}
            <Card>
              <CardHeader>
                <CardTitle>Experiences</CardTitle>
                <CardDescription>Add multiple experiences with images and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleExperiencesDragEnd}>
                  <SortableContext
                    items={experiences.map((_, index) => `experience-${index}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {experiences.map((exp, index) => (
                      <SortableExperienceItem
                        key={index}
                        id={`experience-${index}`}
                        exp={exp}
                        index={index}
                        onRemove={handleRemoveExperience}
                        onImageChange={handleExperienceImageChange}
                        onFieldChange={handleExperienceFieldChange}
                        onClearImage={handleClearExperienceImage}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                <Button type="button" variant="outline" onClick={handleAddExperience} className="w-full cursor-pointer">
                  Add Experience
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Category and Venue Type */}
            <Card>
              <CardHeader>
                <CardTitle>Category & Venue Type</CardTitle>
                <CardDescription>Select the category and type for this venue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Categories <span className="text-destructive">*</span>
                      </FormLabel>
                      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}
                            >
                              {field.value && field.value.length > 0
                                ? `${field.value.length} categor${field.value.length === 1 ? "y" : "ies"} selected`
                                : "Select categories..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search categories..." />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                {filteredCategories.map((category) => (
                                  <CommandItem
                                    key={category.id}
                                    value={category.title}
                                    onSelect={() => {
                                      const currentValues = field.value || [];
                                      const isSelected = currentValues.includes(category.id);
                                      const newValues = isSelected
                                        ? currentValues.filter((id) => id !== category.id)
                                        : [...currentValues, category.id];
                                      field.onChange(newValues);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value?.includes(category.id) ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    {category.title}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {field.value && field.value.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {field.value.map((categoryId) => {
                            const category = filteredCategories.find((cat) => cat.id === categoryId);
                            if (!category) return null;
                            return (
                              <Badge key={categoryId} variant="secondary" className="gap-1 pr-1 pl-2">
                                {category.title}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newValues = field.value?.filter((id) => id !== categoryId) || [];
                                    field.onChange(newValues);
                                  }}
                                  className="hover:bg-accent ml-1 cursor-pointer rounded-sm"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venueTypeId"
                  render={({ field }) => (
                    <FormItem>
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
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/venues")}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="cursor-pointer"
          >
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
